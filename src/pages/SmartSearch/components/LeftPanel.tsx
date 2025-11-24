import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import PropertyList from './PropertyList';
import type { BaseProperty } from '../../../types/property-enhanced';
import { useDispatch, useSelector } from 'react-redux';
import {
  togglePropertyPanel,
  selectPropertyPanelVisible,
  setFiltersOverlayVisible,
} from '../../../store/slices/smartSearchSlice';
import { selectThemeColors, selectThemeBorder } from '../../../store/slices/themeSlice';
import type { RootState, AppDispatch } from '../../../store';

interface LeftPanelProps {
  visiblePropertyIds?: string[];
  onPropertyClick?: (property: BaseProperty) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  visiblePropertyIds,
  onPropertyClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const activeFilters = useSelector((state: RootState) => state.smartSearch.activeFilters);
  const themeColors = useSelector(selectThemeColors);
  const themeBorder = useSelector(selectThemeBorder);

  // Phase 2.17.2: Get panel visibility state from Redux
  const propertyPanelVisible = useSelector(selectPropertyPanelVisible);

  // Phase 2.18.3: Open filter dialog
  const handleOpenFilters = () => {
    dispatch(setFiltersOverlayVisible(true));
  };

  // Phase 2.17.2: Handle panel collapse
  const handleCollapse = () => {
    dispatch(togglePropertyPanel());
  };

  // Phase 2.17.2: Keyboard support - Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && propertyPanelVisible) {
        dispatch(togglePropertyPanel());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, propertyPanelVisible]);

  return (
    <Box
      sx={{
        width: 350,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `2px solid ${themeBorder}`,
        bgcolor: themeColors.primaryLight,
        // Phase 2.17.2: GPU-accelerated slide animation
        transform: propertyPanelVisible ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        willChange: 'transform',
        position: 'relative',
        boxShadow: propertyPanelVisible ? `4px 0 16px ${themeColors.primaryDark}33` : 'none', // 33 = 20% opacity in hex
      }}
      role="complementary"
      aria-label="Property list and filters panel"
      aria-hidden={!propertyPanelVisible}
    >
      {/* Top Controls Section */}
      <Box
        sx={{
          flexShrink: 0,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {/* Phase 2.18.3: Inline Filters Button */}
        <Button
          onClick={handleOpenFilters}
          fullWidth
          variant="outlined"
          startIcon={<FilterListIcon fontSize="small" />}
          aria-label="Open filter dialog"
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            py: 1,
            px: 2,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'text.primary',
              bgcolor: 'action.hover',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Typography variant="body1" fontWeight={600}>
              Filters
            </Typography>
            {activeFilters.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontWeight: 600,
                }}
              >
                {activeFilters.length}
              </Typography>
            )}
          </Box>
        </Button>

        {/* Phase 2.17.2: Collapse Button */}
        {/* Phase 2.17.6: Hide on mobile/tablet (<1024px) */}
        <Tooltip title="Hide panel (Esc)" placement="left">
          <IconButton
            onClick={handleCollapse}
            size="small"
            aria-label="Hide property list panel"
            sx={{
              flexShrink: 0,
              color: 'text.secondary',
              '@media (max-width: 1023px)': {
                display: 'none',
              },
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Property List Section (always visible, independent scrolling) */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <PropertyList
          visibleOnMap={visiblePropertyIds}
          onPropertyClick={onPropertyClick}
        />
      </Box>
    </Box>
  );
};

export default LeftPanel;
