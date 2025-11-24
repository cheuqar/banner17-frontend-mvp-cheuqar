/**
 * Debug Trace Normalization Utilities
 * 
 * These utilities ensure consistent debug trace handling across all session loading flows.
 * Both page refresh auto-resume and direct navigation resume MUST use these shared functions.
 */

export interface DebugTraceEntry {
  agent: string;
  reasoning: string;
  tokens_in: number;
  tokens_out: number;
  duration_ms: number;
  observations: string[];
  [key: string]: any;
}

/**
 * Normalizes debug trace from various formats into a consistent array format
 * 
 * Handles two main formats:
 * 1. Direct array format: DebugTraceEntry[]
 * 2. Structured object format: { agents: DebugTraceEntry[], debug_mode: boolean, ... }
 * 
 * @param debugTraceRaw - Raw debug trace data from API/database
 * @param messageId - Message ID for logging purposes
 * @param context - Context string for logging (e.g., "LoadSession", "SessionResume")
 * @returns Normalized array of debug trace entries, or null if no valid data
 */
export function normalizeDebugTrace(
  debugTraceRaw: any, 
  messageId: string, 
  context: string = "Unknown"
): Array<Record<string, any>> | null {
  if (!debugTraceRaw) {
    console.log(`🐛 [${context}] No debug trace in metadata for message:`, messageId);
    return null;
  }

  console.log(`🐛 [${context}] Debug trace found in metadata:`, {
    debugTraceType: typeof debugTraceRaw,
    debugTraceKeys: typeof debugTraceRaw === 'object' ? Object.keys(debugTraceRaw) : 'not object',
    debugTraceValue: debugTraceRaw,
    messageId
  });

  // Handle direct array format (old format)
  if (Array.isArray(debugTraceRaw)) {
    console.log(`🐛 [${context}] Using old format (array):`, debugTraceRaw.length, 'agents');
    return debugTraceRaw as Array<Record<string, any>>;
  }
  
  // Handle structured object format (new format)
  if (debugTraceRaw.agents && Array.isArray(debugTraceRaw.agents)) {
    console.log(`🐛 [${context}] Using new format (object.agents):`, debugTraceRaw.agents.length, 'agents');
    return debugTraceRaw.agents as Array<Record<string, any>>;
  }

  // Unknown format
  console.warn(`🐛 [${context}] Unexpected debug trace format:`, debugTraceRaw);
  return null;
}

/**
 * Creates a LangGraphExecutionData object with normalized debug trace
 * 
 * This ensures consistent structure across all session loading flows.
 * 
 * @param message - Raw message from API/database
 * @param context - Context string for logging
 * @returns LangGraphExecutionData object or undefined
 */
export function createLangGraphExecution(message: any, context: string = "Unknown") {
  const normalizedDebugTrace = normalizeDebugTrace(message.metadata?.debug_trace, message.id, context);
  
  // Handle messages with trace metadata (full execution data)
  if (message.metadata?.trace) {
    const totalTokensIn = message.metadata.trace.reduce((sum: number, step: any) => sum + (step.tokens_in || 0), 0);
    const totalTokensOut = message.metadata.trace.reduce((sum: number, step: any) => sum + (step.tokens_out || 0), 0);
    const totalCost = message.metadata.trace.reduce((sum: number, step: any) => sum + (step.estimated_cost || 0), 0);
    
    // Calculate total duration from trace steps if not provided
    const totalDuration = message.metadata.total_duration_ms || 
      message.metadata.trace.reduce((sum: number, step: any) => sum + (step.duration_ms || 0), 0);
    
    const execution = {
      trace: message.metadata.trace,
      debug_trace: normalizedDebugTrace || undefined,  // Convert null to undefined for type compatibility
      debug_mode: message.metadata.debug_mode,
      total_duration_ms: totalDuration,
      total_tokens_in: totalTokensIn,
      total_tokens_out: totalTokensOut,
      total_estimated_cost: totalCost,
      architecture: message.metadata.architecture || 'pure_langgraph'
    };

    console.log(`🐛 [${context}] Final langGraphExecution for message:`, message.id, {
      hasDebugTrace: !!execution.debug_trace,
      debugTraceLength: execution.debug_trace ? execution.debug_trace.length : 0,
      debugMode: execution.debug_mode,
      architecture: execution.architecture
    });

    return execution;
  }
  
  // Handle debug-only messages (no trace metadata but has debug data)
  if (normalizedDebugTrace || message.metadata?.debug_mode) {
    const execution = {
      trace: [],  // Empty array instead of null for type compatibility
      debug_trace: normalizedDebugTrace || undefined,  // Convert null to undefined for type compatibility
      debug_mode: message.metadata?.debug_mode,
      total_duration_ms: 0,  // Default values for missing trace data
      total_tokens_in: 0,
      total_tokens_out: 0,
      total_estimated_cost: 0,
      architecture: message.metadata?.architecture || 'pure_langgraph'
    };
    
    console.log(`🐛 [${context}] Created langGraphExecution for debug-only message:`, message.id, {
      hasDebugTrace: !!execution.debug_trace,
      debugTraceLength: execution.debug_trace ? execution.debug_trace.length : 0,
      debugMode: execution.debug_mode,
      architecture: execution.architecture
    });

    return execution;
  }

  // No debug data available
  return undefined;
}
