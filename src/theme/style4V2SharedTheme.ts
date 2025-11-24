import { createTheme } from '@mui/material/styles';

/**
 * Shared Style4-V2 Theme Configuration
 * Can be used across landing page, property listing, and chat interface
 */
export const style4V2SharedTheme = createTheme({
  palette: {
    primary: {
      main: '#0b2d2c',
      dark: '#0b2d2c',
      light: '#333333',
    },
    secondary: {
      main: '#666666',
      dark: '#333333',
      light: '#999999',
    },
    text: {
      primary: '#0b2d2c',
      secondary: '#666666',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    divider: '#e5e5e5',
  },
  typography: {
    fontFamily: '"Amplitude", "Segoe UI", Roboto, system-ui, sans-serif',
    h1: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.15,
      color: '#0b2d2c',
      '@media (max-width:900px)': {
        fontSize: '2.25rem',
      },
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.25,
      color: '#0b2d2c',
      '@media (max-width:900px)': {
        fontSize: '1.875rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#0b2d2c',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#0b2d2c',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#0b2d2c',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#0b2d2c',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#0b2d2c',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#666666',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          fontSize: '1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          backgroundColor: '#0b2d2c',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlined: {
          borderColor: '#0b2d2c',
          color: '#0b2d2c',
          borderWidth: '2px',
          '&:hover': {
            borderColor: '#0b2d2c',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e5e5e5',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
            borderColor: '#0b2d2c',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e5e5e5',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e5e5e5',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#0b2d2c',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0b2d2c',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
        outlined: {
          borderColor: '#e5e5e5',
          '&:hover': {
            borderColor: '#0b2d2c',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 4px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e5e5e5',
        },
      },
    },
  },
});

/**
 * Style4-V2 Design System Constants
 */
export const style4V2Constants = {
  colors: {
    primaryBlack: '#0b2d2c',
    primaryWhite: '#ffffff',
    secondaryGray: '#666666',
    lightGray: '#e0e0e0',
    veryLightGray: '#cccccc',
    backgroundLight: '#fafafa',
    dividerColor: '#e5e5e5',
    darkOverlay: 'rgba(0, 0, 0, 0.5)',
    hoverOverlay: 'rgba(0, 0, 0, 0.04)',
  },
  spacing: {
    sectionPadding: { xs: 3, md: 4 },
    generousPadding: { xs: 6, md: 8 },
    compactPadding: { xs: 2, md: 3 },
  },
  maxWidths: {
    content: 800,
    form: 700,
    narrow: 600,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
  shadows: {
    light: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
    heavy: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
};

export default style4V2SharedTheme;