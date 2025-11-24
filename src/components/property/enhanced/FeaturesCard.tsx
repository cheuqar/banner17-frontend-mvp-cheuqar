import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Star,
  CheckCircle,
} from '@mui/icons-material';

interface FeaturesCardProps {
  features: string[];
}

/**
 * Features Card Component
 * Displays property features in a grid layout with chips
 * Only renders if features data is available
 */
const FeaturesCard: React.FC<FeaturesCardProps> = ({ features }) => {
  // Don't render if no features
  if (!features || !Array.isArray(features) || features.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600}>
        <Star sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
        Features
      </Typography>

      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        mt: 1
      }}>
        {features.map((feature, index) => (
          <Chip
            key={index}
            label={feature}
            icon={<CheckCircle sx={{ fontSize: 16 }} />}
            variant="outlined"
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              fontSize: '0.75rem',
              height: 28,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white',
                },
              },
            }}
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
        💡 {features.length} feature{features.length !== 1 ? 's' : ''} available
      </Typography>
    </Paper>
  );
};

export default FeaturesCard;