Visual Duplicate Finder Pro

一个支持上传文件夹（ZIP）、检测图片与视频重复内容的可视化 Web 系统，基于 Facebook 开源的 PDQ 与 TMK+PDQF 算法。

功能概览
- 上传 ZIP（或未来支持文件夹直传），显示进度并生成任务 ID
- 图片使用 PDQ 生成 256bit 哈希；视频使用 TMK+PDQF 时间核哈希
- 后台 Celery Worker 异步计算，结果入库（PostgreSQL）
- 查重结果（重复组）支持 JSON / HTML / XLSX 报告
- 结果通知：邮件、Webhook；前端展示任务历史与报告
- 支持一键部署（Docker Compose）

架构
- frontend: React + Tailwind + Vite
- backend: FastAPI（API / 任务调度 / 报告生成）
- worker: Celery + Redis（哈希计算与查重）
- db: PostgreSQL（文件元数据与任务记录）
- storage: MinIO（文件与报告存储）

快速开始（Docker Compose）
1. 准备环境变量（可选）：复制 `.env.example` 为 `.env`，按需填写。
2. 构建并启动：
   docker compose up -d --build
3. 访问：
   - 前端：http://localhost:3000
   - 后端 API 文档：http://localhost:8000/docs
   - MinIO 控制台：http://localhost:9001 （账号/密码：minioadmin/minioadmin）

目录结构
frontend/
backend/
scripts/
docker-compose.yml
README.md

API（节选）
- POST /upload：上传 ZIP，创建任务并触发处理
- GET /task/{id}：查询任务状态
- GET /task/{id}/report：获取查重报告（HTML/JSON/XLSX）
- GET /history：分页查询历史任务
- DELETE /task/{id}：删除任务
- POST /webhook/test：测试 Webhook 推送

开发模式
- 后端本地运行：
  cd backend
  pip install -r requirements.txt
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
- Worker 运行：
  cd backend
  celery -A app.worker worker --loglevel=info
- 前端本地运行：
  cd frontend
  npm install
  npm run dev

环境变量
- DATABASE_URL：PostgreSQL 连接，默认 `postgresql+psycopg2://dedup:dedup@db:5432/dedupdb`
- REDIS_URL：Redis 连接，默认 `redis://redis:6379/0`
- MINIO_ENDPOINT：MinIO 地址，默认 `storage:9000`
- MINIO_ACCESS_KEY / MINIO_SECRET_KEY：MinIO 凭据
- MINIO_BUCKET：默认 `videopro2`
- MAIL_HOST / MAIL_USER / MAIL_PASS：SMTP 邮件配置
- WEBHOOK_TEST_URL：Webhook 测试地址

注意
- 目前上传方式为 ZIP，服务端解压并处理。后续可拓展浏览器文件夹直传。
- PDQ 与 TMK+PDQF 的实际二进制依赖需在 `scripts/` 内封装并在镜像中安装（本仓库先提供占位逻辑以便端到端跑通）。

许可证
MIT

