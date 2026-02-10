# DeepWiki-Open 项目文档

本目录包含 DeepWiki-Open 项目的完整中文技术文档，涵盖项目概览、架构设计、开发指南、部署说明等内容。

---

## 📚 文档导航

| 文档 | 说明 | 适合人群 |
|------|------|----------|
| [项目概览](./project-overview.md) | 项目简介、核心功能、技术栈、仓库结构 | 所有人 |
| [系统架构](./architecture.md) | 前后端架构、RAG 管道、AI 模型集成、数据流 | 架构师、开发者 |
| [源码树分析](./source-tree-analysis.md) | 完整目录树（带注释）、模块结构、入口点 | 开发者 |
| [组件清单](./component-inventory.md) | 前端组件、后端模块、依赖关系图 | 开发者 |
| [API 合约](./api-contracts.md) | REST/WebSocket 端点、数据模型、错误处理 | API 使用者、前端开发者 |
| [部署指南](./deployment-guide.md) | Docker 部署、CI/CD、数据持久化、故障排除 | 运维人员、部署者 |
| [开发指南](./development-guide.md) | 环境搭建、本地开发、构建、测试、常见任务 | 开发者 |

---

## 🚀 快速开始

### 我是新手，想了解这个项目
1. 阅读 [项目概览](./project-overview.md) 了解项目定位和核心功能
2. 查看 [系统架构](./architecture.md) 理解技术架构
3. 浏览 [源码树分析](./source-tree-analysis.md) 熟悉代码结构

### 我想部署这个项目
1. 阅读 [部署指南](./deployment-guide.md) 了解 Docker 部署流程
2. 参考 [项目概览](./project-overview.md) 中的技术栈要求
3. 遇到问题查看 [部署指南](./deployment-guide.md) 的故障排除章节

### 我想参与开发
1. 按照 [开发指南](./development-guide.md) 搭建本地开发环境
2. 阅读 [源码树分析](./source-tree-analysis.md) 和 [组件清单](./component-inventory.md) 了解代码组织
3. 查看 [系统架构](./architecture.md) 理解数据流和模块交互
4. 参考 [API 合约](./api-contracts.md) 了解前后端接口

### 我想集成 API
1. 阅读 [API 合约](./api-contracts.md) 了解所有端点和数据模型
2. 查看 [系统架构](./architecture.md) 中的通信协议章节
3. 参考 [部署指南](./deployment-guide.md) 部署后端服务

---

## 📖 文档详细说明

### [项目概览](./project-overview.md) (117 行)
- **内容**: 项目简介、核心功能（AI 文档生成、RAG 问答、多模型支持）、技术栈摘要、架构类型、完整仓库结构
- **适合**: 第一次接触项目的人，想快速了解项目全貌

### [系统架构](./architecture.md) (247 行)
- **内容**: 前后端分离架构、Next.js App Router、FastAPI 应用、多 AI 提供商适配器、RAG 检索管道、数据处理流程、WebSocket 通信、部署架构
- **适合**: 需要深入理解系统设计的开发者和架构师

### [源码树分析](./source-tree-analysis.md) (203 行)
- **内容**: 项目根目录文件说明、完整目录树（每个文件都有中文注释）、前端结构（app/components/contexts/hooks/utils）、后端结构（核心文件/AI 客户端/配置）、入口点说明
- **适合**: 需要快速定位代码文件的开发者

### [组件清单](./component-inventory.md) (162 行)
- **内容**: 11 个前端组件详细说明（行数、功能、Props、依赖）、16 个后端模块说明、组件依赖关系图
- **适合**: 需要修改或扩展组件的前端开发者

### [API 合约](./api-contracts.md) (187 行)
- **内容**: 10 个后端 REST/WebSocket 端点、6 个前端代理路由、完整数据模型定义（ChatMessage、ChatCompletionRequest、ProcessedProjectEntry 等）、错误处理规范
- **适合**: API 使用者、前端开发者、集成开发者

### [部署指南](./deployment-guide.md) (196 行)
- **内容**: Docker 部署步骤、环境变量配置、Dockerfile 多阶段构建详解、Ollama 本地版、GitHub Actions CI/CD、数据持久化、更新流程、健康检查、故障排除
- **适合**: 运维人员、部署工程师

### [开发指南](./development-guide.md) (282 行)
- **内容**: 前置条件、环境搭建（前后端依赖安装）、本地开发（热重载配置）、构建与部署、代码规范（ESLint/TypeScript/Python）、pytest 测试、常见开发任务（添加模型/修改 UI/添加 API）、故障排除
- **适合**: 参与项目开发的工程师

---

## 🔗 相关资源

- **项目主页**: [GitHub - AsyncFuncAI/deepwiki-open](https://github.com/AsyncFuncAI/deepwiki-open)
- **README**: [../README.md](../README.md) (英文) | [../README.zh.md](../README.zh.md) (中文)
- **CLAUDE.md**: [../CLAUDE.md](../CLAUDE.md) (项目上下文文档)
- **许可证**: [../LICENSE](../LICENSE) (MIT License)

---

## 📝 文档维护

这些文档基于项目实际代码生成，涵盖以下源文件：
- 前端：`package.json`、`next.config.ts`、`src/` 目录下所有组件和页面
- 后端：`api/pyproject.toml`、`api/` 目录下所有 Python 模块
- 配置：`docker-compose.yml`、`Dockerfile`、`.github/workflows/`、`api/config/` 下的 JSON 配置
- 测试：`pytest.ini`、`test/` 和 `tests/` 目录

如需更新文档，请确保与实际代码保持同步。

---

**文档生成日期**: 2026-02-10
**项目版本**: 基于 commit `b1a602f` (feature/update-openrouter-models 分支)
