import base64
import mimetypes

from fastapi import HTTPException
import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models import AbnormalCase, AgentMessage, KnowledgeItem, UploadedFile
from app.schemas import AgentAttachment, AgentChatRequest


MOCK_ANSWERS = {
    "training_assistant": "建议新员工先学习设备结构、安全规范、标准开机流程和常见异常案例，再进行实操。",
    "operation_qa": "建议按照 SOP 先检查设备状态、确认安全锁、查看报警代码，必要时通知班组长复核。",
    "abnormal_alert": "该情况可能属于中风险异常，建议立即停止当前操作并通知班组长复核。",
    "quality_supervisor": "当前操作质量风险主要来自流程跳步、检查项遗漏和异常复盘不足，建议加强班前确认。",
    "management_decision": "从当前数据看，异常主要集中在开机前检查和上料确认环节，建议加强新员工培训并增加班组长复核。",
}

SUGGESTIONS = {
    "training_assistant": ["查看标准操作流程", "查看相关培训经验"],
    "operation_qa": ["查看设备 SOP", "查看相关异常案例"],
    "abnormal_alert": ["通知班组长复核", "查看近期同类异常"],
    "quality_supervisor": ["查看风险工序排行", "导出异常案例清单"],
    "management_decision": ["查看开机检查异常趋势", "安排专项培训"],
}


async def answer_agent_chat(db: Session, payload: AgentChatRequest, current_user_id: int) -> dict:
    role_type = payload.role_type
    mode = settings.agent_mode.lower()

    if mode == "proxy" and _has_real_api_key():
        try:
            answer = await _proxy_answer(db, payload)
            response_mode = "proxy"
        except HTTPException:
            raise
        except Exception:
            answer = _mock_answer(role_type, payload.question)
            response_mode = "mock_fallback"
    else:
        answer = _mock_answer(role_type, payload.question)
        response_mode = "mock"

    db.add(
        AgentMessage(
            user_id=current_user_id,
            role_type=role_type,
            question=payload.question,
            answer=answer,
            mode=response_mode,
        )
    )
    db.commit()

    return {
        "answer": answer,
        "role_type": role_type,
        "mode": response_mode,
        "suggestions": SUGGESTIONS.get(role_type, ["查看相关知识条目"]),
        "sources": _mock_sources(role_type),
    }


def _has_real_api_key() -> bool:
    key = settings.agent_api_key.strip()
    return bool(key and key != "your_api_key_here")


def _mock_answer(role_type: str, question: str) -> str:
    base = MOCK_ANSWERS.get(role_type, MOCK_ANSWERS["operation_qa"])
    return f"{base} 当前问题：{question}"


def _mock_sources(role_type: str) -> list[str]:
    if role_type in {"management_decision", "quality_supervisor"}:
        return ["模拟统计：近7天异常案例与贡献排行", "模拟知识库：设备与工序知识条目"]
    return ["模拟SOP：设备开机检查流程", "模拟异常案例：安全复核记录"]


async def _proxy_answer(db: Session, payload: AgentChatRequest) -> str:
    context = _build_context(db)
    system_prompt = _system_prompt(payload.role_type, context)
    url = settings.agent_api_base_url.rstrip("/") + "/chat/completions"
    headers = {"Authorization": f"Bearer {settings.agent_api_key}", "Content-Type": "application/json"}
    body = {
        "model": settings.agent_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": _build_user_content(db, payload)},
        ],
        "temperature": 0.2,
    }
    async with httpx.AsyncClient(timeout=settings.agent_timeout_seconds, trust_env=False) as client:
        response = await client.post(url, headers=headers, json=body)
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"]


def _build_user_content(db: Session, payload: AgentChatRequest) -> str | list[dict]:
    if not payload.attachments:
        return payload.question

    content = [_attachment_to_content_part(db, attachment) for attachment in payload.attachments]
    content.append({"type": "text", "text": payload.question})
    return content


def _attachment_to_content_part(db: Session, attachment: AgentAttachment) -> dict:
    url = attachment.url or _uploaded_file_data_url(db, attachment)
    part = {"type": attachment.type, attachment.type: {"url": url}}
    if attachment.detail and attachment.type in {"image_url", "video_url"}:
        part[attachment.type]["detail"] = attachment.detail
    if attachment.type == "video_url":
        if attachment.max_frames is not None:
            part["video_url"]["max_frames"] = attachment.max_frames
        if attachment.fps is not None:
            part["video_url"]["fps"] = attachment.fps
    return part


def _uploaded_file_data_url(db: Session, attachment: AgentAttachment) -> str:
    uploaded_file = db.get(UploadedFile, attachment.file_id)
    if uploaded_file is None:
        raise HTTPException(status_code=404, detail="Agent 附件文件不存在")

    expected_type = {
        "image": "image_url",
        "video": "video_url",
        "audio": "audio_url",
    }.get(uploaded_file.file_type)
    if expected_type != attachment.type:
        raise HTTPException(status_code=400, detail="Agent 附件类型与已上传文件类型不匹配")
    if not uploaded_file.storage_key:
        raise HTTPException(status_code=400, detail="Agent 附件缺少可读取的存储文件")

    upload_dir = settings.upload_dir_path.resolve()
    file_path = (upload_dir / uploaded_file.storage_key).resolve()
    if upload_dir not in file_path.parents and file_path != upload_dir:
        raise HTTPException(status_code=400, detail="Agent 附件存储路径不合法")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Agent 附件文件不存在")

    mime_type = mimetypes.guess_type(uploaded_file.file_name or uploaded_file.storage_key)[0]
    if mime_type is None:
        mime_type = {
            "image_url": "image/png",
            "video_url": "video/mp4",
            "audio_url": "audio/mpeg",
        }[attachment.type]
    encoded = base64.b64encode(file_path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def _build_context(db: Session) -> str:
    files = db.query(UploadedFile).order_by(UploadedFile.created_at.desc()).limit(5).all()
    knowledge = db.query(KnowledgeItem).order_by(KnowledgeItem.created_at.desc()).limit(5).all()
    abnormal = db.query(AbnormalCase).order_by(AbnormalCase.created_at.desc()).limit(5).all()
    return "\n".join(
        [
            "最近上传：" + "；".join(item.title for item in files),
            "知识条目：" + "；".join(item.title for item in knowledge),
            "异常案例：" + "；".join(item.title or "" for item in abnormal),
        ]
    )


def _system_prompt(role_type: str, context: str) -> str:
    prompts = {
        "training_assistant": "你是新员工培训助手，请给出分步骤学习建议并提示安全规范。",
        "operation_qa": "你是一线操作问答助手，请优先提示安全风险和 SOP 步骤。",
        "abnormal_alert": "你是异常操作提醒助手，请判断风险等级并给出立即处理建议。",
        "quality_supervisor": "你是工作质量监督助手，请分析质量风险点、原因和改进建议。",
        "management_decision": "你是管理决策助手，请输出结论、依据、风险、建议和优先级。",
    }
    return f"{prompts.get(role_type, prompts['operation_qa'])}\n\n可用业务上下文：\n{context}"
