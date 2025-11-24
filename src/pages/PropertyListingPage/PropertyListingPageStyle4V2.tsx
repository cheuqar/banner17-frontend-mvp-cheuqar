import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { propertySearchService } from './services/propertySearchService';
import type { PropertySearchRequest, PropertySearchResponse } from './types';

// Style4-V2 Components
import HeaderStyle4V2 from '../../components/style4-v2/HeaderStyle4V2';
import FooterStyle4V2 from '../../components/style4-v2/FooterStyle4V2';
import Style4V2SearchForm from './components/Style4V2SearchForm';
import Style4V2PropertyCard from './components/Style4V2PropertyCard';
import Style4V2Pagination from './components/Style4V2Pagination';
import DebugPanel from './components/DebugPanel';

// Theme
import style4V2Theme, { style4V2Styles } from './theme/style4V2Theme';

/**
 * Property Listing Page - Style4-V2 Design System
 * Elegant, minimalist property discovery experience following Banner17's premium design system
 */
const PropertyListingPageStyle4V2: React.FC = () => {
  // State
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [searchResults, setSearchResults] = useState<PropertySearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Debug tracking
  const [lastSearchRequest, setLastSearchRequest] = useState<PropertySearchRequest | null>(null);

  // UI state for compact mode
  const [hasSearched, setHasSearched] = useState(false);

  // Test API connection on component mount
  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    setApiStatus('testing');
    setError(null);

    try {
      const isConnected = await propertySearchService.testConnection();
      if (isConnected) {
        setApiStatus('success');
      } else {
        setApiStatus('error');
        setError('Failed to connect to Grace API');
      }
    } catch (err) {
      setApiStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const runSampleSearch = async () => {
    setApiStatus('testing');
    setError(null);

    try {
      const results = await propertySearchService.searchProperties({
        states: ['NSW'],
        suburbs: ['Bondi Beach'],
        limit: 5
      });

      setSearchResults(results);
      setApiStatus('success');
    } catch (err) {
      setApiStatus('error');
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const handleSearch = async (request: PropertySearchRequest, resetPagination: boolean = true) => {
    setSearchLoading(true);
    setError(null);

    // Set hasSearched to true on first search
    if (!hasSearched) {
      setHasSearched(true);
    }

    // Reset pagination on new search
    if (resetPagination) {
      setCurrentPage(1);
    }

    // Add pagination to request
    const paginatedRequest = {
      ...request,
      limit: pageSize,
      offset: resetPagination ? 0 : (currentPage - 1) * pageSize
    };

    try {
      console.log('🔍 [PropertyListingPageStyle4V2] Executing search:', paginatedRequest);
      const results = await propertySearchService.searchProperties(paginatedRequest);

      setSearchResults(results);
      setLastSearchRequest(paginatedRequest);
      setApiStatus('success');
      console.log('✅ [PropertyListingPageStyle4V2] Search completed:', {
        found: results.total_count,
        returned: results.returned_count
      });
    } catch (err) {
      setApiStatus('error');
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('❌ [PropertyListingPageStyle4V2] Search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (lastSearchRequest) {
      handleSearch(lastSearchRequest, false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    if (lastSearchRequest) {
      const updatedRequest = { ...lastSearchRequest, limit: newPageSize, offset: 0 };
      handleSearch(updatedRequest, false);
    }
  };

  // Property detail handler
  const handleViewDetails = (property: any) => {
    const detailUrl = `/property/${property.id}`;
    window.open(detailUrl, '_blank', 'noopener,noreferrer');
  };

  // Calculate pagination values
  const totalPages = searchResults
    ? Math.ceil(searchResults.total_count / pageSize)
    : 0;
  const offset = searchResults?.offset || 0;

  return (
    <ThemeProvider theme={style4V2Theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: style4V2Styles.colors.backgroundWhite }}>
        {/* Header */}
        <HeaderStyle4V2 />

        {/* Hero Section with Background - Animated transition to compact */}
        <Box
          sx={{
            minHeight: hasSearched ? (searchResults ? '8vh' : '12vh') : '70vh', // Much more compact heights
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            py: hasSearched ?
              { xs: 1, md: 1.5 } : // Minimal padding when compact
              { xs: style4V2Styles.spacing.generousPaddingMobile, md: style4V2Styles.spacing.generousPaddingDesktop },
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(/property-01.jpg)', // Style4-V2 hero background
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 1,
              opacity: hasSearched ? 0.7 : 1,
              transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: hasSearched ?
                'rgba(0, 0, 0, 0.3)' :
                style4V2Styles.colors.darkOverlay,
              zIndex: 2,
              transition: 'background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 3, width: '100%' }}>
            {/* Hero Content - Hidden when compact */}
            {!hasSearched && (
              <Container maxWidth="lg" sx={{
                textAlign: 'center',
                mb: 8,
                opacity: hasSearched ? 0 : 1,
                transform: hasSearched ? 'translateY(-20px)' : 'translateY(0)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    color: style4V2Styles.colors.primaryWhite,
                    mb: 3,
                    maxWidth: style4V2Styles.maxWidths.headline,
                    mx: 'auto',
                  }}
                >
                  Banner17{' '}
                  <Box
                    component="span"
                    sx={{
                      fontFamily: style4V2Styles.accentFont,
                      fontStyle: 'italic',
                      color: style4V2Styles.colors.lightGray,
                    }}
                  >
                    Reinventing the Way You Find Property
                  </Box>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: style4V2Styles.colors.lightGray,
                    mb: 6,
                    maxWidth: style4V2Styles.maxWidths.body,
                    mx: 'auto',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                  }}
                >
                  Discover your perfect property with intelligent search, comprehensive data,
                  and insights that go beyond traditional real estate platforms.
                </Typography>
              </Container>
            )}

            {/* Hero Search Form */}
            <Style4V2SearchForm
              onSearch={handleSearch}
              loading={searchLoading}
              hasBackgroundImage={true}
              isCompact={hasSearched}
            />

            {/* Soft CTA Hint - Hidden when compact */}
            {!hasSearched && (
              <Container maxWidth="lg" sx={{
                textAlign: 'center',
                mt: 4,
                opacity: hasSearched ? 0 : 1,
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: style4V2Styles.colors.veryLightGray,
                    fontFamily: style4V2Styles.accentFont,
                    fontStyle: 'italic',
                    fontSize: '1rem',
                  }}
                >
                  Try the search above ↑
                </Typography>
              </Container>
            )}
          </Box>
        </Box>

        {/* Search Results Section */}
        {searchResults && searchResults.properties.length > 0 && (
          <Box sx={{
            py: { xs: style4V2Styles.spacing.sectionPaddingMobile, md: style4V2Styles.spacing.sectionPaddingDesktop },
            backgroundColor: style4V2Styles.colors.backgroundWhite
          }}>
            <Container maxWidth="lg">
              {/* Results Header */}
              <Box sx={{ mb: style4V2Styles.spacing.contentMarginMedium, textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  component="h2"
                  sx={{
                    mb: 2,
                    color: style4V2Styles.colors.primaryBlack,
                  }}
                >
                  Your Property Matches
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: style4V2Styles.colors.secondaryGray,
                    maxWidth: style4V2Styles.maxWidths.body,
                    mx: 'auto',
                  }}
                >
                  Found <strong>{searchResults.total_count.toLocaleString()}</strong> properties
                  {searchResults.total_count > searchResults.returned_count &&
                    ` (showing ${searchResults.returned_count})`
                  } • {searchResults.execution_time_seconds}s response time
                </Typography>
              </Box>

              {/* Property Grid */}
              <Grid container spacing={4} sx={{ mb: style4V2Styles.spacing.contentMarginLarge }}>
                {searchResults.properties.map((property) => (
                  <Grid item xs={12} sm={6} lg={4} key={property.id}>
                    <Style4V2PropertyCard
                      property={property}
                      onViewDetails={handleViewDetails}
                      onToggleFavorite={(prop) => {
                        console.log('Toggle favorite for:', prop.title);
                        // TODO: Implement favorites functionality
                      }}
                      isFavorite={false}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              <Style4V2Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={searchResults.total_count}
                pageSize={pageSize}
                offset={offset}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                loading={searchLoading}
              />
            </Container>
          </Box>
        )}

        {/* No Results */}
        {searchResults && searchResults.properties.length === 0 && (
          <Box sx={{
            py: { xs: style4V2Styles.spacing.sectionPaddingMobile, md: style4V2Styles.spacing.sectionPaddingDesktop },
            backgroundColor: style4V2Styles.colors.backgroundLight,
            textAlign: 'center'
          }}>
            <Container maxWidth="lg">
              <Paper sx={{
                p: style4V2Styles.spacing.contentMarginMedium,
                backgroundColor: style4V2Styles.colors.backgroundWhite,
                border: `1px solid ${style4V2Styles.colors.dividerColor}`,
                borderRadius: 2,
                maxWidth: style4V2Styles.maxWidths.narrowContent,
                mx: 'auto'
              }}>
                <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
                  No Properties Found
                </Typography>
                <Typography variant="body1" sx={{ color: style4V2Styles.colors.secondaryGray }}>
                  Try adjusting your search criteria or broadening your location search.
                  We're constantly adding new properties to our database.
                </Typography>
              </Paper>
            </Container>
          </Box>
        )}

        {/* Welcome Section (when no search has been performed) */}
        {!searchResults && apiStatus === 'success' && (
          <Box sx={{
            py: { xs: style4V2Styles.spacing.sectionPaddingMobile, md: style4V2Styles.spacing.sectionPaddingDesktop },
            backgroundColor: style4V2Styles.colors.backgroundLight,
            textAlign: 'center'
          }}>
            <Container maxWidth="lg">
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  mb: 3,
                  color: style4V2Styles.colors.primaryBlack,
                }}
              >
                Welcome to{' '}
                <Box
                  component="span"
                  sx={{
                    fontFamily: style4V2Styles.accentFont,
                    fontStyle: 'italic',
                    color: style4V2Styles.colors.secondaryGray,
                  }}
                >
                  Intelligent Property Discovery
                </Box>
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: style4V2Styles.colors.secondaryGray,
                  maxWidth: style4V2Styles.maxWidths.body,
                  mx: 'auto',
                  mb: 4,
                }}
              >
                Use the search form above to start discovering properties that match your exact requirements.
                Our intelligent search goes beyond basic filters to understand what you're really looking for.
              </Typography>

              {/* Feature Highlights */}
              <Grid container spacing={4} sx={{ mt: 4 }}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{
                    p: 4,
                    backgroundColor: style4V2Styles.colors.backgroundWhite,
                    border: `1px solid ${style4V2Styles.colors.dividerColor}`,
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: style4V2Styles.colors.primaryBlack,
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Smart Search
                    </Typography>
                    <Typography variant="body2" sx={{ color: style4V2Styles.colors.secondaryGray }}>
                      AI-powered search that understands natural language queries and finds exactly what you need.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{
                    p: 4,
                    backgroundColor: style4V2Styles.colors.backgroundWhite,
                    border: `1px solid ${style4V2Styles.colors.dividerColor}`,
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: style4V2Styles.colors.primaryBlack,
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Comprehensive Data
                    </Typography>
                    <Typography variant="body2" sx={{ color: style4V2Styles.colors.secondaryGray }}>
                      Access detailed property information, market insights, and neighborhood data all in one place.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{
                    p: 4,
                    backgroundColor: style4V2Styles.colors.backgroundWhite,
                    border: `1px solid ${style4V2Styles.colors.dividerColor}`,
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: style4V2Styles.colors.primaryBlack,
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Real-time Updates
                    </Typography>
                    <Typography variant="body2" sx={{ color: style4V2Styles.colors.secondaryGray }}>
                      Get the latest property listings and market changes as they happen, not days later.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>
        )}

        {/* Debug Panel - Development Only */}
        <DebugPanel
          lastSearchRequest={lastSearchRequest || undefined}
          lastSearchResponse={searchResults || undefined}
          apiStatus={apiStatus}
          error={error}
          onTestConnection={testApiConnection}
          onRunSampleSearch={runSampleSearch}
        />

        {/* Footer */}
        <FooterStyle4V2 />
      </Box>
    </ThemeProvider>
  );
};

export default PropertyListingPageStyle4V2;