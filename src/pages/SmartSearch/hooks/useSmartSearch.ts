import { useState, useCallback } from 'react';

interface Property {
    id: string;
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    price: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    car_spaces: number | null;
    property_type: string | null;
    latitude: number;
    longitude: number;
}

interface SearchFilters {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    suburb?: string;
}

interface UseSmartSearchReturn {
    properties: Property[];
    loading: boolean;
    error: string | null;
    filters: SearchFilters;
    searchQuery: string;
    updateFilters: (filters: Partial<SearchFilters>) => void;
    search: (query?: string) => Promise<void>;
}

export const useSmartSearch = (): UseSmartSearchReturn => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [searchQuery, setSearchQuery] = useState<string>('');

    const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const search = useCallback(async (query?: string) => {
        try {
            setLoading(true);
            setError(null);

            // Update search query if provided
            if (query !== undefined) {
                setSearchQuery(query);
            }

            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';

            const response = await fetch(`${apiUrl}/api/v1/smart-search/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query || searchQuery,
                    filters: {
                        price_min: filters.minPrice,
                        price_max: filters.maxPrice,
                        bedrooms_min: filters.bedrooms,
                        bathrooms_min: filters.bathrooms,
                        property_type: filters.propertyType,
                        suburb: filters.suburb,
                    },
                    limit: 200
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Filter properties that have coordinates
            const validProperties = (data.properties || []).filter(
                (p: Property) => p.latitude && p.longitude
            );

            setProperties(validProperties);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setLoading(false);
        }
    }, [filters, searchQuery]);

    return {
        properties,
        loading,
        error,
        filters,
        searchQuery,
        updateFilters,
        search
    };
};
