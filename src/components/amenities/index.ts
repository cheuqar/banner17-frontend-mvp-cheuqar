/**
 * Amenities Components - Phase 4: Amenities Selection UX Overhaul
 * ===============================================================
 *
 * Export all amenities-related components for dual disambiguation workflow.
 * These components provide a complete amenities selection experience with
 * compact UI, map integration, and seamless view switching.
 */

// Core Components
export { default as CompactAmenitiesList } from './CompactAmenitiesList';
export type { AmenityItem, CompactAmenitiesListProps } from './CompactAmenitiesList';

export { default as MapViewToggle } from './MapViewToggle';
export type { ViewMode, MapViewToggleProps } from './MapViewToggle';

export { default as AmenitiesSelectionMap } from './AmenitiesSelectionMap';
export type { AmenityMapItem, AmenitiesSelectionMapProps } from './AmenitiesSelectionMap';

// Unified Component
export { default as AmenitiesView } from './AmenitiesView';
export type { AmenitiesViewData, AmenitiesViewProps } from './AmenitiesView';