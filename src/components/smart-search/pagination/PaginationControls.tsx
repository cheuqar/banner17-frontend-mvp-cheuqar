import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/**
 * PaginationControls Component
 *
 * Provides Previous/Next navigation and page indicator for property list pagination.
 * Follows Style4-V2 design system with gray buttons and proper accessibility.
 *
 * @param currentPage - Current page number (1-indexed)
 * @param totalPages - Total number of pages available
 * @param onPageChange - Callback when page changes
 * @param disabled - Whether controls should be disabled
 */
const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const isPreviousDisabled = disabled || currentPage <= 1;
  const isNextDisabled = disabled || currentPage >= totalPages;

  // Don't render controls if there are no pages
  if (totalPages === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 2,
        px: 1,
      }}
    >
      {/* Previous Button */}
      <Button
        variant="outlined"
        size="medium"
        onClick={handlePrevious}
        disabled={isPreviousDisabled}
        startIcon={<ChevronLeft />}
        sx={{
          minHeight: 44, // Tap target size
          minWidth: 100,
          borderColor: '#E0E0E0',
          color: '#000000',
          backgroundColor: '#FFFFFF',
          borderWidth: '1px',
          '&:hover': {
            backgroundColor: '#F5F5F5',
            borderColor: '#000000',
            borderWidth: '1px',
          },
          '&.Mui-disabled': {
            borderColor: '#E0E0E0',
            color: '#CCCCCC',
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
      >
        Previous
      </Button>

      {/* Page Indicator */}
      <Typography
        variant="body1"
        sx={{
          minWidth: 120,
          textAlign: 'center',
          color: '#000000',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        Page {currentPage} of {totalPages}
      </Typography>

      {/* Next Button */}
      <Button
        variant="outlined"
        size="medium"
        onClick={handleNext}
        disabled={isNextDisabled}
        endIcon={<ChevronRight />}
        sx={{
          minHeight: 44, // Tap target size
          minWidth: 100,
          borderColor: '#E0E0E0',
          color: '#000000',
          backgroundColor: '#FFFFFF',
          borderWidth: '1px',
          '&:hover': {
            backgroundColor: '#F5F5F5',
            borderColor: '#000000',
            borderWidth: '1px',
          },
          '&.Mui-disabled': {
            borderColor: '#E0E0E0',
            color: '#CCCCCC',
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
      >
        Next
      </Button>
    </Box>
  );
};

export default PaginationControls;
