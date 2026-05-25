from sqlalchemy.orm import Session

from app.models import AbnormalCase, KnowledgeItem, UploadedFile


def build_graph(db: Session, limit: int = 80) -> dict[str, list[dict[str, str]]]:
    files = (
        db.query(UploadedFile)
        .order_by(UploadedFile.created_at.desc(), UploadedFile.id.desc())
        .limit(limit)
        .all()
    )
    file_ids = [item.id for item in files]
    knowledge_by_file = {
        item.source_file_id: item
        for item in db.query(KnowledgeItem).filter(KnowledgeItem.source_file_id.in_(file_ids)).all()
    } if file_ids else {}
    abnormal_by_file = {
        item.source_file_id: item
        for item in db.query(AbnormalCase).filter(AbnormalCase.source_file_id.in_(file_ids)).all()
    } if file_ids else {}

    nodes: dict[str, dict[str, str]] = {}
    links: list[dict[str, str]] = []

    def add_node(node_id: str, name: str, category: str) -> None:
        nodes[node_id] = {"id": node_id, "name": name, "category": category}

    def add_link(source: str, target: str, label: str) -> None:
        links.append({"source": source, "target": target, "label": label})

    for uploaded_file in files:
        user_id = f"user_{uploaded_file.uploader_id}"
        file_id = f"file_{uploaded_file.id}"
        device_id = f"device_{uploaded_file.device_name}"
        process_id = f"process_{uploaded_file.process_name}"

        add_node(user_id, uploaded_file.uploader_name or "未知员工", "employee")
        add_node(file_id, uploaded_file.title, "file")
        add_node(device_id, uploaded_file.device_name or "未知设备", "device")
        add_node(process_id, uploaded_file.process_name or "未知工序", "process")
        add_link(user_id, file_id, "上传")

        knowledge_item = knowledge_by_file.get(uploaded_file.id)
        if knowledge_item:
            knowledge_id = f"knowledge_{knowledge_item.id}"
            add_node(knowledge_id, knowledge_item.title, "knowledge")
            add_link(file_id, knowledge_id, "生成")
            add_link(knowledge_id, device_id, "关联设备")
            add_link(knowledge_id, process_id, "关联工序")

        abnormal_case = abnormal_by_file.get(uploaded_file.id)
        if abnormal_case:
            abnormal_id = f"abnormal_{abnormal_case.id}"
            add_node(abnormal_id, abnormal_case.title or uploaded_file.title, "abnormal")
            add_link(abnormal_id, process_id, "异常发生于")

    return {"nodes": list(nodes.values()), "links": links}
