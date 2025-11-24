import React from 'react';
import { Tooltip as MuiTooltip, type TooltipProps as MuiTooltipProps } from '@mui/material';
import { monochromeColors } from '../../theme/monochrome';

/**
 * Tooltip Component
 *
 * FR-057: Tooltips MUST use white background with black text, 2px solid
 *         #000000 border, and 6px border-radius
 * FR-058: Tooltips MUST apply box-shadow `0 2px 8px rgba(0,0,0,0.1)`
 *         and 12px/400 text
 *
 * @example
 * ```tsx
 * <Tooltip content="This is a helpful tooltip">
 *   <button>Hover me</button>
 * </Tooltip>
 *
 * <Tooltip content="Information" placement="top">
 *   <IconButton><InfoIcon /></IconButton>
 * </Tooltip>
 * ```
 */

interface TooltipProps {
  /**
   * Tooltip text content
   */
  content: string;
  /**
   * Child element to attach tooltip to
   */
  children: React.ReactElement;
  /**
   * Tooltip placement
   * Default: 'top'
   */
  placement?: MuiTooltipProps['placement'];
  /**
   * Additional CSS class name
   */
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  className,
}) => {
  return (
    <MuiTooltip
      title={content}
      placement={placement}
      arrow
      className={className}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: monochromeColors.primaryWhite, // FR-057: White background
            color: monochromeColors.primaryBlack,           // FR-057: Black text
            border: `2px solid ${monochromeColors.primaryBlack}`, // FR-057: 2px black border
            borderRadius: '6px',                            // FR-057: 6px border-radius
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',        // FR-058: Box shadow
            fontSize: '12px',                               // FR-058: 12px text
            fontWeight: 400,                                // FR-058: 400 weight
            padding: '8px',                                 // 4px spacing system: 8px = 2 × 4px
            lineHeight: 1.4,
            maxWidth: '300px',
          },
        },
        arrow: {
          sx: {
            color: monochromeColors.primaryWhite,
            '&::before': {
              border: `2px solid ${monochromeColors.primaryBlack}`,
            },
          },
        },
      }}
    >
      {children}
    </MuiTooltip>
  );
};

export default Tooltip;
