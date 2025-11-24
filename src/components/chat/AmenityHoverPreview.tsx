import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  Stack,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  Close,
  LocalHospital,
  LocalLibrary,
  ShoppingCart,
  School,
  Restaurant,
  LocalGasStation,
  LocalParking,
  FitnessCenter,
  LocalPharmacy,
  AccountBalance,
  LocalAtm,
  Business,
  Place,
  Navigation,
  Phone,
  AccessTime,
  AutoAwesome
} from '@mui/icons-material';

interface AmenityItem {
  id?: string;
  name: string;
  address?: string;
  category?: string;
  subtype?: string;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  [key: string]: any;
}

interface AmenityHoverPreviewProps {
  amenity: AmenityItem;
  isVisible: boolean;
  anchorPosition: { top: number; left: number };
  onClose: () => void;
  onActionClick?: (action: string, amenity: AmenityItem) => void;
  referenceLocation?: string;
}

const AmenityHoverPreview: React.FC<AmenityHoverPreviewProps> = ({
  amenity,
  isVisible,
  anchorPosition,
  onClose,
  onActionClick,
  referenceLocation
}) => {
  if (!isVisible) return null;

  const getCategoryIcon = (category?: string) => {
    const iconProps = { fontSize: 24 };
    switch (category?.toLowerCase()) {
      case 'hospitals':
      case 'hospital':
        return <LocalHospital sx={{ ...iconProps, color: 'error.main' }} />;
      case 'libraries':
      case 'library':
        return <LocalLibrary sx={{ ...iconProps, color: 'primary.main' }} />;
      case 'shopping':
      case 'shopping_centres':
      case 'shopping_centers':
      case 'mall':
      case 'malls':
        return <ShoppingCart sx={{ ...iconProps, color: 'success.main' }} />;
      case 'universities_tafe':
      case 'university':
      case 'universities':
      case 'tafe':
      case 'school':
      case 'schools':
      case 'education':
        return <School sx={{ ...iconProps, color: 'info.main' }} />;
      case 'restaurants':
      case 'restaurant':
      case 'food':
      case 'dining':
        return <Restaurant sx={{ ...iconProps, color: 'warning.main' }} />;
      case 'gas_stations':
      case 'gas_station':
      case 'fuel':
      case 'petrol':
        return <LocalGasStation sx={{ ...iconProps, color: 'grey.600' }} />;
      case 'parking':
        return <LocalParking sx={{ ...iconProps, color: 'grey.600' }} />;
      case 'fitness':
      case 'gym':
      case 'gyms':
        return <FitnessCenter sx={{ ...iconProps, color: 'secondary.main' }} />;
      case 'pharmacy':
      case 'pharmacies':
        return <LocalPharmacy sx={{ ...iconProps, color: 'error.light' }} />;
      case 'bank':
      case 'banks':
        return <AccountBalance sx={{ ...iconProps, color: 'primary.dark' }} />;
      case 'atm':
      case 'atms':
        return <LocalAtm sx={{ ...iconProps, color: 'primary.dark' }} />;
      default:
        return <Place sx={{ ...iconProps, color: 'text.secondary' }} />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'hospitals':
      case 'hospital':
        return 'error';
      case 'libraries':
      case 'library':
        return 'primary';
      case 'shopping':
      case 'shopping_centres':
      case 'shopping_centers':
      case 'mall':
      case 'malls':
        return 'success';
      case 'universities_tafe':
      case 'university':
      case 'universities':
      case 'tafe':
      case 'school':
      case 'schools':
      case 'education':
        return 'info';
      case 'restaurants':
      case 'restaurant':
      case 'food':
      case 'dining':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m away`;
    }
    return `${distanceKm.toFixed(1)}km away`;
  };

  const getEstimatedWalkTime = (distanceKm?: number): string => {
    if (!distanceKm) return '';
    const walkingSpeedKmh = 4.8; // Average walking speed
    const timeHours = distanceKm / walkingSpeedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    if (timeMinutes < 1) return '< 1 min walk';
    return `~${timeMinutes} min walk`;
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: anchorPosition.top,
        left: anchorPosition.left,
        width: 360,
        maxHeight: 400,
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
        transform: `translate(${Math.min(anchorPosition.left + 360 > window.innerWidth ? -360 : 0, 0)}px, ${
          anchorPosition.top + 400 > window.innerHeight ? -400 : 0
        }px)`,
      }}
    >
      {/* Header */}
      <Box sx={{ 
        bgcolor: `${getCategoryColor(amenity.category)}.50`,
        p: 2,
        position: 'relative',
        borderBottom: '1px solid',
        borderColor: 'grey.100'
      }}>
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

        {/* Category icon and name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, pr: 5 }}>
          {getCategoryIcon(amenity.category)}
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {amenity.name}
          </Typography>
        </Box>

        {/* Category and subtype chips */}
        <Stack direction="row" spacing={1}>
          {amenity.category && (
            <Chip 
              label={amenity.category.replace('_', ' & ')}
              size="small"
              color={getCategoryColor(amenity.category) as any}
              variant="outlined"
              sx={{ bgcolor: 'white', fontWeight: 500 }}
            />
          )}
          {amenity.subtype && (
            <Chip 
              label={amenity.subtype}
              size="small"
              variant="filled"
              sx={{ 
                bgcolor: 'white', 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Address */}
        {amenity.address && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
            <LocationOn sx={{ fontSize: 16, color: 'primary.main', mt: 0.2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
              {amenity.address}
            </Typography>
          </Box>
        )}

        {/* Distance and time info */}
        {amenity.distance_km !== undefined && (
          <Box sx={{ 
            bgcolor: 'primary.50', 
            borderRadius: 1, 
            p: 1.5, 
            mb: 2,
            border: '1px solid',
            borderColor: 'primary.100'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Navigation sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {formatDistance(amenity.distance_km)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {getEstimatedWalkTime(amenity.distance_km)}
              </Typography>
              {referenceLocation && (
                <Typography variant="caption" sx={{ color: 'text.disabled', ml: 1 }}>
                  from {referenceLocation}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Coordinates */}
        {amenity.latitude && amenity.longitude && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              📍 {amenity.latitude.toFixed(4)}, {amenity.longitude.toFixed(4)}
            </Typography>
          </Box>
        )}

        {/* Description */}
        {amenity.description && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {amenity.description}
            </Typography>
          </>
        )}

        {/* Action buttons */}
        <Divider sx={{ my: 1.5 }} />
        
        {/* Prominent Ask follow up button */}
        <Box sx={{ mb: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
            onClick={() => onActionClick?.('followup', amenity)}
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
            Ask follow up
          </Button>
        </Box>
        
        <Stack direction="row" spacing={1} justifyContent="center">
          
          <IconButton
            size="small"
            onClick={() => onActionClick?.('directions', amenity)}
            sx={{
              bgcolor: 'info.50',
              '&:hover': { bgcolor: 'info.100' },
            }}
          >
            <Navigation fontSize="small" sx={{ color: 'info.main' }} />
          </IconButton>
          
          {amenity.category?.includes('hospital') && (
            <IconButton
              size="small"
              onClick={() => onActionClick?.('contact', amenity)}
              sx={{
                bgcolor: 'error.50',
                '&:hover': { bgcolor: 'error.100' },
              }}
            >
              <Phone fontSize="small" sx={{ color: 'error.main' }} />
            </IconButton>
          )}
          
          <IconButton
            size="small"
            onClick={() => onActionClick?.('info', amenity)}
            sx={{
              bgcolor: 'success.50',
              '&:hover': { bgcolor: 'success.100' },
            }}
          >
            <Business fontSize="small" sx={{ color: 'success.main' }} />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};

export default AmenityHoverPreview;
