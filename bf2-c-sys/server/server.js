const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const multer = require('multer');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'miniprogram_admin',
  charset: 'utf8mb4'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 初始化数据库
async function initDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 创建数据库
    await connection.execute(`CREATE DATABASE IF NOT EXISTS miniprogram_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.execute(`USE miniprogram_admin`);
    
    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        status ENUM('active', 'disabled', 'pending') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 创建内容表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contents (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        type ENUM('text', 'image', 'video') NOT NULL,
        category VARCHAR(100) NOT NULL,
        content TEXT,
        thumbnail VARCHAR(255),
        status ENUM('published', 'draft', 'archived') DEFAULT 'draft',
        author VARCHAR(50) NOT NULL,
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 创建系统设置表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 创建通知表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('success', 'warning', 'error', 'info') DEFAULT 'info',
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 插入默认管理员用户
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );
    
    if (existingAdmin.length === 0) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(`
        INSERT INTO users (id, username, email, password, role, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [adminId, 'admin', 'admin@example.com', hashedPassword, 'admin', 'active']);
      
      console.log('默认管理员用户已创建: admin / admin123');
    }
    
    // 插入一些示例数据
    await insertSampleData(connection);
    
    await connection.end();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

// 插入示例数据
async function insertSampleData(connection) {
  try {
    // 检查是否已有数据
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (users[0].count > 1) return; // 已有数据，跳过
    
    // 插入示例用户
    const sampleUsers = [
      {
        id: uuidv4(),
        username: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        password: await bcrypt.hash('123456', 10),
        role: 'user',
        status: 'active'
      },
      {
        id: uuidv4(),
        username: '李四',
        email: 'lisi@example.com',
        phone: '13800138002',
        password: await bcrypt.hash('123456', 10),
        role: 'user',
        status: 'active'
      },
      {
        id: uuidv4(),
        username: '王五',
        email: 'wangwu@example.com',
        phone: '13800138003',
        password: await bcrypt.hash('123456', 10),
        role: 'user',
        status: 'disabled'
      }
    ];
    
    for (const user of sampleUsers) {
      await connection.execute(`
        INSERT INTO users (id, username, email, phone, password, role, status, created_at, last_login_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id, user.username, user.email, user.phone, user.password, 
        user.role, user.status, moment().subtract(Math.floor(Math.random() * 30), 'days').format('YYYY-MM-DD'),
        moment().subtract(Math.floor(Math.random() * 7), 'days').format('YYYY-MM-DD HH:mm:ss')
      ]);
    }
    
    // 插入示例内容
    const sampleContents = [
      {
        id: uuidv4(),
        title: '春季新品发布',
        type: 'image',
        category: '轮播图',
        content: '春季新品发布活动正式开始',
        thumbnail: 'https://via.placeholder.com/300x200/1890FF/FFFFFF?text=轮播图1',
        status: 'published',
        author: '张三',
        views: 1250
      },
      {
        id: uuidv4(),
        title: '系统维护通知',
        type: 'text',
        category: '公告',
        content: '系统将于本周六进行例行维护，预计维护时间2小时',
        status: 'published',
        author: '李四',
        views: 856
      },
      {
        id: uuidv4(),
        title: '产品介绍视频',
        type: 'video',
        category: '产品列表',
        content: '详细介绍我们的核心产品功能',
        thumbnail: 'https://via.placeholder.com/300x200/52C41A/FFFFFF?text=视频',
        status: 'draft',
        author: '王五',
        views: 0
      }
    ];
    
    for (const content of sampleContents) {
      await connection.execute(`
        INSERT INTO contents (id, title, type, category, content, thumbnail, status, author, views, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        content.id, content.title, content.type, content.category, content.content,
        content.thumbnail, content.status, content.author, content.views,
        moment().subtract(Math.floor(Math.random() * 10), 'days').format('YYYY-MM-DD')
      ]);
    }
    
    console.log('示例数据插入完成');
  } catch (error) {
    console.error('插入示例数据失败:', error);
  }
}

// JWT 认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '访问令牌缺失' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '访问令牌无效' });
    }
    req.user = user;
    next();
  });
};

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// API 路由

// 用户认证
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: '账户已被禁用' });
    }
    
    // 更新最后登录时间
    await pool.execute(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );
    
    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          status: user.status
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, phone, avatar, role, status, created_at, last_login_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 用户管理 API
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', status = '', role = '' } = req.query;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    
    const [rows] = await pool.execute(
      `SELECT id, username, email, phone, avatar, role, status, created_at, last_login_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );
    
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        users: rows,
        total: countRows[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 创建用户
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const { username, email, phone, password, role = 'user', status = 'active' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: '用户名、邮箱和密码不能为空' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    await pool.execute(
      `INSERT INTO users (id, username, email, phone, password, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, email, phone, hashedPassword, role, status]
    );
    
    res.json({ success: true, message: '用户创建成功' });
  } catch (error) {
    console.error('创建用户错误:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: '用户名或邮箱已存在' });
    } else {
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
});

// 更新用户
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, role, status } = req.body;
    
    await pool.execute(
      `UPDATE users SET username = ?, email = ?, phone = ?, role = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [username, email, phone, role, status, id]
    );
    
    res.json({ success: true, message: '用户更新成功' });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 删除用户
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 内容管理 API
app.get('/api/contents', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', type = '', status = '', category = '' } = req.query;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }
    
    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    const [rows] = await pool.execute(
      `SELECT id, title, type, category, content, thumbnail, status, author, views, created_at, updated_at 
       FROM contents ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );
    
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM contents ${whereClause}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        contents: rows,
        total: countRows[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取内容列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 创建内容
app.post('/api/contents', authenticateToken, async (req, res) => {
  try {
    const { title, type, category, content, thumbnail, status = 'draft' } = req.body;
    
    if (!title || !type || !category) {
      return res.status(400).json({ success: false, message: '标题、类型和分类不能为空' });
    }
    
    const contentId = uuidv4();
    
    await pool.execute(
      `INSERT INTO contents (id, title, type, category, content, thumbnail, status, author) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [contentId, title, type, category, content, thumbnail, status, req.user.username]
    );
    
    res.json({ success: true, message: '内容创建成功' });
  } catch (error) {
    console.error('创建内容错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 更新内容
app.put('/api/contents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, category, content, thumbnail, status } = req.body;
    
    await pool.execute(
      `UPDATE contents SET title = ?, type = ?, category = ?, content = ?, thumbnail = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, type, category, content, thumbnail, status, id]
    );
    
    res.json({ success: true, message: '内容更新成功' });
  } catch (error) {
    console.error('更新内容错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 删除内容
app.delete('/api/contents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM contents WHERE id = ?', [id]);
    
    res.json({ success: true, message: '内容删除成功' });
  } catch (error) {
    console.error('删除内容错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 文件上传
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({ success: false, message: '文件上传失败' });
  }
});

// 获取统计数据
app.get('/api/statistics', authenticateToken, async (req, res) => {
  try {
    // 用户统计
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activeUsers,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as todayNewUsers
      FROM users
    `);
    
    // 内容统计
    const [contentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalContents,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as publishedContents,
        SUM(views) as totalViews
      FROM contents
    `);
    
    // 最近7天用户增长
    const [userGrowth] = await pool.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    res.json({
      success: true,
      data: {
        users: userStats[0],
        contents: contentStats[0],
        userGrowth
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 系统设置 API
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM system_settings');
    
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    });
    
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('获取系统设置错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 更新系统设置
app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      await pool.execute(`
        INSERT INTO system_settings (setting_key, setting_value) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
      `, [key, settingValue]);
    }
    
    res.json({ success: true, message: '设置保存成功' });
  } catch (error) {
    console.error('更新系统设置错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取通知
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取通知错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 标记通知为已读
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE notifications SET read_status = TRUE WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    res.json({ success: true, message: '通知已标记为已读' });
  } catch (error) {
    console.error('标记通知已读错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服务器运行正常', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT}`);
  await initDatabase();
});

module.exports = app;
