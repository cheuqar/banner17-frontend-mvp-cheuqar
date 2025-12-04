import React from 'react';
import { SwipeableDrawer, Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { closePanel, type PanelType } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';

interface MobileBottomSheetProps {
  children?: React.ReactNode;
}

const PANEL_TITLES: Record<Exclude<PanelType, null>, string> = {
  address: 'Address Research',
  amenities: 'Nearby Amenities',
  schools: 'School',
};

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const activePanel = useSelector(
    (state: RootState) => state.smartSearch.mapControls.activePanel
  );

  const handleClose = () => {
    dispatch(closePanel());
  };

  // Only render on mobile
  if (!isMobile || !activePanel) {
    return null;
  }

  const title = PANEL_TITLES[activePanel];

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={!!activePanel}
      onClose={handleClose}
      onOpen={() => {}} // Required by SwipeableDrawer but not used
      disableSwipeToOpen
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          height: '60vh',
          maxHeight: '80vh',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Handle/Puller */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pt: 1,
          pb: 0.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: 'divider',
          }}
        />
      </Box>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          py: 2,
        }}
      >
        {children || (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Panel content will be implemented in the next phase.
          </Typography>
        )}
      </Box>
    </SwipeableDrawer>
  );
};

export default MobileBottomSheet;
