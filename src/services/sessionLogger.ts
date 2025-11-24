/**
 * Frontend session logger service for capturing console logs during chat sessions.
 * 
 * This service captures all console output, API calls, and frontend events
 * during a chat session and sends them to the backend for organized storage.
 * 
 * Features:
 * - Console.* method interception and logging
 * - API call logging with request/response details
 * - Error boundary integration
 * - Real-time log streaming to backend
 * - Session-scoped log organization
 */

import { supabase } from '../lib/supabase';

export interface SessionLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'log';
  message: string;
  source: string;
  data?: any;
  stack?: string;
  sessionId?: string;
}

export interface SessionLoggerConfig {
  sessionId: string;
  sessionTitle: string;
  userId: string;
  enableConsoleCapture?: boolean;
  enableAPILogging?: boolean;
  enableErrorCapture?: boolean;
  bufferSize?: number;
  flushInterval?: number;
}

class SessionLoggerService {
  private config: SessionLoggerConfig | null = null;
  private logBuffer: SessionLogEntry[] = [];
  private originalConsole: any = {};
  private isCapturing = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionStartTime: Date = new Date();

  /**
   * Start session logging with specified configuration
   */
  startSessionLogging(config: SessionLoggerConfig): void {
    this.config = config;
    this.sessionStartTime = new Date();
    this.logBuffer = [];

    console.log(`🟢 [SessionLogger] Starting session logging for ${config.sessionId}: ${config.sessionTitle}`);

    if (config.enableConsoleCapture !== false) {
      this.interceptConsole();
    }

    if (config.enableAPILogging !== false) {
      this.interceptFetch();
    }

    if (config.enableErrorCapture !== false) {
      this.interceptErrors();
    }

    // Start periodic flush
    this.startPeriodicFlush(config.flushInterval || 5000);
    
    this.isCapturing = true;

    // Log session start
    this.addLogEntry('info', 'Session logging started', 'SessionLogger', {
      sessionId: config.sessionId,
      sessionTitle: config.sessionTitle,
      userId: config.userId
    });
  }

  /**
   * Stop session logging and flush remaining logs
   */
  async stopSessionLogging(): Promise<void> {
    if (!this.isCapturing || !this.config) {
      return;
    }

    console.log(`🔴 [SessionLogger] Stopping session logging for ${this.config.sessionId}`);

    this.addLogEntry('info', 'Session logging stopped', 'SessionLogger', {
      duration: Date.now() - this.sessionStartTime.getTime(),
      totalLogs: this.logBuffer.length
    });

    // Flush remaining logs
    await this.flushLogs();

    // Restore original console methods
    this.restoreConsole();
    
    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.isCapturing = false;
    this.config = null;
  }

  /**
   * Intercept console methods to capture all console output
   */
  private interceptConsole(): void {
    const consoleMethods: (keyof Console)[] = ['log', 'debug', 'info', 'warn', 'error'];

    consoleMethods.forEach(method => {
      this.originalConsole[method] = console[method];
      
      (console as any)[method] = (...args: any[]) => {
        try {
          // Call original method first
          this.originalConsole[method](...args);

          // Only capture if we have an active config
          if (!this.config) return;

          // Capture the log safely
          this.addLogEntry(
            method as any,
            args.map(arg => {
              try {
                return typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }).join(' '),
            'Console',
            args.length > 1 ? args.slice(1) : undefined
          );
        } catch (error) {
          // Fallback to original console if our logging fails
          this.originalConsole[method]('SessionLogger error:', error);
        }
      };
    });
  }

  /**
   * Restore original console methods
   */
  private restoreConsole(): void {
    Object.keys(this.originalConsole).forEach(method => {
      (console as any)[method] = this.originalConsole[method];
    });
    this.originalConsole = {};
  }

  /**
   * Intercept fetch API to log HTTP requests and responses
   */
  private interceptFetch(): void {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const startTime = Date.now();
      const url = typeof input === 'string' ? input : input.toString();

      this.addLogEntry('info', `→ HTTP Request: ${init?.method || 'GET'} ${url}`, 'Fetch', {
        url,
        method: init?.method || 'GET',
        headers: init?.headers,
        body: init?.body ? this.sanitizeRequestBody(init.body) : undefined
      });

      try {
        const response = await originalFetch(input, init);
        const duration = Date.now() - startTime;

        // Clone response to read body without consuming it
        const responseClone = response.clone();
        let responseBody;
        try {
          const text = await responseClone.text();
          responseBody = this.sanitizeResponseBody(text);
        } catch {
          responseBody = '[Unable to read response body]';
        }

        this.addLogEntry(
          response.ok ? 'info' : 'warn',
          `← HTTP Response: ${response.status} ${url} (${duration}ms)`,
          'Fetch',
          {
            url,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
            duration
          }
        );

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.addLogEntry('error', `✗ HTTP Error: ${url} (${duration}ms)`, 'Fetch', {
          url,
          error: error instanceof Error ? error.message : String(error),
          duration
        });

        throw error;
      }
    };
  }

  /**
   * Intercept window errors and unhandled promise rejections
   */
  private interceptErrors(): void {
    window.addEventListener('error', (event) => {
      this.addLogEntry('error', `Uncaught Error: ${event.message}`, 'WindowError', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.addLogEntry('error', `Unhandled Promise Rejection: ${event.reason}`, 'PromiseRejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Add a log entry to the buffer
   */
  private addLogEntry(
    level: SessionLogEntry['level'],
    message: string,
    source: string,
    data?: any,
    stack?: string
  ): void {
    if (!this.config) return;

    try {
      const entry: SessionLogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        source,
        sessionId: this.config.sessionId,
        ...(data && { data }),
        ...(stack && { stack })
      };

      this.logBuffer.push(entry);

      // Flush if buffer is full
      const bufferSize = this.config.bufferSize || 100;
      if (this.logBuffer.length >= bufferSize) {
        this.flushLogs().catch(error => {
          console.warn('Session logger flush failed:', error);
        });
      }
    } catch (error) {
      console.warn('Session logger addLogEntry failed:', error);
    }
  }

  /**
   * Start periodic log flushing
   */
  private startPeriodicFlush(interval: number): void {
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, interval);
  }

  /**
   * Flush log buffer to backend
   */
  private async flushLogs(): Promise<void> {
    if (!this.config || this.logBuffer.length === 0) {
      return;
    }

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await this.sendLogsToBackend(logsToFlush);
    } catch (error) {
      // Use original console to avoid recursive logging
      if (this.originalConsole.error) {
        this.originalConsole.error('Failed to flush logs to backend:', error);
      } else {
        console.error('Failed to flush logs to backend:', error);
      }
      
      // Don't put logs back in buffer to avoid memory leaks during backend outages
      // Instead, just drop the logs if backend is unavailable
    }
  }

  /**
   * Send logs to backend service
   */
  private async sendLogsToBackend(logs: SessionLogEntry[]): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.access_token) {
        throw new Error('No authentication token available');
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${baseUrl}/api/v1/session-logs/frontend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.config!.sessionId,
          logs
        })
      });

      if (!response.ok) {
        throw new Error(`Backend logging failed: ${response.statusText}`);
      }
    } catch (error) {
      // Use original console to avoid recursive logging
      this.originalConsole.error('Failed to send logs to backend:', error);
      throw error;
    }
  }

  /**
   * Sanitize request body for logging (remove sensitive data)
   */
  private sanitizeRequestBody(body: any): any {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        return this.sanitizeObject(parsed);
      } catch {
        return '[Non-JSON body]';
      }
    }
    return this.sanitizeObject(body);
  }

  /**
   * Sanitize response body for logging (truncate if too large)
   */
  private sanitizeResponseBody(body: string): any {
    if (body.length > 10000) {
      return body.substring(0, 10000) + '... [truncated]';
    }
    
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  /**
   * Remove sensitive information from objects
   */
  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sensitiveKeys = ['password', 'token', 'authorization', 'cookie', 'session', 'secret'];
    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Get current session info
   */
  getCurrentSession(): SessionLoggerConfig | null {
    return this.config;
  }

  /**
   * Check if currently capturing logs
   */
  isLogging(): boolean {
    return this.isCapturing;
  }

  /**
   * Manually add a custom log entry
   */
  log(level: SessionLogEntry['level'], message: string, data?: any): void {
    this.addLogEntry(level, message, 'Manual', data);
  }

  /**
   * Get log statistics for current session
   */
  getLogStats(): { totalLogs: number; logsByLevel: Record<string, number>; bufferSize: number } {
    const logsByLevel = this.logBuffer.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: this.logBuffer.length,
      logsByLevel,
      bufferSize: this.logBuffer.length
    };
  }
}

// Export singleton instance
export const sessionLogger = new SessionLoggerService();

// React hook for easy integration
export const useSessionLogger = () => {
  const startLogging = (config: SessionLoggerConfig) => {
    sessionLogger.startSessionLogging(config);
  };

  const stopLogging = async () => {
    await sessionLogger.stopSessionLogging();
  };

  const logCustom = (level: SessionLogEntry['level'], message: string, data?: any) => {
    sessionLogger.log(level, message, data);
  };

  return {
    startLogging,
    stopLogging,
    logCustom,
    isLogging: sessionLogger.isLogging(),
    currentSession: sessionLogger.getCurrentSession(),
    stats: sessionLogger.getLogStats()
  };
};

export default sessionLogger;