# API 合约文档

本文档描述 DeepWiki-Open 项目的所有 API 端点，包括后端 FastAPI 服务和前端 Next.js 代理路由。

---

## 后端 API (FastAPI, 端口 8001)

### POST /chat/completions/stream - 流式聊天

基于 RAG 检索增强生成的流式聊天补全接口，支持深度研究模式。

- **Content-Type**: `application/json` | **Accept**: `text/event-stream`
- **请求体**: `ChatCompletionRequest` (详见数据模型章节)
- **响应**: SSE 流式文本 (`text/event-stream`)
- **错误码**: `400` 无消息或末条消息非用户, `500` 检索器准备失败

### GET /models/config - 模型配置

返回所有可用的 AI 模型提供商及其模型列表。响应模型: `ModelConfig`

```json
{
  "providers": [
    { "id": "google", "name": "Google", "models": [{ "id": "gemini-2.5-flash", "name": "gemini-2.5-flash" }], "supportsCustomModel": true }
  ],
  "defaultProvider": "google"
}
```

### GET /health - 健康检查

- **响应**: `{ "status": "healthy", "timestamp": "ISO8601", "service": "deepwiki-api" }`

### GET /auth/status - 认证状态

- **响应**: `{ "auth_required": boolean }`

### POST /auth/validate - 认证验证

- **请求体**: `{ "code": "your_secret_code" }`
- **响应**: `{ "success": boolean }`

### GET /api/processed_projects - 已处理项目列表

列出 Wiki 缓存目录中所有已处理的项目。响应模型: `List[ProcessedProjectEntry]`

```json
[{
  "id": "deepwiki_cache_github_AsyncFuncAI_deepwiki-open_en.json",
  "owner": "AsyncFuncAI", "repo": "deepwiki-open",
  "name": "AsyncFuncAI/deepwiki-open", "repo_type": "github",
  "submittedAt": 1707500000000, "language": "en"
}]
```

### GET /api/wiki_cache - 获取 Wiki 缓存

- **查询参数**: `owner` (必填), `repo` (必填), `repo_type` (必填), `language` (必填)
- **响应模型**: `WikiCacheData | null` (未找到时返回 `200` + `null`)

### POST /api/wiki_cache - 保存 Wiki 缓存

- **请求体**: `WikiCacheRequest`

```json
{
  "repo": { "owner": "AsyncFuncAI", "repo": "deepwiki-open", "type": "github" },
  "language": "en",
  "wiki_structure": { "id": "", "title": "", "description": "", "pages": [] },
  "generated_pages": {}, "provider": "google", "model": "gemini-2.5-flash"
}
```

- **响应**: `{ "message": "Wiki cache saved successfully" }` | **错误码**: `500`

### DELETE /api/wiki_cache - 删除 Wiki 缓存

- **查询参数**: `owner`, `repo`, `repo_type`, `language` (均必填), `authorization_code` (可选)
- **错误码**: `400` 不支持的语言, `401` 授权码无效, `404` 缓存不存在, `500` 删除失败

### WebSocket /ws/chat - 流式聊天 (WebSocket)

通过 WebSocket 进行流式聊天补全，替代 HTTP 流式端点。

- **连接**: `ws://localhost:8001/ws/chat`
- **发送**: JSON 格式的 `ChatCompletionRequest`
- **接收**: 逐段文本流式响应; 错误时发送 `"Error: ..."` 后关闭连接
- **关闭**: 响应完成后服务端主动关闭

### POST /export/wiki - 导出 Wiki

- **请求体**: `{ "repo_url": "string", "pages": WikiPage[], "format": "markdown" | "json" }`
- **响应**: 文件下载 (`text/markdown` 或 `application/json`)，带 `Content-Disposition` 头

---

## 前端 API 路由 (Next.js 代理)

所有前端路由均代理到后端 FastAPI 服务 (`SERVER_BASE_URL` 或 `http://localhost:8001`)。

| 前端路由 | 方法 | 代理目标 | 说明 |
| --- | --- | --- | --- |
| `/api/chat/stream` | POST | `/chat/completions/stream` | HTTP 回退方案，主要通信走 WebSocket |
| `/api/models/config` | GET | `/models/config` | 透传模型配置 |
| `/api/auth/status` | GET | `/auth/status` | 透传认证状态 |
| `/api/auth/validate` | POST | `/auth/validate` | 透传认证验证，请求体: `{ "code": "string" }` |
| `/api/wiki/projects` | GET | `/api/processed_projects` | 透传项目列表，错误码: `503` |
| `/api/wiki/projects` | DELETE | `/api/wiki_cache` | 请求体见下方，错误码: `400` / `500` |

DELETE `/api/wiki/projects` 请求体:

```json
{ "owner": "string", "repo": "string", "repo_type": "string", "language": "string" }
```

---

## 数据模型

### ChatMessage

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `role` | `string` | 消息角色: `user` / `assistant` |
| `content` | `string` | 消息内容 |

### ChatCompletionRequest

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `repo_url` | `string` | 是 | - | 仓库 URL |
| `messages` | `ChatMessage[]` | 是 | - | 聊天消息列表 |
| `filePath` | `string?` | 否 | `null` | 仓库中的文件路径 |
| `token` | `string?` | 否 | `null` | 私有仓库访问令牌 |
| `type` | `string` | 否 | `"github"` | 仓库类型 (github/gitlab/bitbucket) |
| `provider` | `string` | 否 | `"google"` | AI 提供商 (google/openai/openrouter/ollama/bedrock/azure/dashscope) |
| `model` | `string?` | 否 | `null` | 模型名称 |
| `language` | `string` | 否 | `"en"` | 内容语言 (en/ja/zh/es/kr/vi) |
| `excluded_dirs` | `string?` | 否 | `null` | 排除目录 (换行分隔) |
| `excluded_files` | `string?` | 否 | `null` | 排除文件模式 (换行分隔) |
| `included_dirs` | `string?` | 否 | `null` | 仅包含目录 (换行分隔) |
| `included_files` | `string?` | 否 | `null` | 仅包含文件模式 (换行分隔) |

### ProcessedProjectEntry

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 缓存文件名 |
| `owner` | `string` | 仓库所有者 |
| `repo` | `string` | 仓库名称 |
| `name` | `string` | 显示名称 (owner/repo) |
| `repo_type` | `string` | 仓库类型 |
| `submittedAt` | `int` | 时间戳 (毫秒) |
| `language` | `string` | Wiki 语言 |

### ModelConfig / Provider / Model

| 模型 | 字段 | 类型 | 说明 |
| --- | --- | --- | --- |
| Model | `id` / `name` | `string` | 模型标识符 / 显示名称 |
| Provider | `id` / `name` | `string` | 提供商标识符 / 显示名称 |
| Provider | `models` | `Model[]` | 可用模型列表 |
| Provider | `supportsCustomModel` | `boolean` | 是否支持自定义模型 |
| ModelConfig | `providers` | `Provider[]` | 提供商列表 |
| ModelConfig | `defaultProvider` | `string` | 默认提供商 ID |

### AuthorizationConfig

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | `string` | 授权码 |

---

## 错误处理

后端错误格式: `{ "detail": "错误描述" }` | 前端代理错误格式: `{ "error": "错误描述" }`

| 状态码 | 含义 |
| --- | --- |
| `200` | 请求成功 |
| `400` | 请求参数错误 (缺少必填字段、格式不正确) |
| `401` | 授权码无效 (认证模式下) |
| `404` | 资源不存在 (缓存未找到) |
| `500` | 服务器内部错误 |
| `503` | 后端服务不可用 (前端代理无法连接后端) |
