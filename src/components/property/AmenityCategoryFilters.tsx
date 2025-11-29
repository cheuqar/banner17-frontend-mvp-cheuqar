/**
 * Amenity Category Filters Component
 * Provides accordion-style category selection for filtering amenities
 */

import React, { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Chip,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore,
  LocalHospital,
  LocalLibrary,
  ShoppingCart,
  School,
  BeachAccess,
  SportsBaseball,
  Attractions,
  ClearAll,
  SelectAll,
  ChildCare,
} from '@mui/icons-material';

import type { AmenitiesByCategory } from '../../services/amenitiesService';

// Category configuration with icons and labels
export const AMENITY_CATEGORIES = {
  hospitals: {
    label: 'Hospitals & Medical',
    icon: LocalHospital,
    color: '#f44336', // red
  },
  libraries: {
    label: 'Libraries',
    icon: LocalLibrary,
    color: '#2196f3', // blue
  },
  shopping: {
    label: 'Shopping Centers',
    icon: ShoppingCart,
    color: '#4caf50', // green
  },
  schools: {
    label: 'Schools & Education',
    icon: School,
    color: '#ff9800', // orange
  },
  child_care: {
    label: 'Child Care',
    icon: ChildCare,
    color: '#e91e63', // pink
  },
  beaches: {
    label: 'Beaches & Waterfront',
    icon: BeachAccess,
    color: '#00bcd4', // cyan
  },
  sports: {
    label: 'Sports & Recreation',
    icon: SportsBaseball,
    color: '#9c27b0', // purple
  },
  tourist_attractions: {
    label: 'Tourist Attractions',
    icon: Attractions,
    color: '#795548', // brown
  },
} as const;

export interface CategoryFilter {
  category: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  count: number;
  selected: boolean;
}

export interface AmenityCategoryFiltersProps {
  amenitiesByCategory: AmenitiesByCategory;
  selectedCategories: string[];
  onSelectionChange: (selectedCategories: string[]) => void;
  loading?: boolean;
  totalCount?: number;
}

export const AmenityCategoryFilters: React.FC<AmenityCategoryFiltersProps> = ({
  amenitiesByCategory,
  selectedCategories,
  onSelectionChange,
  loading = false,
  totalCount = 0,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  // Process category data with counts and selection state
  const categoryFilters: CategoryFilter[] = useMemo(() => {
    return Object.entries(AMENITY_CATEGORIES).map(([category, config]) => ({
      category,
      label: config.label,
      icon: config.icon,
      color: config.color,
      count: amenitiesByCategory[category]?.length || 0,
      selected: selectedCategories.includes(category),
    }));
  }, [amenitiesByCategory, selectedCategories]);

  // Available categories (with amenities found)
  const availableCategories = categoryFilters.filter(cat => cat.count > 0);
  const selectedCount = selectedCategories.length;

  const handleCategoryToggle = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(cat => cat !== category)
      : [...selectedCategories, category];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allAvailable = availableCategories.map(cat => cat.category);
    onSelectionChange(allAvailable);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleAccordionToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Accordion 
        expanded={expanded} 
        onChange={handleAccordionToggle}
        sx={{ 
          boxShadow: 1,
          '&:before': { display: 'none' } // Remove default accordion divider
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMore />}
          sx={{ 
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
            minHeight: 48,
            '&.Mui-expanded': { minHeight: 48 }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%',
            mr: 1
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Category Filters
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedCount > 0 && (
                <Chip 
                  label={`${selectedCount} selected`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {totalCount} total
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 1, pb: 2 }}>
          {/* Action buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 2,
            gap: 1
          }}>
            <Tooltip title="Select all categories with amenities">
              <IconButton 
                size="small" 
                onClick={handleSelectAll}
                disabled={loading || availableCategories.length === 0}
                sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.2)' }
                }}
              >
                <SelectAll fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Typography variant="caption" color="text.secondary" sx={{ 
              alignSelf: 'center',
              flex: 1,
              textAlign: 'center'
            }}>
              {availableCategories.length} categories available
            </Typography>
            
            <Tooltip title="Clear all selections">
              <IconButton 
                size="small" 
                onClick={handleClearAll}
                disabled={loading || selectedCount === 0}
                sx={{ 
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.2)' }
                }}
              >
                <ClearAll fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Category checkboxes */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {categoryFilters.map((filter) => {
              const IconComponent = filter.icon;
              const isAvailable = filter.count > 0;
              
              return (
                <FormControlLabel
                  key={filter.category}
                  control={
                    <Checkbox
                      checked={filter.selected}
                      onChange={() => handleCategoryToggle(filter.category)}
                      disabled={loading}
                      size="small"
                      sx={{
                        color: filter.color,
                        '&.Mui-checked': { color: filter.color },
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    />
                  }
                  label={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      width: '100%'
                    }}>
                      <IconComponent 
                        fontSize="small" 
                        sx={{ 
                          color: isAvailable ? filter.color : 'text.disabled',
                          opacity: isAvailable ? 1 : 0.5
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          flex: 1,
                          color: isAvailable ? 'text.primary' : 'text.secondary',
                          fontWeight: filter.selected ? 600 : 400,
                          userSelect: 'none'
                        }}
                      >
                        {filter.label}
                      </Typography>
                      <Badge 
                        badgeContent={filter.count} 
                        color={filter.selected ? "primary" : "default"}
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: isAvailable 
                              ? (filter.selected ? filter.color : 'rgba(0, 0, 0, 0.26)')
                              : 'rgba(0, 0, 0, 0.12)',
                            color: isAvailable ? 'white' : 'rgba(0, 0, 0, 0.38)',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            minWidth: '18px',
                            height: '18px'
                          }
                        }}
                      />
                    </Box>
                  }
                  sx={{ 
                    margin: 0,
                    padding: '4px 8px',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: isAvailable ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                    },
                    opacity: isAvailable ? 1 : 0.6
                  }}
                />
              );
            })}
          </Box>

          {/* No amenities message */}
          {availableCategories.length === 0 && !loading && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 2,
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                No amenities found within search radius
              </Typography>
            </Box>
          )}

          {/* Loading state */}
          {loading && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 2,
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                Loading categories...
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AmenityCategoryFilters;
