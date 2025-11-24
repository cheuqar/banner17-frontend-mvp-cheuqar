import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  Stack,
  Avatar,
  Divider,
  Tooltip,
  Button
} from '@mui/material';
import {
  Home,
  Bed,
  Bathtub,
  Square,
  LocationOn,
  AttachMoney,
  CalendarToday,
  Visibility,
  PhotoCamera,
  Close,
  DriveEta,
  Landscape,
  Launch,
  AutoAwesome,
  BookmarkBorder,
  ContactPhone,
  Map as MapIcon
} from '@mui/icons-material';

interface PropertyItem {
  id?: string;
  address?: string;
  full_address?: string;
  city?: string;
  state?: string;
  suburb?: string;
  postcode?: string;
  price?: string | number;
  bedrooms?: number;
  bathrooms?: number;
  car_slots?: number;
  parking_spaces?: number;
  garage_spaces?: number;
  propertyType?: string;
  property_type?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  sqft?: number;
  area_size?: number;
  house_size?: number;
  floor_area?: number;
  lot_size?: number;
  land_area?: number;
  cover_image?: string;
  images?: string[];
  property_images?: string[];
  status?: string;
  listing_status?: string;
  sale_type?: string;
  listing_url?: string;
  external_url?: string;
  [key: string]: any;
}

interface PropertyHoverPreviewProps {
  property: PropertyItem;
  isVisible: boolean;
  anchorPosition: { top: number; left: number };
  onClose: () => void;
  onCreatePropertyDrillSession?: (property: PropertyItem) => void;
  onActionClick?: (action: string, property: PropertyItem) => void;
}

const PropertyHoverPreview: React.FC<PropertyHoverPreviewProps> = ({
  property,
  isVisible,
  anchorPosition,
  onClose,
  onCreatePropertyDrillSession,
  onActionClick
}) => {
  if (!isVisible) return null;

  const formatPrice = (price: string | number | undefined): string => {
    if (!price) return 'Price on request';
    if (typeof price === 'string') return price;
    return `$${price.toLocaleString()}`;
  };

  const formatFullAddress = (property: PropertyItem): string => {
    // Use full_address field if available, otherwise fall back to address
    return property.full_address || property.address || 'Property Address';
  };

  const getPropertySize = (property: PropertyItem): string | null => {
    // Priority: floor_area -> area_size -> house_size -> sqft
    if (property.floor_area) return `${property.floor_area.toLocaleString()} sqm`;
    if (property.area_size) return `${property.area_size.toLocaleString()} sqm`;
    if (property.house_size) return `${property.house_size.toLocaleString()} sqm`;
    if (property.sqft) return `${property.sqft.toLocaleString()} sqft`;
    return null;
  };

  const getLandArea = (property: PropertyItem): string | null => {
    // Priority: land_area -> lot_size
    if (property.land_area) return `${property.land_area.toLocaleString()} sqm land`;
    if (property.lot_size) return `${property.lot_size.toLocaleString()} sqm land`;
    return null;
  };

  const getCarSlots = (property: PropertyItem): string | null => {
    // Priority: car_slots -> parking_spaces -> garage_spaces
    const carSlots = property.car_slots || property.parking_spaces || property.garage_spaces;
    if (carSlots && carSlots > 0) {
      return `${carSlots} car ${carSlots === 1 ? 'slot' : 'slots'}`;
    }
    return null;
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'for sale':
        return 'success';
      case 'pending':
        return 'warning';
      case 'sold':
        return 'error';
      default:
        return 'primary';
    }
  };

  const propertyType = property.propertyType || property.property_type;
  const propertySize = getPropertySize(property);
  const landArea = getLandArea(property);
  const carSlots = getCarSlots(property);
  const fullAddress = formatFullAddress(property);
  const status = property.status || property.listing_status || property.sale_type || 'For Sale';
  const mainImage = property.cover_image || property.property_images?.[0] || property.images?.[0];
  const externalUrl = property.listing_url || property.external_url;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: anchorPosition.top,
        left: anchorPosition.left,
        width: 380,
        maxHeight: 500,
        bgcolor: 'white',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '1px solid',
        borderColor: 'grey.200',
        zIndex: 9999,
        animation: 'slideInUp 0.2s ease-out',
        '@keyframes slideInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px) scale(0.95)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
          },
        },
        // Ensure preview stays on screen
        transform: `translate(${Math.min(anchorPosition.left + 380 > window.innerWidth ? -380 : 0, 0)}px, ${
          anchorPosition.top + 500 > window.innerHeight ? -500 : 0
        }px)`,
      }}
      onMouseLeave={onClose}
    >
      {/* Header with image and close button */}
      <Box sx={{ position: 'relative', height: 200, bgcolor: 'grey.100' }}>
        {mainImage ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${mainImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                height: 60,
              }}
            />
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'text.secondary'
          }}>
            <Stack alignItems="center" spacing={1}>
              <PhotoCamera sx={{ fontSize: 40 }} />
              <Typography variant="body2">No image available</Typography>
            </Stack>
          </Box>
        )}
        
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              bgcolor: 'white',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        {/* Status chip */}
        <Chip
          label={status}
          color={getStatusColor(status) as any}
          variant="filled"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            fontWeight: 600,
          }}
        />

        {/* Property type and price overlay */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 12, 
          left: 12, 
          right: 12,
          color: 'white'
        }}>
          {propertyType && (
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {propertyType}
            </Typography>
          )}
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
            {formatPrice(property.price)}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Address */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <LocationOn sx={{ fontSize: 18, color: 'primary.main', mt: 0.2 }} />
          <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
            {fullAddress}
          </Typography>
        </Box>

        {/* Key features */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {property.bedrooms !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Bed sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
            
            {property.bathrooms !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Bathtub sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}

            {carSlots && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DriveEta sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {carSlots}
                </Typography>
              </Box>
            )}
            
            {propertySize && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Square sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {propertySize}
                </Typography>
              </Box>
            )}

            {landArea && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Landscape sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {landArea}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Description */}
        {property.description && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {property.description}
            </Typography>
          </>
        )}

        {/* Action buttons */}
        <Divider sx={{ my: 1.5 }} />
        
        {/* Create Property Drill Session button */}
        <Box sx={{ mb: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
            onClick={() => onCreatePropertyDrillSession?.(property)}
            fullWidth
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              py: 0.75,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Analyze Property
          </Button>
        </Box>
        
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
          
          <Tooltip title="Show on map">
            <IconButton
              size="small"
              onClick={() => onActionClick?.('map', property)}
              sx={{
                bgcolor: 'info.50',
                '&:hover': { bgcolor: 'info.100' },
              }}
            >
              <MapIcon fontSize="small" sx={{ color: 'info.main' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Bookmark">
            <IconButton
              size="small"
              onClick={() => onActionClick?.('bookmark', property)}
              sx={{
                bgcolor: 'warning.50',
                '&:hover': { bgcolor: 'warning.100' },
              }}
            >
              <BookmarkBorder fontSize="small" sx={{ color: 'warning.main' }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Contact agent">
            <IconButton
              size="small"
              onClick={() => onActionClick?.('contact', property)}
              sx={{
                bgcolor: 'success.50',
                '&:hover': { bgcolor: 'success.100' },
              }}
            >
              <ContactPhone fontSize="small" sx={{ color: 'success.main' }} />
            </IconButton>
          </Tooltip>

          {externalUrl && (
            <Tooltip title="View full listing">
              <IconButton
                size="small"
                onClick={() => window.open(externalUrl, '_blank', 'noopener,noreferrer')}
                sx={{
                  bgcolor: 'secondary.50',
                  '&:hover': { bgcolor: 'secondary.100' },
                }}
              >
                <Launch fontSize="small" sx={{ color: 'secondary.main' }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default PropertyHoverPreview;
