import React from 'react';
import { Box, Typography } from '@mui/material';
import { monochromeColors } from '../../theme/monochrome';

/**
 * EmptyState Component
 *
 * FR-055: Empty state messages MUST use 16px text at 500 weight in #666666
 *         with centered alignment
 * FR-056: Empty state icons MUST be 48px size in #E0E0E0 color with
 *         minimalist line style
 *
 * @example
 * ```tsx
 * <EmptyState message="No properties found matching your criteria" />
 * <EmptyState
 *   message="No results available"
 *   icon={<SearchOffIcon />}
 * />
 * ```
 */

interface EmptyStateProps {
  /**
   * Message to display
   */
  message: string;
  /**
   * Optional icon to display above message
   * Icon should be a React component (e.g., Material-UI icon)
   */
  icon?: React.ReactNode;
  /**
   * Additional CSS class name
   */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon,
  className,
}) => {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px', // 4px spacing system: 48px = 12 × 4px, 24px = 6 × 4px
        textAlign: 'center',
        width: '100%',
      }}
    >
      {icon && (
        <Box
          sx={{
            marginBottom: '16px', // 4px spacing system: 16px = 4 × 4px
            color: monochromeColors.borderGray, // FR-056: #E0E0E0
            fontSize: '48px', // FR-056: 48px icon size
            lineHeight: 1,
            '& svg': {
              width: '48px',
              height: '48px',
              color: monochromeColors.borderGray,
            },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        sx={{
          fontSize: '16px', // FR-055: 16px text
          fontWeight: 500,   // FR-055: 500 weight
          color: monochromeColors.secondaryText, // FR-055: #666666
          lineHeight: 1.5,   // Comfortable line height
          maxWidth: '400px', // Prevent overly wide text on large screens
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyState;
