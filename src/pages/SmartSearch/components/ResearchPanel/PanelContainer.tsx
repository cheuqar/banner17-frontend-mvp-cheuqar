import React from 'react';
import { Box, Paper, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { closePanel, type PanelType } from '../../../../store/slices/smartSearchSlice';
import { selectThemeColors } from '../../../../store/slices/themeSlice';
import type { RootState } from '../../../../store';
import type { School } from '../../../../types/smartSearch';
import type { Amenity } from '../../../../store/slices/smartSearchSlice';
import AddressSearchPanel from './AddressSearchPanel';
import SchoolPanel from '../SchoolPanel';
import { AmenitiesPanel } from '../AmenitiesPanel';

interface PanelContainerProps {
  children?: React.ReactNode;
  onCenterSchool?: (school: School) => void;
  onCenterAmenity?: (amenity: Amenity) => void; // Phase 2.32.1: Map centering for amenities
}

const PANEL_TITLES: Record<Exclude<PanelType, null>, string> = {
  address: 'Address Research',
  amenities: 'Nearby Amenities',
  schools: 'School Catchments',
};

const PanelContainer: React.FC<PanelContainerProps> = ({ children, onCenterSchool, onCenterAmenity }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const themeColors = useSelector(selectThemeColors);
  const { activePanel, panelWidth } = useSelector(
    (state: RootState) => state.smartSearch.mapControls
  );

  const handleClose = () => {
    dispatch(closePanel());
  };

  // Don't render if no panel is active or if mobile (use bottom sheet instead)
  if (!activePanel || isMobile) {
    return null;
  }

  const title = PANEL_TITLES[activePanel];

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: panelWidth,
        height: '100%',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: activePanel ? 'translateX(0)' : `translateX(${panelWidth}px)`,
        transition: 'transform 0.3s ease',
        bgcolor: 'background.paper',
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: themeColors.primaryDark,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: themeColors.primaryLight }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: themeColors.primaryLight,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Panel Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {activePanel === 'address' && <AddressSearchPanel />}
        {activePanel === 'amenities' && <AmenitiesPanel onCenterAmenity={onCenterAmenity} />}
        {activePanel === 'schools' && <SchoolPanel onCenterSchool={onCenterSchool} />}
        {children}
      </Box>
    </Paper>
  );
};

export default PanelContainer;
