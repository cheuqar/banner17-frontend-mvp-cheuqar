/**
 * Global Hover Manager
 * Ensures only one hover preview is active across all property list components
 */

interface HoverInstance {
  id: string;
  closeCallback: () => void;
}

class GlobalHoverManager {
  private activeHover: HoverInstance | null = null;

  /**
   * Register a new hover preview and close any existing ones
   */
  setActiveHover(id: string, closeCallback: () => void): void {
    // Close any existing hover preview
    if (this.activeHover && this.activeHover.id !== id) {
      this.activeHover.closeCallback();
    }

    // Set the new active hover
    this.activeHover = {
      id,
      closeCallback
    };
  }

  /**
   * Clear the active hover if it matches the provided id
   */
  clearHover(id: string): void {
    if (this.activeHover && this.activeHover.id === id) {
      this.activeHover = null;
    }
  }

  /**
   * Force close all hover previews
   */
  closeAll(): void {
    if (this.activeHover) {
      this.activeHover.closeCallback();
      this.activeHover = null;
    }
  }

  /**
   * Check if a specific hover is currently active
   */
  isActive(id: string): boolean {
    return this.activeHover?.id === id;
  }
}

// Export singleton instance
export const globalHoverManager = new GlobalHoverManager();
