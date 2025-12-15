import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import GridOnIcon from '@mui/icons-material/GridOn'; // Phase 2.38: Suburb boundaries icon
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Phase 2.55: Heritage icon
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'; // Phase 2.55: Bushfire icon
import { MIN_ZOOM_FOR_SUBURB_BOUNDARIES } from './SuburbBoundaryLayer';
import { MIN_ZOOM_FOR_HERITAGE } from './HeritageLayer';
import { MIN_ZOOM_FOR_BUSHFIRE } from './BushfireLayer';

interface BottomRightControlsProps {
  // Zoom controls
  onZoomIn: () => void;
  onZoomOut: () => void;

  // Draw mode controls
  drawMode: boolean;
  onToggleDrawMode: () => void;
  hasDrawings: boolean;
  onClearDrawings: () => void;

  // Phase 2.38: Suburb boundaries controls
  showSuburbBoundaries: boolean;
  onToggleSuburbBoundaries: () => void;
  currentZoomLevel: number; // Current map zoom level for enabling/disabling suburb boundaries

  // Phase 2.55: Heritage & Bushfire overlay controls
  showHeritageSites: boolean;
  onToggleHeritageSites: () => void;
  showBushfireZones: boolean;
  onToggleBushfireZones: () => void;
}

const BottomRightControls: React.FC<BottomRightControlsProps> = ({
  onZoomIn,
  onZoomOut,
  drawMode,
  onToggleDrawMode,
  hasDrawings,
  onClearDrawings,
  showSuburbBoundaries,
  onToggleSuburbBoundaries,
  currentZoomLevel,
  // Phase 2.55: Heritage & Bushfire controls
  showHeritageSites,
  onToggleHeritageSites,
  showBushfireZones,
  onToggleBushfireZones
}) => {
  // Phase 2.38: Check if zoom level is sufficient for suburb boundaries
  const isSuburbBoundariesEnabled = currentZoomLevel >= MIN_ZOOM_FOR_SUBURB_BOUNDARIES;
  // Phase 2.55: Check if zoom level is sufficient for heritage and bushfire overlays
  const isHeritageEnabled = currentZoomLevel >= MIN_ZOOM_FOR_HERITAGE;
  const isBushfireEnabled = currentZoomLevel >= MIN_ZOOM_FOR_BUSHFIRE;
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

      {/* Phase 2.38: Suburb Boundaries Toggle Button */}
      <Tooltip
        title={
          !isSuburbBoundariesEnabled
            ? `Zoom in to level ${MIN_ZOOM_FOR_SUBURB_BOUNDARIES} to show suburb boundaries`
            : showSuburbBoundaries
              ? "Hide Suburb Boundaries"
              : "Show Suburb Boundaries"
        }
        placement="right"
      >
        <span> {/* Wrapper span needed for Tooltip on disabled button */}
          <IconButton
            onClick={onToggleSuburbBoundaries}
            disabled={!isSuburbBoundariesEnabled}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: !isSuburbBoundariesEnabled
                ? 'grey.300'
                : showSuburbBoundaries
                  ? '#666666'
                  : 'white',
              color: !isSuburbBoundariesEnabled
                ? 'grey.500'
                : showSuburbBoundaries
                  ? 'white'
                  : 'text.primary',
              boxShadow: !isSuburbBoundariesEnabled ? 1 : 2,
              '&:hover': {
                backgroundColor: !isSuburbBoundariesEnabled
                  ? 'grey.300'
                  : showSuburbBoundaries
                    ? '#555555'
                    : 'grey.100',
                boxShadow: !isSuburbBoundariesEnabled ? 1 : 3
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
              // Mobile responsive
              '@media (max-width: 768px)': {
                width: 36,
                height: 36,
              }
            }}
          >
            <GridOnIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {/* Phase 2.55: Heritage Sites Toggle Button */}
      <Tooltip
        title={
          !isHeritageEnabled
            ? `Zoom in to level ${MIN_ZOOM_FOR_HERITAGE} to show heritage sites`
            : showHeritageSites
              ? "Hide Heritage Sites"
              : "Show Heritage Sites"
        }
        placement="right"
      >
        <span> {/* Wrapper span needed for Tooltip on disabled button */}
          <IconButton
            onClick={onToggleHeritageSites}
            disabled={!isHeritageEnabled}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: !isHeritageEnabled
                ? 'grey.300'
                : showHeritageSites
                  ? '#3B82F6' // Blue for heritage
                  : 'white',
              color: !isHeritageEnabled
                ? 'grey.500'
                : showHeritageSites
                  ? 'white'
                  : 'text.primary',
              boxShadow: !isHeritageEnabled ? 1 : 2,
              '&:hover': {
                backgroundColor: !isHeritageEnabled
                  ? 'grey.300'
                  : showHeritageSites
                    ? '#2563EB' // Darker blue on hover
                    : 'grey.100',
                boxShadow: !isHeritageEnabled ? 1 : 3
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
              // Mobile responsive
              '@media (max-width: 768px)': {
                width: 36,
                height: 36,
              }
            }}
          >
            <AccountBalanceIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {/* Phase 2.55: Bushfire Zones Toggle Button */}
      <Tooltip
        title={
          !isBushfireEnabled
            ? `Zoom in to level ${MIN_ZOOM_FOR_BUSHFIRE} to show bushfire zones`
            : showBushfireZones
              ? "Hide Bushfire Zones"
              : "Show Bushfire Zones"
        }
        placement="right"
      >
        <span> {/* Wrapper span needed for Tooltip on disabled button */}
          <IconButton
            onClick={onToggleBushfireZones}
            disabled={!isBushfireEnabled}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: !isBushfireEnabled
                ? 'grey.300'
                : showBushfireZones
                  ? '#DC2626' // Red for bushfire
                  : 'white',
              color: !isBushfireEnabled
                ? 'grey.500'
                : showBushfireZones
                  ? 'white'
                  : 'text.primary',
              boxShadow: !isBushfireEnabled ? 1 : 2,
              '&:hover': {
                backgroundColor: !isBushfireEnabled
                  ? 'grey.300'
                  : showBushfireZones
                    ? '#B91C1C' // Darker red on hover
                    : 'grey.100',
                boxShadow: !isBushfireEnabled ? 1 : 3
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
              // Mobile responsive
              '@media (max-width: 768px)': {
                width: 36,
                height: 36,
              }
            }}
          >
            <LocalFireDepartmentIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default BottomRightControls;
