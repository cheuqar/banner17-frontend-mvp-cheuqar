/**
 * Theme Slice - Smart Search Theme Management
 *
 * Manages theme state for Smart Search page with two theme options:
 * - Theme-A: Warm teal theme (current default)
 * - Theme-B: Cool cyan theme
 *
 * Features:
 * - Theme selection persistence via Redux Persist
 * - Dynamic color switching for all SmartSearch components
 * - Logo switching based on theme
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Theme type definition
 */
export type ThemeType = 'theme-a' | 'theme-b';

/**
 * Theme colors configuration
 */
export interface ThemeColors {
  logo: string;
  linkButtonActive: string;  // Active state for navigation buttons
  primaryDark: string;        // Header backgrounds, text colors
  primaryLight: string;       // Panel backgrounds, light text
}

/**
 * Theme configurations
 */
export const THEMES: Record<ThemeType, ThemeColors> = {
  'theme-a': {
    logo: '/banner17-logo-option-a.png',
    linkButtonActive: '#f0492e',
    primaryDark: '#0b2d2c',
    primaryLight: '#fff0de',
  },
  'theme-b': {
    logo: '/banner17-logo-option-b.png',
    linkButtonActive: '#e47525',
    primaryDark: '#022e35',
    primaryLight: '#cdecf5',
  },
};

/**
 * Border color helper - dull tan/beige version of background
 */
export const THEME_BORDERS: Record<ThemeType, string> = {
  'theme-a': '#d9cbb6', // Dull tan (shadow of #fff0de)
  'theme-b': '#a8c8d4', // Dull cyan (shadow of #cdecf5)
};

/**
 * Theme state interface
 */
interface ThemeState {
  currentTheme: ThemeType;
}

/**
 * Initial state
 */
const initialState: ThemeState = {
  currentTheme: 'theme-a', // Default to Theme-A (warm teal)
};

/**
 * Theme slice
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Set the current theme
     */
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.currentTheme = action.payload;
      console.log(`[Theme] Switched to ${action.payload}`);
    },

    /**
     * Toggle between themes
     */
    toggleTheme: (state) => {
      state.currentTheme = state.currentTheme === 'theme-a' ? 'theme-b' : 'theme-a';
      console.log(`[Theme] Toggled to ${state.currentTheme}`);
    },
  },
});

/**
 * Export actions
 */
export const { setTheme, toggleTheme } = themeSlice.actions;

/**
 * Export reducer
 */
export default themeSlice.reducer;

/**
 * Selectors
 */
export const selectCurrentTheme = (state: { theme: ThemeState }) => state.theme.currentTheme;
export const selectThemeColors = (state: { theme: ThemeState }): ThemeColors =>
  THEMES[state.theme.currentTheme];
export const selectThemeBorder = (state: { theme: ThemeState }): string =>
  THEME_BORDERS[state.theme.currentTheme];
