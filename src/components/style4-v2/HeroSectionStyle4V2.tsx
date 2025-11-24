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
 * HeroSectionStyle4V2 - Full-screen hero section with background image
 * Features prominent search bar and dual CTAs following Style4-V2 design
 */
const HeroSectionStyle4V2: React.FC = () => {
  const navigate = useNavigate();

  const handleSearchNavigation = () => {
    navigate('/search');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 15, md: 25 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/property-01.jpg)',
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
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
        }}
      >
        {/* Main Headline */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            color: '#ffffff',
            mb: 3,
            maxWidth: 900,
            mx: 'auto',
            fontSize: { xs: '2.25rem', md: '2.75rem' },
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          Banner17{' '}
          <Box
            component="span"
            sx={{
              fontFamily: '"Caveat", cursive',
              fontStyle: 'italic',
              color: '#e0e0e0',
            }}
          >
            Reinventing the Way You Find Property
          </Box>
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: '#e0e0e0',
            mb: 6,
            maxWidth: 800,
            mx: 'auto',
            fontSize: '1.1rem',
            lineHeight: 1.6,
          }}
        >
          Discover your perfect property with intelligent search, comprehensive data,
          and insights that go beyond traditional real estate platforms. Search naturally,
          find precisely what you're looking for.
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
            onClick={handleSearchNavigation}
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
            Start Explore Properties
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
            Learn How It Works
          </Button>
        </Stack>

      </Container>
    </Box>
  );
};

export default HeroSectionStyle4V2;