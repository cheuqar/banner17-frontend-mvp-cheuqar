/**
 * CompactThemeSwitcher - Compact theme switching dropdown
 *
 * A reusable, minimal theme switcher component for placement in footers
 * and at the bottom of pages. Designed to be subtle and non-intrusive.
 *
 * Features:
 * - Small FormControl with Select dropdown
 * - Color indicator dots for each theme
 * - Redux integration for theme state
 * - Minimal visual footprint
 */

import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  setTheme,
  selectCurrentTheme,
  THEMES,
  type ThemeType,
} from '../../store/slices/themeSlice';

/**
 * Theme label configuration
 */
const THEME_LABELS: Record<ThemeType, string> = {
  'theme-a': 'Warm Teal',
  'theme-b': 'Cool Cyan',
};

interface CompactThemeSwitcherProps {
  /** Optional label text (default: "Theme") */
  label?: string;
  /** Optional dark mode for light backgrounds (inverts colors) */
  darkMode?: boolean;
}

export const CompactThemeSwitcher: React.FC<CompactThemeSwitcherProps> = ({
  label = 'Theme',
  darkMode = false,
}) => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectCurrentTheme);

  const handleThemeChange = (event: SelectChangeEvent<ThemeType>) => {
    dispatch(setTheme(event.target.value as ThemeType));
  };

  // Colors based on mode
  const textColor = darkMode ? '#666666' : '#999999';
  const borderColor = darkMode ? '#d0d0d0' : '#555555';
  const hoverBorderColor = darkMode ? '#999999' : '#888888';
  const bgColor = darkMode ? '#ffffff' : 'transparent';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {/* Optional Label */}
      {label && (
        <Typography
          sx={{
            fontSize: '12px',
            color: textColor,
            fontWeight: 500,
          }}
        >
          {label}:
        </Typography>
      )}

      {/* Compact Select Dropdown */}
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <Select
          value={currentTheme}
          onChange={handleThemeChange}
          displayEmpty
          sx={{
            fontSize: '12px',
            height: 28,
            bgcolor: bgColor,
            borderRadius: '6px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: borderColor,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: hoverBorderColor,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: hoverBorderColor,
              borderWidth: 1,
            },
            '& .MuiSelect-select': {
              py: 0.5,
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
            '& .MuiSelect-icon': {
              color: textColor,
              fontSize: '18px',
            },
          }}
          renderValue={(value) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Color dot indicator */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: THEMES[value as ThemeType].primaryDark,
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.15)',
                  flexShrink: 0,
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontSize: '12px',
                  color: textColor,
                  fontWeight: 500,
                }}
              >
                {THEME_LABELS[value as ThemeType]}
              </Typography>
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              sx: {
                mt: 0.5,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '& .MuiMenuItem-root': {
                  fontSize: '12px',
                  py: 1,
                  px: 1.5,
                  gap: 1,
                },
              },
            },
          }}
        >
          {(Object.keys(THEMES) as ThemeType[]).map((themeKey) => (
            <MenuItem key={themeKey} value={themeKey}>
              {/* Color dot indicator */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: THEMES[themeKey].primaryDark,
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.15)',
                  flexShrink: 0,
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontSize: '12px',
                  fontWeight: currentTheme === themeKey ? 600 : 400,
                }}
              >
                {THEME_LABELS[themeKey]}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CompactThemeSwitcher;
