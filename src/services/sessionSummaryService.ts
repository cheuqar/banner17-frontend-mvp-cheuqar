import { chatService } from './chatService';
import { JourneyService } from './journeyService';

/**
 * Service for intelligently updating session summaries based on conversation context
 */
export class SessionSummaryService {
  private static instance: SessionSummaryService;
  private updateQueue: Set<string> = new Set();
  private isProcessing = false;

  static getInstance(): SessionSummaryService {
    if (!SessionSummaryService.instance) {
      SessionSummaryService.instance = new SessionSummaryService();
    }
    return SessionSummaryService.instance;
  }

  /**
   * Trigger auto-update for a session based on specific events
   */
  async triggerUpdate(
    sessionId: string, 
    trigger: 'first_render' | 'search_change' | 'handoff',
    context?: {
      renderInstruction?: any;
      previousFilters?: Record<string, string>;
      newFilters?: Record<string, string>;
      handoffDetails?: {
        fromAgent: string;
        toAgent: string;
        propertyId?: string;
      };
    }
  ) {
    console.log(`🔄 [SessionSummary] Triggering auto-update for session ${sessionId}:`, {
      trigger,
      context
    });

    // Add to queue for processing
    this.updateQueue.add(sessionId);
    
    // Process queue
    this.processUpdateQueue();
  }

  /**
   * Process queued updates with debouncing
   */
  private async processUpdateQueue() {
    if (this.isProcessing || this.updateQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process all queued sessions
      const sessionsToUpdate = Array.from(this.updateQueue);
      this.updateQueue.clear();

      console.log(`📋 [SessionSummary] Processing ${sessionsToUpdate.length} session updates`);

      // Process updates in parallel (max 3 at a time to avoid overload)
      const batchSize = 3;
      for (let i = 0; i < sessionsToUpdate.length; i += batchSize) {
        const batch = sessionsToUpdate.slice(i, i + batchSize);
        await Promise.all(batch.map(sessionId => this.updateSessionSummary(sessionId)));
      }

    } catch (error) {
      console.error('❌ [SessionSummary] Error processing update queue:', error);
    } finally {
      this.isProcessing = false;

      // Process any new updates that came in while processing
      if (this.updateQueue.size > 0) {
        setTimeout(() => this.processUpdateQueue(), 1000);
      }
    }
  }

  /**
   * Update session summary by extracting search criteria and context
   */
  private async updateSessionSummary(sessionId: string) {
    try {
      console.log(`🔍 [SessionSummary] Updating session: ${sessionId}`);

      // Get session messages
      const { messages } = await chatService.getSessionMessages(sessionId);

      // Extract enhanced context
      const enhancedContext = await this.extractEnhancedContext(messages);
      
      if (enhancedContext) {
        console.log(`✅ [SessionSummary] Updated context for ${sessionId}:`, {
          title: enhancedContext.title,
          subtitle: enhancedContext.subtitle,
          tags: enhancedContext.tags
        });

        // 💾 CRITICAL FIX: Persist session title AND metadata to database so it survives page reloads
        try {
          // Prepare metadata including subtitle, tags, and other enhanced context
          const sessionMetadata = {
            subtitle: enhancedContext.subtitle,
            tags: enhancedContext.tags,
            searchSummary: enhancedContext.searchSummary,
            messageCount: enhancedContext.messageCount,
            lastActivity: enhancedContext.lastActivity,
            context_type: 'enhanced_summary',
            generated_at: new Date().toISOString()
          };
          
          await chatService.updateSessionMetadata(sessionId, enhancedContext.title, sessionMetadata);
          console.log('💾 [SessionSummary] Session title and metadata persisted to database successfully', {
            title: enhancedContext.title,
            metadata: sessionMetadata
          });
        } catch (error) {
          console.error('❌ [SessionSummary] Failed to persist session metadata to database:', error);
          // Don't fail the whole update if title persistence fails
        }

        // Broadcast update event for UI refresh
        this.broadcastSessionUpdate(sessionId, enhancedContext);
      } else {
        console.log(`⚠️ [SessionSummary] No enhanced context found for ${sessionId}`);
      }

    } catch (error) {
      console.error(`❌ [SessionSummary] Error updating session ${sessionId}:`, error);
    }
  }

  /**
   * Extract enhanced context from session messages
   */
  private async extractEnhancedContext(messages: any[]): Promise<{
    title: string;
    subtitle: string;
    tags: string[];
    searchSummary: string;
    messageCount?: number;
    lastActivity?: string;
  } | null> {
    
    // Find the most recent AI message with render instruction
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      // Check both message_metadata and metadata for compatibility
      const metadata = msg.message_metadata || msg.metadata;
      // Fix field name mismatch: database has message_type, not type
      const messageType = msg.message_type || msg.type;
      if (messageType === 'ai' && metadata?.render_instruction) {
        console.log('🎯 [SessionSummary] Found PropertyList render instruction:', metadata.render_instruction);
        const renderInst = metadata.render_instruction;
        
        if (renderInst.type === 'PropertyList') {
          const criteria = {
            filters: renderInst.active_filters || {},
            resultCount: renderInst.items?.length || 0,
            searchLocation: renderInst.spatial_context?.search_address || 'Unknown location',
            title: renderInst.title || 'Property Search Results'
          };

          // Generate intelligent title and subtitle
          const title = this.generateIntelligentTitle(criteria);
          const subtitle = this.generateSearchSummary(criteria);
          const tags = this.generateSearchTags(criteria);

          return {
            title,
            subtitle,
            tags,
            searchSummary: subtitle,
            messageCount: messages.length,
            lastActivity: new Date().toISOString()
          };
        }
      }
    }

    return null;
  }

  /**
   * Generate intelligent title based on search context
   */
  private generateIntelligentTitle(criteria: any): string {
    const { filters, searchLocation, resultCount } = criteria;

    // Extract key search criteria
    const location = searchLocation.includes('Sydney Central Station') ? 'Central Sydney' :
                    searchLocation.includes('Melbourne') ? 'Melbourne' :
                    searchLocation.includes('Brisbane') ? 'Brisbane' :
                    searchLocation;

    const price = filters['Price'] ? ` ${filters['Price'].replace('≤ ', 'under ').replace('≥ ', 'over ')}` : '';
    const bedrooms = filters['Bedrooms'] ? ` ${filters['Bedrooms'].replace('≥ ', '')}+ bed` : '';

    return `${location} Search${price}${bedrooms}`.trim();
  }

  /**
   * Generate search summary from criteria
   */
  private generateSearchSummary(criteria: any): string {
    const { filters, searchLocation, resultCount } = criteria;
    
    const parts = [];
    
    if (filters['Location']) {
      parts.push(filters['Location']);
    }
    if (filters['Price']) {
      parts.push(`Budget: ${filters['Price']}`);
    }
    if (filters['Bedrooms']) {
      parts.push(`Bedrooms: ${filters['Bedrooms']}`);
    }
    
    const summary = parts.join(' • ');
    return summary || `Search in ${searchLocation}`;
  }

  /**
   * Generate tags based on search criteria
   */
  private generateSearchTags(criteria: any): string[] {
    const { filters } = criteria;
    const tags = [];

    if (filters['Price']) {
      const priceTag = filters['Price'].includes('≤') ? 'Budget Conscious' : 
                      filters['Price'].includes('≥') ? 'Premium' : 'Priced';
      tags.push(priceTag);
    }

    if (filters['Bedrooms']) {
      const bedrooms = parseInt(filters['Bedrooms'].replace(/[^\d]/g, ''));
      if (bedrooms >= 3) tags.push('Family Home');
      else if (bedrooms >= 2) tags.push('Couple/Small Family');
      else tags.push('Single/Studio');
    }

    if (filters['Location']?.includes('Central') || filters['Location']?.includes('CBD')) {
      tags.push('City Living');
    }

    tags.push('Active Search');

    return tags.slice(0, 3); // Limit to 3 tags
  }

  /**
   * Broadcast session update to UI components with animation trigger
   */
  private broadcastSessionUpdate(sessionId: string, context: any) {
    // Create custom event for session update
    const event = new CustomEvent('sessionSummaryUpdated', {
      detail: { sessionId, context, shouldAnimate: true }
    });
    
    console.log('📡 [SessionSummary] Broadcasting session update with animation:', { sessionId, context });
    
    // Dispatch the update event
    window.dispatchEvent(event);
    
    // Create separate animation event for UI effects
    const animationEvent = new CustomEvent('sessionUpdateAnimation', {
      detail: { sessionId, animationType: 'wave', duration: 2000 }
    });
    
    window.dispatchEvent(animationEvent);
  }

  /**
   * Check if filters have changed significantly
   */
  hasSearchCriteriaChanged(
    previousFilters: Record<string, string> = {}, 
    newFilters: Record<string, string> = {}
  ): boolean {
    const importantKeys = ['Price', 'Bedrooms', 'Location', 'Property Type'];
    
    return importantKeys.some(key => {
      return previousFilters[key] !== newFilters[key];
    });
  }

  /**
   * Detect if this is the first successful render instruction in session
   */
  async isFirstRenderInstruction(sessionId: string): Promise<boolean> {
    try {
      const { messages } = await chatService.getSessionMessages(sessionId);
      
      let renderInstructionCount = 0;
      for (const msg of messages) {
        // Fix field name mismatch: database has message_type, not type
        const messageType = (msg as any).message_type || msg.type;
        if (messageType === 'ai' && msg.message_metadata?.render_instruction) {
          renderInstructionCount++;
        }
      }
      
      return renderInstructionCount === 1;
    } catch (error) {
      console.error('❌ [SessionSummary] Error checking first render instruction:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sessionSummaryService = SessionSummaryService.getInstance();
