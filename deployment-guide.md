# DeepWiki Docker 部署指南

## 概述

DeepWiki 是一个全栈应用，包含 Python 后端 API 和 Next.js 前端，使用 Docker Compose 进行容器编排。本文档提供完整的 Docker 镜像更新和重新部署流程。

## 项目架构

- **后端**: Python FastAPI (端口: 8001)
- **前端**: Next.js (端口: 3000)
- **容器编排**: Docker Compose
- **可选**: Ollama 本地模型支持

## Docker 镜像更新和重新部署流程

### 1. 标准更新流程（推荐）

适用于生产环境或重要版本更新：

```bash
# 进入项目目录
cd /Users/fancyliu/ai_sourcecode_space/deepwiki-open

# 停止并删除当前容器
docker-compose down

# 重新构建镜像（不使用缓存，确保获取最新代码）
docker-compose build --no-cache

# 启动新容器
docker-compose up -d
```

### 2. 快速更新流程（开发迭代）

适用于开发环境的频繁更新：

```bash
# 停止当前容器
docker-compose down

# 重新构建镜像（使用缓存加速）
docker-compose build

# 启动容器
docker-compose up -d
```

### 3. 分步骤更新流程（便于调试）

当需要详细控制每个步骤时：

```bash
# 1. 停止容器
docker-compose stop

# 2. 删除容器（保留数据卷）
docker-compose rm -f

# 3. 删除旧镜像（可选，节省空间）
docker image prune -f

# 4. 重新构建镜像
docker-compose build --no-cache

# 5. 启动服务
docker-compose up -d

# 6. 查看服务状态
docker-compose ps
docker-compose logs -f
```

### 4. 使用 Ollama 本地版本

如果您使用本地 Ollama 版本：

```bash
# 停止当前服务
docker-compose down

# 使用 Ollama 本地版本的 Dockerfile 构建
docker build -f Dockerfile-ollama-local -t deepwiki-ollama:latest .

# 修改 docker-compose.yml 或创建新的 compose 文件
# 将 dockerfile: Dockerfile 改为 dockerfile: Dockerfile-ollama-local

# 重新启动
docker-compose up -d
```

## 健康检查和验证

### 检查容器状态

```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs deepwiki

# 实时查看日志
docker-compose logs -f deepwiki

# 检查健康状态
docker-compose exec deepwiki curl -f http://localhost:8001/health
```

### 访问应用

- **前端**: http://localhost:3000
- **API**: http://localhost:8001
- **健康检查**: http://localhost:8001/health

## 数据持久化

项目配置了以下数据持久化：

- `~/.adalflow:/root/.adalflow` - 持久化仓库和嵌入数据
- `./api/logs:/app/api/logs` - 持久化日志文件

这些数据在容器重新部署时会保留，无需担心数据丢失。

## 环境变量配置

### 必需的环境变量

确保在项目根目录有 `.env` 文件：

```bash
# 检查环境文件
ls -la .env

# 如果不存在，创建 .env 文件
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
PORT=8001
LOG_LEVEL=INFO
LOG_FILE_PATH=api/logs/application.log
EOF
```

### 环境变量说明

- `OPENAI_API_KEY`: OpenAI API 密钥（必需）
- `GOOGLE_API_KEY`: Google API 密钥（必需）
- `PORT`: API 服务端口（默认: 8001）
- `LOG_LEVEL`: 日志级别（INFO, DEBUG, WARNING, ERROR）
- `LOG_FILE_PATH`: 日志文件路径

## 常用部署命令

### 快速命令

```bash
# 快速重启（无代码变更）
docker-compose restart

# 完整更新（有代码变更）
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# 后台启动
docker-compose up -d

# 前台启动（查看日志）
docker-compose up

# 停止服务
docker-compose down

# 停止并删除所有相关资源
docker-compose down -v --rmi all
```

### 监控和调试

```bash
# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f deepwiki

# 进入容器调试
docker-compose exec deepwiki /bin/bash

# 查看容器资源使用
docker stats $(docker-compose ps -q)
```

## 故障排除

### 端口冲突

```bash
# 检查端口占用
sudo lsof -i :3000 -i :8001

# 杀死占用端口的进程
sudo kill -9 <PID>

# 或者修改 docker-compose.yml 中的端口映射
```

### 构建失败

```bash
# 清理 Docker 缓存
docker system prune -a
docker builder prune

# 重新构建
docker-compose build --no-cache
```

### 容器启动失败

```bash
# 查看详细错误信息
docker-compose logs deepwiki

# 检查环境变量
docker-compose exec deepwiki env | grep -E "(OPENAI|GOOGLE|PORT)"

# 检查文件权限
docker-compose exec deepwiki ls -la /app
```

### 网络问题

```bash
# 重新创建网络
docker-compose down
docker network prune
docker-compose up -d
```

## 性能优化

### 资源限制

项目已配置内存限制：
- `mem_limit: 6g` - 最大内存使用量
- `mem_reservation: 2g` - 内存预留量

### 构建优化

- 使用多阶段构建减少镜像大小
- Node.js 构建时增加内存限制: `NODE_OPTIONS="--max-old-space-size=4096"`
- 禁用 Next.js 遥测: `NEXT_TELEMETRY_DISABLED=1`

## 生产环境部署建议

1. **使用环境变量文件**: 不要将敏感信息硬编码在 Dockerfile 中
2. **定期备份数据**: 备份 `~/.adalflow` 目录
3. **监控日志**: 定期检查 `./api/logs` 中的日志文件
4. **健康检查**: 利用内置的健康检查功能监控服务状态
5. **资源监控**: 监控容器的 CPU 和内存使用情况

## 更新最佳实践

1. **代码变更后**: 使用 `--no-cache` 重新构建
2. **依赖更新后**: 清理 Docker 缓存后重新构建
3. **配置变更后**: 重新启动容器即可
4. **定期维护**: 清理未使用的镜像和容器

```bash
# 定期清理
docker system prune -f
docker image prune -a
```
