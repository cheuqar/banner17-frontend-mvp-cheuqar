import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  DirectionsCar as ParkingIcon
} from '@mui/icons-material';
import { LazyPropertyImage } from '../../../components/property/LazyPropertyImage';

interface PropertyMarkerPopupProps {
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
  onViewDetails?: () => void;
}

export const PropertyMarkerPopup: React.FC<PropertyMarkerPopupProps> = ({
  property,
  onViewDetails
}) => {
  // Get first available image or use placeholder
  const imageUrl = property.primary_image || property.images?.[0] || '/placeholder-property.jpg';

  // Format price with Australian currency
  const formattedPrice = property.price ? new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(property.price) : null;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      minWidth: '300px',
      maxWidth: '400px',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px', // Grace: 8px border radius (medium)
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Grace: light shadow
      border: '1px solid #e5e5e5', // Grace: divider color
      bgcolor: '#ffffff', // Grace: primary white
      fontFamily: '"Amplitude", "Segoe UI", Roboto, system-ui, sans-serif' // Grace: font family
    }}>
      {/* LEFT COLUMN: Photo (100x100px) with Grace styling */}
      <Box sx={{
        width: '100px',
        height: '100px',
        flexShrink: 0,
        borderRadius: '8px', // Grace: 8px border radius
        border: '1px solid rgba(0,0,0,0.08)', // Grace: subtle border
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)' // Grace: subtle photo shadow
      }}>
        <LazyPropertyImage
          src={imageUrl}
          alt={property.address}
          width="100px"
          height="100px"
          borderRadius="8px"
          objectFit="cover"
        />
      </Box>

      {/* RIGHT COLUMN: Info with Grace typography */}
      <Box sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px' // Grace: compact spacing
      }}>
        {/* Address - Grace heading style */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600, // Grace: semibold
            fontSize: '14px',
            lineHeight: 1.4, // Grace: readable line height
            color: '#0b2d2c', // Grace: primary black
            mb: 0.5
          }}
        >
          {property.address}
          {property.suburb && `, ${property.suburb}`}
        </Typography>

        {/* Price - Grace success color (kept black per Style4-V2) */}
        {formattedPrice && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700, // Grace: bold
              fontSize: '16px',
              color: '#0b2d2c', // Grace: primary black
              mb: 0.5
            }}
          >
            {formattedPrice}
          </Typography>
        )}

        {/* Features (Bed/Bath/Car) - Grace text.secondary */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          color: '#666666', // Grace: secondary gray
          mb: 1
        }}>
          {property.bedrooms != null && property.bedrooms > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BedIcon sx={{ fontSize: '1rem', color: '#666666' }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '12px', color: '#666666' }}>
                {property.bedrooms}
              </Typography>
            </Box>
          )}
          {property.bathrooms != null && property.bathrooms > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BathtubIcon sx={{ fontSize: '1rem', color: '#666666' }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '12px', color: '#666666' }}>
                {property.bathrooms}
              </Typography>
            </Box>
          )}
          {property.car_spaces != null && property.car_spaces > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ParkingIcon sx={{ fontSize: '1rem', color: '#666666' }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '12px', color: '#666666' }}>
                {property.car_spaces}
              </Typography>
            </Box>
          )}
        </Box>

        {/* View Details Button - Grace primary button style */}
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            // Open property detail page in new window
            window.open(`/property/detail/${property.id}`, '_blank', 'noopener,noreferrer');
          }}
          sx={{
            alignSelf: 'flex-start',
            bgcolor: '#0b2d2c', // Grace: primary black
            color: '#ffffff', // Grace: primary white
            textTransform: 'none', // Grace: no uppercase
            fontWeight: 600, // Grace: semibold
            fontSize: '13px',
            px: 2,
            py: 0.75,
            borderRadius: '8px', // Grace: 8px border radius
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#333333', // Grace: primary.light
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Grace: light shadow on hover
              transform: 'translateY(-1px)' // Grace: subtle lift on hover
            },
            transition: 'all 0.3s ease' // Grace: smooth transition
          }}
        >
          View Details
        </Button>
      </Box>
    </Box>
  );
};
