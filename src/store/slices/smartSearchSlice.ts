import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { searchProperties, fetchSchools as fetchSchoolsService, fetchAmenities as fetchAmenitiesService } from '../../services/smartSearchService';
import type { SearchFilters } from '../../services/smartSearchService';
import type { BaseProperty } from '../../types/property-enhanced';
import { computeCatchmentUnion } from '../../utils/catchmentUnion';
import type * as GeoJSON from 'geojson';

// Use GeoJSON.Feature instead of @turf/helpers Feature
type Feature<G extends GeoJSON.Geometry = GeoJSON.Geometry, P = GeoJSON.GeoJsonProperties> = GeoJSON.Feature<G, P>;

// Phase 2.41: Property loading constants for progressive loading
// Initial load of 500, then auto-load 500 more batches until 2000 max
export const INITIAL_PROPERTY_LIMIT = 500;
export const LOAD_MORE_BATCH_SIZE = 500;
export const MAX_PROPERTIES_LIMIT = 2000;

export type PanelType = 'address' | 'amenities' | 'schools' | null;

export interface MapControlsState {
  activePanel: PanelType;
  panelWidth: number;
}

export interface FilterState {
  location: {
    state: string | null;
    suburb: string | null;
    postcode: string | null;
  };
  priceRange: {
    min: number | null;
    max: number | null;
  };
  bedrooms: {
    min: number | null;
    max: number | null;
  };
  bathrooms: {
    min: number | null;
  };
  parking: {
    min: number | null;
  };
  propertyTypes: string[]; // ['house', 'apartment', 'townhouse', 'unit', 'land', 'studio']
  listingType: 'sale' | 'rent' | null;
}

export interface MapCenter {
  lat: number;
  lon: number;
  zoom: number;
}

export type SortField =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'updated'
  | 'bedrooms_desc'
  | 'bedrooms_asc'
  | 'land_desc'
  | 'land_asc'
  | 'bathrooms_desc'
  | 'rent_asc'
  | 'rent_desc';

export interface BBoxBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface School {
  id: string;
  name: string;
  school_type: 'primary' | 'secondary' | 'infants' | string;
  latitude: number;
  longitude: number;
  has_catchment_boundary: boolean;
  catchment_boundary?: number[][][][]; // [[[[lng, lat], ...]]]
  metadata?: {
    school_metadata?: any;
    year_availability?: any;
  };
}

export interface SchoolsState {
  isLoading: boolean;
  error: string | null;
  data: School[];
  selectedSchoolIds: string[];
  selectedSchoolsCache: School[]; // BUG-04 FIX: Cache full school objects to persist across searches
  searchQuery: string;
  schoolTypeFilter: 'all' | 'primary' | 'secondary' | 'infants';
  // NEW FIELDS for catchment filtering
  catchmentFilterEnabled: boolean;
  catchmentUnion: Feature<GeoJSON.MultiPolygon> | null;
  catchmentComputeStatus: 'idle' | 'computing' | 'success' | 'error';
  catchmentComputeError: string | null;
  // Phase 2.12.1: Toggle controls for school panel
  showSchoolsOnMap: boolean;      // Controls marker visibility
  showCatchmentRadius: boolean;   // Controls polygon visibility
  // Phase 2.12.4: Selective school filter
  selectiveSchoolFilter: boolean; // Filter for selective/selective entrance schools
}

// Phase 2.32: Amenity interface and state
export interface Amenity {
  id: string;
  name: string;
  category: string;
  subtype: string | null;
  address: string | null;
  suburb: string | null;
  postcode: string | null;
  latitude: number;
  longitude: number;
  distance_km: number | null;
  description: string | null;
  data_source: string | null;
}

export interface AmenitiesState {
  isLoading: boolean;
  error: string | null;
  data: Amenity[];
  selectedAmenityId: string | null; // Phase 2.32.1: Single selection only
  selectedAmenity: Amenity | null; // Phase 2.32.1: Cache single amenity object
  searchQuery: string;
  categoryFilters: string[]; // ['hospitals', 'libraries', etc.]
  // Phase 2.32.6: Removed radiusKm - aligned with school markers bbox-only pattern
  showAmenitiesOnMap: boolean; // Controls marker visibility
}

export interface SmartSearchState {
  mapControls: MapControlsState;
  viewMode: 'map' | 'list';
  filters: FilterState;
  activeFilters: string[]; // For filter pills display ['location:NSW', 'price:500000-1000000']
  sortBy: SortField; // Sorting option
  properties: BaseProperty[];
  loading: boolean;
  error: string | null;
  // Phase 2.22: Concurrent request prevention
  searchPending: boolean; // Track if a search request is in-flight
  // NEW: Enhanced error handling (Phase 2.5.10)
  // Phase 2.22: Added 'SEARCH_IN_PROGRESS' for concurrent request prevention
  errorType: 'timeout' | 'network' | 'validation' | 'general' | 'SEARCH_IN_PROGRESS' | null;
  retryCount: number;
  totalCount: number;
  displayedCount: number; // How many properties currently shown
  paginationOffset: number; // Current offset for next batch
  filtersApplied: Record<string, any>;
  mapCenter: MapCenter | null;
  selectedAddress: string | null;
  mapBounds: BBoxBounds | null; // Current map viewport bounds
  searchBounds: BBoxBounds | null; // Bounds used for current search results
  manualMapMove: boolean; // Track if user manually moved map
  // NEW: Map state persistence (Phase 2.5.7)
  userDefinedMapArea: boolean; // Track if user manually panned/zoomed
  persistedMapCenter: { lat: number; lng: number } | null; // Persisted map center for filter applications
  persistedMapZoom: number; // Persisted zoom level for filter applications
  mapAreaType: 'none' | 'mapped' | 'drawn'; // Type of user-defined area
  // NEW: Draw mode state (Phase 2.5.8, enhanced Phase 2.7)
  drawMode: boolean; // True when user clicks pencil icon to enter draw mode
  drawnPolygons: Feature<GeoJSON.Polygon>[]; // Array of completed drawn polygons (Phase 2.7)
  drawnPolygonUnion: Feature<GeoJSON.MultiPolygon> | null; // Union of all drawn polygons for search (Phase 2.7)
  // NEW: School catchments state (Phase 2.5.9)
  schools: SchoolsState;
  // NEW: Amenities state (Phase 2.32)
  amenities: AmenitiesState;
  // NEW: Spatial filter priority tracking
  activeSpatialFilter: 'none' | 'bbox' | 'schoolCatchment' | 'drawnPolygon';
  // NEW: Spatial conflict dialog (Phase 2.5.9 Sprint 2)
  showSpatialConflictDialog: boolean;
  pendingBboxFilter: BBoxBounds | null;
  // NEW: Phase 2.8 - Auto-Search State
  autoSearchState: {
    countdown: null | number;      // null = inactive, number = milliseconds remaining (3000, 2000, 1000, 0)
    isActive: boolean;             // true = countdown timer running
    isSearchInitiated: boolean;    // Lock flag for infinite loop prevention
  };
  // NEW: Phase 2.8.1 - Auto-Refresh Toggle State
  autoRefreshEnabled: boolean;     // User control over auto-refresh behavior (default: true)
  // NEW: Phase 2.10.1 - Pagination State
  paginationState: {
    currentPage: number;              // 1-indexed, starts at 1
    itemsPerPage: 25;                 // Fixed constant
    visibleProperties: BaseProperty[]; // Filtered by map bounds
    totalVisibleCount: number;        // Length of visible properties
    totalPages: number;               // Math.ceil(totalVisibleCount / 25)
  };
  // NEW: Phase 2.17.1 - Collapsible Property Panel State
  propertyPanelVisible: boolean;      // Panel visibility toggle (default: true)
  filtersOverlayVisible: boolean;     // Filter drawer state (default: false)
  // NEW: Phase 2.38 - Suburb Boundaries Overlay
  showSuburbBoundaries: boolean;      // Toggle suburb boundary visualization on map (default: false)
}

const initialState: SmartSearchState = {
  mapControls: {
    activePanel: null,
    panelWidth: 350, // Desktop width
  },
  viewMode: 'map',
  filters: {
    location: {
      state: null,
      suburb: null,
      postcode: null,
    },
    priceRange: {
      min: null,
      max: null,
    },
    bedrooms: {
      min: null,
      max: null,
    },
    bathrooms: {
      min: null,
    },
    parking: {
      min: null,
    },
    propertyTypes: [],
    listingType: null,
  },
  activeFilters: [],
  sortBy: 'newest', // Default sort by newest
  properties: [],
  loading: false,
  error: null,
  // Phase 2.22: Concurrent request prevention
  searchPending: false, // Initially no pending request
  // NEW: Enhanced error handling defaults (Phase 2.5.10)
  errorType: null,
  retryCount: 0,
  totalCount: 0,
  displayedCount: 0,
  paginationOffset: 0,
  filtersApplied: {},
  mapCenter: null,
  selectedAddress: null,
  mapBounds: null,
  searchBounds: null,
  manualMapMove: false,
  // NEW: Map state persistence defaults
  // Phase 2.30 FIX: userDefinedMapArea ALWAYS true (mandatory bbox filtering, no user toggle)
  userDefinedMapArea: true,
  persistedMapCenter: null,
  persistedMapZoom: 12, // Default zoom level
  // Phase 2.30 FIX: mapAreaType ALWAYS 'mapped' (mandatory bbox filtering)
  mapAreaType: 'mapped',
  // NEW: Draw mode defaults (Phase 2.5.8, enhanced Phase 2.7)
  drawMode: false,
  drawnPolygons: [], // BUG-01 FIX: Ensure empty array, never undefined
  drawnPolygonUnion: null,
  // NEW: School catchments defaults (Phase 2.5.9)
  schools: {
    isLoading: false,
    error: null,
    data: [],
    selectedSchoolIds: [],
    selectedSchoolsCache: [], // BUG-04 FIX: Initialize cache as empty array
    searchQuery: '',
    schoolTypeFilter: 'all',
    catchmentFilterEnabled: false,
    catchmentUnion: null,
    catchmentComputeStatus: 'idle',
    catchmentComputeError: null,
    // Phase 2.12.1: Toggle controls defaults
    showSchoolsOnMap: true,
    showCatchmentRadius: false,
    // Phase 2.12.4: Selective school filter default
    selectiveSchoolFilter: false,
  },
  // NEW: Amenities defaults (Phase 2.32)
  amenities: {
    isLoading: false,
    error: null,
    data: [],
    selectedAmenityId: null, // Phase 2.32.1: Single selection
    selectedAmenity: null, // Phase 2.32.1: Single cached amenity
    searchQuery: '',
    categoryFilters: [], // No categories selected by default
    // Phase 2.32.6: Removed radiusKm - aligned with school markers bbox-only pattern
    showAmenitiesOnMap: true, // Show amenities by default
  },
  activeSpatialFilter: 'none',
  // NEW: Spatial conflict dialog defaults (Phase 2.5.9 Sprint 2)
  showSpatialConflictDialog: false,
  pendingBboxFilter: null,
  // NEW: Phase 2.8 - Auto-Search State
  autoSearchState: {
    countdown: null,
    isActive: false,
    isSearchInitiated: false,
  },
  // NEW: Phase 2.8.1 - Auto-Refresh Toggle State
  autoRefreshEnabled: typeof localStorage !== 'undefined'
    ? localStorage.getItem('smart-search-auto-refresh-enabled') !== 'false' // Default true
    : true,
  // NEW: Phase 2.10.1 - Pagination State
  paginationState: {
    currentPage: 1,
    itemsPerPage: 25 as const,
    visibleProperties: [],
    totalVisibleCount: 0,
    totalPages: 0,
  },
  // NEW: Phase 2.17.1 - Collapsible Property Panel State
  propertyPanelVisible: true,         // Default: panel open
  filtersOverlayVisible: false,       // Default: drawer closed
  // NEW: Phase 2.38 - Suburb Boundaries Overlay
  showSuburbBoundaries: false,        // Default: boundaries hidden
};

// Async thunk for performing property search
export const performSearch = createAsyncThunk(
  'smartSearch/performSearch',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any; // Use any to access multiple slices

    const filters = state.smartSearch.filters;
    const sortBy = state.smartSearch.sortBy;
    const { mapBounds, searchBounds, userDefinedMapArea, schools, activeSpatialFilter, drawnPolygonUnion } = state.smartSearch;

    // FIX: Phase 2.14 - Read selected schools from schoolPanel slice (correct location)
    const selectedSchools = state.schoolPanel?.selectedSchools || [];
    const showCatchmentRadius = schools.showCatchmentRadius;

    // Convert Redux filter state to API format
    const searchFilters: SearchFilters = {
      state: filters.location.state,
      suburb: filters.location.suburb,
      postcode: filters.location.postcode,
      price_min: filters.priceRange.min,
      price_max: filters.priceRange.max,
      bedrooms_min: filters.bedrooms.min,
      bedrooms_max: filters.bedrooms.max,
      bathrooms_min: filters.bathrooms.min,
      parking_min: filters.parking.min,
      property_type: filters.propertyTypes.length > 0 ? filters.propertyTypes : null,
      listing_type: filters.listingType,
      sort_by: sortBy,
      limit: INITIAL_PROPERTY_LIMIT,
      offset: 0,
    };

    // FIX: Phase 2.14 - School ID-based filtering from schoolPanel slice
    // Phase 2.17 FIX: Detect if schools have catchment boundaries to determine radius vs polygon mode
    // If schools are selected AND showCatchmentRadius toggle is ON, filter by school IDs
    if (selectedSchools.length > 0 && showCatchmentRadius) {
      searchFilters.school_ids = selectedSchools.map((s: any) => s.school_id);

      // Phase 2.17: Check if schools have catchment boundaries
      const schoolsWithBoundaries = selectedSchools.filter((s: any) => s.has_catchment_boundary);
      const hasAnyCatchmentBoundaries = schoolsWithBoundaries.length > 0;

      // If NO schools have catchment boundaries, use radius fallback (2-3km circles)
      // If ANY schools have boundaries, use polygon mode (backend will compute union)
      searchFilters.use_school_radius = !hasAnyCatchmentBoundaries;

      console.log('[SmartSearch] Using school ID-based filtering:', {
        schoolCount: selectedSchools.length,
        schoolIds: searchFilters.school_ids,
        withBoundaries: schoolsWithBoundaries.length,
        withoutBoundaries: selectedSchools.length - schoolsWithBoundaries.length,
        useRadius: searchFilters.use_school_radius,
        mode: searchFilters.use_school_radius ? 'RADIUS_FALLBACK (2-3km circles)' : 'POLYGON_MODE'
      });
    }

    // NEW: Spatial Filter Priority Hierarchy Enforcement (Phase 2.5.9, enhanced Phase 2.7)
    // Priority: drawnPolygon > schoolCatchment > bbox > none
    // DEFAULT: Always include mapBounds (current map viewport) unless "mapped area" filter was explicitly removed
    if (activeSpatialFilter === 'drawnPolygon' && drawnPolygonUnion) {
      // Drawn polygon takes highest priority (Phase 2.7)
      searchFilters.bbox = null;
      searchFilters.school_catchment_polygon = null;
      // Use drawn_polygon parameter (backend will treat same as school catchment polygon)
      searchFilters.drawn_polygon = drawnPolygonUnion.geometry;
      console.log('[SmartSearch] Using drawn polygon spatial filter:', {
        hasDrawnPolygon: !!searchFilters.drawn_polygon,
        polygonType: drawnPolygonUnion.geometry.type
      });
    } else if (activeSpatialFilter === 'schoolCatchment') {
      // Phase 2.17 FIX: School catchment can be EITHER polygon mode OR radius mode
      searchFilters.bbox = null;

      // Phase 2.24 FIX: Use use_school_radius flag instead of stale schools.catchmentUnion
      // The flag is already correctly set at line 311 based on CURRENT selected schools
      // using s.has_catchment_boundary, not on stale global state
      if (searchFilters.use_school_radius === false && schools.catchmentUnion) {
        // Polygon mode: Schools have official catchment boundaries AND use_school_radius=false
        // Extract geometry from Feature object for API
        searchFilters.school_catchment_polygon = schools.catchmentUnion.geometry;
        console.log('[SmartSearch] Using school catchment POLYGON spatial filter:', {
          hasCatchmentPolygon: !!searchFilters.school_catchment_polygon,
          polygonType: schools.catchmentUnion.geometry.type
        });
      } else {
        // Phase 2.17: Radius mode - Schools lack official boundaries, use radius fallback
        // Backend will use school_ids + use_school_radius=true to filter by 2-3km circles
        searchFilters.school_catchment_polygon = null;
        console.log('[SmartSearch] Using school catchment RADIUS spatial filter:', {
          schoolIds: searchFilters.school_ids,
          useRadius: searchFilters.use_school_radius,
          note: 'Backend will filter by 2-3km radius circles around schools'
        });
      }
    } else {
      // Phase 2.20 DEFAULT BEHAVIOR: Always include bbox (current map viewport) unless explicitly removed
      // Only clear bbox if user explicitly removed "mapped-area" filter (userDefinedMapArea=false)
      searchFilters.school_catchment_polygon = null;

      // Determine which bounds to use:
      // Priority: searchBounds (from last search) > mapBounds (current viewport)
      const boundsToUse = searchBounds || mapBounds;

      if (userDefinedMapArea === false) {
        // User explicitly removed "mapped area" filter - don't use bbox
        searchFilters.bbox = null;
        console.log('[SmartSearch] Bbox spatial filter explicitly cleared (mapped area removed)');
      } else if (boundsToUse) {
        // Default: Always include bbox (either from last search or current map viewport)
        searchFilters.bbox = boundsToUse;
        console.log('[SmartSearch] Using bbox spatial filter (default behavior):', boundsToUse);
      } else {
        // Initial state - no bounds yet
        searchFilters.bbox = null;
        console.log('[SmartSearch] No bbox available yet (initial load)');
      }
    }

    try {
      return await searchProperties(searchFilters);
    } catch (error: any) {
      console.error('[performSearch] Error caught:', error);

      // Detect error type for user-friendly handling
      let errorType: 'timeout' | 'network' | 'validation' | 'general' = 'general';
      let errorMessage = 'Search failed. Please try again.';

      // 504 Gateway Timeout
      if (error.response?.status === 504) {
        errorType = 'timeout';
        errorMessage = 'Search took too long. Try narrowing your filters (property type, bedrooms, price range).';
      }
      // 400 Validation Error
      else if (error.response?.status === 400) {
        errorType = 'validation';
        errorMessage = error.response.data.detail || 'Please select a location filter before sorting properties.';
      }
      // PostgreSQL statement timeout (error code 57014)
      else if (error.message?.includes('statement timeout') || error.message?.includes('57014')) {
        errorType = 'timeout';
        errorMessage = 'Database timeout. This usually happens with very popular suburbs. Try adding more filters.';
      }
      // Network errors (fetch failed, connection refused, etc.)
      else if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
        errorType = 'network';
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      return rejectWithValue({ type: errorType, message: errorMessage });
    }
  },
  {
    // Phase 2.22 FIX: Move guard check to condition function (runs BEFORE pending reducer)
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.smartSearch.searchPending) {
        console.log('[performSearch] Guard: Search already in progress, rejecting request');
        return false; // Return false to prevent execution and avoid pending/fulfilled/rejected
      }
      return true; // Allow execution
    },
  }
);

// Async thunk for searching by map bounds
export const searchByBounds = createAsyncThunk(
  'smartSearch/searchByBounds',
  async (bounds: BBoxBounds, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any; // Use any to access multiple slices

    const filters = state.smartSearch.filters;
    const sortBy = state.smartSearch.sortBy;
    const { activeSpatialFilter, schools } = state.smartSearch;

    // FIX: Phase 2.14 - Read selected schools from schoolPanel slice (correct location)
    const selectedSchools = state.schoolPanel?.selectedSchools || [];
    const showCatchmentRadius = schools.showCatchmentRadius;

    // NEW: Phase 2.8 - Set lock flag BEFORE API call
    dispatch(setAutoSearchInitiated(true));

    // NEW: Conflict detection - Check if school catchment is active (Phase 2.5.9 Sprint 2)
    if (activeSpatialFilter === 'schoolCatchment') {
      // Clear lock flag before returning
      dispatch(setAutoSearchInitiated(false));
      // Return special conflict state instead of performing search
      return rejectWithValue({
        type: 'SPATIAL_CONFLICT',
        pendingBounds: bounds,
        message: 'School catchment filter is active. Please resolve conflict.'
      });
    }

    // Convert Redux filter state to API format + bbox
    const searchFilters: SearchFilters = {
      state: filters.location.state,
      suburb: filters.location.suburb,
      postcode: filters.location.postcode,
      price_min: filters.priceRange.min,
      price_max: filters.priceRange.max,
      bedrooms_min: filters.bedrooms.min,
      bedrooms_max: filters.bedrooms.max,
      bathrooms_min: filters.bathrooms.min,
      parking_min: filters.parking.min,
      property_type: filters.propertyTypes.length > 0 ? filters.propertyTypes : null,
      listing_type: filters.listingType,
      sort_by: sortBy,
      limit: INITIAL_PROPERTY_LIMIT,
      offset: 0,
      // Add bbox filter
      bbox: bounds,
    };

    // FIX: Phase 2.14 - School ID-based filtering from schoolPanel slice
    // Phase 2.17 FIX: Detect if schools have catchment boundaries to determine radius vs polygon mode
    // If schools are selected AND showCatchmentRadius toggle is ON, preserve school filters
    if (selectedSchools.length > 0 && showCatchmentRadius) {
      searchFilters.school_ids = selectedSchools.map((s: any) => s.school_id);

      // Phase 2.17: Check if schools have catchment boundaries
      const schoolsWithBoundaries = selectedSchools.filter((s: any) => s.has_catchment_boundary);
      searchFilters.use_school_radius = schoolsWithBoundaries.length === 0;

      console.log('[SearchByBounds] Preserving school ID-based filtering:', {
        schoolCount: selectedSchools.length,
        schoolIds: searchFilters.school_ids,
        withBoundaries: schoolsWithBoundaries.length,
        useRadius: searchFilters.use_school_radius,
        mode: searchFilters.use_school_radius ? 'RADIUS_FALLBACK' : 'POLYGON_MODE'
      });
    }

    try {
      const result = await searchProperties(searchFilters);
      // NEW: Phase 2.8 - Clear lock flag AFTER successful API call
      dispatch(setAutoSearchInitiated(false));
      return result;
    } catch (error: any) {
      // NEW: Phase 2.8 - Clear lock flag AFTER failed API call
      dispatch(setAutoSearchInitiated(false));
      // Handle 400 error (validation error from backend)
      if (error.response?.status === 400) {
        return rejectWithValue(error.response.data.detail || 'Failed to search this area.');
      }
      // Handle other errors
      throw error;
    }
  },
  {
    // Phase 2.22 FIX: Move guard check to condition function (runs BEFORE pending reducer)
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.smartSearch.searchPending) {
        console.log('[searchByBounds] Guard: Search already in progress, rejecting request');
        return false;
      }
      return true;
    },
  }
);

// Async thunk for loading more properties (pagination)
export const loadMoreProperties = createAsyncThunk(
  'smartSearch/loadMoreProperties',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any; // Use any to access multiple slices

    const { filters, sortBy, paginationOffset, displayedCount, totalCount, mapBounds, userDefinedMapArea, schools, activeSpatialFilter, drawnPolygonUnion, searchPending } = state.smartSearch;

    // FIX: Phase 2.14 - Read selected schools from schoolPanel slice (correct location)
    const selectedSchools = state.schoolPanel?.selectedSchools || [];
    const showCatchmentRadius = schools.showCatchmentRadius;

    // Phase 2.41 FIX: Don't load if search is pending (filters changed, data is stale)
    if (searchPending) {
      console.log('[loadMoreProperties] Guard: Search pending, rejecting to prevent stale offset');
      return rejectWithValue('Search pending');
    }

    // Phase 2.41 FIX: Don't load if offset exceeds totalCount (stale data from previous search)
    if (paginationOffset >= totalCount && totalCount > 0) {
      console.log('[loadMoreProperties] Guard: Offset exceeds totalCount, rejecting stale request', {
        paginationOffset,
        totalCount,
      });
      return rejectWithValue('Offset exceeds total count');
    }

    // Phase 2.41: Don't load if at max limit (2000)
    if (displayedCount >= MAX_PROPERTIES_LIMIT) {
      return rejectWithValue('Maximum limit reached');
    }

    // Convert Redux filter state to API format
    const searchFilters: SearchFilters = {
      state: filters.location.state,
      suburb: filters.location.suburb,
      postcode: filters.location.postcode,
      price_min: filters.priceRange.min,
      price_max: filters.priceRange.max,
      bedrooms_min: filters.bedrooms.min,
      bedrooms_max: filters.bedrooms.max,
      bathrooms_min: filters.bathrooms.min,
      parking_min: filters.parking.min,
      property_type: filters.propertyTypes.length > 0 ? filters.propertyTypes : null,
      listing_type: filters.listingType,
      sort_by: sortBy, // Include sort order in Show More requests
      limit: LOAD_MORE_BATCH_SIZE, // Phase 2.41: Load next 500
      offset: paginationOffset,
    };

    // FIX: Phase 2.14 - School ID-based filtering from schoolPanel slice
    // Phase 2.17 FIX: Detect if schools have catchment boundaries to determine radius vs polygon mode
    // If schools are selected AND showCatchmentRadius toggle is ON, preserve school filters
    if (selectedSchools.length > 0 && showCatchmentRadius) {
      searchFilters.school_ids = selectedSchools.map((s: any) => s.school_id);

      // Phase 2.17: Check if schools have catchment boundaries
      const schoolsWithBoundaries = selectedSchools.filter((s: any) => s.has_catchment_boundary);
      searchFilters.use_school_radius = schoolsWithBoundaries.length === 0;

      console.log('[LoadMore] Preserving school ID-based filtering:', {
        schoolCount: selectedSchools.length,
        schoolIds: searchFilters.school_ids,
        withBoundaries: schoolsWithBoundaries.length,
        useRadius: searchFilters.use_school_radius,
        mode: searchFilters.use_school_radius ? 'RADIUS_FALLBACK' : 'POLYGON_MODE'
      });
    }

    // Spatial Filter Priority Hierarchy (Phase 2.7 + BUG-SHOW-MORE-SPATIAL fix)
    // Priority: drawnPolygon > schoolCatchment > bbox > none
    // BUG FIX: Always include bbox when mapBounds exists (unless higher priority filter active)
    if (activeSpatialFilter === 'drawnPolygon' && drawnPolygonUnion) {
      // Drawn polygon takes highest priority (Phase 2.7)
      searchFilters.bbox = null;
      searchFilters.school_catchment_polygon = null;
      searchFilters.drawn_polygon = drawnPolygonUnion.geometry;
      console.log('[LoadMore] Using drawn polygon spatial filter:', {
        hasDrawnPolygon: !!searchFilters.drawn_polygon,
        polygonType: drawnPolygonUnion.geometry.type
      });
    } else if (activeSpatialFilter === 'schoolCatchment') {
      // Phase 2.17 FIX: School catchment can be EITHER polygon mode OR radius mode
      searchFilters.bbox = null;

      // Phase 2.24 FIX: Use use_school_radius flag instead of stale schools.catchmentUnion
      // The flag is already correctly set based on CURRENT selected schools
      if (searchFilters.use_school_radius === false && schools.catchmentUnion) {
        // Polygon mode: Schools have official catchment boundaries AND use_school_radius=false
        searchFilters.school_catchment_polygon = schools.catchmentUnion.geometry;
        console.log('[LoadMore] Using school catchment POLYGON spatial filter:', {
          hasCatchmentPolygon: !!searchFilters.school_catchment_polygon,
          polygonType: schools.catchmentUnion.geometry.type
        });
      } else {
        // Phase 2.17: Radius mode - Schools lack official boundaries, use radius fallback
        searchFilters.school_catchment_polygon = null;
        console.log('[LoadMore] Using school catchment RADIUS spatial filter:', {
          schoolIds: searchFilters.school_ids,
          useRadius: searchFilters.use_school_radius,
          note: 'Backend will filter by 2-3km radius circles'
        });
      }
    } else if (mapBounds) {
      // BUG FIX: Always include bbox when map is visible (removed activeSpatialFilter check)
      // This ensures Show More respects current viewport even after filtered searches
      searchFilters.bbox = mapBounds;
      searchFilters.school_catchment_polygon = null;
      console.log('[LoadMore] Using current map viewport bbox:', mapBounds);
    } else {
      // No spatial filter active and no map bounds available
      searchFilters.bbox = null;
      searchFilters.school_catchment_polygon = null;
      console.log('[LoadMore] No spatial filter active - no map bounds');
    }

    try {
      return await searchProperties(searchFilters);
    } catch (error: any) {
      // Handle 400 error (validation error from backend)
      if (error.response?.status === 400) {
        return rejectWithValue(error.response.data.detail || 'Failed to load more properties.');
      }
      // Handle other errors
      throw error;
    }
  },
  {
    // Phase 2.22 FIX: Move guard check to condition function (runs BEFORE pending reducer)
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.smartSearch.searchPending) {
        console.log('[loadMoreProperties] Guard: Search already in progress, rejecting request');
        return false;
      }
      return true;
    },
  }
);

// Async thunk for fetching schools (Phase 2.5.9)
export const fetchSchools = createAsyncThunk(
  'smartSearch/fetchSchools',
  async (overrideQuery: string | undefined, { getState, rejectWithValue }) => {
    const state = getState() as { smartSearch: SmartSearchState };
    const { searchQuery, schoolTypeFilter } = state.smartSearch.schools;
    const { mapBounds } = state.smartSearch;

    // Build filters
    const filters: any = {
      limit: 100,
    };

    // Use override query if provided, otherwise use state query
    const effectiveQuery = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (effectiveQuery) {
      filters.search_query = effectiveQuery;
    }

    if (schoolTypeFilter && schoolTypeFilter !== 'all') {
      filters.school_type = schoolTypeFilter;
    }

    // BUG FIX: Don't apply bbox when user has entered a text search query
    // Text search should be global, not limited to current viewport
    // Only apply bbox for browsing (no search query)
    if (mapBounds && !effectiveQuery) {
      filters.bbox = `${mapBounds.west},${mapBounds.south},${mapBounds.east},${mapBounds.north}`;
    }

    try {
      return await fetchSchoolsService(filters);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch schools');
    }
  }
);

// Async thunk for fetching amenities (Phase 2.32.6 - bbox-only pattern)
export const fetchAmenities = createAsyncThunk(
  'smartSearch/fetchAmenities',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { smartSearch: SmartSearchState };
    const { searchQuery, categoryFilters } = state.smartSearch.amenities;
    // Phase 2.32.6: Removed radiusKm - aligned with school markers bbox-only pattern
    const { mapBounds } = state.smartSearch;

    // Build filters
    const filters: any = {
      limit: 100,
    };

    // Add search query if provided
    if (searchQuery) {
      filters.search_query = searchQuery;
    }

    // Add category filters if provided
    if (categoryFilters && categoryFilters.length > 0) {
      filters.categories = categoryFilters;
    }

    // BUG FIX: Don't apply bbox when user has entered a text search query
    // Text search should be global, not limited to current viewport
    // Only apply bbox for browsing (no search query)
    if (mapBounds && !searchQuery) {
      filters.bbox = `${mapBounds.north},${mapBounds.south},${mapBounds.east},${mapBounds.west}`;
    }

    // Phase 2.32.6: Removed radius/center parameter logic - bbox-only pattern like schools

    try {
      return await fetchAmenitiesService(filters);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch amenities');
    }
  }
);

// Async thunk for computing school catchment union (Phase 2.5.9 Sprint 1)
// Phase 2.14 FIX: Read from schoolPanel slice (new architecture)
export const computeSchoolCatchmentUnion = createAsyncThunk(
  'smartSearch/computeSchoolCatchmentUnion',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any; // Use any to access multiple slices

    console.log('=== CATCHMENT UNION DEBUG START ===');

    // Phase 2.14 FIX: Read selected schools from schoolPanel slice (correct location)
    const selectedSchools = state.schoolPanel?.selectedSchools || [];
    console.log('[CatchmentUnion] Total selected schools from schoolPanel:', selectedSchools.length);
    console.log('[CatchmentUnion] Selected school IDs:', selectedSchools.map((s: any) => s.school_id));

    const selectedWithCatchments = selectedSchools
      .filter((s: any) => s.catchment_boundary)
      .map((s: any, index: number) => {
        console.log(`[CatchmentUnion] Processing school ${index + 1}:`, s.school_name);
        console.log('[CatchmentUnion] Has catchment_boundary:', !!s.catchment_boundary);

        let coords: any = s.catchment_boundary!;
        console.log('[CatchmentUnion] Raw catchment_boundary structure:', {
          isArray: Array.isArray(coords),
          length: coords?.length,
          firstElementType: Array.isArray(coords?.[0]) ? 'array' : typeof coords?.[0],
          level2Length: coords?.length > 0 && Array.isArray(coords[0]) ? coords[0].length : 'N/A',
          level3Length: coords?.[0]?.length > 0 && Array.isArray(coords[0][0]) ? coords[0][0].length : 'N/A',
          level4Check: coords?.[0]?.[0]?.length > 0 && Array.isArray(coords[0][0][0]) ? 'IS_4_LEVEL' : 'NOT_4_LEVEL',
          sampleCoord: coords?.[0]?.[0]?.[0]
        });

        // Defensive unwrapping: Handle both 3-level and 4-level nesting
        // Check if we have a 4-level array by inspecting the structure
        if (coords.length > 0 && Array.isArray(coords[0][0][0])) {
          console.log('[CatchmentUnion] Unwrapping from 4-level to 3-level');
          coords = coords[0];  // Unwrap 4-level to 3-level
        }

        console.log('[CatchmentUnion] Final coordinates for GeoJSON:', {
          length: coords.length,
          firstRingLength: coords[0]?.length,
          samplePoint: coords[0]?.[0]
        });

        const geojson: GeoJSON.Polygon = {
          type: 'Polygon' as const,
          coordinates: coords as GeoJSON.Position[][]  // Type assertion for GeoJSON compatibility
        };

        console.log('[CatchmentUnion] Created GeoJSON polygon for:', s.school_name);
        return geojson;
      });

    console.log('[CatchmentUnion] Total schools with catchment data:', selectedWithCatchments.length);

    if (selectedWithCatchments.length === 0) {
      console.log('[CatchmentUnion] ERROR: No selected schools have catchment data');
      return rejectWithValue('No selected schools have catchment data');
    }

    try {
      console.log('[CatchmentUnion] Calling computeCatchmentUnion with', selectedWithCatchments.length, 'polygons');
      const unionResult = computeCatchmentUnion(selectedWithCatchments);

      if (!unionResult) {
        console.log('[CatchmentUnion] ERROR: computeCatchmentUnion returned null');
        return rejectWithValue('Failed to compute catchment union');
      }

      console.log('[CatchmentUnion] SUCCESS: Union computed:', {
        type: unionResult.geometry.type,
        coordsLength: unionResult.geometry.coordinates?.length
      });
      console.log('=== CATCHMENT UNION DEBUG END ===');

      return unionResult;
    } catch (error: any) {
      console.error('[CatchmentUnion] ERROR during union computation:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      console.log('=== CATCHMENT UNION DEBUG END ===');
      return rejectWithValue(error.message || 'Union computation failed');
    }
  }
);

// Async thunk for computing drawn polygon union (Phase 2.7)
export const computeDrawnPolygonUnion = createAsyncThunk(
  'smartSearch/computeDrawnPolygonUnion',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { smartSearch: SmartSearchState };
    const { drawnPolygons } = state.smartSearch;

    console.log('[DrawnPolygonUnion] Computing union for', drawnPolygons.length, 'polygons');

    if (drawnPolygons.length === 0) {
      console.log('[DrawnPolygonUnion] ERROR: No drawn polygons to compute union');
      return rejectWithValue('No drawn polygons');
    }

    try {
      // Convert drawn polygons to format compatible with computeCatchmentUnion
      const polygonGeometries = drawnPolygons.map((feature) => feature.geometry);

      console.log('[DrawnPolygonUnion] Calling computeCatchmentUnion with', polygonGeometries.length, 'polygon geometries');
      const unionResult = computeCatchmentUnion(polygonGeometries);

      if (!unionResult) {
        console.log('[DrawnPolygonUnion] ERROR: computeCatchmentUnion returned null');
        return rejectWithValue('Failed to compute polygon union');
      }

      console.log('[DrawnPolygonUnion] SUCCESS: Union computed:', {
        type: unionResult.geometry.type,
        coordsLength: unionResult.geometry.coordinates?.length
      });

      return unionResult;
    } catch (error: any) {
      console.error('[DrawnPolygonUnion] ERROR during union computation:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return rejectWithValue(error.message || 'Union computation failed');
    }
  }
);

// Helper function to calculate visible properties within map bounds (Phase 2.10.1)
export const getVisibleProperties = (
  properties: BaseProperty[],
  mapBounds: BBoxBounds | null
): BaseProperty[] => {
  if (!mapBounds || !properties || properties.length === 0) {
    return [];
  }

  return properties.filter(prop => {
    const lat = prop.latitude;
    const lng = prop.longitude;

    // Skip properties without coordinates
    if (lat === undefined || lat === null || lng === undefined || lng === null) {
      return false;
    }

    // Check if property coordinates are within map bounds
    return (
      lat >= mapBounds.south &&
      lat <= mapBounds.north &&
      lng >= mapBounds.west &&
      lng <= mapBounds.east
    );
  });
};

// Helper function to update active filters array
const updateActiveFilters = (state: SmartSearchState) => {
  const filters: string[] = [];

  // Location filters
  if (state.filters.location.state) {
    filters.push(`location:${state.filters.location.state}${state.filters.location.suburb ? `, ${state.filters.location.suburb}` : ''}`);
  }

  // Postcode filter (separate from location)
  if (state.filters.location.postcode) {
    filters.push(`postcode:${state.filters.location.postcode}`);
  }

  // Price range filters
  if (state.filters.priceRange.min || state.filters.priceRange.max) {
    const minStr = state.filters.priceRange.min ? `$${(state.filters.priceRange.min / 1000).toFixed(0)}K` : 'Any';
    const maxStr = state.filters.priceRange.max ? `$${(state.filters.priceRange.max / 1000).toFixed(0)}K` : 'Any';
    filters.push(`price:${minStr}-${maxStr}`);
  }

  // Bedrooms filters
  if (state.filters.bedrooms.min || state.filters.bedrooms.max) {
    const minStr = state.filters.bedrooms.min || 'Any';
    const maxStr = state.filters.bedrooms.max || 'Any';
    filters.push(`bedrooms:${minStr}-${maxStr}`);
  }

  // Bathrooms filter
  if (state.filters.bathrooms.min) {
    filters.push(`bathrooms:${state.filters.bathrooms.min}+`);
  }

  // Parking filter
  if (state.filters.parking.min) {
    filters.push(`parking:${state.filters.parking.min}+`);
  }

  // Property types
  if (state.filters.propertyTypes.length > 0) {
    filters.push(`type:${state.filters.propertyTypes.join(', ')}`);
  }

  // Listing type
  if (state.filters.listingType) {
    filters.push(`listing:${state.filters.listingType}`);
  }

  // NEW: Mapped area filter (Phase 2.5.7)
  if (state.userDefinedMapArea && state.mapAreaType === 'mapped') {
    filters.push('mapped-area');
  }

  // Future: Drawn area filter (Phase 2.6)
  if (state.userDefinedMapArea && state.mapAreaType === 'drawn') {
    filters.push('drawn-area');
  }

  state.activeFilters = filters;
};

const smartSearchSlice = createSlice({
  name: 'smartSearch',
  initialState,
  reducers: {
    setActivePanel: (state, action: PayloadAction<PanelType>) => {
      state.mapControls.activePanel = action.payload;
    },
    togglePanel: (state, action: PayloadAction<PanelType>) => {
      // If clicking the same panel, close it; otherwise open the new panel
      if (state.mapControls.activePanel === action.payload) {
        state.mapControls.activePanel = null;
      } else {
        state.mapControls.activePanel = action.payload;
      }
    },
    closePanel: (state) => {
      state.mapControls.activePanel = null;
    },
    setViewMode: (state, action: PayloadAction<'map' | 'list'>) => {
      state.viewMode = action.payload;
    },
    // Sorting action
    setSortBy: (state, action: PayloadAction<SortField>) => {
      state.sortBy = action.payload;
    },
    // Filter actions
    setLocationFilter: (state, action: PayloadAction<{ state?: string | null; suburb?: string | null; postcode?: string | null }>) => {
      if (action.payload.state !== undefined) {
        state.filters.location.state = action.payload.state;
      }
      if (action.payload.suburb !== undefined) {
        state.filters.location.suburb = action.payload.suburb;
      }
      if (action.payload.postcode !== undefined) {
        state.filters.location.postcode = action.payload.postcode;
      }
      updateActiveFilters(state);
    },
    setPriceRangeFilter: (state, action: PayloadAction<{ min?: number | null; max?: number | null }>) => {
      if (action.payload.min !== undefined) {
        state.filters.priceRange.min = action.payload.min;
      }
      if (action.payload.max !== undefined) {
        state.filters.priceRange.max = action.payload.max;
      }
      updateActiveFilters(state);
    },
    setBedroomsFilter: (state, action: PayloadAction<{ min?: number | null; max?: number | null }>) => {
      if (action.payload.min !== undefined) {
        state.filters.bedrooms.min = action.payload.min;
      }
      if (action.payload.max !== undefined) {
        state.filters.bedrooms.max = action.payload.max;
      }
      updateActiveFilters(state);
    },
    setBathroomsFilter: (state, action: PayloadAction<number | null>) => {
      state.filters.bathrooms.min = action.payload;
      updateActiveFilters(state);
    },
    setParkingFilter: (state, action: PayloadAction<number | null>) => {
      state.filters.parking.min = action.payload;
      updateActiveFilters(state);
    },
    setPropertyTypesFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.propertyTypes = action.payload;
      updateActiveFilters(state);
    },
    setListingTypeFilter: (state, action: PayloadAction<'sale' | 'rent' | null>) => {
      state.filters.listingType = action.payload;
      updateActiveFilters(state);
    },
    clearFilter: (state, action: PayloadAction<keyof FilterState>) => {
      const filterType = action.payload;
      switch (filterType) {
        case 'location':
          state.filters.location = { state: null, suburb: null, postcode: null };
          break;
        case 'priceRange':
          state.filters.priceRange = { min: null, max: null };
          break;
        case 'bedrooms':
          state.filters.bedrooms = { min: null, max: null };
          break;
        case 'bathrooms':
          state.filters.bathrooms = { min: null };
          break;
        case 'parking':
          state.filters.parking = { min: null };
          break;
        case 'propertyTypes':
          state.filters.propertyTypes = [];
          break;
        case 'listingType':
          state.filters.listingType = null;
          break;
      }
      updateActiveFilters(state);
    },
    clearAllFilters: (state) => {
      state.filters = {
        location: { state: null, suburb: null, postcode: null },
        priceRange: { min: null, max: null },
        bedrooms: { min: null, max: null },
        bathrooms: { min: null },
        parking: { min: null },
        propertyTypes: [],
        listingType: null,
      };
      state.activeFilters = [];
    },
    // Map centering actions
    centerMapAtLocation: (state, action: PayloadAction<{ lat: number; lon: number; zoom: number; address: string }>) => {
      state.mapCenter = {
        lat: action.payload.lat,
        lon: action.payload.lon,
        zoom: action.payload.zoom,
      };
      state.selectedAddress = action.payload.address;
    },
    clearMapCenter: (state) => {
      state.mapCenter = null;
      state.selectedAddress = null;
    },
    // Map bounds actions
    setMapBounds: (state, action: PayloadAction<BBoxBounds>) => {
      state.mapBounds = action.payload;
      // Phase 2.10.1: Recalculate visible properties when map bounds change
      const visible = getVisibleProperties(state.properties, state.mapBounds);
      state.paginationState.visibleProperties = visible;
      state.paginationState.totalVisibleCount = visible.length;
      state.paginationState.totalPages = Math.ceil(
        visible.length / state.paginationState.itemsPerPage
      );
      // Reset to page 1 if current page is now invalid
      if (state.paginationState.currentPage > state.paginationState.totalPages && state.paginationState.totalPages > 0) {
        state.paginationState.currentPage = 1;
      }
    },
    setManualMapMove: (state, action: PayloadAction<boolean>) => {
      state.manualMapMove = action.payload;
    },
    clearManualMapMove: (state) => {
      state.manualMapMove = false;
    },
    // NEW: Map state persistence actions (Phase 2.5.7)
    setMapPosition: (state, action: PayloadAction<{ center: { lat: number; lng: number }; zoom: number }>) => {
      state.persistedMapCenter = action.payload.center;
      state.persistedMapZoom = action.payload.zoom;
      // Only set userDefinedMapArea if user actually moved map (not initial load)
      // We check if persistedMapCenter was previously set
      if (state.persistedMapCenter !== null) {
        state.userDefinedMapArea = true;
        state.mapAreaType = 'mapped';
        updateActiveFilters(state);
      }
    },
    // Phase 2.30 FIX: clearMappedArea deprecated - bbox filtering is now mandatory
    clearMappedArea: (state) => {
      // NO-OP: userDefinedMapArea is always true in Phase 2.30 (mandatory bbox)
      console.warn('[smartSearchSlice.clearMappedArea] DEPRECATED - Bbox filtering is mandatory in Phase 2.30');
    },
    // Phase 2.30 FIX: setMapAreaType deprecated - bbox filtering is always 'mapped'
    setMapAreaType: (state, action: PayloadAction<'none' | 'mapped' | 'drawn'>) => {
      // NO-OP: mapAreaType is always 'mapped' in Phase 2.30 (mandatory bbox)
      console.warn('[smartSearchSlice.setMapAreaType] DEPRECATED - Bbox filtering is mandatory in Phase 2.30');
    },
    // NEW: Draw mode actions (Phase 2.5.8, enhanced Phase 2.7)
    setDrawMode: (state, action: PayloadAction<boolean>) => {
      state.drawMode = action.payload;

      // When entering draw mode, auto-disable other spatial filters (Phase 2.7 priority hierarchy)
      if (action.payload) {
        // Clear school catchment if active
        if (state.activeSpatialFilter === 'schoolCatchment') {
          state.schools.catchmentFilterEnabled = false;
          state.schools.catchmentUnion = null;
          console.log('[SmartSearch] Draw mode enabled - cleared school catchment filter');
        }
        // Clear bbox if active
        if (state.activeSpatialFilter === 'bbox') {
          state.searchBounds = null;
          state.userDefinedMapArea = false;
          state.mapAreaType = 'none';
          console.log('[SmartSearch] Draw mode enabled - cleared bbox filter');
        }
      }
    },
    addDrawnPolygon: (state, action: PayloadAction<Feature<GeoJSON.Polygon>>) => {
      // BUG-01 FIX Option B: Safety - ensure drawnPolygons array exists (handles Redux Persist hydration edge case)
      if (!state.drawnPolygons || !Array.isArray(state.drawnPolygons)) {
        console.warn('[BUG-01 FIX] drawnPolygons was undefined or not array, reinitializing');
        state.drawnPolygons = [];
      }
      state.drawnPolygons.push(action.payload);
      // Set map area type to drawn when polygons are added
      if (state.drawnPolygons.length > 0) {
        state.mapAreaType = 'drawn';
        state.userDefinedMapArea = true;
        state.activeSpatialFilter = 'drawnPolygon'; // Set highest priority spatial filter
        updateActiveFilters(state);
        console.log('[SmartSearch] Added drawn polygon, total:', state.drawnPolygons.length);
      }
    },
    clearDrawnPolygons: (state) => {
      state.drawnPolygons = [];
      state.drawnPolygonUnion = null;
      state.drawMode = false;
      // Reset map area type if it was drawn
      if (state.mapAreaType === 'drawn') {
        state.mapAreaType = 'none';
        state.userDefinedMapArea = false;
        state.activeSpatialFilter = 'none'; // Clear spatial filter priority
        updateActiveFilters(state);
        console.log('[SmartSearch] Cleared all drawn polygons');
      }
    },
    // NEW: School catchments actions (Phase 2.5.9)
    // BUG-04 FIX: Modified to cache full school object
    toggleSchoolSelection: (state, action: PayloadAction<string>) => {
      const schoolId = action.payload;
      const index = state.schools.selectedSchoolIds.indexOf(schoolId);

      if (index > -1) {
        // Deselecting: Remove from both IDs array and cache
        state.schools.selectedSchoolIds.splice(index, 1);
        state.schools.selectedSchoolsCache = state.schools.selectedSchoolsCache.filter(
          s => s.id !== schoolId
        );
      } else {
        // Selecting: Add to IDs array and cache full object
        state.schools.selectedSchoolIds.push(schoolId);

        // Find the school object from current data
        const school = state.schools.data.find(s => s.id === schoolId);
        if (school) {
          state.schools.selectedSchoolsCache.push(school);
        }
      }
    },
    clearSchoolSelection: (state) => {
      // BUG-04 FIX: Clear both IDs array and cache
      state.schools.selectedSchoolIds = [];
      state.schools.selectedSchoolsCache = [];
    },
    setSchoolSearchQuery: (state, action: PayloadAction<string>) => {
      state.schools.searchQuery = action.payload;
    },
    setSchoolTypeFilter: (state, action: PayloadAction<'all' | 'primary' | 'secondary' | 'infants'>) => {
      state.schools.schoolTypeFilter = action.payload;
    },
    setCatchmentFilterEnabled: (state, action: PayloadAction<boolean>) => {
      state.schools.catchmentFilterEnabled = action.payload;

      // Auto-resolution: When catchment is enabled, clear bbox and set active spatial filter
      if (action.payload && state.schools.catchmentUnion) {
        // Clear bbox if present
        if (state.searchBounds) {
          state.searchBounds = null;
          state.userDefinedMapArea = false;
          state.mapAreaType = 'none';
          updateActiveFilters(state);
          console.log('[SmartSearch] School catchment enabled - cleared bbox filter');
        }
        // Set active spatial filter
        state.activeSpatialFilter = 'schoolCatchment';
      } else if (!action.payload) {
        // When catchment is disabled, clear active spatial filter
        if (state.activeSpatialFilter === 'schoolCatchment') {
          state.activeSpatialFilter = 'none';
        }
      }
    },
    setActiveSpatialFilter: (state, action: PayloadAction<'none' | 'bbox' | 'schoolCatchment' | 'drawnPolygon'>) => {
      state.activeSpatialFilter = action.payload;
    },
    // NEW: Spatial conflict resolution action (Phase 2.5.9 Sprint 2)
    resolveSpatialConflict: (state, action: PayloadAction<'keepCatchment' | 'switchToBbox'>) => {
      const choice = action.payload;

      if (choice === 'keepCatchment') {
        // Keep catchment, discard pending bbox
        state.pendingBboxFilter = null;
        state.showSpatialConflictDialog = false;
        console.log('[SmartSearch] Conflict resolved - keeping school catchment filter');
      } else if (choice === 'switchToBbox') {
        // Switch to bbox, clear catchment
        if (state.pendingBboxFilter) {
          // Apply pending bbox
          state.searchBounds = state.pendingBboxFilter;
          state.userDefinedMapArea = true;
          state.mapAreaType = 'mapped';
          updateActiveFilters(state);

          // Clear catchment
          state.schools.catchmentFilterEnabled = false;
          state.schools.catchmentUnion = null;
          state.activeSpatialFilter = 'bbox';

          // Clear pending state
          state.pendingBboxFilter = null;
          state.showSpatialConflictDialog = false;

          console.log('[SmartSearch] Conflict resolved - switched to bbox filter');
        }
      }
    },
    clearActiveSpatialFilter: (state) => {
      state.activeSpatialFilter = 'none';
      state.searchBounds = null;
      state.userDefinedMapArea = false;
      state.mapAreaType = 'none';
      state.schools.catchmentFilterEnabled = false;
      state.schools.catchmentUnion = null;
      updateActiveFilters(state);
    },
    // NEW: Phase 2.12.1 - School Panel Toggle Controls
    setShowSchoolsOnMap: (state, action: PayloadAction<boolean>) => {
      state.schools.showSchoolsOnMap = action.payload;
      console.log('[SmartSearch] Schools on map:', action.payload);
    },
    setShowCatchmentRadius: (state, action: PayloadAction<boolean>) => {
      state.schools.showCatchmentRadius = action.payload;
      console.log('[SmartSearch] Catchment radius:', action.payload);
    },
    // NEW: Phase 2.12.4 - Selective School Filter
    setSelectiveSchoolFilter: (state, action: PayloadAction<boolean>) => {
      state.schools.selectiveSchoolFilter = action.payload;
      console.log('[SmartSearch] Selective school filter:', action.payload);
    },
    // NEW: Amenities actions (Phase 2.32)
    // Phase 2.32.1: Single-selection pattern
    toggleAmenitySelection: (state, action: PayloadAction<string>) => {
      const amenityId = action.payload;

      if (state.amenities.selectedAmenityId === amenityId) {
        // Deselect: User clicked the same amenity
        state.amenities.selectedAmenityId = null;
        state.amenities.selectedAmenity = null;
      } else {
        // Select: Replace previous selection with new one
        state.amenities.selectedAmenityId = amenityId;

        // Find and cache the full amenity object
        const amenity = state.amenities.data.find(a => a.id === amenityId);
        state.amenities.selectedAmenity = amenity || null;
      }
    },
    clearAmenitySelection: (state) => {
      // Phase 2.32.1: Clear single selection
      state.amenities.selectedAmenityId = null;
      state.amenities.selectedAmenity = null;
    },
    setAmenitySearchQuery: (state, action: PayloadAction<string>) => {
      state.amenities.searchQuery = action.payload;
    },
    setCategoryFilters: (state, action: PayloadAction<string[]>) => {
      state.amenities.categoryFilters = action.payload;
    },
    // Phase 2.32.6: Removed setRadiusKm reducer - aligned with school markers bbox-only pattern
    setShowAmenitiesOnMap: (state, action: PayloadAction<boolean>) => {
      state.amenities.showAmenitiesOnMap = action.payload;
      console.log('[SmartSearch] Amenities on map:', action.payload);
    },
    // NEW: Error handling actions (Phase 2.5.10)
    clearError: (state) => {
      state.error = null;
      state.errorType = null;
    },
    incrementRetryCount: (state) => {
      state.retryCount += 1;
    },
    resetRetryCount: (state) => {
      state.retryCount = 0;
    },
    // NEW: Phase 2.8 - Auto-Search Countdown Reducers
    startAutoSearchCountdown: (state) => {
      const debounceMs = parseInt(import.meta.env.VITE_MAP_AUTO_SEARCH_DEBOUNCE_MS || '3000', 10);
      state.autoSearchState.countdown = debounceMs;
      state.autoSearchState.isActive = true;
      console.log('[AutoSearch] Countdown started:', debounceMs, 'ms');
    },
    updateAutoSearchCountdown: (state, action: PayloadAction<number>) => {
      if (state.autoSearchState.isActive) {
        state.autoSearchState.countdown = action.payload;
        if (action.payload <= 0) {
          state.autoSearchState.isActive = false;
          console.log('[AutoSearch] Countdown reached 0 - triggering search');
        }
      }
    },
    cancelAutoSearchCountdown: (state) => {
      state.autoSearchState.countdown = null;
      state.autoSearchState.isActive = false;
      console.log('[AutoSearch] Countdown cancelled');
    },
    setAutoSearchInitiated: (state, action: PayloadAction<boolean>) => {
      state.autoSearchState.isSearchInitiated = action.payload;
      console.log('[AutoSearch] Lock flag set to:', action.payload);
    },
    // NEW: Phase 2.8.1 - Auto-Refresh Toggle Reducer
    setAutoRefreshEnabled: (state, action: PayloadAction<boolean>) => {
      state.autoRefreshEnabled = action.payload;

      // Persist to localStorage for session continuity
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('smart-search-auto-refresh-enabled', String(action.payload));
      }

      // When disabled, cancel any active countdown
      if (!action.payload) {
        state.autoSearchState.countdown = null;
        state.autoSearchState.isActive = false;
        console.log('[AutoRefresh] Toggle OFF - countdown cancelled');
      } else {
        console.log('[AutoRefresh] Toggle ON - auto-refresh enabled');
      }
    },
    // NEW: Phase 2.10.1 - Pagination Reducers
    setPaginationPage: (state, action: PayloadAction<number>) => {
      const newPage = action.payload;
      // Validate page number is within bounds
      if (newPage >= 1 && newPage <= state.paginationState.totalPages) {
        state.paginationState.currentPage = newPage;
        console.log('[Pagination] Set page to:', newPage);
      } else {
        console.warn('[Pagination] Invalid page number:', newPage, '(total pages:', state.paginationState.totalPages, ')');
      }
    },
    recalculateVisibleProperties: (state) => {
      // Calculate visible properties based on current mapBounds and properties
      const visible = getVisibleProperties(
        state.properties,
        state.mapBounds
      );

      state.paginationState.visibleProperties = visible;
      state.paginationState.totalVisibleCount = visible.length;
      state.paginationState.totalPages = Math.ceil(
        visible.length / state.paginationState.itemsPerPage
      );

      // Reset to page 1 if current page is now invalid
      if (state.paginationState.currentPage > state.paginationState.totalPages && state.paginationState.totalPages > 0) {
        state.paginationState.currentPage = 1;
        console.log('[Pagination] Reset to page 1 after recalculation');
      }

      console.log('[Pagination] Recalculated visible properties:', {
        total: state.properties.length,
        visible: visible.length,
        totalPages: state.paginationState.totalPages,
        currentPage: state.paginationState.currentPage
      });
    },
    // NEW: Phase 2.17.1 - Collapsible Property Panel Actions
    togglePropertyPanel: (state) => {
      state.propertyPanelVisible = !state.propertyPanelVisible;
      console.log('[PropertyPanel] Toggled visibility:', state.propertyPanelVisible);
    },
    setPropertyPanelVisible: (state, action: PayloadAction<boolean>) => {
      state.propertyPanelVisible = action.payload;
      console.log('[PropertyPanel] Set visibility:', action.payload);
    },
    setFiltersOverlayVisible: (state, action: PayloadAction<boolean>) => {
      state.filtersOverlayVisible = action.payload;
      console.log('[FiltersOverlay] Set visibility:', action.payload);
    },
    // NEW: Phase 2.38 - Suburb Boundaries Overlay
    setShowSuburbBoundaries: (state, action: PayloadAction<boolean>) => {
      state.showSuburbBoundaries = action.payload;
      console.log('[SuburbBoundaries] Set visibility:', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // performSearch reducers
      .addCase(performSearch.pending, (state) => {
        console.log('[performSearch.pending] Reducer executing - setting searchPending to true', {
          before: state.searchPending,
          loading: state.loading,
          error: state.error,
          timestamp: new Date().toISOString(),
        });
        state.loading = true;
        state.error = null;
        // Phase 2.22: Mark search as pending
        state.searchPending = true;
        // Phase 2.41 FIX: Reset pagination state to prevent stale offset in loadMoreProperties
        // When filters change, we need to start fresh - old offset causes "range not satisfiable" errors
        state.paginationOffset = 0;
        state.properties = [];
        state.totalCount = 0;
        state.displayedCount = 0;
        console.log('[performSearch.pending] Reducer executed - searchPending is now true, pagination reset', {
          after: state.searchPending,
          paginationOffset: state.paginationOffset,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null; // Clear any previous errors on successful search
        state.properties = action.payload.properties;
        state.totalCount = action.payload.total_count;
        state.displayedCount = action.payload.properties.length;
        // Phase 2.41 DEBUG: Log progressive loading relevant values
        console.log('[performSearch.fulfilled] Progressive loading values:', {
          propertiesLength: state.properties.length,
          totalCount: state.totalCount,
          hasMore: state.totalCount > state.properties.length,
          searchPending: false, // Will be set after this
          timestamp: new Date().toISOString(),
        });
        state.paginationOffset = action.payload.properties.length;
        state.filtersApplied = action.payload.filters_applied;
        // Clear search bounds when doing regular search
        state.searchBounds = null;
        state.manualMapMove = false;
        // Phase 2.10.1: Recalculate visible properties on new search
        const visible = getVisibleProperties(state.properties, state.mapBounds);
        state.paginationState.visibleProperties = visible;
        state.paginationState.totalVisibleCount = visible.length;
        state.paginationState.totalPages = Math.ceil(
          visible.length / state.paginationState.itemsPerPage
        );
        state.paginationState.currentPage = 1; // Reset to page 1 on new search
        // Phase 2.22: Clear pending flag on success
        state.searchPending = false;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false;
        // NEW: Enhanced error handling (Phase 2.5.10)
        const payload = action.payload as any;
        if (payload && typeof payload === 'object' && payload.type) {
          state.errorType = payload.type;
          state.error = payload.message;
        } else {
          state.errorType = 'general';
          state.error = (action.payload as string) || action.error.message || 'Failed to search properties';
        }
        // Phase 2.22: Clear pending flag on error
        state.searchPending = false;
      })
      // searchByBounds reducers
      .addCase(searchByBounds.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Phase 2.22: Mark search as pending
        state.searchPending = true;
        // Phase 2.41 FIX: Reset pagination state to prevent stale offset in loadMoreProperties
        state.paginationOffset = 0;
        state.properties = [];
        state.totalCount = 0;
        state.displayedCount = 0;
      })
      .addCase(searchByBounds.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.properties = action.payload.properties;
        state.totalCount = action.payload.total_count;
        state.displayedCount = action.payload.properties.length;
        state.paginationOffset = action.payload.properties.length;
        state.filtersApplied = action.payload.filters_applied;
        // Store the bounds used for this search
        if (state.mapBounds) {
          state.searchBounds = { ...state.mapBounds };
        }
        state.manualMapMove = false; // Reset manual move flag after search
        // NEW: Mark as user-defined mapped area (Phase 2.5.7)
        state.userDefinedMapArea = true;
        state.mapAreaType = 'mapped';
        updateActiveFilters(state);
        // Phase 2.10.1: Recalculate visible properties on new search
        const visible = getVisibleProperties(state.properties, state.mapBounds);
        state.paginationState.visibleProperties = visible;
        state.paginationState.totalVisibleCount = visible.length;
        state.paginationState.totalPages = Math.ceil(
          visible.length / state.paginationState.itemsPerPage
        );
        state.paginationState.currentPage = 1; // Reset to page 1 on new search
        // Phase 2.22: Clear pending flag on success
        state.searchPending = false;
      })
      .addCase(searchByBounds.rejected, (state, action) => {
        state.loading = false;
        // Phase 2.22: Clear pending flag on error
        state.searchPending = false;

        // NEW: Handle spatial conflict (Phase 2.5.9 Sprint 2)
        const payload = action.payload as any;
        if (payload && typeof payload === 'object' && payload.type === 'SPATIAL_CONFLICT') {
          // Show conflict dialog
          state.showSpatialConflictDialog = true;
          state.pendingBboxFilter = payload.pendingBounds;
          state.error = null; // Don't show error message for conflicts
          console.log('[SmartSearch] Spatial conflict detected - showing dialog');
        } else {
          // Regular error handling
          state.error = (action.payload as string) || action.error.message || 'Failed to search this area';
        }
      })
      // loadMoreProperties reducers
      .addCase(loadMoreProperties.pending, (state) => {
        state.loading = true;
        // Phase 2.41 FIX: Do NOT set searchPending here - it causes infinite loop
        // searchPending is only for main searches (performSearch, searchByBounds)
        // loadMoreProperties uses `loading` flag instead
      })
      .addCase(loadMoreProperties.fulfilled, (state, action) => {
        state.loading = false;

        // DEDUPLICATION: Filter out properties that already exist (BUG-INFINITE-LOOP fix)
        const newProperties = action.payload.properties;
        const existingIds = new Set(state.properties.map(p => p.id));
        const uniqueNewProperties = newProperties.filter(p => !existingIds.has(p.id));

        console.log(`[LoadMore] Received: ${newProperties.length}, Unique: ${uniqueNewProperties.length}, Duplicates: ${newProperties.length - uniqueNewProperties.length}`);

        // APPEND only unique new properties (don't replace)
        state.properties = [...state.properties, ...uniqueNewProperties];

        // Update counts based on actual unique properties
        state.displayedCount = state.properties.length;
        state.paginationOffset = state.properties.length;
        // totalCount remains the same (from initial search)

        // BUG FIX: Recalculate visibleProperties after appending new properties
        // This ensures PropertyList component shows updated items
        const visible = getVisibleProperties(state.properties, state.mapBounds);
        state.paginationState.visibleProperties = visible;
        state.paginationState.totalVisibleCount = visible.length;
        state.paginationState.totalPages = Math.ceil(
          visible.length / state.paginationState.itemsPerPage
        );
        // Reset to page 1 when new properties loaded to show them immediately
        state.paginationState.currentPage = 1;
        console.log(`[LoadMore] Recalculated visible properties: ${visible.length}, Pages: ${state.paginationState.totalPages}`);
        // Phase 2.41 FIX: Do NOT clear searchPending here - it's not set by loadMore
      })
      .addCase(loadMoreProperties.rejected, (state, action) => {
        state.loading = false;
        // Phase 2.41 FIX: Don't set error for expected guard rejections
        const errorMessage = (action.payload as string) || action.error.message || '';
        if (!errorMessage.includes('Search pending') &&
            !errorMessage.includes('Maximum limit reached') &&
            !errorMessage.includes('Offset exceeds total count')) {
          state.error = errorMessage || 'Failed to load more properties';
        }
        // Phase 2.41 FIX: Do NOT clear searchPending here - it's not set by loadMore
      })
      // fetchSchools reducers (Phase 2.5.9)
      .addCase(fetchSchools.pending, (state) => {
        state.schools.isLoading = true;
        state.schools.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.schools.isLoading = false;
        state.schools.error = null;
        state.schools.data = action.payload.schools;
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.schools.isLoading = false;
        state.schools.error = (action.payload as string) || action.error.message || 'Failed to fetch schools';
      })
      // fetchAmenities reducers (Phase 2.32)
      .addCase(fetchAmenities.pending, (state) => {
        state.amenities.isLoading = true;
        state.amenities.error = null;
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.amenities.isLoading = false;
        state.amenities.error = null;
        state.amenities.data = action.payload.amenities;
      })
      .addCase(fetchAmenities.rejected, (state, action) => {
        state.amenities.isLoading = false;
        state.amenities.error = (action.payload as string) || action.error.message || 'Failed to fetch amenities';
      })
      // computeSchoolCatchmentUnion reducers (Phase 2.5.9 Sprint 1)
      .addCase(computeSchoolCatchmentUnion.pending, (state) => {
        state.schools.catchmentComputeStatus = 'computing';
        state.schools.catchmentComputeError = null;
      })
      .addCase(computeSchoolCatchmentUnion.fulfilled, (state, action) => {
        state.schools.catchmentComputeStatus = 'success';
        state.schools.catchmentUnion = action.payload;
        state.schools.catchmentComputeError = null;
      })
      .addCase(computeSchoolCatchmentUnion.rejected, (state, action) => {
        state.schools.catchmentComputeStatus = 'error';
        state.schools.catchmentComputeError = action.payload as string;
        state.schools.catchmentUnion = null;
      })
      // computeDrawnPolygonUnion reducers (Phase 2.7)
      .addCase(computeDrawnPolygonUnion.pending, (state) => {
        state.loading = true;
      })
      .addCase(computeDrawnPolygonUnion.fulfilled, (state, action) => {
        state.loading = false;
        state.drawnPolygonUnion = action.payload;
        console.log('[SmartSearch] Drawn polygon union computed successfully');
      })
      .addCase(computeDrawnPolygonUnion.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to compute polygon union';
        console.error('[SmartSearch] Drawn polygon union computation failed');
      });
  },
});

export const {
  setActivePanel,
  togglePanel,
  closePanel,
  setViewMode,
  setSortBy,
  setLocationFilter,
  setPriceRangeFilter,
  setBedroomsFilter,
  setBathroomsFilter,
  setParkingFilter,
  setPropertyTypesFilter,
  setListingTypeFilter,
  clearFilter,
  clearAllFilters,
  centerMapAtLocation,
  clearMapCenter,
  setMapBounds,
  setManualMapMove,
  clearManualMapMove,
  // NEW: Map state persistence actions (Phase 2.5.7)
  setMapPosition,
  clearMappedArea,
  setMapAreaType,
  // NEW: Draw mode actions (Phase 2.5.8, enhanced Phase 2.7)
  setDrawMode,
  addDrawnPolygon,
  clearDrawnPolygons,
  // NEW: School catchments actions (Phase 2.5.9)
  toggleSchoolSelection,
  clearSchoolSelection,
  setSchoolSearchQuery,
  setSchoolTypeFilter,
  setCatchmentFilterEnabled,
  setActiveSpatialFilter,
  // NEW: Spatial conflict resolution actions (Phase 2.5.9 Sprint 2)
  resolveSpatialConflict,
  clearActiveSpatialFilter,
  // NEW: Phase 2.12.1 - School Panel Toggle Controls
  setShowSchoolsOnMap,
  setShowCatchmentRadius,
  // NEW: Phase 2.12.4 - Selective School Filter
  setSelectiveSchoolFilter,
  // NEW: Error handling actions (Phase 2.5.10)
  clearError,
  incrementRetryCount,
  resetRetryCount,
  // NEW: Phase 2.8 - Auto-Search Countdown Actions
  startAutoSearchCountdown,
  updateAutoSearchCountdown,
  cancelAutoSearchCountdown,
  setAutoSearchInitiated,
  // NEW: Phase 2.8.1 - Auto-Refresh Toggle Action
  setAutoRefreshEnabled,
  // NEW: Phase 2.10.1 - Pagination Actions
  setPaginationPage,
  recalculateVisibleProperties,
  // NEW: Phase 2.17.1 - Collapsible Property Panel Actions
  togglePropertyPanel,
  setPropertyPanelVisible,
  setFiltersOverlayVisible,
  // NEW: Phase 2.32 - Amenities Actions
  toggleAmenitySelection,
  clearAmenitySelection,
  setAmenitySearchQuery,
  setCategoryFilters,
  // Phase 2.32.6: Removed setRadiusKm action - aligned with school markers bbox-only pattern
  setShowAmenitiesOnMap,
  // NEW: Phase 2.38 - Suburb Boundaries Overlay
  setShowSuburbBoundaries,
} = smartSearchSlice.actions;

// Phase 2.10.1: Selectors for pagination state
export const selectPaginationPage = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.paginationState?.currentPage || 1;

export const selectPaginationTotalPages = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.paginationState?.totalPages || 0;

export const selectPaginationTotalCount = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.paginationState?.totalVisibleCount || 0;

export const selectVisibleProperties = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.paginationState?.visibleProperties || [];

export const selectPagedProperties = (state: { smartSearch: SmartSearchState }) => {
  const paginationState = state.smartSearch.paginationState;

  // Handle undefined paginationState (Redux Persist migration issue)
  if (!paginationState || !paginationState.visibleProperties) {
    return [];
  }

  const { visibleProperties, currentPage, itemsPerPage } = paginationState;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  return visibleProperties.slice(startIdx, endIdx);
};

export const selectPaginationInfo = (state: { smartSearch: SmartSearchState }) => {
  const paginationState = state.smartSearch.paginationState;

  // Handle undefined paginationState (Redux Persist migration issue)
  if (!paginationState) {
    return {
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      itemsPerPage: 25,
    };
  }

  return {
    currentPage: paginationState.currentPage,
    totalPages: paginationState.totalPages,
    totalCount: paginationState.totalVisibleCount,
    itemsPerPage: paginationState.itemsPerPage,
  };
};

// Phase 2.12.1: Selectors for school panel toggles
export const selectShowSchoolsOnMap = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.schools.showSchoolsOnMap;

export const selectShowCatchmentRadius = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.schools.showCatchmentRadius;

// Phase 2.12.4: Selector for selective school filter
export const selectSelectiveSchoolFilter = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.schools.selectiveSchoolFilter;

// Phase 2.17.1: Selectors for collapsible property panel
export const selectPropertyPanelVisible = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.propertyPanelVisible;

export const selectFiltersOverlayVisible = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.filtersOverlayVisible;

// Phase 2.17.3: Selector for total count (from search results, not paginated count)
export const selectTotalCount = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.totalCount;

// Phase 2.22: Selector for search pending state (used by search progress indicator)
export const selectSearchPending = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.searchPending;

// Phase 2.38: Selector for suburb boundaries visibility
export const selectShowSuburbBoundaries = (state: { smartSearch: SmartSearchState }) =>
  state.smartSearch.showSuburbBoundaries;

export default smartSearchSlice.reducer;
