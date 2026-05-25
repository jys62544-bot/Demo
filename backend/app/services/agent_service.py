import base64
import mimetypes

from fastapi import HTTPException
import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models import AbnormalCase, AgentMessage, KnowledgeItem, UploadedFile
from app.schemas import AgentAttachment, AgentChatRequest


MOCK_ANSWERS = {
    "training_assistant": "建议新员工先学习两票三制、电气五防、主变巡检、开关柜倒闸和汽机辅机点检，再进入现场跟班实操。",
    "operation_qa": "建议按照电力运行 SOP 先核对设备双重编号、运行方式、保护压板状态和现场测温/振动数据，必要时通知值长复核。",
    "abnormal_alert": "该情况可能属于电力设备中高风险异常，建议立即保留运行证据、复测关键参数，并通知值长和检修班组。",
    "quality_supervisor": "当前操作质量风险主要来自倒闸票执行偏差、巡检测温遗漏和异常复盘不足，建议加强两票复核。",
    "management_decision": "从当前数据看，异常主要集中在主变红外测温、开关柜倒闸和汽机给水泵运行监听环节，建议安排专项复测和检修联动。",
}

SUGGESTIONS = {
    "training_assistant": ["查看两票三制培训", "查看开关柜倒闸案例"],
    "operation_qa": ["查看设备巡检 SOP", "查看同类电力异常案例"],
    "abnormal_alert": ["通知值长复核", "查看近期同类设备异常"],
    "quality_supervisor": ["查看风险巡检排行", "导出异常案例清单"],
    "management_decision": ["查看主变测温趋势", "安排电气专项复测"],
}

ENABLE_THINKING_MODELS = {
    "Qwen/Qwen3-8B",
    "Qwen/Qwen3-14B",
    "Qwen/Qwen3-30B-A3B",
    "Qwen/Qwen3-32B",
    "Qwen/Qwen3-235B-A22B",
    "tencent/Hunyuan-A13B-Instruct",
    "zai-org/GLM-4.5V",
    "zai-org/GLM-4.6V",
    "zai-org/GLM-5V-Turbo",
    "deepseek-ai/DeepSeek-V3.1",
    "deepseek-ai/DeepSeek-V3.1-Terminus",
    "deepseek-ai/DeepSeek-V3.2-Exp",
    "deepseek-ai/DeepSeek-V3.2",
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
        return ["模拟统计：近7天电力设备异常与贡献排行", "模拟知识库：设备巡检与运行知识条目"]
    return ["模拟SOP：电力设备标准巡检流程", "模拟异常案例：主变测温与倒闸复核记录"]


async def _proxy_answer(db: Session, payload: AgentChatRequest) -> str:
    context = _build_context(db)
    system_prompt = _system_prompt(payload.role_type, context)
    model = _select_agent_model(payload)
    url = settings.agent_api_base_url.rstrip("/") + "/chat/completions"
    headers = {"Authorization": f"Bearer {settings.agent_api_key}", "Content-Type": "application/json"}
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": _build_user_content(db, payload)},
        ],
        "temperature": 0.2,
        "max_tokens": settings.agent_max_tokens,
    }
    if _supports_enable_thinking(model):
        body["enable_thinking"] = settings.agent_enable_thinking
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


def _select_agent_model(payload: AgentChatRequest) -> str:
    return settings.agent_vision_model if payload.attachments else settings.agent_text_model


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
        "training_assistant": "你是电力工厂新员工培训助手，请给出分步骤学习建议并提示两票三制、电气五防和设备安全规范。",
        "operation_qa": "你是电力运行一线操作问答助手，请优先提示安全风险、SOP步骤、复核点和升级汇报条件。",
        "abnormal_alert": "你是电力设备异常提醒助手，请判断风险等级并给出立即处理、隔离复测和汇报建议。",
        "quality_supervisor": "你是电力运行质量监督助手，请分析巡检、倒闸、监盘和消缺质量风险点、原因和改进建议。",
        "management_decision": "你是电力工厂管理决策助手，请输出结论、依据、风险、建议和优先级。",
    }
    return (
        f"{prompts.get(role_type, prompts['operation_qa'])} "
        "请只输出最终答案，不要输出推理过程或 <think> 标签。"
        "请使用 Markdown 组织答案，优先使用二级标题、要点列表和必要的表格。"
        f"\n\n可用业务上下文：\n{context}"
    )


def _supports_enable_thinking(model: str) -> bool:
    return model in ENABLE_THINKING_MODELS
