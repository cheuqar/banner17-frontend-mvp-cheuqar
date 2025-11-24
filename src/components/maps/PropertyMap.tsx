import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import { LocationOn, Home } from '@mui/icons-material';
import type { CatchmentBoundaryFeature } from '../../types/catchment';

interface Property {
  id?: string;
  address: string;
  price?: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
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

interface PropertyMapProps {
  properties: Property[];
  title?: string;
  height?: number;
  referencePoints?: ReferencePoint[];  // Add reference points for spatial context

  // Phase 3: School catchment boundary support
  catchmentBoundaries?: CatchmentBoundaryFeature[];
  showCatchmentControls?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

// Catchment Legend Component (Enhancement #1)
interface CatchmentLegendProps {
  catchmentLevel?: 'primary' | 'secondary';
}

const CatchmentLegend: React.FC<CatchmentLegendProps> = ({ catchmentLevel }) => {
  if (!catchmentLevel) return null;

  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: '100px',
        right: '10px',
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: '200px'
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '14px',
          color: '#333',
          mb: 1
        }}
      >
        School Catchment Areas
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {catchmentLevel === 'primary' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box
              sx={{
                width: '24px',
                height: '16px',
                borderRadius: '3px',
                border: '2px solid #2196F3',
                background: 'rgba(33, 150, 243, 0.15)'
              }}
            />
            <Typography sx={{ fontSize: '13px', color: '#666' }}>
              Primary School Catchment
            </Typography>
          </Box>
        )}
        {catchmentLevel === 'secondary' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box
              sx={{
                width: '24px',
                height: '16px',
                borderRadius: '3px',
                border: '2px solid #4CAF50',
                background: 'rgba(76, 175, 80, 0.15)'
              }}
            />
            <Typography sx={{ fontSize: '13px', color: '#666' }}>
              Secondary School Catchment
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  title = "Property Map",
  height = 400,
  referencePoints = [],
  catchmentBoundaries = [],
  showCatchmentControls = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapIdRef = useRef<string>(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const isInitializingRef = useRef<boolean>(false);

  // Memoize arrays to prevent infinite re-renders
  const memoizedProperties = useMemo(() => properties, [JSON.stringify(properties.map(p => ({ id: p.id, latitude: p.latitude, longitude: p.longitude })))]);
  const memoizedReferencePoints = useMemo(() => referencePoints, [JSON.stringify(referencePoints)]);
  const memoizedCatchmentBoundaries = useMemo(() => catchmentBoundaries, [JSON.stringify(catchmentBoundaries.map(c => c.properties.catchment_id))]);

  // Extract catchment level for legend (Enhancement #1)
  const catchmentLevel = useMemo<'primary' | 'secondary' | undefined>(() => {
    if (memoizedCatchmentBoundaries.length === 0) return undefined;
    const level = memoizedCatchmentBoundaries[0]?.properties?.catchment_level;
    return level === 'primary' || level === 'secondary' ? level : undefined;
  }, [memoizedCatchmentBoundaries]);

  useEffect(() => {
    if (!mapRef.current || !memoizedProperties.length) {
      setIsLoading(false);
      return;
    }

    // Reset state
    setIsLoading(true);
    setLoadingError(null);

    // Add debugging for catchment boundaries
    console.log('📍 PropertyMap useEffect triggered with:', {
      propertiesCount: memoizedProperties.length,
      catchmentBoundariesCount: memoizedCatchmentBoundaries.length,
      referencePointsCount: memoizedReferencePoints.length,
      catchmentBoundariesData: memoizedCatchmentBoundaries
    });

    // 🚨 ENHANCED DEBUGGING: Check catchment boundary props
    console.log('📍 [DEBUG] Raw catchmentBoundaries prop:', catchmentBoundaries);
    console.log('📍 [DEBUG] Memoized catchmentBoundaries:', memoizedCatchmentBoundaries);
    if (memoizedCatchmentBoundaries.length > 0) {
      memoizedCatchmentBoundaries.forEach((boundary, index) => {
        console.log(`📍 [DEBUG] Catchment ${index}:`, {
          type: boundary.type,
          schoolName: boundary.properties?.school_name,
          geometryType: boundary.geometry?.type,
          coordinatesLength: boundary.geometry?.coordinates?.[0]?.length,
          firstThreeCoords: boundary.geometry?.coordinates?.[0]?.slice(0, 3),
          fullBoundary: boundary
        });
      });
    }

    // Set a timeout for loading
    loadTimeoutRef.current = setTimeout(() => {
      setLoadingError('Map is taking too long to load. Please refresh the page.');
      setIsLoading(false);
    }, 15000); // 15 second timeout

    // Load Leaflet dynamically if not already loaded
    const loadLeaflet = async () => {
      try {
        if (!window.L) {
          // Load Leaflet CSS
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          // Load Leaflet JS with error handling
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            console.log('📍 Leaflet loaded successfully');
            initializeMap().catch(error => {
              console.error('📍 Failed to initialize map:', error);
              setLoadingError('Failed to create map. Please try refreshing the page.');
              setIsLoading(false);
            });
          };
          script.onerror = () => {
            console.error('Failed to load Leaflet library');
            setLoadingError('Failed to load map library. Please check your internet connection.');
            setIsLoading(false);
            if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          };
          document.head.appendChild(script);
        } else {
          console.log('📍 Leaflet already loaded, initializing map');
          initializeMap().catch(error => {
            console.error('📍 Failed to initialize map:', error);
            setLoadingError('Failed to create map. Please try refreshing the page.');
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        setLoadingError('Failed to initialize map.');
        setIsLoading(false);
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      }
    };

    const initializeMap = async () => {
      if (!window.L || !mapRef.current) {
        setLoadingError('Map initialization failed.');
        setIsLoading(false);
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
        return;
      }

      // Prevent double initialization
      if (isInitializingRef.current) {
        console.log('📍 Map initialization already in progress, skipping...');
        return;
      }

      try {
        isInitializingRef.current = true;
        console.log(`📍 Starting map initialization for ${mapIdRef.current}...`);
        
        // Clean up existing map more thoroughly
        if (mapInstanceRef.current) {
          try {
            console.log('📍 Cleaning up existing map instance');

            // Remove all layers first
            mapInstanceRef.current.eachLayer((layer: any) => {
              mapInstanceRef.current.removeLayer(layer);
            });

            // Remove event listeners
            mapInstanceRef.current.off();

            // Remove the map
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;

            console.log('📍 Map cleanup completed');
          } catch (error) {
            console.warn('📍 Error during map cleanup:', error);
            // Force null the reference even if cleanup fails
            mapInstanceRef.current = null;
          }
        }

        // Clear the container HTML to ensure it's clean
        if (mapRef.current) {
          const container = mapRef.current as any;
          container.innerHTML = '';
          // Remove any Leaflet-specific classes that might interfere
          container.className = container.className.replace(/leaflet-\S+/g, '');
          // Remove Leaflet's internal reference to this container
          if (container._leaflet_id) {
            delete container._leaflet_id;
          }
          // Remove any data attributes that Leaflet might have set
          Object.keys(container.dataset).forEach((key: string) => {
            if (key.startsWith('leaflet')) {
              delete container.dataset[key];
            }
          });
        }

        // Small delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 50));

        // Double-check that the container is ready for initialization
        if (mapRef.current) {
          const container = mapRef.current as any;
          if (container._leaflet_id) {
            console.warn('📍 Container still has Leaflet ID, forcing cleanup');
            delete container._leaflet_id;
          }
        }

        // Calculate center point from properties
        const validCoords = memoizedProperties.filter(p => p.latitude && p.longitude);
        if (validCoords.length === 0) {
          setLoadingError('No properties with valid coordinates found.');
          setIsLoading(false);
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          return;
        }

        const centerLat = validCoords.reduce((sum, p) => sum + p.latitude, 0) / validCoords.length;
        const centerLng = validCoords.reduce((sum, p) => sum + p.longitude, 0) / validCoords.length;

        console.log(`📍 Map center calculated: ${centerLat}, ${centerLng}`);

        // Create map
        const map = window.L.map(mapRef.current).setView([centerLat, centerLng], 12);

        // Add OpenStreetMap tiles with loading event
        const tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        });

        // Handle tile loading completion
        tileLayer.on('load', () => {
          console.log('📍 Map tiles loaded successfully');
          setIsLoading(false);
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
        });

        tileLayer.on('tileerror', (e: any) => {
          console.error('📍 Tile loading error:', e);
          // Don't fail completely on tile errors, just log them
        });

        tileLayer.addTo(map);

      // Highly visible property icon with gradient, halo and pulse
      const propertyIcon = window.L.divIcon({
        html: `
          <div style=\"position: relative; width: 64px; height: 64px;\">
            <style>
              @keyframes subtleBreath {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.035); }
              }
            </style>
            <div style=\"
              position: absolute;
              top: 50%; left: 50%; transform: translate(-50%, -50%);
              width: 64px; height: 64px;
              border-radius: 50%;
              background: linear-gradient(135deg, #84fab0 20%, #8fd3f4 80%);
              border: 5px solid #ffffff;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 6px 16px rgba(0,0,0,0.35);
              animation: subtleBreath 3s ease-in-out infinite;
            \">
              <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"#ffffff\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\" focusable=\"false\">
                <path d=\"M12 2L2 9h2v11h6v-7h4v7h6V9h2L12 2z\"/>
              </svg>
            </div>
          </div>
        `,
        className: 'custom-property-marker',
        iconSize: [64, 64],
        iconAnchor: [32, 32]
      });

      // Add markers for each property
      validCoords.forEach((property, index) => {
        const marker = window.L.marker([property.latitude, property.longitude], {
          icon: propertyIcon,
          zIndexOffset: 1500
        }).addTo(map);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; font-family: 'Roboto', sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">
              🏠 Property ${index + 1}
            </h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">
              📍 ${property.address}
            </p>
            ${property.price ? `
              <p style="margin: 4px 0; color: #2e7d32; font-weight: bold; font-size: 15px;">
                💰 ${property.price}
              </p>
            ` : ''}
            ${property.bedrooms || property.bathrooms ? `
              <p style="margin: 4px 0; color: #666; font-size: 13px;">
                ${property.bedrooms ? `🛏️ ${property.bedrooms} bed` : ''}
                ${property.bedrooms && property.bathrooms ? ' • ' : ''}
                ${property.bathrooms ? `🚿 ${property.bathrooms} bath` : ''}
              </p>
            ` : ''}
            ${property.propertyType ? `
              <p style="margin: 4px 0; color: #666; font-size: 13px;">
                🏡 ${property.propertyType}
              </p>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      // Add reference point markers with distinct styling
      if (memoizedReferencePoints.length > 0) {
        const referenceIcon = window.L.divIcon({
          className: 'reference-point-marker',
          html: `<div style="
            background: #ff5722; 
            color: white; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border: 3px solid white; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3); 
            font-size: 16px;
            font-weight: bold;
          ">📍</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        memoizedReferencePoints.forEach((refPoint, index) => {
          const refMarker = window.L.marker([refPoint.latitude, refPoint.longitude], {
            icon: referenceIcon
          }).addTo(map);

          // Create reference point popup
          const refPopupContent = `
            <div style="min-width: 200px; font-family: 'Roboto', sans-serif;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="background: #ff5722; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 8px;">REFERENCE</span>
                <h3 style="margin: 0; color: #ff5722; font-size: 16px;">
                  📍 ${refPoint.name}
                </h3>
              </div>
              ${refPoint.address ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${refPoint.address}</p>` : ''}
              ${refPoint.description ? `<p style="margin: 4px 0; color: #666; font-size: 13px; font-style: italic;">${refPoint.description}</p>` : ''}
            </div>
          `;

          refMarker.bindPopup(refPopupContent);
        });
      }

      // Add school catchment boundaries (Phase 3)
      console.log('📍 [DEBUG] About to process catchment boundaries:', {
        count: memoizedCatchmentBoundaries.length,
        windowL: !!window.L,
        mapExists: !!map
      });

      if (memoizedCatchmentBoundaries.length > 0) {
        console.log('📍 Adding catchment boundaries to map:', memoizedCatchmentBoundaries.length);
        memoizedCatchmentBoundaries.forEach((catchment) => {
          try {
            console.log('📍 Processing catchment:', {
              schoolName: catchment.properties.school_name,
              level: catchment.properties.catchment_level,
              geometryType: catchment.geometry.type,
              coordinatesLength: catchment.geometry.coordinates[0]?.length,
              fullCatchment: catchment
            });

            // Extract coordinates from GeoJSON
            const coordinates = catchment.geometry.coordinates[0]; // First ring (exterior boundary)
            console.log('📍 Extracted coordinates sample:', coordinates.slice(0, 3));

            // Convert coordinates to Leaflet format [lat, lng]
            const leafletCoords = coordinates.map(([lng, lat]) => [lat, lng]);
            console.log('📍 Converted leaflet coords sample:', leafletCoords.slice(0, 3));

            // Determine color based on catchment level
            const isPrimary = catchment.properties.catchment_level === 'primary';
            const polygonColor = isPrimary ? '#0066cc' : '#16a34a'; // Blue for primary, green for secondary

            console.log('📍 Creating polygon with style:', {
              color: polygonColor,
              weight: 4,
              opacity: 0.8,
              fillColor: polygonColor,
              fillOpacity: 0.25,
              isPrimary,
              coordsCount: leafletCoords.length
            });

            // Create polygon with school catchment styling
            const polygon = window.L.polygon(leafletCoords, {
              color: polygonColor,
              weight: 4,
              opacity: 0.8,
              fillColor: polygonColor,
              fillOpacity: 0.25,
              dashArray: '5, 5' // Dashed line for visual distinction
            }).addTo(map);

            console.log('📍 Polygon added to map successfully for:', catchment.properties.school_name);

            // Create school information popup
            const schoolPopup = `
              <div style="min-width: 250px; font-family: 'Roboto', sans-serif;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="background: ${polygonColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-right: 8px;">
                    ${catchment.properties.catchment_level.toUpperCase()} SCHOOL
                  </span>
                </div>
                <h3 style="margin: 0 0 8px 0; color: ${polygonColor}; font-size: 16px;">
                  🏫 ${catchment.properties.school_name}
                </h3>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">
                  📍 ${catchment.properties.school_metadata.address}
                </p>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">
                  📍 ${catchment.properties.school_metadata.suburb} ${catchment.properties.school_metadata.postcode}
                </p>
                ${catchment.properties.school_metadata.subtype ? `
                  <p style="margin: 4px 0; color: #666; font-size: 13px;">
                    🎓 ${catchment.properties.school_metadata.subtype}
                  </p>
                ` : ''}
                ${catchment.properties.school_metadata.school_details?.selective_school ? `
                  <p style="margin: 4px 0; color: #666; font-size: 13px;">
                    ⭐ ${catchment.properties.school_metadata.school_details.selective_school}
                  </p>
                ` : ''}
                <p style="margin: 8px 0 4px 0; color: #999; font-size: 12px; font-style: italic;">
                  School Catchment Boundary - ${catchment.properties.catchment_id}
                </p>
              </div>
            `;

            polygon.bindPopup(schoolPopup);

            // Add click event for better interaction
            polygon.on('click', function(e: L.LeafletMouseEvent) {
              console.log('📍 Clicked school catchment:', catchment.properties.school_name);
            });

          } catch (error) {
            console.error('📍 Error rendering catchment boundary for', catchment.properties.school_name, ':', {
              error,
              catchmentData: catchment,
              geometryType: catchment.geometry?.type,
              coordinatesLength: catchment.geometry?.coordinates?.length,
              propertiesKeys: Object.keys(catchment.properties || {})
            });
          }
        });
      }

        // Fit map to show all markers (including reference points and catchment boundaries)
        const allPoints = [...validCoords.map(p => ({ latitude: p.latitude, longitude: p.longitude }))];
        memoizedReferencePoints.forEach(ref => {
          allPoints.push({ latitude: ref.latitude, longitude: ref.longitude });
        });
        
        if (allPoints.length > 1) {
          const group = new window.L.featureGroup(
            allPoints.map(p => window.L.marker([p.latitude, p.longitude]))
          );
          map.fitBounds(group.getBounds().pad(0.1));
        }

        mapInstanceRef.current = map;
        console.log(`📍 Map initialized successfully with ${validCoords.length} properties`);
        
        // Set a fallback timeout to hide loading even if tile load event doesn't fire
        setTimeout(() => {
          if (isLoading) {
            console.log('📍 Fallback: Setting loading to false after 3 seconds');
            setIsLoading(false);
            if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          }
        }, 3000);
        
      } catch (error) {
        console.error('📍 Map initialization error:', error);
        setLoadingError('Failed to create map. Please try refreshing the page.');
        setIsLoading(false);
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      } finally {
        // Reset initialization flag
        isInitializingRef.current = false;
      }
    };

    loadLeaflet();

    return () => {
      // Reset initialization flag
      isInitializingRef.current = false;
      
      // Cleanup map instance
      if (mapInstanceRef.current) {
        try {
          console.log('📍 useEffect cleanup: Removing map instance');

          // Remove all layers first
          mapInstanceRef.current.eachLayer((layer: any) => {
            try {
              mapInstanceRef.current.removeLayer(layer);
            } catch (e) {
              console.warn('📍 Error removing layer:', e);
            }
          });

          // Remove event listeners
          mapInstanceRef.current.off();

          // Remove the map
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;

          console.log('📍 useEffect cleanup: Map removed successfully');
        } catch (error) {
          console.warn('📍 Error during map cleanup in useEffect:', error);
          mapInstanceRef.current = null;
        }
      }
      
      // Clear timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      
      // Clear container if it exists
      if (mapRef.current) {
        const container = mapRef.current as any;
        container.innerHTML = '';
        container.className = container.className.replace(/leaflet-\S+/g, '');
        // Remove Leaflet's internal reference to this container
        if (container._leaflet_id) {
          delete container._leaflet_id;
        }
      }
    };
  }, [memoizedProperties, memoizedCatchmentBoundaries, memoizedReferencePoints]);

  if (!properties.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
          No Properties to Display
        </Typography>
        <Typography variant="body2" sx={{ color: '#999' }}>
          Please provide property data with valid coordinates
        </Typography>
      </Paper>
    );
  }

  const validProperties = properties.filter(p => p.latitude && p.longitude);
  const invalidCount = properties.length - validProperties.length;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Map Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn />
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            icon={<Home />} 
            label={`${validProperties.length} Properties`} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
          {invalidCount > 0 && (
            <Chip 
              label={`${invalidCount} No Coords`} 
              size="small" 
              color="warning" 
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Map Container */}
      <Paper
        sx={{
          position: 'relative',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div
          ref={mapRef}
          id={mapIdRef.current}
          style={{
            height: `${height}px`,
            width: '100%',
            backgroundColor: '#f5f5f5'
          }}
        />

        {/* Enhancement #1: Catchment Legend */}
        <CatchmentLegend catchmentLevel={catchmentLevel} />
        
        {/* Map Loading State */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(245, 245, 245, 0.9)',
              zIndex: 1000
            }}
          >
            <CircularProgress size={40} sx={{ mb: 2, color: '#1976d2' }} />
            <Typography variant="body1" sx={{ color: '#666' }}>
              🗺️ Loading interactive map...
            </Typography>
            <Typography variant="caption" sx={{ color: '#999', mt: 1 }}>
              Loading map tiles and markers
            </Typography>
          </Box>
        )}
        
        {/* Map Error State */}
        {loadingError && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 245, 245, 0.9)',
              zIndex: 1000
            }}
          >
            <Typography variant="body1" sx={{ color: '#d32f2f', mb: 1 }}>
              ❌ {loadingError}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Please try refreshing the page
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Map Footer */}
      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666', textAlign: 'center' }}>
        🏠 Click on markers to view property details • 📍 Map shows {validProperties.length} properties with coordinates
      </Typography>
    </Box>
  );
};

export default PropertyMap;
