# 组件清单

> DeepWiki-Open 项目模块与组件总览。前端共 3391 行 TSX 组件代码，后端共约 7800 行 Python 代码。

---

## 前端组件 (src/components/)

### Ask.tsx
- **行数**: 928
- **功能描述**: RAG 问答界面组件。支持用户向仓库代码提问，通过 WebSocket 实时接收 AI 流式回答，并支持深度研究模式（多轮迭代研究）。
- **主要 Props**: 无独立 Props 接口（内部管理状态），依赖 `RepoInfo` 类型。
- **依赖关系**: `Markdown`, `ModelSelectionModal`, `LanguageContext`, `websocketClient`, `getRepoUrl`

### Markdown.tsx
- **行数**: 207
- **功能描述**: Markdown 渲染组件。支持 GFM 语法、代码高亮、Mermaid 图表渲染，以及 ReAct 风格标题的特殊样式。
- **主要 Props**: `content: string`
- **依赖关系**: `react-markdown`, `remark-gfm`, `rehype-raw`, `react-syntax-highlighter`, `Mermaid`

### Mermaid.tsx
- **行数**: 490
- **功能描述**: Mermaid 图表渲染组件。初始化 mermaid 库并渲染各类图表（流程图、时序图等），支持 SVG 缩放平移（svg-pan-zoom），采用日式美学主题样式。
- **主要 Props**: `chart: string`（Mermaid 图表定义文本）
- **依赖关系**: `mermaid`, `svg-pan-zoom`（动态导入）

### ConfigurationModal.tsx
- **行数**: 298
- **功能描述**: 配置模态框。用于在主页面生成 Wiki 前配置仓库参数，包括语言选择、Wiki 类型、模型选择、访问令牌等。
- **主要 Props**: `isOpen`, `onClose`, `repositoryInput`, `selectedLanguage`, `setSelectedLanguage`, `isComprehensiveView`, `setIsComprehensiveView`, `provider`, `setProvider`, `model`, `setModel`, `isCustomModel`, `setIsCustomModel` 等
- **依赖关系**: `LanguageContext`, `UserSelector`, `TokenInput`

### ModelSelectionModal.tsx
- **行数**: 259
- **功能描述**: 模型选择模态框。在 Ask 问答界面中使用，允许用户切换 AI 提供商和模型，配置文件过滤规则和 Wiki 类型。
- **主要 Props**: `isOpen`, `onClose`, `provider`, `setProvider`, `model`, `setModel`, `isCustomModel`, `setIsCustomModel`, `customModel`, `setCustomModel`, `onApply`, `isComprehensiveView`, `setIsComprehensiveView`, `excludedDirs?`, `excludedFiles?` 等
- **依赖关系**: `LanguageContext`, `UserSelector`, `WikiTypeSelector`, `TokenInput`

### WikiTreeView.tsx
- **行数**: 183
- **功能描述**: Wiki 目录树视图组件。以树形结构展示 Wiki 的章节和页面层级，支持折叠/展开，点击导航到对应页面。
- **主要 Props**: 内部定义 `WikiPage`, `WikiSection`, `WikiStructure` 接口，接收 Wiki 结构数据和选中回调。
- **依赖关系**: `react-icons/fa`（FaChevronRight, FaChevronDown）

### ProcessedProjects.tsx
- **行数**: 270
- **功能描述**: 已处理项目列表组件。展示已生成 Wiki 的仓库项目，支持网格/列表视图切换、搜索过滤和删除操作。
- **主要 Props**: `showHeader?: boolean`, `maxItems?: number`, `className?: string`, `messages?: Record<string, Record<string, string>>`
- **依赖关系**: `next/link`, `react-icons/fa`（FaTimes, FaTh, FaList）

### TokenInput.tsx
- **行数**: 107
- **功能描述**: 访问令牌输入组件。允许用户选择代码托管平台（GitHub/GitLab/Bitbucket）并输入对应的访问令牌。
- **主要 Props**: `selectedPlatform`, `setSelectedPlatform`, `accessToken`, `setAccessToken`, `showTokenSection?`, `onToggleTokenSection?`, `allowPlatformChange?`
- **依赖关系**: `LanguageContext`

### UserSelector.tsx
- **行数**: 522
- **功能描述**: AI 模型提供商和模型选择器组件。从后端获取模型配置，展示提供商列表和对应模型，支持自定义模型输入。
- **主要 Props**: `provider`, `setProvider`, `model`, `setModel`, `isCustomModel`, `setIsCustomModel`, `customModel`, `setCustomModel`
- **依赖关系**: `LanguageContext`

### WikiTypeSelector.tsx
- **行数**: 78
- **功能描述**: Wiki 类型选择器。提供"综合视图"和"简洁视图"两种 Wiki 生成模式的切换按钮。
- **主要 Props**: `isComprehensiveView: boolean`, `setIsComprehensiveView: (value: boolean) => void`
- **依赖关系**: `LanguageContext`, `react-icons/fa`（FaBookOpen, FaList）

### theme-toggle.tsx
- **行数**: 49
- **功能描述**: 主题切换按钮。在亮色/暗色模式之间切换，使用日式风格的太阳/月亮 SVG 图标。
- **主要 Props**: 无（内部使用 `useTheme` hook）
- **依赖关系**: `next-themes`

---

## Contexts (src/contexts/)

### LanguageContext.tsx (202 行)
- **功能描述**: 国际化语言上下文。提供 `LanguageProvider` 和 `useLanguage` hook，管理当前语言状态、翻译消息加载、浏览器语言自动检测，支持 localStorage 持久化。
- **导出**: `LanguageProvider`, `useLanguage`
- **状态**: `language`, `messages`, `supportedLanguages`

---

## Hooks (src/hooks/)

### useProcessedProjects.ts (46 行)
- **功能描述**: 自定义 Hook，从 `/api/wiki/projects` 接口获取已处理的项目列表。
- **返回值**: `{ projects, isLoading, error }`
- **依赖关系**: 无外部组件依赖

---

## 工具函数 (src/utils/)

### websocketClient.ts (85 行)
- **功能描述**: WebSocket 客户端封装。将 HTTP 基础 URL 转换为 WebSocket URL，提供 `createChatWebSocket` 和 `closeWebSocket` 方法，用于 RAG 问答的流式通信。
- **导出**: `ChatMessage`, `ChatCompletionRequest`, `createChatWebSocket`, `closeWebSocket`

### urlDecoder.tsx (18 行)
- **功能描述**: URL 解析工具函数。提供 `extractUrlDomain`（提取域名）和 `extractUrlPath`（提取路径）两个函数。
- **导出**: `extractUrlDomain`, `extractUrlPath`

### getRepoUrl.tsx (16 行)
- **功能描述**: 仓库 URL 生成工具。根据 `RepoInfo` 对象返回对应的仓库 URL，支持本地路径和远程仓库。
- **导出**: `getRepoUrl`（默认导出）

---

## 后端模块 (api/)

| 模块 | 功能描述 |
|------|----------|
| `main.py` | 78 | 应用入口，加载环境变量，配置日志，启动 uvicorn 服务器 |
| `api.py` | 634 | FastAPI 路由定义，包含 Wiki 生成、项目管理、健康检查等 HTTP 端点 |
| `websocket_wiki.py` | 915 | WebSocket 端点，处理 Wiki 实时生成和聊天流式响应 |
| `simple_chat.py` | 751 | 简单聊天功能，处理非 RAG 模式的 AI 对话请求 |
| `data_pipeline.py` | 928 | 数据处理管道，负责仓库克隆、代码分割、向量嵌入创建 |
| `rag.py` | 445 | RAG 检索增强生成，基于向量相似度检索代码上下文并生成回答 |
| `config.py` | 412 | 配置管理，加载 generator/embedder/repo JSON 配置，注册各 AI 客户端 |
| `prompts.py` | 191 | 提示词模板集合，包含 RAG 系统提示词和 Wiki 生成提示词 |
| `openai_client.py` | 629 | OpenAI API 客户端，支持 GPT 系列模型调用和流式输出 |
| `openrouter_client.py` | 525 | OpenRouter API 客户端，统一访问 Claude/Llama 等多种模型 |
| `bedrock_client.py` | 473 | AWS Bedrock 客户端，支持 AWS 托管的 AI 模型调用 |
| `azureai_client.py` | 487 | Azure OpenAI 客户端，支持 Azure 部署的 OpenAI 模型 |
| `dashscope_client.py` | 928 | 阿里云 DashScope 客户端，支持通义千问等模型 |
| `google_embedder_client.py` | 259 | Google AI 嵌入客户端，用于文本向量化 |
| `ollama_patch.py` | 104 | Ollama 本地模型补丁，处理本地开源模型的文档嵌入 |
| `logging_config.py` | 85 | 日志配置模块，支持日志轮转和文件变更检测过滤 |

---

## 组件依赖关系图

```
页面层 (src/app/)
  |
  +-- page.tsx (主页)
  |     +-- ConfigurationModal
  |     |     +-- UserSelector (模型选择)
  |     |     +-- TokenInput (令牌输入)
  |     +-- ProcessedProjects (项目列表)
  |     +-- WikiTypeSelector (Wiki类型)
  |
  +-- [owner]/[repo]/page.tsx (Wiki展示页)
        +-- WikiTreeView (目录树)
        +-- Markdown (内容渲染)
        |     +-- Mermaid (图表渲染)
        +-- Ask (RAG问答面板)
              +-- Markdown (回答渲染)
              +-- ModelSelectionModal
              |     +-- UserSelector
              |     +-- WikiTypeSelector
              |     +-- TokenInput
              +-- websocketClient (WebSocket通信)

全局依赖:
  LanguageContext --> 被几乎所有组件使用 (国际化)
  theme-toggle --> 独立于 next-themes，在布局层使用
  getRepoUrl / urlDecoder --> 被页面和 Ask 组件使用
```
