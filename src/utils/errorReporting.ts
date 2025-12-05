/**
 * Error Reporting Utilities
 *
 * Provides helper functions for manually reporting errors and breadcrumbs to BugSnag.
 * Use these utilities in catch blocks or when you want to log specific events.
 */

import Bugsnag from '@bugsnag/js';
import { isBugsnagEnabled } from '../config/bugsnag';

/**
 * Report an error to BugSnag with optional context metadata
 *
 * @param error - The error to report
 * @param context - Optional metadata to attach to the error report
 *
 * @example
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   reportError(error as Error, { operation: 'riskyOperation', userId: '123' });
 * }
 */
export const reportError = (error: Error, context?: Record<string, any>) => {
  // Always log to console for development
  console.error('[Error]', error);

  if (isBugsnagEnabled()) {
    Bugsnag.notify(error, (event) => {
      if (context) {
        event.addMetadata('context', context);
      }
    });
  }
};

/**
 * Leave a breadcrumb for debugging purposes
 * Breadcrumbs are attached to error reports to show what happened before the error
 *
 * @param message - Description of the event
 * @param metadata - Optional additional data
 * @param type - Type of breadcrumb (default: 'manual')
 *
 * @example
 * leaveBreadcrumb('User clicked submit', { formId: 'search-form' });
 */
export const leaveBreadcrumb = (
  message: string,
  metadata?: Record<string, any>,
  type: 'error' | 'log' | 'navigation' | 'process' | 'request' | 'state' | 'user' | 'manual' = 'manual'
) => {
  if (isBugsnagEnabled()) {
    Bugsnag.leaveBreadcrumb(message, metadata, type);
  }
};

/**
 * Report a non-error message to BugSnag
 * Use for tracking events that aren't errors but are important to know about
 *
 * @param message - The message to report
 * @param severity - Severity level ('info' | 'warning' | 'error')
 *
 * @example
 * reportMessage('User exceeded rate limit', 'warning');
 */
export const reportMessage = (
  message: string,
  severity: 'info' | 'warning' | 'error' = 'info'
) => {
  if (isBugsnagEnabled()) {
    Bugsnag.notify(new Error(message), (event) => {
      event.severity = severity;
    });
  }
};

/**
 * Add metadata that will be attached to all future error reports
 * Useful for setting persistent context like feature flags or app state
 *
 * @param section - The metadata section name
 * @param data - The metadata to add
 *
 * @example
 * addMetadata('feature', { darkMode: true, betaUser: false });
 */
export const addMetadata = (section: string, data: Record<string, any>) => {
  if (isBugsnagEnabled()) {
    Bugsnag.addMetadata(section, data);
  }
};

/**
 * Clear metadata from a specific section
 *
 * @param section - The metadata section to clear
 */
export const clearMetadata = (section: string) => {
  if (isBugsnagEnabled()) {
    Bugsnag.clearMetadata(section);
  }
};
