import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  Info,
  Launch,
  DateRange,
  Gavel,
  AccountBalance,
  Business,
  CalendarToday,
  MonetizationOn,
} from '@mui/icons-material';
import type {
  PropertyMetadata,
  PropertyMetadataCardProps,
} from '../../../types/property-enhanced';

/**
 * Property Metadata Card Component
 * Displays additional property details in a two-column grid
 * Only shows fields that have data with conditional rendering
 */
const PropertyMetadataCard: React.FC<PropertyMetadataCardProps> = ({
  metadata,
  onExternalLinkClick,
}) => {
  // Format sale method for display
  const formatSaleMethod = (method?: string): string => {
    if (!method) return '';

    const methodMap: Record<string, string> = {
      'auction': 'Auction',
      'private_sale': 'Private Sale',
      'expression_of_interest': 'Expression of Interest',
      'tender': 'Tender',
      'sale_by_negotiation': 'Sale by Negotiation',
    };

    return methodMap[method] || method.charAt(0).toUpperCase() + method.slice(1);
  };

  // Format currency values
  const formatCurrency = (value?: string): string => {
    if (!value) return '';

    // If already formatted, return as is
    if (value.includes('$') || value.includes('per')) {
      return value;
    }

    // Try to parse as number and format
    const numValue = parseFloat(value.replace(/[^\d.]/g, ''));
    if (!isNaN(numValue)) {
      return `$${numValue.toLocaleString()} per annum`;
    }

    return value;
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Handle external link click
  const handleExternalLink = (url: string) => {
    if (onExternalLinkClick) {
      onExternalLinkClick(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Check if we have any metadata to display
  const hasMetadata = Boolean(
    metadata.year_built ||
    metadata.sale_method ||
    metadata.council_rates ||
    metadata.strata_fees ||
    metadata.listing_date ||
    metadata.availability_date ||
    metadata.land_area ||
    metadata.floor_area ||
    metadata.building_area ||
    metadata.source_system ||
    metadata.data_quality_score ||
    metadata.features?.length
  );

  if (!hasMetadata) {
    return null; // Don't render the card if no metadata
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600}>
        <Info sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
        Additional Details
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Year Built */}
        {metadata.year_built && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DateRange sx={{ fontSize: 14 }} />
                Year Built
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {metadata.year_built}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Sale Method */}
        {metadata.sale_method && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Gavel sx={{ fontSize: 14 }} />
                Sale Method
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {formatSaleMethod(metadata.sale_method)}
                </Typography>
                {metadata.sale_method === 'auction' && (
                  <Chip
                    label="Auction"
                    size="small"
                    color="warning"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            </Box>
          </Grid>
        )}

        {/* Council Rates */}
        {metadata.council_rates && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccountBalance sx={{ fontSize: 14 }} />
                Council Rates
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatCurrency(metadata.council_rates)}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Strata Fees */}
        {metadata.strata_fees && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Business sx={{ fontSize: 14 }} />
                Strata Fees
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatCurrency(metadata.strata_fees)}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Listing Date */}
        {metadata.listing_date && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 14 }} />
                Listed
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(metadata.listing_date)}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Availability Date */}
        {metadata.availability_date && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 14 }} />
                Available
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(metadata.availability_date)}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Land Area */}
        {metadata.land_area && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DateRange sx={{ fontSize: 14 }} />
                Land Area
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {(metadata.land_area / 10000).toFixed(2)} hectares ({metadata.land_area.toLocaleString()} m²)
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Floor Area */}
        {metadata.floor_area && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DateRange sx={{ fontSize: 14 }} />
                Floor Area
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {metadata.floor_area.toLocaleString()} m²
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Building Area */}
        {metadata.building_area && (
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DateRange sx={{ fontSize: 14 }} />
                Building Area
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {metadata.building_area.toLocaleString()} m²
              </Typography>
            </Box>
          </Grid>
        )}


      </Grid>

      {/* External Links Section */}
      {(metadata.listing_url || metadata.videos?.length) && (
        <>
          <Divider sx={{ mt: 2, mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {metadata.listing_url && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Launch />}
                onClick={() => handleExternalLink(metadata.listing_url!)}
                sx={{
                  textTransform: 'none',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                View Original Listing
              </Button>
            )}
            {metadata.videos?.map((videoUrl, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                startIcon={<Launch />}
                onClick={() => handleExternalLink(videoUrl)}
                sx={{
                  textTransform: 'none',
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                Video {index + 1}
              </Button>
            ))}
          </Box>
        </>
      )}

      {/* Additional Information */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          💡 Information accuracy depends on source data quality. Contact agent to verify details.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PropertyMetadataCard;