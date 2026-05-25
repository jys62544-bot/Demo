from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import ContributionScore, User
from app.schemas import ContributionListResponse, ContributionOut


router = APIRouter(prefix="/contributions", tags=["contributions"])


@router.get("", response_model=ContributionListResponse)
def list_contributions(
    user_id: int | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    effective_user_id = user_id
    if current_user.role == "employee" and user_id is None:
        effective_user_id = current_user.id

    query = db.query(ContributionScore)
    if effective_user_id is not None:
        query = query.filter(ContributionScore.user_id == effective_user_id)

    total = query.count()
    total_points = query.with_entities(func.coalesce(func.sum(ContributionScore.points), 0)).scalar() or 0
    items = (
        query.order_by(ContributionScore.created_at.desc(), ContributionScore.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {
        "items": [ContributionOut.model_validate(item) for item in items],
        "total": total,
        "total_points": int(total_points),
    }
