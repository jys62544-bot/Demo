from sqlalchemy.orm import Session

from app.models import AbnormalCase, KnowledgeItem


def build_graph(db: Session, limit: int = 4) -> dict[str, list[dict[str, str]]]:
    abnormal_cases = (
        db.query(AbnormalCase)
        .order_by(AbnormalCase.created_at.desc(), AbnormalCase.id.desc())
        .limit(limit)
        .all()
    )
    file_ids = [item.source_file_id for item in abnormal_cases if item.source_file_id]
    knowledge_by_file = {
        item.source_file_id: item
        for item in db.query(KnowledgeItem).filter(KnowledgeItem.source_file_id.in_(file_ids)).all()
    } if file_ids else {}

    nodes: dict[str, dict[str, str]] = {}
    links: list[dict[str, str]] = []

    def add_node(node_id: str, name: str, category: str) -> None:
        nodes[node_id] = {"id": node_id, "name": name, "category": category}

    def add_link(source: str, target: str, label: str) -> None:
        links.append({"source": source, "target": target, "label": label})

    for abnormal_case in abnormal_cases:
        device_id = f"device_{abnormal_case.device_name}"
        process_id = f"process_{abnormal_case.process_name}"
        abnormal_id = f"abnormal_{abnormal_case.id}"
        risk_id = f"risk_{abnormal_case.risk_level}"

        add_node(device_id, abnormal_case.device_name or "未知设备", "device")
        add_node(process_id, abnormal_case.process_name or "未知巡检环节", "process")
        add_node(abnormal_id, abnormal_case.title or "未命名异常", "abnormal")
        add_node(risk_id, _risk_label(abnormal_case.risk_level), "risk")
        add_link(device_id, abnormal_id, "出现问题")
        add_link(abnormal_id, process_id, "发生环节")
        add_link(abnormal_id, risk_id, "风险等级")

        knowledge_item = knowledge_by_file.get(abnormal_case.source_file_id)
        if knowledge_item:
            knowledge_id = f"knowledge_{knowledge_item.id}"
            add_node(knowledge_id, knowledge_item.title, "knowledge")
            add_link(abnormal_id, knowledge_id, "沉淀知识")
            add_link(knowledge_id, process_id, "复盘环节")

    return {"nodes": list(nodes.values()), "links": links}


def _risk_label(value: str | None) -> str:
    labels = {
        "none": "无风险",
        "low": "低风险",
        "medium": "中风险",
        "high": "高风险",
        "critical": "严重风险",
    }
    return labels.get(value or "none", "未知风险")
