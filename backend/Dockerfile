# TransGuyane 后端 Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 设置时区
RUN apk add --no-cache tzdata
ENV TZ=Asia/Shanghai

# 复制 package.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# 启动命令
CMD ["node", "server.js"]
