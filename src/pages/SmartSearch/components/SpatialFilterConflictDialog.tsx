import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { resolveSpatialConflict, performSearch } from '../../../store/slices/smartSearchSlice';
import type { RootState, AppDispatch } from '../../../store';

/**
 * SpatialFilterConflictDialog
 *
 * Phase 2.5.9 Sprint 2 - Priority Hierarchy & Conflict Resolution
 *
 * Shows when user tries to set bbox filter while school catchment filter is active.
 * Presents two options:
 * 1. Keep School Catchment - Dismiss dialog, maintain current filter
 * 2. Switch to Map Bounds - Clear catchment, apply bbox, perform new search
 */
const SpatialFilterConflictDialog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const open = useSelector((state: RootState) => state.smartSearch.showSpatialConflictDialog);
  const selectedSchoolsCount = useSelector((state: RootState) =>
    state.smartSearch.schools.selectedSchoolIds.length
  );

  const handleKeepCatchment = () => {
    dispatch(resolveSpatialConflict('keepCatchment'));
    toast.info('Keeping school catchment filter');
  };

  const handleSwitchToBbox = async () => {
    dispatch(resolveSpatialConflict('switchToBbox'));

    // Trigger new search with bbox after state is updated
    setTimeout(() => {
      dispatch(performSearch());
    }, 100);

    toast.success('Switched to map bounds filter');
  };

  return (
    <Dialog
      open={open}
      onClose={handleKeepCatchment} // ESC or backdrop click keeps catchment
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
        }}
      >
        Spatial Filter Conflict
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
          You have an active school catchment filter ({selectedSchoolsCount} {selectedSchoolsCount === 1 ? 'school' : 'schools'}).
          How would you like to proceed?
        </Typography>

        <Box
          sx={{
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1,
            p: 2,
            mt: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            Spatial Filter Priority:
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            <strong>Priority 1 (HIGHEST):</strong> Hand-drawn polygons
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            <strong>Priority 2 (MEDIUM):</strong> School catchment boundaries
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>Priority 3 (LOWEST):</strong> Mapped area (bbox)
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          px: 3,
          py: 2,
          gap: 2,
        }}
      >
        <Button
          onClick={handleKeepCatchment}
          variant="outlined"
          sx={{
            color: 'text.primary',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: 'grey.50',
            },
          }}
        >
          Keep School Catchment
        </Button>
        <Button
          onClick={handleSwitchToBbox}
          variant="contained"
          sx={{
            bgcolor: 'black',
            color: 'white',
            '&:hover': {
              bgcolor: 'grey.800',
            },
          }}
        >
          Switch to Map Bounds
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SpatialFilterConflictDialog;
