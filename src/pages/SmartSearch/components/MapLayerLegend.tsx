/**
 * Map Layer Legend Component
 * Phase 2.45 - Unified Map Layer Legend
 * ======================================
 *
 * Shows active map layers with teardrop icons matching marker styles.
 * Replaces SchoolLegend with a more robust, expandable system.
 *
 * Features:
 * - Shows only active layers (when toggle is ON)
 * - Mini teardrop icon with layer color
 * - Collapsible interface with smooth animation
 * - Style4-V2 design system compliance
 * - Expandable for future layers (heritage, flood risk, bushfire)
 * - Properties excluded (always visible)
 */

import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../../store';
import {
  selectShowSchoolsOnMap,
  selectShowAmenitiesOnMap,
  selectSelectedAmenityCategories,
} from '../../../store/slices/smartSearchSlice';
import {
  Card,
  Typography,
  Box,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { LAYER_COLORS, type MapLayerConfig } from '../../../types/mapLayers';
import './MapLayerLegend.css';

/**
 * Tiny teardrop SVG icon for legend items
 */
const TeardropIcon: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 10,
}) => (
  <svg
    width={size}
    height={size * 1.286}
    viewBox="0 0 28 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M14 0C6.268 0 0 6.268 0 14c0 7.732 14 22 14 22s14-14.268 14-22C28 6.268 21.732 0 14 0z"
      fill={color}
    />
  </svg>
);

/**
 * Compact legend item - inline with minimal padding
 */
const LegendItem: React.FC<{ layer: MapLayerConfig }> = ({ layer }) => (
  <Box
    className="legend-item"
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      py: 0.25,
      px: 0.75,
    }}
  >
    <TeardropIcon color={layer.color} size={10} />
    <Typography
      variant="caption"
      sx={{
        fontSize: '10px',
        color: '#555',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {layer.name}
    </Typography>
  </Box>
);

/**
 * Map Layer Legend Component
 */
const MapLayerLegend: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get active layer states from Redux
  const showSchoolsOnMap = useAppSelector(selectShowSchoolsOnMap);
  const showAmenitiesOnMap = useAppSelector(selectShowAmenitiesOnMap);
  const selectedAmenityCategories = useAppSelector(selectSelectedAmenityCategories);

  // Build list of active layers
  const activeLayers = useMemo(() => {
    const layers: MapLayerConfig[] = [];

    // Schools layer
    if (showSchoolsOnMap) {
      layers.push({
        id: 'schools',
        name: 'Schools',
        color: LAYER_COLORS.schools,
        category: 'poi',
      });
    }

    // Amenities layers (by category if filtered, or general if all)
    if (showAmenitiesOnMap) {
      if (selectedAmenityCategories && selectedAmenityCategories.length > 0) {
        // Show specific categories that are selected
        selectedAmenityCategories.forEach((category: string) => {
          const normalized = category.toLowerCase();
          let name = category;
          let color = LAYER_COLORS.amenities_mixed;

          // Map category to display name and color
          if (normalized.includes('hospital')) {
            name = 'Hospitals';
            color = LAYER_COLORS.hospitals;
          } else if (normalized.includes('librar')) {
            name = 'Libraries';
            color = LAYER_COLORS.libraries;
          } else if (normalized.includes('shopping')) {
            name = 'Shopping';
            color = LAYER_COLORS.shopping;
          } else if (normalized.includes('universit') || normalized.includes('tafe')) {
            name = 'Universities/TAFE';
            color = LAYER_COLORS.universities;
          } else if (normalized.includes('tourist') || normalized.includes('attraction')) {
            name = 'Tourist Attractions';
            color = LAYER_COLORS.tourist_attractions;
          } else if (normalized.includes('beach')) {
            name = 'Beaches';
            color = LAYER_COLORS.beaches;
          } else if (normalized.includes('sport')) {
            name = 'Sports/Recreation';
            color = LAYER_COLORS.sports;
          } else if (normalized.includes('child') || normalized.includes('care')) {
            name = 'Child Care';
            color = LAYER_COLORS.child_care;
          }

          layers.push({
            id: `amenities_${normalized}`,
            name,
            color,
            category: 'poi',
          });
        });
      } else {
        // No specific categories - show generic amenities
        layers.push({
          id: 'amenities',
          name: 'Amenities',
          color: LAYER_COLORS.amenities_mixed,
          category: 'poi',
        });
      }
    }

    // Future layers can be added here:
    // if (showHeritageOnMap) { layers.push({ id: 'heritage', ... }); }
    // if (showFloodRiskOnMap) { layers.push({ id: 'flood_risk', ... }); }

    return layers;
  }, [showSchoolsOnMap, showAmenitiesOnMap, selectedAmenityCategories]);

  // Don't show legend if no layers are active
  if (activeLayers.length === 0) {
    return null;
  }

  return (
    <Card
      className="map-layer-legend"
      sx={{
        position: 'absolute',
        top: 80, // Below zoom controls (~70px) with some spacing
        left: 10, // Top-left corner
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
        borderRadius: '4px',
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* Compact Header */}
      <Box
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          cursor: 'pointer',
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: '9px',
            color: '#777',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
          }}
        >
          Layers
        </Typography>
        {isCollapsed ? (
          <ExpandLessIcon sx={{ fontSize: 12, color: '#999' }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 12, color: '#999' }} />
        )}
      </Box>

      {/* Collapsible Content */}
      <Collapse in={!isCollapsed} timeout={150}>
        <Box sx={{ py: 0.25 }}>
          {activeLayers.map((layer) => (
            <LegendItem key={layer.id} layer={layer} />
          ))}
        </Box>
      </Collapse>
    </Card>
  );
};

export default MapLayerLegend;
