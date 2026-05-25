from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import SessionLocal, create_tables
from app.routers import abnormal, agent, auth, contributions, dashboard, files, knowledge, upload, user
from app.seed import seed_database


def create_app() -> FastAPI:
    settings.upload_dir_path.mkdir(parents=True, exist_ok=True)
    create_tables()
    with SessionLocal() as db:
        seed_database(db)

    app = FastAPI(title="工业现场多模态智能管理平台 API", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/uploads", StaticFiles(directory=settings.upload_dir_path), name="uploads")
    app.include_router(auth.router, prefix="/api")
    app.include_router(user.router, prefix="/api")
    app.include_router(upload.router, prefix="/api")
    app.include_router(files.router, prefix="/api")
    app.include_router(knowledge.router, prefix="/api")
    app.include_router(abnormal.router, prefix="/api")
    app.include_router(contributions.router, prefix="/api")
    app.include_router(dashboard.router, prefix="/api")
    app.include_router(agent.router, prefix="/api")
    return app


app = create_app()
