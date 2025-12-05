/**
 * Amenities Service for Property-Centric Amenities API
 * Provides functions to fetch amenities data for properties
 */

// Get API base URL with proper fallback handling
const envApiUrl = import.meta.env.VITE_API_BASE_URL;

// Ensure we always have a proper base URL (no empty strings or undefined)
const getApiBaseUrl = () => {
  if (envApiUrl && envApiUrl.trim() !== '' && envApiUrl !== 'undefined') {
    return envApiUrl.trim();
  }
  return 'http://localhost:8100';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging to help troubleshoot deployment issues
console.log('🔧 [AmenitiesService] VITE_API_BASE_URL env:', JSON.stringify(envApiUrl));
console.log('🔧 [AmenitiesService] Final API_BASE_URL:', JSON.stringify(API_BASE_URL));
if (typeof window !== 'undefined') {
  console.log('🔧 [AmenitiesService] Current page URL:', window.location.href);
}

export interface PropertyAmenity {
  id: string | null;
  name: string;
  category: string;
  subtype?: string | null;
  address?: string | null;
  suburb?: string | null;
  postcode?: string | null;
  latitude: number;
  longitude: number;
  distance_km: number;
  description?: string | null;
  source_url?: string | null;
  data_source?: string | null;
  metadata_json?: Record<string, any> | null;
}

export interface AmenitiesByCategory {
  [category: string]: PropertyAmenity[];
}

export interface AmenitiesResponse {
  property_id: string;
  property_coordinates?: {
    latitude: number;
    longitude: number;
  };
  radius_km: number;
  total_count: number;
  amenities_by_category: AmenitiesByCategory;
  categories_summary: { [category: string]: number };
  metadata: {
    search_radius_km?: number;
    property_coordinates?: { latitude: number; longitude: number };
    categories_searched?: string[];
    limit_per_category?: number;
    search_time_ms?: number;
    search_timestamp?: string;
  };
}

export interface AmenitiesError {
  error: string;
  details?: string;
  property_id?: string;
}

/**
 * Fetch amenities for a specific property
 */
export const fetchPropertyAmenities = async (
  propertyId: string,
  options: {
    categories?: string[];
    limitPerCategory?: number;
    radiusKm?: number;
  } = {}
): Promise<AmenitiesResponse> => {
  const {
    categories = ['hospitals', 'libraries', 'shopping', 'schools', 'child_care', 'tourist_attractions', 'beaches', 'sports', 'transport_stations'],
    limitPerCategory = 10,
    radiusKm = 8
  } = options;

  // Build query parameters
  const params = new URLSearchParams({
    categories: categories.join(','),
    limit_per_category: limitPerCategory.toString(),
    radius_km: radiusKm.toString()
  });

  const url = `${API_BASE_URL}/api/v1/properties/${propertyId}/amenities?${params}`;

  // Debug logging for the actual URL being called
  console.log('🌐 [AmenitiesService] Fetching from URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: AmenitiesError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
        property_id: propertyId
      }));

      // Handle property not found or coordinates not available
      if (response.status === 404 && errorData.error?.includes('coordinates not available')) {
        throw new Error('This property does not have a valid address or location data. Please report this issue to report@banner17.ai so we can fix it.');
      }

      throw new Error(errorData.error || `Failed to fetch amenities: ${response.statusText}`);
    }

    const data: AmenitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property amenities:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred while fetching amenities');
  }
};

/**
 * Get all available amenity categories
 */
export const getAmenityCategories = () => {
  return [
    { key: 'hospitals', label: 'Hospitals', icon: '🏥' },
    { key: 'libraries', label: 'Libraries', icon: '📚' },
    { key: 'shopping', label: 'Shopping', icon: '🛒' },
    { key: 'schools', label: 'Schools', icon: '🏫' },
    { key: 'child_care', label: 'Child Care', icon: '👶' },
    { key: 'tourist_attractions', label: 'Tourist Attractions', icon: '🎢' },
    { key: 'beaches', label: 'Beaches', icon: '🏖️' },
    { key: 'sports', label: 'Sports', icon: '⚽' },
    { key: 'transport_stations', label: 'Transport', icon: '🚆' }
  ];
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Get category display info
 */
export const getCategoryInfo = (category: string) => {
  const categories = getAmenityCategories();
  return categories.find(cat => cat.key === category) || { key: category, label: category, icon: '📍' };
};
