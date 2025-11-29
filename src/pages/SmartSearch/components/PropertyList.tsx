import React, { useRef } from 'react';
import { Box, Grid, Typography, Skeleton, Alert, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store';
import PropertyCard from './PropertyCard';
import type { BaseProperty } from '../../../types/property-enhanced';
import { PaginationControls, PropertyListHeader } from '../../../components/smart-search/pagination';
import {
  selectPagedProperties,
  selectPaginationInfo,
  setPaginationPage,
  MAX_PROPERTIES_LIMIT,
} from '../../../store/slices/smartSearchSlice';

interface PropertyListProps {
    onPropertyClick?: (property: BaseProperty) => void;
    visibleOnMap?: string[];
}

const PropertyList: React.FC<PropertyListProps> = ({
    onPropertyClick,
    visibleOnMap
}) => {
    const dispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.smartSearch.loading);
    const error = useSelector((state: RootState) => state.smartSearch.error);
    const totalCount = useSelector((state: RootState) => state.smartSearch.totalCount);
    // Phase 2.41: Track searchPending for progressive loading indicator
    const searchPending = useSelector((state: RootState) => state.smartSearch.searchPending);
    const properties = useSelector((state: RootState) => state.smartSearch.properties);

    // NEW: Use pagination selectors from Redux
    const pagedProperties = useSelector(selectPagedProperties);
    const paginationInfo = useSelector(selectPaginationInfo);

    // Phase 2.41: Calculate if we're in progressive loading mode
    // (loading more properties while already having some displayed)
    const isProgressiveLoading = searchPending && properties.length > 0 && properties.length < MAX_PROPERTIES_LIMIT;
    const hasMoreToLoad = totalCount > properties.length && properties.length < MAX_PROPERTIES_LIMIT;

    // UX FIX: Ref to scroll property list container to top
    const listContainerRef = useRef<HTMLDivElement>(null);

    // Page change handler
    const handlePageChange = (page: number) => {
        dispatch(setPaginationPage(page));
        // UX FIX: Scroll to top of property list panel when page changes
        // The PropertyList container has its own scroll (overflow: auto), not window scroll
        if (listContainerRef.current) {
            listContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
    };

    // Error state - Only show error if we have no properties AND there's an error
    // This ensures successful data takes precedence over stale errors
    if (error && paginationInfo.totalCount === 0 && !loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Box>
        );
    }
    // Loading skeletons
    if (loading) {
        return (
            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid item xs={12} key={i}>
                            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <Skeleton
                                    variant="rectangular"
                                    height={200}
                                    sx={{ borderRadius: '4px 4px 0 0' }}
                                />
                                <Box sx={{ p: 2 }}>
                                    <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="60%" height={20} />
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    // Empty state - no properties visible on map
    if (paginationInfo.totalCount === 0 && !loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 400,
                    height: '100%',
                    p: 3,
                }}
            >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No properties visible on map
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Try zooming out or adjusting your search filters
                </Typography>
            </Box>
        );
    }

    // Empty page state - properties exist but current page is empty
    if (pagedProperties.length === 0 && paginationInfo.totalCount > 0 && !loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 400,
                    height: '100%',
                    p: 3,
                }}
            >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No properties on this page
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Please navigate to a different page
                </Typography>
            </Box>
        );
    }

    // Property grid with pagination
    return (
        <Box ref={listContainerRef} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            {/* Property List Header with count and pagination info */}
            <PropertyListHeader
                totalCount={totalCount}
                visibleCount={paginationInfo.totalCount}
                currentPage={paginationInfo.currentPage}
                itemsPerPage={paginationInfo.itemsPerPage}
            />

            {/* Property Grid - Only display pagedProperties (25 items max) */}
            <Grid container spacing={3}>
                {pagedProperties.map((property) => (
                    <Grid item xs={12} key={property.id}>
                        <PropertyCard
                            property={property as any}
                            onClick={() => onPropertyClick?.(property)}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Phase 2.41: Progressive Loading Indicator */}
            {isProgressiveLoading && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        py: 2,
                        mt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <CircularProgress size={20} thickness={4} />
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666666',
                            fontSize: '13px',
                        }}
                    >
                        Loading more properties... ({properties.length.toLocaleString()} of {Math.min(totalCount, MAX_PROPERTIES_LIMIT).toLocaleString()})
                    </Typography>
                </Box>
            )}

            {/* Phase 2.41: Show count info when progressive loading is complete */}
            {!isProgressiveLoading && properties.length >= MAX_PROPERTIES_LIMIT && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 1.5,
                        mt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#999999',
                            fontSize: '12px',
                            fontStyle: 'italic',
                        }}
                    >
                        Showing maximum of {MAX_PROPERTIES_LIMIT.toLocaleString()} properties
                    </Typography>
                </Box>
            )}

            {/* Pagination Controls */}
            {paginationInfo.totalPages > 1 && (
                <PaginationControls
                    currentPage={paginationInfo.currentPage}
                    totalPages={paginationInfo.totalPages}
                    onPageChange={handlePageChange}
                    disabled={loading}
                />
            )}
        </Box>
    );
};

export default PropertyList;
