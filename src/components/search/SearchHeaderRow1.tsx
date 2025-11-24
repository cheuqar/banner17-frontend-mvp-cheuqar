/**
 * Component: SearchHeaderRow1
 * 
 * First row of Smart Search Header - Brand + Transaction/Amenity Filters
 * Left: "Banner17" brand text (clickable, navigates to home)
 * Right: Buy/Sell/Sold + School/Daycare/Amenities buttons
 * 
 * Layout: Flexbox space-between, height 56px, responsive padding (FR-001, FR-002)
 */

import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import type { TransactionType } from '../../types/searchFilters';
import { TransactionFilters } from './TransactionFilters';

interface SearchHeaderRow1Props {
  transactionType: TransactionType;
  onTransactionTypeChange: (type: TransactionType) => void;
  schoolPanelOpen?: boolean;
  onSchoolPanelToggle?: () => void;
  onDaycareClick?: () => void;      // Coming Soon handler for Daycare
  onAmenitiesClick?: () => void;    // Coming Soon handler for Amenities
}

/**
 * SearchHeaderRow1 Component
 * 
 * Brand identity + filter link buttons in horizontal layout
 */
export const SearchHeaderRow1: React.FC<SearchHeaderRow1Props> = ({
  transactionType,
  onTransactionTypeChange,
  schoolPanelOpen,
  onSchoolPanelToggle,
  onDaycareClick,
  onAmenitiesClick,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '56px',  // Row 1 height per design tokens
        
        // Responsive padding: 12px→16px→24px (xs→sm→md)
        px: { xs: 1.5, sm: 2, md: 3 },  // 12px→16px→24px
      }}
    >
      {/* Left: Brand Identity */}
      <Link
        href="/"
        underline="none"
        sx={{
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
            transition: 'opacity 0.3s ease',
          },
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontSize: '20px',  // Brand text size per design tokens
            fontWeight: 700,   // Bold for brand identity
            color: '#000000',  // Primary text color
            letterSpacing: '-0.01em',  // Subtle tightening for brand
          }}
        >
          Banner17
        </Typography>
      </Link>

      {/* Right: Filter Link Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,  // 24px spacing between transaction and amenity filters
          alignItems: 'center',
        }}
      >
        {/* Transaction Filters (Buy/Sell/Sold) */}
        <TransactionFilters
          active={transactionType}
          onChange={onTransactionTypeChange}
        />

        {/* Amenity Filters (School/Daycare/Amenities) - Phase 4 */}
        {onSchoolPanelToggle && (
          <Link
            component="button"
            role="button"
            variant="body1"
            onClick={onSchoolPanelToggle}
            aria-current={schoolPanelOpen ? 'page' : undefined}
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#000000',
              textDecoration: 'none',
              cursor: 'pointer',
              
              // Active state when panel is open
              ...(schoolPanelOpen && {
                textDecoration: 'underline',
                fontWeight: 700,
              }),
              
              '&:hover': {
                opacity: 0.8,
                transition: 'opacity 0.3s ease',
              },
            }}
          >
            School
          </Link>
        )}

        {/* Daycare placeholder - Phase 8 (Coming Soon) */}
        {onDaycareClick && (
          <Link
            component="button"
            role="button"
            variant="body1"
            onClick={onDaycareClick}
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#999999',  // Disabled/placeholder color
              textDecoration: 'none',
              cursor: 'pointer',
              opacity: 0.5,
              
              '&:hover': {
                opacity: 0.7,
                transition: 'opacity 0.3s ease',
              },
            }}
          >
            Daycare
          </Link>
        )}

        {/* Amenities placeholder - Phase 8 (Coming Soon) */}
        {onAmenitiesClick && (
          <Link
            component="button"
            role="button"
            variant="body1"
            onClick={onAmenitiesClick}
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#999999',  // Disabled/placeholder color
              textDecoration: 'none',
              cursor: 'pointer',
              opacity: 0.5,
              
              '&:hover': {
                opacity: 0.7,
                transition: 'opacity 0.3s ease',
              },
            }}
          >
            Amenities
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default SearchHeaderRow1;

