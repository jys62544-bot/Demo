from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import KnowledgeItem, User
from app.schemas import KnowledgeOut, ListResponse


router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("", response_model=ListResponse)
def list_knowledge(
    keyword: str | None = None,
    knowledge_type: str | None = None,
    device_name: str | None = None,
    status: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(KnowledgeItem)
    if knowledge_type:
        query = query.filter(KnowledgeItem.knowledge_type == knowledge_type)
    if device_name:
        query = query.filter(KnowledgeItem.device_name == device_name)
    if status:
        query = query.filter(KnowledgeItem.status == status)
    if keyword:
        pattern = f"%{keyword}%"
        query = query.filter(
            or_(
                KnowledgeItem.title.ilike(pattern),
                KnowledgeItem.device_name.ilike(pattern),
                KnowledgeItem.process_name.ilike(pattern),
                KnowledgeItem.tags.ilike(pattern),
                KnowledgeItem.summary.ilike(pattern),
            )
        )

    total = query.count()
    items = query.order_by(KnowledgeItem.created_at.desc(), KnowledgeItem.id.desc()).offset(offset).limit(limit).all()
    return {"items": [KnowledgeOut.model_validate(item) for item in items], "total": total}
