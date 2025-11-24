/**
 * Redux Selectors for School Panel State
 * Phase 2.10.7.2 - Redux State Management
 * =====================================================
 *
 * Provides efficient selector functions for accessing school panel state
 * with proper memoization for performance optimization.
 */

import type { RootState } from '../../index';
import type { School, SchoolFilters } from '../../../types/smartSearch';
import { MAX_SELECTED_SCHOOLS } from '../../../types/smartSearch';

// ========== ROOT SELECTOR ==========

/**
 * Get entire school panel state
 */
export const selectSchoolPanel = (state: RootState) =>
  state.schoolPanel;

// ========== FILTER SELECTORS ==========

/**
 * Get all school filters
 */
export const selectSchoolFilters = (state: RootState): SchoolFilters =>
  state.schoolPanel.filters;

/**
 * Get school name search query
 */
export const selectSchoolName = (state: RootState): string =>
  state.schoolPanel.filters.schoolName;

/**
 * Get selective school filter value
 */
export const selectSelectiveSchool = (state: RootState): string | undefined =>
  state.schoolPanel.filters.selectiveSchool;

/**
 * Get education levels filter
 */
export const selectEducationLevels = (state: RootState): string[] =>
  state.schoolPanel.filters.educationLevels;

/**
 * Get school types filter
 */
export const selectSchoolTypes = (state: RootState): string[] =>
  state.schoolPanel.filters.schoolTypes;

/**
 * Get genders filter
 */
export const selectGenders = (state: RootState): string[] =>
  state.schoolPanel.filters.genders;

/**
 * Get denominations filter
 */
export const selectDenominations = (state: RootState): string[] =>
  state.schoolPanel.filters.denominations;

/**
 * Get opportunity class filter
 */
export const selectOpportunityClass = (state: RootState): boolean | undefined =>
  state.schoolPanel.filters.opportunityClass;

/**
 * Get boarding school filter
 */
export const selectBoardingSchool = (state: RootState): string | undefined =>
  state.schoolPanel.filters.boardingSchool;

/**
 * Get special needs filter
 */
export const selectSpecialNeeds = (state: RootState): boolean | undefined =>
  state.schoolPanel.filters.specialNeeds;

/**
 * Check if any filters are active
 */
export const selectHasActiveFilters = (state: RootState): boolean => {
  const filters = state.schoolPanel.filters;
  return (
    filters.schoolName !== '' ||
    filters.selectiveSchool !== undefined ||
    filters.educationLevels.length > 0 ||
    filters.schoolTypes.length > 0 ||
    filters.genders.length > 0 ||
    filters.denominations.length > 0 ||
    filters.opportunityClass !== undefined ||
    filters.boardingSchool !== undefined ||
    filters.specialNeeds !== undefined
  );
};

// ========== SEARCH RESULTS SELECTORS ==========

/**
 * Get search results
 */
export const selectSearchResults = (state: RootState): School[] =>
  state.schoolPanel.searchResults;

/**
 * Get count of search results
 */
export const selectSearchResultsCount = (state: RootState): number =>
  state.schoolPanel.searchResults.length;

/**
 * Check if search results are empty
 */
export const selectIsSearchResultsEmpty = (state: RootState): boolean =>
  state.schoolPanel.searchResults.length === 0;

// ========== SELECTION SELECTORS ==========

/**
 * Get selected schools
 */
export const selectSelectedSchools = (state: RootState): School[] =>
  state.schoolPanel.selectedSchools;

/**
 * Get count of selected schools
 */
export const selectSelectedSchoolsCount = (state: RootState): number =>
  state.schoolPanel.selectedSchools.length;

/**
 * Check if school is selected by ID
 */
export const selectIsSchoolSelected = (state: RootState, schoolId: string): boolean =>
  state.schoolPanel.selectedSchools.some(s => s.school_id === schoolId);

/**
 * Check if can select more schools (less than max)
 */
export const selectCanSelectMore = (state: RootState): boolean =>
  state.schoolPanel.selectedSchools.length < MAX_SELECTED_SCHOOLS;

/**
 * Get remaining selection slots
 */
export const selectRemainingSelectionSlots = (state: RootState): number =>
  Math.max(0, MAX_SELECTED_SCHOOLS - state.schoolPanel.selectedSchools.length);

/**
 * Check if maximum schools selected
 */
export const selectIsMaxSchoolsSelected = (state: RootState): boolean =>
  state.schoolPanel.selectedSchools.length >= MAX_SELECTED_SCHOOLS;

/**
 * Get first selected school
 */
export const selectFirstSelectedSchool = (state: RootState): School | null =>
  state.schoolPanel.selectedSchools.length > 0
    ? state.schoolPanel.selectedSchools[0]
    : null;

// ========== MAP VISIBILITY SELECTORS ==========

/**
 * Get marker visibility toggle state
 */
export const selectShowMarkersOnMap = (state: RootState): boolean =>
  state.schoolPanel.showMarkersOnMap;

/**
 * Get visible school markers
 */
export const selectVisibleSchoolMarkers = (state: RootState): School[] =>
  state.schoolPanel.visibleSchoolMarkers;

/**
 * Get count of visible markers
 */
export const selectVisibleMarkerCount = (state: RootState): number =>
  state.schoolPanel.visibleSchoolMarkers.length;

// ========== LOADING/ERROR SELECTORS ==========

/**
 * Get loading state
 */
export const selectLoading = (state: RootState): boolean =>
  state.schoolPanel.loading;

/**
 * Get error message
 */
export const selectError = (state: RootState): string | null =>
  state.schoolPanel.error;

/**
 * Check if there's an error
 */
export const selectHasError = (state: RootState): boolean =>
  state.schoolPanel.error !== null;

// ========== COMPUTED SELECTORS ==========

/**
 * Get school by ID from search results
 */
export const selectSchoolFromResults = (
  state: RootState,
  schoolId: string
): School | null => {
  const school = state.schoolPanel.searchResults.find(s => s.school_id === schoolId);
  return school || null;
};

/**
 * Get school by ID from selected schools
 */
export const selectSelectedSchoolById = (
  state: RootState,
  schoolId: string
): School | null => {
  const school = state.schoolPanel.selectedSchools.find(s => s.school_id === schoolId);
  return school || null;
};

/**
 * Get selected schools with basic metadata
 */
export const selectSelectedSchoolsMetadata = (state: RootState) =>
  state.schoolPanel.selectedSchools.map(school => ({
    id: school.school_id,
    name: school.school_name,
    type: school.school_type,
    address: school.address,
  }));

/**
 * Check if panel is ready for use (not loading, no error)
 */
export const selectPanelIsReady = (state: RootState): boolean =>
  !state.schoolPanel.loading && !state.schoolPanel.error;

/**
 * Get panel status message
 */
export const selectPanelStatus = (state: RootState): string => {
  if (state.schoolPanel.loading) {
    return 'Loading schools...';
  }
  if (state.schoolPanel.error) {
    return `Error: ${state.schoolPanel.error}`;
  }
  if (state.schoolPanel.searchResults.length === 0) {
    return 'No results found';
  }
  return `${state.schoolPanel.searchResults.length} schools found`;
};
