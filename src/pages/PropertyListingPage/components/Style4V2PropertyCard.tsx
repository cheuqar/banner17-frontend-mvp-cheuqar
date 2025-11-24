import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import {
  Bed as BedIcon,
  Bathtub as BathIcon,
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import style4V2Theme, { style4V2Styles } from '../theme/style4V2Theme';
import type { Property } from '../types';

interface Style4V2PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
  onToggleFavorite?: (property: Property) => void;
  isFavorite?: boolean;
}

/**
 * Style4-V2 Property Card Component
 * Elegant property cards following Banner17's Style4-V2 design system
 */
const Style4V2PropertyCard: React.FC<Style4V2PropertyCardProps> = ({
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
  if (property.bedrooms) features.push({ icon: BedIcon, value: property.bedrooms, label: 'bed' });
  if (property.bathrooms) features.push({ icon: BathIcon, value: property.bathrooms, label: 'bath' });
  if (property.parking_spaces) features.push({ icon: CarIcon, value: property.parking_spaces, label: 'car' });

  return (
    <ThemeProvider theme={style4V2Theme}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: style4V2Styles.colors.backgroundWhite,
          border: `1px solid ${style4V2Styles.colors.dividerColor}`,
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderColor: style4V2Styles.colors.primaryBlack,
            '& .property-image': {
              transform: 'scale(1.05)',
            },
            '& .view-details-btn': {
              backgroundColor: style4V2Styles.colors.primaryBlack,
              color: style4V2Styles.colors.primaryWhite,
            }
          }
        }}
        onClick={handleViewDetails}
      >
        {/* Property Image */}
        <Box sx={{ position: 'relative', overflow: 'hidden', height: 240 }}>
          <CardMedia
            component="img"
            className="property-image"
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
            image={primaryImage}
            alt={property.title}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = '/placeholder-property.jpg';
            }}
          />

          {/* Favorite Button */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: style4V2Styles.colors.whiteTransparent95,
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: style4V2Styles.colors.primaryWhite,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? (
              <FavoriteIcon sx={{ color: '#e53e3e', fontSize: 20 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: style4V2Styles.colors.secondaryGray, fontSize: 20 }} />
            )}
          </IconButton>

          {/* Property Type Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
            }}
          >
            <Chip
              label={property.property_type}
              size="small"
              sx={{
                backgroundColor: style4V2Styles.colors.darkOverlay,
                color: style4V2Styles.colors.primaryWhite,
                fontSize: '0.75rem',
                fontWeight: 500,
                border: 'none',
                '& .MuiChip-label': {
                  px: 1.5,
                }
              }}
            />
          </Box>
        </Box>

        {/* Card Content */}
        <CardContent sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          '&:last-child': { pb: 3 }
        }}>
          {/* Price */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              color: style4V2Styles.colors.primaryBlack,
              mb: 1.5,
              fontSize: '1.25rem',
              lineHeight: 1.3,
            }}
          >
            {priceDisplay}
          </Typography>

          {/* Property Title */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: style4V2Styles.colors.primaryBlack,
              mb: 1.5,
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.8rem', // Ensure consistent height
            }}
          >
            {property.title}
          </Typography>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon
              sx={{
                fontSize: 18,
                color: style4V2Styles.colors.secondaryGray,
                mr: 0.75
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: style4V2Styles.colors.secondaryGray,
                lineHeight: 1.4,
              }}
            >
              {property.suburb}, {property.state} {property.postcode}
            </Typography>
          </Box>

          {/* Property Features */}
          {features.length > 0 && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              mb: 3,
              flexWrap: 'wrap'
            }}>
              {features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <feature.icon
                    sx={{
                      fontSize: 18,
                      color: style4V2Styles.colors.secondaryGray,
                      mr: 0.5
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: style4V2Styles.colors.primaryBlack,
                      fontWeight: 500,
                    }}
                  >
                    {feature.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Status Badge */}
          {property.status && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={property.status.toUpperCase()}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: property.status === 'active'
                    ? '#22c55e'
                    : style4V2Styles.colors.dividerColor,
                  color: property.status === 'active'
                    ? '#16a34a'
                    : style4V2Styles.colors.secondaryGray,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              />
            </Box>
          )}

          {/* Action Button */}
          <Box sx={{ mt: 'auto' }}>
            <Button
              className="view-details-btn"
              variant="outlined"
              size="medium"
              startIcon={<ViewIcon />}
              onClick={handleViewDetails}
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '0.875rem',
                border: `2px solid ${style4V2Styles.colors.dividerColor}`,
                color: style4V2Styles.colors.secondaryGray,
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: style4V2Styles.colors.primaryBlack,
                  backgroundColor: style4V2Styles.colors.primaryBlack,
                  color: style4V2Styles.colors.primaryWhite,
                  transform: 'translateY(-1px)',
                }
              }}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default Style4V2PropertyCard;