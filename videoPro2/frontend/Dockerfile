FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install || true

COPY . .

EXPOSE 3000

# 开发模式运行（如需生产可换为 build+preview）
CMD ["npm", "run", "dev", "--", "--host"]


