import L from 'leaflet';

interface PropertyMarkerIconOptions {
  selected?: boolean;
  themeColor?: string; // Theme primary dark color for background
}

/**
 * Create a custom Leaflet DivIcon for single property markers
 *
 * Uses teardrop/balloon location pin style with:
 * - Dark background (theme color)
 * - White text showing "1"
 * - Cohesive teardrop shape (no separate pointer)
 * - Consistent with cluster marker styling
 */
export const createPropertyMarkerIcon = ({
  selected = false,
  themeColor = '#0b2d2c' // Default to Theme-A primary dark
}: PropertyMarkerIconOptions): L.DivIcon => {
  const width = selected ? 32 : 28;
  const height = selected ? 42 : 36;
  const fontSize = selected ? '13px' : '12px';

  // SVG teardrop/balloon pin shape
  const html = `
    <div class="property-location-marker ${selected ? 'selected' : ''}" style="
      cursor: pointer;
      transition: transform 200ms ease;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      <svg width="${width}" height="${height}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 7.732 14 22 14 22s14-14.268 14-22C28 6.268 21.732 0 14 0z" fill="${themeColor}"/>
        <text x="14" y="17" text-anchor="middle" fill="white" font-family="Inter, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold">1</text>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-property-marker',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height]
  });
};

/**
 * Create cluster icon with location pin style
 *
 * Uses consistent styling with single property markers:
 * - Dark background (theme color)
 * - White text showing count
 * - Teardrop/balloon shape (same as single property marker)
 */
export const createPropertyClusterIcon = (themeColor: string = '#0b2d2c') => (cluster: any): L.DivIcon => {
  const count = cluster.getChildCount();

  // Define size based on cluster size - scaled teardrop dimensions
  let width: number;
  let height: number;
  let fontSize: string;

  if (count < 10) {
    width = 36;
    height = 46;
    fontSize = '14px';
  } else if (count < 50) {
    width = 42;
    height = 54;
    fontSize = '15px';
  } else if (count < 100) {
    width = 48;
    height = 62;
    fontSize = '16px';
  } else {
    width = 54;
    height = 70;
    fontSize = '17px';
  }

  // SVG teardrop/balloon pin shape - same style as single property marker
  const html = `
    <div class="property-cluster-marker" style="
      cursor: pointer;
      transition: transform 200ms ease;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      <svg width="${width}" height="${height}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 7.732 14 22 14 22s14-14.268 14-22C28 6.268 21.732 0 14 0z" fill="${themeColor}"/>
        <text x="14" y="17" text-anchor="middle" fill="white" font-family="Inter, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold">${count}</text>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-property-cluster',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height]
  });
};

// Legacy exports for backward compatibility (deprecated)
export const createPriceMarkerIcon = createPropertyMarkerIcon;
export const createTextMarkerIcon = createPropertyMarkerIcon;
