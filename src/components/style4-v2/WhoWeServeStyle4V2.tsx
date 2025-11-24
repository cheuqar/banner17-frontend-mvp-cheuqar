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
  HomeWork,
  FamilyRestroom,
  Elderly,
  TrendingUp,
  Business
} from '@mui/icons-material';

/**
 * WhoWeServeStyle4V2 - Light background buyer type cards section
 * Displays different types of property buyers we serve
 */
const WhoWeServeStyle4V2: React.FC = () => {
  const buyerTypes = [
    {
      icon: <HomeWork sx={{ fontSize: 48 }} />,
      title: 'First Home Buyers',
      description: 'Navigate the property market with confidence. Get personalized guidance and discover properties within your budget and preferences.'
    },
    {
      icon: <FamilyRestroom sx={{ fontSize: 48 }} />,
      title: 'Growing Families',
      description: 'Find family-friendly homes with space to grow. Search by school zones, playgrounds, and community amenities that matter most.'
    },
    {
      icon: <Elderly sx={{ fontSize: 48 }} />,
      title: 'Downsizers',
      description: 'Discover the perfect smaller home that maintains your lifestyle. Find low-maintenance properties with accessibility and convenience.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: 'Investors',
      description: 'Make data-driven investment decisions with market analytics, rental yield projections, and growth potential assessments.'
    },
    {
      icon: <Business sx={{ fontSize: 48 }} />,
      title: 'Developers',
      description: 'Identify development opportunities with detailed site analysis, zoning information, and market demand insights.'
    }
  ];

  return (
    <Box
      id="who-we-serve"
      sx={{
        backgroundColor: '#fafafa',
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
            Who we serve
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
            Every kind of property buyer
          </Typography>
        </Box>

        {/* Buyer Types Grid */}
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {buyerTypes.map((buyer, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{
                // Handle 5 items responsively
                ...(buyerTypes.length === 5 && index === 4 && {
                  md: 6,
                  lg: 4,
                  xl: 4
                })
              }}
            >
              <Card
                sx={{
                  backgroundColor: '#ffffff',
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
                    {buyer.icon}
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
                    {buyer.title}
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
                    {buyer.description}
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

export default WhoWeServeStyle4V2;