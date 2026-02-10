# DeepWiki-Open 项目概览

## 项目简介

DeepWiki-Open 是一个 AI 驱动的 Wiki 生成工具，能够为任何 GitHub、GitLab 或 BitBucket 代码仓库自动生成美观的交互式文档。用户只需输入仓库地址，DeepWiki 即可自动分析代码结构、生成全面的技术文档、创建可视化架构图表，并将所有内容整理成易于导航的 Wiki 页面。

该项目解决了开源和企业项目中文档缺失或过时的痛点，通过 AI 技术将代码自动转化为结构化的知识库，大幅降低了文档编写和维护的成本。其核心价值在于：

- **零门槛文档生成**：无需手动编写，AI 自动理解代码并生成文档
- **交互式知识探索**：支持 RAG 智能问答，用户可以直接向代码库提问
- **多平台多模型兼容**：支持主流代码托管平台和多种 AI 模型提供商

## 核心功能

- **AI 驱动的代码仓库文档生成**：自动分析代码结构与关系，生成全面的技术文档
- **交互式 Wiki 导航**：简洁直观的树形导航界面，轻松浏览生成的 Wiki 内容
- **Mermaid 图表可视化**：自动生成架构图、数据流图等 Mermaid 图表，直观展示系统设计
- **RAG 智能问答**：基于仓库代码构建向量数据库，通过检索增强生成技术提供准确的代码问答
- **深度研究模式（DeepResearch）**：多轮迭代研究过程，深入调查复杂技术主题
- **多 AI 模型支持**：支持 7 个提供商 -- Google Gemini、OpenAI、OpenRouter、Ollama、AWS Bedrock、Azure OpenAI、Dashscope
- **多语言支持**：界面支持 10 种语言 -- 英文、简体中文、繁体中文、日文、韩文、西班牙文、越南文、巴西葡萄牙文、法文、俄文
- **私有仓库支持**：通过个人访问令牌（PAT）安全访问 GitHub、GitLab、BitBucket 私有仓库
- **Wiki 导出功能**：支持将生成的 Wiki 内容导出保存
- **幻灯片生成**：支持基于文档内容生成演示幻灯片

## 技术栈摘要

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 15 + React 19 + TailwindCSS 4 + TypeScript |
| 后端 | FastAPI + Python 3.11 + AdalFlow |
| AI 模型 | Google Gemini, OpenAI, OpenRouter, Ollama, AWS Bedrock, Azure OpenAI, Dashscope |
| 向量检索 | FAISS (faiss-cpu) |
| 嵌入模型 | OpenAI Embeddings / Google AI Embeddings / Ollama Embeddings |
| 包管理 | Yarn (前端) + Poetry (后端) |
| 部署 | Docker + Docker Compose + GitHub Actions |

## 架构类型

多部分项目：前端 (web) + 后端 (backend)，采用前后端分离架构。

- **前端**：基于 Next.js 15 App Router 构建的单页应用，负责用户交互、Wiki 页面渲染、Mermaid 图表展示和 RAG 问答界面
- **后端**：基于 FastAPI 构建的 API 服务，负责仓库克隆、代码分析、向量嵌入、AI 文档生成和 RAG 检索

前后端通过 REST API 和 WebSocket 通信，后端端口默认为 8001，前端端口默认为 3000。

## 仓库结构

```
deepwiki-open/
├── src/                          # 前端源码
│   ├── app/                      # Next.js App Router 页面
│   │   ├── page.tsx              # 主页面（仓库输入与 Wiki 生成）
│   │   ├── layout.tsx            # 全局布局（字体、主题）
│   │   ├── globals.css           # 全局样式
│   │   ├── [owner]/              # 动态路由 - 仓库 Wiki 展示
│   │   ├── wiki/                 # Wiki 相关页面
│   │   └── api/                  # Next.js API 路由
│   ├── components/               # React 组件
│   │   ├── ConfigurationModal.tsx  # 配置模态框（模型选择、令牌等）
│   │   ├── Mermaid.tsx           # Mermaid 图表渲染
│   │   ├── Markdown.tsx          # Markdown 渲染
│   │   ├── Ask.tsx               # RAG 问答界面
│   │   ├── WikiTreeView.tsx      # Wiki 树形导航
│   │   ├── ModelSelectionModal.tsx # 模型选择模态框
│   │   └── theme-toggle.tsx      # 暗黑/亮色主题切换
│   ├── contexts/                 # React Context
│   └── messages/                 # 多语言翻译文件 (10 种语言)
├── api/                          # 后端源码
│   ├── main.py                   # API 服务器入口点
│   ├── api.py                    # FastAPI 应用和路由定义
│   ├── rag.py                    # RAG 检索增强生成
│   ├── data_pipeline.py          # 数据处理管道
│   ├── prompts.py                # AI 提示词模板
│   ├── config.py                 # 配置管理
│   ├── websocket_wiki.py         # WebSocket Wiki 生成
│   ├── openai_client.py          # OpenAI 客户端
│   ├── openrouter_client.py      # OpenRouter 客户端
│   ├── azureai_client.py         # Azure OpenAI 客户端
│   ├── bedrock_client.py         # AWS Bedrock 客户端
│   ├── dashscope_client.py       # Dashscope 客户端
│   ├── google_embedder_client.py # Google 嵌入客户端
│   ├── config/                   # 配置文件目录
│   │   ├── generator.json        # LLM 模型配置
│   │   ├── embedder.json         # 嵌入模型配置
│   │   ├── repo.json             # 仓库过滤规则
│   │   └── lang.json             # 语言配置
│   └── pyproject.toml            # Python 项目与依赖配置
├── docs/                         # 项目文档
├── test/                         # 测试目录
├── tests/                        # 测试目录
├── screenshots/                  # 截图资源
├── public/                       # 前端静态资源
├── Dockerfile                    # Docker 构建文件
├── docker-compose.yml            # Docker Compose 编排
├── package.json                  # 前端依赖配置
├── tsconfig.json                 # TypeScript 配置
├── next.config.ts                # Next.js 配置
├── tailwind.config.js            # TailwindCSS 配置
├── .env                          # 环境变量（需自行创建）
└── README.md                     # 项目说明文档
```

## 许可证

MIT License

版权所有 (c) 2024 Sheing Ng。允许任何人免费获取本软件及相关文档的副本，可以不受限制地使用、复制、修改、合并、发布、分发、再许可和/或出售本软件的副本。

## 相关文档链接

- [项目扫描报告](./project-scan-report.json) -- 自动生成的项目扫描分析结果
- [Ollama 使用说明 (英文)](../Ollama-instruction.md) -- 使用 Ollama 本地模型的详细指南
- [Ollama 使用说明 (中文)](../Ollama-instruction.zh.md) -- Ollama 本地模型中文指南
- [部署指南](../deployment-guide.md) -- 生产环境部署说明
- [README (英文)](../README.md) -- 项目主说明文档
- [README (中文)](../README.zh.md) -- 项目中文说明文档
