# 使用DeepWiki和Ollama：初学者指南

DeepWiki通过Ollama支持本地AI模型，这非常适合您想要：

- 在本地运行一切而不依赖云端API
- 避免来自OpenAI或Google的API费用
- 在代码分析中获得更多隐私保护

## 步骤1：安装Ollama

### Windows系统
- 从[官方网站](https://ollama.com/download)下载Ollama
- 运行安装程序并按照屏幕上的指示操作
- 安装后，Ollama将在后台运行（检查您的系统托盘）

### macOS系统
- 从[官方网站](https://ollama.com/download)下载Ollama
- 打开下载的文件并将Ollama拖到您的应用程序文件夹
- 从应用程序文件夹启动Ollama

### Linux系统
- 运行以下命令：
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```

## 步骤2：下载所需模型

打开终端（Windows上的命令提示符或PowerShell）并运行：

```bash
ollama pull nomic-embed-text
ollama pull qwen3:1.7b
```

第一个命令下载DeepWiki用来理解您代码的嵌入模型。第二个命令下载一个小而强大的语言模型用于生成文档。

## 步骤3：设置DeepWiki

克隆DeepWiki仓库：
```bash
git clone https://github.com/flanliulf/deepwiki-open.git
cd deepwiki-open
```

在项目根目录创建`.env`文件：
```bash
# 使用Ollama本地时无需API密钥
PORT=8001
# 如果Ollama不在本地，可选择提供OLLAMA_HOST
OLLAMA_HOST=your_ollama_host # (默认: http://localhost:11434)
```

**Docker部署重要配置**：
如果您使用Docker部署，需要配置容器访问宿主机Ollama：
```bash
# Docker环境下访问宿主机Ollama的配置
OLLAMA_HOST=http://host.docker.internal:11434
```

启动后端：
```bash
pip install -r api/requirements.txt
python -m api.main
```

启动前端：
```bash
npm install
npm run dev
```

## 步骤4：使用DeepWiki与Ollama

1. 在浏览器中打开 http://localhost:3000
2. 输入GitHub、GitLab或Bitbucket仓库URL
3. 勾选使用"本地Ollama模型"选项
4. 点击"生成Wiki"

![Ollama选项](screenshots/Ollama.png)

## Docker部署方式

### 使用docker-compose（推荐）

1. 确保您的`.env`文件包含正确的Ollama配置：
   ```bash
   # Docker容器访问宿主机Ollama
   OLLAMA_HOST=http://host.docker.internal:11434
   ```

2. 启动服务：
   ```bash
   docker-compose up -d
   ```

3. 验证连接：
   ```bash
   # 测试Docker容器是否能连接到宿主机Ollama
   docker exec -it deepwiki-open-deepwiki-1 curl http://host.docker.internal:11434/api/tags
   ```

### 使用Dockerfile

1. 构建Docker镜像 `docker build -f Dockerfile-ollama-local -t deepwiki:ollama-local .`
2. 运行容器：
   ```bash
   # 常规使用
   docker run -p 3000:3000 -p 8001:8001 --name deepwiki \
     -v ~/.adalflow:/root/.adalflow \
     -e OLLAMA_HOST=http://host.docker.internal:11434 \
     deepwiki:ollama-local
   
   # 本地仓库分析
   docker run -p 3000:3000 -p 8001:8001 --name deepwiki \
     -v ~/.adalflow:/root/.adalflow \
     -e OLLAMA_HOST=http://host.docker.internal:11434 \
     -v /path/to/your/repo:/app/local-repos/repo-name \
     deepwiki:ollama-local
   ```

3. 在界面中使用本地仓库时：使用 `/app/local-repos/repo-name` 作为本地仓库路径。

4. 在浏览器中打开 http://localhost:3000

注意：对于Apple Silicon Mac，Dockerfile自动使用ARM64二进制文件以获得更好的性能。

## 工作原理

当您选择"使用本地Ollama"时，DeepWiki将：

1. 使用`nomic-embed-text`模型为您的代码创建嵌入向量
2. 使用`qwen3:1.7b`模型生成文档
3. 在您的机器上本地处理一切

## 故障排除

### "无法连接到Ollama服务器"
- 确保Ollama在后台运行。您可以在终端运行`ollama list`来检查。
- 验证Ollama运行在默认端口(11434)上
- 尝试重启Ollama

### Docker环境连接问题
如果在Docker容器中无法连接到Ollama：

1. **验证宿主机Ollama运行状态**：
   ```bash
   ollama list
   ```

2. **测试Docker容器网络连接**：
   ```bash
   docker exec -it <容器名> curl http://host.docker.internal:11434/api/tags
   ```

3. **检查环境变量配置**：
   确保`.env`文件包含：
   ```bash
   OLLAMA_HOST=http://host.docker.internal:11434
   ```

4. **查看容器日志**：
   ```bash
   docker-compose logs -f deepwiki
   ```

### 生成速度慢
- 本地模型通常比云端API慢。考虑使用较小的仓库或更强大的计算机。
- `qwen3:1.7b`模型针对速度和质量平衡进行了优化。更大的模型会更慢但可能产生更好的结果。

### 内存不足错误
- 如果遇到内存问题，尝试使用更小的模型，如`phi3:mini`而不是更大的模型。
- 运行Ollama时关闭其他占用大量内存的应用程序

## 高级：使用不同模型

如果您想尝试不同的模型，可以修改`api/config/generator.json`文件：

```json
"generator_ollama": {
    "model_client": "OllamaClient",
    "model_kwargs": {
        "model": "qwen3:1.7b",  // 将此处更改为其他模型
        "options": {
            "temperature": 0.7,
            "top_p": 0.8,
        }
    },
},
```

您可以将`"model": "qwen3:1.7b"`替换为您使用Ollama拉取的任何模型。有关可用模型列表，请访问[Ollama的模型库](https://ollama.com/library)或在终端运行`ollama list`。

同样，您可以更改嵌入模型：

```json
"embedder_ollama": {
    "model_client": "OllamaClient",
    "model_kwargs": {
        "model": "nomic-embed-text"  // 将此处更改为其他嵌入模型
    },
},
```

## 性能考虑

### 硬件要求

要在Ollama上获得最佳性能：
- **CPU**: 推荐4+核心
- **内存**: 最低8GB，推荐16GB+
- **存储**: 模型需要10GB+的可用空间
- **GPU**: 可选但强烈推荐用于更快的处理

### 模型选择指南

| 模型 | 大小 | 速度 | 质量 | 使用场景 |
|------|------|------|------|----------|
| phi3:mini | 1.3GB | 快 | 良好 | 小项目，快速测试 |
| qwen3:1.7b | 3.8GB | 中等 | 更好 | 默认，良好平衡 |
| llama3:8b | 8GB | 慢 | 最佳 | 复杂项目，详细分析 |

## 限制

使用Ollama与DeepWiki时：

1. **无互联网访问**: 模型完全离线运行，无法访问外部信息
2. **有限的上下文窗口**: 本地模型通常比云端API的上下文窗口更小
3. **功能较弱**: 本地模型可能无法匹配最新云端模型的质量

## 总结

使用DeepWiki与Ollama为您提供完全本地化、私有的代码文档解决方案。虽然可能无法匹配基于云的解决方案的速度或质量，但它为大多数项目提供了免费且注重隐私的替代方案。

享受使用DeepWiki与您的本地Ollama模型！

## 常见问题

### Q: 如何验证Ollama是否正确安装？
A: 在终端运行`ollama --version`，应该显示版本信息。

### Q: Docker容器启动后显示嵌入错误怎么办？
A: 检查以下步骤：
1. 确认宿主机Ollama正在运行：`ollama list`
2. 验证Docker网络连接：`docker exec -it <容器名> curl http://host.docker.internal:11434/api/tags`
3. 检查`.env`文件是否包含正确的`OLLAMA_HOST`配置
4. 重启Docker容器：`docker-compose down && docker-compose up -d`

### Q: 可以同时使用多个嵌入模型吗？
A: 可以，您可以在配置文件中定义多个嵌入器配置，并根据需要切换。

### Q: 推荐的生产环境配置是什么？
A: 生产环境推荐：
- 使用GPU加速的服务器
- 至少16GB内存
- 使用`llama3:8b`或更大的模型以获得更好的质量
- 配置适当的资源限制和监控