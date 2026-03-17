#!/bin/bash

echo "正在启动小程序后台管理系统..."

echo ""
echo "1. 检查依赖..."

if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "安装后端依赖..."
    cd server
    npm install
    cd ..
fi

echo ""
echo "2. 启动后端服务器..."
cd server
npm start &
SERVER_PID=$!
cd ..

echo ""
echo "等待后端服务器启动..."
sleep 5

echo ""
echo "3. 启动前端开发服务器..."
npm start &
CLIENT_PID=$!

echo ""
echo "系统启动完成！"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:3001"
echo ""
echo "默认管理员账号: admin / admin123"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap 'echo "正在停止服务..."; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit' INT

wait
