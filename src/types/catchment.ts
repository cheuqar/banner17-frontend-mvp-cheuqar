/**
 * TypeScript interfaces for School Catchment Boundary data
 * Enhanced Spatial Search Phase 3 - Frontend Integration
 * =====================================================
 *
 * These interfaces define the structure of school catchment boundary data
 * received from the Enhanced Spatial Search Tool and used by React components
 * for interactive map rendering.
 *
 * Key Features:
 * - GeoJSON Feature format compatibility
 * - Primary and secondary school catchment support
 * - School metadata for interactive popups
 * - Type safety for coordinate data
 * - Integration with existing property map components
 */

/**
 * School metadata included with catchment boundaries
 */
export interface SchoolMetadata {
  /** School subtype (Primary School, Secondary School, etc.) */
  subtype: string;

  /** Full street address */
  address: string;

  /** Suburb name */
  suburb: string;

  /** Postcode */
  postcode: string;

  /** School latitude coordinate */
  latitude: number;

  /** School longitude coordinate */
  longitude: number;

  /** Catchment level: 'primary' or 'secondary' */
  catchment_level: 'primary' | 'secondary';

  /** Additional school details from database */
  school_details?: {
    /** School gender type */
    gender?: string;

    /** School denomination */
    denomination?: string;

    /** Whether school is selective */
    selective_school?: string;

    /** Opportunity class availability */
    opportunity_class?: boolean;

    /** Special needs support */
    special_needs?: string;

    /** Boarding school availability */
    boarding_school?: string;

    /** HSC average ATAR in NSW */
    hsc_avg_atar_nsw?: number;

    /** State ranking */
    state_rank?: number;
  };

  /** Year availability for enrollment */
  year_availability?: {
    kindergarten?: string;
    year1?: string;
    year2?: string;
    year3?: string;
    year4?: string;
    year5?: string;
    year6?: string;
    year7?: string;
    year8?: string;
    year9?: string;
    year10?: string;
    year11?: string;
    year12?: string;
  };

  /** School priority information */
  priority?: string | null;

  /** Calendar year for this data */
  calendar_year?: number;
}

/**
 * GeoJSON Feature properties for catchment boundaries
 */
export interface CatchmentBoundaryProperties {
  /** Unique catchment identifier */
  catchment_id: string;

  /** School name */
  school_name: string;

  /** School ID in database */
  school_id: string;

  /** Catchment level */
  catchment_level: 'primary' | 'secondary';

  /** Complete school metadata */
  school_metadata: SchoolMetadata;
}

/**
 * GeoJSON Polygon geometry for catchment boundaries
 * Coordinates format: [[[longitude, latitude], [longitude, latitude], ...]]
 */
export interface CatchmentBoundaryGeometry {
  /** Geometry type - always 'Polygon' for catchment boundaries */
  type: 'Polygon';

  /**
   * Polygon coordinates as nested arrays
   * Format: [[[longitude, latitude], [longitude, latitude], ...]]
   * First ring is exterior boundary, additional rings are holes
   */
  coordinates: number[][][];
}

/**
 * Complete GeoJSON Feature for school catchment boundary
 */
export interface CatchmentBoundaryFeature {
  /** Feature type - always 'Feature' */
  type: 'Feature';

  /** Catchment boundary properties */
  properties: CatchmentBoundaryProperties;

  /** Polygon geometry with coordinates */
  geometry: CatchmentBoundaryGeometry;
}

/**
 * Enhanced Spatial Search Tool response containing catchment data
 */
export interface EnhancedSpatialSearchResponse {
  /** Disambiguation action taken by the tool */
  disambiguation_action: string;

  /** Location result from spatial search */
  location_result?: {
    display_name: string;
    latitude: number;
    longitude: number;
    source: string;
    confidence: number;
  };

  /** Search parameters for property search */
  search_params?: {
    radius: number;
    property_type?: string;
    bedrooms_min?: number;
    bedrooms_max?: number;
    price_min?: number;
    price_max?: number;
    bathrooms_min?: number;
  };

  /** Whether ready for property search */
  ready_for_property_search?: boolean;

  /** Whether this response includes school catchment boundary */
  has_school_catchment?: boolean;

  /** School catchment boundary data (if available) */
  catchment_boundary?: CatchmentBoundaryFeature;

  /** Processing metadata */
  metadata?: {
    processing_time_ms: number;
    [key: string]: any;
  };
}

/**
 * Map component props for displaying catchment boundaries
 */
export interface CatchmentMapProps {
  /** Array of catchment boundaries to display */
  catchmentBoundaries: CatchmentBoundaryFeature[];

  /** Whether to show primary school catchments */
  showPrimary: boolean;

  /** Whether to show secondary school catchments */
  showSecondary: boolean;

  /** Map center coordinates */
  center: [number, number];

  /** Map zoom level */
  zoom: number;

  /** Callback when a catchment boundary is clicked */
  onCatchmentClick?: (catchment: CatchmentBoundaryFeature) => void;

  /** Callback when catchment popup is closed */
  onPopupClose?: () => void;

  /** Currently selected catchment for popup display */
  selectedCatchment?: CatchmentBoundaryFeature | null;

  /** Additional properties */
  [key: string]: any;
}

/**
 * Catchment boundary display options
 */
export interface CatchmentDisplayOptions {
  /** Primary school boundary color */
  primaryColor: string;

  /** Secondary school boundary color */
  secondaryColor: string;

  /** Fill color for catchment polygons (optional, uses desaturated grey-green by default) */
  fillColor?: string;

  /** Boundary line weight */
  weight: number;

  /** Boundary opacity */
  opacity: number;

  /** Fill opacity */
  fillOpacity: number;

  /** Whether boundaries are interactive */
  interactive: boolean;
}

/**
 * Catchment boundary toggle control props
 */
export interface CatchmentToggleProps {
  /** Whether primary catchments are visible */
  showPrimary: boolean;

  /** Whether secondary catchments are visible */
  showSecondary: boolean;

  /** Callback when primary toggle changes */
  onPrimaryToggle: (show: boolean) => void;

  /** Callback when secondary toggle changes */
  onSecondaryToggle: (show: boolean) => void;

  /** Count of primary catchments available */
  primaryCount?: number;

  /** Count of secondary catchments available */
  secondaryCount?: number;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * School information popup props
 */
export interface SchoolPopupProps {
  /** Catchment boundary feature with school data */
  catchment: CatchmentBoundaryFeature;

  /** Whether popup is open */
  isOpen: boolean;

  /** Callback when popup closes */
  onClose: () => void;

  /** Popup position on map */
  position: [number, number];

  /** Additional popup content */
  children?: React.ReactNode;
}

/**
 * Utility types for catchment data processing
 */

/** Type guard to check if response has catchment data */
export const hasCatchmentBoundary = (
  response: any
): response is EnhancedSpatialSearchResponse & { catchment_boundary: CatchmentBoundaryFeature } => {
  return response?.has_school_catchment === true && response?.catchment_boundary;
};

/** Extract coordinates from catchment boundary for map bounds calculation */
export const extractCatchmentCoordinates = (
  catchment: CatchmentBoundaryFeature
): [number, number][] => {
  try {
    const coordinates = catchment.geometry.coordinates[0]; // First ring (exterior boundary)
    return coordinates.map(([lng, lat]) => [lat, lng]); // Swap to [lat, lng] for Leaflet
  } catch (error) {
    console.error('Error extracting catchment coordinates:', error);
    return [];
  }
};

/** Calculate bounding box for multiple catchment boundaries */
export const calculateCatchmentBounds = (
  catchments: CatchmentBoundaryFeature[]
): [[number, number], [number, number]] | null => {
  if (catchments.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  catchments.forEach(catchment => {
    const coords = extractCatchmentCoordinates(catchment);
    coords.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
  });

  return [[minLat, minLng], [maxLat, maxLng]];
};

/**
 * Default display options for catchment boundaries
 * Style4-V2 Theme: Desaturated grey-green fill with theme primary border
 */
export const DEFAULT_CATCHMENT_DISPLAY_OPTIONS: CatchmentDisplayOptions = {
  primaryColor: '#0b2d2c', // Theme primary for border (all school types)
  secondaryColor: '#0b2d2c', // Theme primary for border (all school types)
  fillColor: '#8a9a8a', // Desaturated grey-green for all catchments
  weight: 2,
  opacity: 0.8,
  fillOpacity: 0.2,
  interactive: true,
};

/**
 * Export all types for external use
 */
export type {
  CatchmentBoundaryFeature as CatchmentBoundary,
  CatchmentBoundaryProperties as CatchmentProperties,
  CatchmentBoundaryGeometry as CatchmentGeometry,
};