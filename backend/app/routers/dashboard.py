from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import AbnormalCase, AgentMessage, ContributionScore, KnowledgeItem, UploadedFile, User
from app.services.graph_service import build_graph
from app.time_utils import utc_now


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = utc_now()
    today_start = datetime(now.year, now.month, now.day)
    files = db.query(UploadedFile).all()
    knowledge_items = db.query(KnowledgeItem).all()
    abnormal_cases = db.query(AbnormalCase).all()

    return {
        "total_files": len(files),
        "today_uploads": sum(1 for item in files if item.created_at and item.created_at >= today_start),
        "total_knowledge": len(knowledge_items),
        "total_abnormal": len(abnormal_cases),
        "total_contributors": db.query(func.count(func.distinct(UploadedFile.uploader_id))).scalar() or 0,
        "agent_calls": db.query(AgentMessage).count(),
        "file_type_distribution": _file_type_distribution(files),
        "risk_distribution": _risk_distribution(abnormal_cases),
        "daily_trend": _daily_trend(files, knowledge_items, abnormal_cases, today_start),
    }


@router.get("/recent-uploads")
def recent_uploads(
    limit: int = Query(default=10, ge=1, le=100),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(UploadedFile)
        .order_by(UploadedFile.created_at.desc(), UploadedFile.id.desc())
        .limit(limit)
        .all()
    )
    return {
        "items": [
            {
                "id": item.id,
                "title": item.title,
                "file_type": item.file_type,
                "uploader_name": item.uploader_name,
                "device_name": item.device_name,
                "process_name": item.process_name,
                "is_abnormal": bool(item.is_abnormal),
                "risk_level": item.risk_level,
                "created_at": item.created_at,
            }
            for item in items
        ]
    }


@router.get("/ranking")
def ranking(
    limit: int = Query(default=10, ge=1, le=100),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    users = db.query(User).filter(User.role == "employee").all()
    rows = []
    for user in users:
        upload_count = db.query(UploadedFile).filter(UploadedFile.uploader_id == user.id).count()
        knowledge_count = db.query(KnowledgeItem).filter(KnowledgeItem.contributor_id == user.id).count()
        abnormal_count = db.query(AbnormalCase).filter(AbnormalCase.uploader_id == user.id).count()
        total_points = (
            db.query(func.coalesce(func.sum(ContributionScore.points), 0))
            .filter(ContributionScore.user_id == user.id)
            .scalar()
            or 0
        )
        rows.append(
            {
                "user_id": user.id,
                "user_name": user.name,
                "department": user.department,
                "upload_count": upload_count,
                "knowledge_count": knowledge_count,
                "abnormal_count": abnormal_count,
                "total_points": int(total_points),
            }
        )

    rows.sort(key=lambda item: (item["total_points"], item["upload_count"]), reverse=True)
    ranked = []
    for index, row in enumerate(rows[:limit], start=1):
        ranked.append({"rank": index, **row})
    return {"items": ranked}


@router.get("/graph")
def graph(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_graph(db)


def _file_type_distribution(files: list[UploadedFile]) -> dict[str, int]:
    result = {"video": 0, "image": 0, "audio": 0, "document": 0, "text": 0}
    for item in files:
        if item.file_type in result:
            result[item.file_type] += 1
    return result


def _risk_distribution(abnormal_cases: list[AbnormalCase]) -> dict[str, int]:
    result = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for item in abnormal_cases:
        if item.risk_level in result:
            result[item.risk_level] += 1
    return result


def _daily_trend(
    files: list[UploadedFile],
    knowledge_items: list[KnowledgeItem],
    abnormal_cases: list[AbnormalCase],
    today_start: datetime,
) -> list[dict[str, int | str]]:
    result = []
    for days_back in range(6, -1, -1):
        day = today_start - timedelta(days=days_back)
        next_day = day + timedelta(days=1)
        result.append(
            {
                "date": day.date().isoformat(),
                "uploads": sum(1 for item in files if item.created_at and day <= item.created_at < next_day),
                "knowledge": sum(
                    1 for item in knowledge_items if item.created_at and day <= item.created_at < next_day
                ),
                "abnormal": sum(
                    1 for item in abnormal_cases if item.created_at and day <= item.created_at < next_day
                ),
            }
        )
    return result
