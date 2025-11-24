import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { monochromeColors } from '../../theme/monochrome';

/**
 * LoadingSpinner Component
 *
 * FR-054: Loading spinners MUST use black (#000000) color with 2px stroke width
 * and smooth rotation animation
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="medium" />
 * <LoadingSpinner size="small" color="#666666" />
 * ```
 */

interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * - small: 24px
   * - medium: 40px (default)
   * - large: 64px
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Color of the spinner
   * Defaults to #000000 (monochrome black)
   */
  color?: string;
  /**
   * Additional CSS class name
   */
  className?: string;
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 64,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = monochromeColors.primaryBlack,
  className,
}) => {
  const spinnerSize = sizeMap[size];

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <CircularProgress
        size={spinnerSize}
        thickness={2} // FR-054: 2px stroke width
        sx={{
          color: color,
          // Ensure smooth rotation animation
          animation: 'rotation 1.4s linear infinite',
          '@keyframes rotation': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        }}
      />
    </Box>
  );
};

export default LoadingSpinner;
