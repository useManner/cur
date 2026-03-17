const { spawn } = require('child_process');
const path = require('path');

console.log('正在启动小程序后台管理系统...');

// 检查MySQL是否运行
const mysql = spawn('mysql', ['--version'], { shell: true });

mysql.on('close', (code) => {
  if (code === 0) {
    console.log('✅ MySQL 已安装');
    startServer();
  } else {
    console.log('❌ MySQL 未安装或未运行');
    console.log('请先安装并启动 MySQL 数据库');
    console.log('然后运行以下命令创建数据库：');
    console.log('mysql -u root -p < database.sql');
    process.exit(1);
  }
});

function startServer() {
  console.log('🚀 启动后端服务器...');
  
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  server.on('close', (code) => {
    console.log(`服务器进程退出，退出码: ${code}`);
  });

  server.on('error', (err) => {
    console.error('启动服务器时出错:', err);
  });

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.kill('SIGINT');
  });
}
