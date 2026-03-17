import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SystemState {
  collapsed: boolean;
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  notifications: Notification[];
  systemInfo: {
    version: string;
    uptime: number;
    memory: number;
    cpu: number;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read: boolean;
}

const initialState: SystemState = {
  collapsed: false,
  theme: 'light',
  language: 'zh-CN',
  notifications: [],
  systemInfo: {
    version: '1.0.0',
    uptime: 0,
    memory: 0,
    cpu: 0,
  },
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
    },
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'zh-CN' | 'en-US'>) => {
      state.language = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateSystemInfo: (state, action: PayloadAction<Partial<SystemState['systemInfo']>>) => {
      state.systemInfo = { ...state.systemInfo, ...action.payload };
    },
  },
});

export const {
  toggleCollapsed,
  setCollapsed,
  setTheme,
  setLanguage,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
  updateSystemInfo,
} = systemSlice.actions;

export default systemSlice.reducer;
