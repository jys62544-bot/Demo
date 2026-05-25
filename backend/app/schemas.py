from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.constants import ROLE_TYPES


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    name: str
    role: str
    department: str | None = None
    position: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserOut


class FileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    file_name: str | None = None
    file_type: str
    file_url: str | None = None
    uploader_id: int | None = None
    uploader_name: str | None = None
    device_name: str | None = None
    process_name: str | None = None
    scene_type: str | None = None
    is_abnormal: bool = False
    risk_level: str = "none"
    tags: str | None = None
    description: str | None = None
    text_content: str | None = None
    created_at: datetime


class KnowledgeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    knowledge_type: str | None = None
    source_file_id: int | None = None
    device_name: str | None = None
    process_name: str | None = None
    contributor_id: int | None = None
    contributor_name: str | None = None
    tags: str | None = None
    status: str = "pending"
    summary: str | None = None
    created_at: datetime


class AbnormalCaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_file_id: int | None = None
    title: str | None = None
    device_name: str | None = None
    process_name: str | None = None
    risk_level: str | None = None
    uploader_id: int | None = None
    uploader_name: str | None = None
    description: str | None = None
    status: str = "pending"
    ai_suggestion: str | None = None
    created_at: datetime


class ContributionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None = None
    user_name: str | None = None
    action_type: str | None = None
    points: int
    related_file_id: int | None = None
    description: str | None = None
    created_at: datetime


class UploadResponse(BaseModel):
    message: str
    file: FileOut
    knowledge_item: KnowledgeOut
    abnormal_case: AbnormalCaseOut | None = None
    score_added: int


class ListResponse(BaseModel):
    items: list[Any]
    total: int


class ContributionListResponse(BaseModel):
    items: list[ContributionOut]
    total: int
    total_points: int


class AgentAttachment(BaseModel):
    type: Literal["image_url", "video_url", "audio_url"]
    url: str | None = None
    file_id: int | None = None
    detail: Literal["auto", "low", "high"] | None = None
    max_frames: int | None = None
    fps: int | None = None

    @model_validator(mode="after")
    def validate_source(self):
        if not self.url and self.file_id is None:
            raise ValueError("附件必须提供 url 或 file_id")
        if self.url and self.file_id is not None:
            raise ValueError("附件 url 和 file_id 只能二选一")
        return self


class AgentChatRequest(BaseModel):
    user_id: int | None = None
    role_type: str
    question: str
    context: dict[str, Any] | None = None
    attachments: list[AgentAttachment] = Field(default_factory=list)

    @field_validator("role_type")
    @classmethod
    def validate_role_type(cls, value: str) -> str:
        if value not in ROLE_TYPES:
            raise ValueError("role_type 不在支持的枚举范围内")
        return value


class AgentChatResponse(BaseModel):
    answer: str
    role_type: str
    mode: str
    suggestions: list[str]
    sources: list[str]
