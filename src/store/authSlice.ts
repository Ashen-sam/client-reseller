import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AccountLimits } from '../types';

interface AuthState {
  user: User | null;
  limits: AccountLimits | null;
}

const initialState: AuthState = {
  user: null,
  limits: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ user: User; limits: AccountLimits }>) {
      state.user = action.payload.user;
      state.limits = action.payload.limits;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      if (!action.payload) state.limits = null;
    },
    clearAuth(state) {
      state.user = null;
      state.limits = null;
    },
  },
});

export const { setSession, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
