import os
import zipfile
from uuid import uuid4
from datetime import datetime
from celery import Celery
from .database import SessionLocal
from .models import Task, TaskStatus, File as FileModel, DuplicateGroup


REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("videopro2", broker=REDIS_URL, backend=REDIS_URL)
DATA_DIR = os.getenv("DATA_DIR", os.path.abspath(os.path.join(os.getcwd(), "data")))


def enqueue_task(task_id: str, upload_path: str) -> None:
    if os.getenv("SYNC_MODE", "false").lower() == "true":
        # 同步模式，直接在本进程执行，便于本地快速跑通
        run_pipeline(task_id, upload_path)
    else:
        run_pipeline.delay(task_id, upload_path)


@celery_app.task
def run_pipeline(task_id: str, upload_path: str) -> None:
    with SessionLocal() as session:
        task = session.get(Task, task_id)
        if not task:
            return
        task.status = TaskStatus.processing
        session.commit()

    extract_dir = os.path.join(DATA_DIR, "uploads", task_id)
    os.makedirs(extract_dir, exist_ok=True)
    with zipfile.ZipFile(upload_path, 'r') as zf:
        zf.extractall(extract_dir)

    file_models: list[FileModel] = []
    for root, _, files in os.walk(extract_dir):
        for name in files:
            file_id = str(uuid4())
            rel_path = os.path.join(root, name).replace(extract_dir + os.sep, "")
            model = FileModel(
                id=file_id,
                task_id=task_id,
                filename=rel_path,
                file_type=_infer_type(name),
            )
            file_models.append(model)

    with SessionLocal() as session:
        for m in file_models:
            session.add(m)
        task = session.get(Task, task_id)
        if task:
            task.file_count = len(file_models)
        session.commit()

    # 占位：模拟查重，构造一个空的重复组与报告
    report_json_path = os.path.join(DATA_DIR, "reports", f"{task_id}.json")
    os.makedirs(os.path.join(DATA_DIR, "reports"), exist_ok=True)
    with open(report_json_path, "w", encoding="utf-8") as f:
        f.write('{"task_id": "%s", "duplicate_groups": [], "summary": {"files": %d}}' % (task_id, len(file_models)))

    with SessionLocal() as session:
        task = session.get(Task, task_id)
        if task:
            task.status = TaskStatus.done
            task.result_path = report_json_path
            task.finished_at = datetime.utcnow()
            session.commit()


def _infer_type(filename: str) -> str:
    lower = filename.lower()
    if any(lower.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".bmp", ".webp"]):
        return "image"
    if any(lower.endswith(ext) for ext in [".mp4", ".mov", ".mkv", ".avi", ".webm"]):
        return "video"
    return "unknown"


