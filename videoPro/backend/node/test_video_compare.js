const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('开始诊断视频处理问题...');

// 检查ffmpeg-static是否正确安装
console.log('检查ffmpeg-static包...');
try {
  const ffmpegPath = require('ffmpeg-static');
  console.log('ffmpeg-static包存在，路径:', ffmpegPath);
  
  // 检查路径是否存在
  if (fs.existsSync(ffmpegPath)) {
    console.log('FFmpeg可执行文件存在');
    
    // 检查FFmpeg版本
    console.log('检查FFmpeg版本...');
    const { spawn } = require('child_process');
    const ffmpeg = spawn(ffmpegPath, ['-version']);
    
    ffmpeg.stdout.on('data', (data) => {
      console.log(`FFmpeg版本信息:\n${data}`);
    });
    
    ffmpeg.stderr.on('data', (data) => {
      console.error(`FFmpeg错误:\n${data}`);
    });
    
    ffmpeg.on('close', (code) => {
      console.log(`FFmpeg进程退出，代码 ${code}`);
      
      if (code === 0) {
        console.log('\n诊断结果: FFmpeg可正常运行');
        console.log('建议的修复方案:');
        console.log('1. 修改app.js中的extractFrames函数，增加更健壮的错误处理');
        console.log('2. 添加超时机制');
        console.log('3. 确保有足够的磁盘空间');
      } else {
        console.log('\n诊断结果: FFmpeg执行失败');
        console.log('可能的问题:');
        console.log('1. FFmpeg版本不兼容或损坏');
        console.log('2. 系统缺少必要的DLL文件');
        console.log('3. 权限问题');
      }
    });
    
  } else {
    console.log('错误: FFmpeg可执行文件不存在于指定路径');
    console.log('建议重新安装ffmpeg-static包');
  }
  
} catch (error) {
  console.error('加载ffmpeg-static包时出错:', error);
  console.log('建议执行: npm uninstall ffmpeg-static && npm install ffmpeg-static');
}