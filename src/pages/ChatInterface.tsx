import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Chip,
  Avatar,
  Tooltip,
  Divider,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Dialog,
  Stack
} from '@mui/material';
import { Send, AttachFile, Person, SmartToy, Search, LocationOn, Analytics, Add, Refresh, ContentCopy, Star, Close, ArrowUpward, AutoAwesome, BugReport } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import MarkdownMessage from '../components/chat/MarkdownMessage';
import LangGraphExecutionDisplay from '../components/chat/LangGraphExecutionDisplay';
import ExternalSourcesDisplay, { type ExternalSource } from '../components/chat/ExternalSourcesDisplay';
import RenderInstructionDisplay from '../components/chat/RenderInstructionDisplay';
import PropertyMap from '../components/maps/PropertyMap';
import AuthModal from '../components/auth/AuthModal';
import EnhancedToolsControl from '../components/tools/EnhancedToolsControl';
import SessionInfoDisplay, { type SessionMetrics } from '../components/chat/SessionInfoDisplay';
import CompactPlanInfo from '../components/chat/CompactPlanInfo';
import CompactSessionInfo from '../components/chat/CompactSessionInfo';
import CapabilitiesMatrixModal from '../components/CapabilitiesMatrixModal';
import UserProfileMenu from '../components/auth/UserProfileMenu';
import GettingStarted from '../components/chat/GettingStarted';
import { chatService } from '../services/chatService';
import { sessionSummaryService } from '../services/sessionSummaryService';
import { leftNavUpdateService } from '../services/leftNavUpdateService';
import { calculateModelCost, getModelDisplayName } from '../config/modelPricing';
import { useSessionLogger } from '../services/sessionLogger';
import type { ChatResponse } from '../services/chatService';
import type { CatchmentBoundaryFeature } from '../types/catchment';
import { hasCatchmentBoundary } from '../types/catchment';
// Removed MultiTabChatInterface - using direct session management
import { SessionScope } from '../types/sessionTypes';


export interface EnhancedChatSession {
  id: string;
  scope: SessionScope;
  title?: string;
  messages: any[];
  buyer_profile?: BuyerProfile;
  journey_stage?: string;
  referenced_property_id?: string;
  created_at?: string;
  updated_at?: string;
}
import { useTools } from '../hooks/useTools';
import AddressInputControl from '../components/contextual-inputs/AddressInputControl';
import PriceInputControl from '../components/contextual-inputs/PriceInputControl';
import MediaInputControl from '../components/contextual-inputs/MediaInputControl';
import type { CanvasTab } from '../components/organisms/CanvasPanel';
import MentionSystem, { type MentionSystemRef } from '../components/mention/MentionSystem';
import { mentionService } from '../services/mentionService';
import type { ChatSessionMention } from '../types/mention';
import { createLangGraphExecution } from '../utils/debugTraceUtils';
import { suggestionsService, type SuggestionResponse, type SuggestionsListResponse } from '../services/suggestionsService';
import { buyerProfileService, type BuyerProfile } from '../services/buyerProfileService';
import { dbFirstInitService, type InitializationResult, type SessionInitData, type InitializationState } from '../services/dbFirstInitService';
import InitializingUI from '../components/chat/InitializingUI';

interface ContextualInput {
  type: 'address' | 'price' | 'media' | 'features';
  component: React.ReactNode;
}

interface AgentInfo {
  name: string;
  title: string;
  avatar: string;
  description: string;
  capabilities: string[];
  limitations: string[];
}

// LLM-driven agent configurations
const AGENT_CONFIG: Record<string, AgentInfo> = {
  'exploration': {
    name: 'Grace',
    title: 'Property Exploration Assistant',
    avatar: '/px-grace.png',
    description: 'Grace specializes in helping you discover the perfect property by understanding your needs and progressively refining your search criteria.',
    capabilities: [
      '🔍 Intelligent property discovery based on your lifestyle and budget',
      '🗺️ Location-aware search with proximity to amenities you care about',
      '💰 Budget optimization and market insights',
      '📊 Progressive filter refinement to narrow down your ideal home',
      '🎯 Personalized recommendations based on your buyer profile',
      '📍 Spatial search near schools, hospitals, transport, and shopping'
    ],
    limitations: [
      '📋 Focused on exploration - for detailed property analysis, we can switch to drill mode',
      '🏠 Works with available property listings - some off-market properties may not be included',
      '📍 Location data accuracy depends on property listing information'
    ]
  },
  'property_drill': {
    name: 'Isaac',
    title: 'Property Analysis Specialist',
    avatar: '/px-isaac.png',
    description: 'Isaac is a meticulous property analyst who provides comprehensive, data-driven insights about specific properties. He combines listing information with real-time market research to give you the complete picture.',
    capabilities: [
      '🏠 Comprehensive property profile creation with all available details',
      '🔍 Real-time web research for up-to-date market information',
      '📍 Detailed neighborhood analysis and local amenity insights',
      '💰 Investment analysis including rental potential and growth projections',
      '🏘️ Market positioning and comparable property analysis',
      '📊 Property history, price trends, and market context',
      '🔧 Property condition insights and potential renovation considerations',
      '🎯 Personalized analysis based on your buyer profile and preferences'
    ],
    limitations: [
      '🎯 Focused on single property deep analysis - for exploration, return to Grace',
      '🌐 Analysis quality depends on available online information and listing details',
      '📊 Some insights may require physical property inspection to confirm',
      '⏰ Comprehensive analysis takes time for thoroughness and accuracy'
    ]
  },
  'comparison': {
    name: 'Sofia',
    title: 'Property Comparison Expert',
    avatar: '/px-grace.png',
    description: 'Sofia helps you compare multiple properties side-by-side with weighted analysis based on your priorities and decision criteria.',
    capabilities: [
      '⚖️ Side-by-side property comparison with scoring',
      '🎯 Decision matrix based on your priorities',
      '💡 Trade-off analysis and recommendation guidance',
      '📊 Financial comparison across multiple properties',
      '🗺️ Location comparison and accessibility analysis',
      '🏆 Clear recommendations with reasoning'
    ],
    limitations: [
      '📋 Best with 2-4 properties - too many can be overwhelming',
      '🎯 Requires clear priorities to provide meaningful comparisons',
      '📊 Comparison quality depends on available property data'
    ]
  }
};

interface MapData {
  type: 'property_map';
  title: string;
  properties: Array<{
    id: string;
    address: string;
    latitude: number;
    longitude: number;
    price?: string;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    [key: string]: any;
  }>;
  total_properties: number;
  valid_properties: number;
  invalid_properties: number;
  center?: { latitude: number; longitude: number };

  // Phase 3: School catchment boundary support
  catchment_boundaries?: CatchmentBoundaryFeature[];
  has_school_catchment?: boolean;
  bounds?: {
    southwest: { latitude: number; longitude: number };
    northeast: { latitude: number; longitude: number };
  };
}

// LangGraph trace step data structure (matches LangGraphExecutionDisplay)
interface LangGraphTraceStep {
  agent: string;
  duration_ms: number;
  success: boolean;
  tools_used?: string[];
  tokens_in?: number;
  tokens_out?: number;
  estimated_cost?: number;
  thinking_process?: string;
  tool_results?: {
    [toolName: string]: {
      input?: any;
      output?: any;
      execution_time_ms?: number;
      api_calls_made?: number;
      status?: string;
    };
  };
  metadata?: Record<string, any>;
}

interface LangGraphExecutionData {
  trace: LangGraphTraceStep[];
  debug_trace?: Array<Record<string, any>>;  // Enhanced debug trace for testing
  debug_mode?: boolean;  // Flag indicating debug mode is enabled
  total_duration_ms: number;
  total_tokens_in: number;
  total_tokens_out: number;
  total_estimated_cost: number;
  architecture: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  timestamp: Date;
  
  // Structured data from backend
  render_instruction?: {
    type: string;
    title?: string;
    subtitle?: string;
    items?: any[];
    pins?: any[];
    [key: string]: any;
  };
  
  // Token usage tracking
  token_usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    estimated_cost: number;
  };
  
  // Local ChatInterface specific fields
  contextualInput?: ContextualInput;
  model?: string;
  streaming?: boolean;
  isError?: boolean;
  originalUserMessage?: string; // Store the original message for retry
  langGraphExecution?: LangGraphExecutionData; // Track LangGraph execution data for this message
  externalSources?: ExternalSource[]; // Track external sources referenced in this message
  mapData?: MapData; // Track map data for this message
  mentions?: ChatSessionMention[]; // Track mentioned items in this message
  
  // Simple introduction options for new users
  introductionOptions?: Array<{
    id: string;
    text: string; 
    action: string;
  }>;
}

interface ChatInterfaceProps {
  onCanvasAdd?: (tab: CanvasTab) => void;
  onCanvasClose?: (tabId: string) => void;
  onRegisterCanvasClose?: (handler: (tabId: string) => void) => void;
  onRegisterSessionResume?: (handler: (sessionId: string, messages: any[], session?: any) => void) => void;
  onRegisterNewJourney?: (handler: () => void) => void; // Register New Journey handler
  onNewSessionCreated?: () => void;
  onSessionMetricsChange?: (metrics: SessionMetrics) => void;
  onMessagesChange?: (messages: Message[]) => void;
  onCurrentModelChange?: (modelId: string) => void;
  onDebugInfoChange?: (debugInfo: any) => void;
  onSessionNameChange?: (sessionName: string) => void; // New callback for tab title updates
  onSessionIdChange?: (sessionId: string | null) => void; // Track current active session ID
  forceNewSession?: boolean; // If true, ignore localStorage and start fresh
  
  // 🎯 NEW: Journey loading animation methods from LeftNavigation
  loadingJourneyMethods?: {
    addLoadingJourney: () => string;
    removeLoadingJourney: (id: string) => void;
  } | null;
}

// Helper function to detect if response content indicates an error
const isErrorResponse = (content: string): boolean => {
  if (!content) return false;
  
  const errorPatterns = [
    /no response generated/i,
    /error:.*occurred/i,
    /failed to.*generate/i,
    /unable to.*process/i,
    /agent stopped due to iteration limit/i,
    /agent stopped due to time limit/i,
    /model not found/i,
    /rate limit exceeded/i,
    /authentication.*failed/i,
    /invalid.*api.*key/i,
    /service.*unavailable/i,
    /connection.*error/i,
    /timeout.*error/i,
    /internal.*server.*error/i,
    /^error:/i,
    /^\[.*error.*\]/i,
    /tool.*execution.*failed/i,
    /function.*call.*failed/i
  ];
  
  return errorPatterns.some(pattern => pattern.test(content.trim()));
};

// Helper function to convert technical errors to user-friendly messages
const getUserFriendlyErrorMessage = (error: string): string => {
  // Remove technical prefixes and error types
  let cleanError = error.replace(/^\[.*?\]\s*/, ''); // Remove [provider] prefix
  cleanError = cleanError.replace(/\(Code:\s*\w+\)/, ''); // Remove error codes
  
  // Common error patterns and user-friendly messages
  if (error.toLowerCase().includes('no response generated')) {
    return "💭 The AI model couldn't generate a proper response. This might be due to model limitations or configuration issues. Please try a different model or rephrase your request.";
  }
  
  if (error.toLowerCase().includes('agent stopped due to iteration limit') || error.toLowerCase().includes('agent stopped due to time limit')) {
    return "⏱️ The AI agent reached its processing limit while trying to help you. Please try breaking your request into smaller parts or simplify your question.";
  }
  
  if (error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('quota')) {
    return "⏱️ The AI service is currently busy. Please wait a moment and try again.";
  }
  
  if (error.toLowerCase().includes('auth') || error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('forbidden')) {
    return "🔑 Authentication issue with the AI service. Please try again or contact support.";
  }
  
  if (error.toLowerCase().includes('model') && error.toLowerCase().includes('not found')) {
    return "🤖 The selected AI model is currently unavailable. Please try a different model.";
  }
  
  if (error.toLowerCase().includes('timeout') || error.toLowerCase().includes('timed out')) {
    return "⏰ The request took too long to complete. This might be due to high server load or network issues. Please try again in a moment.";
  }
  
  if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
    return "🌐 Network connection issue. Please check your internet connection and try again.";
  }
  
  if (error.toLowerCase().includes('http 429')) {
    return "⏱️ Too many requests. Please wait a moment before sending another message.";
  }
  
  if (error.toLowerCase().includes('http 500') || error.toLowerCase().includes('internal server')) {
    return "🛠️ The AI service is experiencing technical difficulties. Please try again in a few minutes.";
  }
  
  if (error.toLowerCase().includes('http 404')) {
    return "🔍 The requested service endpoint was not found. Please try again or contact support.";
  }
  
  // For streaming/generation errors
  if (error.toLowerCase().includes('streaming') || error.toLowerCase().includes('generate')) {
    return "💬 There was an issue generating the response. Please try rephrasing your message or try again.";
  }
  
  // For tool-related errors
  if (error.toLowerCase().includes('tool') || error.toLowerCase().includes('function')) {
    return "🛠️ There was an issue using the AI tools. The response may be limited to text only.";
  }
  
  // Generic fallback for unknown errors
  if (cleanError.trim().length === 0 || cleanError.toLowerCase().includes('unknown')) {
    return "❌ An unexpected error occurred. Please try again or refresh the page.";
  }
  
  // If we have a clean, specific error message, return it with a friendly icon
  return `⚠️ ${cleanError.charAt(0).toUpperCase() + cleanError.slice(1)}`;
};

// Helper function to extract external sources from LLM response content
const extractExternalSources = (content: string): ExternalSource[] => {
  const sources: ExternalSource[] = [];
  
  // Pattern for training data warnings
  const trainingDataPattern = /⚠️.*training data/gi;
  const trainingDataMatches = content.match(trainingDataPattern);
  if (trainingDataMatches) {
    trainingDataMatches.forEach((_, index) => {
      sources.push({
        id: `training-${Date.now()}-${index}`,
        title: 'AI Training Data',
        url: '',
        domain: 'training-data',
        sourceType: 'training_data',
        timestamp: new Date(),
        description: 'Information from AI model training data',
        verified: false
      });
    });
  }
  
  // Pattern for "According to [Source]" references
  const sourcePattern = /According to ([^,]+),/gi;
  let sourceMatch;
  while ((sourceMatch = sourcePattern.exec(content)) !== null) {
    const sourceName = sourceMatch[1].trim();
    sources.push({
      id: `source-${Date.now()}-${sources.length}`,
      title: sourceName,
      url: '',
      domain: sourceName.toLowerCase().replace(/\s+/g, '-'),
      sourceType: 'external_api',
      timestamp: new Date(),
      description: `Referenced external source: ${sourceName}`,
      verified: false
    });
  }
  
  // Pattern for URLs in the content
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  let urlMatch;
  while ((urlMatch = urlPattern.exec(content)) !== null) {
    const url = urlMatch[1];
    try {
      const urlObj = new URL(url);
      sources.push({
        id: `url-${Date.now()}-${sources.length}`,
        title: urlObj.hostname,
        url: url,
        domain: urlObj.hostname,
        sourceType: 'web_search',
        timestamp: new Date(),
        description: `External link referenced`,
        verified: false
      });
    } catch (e) {
      // Invalid URL, skip
    }
  }
  
  // Pattern for geocoding references
  if (content.toLowerCase().includes('geocoding') || content.toLowerCase().includes('coordinates from')) {
    sources.push({
      id: `geocoding-${Date.now()}`,
      title: 'Geocoding Service',
      url: '',
      domain: 'geocoding-api',
      sourceType: 'geocoding',
      timestamp: new Date(),
      description: 'External geocoding service used for coordinate lookup',
      verified: true
    });
  }
  
  return sources;
};

// Helper function to extract map data from LangGraph tool result
const extractMapDataFromToolResult = (result: any): MapData | null => {
  try {
    // 🚨 DEBUG: Add comprehensive logging for catchment boundary data pipeline
    console.log('🔍 [CATCHMENT_DEBUG] extractMapDataFromToolResult called with result:', {
      hasData: !!result.data,
      hasOutput: !!result.output,
      dataKeys: result.data ? Object.keys(result.data) : [],
      outputKeys: result.output ? Object.keys(result.output) : []
    });

    // Check if this is an Enhanced Spatial Search Tool response with catchment data
    if (result.data && typeof result.data === 'object') {
      const data = result.data;

      // 🚨 DEBUG: Log data structure
      console.log('🔍 [CATCHMENT_DEBUG] Checking result.data structure:', {
        hasSelectedAmenity: !!data.selected_amenity,
        hasProperties: !!data.properties,
        hasCatchmentBoundary: !!data.catchment_boundary,
        hasSchoolCatchment: !!data.has_school_catchment,
        disambiguationAction: data.disambiguation_action
      });

      if (data.catchment_boundary && data.has_school_catchment) {
        console.log('🔍 [CATCHMENT_DEBUG] Found catchment data in result.data:', {
          catchmentBoundary: data.catchment_boundary,
          hasSchoolCatchment: data.has_school_catchment
        });
      }

      // Check for Enhanced Spatial Search Tool response with school catchment
      if (data.selected_amenity && data.selected_amenity.metadata?.has_catchment_boundary && data.selected_amenity.metadata?.boundary_coordinates) {
        const amenity = data.selected_amenity;
        const boundary_coordinates = amenity.metadata.boundary_coordinates;
        const catchment_id = amenity.metadata.catchment_id;
        const catchment_level = amenity.metadata.catchment_level;
        const school_metadata = amenity.metadata.school_metadata || {};

        // Create GeoJSON feature for catchment boundary
        const catchmentBoundary: CatchmentBoundaryFeature = {
          type: 'Feature' as const,
          properties: {
            catchment_id: catchment_id,
            school_name: amenity.name,
            school_id: amenity.id,
            catchment_level: catchment_level,
            school_metadata: {
              address: amenity.address,
              suburb: amenity.suburb,
              postcode: '', // Not available in this structure
              latitude: amenity.latitude,
              longitude: amenity.longitude,
              subtype: catchment_level === 'primary' ? 'Primary School' : 'Secondary School',
              catchment_level: catchment_level,
              ...school_metadata
            }
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: boundary_coordinates
          }
        };

        // Create a map data object with properties and catchment boundary
        const properties = data.properties || [];

        return {
          type: 'property_map',
          title: `${amenity.name} - School Catchment`,
          properties: properties,
          total_properties: data.total_count || properties.length,
          valid_properties: properties.length,
          invalid_properties: Math.max(0, (data.total_count || properties.length) - properties.length),
          center: {
            latitude: amenity.latitude,
            longitude: amenity.longitude
          },
          // Phase 3: Include catchment boundary data
          catchment_boundaries: [catchmentBoundary],
          has_school_catchment: true
        };
      }

      // 🚨 CHECK: Enhanced Spatial Search Tool response with catchment data (new format)
      if (data.catchment_boundary && data.has_school_catchment && data.properties) {
        console.log('🔍 [CATCHMENT_DEBUG] Processing Enhanced Spatial Search Tool response with catchment boundary');

        const properties = data.properties;
        const catchmentBoundary = data.catchment_boundary;
        const locationResult = data.location_result;

        // Create map data with catchment boundary
        return {
          type: 'property_map',
          title: `${locationResult?.display_name || 'School'} - School Catchment`,
          properties: properties,
          total_properties: data.total_count || properties.length,
          valid_properties: properties.length,
          invalid_properties: Math.max(0, (data.total_count || properties.length) - properties.length),
          center: locationResult ? {
            latitude: locationResult.latitude,
            longitude: locationResult.longitude
          } : undefined,
          // Phase 3: Include catchment boundary data
          catchment_boundaries: [catchmentBoundary],
          has_school_catchment: true
        };
      }

      // Check for regular Enhanced Spatial Search response with properties but no catchment
      if (data.properties && Array.isArray(data.properties)) {
        const properties = data.properties;
        const center = data.spatial_search_params?.amenity ? {
          latitude: data.spatial_search_params.amenity.latitude,
          longitude: data.spatial_search_params.amenity.longitude
        } : undefined;

        return {
          type: 'property_map',
          title: data.spatial_search_params?.reference_location || 'Properties',
          properties: properties,
          total_properties: data.total_count || properties.length,
          valid_properties: properties.length,
          invalid_properties: Math.max(0, (data.total_count || properties.length) - properties.length),
          center: center
        };
      }
    }

    // Legacy support: Check if this is a plot_properties response with catchment data
    if (result.output && typeof result.output === 'object') {
      const output = result.output;

      // 🚨 DEBUG: Log output structure
      console.log('🔍 [CATCHMENT_DEBUG] Checking result.output structure:', {
        hasCatchmentBoundary: hasCatchmentBoundary(output),
        hasSchoolCatchment: !!output.has_school_catchment,
        catchmentBoundary: !!output.catchment_boundary,
        outputKeys: Object.keys(output)
      });

      // Check for Enhanced Spatial Search Tool response with school catchment
      if (hasCatchmentBoundary(output)) {
        console.log('🔍 [CATCHMENT_DEBUG] Processing catchment boundary from result.output:', output.catchment_boundary);
        const catchmentBoundary = output.catchment_boundary;
        const locationResult = output.location_result;

        // Create a map data object focused on the school location with catchment boundary
        const schoolProperty = {
          id: catchmentBoundary.properties.school_id,
          address: `${catchmentBoundary.properties.school_metadata.address}, ${catchmentBoundary.properties.school_metadata.suburb} ${catchmentBoundary.properties.school_metadata.postcode}`,
          latitude: catchmentBoundary.properties.school_metadata.latitude,
          longitude: catchmentBoundary.properties.school_metadata.longitude,
          propertyType: 'School',
          details: `${catchmentBoundary.properties.school_name} - ${catchmentBoundary.properties.catchment_level} school`
        };

        return {
          type: 'property_map',
          title: `${catchmentBoundary.properties.school_name} - School Catchment`,
          properties: [schoolProperty],
          total_properties: 1,
          valid_properties: 1,
          invalid_properties: 0,
          center: {
            latitude: schoolProperty.latitude,
            longitude: schoolProperty.longitude
          },
          // Phase 3: Include catchment boundary data
          catchment_boundaries: [catchmentBoundary],
          has_school_catchment: true
        };
      }

      // Check for standard property search results
      if (output.properties) {
        const properties = output.properties;

        // Convert to MapData format
        const mapProperties = properties.map((prop: any) => ({
          id: prop.id || prop.address?.split(',')[0],
          address: prop.address,
          latitude: prop.coordinates?.lat || prop.latitude || prop.lat,
          longitude: prop.coordinates?.lng || prop.coordinates?.lon || prop.longitude || prop.lng,
          price: prop.price,
          bedrooms: prop.beds || prop.bedrooms,
          bathrooms: prop.baths || prop.bathrooms,
          propertyType: prop.property_type || prop.propertyType || prop.type || 'Property',
          details: prop.details
        })).filter((prop: any) => prop.latitude && prop.longitude);

        return {
          type: 'property_map',
          title: 'Property Map',
          properties: mapProperties,
          total_properties: properties.length,
          valid_properties: mapProperties.length,
          invalid_properties: properties.length - mapProperties.length
        };
      }
    }

    // 🚨 DEBUG: Log when no map data is found
    console.log('🔍 [CATCHMENT_DEBUG] No map data extracted from tool result');

  } catch (error) {
    console.error('🔍 [CATCHMENT_DEBUG] Error extracting map data from tool result:', error);
  }
  return null;
};

// Map data extraction is now handled inline in the tool execution processing

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onCanvasAdd,
  onCanvasClose: _onCanvasClose,
  onRegisterCanvasClose,
  onRegisterSessionResume,
  onRegisterNewJourney,
  onNewSessionCreated,
  onSessionMetricsChange,
  onMessagesChange,
  onCurrentModelChange,
  onDebugInfoChange,
  onSessionNameChange,
  onSessionIdChange,
  forceNewSession = false,
  loadingJourneyMethods // 🎯 NEW: Journey loading animation methods
}) => {
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  // Handle input changes - optimized for performance
  const handleInputValueChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
  const [isProcessingWelcomeMessage, setIsProcessingWelcomeMessage] = useState(false);
  const welcomeMessageProcessedRef = useRef<string | null>(null);
  
  // Mention system state
  const [sessionMentions, setSessionMentions] = useState<ChatSessionMention[]>([]);
  const mentionSystemRef = useRef<MentionSystemRef>(null);

  // Multi-tab interface state
  const [sessions, setSessions] = useState<EnhancedChatSession[]>([]);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>({
    life_stage: 'first_home',
    budget_range: { min: 300000, max: 800000 },
    timeline: 'flexible',
    location_priorities: ['transport', 'lifestyle'],
    property_priorities: ['space', 'modern'],
    risk_tolerance: 'moderate',
    search_patterns: [],
    engagement_history: [],
    decision_factors: []
  });
  const [bookmarkedProperties, setBookmarkedProperties] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Follow-up staging state
  const [isFollowUpStaged, setIsFollowUpStaged] = useState(false);
  
  // Sparkle suggestions state
  const [sparkleSuggestionsAnchor, setSparkleSuggestionsAnchor] = useState<HTMLElement | null>(null);
  const [sparkleSuggestions, setSparkleSuggestions] = useState<SuggestionsListResponse | null>(null);
  const [showGracePortfolio, setShowGracePortfolio] = useState(false);
  
  // Mock plan data (this would come from user context in real implementation)
  const [planData] = useState({
    planName: 'Plus Plan',
    planTier: 'PLUS' as const,
    monthlyQueries: { current: 347, limit: 1500, period: 'monthly' },
    apiCalls: { current: 125, limit: 10000, period: 'daily' },
    propertyAnalyses: { current: 89, limit: 500, period: 'monthly' }
  });
  
  // Enhanced chat state
  const [currentModel, setCurrentModel] = useState<string>('gemini-2.5-flash-lite'); // Default model
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(true); // 🎯 Show Getting Started by default

  // DB-First Initialization state
  const [initializationResult, setInitializationResult] = useState<InitializationResult | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isJourneyNavigationLoaded, setIsJourneyNavigationLoaded] = useState(false);
  const [dbFirstSessionSelected, setDbFirstSessionSelected] = useState(false);
  const isCreatingSessionRef = useRef(false);
  
  // ✅ FIX: Prevent double initialization from auth state changes
  const initializationStartedRef = useRef(false);
  
  // ✅ FIX: Prevent double buyer profile loading from auth state changes
  const buyerProfileLoadedRef = useRef(false);

  const [, setStreamingMessageId] = useState<string | null>(null);
  const [liveLangGraphExecution, setLiveLangGraphExecution] = useState<LangGraphExecutionData | null>(null);
  const [liveExternalSources, setLiveExternalSources] = useState<ExternalSource[]>([]);
  const [requestStartTs, setRequestStartTs] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [debugCopySuccess, setDebugCopySuccess] = useState(false);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>({
    sessionName: 'New Chat',
    totalTextCount: '0',
    totalInputTokens: '0',
    totalOutputTokens: '0',
    totalCreditsUsed: '0.000000',
    toolsUsed: {}
  });
  
  // Session logger integration
  const { startLogging, stopLogging, logCustom, isLogging } = useSessionLogger();

  // Cleanup session logging on unmount or session change
  useEffect(() => {
    return () => {
      if (isLogging) {
        stopLogging();
        console.log('🔴 [SessionLogger] Stopped logging on component cleanup');
      }
    };
  }, [stopLogging, isLogging]);

  // Notify parent when session metrics change
  useEffect(() => {
    // console.log('📊 [SessionMetrics] Session metrics changed:', {
    //   totalCreditsUsed: sessionMetrics.totalCreditsUsed,
    //   totalInputTokens: sessionMetrics.totalInputTokens,
    //   totalOutputTokens: sessionMetrics.totalOutputTokens,
    //   stackTrace: new Error().stack?.split('\n').slice(1, 4).join(' -> ')
    // }); // Commented out for performance
    if (onSessionMetricsChange) {
      onSessionMetricsChange(sessionMetrics);
    }
  }, [sessionMetrics, onSessionMetricsChange]);
  
  const [hasGeneratedSessionName, setHasGeneratedSessionName] = useState(false);
  const [isGeneratingSessionName, setIsGeneratingSessionName] = useState(false);
  
  const { user, isAuthenticated, signOut } = useAuth();
  const { tools, toggleTool, incrementUsage } = useTools();
  
  // TOKEN TRACKING STRATEGY:
  // Backend: Automatically tracks metrics from LangGraph trace metadata when saving AI messages
  // Frontend: Shows real-time approximations during streaming, then syncs from backend for accuracy
  // Chat History: Always shows backend data (source of truth)
  // Header: Shows frontend state, synced from backend after each AI response
  
  // Token cost calculation using real model pricing
  const calculateTokenCost = (inputTokens: number, outputTokens: number): number => {
    return calculateModelCost(currentModel, inputTokens, outputTokens);
  };
  

  
  // Add text to metrics (count characters)
  const addTextToMetrics = (text: string) => {
    const textLength = text.length;
    setSessionMetrics(prev => ({
      ...prev,
      totalTextCount: (parseInt(prev.totalTextCount) + textLength).toString()
    }));
  };
  
  // Add tokens to metrics and calculate cost
  const addTokensToMetrics = (inputTokens: number, outputTokens: number) => {
    const cost = calculateTokenCost(inputTokens, outputTokens);
    console.log('💰 [AddTokensToMetrics] Adding cost to session metrics:', {
      inputTokens,
      outputTokens,
      calculatedCost: cost,
      previousTotalCost: parseFloat(sessionMetrics.totalCreditsUsed),
      newTotalCost: parseFloat(sessionMetrics.totalCreditsUsed) + cost
    });
    setSessionMetrics(prev => ({
      ...prev,
      totalInputTokens: (parseInt(prev.totalInputTokens) + inputTokens).toString(),
      totalOutputTokens: (parseInt(prev.totalOutputTokens) + outputTokens).toString(),
      totalCreditsUsed: (parseFloat(prev.totalCreditsUsed) + cost).toFixed(6) // Use 6 decimal places to preserve small costs
    }));
  };
  
  // Add tool usage to metrics
  const addToolUsageToMetrics = (toolName: string) => {
    setSessionMetrics(prev => ({
      ...prev,
      toolsUsed: {
        ...prev.toolsUsed,
        [toolName]: (prev.toolsUsed[toolName] || 0) + 1
      }
    }));
  };
  
  // Generate session name based on user message and AI response
  const generateSessionName = async (userMessage: string, aiResponse: string, targetSessionId?: string) => {
    const actualSessionId = targetSessionId || sessionId;
    
    console.log('🏷️ [GenerateSessionName] Starting session name generation...', {
      hasGeneratedSessionName,
      isGeneratingSessionName,
      actualSessionId,
      userMessageLength: userMessage?.length,
      aiResponseLength: aiResponse?.length
    });
    
    if (hasGeneratedSessionName) {
      console.log('⏭️ [GenerateSessionName] Session name already generated, skipping');
      return;
    }
    
    if (isGeneratingSessionName) {
      console.log('⏳ [GenerateSessionName] Session name generation already in progress, skipping duplicate call');
      return;
    }
    
    if (!actualSessionId) {
      console.error('❌ [GenerateSessionName] No session ID available, cannot save session name');
      return;
    }
    
    // Immediately set flags to prevent duplicate calls
    console.log('🔒 [GenerateSessionName] Marking session name generation as in progress to prevent duplicates');
    setIsGeneratingSessionName(true);
    setHasGeneratedSessionName(true);
    
    const sessionName = generateSmartSessionName(userMessage, aiResponse);
    setSessionMetrics(prev => ({
      ...prev,
      sessionName
    }));
    console.log(`🏷️ [GenerateSessionName] Generated session name: "${sessionName}" (${sessionName.length} chars)`);
    
    // Notify parent to update tab title
    if (onSessionNameChange) {
      onSessionNameChange(sessionName);
    }
    
    // Save session name to database
    try {
      console.log(`💾 [GenerateSessionName] Attempting to save session name to database...`);
      console.log(`💾 [GenerateSessionName] Saving to session ID: ${actualSessionId}`);
      console.log(`💾 [GenerateSessionName] Session name to save: "${sessionName}"`);
      
      await saveSessionNameToDatabase(actualSessionId, sessionName);
      console.log(`✅ [GenerateSessionName] Successfully saved session name "${sessionName}" to database`);
    } catch (error) {
      console.error('💥 [GenerateSessionName] Failed to save session name to database:', error);
      console.error('💥 [GenerateSessionName] Error details:', error);
    } finally {
      // Clear the generation flag
      console.log('🔓 [GenerateSessionName] Clearing generation flag');
      setIsGeneratingSessionName(false);
    }
  };
  
  // Generate descriptive session name based on AI response content (primary) and user message (secondary)
  const generateSmartSessionName = (userMessage: string, aiResponse: string): string => {
    const lowerUser = userMessage.toLowerCase();
    const lowerAi = aiResponse.toLowerCase();
    
    console.log('🔍 [Session Naming] Analyzing content:', {
      userMessage: lowerUser,
      aiResponsePreview: lowerAi.substring(0, 100)
    });
    
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    const capitalizeWords = (str: string) => str.split(' ').map(capitalize).join(' ');
    
    // Function to extract dominant topics from AI response
    const extractTopicsFromAI = () => {
      const topics = [];
      
      // Educational topics (prioritize from AI response)
      if (lowerAi.includes('school') || lowerAi.includes('education') || lowerAi.includes('university') || lowerAi.includes('college')) {
        if (lowerAi.includes('university') || lowerAi.includes('universities')) {
          topics.push('Universities');
        } else if (lowerAi.includes('school') || lowerAi.includes('schools')) {
          topics.push('Schools');
        } else {
          topics.push('Education');
        }
      }
      
      // Technology topics
      if (lowerAi.includes('software') || lowerAi.includes('programming') || lowerAi.includes('coding') || lowerAi.includes('tech')) {
        topics.push('Technology');
      }
      
      // Finance topics
      if (lowerAi.includes('finance') || lowerAi.includes('money') || lowerAi.includes('budget') || lowerAi.includes('cost')) {
        topics.push('Finance');
      }
      
      // Travel topics
      if (lowerAi.includes('travel') || lowerAi.includes('trip') || lowerAi.includes('destination') || lowerAi.includes('hotel')) {
        topics.push('Travel');
      }
      
      // Health topics
      if (lowerAi.includes('health') || lowerAi.includes('medical') || lowerAi.includes('doctor') || lowerAi.includes('fitness')) {
        topics.push('Health');
      }
      
      // Food topics
      if (lowerAi.includes('food') || lowerAi.includes('recipe') || lowerAi.includes('cooking') || lowerAi.includes('restaurant')) {
        topics.push('Food');
      }
      
      // Business topics
      if (lowerAi.includes('business') || lowerAi.includes('company') || lowerAi.includes('entrepreneur') || lowerAi.includes('startup')) {
        topics.push('Business');
      }
      
      // Property topics (fallback to property domain)
      if (lowerAi.includes('property') || lowerAi.includes('real estate') || lowerAi.includes('house') || lowerAi.includes('apartment')) {
        topics.push('Property');
      }
      
      return topics;
    };
    
    // Function to extract locations (from both user and AI, prioritize AI)
    const extractLocations = () => {
      // State codes - need word boundaries to avoid false matches
      const stateCodes = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
      const cities = ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'darwin', 'hobart', 'gold coast', 'newcastle', 'wollongong', 'geelong', 'townsville', 'cairns'];
      
      // Check for state codes with word boundaries (more precise)
      for (const state of stateCodes) {
        const stateRegex = new RegExp(`\\b${state}\\b`, 'i');
        if (stateRegex.test(lowerAi) || stateRegex.test(lowerUser)) {
          return state;
        }
      }
      
      // Check for cities (case insensitive, full word match)
      for (const city of cities) {
        if (lowerAi.includes(city) || lowerUser.includes(city)) {
          return capitalizeWords(city);
        }
      }
      
      return null;
    };
    
    // Function to extract actions/verbs from user message
    const extractUserActions = () => {
      const actions = [];
      
      if (lowerUser.includes('list') || lowerUser.includes('show') || lowerUser.includes('find')) {
        actions.push('List');
      }
      if (lowerUser.includes('compare') || lowerUser.includes('analysis')) {
        actions.push('Compare');
      }
      if (lowerUser.includes('help') || lowerUser.includes('advice')) {
        actions.push('Help');
      }
      if (lowerUser.includes('explain') || lowerUser.includes('what is')) {
        actions.push('Explain');
      }
      if (lowerUser.includes('recommend') || lowerUser.includes('suggest')) {
        actions.push('Recommend');
      }
      
      return actions;
    };
    
    // Function to extract key subjects from AI response content
    const extractKeySubjects = () => {
      const subjects = [];
      
      // Look for numbered lists or structured content
      const sentences = lowerAi.split(/[.!?]\s+/).slice(0, 3); // First 3 sentences
      
      for (const sentence of sentences) {
        // Extract subjects after "found", "located", "available", etc.
        const foundMatches = sentence.match(/found (\d+) ([a-zA-Z]+)/);
        if (foundMatches) {
          subjects.push(capitalize(foundMatches[2]));
        }
        
        // Extract subjects from "these are", "here are", etc.
        const hereMatches = sentence.match(/(?:here are|these are|listed below are) (?:the )?(\w+)/);
        if (hereMatches) {
          subjects.push(capitalize(hereMatches[1]));
        }
        
        // Extract from contexts like "X Campus", "Y Type", etc.
        const campusMatches = sentence.match(/(\w+) campus/g);
        if (campusMatches) {
          subjects.push('Universities');
        }
        
        // Extract subjects from typical AI response patterns
        if (sentence.includes('university') || sentence.includes('universities')) {
          subjects.push('Universities');
        }
        if (sentence.includes('school') || sentence.includes('schools')) {
          subjects.push('Schools');
        }
      }
      
      return [...new Set(subjects)]; // Remove duplicates
    };
    
    const topics = extractTopicsFromAI();
    const location = extractLocations();
    const actions = extractUserActions();
    const subjects = extractKeySubjects();
    
    console.log('🔍 [Session Naming] Extracted info:', {
      topics, location, actions, subjects
    });
    
    // Generate enhanced descriptive session name (targeting 20-30 characters)
    // Priority order with enhanced descriptiveness:
    
    // Helper function to add descriptive context
    const addContext = (baseName: string) => {
      const timestamp = new Date().toLocaleDateString('en-AU', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Add contextual suffixes based on content analysis
      let contextSuffix = '';
      
      if (lowerAi.includes('found') && /found \d+/.test(lowerAi)) {
        const match = lowerAi.match(/found (\d+)/);
        if (match) {
          contextSuffix = ` Search (${match[1]} Results)`;
        }
      } else if (lowerUser.includes('help') || lowerUser.includes('advice')) {
        contextSuffix = ' Advisory Session';
      } else if (lowerUser.includes('compare') || lowerUser.includes('analysis')) {
        contextSuffix = ' Analysis & Comparison';
      } else if (lowerUser.includes('market') || lowerAi.includes('market')) {
        contextSuffix = ' Market Research';
      } else if (lowerUser.includes('invest') || lowerAi.includes('invest')) {
        contextSuffix = ' Investment Discussion';
      } else if (lowerUser.includes('buy') || lowerUser.includes('sell')) {
        contextSuffix = ' Transaction Planning';
      } else if (lowerAi.includes('property') || lowerAi.includes('properties')) {
        contextSuffix = ' Property Consultation';
      } else if (lowerUser.includes('explain') || lowerUser.includes('what is')) {
        contextSuffix = ' Learning Session';
      } else {
        contextSuffix = ` Chat ${timestamp}`;
      }
      
      return `${baseName}${contextSuffix}`;
    };
    
    // Enhanced generation with longer, more descriptive titles
    
    // Location + Subject + Action (most descriptive)
    if (location && subjects.length > 0 && actions.length > 0) {
      const baseName = `${location} ${subjects[0]} ${actions[0]}`;
      return addContext(baseName).substring(0, 35); // Cap at 35 chars
    }
    
    // Location + Subject with context
    if (location && subjects.length > 0) {
      const baseName = `${location} ${subjects[0]}`;
      return addContext(baseName).substring(0, 35);
    }
    
    // Subject + Action with enhanced detail
    if (subjects.length > 0 && actions.length > 0) {
      const baseName = `${subjects[0]} ${actions[0]}`;
      return addContext(baseName).substring(0, 35);
    }
    
    // Location + Topic with descriptive context
    if (location && topics.length > 0) {
      const baseName = `${location} ${topics[0]}`;
      return addContext(baseName).substring(0, 35);
    }
    
    // Subject with enhanced context
    if (subjects.length > 0) {
      const baseName = subjects[0];
      return addContext(baseName).substring(0, 35);
    }
    
    // Topic with detailed context
    if (topics.length > 0) {
      const baseName = topics[0];
      return addContext(baseName).substring(0, 35);
    }
    
    // Location with inquiry context
    if (location) {
      const baseName = `${location} Property Research`;
      return addContext(baseName).substring(0, 35);
    }
    
    // Demo sessions with timestamp
    if (lowerUser.includes('demo')) {
      const timestamp = new Date().toLocaleDateString('en-AU', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `Demo Session ${timestamp}`;
    }
    
    // Enhanced fallback using multiple user words
    const userWords = lowerUser.split(/\s+/).filter(word => 
      word.length > 3 && 
      !['the', 'and', 'with', 'that', 'this', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'could', 'would', 'should', 'what', 'your', 'just', 'like', 'help', 'need', 'look', 'find', 'please', 'want'].includes(word)
    );
    
    if (userWords.length >= 2) {
      const baseName = `${capitalize(userWords[0])} ${capitalize(userWords[1])}`;
      return addContext(baseName).substring(0, 35);
    } else if (userWords.length >= 1) {
      const baseName = `${capitalize(userWords[0])} Discussion`;
      return addContext(baseName).substring(0, 35);
    }
    
    // Final fallback with timestamp
    const timestamp = new Date().toLocaleDateString('en-AU', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `General Property Chat ${timestamp}`;
  };


  // Sync session metrics from backend to ensure consistency
  const syncSessionMetricsFromBackend = async (sessionIdToSync: string) => {
    if (!sessionIdToSync || !isAuthenticated) {
      console.warn('⚠️ [SyncMetrics] Cannot sync metrics: missing session ID or not authenticated');
      return;
    }

    try {
      console.log('🔄 [SyncMetrics] Syncing session metrics from backend...');
      const response = await chatService.getSessionMessages(sessionIdToSync);
      
      if (response.session) {
        const backendMetrics = response.session;
        const frontendCost = parseFloat(sessionMetrics.totalCreditsUsed);
        const backendCost = parseFloat(backendMetrics.total_credits_used || '0');
        
        // Only overwrite costs if backend has a higher value (more recent data)
        // or if frontend cost is still at default (0.00)
        const shouldOverwriteCosts = frontendCost <= 0.001 || backendCost > frontendCost;
        
        console.log('🔄 [SyncMetrics] Backend sync decision:', {
          frontendCreditsUsed: sessionMetrics.totalCreditsUsed,
          backendCreditsUsed: backendMetrics.total_credits_used,
          frontendCostParsed: frontendCost,
          backendCostParsed: backendCost,
          willOverwriteCosts: shouldOverwriteCosts
        });
        
        setSessionMetrics(prev => ({
          ...prev,
          sessionName: backendMetrics.title || prev.sessionName,
          totalTextCount: backendMetrics.total_text_count || '0',
          totalInputTokens: backendMetrics.total_input_tokens || '0',
          totalOutputTokens: backendMetrics.total_output_tokens || '0',
          totalCreditsUsed: shouldOverwriteCosts ? 
            (backendMetrics.total_credits_used || '0.000000') : 
            prev.totalCreditsUsed,
          toolsUsed: backendMetrics.tools_used || {}
        }));
        
        console.log('✅ [SyncMetrics] Successfully synced metrics from backend:', {
          inputTokens: backendMetrics.total_input_tokens,
          outputTokens: backendMetrics.total_output_tokens,
          credits: backendMetrics.total_credits_used
        });
      }
    } catch (error) {
      console.error('❌ [SyncMetrics] Failed to sync metrics from backend:', error);
    }
  };

  // Handle session name editing
  const handleEditSessionName = async (newName: string) => {
    if (!sessionId || !isAuthenticated) {
      console.warn('⚠️ [EditSessionName] Cannot edit session name: missing session ID or not authenticated');
      return;
    }

    try {
      console.log('✏️ [EditSessionName] Updating session name:', { sessionId, newName });
      await saveSessionNameToDatabase(sessionId, newName);
      
      // Update local state
      setSessionMetrics(prev => ({
        ...prev,
        sessionName: newName
      }));
      
      console.log('✅ [EditSessionName] Successfully updated session name');
    } catch (error) {
      console.error('❌ [EditSessionName] Failed to update session name:', error);
    }
  };

  // Filter management functions removed (Phase 6C) - replaced with conversational transparency

  // Save session name to database
  const saveSessionNameToDatabase = async (sessionId: string, sessionName: string) => {
    console.log('💾 [SaveSessionName] Starting session name save:', {
      sessionId,
      sessionName,
      isAuthenticated,
      baseUrl: chatService.baseUrl
    });
    
    if (!isAuthenticated) {
      console.warn('⚠️ [SaveSessionName] User not authenticated, skipping save');
      return;
    }
    
    try {
      console.log('🔑 [SaveSessionName] Getting auth headers...');
      const headers = await chatService.getAuthHeaders();
      console.log('✅ [SaveSessionName] Auth headers obtained:', { 
        ...headers, 
        Authorization: headers.Authorization ? `Bearer [TOKEN_LENGTH:${headers.Authorization.length}]` : 'MISSING' 
      });
      
      const requestUrl = `${chatService.baseUrl}/api/v1/chat/sessions/${sessionId}/name`;
      const requestBody = { name: sessionName };
      
      console.log('📡 [SaveSessionName] Making PATCH request:', {
        url: requestUrl,
        method: 'PATCH',
        body: requestBody
      });
      
      const response = await fetch(requestUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('📨 [SaveSessionName] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
          console.error('❌ [SaveSessionName] Error response data:', errorData);
        } catch (parseError) {
          console.error('❌ [SaveSessionName] Failed to parse error response:', parseError);
          errorDetail = await response.text().catch(() => 'No error details available');
        }
        
        throw new Error(`Failed to save session name: ${response.status} ${response.statusText} - ${errorDetail}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [SaveSessionName] Success response:', responseData);
      return responseData;
    } catch (error) {
      console.error('💥 [SaveSessionName] Error saving session name:', {
        error,
        sessionId,
        sessionName,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "# Hey there! 👋 I'm Grace\n\nWelcome to your property exploration journey! I'm here to help you find your perfect property in Australia.\n\nI can help you with property search, market insights, and answer all your questions.\n\n**How would you like to get started?**",
      timestamp: new Date(),
      // Simple introduction options
      introductionOptions: [
        { id: 'tutorial', text: 'Show me a quick tutorial', action: 'tutorial' },
        { id: 'skip', text: 'Skip - let\'s start exploring!', action: 'skip' }
      ]
    }
  ]);

  // Notify parent when messages change
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // Extract and track active filters from render instructions
  useEffect(() => {
    if (!messages || messages.length === 0) {
      return;
    }

    const extractActiveFilters = () => {
      // Find the most recent message with active_filters in render_instruction
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (message?.render_instruction?.active_filters) {
          const filters = message.render_instruction.active_filters;
          setActiveFilters(filters);
          console.log('📊 [ActiveFilters] Extracted from render instruction:', Object.keys(filters));
          break;
        }
        // Also check for PropertyList with active filters in metadata
                if (message?.render_instruction?.type === 'PropertyList' && (message as any)?.data_objects) {
          const dataObjects = Array.isArray((message as any).data_objects)
            ? (message as any).data_objects
            : [(message as any).data_objects];
          
          for (const obj of dataObjects) {
            if (obj?.active_filters) {
              setActiveFilters(obj.active_filters);
              console.log('📊 [ActiveFilters] Extracted from PropertyList data:', Object.keys(obj.active_filters));
              // 🔄 TRIGGER SESSION SUMMARY: Generate enhanced context for exploration sessions with PropertyList results
              if (sessionId && getCurrentSessionScope() === SessionScope.EXPLORATION) {
                console.log("🎯 [SessionSummary] Triggering auto-update for exploration session with PropertyList results");
                sessionSummaryService.triggerUpdate(sessionId, "search_change", {
                  renderInstruction: message.render_instruction,
                  newFilters: obj.active_filters,
                  previousFilters: {}
                });
              }
              return;
            }
          }
        }
      }
    };

    extractActiveFilters();
  }, [messages]);

  // Notify parent when current model changes
  useEffect(() => {
    if (onCurrentModelChange) {
      onCurrentModelChange(currentModel);
    }
  }, [currentModel, onCurrentModelChange]);

  // Notify parent when session ID changes
  useEffect(() => {
    if (onSessionIdChange) {
      onSessionIdChange(sessionId);
    }
  }, [sessionId, onSessionIdChange]);

  // Collect and send debug information to parent
  useEffect(() => {
    if (onDebugInfoChange) {
      const debugInfo = {
        // Session Information
        sessionId: sessionId || 'No session ID',
        sessionState: {
          isLoading,
          hasGeneratedSessionName,
          isGeneratingSessionName,
          isCreatingSession: isCreatingSessionRef.current
        },
        
        // User Information
        user: user ? {
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown',
          isAuthenticated,
          lastSignIn: user.last_sign_in_at,
          emailConfirmed: user.email_confirmed_at ? true : false,
          userMetadata: user.user_metadata
        } : null,
        
        // Chat State
        chatState: {
          currentModel,
          inputValue: inputValue ? `"${inputValue.substring(0, 50)}${inputValue.length > 50 ? '...' : ''}"` : '',
          messagesCount: messages ? messages.length : 0,
          expandedCardsCount: expandedCards.size,
          completedCardsCount: completedCards.size,
          showSessionDetails,
          showCapabilitiesModal
        },
        
        // Request State
        requestState: {
          requestStartTs,
          isStreaming: !!liveLangGraphExecution,
          hasLiveExternalSources: liveExternalSources.length > 0,
          lastRequestDuration: requestStartTs ? Date.now() - requestStartTs : null
        },
        
        // Environment & Config
        environment: {
          nodeEnv: process.env.NODE_ENV,
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
          wsBaseUrl: import.meta.env.VITE_WS_BASE_URL,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
          debugMode: process.env.NODE_ENV === 'development' || 
                    process.env.REACT_APP_DEBUG === 'true' ||
                    window.location.search.includes('debug=true')
        },
        
        // Tools State
        toolsState: {
          enabledToolsCount: tools.filter(tool => tool.enabled).length,
          totalToolsCount: tools.length,
          toolsWithUsage: tools.filter(tool => (tool.usageCount || 0) > 0).length
        },
        
        // Browser & Location Info
        browserInfo: {
          userAgent: navigator.userAgent,
          currentPath: location.pathname,
          currentSearch: location.search,
          referrer: document.referrer || 'Direct',
          timestamp: new Date().toISOString()
        }
      };
      
      onDebugInfoChange(debugInfo);
    }
  }, [
    sessionId, isLoading, hasGeneratedSessionName, isGeneratingSessionName,
    user, isAuthenticated, currentModel, inputValue, messages ? messages.length : 0,
    expandedCards.size, completedCards.size, showSessionDetails, showCapabilitiesModal,
    requestStartTs, liveLangGraphExecution, liveExternalSources.length,
    tools, location.pathname, location.search, onDebugInfoChange
  ]);

  // Debug: Copy conversation for debugging purposes
  const handleDebugCopy = useCallback(async () => {
    try {
      const debugInfo = {
        sessionId,
        model: currentModel,
        timestamp: new Date().toISOString(),
        conversation: messages.map((msg, index) => {
          const baseMsg = {
            index,
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp,
          };

          // Handle AI messages with render instructions
          const msgMetadata = (msg as any).metadata || (msg as any).message_metadata;
          if (msg.type === 'ai' && msgMetadata?.render_instruction) {
            const renderInstruction = msgMetadata.render_instruction;

            if (renderInstruction.type === 'PropertyList' && renderInstruction.items) {
              // For property lists, include summary info but not full property data
              return {
                ...baseMsg,
                renderInstruction: {
                  type: renderInstruction.type,
                  title: renderInstruction.title,
                  subtitle: renderInstruction.subtitle,
                  propertyCount: renderInstruction.items.length,
                  activeFilters: renderInstruction.active_filters,
                  spatialContext: renderInstruction.spatial_context,
                  // Include first property as sample (without images)
                  sampleProperty: renderInstruction.items[0] ? {
                    id: renderInstruction.items[0].id,
                    title: renderInstruction.items[0].title,
                    suburb: renderInstruction.items[0].suburb,
                    state: renderInstruction.items[0].state,
                    property_type: renderInstruction.items[0].property_type,
                    bedrooms: renderInstruction.items[0].bedrooms,
                    bathrooms: renderInstruction.items[0].bathrooms,
                    price_display: renderInstruction.items[0].price_display,
                    full_address: renderInstruction.items[0].full_address
                  } : null
                }
              };
            } else if (renderInstruction.type === 'PropertySuggestions' && renderInstruction.suggestions) {
              // For suggestions, include key info
              return {
                ...baseMsg,
                renderInstruction: {
                  type: renderInstruction.type,
                  title: renderInstruction.title,
                  subtitle: renderInstruction.subtitle,
                  suggestionCount: renderInstruction.suggestions.length,
                  suggestions: renderInstruction.suggestions.map((s: any) => ({
                    display_text: s.display_text,
                    property_count: s.property_count,
                    explanation: s.explanation,
                    suggestion_type: s.suggestion_type,
                    filter_changes: s.filter_changes
                  })),
                  searchParams: renderInstruction.search_params
                }
              };
            } else {
              // For other render instructions, include as-is
              return {
                ...baseMsg,
                renderInstruction: renderInstruction
              };
            }
          }

          // Include tool results summary for AI messages
          if (msg.type === 'ai' && msgMetadata?.tool_results) {
            return {
              ...baseMsg,
              toolResults: {
                action: msgMetadata.tool_results.action,
                status: msgMetadata.tool_results.status,
                metadata: msgMetadata.tool_results.metadata,
                execution_time_ms: msgMetadata.tool_results.execution_time_ms
              }
            };
          }

          return baseMsg;
        })
      };

      const debugText = JSON.stringify(debugInfo, null, 2);
      await navigator.clipboard.writeText(debugText);

      setDebugCopySuccess(true);
      setTimeout(() => setDebugCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy debug info:', error);
    }
  }, [messages, sessionId, currentModel]);

  // DB-First Application Initialization - replaces localStorage-based approach
  useEffect(() => {
    const initializeApp = async () => {
      if (!isAuthenticated) {
        console.log('🔐 [DbFirstInit] User not authenticated, skipping initialization');
        setIsInitializing(false);
        return;
      }

      // Check if we should skip initialization for special cases
      if (forceNewSession) {
        console.log('🆕 [DbFirstInit] Force new session requested - skipping DB initialization');
        setIsInitializing(false);
        return;
      }

      const currentState = location.state as { initialMessage?: string, resumeSessionId?: string };
      const hasWelcomeMessage = currentState?.initialMessage;
      const hasSessionResume = currentState?.resumeSessionId;

      if (hasWelcomeMessage || isProcessingWelcomeMessage) {
        console.log('💡 [DbFirstInit] Welcome message detected - skipping DB initialization, will create fresh session');
        setIsInitializing(false);
        return;
      }

      if (hasSessionResume) {
        console.log('🔄 [DbFirstInit] Session resume detected - using specific session ID');
        setIsInitializing(false);
        loadSessionHistory(hasSessionResume);
        return;
      }

      console.log('🚀 [DbFirstInit] Starting optimized parallel initialization...');

      // ⚡ OPTIMIZATION: Allow chat interface immediately
      console.log('⚡ [ParallelInit] Enabling chat interface immediately for faster UX');
      setIsInitializing(false);

      try {
        // Load journey navigation in background (non-blocking)
        console.log('🔄 [ParallelInit] Loading journey navigation in background...');
        const result = await dbFirstInitService.initializeApplication();
        setInitializationResult(result);
        setIsJourneyNavigationLoaded(true);

        if (result.initializationState.status === 'ready') {
          console.log('✅ [ParallelInit] Journey navigation loaded successfully in background');
        } else {
          console.warn('⚠️ [ParallelInit] Journey navigation had issues:', result.initializationState.error);
        }
      } catch (error) {
        console.error('❌ [ParallelInit] Journey navigation loading failed (chat still functional):', error);

        // Graceful fallback to localStorage migration (background only)
        console.log('🔄 [ParallelInit] Attempting background migration from localStorage...');
        try {
          const migratedSession = await dbFirstInitService.migrateFromLocalStorage();
          if (migratedSession) {
            console.log('✅ [ParallelInit] Successfully migrated from localStorage:', migratedSession.sessionId);
            await loadSessionHistory(migratedSession.sessionId);
            setDbFirstSessionSelected(true);
          }
        } catch (migrationError) {
          console.warn('⚠️ [ParallelInit] Background migration also failed:', migrationError);
        }
      } finally {
        setIsJourneyNavigationLoaded(true);
        console.log('🏁 [ParallelInit] Background journey navigation loading completed');
      }
    };

    // Only initialize once when component mounts and user is authenticated
    // ✅ FIX: Prevent double initialization from multiple auth state changes
    if (isAuthenticated && isInitializing && !sessionId && !initializationStartedRef.current) {
      initializationStartedRef.current = true;
      initializeApp();
    } else if (!isAuthenticated) {
      setIsInitializing(false);
      initializationStartedRef.current = false; // Reset on sign out
    } else if (sessionId) {
      setIsInitializing(false);
    }
  }, [isAuthenticated, location, isProcessingWelcomeMessage, forceNewSession]); // ✅ Removed isInitializing & sessionId

  // Create a new chat session via backend API
  const createNewSession = async () => {
    console.log('🆕 [CreateSession] Starting new session creation...', {
      isCreatingSessionRef: isCreatingSessionRef.current,
      currentSessionId: sessionId || 'none',
      timestamp: Date.now()
    });
    
    // Prevent duplicate calls (React StrictMode protection using ref)
    if (isCreatingSessionRef.current) {
      console.log('⏳ [CreateSession] Session creation already in progress (ref), skipping duplicate call');
      return;
    }
    
    if (sessionId) {
      console.log('✅ [CreateSession] Session already exists, skipping creation:', sessionId);
      return;
    }
    
    console.log('🔒 [CreateSession] Marking session creation as in progress (ref)');
    isCreatingSessionRef.current = true;
    
    try {
      console.log('📡 [CreateSession] Calling chatService.createChatSession...');
      const { sessionId: newSessionId } = await chatService.createChatSession('New Chat');
      
      console.log('✅ [CreateSession] Backend session creation successful:', {
        newSessionId,
        isValid: !!newSessionId
      });
      
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      console.log(`✅ [CreateSession] Session state and localStorage updated: ${newSessionId}`);
      
      // Start session logging for the new session
      if (user) {
        startLogging({
          sessionId: newSessionId,
          sessionTitle: 'New Chat',
          userId: user.id,
          enableConsoleCapture: true,
          enableAPILogging: true,
          enableErrorCapture: true
        });
        console.log(`🟢 [SessionLogger] Started logging for session ${newSessionId}`);
      }
    } catch (error) {
      console.error('❌ [CreateSession] Failed to create session via API:', error);
      
      // Fallback to client-side generation
      console.log('🔄 [CreateSession] Using fallback client-side session generation...');
      const fallbackSessionId = chatService.generateSessionId();
      
      console.log('🔄 [CreateSession] Generated fallback session:', {
        fallbackSessionId,
        isValid: !!fallbackSessionId
      });
      
      setSessionId(fallbackSessionId);
      localStorage.setItem('chatSessionId', fallbackSessionId);
      
      // Start session logging for fallback session too
      if (user) {
        startLogging({
          sessionId: fallbackSessionId,
          sessionTitle: 'New Chat (Fallback)',
          userId: user.id,
          enableConsoleCapture: true,
          enableAPILogging: true,
          enableErrorCapture: true
        });
        console.log(`🟢 [SessionLogger] Started logging for fallback session ${fallbackSessionId}`);
      }
      console.log(`✅ [CreateSession] Fallback session set: ${fallbackSessionId}`);
    } finally {
      console.log('🔓 [CreateSession] Clearing session creation flag (ref)');
      isCreatingSessionRef.current = false;
    }
  };

  // Load session history from backend
  const loadSessionHistory = async (sessionIdToLoad: string) => {
    console.log('📚 [LoadSession] Starting session history load:', {
      sessionIdToLoad,
      isValid: !!sessionIdToLoad
    });
    
    try {
      console.log('📡 [LoadSession] Calling chatService.getSessionMessages...');
      const { messages: sessionMessages, session: sessionData } = await chatService.getSessionMessages(sessionIdToLoad);
      
      console.log('📋 [LoadSession] Session messages response:', {
        messageCount: sessionMessages?.length || 0,
        hasMessages: !!(sessionMessages && sessionMessages.length > 0),
        sessionTitle: sessionData?.title
      });
      
      if (sessionMessages && sessionMessages.length > 0) {
        // Convert backend messages to frontend format
        const convertedMessages: Message[] = sessionMessages.map((msg: any) => {
          // Use shared utility for consistent debug trace handling across all resume flows
          const langGraphExecution = createLangGraphExecution(msg, 'LoadSession');

          // DEBUG: Log message conversion details (same logging as handleSessionResume)
          const renderInstruction = msg.metadata?.render_instruction || msg.message_metadata?.render_instruction;
          if (renderInstruction) {
            console.log(`✅ [LoadSession] Converting message with render instruction:`, {
              messageId: msg.id,
              messageType: msg.message_type,
              renderInstructionType: renderInstruction.type,
              hasItems: !!(renderInstruction.items),
              itemsCount: renderInstruction.items?.length || 0,
              metadataSource: msg.metadata?.render_instruction ? 'metadata' : 'message_metadata'
            })
          } else if (msg.message_type === 'ai') {
            console.log(`❌ [LoadSession] Converting AI message WITHOUT render instruction:`, {
              messageId: msg.id,
              messageType: msg.message_type,
              hasMetadata: !!(msg.metadata || msg.message_metadata),
              metadataKeys: msg.metadata ? Object.keys(msg.metadata) : [],
              messageMetadataKeys: msg.message_metadata ? Object.keys(msg.message_metadata) : [],
              content: msg.content.substring(0, 50) + '...'
            })
          }

          return {
            id: msg.id,
            type: msg.message_type as 'user' | 'ai' | 'system',
            content: msg.content,
            timestamp: new Date(msg.created_at || msg.timestamp),
            model: msg.metadata?.model,
            langGraphExecution,
            // 🚨 CRITICAL BUG FIX: API returns 'metadata' not 'message_metadata' (same fix as handleSessionResume)
            render_instruction: msg.metadata?.render_instruction || msg.message_metadata?.render_instruction
          };
        });
        
        // Keep the welcome message and add session history
        setMessages(prev => [
          prev[0], // Keep welcome message
          ...convertedMessages
        ]);
        
        // Use the existing session ID
        setSessionId(sessionIdToLoad);
        localStorage.setItem('chatSessionId', sessionIdToLoad);
        
        // Update session metrics with session data (no need to recalculate from messages)
        if (sessionData) {
          const frontendCost = parseFloat(sessionMetrics.totalCreditsUsed);
          const backendCost = parseFloat(sessionData.total_credits_used || '0');
          const shouldOverwriteCosts = frontendCost <= 0.001 || backendCost > frontendCost;
          
          console.log('📊 [LoadSession] Session data sync decision:', {
            frontendCreditsUsed: sessionMetrics.totalCreditsUsed,
            backendCreditsUsed: sessionData.total_credits_used,
            willOverwriteCosts: shouldOverwriteCosts
          });
          
          const newSessionName = sessionData.title || 'Untitled Chat';
          setSessionMetrics(prev => ({
            ...prev,
            sessionName: newSessionName,
            totalTextCount: sessionData.total_text_count || '0',
            totalInputTokens: sessionData.total_input_tokens || '0',
            totalOutputTokens: sessionData.total_output_tokens || '0',
            totalCreditsUsed: shouldOverwriteCosts ? 
              (sessionData.total_credits_used || '0.000000') : 
              prev.totalCreditsUsed,
            toolsUsed: sessionData.tools_used || {}
          }));
          
          // Notify parent to update tab title
          if (onSessionNameChange && newSessionName !== 'Untitled Chat') {
            onSessionNameChange(newSessionName);
          }
          console.log('📊 [LoadSession] Updated session metrics from session data:', {
            sessionName: sessionData.title,
            totalInputTokens: sessionData.total_input_tokens,
            totalOutputTokens: sessionData.total_output_tokens,
            totalCredits: sessionData.total_credits_used,
            toolsUsed: sessionData.tools_used
          });
        }
        
        // Mark session name as already generated since we loaded an existing session
        setHasGeneratedSessionName(true);
        setIsGeneratingSessionName(false);
        
        console.log(`✅ [LoadSession] Loaded ${sessionMessages.length} messages from session: ${sessionIdToLoad}`);
      } else {
        console.log('📭 [LoadSession] No messages found - session may not exist, creating new session instead');
        // Don't use the stored session ID if it has no messages - it might not exist
        // Create a new session instead
        await createNewSession();
        return; // Exit early since createNewSession will handle the session setup
      }
    } catch (error) {
      // Don't log 404 errors as they're expected for new sessions
      if (error instanceof Error && !error.message.includes('404') && !error.message.includes('Not Found')) {
        console.warn('⚠️ [LoadSession] Could not load session history:', error);
      } else {
        console.log(`ℹ️ [LoadSession] Session ${sessionIdToLoad} not found, starting fresh`);
      }
      // If loading fails, continue with new session
      console.log('🧹 [LoadSession] Removing invalid session from localStorage');
      localStorage.removeItem('chatSessionId');
      
      // Create a new session instead
      console.log('🆕 [LoadSession] Creating new session after failed load...');
      await createNewSession();
    }
  };

  // Handle session resuming from chat history
  const handleSessionResume = useCallback(async (resumeSessionId: string, resumeMessages: any[], sessionData?: any) => {
    console.log('🔄 [SessionResume] Resuming session:', {
      resumeSessionId,
      messageCount: resumeMessages?.length || 0,
      currentSessionId: sessionId,
      sessionTitle: sessionData?.title,
      sessionData: sessionData // Debug: full session data
    });
    
    try {
      // Set the new session ID
      setSessionId(resumeSessionId);
      localStorage.setItem('chatSessionId', resumeSessionId);
      
      // DEBUG: Log resume messages before conversion
      console.log('🔍 [SessionResume] Converting messages to frontend format:', {
        resumeMessagesCount: resumeMessages?.length || 0
      })
      
      if (resumeMessages && resumeMessages.length > 0) {
        console.log('🔍 [SessionResume] First few resume messages:')
        resumeMessages.slice(0, 3).forEach((msg, index) => {
          console.log(`   [${index}] Resume message:`, {
            id: msg.id,
            type: msg.message_type,
            content: msg.content.substring(0, 50) + '...',
            hasMetadata: !!msg.metadata,
            metadataKeys: msg.metadata ? Object.keys(msg.metadata) : [],
            hasRenderInstruction: !!(msg.metadata && msg.metadata.render_instruction),
            renderInstructionType: msg.metadata?.render_instruction?.type || 'none'
          })
        })
      }
      
      // Convert resume messages to frontend format
      const convertedMessages = resumeMessages.map((msg: any) => {
        // Use shared utility for consistent debug trace handling across all resume flows
        const langGraphExecution = createLangGraphExecution(msg, 'SessionResume');

        const convertedMessage = {
          id: msg.id,
          type: msg.message_type as 'user' | 'ai' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at || msg.timestamp),
          model: msg.message_metadata?.model,
          langGraphExecution,
          // 🚨 CRITICAL BUG FIX: API returns 'metadata' not 'message_metadata'
          render_instruction: msg.metadata?.render_instruction || msg.message_metadata?.render_instruction,
          // 🎯 RESTORE MENTIONS: Load mentions from message metadata (check both field locations)
          mentions: msg.metadata?.mentions || msg.message_metadata?.mentions || []
        };
        
        // DEBUG: Log message conversion details
        const renderInstruction = msg.metadata?.render_instruction || msg.message_metadata?.render_instruction;
        if (renderInstruction) {
          console.log(`✅ [SessionResume] Converting message with render instruction:`, {
            messageId: msg.id,
            messageType: msg.message_type,
            renderInstructionType: renderInstruction.type,
            hasItems: !!(renderInstruction.items),
            itemsCount: renderInstruction.items?.length || 0,
            metadataSource: msg.metadata?.render_instruction ? 'metadata' : 'message_metadata',
            renderInstruction: renderInstruction
          })
        } else if (msg.message_type === 'ai') {
          console.log(`❌ [SessionResume] Converting AI message WITHOUT render instruction:`, {
            messageId: msg.id,
            messageType: msg.message_type,
            hasMetadata: !!(msg.metadata || msg.message_metadata),
            metadataKeys: msg.metadata ? Object.keys(msg.metadata) : [],
            messageMetadataKeys: msg.message_metadata ? Object.keys(msg.message_metadata) : [],
            content: msg.content.substring(0, 100) + '...'
          })
        }
        
        return convertedMessage;
      });
      
      // DEBUG: Final summary of converted messages
      console.log('🔍 [SessionResume] Conversion complete. Summary:', {
        totalMessages: convertedMessages.length,
        userMessages: convertedMessages.filter(m => m.type === 'user').length,
        aiMessages: convertedMessages.filter(m => m.type === 'ai').length,
        systemMessages: convertedMessages.filter(m => m.type === 'system').length,
        messagesWithRenderInstructions: convertedMessages.filter(m => m.render_instruction).length,
        renderInstructionTypes: [...new Set(convertedMessages.filter(m => m.render_instruction).map(m => m.render_instruction?.type))]
      })
      
      // Update session metrics with resumed session data (use session data directly)
      if (sessionData) {
        console.log('📊 [SessionResume] Updating session metrics with data:', sessionData);
        const frontendCost = parseFloat(sessionMetrics.totalCreditsUsed);
        const backendCost = parseFloat(sessionData.total_credits_used || '0');
        const shouldOverwriteCosts = frontendCost <= 0.001 || backendCost > frontendCost;
        
        console.log('📊 [SessionResume] Session resume sync decision:', {
          frontendCreditsUsed: sessionMetrics.totalCreditsUsed,
          backendCreditsUsed: sessionData.total_credits_used,
          willOverwriteCosts: shouldOverwriteCosts
        });
        
        const newSessionName = sessionData.title || 'Untitled Chat';
        setSessionMetrics(prev => ({
          ...prev,
          sessionName: newSessionName,
          totalTextCount: sessionData.total_text_count || '0',
          totalInputTokens: sessionData.total_input_tokens || '0',
          totalOutputTokens: sessionData.total_output_tokens || '0',
          totalCreditsUsed: shouldOverwriteCosts ? 
            (sessionData.total_credits_used || '0.000000') : 
            prev.totalCreditsUsed,
          toolsUsed: sessionData.tools_used || {}
        }));
        
        // Notify parent to update tab title
        if (onSessionNameChange && newSessionName !== 'Untitled Chat') {
          onSessionNameChange(newSessionName);
        }
        console.log('📊 [SessionResume] Updated session metrics from session data (backend sync):', {
          sessionName: sessionData.title,
          totalInputTokens: sessionData.total_input_tokens,
          totalOutputTokens: sessionData.total_output_tokens,
          totalCredits: sessionData.total_credits_used,
          toolsUsed: sessionData.tools_used
        });
      } else {
        console.warn('⚠️ [SessionResume] No session data provided, attempting to fetch...');
        // Fallback: fetch session data if not provided
        try {
          const response = await chatService.getSessionMessages(resumeSessionId);
          if (response.session) {
            const backendSession = response.session;
            console.log('📊 [SessionResume] Fetched session data as fallback:', backendSession);
            const frontendCost = parseFloat(sessionMetrics.totalCreditsUsed);
            const backendCost = parseFloat(backendSession.total_credits_used || '0');
            const shouldOverwriteCosts = frontendCost <= 0.001 || backendCost > frontendCost;
            
            setSessionMetrics(prev => ({
              ...prev,
              sessionName: backendSession.title || 'Untitled Chat',
              totalTextCount: backendSession.total_text_count || '0',
              totalInputTokens: backendSession.total_input_tokens || '0',
              totalOutputTokens: backendSession.total_output_tokens || '0',
              totalCreditsUsed: shouldOverwriteCosts ? 
                (backendSession.total_credits_used || '0.000000') : 
                prev.totalCreditsUsed,
              toolsUsed: backendSession.tools_used || {}
            }));
          }
        } catch (error) {
          console.error('❌ [SessionResume] Failed to fetch session data as fallback:', error);
        }
      }
      
      // Keep the welcome message and add resumed messages
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: "# Hey there! 👋 I'm Grace\n\nWelcome to your property exploration journey! I'm here to help you find your perfect property in Australia.\n\nI can help you with property search, market insights, and answer all your questions.\n\n**How would you like to get started?**",
          timestamp: new Date(),
          // Simple introduction options
          introductionOptions: [
            { id: 'tutorial', text: 'Show me a quick tutorial', action: 'tutorial' },
            { id: 'skip', text: 'Skip - let\'s start exploring!', action: 'skip' }
          ]
        },
        ...convertedMessages
      ]);
      
      // DEBUG: Log final messages set in state
      setTimeout(() => {
        console.log('🔍 [SessionResume] Final messages set in state (after timeout):', {
          totalMessages: convertedMessages.length + 1, // +1 for welcome message
          messagesWithRenderInstructions: convertedMessages.filter(m => m.render_instruction).length
        })
        
        convertedMessages.forEach((msg, index) => {
          if (msg.render_instruction) {
            console.log(`   [${index}] State message with render instruction:`, {
              id: msg.id,
              type: msg.type,
              renderInstructionType: msg.render_instruction.type,
              hasItems: !!(msg.render_instruction.items),
              itemsCount: msg.render_instruction.items?.length || 0
            })
          }
        })
      }, 100)
      
      // Reset session generation flags since we're resuming an existing session
      setHasGeneratedSessionName(true);
      setIsGeneratingSessionName(false);
      
      console.log('🏁 [SessionResume] Session resume complete. Final state:', {
        sessionId: resumeSessionId,
        messageCount: convertedMessages.length,
        sessionTitle: sessionData?.title || 'Unknown'
      });
      
      console.log(`✅ [SessionResume] Successfully resumed session ${resumeSessionId} with ${convertedMessages.length} messages`);
      
      // 🎯 Hide Getting Started when resuming session
      setShowGettingStarted(false);
      
      // 🎯 CRITICAL FIX: Notify parent component that session ID has changed for journey auto-expansion
      if (onSessionIdChange) {
        console.log('📡 [SessionResume] Notifying parent component of session ID change for auto-expansion');
        onSessionIdChange(resumeSessionId);
      }
      
    } catch (error) {
      console.error('❌ [SessionResume] Failed to resume session:', error);
      // Fallback to creating a new session
      await createNewSession();
    }
  }, [sessionId]);

  // Show auth modal when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  const handleAddressComplete = (data: any) => {
    setCompletedCards(prev => new Set([...prev, 'address-input']));
    console.log('Address completed:', data);
  };

  const handlePriceComplete = (data: any) => {
    setCompletedCards(prev => new Set([...prev, 'price-input']));
    console.log('Price completed:', data);
  };

  const handleMediaComplete = (data: any) => {
    setCompletedCards(prev => new Set([...prev, 'media-input']));
    console.log('Media completed:', data);
  };

  const handlePanelUpdate = (panelId: string, data: any) => {
    console.log(`Panel ${panelId} updated:`, data);
  };

  const handleExpandToCanvas = (canvasData: any) => {
    // Add to expanded cards set
    setExpandedCards(prev => new Set([...prev, canvasData.id]));

    // Create canvas tab
    if (onCanvasAdd) {
      onCanvasAdd({
        id: canvasData.id,
        title: canvasData.title,
        type: canvasData.type,
        data: canvasData.data,
        isActive: true,
        isPinned: false,
        content: canvasData.content
      });
    }

    // Update the message to show the expanded state
    setMessages(prev => prev.map(msg => {
      if (msg.contextualInput && msg.contextualInput.type === canvasData.type.replace('-input', '')) {
        return {
          ...msg,
          contextualInput: {
            ...msg.contextualInput,
            component: React.cloneElement(
              msg.contextualInput.component as React.ReactElement<any>,
              {
                isExpanded: true,
                isActive: !completedCards.has(canvasData.id)
              }
            )
          }
        };
      }
      return msg;
    }));
  };

  const handleCanvasClose = useCallback((tabId: string) => {
    // Remove from expanded cards set
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(tabId);
      return newSet;
    });

    // Update the message to revert to original state
    setMessages(prev => prev.map(msg => {
      if (msg.contextualInput) {
        const cardType = tabId.replace('-input', '');
        if (msg.contextualInput.type === cardType) {
          // Re-create the component with original state
          let originalComponent;
          
          if (cardType === 'address') {
            originalComponent = <AddressInputControl 
              onComplete={handleAddressComplete} 
              onPanelUpdate={handlePanelUpdate}
              onExpandToCanvas={handleExpandToCanvas}
              isExpanded={false}
              isActive={!completedCards.has(tabId)}
            />;
          } else if (cardType === 'price') {
            originalComponent = <PriceInputControl 
              onComplete={handlePriceComplete} 
              onPanelUpdate={handlePanelUpdate}
              onExpandToCanvas={handleExpandToCanvas}
              isExpanded={false}
              isActive={!completedCards.has(tabId)}
            />;
          } else if (cardType === 'media') {
            originalComponent = <MediaInputControl 
              onComplete={handleMediaComplete} 
              onPanelUpdate={handlePanelUpdate}
              onExpandToCanvas={handleExpandToCanvas}
              isExpanded={false}
              isActive={!completedCards.has(tabId)}
            />;
          }

          return {
            ...msg,
            contextualInput: {
              ...msg.contextualInput,
              component: originalComponent
            }
          };
        }
      }
      return msg;
    }));
  }, [completedCards]);

  // Register canvas close handler with parent using ref
  const canvasCloseHandlerRef = useRef(handleCanvasClose);
  canvasCloseHandlerRef.current = handleCanvasClose;

  useEffect(() => {
    if (onRegisterCanvasClose) {
      onRegisterCanvasClose(canvasCloseHandlerRef.current);
    }
  }, [onRegisterCanvasClose]);

  // Register session resume handler with parent using ref
  const sessionResumeHandlerRef = useRef(handleSessionResume);
  sessionResumeHandlerRef.current = handleSessionResume;

  useEffect(() => {
    if (onRegisterSessionResume) {
      onRegisterSessionResume(sessionResumeHandlerRef.current);
    }
  }, [onRegisterSessionResume]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle initial messages from Welcome Screen and Landing Page
  useEffect(() => {
    const state = location.state as {
      initialMessage?: string,
      resumeSessionId?: string,
      source?: string,
      skipTutorial?: boolean
    };

    if (state?.initialMessage) {
      // Prevent duplicate processing (React Strict Mode protection)
      if (welcomeMessageProcessedRef.current === state.initialMessage) {
        console.log('🔄 [Navigation] Message already processed, skipping:', state.initialMessage);
        return;
      }

      const isFromLandingPage = state.source === 'landing_page';
      const shouldSkipTutorial = state.skipTutorial === true;

      if (isFromLandingPage) {
        console.log('🚀 [LandingPage] Auto-sending message from landing page:', state.initialMessage);
        console.log('🎯 [LandingPage] Skip tutorial:', shouldSkipTutorial);
      } else {
        console.log('🎯 [WelcomeMessage] Received initial message from welcome screen:', state.initialMessage);
      }

      welcomeMessageProcessedRef.current = state.initialMessage;

      // Set flag to indicate we're processing a welcome message (skip tutorial if from landing page)
      setIsProcessingWelcomeMessage(shouldSkipTutorial);

      // Skip tutorial if coming from landing page
      if (shouldSkipTutorial) {
        console.log('🎯 [LandingPage] Skipping tutorial as requested');
        setShowGettingStarted(false);
      }

      // Clear any existing session to force a fresh start
      console.log('🧹 [Navigation] Clearing existing session for fresh start');
      setSessionId('');
      setMessages([]);
      localStorage.removeItem('chatSessionId');

      // Reset session-related refs
      isCreatingSessionRef.current = false;

      // Clear the location state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title, window.location.pathname);

      // Auto-send the message immediately
      const logPrefix = isFromLandingPage ? 'LandingPage' : 'WelcomeMessage';
      console.log(`🚀 [${logPrefix}] Auto-sending message`);
      setTimeout(() => {
        handleSendMessage(state.initialMessage);
        if (!shouldSkipTutorial) {
          setIsProcessingWelcomeMessage(false); // Clear flag after processing (only if not skipping tutorial)
        }
        // Clear the processed ref after a delay to allow for new messages
        setTimeout(() => {
          welcomeMessageProcessedRef.current = null;
        }, 1000);
      }, 200); // Increased delay for landing page to ensure component is ready
    }
    // Handle session resume from welcome screen recent sessions
    else if (state?.resumeSessionId) {
      console.log('🔄 [WelcomeMessage] Received session resume from welcome screen:', state.resumeSessionId);
      
      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Trigger session resume by loading the session
      const resumeSessionId = state.resumeSessionId;
      console.log('🔄 [WelcomeMessage] Loading session from welcome screen navigation:', resumeSessionId);
      
      // Use the existing session resume logic
      loadSessionHistory(resumeSessionId);
    }
  }, [location]);

  const getAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    // Add comprehensive canvas demo
    if (input.includes('demo canvas') || input.includes('demo expand')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "🎯 **Canvas Expansion Demo**\n\nHere's how to expand info cards into the canvas panel:\n\n**Step 1:** Try any contextual input demo:\n• Type 'demo address' - Location analysis\n• Type 'demo price' - Pricing strategy\n• Type 'demo photos' - Media analysis\n\n**Step 2:** Once the input appears, fill it out with data\n\n**Step 3:** Look for the **↗️ Expand button** in the top-right corner\n\n**Step 4:** Click to expand into the canvas panel on the right\n\n**Step 5:** The original card becomes a **link button** to focus the canvas tab\n\n**Step 6:** Use the **×** button on canvas tabs to close and return to chat\n\n✨ **Try it now:** Type 'demo address' and follow these steps!",
        timestamp: new Date(),
      };
    }
    
    // Magic word detection for demo
    if (input.includes('demo address')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "🗺️ **Address Input Demo**\n\nI'll help you enter your property address with comprehensive location analysis. This includes Google Maps integration, nearby amenities, market data, school districts, and demographic insights.\n\n💡 **Canvas Tip:** After selecting an address, look for the **↗️ expand button** to view the full location dashboard in the canvas panel!\n\nPlease use the address input below:",
        timestamp: new Date(),
        contextualInput: {
          type: 'address',
          component: <AddressInputControl 
            onComplete={handleAddressComplete} 
            onPanelUpdate={handlePanelUpdate}
            onExpandToCanvas={handleExpandToCanvas}
            isExpanded={expandedCards.has('address-input')}
            isActive={!completedCards.has('address-input')}
          />
        }
      };
    }
    
    if (input.includes('demo price')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "💰 **Market Pricing Strategy Demo**\n\nI'll help you develop a comprehensive pricing strategy based on detailed market analysis. This includes:\n\n📊 **Market Intelligence:**\n• AI-recommended price ranges\n• Comparable property analysis\n• Market trend insights\n• Strategy pros/cons analysis\n\n💡 **Canvas Tip:** After selecting a strategy, click the **↗️ expand button** to view the full market analysis dashboard with interactive charts!\n\nUse the pricing strategy selector below:",
        timestamp: new Date(),
        contextualInput: {
          type: 'price',
          component: <PriceInputControl 
            onComplete={handlePriceComplete} 
            onPanelUpdate={handlePanelUpdate}
            onExpandToCanvas={handleExpandToCanvas}
            isExpanded={expandedCards.has('price-input')}
            isActive={!completedCards.has('price-input')}
          />
        }
      };
    }

    if (input.includes('demo photos') || input.includes('demo media')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "📸 **Media Upload Demo**\n\nUpload photos and videos of your property for AI-powered analysis. I'll identify rooms, extract key features, and provide optimization suggestions.\n\nUse the media upload component below:",
        timestamp: new Date(),
        contextualInput: {
          type: 'media',
          component: <MediaInputControl 
            onComplete={handleMediaComplete} 
            onPanelUpdate={handlePanelUpdate}
            onExpandToCanvas={handleExpandToCanvas}
            isExpanded={expandedCards.has('media-input')}
            isActive={!completedCards.has('media-input')}
          />
        }
      };
    }

    if (input.includes('demo full')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "🚀 **Complete Property Listing Workflow**\n\nHere's the full process I'll guide you through:\n\n**1. Address & Location Analysis** 📍\n• Google Maps integration\n• Neighborhood insights\n• Amenities and transport\n\n**2. Market-Based Pricing** 💰\n• Comparable property analysis\n• AI pricing recommendations\n• Strategy selection\n\n**3. Media Analysis** 📸\n• Photo and video upload\n• AI feature extraction\n• Professional tips\n\n**4. Property Features** 🏠\n• Room-by-room details\n• Key selling points\n• Market positioning\n\n**Ready to start?** Try any individual demo command first, or tell me about your property!",
        timestamp: new Date(),
      };
    }

    // Default AI response
    return {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `I understand you want to discuss: "${userInput}"\n\nI'm here to help with property listings! Try these demo commands:\n• 'demo address' - Location analysis\n• 'demo price' - Market pricing\n• 'demo photos' - Media upload\n• 'demo canvas' - Learn canvas features\n\nOr describe your property and I'll guide you through the listing process!`,
      timestamp: new Date(),
    };
  };

  const handleSendMessage = async (messageText?: string, messageMetadata?: Record<string, any>) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading || !isAuthenticated) return;

    setIsLoading(true);
    setInputValue('');
    setIsFollowUpStaged(false); // Clear follow-up staged state when message is sent

    // Create session if it doesn't exist (only when user actually sends a message)
    let currentSessionId = sessionId;
    if (!currentSessionId && !isCreatingSessionRef.current) {
      console.log('🆕 [HandleSendMessage] No session exists, creating one for first message...');
      isCreatingSessionRef.current = true;
      
      try {
        const response = await chatService.createChatSession('New Chat');
        if (response && response.sessionId) {
          console.log('✅ [HandleSendMessage] Session created for message:', response.sessionId);
          currentSessionId = response.sessionId;
          setSessionId(currentSessionId);
          localStorage.setItem('chatSessionId', currentSessionId);
          
          // Store the session ID for the completion handler
          console.log('📋 [HandleSendMessage] Session ID stored for title generation:', currentSessionId);
          
          // Notify parent that a new session was created
          if (onNewSessionCreated) {
            console.log('🔄 [HandleSendMessage] Notifying parent of new session creation');
            onNewSessionCreated();
          }
        } else {
          console.error('❌ [HandleSendMessage] Failed to create session, aborting message send');
          setIsLoading(false);
          setInputValue(textToSend); // Restore the input
          return;
        }
      } catch (error) {
        console.error('💥 [HandleSendMessage] Error creating session:', error);
        setIsLoading(false);
        setInputValue(textToSend); // Restore the input
        return;
      } finally {
        isCreatingSessionRef.current = false;
      }
    }

    // Add user message with current mentioned items
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date(),
      mentions: [...sessionMentions], // Save current mentions with the message
      ...(messageMetadata && { metadata: messageMetadata }), // Include optional metadata
    };

    setMessages(prev => [...prev, userMessage]);

    // 🎯 CRITICAL FIX: Hide Getting Started screen when user sends first message
    setShowGettingStarted(false);

    // 🎯 Message-wise mentions: Clear mentions after sending for clean UX
    // Each message now has independent spatial context via message payload
    setSessionMentions([]); // Clear mentions after sending - clean message-wise approach
    setInputValue(''); // Clear input for next message
    
    // Update metrics with user message text
    addTextToMetrics(textToSend);
    
    // Session name will be generated after first AI response

    try {
      // Check for demo commands first
      const demoResponse = getAIResponse(textToSend);
      if (demoResponse.contextualInput) {
        setMessages(prev => [...prev, demoResponse]);
        setIsLoading(false);
        return;
      }

      // Create AI message placeholder for streaming
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        streaming: true,
        originalUserMessage: textToSend // Store for retry functionality
      };

      setMessages(prev => [...prev, aiMessage]);
      setStreamingMessageId(aiMessageId);
      setRequestStartTs(Date.now());

      // Convert messages to chat history format - lightweight context only
      const chatHistory = (messages || [])
        .filter(msg => msg.type !== 'system') // Exclude system messages
        .map(msg => ({
          type: msg.type === 'user' ? 'user' as const : 'ai' as const,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          // Only include token usage for cost tracking (no automatic data passing)
          ...(msg.token_usage && { token_usage: msg.token_usage })
        }));

      // console.log('📚 [ChatInterface] Sending chat history:', { 
      //   historyLength: chatHistory.length,
      //   lastFewMessages: chatHistory.slice(-3)
      // }); // Commented out for performance

      // Send to enhanced chat service with streaming
      // Prepare mentions for message-wise context (coordinates will be enriched by backend)
      const messageMentions = sessionMentions.map(mention => ({
        id: mention.id,
        type: mention.entity_type as "property" | "amenity",
        display_text: mention.display_text,
        entity_id: mention.entity_id,
        coordinates: (mention as any).coordinates,
        metadata: mention.entity_metadata
      }));

      console.log('🏷️ [ChatInterface] Sending mentions with message:', messageMentions);

      await chatService.sendMessageStream(
          {
            message: textToSend,
            session_id: currentSessionId,
            stream: true,
            mentions: messageMentions, // 🎯 NEW: Include mentions in message payload
            chat_history: chatHistory,
            // 🎭 MILESTONE 2: Include introduction metadata in streaming request
            ...(messageMetadata?.introduction_context && { introduction_context: messageMetadata.introduction_context }),
            ...(messageMetadata?.introduction_action && { introduction_action: messageMetadata.introduction_action }),
            // 🎯 WORKFLOW CONTINUATION FIX: Include workflow continuation metadata
            ...(messageMetadata?.workflow_continuation && { workflow_continuation: messageMetadata.workflow_continuation }),
            ...(messageMetadata?.user_selection && { user_selection: messageMetadata.user_selection }),
            // 🎯 CLEAN SUGGESTION FIX: Pass property suggestion metadata via suggestion_metadata field
            ...(messageMetadata?.messageType && {
              suggestion_metadata: {
                messageType: messageMetadata.messageType,
                suggestionData: messageMetadata.suggestionData,
                timestamp: messageMetadata.timestamp
              }
            })
          },
        (chunk: ChatResponse) => {
          console.log('🔄 [ChatInterface] Received chunk:', chunk);
          
          if (chunk.type === 'start') {
            // Initialize live execution tracking for LangGraph
            setLiveLangGraphExecution({
              trace: [],
              total_duration_ms: 0,
              total_tokens_in: 0,
              total_tokens_out: 0,
              total_estimated_cost: 0,
              architecture: 'pure_langgraph'
            });
          } else if (chunk.type === 'response_chunk' && chunk.content) {
            // Handle streaming chunks
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk.content }
                : msg
            ));
            
            // Add AI response text to metrics (frontend tracking for real-time display)
            addTextToMetrics(chunk.content);

            // Handle render_instruction data that comes with chunk
            if (chunk.render_instruction) {
              console.log('🎨 [ChatInterface] Processing chunk render instruction:', chunk.render_instruction);
              console.log('📦 [ChatInterface] Processing chunk data objects:', chunk.data_objects);
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { 
                      ...msg, 
                      render_instruction: chunk.render_instruction,
                      data_objects: chunk.data_objects // Store data objects for contextual operations
                    }
                  : msg
              ));
            }

            // Update live execution with token approximation during streaming
            setLiveLangGraphExecution(prev => prev ? {
              ...prev,
              total_tokens_out: prev.total_tokens_out + Math.ceil(String(chunk.content).length / 4)
            } : null);

            // Extract external sources from the chunk content and update live sources
            const newSources = extractExternalSources(chunk.content);
            if (newSources.length > 0) {
              setLiveExternalSources(prev => {
                const existingIds = prev.map(s => s.id);
                const uniqueNewSources = newSources.filter(s => !existingIds.includes(s.id));
                return [...prev, ...uniqueNewSources];
              });
            }
            
            // Check for Gemini grounding sources in chunk metadata
            if ((chunk as any).metadata?.grounding_sources) {
              const groundingSources = (chunk as any).metadata.grounding_sources.map((source: any) => ({
                id: source.id,
                title: source.title,
                url: source.url,
                domain: source.domain,
                sourceType: 'web_search' as const,
                timestamp: new Date(source.timestamp),
                description: source.description,
                verified: source.verified
              }));
              
              setLiveExternalSources(prev => {
                const existingIds = prev.map(s => s.id);
                const uniqueGroundingSources = groundingSources.filter((s: any) => !existingIds.includes(s.id));
                return [...prev, ...uniqueGroundingSources];
              });
            }
          } else if (chunk.type === 'complete' && (chunk as any).metadata?.trace) {
            // Handle LangGraph execution completion with trace data
            const trace = (chunk as any).metadata.trace as LangGraphTraceStep[];
            const rawDebugTrace = (chunk as any).metadata.debug_trace;  // Extract debug trace
            const debugMode = (chunk as any).metadata.debug_mode;   // Extract debug mode flag
            const totalDuration = (chunk as any).metadata.total_duration_ms || 0;
            
            console.log('🔄 [ChatInterface] Processing LangGraph trace:', trace);
            if (rawDebugTrace) {
              console.log('🐛 [ChatInterface] Processing debug trace:', rawDebugTrace);
            }
            
            // Normalize debug trace data to ensure it's an array for the component
            let normalizedDebugTrace = null;
            if (rawDebugTrace) {
              if (Array.isArray(rawDebugTrace)) {
                // Old format: already an array
                normalizedDebugTrace = rawDebugTrace;
              } else if (rawDebugTrace.agents && Array.isArray(rawDebugTrace.agents)) {
                // New format: structured object with agents array
                normalizedDebugTrace = rawDebugTrace.agents;
              }
              console.log('🐛 [ChatInterface] Normalized debug trace for display:', normalizedDebugTrace);
            }

            // Calculate total metrics from trace
            let totalTokensIn = 0;
            let totalTokensOut = 0;
            let totalCost = 0;
            
            trace.forEach(step => {
              totalTokensIn += step.tokens_in || 0;
              totalTokensOut += step.tokens_out || 0;
              totalCost += step.estimated_cost || 0;
            });

            const executionData: LangGraphExecutionData = {
              trace,
              debug_trace: normalizedDebugTrace,  // Use normalized debug trace (array format)
              debug_mode: debugMode,    // Include debug mode flag
              total_duration_ms: totalDuration,
              total_tokens_in: totalTokensIn,
              total_tokens_out: totalTokensOut,
              total_estimated_cost: totalCost,
              architecture: 'pure_langgraph'
            };

            // Update live execution for real-time display
            setLiveLangGraphExecution(executionData);
            
            // Note: Backend already tracks tokens from trace metadata, so we don't double-count here
            // Token metrics will be synced from backend data during session resume/reload
            console.log('💰 [ChatInterface] Token usage tracked by backend:', {
              tokensIn: totalTokensIn,
              tokensOut: totalTokensOut,
              cost: totalCost
            });

            // Store execution data in the message for historical display
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId
                ? { 
                    ...msg,
                    langGraphExecution: executionData
                  }
                : msg
            ));

            // Update session metrics with actual token counts and costs
            addTokensToMetrics(totalTokensIn, totalTokensOut);

            // Update tool usage metrics from trace
            trace.forEach(step => {
              if (step.tools_used && Array.isArray(step.tools_used)) {
                step.tools_used.forEach(toolName => {
                  addToolUsageToMetrics(toolName);
                });
              }
            });

            // Check for map data in LangGraph tool results
            trace.forEach(step => {
              if (step.tool_results) {
                Object.entries(step.tool_results).forEach(([toolName, result]) => {
                  if ((toolName === 'plot_properties' || toolName === 'enhanced_spatial_search') && (result.output || (result as any).data)) {
                    try {
                      const mapData = extractMapDataFromToolResult(result);
                      if (mapData) {
                        setMessages(prev => prev.map(msg =>
                          msg.id === aiMessageId ? { ...msg, mapData } : msg
                        ));
                      }
                    } catch (error) {
                      console.error('❌ [ChatInterface] Error extracting map data:', error);
                    }
                  }
                });
              }
            });

            // Process render_instruction and data_objects from metadata
            const renderInstruction = (chunk as any).metadata?.render_instruction;
            const dataObjects = (chunk as any).metadata?.data_objects;
            
            if (renderInstruction) {
              console.log('🎨 [ChatInterface] Processing render instruction:', renderInstruction);
              console.log('📦 [ChatInterface] Processing data objects:', dataObjects);
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId 
                  ? { 
                      ...msg, 
                      render_instruction: renderInstruction,
                      data_objects: dataObjects, // Store data objects for contextual operations
                      // Also update token usage if available
                      ...(totalTokensIn > 0 && {
                        token_usage: {
                          input_tokens: totalTokensIn,
                          output_tokens: totalTokensOut, 
                          total_tokens: totalTokensIn + totalTokensOut,
                          estimated_cost: totalCost
                        }
                      })
                    }
                  : msg
              ));
            } else {
              // Still update token usage even without render instruction
              if (totalTokensIn > 0) {
                setMessages(prev => prev.map(msg =>
                  msg.id === aiMessageId 
                    ? { 
                        ...msg,
                        token_usage: {
                          input_tokens: totalTokensIn,
                          output_tokens: totalTokensOut, 
                          total_tokens: totalTokensIn + totalTokensOut,
                          estimated_cost: totalCost
                        }
                      }
                    : msg
                ));
              }
            }
          } else if (chunk.type === 'response' && chunk.content) {
            // Handle single response (e.g., from function calling)
            // Check if the response content indicates an error
            if (isErrorResponse(chunk.content)) {
              console.log('🔍 [ChatInterface] Detected error in response content:', chunk.content);
              const friendlyError = getUserFriendlyErrorMessage(chunk.content);
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      type: 'error' as const,
                      content: `❌ **Error occurred**\n\n${friendlyError}\n\n*You can retry this message with the refresh button below.*`,
                      streaming: false,
                      isError: true,
                      originalUserMessage: textToSend
                    }
                  : msg
              ));
            } else {
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { 
                      ...msg, 
                      content: chunk.content || '', 
                      streaming: false,
                      externalSources: liveExternalSources.length > 0 ? [...liveExternalSources] : undefined
                    }
                  : msg
              ));
            }
            setStreamingMessageId(null);
            setIsLoading(false);
            setLiveLangGraphExecution(null);
            setLiveExternalSources([]);
          } else if (chunk.type === 'response_start') {
            // Handle response start event
            console.log('🚀 [ChatInterface] Response started');
          } else if (chunk.type === 'response_complete') {
            // Handle response completion
            console.log('✅ [ChatInterface] Response completed');
            // Finalize LangGraph execution tracking
            setLiveLangGraphExecution(prev => prev ? {
              ...prev,
              total_duration_ms: Date.now() - (requestStartTs ?? Date.now())
            } : null);
          } else if (chunk.type === 'result' && (chunk as any).data) {
            // Handle enhanced chat result with render instruction
            console.log('🎯 [ChatInterface] Processing enhanced chat result:', (chunk as any).data);
            
            const resultData = (chunk as any).data;
            const renderInstruction = resultData.render_instruction;
            const toolResults = resultData.tool_results;
            const success = resultData.success;
            
            if (renderInstruction) {
              console.log('🎨 [ChatInterface] Processing enhanced render instruction:', renderInstruction);
              setMessages(prev => prev.map(msg => {
                if (msg.id !== aiMessageId) return msg;
                const fallbackTexts = ['Request completed successfully.', 'Response generated'];
                const shouldClearFallback = typeof msg.content === 'string' && fallbackTexts.includes(msg.content.trim());
                return {
                  ...msg,
                  render_instruction: renderInstruction,
                  // Clear useless fallback text if present when we have a proper render instruction
                  ...(shouldClearFallback ? { content: '' } : {}),
                  data_objects: {
                    properties: renderInstruction.items || [],
                    query_context: {
                      tool_used: toolResults?.tool_name || 'enhanced_chat',
                      success: success || false,
                      timestamp: new Date().toISOString()
                    }
                  }
                };
              }));

              // 🔄 AUTO-UPDATE TRIGGER 1: After successful render instruction
              if (success && currentSessionId && renderInstruction.type === 'PropertyList') {
                console.log('🎯 [AutoUpdate] Triggering update for first/changed render instruction');
                
                // Check if this is the first render instruction
                sessionSummaryService.isFirstRenderInstruction(currentSessionId).then(isFirst => {
                  if (isFirst) {
                    console.log('✨ [AutoUpdate] First render instruction detected');
                    sessionSummaryService.triggerUpdate(currentSessionId, 'first_render', {
                      renderInstruction
                    });
                  } else {
                    // Check for search criteria changes for trigger 2
                    const newFilters = renderInstruction.active_filters || {};
                    const previousFilters = sessionMetrics.lastFilters || {};
                    
                    if (sessionSummaryService.hasSearchCriteriaChanged(previousFilters, newFilters)) {
                      console.log('🔄 [AutoUpdate] Search criteria changed');
                      sessionSummaryService.triggerUpdate(currentSessionId, 'search_change', {
                        renderInstruction,
                        previousFilters,
                        newFilters
                      });
                    }
                  }
                });

                // Store current filters for future comparison
                setSessionMetrics(prev => ({
                  ...prev,
                  lastFilters: renderInstruction.active_filters || {}
                }));
              }
            }
            
            // Update content if available
            if (toolResults?.content) {
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: msg.content + (toolResults.content || '') }
                  : msg
              ));
            }
            
          } else if (chunk.type === 'response_error' || chunk.type === 'error') {
            // Handle errors as chat messages
            const errorMsg = chunk.error || 'Unknown error occurred';
            console.error('❌ [ChatInterface] LLM Provider Error:', errorMsg);
            console.error('❌ [ChatInterface] Full error chunk:', chunk);
            const friendlyError = getUserFriendlyErrorMessage(errorMsg);
            console.log('🔄 [ChatInterface] Creating error message:', friendlyError);
            
            // Replace the streaming AI message with an error message
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    type: 'error' as const,
                    content: `❌ **Error occurred**\n\n${friendlyError}\n\n*You can retry this message with the refresh button below.*`,
                    streaming: false,
                    isError: true,
                    originalUserMessage: textToSend
                  }
                : msg
            ));
            setStreamingMessageId(null);
            setIsLoading(false);
          }
        },
        () => {
          // Streaming complete
          setLiveLangGraphExecution(null); // clear live panel after completion
          
                      // Use setTimeout to ensure the state update completes before capturing AI response
            setTimeout(async () => {
              // Find the completed AI response first
              const currentMessages = await new Promise<Message[]>(resolve => {
                setMessages(prev => {
                  resolve(prev);
                  return prev;
                });
              });
              
              const aiMessage = currentMessages.find(msg => msg.id === aiMessageId);
              const completedAiResponse = aiMessage?.content || '';
              
              console.log('🔍 [Session Management] Debug info:', {
                userMessage: textToSend,
                aiResponse: completedAiResponse.substring(0, 200) + '...',
                aiResponseLength: completedAiResponse.length,
                hasGeneratedSessionName,
                messagesLength: currentMessages.length,
                currentSessionId,
                hasCurrentSessionId: !!currentSessionId
              });
              
              // Check if we need to generate session name (first successful message)
              console.log('🔍 [Session Management] Session check:', {
                hasGeneratedSessionName,
                messageCount: currentMessages.length,
                responseLength: completedAiResponse?.length || 0,
                sessionId: currentSessionId,
                hasSessionId: !!currentSessionId
              });
              
              if (!hasGeneratedSessionName && currentMessages.length <= 3 && completedAiResponse && completedAiResponse.length > 10) {
                // Filter out error responses
                const isErrorResponse = completedAiResponse.toLowerCase().includes('error') || 
                                      completedAiResponse.toLowerCase().includes('sorry') ||
                                      completedAiResponse.toLowerCase().includes('apologize') ||
                                      completedAiResponse.length < 20;
                
                if (!isErrorResponse && currentSessionId) {
                  console.log('🎯 [Session Management] First successful AI response - generating name...', {
                    sessionId: currentSessionId,
                    userMessage: textToSend?.substring(0, 50),
                    aiResponsePreview: completedAiResponse?.substring(0, 50),
                    hasGeneratedSessionNameFlag: hasGeneratedSessionName,
                    isGeneratingSessionNameFlag: isGeneratingSessionName
                  });
                  
                  // Generate session name for the first successful AI response (await it)
                  console.log('🏷️ [Session Management] About to call generateSessionName with:', {
                    userMessageLength: textToSend.length,
                    aiResponseLength: completedAiResponse.length,
                    targetSessionId: currentSessionId
                  });
                  
                  // Session title generation is now handled robustly by the backend
                  // The backend automatically updates titles for both new and existing sessions with generic titles
                  console.log('ℹ️ [Session Management] Session title generation handled by backend');
                  
                  // Sync updated session title from backend to reflect any changes immediately
                  try {
                    const sessionResponse = await chatService.resumeSession(currentSessionId);
                    if (sessionResponse.session?.title && sessionResponse.session.title !== sessionMetrics.sessionName) {
                      const updatedTitle = sessionResponse.session.title;
                      setSessionMetrics(prev => ({
                        ...prev,
                        sessionName: updatedTitle
                      }));
                      // Notify parent to update tab title
                      if (onSessionNameChange) {
                        onSessionNameChange(updatedTitle);
                      }
                      console.log(`🔄 [Session Management] Synced updated title from backend: '${updatedTitle}'`);
                    }
                  } catch (error) {
                    console.warn('⚠️ [Session Management] Failed to sync session title from backend:', error);
                  }
                  
                  // Legacy frontend session naming disabled to prevent conflicts
                  // try {
                  //   await generateSessionName(textToSend, completedAiResponse, currentSessionId);
                  //   console.log('✅ [Session Management] Session name generation completed');
                  // } catch (error) {
                  //   console.error('❌ [Session Management] Failed to generate session name:', error);
                  // }
                  
                  // Sync metrics from backend to ensure consistency after first response
                  if (currentSessionId) {
                    console.log('🔄 [Session Management] Syncing metrics from backend for consistency...');
                    try {
                      // Small delay to ensure backend has finished processing the message
                      setTimeout(async () => {
                        await syncSessionMetricsFromBackend(currentSessionId);
                      }, 1000);
                    } catch (error) {
                      console.error('❌ [Session Management] Failed to sync metrics:', error);
                    }
                  }
                } else {
                  console.log('⚠️ [Session Management] Skipping session name generation:', {
                    isErrorResponse,
                    hasSessionId: !!currentSessionId
                  });
                }
              } else {
                console.log('⏭️ [Session Management] Skipping session naming:', {
                  hasGeneratedSessionName,
                  messageCount: currentMessages.length,
                  responseLength: completedAiResponse?.length || 0
                });
              }
              
              // Update the messages to mark streaming as complete
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { 
                      ...msg, 
                      streaming: false,
                      externalSources: liveExternalSources.length > 0 ? [...liveExternalSources] : undefined
                    }
                  : msg
              ));
              
              // Note: Grounding sources are handled during streaming chunks
              setStreamingMessageId(null);
              setIsLoading(false);
              setLiveExternalSources([]); // clear live external sources
              
              // Detect and track tool usage
              detectAndTrackToolUsage(textToSend);
              
            }, 100); // Small delay to ensure state updates complete
        },
        (error: Error) => {
          console.error('Streaming error:', error);
          console.error('Streaming error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          const friendlyError = getUserFriendlyErrorMessage(error.message);
          console.log('🔄 [ChatInterface] Creating streaming error message:', friendlyError);
          
          // Replace the streaming AI message with an error message
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  type: 'error' as const,
                  content: `❌ **Connection Error**\n\n${friendlyError}\n\n*You can retry this message with the refresh button below.*`,
                  streaming: false,
                  isError: true,
                  originalUserMessage: textToSend
                }
              : msg
          ));
          setStreamingMessageId(null);
          setIsLoading(false);
        }
      );

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      const friendlyError = getUserFriendlyErrorMessage(errorMessage);
      console.log('🔄 [ChatInterface] Creating catch error message:', friendlyError);
      
      // Create error message for catch block errors
      const errorMessageObj: Message = {
        id: (Date.now() + 2).toString(),
        type: 'error',
        content: `❌ **Request Failed**\n\n${friendlyError}\n\n*You can retry this message with the refresh button below.*`,
        timestamp: new Date(),
        isError: true,
        originalUserMessage: textToSend
      };
      
      setMessages(prev => [...prev, errorMessageObj]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Removed handleKeyDown - no longer using "@" trigger mention system

  // Detect tool usage based on message content
  const detectAndTrackToolUsage = useCallback((message: string) => {
    const messageLower = message.toLowerCase();
    
    // Web search triggers
    const webSearchKeywords = [
      'search', 'find', 'latest', 'current', 'news', 'information', 
      'what is', 'who is', 'when did', 'where is', 'how to',
      'recent', 'today', 'now', 'update', 'trend', 'tell me about'
    ];
    
    // Geocoding triggers  
    const geocodingKeywords = [
      'address', 'location', 'where is', 'suburb', 'postcode',
      'street', 'road', 'avenue', 'drive', 'place', 'sydney', 'melbourne',
      'brisbane', 'perth', 'adelaide', 'property at', 'house at'
    ];

    // Property analysis triggers
    const propertyAnalysisKeywords = [
      'property analysis', 'market analysis', 'price analysis', 'investment',
      'comparable sales', 'market trends', 'property value', 'roi'
    ];

    // Check for web search
    if (webSearchKeywords.some(keyword => messageLower.includes(keyword))) {
      const webSearchTool = tools.find(t => t.name === 'web_search');
      if (webSearchTool?.enabled) {
        incrementUsage('web_search');
        addToolUsageToMetrics('web_search');
      }
    }

    // Check for geocoding
    if (geocodingKeywords.some(keyword => messageLower.includes(keyword))) {
      const geocodingTool = tools.find(t => t.name === 'geocoding');
      if (geocodingTool?.enabled) {
        incrementUsage('geocoding');
        addToolUsageToMetrics('geocoding');
      }
    }

    // Check for property analysis
    if (propertyAnalysisKeywords.some(keyword => messageLower.includes(keyword))) {
      const propertyAnalysisTool = tools.find(t => t.name === 'property_analysis');
      if (propertyAnalysisTool?.enabled) {
        incrementUsage('property_analysis');
        addToolUsageToMetrics('property_analysis');
      }
    }
  }, [tools, incrementUsage, addToolUsageToMetrics]);

  // Buyer Profile handlers for contextual bar
  const handleBuyerProfileUpdate = useCallback(async (profile: BuyerProfile) => {
    try {
      if (!user?.id) return;
      
      await buyerProfileService.updateBuyerProfile(user.id, profile);
      setBuyerProfile(profile);
      console.log('✅ [BuyerProfile] Updated buyer profile successfully');
    } catch (error) {
      console.error('❌ [BuyerProfile] Failed to update buyer profile:', error);
    }
  }, [user?.id]);

  const handleRefreshBuyerProfile = useCallback(async () => {
    try {
      if (!user?.id || !sessionId) return;
      
      console.log('🔄 [BuyerProfile] Refreshing buyer profile with AI...');
      
      // Extract recent conversation context (safe with null check)
      const recentMessages = messages && messages.length > 0 
        ? messages.slice(-5).map(msg => msg.content) 
        : [];
      
      // Refresh buyer profile using AI analysis
      const updatedProfile = await buyerProfileService.refreshBuyerProfileWithAI(
        user.id,
        sessionId,
        activeFilters,
        recentMessages
      );
      
      setBuyerProfile(updatedProfile);
      console.log('✅ [BuyerProfile] AI refreshed buyer profile successfully');
      
    } catch (error) {
      console.error('❌ [BuyerProfile] Failed to refresh buyer profile with AI:', error);
    }
  }, [user?.id, sessionId, activeFilters, messages]);

  // Active filters update handler
  const updateActiveFilters = useCallback((filters: Record<string, any>) => {
    setActiveFilters(filters);
    console.log('🔄 [ActiveFilters] Updated active filters:', Object.keys(filters));
  }, []);

  // ==========================================
  // JOURNEY SYSTEM HANDLERS
  // ==========================================

  // Journey session switching removed - now handled by LeftNavigation

  // Handle creating a new journey (exploration session)
  const handleNewJourney = useCallback(async () => {
    try {
      console.log('🚀 [JourneySystem] Creating new journey...');
      
      // Step 1: Create new exploration session
      const { sessionId: newSessionId } = await chatService.createChatSession('New Journey');
      console.log('✅ [JourneySystem] New exploration session created:', newSessionId);
      
      // Step 2: Create new journey using the session as root
      const { journeyId: newJourneyId, journey } = await chatService.createJourney(newSessionId);
      console.log('✅ [JourneySystem] New journey created:', { journeyId: newJourneyId, title: journey?.title });
      
      // Step 3: Clear current state and switch to new session
      setSessionId(newSessionId);
      setMessages([]);
      setSessionMentions([]);
      setActiveFilters({});
      setExpandedCards(new Set());
      setCompletedCards(new Set());
      
      // Step 4: Update local storage
      localStorage.setItem('chatSessionId', newSessionId);
      
      // Step 5: Force reload of journey system to show the new journey
      window.location.reload(); // This ensures the JourneyTabSystem refreshes with the new journey
      
      console.log('✅ [JourneySystem] New journey setup complete:', {
        sessionId: newSessionId,
        journeyId: newJourneyId,
        journeyTitle: journey?.title
      });
      
    } catch (error) {
      console.error('❌ [JourneySystem] Failed to create new journey:', error);
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to create new journey: ${errorMessage}`);
    }
  }, []);

  // Register New Journey handler with parent component (once only)
  useEffect(() => {
    if (onRegisterNewJourney) {
      onRegisterNewJourney(handleNewJourney);
      console.log('✅ [ChatInterface] New Journey handler registered with parent');
    }
  }, [onRegisterNewJourney]); // ✅ FIX: Remove handleNewJourney dependency since it's stable via useCallback([])

  // Handle starting exploration from Getting Started
  const handleStartExploration = async () => {
    console.log('🚀 [GettingStarted] Starting exploration session...');
    
    try {
      // Create new exploration session via API
      const { sessionId: newSessionId } = await chatService.createChatSession('New Chat');
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      console.log(`✅ [GettingStarted] Started exploration session: ${newSessionId}`);
      
      // Hide Getting Started and show normal chat with Grace's welcome
      setShowGettingStarted(false);
      setMessages([{
        id: '1',
        type: 'ai',
        content: "# Hey there! 👋 I'm Grace\n\nWelcome to your property exploration journey! I'm here to help you find your perfect property in Australia.\n\nI can help you with property search, market insights, and answer all your questions.\n\n**How would you like to get started?**",
        timestamp: new Date(),
        // Simple introduction options
        introductionOptions: [
          { id: 'tutorial', text: 'Show me a quick tutorial', action: 'tutorial' },
          { id: 'skip', text: 'Skip - let\'s start exploring!', action: 'skip' }
        ]
      }]);
      
      // Notify parent about new session
      if (onNewSessionCreated) {
        onNewSessionCreated();
      }
      
    } catch (error) {
      console.error('❌ [GettingStarted] Failed to create exploration session:', error);
      // Fallback to client-side generation
      const fallbackSessionId = chatService.generateSessionId();
      setSessionId(fallbackSessionId);
      localStorage.setItem('chatSessionId', fallbackSessionId);
      console.log(`🔄 [GettingStarted] Using fallback session: ${fallbackSessionId}`);
      
      // Still hide Getting Started and proceed
      setShowGettingStarted(false);
      setMessages([{
        id: '1',
        type: 'ai',
        content: "# Hey there! 👋 I'm Grace\n\nWelcome to your property exploration journey! I'm here to help you find your perfect property in Australia.\n\nI can help you with property search, market insights, and answer all your questions.\n\n**How would you like to get started?**",
        timestamp: new Date(),
        // Simple introduction options
        introductionOptions: [
          { id: 'tutorial', text: 'Show me a quick tutorial', action: 'tutorial' },
          { id: 'skip', text: 'Skip - let\'s start exploring!', action: 'skip' }
        ]
      }]);
    }
  };

  // Handle starting a new chat session
  const handleNewChat = async () => {
    try {
      // Create new session via API
      const { sessionId: newSessionId } = await chatService.createChatSession('New Chat');
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      console.log(`✅ Started new chat with API session: ${newSessionId}`);
    } catch (error) {
      console.error('Failed to create session via API:', error);
      // Fallback to client-side generation
      const fallbackSessionId = chatService.generateSessionId();
      setSessionId(fallbackSessionId);
      localStorage.setItem('chatSessionId', fallbackSessionId);
      console.log(`🔄 Using fallback session for new chat: ${fallbackSessionId}`);
    }
    
    // Reset messages to just the welcome message
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: "# Hey there! 👋 I'm Grace\n\nWelcome to your property exploration journey! I'm here to help you find your perfect property in Australia.\n\nI can help you with property search, market insights, and answer all your questions.\n\n**How would you like to get started?**",
        timestamp: new Date(),
        // Simple introduction options
        introductionOptions: [
          { id: 'tutorial', text: 'Show me a quick tutorial', action: 'tutorial' },
          { id: 'skip', text: 'Skip - let\'s start exploring!', action: 'skip' }
        ]
      }
    ]);
    
    // Hide Getting Started when creating new chat
    setShowGettingStarted(false);
    
    // Clear input
    setInputValue('');
    
    // Reset session metrics
    setSessionMetrics({
      sessionName: 'New Chat',
      totalTextCount: '0',
      totalInputTokens: '0',
      totalOutputTokens: '0',
      totalCreditsUsed: '0.000000',
      toolsUsed: {}
    });
    setHasGeneratedSessionName(false);
    setIsGeneratingSessionName(false);
    isCreatingSessionRef.current = false;
  };

  // Handle introduction option selection (tutorial/skip)
  const handleIntroductionOption = async (action: string) => {
    console.log('🎭 [Introduction] User selected:', action);
    
    if (action === 'tutorial') {
      // 🎭 MILESTONE 2: Send natural tutorial request with proper metadata context
      const tutorialMetadata = {
        introduction_context: 'tutorial_selected',  // ✅ FIXED: Specific context string
        introduction_action: 'tutorial',
        source: 'introduction_dialog'
      };
      await handleSendMessage(
        'I want to learn how to search for properties', 
        tutorialMetadata
      );
    } else if (action === 'skip') {
      // 🎭 MILESTONE 2: Send natural skip message with proper metadata context
      const skipMetadata = {
        introduction_context: 'skip_selected',      // ✅ FIXED: Specific context string  
        introduction_action: 'skip',
        source: 'introduction_dialog'
      };
      await handleSendMessage(
        'I\'m ready to explore properties', 
        skipMetadata
      );
    }
    
    // Remove introduction options from the first message to prevent re-clicks
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === '1' ? { ...msg, introductionOptions: [] } : msg
      )
    );
  };

  // Handle copying message content
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('✅ [ChatInterface] Message copied to clipboard');
    } catch (error) {
      console.error('❌ [ChatInterface] Failed to copy message:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Handle retrying a message
  const handleRetryMessage = async (originalMessage: string) => {
    if (!originalMessage || isLoading) return;
    
    console.log('🔄 [ChatInterface] Retrying message:', originalMessage);
    await handleSendMessage(originalMessage);
  };

  // Handle adding selected properties/amenities as mentions
  const handleSendPropertiesToAI = async (selectedItems: any[], message: string) => {
    if (!selectedItems.length || isLoading) return;

    console.log('🏠 [ChatInterface] Adding selected items as mentions:', {
      count: selectedItems.length,
      currentSessionId: sessionId,
      items: selectedItems.map(item => ({ 
        id: item.id, 
        name: item.address || item.name || 'Unknown',
        type: item.address ? 'property' : 'amenity'
      }))
    });

    // Ensure we have a session ID - CRITICAL: Must use existing session for mentions to work
    let currentSessionId = sessionId;
    console.log('🔍 [ChatInterface] Session ID check:', { currentSessionId, hasSessionId: !!currentSessionId });
    if (!currentSessionId) {
      console.log('🆕 [ChatInterface] Creating session for mentions...');
      try {
        const sessionResult = await chatService.createChatSession();
        if (sessionResult.sessionId) {
          currentSessionId = sessionResult.sessionId;
          setSessionId(currentSessionId);
        } else {
          console.error('❌ Failed to create session for mentions');
          return;
        }
      } catch (error) {
        console.error('❌ Error creating session for mentions:', error);
        return;
      }
    }

    // Add first selected item as a mention (single mention enforcement)
    try {
      const item = selectedItems[0]; // Only use first item for single mention enforcement
      const isProperty = !!(item.address || item.city || item.state || item.bedrooms);
      const isAmenity = !!(item.name && item.category && !isProperty);
      
      // Generate unique ID for amenities if they don't have one (common issue with amenities)
      const entityId = item.id || (isAmenity ? `amenity_${item.name?.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}` : `unknown_${Date.now()}`);
      
      const mentionData = {
        entity_type: isProperty ? 'property' as const : 'amenity' as const,
        entity_id: entityId,
        entity_category: isProperty ? 'property' as const : (item.category || 'amenity'),
        display_text: isProperty ? (item.address || 'Unknown Property') : (item.name || 'Unknown Amenity'),
        entity_metadata: isProperty ? {
          // Property metadata
          title: item.address || 'Unknown Property',
          price: item.price,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          description: item.description,
          property_type: item.property_type || item.propertyType,
          city: item.city,
          state: item.state,
          suburb: item.suburb,
          area_size: item.area_size,
          house_size: item.house_size,
          lot_size: item.lot_size,
          sqft: item.sqft,
        } : {
          // Amenity metadata
          title: item.name || 'Unknown Amenity',
          category: item.category,
          subtype: item.subtype,
          address: item.address,
          suburb: item.suburb,
          postcode: item.postcode,
          description: item.description,
          distance_km: item.distance_km,
          latitude: item.latitude,
          longitude: item.longitude,
        }
      };

      console.log(`📍 [ChatInterface] Adding ${isProperty ? 'property' : 'amenity'} mention to session ${currentSessionId}:`, mentionData);
      const mention = await mentionService.addMentionToSession(currentSessionId, mentionData);
      console.log('✅ [ChatInterface] Mention added successfully:', { mentionId: mention.id, entityType: mention.entity_type, sessionId: currentSessionId });
      
      // Update local mentions state - SINGLE MENTION ENFORCEMENT: Replace existing mention instead of adding
      setSessionMentions([mention]); // Only keep the new mention, replace any existing ones

      console.log('✅ [ChatInterface] All items added as mentions successfully (single mention enforced)');
      
      // Add follow-up message to input instead of clearing it
      setInputValue(message);
      
      // Set follow-up staged state for glow animation and sparkle icon
      setIsFollowUpStaged(true);
      
      // Optional: Show a brief notification or hint
      // You could add a toast notification here to inform the user
      
    } catch (error) {
      console.error('❌ [ChatInterface] Error adding item mentions:', error);
    }
  };

  // 🌍 LOCATION DISAMBIGUATION: Step 5 - Message metadata update handler (with persistence)
  const handleUpdateMessageMetadata = useCallback((messageId: string, metadata: any) => {
    console.log('🔄 [STEP 5] Location selection update:', {
      messageId,
      metadata,
      timestamp: new Date().toISOString()
    });

    // 🌍 STEP 5: Actually update message in state with new metadata
    setMessages((prevMessages) => {
      return prevMessages.map((message) => {
        if (message.id === messageId) {
          console.log('🔄 [STEP 5] Updating message metadata:', {
            messageId,
            existingMetadata: (message as any).metadata || {},
            newMetadata: metadata
          });
          
          return {
            ...message,
            metadata: {
              ...(message as any).metadata || {},
              ...metadata
            }
          } as Message;
        }
        return message;
      });
    });

    console.log('✅ [STEP 5] Message state updated successfully for messageId:', messageId);
  }, []);

  // Multi-tab interface handlers
  const handleCreateSession = async (scope: SessionScope) => {
    try {
      let newSession;
      if (scope === SessionScope.EXPLORATION) {
        newSession = await buyerProfileService.createExplorationSession();
      } else {
        // For other scopes, we'll need the backend to handle creation
        newSession = await chatService.createChatSession(`New ${scope.replace('_', ' ')} Session`);
      }
      
      if (newSession) {
        // Convert to EnhancedChatSession format
        const enhancedSession: EnhancedChatSession = {
          ...newSession,
          scope,
          messages: [],
          buyer_profile: buyerProfile,
          journey_stage: 'discovery',
          metadata: {}
        };
        setSessions(prev => [...prev, enhancedSession]);
        setSessionId(newSession.id);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  // 🔍 Helper function to find journey ID for a given session ID
  const findJourneyIdForSession = (targetSessionId: string): string | undefined => {
    if (!initializationResult?.journeys) {
      console.warn('🔍 [ChatInterface] No journeys available in initialization result (may still be loading)');
      return undefined;
    }
    
    // Only show debug info when journey search fails
    const journeyCount = initializationResult.journeys.length;
    
    for (const journeyWithSessions of initializationResult.journeys) {
      // Access journey properties from the nested structure
      const journey = journeyWithSessions.journey;
      const sessions = journeyWithSessions.sessions;
      
      if (sessions) {
        const sessionFound = sessions.find((session: any) => session.id === targetSessionId);
        if (sessionFound) {
          console.log('🎯 [IsaacHandoff] Found journey for session:', {
            journeyId: journey.id,
            journeyTitle: journey.title
          });
          return journey.id;
        }
      }
    }
    
    console.warn('⚠️ [ChatInterface] Session not found in any journey:', targetSessionId);
    console.log('🔍 [ChatInterface] Searched in', journeyCount, 'journeys');
    return undefined;
  };

  const handleCreatePropertyDrill = async (propertyId: string, title: string) => {
    console.log('🏠 handleCreatePropertyDrill called:', { propertyId, title, sessionId });
    
    // 🚀 STEP 1: Notify Left Navigation that handoff is starting
    const placeholderSessionId = leftNavUpdateService.notifyHandoffStart({
      title,
      propertyId,
      address: title // Use title as address for now
    });
    
    try {
      console.log('🔄 Creating property drill session via buyerProfileService...');
      const newSession = await buyerProfileService.createPropertyDrillSession(
        propertyId,
        title,
        sessionId
      );
      console.log('✅ New session created:', newSession);
      
      if (newSession) {
        // ✅ FIX: Backend returns {session: {...}} structure
        const sessionData = newSession.session || newSession;
        console.log('🔍 [DEBUG] Session data extracted:', sessionData);
        
        const enhancedSession: EnhancedChatSession = {
          ...sessionData,
          scope: SessionScope.PROPERTY_DRILL,
          messages: [],
          buyer_profile: buyerProfile,
          journey_stage: 'evaluation',
          referenced_property_id: propertyId,
          metadata: { property_address: title }
        };
        console.log('🔄 Adding session to state and switching to it...');
        setSessions(prev => [...prev, enhancedSession]);
        
        // 🎯 CRITICAL FIX: Clear current messages and switch to Isaac's welcome for new property drill session
        console.log('🧹 [PropertyDrillSession] Clearing current messages and loading Isaac welcome');
        setMessages([
          {
            id: '1',
            type: 'ai',
            content: `# Hello! 👋 I'm Isaac - Property Deep Dive Specialist\n\n**Welcome to your dedicated property analysis session!**\n\nI'm here to provide you with comprehensive analysis for **${title}**. I specialize in deep property research, market analysis, and investment insights tailored specifically for your needs.\n\n## What I can help you with:\n- 🔍 **Detailed Property Analysis** - Comprehensive breakdown of features, condition, and value\n- 📊 **Market Research** - Latest trends, comparable sales, and pricing insights\n- 🏘️ **Neighborhood Analysis** - Demographics, amenities, schools, and lifestyle factors\n- 💰 **Investment Assessment** - ROI calculations, rental potential, and growth projections\n- 🔧 **Property Insights** - Maintenance considerations, renovation opportunities, and more\n\n**Ready to dive deep into ${title}?** Ask me anything about this property, the local market, or investment potential!`,
            timestamp: new Date(),
          }
        ]);
        
        setSessionId(sessionData.id);
        localStorage.setItem('chatSessionId', sessionData.id);
        console.log('✅ Successfully switched to property drill session:', sessionData.id);
        
        // 🚀 STEP 2: Notify Left Navigation that handoff completed successfully (with journey context)
        const currentJourneyId = findJourneyIdForSession(sessionId);
        leftNavUpdateService.notifyHandoffComplete(placeholderSessionId, sessionData, sessionId, currentJourneyId);
        
        // 🔄 AUTO-UPDATE TRIGGER 3: After session handoff (Grace → Isaac)
        if (sessionId && sessionData.id && sessionId !== sessionData.id) {
          console.log('🎯 [AutoUpdate] Session handoff detected: Grace → Isaac');
          sessionSummaryService.triggerUpdate(sessionData.id, 'handoff', {
            handoffDetails: {
              fromAgent: 'Grace',
              toAgent: 'Isaac',
              propertyId: propertyId
            }
          });

          // Also update the original exploration session to reflect handoff
          sessionSummaryService.triggerUpdate(sessionId, 'handoff', {
            handoffDetails: {
              fromAgent: 'Grace',
              toAgent: 'Isaac',
              propertyId: propertyId
            }
          });
        }
        
        // Navigation tree refresh now handled by LeftNavigation component
      } else {
        console.warn('⚠️ New session is null/undefined');
      }
    } catch (error) {
      console.error('❌ Failed to create property drill session:', error);
      
      // 🚀 STEP 3: Notify Left Navigation that handoff failed
      leftNavUpdateService.notifyHandoffError(
        placeholderSessionId, 
        error instanceof Error ? error.message : 'Failed to create property drill session'
      );
    }
  };

  const handleCreateComparison = async (propertyIds: string[]) => {
    try {
      const newSession = await buyerProfileService.createComparisonSession(propertyIds);
      
      if (newSession) {
        const enhancedSession: EnhancedChatSession = {
          ...newSession,
          scope: SessionScope.COMPARISON,
          messages: [],
          buyer_profile: buyerProfile,
          journey_stage: 'comparison_analysis',
          referenced_property_ids: propertyIds,
          metadata: { comparison_count: propertyIds.length }
        };
        setSessions(prev => [...prev, enhancedSession]);
        setSessionId(newSession.id);
      }
    } catch (error) {
      console.error('Failed to create comparison session:', error);
    }
  };

  const handleUpdateBuyerProfile = async (profileUpdate: Partial<BuyerProfile>) => {
    const updatedProfile = { ...buyerProfile, ...profileUpdate };
    setBuyerProfile(updatedProfile);
    
    if (user?.id) {
      try {
        await buyerProfileService.updateBuyerProfile(user.id, profileUpdate);
      } catch (error) {
        console.error('Failed to update buyer profile:', error);
      }
    }
  };

  const handleSwitchSession = (sessionId: string) => {
    setSessionId(sessionId);
    // Load session messages if needed
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.messages) {
      // Convert ChatMessage[] to Message[] with proper timestamp conversion
      const convertedMessages = session.messages.map(msg => ({
        ...msg,
        timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
      })) as Message[];
      setMessages(convertedMessages);
    }
  };

  const handleCloseSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // If closing current session, switch to another one or create new
    if (sessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setSessionId(remainingSessions[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleBookmarkProperty = async (propertyId: string) => {
    try {
      await buyerProfileService.addBookmark(propertyId, sessionId);
      setBookmarkedProperties(prev => [...prev, propertyId]);
    } catch (error) {
      console.error('Failed to bookmark property:', error);
    }
  };

  // Load buyer profile and bookmarks on mount (prevent double loading from auth changes)
  useEffect(() => {
    if (user?.id && !buyerProfileLoadedRef.current) {
      buyerProfileLoadedRef.current = true;
      
      buyerProfileService.getBuyerProfile(user.id)
        .then(profile => setBuyerProfile(profile))
        .catch(error => console.error('Failed to load buyer profile:', error));
        
      buyerProfileService.getBookmarks()
        .then(bookmarks => setBookmarkedProperties(bookmarks.map(b => b.property_id)))
        .catch(error => console.error('Failed to load bookmarks:', error));
    } else if (!user?.id) {
      buyerProfileLoadedRef.current = false; // Reset on sign out
    }
  }, [user?.id]); // ✅ FIX: Prevent duplicate buyer profile loading from multiple auth state changes

  // Handle sparkle suggestions
  const handleSparkleSuggestionsClick = async (event: React.MouseEvent<HTMLElement>) => {
    setSparkleSuggestionsAnchor(event.currentTarget);
    
    // Load suggestions if not already loaded
    if (!sparkleSuggestions) {
      try {
        const suggestions = await suggestionsService.getQuickSuggestions('follow_up', 6);
        
        // Add one extra option as mentioned in requirements
        const extraSuggestion: SuggestionResponse = {
          question: "Refine by price under $1M",
          context: "follow_up",
          category: "refinement",
          priority: 1.0,
          requires_data: false
        };
        
        const updatedSuggestions = {
          ...suggestions,
          suggestions: [extraSuggestion, ...suggestions.suggestions]
        };
        
        setSparkleSuggestions(updatedSuggestions);
      } catch (error) {
        console.error('Error loading sparkle suggestions:', error);
        // Fallback suggestions
        setSparkleSuggestions({
          suggestions: [
            { question: "Refine by price under $1M", context: "follow_up", category: "refinement", priority: 1.0, requires_data: false },
            { question: "Show me more details", context: "follow_up", category: "general", priority: 0.9, requires_data: false },
            { question: "Find similar properties nearby", context: "follow_up", category: "location", priority: 0.8, requires_data: false },
          ],
          context: "follow_up",
          total_available: 3,
          message: "Here are some follow-up suggestions:"
        });
      }
    }
  };

  const handleSparkleSuggestionsClose = () => {
    setSparkleSuggestionsAnchor(null);
  };

  const handleSparkleSuggestionSelect = (suggestion: SuggestionResponse) => {
    setInputValue(suggestion.question);
    setIsFollowUpStaged(true); // Keep follow-up staged state
    handleSparkleSuggestionsClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatService.cleanup();
    };
  }, []);

  // Determine current session scope based on sessions state
  const getCurrentSessionScope = (): SessionScope => {
    console.log('🔍 [getCurrentSessionScope] Determining session scope...', {
      currentSessionId: sessionId,
      sessionsCount: sessions.length,
      sessions: sessions.map(s => ({id: s.id, scope: s.scope, title: s.title}))
    });
    
    // Find current session in sessions array
    const currentSession = sessions.find(session => session.id === sessionId);
    if (currentSession) {
      console.log('✅ [getCurrentSessionScope] Found current session:', currentSession.scope);
      return currentSession.scope;
    }
    
    // Default to exploration if session not found
    console.log('⚠️ [getCurrentSessionScope] Session not found, defaulting to exploration');
    return SessionScope.EXPLORATION;
  };

  return (
    <>
      {/* ⚡ OPTIMIZATION: Remove blocking initialization UI - chat loads immediately */}
      {/* Journey navigation loads in background while chat is functional */}

      {/* Main Chat Interface - Always available for immediate user interaction */}
      {true && (
        <>
        <Box sx={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'white'
        }}>

          {/* Journey Tab System removed - navigation now handled in LeftNavigation */}

          {/* Session Tabs - Show multiple sessions when available */}
          {isAuthenticated && sessions.length > 1 && (
            <Box sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              px: 2,
              py: 1
            }}>
              <Box sx={{ maxWidth: '1200px', mx: 'auto', display: 'flex', gap: 1, overflowX: 'auto' }}>
                {sessions.map((session) => (
                  <Chip
                    key={session.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Agent icon based on session scope */}
                    {session.scope === SessionScope.PROPERTY_DRILL ? (
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: '#2563eb', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        I
                      </Box>
                    ) : (
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: '#0d2b2c', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        G
                      </Box>
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.title || `${session.scope === SessionScope.PROPERTY_DRILL ? 'Property Analysis' : 'Exploration'}`}
                    </Typography>
                  </Box>
                }
                variant={sessionId === session.id ? "filled" : "outlined"}
                color={sessionId === session.id ? "primary" : "default"}
                clickable
                onClick={() => {
                  console.log('🔄 [SessionTabs] Switching to session:', session.id, session.scope);
                  setSessionId(session.id);
                  // Load messages for this session if needed
                  // For now, we'll just switch the context
                }}
                sx={{
                  minWidth: 'fit-content',
                  height: 32,
                  borderRadius: 16,
                  ...(sessionId === session.id && {
                    bgcolor: session.scope === SessionScope.PROPERTY_DRILL ? '#2563eb' : '#0d2b2c',
                    color: 'white',
                    '&:hover': {
                      bgcolor: session.scope === SessionScope.PROPERTY_DRILL ? '#1d4ed8' : '#1a9ba8'
                    }
                  })
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Messages Area - Full width scrollable container */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        width: '100%'
      }}>
        {/* 🎯 Show Getting Started Screen or Regular Chat */}
        {showGettingStarted ? (
          <GettingStarted 
            onStartExploration={handleStartExploration} 
            loadingJourneyMethods={loadingJourneyMethods}
          />
        ) : (
          <>
            {/* Inner container with width constraints */}
            <Box sx={{
              maxWidth: '1200px', // Increased from 800px for wider screens
              mx: 'auto',
              p: 2,
              pt: '80px', // Top padding to account for sticky contextual bar (64px height + 16px spacing)
              width: '100%'
            }}>
              {/* ⚡ Loading indicator when initializing and no messages yet - only for initial setup */}
              {!isLoading && (isInitializing || (!isJourneyNavigationLoaded && messages.length === 0)) && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 3
                }}>
                  {/* Grace Avatar */}
                  <Avatar
                    src="/px-grace.png"
                    alt="Grace AI Assistant"
                    onClick={() => setShowGracePortfolio(true)}
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      mt: 0.5,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  />

                  <Box sx={{
                    p: 3,
                    maxWidth: '80%',
                    bgcolor: 'background.paper',
                    borderRadius: '20px 20px 20px 6px',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <CircularProgress size={20} thickness={4} />
                    <Typography variant="body1" sx={{
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }}>
                      {isInitializing
                        ? "Grace is getting ready to help you..."
                        : "Setting up your property exploration session..."
                      }
                    </Typography>
                  </Box>
                </Box>
              )}

              {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 3 }}>
            {/* Message */}
            <Box sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: message.type === 'user' ? 0 : 2,
              mb: 1
            }}>
              {/* Grace Avatar for AI messages */}
              {message.type !== 'user' && (
                <Avatar
                  src="/px-grace.png"
                  alt="Grace AI Assistant"
                  onClick={() => setShowGracePortfolio(true)}
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    mt: 0.5,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                />
              )}

              {message.type === 'user' ? (
                /* User messages keep Paper wrapper with subtle grey background */
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    maxWidth: '80%',
                    bgcolor: 'var(--color-primary-main)',
                    color: 'var(--color-primary-contrast)',
                    borderRadius: '20px 20px 6px 20px',
                    border: 'none',
                    position: 'relative',
                    boxShadow: '0 8px 24px rgba(64, 64, 65, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: 'var(--font-secondary)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 12px 32px rgba(64, 64, 65, 0.2)'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      right: -8,
                      width: '16px',
                      height: '16px',
                      bgcolor: 'var(--color-primary-main)',
                      clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                      borderRadius: '0 0 0 6px'
                    }
                  }}
                >
                  <Box>
                    {/* Display mentioned items if any - minimalist design */}
                    {message.mentions && message.mentions.length > 0 && (
                      <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {message.mentions.map((mention) => (
                          <Chip
                            key={mention.id}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <span style={{ fontSize: '8px' }}>
                                  {mention.entity_type === 'property' ? '🏠' : '📍'}
                                </span>
                                <span style={{ fontSize: '0.7rem', lineHeight: 1 }}>
                                  @{mention.display_text.replace(/\s+/g, '_').toLowerCase()}
                                </span>
                              </Box>
                            }
                            variant="filled"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: '#e5e7eb',
                              color: '#4b5563',
                              '& .MuiChip-label': {
                                px: 0.75,
                                py: 0
                              }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    <MarkdownMessage 
                      content={message.content}
                      isUser={message.type === 'user'}
                    />
                    {message.streaming && message.content && (
                      <Box component="span" sx={{
                        display: 'inline-block',
                        width: '8px',
                        height: '16px',
                        bgcolor: 'currentColor',
                        ml: 0.5,
                        animation: 'blink 1s infinite'
                      }} />
                    )}
                  </Box>
                </Paper>
              ) : (
                /* AI messages without Paper wrapper - plain styling */
                <Box
                  sx={{
                    maxWidth: '80%',
                    bgcolor: 'var(--color-bg-paper)',
                    color: message.type === 'error' ? '#dc2626' : 'var(--color-text-primary)',
                    borderRadius: '20px 20px 20px 6px',
                    p: 3,
                    position: 'relative',
                    boxShadow: '0 4px 16px rgba(64, 64, 65, 0.08)',
                    border: '1px solid rgba(64, 64, 65, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: 'var(--font-secondary)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 24px rgba(64, 64, 65, 0.12)'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: -8,
                      width: '16px',
                      height: '16px',
                      bgcolor: 'var(--color-bg-paper)',
                      clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                      borderRadius: '0 0 6px 0',
                      border: '1px solid rgba(64, 64, 65, 0.08)',
                      borderRight: 'none',
                      borderBottom: 'none'
                    }
                  }}
                >
                  {/* Streaming indicator for AI messages */}
                  {message.streaming && (
                    <Box sx={{
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CircularProgress size={16} thickness={4} />
                      <Typography variant="body2" sx={{
                        color: 'text.secondary',
                        fontStyle: 'italic',
                        fontSize: '0.875rem',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%)',
                          backgroundSize: '200% 200%',
                          animation: 'lightReflection 2s ease-in-out infinite',
                          pointerEvents: 'none',
                          '@keyframes lightReflection': {
                            '0%': {
                              backgroundPosition: '0% 100%'
                            },
                            '50%': {
                              backgroundPosition: '100% 0%'
                            },
                            '100%': {
                              backgroundPosition: '0% 100%'
                            }
                          }
                        }
                      }}>
                        Grace is thinking...
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    {/* Only show markdown content if there's no structured render instruction to avoid duplication */}
                    {(!message.render_instruction || 
                      !['PropertyList', 'MapPins', 'AmenityList', 'Message'].includes(message.render_instruction.type) || 
                      message.streaming) && (
                      <MarkdownMessage 
                        content={message.content}
                        isUser={false}
                      />
                    )}
                    
                    {message.streaming && message.content && (
                      <Box component="span" sx={{
                        display: 'inline-block',
                        width: '8px',
                        height: '16px',
                        bgcolor: 'currentColor',
                        ml: 0.5,
                        animation: 'blink 1s infinite'
                      }} />
                    )}
                    
                    {/* Simple Introduction Options */}
                    {!message.streaming && message.introductionOptions && message.introductionOptions.length > 0 && (
                      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {message.introductionOptions.map((option) => (
                          <Button
                            key={option.id}
                            variant="outlined"
                            onClick={() => handleIntroductionOption(option.action)}
                            sx={{
                              borderRadius: '20px',
                              textTransform: 'none',
                              fontWeight: 500,
                              px: 3,
                              py: 1,
                              borderColor: 'rgba(31, 170, 188, 0.3)',
                              color: '#0d2b2c',
                              '&:hover': {
                                borderColor: '#0d2b2c',
                                backgroundColor: 'rgba(31, 170, 188, 0.1)',
                              }
                            }}
                          >
                            {option.text}
                          </Button>
                        ))}
                      </Box>
                    )}
                    
                    {/* Render Instruction Display (PropertyList, MapPins, etc.) */}
                    {!message.streaming && message.render_instruction && (
                      <RenderInstructionDisplay 
                        renderInstruction={message.render_instruction}
                        onSendToAI={handleSendPropertiesToAI}
                        onCreatePropertyDrillSession={(property) => 
                          handleCreatePropertyDrill(property.id || '', `Property Analysis - ${property.full_address || property.address || property.title || 'Property'}`)
                        }
                        onSendMessage={handleSendMessage} // 🎯 MILESTONE 3.2: Pass handleSendMessage for interactive sample queries
                        guidanceContext={(message as any).guidance_context}
                        dataObjects={(message as any).data_objects}
                        messageMetadata={(message as any).metadata || message.render_instruction?.location_metadata} // 🌍 LOCATION DISAMBIGUATION: Pass location metadata from render instruction
                        messageId={message.id} // 🌍 LOCATION DISAMBIGUATION: Pass message ID for state updates
                        onUpdateMessage={(messageId: string, updates: any) => handleUpdateMessageMetadata(messageId, updates)} // 🌍 LOCATION DISAMBIGUATION: Step 2 - Message update handler (logging only)
                        // Active filters props removed (Phase 6C) - replaced with conversational transparency
                      />
                    )}
                    
                    {/* Map Display */}
                    {message.mapData && (
                      <Box sx={{ mt: 2 }}>
                        <PropertyMap
                          properties={message.mapData.properties}
                          title={message.mapData.title}
                          height={400}
                          catchmentBoundaries={message.mapData.catchment_boundaries || []}
                          showCatchmentControls={message.mapData.has_school_catchment || false}
                        />
                      </Box>
                    )}
                    
                    {/* Historical LangGraph Execution Display (after completion) */}
                    {!message.streaming && message.langGraphExecution && (
                      <LangGraphExecutionDisplay
                        executionData={message.langGraphExecution}
                        isActive={false}
                      />
                    )}
                    
                    {/* Historical External Sources Display (after completion) */}
                    {!message.streaming && message.externalSources && message.externalSources.length > 0 && (
                      <ExternalSourcesDisplay
                        sources={message.externalSources}
                        isActive={false}
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Message action icons - positioned outside wrapper */}
            {!message.streaming && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                gap: 0.5, 
                mt: 1,
                opacity: 0.6,
                '&:hover': { opacity: 1 }
              }}>
                {/* Copy icon for all messages */}
                <IconButton
                  size="small"
                  onClick={() => handleCopyMessage(message.content)}
                  sx={{ 
                    color: '#6b7280',
                    '&:hover': { 
                      backgroundColor: 'rgba(0,0,0,0.04)' 
                    }
                  }}
                  title="Copy message"
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
                
                {/* Retry icon for error messages */}
                {message.isError && message.originalUserMessage && (
                  <IconButton
                    size="small"
                    onClick={() => handleRetryMessage(message.originalUserMessage!)}
                    disabled={isLoading}
                    sx={{ 
                      color: '#6b7280',
                      '&:hover': { 
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                    title="Retry message"
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                )}
                
                {/* Retry icon for successful AI messages (retry with current model) */}
                {(message.type === 'ai' && !message.isError) && message.originalUserMessage && (
                  <IconButton
                    size="small"
                    onClick={() => handleRetryMessage(message.originalUserMessage!)}
                    disabled={isLoading}
                    sx={{ 
                      color: '#6b7280',
                      '&:hover': { 
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                    title="Retry message"
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}

            {/* Contextual Input */}
            {message.contextualInput && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-start',
                mt: 2
              }}>
                <Box sx={{ maxWidth: '85%', width: '100%' }}>
                  {message.contextualInput.component}
                </Box>
              </Box>
            )}
          </Box>
        ))}

              {/* ⚡ Grace thinking indicator when loading - only show if no streaming messages */}
              {isLoading && !messages.some(msg => msg.streaming) && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 3
                }}>
                  {/* Grace Avatar */}
                  <Avatar
                    src="/px-grace.png"
                    alt="Grace AI Assistant"
                    onClick={() => setShowGracePortfolio(true)}
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      mt: 0.5,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  />

                  <Box sx={{
                    p: 3,
                    maxWidth: '80%',
                    bgcolor: 'background.paper',
                    borderRadius: '20px 20px 20px 6px',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <CircularProgress size={20} thickness={4} />
                    <Typography variant="body1" sx={{
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%)',
                        backgroundSize: '200% 200%',
                        animation: 'lightReflection 2s ease-in-out infinite',
                        pointerEvents: 'none',
                        '@keyframes lightReflection': {
                          '0%': {
                            backgroundPosition: '0% 100%'
                          },
                          '50%': {
                            backgroundPosition: '100% 0%'
                          },
                          '100%': {
                            backgroundPosition: '0% 100%'
                          }
                        }
                      }
                    }}>
                      Grace is thinking...
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </Box>
            </>
          )}
        </Box>

      {/* Live Tool Execution Panel - Separate from chat messages */}
      {liveLangGraphExecution && (
        <Box sx={{ 
          maxWidth: '800px',
          mx: 'auto',
          width: '100%',
          px: 3,
          py: 2,
          borderTop: '1px solid #f1f5f9',
          bgcolor: '#fafafa'
        }}>
          <LangGraphExecutionDisplay executionData={liveLangGraphExecution} isActive />
        </Box>
      )}

      {/* Live External Sources Panel - Shows sources being referenced */}
      {liveExternalSources.length > 0 && (
        <ExternalSourcesDisplay sources={liveExternalSources} isActive />
      )}

      {/* Input Area */}
      <Box sx={{ 
        px: 3,
        pb: 3,
        maxWidth: '800px',
        mx: 'auto',
        width: '100%'
      }}>
        {/* Mention System */}
        <MentionSystem
          ref={mentionSystemRef}
          inputValue={inputValue}
          onInputChange={handleInputValueChange}
          sessionId={sessionId}
          onMentionsChange={setSessionMentions}
          onSessionCreated={(newSessionId) => {
            console.log('🎯 [ChatInterface] Session created by mention system:', newSessionId);
            setSessionId(newSessionId);
            localStorage.setItem('chatSessionId', newSessionId);
            if (onNewSessionCreated) {
              onNewSessionCreated();
            }
          }}
          disabled={true} // Completely disabled - mentions only added via "Ask follow up" from hover previews
        />

        {/* Breathing ambient diffusion light container */}
        <Box
          sx={{
            position: 'relative',
          }}
        >
          {/* Breathing diffusion light underneath */}
          {isFollowUpStaged && (
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                left: -8,
                right: -8,
                bottom: -8,
                borderRadius: 4,
                background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(37, 99, 235, 0.1) 100%)',
                animation: 'breathingAmbientLight 3s ease-in-out infinite',
                '@keyframes breathingAmbientLight': {
                  '0%': {
                    opacity: 0.3,
                    transform: 'scale(1)',
                    background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(37, 99, 235, 0.1) 100%)',
                  },
                  '50%': {
                    opacity: 0.6,
                    transform: 'scale(1.02)',
                    background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 50%, rgba(59, 130, 246, 0.15) 100%)',
                  },
                  '100%': {
                    opacity: 0.3,
                    transform: 'scale(1)',
                    background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(37, 99, 235, 0.1) 100%)',
                  },
                },
                zIndex: -1,
              }}
            />
          )}

          {/* Main input container */}
          <Box
            sx={{
              border: '2px solid var(--color-primary-main)',
              borderRadius: '24px',
              bgcolor: 'var(--color-bg-default)',
              p: 3,
              position: 'relative',
              boxShadow: '0 8px 32px rgba(64, 64, 65, 0.12)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:focus-within': {
                borderColor: 'var(--color-primary-dark)',
                boxShadow: '0 12px 40px rgba(64, 64, 65, 0.16), 0 0 0 4px rgba(64, 64, 65, 0.08)',
                transform: 'translateY(-2px)'
              },
              ...(isFollowUpStaged && {
                animation: 'inputBoxYellowGlow 3s ease-in-out infinite',
                '@keyframes inputBoxYellowGlow': {
                  '0%': {
                    borderColor: 'var(--color-primary-main)',
                    boxShadow: '0 8px 32px rgba(64, 64, 65, 0.12)',
                  },
                  '50%': {
                    borderColor: '#f59e0b',
                    boxShadow: '0 12px 40px rgba(245, 158, 11, 0.3), 0 0 0 4px rgba(245, 158, 11, 0.2)',
                  },
                  '100%': {
                    borderColor: 'var(--color-primary-main)',
                    boxShadow: '0 8px 32px rgba(64, 64, 65, 0.12)',
                  },
                },
              }),
            }}
          >
          {/* Top section with sparkle icon and mentions */}
          {(isFollowUpStaged || sessionMentions.length > 0) && (
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {/* Breathing sparkle icon */}
              {isFollowUpStaged && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mr: 1,
                  }}
                >
                  <Tooltip title="Follow-up suggestions available">
                    <IconButton
                      size="small"
                      onClick={handleSparkleSuggestionsClick}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: 'warning.50',
                        color: 'warning.main',
                        animation: 'breathingSparkle 2.5s ease-in-out infinite',
                        '@keyframes breathingSparkle': {
                          '0%': {
                            transform: 'scale(1)',
                            boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)',
                          },
                          '50%': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.2)',
                          },
                          '100%': {
                            transform: 'scale(1)',
                            boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.1)',
                          },
                        },
                        '&:hover': {
                          bgcolor: 'warning.100',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <AutoAwesome sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              
              {/* Mentions chips */}
              {sessionMentions.map((mention) => (
                <Chip
                  key={mention.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <span style={{ fontSize: '10px' }}>
                        {mention.entity_type === 'property' ? '🏠' : '📍'}
                      </span>
                      <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>
                        @{mention.display_text.replace(/\s+/g, '_').toLowerCase()}
                      </span>
                    </Box>
                  }
                  variant="outlined"
                  size="small"
                  onDelete={async () => {
                    try {
                      if (sessionId) {
                        await mentionService.removeMentionFromSession(sessionId, mention.id);
                      }
                      const updatedMentions = sessionMentions.filter(m => m.id !== mention.id);
                      setSessionMentions(updatedMentions);
                    } catch (error) {
                      console.error('Failed to remove mention:', error);
                    }
                  }}
                  deleteIcon={<Close fontSize="small" />}
                  sx={{
                    height: 24,
                    backgroundColor: '#f8fafc',
                    borderColor: '#cbd5e1',
                    '& .MuiChip-label': {
                      px: 1,
                      py: 0.25,
                    },
                    '& .MuiChip-deleteIcon': {
                      fontSize: '14px',
                      margin: '0 2px 0 -2px',
                    },
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      borderColor: '#94a3b8',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Text input - no border, fills container */}
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={isAuthenticated
              ? "Ask about property listings, market analysis, or get help with your property..."
              : "Please sign in to start chatting..."
            }
            value={inputValue}
            onChange={(e) => handleInputValueChange(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="standard"
            disabled={!isAuthenticated || isLoading}
            sx={{
              mb: 2,
              '& .MuiInput-root': {
                fontFamily: 'var(--font-secondary)',
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--color-text-primary)',
                '&:before': {
                  display: 'none',
                },
                '&:after': {
                  display: 'none',
                },
                '&:hover:not(.Mui-disabled):before': {
                  display: 'none',
                },
              },
              '& .MuiInput-input': {
                fontSize: '1rem',
                fontFamily: 'var(--font-secondary)',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                padding: 0,
                '&::placeholder': {
                  color: 'var(--color-text-placeholder)',
                  fontSize: '0.95rem',
                  fontWeight: 300,
                  opacity: 1
                }
              },
            }}
          />

          {/* Bottom toolbar integrated within container */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Left side - Multiple action buttons */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                disabled={!isAuthenticated}
                sx={{
                  color: '#0d2b2c', // SLEEK: brand color
                  bgcolor: 'transparent', // SLEEK: transparent by default
                  border: '1px solid rgba(31, 170, 188, 0.3)', // SLEEK: subtle brand border
                  transition: 'all 0.3s ease', // SLEEK: smooth transitions
                  '&:hover': {
                    bgcolor: 'rgba(31, 170, 188, 0.05)', // SLEEK: subtle brand fill on hover
                    border: '1px solid rgba(31, 170, 188, 0.5)', // SLEEK: stronger brand border on hover
                  },
                  '&:disabled': {
                    color: 'rgba(31, 170, 188, 0.3)', // SLEEK: faded brand color
                    border: '1px solid rgba(31, 170, 188, 0.15)', // SLEEK: very subtle border when disabled
                  },
                }}
              >
                <AttachFile fontSize="small" />
              </IconButton>
              
              {/* Additional toolbar buttons can be added here */}
              <IconButton
                size="small"
                disabled={!isAuthenticated}
                sx={{
                  color: '#0d2b2c', // SLEEK: brand color
                  bgcolor: 'transparent', // SLEEK: transparent by default
                  border: '1px solid rgba(31, 170, 188, 0.3)', // SLEEK: subtle brand border
                  transition: 'all 0.3s ease', // SLEEK: smooth transitions
                  '&:hover': {
                    bgcolor: 'rgba(31, 170, 188, 0.05)', // SLEEK: subtle brand fill on hover
                    border: '1px solid rgba(31, 170, 188, 0.5)', // SLEEK: stronger brand border on hover
                  },
                  '&:disabled': {
                    color: 'rgba(31, 170, 188, 0.3)', // SLEEK: faded brand color
                    border: '1px solid rgba(31, 170, 188, 0.15)', // SLEEK: very subtle border when disabled
                  },
                }}
              >
                <Search fontSize="small" />
              </IconButton>

              {/* Suggestions Button removed - replaced by sparkle icon */}
            </Box>

            {/* Right side - Send button */}
            <IconButton
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || !isAuthenticated || isLoading}
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'transparent', // SLEEK: transparent by default
                color: '#0d2b2c', // SLEEK: brand color text
                border: '1px solid #0d2b2c', // SLEEK: brand border
                transition: 'all 0.3s ease', // SLEEK: smooth transitions
                '&:hover': {
                  bgcolor: '#0d2b2c', // SLEEK: fill with brand color on hover
                  color: 'white', // SLEEK: white text on hover
                  transform: 'translateY(-1px)', // SLEEK: subtle lift effect
                  boxShadow: '0 4px 12px rgba(31, 170, 188, 0.25)', // SLEEK: brand shadow
                },
                '&:disabled': {
                  bgcolor: 'transparent', // SLEEK: transparent when disabled
                  border: '1px solid rgba(31, 170, 188, 0.3)', // SLEEK: subtle brand border
                  color: 'rgba(31, 170, 188, 0.5)', // SLEEK: faded brand color
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <ArrowUpward fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Box>
        </Box>
        {/* AI Disclaimer with Debug Copy */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mt: 1.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#6b7280',
              fontSize: '0.75rem',
              opacity: 0.8
            }}
          >
            AI-Assistant can make mistakes. Check important info.
          </Typography>

          <Tooltip title={debugCopySuccess ? "Copied to clipboard!" : "Copy conversation for debugging"}>
            <IconButton
              onClick={handleDebugCopy}
              size="small"
              sx={{
                color: debugCopySuccess ? '#10b981' : '#6b7280',
                opacity: 0.8,
                '&:hover': {
                  opacity: 1,
                  backgroundColor: 'rgba(107, 114, 128, 0.1)'
                }
              }}
            >
              {debugCopySuccess ? <ContentCopy fontSize="small" /> : <BugReport fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
          </Box>
        </Box>
        
          <AuthModal
            open={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialTab="signin"
          />
          
          <CapabilitiesMatrixModal
            open={showCapabilitiesModal}
            onClose={() => setShowCapabilitiesModal(false)}
          />
          
          {/* Sparkle Suggestions Popover */}
          <Popover
          open={Boolean(sparkleSuggestionsAnchor)}
          anchorEl={sparkleSuggestionsAnchor}
          onClose={handleSparkleSuggestionsClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          PaperProps={{
            sx: {
              mt: -1,
              borderRadius: 2,
              minWidth: 300,
              maxWidth: 400,
              maxHeight: 400,
              overflow: 'hidden',
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.dark', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome sx={{ fontSize: 16, color: 'warning.main' }} />
              Follow-up Suggestions
            </Typography>
            <List dense sx={{ pt: 0 }}>
              {sparkleSuggestions?.suggestions.map((suggestion, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => handleSparkleSuggestionSelect(suggestion)}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'primary.50',
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {suggestion.question}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Popover>
        </>
      )}

      {/* Grace's Handwritten Resume - Physical Paper Style */}
      <Dialog
        open={showGracePortfolio}
        onClose={() => setShowGracePortfolio(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#fefcf0', // Cream paper color
            backgroundImage: `
              radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,0.3) 21%, rgba(255,255,255,0.3) 34%, transparent 35%, transparent),
              linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 76%, transparent 77%, transparent),
              radial-gradient(circle at 50% 100%, rgba(240,240,235,0.4) 0%, transparent 50%)
            `, // Paper texture
            color: '#2c1810', // Dark brown ink color
            borderRadius: 2,
            border: '1px solid #e8d5b7', // Paper edge color
            boxShadow: '0 20px 60px rgba(44, 24, 16, 0.15), 0 8px 24px rgba(44, 24, 16, 0.1)', // Paper shadow
            maxHeight: '90vh',
            transform: 'rotate(-0.5deg)', // Slight paper rotation for authenticity
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(transparent, transparent 24px, rgba(44, 24, 16, 0.03) 25px)', // Ruled paper lines
              pointerEvents: 'none'
            }
          }
        }}
        BackdropProps={{
          sx: {
            bgcolor: 'rgba(139, 119, 101, 0.15)', // Warm brown backdrop
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        {/* Handwritten Resume Header */}
        <Box sx={{
          p: 5,
          position: 'relative',
          zIndex: 2 // Above ruled lines
        }}>
          {/* Close Button - styled like paper clip */}
          <IconButton
            onClick={() => setShowGracePortfolio(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#8b6f47',
              bgcolor: '#f0e6d2',
              border: '2px solid #d4c4a8',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: '#e8dcc4',
                transform: 'rotate(5deg)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>

          {/* Header with photo and name */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4, mb: 4 }}>
            <Avatar
              src={AGENT_CONFIG.exploration.avatar}
              alt={AGENT_CONFIG.exploration.name}
              sx={{
                width: 120,
                height: 120,
                border: '3px solid #d4c4a8',
                borderRadius: 2, // Less circular for a photo look
                boxShadow: '4px 4px 12px rgba(44, 24, 16, 0.2)',
                transform: 'rotate(-2deg)'
              }}
            />
            <Box sx={{ flex: 1, mt: 2 }}>
              <Typography sx={{
                fontFamily: '"Kalam", cursive', // Handwriting font
                fontSize: '2.8rem',
                fontWeight: 700,
                color: '#2c1810',
                mb: 1,
                textShadow: '1px 1px 2px rgba(44, 24, 16, 0.1)',
                transform: 'rotate(-1deg)',
                display: 'inline-block'
              }}>
                {AGENT_CONFIG.exploration.name}
              </Typography>
              <Typography sx={{
                fontFamily: '"Kalam", cursive',
                fontSize: '1.6rem',
                fontWeight: 500,
                color: '#8b6f47',
                mb: 2,
                fontStyle: 'italic',
                transform: 'rotate(0.5deg)',
                display: 'inline-block'
              }}>
                {AGENT_CONFIG.exploration.title}
              </Typography>
              <Typography sx={{
                fontFamily: '"Kalam", cursive',
                fontSize: '1.2rem',
                color: '#5d4e37',
                fontStyle: 'italic'
              }}>
                ✨ Your AI Property Guide at Banner17 ✨
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: 5, pb: 3, position: 'relative', zIndex: 2 }}>
          {/* About Me Section - handwritten style */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{
              fontFamily: '"Kalam", cursive',
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#2c1810',
              mb: 3,
              textDecoration: 'underline',
              textDecorationColor: '#d4c4a8',
              textDecorationThickness: '2px',
              transform: 'rotate(-0.5deg)',
              display: 'inline-block'
            }}>
              About Me 💫
            </Typography>
            <Typography sx={{
              fontFamily: '"Kalam", cursive',
              fontSize: '1.1rem',
              color: '#2c1810',
              lineHeight: 1.8,
              fontWeight: 500,
              mb: 2
            }}>
              {AGENT_CONFIG.exploration.description}
            </Typography>
          </Box>

          {/* What I Can Help With - handwritten list */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{
              fontFamily: '"Kalam", cursive',
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#2c1810',
              mb: 3,
              textDecoration: 'underline',
              textDecorationColor: '#d4c4a8',
              textDecorationThickness: '2px',
              transform: 'rotate(0.5deg)',
              display: 'inline-block'
            }}>
              What I Can Help You With 🏠
            </Typography>
            <Stack spacing={1.5}>
              {AGENT_CONFIG.exploration.capabilities.map((capability, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  transform: `rotate(${(index % 2 === 0) ? '-0.3deg' : '0.3deg'})`
                }}>
                  <Typography sx={{
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.2rem',
                    color: '#8b6f47',
                    fontWeight: 600,
                    minWidth: 'auto'
                  }}>
                    •
                  </Typography>
                  <Typography sx={{
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.05rem',
                    color: '#2c1810',
                    lineHeight: 1.6,
                    fontWeight: 500
                  }}>
                    {capability}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Important Notes - handwritten style */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{
              fontFamily: '"Kalam", cursive',
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#2c1810',
              mb: 3,
              textDecoration: 'underline',
              textDecorationColor: '#d4c4a8',
              textDecorationThickness: '2px',
              transform: 'rotate(-0.5deg)',
              display: 'inline-block'
            }}>
              Important Notes 📝
            </Typography>
            <Stack spacing={1.5}>
              {AGENT_CONFIG.exploration.limitations.map((limitation, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  transform: `rotate(${(index % 2 === 0) ? '0.2deg' : '-0.2deg'})`
                }}>
                  <Typography sx={{
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.2rem',
                    color: '#d2691e',
                    fontWeight: 600,
                    minWidth: 'auto'
                  }}>
                    *
                  </Typography>
                  <Typography sx={{
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.05rem',
                    color: '#5d4e37',
                    lineHeight: 1.6,
                    fontWeight: 500,
                    fontStyle: 'italic'
                  }}>
                    {limitation}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Handwritten signature */}
          <Box sx={{
            pt: 3,
            borderTop: '1px dashed #d4c4a8',
            textAlign: 'right'
          }}>
            <Typography sx={{
              fontFamily: '"Kalam", cursive',
              fontSize: '1.4rem',
              color: '#8b6f47',
              fontStyle: 'italic',
              transform: 'rotate(1deg)',
              display: 'inline-block'
            }}>
              Happy to help! 😊
            </Typography>
            <Typography sx={{
              fontFamily: '"Kalam", cursive',
              fontSize: '2rem',
              color: '#2c1810',
              fontWeight: 600,
              transform: 'rotate(-2deg)',
              display: 'block',
              mt: 1
            }}>
              - {AGENT_CONFIG.exploration.name} ✨
            </Typography>
          </Box>
        </Box>
      </Dialog>

    </>
  );
};

export default ChatInterface;