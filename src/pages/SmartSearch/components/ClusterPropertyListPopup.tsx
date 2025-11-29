/**
 * Cluster Property List Popup Component
 * Shows a scrollable list of properties when multiple properties
 * share the exact same coordinates (e.g., apartments in a building)
 *
 * Features:
 * - Header showing property count
 * - Scrollable list of compact property cards
 * - Click card to open PropertyDetailDialog
 * - Grace design system styling
 */

import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { CompactPropertyCard } from './CompactPropertyCard';

export interface ClusterProperty {
  id: string;
  address: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  car_spaces?: number;
  images?: string[];
  primary_image?: string;
}

export interface ClusterPropertyListPopupProps {
  properties: ClusterProperty[];
  onSelectProperty: (property: ClusterProperty) => void;
}

export const ClusterPropertyListPopup: React.FC<ClusterPropertyListPopupProps> = ({
  properties,
  onSelectProperty
}) => {
  return (
    <Box sx={{
      width: '300px',
      maxHeight: '320px',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        bgcolor: '#0b2d2c',
        color: '#ffffff'
      }}>
        <LocationOnIcon sx={{ fontSize: '1rem' }} />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: '13px'
          }}
        >
          {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} at this location
        </Typography>
      </Box>

      {/* Scrollable Property List */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '280px',
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: '#f5f5f5',
          borderRadius: '3px'
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: '#ccc',
          borderRadius: '3px',
          '&:hover': {
            bgcolor: '#999'
          }
        }
      }}>
        {properties.map((property, index) => (
          <React.Fragment key={property.id}>
            <CompactPropertyCard
              property={property}
              onClick={() => onSelectProperty(property)}
            />
            {index < properties.length - 1 && (
              <Divider sx={{ mx: 1, borderColor: '#eee' }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Footer hint */}
      <Box sx={{
        px: 1.5,
        py: 0.75,
        bgcolor: '#f9f9f9',
        borderTop: '1px solid #eee'
      }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: '10px',
            color: '#888',
            fontStyle: 'italic'
          }}
        >
          Click a property to view details
        </Typography>
      </Box>
    </Box>
  );
};

export default ClusterPropertyListPopup;
