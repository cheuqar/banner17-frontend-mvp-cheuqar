/**
 * Map Layer Configuration Types
 * Phase 2.45 - Map Layer Legend System
 * =====================================
 *
 * Defines the layer registry and configuration for the map legend component.
 * Designed for easy expansion with future layers (heritage, flood risk, bushfire).
 */

/**
 * Layer category for grouping in legend
 * - poi: Points of interest (schools, amenities)
 * - overlay: Visual overlays (boundaries, catchments)
 * - risk: Risk assessment layers (flood, bushfire)
 */
export type LayerCategory = 'poi' | 'overlay' | 'risk';

/**
 * Configuration for a single map layer
 */
export interface MapLayerConfig {
  /** Unique identifier for the layer */
  id: string;
  /** Display name shown in legend */
  name: string;
  /** Color for the teardrop icon */
  color: string;
  /** Category for grouping */
  category: LayerCategory;
  /** Whether this layer is currently visible on map */
  isActive?: boolean;
  /** Optional count of items in this layer */
  count?: number;
}

/**
 * Layer colors matching marker implementations
 * These should stay in sync with:
 * - SchoolMarkerLayer.tsx: SCHOOL_CLUSTER_COLOR
 * - AmenityMarkerLayer.tsx: getCategoryColor()
 * - PriceMarkerIcon.tsx: property markers
 */
export const LAYER_COLORS: Record<string, string> = {
  // Schools
  schools: '#F9A825', // Amber (Google Maps education style)

  // Amenities (match getCategoryColor in AmenityMarkerLayer.tsx)
  hospitals: '#d32f2f', // Red
  libraries: '#7b1fa2', // Purple
  shopping: '#f57c00', // Orange
  universities: '#1976d2', // Blue
  tourist_attractions: '#388e3c', // Green
  beaches: '#0288d1', // Light Blue
  sports: '#c2185b', // Pink
  child_care: '#e91e63', // Pink
  transport_stations: '#607d8b', // Blue Grey

  // Amenity clusters (mixed categories)
  amenities_mixed: '#5C6BC0', // Indigo

  // Future layers
  heritage: '#8B4513', // Brown
  flood_risk: '#2196F3', // Blue
  bushfire: '#FF5722', // Deep Orange

  // Properties (for reference, not in legend)
  properties: '#0b2d2c', // Theme dark
};

/**
 * Default layer configurations
 * Properties are excluded (always visible)
 */
export const MAP_LAYER_CONFIGS: MapLayerConfig[] = [
  // Schools
  {
    id: 'schools',
    name: 'Schools',
    color: LAYER_COLORS.schools,
    category: 'poi',
  },

  // Amenities by category
  {
    id: 'amenities_hospitals',
    name: 'Hospitals',
    color: LAYER_COLORS.hospitals,
    category: 'poi',
  },
  {
    id: 'amenities_libraries',
    name: 'Libraries',
    color: LAYER_COLORS.libraries,
    category: 'poi',
  },
  {
    id: 'amenities_shopping',
    name: 'Shopping',
    color: LAYER_COLORS.shopping,
    category: 'poi',
  },
  {
    id: 'amenities_universities',
    name: 'Universities/TAFE',
    color: LAYER_COLORS.universities,
    category: 'poi',
  },
  {
    id: 'amenities_tourist',
    name: 'Tourist Attractions',
    color: LAYER_COLORS.tourist_attractions,
    category: 'poi',
  },
  {
    id: 'amenities_beaches',
    name: 'Beaches',
    color: LAYER_COLORS.beaches,
    category: 'poi',
  },
  {
    id: 'amenities_sports',
    name: 'Sports/Recreation',
    color: LAYER_COLORS.sports,
    category: 'poi',
  },
  {
    id: 'amenities_transport',
    name: 'Transport Stations',
    color: LAYER_COLORS.transport_stations,
    category: 'poi',
  },

  // Future layers (commented out until implemented)
  // {
  //   id: 'heritage',
  //   name: 'Heritage Sites',
  //   color: LAYER_COLORS.heritage,
  //   category: 'overlay',
  // },
  // {
  //   id: 'flood_risk',
  //   name: 'Flood Risk',
  //   color: LAYER_COLORS.flood_risk,
  //   category: 'risk',
  // },
  // {
  //   id: 'bushfire',
  //   name: 'Bushfire Prone',
  //   color: LAYER_COLORS.bushfire,
  //   category: 'risk',
  // },
];

/**
 * Get layer config by ID
 */
export const getLayerConfig = (layerId: string): MapLayerConfig | undefined => {
  return MAP_LAYER_CONFIGS.find(layer => layer.id === layerId);
};

/**
 * Get layers by category
 */
export const getLayersByCategory = (category: LayerCategory): MapLayerConfig[] => {
  return MAP_LAYER_CONFIGS.filter(layer => layer.category === category);
};
