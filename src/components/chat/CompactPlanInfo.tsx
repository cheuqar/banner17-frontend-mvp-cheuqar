import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Popover,
  LinearProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  Star,
  ExpandMore,
  Schedule,
  Assessment,
  ApiOutlined,
  Upgrade
} from '@mui/icons-material';

interface PlanUsage {
  current: number;
  limit: number;
  period: string;
}

interface PlanData {
  planName: string;
  planTier: 'FREE' | 'BASIC' | 'PRO' | 'PLUS' | 'ENTERPRISE';
  monthlyQueries: PlanUsage;
  apiCalls: PlanUsage;
  propertyAnalyses: PlanUsage;
}

interface CompactPlanInfoProps {
  planData: PlanData;
  onShowCapabilities?: () => void;
  onUpgradeClick?: () => void;
}

const CompactPlanInfo: React.FC<CompactPlanInfoProps> = ({
  planData,
  onShowCapabilities,
  onUpgradeClick
}) => {
  // Safety check for planData
  if (!planData) {
    return null; // Don't render if planData is undefined
  }
  
  // Destructure planData for easier access
  const { planName, planTier, monthlyQueries, apiCalls, propertyAnalyses } = planData;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const getPlanColor = (tier: string) => {
    const colors = {
      FREE: '#9e9e9e',
      BASIC: '#2196f3',
      PRO: '#ff9800',
      PLUS: '#9c27b0',
      ENTERPRISE: '#4caf50'
    };
    return colors[tier as keyof typeof colors] || '#9e9e9e';
  };

  const getProgressColor = (current: number, limit: number) => {
    if (limit === -1) return 'success';
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited';
    if (limit >= 1000) return `${(limit / 1000).toFixed(1)}K`;
    return limit.toString();
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  // Find the highest usage percentage for the compact display
  const getHighestUsage = () => {
    const usages = [
      { name: 'Queries', percentage: getUsagePercentage(monthlyQueries.current, monthlyQueries.limit), color: getProgressColor(monthlyQueries.current, monthlyQueries.limit) },
      { name: 'Analyses', percentage: getUsagePercentage(propertyAnalyses.current, propertyAnalyses.limit), color: getProgressColor(propertyAnalyses.current, propertyAnalyses.limit) }
    ];
    
    if (planTier === 'PLUS' || planTier === 'ENTERPRISE') {
      usages.push({ name: 'API', percentage: getUsagePercentage(apiCalls.current, apiCalls.limit), color: getProgressColor(apiCalls.current, apiCalls.limit) });
    }

    return usages.reduce((highest, current) => 
      current.percentage > highest.percentage ? current : highest
    );
  };

  const highestUsage = getHighestUsage();

  return (
    <>
      <Tooltip title="Click for usage details">
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            border: `1px solid rgba(31, 170, 188, 0.1)`, // SLEEK: consistent brand border
            backgroundColor: 'transparent', // SLEEK: transparent by default
            cursor: 'pointer',
            transition: 'all 0.3s ease', // SLEEK: smooth transitions
            '&:hover': {
              backgroundColor: `rgba(31, 170, 188, 0.05)`, // SLEEK: subtle brand fill on hover
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(31, 170, 188, 0.1)' // SLEEK: brand shadow
            }
          }}
        >
          <Star sx={{ fontSize: 16, color: getPlanColor(planTier) }} />
          
          <Typography variant="caption" fontWeight="600" sx={{ color: getPlanColor(planTier) }}>
            {planName}
          </Typography>

          <Chip 
            label={planTier} 
            size="small"
            sx={{ 
              backgroundColor: getPlanColor(planTier),
              color: 'white',
              fontSize: '0.6rem',
              height: 16,
              '& .MuiChip-label': { px: 0.5 }
            }}
          />

          {highestUsage.percentage > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {highestUsage.percentage.toFixed(0)}%
              </Typography>
              <Box sx={{ width: 20, height: 3, backgroundColor: 'rgba(31, 170, 188, 0.1)', borderRadius: 1 }}> {/* SLEEK: brand-colored track */}
                <Box
                  sx={{
                    width: `${highestUsage.percentage}%`,
                    height: '100%',
                    backgroundColor: highestUsage.color === 'error' ? '#f44336' : 
                                   highestUsage.color === 'warning' ? '#ff9800' : '#4caf50',
                    borderRadius: 1,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          )}

          <ExpandMore sx={{ fontSize: 14, color: 'text.secondary' }} />
        </Box>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            borderRadius: 2,
            border: `1px solid rgba(31, 170, 188, 0.1)`, // SLEEK: consistent brand border
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Star sx={{ color: getPlanColor(planTier), fontSize: 18 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: getPlanColor(planTier) }}>
                  {planName}
                </Typography>
                <Chip 
                  label={planTier} 
                  size="small"
                  sx={{ 
                    backgroundColor: getPlanColor(planTier),
                    color: 'white',
                    fontSize: '0.65rem',
                    height: 18
                  }}
                />
              </Box>
            </Box>
            {planTier !== 'ENTERPRISE' && onUpgradeClick && (
              <Tooltip title="Upgrade Plan">
                <IconButton size="small" onClick={onUpgradeClick} sx={{ color: getPlanColor(planTier) }}>
                  <Upgrade fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Usage Details */}
          <Stack spacing={2}>
            {/* Monthly Queries */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Queries this month
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold">
                  {monthlyQueries.current} / {formatLimit(monthlyQueries.limit)}
                </Typography>
              </Box>
              {monthlyQueries.limit !== -1 && (
                <LinearProgress
                  variant="determinate"
                  value={getUsagePercentage(monthlyQueries.current, monthlyQueries.limit)}
                  color={getProgressColor(monthlyQueries.current, monthlyQueries.limit)}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              )}
            </Box>

            {/* Property Analyses */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Assessment sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Analyses this month
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold">
                  {propertyAnalyses.current} / {formatLimit(propertyAnalyses.limit)}
                </Typography>
              </Box>
              {propertyAnalyses.limit !== -1 && (
                <LinearProgress
                  variant="determinate"
                  value={getUsagePercentage(propertyAnalyses.current, propertyAnalyses.limit)}
                  color={getProgressColor(propertyAnalyses.current, propertyAnalyses.limit)}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              )}
            </Box>

            {/* API Calls (if plan includes API) */}
            {(planTier === 'PLUS' || planTier === 'ENTERPRISE') && (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ApiOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      API calls today
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight="bold">
                    {apiCalls.current} / {formatLimit(apiCalls.limit)}
                  </Typography>
                </Box>
                {apiCalls.limit !== -1 && (
                  <LinearProgress
                    variant="determinate"
                    value={getUsagePercentage(apiCalls.current, apiCalls.limit)}
                    color={getProgressColor(apiCalls.current, apiCalls.limit)}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                )}
              </Box>
            )}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default CompactPlanInfo;
