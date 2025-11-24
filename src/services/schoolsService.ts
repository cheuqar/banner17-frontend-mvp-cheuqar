/**
 * Schools Service - API integration for schools and catchment data
 */

import { API_BASE_URL } from './config';

// Types for Schools API responses
export interface SchoolCatchment {
  school_id: string;
  school_name: string;
  level: 'primary' | 'high';
  sector: 'government' | 'catholic' | 'independent';
  selective?: boolean;
  catchment_id: string;
  calendar_year: number;
  disclaimer?: string;
}

export interface NearbySchool {
  school_id: string;
  school_name: string;
  level: 'primary' | 'high';
  sector: 'government' | 'catholic' | 'independent';
  selective?: boolean;
  distance_km: number;
  calendar_year: number;
  disclaimer?: string;
}

export interface PropertySchoolsResponse {
  property_id: string;
  property_address: string;
  catchments: SchoolCatchment[];
  nearby_schools: {
    primary: {
      government: NearbySchool[];
      catholic: NearbySchool[];
      independent: NearbySchool[];
    };
    high: {
      government: NearbySchool[];
      catholic: NearbySchool[];
      independent: NearbySchool[];
    };
  };
  calendar_year: number;
  disclaimer: string;
}

export interface CatchmentPolygon {
  school_id: string;
  school_name: string;
  level: 'primary' | 'high';
  sector: 'government' | 'catholic' | 'independent';
  selective?: boolean;
  catchment_id: string;
  polygon_simplified: any; // GeoJSON geometry
  calendar_year: number;
}

export interface PropertySchoolsGeoResponse {
  property_id: string;
  property_address: string;
  catchment_polygons: CatchmentPolygon[];
  calendar_year: number;
  disclaimer: string;
}

// Helper functions
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

export const getSectorColor = (sector: string): string => {
  switch (sector) {
    case 'government':
      return '#1976d2'; // blue
    case 'catholic':
      return '#7b1fa2'; // purple
    case 'independent':
      return '#388e3c'; // green
    default:
      return '#757575'; // grey
  }
};

export const getSectorIcon = (sector: string): string => {
  switch (sector) {
    case 'government':
      return '🏫'; // school building
    case 'catholic':
      return '⛪'; // church
    case 'independent':
      return '🎓'; // graduation cap
    default:
      return '📚'; // books
  }
};

export const getLevelBadgeColor = (level: string): string => {
  switch (level) {
    case 'primary':
      return '#4caf50'; // green
    case 'high':
      return '#ff9800'; // orange
    default:
      return '#757575'; // grey
  }
};

// API service class
export class SchoolsService {
  private baseUrl: string;
  private cachePrefix = 'schools_cache_v1';

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // =====================
  // LocalStorage Caching
  // =====================
  private buildCacheKey(propertyId: string, kind: 'main' | 'geo') {
    return `${this.cachePrefix}:${kind}:${propertyId}`;
  }

  private readCacheEntry<T = any>(key: string): { data: T; ts: number } | null {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'data' in parsed) {
        return parsed as { data: T; ts: number };
      }
      // Backward compatibility if older format
      return { data: parsed as T, ts: Date.now() };
    } catch {
      return null;
    }
  }

  private writeCacheEntry<T = any>(key: string, data: T) {
    try {
      const payload = JSON.stringify({ data, ts: Date.now() });
      window.localStorage.setItem(key, payload);
    } catch {
      // Ignore storage write errors (e.g., Safari private mode)
    }
  }

  public clearCacheForProperty(propertyId: string) {
    try {
      window.localStorage.removeItem(this.buildCacheKey(propertyId, 'main'));
      window.localStorage.removeItem(this.buildCacheKey(propertyId, 'geo'));
    } catch {
      // ignore
    }
  }

  public clearAllSchoolsCache() {
    try {
      // Remove all keys with our prefix
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(this.cachePrefix + ':')) keys.push(k);
      }
      keys.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }

  /**
   * Get schools and catchment information for a property
   */
  async getPropertySchools(propertyId: string): Promise<PropertySchoolsResponse> {
    // Try cache first
    const cacheKey = this.buildCacheKey(propertyId, 'main');
    const cached = this.readCacheEntry<PropertySchoolsResponse>(cacheKey)?.data;
    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${this.baseUrl}/api/v1/properties/${propertyId}/schools`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      // Handle property not found or coordinates not available
      if (response.status === 404 && (
        errorText.includes('coordinates not available') ||
        errorText.includes('not found') ||
        errorText.includes('invalid address')
      )) {
        throw new Error('This property does not have a valid address or location data. Please report this issue to report@banner17.ai so we can fix it.');
      }

      throw new Error(`Failed to fetch schools data: ${response.status} ${errorText}`);
    }

    const rawData = await response.json();
    
    // Transform the API response to match frontend interface
    const transformedData: PropertySchoolsResponse = {
      property_id: rawData.property?.id || propertyId,
      property_address: rawData.property?.address || 'Unknown address',
      // Transform in_catchment to catchments array
      catchments: [
        ...(rawData.in_catchment?.primary || []).map((school: any) => ({
          school_id: school.school_id,
          school_name: school.school_name,
          level: 'primary' as const,
          sector: 'government' as const, // catchment schools are typically government
          distance_m: school.distance_m,
          calendar_year: school.calendar_year,
        })),
        ...(rawData.in_catchment?.high || []).map((school: any) => ({
          school_id: school.school_id,
          school_name: school.school_name,
          level: 'high' as const,
          sector: 'government' as const,
          distance_m: school.distance_m,
          calendar_year: school.calendar_year,
        }))
      ],
      // Transform nearby to nearby_schools structure
      nearby_schools: {
        primary: {
          government: (rawData.nearby?.public || [])
            .filter((school: any) => school.education_level === 'Primary School')
            .map((school: any) => ({
              school_id: school.school_id,
              school_name: school.school_name,
              education_level: school.education_level,
              school_type: school.school_type,
              denomination: school.denomination,
              distance_m: school.distance_m,
            })),
          catholic: (rawData.nearby?.catholic || [])
            .filter((school: any) => school.education_level === 'Primary School')
            .map((school: any) => ({
              school_id: school.school_id,
              school_name: school.school_name,
              education_level: school.education_level,
              school_type: school.school_type,
              denomination: school.denomination,
              distance_m: school.distance_m,
            })),
          independent: (rawData.nearby?.independent || [])
            .filter((school: any) => school.education_level === 'Primary School')
            .map((school: any) => ({
              school_id: school.school_id,
              school_name: school.school_name,
              education_level: school.education_level,
              school_type: school.school_type,
              denomination: school.denomination,
              distance_m: school.distance_m,
            })),
        },
        high: {
          government: (rawData.nearby?.public || [])
            .filter((school: any) => school.education_level === 'Secondary School')
            .map((school: any) => ({
              school_id: school.school_id,
              school_name: school.school_name,
              education_level: school.education_level,
              school_type: school.school_type,
              denomination: school.denomination,
              distance_m: school.distance_m,
            })),
          catholic: (rawData.nearby?.catholic || [])
            .filter((school: any) => school.education_level === 'Secondary School')
            .map((school: any) => ({
              school_id: school.school_id,
              school_name: school.school_name,
              education_level: school.education_level,
              school_type: school.school_type,
              denomination: school.denomination,
              distance_m: school.distance_m,
            })),
          independent: (rawData.nearby?.independent || [])
            .filter((school: any) => school.education_level === 'Secondary School')
            .map((school: any) => ({
              school_id: school.school_id,
              school_name: school.school_name,
              education_level: school.education_level,
              school_type: school.school_type,
              denomination: school.denomination,
              distance_m: school.distance_m,
            })),
        },
      },
      calendar_year: rawData.meta?.calendar_year || new Date().getFullYear(),
      disclaimer: rawData.meta?.disclaimer || 'School catchment and nearby school data is indicative only.',
    };
    
    // Cache transformed data for this browser session
    this.writeCacheEntry(cacheKey, transformedData);
    return transformedData;
  }

  /**
   * Get catchment polygon geometries for a property
   */
  async getPropertySchoolsGeo(propertyId: string): Promise<PropertySchoolsGeoResponse> {
    // Try cache first
    const cacheKey = this.buildCacheKey(propertyId, 'geo');
    const cached = this.readCacheEntry<PropertySchoolsGeoResponse>(cacheKey)?.data;
    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${this.baseUrl}/api/v1/properties/${propertyId}/schools/geo`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      // Handle property not found or coordinates not available
      if (response.status === 404 && (
        errorText.includes('coordinates not available') ||
        errorText.includes('not found') ||
        errorText.includes('invalid address')
      )) {
        throw new Error('This property does not have a valid address or location data. Please report this issue to report@banner17.ai so we can fix it.');
      }

      throw new Error(`Failed to fetch schools geo data: ${response.status} ${errorText}`);
    }

    const rawData = await response.json();
    
    // Transform the API response to match frontend interface
    const transformedData: PropertySchoolsGeoResponse = {
      property_id: rawData.property?.id || propertyId,
      property_address: rawData.property?.address || 'Unknown address',
      catchment_polygons: rawData.features?.map((feature: any) => ({
        school_id: feature.school_id,
        school_name: feature.school_name,
        level: feature.catchment_level === 'Primary' ? 'primary' : 'high',
        sector: 'government', // catchment polygons are typically government
        catchment_id: feature.catchment_id,
        polygon_simplified: feature.geometry,
        calendar_year: feature.calendar_year,
      })) || [],
      calendar_year: rawData.meta?.calendar_year || new Date().getFullYear(),
      disclaimer: rawData.meta?.disclaimer || 'School catchment and nearby school data is indicative only.',
    };
    
    this.writeCacheEntry(cacheKey, transformedData);
    return transformedData;
  }
}

// Export default instance
export const schoolsService = new SchoolsService();
