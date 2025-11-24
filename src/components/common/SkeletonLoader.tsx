import React from 'react';
import { Skeleton, Box } from '@mui/material';
import { monochromeColors } from '../../theme/monochrome';

/**
 * SkeletonLoader Component
 *
 * FR-061: Skeleton loading states MUST use #F5F5F5 background with
 *         subtle pulse animation (opacity 1.0 to 0.7)
 *
 * @example
 * ```tsx
 * <SkeletonLoader variant="card" />
 * <SkeletonLoader variant="text" count={3} />
 * <SkeletonLoader variant="circular" width="40px" height="40px" />
 * ```
 */

interface SkeletonLoaderProps {
  /**
   * Skeleton variant
   * - card: Property card placeholder (200px height, full width)
   * - text: Text line placeholder
   * - circular: Circular avatar/icon placeholder
   */
  variant: 'card' | 'text' | 'circular';
  /**
   * Number of skeleton elements to render
   * Default: 1
   */
  count?: number;
  /**
   * Custom width (optional)
   * Overrides default width for the variant
   */
  width?: string | number;
  /**
   * Custom height (optional)
   * Overrides default height for the variant
   */
  height?: string | number;
  /**
   * Additional CSS class name
   */
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  count = 1,
  width,
  height,
  className,
}) => {
  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'card':
        return { width: '100%', height: 200 }; // FR-014: Property card image height
      case 'text':
        return { width: '100%', height: 20 };
      case 'circular':
        return { width: 40, height: 40 };
      default:
        return { width: '100%', height: 20 };
    }
  };

  const defaults = getDefaultDimensions();
  const finalWidth = width ?? defaults.width;
  const finalHeight = height ?? defaults.height;

  // Render multiple skeletons if count > 1
  const skeletons = Array.from({ length: count }, (_, index) => (
    <Skeleton
      key={index}
      variant={variant === 'card' ? 'rectangular' : variant === 'circular' ? 'circular' : 'text'}
      width={finalWidth}
      height={finalHeight}
      className={`skeleton-pulse ${className || ''}`} // Use CSS animation from animations.css
      sx={{
        backgroundColor: monochromeColors.lightGray, // FR-061: #F5F5F5 background
        borderRadius: variant === 'card' ? '0px' : undefined, // FR-020: 0px for cards
        marginBottom: variant === 'text' && count > 1 ? '8px' : 0, // Spacing between text lines

        // Animation is handled by .skeleton-pulse class in animations.css
        // FR-061: Pulse animation (opacity 1.0 to 0.7)

        // Accessibility: Reduce motion
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    />
  ));

  return (
    <Box className={className}>
      {skeletons}
    </Box>
  );
};

export default SkeletonLoader;
