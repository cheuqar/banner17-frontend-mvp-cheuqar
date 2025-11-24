import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper, Alert, CircularProgress, ThemeProvider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropertyDetailPageComponent from '../components/property/PropertyDetailDialogEnhanced';
import { style4V2SharedTheme } from '../theme/style4V2SharedTheme';
import HeaderStyle4V2 from '../components/style4-v2/HeaderStyle4V2';
import FooterStyle4V2 from '../components/style4-v2/FooterStyle4V2';

// Real property data will be fetched from backend API

const PropertyDetailPageWrapper: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load real property data from API
    const loadProperty = async () => {
      try {
        setLoading(true);
        console.log('🔍 [PropertyDetailPage] Starting to load property with ID:', propertyId);

        // Use the correct public property detail endpoint
        console.log('🔍 [PropertyDetailPage] Fetching property from public endpoint...');
        const publicResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100'}/api/v1/public/properties/${propertyId}`);
        console.log('📡 [PropertyDetailPage] Public endpoint response status:', publicResponse.status);
        console.log('📡 [PropertyDetailPage] Public endpoint response headers:', Object.fromEntries(publicResponse.headers.entries()));

        if (publicResponse.ok) {
          const propertyData = await publicResponse.json();
          console.log('✅ [PropertyDetailPage] Successfully loaded property data:', propertyData);
          setProperty(propertyData);
          setError(null);
          return;
        } else {
          const errorText = await publicResponse.text();
          console.log('❌ [PropertyDetailPage] Public endpoint failed:', publicResponse.status, errorText);

          if (publicResponse.status === 404) {
            throw new Error('Property not found or not publicly accessible');
          } else {
            throw new Error(`Failed to load property: ${publicResponse.status} ${errorText}`);
          }
        }

      } catch (err) {
        console.error('💥 [PropertyDetailPage] Final error loading property:', err);
        setError(`Failed to load property details: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    } else {
      setError('Property ID is required');
      setLoading(false);
    }
  }, [propertyId]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <ThemeProvider theme={style4V2SharedTheme}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
          <HeaderStyle4V2 />
          <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ color: '#000000' }} />
            <Typography variant="body1" sx={{ mt: 2, color: '#000000' }}>
              Loading property details...
            </Typography>
          </Container>
          <FooterStyle4V2 />
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !property) {
    return (
      <ThemeProvider theme={style4V2SharedTheme}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
          <HeaderStyle4V2 />
          <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 2, border: '1px solid #e5e5e5' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || 'Property not found'}
              </Alert>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                variant="outlined"
                sx={{
                  borderColor: '#000000',
                  color: '#000000',
                  '&:hover': {
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                Back to Home
              </Button>
            </Paper>
          </Container>
          <FooterStyle4V2 />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={style4V2SharedTheme}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
        <HeaderStyle4V2 />
        <PropertyDetailPageComponent
          property={property}
          onNavigateBack={handleBack}
          isStandalonePage={true}
        />
        <FooterStyle4V2 />
      </Box>
    </ThemeProvider>
  );
};

export default PropertyDetailPageWrapper;
