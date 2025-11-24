import React from 'react';
import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { LocationOn, LocalHospital, School } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { togglePanel, type PanelType } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';

const ToggleButtons: React.FC = () => {
  const dispatch = useDispatch();
  const activePanel = useSelector((state: RootState) => state.smartSearch.mapControls.activePanel);

  const handleToggle = (_event: React.MouseEvent<HTMLElement>, newPanel: PanelType) => {
    // ToggleButtonGroup passes null when clicking the active button
    // Our togglePanel action handles the logic
    dispatch(togglePanel(newPanel || activePanel));
  };

  return (
    <ToggleButtonGroup
      value={activePanel}
      exclusive
      onChange={handleToggle}
      size="small"
      sx={{
        bgcolor: 'background.paper',
        '& .MuiToggleButton-root': {
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.secondary',
          px: 1.5,
          py: 0.5,
          '&.Mui-selected': {
            bgcolor: 'text.primary',
            color: 'background.paper',
            '&:hover': {
              bgcolor: 'text.primary',
              opacity: 0.9,
            },
          },
          '&:hover': {
            bgcolor: 'action.hover',
          },
        },
      }}
    >
      <ToggleButton value="address">
        <Tooltip title="Address Research">
          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
        </Tooltip>
      </ToggleButton>

      <ToggleButton value="amenities">
        <Tooltip title="Nearby Amenities">
          <LocalHospital fontSize="small" sx={{ mr: 0.5 }} />
        </Tooltip>
      </ToggleButton>

      <ToggleButton value="schools">
        <Tooltip title="School Catchments">
          <School fontSize="small" sx={{ mr: 0.5 }} />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ToggleButtons;
