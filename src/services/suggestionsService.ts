import { supabase } from '../lib/supabase';

export interface SuggestionResponse {
  question: string;
  context: string;
  category: string;
  priority: number;
  requires_data: boolean;
}

export interface SuggestionsListResponse {
  suggestions: SuggestionResponse[];
  context: string;
  total_available: number;
  message?: string;
}

export interface SuggestionRequest {
  context: string;
  render_instruction?: Record<string, any>;
  data?: Record<string, any>;
  limit?: number;
}

class SuggestionsService {
  baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get contextual suggestions based on current data and context
   */
  async getContextualSuggestions(request: SuggestionRequest): Promise<SuggestionsListResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/v1/suggestions/contextual`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting contextual suggestions:', error);
      throw error;
    }
  }

  /**
   * Get quick suggestions for a specific context without detailed data
   */
  async getQuickSuggestions(
    context: string, 
    limit: number = 6
  ): Promise<SuggestionsListResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/v1/suggestions/quick?context=${context}&limit=${limit}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting quick suggestions:', error);
      throw error;
    }
  }

  /**
   * Get suggestions based on a render instruction
   */
  async getSuggestionsForRenderInstruction(
    renderInstruction: Record<string, any>,
    limit: number = 8
  ): Promise<SuggestionsListResponse> {
    const context = this.inferContextFromRenderInstruction(renderInstruction);
    
    return this.getContextualSuggestions({
      context,
      render_instruction: renderInstruction,
      limit
    });
  }

  /**
   * Get available suggestion categories
   */
  async getSuggestionCategories(): Promise<Record<string, string[]>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/v1/suggestions/categories`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting suggestion categories:', error);
      throw error;
    }
  }

  /**
   * Get available suggestion contexts
   */
  async getAvailableContexts(): Promise<Array<{value: string; label: string; description: string}>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/v1/suggestions/contexts`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting available contexts:', error);
      throw error;
    }
  }

  /**
   * Infer context from render instruction type
   */
  private inferContextFromRenderInstruction(renderInstruction: Record<string, any>): string {
    const type = renderInstruction.type;
    
    switch (type) {
      case 'PropertyList':
        return 'property_list';
      case 'AmenityList':
        return 'amenity_list';
      case 'MapPins':
        return 'spatial_search';
      case 'Message':
      default:
        return 'general_chat';
    }
  }

  /**
   * Filter suggestions based on current conversation state
   */
  filterSuggestionsByRelevance(
    suggestions: SuggestionResponse[],
    hasCurrentData: boolean,
    currentDataType?: string
  ): SuggestionResponse[] {
    return suggestions.filter(suggestion => {
      // If we don't have current data, filter out data-dependent suggestions
      if (!hasCurrentData && suggestion.requires_data) {
        return false;
      }
      
      // Additional filtering logic can be added here
      return true;
    }).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Group suggestions by category for better UX
   */
  groupSuggestionsByCategory(suggestions: SuggestionResponse[]): Record<string, SuggestionResponse[]> {
    return suggestions.reduce((groups, suggestion) => {
      const category = suggestion.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(suggestion);
      return groups;
    }, {} as Record<string, SuggestionResponse[]>);
  }

  /**
   * Get category display name and icon
   */
  getCategoryDisplayInfo(category: string): { name: string; icon: string; color: string } {
    const categoryInfo: Record<string, { name: string; icon: string; color: string }> = {
      price_analysis: { name: 'Price & Budget', icon: '💰', color: '#4CAF50' },
      location_analysis: { name: 'Location & Maps', icon: '📍', color: '#2196F3' },
      comparison: { name: 'Compare & Analyze', icon: '⚖️', color: '#FF9800' },
      amenities: { name: 'Local Amenities', icon: '🏥', color: '#9C27B0' },
      refinement: { name: 'Refine Search', icon: '🔍', color: '#607D8B' },
      general: { name: 'General Questions', icon: '💬', color: '#795548' }
    };

    return categoryInfo[category] || { name: category, icon: '❓', color: '#9E9E9E' };
  }
}

// Export singleton instance
export const suggestionsService = new SuggestionsService();
