# TransGuyane 前端 Dockerfile
# 阶段1: 构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm ci --legacy-peer-deps --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 设置构建时的环境变量
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 构建生产版本
RUN npm run build

# 阶段2: 运行
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/build /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80 443

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
