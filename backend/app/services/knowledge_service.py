from app.constants import SCENE_TO_KNOWLEDGE_TYPE
from app.models import AbnormalCase, KnowledgeItem, UploadedFile


def build_knowledge_item(uploaded_file: UploadedFile) -> KnowledgeItem:
    knowledge_type = SCENE_TO_KNOWLEDGE_TYPE.get(uploaded_file.scene_type or "other", "其他")
    tags = uploaded_file.tags or "未填写"
    summary = (
        f"该知识条目来源于员工 {uploaded_file.uploader_name} 上传的 "
        f"{uploaded_file.file_type} 数据，关联设备为 {uploaded_file.device_name}，"
        f"关联工序为 {uploaded_file.process_name}，标签为 {tags}。"
    )
    return KnowledgeItem(
        title=f"{uploaded_file.device_name} - {uploaded_file.process_name} - {uploaded_file.title}",
        knowledge_type=knowledge_type,
        source_file_id=uploaded_file.id,
        device_name=uploaded_file.device_name,
        process_name=uploaded_file.process_name,
        contributor_id=uploaded_file.uploader_id,
        contributor_name=uploaded_file.uploader_name,
        tags=uploaded_file.tags,
        status="pending",
        summary=summary,
    )


def build_abnormal_case(uploaded_file: UploadedFile) -> AbnormalCase:
    if uploaded_file.risk_level in {"high", "critical"}:
        suggestion = "该异常风险等级较高，建议暂停相关操作，完成现场复核后再恢复生产。"
    else:
        suggestion = (
            f"该异常与 {uploaded_file.device_name} 的 {uploaded_file.process_name} 环节相关，"
            "建议班组长复核该操作，并将相关经验纳入培训材料。"
        )
    return AbnormalCase(
        source_file_id=uploaded_file.id,
        title=uploaded_file.title,
        device_name=uploaded_file.device_name,
        process_name=uploaded_file.process_name,
        risk_level=uploaded_file.risk_level,
        uploader_id=uploaded_file.uploader_id,
        uploader_name=uploaded_file.uploader_name,
        description=uploaded_file.description,
        status="pending",
        ai_suggestion=suggestion,
    )
