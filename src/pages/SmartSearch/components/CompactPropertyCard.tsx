/**
 * Compact Property Card Component
 * For displaying properties in cluster popups
 *
 * Features:
 * - Horizontal layout with small thumbnail
 * - Shows essential info: address, price, bed/bath/car
 * - Click to open PropertyDetailDialog
 * - Grace design system styling
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  DirectionsCar as ParkingIcon
} from '@mui/icons-material';
import { LazyPropertyImage } from '../../../components/property/LazyPropertyImage';

export interface CompactPropertyCardProps {
  property: {
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
  };
  onClick: () => void;
}

export const CompactPropertyCard: React.FC<CompactPropertyCardProps> = ({
  property,
  onClick
}) => {
  // Get first available image or use placeholder
  const imageUrl = property.primary_image || property.images?.[0] || '/placeholder-property.jpg';

  // Format price with Australian currency
  const formattedPrice = property.price ? new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(property.price) : 'Contact Agent';

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        padding: '8px',
        borderRadius: '6px',
        bgcolor: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: '#f5f5f5',
          transform: 'translateX(2px)'
        }
      }}
    >
      {/* Thumbnail (50x50px) */}
      <Box sx={{
        width: '50px',
        height: '50px',
        flexShrink: 0,
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)'
      }}>
        <LazyPropertyImage
          src={imageUrl}
          alt={property.address}
          width="50px"
          height="50px"
          borderRadius="4px"
          objectFit="cover"
        />
      </Box>

      {/* Property Info */}
      <Box sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '2px'
      }}>
        {/* Address - truncated */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: 1.3,
            color: '#0b2d2c',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {property.address}
        </Typography>

        {/* Price and Features Row */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          {/* Price */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: '11px',
              color: '#0b2d2c'
            }}
          >
            {formattedPrice}
          </Typography>

          {/* Features (Bed/Bath/Car) */}
          <Box sx={{
            display: 'flex',
            gap: 1,
            color: '#666666'
          }}>
            {property.bedrooms != null && property.bedrooms > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <BedIcon sx={{ fontSize: '0.75rem', color: '#888' }} />
                <Typography variant="caption" sx={{ fontSize: '10px', color: '#888' }}>
                  {property.bedrooms}
                </Typography>
              </Box>
            )}
            {property.bathrooms != null && property.bathrooms > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <BathtubIcon sx={{ fontSize: '0.75rem', color: '#888' }} />
                <Typography variant="caption" sx={{ fontSize: '10px', color: '#888' }}>
                  {property.bathrooms}
                </Typography>
              </Box>
            )}
            {property.car_spaces != null && property.car_spaces > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <ParkingIcon sx={{ fontSize: '0.75rem', color: '#888' }} />
                <Typography variant="caption" sx={{ fontSize: '10px', color: '#888' }}>
                  {property.car_spaces}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CompactPropertyCard;
