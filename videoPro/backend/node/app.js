const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const sharp = require('sharp');
const crypto = require('crypto');
const ffmpegPath = require('ffmpeg-static');

const app = express();
const PORT = 5000;

// 配置文件上传
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// 确保上传目录存在
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// 计算pHash
function getPerceptualHash(imageBuffer) {
  return new Promise(async (resolve, reject) => {
    try {
      // 调整图像大小为32x32，转为灰度
      const resized = await sharp(imageBuffer)
        .resize(32, 32, { fit: 'inside' })
        .grayscale()
        .raw()
        .toBuffer();

      // 计算DCT（简化版本）
      const pixels = [];
      for (let i = 0; i < resized.length; i += 1) {
        pixels.push(resized[i]);
      }

      // 计算平均值
      const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;

      // 生成64位哈希
      let hash = 0;
      for (let i = 0; i < 64; i++) {
        if (pixels[i] > avg) {
          hash |= 1 << (63 - i);
        }
      }

      resolve(hash.toString(16).padStart(16, '0'));
    } catch (error) {
      reject(error);
    }
  });
}

// 计算汉明距离
function hammingDistance(hash1, hash2) {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }
  return distance;
}

// 从视频提取帧
function extractFrames(videoPath, sampleRate = 10) {
  return new Promise((resolve, reject) => {
    const outputDir = `frames_${Date.now()}`;
    
    try {
      // 确保输出目录存在
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`创建帧输出目录: ${outputDir}`);
      }

      // 使用FFmpeg提取帧，添加更多的错误处理参数
      const cmd = `${ffmpegPath} -i "${videoPath}" -vf "fps=${sampleRate}" -y "${outputDir}/frame_%04d.png" -loglevel error`;
      
      console.log(`执行FFmpeg命令: ${cmd}`);
      
      // 设置超时
      const process = exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`提取帧失败: ${error.message}`);
          console.error(`FFmpeg输出: ${stderr}`);
          
          // 清理目录
          try {
            if (fs.existsSync(outputDir)) {
              fs.rmSync(outputDir, { recursive: true, force: true });
              console.log(`已清理失败的输出目录: ${outputDir}`);
            }
          } catch (cleanupErr) {
            console.error(`清理目录失败: ${cleanupErr}`);
          }
          
          reject(error);
          return;
        }

        console.log('FFmpeg命令执行完成');
        
        // 获取提取的帧列表
        fs.readdir(outputDir, (err, files) => {
          if (err) {
            console.error(`读取帧目录失败: ${err}`);
            reject(err);
            return;
          }

          const frameFiles = files
            .filter(file => file.endsWith('.png'))
            .map(file => path.join(outputDir, file));
          
          console.log(`成功提取 ${frameFiles.length} 帧`);

          resolve({ frameFiles, outputDir });
        });
      });
      
      // 设置120秒超时
      const timeoutId = setTimeout(() => {
        console.error('FFmpeg执行超时');
        process.kill();
        
        // 清理目录
        try {
          if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
          }
        } catch (cleanupErr) {
          console.error(`超时后清理目录失败: ${cleanupErr}`);
        }
        
        reject(new Error('视频帧提取超时'));
      }, 120000);
      
      process.on('exit', () => {
        clearTimeout(timeoutId);
      });
      
    } catch (initialError) {
      console.error(`初始化帧提取失败: ${initialError}`);
      
      // 清理目录
      try {
        if (fs.existsSync(outputDir)) {
          fs.rmSync(outputDir, { recursive: true, force: true });
        }
      } catch (cleanupErr) {
        console.error(`初始错误后清理目录失败: ${cleanupErr}`);
      }
      
      reject(initialError);
    }
  });
}

// 处理图片相似度检测
async function compareImages(imgPath1, imgPath2, threshold = 0.8) {
  try {
    const buffer1 = fs.readFileSync(imgPath1);
    const buffer2 = fs.readFileSync(imgPath2);

    const hash1 = await getPerceptualHash(buffer1);
    const hash2 = await getPerceptualHash(buffer2);

    // 计算相似度
    const distance = hammingDistance(hash1, hash2);
    const maxDistance = hash1.length;
    const similarity = 1 - (distance / maxDistance);

    return similarity;
  } catch (error) {
    console.error('图片比较错误:', error);
    return 0;
  }
}

// 处理视频相似度检测
async function compareVideos(videoPath1, videoPath2, sampleRate = 10, threshold = 0.8) {
  let dir1 = null;
  let dir2 = null;
  
  try {
    console.log('开始比较视频:', videoPath1, '和', videoPath2);
    
    // 提取第一个视频的帧
    let frames1;
    try {
      const result1 = await extractFrames(videoPath1, sampleRate);
      frames1 = result1.frameFiles;
      dir1 = result1.outputDir;
      console.log(`第一个视频提取了 ${frames1.length} 帧`);
    } catch (err) {
      console.error(`提取第一个视频帧失败: ${err}`);
      throw new Error(`处理第一个视频失败: ${err.message}`);
    }
    
    // 提取第二个视频的帧
    let frames2;
    try {
      const result2 = await extractFrames(videoPath2, sampleRate);
      frames2 = result2.frameFiles;
      dir2 = result2.outputDir;
      console.log(`第二个视频提取了 ${frames2.length} 帧`);
    } catch (err) {
      console.error(`提取第二个视频帧失败: ${err}`);
      throw new Error(`处理第二个视频失败: ${err.message}`);
    }

    if (frames1.length === 0 || frames2.length === 0) {
      console.log('警告: 一个或两个视频没有提取到帧');
      return 0;
    }

    // 优化帧比较策略：等间隔采样比较，避免处理太多帧
    const maxFramesToCompare = 20; // 最多比较20帧
    const minFrames = Math.min(frames1.length, frames2.length);
    const step = minFrames > maxFramesToCompare ? Math.floor(minFrames / maxFramesToCompare) : 1;
    
    console.log(`将比较 ${Math.ceil(minFrames / step)} 帧，步长为 ${step}`);
    
    // 计算帧之间的相似度
    const similarities = [];
    for (let i = 0; i < minFrames; i += step) {
      try {
        const similarity = await compareImages(frames1[i], frames2[i]);
        similarities.push(similarity);
        console.log(`帧 ${i} 相似度: ${similarity.toFixed(4)}`);
      } catch (imgErr) {
        console.error(`比较帧 ${i} 失败: ${imgErr}`);
        // 出错时使用0作为相似度
        similarities.push(0);
      }
    }

    // 计算平均相似度
    const avgSimilarity = similarities.reduce((sum, val) => sum + val, 0) / similarities.length;
    
    // 计算最大相似度
    const maxSimilarity = Math.max(...similarities);
    
    const finalSimilarity = (avgSimilarity + maxSimilarity) / 2;
    console.log(`视频比较完成，平均相似度: ${avgSimilarity.toFixed(4)}, 最大相似度: ${maxSimilarity.toFixed(4)}, 最终相似度: ${finalSimilarity.toFixed(4)}`);

    // 返回综合相似度
    return finalSimilarity;
  } catch (error) {
    console.error('视频比较错误:', error);
    return 0;
  } finally {
    // 确保清理临时文件
    try {
      if (dir1 && fs.existsSync(dir1)) {
        fs.rmSync(dir1, { recursive: true, force: true });
        console.log(`已清理第一个视频的帧目录: ${dir1}`);
      }
      if (dir2 && fs.existsSync(dir2)) {
        fs.rmSync(dir2, { recursive: true, force: true });
        console.log(`已清理第二个视频的帧目录: ${dir2}`);
      }
    } catch (cleanupErr) {
      console.error(`清理临时文件失败: ${cleanupErr}`);
    }
  }
}

// 检测文件相似度（支持图片和视频）
async function detectSimilarity(file1, file2, sampleRate = 10, threshold = 0.8) {
  const isVideo1 = file1.mimetype.startsWith('video/');
  const isVideo2 = file2.mimetype.startsWith('video/');
  const isImage1 = file1.mimetype.startsWith('image/');
  const isImage2 = file2.mimetype.startsWith('image/');

  if (isImage1 && isImage2) {
    // 两个都是图片
    return await compareImages(file1.path, file2.path, threshold);
  } else if (isVideo1 && isVideo2) {
    // 两个都是视频
    return await compareVideos(file1.path, file2.path, sampleRate, threshold);
  } else if (isImage1 && isVideo2) {
    // 图片与视频比较
    const { frameFiles, outputDir } = await extractFrames(file2.path, sampleRate);
    
    if (frameFiles.length === 0) {
      fs.rmSync(outputDir, { recursive: true, force: true });
      return 0;
    }

    // 与视频的第一帧比较
    const similarity = await compareImages(file1.path, frameFiles[0]);
    
    // 清理临时文件
    fs.rmSync(outputDir, { recursive: true, force: true });
    
    return similarity;
  } else if (isVideo1 && isImage2) {
    // 视频与图片比较，交换参数
    return await detectSimilarity(file2, file1, sampleRate, threshold);
  }

  return 0;
}

// 主检测接口
app.post('/detect', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const threshold = parseFloat(req.body.similarityThreshold || 0.8);
    const sampleRate = parseInt(req.body.frameSampleRate || 10);

    if (files.length < 2) {
      return res.status(400).json({ error: '至少需要两个文件进行比较' });
    }

    // 计算文件两两之间的相似度
    const results = [];
    const groups = {};
    let groupId = 1;

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const file1 = files[i];
        const file2 = files[j];

        console.log(`比较文件: ${file1.originalname} 和 ${file2.originalname}`);
        const similarity = await detectSimilarity(file1, file2, sampleRate, threshold);
        console.log(`相似度: ${similarity}`);

        if (similarity >= threshold) {
          // 检查是否已经在某个组中
          let foundGroup = false;
          for (const gid in groups) {
            const group = groups[gid];
            const fileNames = group.files.map(f => f.name);
            
            if (fileNames.includes(file1.originalname) || fileNames.includes(file2.originalname)) {
              // 添加到现有组
              group.files.push(
                { name: file1.originalname, type: file1.mimetype, size: file1.size },
                { name: file2.originalname, type: file2.mimetype, size: file2.size }
              );
              group.similarity = Math.max(group.similarity, similarity);
              foundGroup = true;
              break;
            }
          }

          if (!foundGroup) {
            // 创建新组
            groups[groupId] = {
              groupId,
              similarity,
              files: [
                { name: file1.originalname, type: file1.mimetype, size: file1.size },
                { name: file2.originalname, type: file2.mimetype, size: file2.size }
              ]
            };
            groupId++;
          }
        }
      }
    }

    // 清理上传的文件
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error(`删除文件失败: ${file.path}`, e);
      }
    });

    // 格式化结果
    const formattedResults = Object.values(groups);

    res.json({ results: formattedResults });
  } catch (error) {
    console.error('检测错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 启动服务器
// 只有在直接运行此文件时才启动服务器，作为模块导入时不启动
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

// 导出主要函数供其他模块使用
module.exports = {
  extractFrames,
  compareImages,
  compareVideos
};