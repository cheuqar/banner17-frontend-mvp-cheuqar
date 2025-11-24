import { supabase } from '../lib/supabase';
import type { 
  MentionCategory, 
  MentionEntity, 
  MentionEntityList, 
  MentionEntityDetails,
  ChatSessionMention 
} from '../types/mention';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';

class MentionService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async getMentionCategories(): Promise<MentionCategory[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/mentions/categories`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mention categories: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching mention categories:', error);
      throw error;
    }
  }

  async getMentionableProperties(page: number = 1, limit: number = 20): Promise<MentionEntityList> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await fetch(`${API_BASE_URL}/api/v1/mentions/properties?${params}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mentionable properties: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching mentionable properties:', error);
      throw error;
    }
  }

  async getMentionEntityDetails(entityType: string, entityId: string): Promise<MentionEntityDetails> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/mentions/entities/${entityType}/${entityId}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch entity details: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching entity details:', error);
      throw error;
    }
  }

  async addMentionToSession(
    sessionId: string, 
    mentionData: {
      entity_type: string;
      entity_id: string;
      entity_category: string;
      display_text: string;
      entity_metadata?: Record<string, any>;
    }
  ): Promise<ChatSessionMention> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/mentions/sessions/${sessionId}/mentions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(mentionData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add mention to session: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding mention to session:', error);
      throw error;
    }
  }

  async getSessionMentions(sessionId: string): Promise<ChatSessionMention[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/mentions/sessions/${sessionId}/mentions`, {
        headers,
      });
      
      if (!response.ok) {
        // Handle 404 gracefully for new sessions - don't log as error
        if (response.status === 404) {
          console.log('Session mentions not found - returning empty array for new session');
          return [];
        }
        throw new Error(`Failed to fetch session mentions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      // Only log non-404 errors as actual errors
      if (error instanceof Error && !error.message.includes('404') && !error.message.includes('Not Found')) {
        console.error('Error fetching session mentions:', error);
      }
      throw error;
    }
  }

  async removeMentionFromSession(sessionId: string, mentionId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/mentions/sessions/${sessionId}/mentions/${mentionId}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove mention from session: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error removing mention from session:', error);
      throw error;
    }
  }
}

export const mentionService = new MentionService();
export default mentionService;
