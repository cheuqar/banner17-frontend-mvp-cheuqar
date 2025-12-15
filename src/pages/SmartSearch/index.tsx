import React, { useEffect, useState, useRef } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapView from './components/MapView';
import LeftPanel from './components/LeftPanel';
import PanelContainer from './components/ResearchPanel/PanelContainer';
import MobileBottomSheet from './components/ResearchPanel/MobileBottomSheet';
import { FilterDrawer, FilterDialog } from './components/Filters';
import SpatialFilterConflictDialog from './components/SpatialFilterConflictDialog';
import SearchErrorAlert from './components/SearchErrorAlert'; // Phase 2.5.10
// Phase 2.17.5 FIX: Removed FloatingResultsButton import (now in FloatingMapControls)
import { useSmartSearch } from './hooks/useSmartSearch';
import { performSearch, loadMoreProperties, selectPropertyPanelVisible, selectSearchMode, MAX_PROPERTIES_LIMIT, type Amenity } from '../../store/slices/smartSearchSlice';
import type { RootState, AppDispatch } from '../../store';
import type { School } from '../../types/smartSearch';
import { useAppSelector } from '../../store';
// Feature 003: Import new SearchHeader component (replaces old SearchBar, ToggleButtons, AppBar, Toolbar, Typography)
import { SearchHeader } from '../../components/search';
// Phase 2.28: Import redesigned two-tier header (TopNavigation + CompactFilterBar)
import RedesignedSearchHeader from './components/CompactFilterBar/RedesignedSearchHeader';

const SmartSearchPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const viewMode = useSelector((state: RootState) => state.smartSearch.viewMode);
    const properties = useSelector((state: RootState) => state.smartSearch.properties);
    const loading = useSelector((state: RootState) => state.smartSearch.loading);
    // Phase 2.17.5 FIX: Add propertyPanelVisible selector for dynamic map width
    const propertyPanelVisible = useAppSelector(selectPropertyPanelVisible);

    // Phase 2.26 FIX: Use media query to conditionally render FilterDrawer (mobile) vs FilterDialog (desktop)
    // This prevents both components from appearing simultaneously
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

    // CRITICAL FIX: Use media query to conditionally render MapView instance only once
    // This prevents duplicate useBboxSchools hook instances and eliminates double API calls
    const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >=900px

    // Track if initial search has been dispatched to prevent duplicates
    const initialSearchDispatched = React.useRef(false);

    // Phase 2.41 FIX: Track if this is the first render to skip filter change effect on mount
    // This prevents the filter change useEffect from triggering a second search on initial load,
    // which would interfere with progressive loading
    const isFirstRender = React.useRef(true);

    // NEW: Phase 2.10.7.5 - Map ref for school centering
    const mapRef = useRef<any>(null);

    // NEW: Phase 2.10.7.5 - Handler to center map on a school
    // Phase 2.14 FIX: Adjust zoom to 11 if currently > 11 (zoomed out too far)
    const handleCenterSchool = (school: School) => {
        if (mapRef.current && school.latitude && school.longitude) {
            try {
                // Get current zoom level
                const currentZoom = mapRef.current.getZoom();

                // Phase 2.14: Use zoom level 11 if current > 11, otherwise keep current zoom
                // This ensures catchment areas are visible without zooming in too much
                const targetZoom = currentZoom > 11 ? 11 : currentZoom;

                // Center map at school location with smooth animation
                mapRef.current.setView(
                    [school.latitude, school.longitude],
                    targetZoom,
                    { animate: true, duration: 0.5 }
                );

                // Verify zoom was applied (for debugging)
                const appliedZoom = mapRef.current.getZoom();
                console.log('[SmartSearch] Centered on school:', {
                    school: school.school_name,
                    lat: school.latitude,
                    lng: school.longitude,
                    currentZoom: currentZoom,
                    targetZoom: targetZoom,
                    appliedZoom: appliedZoom,
                    zoomAdjusted: currentZoom > 11
                });

                // If zoom didn't apply, force it
                if (appliedZoom !== targetZoom) {
                    console.warn('[SmartSearch] Zoom level mismatch, forcing zoom...');
                    mapRef.current.setZoom(targetZoom, { animate: true });
                }
            } catch (error) {
                console.error('[SmartSearch] Error centering on school:', error);
            }
        }
    };

    // NEW: Phase 2.32.1 - Handler to center map on an amenity
    // Uses setView which triggers existing map event listeners (moveend/zoomend)
    // This ensures the "Search this area" auto-refresh mechanism fires correctly
    const handleCenterAmenity = (amenity: Amenity) => {
        if (mapRef.current && amenity.latitude && amenity.longitude) {
            try {
                // Get current zoom level
                const currentZoom = mapRef.current.getZoom();

                // Keep current zoom (amenities don't need special zoom adjustment)
                const targetZoom = currentZoom;

                // Center map at amenity location with smooth animation
                // Phase 2.32.1: setView triggers existing moveend/zoomend listeners
                // which fire the auto-search mechanism - no additional API calls needed
                mapRef.current.setView(
                    [amenity.latitude, amenity.longitude],
                    targetZoom,
                    { animate: true, duration: 0.5 }
                );
            } catch (error) {
                console.error('[SmartSearch] Error centering on amenity:', error);
            }
        }
    };

    // Fetch properties on mount (initial load with no filters)
    // BUG-DEBUG: Enhanced logging for initial search dispatch
    useEffect(() => {
        console.log('[SmartSearch] useEffect - checking if initial search should be dispatched', {
          propertiesLength: properties.length,
          loading: loading,
          initialSearchDispatched: initialSearchDispatched.current,
          timestamp: new Date().toISOString(),
        });

        // Phase 2.41 FIX: If properties already exist (from Redux persist), mark as initialized
        // This enables progressive loading even when data comes from cache
        if (properties.length > 0 && !initialSearchDispatched.current) {
            console.log('[SmartSearch] Properties already exist (from persist), marking as initialized', {
              propertiesLength: properties.length,
              timestamp: new Date().toISOString(),
            });
            initialSearchDispatched.current = true;
            return; // Don't dispatch new search, just enable progressive loading
        }

        if (properties.length === 0 && !loading && !initialSearchDispatched.current) {
            console.log('[SmartSearch] Dispatching initial performSearch', {
              timestamp: new Date().toISOString(),
            });
            initialSearchDispatched.current = true;
            dispatch(performSearch());
        }
    }, [dispatch, properties.length, loading]);

    // Phase 2.28.4 FIX: Auto-trigger search when filters change
    // Watches filter state and automatically performs search without requiring "Apply Filters" button
    const filters = useSelector((state: RootState) => state.smartSearch.filters);
    const searchPending = useSelector((state: RootState) => state.smartSearch.searchPending);
    // Phase 2.41: Selectors for auto-progressive loading
    const totalCount = useSelector((state: RootState) => state.smartSearch.totalCount);
    const hasMore = totalCount > properties.length;
    // Phase 2.46 FIX: Selector for spatial filter to skip progressive loading during catchment searches
    const activeSpatialFilter = useSelector((state: RootState) => state.smartSearch.activeSpatialFilter);
    // Phase 2.56: Selector for search mode to skip progressive loading during clustered searches
    const searchMode = useAppSelector(selectSearchMode);

    // Phase 2.28.7 FIX: Serialize array to prevent infinite re-renders
    // Arrays create new references on every Redux update, causing useEffect to trigger infinitely
    // Phase 2.41 FIX: Create copy before sort() - Redux state arrays are read-only
    const propertyTypesKey = [...filters.propertyTypes].sort().join(',');

    useEffect(() => {
        // Phase 2.41 FIX: Skip on first render to prevent interfering with initial search
        // The filter change effect should only fire when user actually changes filters,
        // not on initial mount where it would create a duplicate search that resets progressive loading
        if (isFirstRender.current) {
            isFirstRender.current = false;
            console.log('[SmartSearch] Skipping filter change effect on first render');
            return;
        }

        // Skip if initial search hasn't been dispatched yet
        if (!initialSearchDispatched.current) {
            return;
        }

        // Skip if search is already in progress (prevent concurrent requests)
        if (searchPending) {
            console.log('[SmartSearch] Search already in progress, skipping filter change trigger');
            return;
        }

        // Debounce search trigger to avoid multiple searches during rapid filter changes
        const searchTimeout = setTimeout(() => {
            console.log('[SmartSearch] Filter changed, triggering auto-search:', {
                priceRange: filters.priceRange,
                bedrooms: filters.bedrooms,
                bathrooms: filters.bathrooms,
                parking: filters.parking,
                propertyTypes: filters.propertyTypes,
                listingType: filters.listingType,
                timestamp: new Date().toISOString(),
            });
            dispatch(performSearch());
        }, 300); // 300ms debounce to avoid excessive API calls

        return () => clearTimeout(searchTimeout);
    }, [
        filters.priceRange.min,
        filters.priceRange.max,
        filters.bedrooms.min,
        filters.bedrooms.max,
        filters.bathrooms.min,
        filters.parking.min,
        propertyTypesKey, // Use serialized string instead of array reference
        filters.listingType,
        dispatch,
        // Phase 2.28.7 FIX: Removed searchPending from dependencies
        // searchPending should only be used as a guard check, not trigger the effect
        // Including it caused infinite loop: searchPending changes → effect runs → setTimeout → search → searchPending changes → loop
    ]);

    // Phase 2.41: Auto-progressive loading effect
    // Automatically loads more properties until MAX_PROPERTIES_LIMIT or no more results
    useEffect(() => {
        // Guard conditions:
        // 1. Not currently loading (prevents rapid-fire during loadMore)
        // 2. Main search not in progress
        // 3. More properties available from backend
        // 4. Under max limit (2000)
        // 5. Initial load completed (properties.length > 0)
        // 6. Initial search was dispatched
        // 7. Phase 2.46 FIX: Skip progressive loading for school catchment searches
        //    Backend returns incorrect total_count that doesn't reflect catchment-filtered count,
        //    causing unnecessary second API call. All catchment-filtered results are returned in first call.
        // 8. Phase 2.56 FIX: Skip progressive loading for clustered searches
        //    Clustered search returns server-side grouped properties; progressive loading would
        //    call standard search API and double-fetch properties incorrectly.
        const isSchoolCatchmentSearch = activeSpatialFilter === 'schoolCatchment';
        const isClusteredSearch = searchMode === 'clustered';
        const shouldLoadMore = !loading &&
            !searchPending &&
            hasMore &&
            properties.length > 0 &&
            properties.length < MAX_PROPERTIES_LIMIT &&
            initialSearchDispatched.current &&
            !isSchoolCatchmentSearch &&
            !isClusteredSearch;

        // Debug: Log current state for progressive loading (less verbose)
        if (shouldLoadMore) {
            console.log('[SmartSearch] Progressive load check - WILL TRIGGER:', {
                propertiesLength: properties.length,
                totalCount,
                maxLimit: MAX_PROPERTIES_LIMIT,
            });
        }

        // Phase 2.46 FIX: Log when progressive loading is skipped for catchment searches
        if (isSchoolCatchmentSearch && hasMore && !loading && !searchPending) {
            console.log('[SmartSearch] Progressive loading SKIPPED - school catchment filter active:', {
                propertiesLength: properties.length,
                totalCount,
                activeSpatialFilter,
                reason: 'Backend total_count is inaccurate for catchment-filtered searches',
            });
        }

        // Phase 2.56 FIX: Log when progressive loading is skipped for clustered searches
        if (isClusteredSearch && hasMore && !loading && !searchPending) {
            console.log('[SmartSearch] Progressive loading SKIPPED - clustered search mode active:', {
                propertiesLength: properties.length,
                totalCount,
                searchMode,
                reason: 'Clustered search returns server-side grouped properties; progressive loading not applicable',
            });
        }

        if (shouldLoadMore) {
            // Small delay to prevent rapid-fire requests and allow UI to render
            const loadMoreTimer = setTimeout(() => {
                console.log('[SmartSearch] Auto-progressive loading - DISPATCHING:', {
                    currentCount: properties.length,
                    totalAvailable: totalCount,
                    maxLimit: MAX_PROPERTIES_LIMIT,
                    timestamp: new Date().toISOString(),
                });
                dispatch(loadMoreProperties());
            }, 300);

            return () => clearTimeout(loadMoreTimer);
        }
    }, [properties.length, hasMore, searchPending, loading, totalCount, dispatch, activeSpatialFilter, searchMode]);

    // Feature 003: handleSearch function removed - SearchHeader manages its own address search

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                overflow: 'hidden'
            }}
        >
            {/* Phase 2.28: Redesigned two-tier header (TopNavigation + CompactFilterBar) */}
            <RedesignedSearchHeader />
            {/* Feature 003 old SearchHeader - kept as fallback if issues found */}
            {/* <SearchHeader /> */}

            {/* Phase 2.25: Removed Active Filters bar - FilterPills component removed */}

            {/* Phase 2.5.10: Error Alert for Search Failures - Hidden when no error */}
            <Box sx={{
              display: 'none',
              px: 1.5,
              pt: 1,
              // Show only when needed for errors
              '&[data-error]': {
                display: 'block'
              }
            }}>
                <SearchErrorAlert />
            </Box>

            {/* Content Area - Left Panel + Map/List */}
            <Box
                sx={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                }}
            >
                {/* Left Panel (Desktop Only) - Contains filters and property list */}
                {/* Phase 2.17.5 FIX: Dynamic width based on propertyPanelVisible state */}
                <Box
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexShrink: 0,
                        position: 'relative', // Allow absolute positioned children (collapse button)
                        overflow: 'visible',  // Prevent clipping during animation
                        width: propertyPanelVisible ? 350 : 0, // Dynamic width: 350px visible, 0px hidden
                        transition: 'width 300ms cubic-bezier(0.4, 0.0, 0.2, 1)', // Sync with LeftPanel animation
                    }}
                >
                    <LeftPanel
                        onPropertyClick={(property) => {
                            console.log('Property clicked:', property);
                            // Future: Open property detail modal
                        }}
                    />
                </Box>

                {/* CRITICAL FIX: Single MapView instance - conditionally rendered based on screen size
                    This prevents duplicate useBboxSchools hook instances that caused double API calls
                    Before: Both Desktop and Mobile MapView rendered (CSS hidden), both hooks running
                    After: Only ONE MapView instance rendered at a time */}

                {isDesktop ? (
                    // Desktop View - Map alongside left panel with research panel
                    <Box
                        sx={{
                            flex: 1,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <MapView mapRef={mapRef} />

                        {/* Phase 2.17.5 FIX: FloatingResultsButton now rendered inside FloatingMapControls */}
                        {/* Removed duplicate: <FloatingResultsButton /> */}

                        {/* Research Panel (Desktop) */}
                        <PanelContainer
                            onCenterSchool={handleCenterSchool}
                            onCenterAmenity={handleCenterAmenity}
                        />
                    </Box>
                ) : (
                    // Mobile View - Toggle between Map and List
                    <Box
                        sx={{
                            flex: 1,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {viewMode === 'map' ? (
                            <MapView mapRef={mapRef} />
                        ) : (
                            <LeftPanel
                                onPropertyClick={(property) => {
                                    console.log('Property clicked:', property);
                                    // Future: Open property detail modal
                                }}
                            />
                        )}

                        {/* Research Panel (Mobile Bottom Sheet) */}
                        <MobileBottomSheet />
                    </Box>
                )}
            </Box>

            {/* Phase 2.26 FIX: Conditional rendering - FilterDrawer on mobile, FilterDialog on desktop
                This prevents both components from rendering simultaneously on desktop */}
            {isMobile ? (
                <FilterDrawer />
            ) : (
                <FilterDialog />
            )}

            {/* Spatial Filter Conflict Dialog (Phase 2.5.9 Sprint 2) */}
            <SpatialFilterConflictDialog />

            {/* Toast Notifications Container */}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </Box>
    );
};

export default SmartSearchPage;
