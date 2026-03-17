import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface UserState {
  users: User[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  searchKeyword: string;
  selectedUsers: string[];
}

const initialState: UserState = {
  users: [],
  loading: false,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  searchKeyword: '',
  selectedUsers: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload;
    },
    setSelectedUsers: (state, action: PayloadAction<string[]>) => {
      state.selectedUsers = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
      state.selectedUsers = state.selectedUsers.filter(id => id !== action.payload);
    },
  },
});

export const {
  setUsers,
  setLoading,
  setTotal,
  setCurrentPage,
  setPageSize,
  setSearchKeyword,
  setSelectedUsers,
  updateUser,
  deleteUser,
} = userSlice.actions;

export default userSlice.reducer;
