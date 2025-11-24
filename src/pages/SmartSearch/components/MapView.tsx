import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents, FeatureGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { RootState } from '../../../store';
import { useAppDispatch, useAppSelector } from '../../../store';
import type { BaseProperty } from '../../../types/property-enhanced';
import { setMapBounds, setManualMapMove, searchByBounds, loadMoreProperties, setMapPosition, setDrawMode, clearDrawnPolygons, addDrawnPolygon, computeDrawnPolygonUnion, performSearch, startAutoSearchCountdown, cancelAutoSearchCountdown, setShowCatchmentRadius, setActiveSpatialFilter, selectShowCatchmentRadius, clearMapCenter } from '../../../store/slices/smartSearchSlice';
// Phase 2.12.2: Import map bounds action for bbox schools tracking
import { setMapBounds as setMapBoundsForBbox } from '../../../store/slices/smartSearch/mapBoundsSlice';
import type { BBoxBounds } from '../../../store/slices/smartSearchSlice';
import BottomFloatingControls from './BottomFloatingControls';
import BottomRightControls from './BottomRightControls';
import ActiveSpatialFilterBanner from './ActiveSpatialFilterBanner';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { PropertyMarkerPopup } from './PropertyMarkerPopup';
import { createPriceMarkerIcon, createTextMarkerIcon } from './PriceMarkerIcon';
import PropertyDetailDialogEnhanced from '../../../components/property/PropertyDetailDialogEnhanced';
import { MapStatusBar } from './MapStatusBar';
// NEW: Phase 2.10.7.4 - School marker layer
import SchoolMarkerLayer from './SchoolMarkerLayer';
// NEW: Phase 2.32.5 - Amenity marker layer
import AmenityMarkerLayer from './AmenityMarkerLayer';
// NEW: Phase 2.12.3 - Map loading overlay component
import MapLoadingOverlay from './MapLoadingOverlay';
import { setVisibleSchoolMarkers } from '../../../store/slices/smartSearch/schoolPanelSlice';
import { selectSearchResults, selectShowMarkersOnMap, selectSelectedSchools } from '../../../store/slices/smartSearch/schoolPanelSelectors';
// Phase 2.12.1 FIX: Import the correct selector from smartSearchSlice
import { selectShowSchoolsOnMap as selectShowSchoolsOnMapFromSmartSearch } from '../../../store/slices/smartSearchSlice';
// Phase 2.12.2: Import useBboxSchools hook and selectors for bbox schools
import { useBboxSchools } from '../../../hooks/useBboxSchools';
import { selectMapBounds } from '../../../store/slices/smartSearch/mapBoundsSlice';
// NEW: Phase 2.10.7.6 - Catchment visualization layer
import CatchmentLayer from './CatchmentLayer';
// NEW: Phase 2.10.7.7 - School legend component
import SchoolLegend from './SchoolLegend';
// NEW: Phase 2.17.5 - Floating map controls wrapper
import FloatingMapControls from './FloatingMapControls';
// NEW: Phase 2.22 - Search progress indicator
import SearchProgressIndicator from './SearchProgressIndicator';
// Theme colors for dynamic marker styling
import { selectThemeColors } from '../../../store/slices/themeSlice';
// Phase 2.33: Map tile style management
import { selectCurrentMapStyle, selectTileConfig } from '../../../store/slices/mapTileStyleSlice';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for address marker (blue instead of default)
const AddressIcon = L.divIcon({
    className: 'address-marker-icon',
    html: `
        <div style="
            background: #1976d2;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
        ">
            <span style="font-size: 14px;">📍</span>
            <span>Selected Location</span>
        </div>
    `,
    iconSize: [150, 30],
    iconAnchor: [75, 30],
});

// Custom icon for school markers
const schoolIcon = L.divIcon({
    className: 'school-marker-icon',
    html: `
        <div style="
            background-color: #2196F3;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
            🎓
        </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
});

// Phase 2.29: Custom cluster icon creation function - Theme-aware styling
// Accepts themeColor parameter for dynamic theme support
const createClusterIcon = (themeColor: string = '#0b2d2c') => (cluster: any) => {
    const count = cluster.getChildCount();

    // Phase 2.29: Define size based on cluster size
    let size: number;
    let fontSize: string;

    if (count < 10) {
        size = 40;
        fontSize = '14px';
    } else if (count < 50) {
        size = 50;
        fontSize = '15px';
    } else if (count < 100) {
        size = 56;
        fontSize = '16px';
    } else {
        size = 64;
        fontSize = '17px';
    }

    return L.divIcon({
        html: `
            <div style="
                background-color: ${themeColor}; /* Dynamic theme color background */
                border: 3px solid white;
                border-radius: 50%;
                width: ${size}px;
                height: ${size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                font-weight: bold;
                color: white;
                font-size: ${fontSize};
            ">
                ${count}
            </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: L.point(size, size, true)
    });
};

// Phase 2.9.1: Helper function to calculate dynamic cluster radius based on zoom level
const getClusterRadius = (zoom: number): number => {
    if (zoom <= 10) return 80;   // World/country view - larger clusters
    if (zoom <= 12) return 60;   // Regional view
    if (zoom <= 14) return 40;   // City/suburb view
    if (zoom <= 16) return 25;   // Neighborhood view
    return 15;                    // Street view - small clusters
};

// Helper function to get catchment style based on school type
const getCatchmentStyle = (schoolType: string) => {
    const isPrimary = schoolType?.toLowerCase().includes('primary');
    const isSecondary = schoolType?.toLowerCase().includes('secondary');

    if (isPrimary) {
        return {
            fillColor: '#2196F3',  // Blue for primary
            fillOpacity: 0.15,
            color: '#1976D2',  // Darker blue border
            weight: 2,
            opacity: 0.8
        };
    } else if (isSecondary) {
        return {
            fillColor: '#9C27B0',  // Purple for secondary
            fillOpacity: 0.15,
            color: '#7B1FA2',  // Darker purple border
            weight: 2,
            opacity: 0.8
        };
    } else {
        // Infants or other types
        return {
            fillColor: '#4CAF50',  // Green for infants
            fillOpacity: 0.15,
            color: '#388E3C',  // Darker green border
            weight: 2,
            opacity: 0.8
        };
    }
};

// Helper function to convert catchment coordinates to Leaflet format
const convertCatchmentToLeafletFormat = (catchment: any): [number, number][][] | null => {
    try {
        if (!catchment) return null;

        // Handle [[[[lng, lat], ...]]] format from database
        // Convert to Leaflet format: [[[lat, lng], ...]]
        if (Array.isArray(catchment) && catchment.length > 0) {
            // Navigate nested array structure
            let coords = catchment;

            // Remove outer array wrappers until we reach coordinate pairs array
            // Stop when coords[0] is a coordinate pair [lng, lat] (first element is a number)
            while (Array.isArray(coords[0]) && coords[0].length > 0 && typeof coords[0][0] !== 'number') {
                coords = coords[0];
            }

            // Now coords should be [[lng, lat], [lng, lat], ...]
            return [coords.map(([lng, lat]: [number, number]) => [lat, lng])];
        }

        return null;
    } catch (error) {
        console.error('Error converting catchment coordinates:', error);
        return null;
    }
};

// Component to handle zoom controls programmatically
interface ZoomControllerProps {
    zoomInTrigger: number;
    zoomOutTrigger: number;
}

const ZoomController: React.FC<ZoomControllerProps> = ({ zoomInTrigger, zoomOutTrigger }) => {
    const map = useMap();

    useEffect(() => {
        if (zoomInTrigger > 0) {
            map.zoomIn();
        }
    }, [zoomInTrigger, map]);

    useEffect(() => {
        if (zoomOutTrigger > 0) {
            map.zoomOut();
        }
    }, [zoomOutTrigger, map]);

    return null;
};

// Component to track map movement, bounds, and position (Phase 2.5.7 enhanced)
interface MapStateTrackerProps {
    debounceTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
    onZoomChange?: (zoom: number) => void;
}

const MapStateTracker: React.FC<MapStateTrackerProps> = ({ debounceTimeoutRef, onZoomChange }) => {
    const dispatch = useAppDispatch();
    const mapBounds = useSelector((state: RootState) => state.smartSearch.mapBounds);
    const [programmaticMove, setProgrammaticMove] = useState(false);
    const previousBounds = React.useRef<BBoxBounds | null>(null);

    // NEW: Phase 2.8 - Auto-search selectors
    const isSearchInitiated = useAppSelector((state) =>
        state.smartSearch.autoSearchState?.isSearchInitiated ?? false
    );
    const activeSpatialFilter = useAppSelector((state) => state.smartSearch.activeSpatialFilter);
    const drawMode = useAppSelector((state) => state.smartSearch.drawMode);
    // NEW: Phase 2.8.1 - Auto-refresh toggle state
    const autoRefreshEnabled = useAppSelector((state) => state.smartSearch.autoRefreshEnabled);

    // NEW: Phase 2.8 - Handle map bounds change with four-layer defense (enhanced Phase 2.8.1)
    const handleMapBoundsChange = React.useCallback(() => {
        // Layer 1: State Lock (PRIMARY)
        if (isSearchInitiated) {
            console.log('[AutoSearch] LOCK ACTIVE - Skipping countdown (search in progress)');
            return;
        }

        // Layer 2: Spatial Filter Priority (SECONDARY)
        if (activeSpatialFilter === 'drawnPolygon' || activeSpatialFilter === 'schoolCatchment') {
            console.log('[AutoSearch] Higher priority filter active - Skipping countdown');
            return;
        }

        // Layer 3: Draw Mode Check (TERTIARY)
        if (drawMode) {
            console.log('[AutoSearch] Draw mode active - Skipping countdown');
            return;
        }

        // NEW: Layer 4: Check auto-refresh enabled (Phase 2.8.1)
        if (!autoRefreshEnabled) {
            console.log('[AutoSearch] Auto-refresh disabled by user - Skipping countdown');
            return;
        }

        // Safe to start countdown
        console.log('[AutoSearch] Starting countdown from map bounds change');

        // Cancel any existing countdown
        dispatch(cancelAutoSearchCountdown());

        // Start new countdown
        dispatch(startAutoSearchCountdown());
    }, [isSearchInitiated, activeSpatialFilter, drawMode, autoRefreshEnabled, dispatch]);

    useMapEvents({
        movestart: () => {
            // Check if this is a programmatic move (from address search)
            // If not, it's a manual user move
            if (!programmaticMove) {
                dispatch(setManualMapMove(true));
            }
        },
        zoomend: (e) => {
            // Track zoom level changes for status bar (Sprint 3)
            const map = e.target;
            const zoom = map.getZoom();
            if (onZoomChange) {
                onZoomChange(zoom);
            }
        },
        moveend: (e) => {
            const map = e.target;

            // Clear any pending timeout to prevent rapid-fire updates
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Debounce the bounds + position update to prevent infinite loops
            // This prevents marker click auto-pan from triggering rapid Redux updates
            debounceTimeoutRef.current = setTimeout(() => {
                const bounds = map.getBounds();

                const newBounds: BBoxBounds = {
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest(),
                };

                // Only dispatch if bounds actually changed (>0.001 degree threshold)
                // This prevents unnecessary Redux updates from micro-movements
                const THRESHOLD = 0.001;
                const boundsChanged = !previousBounds.current ||
                    Math.abs(newBounds.north - previousBounds.current.north) > THRESHOLD ||
                    Math.abs(newBounds.south - previousBounds.current.south) > THRESHOLD ||
                    Math.abs(newBounds.east - previousBounds.current.east) > THRESHOLD ||
                    Math.abs(newBounds.west - previousBounds.current.west) > THRESHOLD;

                if (boundsChanged) {
                    // Update map bounds (for "Search This Area" button)
                    dispatch(setMapBounds(newBounds));
                    // Phase 2.12.2: Also update mapBounds for bbox schools tracking
                    dispatch(setMapBoundsForBbox({
                        north: newBounds.north,
                        south: newBounds.south,
                        east: newBounds.east,
                        west: newBounds.west,
                    }));
                    previousBounds.current = newBounds;

                    // NEW: Update map position for persistence (Phase 2.5.7)
                    const center = map.getCenter();
                    const zoom = map.getZoom();
                    dispatch(setMapPosition({ center: { lat: center.lat, lng: center.lng }, zoom }));

                    // NEW: Phase 2.8 - Trigger auto-search countdown
                    handleMapBoundsChange();
                }

                // Reset programmatic move flag
                setProgrammaticMove(false);
            }, 500); // 500ms debounce delay (increased from 300ms for better stability)
        },
    });

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [debounceTimeoutRef]);

    return null;
};

// NEW: Phase 2.10.7.5 - Component to expose map ref for school centering
interface MapRefProviderProps {
    mapRef?: React.MutableRefObject<any>;
}

const MapRefProvider: React.FC<MapRefProviderProps> = ({ mapRef }) => {
    const map = useMap();

    // Set the map ref when component mounts
    useEffect(() => {
        if (mapRef) {
            mapRef.current = map;
        }
    }, [map, mapRef]);

    return null;
};

// Component to handle map centering
interface MapCenterControllerProps {
    mapCenter: { lat: number; lon: number; zoom: number } | null;
    selectedAddress: string | null;
}

const MapCenterController: React.FC<MapCenterControllerProps> = ({
    mapCenter,
    selectedAddress
}) => {
    const map = useMap();
    const dispatch = useAppDispatch();
    const [hasSetView, setHasSetView] = useState(false);

    useEffect(() => {
        if (!mapCenter) {
            setHasSetView(false);
            return;
        }

        // Center map at location with zoom 14
        map.setView([mapCenter.lat, mapCenter.lon], mapCenter.zoom, {
            animate: true,
            duration: 1,
        });

        setHasSetView(true);

        // CRITICAL FIX: Clear the mapCenter after centering
        // This prevents the map from snapping back when user pans/zooms
        dispatch(clearMapCenter());

        // NOTE: Removed automatic search trigger to prevent infinite loop
        // Searches should only be triggered by user actions (Apply Filters button)
        // Map centering is a visual operation only
    }, [mapCenter, map, dispatch]);

    // Render address marker if present
    if (!mapCenter || !selectedAddress) {
        return null;
    }

    return (
        <Marker position={[mapCenter.lat, mapCenter.lon]} icon={AddressIcon}>
            <Popup>
                <Box sx={{ p: 1, minWidth: 200 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                        Selected Address
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {selectedAddress}
                    </Typography>
                </Box>
            </Popup>
        </Marker>
    );
};

// Component to handle drawing on the map (Phase 2.7)
interface DrawControllerProps {
    drawMode: boolean;
    drawnPolygons: any[];
    onAddPolygon: (polygon: any) => void;
    onDrawStart: () => void;
    onDrawStop: () => void;
}

const DrawController: React.FC<DrawControllerProps> = ({
    drawMode,
    drawnPolygons,
    onAddPolygon,
    onDrawStart,
    onDrawStop
}) => {
    const map = useMap();
    const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
    const drawControlRef = useRef<L.Control.Draw | null>(null);

    useEffect(() => {
        if (!map) return;

        // Create feature group for drawn items if it doesn't exist
        if (!drawnItemsRef.current) {
            drawnItemsRef.current = new L.FeatureGroup();
            map.addLayer(drawnItemsRef.current);
        }

        // Create draw control if it doesn't exist
        if (!drawControlRef.current) {
            drawControlRef.current = new L.Control.Draw({
                draw: {
                    polygon: {
                        allowIntersection: false,
                        drawError: {
                            color: '#e1e100',
                            message: '<strong>Error:</strong> shape edges cannot cross!'
                        },
                        shapeOptions: {
                            color: '#3388ff',
                            weight: 3,
                            fillOpacity: 0.2
                        }
                        // Note: Leaflet.Draw 1.0.4 doesn't support true freehand drawing
                        // Users click points to create polygon vertices, double-click to finish
                    },
                    // Disable other drawing tools
                    polyline: false,
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false
                },
                edit: {
                    featureGroup: drawnItemsRef.current,
                    remove: false, // We use our own clear button
                    edit: false
                }
            });
        }

        // Set up map event handlers
        const handleDrawCreated = (e: any) => {
            const layer = e.layer;
            const geoJSON = layer.toGeoJSON();

            // Add layer to feature group
            if (drawnItemsRef.current) {
                drawnItemsRef.current.addLayer(layer);
            }

            // Dispatch to Redux
            onAddPolygon(geoJSON);
        };

        const handleDrawStart = () => {
            onDrawStart();
        };

        const handleDrawStop = () => {
            onDrawStop();
        };

        map.on(L.Draw.Event.CREATED, handleDrawCreated);
        map.on(L.Draw.Event.DRAWSTART, handleDrawStart);
        map.on(L.Draw.Event.DRAWSTOP, handleDrawStop);

        // Cleanup
        return () => {
            map.off(L.Draw.Event.CREATED, handleDrawCreated);
            map.off(L.Draw.Event.DRAWSTART, handleDrawStart);
            map.off(L.Draw.Event.DRAWSTOP, handleDrawStop);
        };
    }, [map, onAddPolygon, onDrawStart, onDrawStop]);

    // Add/remove draw control based on drawMode
    useEffect(() => {
        if (!map || !drawControlRef.current) return;

        if (drawMode) {
            console.log('[DrawController] Entering draw mode - disabling map interactions');

            // CRITICAL: Disable map interactions during drawing
            // This prevents map panning when user tries to draw
            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();

            console.log('[DrawController] Map interactions disabled:', {
                dragging: map.dragging.enabled(),
                touchZoom: map.touchZoom.enabled(),
                doubleClickZoom: map.doubleClickZoom.enabled(),
                scrollWheelZoom: map.scrollWheelZoom.enabled()
            });

            map.addControl(drawControlRef.current);
            // Enable polygon drawing
            const drawHandler = new L.Draw.Polygon(map as any, (drawControlRef.current.options as any).draw?.polygon);
            drawHandler.enable();
            console.log('[DrawController] Polygon draw handler enabled');
        } else {
            console.log('[DrawController] Exiting draw mode - re-enabling map interactions');

            // Re-enable map interactions when exiting draw mode
            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();

            map.removeControl(drawControlRef.current);
        }

        // Cleanup: always re-enable interactions on unmount
        return () => {
            if (map) {
                map.dragging.enable();
                map.touchZoom.enable();
                map.doubleClickZoom.enable();
                map.scrollWheelZoom.enable();
            }
        };
    }, [drawMode, map]);

    // Clear drawn items when drawnPolygons is empty
    useEffect(() => {
        if (drawnPolygons.length === 0 && drawnItemsRef.current) {
            drawnItemsRef.current.clearLayers();
        }
    }, [drawnPolygons]);

    // NEW: Restore drawn polygons from Redux state after re-renders (BUG-POLYGON-VISIBILITY fix)
    useEffect(() => {
        if (!map || !drawnItemsRef.current) return;

        // Clear existing layers to avoid duplicates
        drawnItemsRef.current.clearLayers();

        // Restore each polygon from Redux state
        drawnPolygons.forEach((polygonFeature) => {
            const layer = L.geoJSON(polygonFeature, {
                style: {
                    color: '#3388ff',
                    weight: 3,
                    fillOpacity: 0.2
                }
            });
            drawnItemsRef.current?.addLayer(layer);
        });

        console.log('[DrawController] Restored', drawnPolygons.length, 'polygons from Redux state');
    }, [map, drawnPolygons]);

    return null;
};

interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    mapRef?: React.MutableRefObject<any>;
}

const MapView: React.FC<MapViewProps> = ({
    center = [-33.8688, 151.2093], // Sydney center
    zoom = 12,
    mapRef
}) => {
    const dispatch = useAppDispatch();
    const properties = useSelector((state: RootState) => state.smartSearch.properties);
    const loading = useSelector((state: RootState) => state.smartSearch.loading);
    const error = useSelector((state: RootState) => state.smartSearch.error);
    const mapCenter = useSelector((state: RootState) => state.smartSearch.mapCenter);
    const selectedAddress = useSelector((state: RootState) => state.smartSearch.selectedAddress);
    const manualMapMove = useSelector((state: RootState) => state.smartSearch.manualMapMove);
    const mapBounds = useSelector((state: RootState) => state.smartSearch.mapBounds);
    const searchBounds = useSelector((state: RootState) => state.smartSearch.searchBounds);
    const displayedCount = useSelector((state: RootState) => state.smartSearch.displayedCount);
    const totalCount = useSelector((state: RootState) => state.smartSearch.totalCount);
    // Theme colors for dynamic marker styling
    const themeColors = useAppSelector(selectThemeColors);
    // Phase 2.33: Map tile style selectors
    const currentMapStyle = useAppSelector(selectCurrentMapStyle);
    const tileConfig = useAppSelector(selectTileConfig);
    // NEW: Map state persistence selectors (Phase 2.5.7)
    const persistedMapCenter = useSelector((state: RootState) => state.smartSearch.persistedMapCenter);
    const persistedMapZoom = useSelector((state: RootState) => state.smartSearch.persistedMapZoom);
    // NEW: Draw mode selectors (Phase 2.7)
    const drawMode = useSelector((state: RootState) => state.smartSearch.drawMode);
    const drawnPolygons = useSelector((state: RootState) => state.smartSearch.drawnPolygons) || []; // Safety: default to empty array if undefined
    // NEW: Schools selector (Phase 2.5.9)
    const { schools } = useSelector((state: RootState) => state.smartSearch);
    // NEW: Active spatial filter (Sprint 3 - for pulsing animation)
    const activeSpatialFilter = useSelector((state: RootState) => state.smartSearch.activeSpatialFilter);
    // NEW: Filters for status bar (Sprint 3 - Phase 2.5.11)
    const filters = useSelector((state: RootState) => state.smartSearch.filters);
    // NEW: Phase 2.8 - Auto-search state selectors
    const isSearchInitiated = useAppSelector((state) =>
        state.smartSearch.autoSearchState?.isSearchInitiated ?? false
    );
    // Phase 2.12.1 FIX: Use correct selector from smartSearchSlice (not schoolPanelSelectors)
    // This matches the toggle in SchoolPanel.tsx and SchoolMarkerLayer.tsx
    const showSchoolMarkers = useAppSelector(selectShowSchoolsOnMapFromSmartSearch);
    // Phase 2.20: Get school catchment radius toggle state for smart mode switching
    const showCatchmentRadius = useAppSelector(selectShowCatchmentRadius);
    // NEW: Phase 2.17.5 - Property panel visibility for map resize
    const propertyPanelVisible = useAppSelector((state: RootState) => state.smartSearch.propertyPanelVisible);

    // Phase 2.12.2: Get map bounds and call useBboxSchools hook
    const mapBoundsFromRedux = useAppSelector(selectMapBounds);
    const { schools: schoolsInBounds } = useBboxSchools(
      showSchoolMarkers ? mapBoundsFromRedux : null,
      showSchoolMarkers
    );

    // Shared debounce timeout ref for MapBoundsTracker
    // This allows us to cancel pending debounce timers when "Search This Area" is clicked
    // to prevent race conditions that crash the MapContainer
    const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // NEW: Zoom control triggers (Phase 2.5.8)
    // These counters trigger useEffect in ZoomController when incremented
    const [zoomInTrigger, setZoomInTrigger] = useState(0);
    const [zoomOutTrigger, setZoomOutTrigger] = useState(0);

    // NEW: Property detail dialog state (Sprint 2 - Phase 2.5.11)
    const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
    const [propertyDetailOpen, setPropertyDetailOpen] = useState(false);

    // Filter properties that have valid coordinates
    const validProperties = properties.filter(
        (p: BaseProperty) => p.latitude != null && p.longitude != null
    );

    // NEW: Filter to show only selected schools (Phase 2.5.9)
    // BUG-04 FIX: Use selectedSchoolsCache instead of schools.data to persist across searches
    const selectedSchools = schools.selectedSchoolsCache || [];

    // NEW: Phase 2.17.5 - Leaflet map resize handler
    // When panel collapses/expands, Leaflet needs to recalculate map viewport
    useEffect(() => {
        if (!mapRef?.current) return;

        // Wait for panel collapse animation to complete (300ms) + buffer (50ms)
        const timer = setTimeout(() => {
            mapRef.current?.invalidateSize();
            console.log('[MapView] Leaflet map resized after panel toggle - propertyPanelVisible:', propertyPanelVisible);
        }, 350);

        return () => clearTimeout(timer);
    }, [propertyPanelVisible, mapRef]);

    // Determine if "Search This Area" button should be visible
    // Show button only when:
    // 1. User manually moved map (manualMapMove = true)
    // 2. AND current map bounds differ from search bounds
    const boundsChanged = () => {
        if (!mapBounds) return false;

        // If no search has been performed yet (searchBounds is null),
        // any map bounds movement should trigger the button display
        if (!searchBounds) return true;

        // Check if bounds are significantly different (>0.01 degree difference)
        const threshold = 0.01;
        return (
            Math.abs(mapBounds.north - searchBounds.north) > threshold ||
            Math.abs(mapBounds.south - searchBounds.south) > threshold ||
            Math.abs(mapBounds.east - searchBounds.east) > threshold ||
            Math.abs(mapBounds.west - searchBounds.west) > threshold
        );
    };

    const showSearchButton = manualMapMove && boundsChanged();

    // Determine if "Show More Pins" button should be visible
    // Show button only when:
    // 1. displayedCount < totalCount (more properties available)
    // 2. displayedCount < 400 (not at max limit)
    // 3. Not currently loading
    const showMoreButtonVisible = displayedCount < totalCount && displayedCount < 400 && !loading;

    // Calculate remaining count
    const remainingCount = Math.min(
        totalCount - displayedCount,
        400 - displayedCount
    );

    const handleSearchThisArea = async () => {
        if (!mapBounds) return;

        // Phase 2.20: Smart mode switching logic
        // Check if school catchment filter is active
        if (showCatchmentRadius) {
            console.log('[MapView] Smart mode switch: Catchment toggle is ON, auto-switching to bbox mode');

            // Turn OFF catchment toggle before search
            // This clears the school spatial filter BEFORE searchByBounds is called,
            // preventing the spatial conflict dialog from appearing
            dispatch(setShowCatchmentRadius(false));

            // Switch active spatial filter to bbox (map bounds)
            dispatch(setActiveSpatialFilter('bbox'));

            console.log('[MapView] Mode switched: showCatchmentRadius=false, activeSpatialFilter=bbox');
        }

        // CRITICAL: Cancel any pending debounce timers before executing search
        // This prevents race conditions between:
        // 1. Debounced setMapBounds dispatch (300ms delayed from map pan)
        // 2. Immediate searchByBounds dispatch (triggered by button click)
        // 3. MapContainer re-render with new properties
        // Without this cancellation, the delayed setMapBounds can fire mid-render
        // causing Leaflet to access DOM nodes being unmounted → crash
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }

        // Dispatch search action with current map bounds
        await dispatch(searchByBounds(mapBounds));
    };

    const handleShowMorePins = async () => {
        // NEW: Phase 2.8 - Cancel countdown when manually loading more properties
        dispatch(cancelAutoSearchCountdown());
        // Dispatch load more action
        await dispatch(loadMoreProperties());
    };

    // NEW: Handlers for zoom and draw controls (Phase 2.5.8)
    const handleZoomIn = () => {
        setZoomInTrigger(prev => prev + 1);
    };

    const handleZoomOut = () => {
        setZoomOutTrigger(prev => prev + 1);
    };

    const handleToggleDrawMode = () => {
        if (!drawMode) {
            // Entering draw mode
            // Check if school catchment or bbox is active
            const hasCatchment = activeSpatialFilter === 'schoolCatchment';
            const hasBbox = activeSpatialFilter === 'bbox';

            if (hasCatchment || hasBbox) {
                toast.info('Draw mode active - School catchment and map area filters cleared');
            }
        }
        dispatch(setDrawMode(!drawMode));
    };

    const handleClearDrawings = () => {
        dispatch(clearDrawnPolygons());
        toast.info('Drawn area filter cleared');
    };

    // NEW: Drawing event handlers (Phase 2.7)
    const handleAddPolygon = async (geoJSON: any) => {
        // Add polygon to Redux
        dispatch(addDrawnPolygon(geoJSON));

        // Show success toast
        toast.success('Drawn area filter applied - Searching properties...');

        // Compute union of all drawn polygons (including this new one)
        await dispatch(computeDrawnPolygonUnion());

        // Trigger search with drawn polygon filter
        await dispatch(performSearch());
    };

    const handleDrawStart = () => {
        // Drawing started - draw mode is already enabled by button click
        console.log('[MapView] Drawing started');
    };

    const handleDrawStop = () => {
        // Drawing stopped - exit draw mode
        dispatch(setDrawMode(false));
        console.log('[MapView] Drawing stopped');
    };

    // NEW: Use persisted center/zoom if available (Phase 2.5.7)
    const effectiveCenter: [number, number] = persistedMapCenter
        ? [persistedMapCenter.lat, persistedMapCenter.lng]
        : center;
    const effectiveZoom = persistedMapZoom || zoom;

    // NEW: Zoom level tracking for status bar (Sprint 3 - Phase 2.5.11)
    // Must be AFTER effectiveZoom is calculated
    const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(effectiveZoom);

    // NEW: Phase 2.10.7.4 - School search results for marker filtering
    const schoolSearchResults = useAppSelector(selectSearchResults);

    // NEW: Phase 2.10.7.4 - Update visible school markers based on map bounds
    // Phase 2.14 FIX: Always include selected schools even if not in search results
    const selectedSchoolsForMarkers = useAppSelector(selectSelectedSchools);

    useEffect(() => {
        if (!mapBounds) {
            dispatch(setVisibleSchoolMarkers([]));
            return;
        }

        // Phase 2.14 FIX: Combine search results with selected schools
        // Selected schools should always be visible even if not in search results
        const allSchools = [...schoolSearchResults];

        console.log('[MapView] Calculating visible markers:', {
            searchResultsCount: schoolSearchResults.length,
            selectedSchoolsCount: selectedSchoolsForMarkers.length,
            mapBounds: {
                north: mapBounds.north,
                south: mapBounds.south,
                east: mapBounds.east,
                west: mapBounds.west,
            },
        });

        // Add selected schools that aren't already in search results
        selectedSchoolsForMarkers.forEach(selectedSchool => {
            const alreadyInResults = allSchools.some(s => s.school_id === selectedSchool.school_id);
            if (!alreadyInResults) {
                console.log('[MapView] Adding selected school to marker list:', {
                    name: selectedSchool.school_name,
                    lat: selectedSchool.latitude,
                    lng: selectedSchool.longitude,
                });
                allSchools.push(selectedSchool);
            }
        });

        console.log('[MapView] Total schools before bounds filter:', allSchools.length);

        // Filter schools within current map bounds
        const visibleSchools = allSchools.filter((school) => {
            if (!school.latitude || !school.longitude) {
                console.log('[MapView] School missing coordinates:', school.school_name);
                return false;
            }

            const lat = school.latitude;
            const lng = school.longitude;

            const isVisible = (
                lat >= mapBounds.south &&
                lat <= mapBounds.north &&
                lng >= mapBounds.west &&
                lng <= mapBounds.east
            );

            if (!isVisible && selectedSchoolsForMarkers.some(s => s.school_id === school.school_id)) {
                console.log('[MapView] Selected school OUTSIDE bounds:', {
                    name: school.school_name,
                    lat,
                    lng,
                    bounds: mapBounds,
                });
            }

            return isVisible;
        });

        console.log('[MapView] Visible schools after bounds filter:', visibleSchools.length);

        // Update Redux with visible markers (max 100)
        dispatch(setVisibleSchoolMarkers(visibleSchools.slice(0, 100)));
    }, [mapBounds, schoolSearchResults, selectedSchoolsForMarkers, dispatch]);

    // Phase 2.12.3: Removed early returns for loading/error
    // Map now always renders with overlay pattern for better UX
    // This keeps the map visible while showing loading state

    return (
        <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
            {/* NEW: Active Spatial Filter Banner - Sprint 3 (Phase 2.5.9) */}
            <ActiveSpatialFilterBanner />

            {/* NEW: Bottom Floating Controls - Search This Area + Show More Pins (Phase 2.5.8) */}
            <BottomFloatingControls
                searchVisible={showSearchButton}
                onSearchClick={handleSearchThisArea}
                searchLoading={loading}
                showMoreVisible={showMoreButtonVisible}
                onShowMoreClick={handleShowMorePins}
                showMoreLoading={loading}
                remainingCount={remainingCount}
            />

            {/* NEW: Bottom Right Controls - Zoom + Draw (Phase 2.7) */}
            <BottomRightControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                drawMode={drawMode}
                onToggleDrawMode={handleToggleDrawMode}
                hasDrawings={drawnPolygons.length > 0}
                onClearDrawings={handleClearDrawings}
            />

            <ErrorBoundary fallbackMessage="Map temporarily unavailable">
                <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                    {/* Phase 2.22: Search progress indicator at top center */}
                    <SearchProgressIndicator />

                    <MapContainer
                        center={effectiveCenter}
                        zoom={effectiveZoom}
                        key={`${effectiveCenter[0]}-${effectiveCenter[1]}-${effectiveZoom}`}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                        zoomControl={false} // Disable default zoom controls (Phase 2.5.8)
                    >
                    {/* Phase 2.33: Dynamic tile layer based on user preference */}
                    <TileLayer
                        key={currentMapStyle} // Force remount when style changes for smooth transition
                        url={tileConfig.url}
                        attribution={tileConfig.attribution}
                        maxZoom={tileConfig.maxZoom}
                    />

                    {/* NEW: Phase 2.10.7.5 - Map ref provider for school centering */}
                    <MapRefProvider mapRef={mapRef} />

                    {/* NEW: Zoom controller - programmatic zoom (Phase 2.5.8) */}
                    <ZoomController zoomInTrigger={zoomInTrigger} zoomOutTrigger={zoomOutTrigger} />

                    {/* Map state tracker - tracks bounds + position (Phase 2.5.7) + zoom (Sprint 3) */}
                    <MapStateTracker
                        debounceTimeoutRef={debounceTimeoutRef}
                        onZoomChange={setCurrentZoomLevel}
                    />

                    {/* Map centering controller */}
                    <MapCenterController
                        mapCenter={mapCenter}
                        selectedAddress={selectedAddress}
                    />

                    {/* NEW: Draw controller - handles drawing on map (Phase 2.7) */}
                    <DrawController
                        drawMode={drawMode}
                        drawnPolygons={drawnPolygons}
                        onAddPolygon={handleAddPolygon}
                        onDrawStart={handleDrawStart}
                        onDrawStop={handleDrawStop}
                    />

                    {/* NEW: Catchment boundary polygons (Phase 2.5.9) - render BEFORE markers so markers appear on top */}
                    {selectedSchools.map((school) => {
                        if (!school.catchment_boundary) return null;

                        const positions = convertCatchmentToLeafletFormat(school.catchment_boundary);
                        if (!positions) return null;

                        const style = getCatchmentStyle(school.school_type || '');

                        // NEW: Add CSS class for pulsing animation when filter is active (Sprint 3)
                        const className = activeSpatialFilter === 'schoolCatchment'
                            ? 'catchment-boundary-active'
                            : '';

                        return (
                            <Polygon
                                key={`catchment-${school.id}`}
                                positions={positions}
                                pathOptions={style}
                                className={className}
                            >
                                <Popup>
                                    <Box sx={{ minWidth: 200 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {school.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Catchment Boundary
                                        </Typography>
                                        {school.school_type && (
                                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                {school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1)} School
                                            </Typography>
                                        )}
                                    </Box>
                                </Popup>
                            </Polygon>
                        );
                    })}

                    {/* NEW: School markers (Phase 2.5.9) - render AFTER polygons so they appear on top */}
                    {/* FIXED: Respect showSchoolMarkers toggle (Phase 2.10.7.4 Iteration 2) */}
                    {showSchoolMarkers && selectedSchools.map((school) => (
                        <Marker
                            key={`school-${school.id}`}
                            position={[school.latitude, school.longitude]}
                            icon={schoolIcon}
                            zIndexOffset={1000}  // Render above property markers
                        >
                            <Popup>
                                <Box sx={{ minWidth: 200 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {school.name}
                                    </Typography>
                                    {school.school_type && (
                                        <Typography variant="body2" color="text.secondary">
                                            {school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1)} School
                                        </Typography>
                                    )}
                                    {school.has_catchment_boundary && (
                                        <Typography variant="caption" color="primary" display="block" sx={{ mt: 1 }}>
                                            ✓ Catchment boundary available
                                        </Typography>
                                    )}
                                </Box>
                            </Popup>
                        </Marker>
                    ))}

                    {/* NEW: Phase 2.10.7.4 - School Marker Layer (toggle-controlled) */}
                    {/* CRITICAL FIX: Key forces React to unmount/remount when toggle changes */}
                    {/* Phase 2.12.2: Pass schoolsInBounds to SchoolMarkerLayer for bbox display */}
                    <SchoolMarkerLayer
                      key={`school-markers-${showSchoolMarkers}`}
                      schoolsInBounds={schoolsInBounds}
                    />

                    {/* NEW: Phase 2.10.7.6 - Catchment Layer (polygons + 3km circles) */}
                    <CatchmentLayer />

                    {/* NEW: Phase 2.32.5 - Amenity Marker Layer */}
                    <AmenityMarkerLayer />

                    <MarkerClusterGroup
                        chunkedLoading
                        maxClusterRadius={getClusterRadius(currentZoomLevel)}
                        showCoverageOnHover={true}
                        spiderfyOnMaxZoom={true}
                        removeOutsideVisibleBounds={true}
                        iconCreateFunction={createClusterIcon(themeColors.primaryDark)}
                    >
                        {validProperties.map((property) => {
                            // Task 2.33.4: Create marker icon based on price availability
                            // - Properties with price: use price marker ($1.2M format)
                            // - Properties without price: use text marker (e.g., "Contact Agent")
                            const markerIcon = property.price
                                ? createPriceMarkerIcon({
                                    price: typeof property.price === 'number' ? property.price : Number(property.price),
                                    selected: selectedProperty?.id === property.id,
                                    themeColor: themeColors.primaryDark
                                  })
                                : createTextMarkerIcon({
                                    priceDisplay: (property as any).price_display || "Contact Agent",
                                    selected: selectedProperty?.id === property.id,
                                    themeColor: themeColors.primaryDark
                                  });

                            return (
                                <Marker
                                    key={property.id}
                                    position={[property.latitude!, property.longitude!]}
                                    icon={markerIcon}
                                >
                                    <Popup
                                        minWidth={280}
                                        maxWidth={280}
                                    >
                                        <PropertyMarkerPopup
                                            property={property as any}
                                            onViewDetails={() => {
                                                setSelectedProperty(property);
                                                setPropertyDetailOpen(true);
                                            }}
                                        />
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MarkerClusterGroup>
                    </MapContainer>

                    {/* NEW: Phase 2.17.5 - Floating map controls (results + filters buttons) */}
                    <FloatingMapControls />

                    {/* Phase 2.12.3: Loading overlay - appears over map without unmounting it */}
                    <MapLoadingOverlay isVisible={loading} />
                </Box>
            </ErrorBoundary>

            {/* Error state banner - shown below map if error occurred */}
            {error && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        right: 12,
                        bgcolor: '#ffebee',
                        border: '1px solid #ef5350',
                        borderRadius: 1,
                        p: 2,
                        zIndex: 50,
                    }}
                >
                    <Typography variant="subtitle2" color="error" fontWeight={600} gutterBottom>
                        Error Loading Map
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {error}
                    </Typography>
                </Box>
            )}

            {/* NEW: School Legend Component (Phase 2.10.7.7) */}
            <SchoolLegend />

            {/* NEW: Status Bar - Fixed at bottom of map (Sprint 3 - Phase 2.5.11) */}
            <MapStatusBar
                displayedCount={displayedCount}
                totalCount={totalCount}
                activeFilters={{
                    state: filters.location.state,
                    suburb: filters.location.suburb,
                    postcode: filters.location.postcode,
                    property_type: filters.propertyTypes.length > 0 ? filters.propertyTypes : null,
                    bedrooms_min: filters.bedrooms.min,
                    price_min: filters.priceRange.min,
                    price_max: filters.priceRange.max
                }}
                zoomLevel={currentZoomLevel}
            />

            {/* NEW: Property Detail Dialog (Sprint 2 - Phase 2.5.11) */}
            {selectedProperty && propertyDetailOpen && (
                <PropertyDetailDialogEnhanced
                    property={selectedProperty}
                    onNavigateBack={() => {
                        setPropertyDetailOpen(false);
                        setSelectedProperty(null);
                    }}
                />
            )}
        </Box>
    );
};

export default MapView;
