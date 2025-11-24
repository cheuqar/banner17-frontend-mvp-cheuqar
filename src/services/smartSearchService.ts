/**
 * Smart Search Service
 * Provides functions to search properties with advanced filters
 */

import type { BaseProperty } from '../types/property-enhanced';
import type { BBoxBounds } from '../store/slices/smartSearchSlice';

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
  use_school_radius?: boolean; // If true, use 3km radius; if false, prefer catchment polygons
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

  const response = await fetch(`${API_BASE_URL}/api/v1/smart-search/filters/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanFilters),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `Search failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [SmartSearchService] Search successful:', {
    total_count: data.total_count,
    returned: data.page_info?.returned || data.properties?.length,
  });

  return data;
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

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `Failed to fetch schools: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [SmartSearchService] Schools fetched:', {
    total_count: data.total_count,
    returned: data.schools?.length,
  });

  return data;
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

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `Autocomplete failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [SmartSearchService] Autocomplete successful:', {
    total_count: data.total_count,
    returned: data.suggestions?.length,
  });

  return data;
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

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `Failed to fetch amenities: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [SmartSearchService] Amenities fetched:', {
    total_count: data.total_count,
    returned: data.amenities?.length,
  });

  return data;
};
