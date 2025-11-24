/**
 * Redux Slice: Search Filters for Smart Search Header Redesign (Feature 003)
 * 
 * This slice manages the state for header filters:
 * - Transaction Type (Buy/Sell/Sold)
 * - State Filter (NSW/VIC/QLD/etc)
 * - School Panel Toggle
 * - Selected Schools
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  SearchFiltersState, 
  TransactionType, 
  StateCode 
} from '../../types/searchFilters';

/**
 * Initial State
 * All filters start as null/empty to allow users to browse without restrictions
 */
const initialState: SearchFiltersState = {
  transactionType: null,        // No default selection
  stateFilter: null,            // No default selection
  schoolPanelOpen: false,       // School panel starts closed
  selectedSchools: [],          // No schools selected initially
  lastUpdated: 0,               // Will be set on first update
};

/**
 * Search Filters Slice
 */
const searchFiltersSlice = createSlice({
  name: 'searchFilters',
  initialState,
  reducers: {
    /**
     * Set Transaction Type (Buy/Sell/Sold)
     * FR-003, FR-004, FR-005
     */
    setTransactionType: (state, action: PayloadAction<TransactionType>) => {
      state.transactionType = action.payload;
      state.lastUpdated = Date.now();
      console.log('[SearchFilters] Transaction type set to:', action.payload);
    },

    /**
     * Set State Filter (NSW/VIC/etc)
     * FR-015, FR-016, FR-017, FR-018
     */
    setStateFilter: (state, action: PayloadAction<StateCode | null>) => {
      state.stateFilter = action.payload;
      state.lastUpdated = Date.now();
      console.log('[SearchFilters] State filter set to:', action.payload);
    },

    /**
     * Toggle School Panel
     * FR-006, FR-007, FR-008
     */
    toggleSchoolPanel: (state) => {
      state.schoolPanelOpen = !state.schoolPanelOpen;
      state.lastUpdated = Date.now();
      console.log('[SearchFilters] School panel toggled:', state.schoolPanelOpen);
    },

    /**
     * Update Selected Schools
     * Used when user selects/deselects schools in the panel
     */
    setSelectedSchools: (state, action: PayloadAction<string[]>) => {
      state.selectedSchools = action.payload;
      state.lastUpdated = Date.now();
      console.log('[SearchFilters] Selected schools updated:', action.payload.length);
    },

    /**
     * Auto-Clear State Filter on Cross-State Search
     * Q1 Clarification: Clear state filter when user searches address in different state
     * 
     * Example: User has NSW filter active, searches Melbourne VIC → clear NSW filter
     */
    autoCleanStateFilter: (state, action: PayloadAction<StateCode>) => {
      const addressState = action.payload;
      
      // Only clear if current state filter doesn't match the detected address state
      if (state.stateFilter && state.stateFilter !== addressState) {
        console.log(`[SearchFilters] Auto-clearing state filter: ${state.stateFilter} → null (address in ${addressState})`);
        state.stateFilter = null;
        state.lastUpdated = Date.now();
      } else {
        console.log(`[SearchFilters] No auto-clean needed: filter=${state.stateFilter}, address=${addressState}`);
      }
    },

    /**
     * Clear All Filters
     * Reset to initial state
     */
    clearSearchFilters: (state) => {
      state.transactionType = null;
      state.stateFilter = null;
      state.schoolPanelOpen = false;
      state.selectedSchools = [];
      state.lastUpdated = Date.now();
      console.log('[SearchFilters] All filters cleared');
    },
  },
});

// Export actions
export const {
  setTransactionType,
  setStateFilter,
  toggleSchoolPanel,
  setSelectedSchools,
  autoCleanStateFilter,
  clearSearchFilters,
} = searchFiltersSlice.actions;

// Export reducer
export default searchFiltersSlice.reducer;

// Export selectors for easy state access
export const selectTransactionType = (state: { searchFilters: SearchFiltersState }) => 
  state.searchFilters.transactionType;

export const selectStateFilter = (state: { searchFilters: SearchFiltersState }) => 
  state.searchFilters.stateFilter;

export const selectSchoolPanelOpen = (state: { searchFilters: SearchFiltersState }) => 
  state.searchFilters.schoolPanelOpen;

export const selectSelectedSchools = (state: { searchFilters: SearchFiltersState }) => 
  state.searchFilters.selectedSchools || [];

export const selectLastUpdated = (state: { searchFilters: SearchFiltersState }) => 
  state.searchFilters.lastUpdated;

