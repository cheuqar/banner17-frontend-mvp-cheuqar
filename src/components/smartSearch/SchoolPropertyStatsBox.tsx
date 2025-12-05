/**
 * School Property Statistics Box Component
 * Phase 2.47: Displays property statistics for school catchment/radius areas
 *
 * Features:
 * - Fetches stats from API with 500ms debounce
 * - Syncs with Redux filter state
 * - Loading skeleton and error states
 * - Style4-V2 design (black/white/gray palette)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Chip,
  Tooltip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  KingBed as BedIcon,
  House as HouseIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store';
import { selectThemeColors } from '../../store/slices/themeSlice';
import { schoolsService } from '../../services/schoolsService';
import type { SchoolPropertyStatsResponse, PropertyStatistics } from '../../types/schoolStats';
import { useAuth } from '../../contexts/AuthContext';

interface SchoolPropertyStatsBoxProps {
  /** School ID to fetch stats for */
  schoolId: string;
  /** School name for display */
  schoolName: string;
  /** Whether to use catchment boundary or radius search */
  useCatchment?: boolean;
  /** Search radius in km (when not using catchment) */
  radiusKm?: number;
  /** Compact mode for smaller display */
  compact?: boolean;
}

/**
 * Format price for display
 */
const formatPrice = (price: number | null): string => {
  if (price === null || price === undefined) return 'N/A';
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`;
  }
  if (price >= 1000) {
    return `$${Math.round(price / 1000)}K`;
  }
  return `$${price.toLocaleString()}`;
};

/**
 * Custom hook for debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * SchoolPropertyStatsBox Component
 */
export const SchoolPropertyStatsBox: React.FC<SchoolPropertyStatsBoxProps> = ({
  schoolId,
  schoolName,
  useCatchment = true,
  radiusKm = 3.0,
  compact = false,
}) => {
  const themeColors = useAppSelector(selectThemeColors);
  const { session } = useAuth();

  // Get filters from Redux
  const filters = useAppSelector(state => state.smartSearch.filters);

  // Local state
  const [stats, setStats] = useState<SchoolPropertyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build filter options for API call
  const filterOptions = useMemo(() => ({
    schoolId,
    useCatchment,
    radiusKm,
    priceMin: filters.priceRange.min ?? undefined,
    priceMax: filters.priceRange.max ?? undefined,
    bedroomsMin: filters.bedrooms.min ?? undefined,
    bedroomsMax: filters.bedrooms.max ?? undefined,
    propertyTypes: filters.propertyTypes.length > 0 ? filters.propertyTypes : undefined,
    listingType: filters.listingType ?? undefined,
  }), [
    schoolId,
    useCatchment,
    radiusKm,
    filters.priceRange.min,
    filters.priceRange.max,
    filters.bedrooms.min,
    filters.bedrooms.max,
    filters.propertyTypes,
    filters.listingType,
  ]);

  // Debounce filter changes by 500ms
  const debouncedFilterOptions = useDebounce(filterOptions, 500);

  // Fetch stats when debounced filters change
  const fetchStats = useCallback(async () => {
    if (!schoolId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await schoolsService.getSchoolPropertyStats(
        debouncedFilterOptions,
        session?.access_token
      );
      setStats(response);
    } catch (err) {
      console.error('[SchoolPropertyStatsBox] Failed to fetch stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [debouncedFilterOptions, schoolId, session?.access_token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Render loading skeleton
  if (loading) {
    return (
      <Box sx={{ p: compact ? 1.5 : 2 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="rectangular" height={compact ? 60 : 80} sx={{ mt: 1, borderRadius: 1 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: compact ? 1 : 2 }}>
        {error}
      </Alert>
    );
  }

  // Render empty state
  if (!stats) {
    return (
      <Box sx={{ p: compact ? 1.5 : 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No statistics available
        </Typography>
      </Box>
    );
  }

  const { statistics, used_catchment, radius_km } = stats;

  return (
    <Box
      sx={{
        p: compact ? 1.5 : 2,
        bgcolor: '#ffffff',
        borderRadius: 1,
        border: '1px solid #e0e0e0',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <HomeIcon sx={{ fontSize: 20, color: themeColors.linkButtonActive, mr: 1 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000' }}>
          Property Statistics
        </Typography>
        <Chip
          label={used_catchment ? 'Catchment' : `${radius_km}km Radius`}
          size="small"
          sx={{
            ml: 'auto',
            height: 20,
            fontSize: '0.65rem',
            bgcolor: used_catchment ? '#e8f5e9' : '#fff3e0',
            color: used_catchment ? '#2e7d32' : '#ef6c00',
          }}
        />
      </Box>

      {/* Total Count - Prominent */}
      <Box
        sx={{
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          p: 1.5,
          mb: 1.5,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: themeColors.linkButtonActive,
            lineHeight: 1,
          }}
        >
          {statistics.total_count.toLocaleString()}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          Properties in Area
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Price Distribution */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <MoneyIcon sx={{ fontSize: 16, color: '#666', mr: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#333' }}>
            Price Range
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Lowest price">
            <Chip
              label={formatPrice(statistics.price_distribution.min)}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Tooltip>
          <Typography variant="caption" sx={{ alignSelf: 'center', color: '#999' }}>
            to
          </Typography>
          <Tooltip title="Highest price">
            <Chip
              label={formatPrice(statistics.price_distribution.max)}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Tooltip>
        </Box>
        <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
          Median: {formatPrice(statistics.price_distribution.median)} |
          Avg: {formatPrice(statistics.price_distribution.avg)}
        </Typography>
      </Box>

      {/* Bedroom Distribution */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <BedIcon sx={{ fontSize: 16, color: '#666', mr: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#333' }}>
            Bedrooms
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {Object.entries(statistics.bedroom_distribution).map(([key, count]) => (
            <Chip
              key={key}
              label={`${key}: ${count}`}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 22,
                bgcolor: count > 0 ? '#f0f0f0' : '#fafafa',
                color: count > 0 ? '#333' : '#bbb',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Property Type Distribution */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <HouseIcon sx={{ fontSize: 16, color: '#666', mr: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#333' }}>
            Property Types
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {Object.entries(statistics.property_type_distribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, compact ? 4 : 6)
            .map(([type, count]) => (
              <Chip
                key={type}
                label={`${type}: ${count}`}
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  height: 22,
                  bgcolor: '#f0f0f0',
                  textTransform: 'capitalize',
                }}
              />
            ))}
          {Object.keys(statistics.property_type_distribution).length > (compact ? 4 : 6) && (
            <Chip
              label={`+${Object.keys(statistics.property_type_distribution).length - (compact ? 4 : 6)} more`}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 22,
                bgcolor: '#e0e0e0',
                color: '#666',
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SchoolPropertyStatsBox;
