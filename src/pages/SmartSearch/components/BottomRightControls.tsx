import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';

interface BottomRightControlsProps {
  // Zoom controls
  onZoomIn: () => void;
  onZoomOut: () => void;

  // Draw mode controls
  drawMode: boolean;
  onToggleDrawMode: () => void;
  hasDrawings: boolean;
  onClearDrawings: () => void;
}

const BottomRightControls: React.FC<BottomRightControlsProps> = ({
  onZoomIn,
  onZoomOut,
  drawMode,
  onToggleDrawMode,
  hasDrawings,
  onClearDrawings
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 60, // Increased from 20 to 60 to clear status bar
        left: 20, // Changed from right to left
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000,
        // Mobile responsive
        '@media (max-width: 768px)': {
          bottom: 56, // Increased from 16 to 56 for mobile
          left: 16, // Changed from right to left
        }
      }}
    >
      {/* Zoom In Button */}
      <Tooltip title="Zoom In" placement="right">
        <IconButton
          onClick={onZoomIn}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: 'white',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'grey.100',
              boxShadow: 3
            },
            // Mobile responsive
            '@media (max-width: 768px)': {
              width: 36,
              height: 36,
            }
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Zoom Out Button */}
      <Tooltip title="Zoom Out" placement="right">
        <IconButton
          onClick={onZoomOut}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: 'white',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'grey.100',
              boxShadow: 3
            },
            // Mobile responsive
            '@media (max-width: 768px)': {
              width: 36,
              height: 36,
            }
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Draw Mode Toggle Button */}
      <Tooltip title={drawMode ? "Exit Draw Mode" : "Draw Area"} placement="right">
        <IconButton
          onClick={onToggleDrawMode}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: drawMode ? 'primary.main' : 'white',
            color: drawMode ? 'white' : 'text.primary',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: drawMode ? 'primary.dark' : 'grey.100',
              boxShadow: 3
            },
            // Mobile responsive
            '@media (max-width: 768px)': {
              width: 36,
              height: 36,
            }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Clear Drawings Button - Only show when there are drawings */}
      {hasDrawings && (
        <Tooltip title="Clear Drawings" placement="right">
          <IconButton
            onClick={onClearDrawings}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'error.main',
              color: 'white',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'error.dark',
                boxShadow: 3
              },
              // Mobile responsive
              '@media (max-width: 768px)': {
                width: 36,
                height: 36,
              }
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default BottomRightControls;
