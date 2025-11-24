import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Typography,
} from '@mui/material';
import { Warning, Refresh } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useAppDispatch } from '../../../store';
import {
  performSearch,
  clearError,
  incrementRetryCount,
  resetRetryCount,
} from '../../../store/slices/smartSearchSlice';

/**
 * SearchErrorAlert Component
 * Displays user-friendly error messages with retry functionality
 * Phase 2.5.10 - Frontend Error Handling
 */
const SearchErrorAlert: React.FC = () => {
  const dispatch = useAppDispatch();
  const { error, errorType, loading, retryCount } = useSelector(
    (state: RootState) => state.smartSearch
  );

  const [retrying, setRetrying] = useState(false);
  const [retryDelay, setRetryDelay] = useState(0);

  // Calculate exponential backoff delay (1s, 2s, 4s)
  const getRetryDelay = () => {
    return Math.min(Math.pow(2, retryCount) * 1000, 4000);
  };

  // Auto-clear error after successful search
  useEffect(() => {
    if (!error && !loading && retryCount > 0) {
      // Search succeeded after retry
      const timer = setTimeout(() => {
        dispatch(resetRetryCount());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, loading, retryCount, dispatch]);

  const handleRetry = async () => {
    if (retrying || loading) return;

    const delay = getRetryDelay();
    setRetrying(true);
    setRetryDelay(delay);

    // Increment retry count
    dispatch(incrementRetryCount());

    // Clear current error
    dispatch(clearError());

    // Wait for exponential backoff delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    setRetrying(false);
    setRetryDelay(0);

    // Trigger search retry
    dispatch(performSearch());
  };

  const handleDismiss = () => {
    dispatch(clearError());
    dispatch(resetRetryCount());
  };

  if (!error) return null;

  // Determine alert severity based on error type
  const severity = errorType === 'timeout' ? 'warning' : 'error';

  // Get error-specific suggestions
  const getSuggestions = () => {
    if (errorType === 'timeout') {
      return [
        'Try adding property type (e.g., House, Apartment)',
        'Add bedroom count (e.g., 3+ bedrooms)',
        'Set a price range to narrow results',
      ];
    } else if (errorType === 'network') {
      return ['Check your internet connection', 'Try refreshing the page'];
    } else if (errorType === 'validation') {
      return ['Ensure all required filters are set', 'Check your search criteria'];
    }
    return ['Try again in a few moments', 'Refresh the page if the problem persists'];
  };

  return (
    <Collapse in={!!error}>
      <Box sx={{ mb: 2 }}>
        <Alert
          severity={severity}
          icon={<Warning />}
          onClose={handleDismiss}
          sx={{
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <AlertTitle>
            {errorType === 'timeout'
              ? 'Search Timeout'
              : errorType === 'network'
              ? 'Network Error'
              : errorType === 'validation'
              ? 'Validation Error'
              : errorType === 'SEARCH_IN_PROGRESS'
              ? 'Search In Progress'
              : 'Search Failed'}
          </AlertTitle>

          <Typography variant="body2" sx={{ mb: 1.5 }}>
            {error}
          </Typography>

          {errorType === 'timeout' && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                Suggestions:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {getSuggestions().map((suggestion, index) => (
                  <Typography key={index} component="li" variant="body2">
                    {suggestion}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {errorType === 'network' && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                Suggestions:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {getSuggestions().map((suggestion, index) => (
                  <Typography key={index} component="li" variant="body2">
                    {suggestion}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={retrying ? <CircularProgress size={16} /> : <Refresh />}
              onClick={handleRetry}
              disabled={retrying || loading}
              sx={{
                borderColor: severity === 'warning' ? 'warning.main' : 'error.main',
                color: severity === 'warning' ? 'warning.main' : 'error.main',
                '&:hover': {
                  borderColor: severity === 'warning' ? 'warning.dark' : 'error.dark',
                  backgroundColor:
                    severity === 'warning'
                      ? 'rgba(237, 108, 2, 0.04)'
                      : 'rgba(211, 47, 47, 0.04)',
                },
              }}
            >
              {retrying
                ? `Retrying in ${Math.ceil(retryDelay / 1000)}s`
                : retryCount > 0
                ? `Retry Again (${retryCount})`
                : 'Retry Search'}
            </Button>
          </Box>
        </Alert>
      </Box>
    </Collapse>
  );
};

export default SearchErrorAlert;
