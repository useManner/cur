from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from uuid import uuid4
import os
import shutil
from .database import init_db, SessionLocal
from .models import Task, TaskStatus
from .worker import enqueue_task


class UploadResponse(BaseModel):
    task_id: str


app = FastAPI(title="Visual Duplicate Finder Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DATA_DIR = os.getenv("DATA_DIR", os.path.abspath(os.path.join(os.getcwd(), "data")))


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    os.makedirs(os.path.join(DATA_DIR, "uploads"), exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "reports"), exist_ok=True)


MAX_UPLOAD_BYTES = 10 * 1024 * 1024 * 1024  # 10GB


@app.post("/upload", response_model=UploadResponse)
async def upload_zip(file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="仅支持 ZIP 文件上传")

    task_id = str(uuid4())
    upload_path = os.path.join(DATA_DIR, "uploads", f"{task_id}.zip")

    # 流式写入并限制 10GB
    written = 0
    with open(upload_path, "wb") as f:
        while True:
            chunk = await file.read(1024 * 1024)  # 1MB
            if not chunk:
                break
            written += len(chunk)
            if written > MAX_UPLOAD_BYTES:
                try:
                    f.close()
                    os.remove(upload_path)
                except Exception:
                    pass
                raise HTTPException(status_code=413, detail="文件过大（超过10GB限制）")
            f.write(chunk)

    with SessionLocal() as session:
        task = Task(id=task_id, name=file.filename)
        session.add(task)
        session.commit()

    enqueue_task(task_id=task_id, upload_path=upload_path)
    return UploadResponse(task_id=task_id)


@app.get("/task/{task_id}")
def get_task(task_id: str):
    with SessionLocal() as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")
        return {
            "id": task.id,
            "name": task.name,
            "status": task.status.value,
            "file_count": task.file_count,
            "result_path": task.result_path,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "finished_at": task.finished_at.isoformat() if task.finished_at else None,
        }


@app.get("/task/{task_id}/report")
def get_report(task_id: str, format: str = "json"):
    report_path = os.path.join(DATA_DIR, "reports", f"{task_id}.{format}")
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="报告不存在")
    media_type = {
        "json": "application/json",
        "html": "text/html",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }.get(format, "application/octet-stream")
    return FileResponse(report_path, media_type=media_type, filename=os.path.basename(report_path))


@app.get("/history")
def history(page: int = 1, size: int = 20):
    page = max(1, page)
    size = max(1, min(100, size))
    with SessionLocal() as session:
        total = session.query(Task).count()
        items = (
            session.query(Task)
            .order_by(Task.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
            .all()
        )
        data = [
            {
                "id": t.id,
                "name": t.name,
                "status": t.status.value,
                "file_count": t.file_count,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "finished_at": t.finished_at.isoformat() if t.finished_at else None,
            }
            for t in items
        ]
        return {"total": total, "page": page, "size": size, "items": data}


@app.delete("/task/{task_id}")
def delete_task(task_id: str):
    with SessionLocal() as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")
        session.delete(task)
        session.commit()
    return JSONResponse({"deleted": True, "task_id": task_id})


class WebhookTestBody(BaseModel):
    url: str | None = None


@app.post("/webhook/test")
def webhook_test(body: WebhookTestBody):
    return {"ok": True, "url": body.url}


