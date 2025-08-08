# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

DeepWiki-Open 是一个AI驱动的Wiki生成工具，能为GitHub、GitLab、BitBucket代码仓库自动生成美观的交互式文档。项目采用前后端分离架构：
- 前端：Next.js 15 + React 19 + TailwindCSS 4，支持多语言和暗黑模式
- 后端：FastAPI + Python，处理代码分析、AI生成和RAG问答

## 开发命令

### 前端开发
```bash
# 安装依赖
npm install
# 或
yarn install

# 开发模式启动
npm run dev
# 或
yarn dev

# 生产构建
npm run build

# 代码规范检查
npm run lint
```

### 后端开发  
```bash
# 安装Python依赖
pip install -r api/requirements.txt

# 启动API服务器
python -m api.main
```

### Docker部署
```bash
# 使用docker-compose启动
docker-compose up

# 重建并启动
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## 核心架构

### 前端架构 (Next.js App Router)
- `src/app/` - Next.js App Router页面
  - `page.tsx` - 主页面，处理仓库输入和Wiki生成
  - `[owner]/[repo]/page.tsx` - 动态Wiki展示页面
  - `layout.tsx` - 全局布局，配置字体和主题提供者
- `src/components/` - React组件
  - `ConfigurationModal.tsx` - 配置模态框（模型选择、访问令牌等）
  - `Mermaid.tsx` - Mermaid图表渲染组件
  - `Markdown.tsx` - Markdown渲染组件
  - `Ask.tsx` - RAG问答界面组件
- `src/contexts/LanguageContext.tsx` - 国际化语言上下文
- `src/messages/` - 多语言翻译文件

### 后端架构 (FastAPI)
- `api/main.py` - API服务器入口点
- `api/api.py` - FastAPI应用和路由定义
- `api/rag.py` - RAG检索增强生成实现
- `api/data_pipeline.py` - 数据处理管道
- `api/config/` - 配置文件目录
  - `generator.json` - LLM模型配置
  - `embedder.json` - 嵌入模型配置
  - `repo.json` - 仓库过滤规则配置

### AI模型支持
项目支持多种AI提供商：
- Google Gemini (默认：gemini-2.0-flash)
- OpenAI (默认：gpt-4o)
- OpenRouter (统一API访问Claude、Llama等)
- Ollama (本地开源模型)

## 环境变量配置

创建`.env`文件并设置：
```
# 必需：用于嵌入功能
OPENAI_API_KEY=your_openai_api_key

# 可选：根据使用的模型选择
GOOGLE_API_KEY=your_google_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# 服务器配置
PORT=8001
SERVER_BASE_URL=http://localhost:8001

# 授权模式（可选）
DEEPWIKI_AUTH_MODE=false
DEEPWIKI_AUTH_CODE=your_secret_code

# 日志配置
LOG_LEVEL=INFO
LOG_FILE_PATH=api/logs/application.log
```

## 关键功能实现

### Wiki生成流程
1. 用户输入仓库URL -> 前端验证格式
2. 配置模型和访问令牌 -> ConfigurationModal组件
3. 后端克隆仓库并创建嵌入 -> data_pipeline.py
4. AI生成文档和图表 -> 各AI客户端
5. 前端渲染Wiki页面 -> Markdown和Mermaid组件

### RAG问答系统
- 基于仓库代码创建向量数据库
- 用户提问通过相似度搜索检索相关代码
- AI基于检索到的上下文生成准确回答
- 支持深度研究模式(多轮研究迭代)

### 多语言国际化
- 使用React Context管理语言状态
- 翻译文件存储在`src/messages/`
- 支持英文、中文、日文、韩文、西班牙文、越南文

## 测试和部署注意事项

- 项目未配置自动化测试框架，依赖手动测试
- 生产部署推荐使用Docker，已配置多架构构建
- 数据持久化通过挂载`~/.adalflow`目录实现
- 健康检查端点：`/health`，用于Docker容器监控
- 支持通过`DEEPWIKI_CONFIG_DIR`自定义配置文件位置

## 常见开发任务

### 添加新的AI模型提供商
1. 在`api/config/generator.json`中添加新提供商配置
2. 创建对应的客户端类（参考`openai_client.py`）
3. 在前端`ConfigurationModal.tsx`中添加选项

### 修改UI组件样式
- 使用TailwindCSS 4和CSS变量进行主题管理
- 暗黑/亮色模式通过`data-theme`属性切换
- 全局样式定义在`src/app/globals.css`

### 调试API问题
- 检查`api/logs/application.log`日志文件
- 使用`LOG_LEVEL=DEBUG`获取详细日志
- 前端开发工具网络面板查看API调用