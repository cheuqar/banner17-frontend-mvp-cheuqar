import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button, // 🎯 MILESTONE 3.2: Added for interactive sample query buttons
  Card,
  CardContent
} from '@mui/material';
import {
  AutoAwesome,
  TrendingUp,
  Lightbulb,
  ArrowForward,
  // 🎯 MILESTONE 3.2: Icons for interactive sample query buttons
  AttachMoney,    // Budget queries
  LocationOn,     // Location queries  
  Bed,           // Bedroom queries
  LocalLibrary,  // Amenities queries
  CheckCircle,   // 🎯 UX ENHANCEMENT: Location selection confirmation
  // 🎯 STEP 5A: Property suggestion icons
  Search,        // Search icon
  Home,          // Property type icon
  Place,         // Spatial location icon
  Bathroom       // 🎯 STEP 5B: Intelligent suggestions - Bathroom icon
} from '@mui/icons-material';
import EnhancedPropertyListRefined from './EnhancedPropertyListRefined';
import CompactEnhancedAmenitiesListRefined from './CompactEnhancedAmenitiesListRefined';
import MarkdownMessage from './MarkdownMessage';
import PropertyMap from '../maps/PropertyMap';
import type { CatchmentBoundaryFeature } from '../../types/catchment';
// Phase 4: Enhanced Spatial Search - Dual Disambiguation Components
import AmenitiesView from '../amenities/AmenitiesView';
// ActiveFiltersPanel removed - replaced with conversational transparency

interface PropertyListItem {
  id?: string;
  address?: string;
  price?: string | number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  sqft?: number;
  [key: string]: any;
}

interface RenderInstruction {
  type: string;
  title?: string;
  subtitle?: string;
  items?: PropertyListItem[];
  pins?: any[];
  active_filters?: Record<string, string>;
  [key: string]: any;
}

interface ReferencePoint {
  id: string;
  type: "reference_point";
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
}

interface RenderInstructionDisplayProps {
  renderInstruction: RenderInstruction;
  onSendToAI?: (selectedProperties: PropertyListItem[], message: string) => void; // Deprecated: will be removed
  onCreatePropertyDrillSession?: (property: PropertyListItem) => void;
  onCreateComparisonSession?: (properties: PropertyListItem[]) => void;
  onSendMessage?: (messageText?: string, messageMetadata?: Record<string, any>) => void; // 🎯 MILESTONE 3.2: Updated to support metadata for suggestions
  guidanceContext?: {
    guidance_message?: string;
    suggested_actions?: string[];
    journey_stage?: string;
    buyer_insights?: string[];
  };
  dataObjects?: {
    reference_points?: ReferencePoint[];
    [key: string]: any;
  };
  messageMetadata?: {  // 🌍 LOCATION DISAMBIGUATION: Added for location disambiguation support
    clarification_type?: string;
    disambiguation_request?: {
      suburb_name?: string;
      message?: string;
      original_query?: string;
      options?: Array<{
        suburb: string;
        state: string;
        postcode: string;
        latitude: number;
        longitude: number;
        context_hint?: string;
        display_text: string;
        full_display: string;
      }>;
      // NEW: Phase 2 - Enhanced state grouping support
      supports_multi_selection?: boolean;
      state_groups?: Array<{
        state: string;
        state_name: string;
        locations: Array<{
          suburb: string;
          state: string;
          postcode: string;
          latitude: number;
          longitude: number;
          context_hint?: string;
          display_text: string;
          full_display: string;
        }>;
        can_select_multiple: boolean;
        can_select_all: boolean;
      }>;
    };
    location_selection?: {  // 🌍 LOCATION DISAMBIGUATION: Added for selection state persistence
      selectedOptionIndex?: number;
      selectedOption?: any;
      // NEW: Phase 2 - Multi-selection support
      selectedOptions?: Array<any>;
      selectedStateGroup?: string;
      timestamp?: string;
    };
    [key: string]: any;
  };
  messageId?: string; // 🌍 LOCATION DISAMBIGUATION: Message ID for state updates
  onUpdateMessage?: (messageId: string, updates: any) => void; // 🌍 LOCATION DISAMBIGUATION: Message update handler
  // Active Filters removed (Phase 6C) - replaced with conversational transparency
}

// Phase 2 Guidance Display Component
const GuidanceDisplay: React.FC<{ 
  guidanceContext: NonNullable<RenderInstructionDisplayProps['guidanceContext']>; 
  onSuggestedActionClick?: (action: string) => void;
}> = ({ guidanceContext, onSuggestedActionClick }) => {
  const { guidance_message, suggested_actions, journey_stage, buyer_insights } = guidanceContext;
  
  if (!guidance_message && (!suggested_actions || suggested_actions.length === 0)) {
    return null;
  }

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 3, 
        mb: 3, 
        bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
        border: 2, 
        borderColor: 'primary.main',
        borderRadius: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: 'primary.main',
          borderRadius: '12px 12px 0 0'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <AutoAwesome />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            🤖 AI Assistant Guidance
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {journey_stage && (
              <Chip 
                label={`${journey_stage.replace('_', ' ')} stage`} 
                size="small" 
                color="primary" 
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Personalized for your property journey
            </Typography>
          </Box>
        </Box>
      </Box>

      {guidance_message && (
        <Box sx={{ mb: 2 }}>
          <MarkdownMessage content={guidance_message} isUser={false} />
        </Box>
      )}

      {buyer_insights && buyer_insights.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Lightbulb fontSize="small" color="warning" />
            Insights for You:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {buyer_insights.map((insight, index) => (
              <Chip
                key={index}
                label={insight}
                size="small"
                color="warning"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {suggested_actions && suggested_actions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 2,
            fontWeight: 600,
            color: 'success.main'
          }}>
            <TrendingUp />
            💡 Suggested Next Steps
          </Typography>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 1.5
          }}>
            {suggested_actions.map((action, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{ 
                  p: 2,
                  cursor: onSuggestedActionClick ? 'pointer' : 'default',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'success.200',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': onSuggestedActionClick ? { 
                    bgcolor: 'success.50', 
                    borderColor: 'success.main',
                    transform: 'translateY(-1px)',
                    boxShadow: 2
                  } : {}
                }}
                onClick={() => onSuggestedActionClick?.(action)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    bgcolor: 'success.100',
                    color: 'success.main',
                    flexShrink: 0
                  }}>
                    <ArrowForward fontSize="small" />
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: 'text.primary',
                      lineHeight: 1.4
                    }}
                  >
                    {action}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

const MapPinsDisplay: React.FC<{ pins: any[]; title?: string; spatial_context?: any }> = ({ pins, title, spatial_context }) => {
  // Transform pins data to PropertyMap format
  const properties = pins.map((pin, index) => ({
    id: pin.id || `property-${index}`,
    address: pin.address || pin.name || pin.title || 'Unknown Address',
    price: pin.price || pin.price_display,
    latitude: pin.latitude || pin.lat,
    longitude: pin.longitude || pin.lng,
    bedrooms: pin.bedrooms,
    bathrooms: pin.bathrooms,
    propertyType: pin.property_type || pin.propertyType,
    ...pin
  })).filter(property => property.latitude && property.longitude);

  // Extract reference points for spatial search center markers
  const referencePoints: ReferencePoint[] = [];
  if (spatial_context) {
    // Check for spatial search center coordinates
    if (spatial_context.center_lat && spatial_context.center_lng) {
      referencePoints.push({
        id: 'search-center',
        type: 'reference_point',
        name: spatial_context.location_name || spatial_context.search_location || 'Search Center',
        latitude: spatial_context.center_lat,
        longitude: spatial_context.center_lng,
        address: spatial_context.search_address,
        description: `Search center for ${spatial_context.radius_km || 5}km radius search`
      });
    }
    // Check for mentioned properties as reference points
    if (spatial_context.mentioned_properties) {
      spatial_context.mentioned_properties.forEach((mention: any, index: number) => {
        if (mention.coordinates && mention.coordinates.lat && mention.coordinates.lng) {
          referencePoints.push({
            id: `mention-${index}`,
            type: 'reference_point',
            name: mention.display_text || mention.name || 'Mentioned Property',
            latitude: mention.coordinates.lat,
            longitude: mention.coordinates.lng,
            address: mention.address,
            description: 'Referenced property from conversation'
          });
        }
      });
    }
  }

  // 🚀 CRITICAL FIX: Extract school catchment boundary data from spatial_context
  // This ensures catchment boundaries display on the map when school searches are performed
  const catchmentBoundaries: CatchmentBoundaryFeature[] = [];

  // 🚨 ENHANCED DEBUGGING: Check spatial_context data
  console.log('📍 [RenderInstructionDisplay] spatial_context:', spatial_context);
  console.log('📍 [RenderInstructionDisplay] has_school_catchment:', spatial_context?.has_school_catchment);
  console.log('📍 [RenderInstructionDisplay] catchment_boundary:', spatial_context?.catchment_boundary);

  if (spatial_context && spatial_context.has_school_catchment && spatial_context.catchment_boundary) {
    console.log('📍 [RenderInstructionDisplay] Adding catchment boundary to array');
    catchmentBoundaries.push(spatial_context.catchment_boundary);
  }

  console.log('📍 [RenderInstructionDisplay] Final catchmentBoundaries array:', catchmentBoundaries);

  if (properties.length === 0) {
    return (
      <Box sx={{ my: 2 }}>
        {title && (
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
            {title}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No properties with valid coordinates to display on map
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
          {title}
        </Typography>
      )}
      <PropertyMap
        properties={properties}
        title={title}
        height={400}
        referencePoints={referencePoints}
        catchmentBoundaries={catchmentBoundaries}
        showCatchmentControls={catchmentBoundaries.length > 0}
      />
    </Box>
  );
};

// 🎯 STEP 5A: PropertySuggestions Component - Following Interactive Component State Snapshot Principle
interface PropertySuggestionsProps {
  suggestions: Array<{
    category: string;
    display_text: string;
    query_params: Record<string, any>;
    expected_results: string;
    // 🎯 STEP 5: Enhanced properties for intelligent filter suggestions
    property_count?: number;               // NEW: Actual property count from database 
    filter_type?: 'intelligent' | 'generic';  // NEW: Type of suggestion
    current_filters?: Record<string, any>; // NEW: Context of current active filters
    suggested_changes?: string;           // NEW: Description of what changes
  }>;
  title?: string;
  subtitle?: string;
  originalQuery?: string;
  onSendMessage?: (messageText?: string, messageMetadata?: Record<string, any>) => void;
  messageId?: string;
  onUpdateMessage?: (messageId: string, metadata: any) => void;
  messageMetadata?: any;
}

const PropertySuggestions: React.FC<PropertySuggestionsProps> = ({
  suggestions,
  title,
  subtitle,
  originalQuery,
  onSendMessage,
  messageId,
  onUpdateMessage,
  messageMetadata
}) => {
  // State for tracking user interactions following Interactive Component State Snapshot Principle
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState<number | null>(null);
  const [suggestionClicked, setSuggestionClicked] = React.useState<boolean>(false);

  // 🎯 CRITICAL: State restoration from messageMetadata on every render/re-render
  React.useEffect(() => {
    if (messageMetadata?.suggestion_selection?.selectedIndex !== undefined) {
      console.log('🔄 [STATE RESTORE] Restoring selectedSuggestionIndex from messageMetadata:', 
                  messageMetadata.suggestion_selection.selectedIndex);
      setSelectedSuggestionIndex(messageMetadata.suggestion_selection.selectedIndex);
      if (messageMetadata.suggestion_selection.clicked) {
        setSuggestionClicked(true);
      }
    } else {
      console.log('🔄 [STATE RESTORE] No previous suggestion selection found in messageMetadata');
    }
  }, [messageMetadata]);

  // Handle suggestion selection with Interactive Component State Snapshot Principle
  const handleSuggestionClick = React.useCallback((index: number, suggestion: any) => {
    if (suggestionClicked) {
      console.log('🎯 [SUGGESTION] Interaction disabled - suggestion already clicked');
      return; // Prevent multiple interactions
    }

    console.log(`🎯 [SUGGESTION] User selected suggestion ${index}: ${suggestion.display_text}`);
    
    // Update local state for immediate visual feedback
    setSelectedSuggestionIndex(index);
    setSuggestionClicked(true);

    // Preserve state in message metadata
    if (onUpdateMessage && messageId) {
      const selectionMetadata = {
        ...messageMetadata,
        suggestion_selection: {
          selectedIndex: index,
          selectedSuggestion: suggestion,
          clicked: true,
          timestamp: new Date().toISOString()
        }
      };
      onUpdateMessage(messageId, selectionMetadata);
    }

    // Send the suggestion as a message with special metadata
    if (onSendMessage) {
      // 🎯 CLEAN SOLUTION: Send clean message with metadata instead of ugly prefix
      const cleanMessage = suggestion.display_text;
      const suggestionMetadata = {
        messageType: 'FRESH_START_SUGGESTION',
        suggestionData: {
          category: suggestion.category,
          // 🎯 PHASE 2.2: V2 format uses query_params (mapped from DB filter_changes)
          filter_changes: suggestion.query_params,    // V2: query_params contains the filter changes
          query_params: suggestion.query_params,      // Keep for backward compatibility
          expected_results: suggestion.expected_results,
          originalQuery: originalQuery,
          // 🎯 V2 Additional fields for enhanced processing
          property_count: suggestion.property_count,
          filter_type: suggestion.filter_type,
          v2_metadata: suggestion.v2_metadata || {}
        },
        timestamp: new Date().toISOString()
      };
      
      console.log('🎯 [SUGGESTION] Sending clean suggestion message:', cleanMessage);
      console.log('🔄 [METADATA] Fresh start metadata:', suggestionMetadata);
      console.log('👁️ [UX] User sees clean message, backend gets context via metadata');
      
      // Send clean message with metadata - much better UX!
      onSendMessage(cleanMessage, suggestionMetadata);
    }
  }, [selectedSuggestionIndex, suggestionClicked, messageId, onUpdateMessage, messageMetadata, onSendMessage]);

  // Get icon for suggestion category - Enhanced for intelligent suggestions while preserving existing behavior
  const getCategoryIcon = (category: string | undefined) => {
    if (!category) return <Search sx={{ color: 'text.secondary' }} />;
    switch (category.toLowerCase()) {
      // ✅ EXISTING CATEGORIES (preserved exactly)
      case 'budget': return <AttachMoney sx={{ color: 'success.main' }} />;
      case 'bedroom': return <Bed sx={{ color: 'primary.main' }} />;
      case 'suburb': return <LocationOn sx={{ color: 'warning.main' }} />;
      case 'spatial': return <Place sx={{ color: 'info.main' }} />;
      
      // 🎯 NEW INTELLIGENT SUGGESTION CATEGORIES (additive only)
      case 'price': return <AttachMoney sx={{ color: 'success.main' }} />;
      case 'bedrooms': return <Bed sx={{ color: 'primary.main' }} />;
      case 'bathrooms': return <Bathroom sx={{ color: 'secondary.main' }} />;
      case 'property_type': return <Home sx={{ color: 'warning.main' }} />;
      case 'location': return <LocationOn sx={{ color: 'info.main' }} />;
      
      // ✅ DEFAULT (preserved exactly)
      default: return <Search sx={{ color: 'text.secondary' }} />;
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      {/* Title and Subtitle */}
      {title && (
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      )}
      
      {/* Original Query Context */}
      {originalQuery && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            Your search: "{originalQuery}"
          </Typography>
        </Paper>
      )}

      {/* Suggestions Grid */}
      <Box sx={{ 
        display: 'grid', 
        gap: 2, 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' 
      }}>
        {suggestions.map((suggestion, index) => (
          <Card
            key={`suggestion-${index}`}
            onClick={() => handleSuggestionClick(index, suggestion)}
            sx={{
              cursor: suggestionClicked ? 'default' : 'pointer',
              transition: 'all 0.3s ease-in-out',
              opacity: suggestionClicked && selectedSuggestionIndex !== index ? 0.5 : 1,
              transform: selectedSuggestionIndex === index ? 'scale(1.02)' : 'scale(1)',
              borderColor: selectedSuggestionIndex === index ? 'success.main' : 'divider',
              boxShadow: selectedSuggestionIndex === index ? 3 : 1,
              '&:hover': suggestionClicked ? {} : {
                transform: 'scale(1.01)',
                boxShadow: 2,
                borderColor: 'primary.main'
              }
            }}
          >
            <CardContent sx={{ position: 'relative' }}>
              {/* Category Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                {getCategoryIcon(suggestion.category)}
                <Chip
                  label={suggestion.category?.toUpperCase() || 'GENERAL'}
                  size="small"
                  sx={{ ml: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}
                />
                {/* Selection Indicator */}
                {selectedSuggestionIndex === index && (
                  <CheckCircle 
                    sx={{ 
                      color: 'success.main', 
                      ml: 'auto',
                      fontSize: 20 
                    }} 
                  />
                )}
              </Box>
              
              {/* Suggestion Text */}
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'medium',
                  mb: 1,
                  color: selectedSuggestionIndex === index ? 'success.dark' : 'text.primary'
                }}
              >
                {suggestion.display_text}
              </Typography>
              
              {/* Expected Results - Enhanced for intelligent suggestions while preserving existing behavior */}
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                {/* ✅ BACKWARD COMPATIBLE: Always show existing expected_results text */}
                {suggestion.expected_results}
                {/* 🎯 ENHANCEMENT: Add property count if available (only for intelligent suggestions) */}
                {suggestion.property_count !== undefined && suggestion.filter_type === 'intelligent' && (
                  <span style={{ fontWeight: 'medium', color: 'green' }}>
                    {` • ${suggestion.property_count} properties`}
                  </span>
                )}
              </Typography>
              
              {/* 🎯 ENHANCEMENT: Show suggested changes for intelligent suggestions (completely optional) */}
              {suggestion.suggested_changes && suggestion.filter_type === 'intelligent' && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 0.5, 
                    color: 'info.main',
                    fontStyle: 'italic',
                    fontSize: '0.75rem'
                  }}
                >
                  💡 {suggestion.suggested_changes}
                </Typography>
              )}
              
              {/* Selected State Message */}
              {selectedSuggestionIndex === index && suggestionClicked && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    color: 'success.main',
                    fontStyle: 'italic'
                  }}
                >
                  ✓ Suggestion sent! The search results will appear below.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
      
      {/* Instructions */}
      <Typography 
        variant="body2" 
        sx={{ 
          mt: 2, 
          color: 'text.secondary', 
          textAlign: 'center',
          fontStyle: 'italic' 
        }}
      >
        {suggestionClicked ? 
          '🎯 Suggestion sent! Your search results will appear below.' : 
          '💡 Click on any suggestion above to start a new property search'
        }
      </Typography>
    </Box>
  );
};

const RenderInstructionDisplay: React.FC<RenderInstructionDisplayProps> = ({ 
  renderInstruction, 
  onSendToAI, // Deprecated: will be removed
  onCreatePropertyDrillSession,
  onCreateComparisonSession,
  onSendMessage, // 🎯 MILESTONE 3.2: New prop for sample query clicks
  guidanceContext,
  dataObjects,
  messageMetadata, // 🌍 LOCATION DISAMBIGUATION: Added for location disambiguation support
  messageId, // 🌍 LOCATION DISAMBIGUATION: Step 2 - Message ID for state updates
  onUpdateMessage, // 🌍 LOCATION DISAMBIGUATION: Step 2 - Message update handler
  // Active filters props removed (Phase 6C) - replaced with conversational transparency
}) => {
  // 🌍 LOCATION DISAMBIGUATION: Step 3 - Local state management for selection visual feedback
  const [selectedLocationIndex, setSelectedLocationIndex] = React.useState<number | null>(null);
  // 🎯 UX ENHANCEMENT: Track continue button clicked state to prevent multiple submissions
  const [continueButtonClicked, setContinueButtonClicked] = React.useState<boolean>(false);
  
  // 🆕 PHASE 2: Multi-selection state management for state groups
  const [selectedOptions, setSelectedOptions] = React.useState<Array<any>>([]);
  const [selectedStateGroup, setSelectedStateGroup] = React.useState<string | null>(null);
  const [multiSelectionMode, setMultiSelectionMode] = React.useState<boolean>(false);
  const { type, title, subtitle, items, pins, active_filters } = renderInstruction;

  // 🔍 [SYSTEMATIC LOGGING] Comprehensive render instruction analysis
  React.useEffect(() => {
    console.log('');
    console.log('🔍 [SYSTEMATIC LOG] ====== RENDER INSTRUCTION ANALYSIS ======');
    console.log('🔍 [SYSTEMATIC LOG] Render Instruction Type:', type);
    console.log('🔍 [SYSTEMATIC LOG] Title:', title);
    console.log('🔍 [SYSTEMATIC LOG] Subtitle:', subtitle);
    console.log('🔍 [SYSTEMATIC LOG] Items Count:', items?.length || 0);
    console.log('🔍 [SYSTEMATIC LOG] Active Filters:', active_filters);
    
    // 💰 [PRICE FILTER DETECTION] Critical analysis for price vs postcode disambiguation
    if (active_filters?.Price) {
      console.log('💰 [PRICE FILTER DETECTED] CRITICAL ISSUE: Price filter found:', active_filters.Price);
      console.log('💰 [PRICE FILTER DETECTED] Expected: Location disambiguation for postcode');
      console.log('💰 [PRICE FILTER DETECTED] Actual: Price filter instead');
      console.log('💰 [PRICE FILTER DETECTED] This indicates LLM interpreted number as price, not postcode');
    }
    
    // 🌍 [LOCATION DISAMBIGUATION] Detailed metadata analysis
    console.log('🌍 [LOCATION DISAMBIGUATION] Message Metadata:', messageMetadata);
    if (messageMetadata?.clarification_type === 'location_disambiguation') {
      console.log('✅ [LOCATION DISAMBIGUATION] SUCCESS: Location disambiguation metadata detected');
      console.log('🌍 [LOCATION DISAMBIGUATION] Disambiguation Request:', messageMetadata.disambiguation_request);
      console.log('🌍 [LOCATION DISAMBIGUATION] Options Count:', messageMetadata.disambiguation_request?.options?.length || 0);
    } else {
      console.log('❌ [LOCATION DISAMBIGUATION] MISSING: No location disambiguation metadata');
      console.log('🌍 [LOCATION DISAMBIGUATION] Clarification Type:', messageMetadata?.clarification_type || 'undefined');
    }
    
    // 📊 [RENDER COMPONENTS] Component rendering decision analysis
    console.log('📊 [RENDER COMPONENTS] Component Rendering Decisions:');
    if (type === 'PropertyList') {
      console.log('📊 [RENDER COMPONENTS] ✅ Will render PropertyList');
    }
    if (type === 'AmenityList') {
      console.log('📊 [RENDER COMPONENTS] ✅ Will render AmenityList');
    }
    if (type === 'Message') {
      console.log('📊 [RENDER COMPONENTS] ✅ Will render Message');
    }
    if (messageMetadata?.clarification_type === 'location_disambiguation') {
      console.log('📊 [RENDER COMPONENTS] ✅ Will render Location Disambiguation UI');
    }
    
    console.log('🔍 [SYSTEMATIC LOG] ====== END ANALYSIS ======');
    console.log('');
  }, [type, title, active_filters, messageMetadata, items]);

  // 🎯 CRITICAL: State restoration from messageMetadata on every render/re-render
  React.useEffect(() => {
    // Restore single-selection state (backward compatibility)
    if (messageMetadata?.location_selection?.selectedOptionIndex !== undefined) {
      console.log('🔄 [STATE RESTORE] Restoring selectedLocationIndex from messageMetadata:', messageMetadata.location_selection.selectedOptionIndex);
      setSelectedLocationIndex(messageMetadata.location_selection.selectedOptionIndex);
    } else {
      console.log('🔄 [STATE RESTORE] No previous selection found in messageMetadata, keeping null');
    }

    // 🆕 PHASE 2: Restore multi-selection state
    if (messageMetadata?.location_selection?.selectedOptions) {
      console.log('🔄 [STATE RESTORE] Restoring selectedOptions from messageMetadata:', messageMetadata.location_selection.selectedOptions);
      setSelectedOptions(messageMetadata.location_selection.selectedOptions);
    }
    
    if (messageMetadata?.location_selection?.selectedStateGroup) {
      console.log('🔄 [STATE RESTORE] Restoring selectedStateGroup from messageMetadata:', messageMetadata.location_selection.selectedStateGroup);
      setSelectedStateGroup(messageMetadata.location_selection.selectedStateGroup);
    }

    // Determine if we should be in multi-selection mode
    const supportsMultiSelection = messageMetadata?.disambiguation_request?.supports_multi_selection;
    if (supportsMultiSelection !== undefined) {
      console.log('🔄 [STATE RESTORE] Setting multiSelectionMode:', supportsMultiSelection);
      setMultiSelectionMode(supportsMultiSelection);
    }
  }, [messageMetadata]); // Re-run whenever messageMetadata changes
  
  // Handle suggested action clicks by populating chat input
  const handleSuggestedActionClick = (action: string) => {
    const chatInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (chatInput) {
      chatInput.value = action;
      // Trigger input event to update the chat interface
      const event = new Event('input', { bubbles: true });
      chatInput.dispatchEvent(event);
      // Focus the input for better UX
      chatInput.focus();
    }
  };

  // 🆕 PHASE 3: Multi-selection helper functions
  const isLocationSelected = (location: any, stateGroup: string) => {
    return selectedOptions.some(option => 
      option.suburb === location.suburb && 
      option.state === location.state && 
      option.postcode === location.postcode
    );
  };

  const handleLocationToggle = (location: any, stateGroup: string) => {
    if (!multiSelectionMode || continueButtonClicked) return; // 🔒 SNAPSHOT PRINCIPLE: Disable after submission
    
    const isCurrentlySelected = isLocationSelected(location, stateGroup);
    
    if (isCurrentlySelected) {
      // Remove from selection
      const updatedOptions = selectedOptions.filter(option => 
        !(option.suburb === location.suburb && 
          option.state === location.state && 
          option.postcode === location.postcode)
      );
      setSelectedOptions(updatedOptions);
    } else {
      // Add to selection (only if same state group or first selection)
      if (selectedStateGroup === null || selectedStateGroup === stateGroup) {
        setSelectedOptions([...selectedOptions, location]);
        setSelectedStateGroup(stateGroup);
      }
    }

    // Update message metadata
    if (onUpdateMessage && messageId) {
      const updatedMetadata = {
        ...messageMetadata,
        location_selection: {
          ...messageMetadata?.location_selection,
          selectedOptions: isCurrentlySelected 
            ? selectedOptions.filter(option => 
                !(option.suburb === location.suburb && 
                  option.state === location.state && 
                  option.postcode === location.postcode)
              )
            : [...selectedOptions, location],
          selectedStateGroup: selectedStateGroup || stateGroup,
          timestamp: new Date().toISOString(),
        },
      };
      onUpdateMessage(messageId, updatedMetadata);
    }
  };

  const handleSelectAllInState = (stateGroup: any) => {
    if (continueButtonClicked) return; // 🔒 SNAPSHOT PRINCIPLE: Disable after submission
    
    const allLocationsInState = stateGroup.locations;
    setSelectedOptions(allLocationsInState);
    setSelectedStateGroup(stateGroup.state);

    // Update message metadata
    if (onUpdateMessage && messageId) {
      const updatedMetadata = {
        ...messageMetadata,
        location_selection: {
          ...messageMetadata?.location_selection,
          selectedOptions: allLocationsInState,
          selectedStateGroup: stateGroup.state,
          timestamp: new Date().toISOString(),
        },
      };
      onUpdateMessage(messageId, updatedMetadata);
    }
  };

  // Render guidance context at the top if available
  const guidanceDisplay = guidanceContext ? (
    <GuidanceDisplay 
      guidanceContext={guidanceContext} 
      onSuggestedActionClick={handleSuggestedActionClick}
    />
  ) : null;

  switch (type) {
    case 'PropertyList':
      if (items && items.length > 0) {
        return (
          <Box>
            {guidanceDisplay}
            {/* Enhancement #3: Grace Response Text */}
            {renderInstruction.text && (
              <Box sx={{ mb: 2 }}>
                <MarkdownMessage
                  content={renderInstruction.text}
                  isUser={false}
                />
              </Box>
            )}
            {/* ActiveFiltersPanel removed - replaced with conversational transparency in LLM responses */}
            <EnhancedPropertyListRefined
              properties={items}
              title={title}
              subtitle={subtitle}
              activeFilters={active_filters}
              spatialContext={renderInstruction.spatial_context}
              onSendToAI={onSendToAI}
              onCreatePropertyDrillSession={onCreatePropertyDrillSession}
            />
          </Box>
        );
      }
      break;
      
    case 'AmenityList':
      // Phase 4: Enhanced Spatial Search - Check for dual disambiguation workflow data
      const isDualDisambiguation = renderInstruction.disambiguation_type === 'amenities' &&
                                   renderInstruction.amenities_disambiguation_data?.compact_ui_mode;

      if (isDualDisambiguation) {
        // Use new Phase 4 dual disambiguation components
        const amenitiesData = renderInstruction.amenities_disambiguation_data;

        const handleAmenitySelection = (amenity: any) => {
          // Send amenity selection back to continue workflow
          if (onSendMessage) {
            onSendMessage(`I select ${amenity.name}`, {
              workflow_continuation: true,
              user_selection: {
                selected_amenity: amenity
              },
              tool_name: 'enhanced_spatial_search_tool'
            });
          }
        };

        return (
          <Box>
            {guidanceDisplay}
            <AmenitiesView
              data={amenitiesData}
              onAmenitySelect={handleAmenitySelection}
              selectedAmenity={renderInstruction.selected_amenity}
              loading={false}
              height={450}
            />
          </Box>
        );
      } else {
        // Use legacy amenities list component for backward compatibility
        return (
          <Box>
            {guidanceDisplay}
            {/* ActiveFiltersPanel removed - replaced with conversational transparency in LLM responses */}
            <CompactEnhancedAmenitiesListRefined
              amenities={items as any[] || []}
              title={title}
              onSendToAI={onSendToAI as any}
            />
          </Box>
        );
      }
      break;
      
    case 'MapPins':
      if (pins && pins.length > 0) {
        // Extract spatial context from render instruction or data objects
        const spatial_context = renderInstruction.spatial_context || 
                               renderInstruction.search_context ||
                               dataObjects?.spatial_context ||
                               dataObjects?.search_params;
        
        return (
          <Box>
            {guidanceDisplay}
            <MapPinsDisplay 
              pins={pins} 
              title={title} 
              spatial_context={spatial_context}
            />
          </Box>
        );
      }
      break;

    case 'LocationDisambiguation':
      // Handle location disambiguation with full multi-select capability
      if (renderInstruction.message && renderInstruction.location_metadata) {
        const disambiguationRequest = renderInstruction.location_metadata.disambiguation_request;
        
        return (
          <Box>
            {guidanceDisplay}
            <Box sx={{ my: 1 }}>
              <MarkdownMessage
                content={renderInstruction.message}
                isUser={false}
              />
              
              {/* 🌍 LOCATION DISAMBIGUATION: Complete multi-select UI from Message case */}
              {disambiguationRequest && 
               (disambiguationRequest.options || disambiguationRequest.state_groups) && 
               onSendMessage && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    🏡 Choose Your Location
                  </Typography>
                  
                  {/* 🆕 PHASE 3: Check if we have state groups for multi-selection */}
                  {multiSelectionMode && disambiguationRequest?.state_groups ? (
                    // 🆕 COMPACT: Grouped Multi-Select UI with reduced spacing
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}> {/* Reduced from gap: 3 to 1.5 */}
                      {disambiguationRequest.state_groups.map((stateGroup: any) => (
                        <Paper
                          key={stateGroup.state}
                          elevation={1}
                          sx={{
                            p: 1, // Reduced from p: 2 to p: 1
                            border: '1px solid', // Reduced from 2px to 1px
                            borderColor: selectedStateGroup === stateGroup.state ? 'primary.main' : 'divider',
                            backgroundColor: selectedStateGroup === stateGroup.state ? 'primary.50' : 'background.paper',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {/* Compact State Group Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, py: 0.25 }}> {/* Further reduced mb and added compact py */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}> {/* Tighter gap for more compactness */}
                              <LocationOn sx={{ color: 'primary.main', fontSize: 16 }} /> {/* Further reduced icon size */}
                              <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.85rem', color: 'text.secondary' }}> {/* Smaller, more subtle styling */}
                                {stateGroup.state_name}
                              </Typography>
                              <Chip 
                                label={`${stateGroup.locations.length}`} // Removed "locations" text for compactness
                                size="small" 
                                sx={{ bgcolor: 'primary.100', color: 'primary.dark', minHeight: '20px', '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }} // Smaller chip
                              />
                            </Box>
                            
                            {/* Compact Link-Style Select All Button */}
                            {stateGroup.can_select_all && (selectedStateGroup === null || selectedStateGroup === stateGroup.state) && (
                              <Typography
                                component="button"
                                onClick={() => handleSelectAllInState(stateGroup)}
                                disabled={continueButtonClicked || (selectedOptions.length > 0 && selectedStateGroup !== stateGroup.state)} // 🔒 SNAPSHOT PRINCIPLE: Disable after submission
                                sx={{
                                  fontSize: '0.7rem',
                                  color: 'primary.main',
                                  cursor: (continueButtonClicked || (selectedOptions.length > 0 && selectedStateGroup !== stateGroup.state)) ? 'not-allowed' : 'pointer',
                                  textDecoration: 'underline',
                                  textDecorationColor: 'transparent',
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  margin: 0,
                                  fontFamily: 'inherit',
                                  opacity: (continueButtonClicked || (selectedOptions.length > 0 && selectedStateGroup !== stateGroup.state)) ? 0.5 : 1,
                                  '&:hover': (continueButtonClicked || (selectedOptions.length > 0 && selectedStateGroup !== stateGroup.state)) ? {} : {
                                    color: 'primary.dark',
                                    textDecorationColor: 'primary.dark',
                                  },
                                }}
                              >
                                All {stateGroup.state} {/* Link-style text */}
                              </Typography>
                            )}
                          </Box>
                          
                          {/* Compact Location Options within State Group */}
                          <Box sx={{ 
                            display: 'grid', 
                            gap: 0.75, // Reduced from 1.5 to 0.75
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } // Increased to 4 columns on large screens for compactness
                          }}>
                            {stateGroup.locations.map((location: any, locationIndex: number) => {
                              const isSelected = isLocationSelected(location, stateGroup.state);
                              const isDisabled = continueButtonClicked || (selectedStateGroup !== null && selectedStateGroup !== stateGroup.state); // 🔒 SNAPSHOT PRINCIPLE: Disable after submission
                              
                              return (
                                <Paper
                                  key={`${location.suburb}-${location.state}-${location.postcode}`}
                                  elevation={isSelected ? 2 : 1} // Reduced from 3 to 2
                                  sx={{
                                    p: 0.75, // Reduced from 1.5 to 0.75
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isDisabled ? (continueButtonClicked ? 0.8 : 0.4) : 1, // 🔒 SNAPSHOT PRINCIPLE: Different opacity for read-only vs cross-state disabled
                                    bgcolor: isSelected ? 'success.100' : 'background.paper',
                                    border: '1px solid', // Reduced from 2px to 1px
                                    borderColor: isSelected ? 'success.main' : 'divider',
                                    transition: 'all 0.3s ease',
                                    transform: isSelected ? 'scale(1.01)' : 'scale(1)', // Reduced from 1.02 to 1.01
                                    position: 'relative',
                                    minHeight: '60px', // Set minimum height for consistency
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    '&:hover': isDisabled ? {} : {
                                      elevation: 2, // Reduced from 3 to 2
                                      bgcolor: isSelected ? 'success.200' : 'primary.50',
                                      borderColor: isSelected ? 'success.dark' : 'primary.light',
                                      transform: 'scale(1.005)', // Reduced hover scale
                                    },
                                    ...(isSelected && {
                                      boxShadow: '0 0 0 2px rgba(46, 125, 50, 0.15)', // Reduced from 3px to 2px
                                      '&::after': {
                                        content: '"✓"',
                                        position: 'absolute',
                                        top: 2, // Reduced from 4 to 2
                                        right: 2, // Reduced from 4 to 2
                                        backgroundColor: 'success.dark',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 16, // Reduced from 20 to 16
                                        height: 16, // Reduced from 20 to 16
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px', // Reduced from 12px to 10px
                                        fontWeight: 'bold',
                                      }
                                    })
                                  }}
                                  onClick={() => !isDisabled && handleLocationToggle(location, stateGroup.state)}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.25, fontSize: '0.8rem' }}> {/* Smaller font, reduced margin */}
                                    {location.suburb}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}> {/* Smaller font */}
                                    {location.postcode}
                                  </Typography>
                                  {location.context_hint && (
                                    <Typography variant="caption" sx={{ 
                                      color: 'text.secondary', 
                                      fontStyle: 'italic',
                                      fontSize: '0.6rem', // Smaller font for context hint
                                      display: 'block',
                                      mt: 0.25, // Reduced margin
                                      lineHeight: 1.2
                                    }}>
                                      {location.context_hint}
                                    </Typography>
                                  )}
                                </Paper>
                              );
                            })}
                          </Box>
                        </Paper>
                      ))}
                      
                      {/* Multi-Selection Summary and Continue */}
                      {selectedOptions.length > 0 && (
                        <Paper sx={{ p: 1, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircle sx={{ color: 'success.main', mr: 0.5, fontSize: 18 }} />
                              <Typography variant="caption" sx={{ fontWeight: 'medium', fontSize: '0.8rem' }}>
                                Selected {selectedOptions.length} location{selectedOptions.length > 1 ? 's' : ''} in {selectedStateGroup}
                              </Typography>
                            </Box>
                            
                            <Button
                              variant="contained"
                              size="small"
                              disabled={continueButtonClicked}
                              onClick={() => {
                                if (!continueButtonClicked && selectedOptions.length > 0) {
                                  setContinueButtonClicked(true);
                                  const locationNames = selectedOptions.map(opt => `${opt.suburb}, ${opt.state} ${opt.postcode}`).join(' and ');
                                  const continueMessage = `I meant ${locationNames}`;
                                  console.log('🎯 [MULTI-CONTINUE] Sending multi-selection message:', continueMessage);
                                  // 🚀 CRITICAL FIX: Pass workflow continuation metadata for multi-selection
                                  onSendMessage(continueMessage, {
                                    workflow_continuation: true,
                                    user_selection: {
                                      selected_locations: selectedOptions
                                    },
                                    tool_name: 'enhanced_spatial_search_tool'
                                  });
                                }
                              }}
                              sx={{
                                background: continueButtonClicked 
                                  ? 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)'
                                  : 'linear-gradient(45deg, #84fab0 30%, #8fd3f4 90%)',
                                backgroundSize: '200% 200%',
                                animation: continueButtonClicked ? 'none' : 'gradientAnimation 3s ease infinite',
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                '@keyframes gradientAnimation': {
                                  '0%': { backgroundPosition: '0% 50%' },
                                  '50%': { backgroundPosition: '100% 50%' },
                                  '100%': { backgroundPosition: '0% 50%' },
                                },
                              }}
                            >
                              Continue ({selectedOptions.length})
                            </Button>
                          </Box>
                          
                          {/* Selected Locations List */}
                          <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                            {selectedOptions.map((option, index) => (
                              <Chip
                                key={`selected-${option.suburb}-${option.state}-${option.postcode}`}
                                label={`${option.suburb}, ${option.state} ${option.postcode}`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Paper>
                      )}
                      
                      {/* 🔒 SNAPSHOT PRINCIPLE: Read-only completion indicator */}
                      {continueButtonClicked && (
                        <Paper sx={{ 
                          p: 1.5, 
                          mt: 2, 
                          bgcolor: 'info.50', 
                          border: '1px solid', 
                          borderColor: 'info.main',
                          borderRadius: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: 'info.main', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'info.dark', fontStyle: 'italic' }}>
                              Location selection completed. This interaction is now read-only.
                            </Typography>
                          </Box>
                        </Paper>
                      )}
                    </Box>
                  ) : (
                    // 🔄 BACKWARD COMPATIBILITY: Single-Selection UI (existing functionality)
                    <>
                      <Box sx={{ 
                        display: 'grid', 
                        gap: 1.5,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
                      }}>
                        {(disambiguationRequest?.options || []).map((option: any, index: number) => (
                          <Paper
                            key={`single-${index}`}
                            elevation={2}
                            sx={{
                              p: 2,
                              cursor: selectedLocationIndex !== null ? (selectedLocationIndex === index ? 'default' : 'not-allowed') : 'pointer',
                              opacity: selectedLocationIndex !== null && selectedLocationIndex !== index ? 0.4 : 1,
                              bgcolor: selectedLocationIndex === index ? 'success.100' : 'background.paper',
                              border: '3px solid',
                              borderColor: selectedLocationIndex === index ? 'success.main' : 'divider',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              transform: selectedLocationIndex === index ? 'scale(1.02)' : 'scale(1)',
                              '&:hover': selectedLocationIndex === index ? {
                                bgcolor: 'success.200',
                                transform: 'scale(1.02)',
                              } : {
                                elevation: 8,
                                bgcolor: 'primary.50',
                                transform: 'translateY(-3px) scale(1.01)',
                                boxShadow: '0 8px 25px rgba(31, 170, 188, 0.2)',
                                borderColor: 'primary.light'
                              },
                              borderRadius: 2,
                              position: 'relative',
                              ...(selectedLocationIndex === index && {
                                boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.15), 0 4px 20px rgba(46, 125, 50, 0.1)',
                                '&::after': {
                                  content: '"✓"',
                                  position: 'absolute',
                                  top: 6,
                                  right: 6,
                                  backgroundColor: 'success.dark',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: 28,
                                  height: 28,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
                                  border: '2px solid white'
                                }
                              })
                            }}
                            onClick={() => {
                              if (selectedLocationIndex !== null) {
                                return;
                              }

                              setSelectedLocationIndex(index);

                              if (onUpdateMessage && messageId) {
                                const selectionMetadata = {
                                  clarification_type: 'location_disambiguation',
                                  disambiguation_request: disambiguationRequest,
                                  location_selection: {
                                    selectedOptionIndex: index,
                                    selectedOption: option,
                                    timestamp: new Date().toISOString()
                                  }
                                };
                                onUpdateMessage(messageId, selectionMetadata);
                              }

                              console.log('🎯 [SNAPSHOT] Location selected and preserved in UI. User can continue conversation manually.');
                              console.log(`💡 [SUGGESTED] User could type: "I meant ${option.suburb}, ${option.state} ${option.postcode}"`);
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {option.suburb}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              {option.state} • {option.postcode}
                            </Typography>
                            
                            {option.context_hint && (
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary', 
                                fontStyle: 'italic',
                                display: 'block'
                              }}>
                                {option.context_hint}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Box>
                      
                      {/* Single-Selection Continue Button */}
                      {selectedLocationIndex !== null && (
                        <Box sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          {/* Selected location display */}
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' }}>
                            <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {disambiguationRequest?.options?.[selectedLocationIndex]?.suburb}, {disambiguationRequest?.options?.[selectedLocationIndex]?.state} {disambiguationRequest?.options?.[selectedLocationIndex]?.postcode}
                            </Typography>
                          </Box>
                          
                          {/* Enhanced Continue Button */}
                          <Button
                            variant="contained"
                            size="small"
                            disabled={continueButtonClicked}
                            onClick={() => {
                              if (continueButtonClicked) return;

                              setContinueButtonClicked(true);

                              const selectedOption = disambiguationRequest?.options?.[selectedLocationIndex];
                              if (selectedOption && onSendMessage) {
                                const continueMessage = `I meant ${selectedOption.suburb}, ${selectedOption.state} ${selectedOption.postcode}`;
                                // 🚀 CRITICAL FIX: Pass workflow continuation metadata so backend knows to continue dual disambiguation workflow
                                onSendMessage(continueMessage, {
                                  workflow_continuation: true,
                                  user_selection: {
                                    selected_locations: [selectedOption]
                                  },
                                  tool_name: 'enhanced_spatial_search_tool'
                                });
                              }
                            }}
                            endIcon={<ArrowForward sx={{ 
                              fontSize: 16, 
                              color: continueButtonClicked ? 'rgba(255, 255, 255, 0.7)' : 'white' 
                            }} />}
                            sx={{
                              minWidth: 'auto',
                              px: 2,
                              py: 0.5,
                              color: 'white',
                              fontSize: '0.875rem',
                              fontWeight: 'medium',
                              textTransform: 'none',
                              borderRadius: '20px',
                              position: 'relative',
                              overflow: 'hidden',
                              zIndex: 1,
                              background: continueButtonClicked 
                                ? 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)'  // Grayscale when disabled
                                : 'linear-gradient(45deg, #84fab0 30%, #8fd3f4 90%)', // Macaroon blue-green gradient
                              backgroundSize: '200% 200%',
                              animation: continueButtonClicked ? 'none' : 'gradientAnimation 3s ease infinite',
                              boxShadow: continueButtonClicked 
                                ? '0 1px 3px rgba(0,0,0,0.2)'
                                : '0 3px 5px 2px rgba(143, 211, 244, .3)',
                              opacity: continueButtonClicked ? 0.7 : 1,
                              cursor: continueButtonClicked ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': continueButtonClicked ? {} : {
                                transform: 'scale(1.05)',
                                boxShadow: '0 5px 10px 3px rgba(143, 211, 244, .5)',
                                backgroundPosition: 'right center',
                              },
                              '&:disabled': {
                                background: 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)',
                                color: 'rgba(255, 255, 255, 0.7)',
                                cursor: 'not-allowed',
                              },
                              '@keyframes gradientAnimation': {
                                '0%': { backgroundPosition: '0% 50%' },
                                '50%': { backgroundPosition: '100% 50%' },
                                '100%': { backgroundPosition: '0% 50%' },
                              },
                            }}
                          >
                            Continue
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );
      }
      break;
      
    case 'Message':
      if (renderInstruction.text) {
        return (
          <Box>
            {guidanceDisplay}
            <Box sx={{ my: 1 }}>
              <MarkdownMessage
                content={renderInstruction.text}
                isUser={false}
              />
              
              {/* 🌍 LOCATION DISAMBIGUATION: Location selection UI for ambiguous locations */}
              {messageMetadata?.clarification_type === 'location_disambiguation' && 
               (messageMetadata?.disambiguation_request?.options || messageMetadata?.disambiguation_request?.state_groups) && 
               onSendMessage && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    🏡 Choose Your Location
                  </Typography>
                  
                  {/* 🆕 PHASE 3: Check if we have state groups for multi-selection */}
                  {multiSelectionMode && messageMetadata?.disambiguation_request?.state_groups ? (
                    // 🆕 NEW: Grouped Multi-Select UI
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {messageMetadata.disambiguation_request.state_groups.map((stateGroup) => (
                        <Paper
                          key={stateGroup.state}
                          elevation={1}
                          sx={{
                            p: 2,
                            border: '2px solid',
                            borderColor: selectedStateGroup === stateGroup.state ? 'primary.main' : 'divider',
                            backgroundColor: selectedStateGroup === stateGroup.state ? 'primary.50' : 'background.paper',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {/* State Group Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {stateGroup.state_name}
                              </Typography>
                              <Chip 
                                label={`${stateGroup.locations.length} locations`} 
                                size="small" 
                                sx={{ ml: 2, bgcolor: 'primary.100', color: 'primary.dark' }}
                              />
                            </Box>
                            
                            {/* Select All Button for State Group */}
                            {stateGroup.can_select_all && (selectedStateGroup === null || selectedStateGroup === stateGroup.state) && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleSelectAllInState(stateGroup)}
                                disabled={continueButtonClicked || (selectedOptions.length > 0 && selectedStateGroup !== stateGroup.state)} // 🔒 SNAPSHOT PRINCIPLE: Disable after submission
                                sx={{
                                  borderColor: 'primary.main',
                                  color: 'primary.main',
                                  '&:hover': {
                                    backgroundColor: 'primary.50',
                                    borderColor: 'primary.dark',
                                  },
                                }}
                              >
                                Select All in {stateGroup.state}
                              </Button>
                            )}
                          </Box>
                          
                          {/* Location Options within State Group */}
                  <Box sx={{ 
                    display: 'grid', 
                    gap: 1.5,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
                  }}>
                            {stateGroup.locations.map((location, locationIndex) => {
                              const isSelected = isLocationSelected(location, stateGroup.state);
                              const isDisabled = continueButtonClicked || (selectedStateGroup !== null && selectedStateGroup !== stateGroup.state); // 🔒 SNAPSHOT PRINCIPLE: Disable after submission
                              
                              return (
                      <Paper
                                  key={`${location.suburb}-${location.state}-${location.postcode}`}
                                  elevation={isSelected ? 3 : 1}
                                  sx={{
                                    p: 1.5,
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isDisabled ? (continueButtonClicked ? 0.8 : 0.4) : 1, // 🔒 SNAPSHOT PRINCIPLE: Different opacity for read-only vs cross-state disabled
                                    bgcolor: isSelected ? 'success.100' : 'background.paper',
                                    border: '2px solid',
                                    borderColor: isSelected ? 'success.main' : 'divider',
                                    transition: 'all 0.3s ease',
                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                    position: 'relative',
                                    '&:hover': isDisabled ? {} : {
                                      elevation: 3,
                                      bgcolor: isSelected ? 'success.200' : 'primary.50',
                                      borderColor: isSelected ? 'success.dark' : 'primary.light',
                                      transform: 'scale(1.01)',
                                    },
                                    ...(isSelected && {
                                      boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.15)',
                                      '&::after': {
                                        content: '"✓"',
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        backgroundColor: 'success.dark',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 20,
                                        height: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                      }
                                    })
                                  }}
                                  onClick={() => !isDisabled && handleLocationToggle(location, stateGroup.state)}
                                >
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {location.suburb}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {location.postcode}
                                  </Typography>
                                  {location.context_hint && (
                                    <Typography variant="caption" sx={{ 
                                      color: 'text.secondary', 
                                      fontStyle: 'italic',
                                      display: 'block',
                                      mt: 0.5
                                    }}>
                                      {location.context_hint}
                                    </Typography>
                                  )}
                                </Paper>
                              );
                            })}
                          </Box>
                        </Paper>
                      ))}
                      
                      {/* Multi-Selection Summary and Continue */}
                      {selectedOptions.length > 0 && (
                        <Paper sx={{ p: 1, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircle sx={{ color: 'success.main', mr: 0.5, fontSize: 18 }} />
                              <Typography variant="caption" sx={{ fontWeight: 'medium', fontSize: '0.8rem' }}>
                                Selected {selectedOptions.length} location{selectedOptions.length > 1 ? 's' : ''} in {selectedStateGroup}
                              </Typography>
                            </Box>
                            
                            <Button
                              variant="contained"
                              size="small"
                              disabled={continueButtonClicked}
                              onClick={() => {
                                if (!continueButtonClicked && selectedOptions.length > 0) {
                                  setContinueButtonClicked(true);
                                  const locationNames = selectedOptions.map(opt => `${opt.suburb}, ${opt.state} ${opt.postcode}`).join(' and ');
                                  const continueMessage = `I meant ${locationNames}`;
                                  console.log('🎯 [MULTI-CONTINUE] Sending multi-selection message:', continueMessage);
                                  // 🚀 CRITICAL FIX: Pass workflow continuation metadata for multi-selection
                                  onSendMessage(continueMessage, {
                                    workflow_continuation: true,
                                    user_selection: {
                                      selected_locations: selectedOptions
                                    },
                                    tool_name: 'enhanced_spatial_search_tool'
                                  });
                                }
                              }}
                              sx={{
                                background: continueButtonClicked 
                                  ? 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)'
                                  : 'linear-gradient(45deg, #84fab0 30%, #8fd3f4 90%)',
                                backgroundSize: '200% 200%',
                                animation: continueButtonClicked ? 'none' : 'gradientAnimation 3s ease infinite',
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                '@keyframes gradientAnimation': {
                                  '0%': { backgroundPosition: '0% 50%' },
                                  '50%': { backgroundPosition: '100% 50%' },
                                  '100%': { backgroundPosition: '0% 50%' },
                                },
                              }}
                            >
                              Continue ({selectedOptions.length})
                            </Button>
                          </Box>
                          
                          {/* Selected Locations List */}
                          <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                            {selectedOptions.map((option, index) => (
                              <Chip
                                key={`selected-${option.suburb}-${option.state}-${option.postcode}`}
                                label={`${option.suburb}, ${option.state} ${option.postcode}`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Paper>
                      )}
                      
                      {/* 🔒 SNAPSHOT PRINCIPLE: Read-only completion indicator */}
                      {continueButtonClicked && (
                        <Paper sx={{ 
                          p: 1.5, 
                          mt: 2, 
                          bgcolor: 'info.50', 
                          border: '1px solid', 
                          borderColor: 'info.main',
                          borderRadius: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: 'info.main', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'info.dark', fontStyle: 'italic' }}>
                              Location selection completed. This interaction is now read-only.
                            </Typography>
                          </Box>
                        </Paper>
                      )}
                    </Box>
                  ) : (
                    // 🔄 BACKWARD COMPATIBILITY: Single-Selection UI (existing functionality)
                    <>
                      <Box sx={{ 
                        display: 'grid', 
                        gap: 1.5,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
                      }}>
                        {(messageMetadata?.disambiguation_request?.options || []).map((option, index) => (
                          <Paper
                            key={`single-${index}`}
                        elevation={2}
                        sx={{
                          p: 2,
                          cursor: selectedLocationIndex !== null ? (selectedLocationIndex === index ? 'default' : 'not-allowed') : 'pointer',
                          opacity: selectedLocationIndex !== null && selectedLocationIndex !== index ? 0.4 : 1,
                          bgcolor: selectedLocationIndex === index ? 'success.100' : 'background.paper',
                          border: '3px solid',
                          borderColor: selectedLocationIndex === index ? 'success.main' : 'divider',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: selectedLocationIndex === index ? 'scale(1.02)' : 'scale(1)',
                          '&:hover': selectedLocationIndex === index ? {
                            bgcolor: 'success.200',
                            transform: 'scale(1.02)',
                          } : {
                            elevation: 8,
                            bgcolor: 'primary.50',
                            transform: 'translateY(-3px) scale(1.01)',
                            boxShadow: '0 8px 25px rgba(31, 170, 188, 0.2)',
                            borderColor: 'primary.light'
                          },
                          borderRadius: 2,
                          position: 'relative',
                          ...(selectedLocationIndex === index && {
                            boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.15), 0 4px 20px rgba(46, 125, 50, 0.1)',
                            '&::after': {
                              content: '"✓"',
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              backgroundColor: 'success.dark',
                              color: 'white',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
                              border: '2px solid white'
                            }
                          })
                        }}
                        onClick={() => {
                          if (selectedLocationIndex !== null) {
                                return;
                          }

                          setSelectedLocationIndex(index);

                          if (onUpdateMessage && messageId) {
                            const selectionMetadata = {
                              clarification_type: messageMetadata?.clarification_type || 'location_disambiguation',
                              disambiguation_request: messageMetadata?.disambiguation_request,
                              location_selection: {
                                selectedOptionIndex: index,
                                selectedOption: option,
                                timestamp: new Date().toISOString()
                              }
                            };
                            onUpdateMessage(messageId, selectionMetadata);
                          }

                              console.log('🎯 [SNAPSHOT] Location selected and preserved in UI. User can continue conversation manually.');
                              console.log(`💡 [SUGGESTED] User could type: "I meant ${option.suburb}, ${option.state} ${option.postcode}"`);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {option.suburb}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {option.state} • {option.postcode}
                        </Typography>
                        
                        {option.context_hint && (
                          <Typography variant="caption" sx={{ 
                            color: 'text.secondary', 
                            fontStyle: 'italic',
                            display: 'block'
                          }}>
                            {option.context_hint}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                  
                  <Typography variant="body2" sx={{ 
                    mt: 2, 
                    color: 'text.secondary', 
                    textAlign: 'center',
                    fontStyle: 'italic' 
                  }}>
                    💡 Click on a location to continue your property search
                  </Typography>

                  {selectedLocationIndex !== null && onSendMessage && (
                    <Box sx={{ 
                      mt: 2, 
                      pt: 2, 
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' }}>
                        <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {messageMetadata?.disambiguation_request?.options?.[selectedLocationIndex]?.suburb}, {messageMetadata?.disambiguation_request?.options?.[selectedLocationIndex]?.state} {messageMetadata?.disambiguation_request?.options?.[selectedLocationIndex]?.postcode}
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="text"
                        size="small"
                        disabled={continueButtonClicked}
                        onClick={() => {
                          const selectedOption = messageMetadata?.location_selection?.selectedOption ||
                                                 messageMetadata?.disambiguation_request?.options?.[selectedLocationIndex];
                          if (selectedOption && onSendMessage && !continueButtonClicked) {
                            setContinueButtonClicked(true);
                            const continueMessage = `I meant ${selectedOption.suburb}, ${selectedOption.state} ${selectedOption.postcode}`;
                            console.log('🎯 [CONTINUE] Sending continuation message on behalf of user:', continueMessage);
                            // 🚀 CRITICAL FIX: Pass workflow continuation metadata so backend knows to continue dual disambiguation workflow
                            onSendMessage(continueMessage, {
                              workflow_continuation: true,
                              user_selection: {
                                selected_locations: [selectedOption]
                              },
                              tool_name: 'enhanced_spatial_search_tool'
                            });
                          }
                        }}
                        endIcon={<ArrowForward sx={{ 
                          fontSize: 16, 
                          color: continueButtonClicked ? 'rgba(255, 255, 255, 0.7)' : 'white' 
                        }} />}
                        sx={{
                          minWidth: 'auto',
                          px: 3,
                          py: 1,
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          borderRadius: 2,
                          background: continueButtonClicked 
                            ? 'linear-gradient(-45deg, #A0A0A0, #808080, #606060, #404040)' 
                            : 'linear-gradient(-45deg, #87CEEB, #40E0D0, #00CED1, #20B2AA)',
                          backgroundSize: '400% 400%',
                          animation: continueButtonClicked ? 'none' : 'gradient-flow 3s ease infinite',
                          boxShadow: continueButtonClicked 
                            ? '0 1px 3px rgba(0, 0, 0, 0.2)' 
                            : '0 2px 8px rgba(135, 206, 235, 0.3)',
                          border: 'none',
                          opacity: continueButtonClicked ? 0.6 : 1,
                          cursor: continueButtonClicked ? 'not-allowed' : 'pointer',
                          '&:hover': continueButtonClicked ? {} : {
                            transform: 'translateX(2px) scale(1.02)',
                            boxShadow: '0 4px 12px rgba(135, 206, 235, 0.4)',
                            background: 'linear-gradient(-45deg, #20B2AA, #40E0D0, #87CEEB, #00CED1)',
                            backgroundSize: '400% 400%',
                          },
                          '&:active': continueButtonClicked ? {} : {
                            transform: 'translateX(1px) scale(0.98)'
                          },
                          '&:disabled': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            background: 'linear-gradient(-45deg, #A0A0A0, #808080, #606060, #404040)',
                            animation: 'none',
                            transform: 'none',
                            cursor: 'not-allowed'
                          },
                          transition: 'all 0.2s ease-in-out',
                          '@keyframes gradient-flow': {
                            '0%': { backgroundPosition: '0% 50%' },
                            '50%': { backgroundPosition: '100% 50%' },
                            '100%': { backgroundPosition: '0% 50%' }
                          }
                        }}
                      >
                        Continue
                      </Button>
                    </Box>
                  )}
                    </>
                  )}
                  
                  {/* Help Text */}
                  <Typography variant="body2" sx={{ 
                    mt: 2, 
                    color: 'text.secondary', 
                    textAlign: 'center',
                    fontStyle: 'italic' 
                  }}>
                    {multiSelectionMode && messageMetadata?.disambiguation_request?.state_groups
                      ? '💡 Select multiple locations within the same state, or choose "Select All" for a state'
                      : '💡 Click on a location to continue your property search'
                    }
                  </Typography>
                </Box>
              )}
              
              {/* 🎯 MILESTONE 3.2: Interactive Sample Query Buttons */}
              {renderInstruction.interactive && renderInstruction.sample_queries && onSendMessage && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                    💡 Try these sample queries to get started:
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1.5,
                    maxWidth: '100%'
                  }}>
                    {renderInstruction.sample_queries.map((sq: any, index: number) => {
                      // 🎯 MILESTONE 3.2: Handle object-based sample queries from backend
                      const queryText = typeof sq === 'string' ? sq : sq.query;
                      const category = typeof sq === 'object' && sq.category ? sq.category : 'Sample Query';
                      
                      // Map emoji icons to Material-UI components  
                      const getIconFromEmoji = (emojiIcon: string) => {
                        switch (emojiIcon) {
                          case '💰': return <AttachMoney />;
                          case '📍': return <LocationOn />;
                          case '🛏️': return <Bed />;
                          case '📚': return <LocalLibrary />;
                          default: return <AutoAwesome />;
                        }
                      };
                      
                      // Use emoji icon if available, otherwise use AutoAwesome fallback
                      const icon = (typeof sq === 'object' && sq.icon) 
                        ? getIconFromEmoji(sq.icon)
                        : <AutoAwesome />;
                      
                      return (
                        <Button
                          key={index}
                          variant="outlined"
                          startIcon={icon}
                          onClick={() => onSendMessage(queryText)}
                          sx={{
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            py: 1.5,
                            px: 2,
                            borderColor: '#0d2b2c',
                            color: '#0d2b2c',
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            '&:hover': {
                              borderColor: '#177a87',
                              backgroundColor: 'rgba(31, 170, 188, 0.04)',
                              color: '#177a87'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          >
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              {queryText}
                            </Typography>
                          </Box>
                        </Button>
                      );
                    })}
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: 'text.secondary' }}>
                    Click any sample query above to execute it automatically
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      }
      break;
      
    // 🎯 STEP 5B: PropertySuggestions case - Display property search suggestions
    case 'PropertySuggestions':
      if (renderInstruction.suggestions) {
        return (
          <Box>
            {guidanceDisplay}
            <PropertySuggestions 
              suggestions={renderInstruction.suggestions}
              title={renderInstruction.title}
              subtitle={renderInstruction.subtitle}
              originalQuery={renderInstruction.original_query}
              onSendMessage={onSendMessage}
              messageId={messageId}
              onUpdateMessage={onUpdateMessage}
              messageMetadata={messageMetadata}
            />
          </Box>
        );
      }
      break;
      
    default:
      // For unknown render instruction types, show a debug view in development
      if (process.env.NODE_ENV === 'development') {
        return (
          <Box sx={{ my: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Unknown render instruction type: {type}
            </Typography>
            <pre style={{ fontSize: '0.75rem', marginTop: 4 }}>
              {JSON.stringify(renderInstruction, null, 2)}
            </pre>
          </Box>
        );
      }
      break;
  }

  // If we have guidance context but no render instruction content, show guidance only
  if (guidanceDisplay) {
    return guidanceDisplay;
  }

  return null;
};

export default RenderInstructionDisplay;
