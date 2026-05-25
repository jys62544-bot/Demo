from sqlalchemy import Column, DateTime, Integer, Text

from app.database import Base
from app.time_utils import utc_now


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(Text, nullable=False, unique=True, index=True)
    password = Column(Text, nullable=False)
    role = Column(Text, nullable=False)
    name = Column(Text, nullable=False)
    department = Column(Text)
    position = Column(Text)
    created_at = Column(DateTime, default=utc_now)


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    file_name = Column(Text)
    file_type = Column(Text, nullable=False)
    file_url = Column(Text)
    storage_key = Column(Text)
    uploader_id = Column(Integer)
    uploader_name = Column(Text)
    device_name = Column(Text)
    process_name = Column(Text)
    scene_type = Column(Text)
    is_abnormal = Column(Integer, default=0)
    risk_level = Column(Text, default="none")
    tags = Column(Text)
    description = Column(Text)
    text_content = Column(Text)
    created_at = Column(DateTime, default=utc_now)


class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    knowledge_type = Column(Text)
    source_file_id = Column(Integer)
    device_name = Column(Text)
    process_name = Column(Text)
    contributor_id = Column(Integer)
    contributor_name = Column(Text)
    tags = Column(Text)
    status = Column(Text, default="pending")
    summary = Column(Text)
    created_at = Column(DateTime, default=utc_now)


class ContributionScore(Base):
    __tablename__ = "contribution_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer)
    user_name = Column(Text)
    action_type = Column(Text)
    points = Column(Integer)
    related_file_id = Column(Integer)
    description = Column(Text)
    created_at = Column(DateTime, default=utc_now)


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer)
    role_type = Column(Text)
    question = Column(Text)
    answer = Column(Text)
    mode = Column(Text)
    created_at = Column(DateTime, default=utc_now)


class AbnormalCase(Base):
    __tablename__ = "abnormal_cases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_file_id = Column(Integer)
    title = Column(Text)
    device_name = Column(Text)
    process_name = Column(Text)
    risk_level = Column(Text)
    uploader_id = Column(Integer)
    uploader_name = Column(Text)
    description = Column(Text)
    status = Column(Text, default="pending")
    ai_suggestion = Column(Text)
    created_at = Column(DateTime, default=utc_now)
