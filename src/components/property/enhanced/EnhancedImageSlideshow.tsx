import React, { useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ImageNotSupported,
  PhotoLibrary,
  Architecture,
} from '@mui/icons-material';
import type {
  PropertyImage,
  ImageDisplayConfig,
  PreviewImage,
  EnhancedImageSlideshowProps,
} from '../../../types/property-enhanced';
import { LazyPropertyImage } from '../LazyPropertyImage';

/**
 * Enhanced Image Slideshow with preview thumbnails
 * Supports 1, 2, or 3+ images with appropriate layouts
 * Responsive design with full-width option for wide screens
 */
const EnhancedImageSlideshow: React.FC<EnhancedImageSlideshowProps> = ({
  images,
  floorplans = [],
  currentIndex,
  onImageChange,
  showPreviews = true,
  previewCount = 2,
  fullWidth = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isWideScreen = useMediaQuery(theme.breakpoints.up('xl'));

  // State for switching between photos and floorplans
  const [viewMode, setViewMode] = useState<'photos' | 'floorplans'>('photos');

  // Process images to ensure consistent format
  const processedImages = useMemo<PropertyImage[]>(() => {
    if (!images || images.length === 0) return [];

    return images.map((img, index) => {
      if (typeof img === 'string') {
        return {
          url: img,
          alt: `Property image ${index + 1}`,
        };
      }
      return {
        ...img,
        alt: img.alt || `Property image ${index + 1}`,
      };
    });
  }, [images]);

  // Process floorplans to ensure consistent format
  const processedFloorplans = useMemo<PropertyImage[]>(() => {
    if (!floorplans || floorplans.length === 0) return [];

    return floorplans.map((img, index) => {
      if (typeof img === 'string') {
        return {
          url: img,
          alt: `Floorplan ${index + 1}`,
          type: 'floorplan',
        };
      }
      return {
        ...img,
        alt: img.alt || `Floorplan ${index + 1}`,
        type: 'floorplan',
      };
    });
  }, [floorplans]);

  // Current active media set
  const currentMedia = viewMode === 'photos' ? processedImages : processedFloorplans;
  const hasFloorplans = processedFloorplans.length > 0;

  // Determine display configuration based on current media count
  const displayConfig = useMemo<ImageDisplayConfig>(() => {
    const imageCount = currentMedia.length;

    if (imageCount <= 1) {
      return {
        showPreviews: false,
        showNavigation: false
      };
    } else if (imageCount === 2) {
      return {
        showPreviews: showPreviews,
        showNavigation: true,
        previewCount: 1
      };
    } else {
      return {
        showPreviews: showPreviews,
        showNavigation: true,
        previewCount: Math.min(previewCount, 2)
      };
    }
  }, [currentMedia.length, showPreviews, previewCount, viewMode]);

  // Generate preview images based on current index
  const previewImages = useMemo<PreviewImage[]>(() => {
    if (!displayConfig.showPreviews || currentMedia.length <= 1) {
      return [];
    }

    const previews: PreviewImage[] = [];
    const totalImages = currentMedia.length;
    const maxPreviews = displayConfig.previewCount || 2;

    for (let i = 0; i < maxPreviews && i < totalImages; i++) {
      // Calculate preview indices (show next images, wrapping around)
      const previewIndex = (currentIndex + i + 1) % totalImages;
      const image = currentMedia[previewIndex];

      previews.push({
        index: previewIndex,
        url: image.url,
        thumbnail_url: image.thumbnail_url,
        alt: image.alt,
      });
    }

    return previews;
  }, [currentMedia, currentIndex, displayConfig]);

  // Handle image navigation
  const handlePreviousImage = () => {
    const newIndex = currentIndex === 0 ? currentMedia.length - 1 : currentIndex - 1;
    onImageChange(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = currentIndex === currentMedia.length - 1 ? 0 : currentIndex + 1;
    onImageChange(newIndex);
  };

  // Handle view mode change and reset index
  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'photos' | 'floorplans' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
      onImageChange(0); // Reset to first image when switching modes
    }
  };

  const handlePreviewClick = (index: number) => {
    onImageChange(index);
  };

  // Format image type for badge display
  const formatImageType = (type?: string): string => {
    if (!type || type === 'photo') return '';

    const typeMap: Record<string, string> = {
      'floorplan': 'Floor Plan',
      'virtual_tour': 'Virtual Tour',
    };

    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Handle no images case
  if (!processedImages || processedImages.length === 0) {
    return (
      <Box
        sx={{
          width: fullWidth && isWideScreen ? '100vw' : '100%',
          height: { xs: 300, sm: 400, md: 500 },
          marginLeft: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / -2)' : 0,
          marginRight: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / -2)' : 0,
          backgroundColor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          borderRadius: fullWidth ? 0 : 2,
        }}
      >
        <ImageNotSupported sx={{ fontSize: 64, color: 'grey.400' }} />
        <Chip
          label="No images available"
          size="small"
          sx={{ color: 'text.secondary' }}
        />
      </Box>
    );
  }

  // Handle current media being empty (e.g., no floorplans when in floorplan mode)
  if (!currentMedia || currentMedia.length === 0) {
    const emptyMessage = viewMode === 'floorplans' ? 'No floorplans available' : 'No images available';
    return (
      <Box
        sx={{
          width: fullWidth && isWideScreen ? '100vw' : '100%',
          height: { xs: 300, sm: 400, md: 500 },
          marginLeft: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / -2)' : 0,
          marginRight: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / -2)' : 0,
          backgroundColor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          borderRadius: fullWidth ? 0 : 2,
        }}
      >
        <ImageNotSupported sx={{ fontSize: 64, color: 'grey.400' }} />
        <Chip
          label={emptyMessage}
          size="small"
          sx={{ color: 'text.secondary' }}
        />
        {hasFloorplans && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{ mt: 1 }}
          >
            <ToggleButton value="photos">
              <PhotoLibrary sx={{ mr: 1 }} />
              Photos
            </ToggleButton>
            <ToggleButton value="floorplans">
              <Architecture sx={{ mr: 1 }} />
              Floorplans
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
    );
  }

  const currentImage = currentMedia[currentIndex];

  return (
    <Box
      sx={{
        position: 'relative',
        width: fullWidth && isWideScreen ? '100vw' : '100%',
        height: { xs: 300, sm: 400, md: 500 },
        marginLeft: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / -2)' : 0,
        marginRight: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / -2)' : 0,
        backgroundColor: 'grey.100',
        borderRadius: fullWidth ? 0 : 2,
        overflow: 'hidden',
      }}
    >
      {/* Main Image Container */}
      <Box
        sx={{
          width: displayConfig.showPreviews && !isMobile ? '70%' : '100%',
          height: isMobile && displayConfig.showPreviews ? '75%' : '100%',
          position: 'relative',
          display: 'inline-block',
          verticalAlign: 'top',
        }}
      >
        <LazyPropertyImage
          src={currentImage.url}
          alt={currentImage.alt || 'Property image'}
          width="100%"
          height="100%"
          borderRadius={0}
          objectFit="cover"
        />

        {/* Navigation Arrows */}
        {displayConfig.showNavigation && currentMedia.length > 1 && (
          <>
            <IconButton
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
              onClick={handlePreviousImage}
              disabled={currentMedia.length <= 1}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
              onClick={handleNextImage}
              disabled={currentMedia.length <= 1}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}

        {/* Image Counter */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {currentIndex + 1} / {currentMedia.length}
        </Box>

        {/* Image Type Badge */}
        {currentImage.type && currentImage.type !== 'photo' && (
          <Chip
            label={formatImageType(currentImage.type)}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              fontSize: '0.75rem',
            }}
          />
        )}

        {/* Photos/Floorplans Toggle - Bottom Left */}
        {hasFloorplans && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: fullWidth && isWideScreen ? 'calc((100vw - 1000px) / 2 + 16px)' : 16,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 1,
              zIndex: 2,
              '& .MuiToggleButton-root': {
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              },
            }}
          >
            <ToggleButton value="photos">
              <PhotoLibrary sx={{ mr: 0.5, fontSize: 16 }} />
              Photos
            </ToggleButton>
            <ToggleButton value="floorplans" disabled={!hasFloorplans}>
              <Architecture sx={{ mr: 0.5, fontSize: 16 }} />
              Floorplans {!hasFloorplans && '(0)'}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Preview Thumbnails */}
      {displayConfig.showPreviews && previewImages.length > 0 && (
        <Box
          sx={{
            width: isMobile ? '100%' : '28%',
            height: isMobile ? '25%' : '100%',
            display: isMobile ? 'flex' : 'inline-block',
            verticalAlign: 'top',
            ml: isMobile ? 0 : 1,
            mt: isMobile ? 1 : 0,
            gap: isMobile ? 1 : 0,
          }}
        >
          <Stack
            direction={isMobile ? 'row' : 'column'}
            spacing={1}
            sx={{ height: '100%', width: '100%' }}
          >
            {previewImages.map((image) => (
              <Box
                key={`preview-${image.index}`}
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: image.index === currentIndex ? '3px solid' : '1px solid',
                  borderColor: image.index === currentIndex ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'scale(1.02)',
                  },
                }}
                onClick={() => handlePreviewClick(image.index)}
              >
                <LazyPropertyImage
                  src={image.thumbnail_url || image.url}
                  alt={image.alt || 'Property thumbnail'}
                  width="100%"
                  height="100%"
                  borderRadius={0}
                  objectFit="cover"
                />

                {/* Preview Image Active Indicator */}
                {image.index === currentIndex && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle
                      sx={{
                        color: 'primary.main',
                        fontSize: 24,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                      }}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedImageSlideshow;