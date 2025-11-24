import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Security,
  VerifiedUser,
  Speed,
  SupportAgent
} from '@mui/icons-material';

/**
 * TrustSectionStyle4V2 - White background trust indicators section
 * Showcases reliability and trustworthiness factors
 */
const TrustSectionStyle4V2: React.FC = () => {
  const trustPoints = [
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Data Privacy',
      description: 'Your search data and personal information are protected with enterprise-grade security. We never share your data with third parties.'
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 40 }} />,
      title: 'Verified Listings',
      description: 'All property listings are verified and updated in real-time. Get accurate information you can trust for confident decisions.'
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Fast & Reliable',
      description: 'Lightning-fast search results with 99.9% uptime. Find your perfect property without delays or technical interruptions.'
    },
    {
      icon: <SupportAgent sx={{ fontSize: 40 }} />,
      title: 'Expert Support',
      description: '24/7 customer support from property experts who understand your needs and can guide you through your property journey.'
    }
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        py: { xs: 12, md: 18 },
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 8,
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              color: '#000000',
              mb: 2,
              fontSize: { xs: '1.875rem', md: '2.25rem' },
              fontWeight: 600,
              lineHeight: 1.25,
            }}
          >
            Why Trust Banner17?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666666',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              fontFamily: '"Caveat", cursive',
              fontStyle: 'italic',
            }}
          >
            Built for reliability and your peace of mind
          </Typography>
        </Box>

        {/* Trust Points Grid */}
        <Grid container spacing={4}>
          {trustPoints.map((point, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  backgroundColor: '#fafafa',
                  border: '1px solid #e5e5e5',
                  borderRadius: 2,
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    borderColor: '#000000',
                  },
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      color: '#000000',
                      mb: 3,
                    }}
                  >
                    {point.icon}
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      color: '#000000',
                      mb: 2,
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {point.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666666',
                      fontSize: '1rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {point.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TrustSectionStyle4V2;