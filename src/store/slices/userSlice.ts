import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  name?: string;
  role_id?: number;
}

interface UserState {
  user: User;
  authUser: AuthUser | null;
  userProfile: UserProfile | null;
  session: any | null;
}

const initialState: UserState = {
  user: {
    id: null,
    profile: null,
    preferences: {
      panelLayout: 'default',
      customLayouts: [],
      preferredInputTypes: {},
      assistanceLevel: 'full',
    },
    isAuthenticated: false,
  },
  authUser: null,
  userProfile: null,
  session: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.authUser = action.payload;
      state.user.isAuthenticated = !!action.payload;
      if (action.payload) {
        state.user.id = action.payload.id;
      }
    },
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload;
      if (action.payload) {
        state.user.profile = {
          name: action.payload.name || action.payload.full_name || 'User',
          email: action.payload.email,
          avatar: action.payload.avatar_url || undefined,
        };
      }
    },
    setSession: (state, action: PayloadAction<any | null>) => {
      state.session = action.payload;
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
      state.user.preferences = { ...state.user.preferences, ...action.payload };
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.user.isAuthenticated = action.payload;
    },
    clearUser: (state) => {
      state.user = initialState.user;
      state.authUser = null;
      state.userProfile = null;
      state.session = null;
    },
  },
});

export const {
  setUser,
  setAuthUser,
  setUserProfile,
  setSession,
  updateUserPreferences,
  setAuthenticated,
  clearUser
} = userSlice.actions;
export default userSlice.reducer; 