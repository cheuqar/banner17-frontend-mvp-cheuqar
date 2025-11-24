import React from 'react';
import { Box, Typography } from '@mui/material';

interface PropertyListHeaderProps {
  totalCount: number;
  visibleCount: number;
  currentPage: number;
  itemsPerPage: number;
}

/**
 * PropertyListHeader Component
 *
 * Displays property count and pagination range information above the property list.
 * Follows Style4-V2 design system with clean gray typography.
 *
 * Example output:
 * "71 properties on map | Page 2 of 3 - Showing 26-50 of 71 properties"
 *
 * @param totalCount - Total number of properties in the entire result set
 * @param visibleCount - Number of properties visible on the current map view
 * @param currentPage - Current page number (1-indexed)
 * @param itemsPerPage - Number of items displayed per page (typically 25)
 */
const PropertyListHeader: React.FC<PropertyListHeaderProps> = ({
  totalCount,
  visibleCount,
  currentPage,
  itemsPerPage,
}) => {
  // Calculate range of items being displayed
  const startItem = visibleCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, visibleCount);
  const totalPages = Math.ceil(visibleCount / itemsPerPage);

  // Handle edge cases
  if (visibleCount === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body1"
          sx={{
            color: '#666666',
            fontSize: '14px',
          }}
        >
          No properties visible on map
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="body1"
        sx={{
          color: '#000000',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        {visibleCount.toLocaleString()} {visibleCount === 1 ? 'property' : 'properties'} on map
        {totalPages > 1 && (
          <>
            {' | '}
            <Typography
              component="span"
              sx={{
                color: '#666666',
                fontSize: '14px',
                fontWeight: 400,
              }}
            >
              Page {currentPage} of {totalPages} - Showing {startItem.toLocaleString()}-
              {endItem.toLocaleString()} of {visibleCount.toLocaleString()}{' '}
              {visibleCount === 1 ? 'property' : 'properties'}
            </Typography>
          </>
        )}
      </Typography>
    </Box>
  );
};

export default PropertyListHeader;
