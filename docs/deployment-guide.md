# 部署指南

## 部署架构概览

DeepWiki-Open 采用 Docker 单容器双服务架构：

- **Python FastAPI 后端** -- 端口 `8001`（可通过 `PORT` 环境变量自定义）
- **Next.js 前端** -- 端口 `3000`（固定）

容器通过 `/app/start.sh` 同时启动两个服务进程，`wait -n` 监控任一进程退出即终止容器。数据持久化通过宿主机卷挂载实现，CI/CD 通过 GitHub Actions 构建 AMD64 + ARM64 双架构镜像并推送至 GHCR。

---

## Docker 部署

### 前置条件

1. 安装 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)
2. 在项目根目录创建 `.env` 文件（参见下方环境变量配置）
3. 确保端口 `8001` 和 `3000` 未被占用
4. 建议宿主机至少预留 **6GB 内存**（容器 `mem_limit` 为 6g）

### 标准部署 (docker-compose up)

```bash
git clone https://github.com/AsyncFuncAI/deepwiki-open.git
cd deepwiki-open
cp .env.example .env   # 创建并编辑 .env 文件
docker-compose up -d   # 一键启动（首次自动构建镜像）
docker-compose ps      # 查看运行状态
docker-compose logs -f deepwiki  # 查看实时日志
```

启动成功后访问：前端 http://localhost:3000 | API http://localhost:8001 | 健康检查 http://localhost:8001/health

### 环境变量配置

在项目根目录创建 `.env` 文件：

```bash
# === 必需 ===
OPENAI_API_KEY=your_openai_api_key        # 用于嵌入功能，必须配置
# === 可选：根据使用的模型选择 ===
GOOGLE_API_KEY=your_google_api_key        # 使用 Gemini 模型时需要
OPENROUTER_API_KEY=your_openrouter_api_key # 使用 OpenRouter 时需要
# === 服务配置 ===
PORT=8001                                  # API 端口，默认 8001
LOG_LEVEL=INFO                             # 日志级别：DEBUG / INFO / WARNING / ERROR
LOG_FILE_PATH=api/logs/application.log     # 日志文件路径
# === 授权模式（可选） ===
DEEPWIKI_AUTH_MODE=false
DEEPWIKI_AUTH_CODE=your_secret_code
```

`docker-compose.yml` 已预设 `PORT=8001`、`NODE_ENV=production`、`SERVER_BASE_URL=http://localhost:8001`，无需手动修改。

---

## Dockerfile 构建详解

### 多阶段构建流程

`Dockerfile` 采用四阶段构建，有效减小最终镜像体积：

| 阶段 | 基础镜像 | 职责 |
|------|----------|------|
| `node_deps` | `node:20-alpine3.22` | `npm ci` 安装前端依赖 |
| `node_builder` | `node:20-alpine3.22` | Next.js 生产构建（standalone 模式） |
| `py_deps` | `python:3.11-slim` | Poetry 安装 Python 依赖到 `.venv` |
| 最终镜像 | `python:3.11-slim` | 组装所有产物，安装 Node.js 20 运行时 |

最终镜像包含：Python 3.11 + 虚拟环境（`/opt/venv`）、Node.js 20、Next.js standalone 产物、API 源码、启动脚本，以及 `curl`/`git`/`ca-certificates` 等系统工具。

构建优化：
- `NODE_OPTIONS="--max-old-space-size=4096"` 防止构建时 OOM
- `NEXT_TELEMETRY_DISABLED=1` 禁用遥测
- 支持 `CUSTOM_CERT_DIR` 构建参数注入自定义 CA 证书

### Ollama 本地版

`Dockerfile-ollama-local` 在标准构建基础上增加 `ollama_base` 阶段，将 Ollama 二进制和预拉取模型（`nomic-embed-text` + `qwen3:1.7b`）打包进镜像。

```bash
# 构建（默认 ARM64，可通过 --build-arg TARGETARCH=amd64 切换）
docker build -f Dockerfile-ollama-local -t deepwiki-ollama:latest .
```

使用时修改 `docker-compose.yml`：

```yaml
services:
  deepwiki:
    build:
      dockerfile: Dockerfile-ollama-local
```

容器启动时自动运行 `ollama serve`，无需外部 Ollama 服务。

---

## CI/CD 流程

### GitHub Actions (AMD64 + ARM64 双架构)

工作流文件：`.github/workflows/docker-build-push.yml`

**触发条件：** 推送到 `main` / 向 `main` 发起 PR / 手动触发（`workflow_dispatch`）

**构建策略：** 矩阵并行构建 `linux/amd64`（`ubuntu-latest`）和 `linux/arm64`（`ubuntu-24.04-arm`）。

**流程：**

```
build-and-push (并行)              merge (合并)
  amd64 -> 构建+推送摘要  ──┐
                              ├──> 下载摘要 -> 创建多架构 manifest -> 推送
  arm64 -> 构建+推送摘要  ──┘
```

- `concurrency` 确保同一分支只运行一个构建，新任务取消旧任务
- PR 事件只构建不推送
- 使用 GitHub Actions Cache（`type=gha`）加速构建

### 镜像推送到 GHCR

镜像地址：`ghcr.io/asyncfuncai/deepwiki-open`

标签策略：`latest`（最新主分支）、`sha-<短哈希>`（Git 提交）、`main`（分支名）、语义版本（打 tag 时）。

```bash
docker pull ghcr.io/asyncfuncai/deepwiki-open:latest
```

---

## 数据持久化

| 宿主机路径 | 容器路径 | 用途 |
|------------|----------|------|
| `~/.adalflow` | `/root/.adalflow` | 仓库克隆缓存和向量嵌入数据 |
| `./api/logs` | `/app/api/logs` | 应用日志文件 |

数据在容器重建时保留，建议定期备份 `~/.adalflow` 目录。

---

## 更新流程

**标准更新**（推荐，生产环境）：

```bash
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

**快速更新**（开发迭代，利用缓存）：

```bash
docker-compose down && docker-compose build && docker-compose up -d
```

**分步更新**（便于调试）：

```bash
docker-compose stop              # 停止容器
docker-compose rm -f             # 删除容器（保留数据卷）
docker image prune -f            # 清理悬空镜像（可选）
docker-compose build --no-cache  # 重新构建
docker-compose up -d             # 启动服务
docker-compose ps                # 确认状态
```

仅配置变更时直接 `docker-compose restart` 即可。

---

## 健康检查

`docker-compose.yml` 已配置自动健康检查（`/health` 端点）：每 60 秒检查一次，超时 10 秒，连续 3 次失败标记为 unhealthy，启动后 30 秒开始检查。

```bash
curl -f http://localhost:8001/health                    # 宿主机检查
docker-compose exec deepwiki curl -f http://localhost:8001/health  # 容器内检查
docker inspect --format='{{.State.Health.Status}}' $(docker-compose ps -q deepwiki)
```

---

## 故障排除

| 问题 | 排查方法 |
|------|----------|
| 端口冲突 | `lsof -i :3000 -i :8001`，修改 `.env` 中 `PORT` 或停止占用进程 |
| 构建失败/OOM | `docker builder prune -f && docker-compose build --no-cache` |
| 容器启动后退出 | `docker-compose logs deepwiki` 查看日志，常见原因：`.env` 缺失、API Key 未配置 |
| API 无响应 | 进入容器 `docker-compose exec deepwiki /bin/bash`，检查进程和日志 |
| 彻底重置 | `docker-compose down -v --rmi all && docker system prune -a` |
