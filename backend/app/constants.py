SCENE_TO_KNOWLEDGE_TYPE = {
    "standard_operation": "标准操作",
    "abnormal_operation": "异常案例",
    "training_experience": "培训经验",
    "fault_case": "故障处理",
    "quality_inspection": "质检记录",
    "maintenance_record": "维修经验",
    "other": "其他",
}

FILE_TYPES = {"video", "image", "audio", "document", "text"}
SCENE_TYPES = set(SCENE_TO_KNOWLEDGE_TYPE)
RISK_LEVELS = {"none", "low", "medium", "high", "critical"}

ROLE_TYPES = {
    "training_assistant",
    "operation_qa",
    "abnormal_alert",
    "quality_supervisor",
    "management_decision",
}
