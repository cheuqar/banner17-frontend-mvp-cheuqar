import React from 'react';
import {
  Box,
  Container,
  Typography
} from '@mui/material';

/**
 * PersonalStoryStyle4V2 - Personal story section with background image
 * Features company story in glass-effect container
 */
const PersonalStoryStyle4V2: React.FC = () => {
  return (
    <Box
      id="about"
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
          backgroundImage: 'url(/property-02.jpg)',
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
            maxWidth: 650,
            mx: 'auto',
          }}
        >
          {/* Title */}
          <Typography
            variant="h2"
            component="h2"
            sx={{
              color: '#ffffff',
              mb: 4,
              fontSize: { xs: '1.875rem', md: '2.25rem' },
              fontWeight: 600,
              lineHeight: 1.25,
            }}
          >
            Why We Built Banner17
          </Typography>

          {/* Story Quote */}
          <Typography
            variant="body1"
            sx={{
              color: '#ffffff',
              fontSize: '1.2rem',
              lineHeight: 1.6,
              fontStyle: 'italic',
              mb: 4,
            }}
          >
            "We were tired of endless property searches that never quite captured what we
            were really looking for. Traditional filters felt limiting, and we knew there
            had to be a better way. So we built it - a platform that understands the
            nuances of what makes a perfect home, powered by AI that thinks like you do."
          </Typography>

          {/* Attribution */}
          <Typography
            variant="body2"
            sx={{
              color: '#cccccc',
              fontSize: '1rem',
              fontFamily: '"Caveat", cursive',
              fontStyle: 'italic',
            }}
          >
            — The Banner17 Team
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PersonalStoryStyle4V2;