import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * ClosingCTAStyle4V2 - Final CTA section with background image
 * Glass-effect container with dual CTAs for conversion
 */
const ClosingCTAStyle4V2: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '70vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 12, md: 18 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/property-04.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2,
        },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
        }}
      >
        {/* Glass Container */}
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            p: { xs: 4, md: 6 },
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          {/* Title */}
          <Typography
            variant="h2"
            component="h2"
            sx={{
              color: '#ffffff',
              mb: 3,
              fontSize: { xs: '1.875rem', md: '2.25rem' },
              fontWeight: 600,
              lineHeight: 1.25,
            }}
          >
            Ready to find your{' '}
            <Box
              component="span"
              sx={{
                fontFamily: '"Caveat", cursive',
                fontStyle: 'italic',
                color: '#e0e0e0',
              }}
            >
              perfect home?
            </Box>
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: '#e0e0e0',
              mb: 6,
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            Join thousands of users who have discovered their ideal properties
            with Banner17's intelligent search. Start exploring today and experience
            the future of property discovery.
          </Typography>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/search')}
              sx={{
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '2px solid #ffffff',
                fontWeight: 600,
                fontSize: '1.2rem',
                px: 6,
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Start Searching Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                // Scroll to features section
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                border: '2px solid #ffffff',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontWeight: 600,
                fontSize: '1.2rem',
                px: 6,
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: '#ffffff',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Learn More
            </Button>
          </Stack>

          {/* Helper Text */}
          <Typography
            variant="body2"
            sx={{
              color: '#cccccc',
              fontFamily: '"Caveat", cursive',
              fontStyle: 'italic',
              fontSize: '1.1rem',
            }}
          >
            It's free to get started ↗
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ClosingCTAStyle4V2;