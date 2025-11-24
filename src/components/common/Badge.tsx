import React from 'react';
import { Chip } from '@mui/material';
import { monochromeColors } from '../../theme/monochrome';

/**
 * Badge Component
 *
 * FR-059: Badges/labels MUST use white background with black text,
 *         1px solid #E0E0E0 border, and 6px border-radius
 * FR-060: Active badges MUST invert to black background with white text
 *         to indicate selection
 *
 * @example
 * ```tsx
 * <Badge label="Filter" />
 * <Badge label="Active" active />
 * <Badge label="Clickable" onClick={() => console.log('clicked')} />
 * ```
 */

interface BadgeProps {
  /**
   * Badge label text
   */
  label: string;
  /**
   * Whether badge is in active/selected state
   * Active badges use inverted colors (black bg, white text)
   */
  active?: boolean;
  /**
   * Optional click handler
   * Makes badge interactive
   */
  onClick?: () => void;
  /**
   * Additional CSS class name
   */
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  active = false,
  onClick,
  className,
}) => {
  return (
    <Chip
      label={label}
      onClick={onClick}
      clickable={!!onClick}
      className={className}
      sx={{
        // FR-059: Default state (inactive)
        backgroundColor: active
          ? monochromeColors.primaryBlack  // FR-060: Black background when active
          : monochromeColors.primaryWhite, // FR-059: White background when inactive
        color: active
          ? monochromeColors.primaryWhite  // FR-060: White text when active
          : monochromeColors.primaryBlack, // FR-059: Black text when inactive
        border: active
          ? `1px solid ${monochromeColors.primaryBlack}` // Keep border visible
          : `1px solid ${monochromeColors.borderGray}`,  // FR-059: 1px #E0E0E0 border
        borderRadius: '6px',                             // FR-059: 6px border-radius
        fontSize: '13px',                                // Consistent with FR-005
        fontWeight: 500,
        padding: '4px 12px',                             // 4px spacing system
        height: 'auto',
        lineHeight: 1.4,
        transition: 'all 200ms ease',                    // FR-033: 200ms transitions

        // Hover states
        '&:hover': {
          backgroundColor: active
            ? monochromeColors.primaryBlack
            : monochromeColors.hoverBg, // Subtle hover for inactive badges
          cursor: onClick ? 'pointer' : 'default',
        },

        // Focus states (FR-038)
        '&:focus-visible': {
          outline: `2px solid ${monochromeColors.primaryBlack}`,
          outlineOffset: '2px',
        },

        // Clickable state
        '&.MuiChip-clickable:active': {
          boxShadow: 'none',
        },
      }}
    />
  );
};

export default Badge;
