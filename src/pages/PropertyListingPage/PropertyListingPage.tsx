import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { propertySearchService } from './services/propertySearchService';
import type { PropertySearchRequest, PropertySearchResponse } from './types';
import PropertyListingHeader from './components/PropertyListingHeader';
import EnhancedSearchForm from './components/EnhancedSearchForm';
import PropertyCard from './components/PropertyCard';
import PropertyPagination from './components/PropertyPagination';
import DebugPanel from './components/DebugPanel';

/**
 * Property Listing Page - Enhanced Main Component
 * Phase 2: Modern UI with autocomplete, pagination, Banner17 branding
 */
const PropertyListingPage: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [searchResults, setSearchResults] = useState<PropertySearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Debug tracking
  const [lastSearchRequest, setLastSearchRequest] = useState<PropertySearchRequest | null>(null);

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
      console.log('🔍 [PropertyListingPage] Executing search:', paginatedRequest);
      const results = await propertySearchService.searchProperties(paginatedRequest);

      setSearchResults(results);
      setLastSearchRequest(paginatedRequest);
      setApiStatus('success');
      console.log('✅ [PropertyListingPage] Search completed:', {
        found: results.total_count,
        returned: results.returned_count
      });
    } catch (err) {
      setApiStatus('error');
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('❌ [PropertyListingPage] Search failed:', err);
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <PropertyListingHeader />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Enhanced Search Form */}
        <EnhancedSearchForm onSearch={handleSearch} loading={searchLoading} />


        {/* Search Results */}
        {searchResults && searchResults.properties.length > 0 && (
          <>
            {/* Results Header */}
            <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight={600} color="primary.main">
                  Search Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {searchResults.execution_time_seconds}s response time
                </Typography>
              </Box>
              <Typography variant="body1" color="text.primary">
                Found <strong>{searchResults.total_count.toLocaleString()}</strong> properties
                {searchResults.total_count > searchResults.returned_count &&
                  ` (showing ${searchResults.returned_count})`
                }
              </Typography>
            </Paper>

            {/* Property Grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {searchResults.properties.map((property) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
                  <PropertyCard
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
            <PropertyPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={searchResults.total_count}
              pageSize={pageSize}
              offset={offset}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={searchLoading}
            />
          </>
        )}

        {/* No Results */}
        {searchResults && searchResults.properties.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No properties found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria or broadening your location search.
            </Typography>
          </Paper>
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
      </Container>
    </Box>
  );
};

export default PropertyListingPage;