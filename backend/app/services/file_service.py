from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.config import settings
from app.time_utils import utc_now

TEXT_EXTRACTABLE_SUFFIXES = {".txt", ".md", ".markdown", ".csv", ".log"}
MAX_TEXT_CONTENT_CHARS = 4000


def parse_form_bool(value: str | None) -> bool:
    if value is None:
        return False
    normalized = value.strip()
    if normalized == "0":
        return False
    if normalized == "1":
        return True
    raise HTTPException(status_code=400, detail="is_abnormal 只能为 '0' 或 '1'")


async def save_upload_file(upload_file: UploadFile) -> tuple[str, str, str, str | None]:
    settings.upload_dir_path.mkdir(parents=True, exist_ok=True)
    original_name = Path(upload_file.filename or "upload.bin").name
    suffix = Path(original_name).suffix
    stem = Path(original_name).stem or "upload"
    safe_stem = "".join(ch if ch.isalnum() or ch in {"-", "_"} else "_" for ch in stem)
    saved_name = f"{utc_now():%Y%m%d%H%M%S}_{uuid4().hex[:8]}_{safe_stem}{suffix}"
    target = settings.upload_dir_path / saved_name

    content = await upload_file.read()
    if len(content) > settings.max_upload_size_bytes:
        raise HTTPException(status_code=413, detail="上传文件超过大小限制")

    target.write_bytes(content)
    return original_name, f"/uploads/{saved_name}", saved_name, extract_text_preview(original_name, content)


def extract_text_preview(file_name: str, content: bytes) -> str | None:
    suffix = Path(file_name).suffix.lower()
    if suffix not in TEXT_EXTRACTABLE_SUFFIXES:
        return None

    for encoding in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            text = content.decode(encoding)
            break
        except UnicodeDecodeError:
            text = ""
    if not text.strip():
        return None

    compact = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    return compact[:MAX_TEXT_CONTENT_CHARS]
