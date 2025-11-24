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
  Search,
  CameraAlt,
  Home,
  TrendingUp
} from '@mui/icons-material';

/**
 * FeatureHighlightsStyle4V2 - White background feature cards section
 * Showcases key platform capabilities with interactive cards
 */
const FeatureHighlightsStyle4V2: React.FC = () => {
  const features = [
    {
      icon: <Search sx={{ fontSize: 40 }} />,
      title: 'Search Beyond Basics',
      description: 'Use natural language to describe your ideal home. Our AI understands context, lifestyle preferences, and subtle requirements that traditional filters miss.'
    },
    {
      icon: <CameraAlt sx={{ fontSize: 40 }} />,
      title: 'Image & Style Search',
      description: 'Upload photos of interiors, exteriors, or architectural styles you love. Find properties with similar aesthetics and design elements.'
    },
    {
      icon: <Home sx={{ fontSize: 40 }} />,
      title: 'Lifestyle Matching',
      description: 'Tell us about your daily routine, hobbies, and priorities. We\'ll match you with properties that complement your lifestyle and future plans.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Investor & Developer Tools',
      description: 'Access market analytics, development potential assessments, rental yield calculations, and growth forecasts for informed investment decisions.'
    }
  ];

  return (
    <Box
      id="features"
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
            What we do
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  backgroundColor: '#fafafa',
                  border: '1px solid #e5e5e5',
                  borderRadius: 2,
                  p: 4,
                  height: '100%',
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
                    {feature.icon}
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      color: '#000000',
                      mb: 2,
                      fontSize: '1.75rem',
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666666',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
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

export default FeatureHighlightsStyle4V2;