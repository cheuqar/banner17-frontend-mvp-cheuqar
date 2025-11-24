import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid
} from '@mui/material';

/**
 * NumbersProofStyle4V2 - Statistics section with background image
 * Displays key metrics with dramatic visual impact
 */
const NumbersProofStyle4V2: React.FC = () => {
  const stats = [
    { number: '500K+', label: 'Properties' },
    { number: '25+', label: 'Cities' },
    { number: '10K+', label: 'Users' },
    { number: '95%', label: 'Accuracy' },
  ];

  return (
    <Box
      id="numbers"
      sx={{
        minHeight: '60vh',
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
          backgroundImage: 'url(/property-03.jpg)',
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
        {/* Section Title */}
        <Typography
          variant="h2"
          component="h2"
          sx={{
            color: '#ffffff',
            mb: 2,
            fontSize: { xs: '1.875rem', md: '2.25rem' },
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          By the Numbers
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: '#e0e0e0',
            mb: 8,
            fontSize: '1.1rem',
            lineHeight: 1.6,
          }}
        >
          Proven results across Australia
        </Typography>

        {/* Statistics Grid */}
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h1"
                  component="div"
                  sx={{
                    color: '#ffffff',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    lineHeight: 1,
                    mb: 1,
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#cccccc',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default NumbersProofStyle4V2;