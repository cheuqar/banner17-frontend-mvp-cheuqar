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
 * - FIXED SIZE: All clusters use same size as single property marker
 */
export const createPropertyClusterIcon = (themeColor: string = '#0b2d2c') => (cluster: any): L.DivIcon => {
  const count = cluster.getChildCount();

  // FIXED SIZE: Use same dimensions as single property marker (non-selected)
  // This ensures all cluster markers have consistent size regardless of count
  const width = 28;
  const height = 36;

  // Adjust font size based on digit count to fit within fixed marker size
  let fontSize: string;
  if (count < 10) {
    fontSize = '12px';
  } else if (count < 100) {
    fontSize = '10px';
  } else if (count < 1000) {
    fontSize = '8px';
  } else {
    fontSize = '7px';
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

/**
 * Shared teardrop cluster icon utility
 *
 * Creates a teardrop/balloon style cluster marker that can be used by
 * properties, schools, amenities, or any future layer types.
 *
 * @param count - Number to display in the marker
 * @param color - Background color of the marker
 * @param className - CSS class name for the marker (for styling hooks)
 */
export const createTeardropClusterIcon = (
  count: number,
  color: string,
  className: string = 'teardrop-cluster'
): L.DivIcon => {
  // FIXED SIZE: 28x36px for all cluster markers (matches property markers)
  const width = 28;
  const height = 36;

  // Dynamic font size based on digit count
  let fontSize: string;
  if (count < 10) {
    fontSize = '12px';
  } else if (count < 100) {
    fontSize = '10px';
  } else if (count < 1000) {
    fontSize = '8px';
  } else {
    fontSize = '7px';
  }

  const html = `
    <div class="${className}" style="
      cursor: pointer;
      transition: transform 200ms ease;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      <svg width="${width}" height="${height}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 7.732 14 22 14 22s14-14.268 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
        <text x="14" y="17" text-anchor="middle" fill="white" font-family="Inter, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold">${count}</text>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: `custom-${className}`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height]
  });
};

// Legacy exports for backward compatibility (deprecated)
export const createPriceMarkerIcon = createPropertyMarkerIcon;
export const createTextMarkerIcon = createPropertyMarkerIcon;
