# 有钱么财务应用部署与管理文档

## 目录结构

```
deploy/
├── start.sh     # 启动容器脚本
├── stop.sh      # 停止容器脚本
├── restart.sh   # 重启容器脚本
├── build.sh     # 构建镜像脚本
├── logs.sh      # 查看日志脚本
└── README.md    # 部署文档
```

## 系统要求

- Docker 19.03.0+ 
- Docker Compose 1.25.0+

## 脚本使用说明

### 1. 构建镜像

```bash
# 在项目根目录执行
./deploy/build.sh
```

此脚本会使用 `docker-compose build` 命令构建所有服务的Docker镜像。

### 2. 启动容器

```bash
# 在项目根目录执行
./deploy/start.sh
```

此脚本会使用 `docker-compose up -d` 命令启动所有服务的容器。

启动后，应用会在以下地址可用：
- 开发环境: http://localhost:3000
- 生产环境: http://localhost:3001

### 3. 停止容器

```bash
# 在项目根目录执行
./deploy/stop.sh
```

此脚本会使用 `docker-compose down` 命令停止所有服务的容器。

### 4. 重启容器

```bash
# 在项目根目录执行
./deploy/restart.sh
```

此脚本会先停止所有服务，然后重新启动它们。

### 5. 查看日志

```bash
# 在项目根目录执行
./deploy/logs.sh
```

此脚本会提示您选择要查看的服务日志：
1. 开发环境 (app-dev)
2. 生产环境 (app-prod)
3. 所有服务

## Docker 配置说明

### Dockerfile

项目使用多阶段构建，分为构建阶段和运行阶段：
- 构建阶段：使用 node:18-alpine 镜像，安装所有依赖并构建应用
- 运行阶段：使用 node:18-alpine 镜像，只安装生产依赖并复制构建产物

### docker-compose.yml

项目配置了两个服务：
- `app-dev`：开发环境服务，映射端口 3000:3000
- `app-prod`：生产环境服务，映射端口 3001:3000

## 环境变量

项目使用以下环境变量：
- `NODE_ENV`：环境类型（development/production）
- `NEXT_PUBLIC_APP_ENV`：应用环境（development/production）

环境变量配置文件：
- `.env.example`：环境变量示例文件
- `.env.production`：生产环境变量配置文件

## 数据持久化

项目使用 Docker 卷进行数据持久化，主要存储在 `./data` 目录中。

## 故障排查

### 常见问题

1. **脚本执行权限错误**
   - 解决方法：运行 `chmod +x deploy/*.sh` 为脚本添加执行权限

2. **Docker 命令权限错误**
   - 解决方法：确保当前用户有权限执行 Docker 命令，或使用 sudo 运行脚本

3. **端口冲突**
   - 解决方法：修改 docker-compose.yml 文件中的端口映射，避免与其他服务冲突

4. **容器启动失败**
   - 解决方法：查看容器日志，使用 `./deploy/logs.sh` 命令分析错误原因

### 查看容器状态

```bash
# 查看所有容器状态
docker-compose ps

# 查看所有Docker容器状态
docker ps -a
```

## 部署流程建议

1. **开发环境部署**
   - 克隆代码仓库
   - 运行 `./deploy/build.sh` 构建镜像
   - 运行 `./deploy/start.sh` 启动容器
   - 访问 http://localhost:3000 进行开发和测试

2. **生产环境部署**
   - 克隆代码仓库
   - 配置 `.env.production` 文件
   - 运行 `./deploy/build.sh` 构建镜像
   - 运行 `./deploy/start.sh` 启动容器
   - 访问 http://localhost:3001 访问生产环境应用

## 维护建议

- 定期备份 `./data` 目录中的数据
- 定期更新 Docker 镜像和依赖包
- 监控容器运行状态和日志，及时发现和解决问题
