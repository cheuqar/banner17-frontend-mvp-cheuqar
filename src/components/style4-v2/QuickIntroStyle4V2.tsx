import React from 'react';
import {
  Box,
  Container,
  Typography
} from '@mui/material';

/**
 * QuickIntroStyle4V2 - Light background introductory section
 * Simple content section explaining the AI-powered approach
 */
const QuickIntroStyle4V2: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#fafafa',
        py: { xs: 12, md: 18 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {/* Headline */}
          <Typography
            variant="h2"
            component="h2"
            sx={{
              color: '#000000',
              mb: 4,
              fontSize: { xs: '1.875rem', md: '2.25rem' },
              fontWeight: 600,
              lineHeight: 1.25,
            }}
          >
            Forget filters.{' '}
            <Box
              component="span"
              sx={{
                fontFamily: '"Caveat", cursive',
                fontStyle: 'italic',
                color: '#666666',
              }}
            >
              Forget suburb-only searches.
            </Box>
          </Typography>

          {/* Body Content */}
          <Typography
            variant="body1"
            sx={{
              color: '#000000',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            Our AI understands what you're really looking for. Describe your perfect home
            in natural language - "modern apartment with pool near good schools" or
            "quiet family home with large backyard" - and discover properties that match
            your lifestyle, not just your filters.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default QuickIntroStyle4V2;