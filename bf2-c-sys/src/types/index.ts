// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled' | 'pending';
  createdAt: string;
  lastLoginAt?: string | null;
}

// 内容相关类型
export interface Content {
  id: string;
  title: string;
  type: 'text' | 'image' | 'video';
  category: string;
  status: 'published' | 'draft' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  thumbnail?: string;
  description?: string;
}

// 统计数据类型
export interface Statistics {
  totalUsers: number;
  todayVisits: number;
  orders: number;
  revenue: number;
  userGrowth: number;
  visitGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

// 图表数据类型
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// 系统设置类型
export interface SystemSettings {
  basic: {
    systemName: string;
    systemLogo: string;
    systemDescription: string;
    contactEmail: string;
    contactPhone: string;
  };
  security: {
    passwordMinLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: string;
    enableCaptcha: boolean;
    enableSms: boolean;
    enableTwoFactor: boolean;
    rememberLogin: boolean;
    ipWhitelist: string[];
    sessionTimeout: number;
    maxConcurrentSessions: number;
  };
  notification: {
    smtp: {
      server: string;
      port: number;
      email: string;
      password: string;
      enableSsl: boolean;
    };
    sms: {
      provider: string;
      accessKey: string;
    };
    enableSystemNotification: boolean;
    enableUserRegistration: boolean;
    enableLoginVerification: boolean;
    enablePasswordReset: boolean;
    enableImportantNotification: boolean;
  };
  backup: {
    enableAutoBackup: boolean;
    backupDatabase: boolean;
    backupFiles: boolean;
    backupFrequency: string;
    backupTime: string;
    backupRetention: number;
    backupPath: string;
  };
  theme: {
    mode: 'light' | 'dark';
    language: 'zh-CN' | 'en-US';
    primaryColor: string;
    showBreadcrumb: boolean;
    showLoadingAnimation: boolean;
    compactMode: boolean;
    fixedSidebar: boolean;
  };
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

// 分页类型
export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

// 表格列类型
export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItem[];
  path?: string;
}

// 通知类型
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read: boolean;
}

// 系统信息类型
export interface SystemInfo {
  version: string;
  uptime: number;
  memory: number;
  cpu: number;
  disk: number;
}
