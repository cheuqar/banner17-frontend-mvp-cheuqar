import React from 'react';
import {
  Box,
  Pagination,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper
} from '@mui/material';

interface PropertyPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  offset: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
}

/**
 * Property Pagination Component
 * Handles pagination controls and page size selection
 */
const PropertyPagination: React.FC<PropertyPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  offset,
  onPageChange,
  onPageSizeChange,
  loading = false
}) => {
  const startResult = offset + 1;
  const endResult = Math.min(offset + pageSize, totalCount);

  if (totalCount === 0) {
    return null;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mt: 3,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        gap: 2,
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Results Summary */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" color="text.primary" fontWeight={500}>
          Showing {startResult.toLocaleString()} - {endResult.toLocaleString()} of{' '}
          {totalCount.toLocaleString()} properties
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Page {currentPage} of {totalPages}
        </Typography>
      </Box>

      {/* Page Size Selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            label="Per Page"
            disabled={loading}
            sx={{ backgroundColor: 'white' }}
          >
            <MenuItem value={10}>10 per page</MenuItem>
            <MenuItem value={20}>20 per page</MenuItem>
            <MenuItem value={50}>50 per page</MenuItem>
            <MenuItem value={100}>100 per page</MenuItem>
          </Select>
        </FormControl>

        {/* Pagination Controls */}
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => onPageChange(page)}
          disabled={loading}
          color="primary"
          shape="rounded"
          size="medium"
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            },
            '& .Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default PropertyPagination;