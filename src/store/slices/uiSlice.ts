import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Layout, PanelState } from '../../types';

interface UIState {
  layout: {
    panelConfiguration: string;
    customLayouts: Layout[];
    panelStates: Record<string, PanelState>;
    panelSizes: Record<string, { width: number; height: number }>;
    panelPositions: Record<string, { x: number; y: number }>;
    minimizedPanels: string[];
  };
  loading: boolean;
  error: string | null;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
}

const initialState: UIState = {
  layout: {
    panelConfiguration: 'default',
    customLayouts: [],
    panelStates: {},
    panelSizes: {},
    panelPositions: {},
    minimizedPanels: [],
  },
  loading: false,
  error: null,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPanelConfiguration: (state, action: PayloadAction<string>) => {
      state.layout.panelConfiguration = action.payload;
    },
    updatePanelState: (state, action: PayloadAction<{ panelId: string; panelState: PanelState }>) => {
      const { panelId, panelState } = action.payload;
      state.layout.panelStates[panelId] = panelState;
    },
    updatePanelSize: (state, action: PayloadAction<{ panelId: string; size: { width: number; height: number } }>) => {
      const { panelId, size } = action.payload;
      state.layout.panelSizes[panelId] = size;
    },
    updatePanelPosition: (state, action: PayloadAction<{ panelId: string; position: { x: number; y: number } }>) => {
      const { panelId, position } = action.payload;
      state.layout.panelPositions[panelId] = position;
    },
    minimizePanel: (state, action: PayloadAction<string>) => {
      if (!state.layout.minimizedPanels.includes(action.payload)) {
        state.layout.minimizedPanels.push(action.payload);
      }
    },
    maximizePanel: (state, action: PayloadAction<string>) => {
      state.layout.minimizedPanels = state.layout.minimizedPanels.filter(id => id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      type: 'info' | 'success' | 'warning' | 'error';
      message: string;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setPanelConfiguration,
  updatePanelState,
  updatePanelSize,
  updatePanelPosition,
  minimizePanel,
  maximizePanel,
  setLoading,
  setError,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer; 