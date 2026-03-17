# 小程序后台管理系统 - 完整安装和使用指南

## 系统概述

这是一个功能完整的小程序后台管理系统，包含前端React应用和后端Node.js API服务器。

### 功能特性

- ✅ 用户管理（增删改查、角色权限）
- ✅ 内容管理（图文、视频、分类管理）
- ✅ 数据分析（统计图表、数据导出）
- ✅ 系统设置（基础配置、主题设置）
- ✅ 实时通知系统
- ✅ 文件上传管理
- ✅ JWT身份认证
- ✅ 响应式设计

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design UI组件库
- Redux Toolkit 状态管理
- React Router 路由管理
- ECharts 图表库

### 后端
- Node.js + Express
- MySQL 数据库
- JWT 身份认证
- bcryptjs 密码加密
- Multer 文件上传

## 安装步骤

### 1. 环境要求

- Node.js 16+ 
- MySQL 5.7+ 或 MySQL 8.0+
- npm 或 yarn

### 2. 数据库配置

1. 启动MySQL服务
2. 创建数据库（可选，系统会自动创建）：
   ```sql
   CREATE DATABASE miniprogram_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. 导入数据库结构（可选，系统会自动初始化）：
   ```bash
   mysql -u root -p < server/database.sql
   ```

### 3. 后端配置

1. 进入server目录：
   ```bash
   cd server
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置数据库连接（编辑server.js）：
   ```javascript
   const dbConfig = {
     host: 'localhost',        // 数据库主机
     user: 'root',            // 数据库用户名
     password: 'your_password', // 数据库密码
     database: 'miniprogram_admin', // 数据库名
     charset: 'utf8mb4'
   };
   ```

4. 启动后端服务器：
   ```bash
   npm start
   ```
   
   后端将在 http://localhost:3001 启动

### 4. 前端配置

1. 返回项目根目录：
   ```bash
   cd ..
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置API地址（可选，默认使用localhost:3001）：
   创建 `.env` 文件：
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. 启动前端开发服务器：
   ```bash
   npm start
   ```
   
   前端将在 http://localhost:3000 启动

## 快速启动

### 方法1：使用启动脚本

**Windows用户：**
```bash
# 双击运行
start-project.bat
```

**Linux/Mac用户：**
```bash
chmod +x start-project.sh
./start-project.sh
```

### 方法2：使用npm脚本

```bash
# 安装所有依赖
npm run install-all

# 同时启动前后端
npm run dev
```

### 方法3：手动启动

```bash
# 终端1：启动后端
cd server
npm start

# 终端2：启动前端
npm start
```

## 默认账号

系统会自动创建默认管理员账号：

- **用户名**: admin
- **密码**: admin123

## API文档

### 认证接口

- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户管理

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 内容管理

- `GET /api/contents` - 获取内容列表
- `POST /api/contents` - 创建内容
- `PUT /api/contents/:id` - 更新内容
- `DELETE /api/contents/:id` - 删除内容

### 系统功能

- `GET /api/statistics` - 获取统计数据
- `GET /api/settings` - 获取系统设置
- `PUT /api/settings` - 更新系统设置
- `POST /api/upload` - 文件上传
- `GET /api/notifications` - 获取通知

## 部署说明

### 生产环境部署

1. **构建前端**：
   ```bash
   npm run build
   ```

2. **配置后端生产环境**：
   - 修改数据库配置
   - 设置JWT密钥
   - 配置文件上传路径

3. **启动后端**：
   ```bash
   cd server
   npm start
   ```

4. **配置Web服务器**：
   使用Nginx或Apache托管前端静态文件，并代理API请求到后端。

### Docker部署

```dockerfile
# 前端Dockerfile
FROM nginx:alpine
COPY build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# 后端Dockerfile  
FROM node:16-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ .
EXPOSE 3001
CMD ["npm", "start"]
```

## 开发指南

### 目录结构

```
c-sys/
├── public/                 # 静态资源
├── src/                    # 前端源码
│   ├── components/         # 组件
│   ├── pages/             # 页面
│   ├── services/          # API服务
│   ├── store/             # Redux状态管理
│   └── types/             # TypeScript类型定义
├── server/                # 后端源码
│   ├── uploads/           # 文件上传目录
│   ├── database.sql       # 数据库结构
│   └── server.js          # 服务器入口
└── build/                 # 前端构建输出
```

### 添加新功能

1. **前端页面**：在 `src/pages/` 下创建新组件
2. **API接口**：在 `src/services/api.ts` 中添加新接口
3. **后端路由**：在 `server/server.js` 中添加新路由
4. **数据库表**：在 `server/database.sql` 中定义新表结构

### 代码规范

- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 组件使用函数式组件和Hooks
- API使用async/await处理异步操作

## 常见问题

### Q: 数据库连接失败
A: 检查MySQL服务是否启动，用户名密码是否正确，数据库是否存在。

### Q: 前端无法连接后端
A: 检查后端是否启动在3001端口，CORS配置是否正确。

### Q: 文件上传失败
A: 检查uploads目录是否存在且有写权限。

### Q: 登录后页面空白
A: 检查JWT token是否正确设置，用户信息是否正确返回。

## 技术支持

如有问题，请检查：
1. 控制台错误信息
2. 网络请求状态
3. 数据库连接状态
4. 文件权限设置

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的前后端功能实现
- 用户管理、内容管理、数据分析
- 系统设置、文件上传、通知系统
