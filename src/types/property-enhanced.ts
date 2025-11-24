/**
 * Enhanced Property types for Property Detail Dialog v2.0
 * These interfaces extend the existing Property interface used in PropertyDetailDialog
 * with additional fields for richer content display.
 */

// Base property interface matching the current API response structure
export interface BaseProperty {
  id?: string;
  title?: string;
  price?: string | number;
  price_display?: string;
  bedrooms?: number;
  bathrooms?: number;
  car_spaces?: number;
  carpark?: number;
  building_area?: number;
  floor_area?: number;
  land_area?: number;
  property_type?: string;
  propertyType?: string;
  description?: string;
  images?: (string | PropertyImage)[];
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  status?: string;
  distance_km?: number;
  distance_text?: string;
  latitude?: number;
  longitude?: number;
  listing_url?: string;
  [key: string]: any;
}

// Enhanced property interface with additional fields for richer content
export interface EnhancedProperty extends BaseProperty {
  // Agent Information
  agent_name?: string;
  agent_phone?: string;
  agent_email?: string;
  agent_company?: string;
  agent_photo?: string;
  agent_bio?: string;
  agent_specialties?: string[];
  agent_rating?: number;
  agent_reviews_count?: number;

  // Listing Details
  inspection_times?: string[] | InspectionTime[];
  auction_details?: AuctionDetails;
  listing_date?: string;
  source_url?: string;

  // Additional Metadata
  sale_method?: 'auction' | 'private_sale' | 'expression_of_interest';
  status_details?: string;
  availability_date?: string;
  year_built?: number;
  council_rates?: string;
  strata_fees?: string;

  // Rich Content
  features_detailed?: string[];
  neighborhood_info?: string;
  transport_info?: string;

  // Media arrays
  floorplans?: (string | PropertyImage)[];
  videos?: string[];
}

// Property image interface with enhanced metadata
export interface PropertyImage {
  url: string;
  alt?: string;
  caption?: string;
  type?: 'photo' | 'floorplan' | 'virtual_tour';
  thumbnail_url?: string;
}

// Inspection time interface with structured data
export interface InspectionTime {
  date: string;
  time_start: string;
  time_end: string;
  formatted_display: string;
  type?: 'open_house' | 'private' | 'auction';
}

// Auction details interface
export interface AuctionDetails {
  date?: string;
  time?: string;
  location?: string;
  auctioneer?: string;
  guide_price?: string;
  reserve_met?: boolean;
}

// Agent details interface for contact card
export interface AgentDetails {
  id?: string;
  name: string;
  phone?: string;
  mobile?: string;
  email?: string;
  company?: string;
  photo_url?: string;
  bio?: string;
  specialties?: string[];
  rating?: number;
  reviews_count?: number;
  website_url?: string;
  position?: string;
}

// Enhanced API response structure for property details
export interface PropertyDetailResponse {
  property: EnhancedProperty;
  agent?: AgentDetails;
  inspections?: InspectionTime[];
  nearby_properties?: EnhancedProperty[];
  market_insights?: MarketData;
}

// Market data interface for additional insights
export interface MarketData {
  median_price?: number;
  price_trend?: 'up' | 'down' | 'stable';
  days_on_market?: number;
  comparable_sales?: ComparableSale[];
}

// Comparable sale interface
export interface ComparableSale {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sold_date: string;
  distance_km: number;
}

// Contact action types for agent contact
export type ContactAction = 'phone' | 'email' | 'website';

// Property metadata for additional details card
export interface PropertyMetadata {
  // Building information
  year_built?: number;

  // Sales information
  sale_method?: string;
  listing_date?: string;
  modified_date?: string;
  sold_date?: string;
  availability_date?: string;

  // Financial information
  council_rates?: string;
  strata_fees?: string;
  bond?: number;
  weekly_rent?: number;
  price_guide_text?: string;
  sold_price?: number;

  // Listing information
  listing_url?: string;
  source_url?: string;
  source_system?: string;
  external_listing_id?: string;
  scraped_date?: string;
  data_quality_score?: number;

  // Property measurements
  land_area?: number;
  floor_area?: number;
  building_area?: number;

  // Location details
  location_accuracy?: string;
  country?: string;

  // Features and amenities
  features?: string[];
  tags?: string[];
  keywords?: string[];

  // Analytics
  views_count?: number;
  enquiries_count?: number;
  market_insights?: any;

  // Media counts
  images_count?: number;
  videos_count?: number;
  floorplans_count?: number;
  virtual_tours_count?: number;

  // Media links
  videos?: string[];
}

// Image display configuration for slideshow
export interface ImageDisplayConfig {
  showPreviews: boolean;
  showNavigation: boolean;
  previewCount?: number;
}

// Preview image for slideshow thumbnails
export interface PreviewImage {
  index: number;
  url: string;
  thumbnail_url?: string;
  alt?: string;
}

// Responsive layout configuration
export interface ResponsiveLayoutConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideScreen: boolean;
  contentMaxWidth: number | string;
  shouldCenterContent: boolean;
  slideshowFullWidth: boolean;
  dialogPadding: number;
  contentSpacing: number;
  slideshowHeight: number;
  showPreviewThumbnails: boolean;
  previewLayout: 'horizontal' | 'vertical';
  cardSpacing: number;
  useCompactCards: boolean;
  titleVariant: 'h4' | 'h5' | 'h6';
  priceVariant: 'h4' | 'h5' | 'h6';
}

// Error types for property data handling
export interface PropertyError {
  code: string;
  message: string;
  field?: string;
}

// Component prop types
export interface AgentContactCardProps {
  agent: AgentDetails | null;
  onContactClick: (method: ContactAction, value: string) => void;
  compact?: boolean;
}

export interface InspectionTimesCardProps {
  inspections: InspectionTime[];
  onScheduleReminder?: (inspection: InspectionTime) => void;
}

export interface PropertyMetadataCardProps {
  metadata: PropertyMetadata;
  onExternalLinkClick?: (url: string) => void;
}

export interface EnhancedImageSlideshowProps {
  images: PropertyImage[];
  floorplans?: PropertyImage[];
  currentIndex: number;
  onImageChange: (index: number) => void;
  showPreviews?: boolean;
  previewCount?: number;
  fullWidth?: boolean;
}

export interface ResponsiveLayoutProviderProps {
  children: React.ReactNode;
}

// Utility function types
export type PropertyDataValidator = (property: any) => EnhancedProperty;
export type PhoneNumberFormatter = (phone?: string) => string | undefined;
export type InspectionTimeParser = (times?: any[]) => InspectionTime[];
export type ImageProcessor = (images: any[]) => PropertyImage[];