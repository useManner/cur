from datetime import datetime
from enum import Enum
from sqlalchemy import String, Text, Integer, Float, DateTime, JSON, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


class TaskStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    done = "done"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(SAEnum(TaskStatus), default=TaskStatus.pending, nullable=False)
    file_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    result_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class File(Base):
    __tablename__ = "files"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    task_id: Mapped[str] = mapped_column(String(64), ForeignKey("tasks.id"), index=True, nullable=False)
    filename: Mapped[str] = mapped_column(Text, nullable=False)
    md5: Mapped[str | None] = mapped_column(String(64))
    pdq_hash: Mapped[str | None] = mapped_column(Text)
    tmk_path: Mapped[str | None] = mapped_column(Text)
    file_type: Mapped[str | None] = mapped_column(String(16))  # image/video
    quality: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class DuplicateGroup(Base):
    __tablename__ = "duplicates"

    group_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    file_ids: Mapped[dict] = mapped_column(JSON, nullable=False)
    similarity: Mapped[float] = mapped_column(Float, nullable=False)


