/**
 * Redux Slice for School Panel State Management
 * Phase 2.10.7.2 - Redux State Management
 * =====================================================
 *
 * Manages the complete state for school search, filtering, and selection.
 * Enforces max 3 selected schools constraint and provides all filter actions.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  School,
  SchoolFilters,
  SchoolPanelState,
  SchoolPanelTab,
} from '../../../types/smartSearch';
import {
  DEFAULT_SCHOOL_FILTERS,
  DEFAULT_SCHOOL_PANEL_STATE,
  MAX_SELECTED_SCHOOLS,
} from '../../../types/smartSearch';

/**
 * Initial state for school panel
 */
const initialState: SchoolPanelState = {
  ...DEFAULT_SCHOOL_PANEL_STATE,
};

/**
 * School panel Redux slice
 */
const schoolPanelSlice = createSlice({
  name: 'schoolPanel',
  initialState,
  reducers: {
    // ========== FILTER ACTIONS ==========

    /**
     * Set school name search query
     */
    setSchoolName: (state, action: PayloadAction<string>) => {
      state.filters.schoolName = action.payload;
    },

    /**
     * Set selective school filter
     */
    setSelectiveSchool: (state, action: PayloadAction<string | undefined>) => {
      state.filters.selectiveSchool = action.payload;
    },

    /**
     * Set education levels (multi-select)
     */
    setEducationLevels: (state, action: PayloadAction<string[]>) => {
      state.filters.educationLevels = action.payload;
    },

    /**
     * Set school types (multi-select)
     */
    setSchoolTypes: (state, action: PayloadAction<string[]>) => {
      state.filters.schoolTypes = action.payload;
    },

    /**
     * Set school genders (multi-select)
     */
    setGenders: (state, action: PayloadAction<string[]>) => {
      state.filters.genders = action.payload;
    },

    /**
     * Set school denominations (multi-select)
     */
    setDenominations: (state, action: PayloadAction<string[]>) => {
      state.filters.denominations = action.payload;
    },

    /**
     * Toggle opportunity class filter
     */
    setOpportunityClass: (state, action: PayloadAction<boolean | undefined>) => {
      state.filters.opportunityClass = action.payload;
    },

    /**
     * Set boarding school filter
     */
    setBoardingSchool: (state, action: PayloadAction<string | undefined>) => {
      state.filters.boardingSchool = action.payload;
    },

    /**
     * Toggle special needs filter
     */
    setSpecialNeeds: (state, action: PayloadAction<boolean | undefined>) => {
      state.filters.specialNeeds = action.payload;
    },

    /**
     * Clear a specific filter by name (for per-filter clear buttons)
     */
    clearFilter: (state, action: PayloadAction<string>) => {
      const filterName = action.payload;
      switch (filterName) {
        case 'schoolName':
          state.filters.schoolName = '';
          break;
        case 'selectiveSchool':
          state.filters.selectiveSchool = undefined;
          break;
        case 'educationLevels':
          state.filters.educationLevels = [];
          break;
        case 'schoolTypes':
          state.filters.schoolTypes = [];
          break;
        case 'genders':
          state.filters.genders = [];
          break;
        case 'denominations':
          state.filters.denominations = [];
          break;
        case 'opportunityClass':
          state.filters.opportunityClass = undefined;
          break;
        case 'boardingSchool':
          state.filters.boardingSchool = undefined;
          break;
        case 'specialNeeds':
          state.filters.specialNeeds = undefined;
          break;
        default:
          break;
      }
    },

    /**
     * Reset all filters to defaults
     */
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_SCHOOL_FILTERS };
    },

    // ========== SEARCH RESULTS ACTIONS ==========

    /**
     * Update search results from API
     */
    setSearchResults: (state, action: PayloadAction<School[]>) => {
      state.searchResults = action.payload;
    },

    /**
     * Clear search results
     */
    clearSearchResults: (state) => {
      state.searchResults = [];
    },

    // ========== SELECTION ACTIONS ==========

    /**
     * Select a school (add to selected, max 3)
     */
    selectSchool: (state, action: PayloadAction<School>) => {
      const school = action.payload;

      console.log('[schoolPanelSlice] selectSchool action received:', {
        school_name: school.school_name,
        school_id: school.school_id,
        catchment_area: school.catchment_area,
        has_catchment_boundary: school.catchment_boundary != null,
        catchment_boundary_type: school.catchment_boundary ? typeof school.catchment_boundary : 'null/undefined',
        full_school_keys: Object.keys(school),
      });

      const isAlreadySelected = state.selectedSchools.some(
        s => s.school_id === school.school_id
      );

      // Prevent duplicate selections
      if (isAlreadySelected) {
        return;
      }

      // Phase 2.16: Auto-deselect previous school when at limit
      if (state.selectedSchools.length >= MAX_SELECTED_SCHOOLS) {
        console.log('[schoolPanelSlice] Auto-deselecting previous school:', state.selectedSchools[0]?.school_name);
        state.selectedSchools = []; // Clear previous selection
      }

      // Enforce max selected schools (now only allows 1)
      if (state.selectedSchools.length < MAX_SELECTED_SCHOOLS) {
        state.selectedSchools.push({
          ...school,
          has_catchment_boundary: school.catchment_boundary != null
        });
        console.log('[schoolPanelSlice] School added to selectedSchools. Total selected:', state.selectedSchools.length);
      }
    },

    /**
     * Deselect a school by ID
     */
    deselectSchool: (state, action: PayloadAction<string>) => {
      const schoolId = action.payload;
      const schoolToDeselect = state.selectedSchools.find(s => s.school_id === schoolId);
      console.log('[schoolPanelSlice] deselectSchool action received:', {
        schoolId,
        schoolName: schoolToDeselect?.school_name || 'NOT FOUND',
        currentSelectedCount: state.selectedSchools.length,
      });
      state.selectedSchools = state.selectedSchools.filter(
        s => s.school_id !== schoolId
      );
      console.log('[schoolPanelSlice] After deselect, selectedSchools count:', state.selectedSchools.length);
    },

    /**
     * Clear all selected schools
     */
    clearSelectedSchools: (state) => {
      console.log('[schoolPanelSlice] clearSelectedSchools called! Previous count:', state.selectedSchools.length);
      console.trace('[schoolPanelSlice] clearSelectedSchools stack trace');
      state.selectedSchools = [];
    },

    // ========== MAP VISIBILITY ACTIONS ==========

    /**
     * Toggle map marker visibility
     */
    toggleShowMarkersOnMap: (state, action: PayloadAction<boolean>) => {
      state.showMarkersOnMap = action.payload;
    },

    /**
     * Update visible school markers within map bounds
     */
    setVisibleSchoolMarkers: (state, action: PayloadAction<School[]>) => {
      state.visibleSchoolMarkers = action.payload;
    },

    /**
     * Clear visible markers
     */
    clearVisibleMarkers: (state) => {
      state.visibleSchoolMarkers = [];
    },

    // ========== LOADING/ERROR ACTIONS ==========

    /**
     * Set loading state for API calls
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error message
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },

    // ========== TAB ACTIONS - Phase 2.47 ==========

    /**
     * Set active panel tab
     */
    setSchoolPanelTab: (state, action: PayloadAction<SchoolPanelTab>) => {
      state.activeTab = action.payload;
    },

    // ========== BATCH ACTIONS ==========

    /**
     * Reset entire school panel state to defaults
     */
    resetPanel: (state) => {
      return { ...initialState };
    },
  },
});

/**
 * Export all actions
 */
export const {
  // Filter actions
  setSchoolName,
  setSelectiveSchool,
  setEducationLevels,
  setSchoolTypes,
  setGenders,
  setDenominations,
  setOpportunityClass,
  setBoardingSchool,
  setSpecialNeeds,
  clearFilter,
  resetFilters,
  // Search results actions
  setSearchResults,
  clearSearchResults,
  // Selection actions
  selectSchool,
  deselectSchool,
  clearSelectedSchools,
  // Map visibility actions
  toggleShowMarkersOnMap,
  setVisibleSchoolMarkers,
  clearVisibleMarkers,
  // Loading/error actions
  setLoading,
  setError,
  clearError,
  // Tab actions - Phase 2.47
  setSchoolPanelTab,
  // Batch actions
  resetPanel,
} = schoolPanelSlice.actions;

/**
 * Export reducer as default
 */
export default schoolPanelSlice.reducer;
