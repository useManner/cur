const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');

// 导入我们修改后的函数
const { compareVideos } = require('./app.js');

// 测试视频路径
// 注意：请根据实际情况修改这些路径
const testVideo1 = path.join(__dirname, 'uploads', 'test_video1.mp4');
const testVideo2 = path.join(__dirname, 'uploads', 'test_video2.mp4');

// 如果没有实际的测试视频，生成测试视频的函数
async function generateTestVideos() {
  const { exec } = require('child_process');
  
  // 创建uploads目录
  if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
  }
  
  // 使用FFmpeg生成两个简单的测试视频
  // 第一个视频：5秒的红色背景视频
  const cmd1 = `${ffmpeg} -f lavfi -i color=c=red:s=320x240:d=5 -c:v libx264 -pix_fmt yuv420p -y "${testVideo1}"`;
  // 第二个视频：5秒的半红半蓝背景视频
  const cmd2 = `${ffmpeg} -f lavfi -i color=c=red:s=320x240:d=5 -vf "drawbox=x=160:y=0:w=160:h=240:c=blue" -c:v libx264 -pix_fmt yuv420p -y "${testVideo2}"`;
  
  console.log('正在生成测试视频...');
  
  return new Promise((resolve, reject) => {
    // 先执行第一个命令
    const process1 = exec(cmd1, (error, stdout, stderr) => {
      if (error) {
        console.error(`生成第一个测试视频失败: ${error}`);
        reject(error);
        return;
      }
      
      console.log('第一个测试视频生成成功');
      
      // 再执行第二个命令
      const process2 = exec(cmd2, (error, stdout, stderr) => {
        if (error) {
          console.error(`生成第二个测试视频失败: ${error}`);
          reject(error);
          return;
        }
        
        console.log('第二个测试视频生成成功');
        resolve();
      });
      
      process2.stdout.on('data', (data) => console.log(data));
      process2.stderr.on('data', (data) => console.error(data));
    });
    
    process1.stdout.on('data', (data) => console.log(data));
    process1.stderr.on('data', (data) => console.error(data));
  });
}

// 运行测试
async function runTest() {
  try {
    // 检查是否存在测试视频，如果不存在则生成
    if (!fs.existsSync(testVideo1) || !fs.existsSync(testVideo2)) {
      console.log('测试视频不存在，开始生成...');
      await generateTestVideos();
    } else {
      console.log('测试视频已存在');
    }
    
    // 验证测试视频是否存在
    if (!fs.existsSync(testVideo1) || !fs.existsSync(testVideo2)) {
      throw new Error('测试视频生成失败或不存在');
    }
    
    console.log('\n开始测试视频相似度比较...');
    
    // 测试视频相似度比较
    const similarity = await compareVideos(testVideo1, testVideo2, 5); // 使用较低的采样率以加快测试
    
    console.log(`\n测试完成！`);
    console.log(`视频1: ${testVideo1}`);
    console.log(`视频2: ${testVideo2}`);
    console.log(`相似度: ${similarity.toFixed(4)}`);
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
runTest();