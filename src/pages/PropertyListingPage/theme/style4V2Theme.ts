import { createTheme } from '@mui/material/styles';

/**
 * Style4-V2 Theme Configuration
 * Banner17's premium design system with minimalist aesthetic and sophisticated overlays
 */

export const style4V2Theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      dark: '#000000',
      light: '#333333',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666',
      dark: '#333333',
      light: '#999999',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    divider: '#e5e5e5',
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Amplitude", "Segoe UI", Roboto, system-ui, sans-serif',
    h1: {
      fontSize: '2.75rem', // 44px
      fontWeight: 700,
      lineHeight: 1.15,
      color: '#000000',
      letterSpacing: '-0.02em',
      '@media (max-width:900px)': {
        fontSize: '2.25rem', // 36px
      },
    },
    h2: {
      fontSize: '2.25rem', // 36px
      fontWeight: 600,
      lineHeight: 1.25,
      color: '#000000',
      '@media (max-width:900px)': {
        fontSize: '1.875rem', // 30px
      },
    },
    h3: {
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#000000',
    },
    h4: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#000000',
    },
    h6: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#000000',
    },
    body1: {
      fontSize: '1.1rem', // 17.6px
      lineHeight: 1.6,
      color: '#000000',
    },
    body2: {
      fontSize: '1rem', // 16px
      lineHeight: 1.5,
      color: '#666666',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    '0 4px 12px rgba(0,0,0,0.15)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
    '0 8px 24px rgba(255,255,255,0.25)',
    '0 8px 24px rgba(255,255,255,0.3)',
    '0 4px 12px rgba(0,0,0,0.15)',
    '0 6px 20px rgba(0,0,0,0.15)',
    '0 8px 25px rgba(0,0,0,0.15)',
    '0 12px 40px rgba(0,0,0,0.15)',
    '0 16px 48px rgba(0,0,0,0.15)',
    '0 20px 56px rgba(0,0,0,0.15)',
    '0 24px 64px rgba(0,0,0,0.15)',
    '0 28px 72px rgba(0,0,0,0.15)',
    '0 32px 80px rgba(0,0,0,0.15)',
    '0 36px 88px rgba(0,0,0,0.15)',
    '0 40px 96px rgba(0,0,0,0.15)',
    '0 44px 104px rgba(0,0,0,0.15)',
    '0 48px 112px rgba(0,0,0,0.15)',
    '0 52px 120px rgba(0,0,0,0.15)',
    '0 56px 128px rgba(0,0,0,0.15)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '16px 32px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#333333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          border: '2px solid #000000',
          color: '#000000',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
            borderWidth: '2px',
          },
        },
        text: {
          color: '#666666',
          '&:hover': {
            color: '#000000',
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000',
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: 8,
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
            borderColor: '#000000',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        outlined: {
          borderColor: '#e5e5e5',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
  },
  spacing: 8, // Base spacing unit (8px)
});

// Style4-V2 specific custom styles
export const style4V2Styles = {
  // Color constants
  colors: {
    primaryBlack: '#000000',
    primaryBlackLight: '#333333',
    primaryWhite: '#ffffff',
    whiteTransparent95: 'rgba(255, 255, 255, 0.95)',
    whiteTransparent15: 'rgba(255, 255, 255, 0.15)',
    whiteTransparent10: 'rgba(255, 255, 255, 0.1)',
    secondaryGray: '#666666',
    secondaryGrayDark: '#333333',
    secondaryGrayLight: '#999999',
    lightGray: '#e0e0e0',
    veryLightGray: '#cccccc',
    backgroundWhite: '#ffffff',
    backgroundLight: '#fafafa',
    dividerColor: '#e5e5e5',
    darkOverlay: 'rgba(0, 0, 0, 0.5)',
    hoverOverlay: 'rgba(0, 0, 0, 0.04)',
  },

  // Spacing constants (in rem units for MUI sx prop)
  spacing: {
    sectionPaddingMobile: 12, // 192px
    sectionPaddingDesktop: 18, // 288px
    generousPaddingMobile: 15, // 240px
    generousPaddingDesktop: 25, // 400px
    contentMarginSmall: 6, // 96px
    contentMarginMedium: 8, // 128px
    contentMarginLarge: 12, // 192px
    contentMarginXLarge: 16, // 256px
  },

  // Typography - Accent font (Caveat)
  accentFont: '"Caveat", cursive',

  // Maximum widths
  maxWidths: {
    headline: '900px',
    body: '800px',
    narrowContent: '750px',
    form: '700px',
    quote: '650px',
    caption: '600px',
    container: '1200px',
  },
};

export default style4V2Theme;