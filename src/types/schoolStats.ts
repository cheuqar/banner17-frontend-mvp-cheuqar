/**
 * School Property Statistics Types
 * Phase 2.47: Property statistics for school catchment/radius areas
 */

/**
 * Price distribution statistics
 */
export interface PriceDistribution {
  min: number | null;
  max: number | null;
  avg: number | null;
  median: number | null;
}

/**
 * Bedroom distribution statistics
 */
export interface BedroomDistribution {
  '1br': number;
  '2br': number;
  '3br': number;
  '4+br': number;
}

/**
 * Property type distribution (dynamic keys)
 */
export type PropertyTypeDistribution = Record<string, number>;

/**
 * Aggregated property statistics
 */
export interface PropertyStatistics {
  total_count: number;
  price_distribution: PriceDistribution;
  bedroom_distribution: BedroomDistribution;
  property_type_distribution: PropertyTypeDistribution;
}

/**
 * Filters that can be applied to school property statistics
 */
export interface SchoolStatsFilters {
  use_catchment?: boolean;
  radius_km?: number;
  price_min?: number | null;
  price_max?: number | null;
  bedrooms_min?: number | null;
  bedrooms_max?: number | null;
  property_types?: string | null;
  listing_type?: string | null;
}

/**
 * Response from the school property statistics endpoint
 */
export interface SchoolPropertyStatsResponse {
  school_id: string;
  school_name: string;
  used_catchment: boolean;
  radius_km: number | null;
  statistics: PropertyStatistics;
  filters_applied: SchoolStatsFilters;
  computed_at: string;
}

/**
 * Options for fetching school property statistics
 */
export interface GetSchoolStatsOptions {
  schoolId: string;
  useCatchment?: boolean;
  radiusKm?: number;
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  propertyTypes?: string[];
  listingType?: string;
}
