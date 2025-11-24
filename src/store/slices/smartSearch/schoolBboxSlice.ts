import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { School } from '../../../types/smartSearch';

export interface SchoolBboxState {
  /** Schools fetched from the bbox endpoint */
  schools: School[];

  /** Loading state while fetching from bbox */
  loading: boolean;

  /** Error message if fetch fails */
  error: string | null;

  /** Last bounds that were fetched (to avoid re-fetching same area) */
  lastBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

const initialState: SchoolBboxState = {
  schools: [],
  loading: false,
  error: null,
  lastBounds: undefined,
};

export const schoolBboxSlice = createSlice({
  name: 'schoolBbox',
  initialState,
  reducers: {
    // Set schools fetched from bbox endpoint
    setSchoolsInBounds: (state, action: PayloadAction<School[]>) => {
      state.schools = action.payload;
      state.error = null;
    },

    // Set loading state
    setBboxLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setBboxError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Track last fetched bounds
    setLastBounds: (state, action: PayloadAction<SchoolBboxState['lastBounds']>) => {
      state.lastBounds = action.payload;
    },

    // Clear all bbox schools when toggle is disabled
    clearSchoolsInBounds: (state) => {
      state.schools = [];
      state.loading = false;
      state.error = null;
      state.lastBounds = undefined;
    },
  },
});

export const {
  setSchoolsInBounds,
  setBboxLoading,
  setBboxError,
  setLastBounds,
  clearSchoolsInBounds,
} = schoolBboxSlice.actions;

export default schoolBboxSlice.reducer;

// Selectors
export const selectSchoolsInBounds = (state: any) => state.schoolBbox.schools;
export const selectBboxLoading = (state: any) => state.schoolBbox.loading;
export const selectBboxError = (state: any) => state.schoolBbox.error;
export const selectLastBounds = (state: any) => state.schoolBbox.lastBounds;
export const selectBboxSchoolCount = (state: any) => state.schoolBbox.schools.length;
