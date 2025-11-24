/**
 * Property Search Service
 * Phase 1.2: Basic API integration with Grace's existing endpoint
 * Uses the exact same API that Grace chatbot uses for consistency
 */

import type { PropertySearchRequest, PropertySearchResponse } from '../types';

export class PropertySearchService {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
  }

  /**
   * Search properties using Grace's public properties endpoint
   * This ensures 100% consistency with Grace's search results
   */
  async searchProperties(request: PropertySearchRequest): Promise<PropertySearchResponse> {
    try {
      console.log('🔍 [PropertySearchService] Starting search with request:', request);

      const response = await fetch(`${this.apiUrl}/api/v1/public/properties/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.formatSearchRequest(request))
      });

      console.log('📡 [PropertySearchService] API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [PropertySearchService] API error:', response.status, errorText);

        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: PropertySearchResponse = await response.json();
      console.log('✅ [PropertySearchService] Search successful:', {
        properties: data.properties?.length || 0,
        total_count: data.total_count,
        execution_time: data.execution_time_seconds
      });

      return data;

    } catch (error) {
      console.error('💥 [PropertySearchService] Search failed:', error);
      throw error;
    }
  }

  /**
   * Format the search request to match Grace's API expectations
   */
  private formatSearchRequest(request: PropertySearchRequest): Record<string, any> {
    const formatted: Record<string, any> = {
      // Default pagination for testing
      limit: request.limit || 20,
      offset: request.offset || 0,
    };

    // Add optional parameters only if they exist
    if (request.query) {
      formatted.query = request.query;
    }

    if (request.suburbs && request.suburbs.length > 0) {
      formatted.suburbs = request.suburbs;
    }

    if (request.states && request.states.length > 0) {
      formatted.states = request.states;
    }

    if (request.property_types && request.property_types.length > 0) {
      formatted.property_types = request.property_types;
    }

    if (request.price_min !== undefined) {
      formatted.price_min = request.price_min;
    }

    if (request.price_max !== undefined) {
      formatted.price_max = request.price_max;
    }

    if (request.bedrooms_min !== undefined) {
      formatted.bedrooms_min = request.bedrooms_min;
    }

    if (request.bedrooms_max !== undefined) {
      formatted.bedrooms_max = request.bedrooms_max;
    }

    if (request.bathrooms_min !== undefined) {
      formatted.bathrooms_min = request.bathrooms_min;
    }

    if (request.bathrooms_max !== undefined) {
      formatted.bathrooms_max = request.bathrooms_max;
    }

    if (request.sort_by) {
      formatted.sort_by = request.sort_by;
    }

    if (request.sort_order) {
      formatted.sort_order = request.sort_order;
    }

    console.log('🔄 [PropertySearchService] Formatted request:', formatted);
    return formatted;
  }

  /**
   * Test the API connection with a simple search
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔧 [PropertySearchService] Testing API connection...');

      // Simple test search for NSW properties
      const testRequest: PropertySearchRequest = {
        states: ['NSW'],
        limit: 1,
        offset: 0
      };

      const response = await this.searchProperties(testRequest);

      console.log('✅ [PropertySearchService] Connection test successful:', {
        propertiesFound: response.properties?.length || 0,
        totalCount: response.total_count
      });

      return true;
    } catch (error) {
      console.error('❌ [PropertySearchService] Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const propertySearchService = new PropertySearchService();