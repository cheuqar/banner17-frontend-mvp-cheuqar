import { createTheme } from '@mui/material/styles';
import { style4V2SharedTheme } from './style4V2SharedTheme';

/**
 * Precision Monochrome Theme Extension
 *
 * Feature: Smart Search UI Redesign
 * Spec: specs/001-smart-search-ui-redesign/
 *
 * Extends Style4-V2 theme with strict monochrome palette and 4px spacing system
 * for Smart Search property interface redesign.
 */
export const monochromeTheme = createTheme(style4V2SharedTheme, {
  palette: {
    primary: {
      main: '#0b2d2c',        // Dark teal for primary actions (FR-012: Apply button)
      contrastText: '#FFFFFF', // White text on dark teal
    },
    secondary: {
      main: '#666666',        // Gray for secondary text (FR-001, FR-004)
    },
    background: {
      default: '#FFFFFF',     // White background (FR-006: Filter bar)
      paper: '#FAFAFA',       // Light gray for hover states (FR-019: Card hover)
    },
    divider: '#E0E0E0',       // Border gray (FR-018: Card borders)
    text: {
      primary: '#0b2d2c',     // Dark teal primary text (FR-002: Price, FR-003: Address)
      secondary: '#666666',   // Gray secondary text (FR-001: Type label, FR-004: Suburb/state)
    },
  },
  spacing: 4,                  // 4px base unit (FR-029)
  typography: {
    fontFamily: '"Amplitude", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    // Property Card Typography
    h1: {
      fontSize: '20px',       // FR-002: Property price
      fontWeight: 700,
      color: '#0b2d2c',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '16px',       // Header text
      fontWeight: 700,
      color: '#0b2d2c',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '14px',       // FR-003: Address
      fontWeight: 500,
      color: '#0b2d2c',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '14px',       // Standard body text
      fontWeight: 400,
      color: '#0b2d2c',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '13px',       // FR-004: Suburb/state, FR-005: Amenities
      fontWeight: 400,
      color: '#666666',
      lineHeight: 1.4,
    },
    caption: {
      fontSize: '11px',       // FR-001: Property type label
      fontWeight: 700,
      color: '#666666',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      lineHeight: 1.2,
    },
    button: {
      fontSize: '14px',       // FR-012: Apply button, FR-043: Search This Area
      fontWeight: 500,
      lineHeight: 1.2,
    },
  },
  shape: {
    borderRadius: 6,          // FR-042: 6px for inputs/buttons, 0px for cards (override at component level)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 200ms ease', // FR-013: 200ms transitions
          '&:hover': {
            transform: 'translateY(-1px)', // FR-013, FR-045: 1px lift
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // FR-013: Apply button hover shadow
          },
        },
        contained: {
          backgroundColor: '#0b2d2c', // FR-012: Dark teal background
          color: '#FFFFFF',          // White text
          '&:hover': {
            backgroundColor: '#0b2d2c',
          },
        },
        outlined: {
          border: '2px solid #0b2d2c', // FR-044: Search This Area button border
          color: '#0b2d2c',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0b2d2c', // FR-045: Inverse hover
            color: '#FFFFFF',
            border: '2px solid #0b2d2c',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#F5F5F5', // FR-008: Input background
            borderRadius: '6px',
            height: '40px',            // FR-009: Input height
            '& fieldset': {
              borderColor: '#E0E0E0',  // FR-008: Default border
              borderWidth: '1px',
            },
            '&:hover': {
              backgroundColor: '#EBEBEB', // FR-011: Hover background
              '& fieldset': {
                borderColor: '#E0E0E0',
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#F5F5F5',
              '& fieldset': {
                borderColor: '#0b2d2c', // FR-010: Focus border
                borderWidth: '2px',
              },
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '0 12px',         // FR-009: Horizontal padding
            fontSize: '14px',
            lineHeight: '40px',
          },
        },
      },
    },
  },
});

/**
 * High Contrast Mode Override
 *
 * FR-035: Enhance contrast beyond standard when user has OS-level high contrast enabled
 */
export const highContrastOverrides = {
  '@media (prefers-contrast: high)': {
    ':root': {
      '--border-gray': '#0b2d2c',     // Enhance from #E0E0E0
      '--secondary-text': '#0b2d2c',  // Enhance from #666666
    },
  },
};

/**
 * Color Palette Constants
 *
 * Strict monochrome palette for direct use in components
 */
export const monochromeColors = {
  primaryBlack: '#0b2d2c',    // Primary text, focused borders, active buttons
  primaryWhite: '#FFFFFF',    // Backgrounds, button text on dark teal
  lightGray: '#F5F5F5',       // Input backgrounds, skeleton loaders
  borderGray: '#E0E0E0',      // Borders, dividers, inactive elements
  secondaryText: '#666666',   // Secondary text, labels
  hoverBg: '#FAFAFA',         // Hover backgrounds for cards
  inputHover: '#EBEBEB',      // Input hover backgrounds
};

/**
 * Spacing System Constants (4px base)
 *
 * FR-029: All spacing MUST follow 4px base unit
 */
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 24,   // 24px
  xxl: 32,  // 32px
  xxxl: 48, // 48px
};

/**
 * Transition Durations
 *
 * FR-033: All hover transitions 200-300ms for sleek feel
 */
export const transitions = {
  fast: '200ms',     // Hover states, focus states
  medium: '300ms',   // Image grayscale transition
  slow: '400ms',     // Page load animations
};
