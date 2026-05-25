from app.models import ContributionScore, UploadedFile


def calculate_points(uploaded_file: UploadedFile) -> int:
    points = 5
    if uploaded_file.file_type == "video":
        points += 5
    if uploaded_file.scene_type in {"standard_operation", "training_experience"}:
        points += 5
    if bool(uploaded_file.is_abnormal):
        points += 10
    if uploaded_file.risk_level == "high":
        points += 5
    if uploaded_file.risk_level == "critical":
        points += 10
    return points


def build_contribution_score(uploaded_file: UploadedFile) -> ContributionScore:
    points = calculate_points(uploaded_file)
    if bool(uploaded_file.is_abnormal):
        action_type = "upload_abnormal"
        description = f"上传{_risk_label(uploaded_file.risk_level)}异常案例：{uploaded_file.title}"
    elif uploaded_file.file_type == "video":
        action_type = "upload_video"
        description = f"上传视频资料：{uploaded_file.title}"
    else:
        action_type = "upload_normal"
        description = f"上传现场资料：{uploaded_file.title}"

    return ContributionScore(
        user_id=uploaded_file.uploader_id,
        user_name=uploaded_file.uploader_name,
        action_type=action_type,
        points=points,
        related_file_id=uploaded_file.id,
        description=description,
    )


def _risk_label(risk_level: str | None) -> str:
    return {
        "low": "低风险",
        "medium": "中风险",
        "high": "高风险",
        "critical": "严重风险",
    }.get(risk_level or "none", "")
