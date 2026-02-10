# 开发指南

本文档为 DeepWiki-Open 项目的开发指南，涵盖环境搭建、本地开发、构建部署、代码规范、测试及常见开发任务。

---

## 前置条件

在开始开发之前，请确保本地已安装以下工具：

| 工具 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | 20+ | 前端运行时 |
| Python | 3.11+ | 后端运行时 |
| Poetry | 2.0+ | Python 依赖管理（`poetry-core>=2.0.0`） |
| Docker | 可选 | 容器化部署 |
| Git | 最新稳定版 | 版本控制 |

---

## 环境搭建

### 克隆仓库

```bash
git clone https://github.com/AsyncFuncAI/deepwiki-open.git
cd deepwiki-open
```

### 前端依赖安装

项目使用 Next.js 15 + React 19，部分依赖存在 peer dependency 冲突，需要添加 `--legacy-peer-deps` 标志：

```bash
npm ci --legacy-peer-deps
```

也可以使用 yarn（项目指定了 `yarn@1.22.22` 作为 packageManager）：

```bash
yarn install
```

### 后端依赖安装

后端使用 Poetry 管理依赖，进入 `api/` 目录安装：

```bash
cd api && poetry install
```

主要依赖包括：FastAPI、Uvicorn、Pydantic、google-generativeai、openai、adalflow、faiss-cpu、websockets 等。

### 环境变量配置

在项目根目录创建 `.env` 文件，配置以下环境变量：

```bash
# AI 模型 API 密钥（根据使用的模型选择配置）
GOOGLE_API_KEY=your_google_api_key          # Google Gemini
OPENAI_API_KEY=your_openai_api_key          # OpenAI（也用于嵌入功能）
OPENROUTER_API_KEY=your_openrouter_api_key  # OpenRouter

# 服务器配置
PORT=8001                                    # 后端 API 端口
SERVER_BASE_URL=http://localhost:8001        # 后端服务地址

# 授权模式（可选）
DEEPWIKI_AUTH_MODE=false
DEEPWIKI_AUTH_CODE=your_secret_code

# 日志配置
LOG_LEVEL=INFO
LOG_FILE_PATH=api/logs/application.log
```

> 注意：启动时后端会检查 `GOOGLE_API_KEY` 和 `OPENAI_API_KEY` 是否存在，缺失时会输出警告但不会阻止启动。

---

## 本地开发

### 前端开发

使用 Next.js 的 Turbopack 模式启动开发服务器，默认端口 3000：

```bash
npm run dev
```

该命令实际执行 `next dev --turbopack --port 3000`，支持热模块替换（HMR）。

前端通过 `next.config.ts` 中的 `rewrites` 规则将 API 请求代理到后端（默认 `http://localhost:8001`），因此本地开发时需要同时运行后端服务。

### 后端开发

使用以下命令启动后端 API 服务器：

```bash
python -m api.main
```

后端默认监听端口 `8001`（可通过 `PORT` 环境变量修改）。在非生产环境下（`NODE_ENV != production`），uvicorn 会启用 watchfiles 自动重载功能，监听 `api/` 目录下的 Python 文件变更并自动重启服务，同时排除 `logs/` 和 `__pycache__/` 目录。

### 同时运行前后端

项目提供了 `run.sh` 脚本，使用 `uv` 运行后端：

```bash
# 使用 run.sh 启动后端
bash run.sh
```

该脚本执行 `uv run -m api.main`。如需同时运行前后端，建议在两个终端窗口中分别启动：

```bash
# 终端 1：启动后端
python -m api.main

# 终端 2：启动前端
npm run dev
```

---

## 构建与部署

### 前端构建

```bash
npm run build
```

Next.js 配置了 `output: 'standalone'` 模式，构建产物为独立可运行的服务器，适合容器化部署。构建还包含以下优化：

- 包导入优化（mermaid、react-syntax-highlighter）
- Webpack 代码分割（vendor chunks）

### Docker 部署

项目提供了 `docker-compose.yml`，一键启动：

```bash
docker-compose up
```

重建并启动：

```bash
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

Docker 配置要点：

- **端口映射**：API 端口（默认 8001）和 Next.js 端口（3000）
- **数据持久化**：`~/.adalflow` 挂载到容器内，保存仓库和嵌入数据
- **日志持久化**：`./api/logs` 挂载到容器内
- **资源限制**：内存上限 6GB，预留 2GB
- **健康检查**：每 60 秒检查 `/health` 端点，启动等待 30 秒

---

## 代码规范

### 前端：ESLint + TypeScript

项目使用 ESLint 9 的 Flat Config 格式（`eslint.config.mjs`），继承了以下规则集：

- `next/core-web-vitals` -- Next.js 核心 Web 性能指标规则
- `next/typescript` -- Next.js TypeScript 规则

运行代码检查：

```bash
npm run lint
```

TypeScript 版本为 5.x，类型定义包括 `@types/node`、`@types/react`、`@types/react-dom` 等。

### 后端：Python 代码风格

- 使用 Python 3.11+ 语法特性
- 依赖通过 Poetry 管理，锁定在 `pyproject.toml` 中
- 日志使用标准库 `logging` 模块，通过 `api/logging_config.py` 统一配置
- 环境变量通过 `python-dotenv` 加载

---

## 测试

### pytest 运行方式

项目使用 pytest 作为测试框架，配置文件为 `pytest.ini`：

```bash
# 运行所有测试
pytest

# 运行特定标记的测试
pytest -m unit          # 单元测试
pytest -m integration   # 集成测试
pytest -m "not slow"    # 排除慢速测试
pytest -m "not network" # 排除需要网络的测试
```

### 测试配置

`pytest.ini` 中的关键配置：

- **测试目录**：`test/`
- **测试文件匹配**：`test_*.py` 和 `*_test.py`
- **测试类匹配**：`Test*` 前缀
- **测试函数匹配**：`test_*` 前缀
- **默认选项**：`-v`（详细输出）、`--strict-markers`（严格标记）、`--tb=short`（简短回溯）
- **自定义标记**：`unit`、`integration`、`slow`、`network`

### 安装测试依赖

pytest 定义在 Poetry 的 dev 依赖组中：

```bash
cd api && poetry install --with dev
```

---

## 常见开发任务

### 添加新 AI 模型提供商

1. 在 `api/config/generator.json` 中添加新提供商的模型配置
2. 创建对应的客户端类（参考已有的 `openai_client.py` 实现）
3. 在前端 `src/components/ConfigurationModal.tsx` 中添加模型选项供用户选择
4. 如需嵌入支持，同步更新 `api/config/embedder.json`

### 修改 UI 组件

- 样式使用 TailwindCSS 4，全局样式定义在 `src/app/globals.css`
- 暗黑/亮色模式通过 `next-themes` 和 `data-theme` 属性切换
- Markdown 渲染组件：`src/components/Markdown.tsx`
- Mermaid 图表组件：`src/components/Mermaid.tsx`
- 国际化翻译文件位于 `src/messages/` 目录

### 添加新 API 端点

1. 在 `api/api.py` 中定义新的 FastAPI 路由
2. 如果前端需要访问该端点，在 `next.config.ts` 的 `rewrites` 中添加代理规则
3. 使用 `logging` 模块记录关键操作日志

---

## 故障排除

### 前端依赖安装失败

**问题**：`npm install` 报 peer dependency 冲突。
**解决**：使用 `npm ci --legacy-peer-deps` 或 `yarn install`。

### 后端启动时环境变量警告

**问题**：启动时提示 `Missing environment variables: GOOGLE_API_KEY, OPENAI_API_KEY`。
**解决**：在 `.env` 文件中配置对应的 API 密钥。如果只使用特定提供商（如 OpenRouter），可忽略其他提供商的警告。

### 前端无法连接后端 API

**问题**：前端页面加载后 API 请求失败。
**解决**：确认后端已启动并监听在 `SERVER_BASE_URL` 指定的地址（默认 `http://localhost:8001`）。检查 `next.config.ts` 中的 `rewrites` 配置是否正确。

### Docker 容器内存不足

**问题**：Docker 容器因 OOM 被终止。
**解决**：`docker-compose.yml` 默认内存上限为 6GB。如果处理大型仓库，可适当调高 `mem_limit` 值。

### watchfiles 自动重载不生效

**问题**：修改后端代码后服务未自动重启。
**解决**：确认 `NODE_ENV` 未设置为 `production`。自动重载仅监听 `api/` 目录下的 `.py` 文件，且排除 `logs/` 目录。

### 健康检查失败

**问题**：Docker 健康检查报告容器不健康。
**解决**：访问 `http://localhost:8001/health` 确认后端是否正常响应。健康检查有 30 秒的启动等待期，如果服务启动较慢可在 `docker-compose.yml` 中调大 `start_period`。
