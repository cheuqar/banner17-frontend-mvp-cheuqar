import React from 'react';
import {
  Box,
  Typography,
  Chip
} from '@mui/material';
import type { School } from '../../../store/slices/smartSearchSlice';

interface SelectedSchoolsSectionProps {
  schools: School[];
  onRemove: (school: School) => void;
}

export const SelectedSchoolsSection: React.FC<SelectedSchoolsSectionProps> = ({
  schools,
  onRemove
}) => {
  if (schools.length === 0) {
    return null; // Hide section when no schools selected
  }

  return (
    <Box sx={{
      borderBottom: '1px solid',
      borderColor: 'grey.300',
      bgcolor: 'grey.50',
      p: 1.5
    }}>
      {/* Compact Header */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          display: 'block',
          mb: 1
        }}
      >
        SELECTED ({schools.length})
      </Typography>

      {/* Horizontal Chip Layout */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.75
      }}>
        {schools.map((school, index) => (
          <Chip
            key={school.id}
            label={school.name}
            onDelete={() => onRemove(school)}
            data-testid={`selected-school-chip-${index}`}
            size="small"
            sx={{
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.300',
              '& .MuiChip-label': {
                px: 1.5,
                fontSize: '0.813rem',
                fontWeight: 500
              },
              '& .MuiChip-deleteIcon': {
                fontSize: '0.938rem',
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main'
                }
              },
              maxWidth: '100%'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
