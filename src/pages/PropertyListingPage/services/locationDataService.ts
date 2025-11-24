/**
 * Location Data Service
 * Provides suburb and postcode data for autocomplete functionality
 */

export interface LocationOption {
  suburb: string;
  state: string;
  postcode: string;
  displayName: string;
}

export class LocationDataService {
  private readonly apiUrl: string;
  private suburbCache = new Map<string, LocationOption[]>();
  private postcodeCache = new Map<string, LocationOption[]>();

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
  }

  /**
   * Get suburb suggestions based on partial input and state filter
   */
  async getSuburbSuggestions(
    query: string,
    state?: string,
    limit: number = 10
  ): Promise<LocationOption[]> {
    if (query.length < 2) return [];

    const cacheKey = `${query}-${state || 'all'}-${limit}`;
    if (this.suburbCache.has(cacheKey)) {
      return this.suburbCache.get(cacheKey)!;
    }

    try {
      // Use property search to get unique suburbs that have properties
      const searchRequest = {
        query: query,
        states: state ? [state] : undefined,
        limit: 100 // Get more results to extract unique suburbs
      };

      const response = await fetch(`${this.apiUrl}/api/v1/public/properties/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch suburb suggestions: ${response.status}`);
      }

      const data = await response.json();

      // Extract unique suburbs from property results
      const suburbMap = new Map<string, LocationOption>();
      data.properties?.forEach((property: any) => {
        if (property.suburb && property.state && property.postcode) {
          const key = `${property.suburb}-${property.state}-${property.postcode}`;
          if (!suburbMap.has(key) &&
              property.suburb.toLowerCase().includes(query.toLowerCase())) {
            suburbMap.set(key, {
              suburb: property.suburb,
              state: property.state,
              postcode: property.postcode,
              displayName: `${property.suburb}, ${property.state} ${property.postcode}`
            });
          }
        }
      });

      const suggestions = Array.from(suburbMap.values())
        .sort((a, b) => a.suburb.localeCompare(b.suburb))
        .slice(0, limit);

      this.suburbCache.set(cacheKey, suggestions);
      return suggestions;

    } catch (error) {
      console.error('Error fetching suburb suggestions:', error);
      return [];
    }
  }

  /**
   * Get postcode suggestions based on partial input and optional filters
   */
  async getPostcodeSuggestions(
    query: string,
    state?: string,
    suburb?: string,
    limit: number = 10
  ): Promise<LocationOption[]> {
    if (query.length < 2) return [];

    const cacheKey = `pc-${query}-${state || 'all'}-${suburb || 'all'}-${limit}`;
    if (this.postcodeCache.has(cacheKey)) {
      return this.postcodeCache.get(cacheKey)!;
    }

    try {
      // Build search request
      const searchRequest: any = {
        limit: 100
      };

      if (state) searchRequest.states = [state];
      if (suburb) searchRequest.suburbs = [suburb];

      const response = await fetch(`${this.apiUrl}/api/v1/public/properties/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch postcode suggestions: ${response.status}`);
      }

      const data = await response.json();

      // Extract unique postcodes
      const postcodeMap = new Map<string, LocationOption>();
      data.properties?.forEach((property: any) => {
        if (property.postcode && property.suburb && property.state) {
          const postcodeStr = property.postcode.toString();
          if (postcodeStr.startsWith(query)) {
            const key = `${property.suburb}-${property.state}-${property.postcode}`;
            postcodeMap.set(key, {
              suburb: property.suburb,
              state: property.state,
              postcode: property.postcode,
              displayName: `${property.postcode} (${property.suburb}, ${property.state})`
            });
          }
        }
      });

      const suggestions = Array.from(postcodeMap.values())
        .sort((a, b) => a.postcode.localeCompare(b.postcode))
        .slice(0, limit);

      this.postcodeCache.set(cacheKey, suggestions);
      return suggestions;

    } catch (error) {
      console.error('Error fetching postcode suggestions:', error);
      return [];
    }
  }

  /**
   * Get location options by state
   */
  async getLocationsByState(state: string, limit: number = 50): Promise<LocationOption[]> {
    try {
      const searchRequest = {
        states: [state],
        limit: 200
      };

      const response = await fetch(`${this.apiUrl}/api/v1/public/properties/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }

      const data = await response.json();

      // Extract unique locations
      const locationMap = new Map<string, LocationOption>();
      data.properties?.forEach((property: any) => {
        if (property.suburb && property.state && property.postcode) {
          const key = `${property.suburb}-${property.postcode}`;
          locationMap.set(key, {
            suburb: property.suburb,
            state: property.state,
            postcode: property.postcode,
            displayName: `${property.suburb}, ${property.state} ${property.postcode}`
          });
        }
      });

      return Array.from(locationMap.values())
        .sort((a, b) => a.suburb.localeCompare(b.suburb))
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching locations by state:', error);
      return [];
    }
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.suburbCache.clear();
    this.postcodeCache.clear();
  }
}

// Export singleton instance
export const locationDataService = new LocationDataService();