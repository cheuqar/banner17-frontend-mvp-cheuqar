import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Popover,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  Badge
} from '@mui/material';
import {
  AutoAwesome,
  ExpandMore,
  ExpandLess,
  Close,
  TipsAndUpdates
} from '@mui/icons-material';

import { suggestionsService, type SuggestionResponse, type SuggestionsListResponse } from '../../services/suggestionsService';

interface SuggestionsButtonProps {
  renderInstruction?: Record<string, any>;
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
  context?: string;
  hasCurrentData?: boolean;
}

const SuggestionsButton: React.FC<SuggestionsButtonProps> = ({
  renderInstruction,
  onSuggestionClick,
  disabled = false,
  context = 'general_chat',
  hasCurrentData = false
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionsListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Reset state when render instruction changes
  useEffect(() => {
    if (renderInstruction) {
      setSuggestions(null);
      setError(null);
    }
  }, [renderInstruction]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    
    if (!suggestions && !loading) {
      await loadSuggestions();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Fallback suggestions organized by context
  const getFallbackSuggestions = (contextType: string): SuggestionsListResponse => {
    const fallbackMap: Record<string, SuggestionResponse[]> = {
      general_chat: [
        { question: "Show me properties under $500k", context: "general_chat", category: "price_analysis", priority: 0.9, requires_data: false },
        { question: "Find apartments in Sydney", context: "general_chat", category: "location_analysis", priority: 0.8, requires_data: false },
        { question: "What amenities are nearby?", context: "general_chat", category: "amenities", priority: 0.7, requires_data: false },
        { question: "Show houses with 3+ bedrooms", context: "general_chat", category: "refinement", priority: 0.6, requires_data: false },
        { question: "Find properties in NSW", context: "general_chat", category: "location_analysis", priority: 0.5, requires_data: false },
        { question: "What can you help me with?", context: "general_chat", category: "general", priority: 0.4, requires_data: false }
      ],
      property_list: [
        { question: "Which one is the cheapest?", context: "property_list", category: "price_analysis", priority: 0.9, requires_data: true },
        { question: "Show me the most expensive property", context: "property_list", category: "price_analysis", priority: 0.8, requires_data: true },
        { question: "Plot them on a map", context: "property_list", category: "location_analysis", priority: 0.7, requires_data: true },
        { question: "Which one has the most bedrooms?", context: "property_list", category: "comparison", priority: 0.6, requires_data: true },
        { question: "Find similar properties in VIC", context: "property_list", category: "refinement", priority: 0.5, requires_data: false },
        { question: "What amenities are nearby?", context: "property_list", category: "amenities", priority: 0.4, requires_data: true }
      ],
      amenity_list: [
        { question: "Which one is closest?", context: "amenity_list", category: "location_analysis", priority: 0.9, requires_data: true },
        { question: "Show me directions", context: "amenity_list", category: "location_analysis", priority: 0.8, requires_data: true },
        { question: "Find properties nearby", context: "amenity_list", category: "refinement", priority: 0.7, requires_data: false },
        { question: "Tell me more about the closest one", context: "amenity_list", category: "general", priority: 0.6, requires_data: true },
        { question: "Show hospitals within 2km", context: "amenity_list", category: "amenities", priority: 0.5, requires_data: false },
        { question: "What other amenities are nearby?", context: "amenity_list", category: "amenities", priority: 0.4, requires_data: false }
      ]
    };

    const suggestions = fallbackMap[contextType] || fallbackMap.general_chat;
    return {
      suggestions,
      context: contextType,
      total_available: suggestions.length,
      message: 'Here are some questions you can ask:'
    };
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result: SuggestionsListResponse;
      
      if (renderInstruction) {
        result = await suggestionsService.getSuggestionsForRenderInstruction(renderInstruction);
      } else {
        result = await suggestionsService.getQuickSuggestions(context);
      }
      
      // Filter suggestions based on current state
      const filteredSuggestions = suggestionsService.filterSuggestionsByRelevance(
        result.suggestions,
        hasCurrentData,
        renderInstruction?.type
      );
      
      setSuggestions({
        ...result,
        suggestions: filteredSuggestions
      });
      
    } catch (err) {
      console.error('Error loading suggestions:', err);
      console.log('🔄 Using fallback suggestions due to API error');
      
      // Use fallback suggestions when API fails
      const fallbackResult = getFallbackSuggestions(context || 'general_chat');
      const filteredSuggestions = suggestionsService.filterSuggestionsByRelevance(
        fallbackResult.suggestions,
        hasCurrentData,
        renderInstruction?.type
      );
      
      setSuggestions({
        ...fallbackResult,
        suggestions: filteredSuggestions
      });
      
      setError(null); // Clear error since we have fallback suggestions
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionResponse) => {
    onSuggestionClick(suggestion.question);
    handleClose();
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const open = Boolean(anchorEl);
  const suggestionCount = suggestions?.suggestions.length || 0;

  // Group suggestions by category
  const groupedSuggestions = suggestions 
    ? suggestionsService.groupSuggestionsByCategory(suggestions.suggestions)
    : {};

  return (
    <>
      <Badge 
        badgeContent={suggestionCount > 0 ? suggestionCount : 0} 
        color="primary"
        invisible={suggestionCount === 0}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={handleClick}
          disabled={disabled}
          startIcon={<TipsAndUpdates />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            minWidth: 'auto',
            px: 2,
            py: 1,
            border: '2px solid',
            borderColor: 'primary.200',
            bgcolor: 'primary.50',
            '&:hover': {
              bgcolor: 'primary.100',
              borderColor: 'primary.300',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
            '&:disabled': {
              bgcolor: 'grey.100',
              borderColor: 'grey.300',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Suggestions
        </Button>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: -1,
            borderRadius: 2,
            minWidth: 400,
            maxWidth: 500,
            maxHeight: 600,
            overflow: 'hidden',
          }
        }}
      >
        <Paper sx={{ width: '100%' }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.50', 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Suggestions
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleClose}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={32} />
              </Box>
            )}

            {error && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Box>
            )}

            {suggestions && !loading && (
              <Box>
                {/* Message */}
                {suggestions.message && (
                  <Box sx={{ p: 2, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {suggestions.message}
                    </Typography>
                  </Box>
                )}

                {/* Suggestions by category */}
                {Object.entries(groupedSuggestions).map(([category, categorySuggestions]) => {
                  const categoryInfo = suggestionsService.getCategoryDisplayInfo(category);
                  const isExpanded = expandedCategories.has(category);

                  return (
                    <Box key={category}>
                      {/* Category Header */}
                      <ListItemButton 
                        onClick={() => toggleCategory(category)}
                        sx={{ 
                          py: 1.5,
                          bgcolor: 'grey.50',
                          '&:hover': {
                            bgcolor: 'grey.100'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <span style={{ fontSize: '1.2rem' }}>{categoryInfo.icon}</span>
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {categoryInfo.name}
                              </Typography>
                              <Chip 
                                label={categorySuggestions.length}
                                size="small"
                                sx={{ 
                                  height: 20,
                                  bgcolor: categoryInfo.color + '20',
                                  color: categoryInfo.color,
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
                          }
                        />
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>

                      {/* Category Suggestions */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List dense sx={{ pl: 2 }}>
                          {categorySuggestions.map((suggestion, index) => (
                            <ListItem key={index} disablePadding>
                              <ListItemButton
                                onClick={() => handleSuggestionClick(suggestion)}
                                sx={{
                                  py: 1,
                                  borderRadius: 1,
                                  mx: 1,
                                  '&:hover': {
                                    bgcolor: 'primary.50',
                                  }
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography 
                                      variant="body2"
                                      sx={{ 
                                        color: suggestion.priority > 1.3 ? 'primary.main' : 'text.primary',
                                        fontWeight: suggestion.priority > 1.3 ? 600 : 400
                                      }}
                                    >
                                      {suggestion.question}
                                    </Typography>
                                  }
                                />
                                {suggestion.priority > 1.3 && (
                                  <Chip
                                    label="Recommended"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ 
                                      height: 20,
                                      fontSize: '0.65rem',
                                      ml: 1
                                    }}
                                  />
                                )}
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                      
                      <Divider />
                    </Box>
                  );
                })}

                {/* Empty state */}
                {suggestionCount === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No suggestions available for this context.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Footer */}
          {suggestions && (
            <Box sx={{ 
              p: 1.5, 
              bgcolor: 'grey.50', 
              borderTop: '1px solid', 
              borderColor: 'divider',
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="text.secondary">
                {suggestionCount} suggestion{suggestionCount !== 1 ? 's' : ''} available
              </Typography>
            </Box>
          )}
        </Paper>
      </Popover>
    </>
  );
};

export default SuggestionsButton;
