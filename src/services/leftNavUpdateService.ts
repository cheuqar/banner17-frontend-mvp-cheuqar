/**
 * Service for real-time Left Navigation updates during handoff events
 */

export interface PlaceholderSession {
  id: string;
  type: 'placeholder';
  title: string;
  subtitle: string;
  agent_name: string;
  agent_avatar: string;
  isLoading: true;
  timestamp: number;
}

export interface HandoffEventData {
  type: 'handoff_start' | 'handoff_complete' | 'handoff_error';
  sessionId?: string;
  placeholderSessionId?: string;
  propertyInfo?: {
    title: string;
    propertyId: string;
    address?: string;
  };
  newSessionData?: any;
  error?: string;
  journeyId?: string; // NEW: Direct journey ID for handoff events
}

class LeftNavUpdateService {
  private static instance: LeftNavUpdateService;

  static getInstance(): LeftNavUpdateService {
    if (!LeftNavUpdateService.instance) {
      LeftNavUpdateService.instance = new LeftNavUpdateService();
    }
    return LeftNavUpdateService.instance;
  }

  /**
   * Notify Left Navigation that Isaac handoff is starting
   */
  notifyHandoffStart(propertyInfo: { title: string; propertyId: string; address?: string }) {
    const placeholderSessionId = `placeholder_${Date.now()}_${propertyInfo.propertyId}`;
    
    console.log('📡 [LeftNavUpdate] Broadcasting handoff start:', {
      placeholderSessionId,
      propertyInfo
    });

    const event = new CustomEvent('leftNavHandoffEvent', {
      detail: {
        type: 'handoff_start',
        placeholderSessionId,
        propertyInfo
      } as HandoffEventData
    });

    window.dispatchEvent(event);
    return placeholderSessionId;
  }

  /**
   * Notify Left Navigation that Isaac session was successfully created
   */
  notifyHandoffComplete(placeholderSessionId: string, newSessionData: any, parentSessionId?: string, journeyId?: string) {
    console.log('📡 [LeftNavUpdate] Broadcasting handoff complete:', {
      placeholderSessionId,
      sessionId: newSessionData.id,
      parentSessionId,
      journeyId
    });

    const event = new CustomEvent('leftNavHandoffEvent', {
      detail: {
        type: 'handoff_complete',
        placeholderSessionId,
        sessionId: newSessionData.id,
        parentSessionId,
        newSessionData,
        journeyId
      } as HandoffEventData
    });

    window.dispatchEvent(event);
  }

  /**
   * Notify Left Navigation that handoff failed
   */
  notifyHandoffError(placeholderSessionId: string, error: string) {
    console.log('📡 [LeftNavUpdate] Broadcasting handoff error:', {
      placeholderSessionId,
      error
    });

    const event = new CustomEvent('leftNavHandoffEvent', {
      detail: {
        type: 'handoff_error',
        placeholderSessionId,
        error
      } as HandoffEventData
    });

    window.dispatchEvent(event);
  }

  /**
   * Create placeholder session data for Left Navigation
   */
  createPlaceholderSession(placeholderSessionId: string, propertyInfo: { title: string; propertyId: string; address?: string }): PlaceholderSession {
    return {
      id: placeholderSessionId,
      type: 'placeholder',
      title: 'Creating Property Analysis...',
      subtitle: propertyInfo.address || propertyInfo.title,
      agent_name: 'Isaac',
      agent_avatar: '/px-isaac.png',
      isLoading: true,
      timestamp: Date.now()
    };
  }
}

export const leftNavUpdateService = LeftNavUpdateService.getInstance();
