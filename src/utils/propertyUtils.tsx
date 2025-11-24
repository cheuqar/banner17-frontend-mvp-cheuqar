import React from 'react';
import { Home, Apartment, Business } from '@mui/icons-material';

// Property interface for utility functions
interface Property {
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
  agent_name?: string;
  agent_phone?: string;
  inspection_times?: string[];
  listing_url?: string;
  images?: (string | { url: string; type?: string })[];
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  status?: string;
  distance_km?: number;
  distance_text?: string;
  [key: string]: any; // For additional properties
}

/**
 * Format a full address from property data
 */
export const formatFullAddress = (property: Property): string => {
  if (property.address) {
    return property.address;
  }
  
  const parts = [];
  
  // Add suburb if available
  if (property.suburb) {
    parts.push(property.suburb);
  }
  
  // Add state if available
  if (property.state) {
    parts.push(property.state);
  }
  
  // Add postcode if available
  if (property.postcode) {
    parts.push(property.postcode);
  }
  
  return parts.join(', ') || 'Address not available';
};

/**
 * Get property type icon based on property type
 */
export const getPropertyTypeIcon = (propertyType?: string) => {
  if (!propertyType) {
    return <Home sx={{ fontSize: 18, color: 'rgba(31, 170, 188, 0.8)' }} />;
  }
  
  const type = propertyType.toLowerCase();
  
  if (type.includes('apartment') || type.includes('unit') || type.includes('flat')) {
    return <Apartment sx={{ fontSize: 18, color: 'rgba(31, 170, 188, 0.8)' }} />;
  } else if (type.includes('townhouse') || type.includes('commercial') || type.includes('office')) {
    return <Business sx={{ fontSize: 18, color: 'rgba(31, 170, 188, 0.8)' }} />;
  } else {
    return <Home sx={{ fontSize: 18, color: 'rgba(31, 170, 188, 0.8)' }} />;
  }
};

/**
 * Get listing state (Sale, Rent, Sold, etc.)
 */
export const getListingState = (property: Property): string => {
  if (property.status) {
    const status = property.status.toLowerCase();
    if (status.includes('sold')) return 'Sold';
    if (status.includes('rent')) return 'Rent';
    if (status.includes('lease')) return 'Lease';
    if (status.includes('active') || status.includes('sale')) return 'Sale';
  }
  
  // Fallback to checking price display
  if (property.price_display) {
    const priceDisplay = property.price_display.toLowerCase();
    if (priceDisplay.includes('rent') || priceDisplay.includes('week') || priceDisplay.includes('month')) {
      return 'Rent';
    }
  }
  
  return 'Sale'; // Default to Sale
};

/**
 * Get property images array
 */
export const getPropertyImages = (property: Property): string[] => {
  if (property.images && Array.isArray(property.images)) {
    return property.images
      .map(img => {
        if (typeof img === 'string') {
          return img;
        } else if (img && typeof img === 'object' && img.url) {
          return img.url;
        }
        return null;
      })
      .filter((img): img is string => img !== null && img !== '');
  }
  
  // Check for single image properties
  if (property.primary_image) {
    return [property.primary_image];
  }
  
  // Return empty array if no images
  return [];
};

/**
 * Format price for display
 */
export const formatPrice = (price: number | string | undefined): string => {
  if (!price) return 'Price on Application';
  
  if (typeof price === 'string') {
    return price;
  }
  
  if (typeof price === 'number') {
    return `$${price.toLocaleString()}`;
  }
  
  return 'Price on Application';
};

/**
 * Check if property has valid coordinates for mapping
 */
export const hasValidCoordinates = (property: Property): boolean => {
  const lat = property.latitude || property.lat;
  const lng = property.longitude || property.lng;
  
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    !isNaN(lat) && 
    !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

/**
 * Get property coordinates
 */
export const getPropertyCoordinates = (property: Property): { lat: number; lng: number } | null => {
  const lat = property.latitude || property.lat;
  const lng = property.longitude || property.lng;
  
  if (hasValidCoordinates(property)) {
    return { lat: lat as number, lng: lng as number };
  }
  
  return null;
};

/**
 * Generate a unique property ID
 */
export const getPropertyId = (property: Property, index: number): string => {
  return property.id || `property-${index}`;
};
