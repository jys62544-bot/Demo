import os
from pathlib import Path

from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_ROOT / ".env")


class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./industrial_demo.db")
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    max_upload_size_mb: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "200"))
    agent_mode: str = os.getenv("AGENT_MODE", "mock")
    agent_api_base_url: str = os.getenv("AGENT_API_BASE_URL", "https://api.openai.com/v1")
    agent_api_key: str = os.getenv("AGENT_API_KEY", "")
    agent_model: str = os.getenv("AGENT_MODEL", "gpt-4o-mini")
    agent_timeout_seconds: int = int(os.getenv("AGENT_TIMEOUT_SECONDS", "60"))
    agent_enable_thinking: bool = os.getenv("AGENT_ENABLE_THINKING", "false").lower() in {"1", "true", "yes", "on"}
    agent_max_tokens: int = int(os.getenv("AGENT_MAX_TOKENS", "800"))
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]

    @property
    def upload_dir_path(self) -> Path:
        path = Path(self.upload_dir)
        if not path.is_absolute():
            path = BACKEND_ROOT / path
        return path

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


settings = Settings()
