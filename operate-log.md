# 操作日志

## 2024-12-29 - Docker 部署文档创建和 README 更新

### 操作内容
1. **创建详细的 Docker 部署文档** (`deployment-guide.md`)
   - 包含完整的 Docker 镜像更新和重新部署流程
   - 提供多种部署场景（标准更新、快速更新、分步更新）
   - 添加健康检查和验证指导
   - 包含数据持久化说明
   - 提供故障排除和性能优化建议

2. **更新中文版 README** (`README.zh.md`)
   - 在"🤝 贡献"章节前添加"🐳 Docker 部署更新"章节
   - 包含开发迭代后更新部署的简要指导
   - 提供标准更新和快速更新流程
   - 添加部署状态检查命令
   - 引用详细部署文档链接

3. **更新英文版 README** (`README.md`)
   - 在"🤝 Contributing"章节前添加"🐳 Docker Deployment Updates"章节
   - 提供与中文版对应的英文部署指导
   - 包含相同的部署流程和检查命令
   - 添加详细部署文档的引用链接

### 涉及文件
- ✅ `deployment-guide.md` - 新建详细部署文档
- ✅ `README.zh.md` - 添加部署章节 
- ✅ `README.md` - 添加部署章节
- ✅ `operate-log.md` - 本操作日志文件

### 用户需求
- **原始需求**: 将 Docker 部署内容保存到 deployment.md 文档中
- **扩展需求**: 在 README 文档中增加新章节并简要总结部署内容
- **完成情况**: ✅ 已完全满足用户需求

### 技术要点
- 项目使用 Docker Compose 进行容器编排
- 包含 Python 后端 (端口 8001) 和 Next.js 前端 (端口 3000)
- 支持 Ollama 本地模型版本 (`Dockerfile-ollama-local`)
- 配置了数据持久化（`~/.adalflow` 和 `./api/logs`）
- 内置健康检查功能

### 部署命令摘要
```bash
# 标准更新流程
docker-compose down
docker-compose build --no-cache  
docker-compose up -d

# 快速更新
docker-compose down && docker-compose build && docker-compose up -d

# 状态检查
docker-compose ps
docker-compose logs -f deepwiki
curl -f http://localhost:8001/health
```

### 注意事项
- 确保 `.env` 文件包含必要的 API 密钥
- 数据持久化配置确保重部署不会丢失数据
- 支持 Ollama 本地模式和云端模式两种部署方式
- 提供了完整的故障排除指导

### 文档结构优化
- 创建了独立的部署文档便于维护
- 在 README 中提供简洁的快速指导
- 通过链接连接详细文档，保持文档层次清晰
- 中英文版本保持内容一致性

## 2024-12-29 - 文件重命名操作

### 操作内容
1. **重命名文档文件**
   - `operateLog.md` → `operate-log.md`
   - `deployment.md` → `deployment-guide.md`

2. **更新引用链接**
   - 更新 `README.zh.md` 中的部署文档引用
   - 更新 `README.md` 中的部署文档引用

### 文件变更
- ✅ `operate-log.md` - 重命名操作日志文件
- ✅ `deployment-guide.md` - 重命名部署指南文件
- ✅ `README.zh.md` - 更新引用链接
- ✅ `README.md` - 更新引用链接

---

*记录项目文档的所有操作变更*
