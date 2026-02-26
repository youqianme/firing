# 使用华为云镜像代理解决国内网络问题
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 替换 Alpine 软件源为阿里云镜像源，解决国内网络问题
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装构建依赖 (better-sqlite3 需要 python3, make, g++)
RUN apk add --no-cache libc6-compat python3 make g++

# 配置npm注册表为中国友好的源
RUN npm config set registry "https://registry.npmmirror.com"

# 复制 root package.json 和 lock 文件
COPY package*.json ./

# 复制 apps/web package.json
COPY apps/web/package*.json ./apps/web/

# 复制 packages 下的 package.json (显式复制以利用 Docker 缓存)
COPY packages/data-access/package*.json ./packages/data-access/
COPY packages/types/package*.json ./packages/types/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/utils/package*.json ./packages/utils/

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 构建 web 应用
# 确保 apps/web/next.config.mjs 存在且包含 output: 'standalone'
RUN npm run build:web

# 使用华为云镜像代理解决国内网络问题
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine AS runner

# 设置工作目录
WORKDIR /app

# 替换 Alpine 软件源为阿里云镜像源，解决国内网络问题
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# 数据库路径 (使用 volume 挂载 /app/data)
ENV DATABASE_URL=/app/data/dev.db
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 安装运行时依赖
RUN apk add --no-cache libc6-compat

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 创建数据目录并设置权限
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
VOLUME /app/data

# 复制构建产物 (standalone)
# standalone 包含了必要的 node_modules 和 server.js
# 目录结构取决于 outputTracingRoot，这里假设为根目录
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "apps/web/server.js"]
