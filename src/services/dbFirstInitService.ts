/**
 * DB-First Initialization Service
 * 
 * This service implements the DB-first approach for session initialization,
 * replacing localStorage-based session restoration with database-driven selection.
 * 
 * Key Features:
 * 1. Preloads journeys and sessions from database
 * 2. Selects most recent session from database (not localStorage)
 * 3. Provides initialization loading states
 * 4. Ensures proper session-journey linking
 */

import { JourneyService } from './journeyService';
import type { Journey } from './journeyService';

export interface InitializationState {
  status: 'initializing' | 'ready' | 'error';
  progress?: string;
  error?: string;
}

export interface SessionInitData {
  sessionId: string;
  journeyId: string;
  sessionTitle: string;
  journeyTitle: string;
  scope: string;
  updatedAt: string;
}

export interface InitializationResult {
  journeys: Array<{
    journey: Journey;
    sessions: Array<{
      id: string;
      title: string;
      scope: string;
      updated_at: string;
      session_order: number;
    }>;
  }>;
  mostRecentSession: SessionInitData | null;
  initializationState: InitializationState;
}

class DbFirstInitService {
  private static instance: DbFirstInitService;
  
  public static getInstance(): DbFirstInitService {
    if (!DbFirstInitService.instance) {
      DbFirstInitService.instance = new DbFirstInitService();
    }
    return DbFirstInitService.instance;
  }

  /**
   * Initialize the application with DB-first approach
   * This replaces the localStorage-based initialization
   */
  async initializeApplication(): Promise<InitializationResult> {
    console.log('🚀 [DbFirstInit] Starting DB-first application initialization...');
    
    try {
      const initState: InitializationState = {
        status: 'initializing',
        progress: 'Loading journeys and sessions from database...'
      };

      // Step 1: Load journeys with their sessions
      console.log('📋 [DbFirstInit] Step 1: Loading journeys with sessions...');
      const journeys = await JourneyService.getJourneysWithSessions();
      
      // ✅ PERFORMANCE OPTIMIZATION: Removed most-recent-session API call (unused - auto-loading disabled)

      console.log('✅ [DbFirstInit] Initialization complete:', {
        journeyCount: journeys.length,
        totalSessions: journeys.reduce((sum, j) => sum + j.sessions.length, 0)
      });

      return {
        journeys,
        mostRecentSession: null, // ✅ OPTIMIZATION: No longer fetching unused most recent session
        initializationState: {
          status: 'ready',
          progress: 'Application ready'
        }
      };

    } catch (error) {
      console.error('❌ [DbFirstInit] Initialization failed:', error);
      
      return {
        journeys: [],
        mostRecentSession: null,
        initializationState: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown initialization error'
        }
      };
    }
  }

  /**
   * Get the most recent session without full initialization
   * Useful for quick session restoration
   */
  async getMostRecentSession(): Promise<SessionInitData | null> {
    try {
      console.log('🔍 [DbFirstInit] Getting most recent session...');
      return await JourneyService.getMostRecentSession();
    } catch (error) {
      console.error('❌ [DbFirstInit] Failed to get most recent session:', error);
      return null;
    }
  }

  /**
   * Check if localStorage session is still valid in database
   * This helps with graceful migration from localStorage to DB-first
   */
  async validateLocalStorageSession(localSessionId: string): Promise<boolean> {
    try {
      console.log('🔍 [DbFirstInit] Validating localStorage session:', localSessionId);
      
      // Try to find the session in a journey
      const journeyForSession = await JourneyService.findJourneyBySession(localSessionId);
      const isValid = journeyForSession !== null;
      
      console.log('✅ [DbFirstInit] localStorage session validation:', {
        sessionId: localSessionId,
        isValid,
        foundInJourney: journeyForSession?.title
      });
      
      return isValid;
    } catch (error) {
      console.warn('⚠️ [DbFirstInit] Could not validate localStorage session:', error);
      return false;
    }
  }

  /**
   * Graceful migration from localStorage to DB-first approach
   * This provides backward compatibility during the transition
   */
  async migrateFromLocalStorage(): Promise<SessionInitData | null> {
    const localSessionId = localStorage.getItem('chatSessionId');
    
    if (!localSessionId) {
      console.log('ℹ️ [DbFirstInit] No localStorage session to migrate');
      return await this.getMostRecentSession();
    }

    console.log('🔄 [DbFirstInit] Attempting to migrate from localStorage:', localSessionId);

    // Check if localStorage session is still valid
    const isValid = await this.validateLocalStorageSession(localSessionId);
    
    if (isValid) {
      console.log('✅ [DbFirstInit] localStorage session is valid, using it');
      
      // Try to get session details
      try {
        const journeyForSession = await JourneyService.findJourneyBySession(localSessionId);
        if (journeyForSession) {
          // Clear localStorage to complete migration
          localStorage.removeItem('chatSessionId');
          
          return {
            sessionId: localSessionId,
            journeyId: journeyForSession.id,
            sessionTitle: 'Migrated Session',
            journeyTitle: journeyForSession.title,
            scope: 'exploration', // Default scope for migrated sessions
            updatedAt: new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn('⚠️ [DbFirstInit] Could not get details for localStorage session');
      }
    }

    console.log('🔄 [DbFirstInit] localStorage session invalid, using DB-first approach');
    localStorage.removeItem('chatSessionId'); // Clean up invalid localStorage
    
    return await this.getMostRecentSession();
  }
}

// Export singleton instance
export const dbFirstInitService = DbFirstInitService.getInstance();
export default dbFirstInitService;
