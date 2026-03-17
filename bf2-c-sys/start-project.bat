@echo off
echo 正在启动小程序后台管理系统...

echo.
echo 1. 检查依赖...
if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install
)

if not exist "server\node_modules" (
    echo 安装后端依赖...
    cd server
    call npm install
    cd ..
)

echo.
echo 2. 启动后端服务器...
start "后端服务器" cmd /k "cd server && npm start"

echo.
echo 等待后端服务器启动...
timeout /t 5 /nobreak > nul

echo.
echo 3. 启动前端开发服务器...
start "前端服务器" cmd /k "npm start"

echo.
echo 系统启动完成！
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:3001
echo.
echo 默认管理员账号: admin / admin123
echo.
pause
