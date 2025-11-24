import { useMemo } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import type { ResponsiveLayoutConfig } from '../types/property-enhanced';

/**
 * Custom hook for responsive property layout management
 * Provides breakpoint detection and layout configuration
 * Used by PropertyDetailDialog for responsive design
 */
export const useResponsivePropertyLayout = (): ResponsiveLayoutConfig => {
  const theme = useTheme();

  // Breakpoint detection
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 768px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 768px - 1023px
  const isDesktop = useMediaQuery(theme.breakpoints.between('lg', 'xl')); // 1024px - 1199px
  const isWideScreen = useMediaQuery(theme.breakpoints.up('xl')); // 1200px+

  // Responsive layout configuration
  const layoutConfig = useMemo<ResponsiveLayoutConfig>(() => {
    return {
      // Breakpoint flags
      isMobile,
      isTablet,
      isDesktop,
      isWideScreen,

      // Content layout
      contentMaxWidth: isWideScreen ? 1000 : '100%',
      shouldCenterContent: isWideScreen,
      slideshowFullWidth: isWideScreen,

      // Spacing configurations
      dialogPadding: isMobile ? 2 : 3,
      contentSpacing: isMobile ? 2 : 3,

      // Image slideshow configurations
      slideshowHeight: isMobile ? 300 : isTablet ? 400 : 500,
      showPreviewThumbnails: true, // Always show previews when available
      previewLayout: isMobile ? 'horizontal' : 'vertical',

      // Card layout configurations
      cardSpacing: isMobile ? 1 : 2,
      useCompactCards: isMobile,

      // Typography configurations
      titleVariant: isMobile ? 'h5' : 'h4',
      priceVariant: isMobile ? 'h6' : 'h5',
    };
  }, [isMobile, isTablet, isDesktop, isWideScreen]);

  return layoutConfig;
};

/**
 * Utility function to get responsive dialog styles
 */
export const getResponsiveDialogStyles = (isWideScreen: boolean) => ({
  '& .MuiDialog-paper': {
    width: {
      xs: '100%',           // Mobile: full width
      sm: '100%',           // Tablet: full width
      md: '90vw',           // Desktop: 90% viewport width
      xl: '85vw',           // Wide: 85% viewport width
    },
    maxWidth: {
      xs: '100vw',          // Mobile: no max width constraint
      sm: '100vw',          // Tablet: no max width constraint
      md: '1200px',         // Desktop: reasonable max width
      xl: '1600px',         // Wide: larger max width for content
    },
    height: {
      xs: '100vh',          // Mobile: full height
      sm: '95vh',           // Tablet: nearly full height
      md: '90vh',           // Desktop: 90% height
      xl: '90vh',           // Wide: consistent height
    },
    margin: {
      xs: 0,                // Mobile: no margin
      sm: 'auto',           // Tablet+: center horizontally
    },
    borderRadius: {
      xs: 0,                // Mobile: no border radius
      sm: 2,                // Tablet+: rounded corners
    },
  },
});

/**
 * Utility function to get responsive content container styles
 */
export const getResponsiveContentStyles = (isWideScreen: boolean) => ({
  maxWidth: {
    xs: '100%',           // Mobile: full width
    sm: '100%',           // Tablet: full width
    md: '100%',           // Desktop: full width
    xl: 1000,             // Wide: centered 1000px max width
  },
  margin: {
    xs: 0,                // Mobile: no margin
    sm: 0,                // Tablet: no margin
    md: 0,                // Desktop: no margin
    xl: '0 auto',         // Wide: center horizontally
  },
  px: { xs: 2, sm: 3 },   // Responsive padding
  py: 2,
});

/**
 * Utility function to get responsive slideshow styles
 */
export const getResponsiveSlideshowStyles = (fullWidth: boolean, isWideScreen: boolean) => ({
  width: fullWidth && isWideScreen ? '100vw' : '100%',
  marginLeft: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / -2)' : 0,
  marginRight: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / -2)' : 0,
  borderRadius: fullWidth ? 0 : 2,
});

export default useResponsivePropertyLayout;