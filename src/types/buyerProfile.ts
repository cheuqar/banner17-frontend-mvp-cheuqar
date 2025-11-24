/**
 * Buyer Profile Builder Types
 *
 * Based on Phase 2 API implementation and QA validation report
 * Reference: handoff/features/buyer-profile-prompt-builder/RETEST-QA-REPORT.md
 * Phase 3.7.4: Added AI Refinement types
 */

// Base API response type (defined locally to avoid circular dependency)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// Workflow State Management (Stateless Pattern)
// ============================================================================

/**
 * Complete workflow state for buyer profile builder conversation
 * This is passed between API calls (stateless pattern, not session-based)
 */
export interface BuyerProfileWorkflowState {
  // Node tracking
  current_node: ProfileBuilderNode;
  completed_nodes: ProfileBuilderNode[];

  // Message history
  messages: WorkflowMessage[];

  // Current user input
  current_user_message: string;

  // Collected criteria (progressively built across nodes)
  basic_criteria: BasicCriteria;
  location_criteria: LocationCriteria;
  advanced_criteria: AdvancedCriteria;
  buyer_context: BuyerContext;

  // Gap transparency
  unsupported_criteria: UnsupportedCriterion[];

  // Profile naming
  profile_name: string;

  // LLM-generated search prompt (final output)
  search_prompt: string;

  // Location disambiguation state
  disambiguation_required: boolean;
  disambiguation_options?: LocationDisambiguationOption[];

  // Capabilities cache (loaded at welcome node)
  capabilities?: BuyerProfileCapabilities;
}

/**
 * Workflow nodes in buyer profile builder (6 nodes total)
 */
export type ProfileBuilderNode =
  | 'welcome'
  | 'basic_criteria'
  | 'location_preferences'
  | 'advanced_criteria'
  | 'buyer_context'
  | 'validate_and_save';

/**
 * Message in workflow conversation
 */
export interface WorkflowMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ============================================================================
// Collected Criteria (Progressive Disclosure)
// ============================================================================

/**
 * Basic search criteria (Node 2: basic_criteria)
 */
export interface BasicCriteria {
  property_types?: string[];           // ["apartment", "house", "townhouse"]
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  budget_min?: number;
  budget_max?: number;
}

/**
 * Location preferences (Node 3: location_preferences)
 *
 * DESIGN CONSTRAINTS:
 * - state: MANDATORY and SINGLE (strict enforcement at all layers)
 * - suburbs: OPTIONAL and FLEXIBLE (can be empty, single, or multiple)
 *   - LLM agent will guide users to pick ONE suburb (soft guidance)
 *   - Can be empty when profile focuses on amenities (schools, shopping) rather than specific location
 * - landmarks: Multiple allowed (amenities-based criteria)
 * - postcodes: Flexible (derived from suburbs or specified independently)
 */
export interface LocationCriteria {
  state: string;                       // MANDATORY: Single state (e.g., "NSW", "VIC") - REQUIRED
  suburbs?: string[];                  // OPTIONAL: ["Mosman", "Neutral Bay"] or [] or ["Mosman"]
  landmarks?: string[];                // OPTIONAL: ["Near Sydney Opera House"]
  postcodes?: string[];                // OPTIONAL: ["2088", "2089"]
}

/**
 * Advanced criteria with gap detection (Node 4: advanced_criteria)
 */
export interface AdvancedCriteria {
  schools?: {
    types?: string[];                  // ["primary", "secondary"]
    importance?: string;               // "essential", "preferred", "nice-to-have"
  };
  amenities?: {
    types?: string[];                  // ["hospitals", "shopping", "beaches"]
    max_distance_km?: number;
    importance?: string;
  };
  features?: {
    parking?: boolean;
    pool?: boolean;
    balcony?: boolean;
    garden?: boolean;
    renovation_required?: string;      // "move-in ready", "fixer-upper", "any"
  };
}

/**
 * Buyer context and intentions (Node 5: buyer_context)
 */
export interface BuyerContext {
  intention?: string;                  // "investment", "owner-occupier", "first-home-buyer"
  timeline?: string;                   // "urgent", "within-3-months", "flexible"
  special_needs?: string[];            // ["wheelchair-accessible", "pet-friendly"]
  additional_notes?: string;           // Free-form text
}

/**
 * Unsupported criteria (gap transparency)
 */
export interface UnsupportedCriterion {
  criterion: string;                   // e.g., "View requirements"
  reason: string;                      // e.g., "Property database doesn't track views"
  alternative?: string;                // e.g., "Search for waterfront properties manually"
}

/**
 * Location disambiguation option
 */
export interface LocationDisambiguationOption {
  suburb: string;
  state: string;
  postcode: string;
  confidence: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request to start buyer profile builder conversation
 */
export interface StartBuilderRequest {
  // Empty body - backend initializes new workflow state
}

/**
 * Response from /api/v1/buyer-profile/builder/start
 */
export interface StartBuilderResponse {
  success: boolean;
  message: string;
  data: {
    action: 'continue' | 'disambiguation' | 'complete';
    workflow_state: BuyerProfileWorkflowState;
    current_node: ProfileBuilderNode;
    ai_response: string;
  };
}

/**
 * Request to continue buyer profile builder conversation
 */
export interface ChatBuilderRequest {
  user_message: string;
  current_state: BuyerProfileWorkflowState;
}

/**
 * Response from /api/v1/buyer-profile/builder/chat
 */
export interface ChatBuilderResponse {
  success: boolean;
  message: string;
  data: {
    action: 'continue' | 'disambiguation' | 'complete';
    workflow_state: BuyerProfileWorkflowState;
    current_node: ProfileBuilderNode;
    ai_response: string;
  };
}

// ============================================================================
// Buyer Profile Capabilities (Data-Driven Guidance)
// ============================================================================

/**
 * Capabilities cache from /api/v1/buyer-profile/capabilities
 * Used for gap transparency and dynamic UI guidance
 */
export interface BuyerProfileCapabilities {
  property_types: {
    supported: string[];
    total_listings: number;
  };
  locations: {
    states_covered: string[];
    total_suburbs: number;
    total_postcodes: number;
  };
  price_range: {
    min: number;
    max: number;
    median: number;
  };
  amenities: {
    supported_categories: string[];
    total_amenities: number;
    coverage_notes: string;
  };
  features: {
    supported: string[];
    unsupported: string[];
  };
  limitations: {
    unsupported_features: string[];
    regional_gaps: string[];
    data_quality_notes: string[];
  };
  cache_metadata: {
    cached_at: string;
    ttl_seconds: number;
    expires_at: string;
  };
}

// ============================================================================
// Saved Buyer Profile (CRUD Operations)
// ============================================================================

/**
 * Saved buyer profile (from /api/v1/buyer-profile/profiles endpoints)
 */
export interface BuyerProfile {
  id: string;
  user_id: string;
  profile_name: string;
  search_prompt: string;

  // Collected criteria
  basic_criteria: BasicCriteria;
  location_criteria: LocationCriteria;
  advanced_criteria: AdvancedCriteria;
  buyer_context: BuyerContext;

  // Gap transparency
  unsupported_criteria: UnsupportedCriterion[];

  // Usage tracking
  usage_count: number;
  last_used_at: string | null;

  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create a new buyer profile
 */
export interface CreateBuyerProfileRequest {
  profile_name: string;
  search_prompt: string;
  basic_criteria: BasicCriteria;
  location_criteria: LocationCriteria;
  advanced_criteria: AdvancedCriteria;
  buyer_context: BuyerContext;
  unsupported_criteria?: UnsupportedCriterion[];
}

/**
 * Request to update an existing buyer profile
 */
export interface UpdateBuyerProfileRequest {
  profile_name?: string;
  search_prompt?: string;
  basic_criteria?: BasicCriteria;
  location_criteria?: LocationCriteria;
  advanced_criteria?: AdvancedCriteria;
  buyer_context?: BuyerContext;
  unsupported_criteria?: UnsupportedCriterion[];
}

/**
 * Response from profile CRUD operations
 */
export interface BuyerProfileResponse extends ApiResponse<BuyerProfile> {}

/**
 * Response from profile list endpoint
 */
export interface BuyerProfileListResponse extends ApiResponse<BuyerProfile[]> {}

// ============================================================================
// UI State Management
// ============================================================================

/**
 * UI state for buyer profile builder page
 */
export interface BuyerProfileBuilderUIState {
  // Workflow state
  workflowState: BuyerProfileWorkflowState | null;
  currentNode: ProfileBuilderNode | null;

  // Conversation display
  displayMessages: ChatDisplayMessage[];

  // Loading states
  isLoading: boolean;
  isStarting: boolean;
  isSending: boolean;

  // Input state
  userInput: string;

  // Progress tracking
  completedSteps: number;
  totalSteps: number;

  // Gap transparency
  detectedGaps: UnsupportedCriterion[];
  showGapPanel: boolean;

  // Disambiguation
  disambiguationActive: boolean;
  disambiguationOptions: LocationDisambiguationOption[];

  // Profile save state
  profileSaved: boolean;
  savedProfileId: string | null;

  // Error handling
  error: string | null;
}

/**
 * Chat message for display in UI
 */
export interface ChatDisplayMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  node: ProfileBuilderNode;
}

/**
 * Workflow progress step
 */
export interface WorkflowProgressStep {
  node: ProfileBuilderNode;
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if response is StartBuilderResponse
 */
export function isStartBuilderResponse(response: any): response is StartBuilderResponse {
  return response?.data?.workflow_state && response?.data?.current_node && response?.data?.ai_response;
}

/**
 * Check if response is ChatBuilderResponse
 */
export function isChatBuilderResponse(response: any): response is ChatBuilderResponse {
  return response?.data?.workflow_state && response?.data?.current_node && response?.data?.ai_response;
}

/**
 * Check if action requires disambiguation
 */
export function requiresDisambiguation(action: string): boolean {
  return action === 'disambiguation';
}

/**
 * Check if workflow is complete
 */
export function isWorkflowComplete(action: string): boolean {
  return action === 'complete';
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Node labels for UI display
 */
export const NODE_LABELS: Record<ProfileBuilderNode, string> = {
  welcome: 'Welcome',
  basic_criteria: 'Basic Criteria',
  location_preferences: 'Location Preferences',
  advanced_criteria: 'Advanced Criteria',
  buyer_context: 'Buyer Context',
  validate_and_save: 'Review & Save',
};

/**
 * Node descriptions for progress indicator
 */
export const NODE_DESCRIPTIONS: Record<ProfileBuilderNode, string> = {
  welcome: 'Introduction and expectations',
  basic_criteria: 'Property type, bedrooms, budget',
  location_preferences: 'Preferred locations and areas',
  advanced_criteria: 'Schools, amenities, features',
  buyer_context: 'Intentions, timeline, special needs',
  validate_and_save: 'Review your profile and save',
};

/**
 * Total number of workflow nodes
 */
export const TOTAL_WORKFLOW_NODES = 6;

/**
 * Node order for sequential progression
 */
export const NODE_ORDER: ProfileBuilderNode[] = [
  'welcome',
  'basic_criteria',
  'location_preferences',
  'advanced_criteria',
  'buyer_context',
  'validate_and_save',
];

// ============================================================================
// AI Refinement Types (Phase 3.7.4)
// ============================================================================

/**
 * Quality analysis dimensions for 5-star rating system
 */
export interface QualityDimension {
  score: number;          // 1-5 star rating
  label: string;          // Display name
  description: string;    // What this dimension measures
  color: 'success' | 'warning' | 'error' | 'info';
  feedback?: string;      // Specific feedback for this dimension
}

/**
 * Quality analysis response from /api/v1/buyer-profile/analyze-prompt
 */
export interface PromptQualityAnalysis {
  overall_score: number;                           // 0-100 percentage
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F';    // Letter grade
  dimensions: {
    location_specificity: QualityDimension;
    budget_realism: QualityDimension;
    criteria_completeness: QualityDimension;
    buyer_context: QualityDimension;
    australian_market: QualityDimension;
  };
  strengths: string[];                             // What's good about the prompt
  weaknesses: string[];                            // Areas for improvement
  missing_criteria: string[];                      // Critical missing elements
  confidence: number;                              // 0-1 analysis confidence
}

/**
 * Refinement suggestion categories
 */
export type RefinementCategory = 'location' | 'budget' | 'amenities' | 'context' | 'clarity';

/**
 * Individual refinement suggestion
 */
export interface RefinementSuggestion {
  id: string;
  category: RefinementCategory;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;                              // 0-1 confidence score
  before_text?: string;                            // Original text (if applicable)
  after_text?: string;                             // Suggested replacement
  data_support?: {
    property_count?: number;
    avg_price?: number;
    available_alternatives?: string[];
    market_data?: Record<string, any>;
  };
}

/**
 * Refinement suggestions response from /api/v1/buyer-profile/suggest-refinements
 */
export interface RefinementSuggestions {
  suggestions: RefinementSuggestion[];
  categories: {
    [K in RefinementCategory]: {
      count: number;
      priority: 'low' | 'medium' | 'high';
    };
  };
  overall_priority: 'low' | 'medium' | 'high';
  estimated_improvement: number;                   // 0-100 points potential gain
}

/**
 * Complete refinement response from /api/v1/buyer-profile/refine-prompt
 */
export interface PromptRefinementResult {
  original_prompt: string;
  refined_prompt: string;
  quality_metrics: {
    location_specificity: number;                  // 0-1
    budget_clarity: number;                        // 0-1
    property_details: number;                      // 0-1
    buyer_context: number;                         // 0-1
    market_relevance: number;                      // 0-1
    overall_score: number;                         // 0-1
    star_rating: number;                           // 1-5
  };
  suggestions: {
    category: string;
    title: string;
    description: string;
    before: string;
    after: string;
    impact: string;
    confidence: number;                            // 0-1
    data_support?: {
      property_count?: number;
      avg_price?: number;
      available_alternatives?: string[];
    } | null;
  }[];
  changes_summary: string;
  confidence_score: number;                        // 0-1
}

/**
 * Refinement workflow state for UI
 */
export interface RefinementState {
  // Analysis phase
  isAnalyzing: boolean;
  qualityAnalysis: PromptQualityAnalysis | null;

  // Suggestions phase
  isLoadingSuggestions: boolean;
  suggestions: RefinementSuggestions | null;
  selectedSuggestions: string[];                   // IDs of selected suggestions

  // Refinement phase
  isRefining: boolean;
  refinementResult: PromptRefinementResult | null;

  // UI state
  showModal: boolean;
  currentStep: 'analysis' | 'suggestions' | 'review' | 'complete';

  // Error handling
  error: string | null;
}

// ============================================================================
// API Request/Response Types for Refinement
// ============================================================================

/**
 * Request to analyze prompt quality
 */
export interface AnalyzePromptRequest {
  prompt: string;
  current_criteria?: {
    basic_criteria?: BasicCriteria;
    location_criteria?: LocationCriteria;
    advanced_criteria?: AdvancedCriteria;
    buyer_context?: BuyerContext;
  };
}

/**
 * Request to get refinement suggestions
 */
export interface RefinementSuggestionsRequest {
  prompt: string;
  current_criteria?: {
    basic_criteria?: BasicCriteria;
    location_criteria?: LocationCriteria;
    advanced_criteria?: AdvancedCriteria;
    buyer_context?: BuyerContext;
  };
}

/**
 * Request to refine prompt
 */
export interface RefinePromptRequest {
  prompt: string;
  selected_suggestions?: string[];                 // IDs of suggestions to apply
  current_criteria?: {
    basic_criteria?: BasicCriteria;
    location_criteria?: LocationCriteria;
    advanced_criteria?: AdvancedCriteria;
    buyer_context?: BuyerContext;
  };
}

/**
 * API endpoint paths
 */
export const BUYER_PROFILE_ENDPOINTS = {
  CAPABILITIES: '/api/v1/buyer-profile/capabilities',
  BUILDER_START: '/api/v1/buyer-profile/builder/start',
  BUILDER_CHAT: '/api/v1/buyer-profile/builder/chat',
  PROFILES_LIST: '/api/v1/buyer-profile/profiles',
  PROFILES_CREATE: '/api/v1/buyer-profile/profiles',
  PROFILES_GET: (id: string) => `/api/v1/buyer-profile/profiles/${id}`,
  PROFILES_UPDATE: (id: string) => `/api/v1/buyer-profile/profiles/${id}`,
  PROFILES_DELETE: (id: string) => `/api/v1/buyer-profile/profiles/${id}`,
  PROFILES_USE_FOR_SEARCH: (id: string) => `/api/v1/buyer-profile/profiles/${id}/use-for-search`,
  // Phase 3.7.4: Refinement endpoints
  ANALYZE_PROMPT: '/api/v1/buyer-profile/analyze-prompt',
  SUGGEST_REFINEMENTS: '/api/v1/buyer-profile/suggest-refinements',
  REFINE_PROMPT: '/api/v1/buyer-profile/refine-prompt',
} as const;
