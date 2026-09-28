import { createSlice } from '@reduxjs/toolkit';

type AppState = {
  title: string;
  sidebarCollapsed?: boolean;
};
const appSlice = createSlice({
  name: 'app',
  initialState: { title: 'My Application', sidebarCollapsed: false } as AppState,
  reducers: {
    setTitle(state, action) {
      state.title = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { setTitle, toggleSidebar } = appSlice.actions;
export default appSlice.reducer;
