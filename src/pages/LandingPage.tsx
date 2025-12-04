import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAppSelector } from '../store';
import { selectThemeColors, selectCurrentTheme } from '../store/slices/themeSlice';

// Style4-V2 Components
import HeaderStyle4V2 from '../components/style4-v2/HeaderStyle4V2';
import HeroSectionStyle4V2 from '../components/style4-v2/HeroSectionStyle4V2';
import QuickIntroStyle4V2 from '../components/style4-v2/QuickIntroStyle4V2';
import NumbersProofStyle4V2 from '../components/style4-v2/NumbersProofStyle4V2';
import WhoWeServeStyle4V2 from '../components/style4-v2/WhoWeServeStyle4V2';
import PersonalStoryStyle4V2 from '../components/style4-v2/PersonalStoryStyle4V2';
import TrustSectionStyle4V2 from '../components/style4-v2/TrustSectionStyle4V2';
import ClosingCTAStyle4V2 from '../components/style4-v2/ClosingCTAStyle4V2';
import FooterStyle4V2 from '../components/style4-v2/FooterStyle4V2';

/**
 * Create Style4-V2 Theme with dynamic accent color
 * Following the exact specifications from the style guide
 */
const createStyle4V2Theme = (accentColor: string, primaryDark: string) => createTheme({
  palette: {
    primary: {
      main: primaryDark,
      dark: primaryDark,
      light: '#333333',
    },
    secondary: {
      main: '#666666',
      dark: '#333333',
      light: '#999999',
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
  },
  typography: {
    fontFamily: '"Amplitude", "Segoe UI", Roboto, system-ui, sans-serif',
    h1: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.15,
      color: '#000000',
      '@media (max-width:900px)': {
        fontSize: '2.25rem',
      },
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.25,
      color: '#000000',
      '@media (max-width:900px)': {
        fontSize: '1.875rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#000000',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
      color: '#000000',
    },
    body2: {
      fontSize: '1rem',
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
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.2rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
  },
});

/**
 * LandingPage - Complete Style4-V2 landing page
 * Implements the exact layout and content from the style guide
 * Now with dynamic theme support
 */
const LandingPage: React.FC = () => {
  // Get dynamic theme colors from Redux
  const themeColors = useAppSelector(selectThemeColors);
  const currentTheme = useAppSelector(selectCurrentTheme);

  // Create MUI theme with dynamic accent colors
  const style4V2Theme = useMemo(
    () => createStyle4V2Theme(themeColors.linkButtonActive, themeColors.primaryDark),
    [themeColors.linkButtonActive, themeColors.primaryDark]
  );

  return (
    <ThemeProvider theme={style4V2Theme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          transition: 'background-color 0.3s ease',
        }}
        data-theme={currentTheme}
      >
        {/* 1. Header - Navigation */}
        <HeaderStyle4V2 />

        {/* 2. Hero Section - Full-screen with background image */}
        <HeroSectionStyle4V2 />

        {/* 3. Quick Intro - Light background section with theme tint */}
        <Box
          sx={{
            backgroundColor: themeColors.primaryLight,
            transition: 'background-color 0.3s ease',
          }}
        >
          <QuickIntroStyle4V2 />
        </Box>

        {/* 4. What We Do - Features with background image */}
        <NumbersProofStyle4V2 />

        {/* 5. Who We Serve - Light background with theme tint */}
        <Box
          sx={{
            backgroundColor: themeColors.primaryLight,
            transition: 'background-color 0.3s ease',
          }}
        >
          <WhoWeServeStyle4V2 />
        </Box>

        {/* 6. Personal Story - Personal story with background image */}
        <PersonalStoryStyle4V2 />

        {/* 7. Trust Section - White background trust indicators */}
        <TrustSectionStyle4V2 />

        {/* 8. Closing CTA - Final CTA with background image */}
        <ClosingCTAStyle4V2 />

        {/* 9. Footer - White background footer */}
        <FooterStyle4V2 />
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;