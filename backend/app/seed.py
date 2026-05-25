from datetime import timedelta

from sqlalchemy.orm import Session

from app.config import settings
from app.models import AgentMessage, UploadedFile, User
from app.services.knowledge_service import build_abnormal_case, build_knowledge_item
from app.services.score_service import build_contribution_score
from app.time_utils import utc_now


USERS = [
    {"username": "employee", "password": "Demo@2026#IM-Safe", "role": "employee", "name": "张三", "department": "集控运行一值", "position": "巡检操作员"},
    {"username": "admin", "password": "Demo@2026#IM-Safe", "role": "admin", "name": "李经理", "department": "发电运行部", "position": "运行值长"},
    {"username": "worker2", "password": "Demo@2026#IM-Safe", "role": "employee", "name": "王师傅", "department": "电气检修班", "position": "资深电气检修工"},
    {"username": "worker3", "password": "Demo@2026#IM-Safe", "role": "employee", "name": "赵工", "department": "继电保护班", "position": "继保工程师"},
    {"username": "worker4", "password": "Demo@2026#IM-Safe", "role": "employee", "name": "刘班长", "department": "锅炉运行二值", "position": "运行班长"},
]

DEVICES = ["1号主变压器", "6kV厂用开关柜", "汽轮机给水泵", "锅炉引风机", "脱硫循环泵", "继电保护屏"]
PROCESSES = ["红外测温巡检", "倒闸操作", "运行参数监盘", "异常缺陷处理", "保护压板核对", "润滑油系统点检", "电缆沟安全巡检"]

NORMAL_SCENES = [
    ("standard_operation", "video", "标准倒闸操作视频"),
    ("training_experience", "audio", "运行经验口述记录"),
    ("maintenance_record", "document", "检修消缺记录"),
    ("quality_inspection", "image", "红外测温记录"),
    ("other", "text", "巡检补充说明"),
]

ABNORMAL_SCENES = [
    ("abnormal_operation", "image", "套管温升异常图片", "high"),
    ("fault_case", "document", "辅机跳闸处理记录", "medium"),
    ("abnormal_operation", "video", "倒闸操作票执行偏差视频", "critical"),
    ("quality_inspection", "image", "电缆沟积水隐患图片", "low"),
]


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    users = [User(**item) for item in USERS]
    db.add_all(users)
    db.commit()
    for user in users:
        db.refresh(user)

    _seed_uploads(db, users)
    _seed_agent_messages(db, users)
    db.commit()


def _seed_uploads(db: Session, users: list[User]) -> None:
    now = utc_now()
    settings.upload_dir_path.mkdir(parents=True, exist_ok=True)

    for index in range(60):
        uploader = [user for user in users if user.role == "employee"][index % 4]
        device = DEVICES[index % len(DEVICES)]
        process = PROCESSES[index % len(PROCESSES)]
        is_abnormal = index % 4 == 1

        if is_abnormal:
            scene_type, file_type, suffix, risk_level = ABNORMAL_SCENES[(index // 4) % len(ABNORMAL_SCENES)]
        else:
            scene_type, file_type, suffix = NORMAL_SCENES[index % len(NORMAL_SCENES)]
            risk_level = "none"

        title = f"{device}{process}{suffix}{index + 1:02d}"
        file_name, file_url, storage_key, text_content = _make_seed_file(index, title, file_type)
        uploaded_file = UploadedFile(
            title=title,
            file_name=file_name,
            file_type=file_type,
            file_url=file_url,
            storage_key=storage_key,
            uploader_id=uploader.id,
            uploader_name=uploader.name,
            device_name=device,
            process_name=process,
            scene_type=scene_type,
            is_abnormal=1 if is_abnormal else 0,
            risk_level=risk_level,
            tags=_tags_for(scene_type, device, process),
            description=f"{device}在{process}环节的{suffix}，用于演示电力工厂运行、巡检、消缺和知识沉淀闭环。",
            text_content=text_content,
            created_at=now - timedelta(days=index % 10, hours=index % 7),
        )
        db.add(uploaded_file)
        db.flush()

        knowledge = build_knowledge_item(uploaded_file)
        knowledge.created_at = uploaded_file.created_at
        db.add(knowledge)

        score = build_contribution_score(uploaded_file)
        score.created_at = uploaded_file.created_at
        db.add(score)

        if is_abnormal:
            abnormal_case = build_abnormal_case(uploaded_file)
            abnormal_case.created_at = uploaded_file.created_at
            db.add(abnormal_case)

    db.commit()


def _make_seed_file(index: int, title: str, file_type: str) -> tuple[str | None, str | None, str | None, str | None]:
    if file_type == "text":
        return None, None, None, f"{title}：该文本经验用于说明电力设备巡检注意事项、复核要点和风险边界。"

    extension = {
        "video": ".mp4",
        "image": ".png",
        "audio": ".mp3",
        "document": ".pdf",
    }.get(file_type, ".dat")
    storage_key = f"seed_{index + 1:02d}{extension}"
    file_path = settings.upload_dir_path / storage_key
    if not file_path.exists():
        file_path.write_bytes(f"power plant seed placeholder for {title}".encode("utf-8"))
    return storage_key, f"/uploads/{storage_key}", storage_key, None


def _tags_for(scene_type: str, device: str, process: str) -> str:
    scene_label = {
        "standard_operation": "标准操作",
        "abnormal_operation": "异常",
        "training_experience": "培训",
        "fault_case": "故障",
        "quality_inspection": "质检",
        "maintenance_record": "维护",
        "other": "经验",
    }.get(scene_type, "经验")
    return f"{device},{process},{scene_label}"


def _seed_agent_messages(db: Session, users: list[User]) -> None:
    roles = [
        "training_assistant",
        "operation_qa",
        "abnormal_alert",
        "quality_supervisor",
        "management_decision",
    ]
    for index in range(12):
        user = users[index % len(users)]
        role_type = roles[index % len(roles)]
        db.add(
            AgentMessage(
                user_id=user.id,
                role_type=role_type,
                question=f"电力巡检演示问题 {index + 1}",
                answer="这是用于大屏统计的电力工厂历史 Agent mock 对话。",
                mode="mock",
                created_at=utc_now() - timedelta(days=index % 7),
            )
        )
