from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import UploadedFile, User
from app.schemas import FileOut, ListResponse


router = APIRouter(prefix="/files", tags=["files"])


@router.get("", response_model=ListResponse)
def list_files(
    user_id: int | None = None,
    file_type: str | None = None,
    is_abnormal: int | None = None,
    keyword: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(UploadedFile)
    if user_id is not None:
        query = query.filter(UploadedFile.uploader_id == user_id)
    if file_type:
        query = query.filter(UploadedFile.file_type == file_type)
    if is_abnormal is not None:
        if is_abnormal not in {0, 1}:
            raise HTTPException(status_code=400, detail="is_abnormal 查询参数只能为 0 或 1")
        query = query.filter(UploadedFile.is_abnormal == int(bool(is_abnormal)))
    if keyword:
        pattern = f"%{keyword}%"
        query = query.filter(
            or_(
                UploadedFile.title.ilike(pattern),
                UploadedFile.device_name.ilike(pattern),
                UploadedFile.process_name.ilike(pattern),
                UploadedFile.tags.ilike(pattern),
                UploadedFile.description.ilike(pattern),
            )
        )

    total = query.count()
    items = query.order_by(UploadedFile.created_at.desc(), UploadedFile.id.desc()).offset(offset).limit(limit).all()
    return {"items": [FileOut.model_validate(item) for item in items], "total": total}


@router.get("/{file_id}", response_model=FileOut)
def get_file(
    file_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    uploaded_file = db.get(UploadedFile, file_id)
    if uploaded_file is None:
        raise HTTPException(status_code=404, detail="文件不存在")
    return uploaded_file
