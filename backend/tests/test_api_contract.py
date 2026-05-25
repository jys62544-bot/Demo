import importlib
import os
import sys
import tempfile
import base64
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["UPLOAD_DIR"] = tempfile.mkdtemp(prefix="industrial_demo_uploads_")
os.environ["AGENT_MODE"] = "mock"
os.environ["CORS_ORIGINS"] = "http://localhost:5173,http://127.0.0.1:5173"

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

main = importlib.import_module("main")

from fastapi.testclient import TestClient  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models import KnowledgeItem, UploadedFile, User  # noqa: E402
from app.seed import seed_database  # noqa: E402


client = TestClient(main.app)


def auth_headers(username: str = "employee") -> dict[str, str]:
    return {"Authorization": f"Bearer demo-token-{username}"}


def test_login_and_profile_follow_demo_token_contract():
    login_response = client.post(
        "/api/auth/login",
        json={"username": "employee", "password": "Demo@2026#IM-Safe"},
    )

    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["token"] == "demo-token-employee"
    assert login_data["user"] == {
        "id": 1,
        "username": "employee",
        "name": "张三",
        "role": "employee",
        "department": "集控运行一值",
        "position": "巡检操作员",
    }

    profile_response = client.get("/api/user/profile", headers=auth_headers())

    assert profile_response.status_code == 200
    assert profile_response.json()["username"] == "employee"


def test_demo_access_key_login_works_with_existing_legacy_password_rows():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "employee").one()
        original_password = user.password
        user.password = "123456"
        db.commit()

        login_response = client.post(
            "/api/auth/login",
            json={"username": "employee", "password": "Demo@2026#IM-Safe"},
        )

        assert login_response.status_code == 200
        login_data = login_response.json()
        assert login_data["token"] == "demo-token-employee"
    finally:
        user.password = original_password
        db.commit()
        db.close()


def test_seed_database_syncs_existing_legacy_demo_rows():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "employee").one()
        user.password = "123456"
        user.department = "一号产线"
        user.position = "设备操作员"

        first_file = db.query(UploadedFile).order_by(UploadedFile.id).first()
        first_file.title = "设备A开机检查标准作业流程01"
        first_file.device_name = "设备A"
        first_file.process_name = "开机检查"
        first_file.description = "设备A在开机检查环节的标准作业流程，用于演示数据沉淀闭环。"
        first_knowledge = (
            db.query(KnowledgeItem)
            .filter(KnowledgeItem.source_file_id == first_file.id)
            .one()
        )
        first_knowledge.title = "设备A - 开机检查 - 设备A开机检查标准作业流程01"
        db.commit()

        seed_database(db)
        db.refresh(user)
        db.refresh(first_file)
        db.refresh(first_knowledge)

        assert user.password == "Demo@2026#IM-Safe"
        assert user.department == "集控运行一值"
        assert user.position == "巡检操作员"
        assert first_file.title == "1号主变压器红外测温巡检标准倒闸操作视频01"
        assert first_file.device_name == "1号主变压器"
        assert first_file.process_name == "红外测温巡检"
        assert "电力工厂运行、巡检、消缺和知识沉淀闭环" in first_file.description
        assert first_knowledge.title == "1号主变压器 - 红外测温巡检 - 1号主变压器红外测温巡检标准倒闸操作视频01"
    finally:
        db.close()


def test_abnormal_upload_creates_file_knowledge_score_and_case():
    before_summary = client.get("/api/dashboard/summary", headers=auth_headers("admin")).json()

    response = client.post(
        "/api/upload",
        headers=auth_headers(),
        data={
            "title": "1号主变压器套管红外测温异常图片",
            "file_type": "image",
            "device_name": "1号主变压器",
            "process_name": "红外测温巡检",
            "scene_type": "abnormal_operation",
            "is_abnormal": "1",
            "risk_level": "high",
            "tags": "主变,套管,红外测温,温升异常",
            "description": "高压套管接头温度较历史值偏高",
        },
        files={"file": ("thermal.png", b"fake image bytes", "image/png")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "上传成功"
    assert data["file"]["title"] == "1号主变压器套管红外测温异常图片"
    assert data["file"]["file_type"] == "image"
    assert data["file"]["file_url"].startswith("/uploads/")
    assert data["file"]["is_abnormal"] is True
    assert data["file"]["risk_level"] == "high"
    assert data["knowledge_item"]["title"] == "1号主变压器 - 红外测温巡检 - 1号主变压器套管红外测温异常图片"
    assert data["knowledge_item"]["status"] == "pending"
    assert data["abnormal_case"]["risk_level"] == "high"
    assert data["abnormal_case"]["status"] == "pending"
    assert data["score_added"] == 20

    file_url_response = client.get(data["file"]["file_url"])
    assert file_url_response.status_code == 200
    assert file_url_response.content == b"fake image bytes"

    after_summary = client.get("/api/dashboard/summary", headers=auth_headers("admin")).json()
    assert after_summary["total_files"] == before_summary["total_files"] + 1
    assert after_summary["total_knowledge"] == before_summary["total_knowledge"] + 1
    assert after_summary["total_abnormal"] == before_summary["total_abnormal"] + 1

    files = client.get("/api/files?keyword=主变&is_abnormal=1", headers=auth_headers()).json()
    assert files["total"] >= 1
    assert files["items"][0]["is_abnormal"] is True

    knowledge = client.get("/api/knowledge?keyword=主变", headers=auth_headers()).json()
    assert knowledge["total"] >= 1
    assert knowledge["items"][0]["knowledge_type"] == "异常案例"

    abnormal = client.get("/api/abnormal-cases?risk_level=high", headers=auth_headers("admin")).json()
    assert abnormal["total"] >= 1
    assert abnormal["items"][0]["ai_suggestion"]

    contributions = client.get("/api/contributions?user_id=1", headers=auth_headers()).json()
    assert contributions["total_points"] >= 20
    assert any(item["related_file_id"] == data["file"]["id"] for item in contributions["items"])


def test_text_upload_does_not_require_file_and_generates_knowledge():
    response = client.post(
        "/api/upload",
        headers=auth_headers(),
        data={
            "title": "汽轮机给水泵运行监听经验",
            "file_type": "text",
            "device_name": "汽轮机给水泵",
            "process_name": "运行监控",
            "scene_type": "training_experience",
            "is_abnormal": "0",
            "risk_level": "none",
            "tags": "给水泵,运行监听,经验",
            "description": "电力辅机运行监听经验记录",
            "text_content": "先检查轴承温度和振动趋势，再确认润滑油压状态。",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["file"]["file_url"] is None
    assert data["file"]["is_abnormal"] is False
    assert data["knowledge_item"]["status"] == "pending"
    assert data["abnormal_case"] is None
    assert data["score_added"] == 10


def test_text_like_document_upload_extracts_content_into_database():
    document_text = "1号主变压器红外测温规范\n1. 巡检前确认测温仪电量和发射率设置。\n2. 温升异常时通知值长和电气检修班。"
    response = client.post(
        "/api/upload",
        headers=auth_headers(),
        data={
            "title": "1号主变压器红外测温规范",
            "file_type": "document",
            "device_name": "1号主变压器",
            "process_name": "红外测温巡检",
            "scene_type": "standard_operation",
            "is_abnormal": "0",
            "risk_level": "none",
            "tags": "主变,SOP,红外测温",
            "description": "文本型文档应提取正文用于知识沉淀",
        },
        files={"file": ("transformer-thermal.md", document_text.encode("utf-8"), "text/markdown")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["file"]["file_type"] == "document"
    assert data["file"]["file_url"].startswith("/uploads/")
    assert "温升异常时通知值长" in data["file"]["text_content"]
    assert "文档摘录" in data["knowledge_item"]["summary"]
    assert "温升异常时通知值长" in data["knowledge_item"]["summary"]

    files = client.get("/api/files?keyword=主变", headers=auth_headers()).json()
    matched = [item for item in files["items"] if item["id"] == data["file"]["id"]]
    assert matched
    assert "电气检修班" in matched[0]["text_content"]


def test_dashboard_ranking_graph_and_agent_shapes_are_frontend_ready():
    recent = client.get("/api/dashboard/recent-uploads?limit=5", headers=auth_headers("admin"))
    assert recent.status_code == 200
    assert len(recent.json()["items"]) <= 5

    ranking = client.get("/api/dashboard/ranking?limit=5", headers=auth_headers("admin"))
    assert ranking.status_code == 200
    first_rank = ranking.json()["items"][0]
    assert set(first_rank) == {
        "rank",
        "user_id",
        "user_name",
        "department",
        "upload_count",
        "knowledge_count",
        "abnormal_count",
        "total_points",
    }

    graph = client.get("/api/dashboard/graph", headers=auth_headers("admin"))
    assert graph.status_code == 200
    graph_data = graph.json()
    assert graph_data["nodes"]
    assert graph_data["links"]
    assert {"abnormal", "knowledge", "device", "process", "risk"}.issubset(
        {node["category"] for node in graph_data["nodes"]}
    )

    agent = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "management_decision",
            "question": "最近哪个电力设备或巡检环节异常最多？",
            "context": {"process_name": "红外测温巡检"},
        },
    )
    assert agent.status_code == 200
    agent_data = agent.json()
    assert agent_data["role_type"] == "management_decision"
    assert agent_data["mode"] == "mock"
    assert agent_data["answer"]
    assert agent_data["suggestions"]
    assert agent_data["sources"]


def test_invalid_agent_role_type_is_rejected():
    response = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "unknown_role",
            "question": "这个 role_type 不在契约枚举里",
            "context": {},
        },
    )

    assert response.status_code == 422


def test_non_abnormal_upload_normalizes_risk_level_and_points():
    response = client.post(
        "/api/upload",
        headers=auth_headers(),
        data={
            "title": "非异常高风险字段归一测试",
            "file_type": "text",
            "device_name": "汽轮机给水泵",
            "process_name": "运行监听",
            "scene_type": "other",
            "is_abnormal": "0",
            "risk_level": "high",
            "tags": "给水泵,说明",
            "description": "前端误传高风险，但未标记异常",
            "text_content": "这是一条普通文本记录。",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["file"]["is_abnormal"] is False
    assert data["file"]["risk_level"] == "none"
    assert data["abnormal_case"] is None
    assert data["score_added"] == 5


def test_is_abnormal_only_accepts_zero_or_one():
    upload_response = client.post(
        "/api/upload",
        headers=auth_headers(),
        data={
            "title": "非法异常标记测试",
            "file_type": "text",
            "device_name": "1号主变压器",
            "process_name": "红外测温巡检",
            "scene_type": "other",
            "is_abnormal": "yes",
            "risk_level": "none",
            "text_content": "非法 is_abnormal 字段。",
        },
    )
    assert upload_response.status_code == 400

    list_response = client.get("/api/files?is_abnormal=2", headers=auth_headers())
    assert list_response.status_code == 400


def test_agent_proxy_failure_falls_back_to_mock(monkeypatch):
    from app.services import agent_service

    monkeypatch.setattr(agent_service.settings, "agent_mode", "proxy")
    monkeypatch.setattr(agent_service.settings, "agent_api_key", "fake-key")
    monkeypatch.setattr(agent_service.settings, "agent_api_base_url", "http://127.0.0.1:9/v1")
    monkeypatch.setattr(agent_service.settings, "agent_timeout_seconds", 1)

    response = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "management_decision",
            "question": "触发 proxy 失败后的 fallback",
            "context": {},
        },
    )

    assert response.status_code == 200
    assert response.json()["mode"] == "mock_fallback"


def test_agent_proxy_text_chat_uses_text_model_without_environment_proxy(monkeypatch):
    from app.services import agent_service

    captured_body = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "proxy ok"}}]}

    class FakeAsyncClient:
        def __init__(self, *, timeout, trust_env):
            assert timeout == 3
            assert trust_env is False

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return None

        async def post(self, url, headers, json):
            assert url == "https://api.siliconflow.cn/v1/chat/completions"
            assert headers["Authorization"] == "Bearer fake-key"
            captured_body.update(json)
            return FakeResponse()

    monkeypatch.setattr(agent_service.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(agent_service.settings, "agent_mode", "proxy")
    monkeypatch.setattr(agent_service.settings, "agent_api_key", "fake-key")
    monkeypatch.setattr(agent_service.settings, "agent_api_base_url", "https://api.siliconflow.cn/v1")
    monkeypatch.setattr(agent_service.settings, "agent_model", "Qwen/Qwen3-VL-32B-Instruct")
    monkeypatch.setattr(agent_service.settings, "agent_text_model", "Qwen/Qwen3-30B-A3B-Instruct-2507")
    monkeypatch.setattr(agent_service.settings, "agent_vision_model", "Qwen/Qwen3-VL-32B-Instruct")
    monkeypatch.setattr(agent_service.settings, "agent_enable_thinking", False)
    monkeypatch.setattr(agent_service.settings, "agent_timeout_seconds", 3)

    response = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "management_decision",
            "question": "测试 proxy 成功路径",
            "context": {},
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "proxy"
    assert data["answer"] == "proxy ok"
    assert captured_body["model"] == "Qwen/Qwen3-30B-A3B-Instruct-2507"
    assert "enable_thinking" not in captured_body
    assert captured_body["max_tokens"] == 800


def test_agent_proxy_sends_enable_thinking_for_supported_qwen3_text_model(monkeypatch):
    from app.services import agent_service

    captured_body = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "text proxy ok"}}]}

    class FakeAsyncClient:
        def __init__(self, *, timeout, trust_env):
            assert trust_env is False

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return None

        async def post(self, url, headers, json):
            captured_body.update(json)
            return FakeResponse()

    monkeypatch.setattr(agent_service.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(agent_service.settings, "agent_mode", "proxy")
    monkeypatch.setattr(agent_service.settings, "agent_api_key", "fake-key")
    monkeypatch.setattr(agent_service.settings, "agent_api_base_url", "https://api.siliconflow.cn/v1")
    monkeypatch.setattr(agent_service.settings, "agent_model", "Qwen/Qwen3-32B")
    monkeypatch.setattr(agent_service.settings, "agent_text_model", "Qwen/Qwen3-32B")
    monkeypatch.setattr(agent_service.settings, "agent_enable_thinking", False)
    monkeypatch.setattr(agent_service.settings, "agent_max_tokens", 512)

    response = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "management_decision",
            "question": "测试 Qwen3 文本模型 no thinking",
            "context": {},
        },
    )

    assert response.status_code == 200
    assert response.json()["mode"] == "proxy"
    assert captured_body["model"] == "Qwen/Qwen3-32B"
    assert captured_body["enable_thinking"] is False
    assert captured_body["max_tokens"] == 512


def test_agent_proxy_sends_multimodal_image_url_parts(monkeypatch):
    from app.services import agent_service

    captured_body = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "vision proxy ok"}}]}

    class FakeAsyncClient:
        def __init__(self, *, timeout, trust_env):
            assert trust_env is False

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return None

        async def post(self, url, headers, json):
            captured_body.update(json)
            return FakeResponse()

    monkeypatch.setattr(agent_service.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(agent_service.settings, "agent_mode", "proxy")
    monkeypatch.setattr(agent_service.settings, "agent_api_key", "fake-key")
    monkeypatch.setattr(agent_service.settings, "agent_api_base_url", "https://api.siliconflow.cn/v1")
    monkeypatch.setattr(agent_service.settings, "agent_model", "Qwen/Qwen3-VL-32B-Instruct")
    monkeypatch.setattr(agent_service.settings, "agent_text_model", "Qwen/Qwen3-30B-A3B-Instruct-2507")
    monkeypatch.setattr(agent_service.settings, "agent_vision_model", "Qwen/Qwen3-VL-32B-Instruct")

    response = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "management_decision",
            "question": "分析这张主变红外测温图片是否异常",
            "context": {},
            "attachments": [
                {
                    "type": "image_url",
                    "url": "https://example.com/transformer-thermal.png",
                    "detail": "high",
                }
            ],
        },
    )

    assert response.status_code == 200
    assert response.json()["mode"] == "proxy"
    assert captured_body["model"] == "Qwen/Qwen3-VL-32B-Instruct"
    assert "enable_thinking" not in captured_body
    user_message = captured_body["messages"][1]
    assert user_message["role"] == "user"
    assert user_message["content"] == [
        {
            "type": "image_url",
            "image_url": {
                "url": "https://example.com/transformer-thermal.png",
                "detail": "high",
            },
        },
        {"type": "text", "text": "分析这张主变红外测温图片是否异常"},
    ]


def test_agent_proxy_converts_uploaded_image_file_to_base64_part(monkeypatch):
    from app.services import agent_service

    image_bytes = b"industrial image bytes"
    upload = client.post(
        "/api/upload",
        headers=auth_headers(),
        data={
            "title": "Agent多模态图片",
            "file_type": "image",
            "device_name": "1号主变压器",
            "process_name": "红外测温巡检",
            "scene_type": "abnormal_operation",
            "is_abnormal": "1",
            "risk_level": "high",
        },
        files={"file": ("agent-thermal.png", image_bytes, "image/png")},
    )
    file_id = upload.json()["file"]["id"]
    captured_body = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "uploaded vision ok"}}]}

    class FakeAsyncClient:
        def __init__(self, *, timeout, trust_env):
            assert trust_env is False

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return None

        async def post(self, url, headers, json):
            captured_body.update(json)
            return FakeResponse()

    monkeypatch.setattr(agent_service.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(agent_service.settings, "agent_mode", "proxy")
    monkeypatch.setattr(agent_service.settings, "agent_api_key", "fake-key")
    monkeypatch.setattr(agent_service.settings, "agent_api_base_url", "https://api.siliconflow.cn/v1")
    monkeypatch.setattr(agent_service.settings, "agent_model", "Qwen/Qwen3-VL-32B-Instruct")

    response = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "quality_supervisor",
            "question": "识别这张现场图片里的风险点",
            "context": {},
            "attachments": [
                {
                    "type": "image_url",
                    "file_id": file_id,
                    "detail": "high",
                }
            ],
        },
    )

    assert response.status_code == 200
    assert response.json()["mode"] == "proxy"
    image_url = captured_body["messages"][1]["content"][0]["image_url"]["url"]
    assert image_url.startswith("data:image/png;base64,")
    encoded = image_url.split(",", 1)[1]
    assert base64.b64decode(encoded) == image_bytes


def test_agent_proxy_sends_multimodal_video_url_parts(monkeypatch):
    from app.services import agent_service

    captured_body = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "video proxy ok"}}]}

    class FakeAsyncClient:
        def __init__(self, *, timeout, trust_env):
            assert trust_env is False

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return None

        async def post(self, url, headers, json):
            captured_body.update(json)
            return FakeResponse()

    monkeypatch.setattr(agent_service.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(agent_service.settings, "agent_mode", "proxy")
    monkeypatch.setattr(agent_service.settings, "agent_api_key", "fake-key")
    monkeypatch.setattr(agent_service.settings, "agent_api_base_url", "https://api.siliconflow.cn/v1")
    monkeypatch.setattr(agent_service.settings, "agent_model", "Qwen/Qwen3-VL-32B-Instruct")

    response = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "quality_supervisor",
            "question": "总结这个现场视频的主要风险",
            "attachments": [
                {
                    "type": "video_url",
                    "url": "https://example.com/site.mp4",
                    "detail": "high",
                    "max_frames": 16,
                    "fps": 1,
                }
            ],
        },
    )

    assert response.status_code == 200
    content = captured_body["messages"][1]["content"]
    assert content[0] == {
        "type": "video_url",
        "video_url": {
            "url": "https://example.com/site.mp4",
            "detail": "high",
            "max_frames": 16,
            "fps": 1,
        },
    }
    assert content[1] == {"type": "text", "text": "总结这个现场视频的主要风险"}


def test_agent_attachment_requires_url_or_file_id():
    response = client.post(
        "/api/agent/chat",
        headers=auth_headers("admin"),
        json={
            "user_id": 2,
            "role_type": "management_decision",
            "question": "缺少附件来源",
            "attachments": [{"type": "image_url"}],
        },
    )

    assert response.status_code == 422
