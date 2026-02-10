# 系统架构

## 架构概览

DeepWiki-Open 采用前后端分离架构，前端基于 **Next.js 15 + React 19**，后端基于 **FastAPI + Uvicorn**。系统的核心功能是为 GitHub/GitLab/Bitbucket 代码仓库自动生成交互式 Wiki 文档，并支持基于 RAG 的智能问答。

```
+-------------------+        HTTP / WebSocket        +-------------------+
|                   | <----------------------------> |                   |
|   Next.js 前端     |                                |   FastAPI 后端     |
|   (端口 3000)      |                                |   (端口 8001)      |
|                   |                                |                   |
+-------------------+                                +-------------------+
                                                            |
                                                     +------+------+
                                                     |             |
                                                +----v----+  +----v----+
                                                | AI 模型  |  | FAISS   |
                                                | 提供商   |  | 向量库   |
                                                +---------+  +---------+
```

## 前端架构

### 技术栈

- **Next.js 15** (App Router 模式)
- **React 19** + **TailwindCSS 4**
- **next-themes** 主题管理
- **WebSocket** 实时通信

### 核心布局 (`src/app/layout.tsx`)

根布局采用双层 Provider 嵌套，提供全局主题和多语言能力：

```tsx
<ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
  <LanguageProvider>
    {children}
  </LanguageProvider>
</ThemeProvider>
```

- **ThemeProvider**: 基于 `next-themes`，通过 `data-theme` 属性切换亮色/暗色模式，默认跟随系统。
- **LanguageProvider**: 自定义国际化上下文 (`src/contexts/LanguageContext.tsx`)，支持英文、中文、日文、韩文、西班牙文、越南文。

### 页面结构

| 路径 | 文件 | 说明 |
|------|------|------|
| `/` | `src/app/page.tsx` | 主页面，仓库 URL 输入、配置模态框、已处理项目列表 |
| `/[owner]/[repo]` | `src/app/[owner]/[repo]/page.tsx` | 动态 Wiki 展示页面 |

### 关键组件

- **ConfigurationModal** - 模型选择、访问令牌配置
- **Mermaid** - Mermaid 图表渲染 (架构图、流程图、时序图)
- **Markdown** - Markdown 内容渲染
- **Ask** - RAG 问答界面
- **ProcessedProjects** - 已处理项目列表展示
- **ThemeToggle** - 主题切换按钮

## 后端架构

### 入口与启动 (`api/main.py`)

```
main.py  -->  加载 .env 环境变量
         -->  配置日志系统
         -->  配置 Google GenAI
         -->  启动 Uvicorn 服务器 (端口 8001)
              - 开发模式: 启用热重载 (watchfiles)
              - 生产模式: 标准运行
```

启动时检查必要环境变量 (`GOOGLE_API_KEY`, `OPENAI_API_KEY`)，缺失时发出警告但不阻止启动。

### FastAPI 应用 (`api/api.py`)

FastAPI 应用配置了全局 CORS 中间件 (允许所有来源)，定义了以下核心数据模型：

| 模型 | 说明 |
|------|------|
| `WikiPage` | Wiki 页面 (id, title, content, filePaths, importance, relatedPages) |
| `WikiStructureModel` | Wiki 整体结构 (pages, sections, rootSections) |
| `WikiCacheData` | Wiki 缓存数据 |
| `WikiExportRequest` | Wiki 导出请求 (支持 markdown/json 格式) |
| `RepoInfo` | 仓库信息 (owner, repo, type, token) |
| `ModelConfig` / `Provider` / `Model` | AI 模型配置 |

### 核心 REST API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/models/config` | GET | 获取可用模型提供商及模型列表 |
| `/auth/status` | GET | 检查是否需要认证 |
| `/auth/validate` | POST | 验证授权码 |
| `/lang/config` | GET | 获取语言配置 |

### 多 AI 提供商适配器模式

系统通过统一的客户端抽象层支持 7 种 AI 提供商，每个提供商有独立的客户端实现：

| 提供商 | 客户端文件 | 说明 |
|--------|-----------|------|
| **Google Gemini** | `google.generativeai` (SDK) | 默认提供商，使用 gemini-2.0-flash |
| **OpenAI** | `api/openai_client.py` | 支持 gpt-4o 等模型 |
| **OpenRouter** | `api/openrouter_client.py` | 统一 API 访问 Claude、Llama 等第三方模型 |
| **Ollama** | `adalflow` OllamaClient | 本地开源模型运行 |
| **AWS Bedrock** | `api/bedrock_client.py` | AWS 托管模型服务 |
| **Azure AI** | `api/azureai_client.py` | Azure 托管模型服务 |
| **Dashscope** | `api/dashscope_client.py` | 阿里云通义千问模型服务 |

提供商选择通过请求参数 `provider` 字段动态指定，模型通过 `model` 字段指定。

### RAG 管道 (`api/rag.py`)

RAG (检索增强生成) 系统基于 **adalflow** 框架和 **FAISS** 向量检索引擎：

```
用户提问 --> 向量化查询 --> FAISS 相似度检索 --> 检索相关代码片段
                                                      |
                                                      v
                                              组装上下文 + 提问
                                                      |
                                                      v
                                              AI 模型生成回答
```

核心组件：
- **FAISSRetriever** (`adalflow`): 基于 FAISS 的向量检索器
- **CustomConversation**: 自定义对话管理，维护多轮对话历史
- **get_embedder**: 统一嵌入模型获取工具，支持 OpenAI/Google/Ollama/Bedrock 嵌入
- **MAX_INPUT_TOKENS = 7500**: 嵌入模型输入 token 安全阈值

### 数据处理管道 (`api/data_pipeline.py`)

负责仓库克隆、代码分析和向量嵌入：

- 基于 **adalflow** 的 `TextSplitter` 和 `ToEmbeddings` 进行文本分割与嵌入
- 使用 **tiktoken** 进行 token 计数 (支持不同嵌入模型的编码方式)
- 通过 `LocalDB` 管理本地向量数据库
- 数据持久化路径: `~/.adalflow`

### WebSocket Wiki 生成 (`api/websocket_wiki.py`)

通过 WebSocket 实现 Wiki 内容的实时流式生成：

```python
class ChatCompletionRequest(BaseModel):
    repo_url: str           # 仓库 URL
    messages: List[...]     # 对话消息
    provider: str           # AI 提供商 (google/openai/openrouter/ollama/bedrock/azure/dashscope)
    model: Optional[str]    # 模型名称
    language: Optional[str] # 生成语言
    excluded_dirs: Optional[str]   # 排除目录
    included_dirs: Optional[str]   # 包含目录
```

支持大输入检测 (`count_tokens`)，防止超出模型上下文窗口。

## 数据流

完整的 Wiki 生成流程如下：

1. 用户输入仓库 URL
2. 前端发送 WebSocket 连接请求
3. 后端克隆仓库、过滤文件 (排除 node_modules、.git 等目录)
4. 文本分割 + 向量嵌入 (TextSplitter --> ToEmbeddings --> FAISS，存储到 ~/.adalflow)
5. AI 模型生成 Wiki 结构和内容 (根据 provider 参数选择对应客户端)
6. 通过 WebSocket 流式推送到前端
7. 前端渲染 Markdown + Mermaid 图表
8. 缓存 Wiki 数据 (WikiCacheData)，支持后续快速加载
9. 用户可通过 RAG 问答深入了解代码

## AI 模型集成

### 生成模型 (LLM)

配置文件: `api/config/generator.json`

各提供商通过统一的客户端接口调用，核心参数包括：
- `model`: 模型标识符
- `temperature`: 生成温度
- `max_tokens`: 最大输出 token 数

### 嵌入模型 (Embedder)

配置文件: `api/config/embedder.json`

嵌入模型用于将代码文本转换为向量，支持：
- OpenAI Embeddings
- Google Embeddings (`api/google_embedder_client.py`)
- Ollama Embeddings
- Bedrock Embeddings

Token 上限: 8192 (安全阈值 7500)

## 通信协议

### REST API (HTTP)

用于配置查询、认证、缓存管理等非流式操作：

- `GET /models/config` - 获取模型配置
- `GET /auth/status` - 认证状态查询
- `POST /auth/validate` - 授权码验证
- `GET /lang/config` - 语言配置
- `GET /health` - 健康检查

### WebSocket (实时流式)

用于 Wiki 生成和 RAG 问答等需要流式输出的场景：

- **Wiki 生成**: 客户端建立 WebSocket 连接，发送仓库信息和配置参数，服务端流式返回生成的 Wiki 内容。
- **RAG 问答**: 客户端通过 WebSocket 发送问题，服务端基于向量检索结果流式返回 AI 回答。

WebSocket 消息格式为 JSON，包含请求参数 (`ChatCompletionRequest`) 和流式响应数据。

## 部署架构

```
+------------------+
|   Docker Compose |
|                  |
|  +------------+  |       +-----------------+
|  | Next.js    |  | <---> |   用户浏览器     |
|  | (前端)     |  |       +-----------------+
|  +------------+  |
|        |         |
|  +------------+  |       +-----------------+
|  | FastAPI    |  | <---> | AI 模型 API     |
|  | (后端)     |  |       | (云端/本地)      |
|  +------------+  |       +-----------------+
|        |         |
|  +------------+  |
|  | ~/.adalflow|  |  <-- 数据持久化卷
|  | (向量数据)  |  |
|  +------------+  |
+------------------+
```

- 推荐使用 Docker Compose 部署
- 健康检查端点: `/health`
- 支持通过 `DEEPWIKI_CONFIG_DIR` 环境变量自定义配置文件位置
- 数据持久化通过挂载 `~/.adalflow` 目录实现
