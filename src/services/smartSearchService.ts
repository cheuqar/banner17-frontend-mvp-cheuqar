/**
 * Smart Search Service
 * Provides functions to search properties with advanced filters
 *
 * BugSnag Integration: All API calls include:
 * - 30s timeout via AbortSignal
 * - Breadcrumbs before/after each call
 * - Error reporting with categories
 */

import type { BaseProperty } from '../types/property-enhanced';
import type { BBoxBounds } from '../store/slices/smartSearchSlice';
import { reportError, leaveBreadcrumb } from '../utils/errorReporting';

// Get API base URL with proper fallback handling
const envApiUrl = import.meta.env.VITE_API_BASE_URL;

const getApiBaseUrl = () => {
  if (envApiUrl && envApiUrl.trim() !== '' && envApiUrl !== 'undefined') {
    return envApiUrl.trim();
  }
  return 'http://localhost:8100';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔧 [SmartSearchService] VITE_API_BASE_URL env:', JSON.stringify(envApiUrl));
console.log('🔧 [SmartSearchService] Final API_BASE_URL:', JSON.stringify(API_BASE_URL));

export interface SearchFilters {
  state?: string | null;
  suburb?: string | null;
  postcode?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  bedrooms_min?: number | null;
  bedrooms_max?: number | null;
  bathrooms_min?: number | null;
  parking_min?: number | null;
  land_area_min?: number | null;
  property_type?: string[] | null;
  listing_type?: 'sale' | 'rent' | null;
  sort_by?: string | null; // Sort order parameter (e.g., 'price_asc', 'price_desc', 'newest')
  limit?: number;
  offset?: number;
  bbox?: BBoxBounds | null;
  // NEW: School catchment polygon (Phase 2.5.9)
  school_catchment_polygon?: any | null; // GeoJSON MultiPolygon
  // NEW: User-drawn polygon (Phase 2.7)
  drawn_polygon?: any | null; // GeoJSON Polygon or MultiPolygon
  // NEW: School-based filtering (Phase 2.14)
  school_ids?: string[] | null; // Array of school IDs to filter by
  use_school_radius?: boolean; // If true, use radius; if false, prefer catchment polygons
  // Phase 2.46: Adjustable school search radius (in km)
  school_radius_km?: number; // Radius in km for non-catchment schools (default: 3)
}

// Phase 2.58: Server cluster structure (matches backend ClusteredSearchResponse)
export interface ServerClusterData {
  id: string;
  count: number;
  center: {
    latitude: number;
    longitude: number;
  };
}

export interface SearchResponse {
  properties: BaseProperty[];
  total_count: number;
  filters_applied: Record<string, any>;
  page_info: {
    limit: number;
    offset: number;
    has_more: boolean;
    returned: number;
  };
  // Phase 2.56: Optional cluster info for clustered search mode
  _clusterInfo?: {
    serverClusters: number;
    gridInfo: {
      cell_size_km: number;
      zoom_level: number;
    };
  };
  // Phase 2.58: Server-side clusters for rendering on map
  clusters?: ServerClusterData[];
}

// Phase 2.56: Clustered Search interfaces
export interface ClusteredSearchFilters extends SearchFilters {
  zoom_level: number;
  cluster_threshold?: number;
}

export interface ClusterItem {
  id: string;
  center: { lat: number; lng: number };
  count: number;
  bounds?: BBoxBounds;
  property_ids: string[];
}

export interface ClusteredSearchResponse {
  clusters: ClusterItem[];
  properties: BaseProperty[];
  total_count: number;
  grid_info: {
    cell_size_km: number;
    zoom_level: number;
  };
}

/**
 * Search properties with filters
 */
export const searchProperties = async (filters: SearchFilters): Promise<SearchResponse> => {
  // BUG FIX: Special handling for spatial filter objects
  // Remove null/undefined values and empty arrays, but preserve valid spatial filters
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([key, v]) => {
      // Special handling for spatial filter objects
      // Keep bbox if it has all required properties
      if (key === 'bbox' && v && typeof v === 'object') {
        const bbox = v as BBoxBounds;
        const isValid = 'north' in bbox && 'south' in bbox && 'east' in bbox && 'west' in bbox;
        if (isValid) {
          console.log('✅ [SmartSearchService] Keeping bbox spatial filter:', bbox);
        }
        return isValid;
      }

      // Keep drawn_polygon or school_catchment_polygon if they have valid GeoJSON geometry
      if ((key === 'drawn_polygon' || key === 'school_catchment_polygon') && v && typeof v === 'object') {
        const geometry = v as any;
        const isValid = geometry.type && geometry.coordinates && Array.isArray(geometry.coordinates);
        if (isValid) {
          console.log(`✅ [SmartSearchService] Keeping ${key} spatial filter:`, {
            type: geometry.type,
            hasCoordinates: !!geometry.coordinates
          });
        }
        return isValid;
      }

      // Standard null/empty filtering for other parameters
      if (v == null || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
  );

  console.log('🔍 [SmartSearchService] Searching properties with filters:', cleanFilters);

  // BugSnag: Breadcrumb before API call
  leaveBreadcrumb('searchProperties initiated', {
    filters: JSON.stringify(cleanFilters),
    hasLocation: !!(cleanFilters.suburb || cleanFilters.state || cleanFilters.postcode),
    hasSpatialFilter: !!(cleanFilters.bbox || cleanFilters.school_catchment_polygon || cleanFilters.drawn_polygon),
  }, 'request');

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/smart-search/filters/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanFilters),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      const error = new Error(errorData.detail || `Search failed: ${response.statusText}`);

      // BugSnag: Report error with category
      reportError(error, {
        category: response.status === 504 ? 'API_TIMEOUT' : 'SEARCH_FAILED',
        endpoint: '/api/v1/smart-search/filters/search',
        status: response.status,
        filters: cleanFilters,
      });

      throw error;
    }

    const data = await response.json();
    console.log('✅ [SmartSearchService] Search successful:', {
      total_count: data.total_count,
      returned: data.page_info?.returned || data.properties?.length,
    });

    // BugSnag: Breadcrumb on success
    leaveBreadcrumb('searchProperties completed', {
      total_count: data.total_count,
      returned: data.page_info?.returned || data.properties?.length,
    }, 'request');

    return data;
  } catch (error) {
    // BugSnag: Handle timeout errors specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      reportError(error, {
        category: 'API_TIMEOUT',
        endpoint: '/api/v1/smart-search/filters/search',
        filters: cleanFilters,
        timeout_ms: 30000,
      });
    }
    throw error;
  }
};

/**
 * Search properties with clustering (Phase 2.56)
 * Uses server-side grid-based clustering for performance
 * Returns both clusters and individual properties for small clusters
 */
export const searchPropertiesClustered = async (filters: ClusteredSearchFilters): Promise<SearchResponse> => {
  // Clean filters same as standard search
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([key, v]) => {
      if (key === 'bbox' && v && typeof v === 'object') {
        const bbox = v as BBoxBounds;
        const isValid = 'north' in bbox && 'south' in bbox && 'east' in bbox && 'west' in bbox;
        return isValid;
      }
      if ((key === 'drawn_polygon' || key === 'school_catchment_polygon') && v && typeof v === 'object') {
        const geometry = v as any;
        return geometry.type && geometry.coordinates && Array.isArray(geometry.coordinates);
      }
      if (v == null || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
  );

  // Remove zoom_level and cluster_threshold from body - they go in query params
  const { zoom_level: _, cluster_threshold: __, ...bodyFilters } = cleanFilters as any;

  console.log('🔍 [SmartSearchService] Clustered search with filters:', {
    queryParams: { zoom_level: filters.zoom_level, cluster_threshold: filters.cluster_threshold || 3 },
    bodyFilters,
  });

  // BugSnag: Breadcrumb before API call
  leaveBreadcrumb('searchPropertiesClustered initiated', {
    filters: JSON.stringify(bodyFilters),
    zoom_level: filters.zoom_level,
    cluster_threshold: filters.cluster_threshold || 3,
  }, 'request');

  try {
    // Build query params for zoom_level and cluster_threshold (backend expects these as query params)
    const queryParams = new URLSearchParams();
    queryParams.set('zoom_level', String(filters.zoom_level || 12));
    queryParams.set('cluster_threshold', String(filters.cluster_threshold || 3));

    const response = await fetch(
      `${API_BASE_URL}/api/v1/smart-search/filters/search/clustered?${queryParams.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyFilters),
        signal: AbortSignal.timeout(30000), // 30s timeout
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      const error = new Error(errorData.detail || `Clustered search failed: ${response.statusText}`);

      reportError(error, {
        category: response.status === 504 ? 'API_TIMEOUT' : 'CLUSTERED_SEARCH_FAILED',
        endpoint: '/api/v1/smart-search/filters/search/clustered',
        status: response.status,
        filters: cleanFilters,
      });

      throw error;
    }

    const data: ClusteredSearchResponse = await response.json();
    console.log('✅ [SmartSearchService] Clustered search successful:', {
      total_count: data.total_count,
      clusters: data.clusters?.length || 0,
      properties: data.properties?.length || 0,
      grid_info: data.grid_info,
    });

    // BugSnag: Breadcrumb on success
    leaveBreadcrumb('searchPropertiesClustered completed', {
      total_count: data.total_count,
      clusters: data.clusters?.length || 0,
      properties: data.properties?.length || 0,
    }, 'request');

    // Transform clustered response to standard SearchResponse format
    // Phase 2.58: Include server clusters for direct rendering on map
    return {
      properties: data.properties || [],
      total_count: data.total_count,
      filters_applied: cleanFilters,
      page_info: {
        limit: filters.limit || 500,
        offset: filters.offset || 0,
        has_more: false, // Clustered search returns all within viewport
        returned: data.properties?.length || 0,
      },
      _clusterInfo: {
        serverClusters: data.clusters?.length || 0,
        gridInfo: data.grid_info,
      },
      // Phase 2.58: Pass through server clusters for frontend rendering
      clusters: data.clusters || [],
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      reportError(error, {
        category: 'API_TIMEOUT',
        endpoint: '/api/v1/smart-search/filters/search/clustered',
        filters: cleanFilters,
        timeout_ms: 30000,
      });
    }
    throw error;
  }
};

export interface School {
  id: string;
  name: string;
  school_type: 'primary' | 'secondary' | 'infants' | string;
  latitude: number;
  longitude: number;
  has_catchment_boundary: boolean;
  catchment_boundary?: number[][][][];
  metadata?: {
    school_metadata?: any;
    year_availability?: any;
  };
}

export interface SchoolsResponse {
  schools: School[];
  total_count: number;
  filters_applied: Record<string, any>;
}

export interface SchoolsFilters {
  bbox?: string | null; // 'minLng,minLat,maxLng,maxLat'
  search_query?: string | null;
  school_type?: 'all' | 'primary' | 'secondary' | 'infants';
  limit?: number;
}

/**
 * Fetch schools with catchment boundaries
 */
export const fetchSchools = async (filters: SchoolsFilters = {}): Promise<SchoolsResponse> => {
  const params = new URLSearchParams();

  if (filters.bbox) {
    params.append('bbox', filters.bbox);
  }
  if (filters.search_query) {
    params.append('search_query', filters.search_query);
  }
  if (filters.school_type && filters.school_type !== 'all') {
    params.append('school_type', filters.school_type);
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/v1/smart-search/schools${queryString ? `?${queryString}` : ''}`;

  console.log('🏫 [SmartSearchService] Fetching schools:', url);

  // BugSnag: Breadcrumb before API call
  leaveBreadcrumb('fetchSchools initiated', {
    bbox: filters.bbox || null,
    search_query: filters.search_query || null,
    school_type: filters.school_type || 'all',
  }, 'request');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      const error = new Error(errorData.detail || `Failed to fetch schools: ${response.statusText}`);

      // BugSnag: Report error with category
      reportError(error, {
        category: response.status === 504 ? 'API_TIMEOUT' : 'SCHOOL_FETCH_FAILED',
        endpoint: '/api/v1/smart-search/schools',
        status: response.status,
        filters,
      });

      throw error;
    }

    const data = await response.json();
    console.log('✅ [SmartSearchService] Schools fetched:', {
      total_count: data.total_count,
      returned: data.schools?.length,
    });

    // BugSnag: Breadcrumb on success
    leaveBreadcrumb('fetchSchools completed', {
      total_count: data.total_count,
      returned: data.schools?.length,
    }, 'request');

    return data;
  } catch (error) {
    // BugSnag: Handle timeout errors specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      reportError(error, {
        category: 'API_TIMEOUT',
        endpoint: '/api/v1/smart-search/schools',
        filters,
        timeout_ms: 30000,
      });
    }
    throw error;
  }
};

export interface SuburbSuggestion {
  suburb: string;
  state: string;
  postcode: string;
  match_type: 'suburb' | 'postcode';
}

export interface SuburbAutocompleteResponse {
  suggestions: SuburbSuggestion[];
  query: string;
  total_count: number;
}

/**
 * Get suburb autocomplete suggestions
 */
export const getSuburbAutocomplete = async (
  query: string,
  state?: string,
  limit: number = 10
): Promise<SuburbAutocompleteResponse> => {
  const params = new URLSearchParams({ query, limit: limit.toString() });
  if (state) params.append('state', state);

  const url = `${API_BASE_URL}/api/v1/smart-search/autocomplete/suburb?${params}`;
  console.log('🔍 [SmartSearchService] Fetching suburb autocomplete:', url);

  // BugSnag: Breadcrumb before API call
  leaveBreadcrumb('getSuburbAutocomplete initiated', {
    query,
    state: state || null,
    limit,
  }, 'request');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      const error = new Error(errorData.detail || `Autocomplete failed: ${response.statusText}`);

      // BugSnag: Report error with category
      reportError(error, {
        category: response.status === 504 ? 'API_TIMEOUT' : 'AUTOCOMPLETE_FAILED',
        endpoint: '/api/v1/smart-search/autocomplete/suburb',
        status: response.status,
        query,
        state,
      });

      throw error;
    }

    const data = await response.json();
    console.log('✅ [SmartSearchService] Autocomplete successful:', {
      total_count: data.total_count,
      returned: data.suggestions?.length,
    });

    // BugSnag: Breadcrumb on success
    leaveBreadcrumb('getSuburbAutocomplete completed', {
      total_count: data.total_count,
      returned: data.suggestions?.length,
    }, 'request');

    return data;
  } catch (error) {
    // BugSnag: Handle timeout errors specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      reportError(error, {
        category: 'API_TIMEOUT',
        endpoint: '/api/v1/smart-search/autocomplete/suburb',
        query,
        state,
        timeout_ms: 30000,
      });
    }
    throw error;
  }
};

// Phase 2.32: Amenities Service

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

export interface AmenitiesFilters {
  bbox?: string; // "north,south,east,west"
  categories?: string[]; // ['hospitals', 'libraries', etc.]
  search_query?: string;
  radius_km?: number;
  center_lat?: number;
  center_lng?: number;
  limit?: number;
}

export interface AmenitiesResponse {
  amenities: Amenity[];
  total_count: number;
}

/**
 * Fetch amenities within map bounds (Phase 2.32)
 */
export const fetchAmenities = async (filters: AmenitiesFilters = {}): Promise<AmenitiesResponse> => {
  // Parse bbox if provided
  let north: number | undefined, south: number | undefined, east: number | undefined, west: number | undefined;
  if (filters.bbox) {
    const parts = filters.bbox.split(',').map(parseFloat);
    if (parts.length === 4) {
      [north, south, east, west] = parts;
    }
  }

  // Build query parameters
  const params = new URLSearchParams();
  if (north !== undefined) params.append('north', north.toString());
  if (south !== undefined) params.append('south', south.toString());
  if (east !== undefined) params.append('east', east.toString());
  if (west !== undefined) params.append('west', west.toString());

  if (filters.categories && filters.categories.length > 0) {
    params.append('categories', filters.categories.join(','));
  }
  if (filters.search_query) {
    params.append('search', filters.search_query);
  }
  if (filters.radius_km !== undefined) {
    params.append('radius_km', filters.radius_km.toString());
  }
  if (filters.center_lat !== undefined) {
    params.append('center_lat', filters.center_lat.toString());
  }
  if (filters.center_lng !== undefined) {
    params.append('center_lng', filters.center_lng.toString());
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/v1/smart-search/amenities/within-bounds${queryString ? `?${queryString}` : ''}`;

  console.log('🏥 [SmartSearchService] Fetching amenities:', url);

  // BugSnag: Breadcrumb before API call
  leaveBreadcrumb('fetchAmenities initiated', {
    categories: filters.categories?.join(',') || 'all',
    hasBbox: !!filters.bbox,
    hasRadiusSearch: !!(filters.radius_km && filters.center_lat && filters.center_lng),
  }, 'request');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      const error = new Error(errorData.detail || `Failed to fetch amenities: ${response.statusText}`);

      // BugSnag: Report error with category
      reportError(error, {
        category: response.status === 504 ? 'API_TIMEOUT' : 'AMENITIES_FAILED',
        endpoint: '/api/v1/smart-search/amenities/within-bounds',
        status: response.status,
        filters,
      });

      throw error;
    }

    const data = await response.json();
    console.log('✅ [SmartSearchService] Amenities fetched:', {
      total_count: data.total_count,
      returned: data.amenities?.length,
    });

    // BugSnag: Breadcrumb on success
    leaveBreadcrumb('fetchAmenities completed', {
      total_count: data.total_count,
      returned: data.amenities?.length,
    }, 'request');

    return data;
  } catch (error) {
    // BugSnag: Handle timeout errors specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      reportError(error, {
        category: 'API_TIMEOUT',
        endpoint: '/api/v1/smart-search/amenities/within-bounds',
        filters,
        timeout_ms: 30000,
      });
    }
    throw error;
  }
};
