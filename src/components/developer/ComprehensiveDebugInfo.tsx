import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Divider,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  BugReport,
  ExpandMore,
  Close,
  Memory,
  AttachMoney,
  Build,
  SmartToy,
  Timeline,
  Info,
  Speed,
  Storage,
  NetworkCheck,
  Error,
  CheckCircle,
  Warning,
  Computer,
  Api,
  DataObject,
  Refresh,
  ContentCopy,
  Download,
  Person,
  Settings,
  Analytics,
  Security,
  Language,
  Schedule,
  Public,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getModelDisplayName, calculateModelCost, MODEL_PRICING } from '../../config/modelPricing';
import JourneyService from '../../services/journeyService';

interface ComprehensiveDebugData {
  // Current User Information (Enhanced)
  currentUser: {
    // Basic Info
    userId: string | null;
    email: string | null;
    displayName: string | null;
    isAuthenticated: boolean;
    
    // Authentication Details
    authProvider: string;
    tokenExpiry?: string;
    lastSignIn?: string;
    emailConfirmed: boolean;
    phoneConfirmed: boolean;
    
    // Session Details  
    sessionStartTime: string;
    sessionDuration: number;
    userAgent: string;
    ipAddress?: string;
    
    // User Metadata
    userMetadata: any;
    appMetadata: any;
    
    // Permissions & Roles
    role?: string;
    permissions?: string[];
  };

  // Session Information (Enhanced)
  sessionInfo: {
    sessionId: string | null;
    sessionName: string;
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    createdAt?: string;
    lastActivity?: string;
    isLoading: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'connecting';
    sessionVersion: string;
  };

  // Journey & Navigation Information (New)
  journeyInfo: {
    // Current Journey
    currentJourneyId: string | null;
    currentJourneyTitle: string | null;
    currentJourneyIcon: string | null;
    currentJourneyColor: string | null;
    
    // Journey Statistics
    totalJourneys: number;
    activeJourneys: number;
    totalSessions: number;
    
    // Current Session Context
    currentSessionInJourney: boolean;
    currentSessionType: string | null;
    currentAgent: string | null;
    currentAgentAvatar: string | null;
    
    // Journey History
    recentJourneys: Array<{
      id: string;
      title: string;
      icon: string;
      sessionCount: number;
      lastActivity: string;
    }>;
    
    // Session Hierarchy
    sessionHierarchy: Array<{
      sessionId: string;
      sessionType: string;
      agentName: string;
      isActive: boolean;
      depth: number;
    }>;
    
    // Journey Performance
    journeyLoadTime: number;
    navigationTreeSize: number;
  };

  // LLM Model & Cost Information (New)
  modelInfo: {
    currentModel: string;
    modelDisplayName: string;
    modelProvider: string;
    
    // Pricing Information
    inputTokenCost: number;
    outputTokenCost: number;
    modelTier: string;
    pricingLastUpdated: string;
    
    // Usage Statistics
    totalTokensUsed: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    avgCostPerMessage: number;
    avgTokensPerMessage: number;
    
    // Model Configuration
    maxTokenLimit?: number;
    temperatureSetting?: number;
    modelCapabilities: string[];
  };

  // Environment & Configuration (Enhanced)
  environmentInfo: {
    // Runtime Environment
    nodeEnv: string;
    debugMode: boolean;
    buildVersion?: string;
    deploymentEnv: string;
    
    // API Configuration (with masked sensitive data)
    apiBaseUrl: string;
    wsBaseUrl?: string;
    supabaseUrl: string;
    supabaseAnonKey: string; // masked
    
    // Feature Flags
    featureFlags: Record<string, boolean>;
    
    // All Relevant Environment Variables (sensitive data masked)
    environmentVariables: Record<string, string>;
  };

  // Tools & API Analysis (Implemented)
  toolsApiInfo: {
    // Available Tools
    availableTools: Array<{
      name: string;
      enabled: boolean;
      description: string;
      usageCount: number;
      lastUsed?: string;
      avgExecutionTime?: number;
      successRate: number;
      errorCount: number;
    }>;
    
    // API Call Statistics
    apiStats: {
      totalApiCalls: number;
      successfulCalls: number;
      failedCalls: number;
      avgResponseTime: number;
      lastApiCall?: string;
      endpointsUsed: Record<string, number>;
    };
    
    // Tool Usage Analysis
    toolUsageStats: Record<string, {
      count: number;
      totalTokens: number;
      totalCost: number;
      avgDuration: number;
      successRate: number;
    }>;
  };

  // Performance Metrics (Enhanced)
  performanceInfo: {
    memoryUsage?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
      memoryPressure: 'low' | 'medium' | 'high';
    };
    networkLatency?: number;
    lastRequestDuration?: number;
    totalRequestCount: number;
    errorCount: number;
    avgResponseTime?: number;
    renderTime?: number;
    
    // Additional Performance Metrics
    componentRenderCount: number;
    rerenderTriggers: string[];
    largestContentfulPaint?: number;
    firstInputDelay?: number;
  };

  // Browser & Client Info (Enhanced)
  browserInfo: {
    userAgent: string;
    browserName: string;
    browserVersion: string;
    osName: string;
    osVersion: string;
    
    viewport: { width: number; height: number };
    screen: { width: number; height: number };
    devicePixelRatio: number;
    
    timezone: string;
    language: string;
    languages: string[];
    
    cookiesEnabled: boolean;
    onlineStatus: boolean;
    connectionType?: string;
    
    currentUrl: string;
    referrer: string;
    
    localStorageSize: number;
    sessionStorageSize: number;
    
    // Security & Privacy
    doNotTrack: boolean;
    cookieEnabled: boolean;
    webGLSupport: boolean;
  };

  // Network & API Status (Enhanced)
  networkInfo: {
    apiConnected: boolean;
    wsConnected: boolean;
    lastApiCall?: string;
    lastWsMessage?: string;
    requestQueue: number;
    failedRequests: number;
    retryAttempts: number;
    connectionType?: string;
    
    // Network Performance
    downloadSpeed?: number;
    uploadSpeed?: number;
    ping?: number;
    
    // Request History
    recentRequests: Array<{
      endpoint: string;
      method: string;
      status: number;
      duration: number;
      timestamp: string;
    }>;
  };

  // Error Logs & Debugging
  errorLogs: Array<{
    timestamp: string;
    level: 'error' | 'warn' | 'info';
    message: string;
    source?: string;
    stack?: string;
    userId?: string;
    sessionId?: string;
  }>;

  // Debug Traces Summary (Enhanced)
  debugTraces: Array<{
    messageId: string;
    agentCount: number;
    totalDuration: number;
    totalTokens: number;
    tools: string[];
    hasErrors: boolean;
    agentFlow: Array<{
      agent: string;
      duration: number;
      tokensUsed: number;
      success: boolean;
    }>;
  }>;

  // Local Storage & Cache State
  localStorageState: {
    chatSessionId?: string;
    userPreferences?: any;
    cachedData?: any;
    totalSize: number;
    keyCount: number;
    
    // Cache Analysis
    cacheHitRate?: number;
    cacheEntries: Record<string, {
      size: number;
      lastAccessed: string;
      expiryTime?: string;
    }>;
  };
}

interface ComprehensiveDebugInfoProps {
  sessionMetrics: any;
  messages: any[];
  currentModel?: string;
  availableTools?: any[];
  debugInfo?: any;
  directRender?: boolean; // When true, renders debug info directly without button wrapper
}

const ComprehensiveDebugInfo: React.FC<ComprehensiveDebugInfoProps> = ({
  sessionMetrics,
  messages,
  currentModel = 'Unknown',
  availableTools = [],
  debugInfo,
  directRender = false
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState<ComprehensiveDebugData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    user: true,
    session: true,
    journey: false,
    model: false,
    environment: false,
    tools: false,
    performance: false,
    browser: false,
    network: false,
    traces: false,
    storage: false,
    errors: false
  });
  const { user } = useAuth();

  // Check if debug mode is enabled
  const isDebugMode = process.env.NODE_ENV === 'development' || 
                      process.env.REACT_APP_DEBUG === 'true' ||
                      import.meta.env.VITE_DEBUG === 'true' ||
                      window.location.search.includes('debug=true');

  // Don't render if debug mode is disabled (zero performance impact)
  if (!isDebugMode) {
    return null;
  }

  // Handle section expansion
  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Utility function to mask sensitive environment variables
  const maskSensitiveValue = (key: string, value: string): string => {
    const sensitiveKeys = [
      'key', 'secret', 'token', 'password', 'auth', 'private'
    ];
    
    const isSensitive = sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
    
    if (isSensitive && value) {
      if (value.length <= 8) {
        return '*'.repeat(value.length);
      }
      return `${value.substring(0, 4)}${'*'.repeat(value.length - 8)}${value.substring(value.length - 4)}`;
    }
    
    return value;
  };

  // Utility function to parse user agent
  const parseUserAgent = (userAgent: string) => {
    // Simple user agent parsing (in production, consider using a library)
    const browser = userAgent.match(/(chrome|firefox|safari|edge|opera)\/?\s*([\d.]+)/i);
    const os = userAgent.match(/(windows|macintosh|linux|android|ios)/i);
    
    return {
      browserName: browser?.[1] || 'Unknown',
      browserVersion: browser?.[2] || 'Unknown',
      osName: os?.[1] || 'Unknown',
      osVersion: 'Unknown' // Could be enhanced with more parsing
    };
  };

  // Comprehensive data gathering function
  const gatherDebugData = async (): Promise<ComprehensiveDebugData> => {
    console.log('🔍 [ComprehensiveDebug] Starting comprehensive debug data collection...');
    
    // Performance monitoring
    const startTime = performance.now();
    
    // Browser performance info with memory pressure calculation
    const memoryInfo = (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      memoryPressure: ((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) > 0.8 ? 'high' as const :
                     ((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) > 0.6 ? 'medium' as const : 'low' as const
    } : undefined;

    // Calculate local storage sizes and analyze entries
    const calculateStorageSize = (storage: Storage): number => {
      let total = 0;
      try {
        for (let key in storage) {
          if (storage.hasOwnProperty(key)) {
            total += storage[key].length + key.length;
          }
        }
      } catch (e) {
        console.warn('Cannot access storage:', e);
      }
      return total;
    };

    // Analyze cache entries
    const analyzeCacheEntries = (): Record<string, { size: number; lastAccessed: string; expiryTime?: string }> => {
      const entries: Record<string, any> = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key) || '';
            entries[key] = {
              size: key.length + value.length,
              lastAccessed: new Date().toISOString(),
              expiryTime: undefined // Could be enhanced to detect expiry patterns
            };
          }
        }
      } catch (e) {
        console.warn('Cannot analyze cache entries:', e);
      }
      return entries;
    };

    // Analyze debug traces from messages with enhanced details
    const debugTraces = messages
      .filter(msg => msg.langGraphExecution?.debug_trace)
      .map(msg => ({
        messageId: msg.id,
        agentCount: Array.isArray(msg.langGraphExecution.debug_trace) ? msg.langGraphExecution.debug_trace.length : 0,
        totalDuration: msg.langGraphExecution.total_duration_ms || 0,
        totalTokens: (msg.langGraphExecution.total_tokens_in || 0) + (msg.langGraphExecution.total_tokens_out || 0),
        tools: Array.isArray(msg.langGraphExecution.debug_trace) 
          ? msg.langGraphExecution.debug_trace.map((trace: any) => trace.agent).filter(Boolean)
          : [],
        hasErrors: false, // TODO: Analyze for errors in traces
        agentFlow: Array.isArray(msg.langGraphExecution.debug_trace) 
          ? msg.langGraphExecution.debug_trace.map((trace: any) => ({
              agent: trace.agent || 'Unknown',
              duration: trace.duration_ms || 0,
              tokensUsed: (trace.tokens_in || 0) + (trace.tokens_out || 0),
              success: !trace.error
            }))
          : []
      }));

    // Gather all environment variables with sensitive data masking
    const envVars = import.meta.env;
    const featureFlags: Record<string, boolean> = {};
    const environmentVariables: Record<string, string> = {};
    
    Object.keys(envVars).forEach(key => {
      const value = String(envVars[key] || '');
      
      // Feature flags
      if (key.startsWith('VITE_FEATURE_') || key.startsWith('VITE_ENABLE_')) {
        featureFlags[key] = value === 'true';
      }
      
      // All environment variables (with masking)
      environmentVariables[key] = maskSensitiveValue(key, value);
    });

    // Enhanced model information
    const modelPricing = MODEL_PRICING[currentModel] || null;
    const totalTokens = parseInt(sessionMetrics.totalInputTokens) + parseInt(sessionMetrics.totalOutputTokens);
    const totalInputTokens = parseInt(sessionMetrics.totalInputTokens);
    const totalOutputTokens = parseInt(sessionMetrics.totalOutputTokens);
    const totalCost = parseFloat(sessionMetrics.totalCreditsUsed);

    // Session timing analysis
    const sessionStartTime = messages.length > 0 ? new Date(messages[0].timestamp).toISOString() : new Date().toISOString();
    const sessionDuration = messages.length > 1 ? 
      (new Date(messages[messages.length - 1].timestamp).getTime() - new Date(messages[0].timestamp).getTime()) / 1000 : 0;

    // Count message types
    const userMessages = messages.filter(msg => msg.type === 'user').length;
    const aiMessages = messages.filter(msg => msg.type === 'ai').length;

    // Parse user agent for detailed browser info
    const userAgentInfo = parseUserAgent(navigator.userAgent);

    // Tools analysis - enhanced with detailed statistics
    const toolsAnalysis = availableTools.map(tool => {
      const usageCount = sessionMetrics.toolsUsed?.[tool.name] || 0;
      const toolTraces = debugTraces.flatMap(trace => 
        trace.agentFlow.filter((agent: any) => agent.agent === tool.name)
      );
      
      const totalExecutionTime = toolTraces.reduce((sum, trace) => sum + trace.duration, 0);
      const successfulExecutions = toolTraces.filter(trace => trace.success).length;
      
      return {
        name: tool.name,
        enabled: true, // Assume enabled if in availableTools
        description: tool.description || tool.prompt || 'No description available',
        usageCount,
        lastUsed: usageCount > 0 ? 'Recent' : undefined, // TODO: Get actual timestamp
        avgExecutionTime: toolTraces.length > 0 ? totalExecutionTime / toolTraces.length : undefined,
        successRate: toolTraces.length > 0 ? (successfulExecutions / toolTraces.length) * 100 : 100,
        errorCount: toolTraces.length - successfulExecutions
      };
    });

    // API statistics - simulated based on available data
    const apiStats = {
      totalApiCalls: messages.length, // Approximate
      successfulCalls: messages.length, // Assume success if we have responses
      failedCalls: 0, // TODO: Track actual failures
      avgResponseTime: debugTraces.length > 0 ? debugTraces.reduce((sum, trace) => sum + trace.totalDuration, 0) / debugTraces.length : 0,
      lastApiCall: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toISOString() : undefined,
      endpointsUsed: {
        '/api/v1/pure-chat/stream': messages.length,
        '/api/v1/chat/sessions': 1,
        // Add more endpoints as discovered
      }
    };

    // Tool usage statistics
    const toolUsageStats: Record<string, any> = {};
    Object.entries(sessionMetrics.toolsUsed || {}).forEach(([toolName, count]) => {
      const toolTraces = debugTraces.flatMap(trace => 
        trace.agentFlow.filter((agent: any) => agent.agent === toolName)
      );
      
      const totalTokens = toolTraces.reduce((sum, trace) => sum + trace.tokensUsed, 0);
      const totalDuration = toolTraces.reduce((sum, trace) => sum + trace.duration, 0);
      const successfulExecutions = toolTraces.filter(trace => trace.success).length;
      
      toolUsageStats[toolName] = {
        count: Number(count),
        totalTokens,
        totalCost: 0, // TODO: Calculate based on tokens and model pricing
        avgDuration: toolTraces.length > 0 ? totalDuration / toolTraces.length : 0,
        successRate: toolTraces.length > 0 ? (successfulExecutions / toolTraces.length) * 100 : 100
      };
    });

    // Create comprehensive debug data
    const comprehensiveData: ComprehensiveDebugData = {
      // Enhanced Current User Information
      currentUser: {
        // Basic Info
        userId: user?.id || null,
        email: user?.email || null,
        displayName: user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email || null,
        isAuthenticated: !!user,
        
        // Authentication Details
        authProvider: user?.app_metadata?.provider || 'unknown',
        tokenExpiry: (user as any)?.expires_at ? new Date((user as any).expires_at * 1000).toISOString() : undefined,
        lastSignIn: user?.last_sign_in_at || undefined,
        emailConfirmed: user?.email_confirmed_at ? true : false,
        phoneConfirmed: user?.phone_confirmed_at ? true : false,
        
        // Session Details
        sessionStartTime,
        sessionDuration,
        userAgent: navigator.userAgent,
        ipAddress: undefined, // Would need backend support
        
        // User Metadata
        userMetadata: user?.user_metadata || {},
        appMetadata: user?.app_metadata || {},
        
        // Permissions & Roles
        role: user?.role || user?.app_metadata?.role || undefined,
        permissions: user?.app_metadata?.permissions || []
      },

      // Enhanced Session Information
      sessionInfo: {
        sessionId: debugInfo?.sessionId || localStorage.getItem('chatSessionId'),
        sessionName: sessionMetrics.sessionName || 'Unnamed Session',
        totalMessages: messages.length,
        userMessages,
        aiMessages,
        createdAt: sessionStartTime,
        lastActivity: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toISOString() : undefined,
        isLoading: debugInfo?.sessionState?.isLoading || false,
        connectionStatus: navigator.onLine ? 'connected' as const : 'disconnected' as const,
        sessionVersion: '1.0' // TODO: Add actual versioning
      },

      // Enhanced Journey Information
      journeyInfo: await (async () => {
        const journeyStart = performance.now();
        let journeyData = {
          currentJourneyId: null as string | null,
          currentJourneyTitle: null as string | null,
          currentJourneyIcon: null as string | null,
          currentJourneyColor: null as string | null,
          totalJourneys: 0,
          activeJourneys: 0,
          totalSessions: 0,
          currentSessionInJourney: false,
          currentSessionType: null as string | null,
          currentAgent: null as string | null,
          currentAgentAvatar: null as string | null,
          recentJourneys: [] as any[],
          sessionHierarchy: [] as any[],
          journeyLoadTime: 0,
          navigationTreeSize: 0
        };

        try {
          // Fetch journey data
          const journeys = await JourneyService.getUserJourneys();
          journeyData.totalJourneys = journeys.length;
          journeyData.activeJourneys = journeys.filter((j: any) => j.status === 'active').length;

          // Get recent journeys with session counts
          journeyData.recentJourneys = journeys.slice(0, 5).map((journey: any) => ({
            id: journey.id,
            title: journey.title,
            icon: journey.icon_letters || 'JY',
            sessionCount: journey.session_count || 0,
            lastActivity: journey.last_activity_at || journey.updated_at || journey.created_at
          }));

          // Find current session's journey context
          const currentSessionId = localStorage.getItem('chatSessionId');
          if (currentSessionId) {
            try {
              // Try to find which journey contains the current session
              const journeyWithSessions = await Promise.all(
                journeys.map(async (journey: any) => {
                  try {
                    const navTree = await JourneyService.getJourneyNavigationTree(journey.id);
                    return { journey, navTree };
                  } catch {
                    return { journey, navTree: null };
                  }
                })
              );

              // Find the journey containing current session
              const currentJourneyInfo = journeyWithSessions.find(({ navTree }: { journey: any; navTree: any }) => {
                if (!navTree) return false;
                
                // Check navigation_nodes
                if (navTree.navigation_nodes?.some((node: any) => node.session_id === currentSessionId)) {
                  return true;
                }
                
                // Check hierarchical structure
                const checkHierarchy = (session: any): boolean => {
                  if (session.session_id === currentSessionId) return true;
                  if (session.children) {
                    return session.children.some(checkHierarchy);
                  }
                  return false;
                };
                
                return navTree.root_session && checkHierarchy(navTree.root_session);
              });

              if (currentJourneyInfo) {
                const { journey, navTree } = currentJourneyInfo;
                journeyData.currentJourneyId = journey.id;
                journeyData.currentJourneyTitle = journey.title;
                journeyData.currentJourneyIcon = journey.icon_letters;
                journeyData.currentJourneyColor = journey.color_code;
                journeyData.currentSessionInJourney = true;

                // Extract current session details from navigation tree
                const findSessionInTree = (node: any): any => {
                  if (node.session_id === currentSessionId) return node;
                  if (node.children) {
                    for (const child of node.children) {
                      const found = findSessionInTree(child);
                      if (found) return found;
                    }
                  }
                  return null;
                };

                const currentSessionNode = navTree?.navigation_nodes?.find((n: any) => n.session_id === currentSessionId) ||
                                         (navTree?.root_session && findSessionInTree(navTree.root_session));

                if (currentSessionNode) {
                  journeyData.currentSessionType = currentSessionNode.session_type;
                  journeyData.currentAgent = currentSessionNode.agent_name;
                  journeyData.currentAgentAvatar = currentSessionNode.agent_avatar;
                }

                // Build session hierarchy
                const buildHierarchy = (node: any, depth: number = 0): any[] => {
                  const sessions = [{
                    sessionId: node.session_id,
                    sessionType: node.session_type,
                    agentName: node.agent_name,
                    isActive: node.session_id === currentSessionId,
                    depth
                  }];

                  if (node.children) {
                    node.children.forEach((child: any) => {
                      sessions.push(...buildHierarchy(child, depth + 1));
                    });
                  }

                  return sessions;
                };

                if (navTree?.root_session) {
                  journeyData.sessionHierarchy = buildHierarchy(navTree.root_session);
                  journeyData.totalSessions = journeyData.sessionHierarchy.length;
                } else if (navTree?.navigation_nodes) {
                  journeyData.sessionHierarchy = navTree.navigation_nodes.map((node: any) => ({
                    sessionId: node.session_id,
                    sessionType: node.session_type,
                    agentName: node.agent_name,
                    isActive: node.session_id === currentSessionId,
                    depth: 0
                  }));
                  journeyData.totalSessions = navTree.navigation_nodes.length;
                }

                journeyData.navigationTreeSize = JSON.stringify(navTree || {}).length;
              }
            } catch (sessionError) {
              console.warn('⚠️ [DebugInfo] Failed to analyze current session journey context:', sessionError);
            }
          }
        } catch (error) {
          console.warn('⚠️ [DebugInfo] Failed to collect journey information:', error);
        }

        journeyData.journeyLoadTime = performance.now() - journeyStart;
        return journeyData;
      })(),

      // Comprehensive Model Information
      modelInfo: {
        currentModel,
        modelDisplayName: getModelDisplayName(currentModel),
        modelProvider: currentModel.includes('gemini') ? 'Google' : 
                     currentModel.includes('gpt') ? 'OpenAI' : 
                     currentModel.includes('claude') ? 'Anthropic' : 'Unknown',
        
        // Pricing Information
        inputTokenCost: modelPricing?.inputTokensPerMillion || 0,
        outputTokenCost: modelPricing?.outputTokensPerMillion || 0,
        modelTier: modelPricing?.tier || 'unknown',
        pricingLastUpdated: modelPricing?.lastUpdated || 'Unknown',
        
        // Usage Statistics
        totalTokensUsed: totalTokens,
        totalInputTokens,
        totalOutputTokens,
        totalCost,
        avgCostPerMessage: messages.length > 0 ? totalCost / messages.length : 0,
        avgTokensPerMessage: messages.length > 0 ? totalTokens / messages.length : 0,
        
        // Model Configuration
        maxTokenLimit: 32000, // TODO: Get actual limits per model
        temperatureSetting: undefined, // TODO: Get from model config
        modelCapabilities: ['text', 'reasoning', 'function_calling'] // TODO: Make dynamic
      },

      // Enhanced Environment Information
      environmentInfo: {
        // Runtime Environment
        nodeEnv: import.meta.env.NODE_ENV || 'unknown',
        debugMode: isDebugMode,
        buildVersion: import.meta.env.VITE_BUILD_VERSION || 'unknown',
        deploymentEnv: import.meta.env.VITE_DEPLOYMENT_ENV || 'local',
        
        // API Configuration (with masked sensitive data)
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'Not configured',
        wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'Not configured',
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
        supabaseAnonKey: maskSensitiveValue('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY || ''),
        
        // Feature Flags
        featureFlags,
        
        // All Relevant Environment Variables (sensitive data masked)
        environmentVariables
      },

      // Implemented Tools & API Analysis
      toolsApiInfo: {
        // Available Tools
        availableTools: toolsAnalysis,
        
        // API Call Statistics
        apiStats,
        
        // Tool Usage Analysis
        toolUsageStats
      },

      // Enhanced Performance Metrics
      performanceInfo: {
        memoryUsage: memoryInfo,
        networkLatency: undefined, // TODO: Implement network latency check
        lastRequestDuration: debugInfo?.requestState?.lastRequestDuration,
        totalRequestCount: messages.length,
        errorCount: 0, // TODO: Track errors
        avgResponseTime: debugTraces.length > 0 ? debugTraces.reduce((sum, trace) => sum + trace.totalDuration, 0) / debugTraces.length : undefined,
        renderTime: performance.now() - startTime,
        
        // Additional Performance Metrics
        componentRenderCount: 1, // TODO: Track actual render count
        rerenderTriggers: ['props', 'state'], // TODO: Track actual triggers
        largestContentfulPaint: (performance as any).timing ? (performance as any).timing.loadEventEnd - (performance as any).timing.navigationStart : undefined,
        firstInputDelay: undefined // TODO: Measure FID
      },

      // Enhanced Browser Information
      browserInfo: {
        userAgent: navigator.userAgent,
        browserName: userAgentInfo.browserName,
        browserVersion: userAgentInfo.browserVersion,
        osName: userAgentInfo.osName,
        osVersion: userAgentInfo.osVersion,
        
        viewport: { 
          width: window.innerWidth, 
          height: window.innerHeight 
        },
        screen: { 
          width: window.screen.width, 
          height: window.screen.height 
        },
        devicePixelRatio: window.devicePixelRatio || 1,
        
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
        
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        
        currentUrl: window.location.href,
        referrer: document.referrer || 'Direct',
        
        localStorageSize: calculateStorageSize(localStorage),
        sessionStorageSize: calculateStorageSize(sessionStorage),
        
        // Security & Privacy
        doNotTrack: (navigator as any).doNotTrack === '1',
        cookieEnabled: navigator.cookieEnabled,
        webGLSupport: !!window.WebGLRenderingContext
      },

      // Enhanced Network Information
      networkInfo: {
        apiConnected: navigator.onLine, // Basic connectivity check
        wsConnected: false, // TODO: Check actual WebSocket status
        lastApiCall: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toISOString() : undefined,
        lastWsMessage: undefined, // TODO: Track WebSocket messages
        requestQueue: 0, // TODO: Track actual request queue
        failedRequests: 0, // TODO: Track failures
        retryAttempts: 0, // TODO: Track retries
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        
        // Network Performance
        downloadSpeed: (navigator as any).connection?.downlink,
        uploadSpeed: undefined, // Not available in Connection API
        ping: undefined, // TODO: Implement ping check
        
        // Request History (simulated)
        recentRequests: messages.slice(-5).map((msg, index) => ({
          endpoint: '/api/v1/pure-chat/stream',
          method: 'POST',
          status: 200, // Assume success
          duration: debugTraces[index]?.totalDuration || 1000,
          timestamp: new Date(msg.timestamp).toISOString()
        }))
      },

      // Error Logs (TODO: Implement proper error collection)
      errorLogs: [],

      // Enhanced Debug Traces
      debugTraces,

      // Enhanced Local Storage State
      localStorageState: {
        chatSessionId: localStorage.getItem('chatSessionId') || undefined,
        userPreferences: undefined, // TODO: Parse user preferences
        cachedData: undefined, // TODO: Analyze cached data
        totalSize: calculateStorageSize(localStorage),
        keyCount: localStorage.length,
        
        // Cache Analysis
        cacheHitRate: undefined, // TODO: Implement cache analytics
        cacheEntries: analyzeCacheEntries()
      }
    };

    console.log('✅ [ComprehensiveDebug] Debug data collection completed in', performance.now() - startTime, 'ms');
    return comprehensiveData;
  };

  // Load debug data when dialog opens
  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    
    try {
      const data = await gatherDebugData();
      setDebugData(data);
    } catch (error) {
      console.error('❌ [ComprehensiveDebug] Failed to gather debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!open || !autoRefresh) return;
    
    const interval = setInterval(async () => {
      if (!loading) {
        try {
          const data = await gatherDebugData();
          setDebugData(data);
        } catch (error) {
          console.error('❌ [ComprehensiveDebug] Auto-refresh failed:', error);
        }
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [open, autoRefresh, loading]);

  // Copy to clipboard functionality with user feedback
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`✅ [ComprehensiveDebug] ${label} copied to clipboard`);
      // Could add toast notification here
    } catch (error) {
      console.error(`❌ [ComprehensiveDebug] Failed to copy ${label}:`, error);
    }
  };

  // Copy ID with full value display
  const copyIdToClipboard = async (id: string, label: string) => {
    await copyToClipboard(id, label);
  };

  // Export debug data
  const exportDebugData = () => {
    if (!debugData) return;
    
    const dataStr = JSON.stringify(debugData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-session-${debugData.sessionInfo.sessionId || 'unknown'}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper component for displaying full IDs with copy functionality
  const IdDisplayField = ({ label, value, icon }: { label: string; value: string | null; icon?: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {icon && <Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle', mr: 0.5 }}>{icon}</Box>}
        {label}:
      </Typography>
      <TextField
        fullWidth
        value={value || 'Not available'}
        variant="outlined"
        size="small"
        InputProps={{
          readOnly: true,
          style: { fontFamily: 'monospace', fontSize: '0.875rem' },
          endAdornment: value ? (
            <InputAdornment position="end">
              <Tooltip title={`Copy ${label}`}>
                <IconButton
                  size="small"
                  onClick={() => copyIdToClipboard(value, label)}
                  edge="end"
                >
                  <ContentCopy sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'grey.50'
          }
        }}
      />
    </Box>
  );

  // Helper component for key-value pairs with optional copy
  const InfoRow = ({ label, value, copyable = false }: { label: string; value: any; copyable?: boolean }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}:</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: typeof value === 'string' && copyable ? 'monospace' : 'inherit' }}>
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </Typography>
        {copyable && value && (
          <Tooltip title={`Copy ${label}`}>
            <IconButton
              size="small"
              onClick={() => copyToClipboard(String(value), label)}
              sx={{ ml: 0.5 }}
            >
              <ContentCopy sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  // Helper component for environment variables with masking toggle
  const EnvironmentVariableRow = ({ envKey, value }: { envKey: string; value: string }) => {
    const [showSensitive, setShowSensitive] = useState(false);
    const isSensitive = value.includes('*');
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {envKey}:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            fontWeight={600} 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.8rem',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isSensitive && !showSensitive ? value : value}
          </Typography>
          <Tooltip title="Copy value">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(value, envKey)}
            >
              <ContentCopy sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
          {isSensitive && (
            <Tooltip title={showSensitive ? "Hide sensitive data" : "Show sensitive data"}>
              <IconButton
                size="small"
                onClick={() => setShowSensitive(!showSensitive)}
              >
                {showSensitive ? <VisibilityOff sx={{ fontSize: 12 }} /> : <Visibility sx={{ fontSize: 12 }} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  };

  // Main render function - single page with collapsible sections
  const renderDebugSections = () => {
    if (!debugData) return null;

    return (
      <Stack spacing={2}>
        {/* Current User Information Section */}
        <Accordion 
          expanded={expandedSections.user} 
          onChange={() => handleSectionToggle('user')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" />
              <Typography variant="h6" fontWeight={600}>Current User Information</Typography>
              <Chip 
                label={debugData.currentUser.isAuthenticated ? 'Authenticated' : 'Not Authenticated'} 
                size="small" 
                color={debugData.currentUser.isAuthenticated ? 'success' : 'error'} 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Basic Information</Typography>
                <IdDisplayField 
                  label="User ID" 
                  value={debugData.currentUser.userId} 
                  icon={<Security sx={{ fontSize: 16 }} />} 
                />
                <InfoRow label="Email" value={debugData.currentUser.email || 'Not available'} copyable />
                <InfoRow label="Display Name" value={debugData.currentUser.displayName || 'Not available'} />
                <InfoRow label="Auth Provider" value={debugData.currentUser.authProvider} />
                <InfoRow label="Email Confirmed" value={debugData.currentUser.emailConfirmed ? 'Yes' : 'No'} />
                <InfoRow label="Phone Confirmed" value={debugData.currentUser.phoneConfirmed ? 'Yes' : 'No'} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Session & Metadata</Typography>
                <InfoRow label="Session Duration" value={`${Math.round(debugData.currentUser.sessionDuration)} seconds`} />
                <InfoRow label="Last Sign In" value={debugData.currentUser.lastSignIn || 'Not available'} />
                <InfoRow label="Token Expiry" value={debugData.currentUser.tokenExpiry || 'Not available'} />
                <InfoRow label="Role" value={debugData.currentUser.role || 'No role assigned'} />
                
                {Object.keys(debugData.currentUser.userMetadata).length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>User Metadata:</Typography>
                    <Paper sx={{ p: 1, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(debugData.currentUser.userMetadata, null, 2)}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Session Information Section */}
        <Accordion 
          expanded={expandedSections.session} 
          onChange={() => handleSectionToggle('session')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline color="info" />
              <Typography variant="h6" fontWeight={600}>Session Information</Typography>
              <Chip label={`${debugData.sessionInfo.totalMessages} messages`} size="small" />
              <Chip 
                label={debugData.sessionInfo.connectionStatus} 
                size="small" 
                color={debugData.sessionInfo.connectionStatus === 'connected' ? 'success' : 'error'} 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Session Details</Typography>
                <IdDisplayField 
                  label="Session ID" 
                  value={debugData.sessionInfo.sessionId} 
                  icon={<DataObject sx={{ fontSize: 16 }} />} 
                />
                <InfoRow label="Session Name" value={debugData.sessionInfo.sessionName} />
                <InfoRow label="Session Version" value={debugData.sessionInfo.sessionVersion} />
                <InfoRow label="Created At" value={debugData.sessionInfo.createdAt || 'Not available'} />
                <InfoRow label="Last Activity" value={debugData.sessionInfo.lastActivity || 'Not available'} />
                <InfoRow label="Is Loading" value={debugData.sessionInfo.isLoading ? 'Yes' : 'No'} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Message Statistics</Typography>
                <InfoRow label="Total Messages" value={debugData.sessionInfo.totalMessages} />
                <InfoRow label="User Messages" value={debugData.sessionInfo.userMessages} />
                <InfoRow label="AI Messages" value={debugData.sessionInfo.aiMessages} />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Message Distribution:</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(debugData.sessionInfo.userMessages / debugData.sessionInfo.totalMessages) * 100}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">User: {debugData.sessionInfo.userMessages}</Typography>
                    <Typography variant="caption">AI: {debugData.sessionInfo.aiMessages}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Journey & Navigation Information Section */}
        <Accordion 
          expanded={expandedSections.journey} 
          onChange={() => handleSectionToggle('journey')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(102, 204, 102, 0.03)', border: '1px solid rgba(102, 204, 102, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline color="success" />
              <Typography variant="h6" fontWeight={600}>Journey & Navigation Information</Typography>
              <Chip label={`${debugData.journeyInfo.totalJourneys} journeys`} size="small" color="primary" />
              <Chip 
                label={debugData.journeyInfo.currentSessionInJourney ? 'In Journey' : 'Standalone'} 
                size="small" 
                color={debugData.journeyInfo.currentSessionInJourney ? 'success' : 'warning'} 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Current Journey Context</Typography>
                <InfoRow label="Current Journey" value={debugData.journeyInfo.currentJourneyTitle || 'None'} />
                <InfoRow label="Journey Icon" value={debugData.journeyInfo.currentJourneyIcon || 'N/A'} />
                <InfoRow label="Journey Color" value={debugData.journeyInfo.currentJourneyColor || 'N/A'} />
                <InfoRow label="Current Agent" value={debugData.journeyInfo.currentAgent || 'No agent'} />
                <InfoRow label="Session Type" value={debugData.journeyInfo.currentSessionType || 'N/A'} />
                
                {debugData.journeyInfo.currentJourneyId && (
                  <IdDisplayField 
                    label="Journey ID" 
                    value={debugData.journeyInfo.currentJourneyId} 
                    icon={<DataObject sx={{ fontSize: 16 }} />} 
                  />
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Journey Statistics</Typography>
                <InfoRow label="Total Journeys" value={debugData.journeyInfo.totalJourneys} />
                <InfoRow label="Active Journeys" value={debugData.journeyInfo.activeJourneys} />
                <InfoRow label="Total Sessions" value={debugData.journeyInfo.totalSessions} />
                <InfoRow label="Journey Load Time" value={`${debugData.journeyInfo.journeyLoadTime.toFixed(2)} ms`} />
                <InfoRow label="Navigation Tree Size" value={`${Math.round(debugData.journeyInfo.navigationTreeSize / 1024)} KB`} />
              </Grid>
              
              {/* Session Hierarchy */}
              {debugData.journeyInfo.sessionHierarchy.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Session Hierarchy</Typography>
                  <Box sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2 }}>
                    {debugData.journeyInfo.sessionHierarchy.map((session, index) => (
                      <Card key={session.sessionId} variant="outlined" sx={{ mb: 1, bgcolor: session.isActive ? 'action.selected' : 'background.paper' }}>
                        <CardContent sx={{ py: 1, px: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ ml: session.depth * 2 }}>
                              {session.depth > 0 && <Typography variant="body2" color="text.secondary">└─</Typography>}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" fontWeight={session.isActive ? 600 : 400}>
                                <strong>{session.agentName}</strong>: {session.sessionType}
                                {session.isActive && ' (Current)'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                {session.sessionId.slice(0, 8)}...
                              </Typography>
                            </Box>
                            <Chip 
                              label={session.sessionType} 
                              size="small" 
                              variant="outlined"
                              color={session.sessionType === 'exploration' ? 'primary' : 'secondary'}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Grid>
              )}
              
              {/* Recent Journeys */}
              {debugData.journeyInfo.recentJourneys.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Recent Journeys</Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {debugData.journeyInfo.recentJourneys.map((journey) => (
                      <Card key={journey.id} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent sx={{ py: 1, px: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {journey.icon} {journey.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {journey.sessionCount} sessions • {journey.lastActivity ? new Date(journey.lastActivity).toLocaleDateString() : 'No activity'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                              {journey.id.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* LLM Model & Cost Information Section */}
        <Accordion 
          expanded={expandedSections.model} 
          onChange={() => handleSectionToggle('model')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy color="success" />
              <Typography variant="h6" fontWeight={600}>LLM Model & Cost Analysis</Typography>
              <Chip label={debugData.modelInfo.modelDisplayName} size="small" color="primary" />
              <Chip label={`$${debugData.modelInfo.totalCost.toFixed(6)}`} size="small" color="success" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Model Information</Typography>
                <InfoRow label="Current Model" value={debugData.modelInfo.currentModel} copyable />
                <InfoRow label="Display Name" value={debugData.modelInfo.modelDisplayName} />
                <InfoRow label="Provider" value={debugData.modelInfo.modelProvider} />
                <InfoRow label="Model Tier" value={debugData.modelInfo.modelTier} />
                <InfoRow label="Max Token Limit" value={debugData.modelInfo.maxTokenLimit?.toLocaleString() || 'Unknown'} />
                <InfoRow label="Capabilities" value={debugData.modelInfo.modelCapabilities.join(', ')} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Cost & Token Analysis</Typography>
                
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, mb: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="success.dark">
                    ${debugData.modelInfo.totalCost.toFixed(8)}
                  </Typography>
                  <Typography variant="caption" color="success.dark">Total Session Cost</Typography>
                </Box>
                
                <InfoRow label="Input Token Cost" value={`$${debugData.modelInfo.inputTokenCost}/1M tokens`} />
                <InfoRow label="Output Token Cost" value={`$${debugData.modelInfo.outputTokenCost}/1M tokens`} />
                <InfoRow label="Total Tokens Used" value={debugData.modelInfo.totalTokensUsed.toLocaleString()} />
                <InfoRow label="Input Tokens" value={debugData.modelInfo.totalInputTokens.toLocaleString()} />
                <InfoRow label="Output Tokens" value={debugData.modelInfo.totalOutputTokens.toLocaleString()} />
                <InfoRow label="Avg Cost/Message" value={`$${debugData.modelInfo.avgCostPerMessage.toFixed(8)}`} />
                <InfoRow label="Avg Tokens/Message" value={debugData.modelInfo.avgTokensPerMessage} />
                <InfoRow label="Pricing Updated" value={debugData.modelInfo.pricingLastUpdated} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Environment Configuration Section */}
        <Accordion 
          expanded={expandedSections.environment} 
          onChange={() => handleSectionToggle('environment')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings color="warning" />
              <Typography variant="h6" fontWeight={600}>Environment Configuration</Typography>
              <Chip label={debugData.environmentInfo.nodeEnv} size="small" />
              <Chip 
                label={debugData.environmentInfo.debugMode ? 'Debug ON' : 'Debug OFF'} 
                size="small" 
                color={debugData.environmentInfo.debugMode ? 'success' : 'default'} 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Runtime Environment</Typography>
                <InfoRow label="Node Environment" value={debugData.environmentInfo.nodeEnv} />
                <InfoRow label="Debug Mode" value={debugData.environmentInfo.debugMode ? 'Enabled' : 'Disabled'} />
                <InfoRow label="Build Version" value={debugData.environmentInfo.buildVersion} />
                <InfoRow label="Deployment Environment" value={debugData.environmentInfo.deploymentEnv} />
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>API Configuration:</Typography>
                <InfoRow label="API Base URL" value={debugData.environmentInfo.apiBaseUrl} copyable />
                <InfoRow label="WebSocket Base URL" value={debugData.environmentInfo.wsBaseUrl || 'Not configured'} copyable />
                <InfoRow label="Supabase URL" value={debugData.environmentInfo.supabaseUrl} copyable />
                <InfoRow label="Supabase Anon Key" value={debugData.environmentInfo.supabaseAnonKey} copyable />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Feature Flags</Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'grey.300', borderRadius: 1, p: 1 }}>
                  {Object.entries(debugData.environmentInfo.featureFlags).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                        {key}:
                      </Typography>
                      <Chip 
                        label={value ? 'ON' : 'OFF'} 
                        size="small" 
                        color={value ? 'success' : 'default'}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  ))}
                </Box>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Environment Variables:</Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'grey.300', borderRadius: 1, p: 1 }}>
                  {Object.entries(debugData.environmentInfo.environmentVariables).map(([key, value]) => (
                    <EnvironmentVariableRow key={key} envKey={key} value={value} />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Tools & API Analysis Section */}
        <Accordion 
          expanded={expandedSections.tools} 
          onChange={() => handleSectionToggle('tools')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build color="secondary" />
              <Typography variant="h6" fontWeight={600}>Tools & API Analysis</Typography>
              <Chip label={`${debugData.toolsApiInfo.availableTools.length} tools`} size="small" />
              <Chip label={`${debugData.toolsApiInfo.apiStats.totalApiCalls} API calls`} size="small" variant="outlined" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>API Statistics</Typography>
                <InfoRow label="Total API Calls" value={debugData.toolsApiInfo.apiStats.totalApiCalls} />
                <InfoRow label="Successful Calls" value={debugData.toolsApiInfo.apiStats.successfulCalls} />
                <InfoRow label="Failed Calls" value={debugData.toolsApiInfo.apiStats.failedCalls} />
                <InfoRow label="Avg Response Time" value={`${debugData.toolsApiInfo.apiStats.avgResponseTime.toFixed(2)}ms`} />
                <InfoRow label="Last API Call" value={debugData.toolsApiInfo.apiStats.lastApiCall || 'No recent calls'} />
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Endpoints Used:</Typography>
                <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                  {Object.entries(debugData.toolsApiInfo.apiStats.endpointsUsed).map(([endpoint, count]) => (
                    <Box key={endpoint} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">{endpoint}</Typography>
                      <Chip label={count} size="small" />
                    </Box>
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Available Tools</Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {debugData.toolsApiInfo.availableTools.map((tool) => (
                    <Accordion key={tool.name} variant="outlined" sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography variant="subtitle2" fontWeight={600}>{tool.name}</Typography>
                          <Chip 
                            label={`${tool.usageCount}x`} 
                            size="small" 
                            color={tool.usageCount > 0 ? 'success' : 'default'} 
                          />
                          <Chip 
                            label={`${tool.successRate.toFixed(1)}%`} 
                            size="small" 
                            variant="outlined"
                            color={tool.successRate > 90 ? 'success' : tool.successRate > 70 ? 'warning' : 'error'}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <InfoRow label="Enabled" value={tool.enabled ? 'Yes' : 'No'} />
                          <InfoRow label="Usage Count" value={tool.usageCount} />
                          <InfoRow label="Success Rate" value={`${tool.successRate.toFixed(1)}%`} />
                          <InfoRow label="Error Count" value={tool.errorCount} />
                          {tool.avgExecutionTime && (
                            <InfoRow label="Avg Execution Time" value={`${tool.avgExecutionTime.toFixed(2)}ms`} />
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Description:
                          </Typography>
                          <Typography variant="body2" fontSize="0.8rem" sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                            {tool.description}
                          </Typography>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Performance Metrics Section */}
        <Accordion 
          expanded={expandedSections.performance} 
          onChange={() => handleSectionToggle('performance')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'error.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed color="error" />
              <Typography variant="h6" fontWeight={600}>Performance Metrics</Typography>
              {debugData.performanceInfo.memoryUsage && (
                <Chip 
                  label={debugData.performanceInfo.memoryUsage.memoryPressure} 
                  size="small" 
                  color={
                    debugData.performanceInfo.memoryUsage.memoryPressure === 'high' ? 'error' :
                    debugData.performanceInfo.memoryUsage.memoryPressure === 'medium' ? 'warning' : 'success'
                  } 
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Memory & Performance</Typography>
                
                {debugData.performanceInfo.memoryUsage && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Memory Usage:</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(debugData.performanceInfo.memoryUsage.usedJSHeapSize / debugData.performanceInfo.memoryUsage.totalJSHeapSize) * 100}
                      sx={{ 
                        height: 10, 
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: debugData.performanceInfo.memoryUsage.memoryPressure === 'high' ? 'error.main' :
                                            debugData.performanceInfo.memoryUsage.memoryPressure === 'medium' ? 'warning.main' : 'success.main'
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption">
                        Used: {Math.round(debugData.performanceInfo.memoryUsage.usedJSHeapSize / 1048576)} MB
                      </Typography>
                      <Typography variant="caption">
                        Total: {Math.round(debugData.performanceInfo.memoryUsage.totalJSHeapSize / 1048576)} MB
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <InfoRow label="Render Time" value={`${debugData.performanceInfo.renderTime?.toFixed(2)}ms`} />
                <InfoRow label="Total Requests" value={debugData.performanceInfo.totalRequestCount} />
                <InfoRow label="Error Count" value={debugData.performanceInfo.errorCount} />
                <InfoRow label="Component Renders" value={debugData.performanceInfo.componentRenderCount} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Network & Timing</Typography>
                <InfoRow label="Last Request Duration" value={debugData.performanceInfo.lastRequestDuration ? `${debugData.performanceInfo.lastRequestDuration}ms` : 'No recent requests'} />
                <InfoRow label="Avg Response Time" value={debugData.performanceInfo.avgResponseTime ? `${debugData.performanceInfo.avgResponseTime.toFixed(2)}ms` : 'Not available'} />
                <InfoRow label="Network Latency" value={debugData.performanceInfo.networkLatency ? `${debugData.performanceInfo.networkLatency}ms` : 'Not measured'} />
                <InfoRow label="Largest Contentful Paint" value={debugData.performanceInfo.largestContentfulPaint ? `${debugData.performanceInfo.largestContentfulPaint}ms` : 'Not available'} />
                <InfoRow label="First Input Delay" value={debugData.performanceInfo.firstInputDelay ? `${debugData.performanceInfo.firstInputDelay}ms` : 'Not measured'} />
                
                {debugData.performanceInfo.rerenderTriggers.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Rerender Triggers:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {debugData.performanceInfo.rerenderTriggers.map((trigger) => (
                        <Chip key={trigger} label={trigger} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Browser & Client Information Section */}
        <Accordion 
          expanded={expandedSections.browser} 
          onChange={() => handleSectionToggle('browser')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Computer color="info" />
              <Typography variant="h6" fontWeight={600}>Browser & Client Information</Typography>
              <Chip label={debugData.browserInfo.browserName} size="small" />
              <Chip 
                label={debugData.browserInfo.onlineStatus ? 'Online' : 'Offline'} 
                size="small" 
                color={debugData.browserInfo.onlineStatus ? 'success' : 'error'} 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Browser Details</Typography>
                <InfoRow label="Browser" value={`${debugData.browserInfo.browserName} ${debugData.browserInfo.browserVersion}`} />
                <InfoRow label="Operating System" value={`${debugData.browserInfo.osName} ${debugData.browserInfo.osVersion}`} />
                <InfoRow label="Language" value={debugData.browserInfo.language} />
                <InfoRow label="Languages" value={debugData.browserInfo.languages.join(', ')} />
                <InfoRow label="Timezone" value={debugData.browserInfo.timezone} />
                <InfoRow label="Device Pixel Ratio" value={debugData.browserInfo.devicePixelRatio} />
                <InfoRow label="Connection Type" value={debugData.browserInfo.connectionType || 'Unknown'} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Display & Storage</Typography>
                <InfoRow label="Viewport" value={`${debugData.browserInfo.viewport.width} × ${debugData.browserInfo.viewport.height}`} />
                <InfoRow label="Screen Resolution" value={`${debugData.browserInfo.screen.width} × ${debugData.browserInfo.screen.height}`} />
                <InfoRow label="Local Storage Size" value={`${Math.round(debugData.browserInfo.localStorageSize / 1024)} KB`} />
                <InfoRow label="Session Storage Size" value={`${Math.round(debugData.browserInfo.sessionStorageSize / 1024)} KB`} />
                <InfoRow label="Cookies Enabled" value={debugData.browserInfo.cookiesEnabled ? 'Yes' : 'No'} />
                <InfoRow label="Do Not Track" value={debugData.browserInfo.doNotTrack ? 'Yes' : 'No'} />
                <InfoRow label="WebGL Support" value={debugData.browserInfo.webGLSupport ? 'Yes' : 'No'} />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Current URL:</Typography>
                  <TextField
                    fullWidth
                    value={debugData.browserInfo.currentUrl}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                      style: { fontFamily: 'monospace', fontSize: '0.8rem' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Copy URL">
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(debugData.browserInfo.currentUrl, 'Current URL')}
                              edge="end"
                            >
                              <ContentCopy sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'grey.50' } }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>User Agent:</Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  value={debugData.browserInfo.userAgent}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    style: { fontFamily: 'monospace', fontSize: '0.8rem' },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'grey.50' } }}
                />
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={() => copyToClipboard(debugData.browserInfo.userAgent, 'User Agent')}
                  sx={{ mt: 1 }}
                >
                  Copy User Agent
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Network & API Status Section */}
        <Accordion 
          expanded={expandedSections.network} 
          onChange={() => handleSectionToggle('network')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NetworkCheck color="success" />
              <Typography variant="h6" fontWeight={600}>Network & API Status</Typography>
              <Chip 
                label={debugData.networkInfo.apiConnected ? 'API Connected' : 'API Disconnected'} 
                size="small" 
                color={debugData.networkInfo.apiConnected ? 'success' : 'error'} 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Connection Status</Typography>
                <InfoRow label="API Connected" value={debugData.networkInfo.apiConnected ? 'Yes' : 'No'} />
                <InfoRow label="WebSocket Connected" value={debugData.networkInfo.wsConnected ? 'Yes' : 'No'} />
                <InfoRow label="Connection Type" value={debugData.networkInfo.connectionType || 'Unknown'} />
                <InfoRow label="Download Speed" value={debugData.networkInfo.downloadSpeed ? `${debugData.networkInfo.downloadSpeed} Mbps` : 'Unknown'} />
                <InfoRow label="Failed Requests" value={debugData.networkInfo.failedRequests} />
                <InfoRow label="Retry Attempts" value={debugData.networkInfo.retryAttempts} />
                <InfoRow label="Request Queue" value={debugData.networkInfo.requestQueue} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Recent Requests</Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {debugData.networkInfo.recentRequests.length > 0 ? (
                    debugData.networkInfo.recentRequests.map((request, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 1, p: 1 }}>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
                              {request.method} {request.endpoint}
                            </Typography>
                            <Chip 
                              label={request.status} 
                              size="small" 
                              color={request.status === 200 ? 'success' : 'error'} 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              Duration: {request.duration}ms
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(request.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                      No recent requests recorded
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Debug Traces Section */}
        <Accordion 
          expanded={expandedSections.traces} 
          onChange={() => handleSectionToggle('traces')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Analytics color="warning" />
              <Typography variant="h6" fontWeight={600}>Debug Traces Analysis</Typography>
              <Chip label={`${debugData.debugTraces.length} traces`} size="small" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {debugData.debugTraces.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Debug Execution Traces</Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {debugData.debugTraces.map((trace) => (
                    <Accordion key={trace.messageId} variant="outlined" sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
                            {trace.messageId}
                          </Typography>
                          <Chip label={`${trace.agentCount} agents`} size="small" />
                          <Chip label={`${trace.totalDuration}ms`} size="small" variant="outlined" />
                          <Chip label={`${trace.totalTokens} tokens`} size="small" color="info" />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Trace Summary:</Typography>
                            <InfoRow label="Message ID" value={trace.messageId} copyable />
                            <InfoRow label="Agent Count" value={trace.agentCount} />
                            <InfoRow label="Total Duration" value={`${trace.totalDuration}ms`} />
                            <InfoRow label="Total Tokens" value={trace.totalTokens} />
                            <InfoRow label="Has Errors" value={trace.hasErrors ? 'Yes' : 'No'} />
                            <InfoRow label="Tools Used" value={trace.tools.join(', ') || 'None'} />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Agent Flow:</Typography>
                            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                              {trace.agentFlow.map((agent, index) => (
                                <Box key={index} sx={{ mb: 1, p: 1, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight={600}>{agent.agent}</Typography>
                                    <Chip 
                                      label={agent.success ? 'Success' : 'Failed'} 
                                      size="small" 
                                      color={agent.success ? 'success' : 'error'} 
                                    />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Duration: {agent.duration}ms | Tokens: {agent.tokensUsed}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No debug traces found in this session
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Debug traces are generated when debug mode is enabled during message processing
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Local Storage & Cache State Section */}
        <Accordion 
          expanded={expandedSections.storage} 
          onChange={() => handleSectionToggle('storage')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(31, 170, 188, 0.03)', border: '1px solid rgba(31, 170, 188, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Storage color="secondary" />
              <Typography variant="h6" fontWeight={600}>Local Storage & Cache State</Typography>
              <Chip label={`${debugData.localStorageState.keyCount} keys`} size="small" />
              <Chip label={`${Math.round(debugData.localStorageState.totalSize / 1024)} KB`} size="small" variant="outlined" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Storage Overview</Typography>
                <InfoRow label="Total Size" value={`${Math.round(debugData.localStorageState.totalSize / 1024)} KB`} />
                <InfoRow label="Key Count" value={debugData.localStorageState.keyCount} />
                <InfoRow label="Chat Session ID" value={debugData.localStorageState.chatSessionId || 'Not set'} copyable />
                <InfoRow label="Cache Hit Rate" value={debugData.localStorageState.cacheHitRate ? `${debugData.localStorageState.cacheHitRate.toFixed(1)}%` : 'Not measured'} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Cache Entries</Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'grey.300', borderRadius: 1, p: 1 }}>
                  {Object.entries(debugData.localStorageState.cacheEntries).length > 0 ? (
                    Object.entries(debugData.localStorageState.cacheEntries).map(([key, entry]) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: 1, borderColor: 'grey.200' }}>
                        <Typography variant="body2" fontSize="0.8rem" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {key}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(entry.size / 1024)} KB
                          </Typography>
                          <Tooltip title="Copy key">
                            <IconButton size="small" onClick={() => copyToClipboard(key, 'Storage Key')}>
                              <ContentCopy sx={{ fontSize: 12 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No cache entries found
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Error Logs Section */}
        <Accordion 
          expanded={expandedSections.errors} 
          onChange={() => handleSectionToggle('errors')}
          sx={{ '&.MuiAccordion-root': { boxShadow: 2 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'error.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Error color="error" />
              <Typography variant="h6" fontWeight={600}>Error Logs & Debugging</Typography>
              <Chip 
                label={debugData.errorLogs.length > 0 ? `${debugData.errorLogs.length} errors` : 'No errors'} 
                size="small" 
                color={debugData.errorLogs.length > 0 ? 'error' : 'success'} 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {debugData.errorLogs.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Error History</Typography>
                {/* TODO: Implement error log display */}
                <Alert severity="info">
                  Error logging collection is not yet implemented. This will be added in a future update.
                </Alert>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" color="success.main" fontWeight={600}>
                  No Errors Detected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The session is running smoothly without any logged errors
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Stack>
    );
  };

  // If directRender is true, automatically open and load data
  React.useEffect(() => {
    if (directRender) {
      setOpen(true);
      handleOpen();
    }
  }, [directRender]);

  // For direct rendering, return only the dialog content
  if (directRender) {
    return (
      <>
        {!loading && debugData && renderDebugSections()}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Add pulse animation keyframes */}
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.2); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}
        </style>
      </>
    );
  }

  return (
    <>
      {/* Enhanced Debug Button */}
      <Tooltip title="Comprehensive Debug Session Info (Dev Mode)">
        <IconButton
          onClick={handleOpen}
          sx={{
            bgcolor: '#ff6b35',
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': {
              bgcolor: '#e55a2b'
            },
            boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
            position: 'relative'
          }}
        >
          <BugReport sx={{ fontSize: 16 }} />
          {/* Pulse animation for active debug mode */}
          <Box
            sx={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              bgcolor: '#4caf50',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}
          />
        </IconButton>
      </Tooltip>

      {/* Comprehensive Debug Dialog - Single Page with Collapsible Sections */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '95vh',
            bgcolor: '#fafbfc'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#1f2937',
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport />
            <Typography variant="h6" fontWeight={600}>
              Comprehensive Debug Session Info
            </Typography>
            <Chip 
              label="ENHANCED DEV MODE" 
              size="small" 
              sx={{ 
                bgcolor: '#ff6b35', 
                color: 'white',
                fontSize: '0.7rem',
                height: 20
              }} 
            />
            {debugData && (
              <Chip 
                label={`${Object.keys(expandedSections).filter(key => expandedSections[key]).length}/${Object.keys(expandedSections).length} sections open`}
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20
                }} 
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Expand/Collapse All */}
            {debugData && (
              <Tooltip title="Expand/Collapse All Sections">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const allExpanded = Object.values(expandedSections).every(val => val);
                    const newState = Object.keys(expandedSections).reduce((acc, key) => {
                      acc[key] = !allExpanded;
                      return acc;
                    }, {} as Record<string, boolean>);
                    setExpandedSections(newState);
                  }}
                  sx={{ color: 'white', borderColor: 'white', fontSize: '0.75rem' }}
                  startIcon={<ExpandMore />}
                >
                  {Object.values(expandedSections).every(val => val) ? 'Collapse All' : 'Expand All'}
                </Button>
              </Tooltip>
            )}
            
            {/* Auto-refresh toggle */}
            <Tooltip title="Auto-refresh every 5s">
              <Button
                size="small"
                variant={autoRefresh ? "contained" : "outlined"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  bgcolor: autoRefresh ? 'rgba(255,255,255,0.2)' : 'transparent'
                }}
                startIcon={<Refresh />}
              >
                Auto
              </Button>
            </Tooltip>
            
            {/* Export button */}
            <Tooltip title="Export debug data as JSON">
              <IconButton 
                onClick={exportDebugData} 
                sx={{ color: 'white' }}
                disabled={!debugData}
              >
                <Download />
              </IconButton>
            </Tooltip>
            
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '400px',
              gap: 2
            }}>
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">
                Gathering Comprehensive Debug Information...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collecting session state, performance metrics, environment data, and system information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Memory sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Zero performance impact when debug mode is disabled
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
              {/* Summary Bar */}
              {debugData && (
                <Card sx={{ mb: 3, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700} color="primary">
                            {debugData.sessionInfo.totalMessages}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Messages</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700} color="success.main">
                            ${debugData.modelInfo.totalCost.toFixed(8)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Total Cost</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700} color="info.main">
                            {debugData.modelInfo.totalTokensUsed.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Tokens Used</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700} color="warning.main">
                            {debugData.debugTraces.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Debug Traces</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Main Debug Sections */}
              {renderDebugSections()}

              {/* Raw Data Section (Always Available) */}
              {debugData && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DataObject color="secondary" />
                        Raw Debug Data Export
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<ContentCopy />}
                          onClick={() => copyToClipboard(JSON.stringify(debugData, null, 2), 'Raw Debug Data')}
                          variant="outlined"
                        >
                          Copy JSON
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Download />}
                          onClick={exportDebugData}
                          variant="contained"
                          color="primary"
                        >
                          Download JSON
                        </Button>
                      </Box>
                    </Box>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(debugData, null, 2)}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Add pulse animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </>
  );
};

export default ComprehensiveDebugInfo;
