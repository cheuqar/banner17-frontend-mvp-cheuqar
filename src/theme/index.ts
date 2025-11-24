import { createTheme } from '@mui/material/styles';

// RealHub-inspired professional color palette
const palette = {
  primary: {
    main: '#0d2b2c', // Updated turquoise - user requested color
    light: '#4DCCDC',
    dark: '#1299AE',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#B0B3B8', // Lighter, softer gray - macaroon tone
    light: '#D4D6DA',
    dark: '#8A8D93',
    contrastText: '#404041',
  },
  success: {
    main: '#A8E6A3', // Soft mint green - macaroon tone
    light: '#C8F2C4',
    dark: '#7BC876',
  },
  warning: {
    main: '#F5D58A', // Soft peach/apricot - macaroon tone
    light: '#F9E4B3',
    dark: '#E8C063',
  },
  error: {
    main: '#F5A5A8', // Soft coral/pink - macaroon tone
    light: '#F8C5C7',
    dark: '#E8878A',
  },
  info: {
    main: '#A8D8EA', // Soft sky blue - macaroon tone
    light: '#C4E5F1',
    dark: '#7FC7DC',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F8F9FA',
  },
  text: {
    primary: '#404041',
    secondary: '#8C8C8E',
    disabled: '#BDBDBD',
  },
  grey: {
    50: '#FAFBFC',
    100: '#F8F9FA',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#8C8C8E',
    600: '#6B6B6D',
    700: '#495057',
    800: '#404041',
    900: '#2A2A2B',
  },
};

// Create modern theme with clean typography
export const theme = createTheme({
  palette,
  typography: {
    // Primary font for headings (Amplitude)
    fontFamily: '"Amplitude", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    // Heading styles with Amplitude font family
    h1: {
      fontFamily: '"Amplitude", "Helvetica", sans-serif',
      fontSize: '3.313rem', // 53px
      fontWeight: 300,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Amplitude", "Helvetica", sans-serif',
      fontSize: '2.625rem', // 42px
      fontWeight: 300,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Amplitude", "Helvetica", sans-serif',
      fontSize: '2.125rem', // 34px
      fontWeight: 300,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontFamily: '"Amplitude", "Helvetica", sans-serif',
      fontSize: '1.625rem', // 26px
      fontWeight: 300,
      lineHeight: 1.4,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontFamily: '"Amplitude", "Helvetica", sans-serif',
      fontSize: '1.25rem', // 20px
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontFamily: '"Amplitude", "Helvetica", sans-serif',
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
    },
    // Body text with Open Sans
    body1: {
      fontFamily: '"Amplitude", sans-serif',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
    },
    body2: {
      fontFamily: '"Amplitude", sans-serif',
      fontSize: '0.875rem', // 14px
      fontWeight: 300,
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
    },
    caption: {
      fontFamily: '"Amplitude", sans-serif',
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    button: {
      fontFamily: '"Amplitude", sans-serif',
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '-0.01em',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 35px 60px -12px rgba(0, 0, 0, 0.3)',
    '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)',
    '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)',
    '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
    '0px 4px 5px -2px rgba(0, 0, 0, 0.2), 0px 7px 10px 1px rgba(0, 0, 0, 0.14), 0px 2px 16px 1px rgba(0, 0, 0, 0.12)',
    '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
    '0px 5px 6px -3px rgba(0, 0, 0, 0.2), 0px 9px 12px 1px rgba(0, 0, 0, 0.14), 0px 3px 16px 2px rgba(0, 0, 0, 0.12)',
    '0px 6px 6px -3px rgba(0, 0, 0, 0.2), 0px 10px 14px 1px rgba(0, 0, 0, 0.14), 0px 4px 18px 3px rgba(0, 0, 0, 0.12)',
    '0px 6px 7px -4px rgba(0, 0, 0, 0.2), 0px 11px 15px 1px rgba(0, 0, 0, 0.14), 0px 4px 20px 3px rgba(0, 0, 0, 0.12)',
    '0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12)',
    '0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 13px 19px 2px rgba(0, 0, 0, 0.14), 0px 5px 24px 4px rgba(0, 0, 0, 0.12)',
    '0px 7px 9px -4px rgba(0, 0, 0, 0.2), 0px 14px 21px 2px rgba(0, 0, 0, 0.14), 0px 5px 26px 4px rgba(0, 0, 0, 0.12)',
    '0px 8px 9px -5px rgba(0, 0, 0, 0.2), 0px 15px 22px 2px rgba(0, 0, 0, 0.14), 0px 6px 28px 5px rgba(0, 0, 0, 0.12)',
    '0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12)',
    '0px 8px 11px -5px rgba(0, 0, 0, 0.2), 0px 17px 26px 2px rgba(0, 0, 0, 0.14), 0px 6px 32px 5px rgba(0, 0, 0, 0.12)',
    '0px 9px 11px -5px rgba(0, 0, 0, 0.2), 0px 18px 28px 2px rgba(0, 0, 0, 0.14), 0px 7px 34px 6px rgba(0, 0, 0, 0.12)',
    '0px 9px 12px -6px rgba(0, 0, 0, 0.2), 0px 19px 29px 2px rgba(0, 0, 0, 0.14), 0px 7px 36px 6px rgba(0, 0, 0, 0.12)',
    '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Sleek button base - minimal and clean
          borderRadius: 8,
          padding: '10px 24px', // Matches RealHub button padding
          fontSize: '0.875rem',
          fontFamily: '"Amplitude", sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '-0.01em',
          boxShadow: 'none', // No shadows by default - sleek
          border: '1px solid transparent',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth RealHub-style fade
          '&:hover': {
            transform: 'translateY(-1px)', // Subtle lift
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        contained: {
          // RealHub-inspired button: transparent by default, filled on hover
          backgroundColor: 'transparent',
          color: '#0d2b2c', // Brand color for text
          border: '1px solid #0d2b2c', // Brand color border
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#0d2b2c', // Fill with brand color on hover 
            color: '#ffffff', // White text on hover
            boxShadow: '0 4px 12px rgba(13, 43, 44, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          // Sleek outline design - minimal by default
          borderColor: 'rgba(13, 43, 44, 0.3)', // Subtle brand color border
          borderWidth: '1px',
          color: '#0d2b2c',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#0d2b2c', // Full brand color border on hover
            backgroundColor: 'rgba(13, 43, 44, 0.08)', // Very subtle fill
            color: '#0d2b2c',
            boxShadow: '0 2px 8px rgba(13, 43, 44, 0.15)',
          },
        },
        text: {
          // Minimal text button - completely clean
          color: '#0d2b2c',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: 'rgba(13, 43, 44, 0.05)', // Very subtle hover
            color: '#0d2b2c',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          // Sleek card design - minimal by default
          borderRadius: 12,
          backgroundColor: 'transparent', // No background fill
          boxShadow: 'none', // No shadow by default
          border: '1px solid rgba(13, 43, 44, 0.1)', // Very subtle brand-colored border
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            backgroundColor: 'rgba(13, 43, 44, 0.02)', // Extremely subtle fill on hover
            border: '1px solid rgba(13, 43, 44, 0.2)',
            boxShadow: '0 2px 12px rgba(13, 43, 44, 0.08)', // Gentle shadow on hover
            transform: 'translateY(-1px)', // Subtle lift
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: '"Amplitude", sans-serif',
            fontSize: '0.875rem',
            backgroundColor: 'transparent', // Sleek - no background fill
            borderRadius: 8,
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(13, 43, 44, 0.2)', // Subtle brand color border
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(13, 43, 44, 0.4)', // Slightly more visible on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0d2b2c', // Full brand color when focused
              borderWidth: '1px', // Keep consistent border width
              boxShadow: '0 0 0 3px rgba(13, 43, 44, 0.1)', // Subtle focus ring
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Amplitude", sans-serif',
            color: 'rgba(13, 43, 44, 0.7)', // Brand color for labels
          },
          '& input::placeholder': {
            color: 'rgba(13, 43, 44, 0.4)', // Brand color for placeholder
            fontWeight: 400,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          // Sleek paper design - ultra minimal
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.6)', // Very subtle background
          boxShadow: 'none', // No shadow by default
          border: '1px solid rgba(13, 43, 44, 0.08)', // Almost invisible brand border
          backdropFilter: 'blur(10px)', // Modern glass effect
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(13, 43, 44, 0.15)',
            boxShadow: '0 1px 8px rgba(13, 43, 44, 0.05)', // Very subtle shadow on hover
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #f3f4f6',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 32,
          height: 32,
          fontSize: '0.875rem',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme; 