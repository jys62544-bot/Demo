from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import AbnormalCase, User
from app.schemas import AbnormalCaseOut, ListResponse


router = APIRouter(prefix="/abnormal-cases", tags=["abnormal-cases"])


@router.get("", response_model=ListResponse)
def list_abnormal_cases(
    risk_level: str | None = None,
    status: str | None = None,
    device_name: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(AbnormalCase)
    if risk_level:
        query = query.filter(AbnormalCase.risk_level == risk_level)
    if status:
        query = query.filter(AbnormalCase.status == status)
    if device_name:
        query = query.filter(AbnormalCase.device_name == device_name)

    total = query.count()
    items = query.order_by(AbnormalCase.created_at.desc(), AbnormalCase.id.desc()).offset(offset).limit(limit).all()
    return {"items": [AbnormalCaseOut.model_validate(item) for item in items], "total": total}
