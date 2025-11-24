/**
 * Journey Service - Frontend API client for Journey system management
 * 
 * Provides complete API integration for:
 * - Journey CRUD operations (create, read, update, delete)
 * - Session management within journeys (add sessions, navigation)
 * - Journey navigation tree retrieval for UI components
 * - Journey metadata updates (titles, search criteria)
 * 
 * Integrates with backend Journey API at `/api/v1/journeys/`
 * 
 * Author: Journey Architecture Enhancement Plan
 * Created: September 4, 2025
 */

import type { UUID } from 'crypto';
import { supabase } from '../lib/supabase';

// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
const JOURNEYS_API_URL = `${API_BASE_URL}/api/v1/journeys/`;

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface Journey {
  id: string;
  user_id: string;
  title: string;
  icon_letters: string;
  color_code: string;
  status: string;
  exploration_session_id: string;
  active_session_id: string | null;
  search_criteria: Record<string, any>;
  last_search_result_count: number;
  session_count?: number;
  active_session_info?: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

export interface JourneySession {
  id: string;
  agent_name: string;
  agent_avatar: string;
  session_type: string;
  context_summary: string;
  is_active: boolean;
  created_at: string;
}

export interface JourneyNavigationTree {
  journey_id: string;
  journey_title: string;
  journey_icon: string;
  journey_color: string;
  active_session_id: string | null;
  root_session: Record<string, any> | null;
  sessions: JourneySession[];
  navigation_nodes: Record<string, any>[];
  error?: string;
}

export interface CreateJourneyRequest {
  exploration_session_id: string;
  search_criteria?: Record<string, any>;
  title_override?: string;
}

export interface AddSessionRequest {
  session_id: string;
  session_type: string;
  parent_session_id?: string;
  created_from_property_id?: string;
  context_data?: Record<string, any>;
  handoff_metadata?: Record<string, any>;
}

export interface UpdateJourneyTitleRequest {
  search_criteria?: Record<string, any>;
  result_count?: number;
  title_override?: string;
}

export interface OperationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, any>;
}

// ==========================================
// HTTP UTILITIES
// ==========================================

/**
 * Get authentication headers using Supabase session
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  console.log('🔐 [JourneyService] Getting Supabase session...');
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ [JourneyService] Error getting session:', error);
    throw new Error(`Failed to get session: ${error.message}`);
  }
  
  console.log('🔍 [JourneyService] Session status:', { 
    hasSession: !!session, 
    hasAccessToken: !!session?.access_token,
    expiresAt: session?.expires_at,
    userId: session?.user?.id 
  });
  
  if (!session?.access_token) {
    console.error('❌ [JourneyService] No authentication token available');
    throw new Error('No authentication token available');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Make authenticated API request with automatic token refresh retry
 */
const makeRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  retryCount: number = 0
): Promise<T> => {
  try {
    const headers = await getAuthHeaders();
    
    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    console.log(`🔄 [JourneyService] Making ${method} request to: ${JOURNEYS_API_URL}${endpoint} (attempt ${retryCount + 1})`);
    const response = await fetch(`${JOURNEYS_API_URL}${endpoint}`, config);
    
    // Handle 401 errors with token refresh retry
    if (response.status === 401 && retryCount === 0) {
      console.warn('⚠️ [JourneyService] Got 401 Unauthorized, attempting token refresh...');
      
      try {
        // Force refresh the Supabase session
        console.log('🔄 [JourneyService] Refreshing Supabase session...');
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('❌ [JourneyService] Token refresh failed:', error.message);
          throw new Error(`Token refresh failed: ${error.message}`);
        }
        
        if (data.session) {
          console.log('✅ [JourneyService] Token refresh successful, retrying request...');
          // Retry the request with the new token (retryCount = 1 prevents infinite loops)
          return makeRequest<T>(endpoint, method, body, 1);
        } else {
          console.error('❌ [JourneyService] No session after refresh');
          throw new Error('Authentication session expired');
        }
      } catch (refreshError) {
        console.error('❌ [JourneyService] Token refresh error:', refreshError);
        // If refresh fails, redirect to login by throwing auth error
        throw new Error('Authentication required - please sign in again');
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = errorData.detail || errorData.error || `HTTP ${response.status}`;
      console.error(`❌ [JourneyService] Request failed (${response.status}):`, errorMessage);
      console.error(`❌ [JourneyService] Response body:`, errorData);
      throw new Error(errorMessage);
    }

    console.log(`✅ [JourneyService] Request successful: ${method} ${endpoint}`);
    return response.json();
  } catch (error) {
    console.error(`❌ [JourneyService] Request error for ${method} ${endpoint}:`, error);
    throw error;
  }
};

// ==========================================
// JOURNEY SERVICE CLASS
// ==========================================

export class JourneyService {
  
  // ==========================================
  // JOURNEY CRUD OPERATIONS
  // ==========================================

  /**
   * Get all journeys for the current user
   */
  static async getUserJourneys(
    status: string = 'active',
    limit: number = 50
  ): Promise<Journey[]> {
    try {
      console.log('🚀 [JourneyService] Fetching user journeys:', { status, limit });
      
      const params = new URLSearchParams({
        status,
        limit: limit.toString()
      });
      
      const journeys = await makeRequest<Journey[]>(`?${params}`);
      
      console.log('✅ [JourneyService] Fetched journeys:', journeys.length);
      return journeys;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to fetch journeys:', error);
      throw error;
    }
  }

  /**
   * Get specific journey by ID
   */
  static async getJourneyById(journeyId: string): Promise<Journey> {
    try {
      console.log('🔍 [JourneyService] Fetching journey by ID:', journeyId);
      
      const journey = await makeRequest<Journey>(`${journeyId}`);
      
      console.log('✅ [JourneyService] Journey found:', journey.title);
      return journey;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to fetch journey:', error);
      throw error;
    }
  }

  /**
   * Create a new journey
   */
  static async createJourney(request: CreateJourneyRequest): Promise<{ 
    success: boolean; 
    journey_id: string; 
    journey: Journey; 
    message: string; 
  }> {
    try {
      console.log('🚀 [JourneyService] Creating journey:', request);
      
      const result = await makeRequest<{
        success: boolean;
        journey_id: string;
        journey: Journey;
        message: string;
      }>('', 'POST', request);
      
      console.log('✅ [JourneyService] Journey created:', result.journey_id);
      return result;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to create journey:', error);
      throw error;
    }
  }

  /**
   * Update journey title
   */
  static async updateJourneyTitle(
    journeyId: string, 
    request: UpdateJourneyTitleRequest
  ): Promise<OperationResponse> {
    try {
      console.log('📝 [JourneyService] Updating journey title:', journeyId);
      
      const result = await makeRequest<OperationResponse>(
        `${journeyId}/title`, 
        'PUT', 
        request
      );
      
      console.log('✅ [JourneyService] Journey title updated');
      return result;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to update journey title:', error);
      throw error;
    }
  }

  /**
   * Delete or archive a journey
   */
  static async deleteJourney(
    journeyId: string, 
    archiveOnly: boolean = false
  ): Promise<OperationResponse> {
    try {
      console.log(`🗑️ [JourneyService] ${archiveOnly ? 'Archiving' : 'Deleting'} journey:`, journeyId);
      
      const params = new URLSearchParams({ 
        archive_only: archiveOnly.toString() 
      });
      
      const result = await makeRequest<OperationResponse>(
        `${journeyId}?${params}`, 
        'DELETE'
      );
      
      console.log(`✅ [JourneyService] Journey ${archiveOnly ? 'archived' : 'deleted'}`);
      return result;
    } catch (error) {
      console.error(`❌ [JourneyService] Failed to ${archiveOnly ? 'archive' : 'delete'} journey:`, error);
      throw error;
    }
  }

  // ==========================================
  // SESSION MANAGEMENT OPERATIONS
  // ==========================================

  /**
   * Add a session to a journey
   */
  static async addSessionToJourney(
    journeyId: string, 
    request: AddSessionRequest
  ): Promise<OperationResponse> {
    try {
      console.log('🔗 [JourneyService] Adding session to journey:', journeyId, request.session_type);
      
      const result = await makeRequest<OperationResponse>(
        `${journeyId}/sessions`, 
        'POST', 
        request
      );
      
      console.log('✅ [JourneyService] Session added to journey');
      return result;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to add session to journey:', error);
      throw error;
    }
  }

  /**
   * Get all sessions in a journey
   */
  static async getJourneySessions(
    journeyId: string, 
    includeArchived: boolean = false
  ): Promise<Record<string, any>[]> {
    try {
      console.log('📋 [JourneyService] Fetching journey sessions:', journeyId);
      
      const params = new URLSearchParams({ 
        include_archived: includeArchived.toString() 
      });
      
      const sessions = await makeRequest<Record<string, any>[]>(
        `${journeyId}/sessions?${params}`
      );
      
      console.log('✅ [JourneyService] Journey sessions fetched:', sessions.length);
      return sessions;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to fetch journey sessions:', error);
      throw error;
    }
  }

  /**
   * Set active session for a journey
   */
  static async setActiveSession(
    journeyId: string, 
    sessionId: string
  ): Promise<OperationResponse> {
    try {
      console.log('🎯 [JourneyService] Setting active session:', journeyId, sessionId);
      
      const result = await makeRequest<OperationResponse>(
        `${journeyId}/active-session`, 
        'PUT', 
        { session_id: sessionId }
      );
      
      console.log('✅ [JourneyService] Active session updated');
      return result;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to set active session:', error);
      throw error;
    }
  }

  /**
   * Get the most recent session across all journeys for DB-first initialization
   * This replaces localStorage-based session restoration
   */
  static async getMostRecentSession(): Promise<{
    sessionId: string;
    journeyId: string;
    sessionTitle: string;
    journeyTitle: string;
    scope: string;
    updatedAt: string;
  } | null> {
    try {
      console.log('🔍 [JourneyService] Getting most recent session from database...');
      
      // This will be handled by a new endpoint that gets the most recent session
      const result = await makeRequest<{
        session_id: string;
        journey_id: string;
        session_title: string;
        journey_title: string;
        scope: string;
        updated_at: string;
      } | null>('most-recent-session');
      
      if (result) {
        console.log('✅ [JourneyService] Most recent session found:', {
          sessionId: result.session_id,
          sessionTitle: result.session_title,
          journeyTitle: result.journey_title
        });
        
        return {
          sessionId: result.session_id,
          journeyId: result.journey_id,
          sessionTitle: result.session_title,
          journeyTitle: result.journey_title,
          scope: result.scope,
          updatedAt: result.updated_at
        };
      } else {
        console.log('ℹ️ [JourneyService] No sessions found in database');
        return null;
      }
    } catch (error) {
      console.error('❌ [JourneyService] Failed to get most recent session:', error);
      return null;
    }
  }

  /**
   * Get journeys with their sessions preloaded for efficient navigation
   * This supports the DB-first initialization approach
   */
  static async getJourneysWithSessions(): Promise<Array<{
    journey: Journey;
    sessions: Array<{
      id: string;
      title: string;
      scope: string;
      updated_at: string;
      session_order: number;
    }>;
  }>> {
    try {
      console.log('📋 [JourneyService] Loading journeys with sessions...');
      
      const result = await makeRequest<Array<{
        journey: Journey;
        sessions: Array<{
          id: string;
          title: string;
          scope: string;
          updated_at: string;
          session_order: number;
        }>;
      }>>('with-sessions?limit=10');
      
      console.log('✅ [JourneyService] Loaded journeys with sessions:', {
        journeyCount: result.length,
        totalSessions: result.reduce((sum, j) => sum + j.sessions.length, 0)
      });
      
      return result;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to load journeys with sessions:', error);
      throw error;
    }
  }

  // ==========================================
  // NAVIGATION AND UTILITY OPERATIONS
  // ==========================================

  /**
   * Get journey navigation tree for UI display
   */
  static async getJourneyNavigationTree(journeyId: string): Promise<JourneyNavigationTree> {
    try {
      console.log('🌳 [JourneyService] Building navigation tree:', journeyId);
      
      const tree = await makeRequest<JourneyNavigationTree>(
        `${journeyId}/navigation-tree`
      );
      
      console.log('✅ [JourneyService] Navigation tree built:', tree.navigation_nodes.length, 'nodes');
      return tree;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to build navigation tree:', error);
      throw error;
    }
  }

  /**
   * Find which journey contains a given session
   */
  static async findJourneyBySession(sessionId: string): Promise<Journey | null> {
    try {
      console.log('🔍 [JourneyService] Finding journey for session:', sessionId);
      
      const journey = await makeRequest<Journey | null>(
        `session/${sessionId}/journey`
      );
      
      if (journey) {
        console.log('✅ [JourneyService] Session found in journey:', journey.title);
      } else {
        console.log('ℹ️ [JourneyService] Session not found in any journey');
      }
      
      return journey;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to find journey by session:', error);
      throw error;
    }
  }

  /**
   * Get available journey colors
   */
  static async getAvailableJourneyColors(): Promise<Array<{ color_code: string; color_name: string; sort_order: number }>> {
    try {
      console.log('🎨 [JourneyService] Fetching available journey colors');
      
      const colors = await makeRequest<Array<{ 
        color_code: string; 
        color_name: string; 
        sort_order: number; 
      }>>("colors/available");
      
      console.log('✅ [JourneyService] Available colors fetched:', colors.length);
      return colors;
    } catch (error) {
      console.error('❌ [JourneyService] Failed to fetch available colors:', error);
      throw error;
    }
  }

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  /**
   * Check Journey API health status
   */
  static async checkHealth(): Promise<{ status: string; service: string; version: string; description: string }> {
    try {
      const health = await makeRequest<{ 
        status: string; 
        service: string; 
        version: string; 
        description: string; 
      }>("health");
      
      console.log('✅ [JourneyService] Health check passed:', health.status);
      return health;
    } catch (error) {
      console.error('❌ [JourneyService] Health check failed:', error);
      throw error;
    }
  }
}

// Export default instance
export default JourneyService;
