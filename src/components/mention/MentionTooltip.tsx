import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Divider,
  Avatar,
  Card,
  CardMedia,
  CardContent,
  Stack,
  Badge,
  LinearProgress
} from '@mui/material';
import { 
  Home as HomeIcon, 
  LocationOn as LocationIcon, 
  AttachMoney as MoneyIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as SquareFootIcon,
  LocalParking as ParkingIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  DirectionsWalk as WalkIcon,
  DirectionsTransit as TransitIcon,
  FiberNew as NewIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import type { MentionEntity } from '../../types/mention';

interface MentionTooltipProps {
  entity: MentionEntity;
  position: { x: number; y: number };
  visible: boolean;
}

const MentionTooltip: React.FC<MentionTooltipProps> = ({ entity, position, visible }) => {
  if (!visible || entity.type !== 'property') {
    return null;
  }

  const metadata = entity.entity_metadata || {};

  // Calculate content complexity to determine size
  const hasRichContent = Boolean(
    metadata.walkability_score || 
    metadata.transit_score || 
    (metadata.features && metadata.features.length > 0) ||
    (metadata.custom_features && metadata.custom_features.length > 0) ||
    metadata.parking_spaces
  );

  const tooltipWidth = hasRichContent ? 380 : 320; // Smaller width for simpler content

  // Calculate smart positioning to prevent off-screen issues
  const getSmartPosition = () => {
    const tooltipHeight = hasRichContent ? 500 : 300; // Estimated max height based on content
    const padding = 16;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = position.x;
    let top = position.y - 15;

    // Horizontal positioning
    if (left + tooltipWidth + padding > viewportWidth) {
      // Position to the left of cursor if too far right
      left = position.x - tooltipWidth - 10;
    }
    if (left < padding) {
      // Keep minimum distance from left edge
      left = padding;
    }

    // Vertical positioning
    if (top + tooltipHeight + padding > viewportHeight) {
      // Position above cursor if too far down
      top = position.y - tooltipHeight - 15;
    }
    if (top < padding) {
      // Keep minimum distance from top edge
      top = padding;
    }

    return { left, top };
  };

  const smartPosition = getSmartPosition();
  
  const formatPrice = (price: number | string | undefined): string => {
    if (!price) return '';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '';
    
    if (numPrice >= 1000000) {
      return `$${(numPrice / 1000000).toFixed(1)}M`;
    } else if (numPrice >= 1000) {
      return `$${(numPrice / 1000).toFixed(0)}K`;
    }
    return `$${numPrice.toLocaleString()}`;
  };

  const formatArea = (area: number | string | undefined): string => {
    if (!area) return '';
    const numArea = typeof area === 'string' ? parseFloat(area) : area;
    if (isNaN(numArea)) return '';
    return `${numArea}m²`;
  };

  const getStatusColor = (status: string | undefined): string => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning'; 
      case 'sold': return 'info';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string | undefined): JSX.Element | undefined => {
    switch (status?.toLowerCase()) {
      case 'active': return <VerifiedIcon sx={{ fontSize: 14 }} />;
      case 'pending': return <ScheduleIcon sx={{ fontSize: 14 }} />;
      case 'sold': return <TrendingUpIcon sx={{ fontSize: 14 }} />;
      case 'draft': return <NewIcon sx={{ fontSize: 14 }} />;
      default: return undefined;
    }
  };

  const propertyImage = metadata.image_url || metadata.main_image || '/placeholder-property.jpg';
  const hasImage = Boolean(metadata.image_url || metadata.main_image);

  return (
    <Card
      elevation={16}
      sx={{
        position: 'fixed',
        left: smartPosition.left,
        top: smartPosition.top,
        zIndex: 1400,
        width: tooltipWidth,
        maxWidth: 'calc(100vw - 32px)', // Ensure it never exceeds viewport width
        maxHeight: 'calc(100vh - 32px)', // Ensure it never exceeds viewport height
        borderRadius: 3,
        overflow: 'auto', // Allow scrolling if content is too tall
        bgcolor: 'background.paper',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
        transform: 'scale(1)',
        opacity: 1,
        '&:hover': {
          transform: 'scale(1.02)',
        },
        // Mobile responsive
        '@media (max-width: 600px)': {
          width: 'calc(100vw - 32px)',
          maxWidth: 'none',
        }
      }}
    >
      {/* Property Image */}
      <CardMedia
        component="div"
        sx={{
          height: 140,
          position: 'relative',
          background: hasImage 
            ? `url(${propertyImage}) center/cover no-repeat`
            : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Status Badge */}
        {metadata.status && (
          <Chip
            {...(getStatusIcon(metadata.status) && { icon: getStatusIcon(metadata.status) })}
            label={metadata.status.charAt(0).toUpperCase() + metadata.status.slice(1)}
            size="small"
            color={getStatusColor(metadata.status) as any}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        )}

        {/* Placeholder icon if no image */}
        {!hasImage && (
          <HomeIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
        )}
      </CardMedia>

      <CardContent sx={{ p: 2.5 }}>
        {/* Header with title and type */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              lineHeight: 1.2, 
              color: 'text.primary',
              mb: 0.5,
              fontSize: '1.1rem'
            }}
          >
            {entity.name}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {metadata.property_type && (
              <Chip 
                label={metadata.property_type} 
                size="small" 
                variant="filled"
                color="primary"
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 22,
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1 }
                }} 
              />
            )}
            {metadata.year_built && (
              <Chip 
                icon={<CalendarIcon sx={{ fontSize: 12 }} />}
                label={metadata.year_built} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 22,
                  '& .MuiChip-label': { px: 0.75 }
                }} 
              />
            )}
          </Box>
        </Box>

        {/* Location with enhanced styling */}
        {(metadata.suburb || metadata.state || metadata.address) && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocationIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.25 }} />
              <Box sx={{ flex: 1 }}>
                {metadata.address && (
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25, color: 'text.primary' }}>
                    {metadata.address}
                  </Typography>
                )}
                {(metadata.suburb || metadata.state) && (
                  <Typography variant="body2" color="text.secondary">
                    {metadata.suburb}{metadata.suburb && metadata.state ? ', ' : ''}{metadata.state}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Enhanced Price Display */}
        {metadata.price && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'success.main',
                  fontSize: '1.3rem',
                  letterSpacing: '-0.02em'
                }}
              >
                {formatPrice(metadata.price)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Enhanced Property Details Grid */}
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {/* Bedrooms */}
            {metadata.bedrooms !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 'fit-content' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.50' }}>
                  <BedIcon sx={{ color: 'primary.main', fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', lineHeight: 1 }}>
                    Beds
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {metadata.bedrooms}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Bathrooms */}
            {metadata.bathrooms !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 'fit-content' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'info.50' }}>
                  <BathIcon sx={{ color: 'info.main', fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', lineHeight: 1 }}>
                    Baths
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {metadata.bathrooms}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Area */}
            {(metadata.area_size || metadata.building_size || metadata.land_size) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 'fit-content' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'warning.50' }}>
                  <SquareFootIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', lineHeight: 1 }}>
                    Area
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {formatArea(metadata.area_size || metadata.building_size || metadata.land_size)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Parking */}
            {metadata.parking_spaces !== undefined && metadata.parking_spaces > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 'fit-content' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.50' }}>
                  <ParkingIcon sx={{ color: 'secondary.main', fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', lineHeight: 1 }}>
                    Parking
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {metadata.parking_spaces}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Walkability & Transit Scores */}
          {(metadata.walkability_score || metadata.transit_score) && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                Location Scores
              </Typography>
              <Stack spacing={1}>
                {metadata.walkability_score && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WalkIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      Walk Score
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={metadata.walkability_score} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: metadata.walkability_score >= 70 ? 'success.main' : 
                                   metadata.walkability_score >= 50 ? 'warning.main' : 'error.main',
                            borderRadius: 3
                          }
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right', fontWeight: 600 }}>
                      {metadata.walkability_score}
                    </Typography>
                  </Box>
                )}
                {metadata.transit_score && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TransitIcon sx={{ fontSize: 16, color: 'info.main' }} />
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      Transit Score
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={metadata.transit_score} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: metadata.transit_score >= 70 ? 'info.main' : 
                                   metadata.transit_score >= 50 ? 'warning.main' : 'error.main',
                            borderRadius: 3
                          }
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right', fontWeight: 600 }}>
                      {metadata.transit_score}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Features */}
          {(metadata.features?.length > 0 || metadata.custom_features?.length > 0) && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                Key Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {(metadata.features || []).slice(0, 3).map((feature: string, index: number) => (
                  <Chip 
                    key={index}
                    label={feature} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.65rem', 
                      height: 20,
                      bgcolor: 'grey.50',
                      '& .MuiChip-label': { px: 0.75 }
                    }} 
                  />
                ))}
                {(metadata.custom_features || []).slice(0, 2).map((feature: string, index: number) => (
                  <Chip 
                    key={`custom-${index}`}
                    label={feature} 
                    size="small" 
                    variant="outlined"
                    color="secondary"
                    sx={{ 
                      fontSize: '0.65rem', 
                      height: 20,
                      '& .MuiChip-label': { px: 0.75 }
                    }} 
                  />
                ))}
              </Box>
            </Box>
          )}
        </Stack>

        {/* Description */}
        {metadata.description && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.8rem',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {metadata.description}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Smart arrow pointing to the cursor */}
      <Box
        sx={{
          position: 'absolute',
          // Calculate arrow position based on cursor relative to tooltip
          ...((() => {
            const relativeX = position.x - smartPosition.left;
            const relativeY = position.y - smartPosition.top;
            
            // Clamp arrow position to be within tooltip bounds
            const arrowX = Math.max(20, Math.min(relativeX, tooltipWidth - 20));
            
            if (relativeY < 20) {
              // Tooltip is below cursor - arrow on top
              return {
                top: -8,
                left: arrowX,
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid',
                borderBottomColor: 'background.paper',
              };
            } else {
              // Tooltip is above cursor - arrow on bottom (default)
              return {
                bottom: -8,
                left: arrowX,
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid',
                borderTopColor: 'background.paper',
              };
            }
          })())
        }}
      />
    </Card>
  );
};

export default MentionTooltip;
