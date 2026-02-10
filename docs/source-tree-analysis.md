# 源代码树分析

## 项目根目录概览

| 文件 | 说明 |
|------|------|
| `package.json` | 前端依赖与脚本定义 (Next.js 15 + React 19) |
| `Dockerfile` | 生产环境 Docker 镜像构建 |
| `Dockerfile-ollama-local` | 本地 Ollama 模型专用 Docker 构建 |
| `docker-compose.yml` | 容器编排，暴露 8001(API) 和 3000(前端) 端口 |
| `next.config.ts` | Next.js 构建配置 |
| `tailwind.config.js` | TailwindCSS 主题与样式配置 |
| `postcss.config.mjs` | PostCSS 插件配置 |
| `tsconfig.json` | TypeScript 编译选项 |
| `eslint.config.mjs` | ESLint 代码规范配置 |
| `pytest.ini` | Python 测试框架配置 |
| `run.sh` | 一键启动脚本 |
| `.env` | 环境变量 (API 密钥、端口等，不提交到仓库) |
| `LICENSE` | 开源许可证 |

## 完整目录树（带注释）

```
deepwiki-open/
├── api/                            # ---- 后端 (FastAPI + Python) ----
│   ├── __init__.py                 # Python 包初始化
│   ├── main.py                     # 后端入口：uvicorn 启动、环境变量加载
│   ├── api.py                      # FastAPI 应用定义、路由与 WebSocket 端点
│   ├── config.py                   # 全局配置：API 密钥读取、客户端类注册
│   ├── data_pipeline.py            # 数据管道：仓库克隆、文本分割、嵌入生成
│   ├── rag.py                      # RAG 检索增强生成：向量检索 + AI 回答
│   ├── websocket_wiki.py           # WebSocket Wiki 生成流式处理
│   ├── prompts.py                  # AI 提示词模板定义
│   ├── simple_chat.py              # 简单聊天接口封装
│   ├── logging_config.py           # 日志配置（级别、文件输出）
│   ├── openai_client.py            # OpenAI API 客户端
│   ├── openrouter_client.py        # OpenRouter API 客户端
│   ├── google_embedder_client.py   # Google 嵌入模型客户端
│   ├── bedrock_client.py           # AWS Bedrock 客户端
│   ├── azureai_client.py           # Azure AI 客户端
│   ├── dashscope_client.py         # 阿里云 DashScope 客户端 (通义千问)
│   ├── ollama_patch.py             # Ollama 本地模型兼容补丁
│   ├── pyproject.toml              # Python 项目元数据
│   ├── config/                     # ---- 后端配置文件 ----
│   │   ├── generator.json          # LLM 生成模型配置 (7 个提供商)
│   │   ├── embedder.json           # 嵌入模型配置 (OpenAI/Ollama/Google/Bedrock)
│   │   ├── repo.json               # 仓库过滤规则 (排除目录与文件类型)
│   │   └── lang.json               # 语言配置
│   └── tools/
│       └── embedder.py             # 嵌入工具函数
│
├── src/                            # ---- 前端 (Next.js App Router) ----
│   ├── app/                        # App Router 页面与全局资源
│   │   ├── layout.tsx              # 根布局：字体加载、ThemeProvider、LanguageProvider
│   │   ├── page.tsx                # 首页：仓库 URL 输入、Wiki 生成触发
│   │   ├── globals.css             # 全局样式与 CSS 变量 (亮/暗主题)
│   │   └── favicon.ico             # 网站图标
│   ├── components/                 # UI 组件
│   │   ├── ConfigurationModal.tsx  # 配置弹窗：模型选择、API 密钥、语言
│   │   ├── ModelSelectionModal.tsx  # 模型选择弹窗
│   │   ├── Markdown.tsx            # Markdown 渲染 (react-markdown + rehype)
│   │   ├── Mermaid.tsx             # Mermaid 图表渲染与交互
│   │   ├── Ask.tsx                 # RAG 问答界面
│   │   ├── WikiTreeView.tsx        # Wiki 目录树导航
│   │   ├── WikiTypeSelector.tsx    # Wiki 类型选择器
│   │   ├── ProcessedProjects.tsx   # 已处理项目列表展示
│   │   ├── TokenInput.tsx          # 访问令牌输入组件
│   │   ├── UserSelector.tsx        # 用户选择器
│   │   └── theme-toggle.tsx        # 亮/暗主题切换按钮
│   ├── contexts/
│   │   └── LanguageContext.tsx      # 国际化语言 Context (10 种语言)
│   ├── hooks/
│   │   └── useProcessedProjects.ts # 已处理项目的自定义 Hook
│   ├── i18n.ts                     # next-intl 国际化初始化
│   ├── messages/                   # 多语言翻译文件
│   │   ├── en.json                 # 英文
│   │   ├── zh.json                 # 简体中文
│   │   ├── zh-tw.json              # 繁体中文
│   │   ├── ja.json                 # 日文
│   │   ├── kr.json                 # 韩文
│   │   ├── es.json                 # 西班牙文
│   │   ├── fr.json                 # 法文
│   │   ├── pt-br.json              # 巴西葡萄牙文
│   │   ├── ru.json                 # 俄文
│   │   └── vi.json                 # 越南文
│   ├── types/
│   │   └── repoinfo.tsx            # 仓库信息 TypeScript 类型定义
│   └── utils/                      # 工具函数
│       ├── getRepoUrl.tsx          # 仓库 URL 构建
│       ├── urlDecoder.tsx          # URL 解码与路径提取
│       └── websocketClient.ts      # WebSocket 客户端封装
│
├── public/                         # 静态资源 (SVG 图标)
├── screenshots/                    # README 截图
├── tests/                          # 测试目录
│   ├── api/test_api.py             # API 接口测试
│   ├── unit/                       # 单元测试 (嵌入模型)
│   └── integration/                # 集成测试
├── test/
│   └── test_extract_repo_name.py   # 仓库名提取测试
└── .github/workflows/
    └── docker-build-push.yml       # CI/CD：Docker 多架构构建与推送
```

## 前端源代码结构 (src/)

### app/ -- 页面与全局资源

- **`layout.tsx`** -- 根布局组件，加载 Geist Sans/Mono 本地字体，包裹 `ThemeProvider`（next-themes 暗黑模式）和 `LanguageProvider`（国际化）。
- **`page.tsx`** -- 应用首页，包含仓库 URL 输入框、Demo Mermaid 图表展示、配置弹窗触发，以及 Wiki 生成的 WebSocket 调用逻辑。
- **`globals.css`** -- 全局 CSS，定义亮色/暗色主题的 CSS 变量，基于 TailwindCSS 4。

### components/ -- UI 组件

| 组件 | 职责 |
|------|------|
| `ConfigurationModal` | 模型提供商选择、API Key 输入、语言切换、Wiki 类型配置 |
| `ModelSelectionModal` | 独立的模型选择弹窗 |
| `Markdown` | 基于 react-markdown 的富文本渲染，支持 GFM 和 HTML |
| `Mermaid` | Mermaid 图表渲染，支持缩放和平移 (svg-pan-zoom) |
| `Ask` | RAG 问答界面，支持普通问答和深度研究模式 |
| `WikiTreeView` | Wiki 文档的树形目录导航 |
| `ProcessedProjects` | 展示已生成 Wiki 的项目列表 |
| `theme-toggle` | 亮/暗主题切换按钮 |

### contexts/ -- React Context

- **`LanguageContext.tsx`** -- 提供全局语言状态管理，支持 10 种语言的动态切换。

### hooks/ -- 自定义 Hooks

- **`useProcessedProjects.ts`** -- 管理已处理项目列表的状态与持久化逻辑。

### messages/ -- 国际化翻译

包含 10 个 JSON 文件，覆盖英文、中文(简/繁)、日文、韩文、西班牙文、法文、葡萄牙文、俄文、越南文。

### utils/ -- 工具函数

- **`websocketClient.ts`** -- WebSocket 连接管理，处理 Wiki 生成的流式数据传输。
- **`urlDecoder.tsx`** -- URL 路径解码，从仓库 URL 中提取 owner/repo 等信息。
- **`getRepoUrl.tsx`** -- 根据平台类型 (GitHub/GitLab/Bitbucket) 构建完整仓库 URL。

## 后端源代码结构 (api/)

### 核心文件

| 文件 | 职责 |
|------|------|
| `main.py` | 服务入口：加载 .env、配置日志、启动 uvicorn (开发模式支持热重载) |
| `api.py` | FastAPI 应用：定义 REST 和 WebSocket 路由、CORS 中间件、Pydantic 模型 |
| `config.py` | 全局配置中心：读取环境变量、注册所有 AI 客户端类 |
| `data_pipeline.py` | 数据管道：仓库克隆、代码文件过滤、文本分割、向量嵌入生成 |
| `rag.py` | RAG 系统：基于向量相似度检索代码片段，结合 LLM 生成回答 |
| `websocket_wiki.py` | WebSocket 处理器：流式生成 Wiki 文档内容 |
| `prompts.py` | 提示词模板：定义 Wiki 生成和 RAG 问答的 prompt |
| `simple_chat.py` | 简单聊天：轻量级对话接口 |
| `logging_config.py` | 日志配置：支持文件输出和日志级别控制 |

### AI 客户端 (7 个提供商)

注：Google Gemini 通过 `google.generativeai` SDK 直接调用，其他 6 个提供商有独立客户端实现文件。

| 客户端文件 | 对应提供商 |
|-----------|-----------|
| `openai_client.py` | OpenAI (GPT-4o, GPT-5 系列) |
| `openrouter_client.py` | OpenRouter (统一访问 Claude/Gemini/DeepSeek 等) |
| `google_embedder_client.py` | Google (嵌入模型 text-embedding-004) |
| `bedrock_client.py` | AWS Bedrock (Claude/Titan/Cohere) |
| `azureai_client.py` | Azure AI (GPT-4o/GPT-4) |
| `dashscope_client.py` | 阿里云 DashScope (通义千问/DeepSeek) |
| `ollama_patch.py` | Ollama 本地模型兼容层 |

### 配置目录 (api/config/)

- **`generator.json`** -- LLM 生成模型配置，包含 7 个提供商 (Google/OpenAI/OpenRouter/Ollama/Bedrock/Azure/DashScope)，每个提供商定义默认模型和参数 (temperature/top_p)。
- **`embedder.json`** -- 嵌入模型配置，支持 OpenAI/Ollama/Google/Bedrock 四种嵌入后端，定义分词策略 (chunk_size=350, overlap=100) 和检索参数 (top_k=20)。
- **`repo.json`** -- 仓库过滤规则，排除 node_modules、.git、编译产物、二进制文件等，最大仓库限制 50GB。
- **`lang.json`** -- 语言相关配置。

## 配置文件说明

| 配置文件 | 格式 | 用途 |
|---------|------|------|
| `.env` | 环境变量 | API 密钥、端口、认证模式、日志级别 |
| `api/config/generator.json` | JSON | LLM 模型提供商与参数 |
| `api/config/embedder.json` | JSON | 嵌入模型与文本分割策略 |
| `api/config/repo.json` | JSON | 仓库文件过滤与大小限制 |
| `docker-compose.yml` | YAML | 容器编排、端口映射、数据卷挂载 |
| `next.config.ts` | TypeScript | Next.js 构建与运行时配置 |
| `tailwind.config.js` | JavaScript | TailwindCSS 主题定制 |
| `tsconfig.json` | JSON | TypeScript 编译选项 |
| `pytest.ini` | INI | Python 测试配置 |

## 入口点

### 前端入口

- **`src/app/layout.tsx`** -- Next.js App Router 根布局，所有页面的外层包裹，负责字体加载、主题初始化、国际化 Provider 注入。
- **`src/app/page.tsx`** -- 应用首页，用户交互的起点，处理仓库 URL 输入并触发 Wiki 生成流程。

### 后端入口

- **`api/main.py`** -- Python 服务入口，执行 `python -m api.main` 启动。加载环境变量、配置 Google GenAI、启动 uvicorn 服务器 (默认端口 8001，开发模式支持热重载)。
- **`api/api.py`** -- FastAPI 应用实例 (`app`)，被 uvicorn 加载，定义所有 HTTP/WebSocket 路由。
