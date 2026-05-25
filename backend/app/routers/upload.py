from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.constants import FILE_TYPES, RISK_LEVELS, SCENE_TYPES
from app.database import get_db
from app.dependencies import get_current_user
from app.models import UploadedFile, User
from app.schemas import UploadResponse
from app.services.file_service import parse_form_bool, save_upload_file
from app.services.knowledge_service import build_abnormal_case, build_knowledge_item
from app.services.score_service import build_contribution_score, calculate_points


router = APIRouter(tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload(
    title: str = Form(...),
    file_type: str = Form(...),
    device_name: str = Form(...),
    process_name: str = Form(...),
    scene_type: str = Form(...),
    is_abnormal: str | None = Form(default="0"),
    risk_level: str | None = Form(default="none"),
    tags: str | None = Form(default=None),
    description: str | None = Form(default=None),
    text_content: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _validate_upload_fields(file_type, scene_type, risk_level or "none", file, text_content)

    abnormal = parse_form_bool(is_abnormal)
    normalized_risk = (risk_level or "none") if abnormal else "none"

    file_name = None
    file_url = None
    storage_key = None
    extracted_text = None
    if file_type != "text" and file is not None:
        file_name, file_url, storage_key, extracted_text = await save_upload_file(file)

    uploaded_file = UploadedFile(
        title=title,
        file_name=file_name,
        file_type=file_type,
        file_url=file_url,
        storage_key=storage_key,
        uploader_id=current_user.id,
        uploader_name=current_user.name,
        device_name=device_name,
        process_name=process_name,
        scene_type=scene_type,
        is_abnormal=1 if abnormal else 0,
        risk_level=normalized_risk,
        tags=tags,
        description=description,
        text_content=text_content if file_type == "text" else extracted_text,
    )
    db.add(uploaded_file)
    db.flush()

    knowledge_item = build_knowledge_item(uploaded_file)
    db.add(knowledge_item)

    abnormal_case = None
    if abnormal:
        abnormal_case = build_abnormal_case(uploaded_file)
        db.add(abnormal_case)

    score = build_contribution_score(uploaded_file)
    db.add(score)
    db.commit()

    return {
        "message": "上传成功",
        "file": uploaded_file,
        "knowledge_item": knowledge_item,
        "abnormal_case": abnormal_case,
        "score_added": calculate_points(uploaded_file),
    }


def _validate_upload_fields(
    file_type: str,
    scene_type: str,
    risk_level: str,
    file: UploadFile | None,
    text_content: str | None,
) -> None:
    if file_type not in FILE_TYPES:
        raise HTTPException(status_code=400, detail="file_type 不合法")
    if scene_type not in SCENE_TYPES:
        raise HTTPException(status_code=400, detail="scene_type 不合法")
    if risk_level not in RISK_LEVELS:
        raise HTTPException(status_code=400, detail="risk_level 不合法")
    if file_type == "text":
        if not text_content:
            raise HTTPException(status_code=400, detail="text 类型必须提供 text_content")
    elif file is None:
        raise HTTPException(status_code=400, detail="非 text 类型必须上传文件")
