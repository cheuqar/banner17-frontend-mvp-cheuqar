// Constants for Listez Chatbot App

// API Configuration
export const API_CONFIG = {
  GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  GOOGLE_MAPS_API_BASE_URL: 'https://maps.googleapis.com/maps/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Chat Steps
export const CHAT_STEPS = {
  WELCOME: 'welcome',
  ADDRESS_INPUT: 'address_input',
  MEDIA_UPLOAD: 'media_upload',
  PROPERTY_DETAILS: 'property_details',
  AI_ANALYSIS: 'ai_analysis',
  PRICING: 'pricing',
  CONTENT_GENERATION: 'content_generation',
  REVIEW: 'review',
  COMPLETE: 'complete',
} as const;

// Property Types - Phase 2.41 FIX: Values must match database property_type values (case-sensitive)
export const PROPERTY_TYPES = {
  HOUSE: 'House',
  APARTMENT: 'Apartment',
  TOWNHOUSE: 'Townhouse',
  VILLA: 'Villa',
  UNIT: 'Unit',
  LAND: 'Land',
  COMMERCIAL: 'Commercial',
} as const;

// Input Control Types
export const INPUT_CONTROL_TYPES = {
  ADDRESS: 'address',
  PRICE: 'price',
  FEATURES: 'features',
  MEDIA: 'media',
  TEXT: 'text',
  DATE: 'date',
  NUMBER: 'number',
  SELECT: 'select',
  MULTI_SELECT: 'multi_select',
} as const;

// Panel Types
export const PANEL_TYPES = {
  PROPERTY_OVERVIEW: 'property_overview',
  MARKET_INTELLIGENCE: 'market_intelligence',
  LOCATION_INSIGHTS: 'location_insights',
  MEDIA_GALLERY: 'media_gallery',
  PROGRESS_CHECKLIST: 'progress_checklist',
  ANALYSIS_RESULTS: 'analysis_results',
} as const;

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  MAX_IMAGES: 20,
  MAX_VIDEOS: 5,
  MIN_IMAGES: 3,
  MIN_VIDEOS: 1,
} as const;

// UI Configuration
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1200,
  SIDEBAR_WIDTH: 300,
  PANEL_MIN_WIDTH: 250,
  PANEL_MIN_HEIGHT: 200,
} as const;

// Message Types
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
} as const;

// Analysis Status
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

// Validation Status
export const VALIDATION_STATUS = {
  PENDING: 'pending',
  VALID: 'valid',
  INVALID: 'invalid',
} as const;

// Content Styles
export const CONTENT_STYLES = {
  PROFESSIONAL: 'professional',
  CASUAL: 'casual',
  LUXURY: 'luxury',
} as const;

// Australian States
export const AUSTRALIAN_STATES = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  TAS: 'Tasmania',
  ACT: 'Australian Capital Territory',
  NT: 'Northern Territory',
} as const;

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT: 'RATE_LIMIT',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  PROPERTY: {
    bedrooms: 0,
    bathrooms: 0,
    features: [],
    condition: '',
    age: 0,
    description: '',
  },
  USER_PREFERENCES: {
    panelLayout: 'default',
    customLayouts: [],
    preferredInputTypes: {},
    assistanceLevel: 'full' as const,
  },
  CHAT: {
    currentStep: CHAT_STEPS.WELCOME,
    isTyping: false,
    quickReplies: [],
    conversationContext: {},
    pendingInputs: [],
    inputHistory: [],
    activeInputControl: null,
  },
} as const;

// Timeouts
export const TIMEOUTS = {
  TYPING_INDICATOR: 1000,
  AUTO_SAVE: 30000,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  PROPERTY_DATA: 'listez_property_data',
  USER_PREFERENCES: 'listez_user_preferences',
  CHAT_HISTORY: 'listez_chat_history',
  DRAFT_CONTENT: 'listez_draft_content',
} as const; 