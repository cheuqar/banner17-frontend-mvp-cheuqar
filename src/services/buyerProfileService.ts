import { supabase } from '../lib/supabase'

export interface BuyerProfile {
  life_stage: 'first_home' | 'family_expansion' | 'downsizing' | 'investment';
  budget_range: { min: number; max: number };
  timeline: 'urgent' | 'flexible' | 'research_phase';
  location_priorities: ('schools' | 'transport' | 'lifestyle' | 'work_proximity')[];
  property_priorities: ('space' | 'modern' | 'investment_growth' | 'low_maintenance')[];
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  search_patterns: any[];
  engagement_history: any[];
  decision_factors: any[];
}

export interface BuyerBookmark {
  id: string;
  user_id: string;
  property_id: string;
  session_id?: string;
  notes?: string;
  priority_score?: number;
  bookmarked_at: string;
}

class BuyerProfileService {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    
    return {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  /**
   * Make authenticated API request with automatic token refresh retry
   */
  private async makeRequest<T>(
    url: string, 
    options: RequestInit, 
    retryCount: number = 0
  ): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      const config = {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      };

      console.log(`🔄 [BuyerProfileService] Making request to: ${url} (attempt ${retryCount + 1})`);
      const response = await fetch(url, config);
      
      // Handle 401 errors with token refresh retry
      if (response.status === 401 && retryCount === 0) {
        console.warn('⚠️ [BuyerProfileService] Got 401 Unauthorized, attempting token refresh...');
        
        try {
          // Force refresh the Supabase session
          console.log('🔄 [BuyerProfileService] Refreshing Supabase session...');
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('❌ [BuyerProfileService] Token refresh failed:', error.message);
            throw new Error(`Token refresh failed: ${error.message}`);
          }
          
          if (data.session) {
            console.log('✅ [BuyerProfileService] Token refresh successful, retrying request...');
            // Retry the request with the new token (retryCount = 1 prevents infinite loops)
            return this.makeRequest<T>(url, options, 1);
          } else {
            console.error('❌ [BuyerProfileService] No session after refresh');
            throw new Error('Authentication session expired');
          }
        } catch (refreshError) {
          console.error('❌ [BuyerProfileService] Token refresh error:', refreshError);
          throw new Error('Authentication required - please sign in again');
        }
      }
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`❌ [BuyerProfileService] Request error for ${url}:`, error);
      throw error;
    }
  }

  // Buyer Profile Management
  async getBuyerProfile(userId: string): Promise<BuyerProfile> {
    try {
      const url = `${this.baseUrl}/api/v1/chat/buyer-profile/${userId}`;
      return await this.makeRequest<BuyerProfile>(url, { method: 'GET' });
    } catch (error) {
      console.error('Error fetching buyer profile:', error);
      // Return default profile if not found or if there's an auth error
      if (error instanceof Error && error.message.includes('404')) {
        return this.getDefaultBuyerProfile();
      }
      return this.getDefaultBuyerProfile();
    }
  }

  async updateBuyerProfile(userId: string, profileUpdate: Partial<BuyerProfile>): Promise<BuyerProfile> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/chat/buyer-profile/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileUpdate),
    });

    if (!response.ok) {
      throw new Error(`Failed to update buyer profile: ${response.statusText}`);
    }

    return response.json();
  }

  async createBuyerProfile(userId: string, profile: BuyerProfile): Promise<BuyerProfile> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/chat/buyer-profile`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId, ...profile }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create buyer profile: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * LLM-driven buyer profile refresh based on current session context and filters
   * @param userId User ID
   * @param sessionId Current session ID
   * @param activeFilters Current active filters from exploration session
   * @param conversationContext Recent conversation context (optional)
   */
  async refreshBuyerProfileWithAI(
    userId: string, 
    sessionId: string, 
    activeFilters: Record<string, any>, 
    conversationContext?: string[]
  ): Promise<BuyerProfile> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/chat/buyer-profile/ai-refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        active_filters: activeFilters,
        conversation_context: conversationContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh buyer profile with AI: ${response.statusText}`);
    }

    return response.json();
  }

  // Bookmark Management
  async getBookmarks(): Promise<BuyerBookmark[]> {
    try {
      const url = `${this.baseUrl}/api/v1/chat/bookmarks`;
      const data = await this.makeRequest<{bookmarks: BuyerBookmark[]}>(url, { method: 'GET' });
      return data.bookmarks || [];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      // Return empty array if there's an error (including auth errors)
      return [];
    }
  }

  async addBookmark(propertyId: string, sessionId?: string, notes?: string): Promise<BuyerBookmark> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/chat/bookmarks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        property_id: propertyId,
        session_id: sessionId,
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add bookmark: ${response.statusText}`);
    }

    return response.json();
  }

  async removeBookmark(propertyId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/chat/bookmarks/${propertyId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to remove bookmark: ${response.statusText}`);
    }
  }

  // Session Management with Scopes
  async createPropertyDrillSession(propertyId: string, title: string, parentSessionId?: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions/property-drill`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        property_id: propertyId,
        title,
        parent_session_id: parentSessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create property drill session: ${response.statusText}`);
    }

    return response.json();
  }

  async createComparisonSession(propertyIds: string[], title?: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions/comparison`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        property_ids: propertyIds,
        title: title || `Compare ${propertyIds.length} Properties`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create comparison session: ${response.statusText}`);
    }

    return response.json();
  }

  async createExplorationSession(title?: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: title || 'Property Exploration',
        scope: 'exploration',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create exploration session: ${response.statusText}`);
    }

    return response.json();
  }

  // Buyer Profile Builder Workflow Endpoints (Phase 3.5)

  /**
   * Start a new buyer profile builder conversation
   * Endpoint: POST /api/v1/buyer-profile/builder/start
   */
  async startBuilderConversation(): Promise<any> {
    const url = `${this.baseUrl}/api/v1/buyer-profile/builder/start`;
    console.log(`🚀 [BuyerProfileService] Starting builder conversation`);
    return await this.makeRequest<any>(url, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  /**
   * Continue buyer profile builder conversation
   * Endpoint: POST /api/v1/buyer-profile/builder/chat
   *
   * Phase 3.7.1: Updated to support edited_prompt for dual-path editing
   */
  async sendBuilderMessage(payload: {
    user_message: string;
    current_state: any;
    edited_prompt?: string;
  }): Promise<any> {
    const url = `${this.baseUrl}/api/v1/buyer-profile/builder/chat`;
    const messagePreview = typeof payload.user_message === 'string'
      ? payload.user_message.substring(0, 50)
      : String(payload.user_message).substring(0, 50);
    console.log(`💬 [BuyerProfileService] Sending builder message: "${messagePreview}..."`);

    return await this.makeRequest<any>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Phase 3.7.2: Template Library Endpoints

  /**
   * Get template categories
   * Endpoint: GET /api/v1/buyer-profile/templates/categories
   */
  async getTemplateCategories(): Promise<any> {
    const url = `${this.baseUrl}/api/v1/buyer-profile/templates/categories`;
    console.log(`📋 [BuyerProfileService] Fetching template categories`);

    // Note: This is a public endpoint, no auth required
    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template categories: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get templates with optional filtering
   * Endpoint: GET /api/v1/buyer-profile/templates
   */
  async getTemplates(category?: string, search?: string): Promise<any> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const url = `${this.baseUrl}/api/v1/buyer-profile/templates${params.toString() ? '?' + params.toString() : ''}`;
    console.log(`📋 [BuyerProfileService] Fetching templates (category=${category}, search=${search})`);

    // Note: This is a public endpoint for Phase 3.7.2, no auth required
    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get specific template by ID
   * Endpoint: GET /api/v1/buyer-profile/templates/{id}
   */
  async getTemplateById(templateId: string): Promise<any> {
    const url = `${this.baseUrl}/api/v1/buyer-profile/templates/${templateId}`;
    console.log(`🔍 [BuyerProfileService] Fetching template: ${templateId}`);

    // Note: This is a public endpoint, no auth required
    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Start builder workflow from template
   * Endpoint: POST /api/v1/buyer-profile/builder/start-from-template
   */
  async startFromTemplate(templateId: string): Promise<any> {
    const url = `${this.baseUrl}/api/v1/buyer-profile/builder/start-from-template?template_id=${templateId}`;
    console.log(`🚀 [BuyerProfileService] Starting from template: ${templateId}`);

    return await this.makeRequest<any>(url, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Phase 3.7.3: AI Refinement Service Endpoints

  /**
   * Analyze prompt quality with 5-dimension scoring
   * Endpoint: POST /api/v1/buyer-profile/analyze-prompt
   */
  async analyzePrompt(prompt: string, currentCriteria?: any): Promise<any> {
    const url = `${this.baseUrl}/api/v1/buyer-profile/analyze-prompt`;
    console.log(`🔍 [BuyerProfileService] Analyzing prompt quality`);

    return await this.makeRequest<any>(url, {
      method: 'POST',
      body: JSON.stringify({
        search_prompt: prompt,
        current_criteria: currentCriteria,
      }),
    });
  }

  /**
   * Get refinement suggestions with gap detection
   * Endpoint: POST /api/v1/buyer-profile/suggest-refinements
   */
  async getRefinementSuggestions(prompt: string, currentCriteria?: any): Promise<any> {
    const url = `${this.baseUrl}/api/v1/buyer-profile/suggest-refinements`;
    console.log(`💡 [BuyerProfileService] Getting refinement suggestions`);

    return await this.makeRequest<any>(url, {
      method: 'POST',
      body: JSON.stringify({
        search_prompt: prompt,
        current_criteria: currentCriteria,
      }),
    });
  }

  /**
   * Refine prompt with AI improvements
   * Endpoint: POST /api/v1/buyer-profile/refine-prompt
   */
  async refinePrompt(prompt: string, selectedSuggestions?: string[], currentCriteria?: any): Promise<any> {
    const url = `${this.baseUrl}/api/v1/buyer-profile/refine-prompt`;
    console.log(`✨ [BuyerProfileService] Refining prompt with AI`);

    return await this.makeRequest<any>(url, {
      method: 'POST',
      body: JSON.stringify({
        search_prompt: prompt,
        selected_suggestions: selectedSuggestions,
        current_criteria: currentCriteria,
      }),
    });
  }

  // Helper Methods
  private getDefaultBuyerProfile(): BuyerProfile {
    return {
      life_stage: 'first_home',
      budget_range: { min: 300000, max: 800000 },
      timeline: 'flexible',
      location_priorities: ['transport', 'lifestyle'],
      property_priorities: ['space', 'modern'],
      risk_tolerance: 'moderate',
      search_patterns: [],
      engagement_history: [],
      decision_factors: [],
    };
  }

  // Learning and Analytics
  async recordEngagementEvent(eventType: string, data: any): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await fetch(`${this.baseUrl}/api/v1/buyer-analytics/engagement`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event_type: eventType,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to record engagement event:', error);
    }
  }

  async getPersonalizedSuggestions(sessionId: string, propertyId?: string): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      const url = propertyId 
        ? `${this.baseUrl}/api/v1/buyer-analytics/suggestions?session_id=${sessionId}&property_id=${propertyId}`
        : `${this.baseUrl}/api/v1/buyer-analytics/suggestions?session_id=${sessionId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Failed to fetch personalized suggestions:', error);
      return [];
    }
  }
}

export const buyerProfileService = new BuyerProfileService();

