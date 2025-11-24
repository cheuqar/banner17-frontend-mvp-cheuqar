import { supabase } from '../lib/supabase'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
  message_metadata?: {
    render_instruction?: {
      type: string
      title?: string
      subtitle?: string
      items?: any[]
      active_filters?: Record<string, string>
      spatial_context?: {
        search_address?: string
        center_lat?: number
        center_lng?: number
        radius_km?: number
      }
      [key: string]: any
    }
    [key: string]: any
  }
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

export interface ModelInfo {
  id: string
  display_name: string
  description: string
  provider: string
  max_tokens: number
  supports_streaming: boolean
  cost_tier: string
  available: boolean
}

export interface ChatRequest {
  message: string
  session_id?: string
  model_id?: string
  stream?: boolean
  temperature?: number
  max_tokens?: number
  mentions?: Array<{
    id: string
    type: "property" | "amenity"
    display_text: string
    entity_id: string
    coordinates?: { lat: number; lng: number }
    metadata?: any
  }>
  suggestion_metadata?: {
    messageType: string
    suggestionData: any
    timestamp: string
  }
  chat_history?: Array<{
    type: 'user' | 'ai'
    content: string
    timestamp: string
    render_instruction?: {
      type: string
      title?: string
      subtitle?: string
      items?: any[]
      pins?: any[]
      [key: string]: any
    }
    token_usage?: {
      input_tokens: number
      output_tokens: number
      total_tokens: number
      estimated_cost: number
    }
    data_objects?: {
      properties?: any[]           // Full property objects with coordinates
      amenities?: any[]           // Amenity search results  
      spatial_data?: {            // Geographic/coordinate data
        coordinates: { lat: number; lng: number; label: string }[]
        bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }
        center?: { lat: number; lng: number }
      }
      aggregations?: {            // Analysis results
        count: number
        filters_applied: any
        sort_order: any
        statistics?: Record<string, number>
      }
      query_context?: {           // Query metadata
        filters: any
        sort: any
        scope: 'user' | 'public'
        tool_used: string
        timestamp: string
      }
    }
  }>
}

export interface ChatResponse {
  type: string
  session_id: string
  content?: string
  model?: string
  usage?: Record<string, any>
  timestamp: string
  error?: string
  
  // Structured data from backend
  render_instruction?: {
    type: string
    title?: string
    subtitle?: string
    items?: any[]
    pins?: any[]
    [key: string]: any
  }
  
  // Token usage tracking
  token_usage?: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
    estimated_cost: number
  }
  
  // Preserved queryable data objects
  data_objects?: {
    properties?: any[]           // Full property objects with coordinates
    amenities?: any[]           // Amenity search results  
    spatial_data?: {            // Geographic/coordinate data
      coordinates: { lat: number; lng: number; label: string }[]
      bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }
      center?: { lat: number; lng: number }
    }
    aggregations?: {            // Analysis results
      count: number
      filters_applied: any
      sort_order: any
      statistics?: Record<string, number>
    }
    query_context?: {           // Query metadata
      filters: any
      sort: any
      scope: 'user' | 'public'
      tool_used: string
      timestamp: string
    }
  }
  
  // Metadata that includes structured data
  metadata?: {
    trace?: any[]
    debug_trace?: any[]  // Enhanced debug trace for testing
    debug_mode?: boolean  // Flag indicating debug mode is enabled
    total_duration_ms?: number
    total_tokens_in?: number
    total_tokens_out?: number
    total_estimated_cost?: number
    render_instruction?: any
    external_sources?: any[]
    [key: string]: any
  }
}

// New interfaces for chat history management
export interface ChatSessionSummary {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
  last_message_preview?: string
  last_message_at?: string
  total_text_count: string
  total_input_tokens: string
  total_output_tokens: string
  total_credits_used: string
  tools_used: Record<string, number>
}

export interface ChatHistoryResponse {
  sessions: ChatSessionSummary[]
  total_count: number
  page: number
  page_size: number
  has_next: boolean
  has_previous: boolean
}

export interface SessionDeletionResponse {
  success: boolean
  message: string
  deleted_session_id?: string
  deleted_count?: number
}

export interface ConversationHistoryResponse {
  session: {
    id: string
    title: string
    status: string
    created_at: string
    updated_at: string
    total_text_count: string
    total_input_tokens: string
    total_output_tokens: string
    total_credits_used: string
    tools_used: Record<string, number>
  }
  messages: ChatMessage[]
  total_messages: number
}

class ChatService {
  baseUrl: string
  private eventSource: EventSource | null = null

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100'
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    console.log('🔐 [ChatService] Getting Supabase session...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ [ChatService] Error getting session:', error)
      throw new Error(`Failed to get session: ${error.message}`)
    }
    
    console.log('🔍 [ChatService] Session status:', { 
      hasSession: !!session, 
      hasAccessToken: !!session?.access_token,
      expiresAt: session?.expires_at,
      userId: session?.user?.id 
    })
    
    if (!session?.access_token) {
      console.error('❌ [ChatService] No authentication token available')
      throw new Error('No authentication token available')
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  async getAvailableModels(): Promise<{ models: ModelInfo[], default_model: string }> {
    try {
      const headers = await this.getAuthHeaders()
      
      // Legacy LangGraph with Gemini 2.5 Flash - return mock model list
      console.warn('Legacy LangGraph system (temporary) - models API not needed, returning mock models')
      return {
        models: [{
          id: 'gemini-2.5-flash',
          display_name: 'Gemini 2.5 Flash (Legacy LangGraph)',
          description: 'Google Gemini 2.5 Flash with Legacy LangGraph system (Enhanced Capabilities)',
          provider: 'gemini',
          max_tokens: 8192,
          supports_streaming: true,
          cost_tier: 'fast',
          available: true
        }],
        default_model: 'gemini-2.5-flash'
      }
    } catch (error) {
      console.error('Error fetching available models:', error)
      throw error
    }
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${this.baseUrl}/api/v1/enhanced-chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Request failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: ChatResponse) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    console.log('🚀 [ChatService] Starting sendMessageStream:', { request, baseUrl: this.baseUrl })
    
    try {
      console.log('🔑 [ChatService] Getting auth headers...')
      const headers = await this.getAuthHeaders()
      console.log('✅ [ChatService] Auth headers obtained:', { ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : 'MISSING' })
      
      // Close existing connection if any
      if (this.eventSource) {
        console.log('🔌 [ChatService] Closing existing EventSource')
        this.eventSource.close()
      }

      const requestUrl = `${this.baseUrl}/api/v1/enhanced-chat/stream`
      const requestBody = { ...request, stream: true }
      console.log('📡 [ChatService] Making POST request to:', requestUrl)
      console.log('📦 [ChatService] Request body:', requestBody)

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      console.log('📨 [ChatService] Response received:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [ChatService] HTTP Error:', { status: response.status, statusText: response.statusText, errorData })
        
        // Handle different error types properly
        let errorMessage = `Request failed: ${response.statusText}`;
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Handle Pydantic validation errors
            errorMessage = errorData.detail.map((err: any) => `${err.loc?.join('.') || 'field'}: ${err.msg}`).join(', ');
          } else if (typeof errorData.detail === 'object') {
            errorMessage = JSON.stringify(errorData.detail);
          }
        }
        
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        console.error('❌ [ChatService] No response body reader available')
        throw new Error('No response body reader available')
      }

      console.log('📖 [ChatService] Starting to read streaming response...')
      const decoder = new TextDecoder()
      let buffer = ''
      let chunkCount = 0

      try {
        while (true) {
          const { done, value } = await reader.read()
          chunkCount++
          
          if (done) {
            console.log('✅ [ChatService] Stream reading completed, total chunks:', chunkCount)
            break
          }

          const decodedChunk = decoder.decode(value, { stream: true })
          console.log(`📊 [ChatService] Chunk ${chunkCount}:`, decodedChunk.substring(0, 100) + (decodedChunk.length > 100 ? '...' : ''))
          
          buffer += decodedChunk
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6) // Remove 'data: ' prefix
              console.log('🔄 [ChatService] Processing data line:', data.substring(0, 50) + (data.length > 50 ? '...' : ''))
              
              if (data === '[DONE]') {
                console.log('🏁 [ChatService] Received [DONE] signal')
                onComplete()
                return
              }

              try {
                const chunk = JSON.parse(data) as ChatResponse
                console.log('✨ [ChatService] Parsed chunk:', chunk)
                onChunk(chunk)
              } catch (parseError) {
                console.warn('⚠️ [ChatService] Failed to parse chunk:', data, parseError)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      onComplete()
    } catch (error) {
      console.error('💥 [ChatService] Error in streaming chat:', error)
      console.error('💥 [ChatService] Error details:', { 
        name: error instanceof Error ? error.name : 'Unknown', 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      onError(error instanceof Error ? error : new Error('Unknown streaming error'))
    }
  }



  async getProviderHealth(): Promise<{
    total_providers: number
    healthy_providers: number
    providers: Record<string, any>
  }> {
    try {
      const headers = await this.getAuthHeaders()
      
      // Enhanced LangGraph health check - just return healthy status  
      console.warn('Enhanced LangGraph system - health check not implemented, returning healthy')
      return { 
        total_providers: 1, 
        healthy_providers: 1, 
        providers: { enhanced_langgraph: { status: 'healthy', timestamp: new Date().toISOString() } } 
      }
    } catch (error) {
      console.error('Error fetching provider health:', error)
      throw error
    }
  }

  // Create a new chat session via backend API
  async createChatSession(title?: string): Promise<{ sessionId: string; session: any }> {
    console.log('🔄 [ChatService] Creating new chat session...', {
      title: title || 'New Chat',
      baseUrl: this.baseUrl
    });
    
    try {
      console.log('🔑 [ChatService] Getting auth headers...');
      const headers = await this.getAuthHeaders();
      console.log('✅ [ChatService] Auth headers obtained for session creation');
      
      const requestUrl = `${this.baseUrl}/api/v1/chat/sessions`;
      const requestBody = { title: title || 'New Chat' };
      
      console.log('📡 [ChatService] Making POST request to create session:', {
        url: requestUrl,
        body: requestBody
      });
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('📨 [ChatService] Create session response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
          console.error('❌ [ChatService] Create session error response:', errorData);
        } catch (parseError) {
          console.error('❌ [ChatService] Failed to parse error response:', parseError);
          errorDetail = await response.text().catch(() => 'No error details available');
        }
        throw new Error(`Failed to create chat session: ${response.status} ${response.statusText} - ${errorDetail}`);
      }
      
      const data = await response.json();
      const sessionId = data.session?.id;
      const sessionStatus = data.session?.status;
      
      console.log('✅ [ChatService] Chat session created successfully:', {
        sessionId,
        sessionStatus,
        sessionData: data.session,
        isValidSession: !!sessionId,
        isPending: sessionStatus === 'pending'
      });
      
      // Log information about pending sessions
      if (sessionStatus === 'pending') {
        console.log('⏳ [ChatService] Session created as pending - will persist after first successful message exchange');
      }
      
      return { sessionId, session: data.session };
      
    } catch (error) {
      console.error('❌ [ChatService] Failed to create chat session:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Fallback to local session ID generation
      console.log('🔄 [ChatService] Using fallback local session ID generation...');
      const sessionId = this.generateSessionId();
      console.log('✅ [ChatService] Generated fallback session:', {
        sessionId,
        isValid: !!sessionId
      });
      
      return { sessionId, session: { id: sessionId, title: title || 'New Chat' } };
    }
  }

  // Utility method to generate a new session ID (fallback)
  generateSessionId(): string {
    return crypto.randomUUID()
  }

  // Update session title in the database
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    console.log('📝 [ChatService] Updating session title...', {
      sessionId,
      title,
      baseUrl: this.baseUrl
    });
    
    try {
      console.log('🔑 [ChatService] Getting auth headers...');
      const headers = await this.getAuthHeaders();
      console.log('✅ [ChatService] Auth headers obtained for title update');
      
      const requestUrl = `${this.baseUrl}/api/v1/chat/sessions/${sessionId}/title`;
      const requestBody = { title };
      
      console.log('📡 [ChatService] Making PUT request to update title:', {
        url: requestUrl,
        body: requestBody
      });
      
      const response = await fetch(requestUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('📨 [ChatService] Title update response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
          errorDetail = await response.text().catch(() => 'No error details available');
        }
        throw new Error(`Failed to update session title: ${response.status} ${response.statusText} - ${errorDetail}`);
      }
      
      console.log('✅ [ChatService] Session title updated successfully:', {
        sessionId,
        title
      });
      
    } catch (error) {
      console.error('❌ [ChatService] Update session title error:', error);
      throw error;
    }
  }

  // Update session metadata (title + subtitle + tags) in the database
  async updateSessionMetadata(sessionId: string, title: string, metadata: any): Promise<void> {
    console.log('📝 [ChatService] Updating session metadata...', {
      sessionId,
      title,
      metadata,
      baseUrl: this.baseUrl
    });
    
    try {
      console.log('🔑 [ChatService] Getting auth headers...');
      const headers = await this.getAuthHeaders();
      console.log('✅ [ChatService] Auth headers obtained for metadata update');
      
      const requestUrl = `${this.baseUrl}/api/v1/chat/sessions/${sessionId}/metadata`;
      const requestBody = { 
        title,
        session_metadata: metadata
      };
      
      console.log('📡 [ChatService] Making PUT request to update session metadata...', {
        url: requestUrl,
        body: requestBody
      });
      
      const response = await fetch(requestUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ChatService] HTTP error updating session metadata:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [ChatService] Session metadata updated successfully', result);
    } catch (error) {
      console.error('❌ [ChatService] Failed to update session metadata:', error);
      throw error;
    }
  }

  // Chat History Management Methods

  async getChatHistory(page: number = 1, pageSize: number = 20): Promise<ChatHistoryResponse> {
    try {
      console.log('📚 [ChatService] Getting chat history:', { page, pageSize })
      
      const headers = await this.getAuthHeaders()
      const url = `${this.baseUrl}/api/v1/chat/history?page=${page}&page_size=${pageSize}`
      
      console.log('📡 [ChatService] Making request to:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      console.log('📨 [ChatService] History response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        let errorDetail = ''
        try {
          const errorData = await response.json()
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData)
        } catch (parseError) {
          errorDetail = await response.text().catch(() => 'No error details available')
        }
        throw new Error(`Failed to get chat history: ${response.status} ${response.statusText} - ${errorDetail}`)
      }
      
      const data = await response.json()
      console.log('✅ [ChatService] Chat history retrieved:', {
        sessionCount: data.sessions?.length || 0,
        totalCount: data.total_count,
        page: data.page
      })
      
      return data
      
    } catch (error) {
      console.error('❌ [ChatService] Failed to get chat history:', error)
      throw error
    }
  }

  async deleteSession(sessionId: string): Promise<SessionDeletionResponse> {
    try {
      console.log('🗑️ [ChatService] Deleting session:', sessionId)
      
      const headers = await this.getAuthHeaders()
      const url = `${this.baseUrl}/api/v1/chat/sessions/${sessionId}`
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      })
      
      console.log('📨 [ChatService] Delete response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        let errorDetail = ''
        try {
          const errorData = await response.json()
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData)
        } catch (parseError) {
          errorDetail = await response.text().catch(() => 'No error details available')
        }
        throw new Error(`Failed to delete session: ${response.status} ${response.statusText} - ${errorDetail}`)
      }
      
      const data = await response.json()
      console.log('✅ [ChatService] Session deleted successfully:', data)
      
      return data
      
    } catch (error) {
      console.error('❌ [ChatService] Failed to delete session:', error)
      throw error
    }
  }

  async deleteAllSessions(confirmationText: string): Promise<SessionDeletionResponse> {
    try {
      console.log('🗑️ [ChatService] Deleting all sessions with confirmation')
      
      const headers = await this.getAuthHeaders()
      const url = `${this.baseUrl}/api/v1/chat/sessions`
      
      const requestBody = {
        confirm: true,
        confirmation_text: confirmationText
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(requestBody)
      })
      
      console.log('📨 [ChatService] Delete all response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        let errorDetail = ''
        try {
          const errorData = await response.json()
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData)
        } catch (parseError) {
          errorDetail = await response.text().catch(() => 'No error details available')
        }
        throw new Error(`Failed to delete all sessions: ${response.status} ${response.statusText} - ${errorDetail}`)
      }
      
      const data = await response.json()
      console.log('✅ [ChatService] All sessions deleted successfully:', data)
      
      return data
      
    } catch (error) {
      console.error('❌ [ChatService] Failed to delete all sessions:', error)
      throw error
    }
  }

  async resumeSession(sessionId: string): Promise<ConversationHistoryResponse> {
    try {
      console.log('🔄 [ChatService] Resuming session:', sessionId)
      
      const headers = await this.getAuthHeaders()
      const url = `${this.baseUrl}/api/v1/chat/sessions/${sessionId}/resume`
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      console.log('📨 [ChatService] Resume response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        let errorDetail = ''
        try {
          const errorData = await response.json()
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData)
        } catch (parseError) {
          errorDetail = await response.text().catch(() => 'No error details available')
        }
        throw new Error(`Failed to resume session: ${response.status} ${response.statusText} - ${errorDetail}`)
      }
      
      const data = await response.json()
      console.log('✅ [ChatService] Session resumed successfully:', {
        sessionId: data.session?.id,
        messageCount: data.messages?.length || 0,
        totalMessages: data.total_messages
      })
      
      // DEBUG: Log detailed message structure for render instruction debugging
      console.log('🔍 [ChatService] Resume session raw data:', {
        session: data.session,
        messagesCount: data.messages?.length || 0
      })
      
      if (data.messages && data.messages.length > 0) {
        console.log('🔍 [ChatService] First few messages structure:')
        data.messages.slice(0, 3).forEach((msg: any, index: number) => {
          // Check both metadata and message_metadata for compatibility
          const metadata = msg.message_metadata || msg.metadata
          console.log(`   [${index}] Message:`, {
            id: msg.id,
            type: msg.message_type,
            content: msg.content.substring(0, 100) + '...',
            hasMetadata: !!metadata,
            metadataKeys: metadata ? Object.keys(metadata) : [],
            hasRenderInstruction: !!(metadata && metadata.render_instruction),
            renderInstructionType: metadata?.render_instruction?.type || 'none'
          })
          
          if (metadata && metadata.render_instruction) {
            console.log(`   [${index}] Render instruction:`, metadata.render_instruction)
          }
        })
      }
      
      // Transform messages to ensure message_metadata is properly mapped
      const transformedData = {
        ...data,
        messages: data.messages?.map((msg: any) => ({
          ...msg,
          type: msg.message_type || msg.type,
          // Ensure message_metadata is available if present
          message_metadata: msg.message_metadata || msg.metadata,
          // Keep metadata for backwards compatibility
          metadata: msg.metadata || msg.message_metadata
        })) || []
      }
      
      return transformedData
      
    } catch (error) {
      console.error('❌ [ChatService] Failed to resume session:', error)
      throw error
    }
  }

  async getSessionMessages(sessionId: string): Promise<{ messages: ChatMessage[], session: any }> {
    try {
      console.log('📋 [ChatService] Getting session messages:', sessionId)
      
      const conversationHistory = await this.resumeSession(sessionId)
      
      return {
        messages: conversationHistory.messages,
        session: conversationHistory.session
      }
      
    } catch (error) {
      console.error('❌ [ChatService] Failed to get session messages:', error)
      throw error
    }
  }

  // Create a new journey with exploration session as root
  async createJourney(
    explorationSessionId: string, 
    searchCriteria?: Record<string, any>, 
    titleOverride?: string
  ): Promise<{ journeyId: string; journey: any }> {
    console.log('🚀 [ChatService] Creating new journey...', {
      explorationSessionId,
      searchCriteria,
      titleOverride,
      baseUrl: this.baseUrl
    });
    
    try {
      console.log('🔑 [ChatService] Getting auth headers...');
      const headers = await this.getAuthHeaders();
      console.log('✅ [ChatService] Auth headers obtained for journey creation');
      
      const requestUrl = `${this.baseUrl}/api/v1/journeys/`;
      const requestBody = {
        exploration_session_id: explorationSessionId,
        search_criteria: searchCriteria,
        title_override: titleOverride
      };
      
      console.log('📡 [ChatService] Making POST request to create journey:', {
        url: requestUrl,
        body: requestBody
      });
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('📨 [ChatService] Create journey response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
          console.error('❌ [ChatService] Create journey error response:', errorData);
        } catch (parseError) {
          console.error('❌ [ChatService] Failed to parse error response:', parseError);
          errorDetail = await response.text().catch(() => 'No error details available');
        }
        throw new Error(`Failed to create journey: ${response.status} ${response.statusText} - ${errorDetail}`);
      }
      
      const data = await response.json();
      const journeyId = data.journey_id;
      
      console.log('✅ [ChatService] Journey created successfully:', {
        journeyId,
        journeyTitle: data.journey?.title,
        message: data.message
      });
      
      return {
        journeyId,
        journey: data.journey
      };
      
    } catch (error) {
      console.error('❌ [ChatService] Create journey error:', error);
      throw error;
    }
  }

  // Clean up resources
  cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }
}

// Export singleton instance
export const chatService = new ChatService()

// Types are already exported above as interfaces