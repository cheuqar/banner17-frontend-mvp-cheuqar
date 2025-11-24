import React, { useMemo, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip } from '@mui/material';
import { LocationOn, Home } from '@mui/icons-material';
import { formatDistance, getCategoryInfo } from '../../services/amenitiesService';

// Fix Leaflet default icon issue with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyAmenity {
  id?: string | null;
  name: string;
  category: string;
  subtype?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  distance_km: number;
}

interface AmenitiesMapProps {
  propertyCoords: [number, number];
  amenities: PropertyAmenity[];
  selectedAmenity?: string; // amenity id
  onSelectAmenity?: (amenityId: string) => void;
  className?: string;
  searchRadius?: number;
  loading?: boolean;
}

// Property marker icon - house icon
const propertyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZGMzNTQ1Ij4KICA8cGF0aCBkPSJNMTAgMjB2LTZoNHY2aDVWMTJoM0wxMiAzIDIgMTJoM3Y4eiIvPgo8L3N2Zz4K',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [32, 32],
  shadowAnchor: [8, 32]
});

// Category colors (match AmenityCategoryFilters configuration)
const CATEGORY_COLORS: Record<string, string> = {
  hospitals: '#f44336',
  libraries: '#2196f3',
  shopping: '#4caf50',
  schools: '#ff9800',
  beaches: '#00bcd4',
  sports: '#9c27b0',
  tourist_attractions: '#795548'
};

// Marker base styles
const MARKER_BG = '#ffffff'; // white background, mono-tone shape color from category

// Cache for generated div icons per category + selection state
const divIconCache: Record<string, L.DivIcon> = {};

const createCategoryDivIcon = (category: string, selected: boolean = false): L.DivIcon => {
  const cacheKey = `${category}__${selected ? 'selected' : 'normal'}`;
  if (divIconCache[cacheKey]) return divIconCache[cacheKey];
  const info = getCategoryInfo(category);

  // 75% bigger than previous sizes (22 -> ~39, 28 -> ~49)
  const size = selected ? 49 : 39; // Selected marker larger
  const ring = selected ? `box-shadow: 0 0 0 3px rgba(31,170,188,0.35), 0 1px 4px rgba(0,0,0,0.3);` : `box-shadow:0 1px 4px rgba(0,0,0,0.3);`;
  const iconSize = Math.round(size * 0.62);
  const fg = CATEGORY_COLORS[(category || '').toLowerCase()] || '#0d2b2c';

  // Map category to MUI icon path (render as SVG inline for mono-tone)
  const getIconSvgPath = (cat: string): string => {
    switch ((cat || '').toLowerCase()) {
      case 'hospitals':
      case 'hospital':
        return 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 11h-4v4H10v-4H6v-2h4V8h2v4h4v2z';
      case 'libraries':
      case 'library':
        return 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm18-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14V4zm-2 10H10v-2h10v2zm0-4H10V8h10v2z';
      case 'shopping':
      case 'shopping_centres':
      case 'shopping_centers':
      case 'mall':
      case 'malls':
        return 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14.26l.84-2h8l.84 2H7.16zM20 6h-3.31l-1.83-2H9.14L7.31 6H4v2h16V6z';
      case 'schools':
      case 'school':
      case 'universities_tafe':
      case 'university':
      case 'universities':
      case 'tafe':
        return 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 10.9L3.24 9 12 4.1 20.76 9 12 13.9z';
      case 'beaches':
      case 'beach':
        return 'M22 19c-1.1 0-2 .9-2 2H4a2 2 0 10-4 0h2a2 2 0 114 0h12a2 2 0 114 0h2a2 2 0 10-4 0zM2 17s2-2 5-2 5 2 8 2 5-2 7-2v-2c-2 0-3 2-7 2s-5-2-8-2-5 2-5 2v2z';
      case 'sports':
      case 'sport':
        return 'M16.5 2c-1.74 0-3.41.81-4.5 2.09C10.91 2.81 9.24 2 7.5 2 4.42 2 2 4.42 2 7.5c0 3.78 3.4 6.86 8.55 11.54l1.45 1.32 1.45-1.32C18.6 14.36 22 11.28 22 7.5 22 4.42 19.58 2 16.5 2z';
      case 'tourist_attractions':
      case 'attraction':
        return 'M12 2l3 7h7l-5.5 4.5L18 21l-6-3.5L6 21l1.5-7.5L2 9h7z';
      default:
        return 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z';
    }
  };

  const svgPath = getIconSvgPath(category);
  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      background:${MARKER_BG};
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      ${ring}
      transform: translate3d(0,0,0);
      color: ${fg};
      border: 2px solid ${fg};
    ">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${fg}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="${svgPath}"/>
      </svg>
    </div>`;

  const icon = new L.DivIcon({
    className: '',
    html,
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), size],
    popupAnchor: [0, -Math.round(size * 0.8)]
  });
  divIconCache[cacheKey] = icon;
  return icon;
};

// Map bounds setter component
const MapBoundsSetter: React.FC<{
  propertyCoords: [number, number];
  amenities: PropertyAmenity[];
}> = ({ propertyCoords, amenities }) => {
  const map = useMap();

  useEffect(() => {
    if (amenities.length > 0) {
      // Include property and all amenities in bounds
      const allPoints: [number, number][] = [
        propertyCoords,
        ...amenities.map(amenity => [amenity.latitude, amenity.longitude] as [number, number])
      ];
      
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      // Just center on property with 8km radius view
      map.setView(propertyCoords, 12);
    }
  }, [map, propertyCoords, amenities]);

  return null;
};

const AmenitiesMap: React.FC<AmenitiesMapProps> = ({
  propertyCoords,
  amenities,
  selectedAmenity,
  onSelectAmenity,
  className
}) => {
  const validAmenities = useMemo(() => {
    return amenities.filter(amenity => 
      amenity.latitude && amenity.longitude && 
      !isNaN(amenity.latitude) && !isNaN(amenity.longitude)
    );
  }, [amenities]);

  const getAmenityIcon = (category: string, isSelected: boolean) => {
    return createCategoryDivIcon(category, isSelected);
  };

  const createDistanceLabelIcon = (text: string, fontPx: number = 18): L.DivIcon => {
    return new L.DivIcon({
      className: '',
      html: `
        <div style="
          color: #000000;
          font-size: ${fontPx}px;
          font-weight: 600;
          line-height: 1;
          pointer-events: none;
          transform: translateY(-8px);
        ">${text}</div>
      `,
      iconSize: [1, 1],
      iconAnchor: [0, 0]
    });
  };

  // Track zoom to scale distance label font size
  const [labelFontPx, setLabelFontPx] = useState<number>(18);
  const baseZoomRef = useRef<number | null>(null);

  // Label font size is zoom-aware; no debug logs in production

  const ZoomWatcher: React.FC<{ onZoomChange: (z: number) => void }> = ({ onZoomChange }) => {
    const map = useMap();
    useEffect(() => {
      const handler = () => {
        const current = map.getZoom();
        onZoomChange(current);
      };
      // Initialize with current zoom
      onZoomChange(map.getZoom());
      map.on('zoom', handler);
      map.on('zoomend', handler);
      return () => {
        map.off('zoom', handler);
        map.off('zoomend', handler);
      };
    }, [map, onZoomChange]);
    return null;
  };

  const SelectedAmenityCenter: React.FC<{ selectedId?: string }> = ({ selectedId }) => {
    const map = useMap();
    useEffect(() => {
      if (!selectedId) return;
      const a = validAmenities.find(x => (x.id || '') === selectedId);
      if (a) {
        map.setView([a.latitude, a.longitude], Math.max(map.getZoom(), 14), { animate: true });
      }
    }, [selectedId, map]);
    return null;
  };

  return (
    <Box className={className} sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={propertyCoords}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Watch zoom to scale label font */}
        <ZoomWatcher onZoomChange={(z) => {
          if (baseZoomRef.current === null) {
            baseZoomRef.current = z;
          }
          const base = baseZoomRef.current ?? z;
          const zoomOutSteps = Math.max(0, base - z);
          // Keep current size for first 4 zoom-out steps; from step 5, halve the size
          const size = zoomOutSteps >= 4 ? Math.round(18 / 2) : 18;
          if (size !== labelFontPx) setLabelFontPx(size);
        }} />
        
        {/* Property Marker */}
        <Marker position={propertyCoords} icon={propertyIcon}>
          <Popup>
            <Box sx={{ p: 1, minWidth: 200 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Home sx={{ color: '#0d2b2c', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0d2b2c' }}>
                  Property Location
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Target property for amenities search
              </Typography>
            </Box>
          </Popup>
        </Marker>

        {/* Radius Rings every 0.5km up to 8km */}
        {Array.from({ length: 16 }, (_, i) => (i + 1) * 0.5).map((km, idx) => {
          const radiusMeters = km * 1000;
          const latOffset = km / 111; // approx degrees per km for latitude
          const labelPos: [number, number] = [propertyCoords[0] + latOffset, propertyCoords[1]];
          const isLabel = (idx + 1) % 4 === 0; // every 2.0km
          return (
            <React.Fragment key={`ring-${km}`}>
              <Circle
                center={propertyCoords}
                radius={radiusMeters}
                pathOptions={{
                  color: '#000000',
                  weight: isLabel ? 2 : 1,
                  opacity: 0.9,
                  dashArray: '2 10',
                  fill: false,
                  fillOpacity: 0
                }}
              />
              {isLabel && (
                <Marker 
                  key={`ring-label-${km}-${labelFontPx}`}
                  position={labelPos} 
                  icon={createDistanceLabelIcon(`${km.toFixed(1)} km`, labelFontPx)} 
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Amenity Markers */}
        {validAmenities.map((amenity, index) => {
          const categoryInfo = getCategoryInfo(amenity.category);
          const isSelected = !!selectedAmenity && selectedAmenity === (amenity.id || undefined);
          return (
            <Marker
              key={amenity.id || `amenity-${index}`}
              position={[amenity.latitude, amenity.longitude]}
              icon={getAmenityIcon(amenity.category, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectAmenity && amenity.id) onSelectAmenity(amenity.id);
                }
              }}
            >
              <Popup>
                <Box sx={{ p: 1, minWidth: 220 }}>
                  {/* Category Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>
                      {categoryInfo.icon}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0d2b2c' }}>
                      {categoryInfo.label}
                    </Typography>
                  </Box>
                  {/* Amenity Name */}
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {amenity.name}
                  </Typography>
                  {/* Distance */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: '#0d2b2c' }} />
                    <Chip
                      label={formatDistance(amenity.distance_km)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        borderColor: 'rgba(31, 170, 188, 0.3)',
                        color: '#0d2b2c'
                      }}
                    />
                  </Box>
                  {/* Address */}
                  {amenity.address && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {amenity.address}
                    </Typography>
                  )}
                  {/* Subtype */}
                  {amenity.subtype && (
                    <Typography variant="caption" color="text.secondary">
                      • {amenity.subtype}
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          );
        })}

        {/* Auto-fit bounds */}
        <MapBoundsSetter propertyCoords={propertyCoords} amenities={validAmenities} />
        <SelectedAmenityCenter selectedId={selectedAmenity} />
      </MapContainer>
      
      {/* Map Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 1,
          p: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
          Legend
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#d73027', borderRadius: '50%' }} />
          <Typography variant="caption">Property</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#2166ac', borderRadius: '50%' }} />
          <Typography variant="caption">Libraries</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#5aae61', borderRadius: '50%' }} />
          <Typography variant="caption">Hospitals</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#fd8d3c', borderRadius: '50%' }} />
          <Typography variant="caption">Shopping</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AmenitiesMap;
