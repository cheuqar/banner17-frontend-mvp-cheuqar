import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface MapStatusBarProps {
  displayedCount: number;
  totalCount: number;
  activeFilters?: {
    state?: string | null;
    suburb?: string | null;
    postcode?: string | null;
    property_type?: string[] | null;
    bedrooms_min?: number | null;
    price_min?: number | null;
    price_max?: number | null;
  };
  zoomLevel?: number;
}

export const MapStatusBar: React.FC<MapStatusBarProps> = ({
  displayedCount,
  totalCount,
  activeFilters = {},
  zoomLevel
}) => {
  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  // Build filter chips
  const filterChips: string[] = [];

  if (activeFilters.state) {
    filterChips.push(activeFilters.state);
  }
  if (activeFilters.suburb) {
    filterChips.push(activeFilters.suburb);
  }
  if (activeFilters.postcode) {
    filterChips.push(activeFilters.postcode);
  }
  if (activeFilters.property_type && activeFilters.property_type.length > 0) {
    // Join property types with comma
    const types = activeFilters.property_type.map(t =>
      t.charAt(0).toUpperCase() + t.slice(1)
    ).join(', ');
    filterChips.push(types);
  }
  if (activeFilters.bedrooms_min) {
    filterChips.push(`${activeFilters.bedrooms_min}+ beds`);
  }
  if (activeFilters.price_min || activeFilters.price_max) {
    const priceRange = [
      activeFilters.price_min ? formatPrice(activeFilters.price_min) : null,
      activeFilters.price_max ? formatPrice(activeFilters.price_max) : null
    ].filter(Boolean).join('-');

    if (priceRange) {
      filterChips.push(priceRange);
    }
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'grey.100',
        borderTop: '1px solid',
        borderColor: 'grey.300',
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        zIndex: 1000,
        flexWrap: 'wrap'
      }}
    >
      {/* Property Count */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'black',
          whiteSpace: 'nowrap'
        }}
      >
        {displayedCount} displayed · {totalCount} total
      </Typography>

      {/* Divider */}
      {filterChips.length > 0 && (
        <Box sx={{
          width: '1px',
          height: '16px',
          bgcolor: 'grey.400',
          display: { xs: 'none', sm: 'block' } // Hide on mobile
        }} />
      )}

      {/* Active Filters */}
      {filterChips.length > 0 && (
        <Box sx={{
          display: 'flex',
          gap: 0.5,
          flexWrap: 'wrap',
          flex: 1
        }}>
          {filterChips.map((filter, index) => (
            <Chip
              key={index}
              label={filter}
              size="small"
              sx={{
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'grey.300',
                fontSize: '0.75rem',
                height: '24px',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Zoom Level (optional) */}
      {zoomLevel && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            display: { xs: 'none', md: 'block' } // Hide on small screens
          }}
        >
          Zoom: {zoomLevel}
        </Typography>
      )}
    </Box>
  );
};
