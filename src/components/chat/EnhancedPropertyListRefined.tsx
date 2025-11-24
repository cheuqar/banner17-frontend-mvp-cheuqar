import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Modal,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import PropertyMap from '../maps/PropertyMap';
import GraceIsaacTransitionDialog from './GraceIsaacTransitionDialog';
import PropertyDetailDialogEnhanced from '../property/PropertyDetailDialogEnhanced';
import PropertyDetailOverlay from '../property/PropertyDetailOverlay';
import {
  Home,
  Apartment,
  Villa,
  Business,
  Bed,
  Bathtub,
  DriveEta,
  Square,
  Landscape,
  FilterList,
  ViewList,
  Map as MapIcon,
  Close,
  AutoAwesome,
  BookmarkBorder,
  Bookmark,
  Block,
  ContactPhone,
  CalendarToday,
  Launch,
  LocationOn,
  ChevronLeft,
  ChevronRight,
  GridView,
  MoreHoriz
} from '@mui/icons-material';

import { globalHoverManager } from '../../utils/globalHoverManager';

interface PropertyItem {
  id?: string;
  address?: string;
  full_address?: string;
  title?: string;
  price?: string | number;
  price_display?: string;
  bedrooms?: number;
  bathrooms?: number;
  car_spaces?: number;
  carpark?: number;
  propertyType?: string;
  property_type?: string;
  building_area?: number;
  floor_area?: number;
  land_area?: number;
  status?: string;
  listing_type?: string;
  listing_url?: string;
  images?: (string | { url: string; type?: string })[];  // Support both string and object formats
  primary_image?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number; // Distance from search location
  distance_text?: string; // Formatted distance text (e.g., "5.7km away")
  [key: string]: any;
}

interface EnhancedPropertyListRefinedProps {
  properties: PropertyItem[];
  title?: string;
  subtitle?: string;
  activeFilters?: Record<string, any>;
  spatialContext?: Record<string, any>;
  onSendToAI?: (selectedProperties: PropertyItem[], message: string) => void;
  onCreatePropertyDrillSession?: (property: PropertyItem) => void;
}

type ViewMode = 'list' | 'map' | 'cards';

// Enhancement #2: Amenity Info Header Component
interface AmenityInfoHeaderProps {
  amenity: {
    name: string;
    address?: string;
    suburb?: string;
    category: string;
    metadata?: {
      catchment_level?: string;
      school_metadata?: {
        gender?: string;
        selective_school?: string;
        subtype?: string;
      };
    };
  };
}

const AmenityInfoHeader: React.FC<AmenityInfoHeaderProps> = ({ amenity }) => {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      schools: '🏫',
      hospitals: '🏥',
      libraries: '📚',
      shopping: '🛒',
      shopping_malls: '🛒',
      universities: '🎓',
      tourist_attractions: '🗺️',
      beaches: '🏖️',
      sports_recreation: '⚽'
    };
    return icons[category] || '📍';
  };

  const getSchoolTags = () => {
    const tags: string[] = [];

    if (amenity.metadata?.catchment_level) {
      const level = amenity.metadata.catchment_level;
      tags.push(`${level.charAt(0).toUpperCase() + level.slice(1)} School`);
    }

    if (amenity.metadata?.school_metadata?.subtype) {
      tags.push(amenity.metadata.school_metadata.subtype);
    }

    if (amenity.metadata?.school_metadata?.selective_school) {
      const selective = amenity.metadata.school_metadata.selective_school;
      if (selective !== 'Not Selective') {
        tags.push(selective);
      }
    }

    if (amenity.metadata?.school_metadata?.gender) {
      const gender = amenity.metadata.school_metadata.gender;
      tags.push(gender.charAt(0).toUpperCase() + gender.slice(1));
    }

    return tags;
  };

  return (
    <Paper
      sx={{
        bgcolor: '#f8f9fa',
        borderBottom: '2px solid #e0e0e0',
        p: 2,
        mb: 2,
        borderRadius: '8px'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Typography sx={{ fontSize: '24px' }}>
          {getCategoryIcon(amenity.category)}
        </Typography>
        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#333' }}>
          {amenity.name}
        </Typography>
      </Box>
      {(amenity.address || amenity.suburb) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOn sx={{ fontSize: '16px', color: '#666' }} />
          <Typography sx={{ fontSize: '14px', color: '#666' }}>
            {amenity.address || ''}{amenity.address && amenity.suburb ? ', ' : ''}{amenity.suburb || ''}
          </Typography>
        </Box>
      )}
      {amenity.category === 'schools' && getSchoolTags().length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {getSchoolTags().map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              sx={{
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                fontSize: '13px',
                height: '24px'
              }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

const EnhancedPropertyListRefined: React.FC<EnhancedPropertyListRefinedProps> = ({
  properties = [],
  title,
  subtitle,
  spatialContext,
  activeFilters = {},
  onSendToAI,
  onCreatePropertyDrillSession
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState<number>(0);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Set<string>>(new Set());
  const [ignoredProperties, setIgnoredProperties] = useState<Set<string>>(new Set());
  const [graceIsaacDialogOpen, setGraceIsaacDialogOpen] = useState<boolean>(false);
  const [graceIsaacProperty, setGraceIsaacProperty] = useState<PropertyItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
  // Scroll navigation state
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate unique identifier for this component instance
  const instanceId = useRef(`property-list-${Math.random().toString(36).substr(2, 9)}`).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear this instance from global manager on unmount
      globalHoverManager.clearHover(instanceId);
    };
  }, [instanceId]);

  // Image URL extraction helper - handles both string and object formats
  const extractImageUrl = (image?: string | { url: string; type?: string }): string | null => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (typeof image === 'object' && image.url) return image.url;
    return null;
  };

  // Get all images from property - robust extraction
  const getPropertyImages = (property: PropertyItem): string[] => {
    const images: string[] = [];
    
    // First try primary_image
    if (property.primary_image) {
      images.push(property.primary_image);
    }
    
    // Then extract from images array
    if (property.images && Array.isArray(property.images)) {
      for (const image of property.images) {
        const url = extractImageUrl(image);
        if (url && !images.includes(url)) {
          images.push(url);
        }
      }
    }
    
    return images;
  };

  // Get cover image (first available image)
  const getCoverImage = (property: PropertyItem): string | null => {
    const images = getPropertyImages(property);
    return images.length > 0 ? images[0] : null;
  };

  // Scroll navigation functions
  const checkScrollArrows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isScrollable = scrollWidth > clientWidth;
    
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(isScrollable && scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const cardWidth = 280 + 24; // Card width + gap
    container.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const cardWidth = 280 + 24; // Card width + gap
    container.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
  };

  // Check scroll arrows on mount and when properties change
  useEffect(() => {
    checkScrollArrows();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollArrows);
      window.addEventListener('resize', checkScrollArrows);
      return () => {
        container.removeEventListener('scroll', checkScrollArrows);
        window.removeEventListener('resize', checkScrollArrows);
      };
    }
  }, [properties]);

  // Property type icon helper
  const getPropertyTypeIcon = (type?: string) => {
    if (!type) return <Home />;
    const lowerType = type.toLowerCase();
    if (lowerType.includes('apartment') || lowerType.includes('unit')) return <Apartment />;
    if (lowerType.includes('house') || lowerType.includes('villa')) return <Villa />;
    if (lowerType.includes('commercial') || lowerType.includes('office')) return <Business />;
    return <Home />;
  };

  // Format helpers
  const formatPrice = (price?: string | number) => {
    if (!price) return 'Price on request';
    if (typeof price === 'string') return price;
    return `$${price.toLocaleString()}`;
  };

  const formatFullAddress = (property: PropertyItem) => {
    return property.full_address || property.address || property.title || 'Address not available';
  };

  const getListingState = (property: PropertyItem) => {
    const status = property.status?.toLowerCase();
    const type = property.listing_type?.toLowerCase();
    
    if (status === 'sold') return 'Sold';
    if (type === 'rent' || type === 'rental') return 'Rent';
    return 'Sale';
  };

  // Active filters count
  const activeFilterCount = Object.keys(activeFilters).length;

  // Map data preparation with spatial search center marker support
  const mapData = useMemo(() => {
    const validProperties = properties.filter(property => 
      property.latitude && 
      property.longitude && 
      !isNaN(Number(property.latitude)) && 
      !isNaN(Number(property.longitude))
    );

    const mappedProperties = validProperties.map(property => ({
      id: property.id || '',
      address: formatFullAddress(property),
      price: String(property.price_display || property.price || ''),
      status: property.status || 'active',
      latitude: Number(property.latitude),
      longitude: Number(property.longitude),
      property_type: property.property_type || '',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      parking_spaces: property.parking_spaces || 0,
      // Add distance display for spatial searches
      distance_text: property.distance_text || (property.distance_km ? `${property.distance_km.toFixed(1)}km away` : undefined)
    }));

    // Create reference points for spatial searches
    let referencePoints: Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      type: 'reference_point';
    }> = [];

    // Check if this is a spatial search by looking for spatial context in activeFilters
    if (activeFilters) {
      // Extract spatial search center from active filters or property data
      const spatialLocation = activeFilters['Location'];
      let centerLat: number | undefined;
      let centerLng: number | undefined;
      let centerName = 'Search Center';

      // Try to extract center coordinates from spatial context first, then fallback to other sources
      if (spatialContext?.center_lat && spatialContext?.center_lng) {
        centerLat = Number(spatialContext.center_lat);
        centerLng = Number(spatialContext.center_lng);
        centerName = spatialContext.search_address || spatialLocation || 'Search Center';
      } else if (spatialLocation && spatialLocation.includes('km of ')) {
        // Extract location name from "Within 5km of Sydney Opera House"
        const match = spatialLocation.match(/Within \d+km of (.+)/);
        if (match) {
          centerName = match[1];
        }
      }

      // Add center marker for spatial searches
      if (centerLat && centerLng && !isNaN(centerLat) && !isNaN(centerLng)) {
        referencePoints.push({
          id: 'search-center',
          name: centerName,
          latitude: centerLat,
          longitude: centerLng,
          type: 'reference_point'
        });
      }
    }

    return {
      validProperties,
      properties: mappedProperties,
      referencePoints
    };
  }, [properties, activeFilters, spatialContext]);

  // Calculate container height - show at least 5 items with buffer
  const calculateContainerHeight = () => {
    const itemHeight = 80; // Approximate height of each compact item
    const minItems = 5;
    const buffer = 20;
    
    if (properties.length <= minItems) {
      return 'auto';
    }
    return (minItems * itemHeight) + buffer;
  };

  // Handle view mode change
  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Handle filter menu
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  // QUICK TOGGLE: Set to false to revert to window.open behaviour everywhere
  // To switch back globally without env vars, change this to false and keep code below.
  const USE_POPUP_OVERLAY = true;

  // Lazy load full property details for overlay using the same public endpoint
  const lazyLoadProperty = async (propertyId: string) => {
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const url = `${API_BASE}/api/v1/public/properties/${propertyId}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to load property ${propertyId}: ${resp.status} ${text}`);
      }
      const data = await resp.json();
      return data as any;
    } catch (e) {
      // Fallback: return the currently selected property if available
      console.error('💥 [Property LazyLoad] Error loading property details:', e);
      const fallback = properties.find(p => String(p.id) === String(propertyId));
      return (fallback || null) as any;
    }
  };

  // Handle property click - default opens popup overlay, ctrl/cmd opens new tab
  const openProperty = (property: PropertyItem, index: number, evt?: React.MouseEvent<any>) => {
    const metaOpen = evt?.metaKey || evt?.ctrlKey;
    if (!USE_POPUP_OVERLAY || metaOpen) {
      if (property?.id) {
        window.open(`/property/detail/${property.id}`, '_blank');
      }
      return;
    }
    setSelectedProperty(property);
    setCurrentPropertyIndex(index);
    setCurrentImageIndex(0);
  };

  // Close modal
  const closeModal = () => {
    setSelectedProperty(null);
    setCurrentPropertyIndex(0);
    setCurrentImageIndex(0);
  };

  // Navigate to previous property
  const navigateToPrevious = () => {
    if (currentPropertyIndex > 0) {
      const newIndex = currentPropertyIndex - 1;
      setCurrentPropertyIndex(newIndex);
      setSelectedProperty(properties[newIndex]);
      setCurrentImageIndex(0); // Reset to first image when changing property
    }
  };

  // Navigate to next property
  const navigateToNext = () => {
    if (currentPropertyIndex < properties.length - 1) {
      const newIndex = currentPropertyIndex + 1;
      setCurrentPropertyIndex(newIndex);
      setSelectedProperty(properties[newIndex]);
      setCurrentImageIndex(0); // Reset to first image when changing property
    }
  };

  // Navigate to previous image in slideshow
  const navigateToPreviousImage = () => {
    if (selectedProperty) {
      const images = getPropertyImages(selectedProperty);
      if (images.length > 1 && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      }
    }
  };

  // Navigate to next image in slideshow
  const navigateToNextImage = () => {
    if (selectedProperty) {
      const images = getPropertyImages(selectedProperty);
      if (images.length > 1 && currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
    }
  };

  // Handle property actions
  const handleBookmarkToggle = (property: PropertyItem) => {
    const propertyId = property.id || '';
    setBookmarkedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleIgnoreToggle = (property: PropertyItem) => {
    const propertyId = property.id || '';
    setIgnoredProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleAskFollowUp = (property: PropertyItem) => {
    setGraceIsaacProperty(property);
    setGraceIsaacDialogOpen(true);
    closeModal();
  };

  const handleStartDrillSession = async (property: PropertyItem) => {
    console.log('🚀 handleStartDrillSession called with property:', property);
    
    if (onCreatePropertyDrillSession) {
      try {
        console.log('✅ Calling onCreatePropertyDrillSession...');
        await onCreatePropertyDrillSession(property);
        console.log('✅ Property drill session created successfully');
        
        // Close the Grace-Isaac dialog after starting the session
        setGraceIsaacDialogOpen(false);
        console.log('✅ Grace-Isaac dialog closed');
      } catch (error) {
        console.error('❌ Error creating property drill session:', error);
        setGraceIsaacDialogOpen(false);
      }
    } else {
      console.warn('⚠️ onCreatePropertyDrillSession is not available');
    }
  };

  const handleHoldAndReturn = () => {
    // User chose to hold and return to exploration
    // Just close the dialog - they stay in the current session
  };

  const handleOpenListing = (property: PropertyItem) => {
    if (property.listing_url) {
      window.open(property.listing_url, '_blank');
    }
  };

  // Enhanced Property Modal Component with SLEEK Design Philosophy and Navigation
  const renderPropertyModal = () => {
    if (!selectedProperty) return null;
    const property = selectedProperty;
    const images = getPropertyImages(property);
    const currentImage = images[currentImageIndex] || null;
    const listingState = getListingState(property);
    const hasMultipleImages = images.length > 1;

    return (
      <Modal
        open={!!selectedProperty}
        onClose={closeModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            width: '90vw',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            
            // SLEEK Design System
            bgcolor: 'rgba(255, 255, 255, 0.98)', // Semi-transparent white
            backdropFilter: 'blur(20px)', // Enhanced glass effect  
            borderRadius: '24px', // Smooth rounded corners
            border: '1px solid rgba(31, 170, 188, 0.15)', // Subtle brand border
            boxShadow: '0 20px 60px rgba(31, 170, 188, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12)', // Premium shadow
            fontFamily: 'var(--font-secondary)',
            
            // Custom scrollbar for SLEEK appearance
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(31, 170, 188, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                bgcolor: 'rgba(31, 170, 188, 0.3)',
              }
            }
          }}
        >
        {/* Only render content when property exists */}
        {property && (
          <>
            {/* Header with Navigation and Close Button */}
            <Box sx={{ position: 'relative', p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Left Navigation Arrow */}
              <IconButton
                onClick={navigateToPrevious}
                disabled={currentPropertyIndex === 0}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'transparent',
                  border: '1px solid rgba(31, 170, 188, 0.2)',
                  color: 'rgba(31, 170, 188, 0.8)',
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    bgcolor: 'rgba(31, 170, 188, 0.08)',
                    border: '1px solid rgba(31, 170, 188, 0.4)',
                    color: '#0d2b2c',
                    transform: 'translateX(-2px)'
                  },
                  '&:disabled': {
                    opacity: 0.3,
                    cursor: 'not-allowed'
                  }
                }}
              >
                <ChevronLeft sx={{ fontSize: 20 }} />
              </IconButton>

              {/* Property Counter */}
              <Typography variant="body2" sx={{ 
                color: 'rgba(31, 170, 188, 0.8)',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}>
                {currentPropertyIndex + 1} of {properties.length}
              </Typography>

              {/* Right Navigation Arrow */}
              <IconButton
                onClick={navigateToNext}
                disabled={currentPropertyIndex === properties.length - 1}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'transparent',
                  border: '1px solid rgba(31, 170, 188, 0.2)',
                  color: 'rgba(31, 170, 188, 0.8)',
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    bgcolor: 'rgba(31, 170, 188, 0.08)',
                    border: '1px solid rgba(31, 170, 188, 0.4)',
                    color: '#0d2b2c',
                    transform: 'translateX(2px)'
                  },
                  '&:disabled': {
                    opacity: 0.3,
                    cursor: 'not-allowed'
                  }
                }}
              >
                <ChevronRight sx={{ fontSize: 20 }} />
              </IconButton>

              {/* Navigation and Close Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                {/* Close Button with Text */}
                <Button
                  onClick={closeModal}
                  variant="outlined"
                  size="small"
                  sx={{
                    color: 'rgba(31, 170, 188, 0.8)',
                    borderColor: 'rgba(31, 170, 188, 0.2)',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    px: 2,
                    py: 0.5,
                    '&:hover': {
                      bgcolor: 'rgba(31, 170, 188, 0.08)',
                      borderColor: 'rgba(31, 170, 188, 0.4)',
                      color: '#0d2b2c'
                    }
                  }}
                >
                  Close
                </Button>
              </Box>
            </Box>

        {/* Cover Photo Section with Slideshow */}
        {currentImage && (
          <Box sx={{ m: 2, mb: 1 }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={currentImage}
                alt={formatFullAddress(property)}
                sx={{
                  width: '100%',
                  height: 220,
                  objectFit: 'cover',
                  borderRadius: '12px', // SLEEK: Consistent border radius
                  border: '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: Subtle image border
                }}
              />
              
              {/* Status Badge - Top Left */}
              <Chip
                label={listingState}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  bgcolor: listingState === 'Sold' ? 'rgba(158, 158, 158, 0.9)' : 
                          listingState === 'Rent' ? 'rgba(31, 170, 188, 0.9)' : 
                          'rgba(76, 175, 80, 0.9)', // SLEEK: Semi-transparent backgrounds
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  backdropFilter: 'blur(4px)', // SLEEK: Glass effect
                  border: 'none'
                }}
              />
              
              {/* Image Counter - Top Right */}
              {hasMultipleImages && (
                <Chip
                  label={`${currentImageIndex + 1} of ${images.length}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(4px)',
                    border: 'none'
                  }}
                />
              )}
              
              {/* Left Navigation Arrow */}
              {hasMultipleImages && currentImageIndex > 0 && (
                <IconButton
                  onClick={navigateToPreviousImage}
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      transform: 'translateY(-50%) translateX(-2px)'
                    }
                  }}
                >
                  <ChevronLeft sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              
              {/* Right Navigation Arrow */}
              {hasMultipleImages && currentImageIndex < images.length - 1 && (
                <IconButton
                  onClick={navigateToNextImage}
                  sx={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      transform: 'translateY(-50%) translateX(2px)'
                    }
                  }}
                >
                  <ChevronRight sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Box>
            
            {/* Price Below Cover Photo */}
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: listingState === 'Sold' ? 'text.secondary' : '#0d2b2c',
                fontSize: '1.3rem',
                textAlign: 'center'
              }}>
                {formatPrice(property.price || property.price_display)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Content Section */}
        <Box sx={{ px: 3, py: 2 }}>
          {/* Ask Follow Up Button - SLEEK Design */}
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={() => handleAskFollowUp(property)}
            fullWidth
            sx={{
              mb: 3,
              bgcolor: '#0d2b2c', // SLEEK: Clean brand color
              color: 'white',
              py: 1.5,
              borderRadius: '12px', // SLEEK: Consistent border radius
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none', // SLEEK: Natural case
              boxShadow: '0 4px 12px rgba(31, 170, 188, 0.3)', // SLEEK: Brand shadow
              border: '1px solid rgba(31, 170, 188, 0.2)', // SLEEK: Subtle border
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#1899a8', // SLEEK: Slightly darker on hover
                boxShadow: '0 6px 16px rgba(31, 170, 188, 0.4)',
                transform: 'translateY(-1px)' // SLEEK: Subtle lift effect
              }
            }}
          >
            Ask Follow Up
          </Button>

          {/* Property Header */}
          <Box sx={{ mb: 2 }}>
            {/* Property Type */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ 
                color: '#0d2b2c', // SLEEK: Brand color for icon
                display: 'flex',
                alignItems: 'center'
              }}>
                {getPropertyTypeIcon(property.propertyType || property.property_type)}
              </Box>
              <Typography variant="body2" sx={{ 
                color: '#0d2b2c', // SLEEK: Brand color
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'capitalize'
              }}>
                {property.propertyType || property.property_type || 'Property'}
              </Typography>
            </Box>
            
            {/* Address with inline distance */}
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              fontSize: '1.1rem',
              lineHeight: 1.3,
              mb: 1
            }}>
              {formatFullAddress(property)}
              {(property.distance_km || property.distance_text) && (
                <Typography component="span" sx={{ 
                  color: 'error.main', 
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  ml: 1
                }}>
                  • {property.distance_text || (property.distance_km ? `${property.distance_km.toFixed(1)}km away` : '')}
                </Typography>
              )}
            </Typography>

            {/* Property Description */}
            {property.description && (
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                lineHeight: 1.4,
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {property.description}
              </Typography>
            )}
          </Box>

          {/* Property Specifications Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', 
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: 'rgba(31, 170, 188, 0.04)', // SLEEK: Very subtle brand background
            borderRadius: '12px',
            border: '1px solid rgba(31, 170, 188, 0.1)' // SLEEK: Subtle border
          }}>
            {property.bedrooms && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 0.5 
              }}>
                <Bed sx={{ fontSize: 20, color: 'rgba(31, 170, 188, 0.8)' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {property.bedrooms}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  Beds
                </Typography>
              </Box>
            )}

            {property.bathrooms && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 0.5 
              }}>
                <Bathtub sx={{ fontSize: 20, color: 'rgba(31, 170, 188, 0.8)' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {property.bathrooms}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  Baths
                </Typography>
              </Box>
            )}

            {(property.car_spaces || property.carpark) && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 0.5 
              }}>
                <DriveEta sx={{ fontSize: 20, color: 'rgba(31, 170, 188, 0.8)' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {property.car_spaces || property.carpark}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  Cars
                </Typography>
              </Box>
            )}

            {(property.building_area || property.floor_area) && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 0.5 
              }}>
                <Square sx={{ fontSize: 20, color: 'rgba(31, 170, 188, 0.8)' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {property.building_area || property.floor_area}
                  {typeof (property.building_area || property.floor_area) === 'number' ? '' : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  m² Floor
                </Typography>
              </Box>
            )}

            {property.land_area && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 0.5 
              }}>
                <Landscape sx={{ fontSize: 20, color: 'rgba(31, 170, 188, 0.8)' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {property.land_area}
                  {typeof property.land_area === 'number' ? '' : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  m² Land
                </Typography>
              </Box>
            )}
          </Box>


        </Box>

        {/* Action Bar - SLEEK Design */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center',
          px: 2, 
          py: 2,
          mt: 1,
          borderTop: '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: Subtle divider
          bgcolor: 'rgba(31, 170, 188, 0.02)' // SLEEK: Very subtle brand background
        }}>
          <Tooltip title="Add to shortlist">
            <IconButton 
              onClick={() => handleBookmarkToggle(property)} 
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'transparent', // SLEEK: Transparent background
                border: '1px solid rgba(31, 170, 188, 0.2)', // SLEEK: Subtle brand border
                color: bookmarkedProperties.has(property.id || '') ? '#0d2b2c' : 'rgba(31, 170, 188, 0.6)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(31, 170, 188, 0.08)', // SLEEK: Subtle brand fill
                  border: '1px solid rgba(31, 170, 188, 0.4)',
                  color: '#0d2b2c',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {bookmarkedProperties.has(property.id || '') ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Add to ignore list">
            <IconButton 
              onClick={() => handleIgnoreToggle(property)}
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'transparent',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                color: ignoredProperties.has(property.id || '') ? 'error.main' : 'rgba(244, 67, 54, 0.6)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.08)',
                  border: '1px solid rgba(244, 67, 54, 0.4)',
                  color: 'error.main',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Block />
            </IconButton>
          </Tooltip>

          <Tooltip title="Contact agent/seller (Coming Soon)">
            <IconButton 
              disabled
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'transparent',
                border: '1px solid rgba(158, 158, 158, 0.2)',
                color: 'rgba(158, 158, 158, 0.5)',
              }}
            >
              <ContactPhone />
            </IconButton>
          </Tooltip>

          <Tooltip title="Book inspection (Coming Soon)">
            <IconButton 
              disabled
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'transparent',
                border: '1px solid rgba(158, 158, 158, 0.2)',
                color: 'rgba(158, 158, 158, 0.5)',
              }}
            >
              <CalendarToday />
            </IconButton>
          </Tooltip>

          <Tooltip title="Open listing">
            <IconButton 
              onClick={() => handleOpenListing(property)} 
              disabled={!property.listing_url}
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'transparent',
                border: !property.listing_url ? '1px solid rgba(158, 158, 158, 0.2)' : '1px solid rgba(31, 170, 188, 0.2)',
                color: !property.listing_url ? 'rgba(158, 158, 158, 0.5)' : 'rgba(31, 170, 188, 0.8)',
                transition: 'all 0.2s ease',
                '&:hover': !property.listing_url ? {} : {
                  bgcolor: 'rgba(31, 170, 188, 0.08)',
                  border: '1px solid rgba(31, 170, 188, 0.4)',
                  color: '#0d2b2c',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Launch />
            </IconButton>
          </Tooltip>
        </Box>
          </>
        )}
        </Paper>
      </Modal>
    );
  };

  return (
    <Box sx={{ my: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {/* Header Row: Title + View Toggle */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, side-by-side on desktop
          gap: { xs: 1, sm: 0 } // Add gap on mobile
        }}>
          <Box sx={{ flex: 1 }}>
            {/* Main Title with Property Count */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              flexWrap: 'wrap', // Allow wrapping on small screens
              justifyContent: { xs: 'center', sm: 'flex-start' } // Center on mobile
            }}>
              {title && (
                <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
                  {title}
                </Typography>
              )}
              {properties.length >= 5 && (
                <Chip 
                  label="and there are more" 
                  size="small" 
                  sx={{ bgcolor: 'info.50', color: 'info.main' }}
                />
              )}
            </Box>
            
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.6 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* View Mode Toggle - Now on same line as title */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton value="cards" aria-label="cards view">
              <Tooltip title="Cards View">
                <GridView />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <Tooltip title="List View">
                <ViewList />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="map" aria-label="map view">
              <Tooltip title="Map View">
                <MapIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>


        {/* Enhanced Active filters display - All filters with line wrapping */}
        {activeFilterCount > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500, mb: 0.5, fontSize: '0.8rem' }}>
              Active Filters:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              alignItems: 'center'
            }}>
              {Object.entries(activeFilters).map(([key, value]) => (
                <Chip 
                  key={key}
                  label={`${key}: ${value}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontSize: '0.65rem',
                    height: '20px',
                    '& .MuiChip-label': {
                      fontSize: '0.65rem',
                      px: 0.75,
                      py: 0.25
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Enhancement #2: Amenity Info Header */}
      {spatialContext?.selected_amenity && (
        <AmenityInfoHeader amenity={spatialContext.selected_amenity} />
      )}

      {/* Filter Menu Popup */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
      >
        {activeFilterCount === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No active filters
            </Typography>
          </MenuItem>
        )}
        {Object.entries(activeFilters).map(([key, value]) => (
          <MenuItem key={key} onClick={handleFilterMenuClose}>
            <Typography variant="body2">
              <strong>{key}:</strong> {String(value)}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Content Display */}
      {viewMode === 'cards' && (
        <Box sx={{ position: 'relative', mb: 2 }}>
          {/* Left Navigation Arrow */}
          {showLeftArrow && (
            <IconButton
              onClick={scrollLeft}
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: 'rgba(31, 170, 188, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(4px)',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  color: '#0d2b2c',
                  transform: 'translateY(-50%) translateX(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }
              }}
            >
              <ChevronLeft sx={{ fontSize: 24 }} />
            </IconButton>
          )}

          {/* Right Navigation Arrow */}
          {showRightArrow && (
            <IconButton
              onClick={scrollRight}
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: 'rgba(31, 170, 188, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(4px)',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  color: '#0d2b2c',
                  transform: 'translateY(-50%) translateX(2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }
              }}
            >
              <ChevronRight sx={{ fontSize: 24 }} />
            </IconButton>
          )}

          {/* Horizontal Scrollable Cards Container */}
          <Box
            ref={scrollContainerRef}
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 2, // Space for scroll bar
              px: 1, // Padding for card shadows
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(31, 170, 188, 0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(31, 170, 188, 0.3)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(31, 170, 188, 0.5)',
                },
              },
              // Smooth scroll behavior
              scrollBehavior: 'smooth',
            }}
          >
            {properties.map((property, index) => {
              const propertyId = property.id || `property-${index}`;
              const propertyType = property.propertyType || property.property_type;
              const fullAddress = formatFullAddress(property);
              const listingState = getListingState(property);
              const coverImage = getCoverImage(property);

              return (
                <Card
                  key={propertyId}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    flexShrink: 0,
                    position: 'relative',
                    borderRadius: '16px',
                    border: '1px solid rgba(31, 170, 188, 0.15)',
                    bgcolor: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 16px rgba(31, 170, 188, 0.12)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(31, 170, 188, 0.2)',
                      border: '1px solid rgba(31, 170, 188, 0.25)',
                    }
                  }}
                >
                  {/* Cover Photo */}
                  <Box sx={{ position: 'relative' }}>
                    {coverImage ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={coverImage}
                        alt={fullAddress}
                        sx={{
                          objectFit: 'cover',
                          borderRadius: '16px 16px 0 0',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 160,
                          bgcolor: 'rgba(31, 170, 188, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '16px 16px 0 0',
                        }}
                      >
                        <Home sx={{ fontSize: 48, color: 'rgba(31, 170, 188, 0.4)' }} />
                      </Box>
                    )}
                    
                    {/* Property Type Label - Top Left Corner */}
                    <Chip
                      label={propertyType || 'Property'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                      }}
                    />

                    {/* Price - Inside Cover Photo with Transparent Dark Background */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '0 0 0 0',
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'white',
                          fontSize: '0.75rem', // Smaller font size
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.4
                        }}
                      >
                        <Typography component="span" sx={{ 
                          color: listingState === 'Sold' ? 'rgba(255, 255, 255, 0.8)' : 
                                listingState === 'Rent' ? 'rgba(31, 170, 188, 1)' : 
                                'rgba(76, 175, 80, 1)',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          mr: 0.5
                        }}>
                          {listingState}
                        </Typography>
                        {formatPrice(property.price || property.price_display)}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2, pb: 1 }}>

                    {/* Ask Follow Up Button - Sparkling CTA */}
                    <Button
                      variant="contained"
                      startIcon={<AutoAwesome />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAskFollowUp(property);
                      }}
                      fullWidth
                      sx={{
                        mb: 2,
                        bgcolor: '#0d2b2c',
                        color: 'white',
                        py: 1,
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textTransform: 'none',
                        boxShadow: '0 3px 10px rgba(31, 170, 188, 0.3)',
                        '&:hover': {
                          bgcolor: '#1899a8',
                          boxShadow: '0 4px 14px rgba(31, 170, 188, 0.4)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      Ask Follow Up
                    </Button>

                    {/* Address with inline distance */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        mb: 1.5,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {fullAddress}
                      {(property.distance_km || property.distance_text) && (
                        <Typography component="span" sx={{ 
                          color: 'error.main', 
                          fontWeight: 500,
                          fontSize: '0.8rem',
                          ml: 1
                        }}>
                          • {property.distance_text || (property.distance_km ? `${property.distance_km.toFixed(1)}km away` : '')}
                        </Typography>
                      )}
                    </Typography>

                    {/* Property Specs - Inline Style */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.8rem',
                          lineHeight: 1.4,
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 1.5,
                        }}
                      >
                        {property.bedrooms && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Bed sx={{ fontSize: 14, color: 'rgba(31, 170, 188, 0.8)' }} />
                            <span style={{ fontWeight: 600 }}>{property.bedrooms} bed</span>
                          </Box>
                        )}
                        {property.bathrooms && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Bathtub sx={{ fontSize: 14, color: 'rgba(31, 170, 188, 0.8)' }} />
                            <span style={{ fontWeight: 600 }}>{property.bathrooms} bath</span>
                          </Box>
                        )}
                        {(property.car_spaces || property.carpark) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DriveEta sx={{ fontSize: 14, color: 'rgba(31, 170, 188, 0.8)' }} />
                            <span style={{ fontWeight: 600 }}>{property.car_spaces || property.carpark} car</span>
                          </Box>
                        )}
                        {(property.building_area || property.floor_area) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Square sx={{ fontSize: 12, color: 'rgba(31, 170, 188, 0.8)' }} />
                            <span style={{ fontWeight: 600 }}>{property.building_area || property.floor_area}m²</span>
                          </Box>
                        )}
                        {property.land_area && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Landscape sx={{ fontSize: 12, color: 'rgba(31, 170, 188, 0.8)' }} />
                            <span style={{ fontWeight: 600 }}>{property.land_area}m²</span>
                          </Box>
                        )}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 1, pt: 0, pb: 0.5, justifyContent: 'center' }}>
                    {/* More... Subtle Text Link */}
                    <Typography
                      onClick={(e) => openProperty(property, index, e)}
                      sx={{
                        color: 'rgba(31, 170, 188, 0.7)',
                        textTransform: 'none',
                        fontWeight: 400,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textDecorationColor: 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: '#0d2b2c',
                          textDecorationColor: '#0d2b2c',
                        }
                      }}
                    >
                      more...
                    </Typography>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {viewMode === 'list' && (
        <Box sx={{ position: 'relative' }}>
          {/* Compact List Container */}
          <Box
            sx={{
              maxHeight: calculateContainerHeight(),
              overflowY: properties.length > 5 ? 'auto' : 'visible',
              border: '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: subtle brand border
              borderRadius: '12px', // Slightly less rounded for SLEEK appearance
              bgcolor: 'transparent', // SLEEK: transparent background
              p: 2,
              boxShadow: 'none', // SLEEK: no shadow by default
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--border-radius-sm)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'var(--color-secondary-light)',
                borderRadius: 'var(--border-radius-sm)',
                '&:hover': {
                  background: 'var(--color-secondary-main)',
                },
              },
            }}
          >
            {properties.map((property, index) => {
              const propertyId = property.id || `property-${index}`;
              const propertyType = property.propertyType || property.property_type;
              const fullAddress = formatFullAddress(property);
              const listingState = getListingState(property);

              return (
                <React.Fragment key={propertyId}>
                  <Box
                    onClick={(e) => openProperty(property, index, e)}
                    sx={{
                      px: 3,
                      py: 2,
                      cursor: 'pointer',
                      borderRadius: '16px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid transparent',
                      bgcolor: 'transparent', // SLEEK: transparent by default
                      fontFamily: 'var(--font-secondary)',
                      // Enhanced hover effects to indicate clickability
                      '&:hover': {
                        bgcolor: 'rgba(31, 170, 188, 0.04)', // SLEEK: subtle brand background
                        border: '1px solid rgba(31, 170, 188, 0.15)', // SLEEK: subtle brand border
                        transform: 'translateY(-2px)', // SLEEK: lift effect
                        boxShadow: '0 4px 12px rgba(31, 170, 188, 0.08)', // SLEEK: brand shadow
                      },
                      '&:active': {
                        transform: 'translateY(0)', // SLEEK: press effect
                        boxShadow: '0 2px 6px rgba(31, 170, 188, 0.06)', // SLEEK: pressed shadow
                      }
                    }}
                  >
                    {/* Line 1: Property Type + Address */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      {getPropertyTypeIcon(propertyType)}
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize', fontSize: '0.875rem' }}>
                        {propertyType || 'Property'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        {fullAddress}
                        {(property.distance_km || property.distance_text) && (
                          <Typography component="span" sx={{ 
                            color: 'error.main', 
                            fontWeight: 500,
                            fontSize: '0.8rem',
                            ml: 1
                          }}>
                            • {property.distance_text || (property.distance_km ? `${property.distance_km.toFixed(1)}km away` : '')}
                          </Typography>
                        )}
                      </Typography>
                    </Box>

                    {/* Line 2: Price + Property Specs */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      flexWrap: 'wrap',
                      mb: 0.25
                    }}>
                      {/* Listing state */}
                      <Chip
                        label={listingState}
                        size="small"
                        color={listingState === 'Sold' ? 'default' : listingState === 'Rent' ? 'info' : 'success'}
                        variant="outlined"
                      />
                      
                      {/* Price */}
                      <Typography variant="body1" sx={{ 
                        fontWeight: 700,
                        color: listingState === 'Sold' ? 'text.secondary' : 'primary.main',
                        fontSize: '1rem'
                      }}>
                        {formatPrice(property.price || property.price_display)}
                      </Typography>

                      {/* Property specs */}
                      {property.bedrooms && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Bed sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{property.bedrooms}</Typography>
                        </Box>
                      )}

                      {property.bathrooms && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Bathtub sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{property.bathrooms}</Typography>
                        </Box>
                      )}

                      {(property.car_spaces || property.carpark) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DriveEta sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{property.car_spaces || property.carpark}</Typography>
                        </Box>
                      )}

                      {(property.building_area || property.floor_area) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Square sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {property.building_area || property.floor_area}
                            {typeof (property.building_area || property.floor_area) === 'number' ? 'm²' : ''}
                          </Typography>
                        </Box>
                      )}

                      {property.land_area && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Landscape sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {property.land_area}
                            {typeof property.land_area === 'number' ? 'm²' : ''}
                          </Typography>
                        </Box>
                      )}
                    </Box>


                  </Box>
                  
                  {/* Single divider separator (except for last item) */}
                  {index < properties.length - 1 && (
                    <Divider />
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <Box sx={{ width: '100%' }}>
          {mapData.validProperties.length > 0 ? (
            <PropertyMap
              properties={mapData.properties}
              title={title}
              height={500}
              referencePoints={mapData.referencePoints}
              catchmentBoundaries={
                spatialContext?.has_school_catchment && spatialContext?.catchment_boundary
                  ? [spatialContext.catchment_boundary]
                  : []
              }
            />
          ) : (
            <Paper sx={{ 
              height: 400, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}>
              <Typography color="text.secondary">
                No properties with location data to display on map
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Enhanced Property Overlay (shared content) */}
      {USE_POPUP_OVERLAY && (
        <PropertyDetailOverlay
          open={!!selectedProperty}
          property={selectedProperty}
          properties={properties}
          currentIndex={currentPropertyIndex}
          onClose={closeModal}
          onPropertyChange={(property, index) => {
            setSelectedProperty(property);
            setCurrentPropertyIndex(index);
          }}
          onBookmarkToggle={handleBookmarkToggle}
          onIgnoreToggle={handleIgnoreToggle}
          bookmarkedProperties={bookmarkedProperties}
          ignoredProperties={ignoredProperties}
          enableNavigation={true}
          lazyLoadProperty={lazyLoadProperty}
        />
      )}

      {/* Grace-Isaac Transition Dialog */}
      <GraceIsaacTransitionDialog
        open={graceIsaacDialogOpen}
        onClose={() => setGraceIsaacDialogOpen(false)}
        property={graceIsaacProperty || {}}
        onStartDrillSession={handleStartDrillSession}
        onHoldAndReturn={handleHoldAndReturn}
      />
    </Box>
  );
};

export default EnhancedPropertyListRefined;
