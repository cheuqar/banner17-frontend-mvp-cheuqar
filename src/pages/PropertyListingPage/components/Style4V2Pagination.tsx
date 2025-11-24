import React from 'react';
import {
  Box,
  Pagination,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Container,
  Paper
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import style4V2Theme, { style4V2Styles } from '../theme/style4V2Theme';

interface Style4V2PaginationProps {
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
 * Style4-V2 Pagination Component
 * Clean pagination following Banner17's Style4-V2 design system
 */
const Style4V2Pagination: React.FC<Style4V2PaginationProps> = ({
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
    <ThemeProvider theme={style4V2Theme}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            backgroundColor: style4V2Styles.colors.backgroundLight,
            border: `1px solid ${style4V2Styles.colors.dividerColor}`,
            borderRadius: 2,
            p: 4,
            mt: 6,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 3,
          }}
        >
          {/* Results Summary */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="body1"
              sx={{
                color: style4V2Styles.colors.primaryBlack,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Showing {startResult.toLocaleString()} - {endResult.toLocaleString()} of{' '}
              {totalCount.toLocaleString()} properties
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: style4V2Styles.colors.secondaryGray,
                fontFamily: style4V2Styles.accentFont,
                fontStyle: 'italic',
              }}
            >
              Page {currentPage} of {totalPages}
            </Typography>
          </Box>

          {/* Controls */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            {/* Page Size Selector */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Per Page</InputLabel>
              <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                label="Per Page"
                disabled={loading}
                sx={{
                  backgroundColor: style4V2Styles.colors.primaryWhite,
                  '& .MuiSelect-select': {
                    fontWeight: 500,
                  }
                }}
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
                  backgroundColor: style4V2Styles.colors.primaryWhite,
                  border: `1px solid ${style4V2Styles.colors.dividerColor}`,
                  color: style4V2Styles.colors.secondaryGray,
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: style4V2Styles.colors.hoverOverlay,
                    borderColor: style4V2Styles.colors.primaryBlack,
                    color: style4V2Styles.colors.primaryBlack,
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: style4V2Styles.colors.primaryBlack,
                    color: style4V2Styles.colors.primaryWhite,
                    borderColor: style4V2Styles.colors.primaryBlack,
                    '&:hover': {
                      backgroundColor: style4V2Styles.colors.primaryBlackLight,
                      borderColor: style4V2Styles.colors.primaryBlackLight,
                    }
                  },
                  '&.Mui-disabled': {
                    backgroundColor: style4V2Styles.colors.backgroundLight,
                    borderColor: style4V2Styles.colors.lightGray,
                    color: style4V2Styles.colors.lightGray,
                  }
                },
                '& .MuiPaginationItem-ellipsis': {
                  color: style4V2Styles.colors.secondaryGrayLight,
                }
              }}
            />
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Style4V2Pagination;