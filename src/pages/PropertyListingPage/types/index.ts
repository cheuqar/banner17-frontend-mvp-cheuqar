/**
 * Property Listing Page Types
 * Phase 1.2: Basic types for API integration
 */

// Basic property interface for Phase 1 testing
export interface Property {
  id: string;
  title: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  property_type: string;
  price?: number;
  price_display: string;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  status: string;
  images?: PropertyImage[];
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  url: string;
  alt?: string;
  caption?: string;
  type?: string;
  thumbnail_url?: string;
}

// Search request interface (basic subset for Phase 1)
export interface PropertySearchRequest {
  query?: string;
  suburbs?: string[];
  states?: string[];
  property_types?: string[];
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Search response interface
export interface PropertySearchResponse {
  properties: Property[];
  total_count: number;
  returned_count: number;
  limit: number;
  offset: number;
  search_params: PropertySearchRequest;
  execution_time_seconds: number;
  suggestions?: Suggestion[];
  has_more: boolean;
}

export interface Suggestion {
  suggestion_type: string;
  display_text: string;
  property_count: number;
  explanation: string;
  filter_changes: object;
  category: string;
  suggestion_rank: number;
}

// Error interface
export interface PropertySearchError {
  status: number;
  message: string;
  detail?: string;
}