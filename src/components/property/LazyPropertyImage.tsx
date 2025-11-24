import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';

interface LazyPropertyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: string | number;
  objectFit?: 'cover' | 'contain' | 'fill';
  className?: string;
}

export const LazyPropertyImage: React.FC<LazyPropertyImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 200,
  borderRadius = 1,
  objectFit = 'cover',
  className
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Box
      className={className}
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        bgcolor: 'grey.100'
      }}
    >
      {/* Skeleton placeholder while loading - Grace-style shimmer */}
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius,
            bgcolor: '#f0f0f0',
            '&::after': {
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            }
          }}
        />
      )}

      {/* Image */}
      {!hasError ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy" // Native lazy loading
          onLoad={handleLoad}
          onError={handleError}
          sx={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            display: 'block'
          }}
        />
      ) : (
        // Fallback placeholder for broken images - Grace style
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
            color: 'grey.500'
          }}
        >
          <Box sx={{ textAlign: 'center', p: 2 }}>
            {/* Image icon SVG */}
            <Box
              component="svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              sx={{ mb: 1, opacity: 0.5 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </Box>
            <Box sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'grey.600' }}>
              Image unavailable
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
