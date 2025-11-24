import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Bed as BedIcon,
  Bathtub as BathIcon,
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import type { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
  onToggleFavorite?: (property: Property) => void;
  isFavorite?: boolean;
}

/**
 * Property Card Component
 * Phase 1.4: Basic property card display for testing
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onToggleFavorite,
  isFavorite = false
}) => {
  // Get primary image or fallback
  const primaryImage = property.images && property.images.length > 0
    ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0].url)
    : '/placeholder-property.jpg';

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(property);
    }
  };

  // Format price display
  const priceDisplay = property.price_display || 'Price on Application';

  // Property features info
  const features = [];
  if (property.bedrooms) features.push(`${property.bedrooms} bed`);
  if (property.bathrooms) features.push(`${property.bathrooms} bath`);
  if (property.parking_spaces) features.push(`${property.parking_spaces} car`);

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3
      },
      cursor: 'pointer'
    }} onClick={handleViewDetails}>
      {/* Property Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={primaryImage}
          alt={property.title}
          sx={{
            objectFit: 'cover'
          }}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = '/placeholder-property.jpg';
          }}
        />

        {/* Favorite Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)'
            }
          }}
          size="small"
          onClick={handleToggleFavorite}
        >
          {isFavorite ? (
            <FavoriteIcon color="error" fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>

        {/* Property Type Badge */}
        <Chip
          label={property.property_type}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            fontSize: '0.75rem'
          }}
        />
      </Box>

      {/* Card Content */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Price */}
        <Typography variant="h6" component="h3" sx={{
          fontWeight: 'bold',
          color: 'primary.main',
          mb: 1
        }}>
          {priceDisplay}
        </Typography>

        {/* Property Title */}
        <Typography variant="subtitle1" sx={{
          fontWeight: 500,
          mb: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {property.title}
        </Typography>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {property.suburb}, {property.state} {property.postcode}
          </Typography>
        </Box>

        {/* Property Features */}
        {features.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {property.bedrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BedIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{property.bedrooms}</Typography>
              </Box>
            )}
            {property.bathrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BathIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{property.bathrooms}</Typography>
              </Box>
            )}
            {property.parking_spaces && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{property.parking_spaces}</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Status Badge */}
        {property.status && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={property.status.toUpperCase()}
              size="small"
              color={property.status === 'active' ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<ViewIcon />}
            onClick={handleViewDetails}
            fullWidth
            sx={{
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 3
              }
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;