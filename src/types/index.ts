// Core Types for Listez Chatbot App

// User Types
export interface User {
  id: string | null;
  profile: UserProfile | null;
  preferences: UserPreferences;
  isAuthenticated: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface UserPreferences {
  panelLayout: string;
  customLayouts: Layout[];
  preferredInputTypes: Record<string, string>;
  assistanceLevel: 'full' | 'minimal' | 'none';
}

// Property Types
export interface Property {
  id: string | null;
  address: PropertyAddress;
  media: PropertyMedia;
  details: PropertyDetails;
  analysis: PropertyAnalysis;
  pricing: PropertyPricing;
  content: PropertyContent;
  status: 'draft' | 'analyzing' | 'complete' | 'published';
}

export interface PropertyAddress {
  formatted: string;
  components: Record<string, string>;
  coordinates: { lat: number; lng: number };
  validationStatus: 'pending' | 'valid' | 'invalid';
  confidence: number;
}

export interface PropertyMedia {
  photos: MediaFile[];
  videos: MediaFile[];
  uploadProgress: Record<string, number>;
  analysisResults: Record<string, any>;
  thumbnails: string[];
}

export interface MediaFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: Date;
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'error';
}

export interface PropertyDetails {
  type: string;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  condition: string;
  age: number;
  description: string;
  customFeatures: string[];
}

export interface PropertyAnalysis {
  aiInsights: Record<string, any>;
  extractedFeatures: string[];
  confidence: number;
  userConfirmations: Record<string, boolean>;
  corrections: string[];
}

export interface PropertyPricing {
  suggestedRange: { min: number; max: number };
  factors: PricingFactor[];
  comparables: ComparableProperty[];
  marketTrends: Record<string, any>;
  selectedStrategy: string;
  userAdjustments: Record<string, number>;
}

export interface PricingFactor {
  name: string;
  impact: number;
  description: string;
}

export interface ComparableProperty {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  soldDate: Date;
  distance: number;
}

export interface PropertyContent {
  descriptions: string[];
  highlights: string[];
  selectedStyle: 'professional' | 'casual' | 'luxury';
  userEdits: string[];
  versions: ContentVersion[];
}

export interface ContentVersion {
  id: string;
  content: string;
  createdAt: Date;
  type: 'ai-generated' | 'user-edited';
}

// Chat Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  message_metadata?: {
    render_instruction?: {
      type: string;
      title?: string;
      subtitle?: string;
      items?: any[];
      active_filters?: Record<string, string>;
      spatial_context?: {
        search_address?: string;
        center_lat?: number;
        center_lng?: number;
        radius_km?: number;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  
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
  
  // Preserved queryable data objects (NEW)
  data_objects?: {
    properties?: Property[];           // Full property objects with coordinates
    amenities?: Amenity[];           // Amenity search results  
    spatial_data?: {                 // Geographic/coordinate data
      coordinates: { lat: number; lng: number; label: string }[];
      bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } };
      center?: { lat: number; lng: number };
    };
    aggregations?: {                 // Analysis results
      count: number;
      filters_applied: any;
      sort_order: any;
      statistics?: Record<string, number>;
    };
    query_context?: {                // Query metadata
      filters: any;
      sort: any;
      scope: 'user' | 'public';
      tool_used: string;
      timestamp: string;
    };
  };
  
  // Additional structured data
  mapData?: {
    properties: any[];
    title?: string;
    center?: { lat: number; lng: number };
  };
  
  langGraphExecution?: {
    trace: any[];
    total_duration_ms: number;
    total_tokens_in: number;
    total_tokens_out: number;
    total_estimated_cost: number;
    architecture: string;
  };
  
  externalSources?: {
    id: string;
    title: string;
    url: string;
    snippet?: string;
  }[];
  
  // Message state
  streaming?: boolean;
  isError?: boolean;
  originalUserMessage?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  currentStep: string;
  isTyping: boolean;
  quickReplies: string[];
  conversationContext: Record<string, any>;
  pendingInputs: string[];
  inputHistory: string[];
  activeInputControl: string | null;
}

// UI Types
export interface Layout {
  id: string;
  name: string;
  panelConfiguration: string;
  customLayouts: PanelLayout[];
  panelStates: Record<string, PanelState>;
  panelSizes: Record<string, { width: number; height: number }>;
  panelPositions: Record<string, { x: number; y: number }>;
  minimizedPanels: string[];
}

export interface PanelLayout {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
}

export interface PanelState {
  visible: boolean;
  minimized: boolean;
  data: Record<string, any>;
}

// Location Types
export interface LocationData {
  currentLocation: { lat: number; lng: number } | null;
  nearbyAmenities: Amenity[];
  marketData: Record<string, any>;
  comparableProperties: ComparableProperty[];
  schoolDistricts: SchoolDistrict[];
  transportLinks: TransportLink[];
  demographics: Record<string, any>;
}

export interface Amenity {
  id: string;
  name: string;
  type: string;
  distance: number;
  rating: number;
  address: string;
}

export interface SchoolDistrict {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  rating: number;
  distance: number;
}

export interface TransportLink {
  id: string;
  type: 'bus' | 'train' | 'tram';
  name: string;
  distance: number;
  frequency: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GeminiAnalysisRequest {
  mediaUrls: string[];
  propertyType?: string;
  existingData?: Partial<Property>;
}

export interface GeminiAnalysisResponse {
  extractedFeatures: string[];
  propertyCondition: string;
  suggestedDescription: string;
  confidence: number;
  insights: Record<string, any>;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Re-export Buyer Profile types
export * from './buyerProfile'; 