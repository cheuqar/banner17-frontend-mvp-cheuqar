import React, { forwardRef, useEffect, useState, useRef } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import { ArrowForward, ChevronRight, Close } from '@mui/icons-material';
import MentionTooltip from './MentionTooltip';
import type { MentionState, MentionCategory, MentionEntity } from '../../types/mention';

interface MentionPopupProps {
  mentionState: MentionState;
  categories: MentionCategory[];
  onCategorySelect: (category: MentionCategory) => void;
  onEntitySelect: (entity: MentionEntity) => void;
  onClose: () => void;
}

const MentionPopup = forwardRef<HTMLDivElement, MentionPopupProps>(({
  mentionState,
  categories,
  onCategorySelect,
  onEntitySelect,
  onClose
}, ref) => {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    entity: MentionEntity | null;
    position: { x: number; y: number };
  }>({
    visible: false,
    entity: null,
    position: { x: 0, y: 0 }
  });
  const listRef = useRef<HTMLDivElement>(null);

  // Show tooltip when highlighted entity changes
  useEffect(() => {
    if (mentionState.currentLevel === 'entities' && 
        mentionState.entities.length > 0 && 
        mentionState.highlightedIndex >= 0 &&
        mentionState.highlightedIndex < mentionState.entities.length) {
      
      const highlightedEntity = mentionState.entities[mentionState.highlightedIndex];
      
      // Get the position of the highlighted list item
      if (listRef.current) {
        const listItems = listRef.current.querySelectorAll('[data-highlighted="true"]');
        if (listItems.length > 0) {
          const highlightedItem = listItems[0] as HTMLElement;
          const rect = highlightedItem.getBoundingClientRect();
          
          setTooltipState({
            visible: true,
            entity: highlightedEntity,
            position: {
              x: rect.right + 10, // To the right of the item
              y: rect.top
            }
          });
        }
      }
    } else {
      setTooltipState(prev => ({ ...prev, visible: false, entity: null }));
    }
  }, [mentionState.highlightedIndex, mentionState.entities, mentionState.currentLevel]);
  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      const highlightedElement = ref.current.querySelector(`[data-highlighted="true"]`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [mentionState.highlightedIndex, ref]);
  const renderCategories = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.5 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.75rem'
          }}
        >
          Select a category
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            p: 0.5,
            '&:hover': {
              bgcolor: 'rgba(31, 170, 188, 0.02)' // SLEEK: subtle brand background
            }
          }}
        >
          <Close fontSize="inherit" />
        </IconButton>
      </Box>
      <Divider />
      <List dense sx={{ py: 0 }}>
        {categories.map((category, index) => (
          <ListItem key={category.id} disablePadding>
            <ListItemButton
              selected={index === mentionState.highlightedIndex}
              onClick={() => onCategorySelect(category)}
              data-highlighted={index === mentionState.highlightedIndex}
              sx={{
                py: 0.5,
                px: 1.5,
                minHeight: 36,
                '&.Mui-selected': {
                  bgcolor: 'rgba(31, 170, 188, 0.05)', // SLEEK: subtle brand selection
                  borderLeft: '2px solid #0d2b2c', // SLEEK: brand border
                  transition: 'all 0.3s ease', // SLEEK: smooth transitions
                  '&:hover': {
                    bgcolor: 'rgba(31, 170, 188, 0.08)', // SLEEK: brand hover
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(31, 170, 188, 0.03)', // SLEEK: subtle brand hover
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 24 }}>
                <span style={{ fontSize: '14px' }}>{category.icon}</span>
              </ListItemIcon>
              <ListItemText 
                primary={category.name}
                secondary={category.description}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ variant: 'caption', fontSize: '0.7rem' }}
              />
              <ChevronRight fontSize="small" sx={{ color: 'text.secondary' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Typography 
        variant="caption" 
        sx={{ 
          px: 2, 
          py: 1, 
          display: 'block',
          color: 'text.secondary',
          fontStyle: 'italic'
        }}
      >
        Use → to select, ↑↓ to navigate, Esc to close
      </Typography>
    </Box>
  );

  const renderEntities = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          >
            {mentionState.selectedCategory === 'properties' ? 'Your Properties' : 'Select an item'}
          </Typography>
          {mentionState.entities.length > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              ({mentionState.entities.length})
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            p: 0.5,
            '&:hover': {
              bgcolor: 'rgba(31, 170, 188, 0.02)' // SLEEK: subtle brand background
            }
          }}
        >
          <Close fontSize="inherit" />
        </IconButton>
      </Box>
      <Divider />
      
      {mentionState.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : mentionState.entities.length === 0 ? (
        <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {mentionState.selectedCategory === 'properties' 
              ? 'No properties found' 
              : 'No items available'}
          </Typography>
        </Box>
      ) : (
        <List dense component="div" sx={{ py: 0, maxHeight: 200, overflowY: 'auto' }} ref={listRef}>
          {mentionState.entities.map((entity, index) => (
            <ListItem key={entity.id} disablePadding>
              <ListItemButton
                selected={index === mentionState.highlightedIndex}
                onClick={() => onEntitySelect(entity)}
                data-highlighted={index === mentionState.highlightedIndex}
                sx={{
                  py: 0.5,
                  px: 1.5,
                  minHeight: 32,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(31, 170, 188, 0.05)', // SLEEK: subtle brand selection
                    borderLeft: '2px solid #0d2b2c', // SLEEK: brand border
                    transition: 'all 0.3s ease', // SLEEK: smooth transitions
                    '&:hover': {
                      bgcolor: 'rgba(31, 170, 188, 0.08)', // SLEEK: brand hover
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(31, 170, 188, 0.03)', // SLEEK: subtle brand hover
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <span style={{ fontSize: '14px' }}>
                    {entity.type === 'property' ? '🏠' : '📍'}
                  </span>
                </ListItemIcon>
                <ListItemText 
                  primary={entity.name}
                  secondary={getEntitySubtitle(entity)}
                  primaryTypographyProps={{ 
                    variant: 'body2', 
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    sx: { 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                  secondaryTypographyProps={{ 
                    variant: 'caption',
                    fontSize: '0.7rem',
                    sx: { 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
                {index === mentionState.highlightedIndex && (
                  <ArrowForward fontSize="small" sx={{ color: 'primary.main' }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      
      {/* Pagination and status info */}
      <Divider />
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic',
            flex: 1
          }}
        >
          Enter/Space/→ to select, ↑↓ to navigate, Esc to close
        </Typography>
        
        {/* Show pagination status */}
        {mentionState.currentLevel === 'entities' && mentionState.entities.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {mentionState.isLoading && (
              <CircularProgress size={12} sx={{ color: 'text.secondary' }} />
            )}
            {mentionState.hasMore && (
              <Typography variant="caption" color="text.secondary">
                Scroll for more
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  const getEntitySubtitle = (entity: MentionEntity): string => {
    if (entity.type === 'property') {
      const parts = [];
      
      // Add suburb and state first for location context
      const locationParts = [];
      if (entity.entity_metadata.suburb) locationParts.push(entity.entity_metadata.suburb);
      if (entity.entity_metadata.state) locationParts.push(entity.entity_metadata.state);
      if (locationParts.length > 0) {
        parts.push(locationParts.join(', '));
      }
      
      // Add property details
      if (entity.entity_metadata.property_type) parts.push(entity.entity_metadata.property_type);
      if (entity.entity_metadata.bedrooms) parts.push(`${entity.entity_metadata.bedrooms} bed`);
      if (entity.entity_metadata.bathrooms) parts.push(`${entity.entity_metadata.bathrooms} bath`);
      
      return parts.join(' • ');
    }
    return entity.display_text;
  };

  return (
    <Paper
      ref={ref}
      elevation={4}
      role="listbox"
      aria-label={mentionState.currentLevel === 'categories' ? 'Select a category' : 'Select an item'}
      sx={{
        position: 'fixed',
        bottom: 100,
        left: 20,
        right: 20,
        maxWidth: 400,
        mx: 'auto',
        zIndex: 1300,
        borderRadius: 1.5,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {mentionState.currentLevel === 'categories' 
        ? renderCategories() 
        : renderEntities()}
      
      {/* Tooltip for highlighted entity */}
      {tooltipState.entity && (
        <MentionTooltip
          entity={tooltipState.entity}
          position={tooltipState.position}
          visible={tooltipState.visible}
        />
      )}
    </Paper>
  );
});

MentionPopup.displayName = 'MentionPopup';

export default MentionPopup;
