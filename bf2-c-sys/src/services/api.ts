// API 基础配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 获取存储的token
const getToken = () => {
  return localStorage.getItem('token');
};

// 设置token
const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

// 移除token
const removeToken = () => {
  localStorage.removeItem('token');
};

// 基础请求函数
const request = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token 过期或无效，清除本地存储并跳转到登录页
        removeToken();
        window.location.href = '/login';
        throw new Error('登录已过期，请重新登录');
      }
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 用户认证相关API
export const authAPI = {
  // 登录
  login: async (username: string, password: string) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return request('/auth/me');
  },

  // 登出（清除本地token）
  logout: () => {
    removeToken();
  },
};

// 用户管理相关API
export const userAPI = {
  // 获取用户列表
  getUsers: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    role?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    return request(`/users?${queryParams.toString()}`);
  },

  // 创建用户
  createUser: async (userData: {
    username: string;
    email: string;
    phone?: string;
    password: string;
    role?: string;
    status?: string;
  }) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // 更新用户
  updateUser: async (id: string, userData: {
    username: string;
    email: string;
    phone?: string;
    role?: string;
    status?: string;
  }) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // 删除用户
  deleteUser: async (id: string) => {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// 内容管理相关API
export const contentAPI = {
  // 获取内容列表
  getContents: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    status?: string;
    category?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    return request(`/contents?${queryParams.toString()}`);
  },

  // 创建内容
  createContent: async (contentData: {
    title: string;
    type: string;
    category: string;
    content?: string;
    thumbnail?: string;
    status?: string;
  }) => {
    return request('/contents', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  },

  // 更新内容
  updateContent: async (id: string, contentData: {
    title: string;
    type: string;
    category: string;
    content?: string;
    thumbnail?: string;
    status?: string;
  }) => {
    return request(`/contents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
  },

  // 删除内容
  deleteContent: async (id: string) => {
    return request(`/contents/${id}`, {
      method: 'DELETE',
    });
  },
};

// 统计数据相关API
export const statisticsAPI = {
  // 获取统计数据
  getStatistics: async () => {
    return request('/statistics');
  },
};

// 系统设置相关API
export const settingsAPI = {
  // 获取系统设置
  getSettings: async () => {
    return request('/settings');
  },

  // 更新系统设置
  updateSettings: async (settings: Record<string, any>) => {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// 通知相关API
export const notificationAPI = {
  // 获取通知列表
  getNotifications: async () => {
    return request('/notifications');
  },

  // 标记通知为已读
  markAsRead: async (id: string) => {
    return request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },
};

// 文件上传相关API
export const uploadAPI = {
  // 上传文件
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '上传失败');
    }

    return response.json();
  },
};

// 健康检查
export const healthAPI = {
  check: async () => {
    return request('/health');
  },
};

export { setToken, getToken, removeToken };
