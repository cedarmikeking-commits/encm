import { createSlice } from '@reduxjs/toolkit';

import { getToken } from '@/utils/auth';

type UserState = {
  name: string;
  loggedIn: boolean;
  token: string | null;
  refreshToken?: string | null;
};
const userSlice = createSlice({
  name: 'user',
  initialState: { name: '', loggedIn: false, token: getToken(), refreshToken: null } as UserState,
  reducers: {
    logIn(state, action) {
      state.name = action.payload.name;
      state.loggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('token', action.payload.token!);
    },
    logOut(state) {
      state.name = '';
      state.loggedIn = false;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
});

export const { logIn, logOut } = userSlice.actions;
export default userSlice.reducer;
