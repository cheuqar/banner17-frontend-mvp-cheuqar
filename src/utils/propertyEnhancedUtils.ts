/**
 * Utility functions for enhanced property data processing
 * Handles data validation, transformation, and formatting
 */

import type {
  EnhancedProperty,
  BaseProperty,
  PropertyImage,
  InspectionTime,
  AgentDetails,
  PropertyMetadata,
  ImageDisplayConfig,
  PreviewImage,
  PropertyDataValidator,
  PhoneNumberFormatter,
  InspectionTimeParser,
  ImageProcessor,
} from '../types/property-enhanced';

/**
 * Validate and transform property data from API response
 */
export const validateAndTransformProperty: PropertyDataValidator = (property: any): EnhancedProperty => {
  return {
    ...property,
    agent_phone: formatPhoneNumber(property.agent_phone),
    inspection_times: parseInspectionTimes(property.inspection_times),
    images: processImages(property.images),
  };
};

/**
 * Format Australian phone numbers for display
 */
export const formatPhoneNumber: PhoneNumberFormatter = (phone?: string): string | undefined => {
  if (!phone) return undefined;

  // Remove any non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Australian phone number formatting
  if (cleaned.startsWith('+61')) {
    const number = cleaned.slice(3);
    if (number.length >= 9) {
      return `+61 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5)}`;
    }
  } else if (cleaned.startsWith('04') && cleaned.length === 10) {
    // Mobile number
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Landline number
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }

  return phone; // Return original if formatting fails
};

/**
 * Parse inspection times from various formats
 */
export const parseInspectionTimes: InspectionTimeParser = (times?: any[]): InspectionTime[] => {
  if (!Array.isArray(times)) return [];

  return times.map((time, index) => {
    if (typeof time === 'string') {
      return {
        formatted_display: time,
        date: extractDateFromString(time),
        time_start: extractTimeStartFromString(time),
        time_end: extractTimeEndFromString(time),
      };
    }

    if (typeof time === 'object' && time !== null) {
      return {
        date: time.date || '',
        time_start: time.time_start || time.start_time || '',
        time_end: time.time_end || time.end_time || '',
        formatted_display: time.formatted_display || formatInspectionTime(time),
        type: time.type || 'open_house',
      };
    }

    return {
      formatted_display: 'Time TBA',
      date: '',
      time_start: '',
      time_end: '',
    };
  });
};

/**
 * Process images to ensure consistent PropertyImage format
 */
export const processImages: ImageProcessor = (images: any[]): PropertyImage[] => {
  if (!Array.isArray(images)) return [];

  const processedImages: PropertyImage[] = [];

  for (let index = 0; index < images.length; index++) {
    const img = images[index];

    if (typeof img === 'string') {
      processedImages.push({
        url: img,
        alt: `Property image ${index + 1}`,
      });
    } else if (typeof img === 'object' && img !== null && img.url) {
      processedImages.push({
        url: img.url,
        alt: img.alt || `Property image ${index + 1}`,
        caption: img.caption,
        type: img.type || 'photo',
        thumbnail_url: img.thumbnail_url,
      });
    }
  }

  return processedImages;
};

/**
 * Extract date from inspection string
 */
const extractDateFromString = (inspection: string): string => {
  // Match patterns like "Sat 14 Dec", "Saturday 14th December", etc.
  const datePatterns = [
    /(\w{3,9}\s+\d{1,2}(?:st|nd|rd|th)?\s+\w{3,9})/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
  ];

  for (const pattern of datePatterns) {
    const match = inspection.match(pattern);
    if (match) return match[1];
  }

  return '';
};

/**
 * Extract start time from inspection string
 */
const extractTimeStartFromString = (inspection: string): string => {
  const timeMatch = inspection.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
  return timeMatch ? timeMatch[1] : '';
};

/**
 * Extract end time from inspection string
 */
const extractTimeEndFromString = (inspection: string): string => {
  const timeMatch = inspection.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
  return timeMatch ? timeMatch[2] : '';
};

/**
 * Format inspection time object for display
 */
const formatInspectionTime = (inspection: any): string => {
  const parts = [];

  if (inspection.date) {
    parts.push(inspection.date);
  }

  if (inspection.time_start && inspection.time_end) {
    parts.push(`${inspection.time_start} - ${inspection.time_end}`);
  } else if (inspection.time_start) {
    parts.push(`from ${inspection.time_start}`);
  }

  return parts.join(' • ') || 'Time TBA';
};

/**
 * Create agent details object from property data
 */
export const createAgentDetails = (property: EnhancedProperty): AgentDetails | null => {
  if (!property.agent_name) return null;

  return {
    name: property.agent_name,
    phone: property.agent_phone || property.agent_mobile, // Use mobile as fallback
    email: property.agent_email,
    company: property.agent_company || property.agency_name,
    photo_url: property.agent_photo,
    bio: property.agent_bio,
    specialties: property.agent_specialties,
    rating: property.agent_rating,
    reviews_count: property.agent_reviews_count,
    // Additional fields from enhanced API
    mobile: property.agent_mobile,
    position: property.agent_position,
    website_url: property.agent_url,
  };
};

/**
 * Create property metadata object from property data
 */
export const createPropertyMetadata = (property: EnhancedProperty): PropertyMetadata => {
  return {
    // Building information
    year_built: property.year_built,

    // Sales information
    sale_method: property.sale_method,
    listing_date: property.listing_date,
    modified_date: property.modified_date,
    sold_date: property.sold_date,
    availability_date: property.availability_date,

    // Financial information
    council_rates: property.council_rates,
    strata_fees: property.strata_fees,
    bond: property.bond,
    weekly_rent: property.weekly_rent,
    price_guide_text: property.price_guide_text,
    sold_price: property.sold_price,

    // Listing information
    listing_url: property.listing_url,
    source_url: property.source_url,
    source_system: property.source_system,
    external_listing_id: property.external_listing_id,
    scraped_date: property.scraped_date,
    data_quality_score: property.data_quality_score,

    // Property measurements
    land_area: property.land_area,
    floor_area: property.floor_area,
    building_area: property.building_area,

    // Location details
    location_accuracy: property.location_accuracy,
    country: property.country,

    // Features and amenities
    features: property.features,
    tags: property.tags,
    keywords: property.keywords,

    // Analytics
    views_count: property.views_count,
    enquiries_count: property.enquiries_count,
    market_insights: property.market_insights,

    // Media counts (calculated from arrays)
    images_count: property.images?.length || 0,
    videos_count: property.videos?.length || 0,
    floorplans_count: property.floorplans?.length || 0,
    virtual_tours_count: property.virtual_tours?.length || 0,

    // Media links
    videos: property.videos,
  };
};

/**
 * Get image display configuration based on image count
 */
export const getImageDisplayConfig = (imageCount: number): ImageDisplayConfig => {
  if (imageCount <= 1) {
    return {
      showPreviews: false,
      showNavigation: false,
    };
  } else if (imageCount === 2) {
    return {
      showPreviews: true,
      showNavigation: true,
      previewCount: 1,
    };
  } else {
    return {
      showPreviews: true,
      showNavigation: true,
      previewCount: 2,
    };
  }
};

/**
 * Generate preview images for slideshow
 */
export const getPreviewImages = (
  images: PropertyImage[],
  currentIndex: number,
  previewCount: number
): PreviewImage[] => {
  if (images.length <= 1) return [];

  const previews: PreviewImage[] = [];
  const totalImages = images.length;
  const maxPreviews = Math.min(previewCount, totalImages - 1);

  for (let i = 0; i < maxPreviews; i++) {
    // Calculate preview indices (show next images, wrapping around)
    const previewIndex = (currentIndex + i + 1) % totalImages;
    const image = images[previewIndex];

    previews.push({
      index: previewIndex,
      url: image.url,
      thumbnail_url: image.thumbnail_url,
      alt: image.alt,
    });
  }

  return previews;
};

/**
 * Check if property has valid enhanced data
 */
export const hasEnhancedData = (property: EnhancedProperty): boolean => {
  return Boolean(
    property.agent_name ||
    property.agent_phone ||
    property.inspection_times?.length ||
    property.year_built ||
    property.council_rates ||
    property.strata_fees
  );
};

/**
 * Convert base property to enhanced property with defaults
 */
export const enhanceProperty = (baseProperty: any): EnhancedProperty => {
  return {
    ...baseProperty,
    images: processImages(baseProperty.images || []),
    inspection_times: parseInspectionTimes(baseProperty.inspection_times || []),
  };
};

/**
 * Validate image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Generate fallback image URL
 */
export const getFallbackImageUrl = (type: 'main' | 'thumbnail' = 'main'): string => {
  return type === 'thumbnail'
    ? '/placeholder-property-thumb.jpg'
    : '/placeholder-property.jpg';
};

/**
 * Format property price for display
 */
export const formatPropertyPrice = (property: EnhancedProperty): string => {
  if (property.price_display) {
    return property.price_display;
  }

  if (property.price) {
    const price = typeof property.price === 'number'
      ? property.price
      : parseFloat(property.price.toString().replace(/[^\d.]/g, ''));

    if (!isNaN(price)) {
      return `$${price.toLocaleString()}`;
    }
  }

  return 'Price on Application';
};