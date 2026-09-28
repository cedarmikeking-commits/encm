import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { http } from '@/api/http';
// src/store/modules/menu.ts

export const fetchMenuAsync = createAsyncThunk('menu/fetch', async () => {
  const res = await http.get('/menu');
  return res.data;
});

const menuSlice = createSlice({
  name: 'menu',
  initialState: { menuList: [], loading: false, loaded: false },
  reducers: {
    setMenu(state, action) {
      state.menuList = action.payload;
      state.loaded = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMenuAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.menuList = action.payload;
      })
      .addCase(fetchMenuAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectMenu = (state: any) => state.menu;
export const { setMenu } = menuSlice.actions;
export default menuSlice.reducer;
