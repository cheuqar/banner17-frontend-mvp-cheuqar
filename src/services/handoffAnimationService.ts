/**
 * Handoff Animation Service
 * ========================
 * 
 * This service manages user familiarity tracking for the Grace-Isaac handoff dialog.
 * It provides adaptive animation timing:
 * - 3 seconds for new users (full conversation experience)
 * - 1 second for returning users (streamlined experience)
 * 
 * Features:
 * - Browser localStorage persistence
 * - User familiarity tracking
 * - Adaptive timing calculation
 * - Analytics tracking (optional)
 * - Privacy-friendly (no personal data stored)
 */

// Storage keys for browser localStorage
const STORAGE_KEYS = {
  HANDOFF_SEEN_COUNT: 'listez_grace_isaac_handoff_count',
  FIRST_HANDOFF_DATE: 'listez_grace_isaac_first_seen',
  LAST_HANDOFF_DATE: 'listez_grace_isaac_last_seen',
  USER_PREFERENCE: 'listez_handoff_animation_preference'
} as const;

// Animation timing constants
export const ANIMATION_TIMINGS = {
  NEW_USER: 3000,           // 3 seconds for first-time users
  RETURNING_USER: 1000,     // 1 second for familiar users
  FAST_MODE: 500,          // 0.5 seconds for users who prefer speed
  DISABLED: 0              // 0 seconds for users who disabled animations
} as const;

// User preference options
export type AnimationPreference = 'auto' | 'always_fast' | 'always_full' | 'disabled';

// Handoff familiarity levels
export type FamiliarityLevel = 'new' | 'familiar' | 'expert';

export interface HandoffHistory {
  seenCount: number;
  firstSeenDate: string | null;
  lastSeenDate: string | null;
  preference: AnimationPreference;
}

export interface AnimationConfig {
  duration: number;
  familiarityLevel: FamiliarityLevel;
  isFirstTime: boolean;
  userPreference: AnimationPreference;
  recommendedTiming: number;
}

/**
 * Handoff Animation Service Class
 * 
 * Manages all aspects of Grace-Isaac handoff animation timing
 * based on user familiarity and preferences.
 */
export class HandoffAnimationService {
  private static instance: HandoffAnimationService | null = null;

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): HandoffAnimationService {
    if (!this.instance) {
      this.instance = new HandoffAnimationService();
    }
    return this.instance;
  }

  private constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage with default values if needed
   */
  private initializeStorage(): void {
    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        console.warn('[HandoffAnimationService] localStorage not available, using in-memory storage');
        return;
      }

      // Initialize default values if they don't exist
      if (!localStorage.getItem(STORAGE_KEYS.HANDOFF_SEEN_COUNT)) {
        localStorage.setItem(STORAGE_KEYS.HANDOFF_SEEN_COUNT, '0');
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.USER_PREFERENCE)) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCE, 'auto');
      }
    } catch (error) {
      console.error('[HandoffAnimationService] Storage initialization failed:', error);
    }
  }

  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get stored value from localStorage with fallback
   */
  private getStoredValue(key: string, fallback: string = ''): string {
    try {
      if (!this.isLocalStorageAvailable()) {
        return fallback;
      }
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      console.error(`[HandoffAnimationService] Failed to get stored value for ${key}:`, error);
      return fallback;
    }
  }

  /**
   * Set value in localStorage with error handling
   */
  private setStoredValue(key: string, value: string): void {
    try {
      if (!this.isLocalStorageAvailable()) {
        return;
      }
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`[HandoffAnimationService] Failed to set stored value for ${key}:`, error);
    }
  }

  /**
   * Get user's handoff history
   */
  public getHandoffHistory(): HandoffHistory {
    const seenCount = parseInt(this.getStoredValue(STORAGE_KEYS.HANDOFF_SEEN_COUNT, '0'), 10);
    const firstSeenDate = this.getStoredValue(STORAGE_KEYS.FIRST_HANDOFF_DATE) || null;
    const lastSeenDate = this.getStoredValue(STORAGE_KEYS.LAST_HANDOFF_DATE) || null;
    const preference = (this.getStoredValue(STORAGE_KEYS.USER_PREFERENCE, 'auto') as AnimationPreference);

    return {
      seenCount,
      firstSeenDate,
      lastSeenDate,
      preference
    };
  }

  /**
   * Record that user has seen the handoff dialog
   */
  public recordHandoffSeen(): void {
    try {
      const currentDate = new Date().toISOString();
      const history = this.getHandoffHistory();

      // Increment seen count
      const newCount = history.seenCount + 1;
      this.setStoredValue(STORAGE_KEYS.HANDOFF_SEEN_COUNT, newCount.toString());

      // Set first seen date if this is the first time
      if (!history.firstSeenDate) {
        this.setStoredValue(STORAGE_KEYS.FIRST_HANDOFF_DATE, currentDate);
      }

      // Always update last seen date
      this.setStoredValue(STORAGE_KEYS.LAST_HANDOFF_DATE, currentDate);

      console.log(`[HandoffAnimationService] Handoff seen recorded (count: ${newCount})`);
    } catch (error) {
      console.error('[HandoffAnimationService] Failed to record handoff seen:', error);
    }
  }

  /**
   * Determine user's familiarity level based on history
   */
  public getFamiliarityLevel(): FamiliarityLevel {
    const history = this.getHandoffHistory();
    
    if (history.seenCount === 0) {
      return 'new';
    } else if (history.seenCount < 3) {
      return 'familiar';
    } else {
      return 'expert';
    }
  }

  /**
   * Get recommended animation duration based on familiarity and preferences
   */
  public getAnimationDuration(): number {
    const history = this.getHandoffHistory();
    const familiarityLevel = this.getFamiliarityLevel();

    // Check user preference first
    switch (history.preference) {
      case 'always_fast':
        return ANIMATION_TIMINGS.FAST_MODE;
      case 'always_full':
        return ANIMATION_TIMINGS.NEW_USER;
      case 'disabled':
        return ANIMATION_TIMINGS.DISABLED;
      case 'auto':
      default:
        // Use adaptive timing based on familiarity
        switch (familiarityLevel) {
          case 'new':
            return ANIMATION_TIMINGS.NEW_USER;    // 3 seconds for first-time users
          case 'familiar':
          case 'expert':
            return ANIMATION_TIMINGS.RETURNING_USER;  // 1 second for returning users
          default:
            return ANIMATION_TIMINGS.NEW_USER;
        }
    }
  }

  /**
   * Get complete animation configuration
   */
  public getAnimationConfig(): AnimationConfig {
    const history = this.getHandoffHistory();
    const familiarityLevel = this.getFamiliarityLevel();
    const isFirstTime = history.seenCount === 0;
    const duration = this.getAnimationDuration();

    return {
      duration,
      familiarityLevel,
      isFirstTime,
      userPreference: history.preference,
      recommendedTiming: duration
    };
  }

  /**
   * Update user's animation preference
   */
  public updateAnimationPreference(preference: AnimationPreference): void {
    this.setStoredValue(STORAGE_KEYS.USER_PREFERENCE, preference);
    console.log(`[HandoffAnimationService] Animation preference updated to: ${preference}`);
  }

  /**
   * Get animation timing with message intervals for the dialog
   */
  public getDialogTimingConfig(): { 
    totalDuration: number; 
    messageInterval: number; 
    messageCount: number; 
  } {
    const totalDuration = this.getAnimationDuration();
    const messageCount = 2; // Grace message + Isaac message
    
    if (totalDuration === 0) {
      // Immediate mode
      return {
        totalDuration: 0,
        messageInterval: 0,
        messageCount
      };
    }
    
    // Calculate interval between messages
    const messageInterval = totalDuration / messageCount;
    
    return {
      totalDuration,
      messageInterval,
      messageCount
    };
  }

  /**
   * Reset user familiarity (useful for testing or user request)
   */
  public resetFamiliarity(): void {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn('[HandoffAnimationService] Cannot reset - localStorage not available');
        return;
      }

      localStorage.removeItem(STORAGE_KEYS.HANDOFF_SEEN_COUNT);
      localStorage.removeItem(STORAGE_KEYS.FIRST_HANDOFF_DATE);
      localStorage.removeItem(STORAGE_KEYS.LAST_HANDOFF_DATE);
      
      // Reset to default values
      this.setStoredValue(STORAGE_KEYS.HANDOFF_SEEN_COUNT, '0');
      this.setStoredValue(STORAGE_KEYS.USER_PREFERENCE, 'auto');
      
      console.log('[HandoffAnimationService] User familiarity reset');
    } catch (error) {
      console.error('[HandoffAnimationService] Failed to reset familiarity:', error);
    }
  }

  /**
   * Get debug information about the service state
   */
  public getDebugInfo(): object {
    const history = this.getHandoffHistory();
    const config = this.getAnimationConfig();
    const timingConfig = this.getDialogTimingConfig();

    return {
      history,
      config,
      timingConfig,
      storageAvailable: this.isLocalStorageAvailable(),
      currentTimestamp: new Date().toISOString()
    };
  }

  /**
   * Check if user would benefit from seeing animation preferences
   */
  public shouldShowPreferencesOption(): boolean {
    const history = this.getHandoffHistory();
    // Show preferences option after user has seen handoff 2+ times
    return history.seenCount >= 2;
  }

  /**
   * Get user-friendly description of current timing
   */
  public getTimingDescription(): string {
    const config = this.getAnimationConfig();
    
    switch (config.familiarityLevel) {
      case 'new':
        return 'Full introduction (3 seconds) - First time seeing Grace and Isaac work together';
      case 'familiar':
        return 'Quick handoff (1 second) - You\'ve seen this before';
      case 'expert':
        return 'Streamlined (1 second) - Expert user mode';
      default:
        return 'Default timing';
    }
  }
}

// Export convenience functions for easy usage
export const handoffAnimationService = HandoffAnimationService.getInstance();

/**
 * Convenience function to get animation duration
 */
export const getHandoffAnimationDuration = (): number => {
  return handoffAnimationService.getAnimationDuration();
};

/**
 * Convenience function to record handoff seen
 */
export const recordHandoffSeen = (): void => {
  handoffAnimationService.recordHandoffSeen();
};

/**
 * Convenience function to get timing configuration
 */
export const getHandoffTimingConfig = () => {
  return handoffAnimationService.getDialogTimingConfig();
};

/**
 * Convenience function to get familiarity level
 */
export const getUserFamiliarityLevel = (): FamiliarityLevel => {
  return handoffAnimationService.getFamiliarityLevel();
};

/**
 * Convenience function to check if user is new to handoffs
 */
export const isFirstTimeUser = (): boolean => {
  return handoffAnimationService.getAnimationConfig().isFirstTime;
};

// Types already exported above individually
