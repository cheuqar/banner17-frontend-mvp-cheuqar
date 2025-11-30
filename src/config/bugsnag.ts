/**
 * BugSnag Configuration
 *
 * Initializes BugSnag for client-side error monitoring.
 * Only enabled in production/staging environments.
 */

import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React from 'react';

let bugsnagErrorBoundary: React.ComponentType<{ children: React.ReactNode }> | null = null;

/**
 * Initialize BugSnag for error tracking
 * Should be called at the entry point of the application (main.tsx)
 */
export const initBugsnag = () => {
  // Only initialize in production or when explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_BUGSNAG === 'true') {
    const apiKey = import.meta.env.VITE_BUGSNAG_API_KEY;

    if (!apiKey) {
      console.warn('[BugSnag] API key not configured. Error tracking disabled.');
      return;
    }

    Bugsnag.start({
      apiKey,
      plugins: [new BugsnagPluginReact()],

      // Environment tracking
      releaseStage: import.meta.env.MODE, // 'production', 'staging', 'development'
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

      // Only send errors in production/staging
      enabledReleaseStages: ['production', 'staging'],

      // Filter out noisy errors
      enabledErrorTypes: {
        unhandledExceptions: true,
        unhandledRejections: true,
      },

      // Breadcrumbs for debugging
      enabledBreadcrumbTypes: ['error', 'navigation', 'request', 'user'],

      // Strip sensitive data
      redactedKeys: ['Authorization', 'password', 'token', 'apiKey', 'api_key', 'accessToken', 'access_token'],

      // Before send hook
      onError: (event) => {
        // Remove auth headers from request metadata
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['authorization'];
        }
        return true;
      },
    });

    // Get the React error boundary component
    bugsnagErrorBoundary = Bugsnag.getPlugin('react')?.createErrorBoundary(React) || null;

    console.log('[BugSnag] Initialized for', import.meta.env.MODE, 'environment');
  }
};

/**
 * Get the BugSnag error boundary component
 * Returns null if BugSnag is not initialized
 */
export const getBugsnagErrorBoundary = () => bugsnagErrorBoundary;

/**
 * Check if BugSnag is enabled
 */
export const isBugsnagEnabled = () => {
  return import.meta.env.PROD || import.meta.env.VITE_ENABLE_BUGSNAG === 'true';
};

export default Bugsnag;
