/**
 * Refinement Suggestions Panel Component
 *
 * Displays and manages AI-powered improvement suggestions:
 * - Categorized suggestions (Location, Budget, Amenities, Context, Clarity)
 * - Confidence scores and impact levels
 * - Checkbox selection for applying improvements
 * - Before/after preview of changes
 *
 * Phase 3.7.4: UI Integration for AI Refinement Service
 */

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Skeleton,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  AttachMoney as BudgetIcon,
  Home as AmenitiesIcon,
  Person as ContextIcon,
  Edit as ClarityIcon,
  TrendingUp as ImpactIcon,
  Psychology as ConfidenceIcon,
  Dataset as DataIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';
import type {
  RefinementSuggestions,
  RefinementSuggestion,
  RefinementCategory,
} from '../../types/buyerProfile';

interface RefinementSuggestionsPanelProps {
  suggestions: RefinementSuggestions | null;
  selectedSuggestions: string[];
  onToggleSuggestion: (suggestionId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  isLoading?: boolean;
  error?: string | null;
  sx?: any;
}

/**
 * Category icon mapping
 */
const getCategoryIcon = (category: RefinementCategory) => {
  switch (category) {
    case 'location': return <LocationIcon />;
    case 'budget': return <BudgetIcon />;
    case 'amenities': return <AmenitiesIcon />;
    case 'context': return <ContextIcon />;
    case 'clarity': return <ClarityIcon />;
    default: return <ImpactIcon />;
  }
};

/**
 * Get category color
 */
const getCategoryColor = (category: RefinementCategory): string => {
  switch (category) {
    case 'location': return '#2196f3';
    case 'budget': return '#4caf50';
    case 'amenities': return '#ff9800';
    case 'context': return '#9c27b0';
    case 'clarity': return '#607d8b';
    default: return '#757575';
  }
};

/**
 * Get impact color
 */
const getImpactColor = (impact: 'low' | 'medium' | 'high'): 'default' | 'info' | 'warning' | 'error' => {
  switch (impact) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

/**
 * Get priority color
 */
const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high': return '#f44336';
    case 'medium': return '#ff9800';
    case 'low': return '#4caf50';
    default: return '#757575';
  }
};

/**
 * Individual suggestion item component
 */
const SuggestionItem: React.FC<{
  suggestion: RefinementSuggestion;
  isSelected: boolean;
  onToggle: (id: string) => void;
}> = ({ suggestion, isSelected, onToggle }) => {
  // Add safety checks for suggestion properties
  if (!suggestion || !suggestion.id) {
    return null;
  }

  return (
    <ListItem
      sx={{
        border: `2px solid ${isSelected ? getCategoryColor(suggestion.category) : '#e0e0e0'}`,
        borderRadius: 1,
        mb: 1,
        backgroundColor: isSelected ? `${getCategoryColor(suggestion.category)}08` : 'white',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: `${getCategoryColor(suggestion.category)}12`,
        },
      }}
    >
      <ListItemIcon>
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(suggestion.id)}
          color="primary"
        />
      </ListItemIcon>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {suggestion.title || 'Untitled Suggestion'}
            </Typography>
            <Chip
              label={suggestion.impact || 'medium'}
              size="small"
              color={getImpactColor(suggestion.impact || 'medium')}
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {suggestion.description || 'No description available'}
            </Typography>

            {/* Before/After Text */}
            {(suggestion.before_text || suggestion.after_text) && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <strong>Before:</strong> "{suggestion.before_text || 'N/A'}"
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <strong>After:</strong> "{suggestion.after_text || 'N/A'}"
                </Typography>
              </Box>
            )}

            {/* Data Support */}
            {suggestion.data_support && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <DataIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {suggestion.data_support.property_count && (
                    `${suggestion.data_support.property_count.toLocaleString()} properties`
                  )}
                  {suggestion.data_support.avg_price && (
                    ` • Avg: $${suggestion.data_support.avg_price.toLocaleString()}`
                  )}
                  {suggestion.data_support.available_alternatives && (
                    ` • Alternatives: ${suggestion.data_support.available_alternatives.join(', ')}`
                  )}
                </Typography>
              </Box>
            )}

            {/* Confidence */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <ConfidenceIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Confidence: {Math.round((suggestion.confidence || 0) * 100)}%
              </Typography>
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
};

/**
 * Category accordion component
 */
const CategoryAccordion: React.FC<{
  category: RefinementCategory;
  suggestions: RefinementSuggestion[];
  selectedSuggestions: string[];
  onToggleSuggestion: (id: string) => void;
  categoryStats: { count: number; priority: 'low' | 'medium' | 'high' };
}> = ({ category, suggestions, selectedSuggestions, onToggleSuggestion, categoryStats }) => {
  const selectedCount = suggestions.filter(s => selectedSuggestions.includes(s.id)).length;
  const categoryColor = getCategoryColor(category);

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: `${categoryColor}08`,
          borderLeft: `4px solid ${categoryColor}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ color: categoryColor, mr: 1 }}>
            {getCategoryIcon(category)}
          </Box>
          <Typography variant="h6" sx={{ flex: 1, textTransform: 'capitalize' }}>
            {category}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={selectedCount} color="primary">
              <Chip
                label={`${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'}`}
                size="small"
                variant="outlined"
              />
            </Badge>
            <Chip
              label={categoryStats.priority}
              size="small"
              sx={{
                backgroundColor: getPriorityColor(categoryStats.priority),
                color: 'white',
              }}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <List disablePadding>
          {suggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              isSelected={selectedSuggestions.includes(suggestion.id)}
              onToggle={onToggleSuggestion}
            />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

/**
 * Loading skeleton
 */
const SuggestionsPanelSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </CardContent>
  </Card>
);

/**
 * Main RefinementSuggestionsPanel component
 */
export const RefinementSuggestionsPanel: React.FC<RefinementSuggestionsPanelProps> = ({
  suggestions,
  selectedSuggestions,
  onToggleSuggestion,
  onSelectAll,
  onClearAll,
  isLoading = false,
  error,
  sx,
}) => {
  // Group suggestions by category
  const suggestionsByCategory = useMemo(() => {
    if (!suggestions) return {};

    return suggestions.suggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.category]) {
        acc[suggestion.category] = [];
      }
      acc[suggestion.category].push(suggestion);
      return acc;
    }, {} as Record<RefinementCategory, RefinementSuggestion[]>);
  }, [suggestions]);

  // Calculate totals
  const totalSuggestions = suggestions?.suggestions.length || 0;
  const selectedCount = selectedSuggestions.length;

  // Loading state
  if (isLoading) {
    return (
      <Box sx={sx}>
        <SuggestionsPanelSkeleton />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Card sx={sx}>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            Failed to Load Suggestions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // No suggestions state
  if (!suggestions || totalSuggestions === 0) {
    return (
      <Card sx={sx}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Improvement Suggestions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No suggestions available. Try analyzing your prompt first.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={sx}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Improvement Suggestions
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${selectedCount}/${totalSuggestions} selected`}
              color={selectedCount > 0 ? 'primary' : 'default'}
              variant="outlined"
            />
            <Chip
              label={suggestions.overall_priority}
              sx={{
                backgroundColor: getPriorityColor(suggestions.overall_priority),
                color: 'white',
              }}
            />
          </Box>
        </Box>

        {/* Estimated Improvement */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Estimated Quality Improvement: +{suggestions.estimated_improvement} points
          </Typography>
          <LinearProgress
            variant="determinate"
            value={suggestions.estimated_improvement}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4caf50',
              },
            }}
          />
        </Box>

        {/* Selection Controls */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckBoxIcon />}
            onClick={onSelectAll}
            disabled={selectedCount === totalSuggestions}
          >
            Select All
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckBoxOutlineBlankIcon />}
            onClick={onClearAll}
            disabled={selectedCount === 0}
          >
            Clear All
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Category Accordions */}
        <Box sx={{ mb: 2 }}>
          {Object.entries(suggestionsByCategory).map(([category, categorySuggestions]) => {
            const categoryStats = suggestions.categories[category as RefinementCategory];
            // Handle case where categoryStats might be undefined or have different structure
            const safeStats = categoryStats || { count: (categorySuggestions as RefinementSuggestion[]).length, priority: 'medium' as const };

            return (
              <CategoryAccordion
                key={category}
                category={category as RefinementCategory}
                suggestions={categorySuggestions as RefinementSuggestion[]}
                selectedSuggestions={selectedSuggestions}
                onToggleSuggestion={onToggleSuggestion}
                categoryStats={safeStats}
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RefinementSuggestionsPanel;