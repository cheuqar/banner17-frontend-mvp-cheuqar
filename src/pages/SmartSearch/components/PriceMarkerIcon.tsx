import L from 'leaflet';
import styles from '../../../components/map/MapMarker.module.css';

interface PriceMarkerIconOptions {
  price: number;
  selected?: boolean;
  themeColor?: string; // Theme primary dark color for border and text
}

interface TextMarkerIconOptions {
  priceDisplay?: string;
  selected?: boolean;
  themeColor?: string; // Theme primary dark color for border and text
}

/**
 * Format price to short readable format (K for thousands, M for millions)
 */
function formatPriceShort(price: number): string {
  if (price >= 1000000) {
    const millions = price / 1000000;
    return `$${millions.toFixed(1)}M`;
  } else if (price >= 1000) {
    const thousands = price / 1000;
    return `$${thousands.toFixed(0)}K`;
  } else {
    return `$${price}`;
  }
}

/**
 * Format text marker label for properties without price
 *
 * Task 2.33.1: Text Marker Formatting Logic
 * - Extracts price_display field (e.g., "Contact Agent", "Price on Request")
 * - Fallback to "Contact Agent" if null/empty
 * - Truncate to max 80 characters for display
 */
function formatTextMarkerLabel(priceDisplay?: string): string {
  const defaultLabel = "Contact Agent";

  if (!priceDisplay || priceDisplay.trim() === '') {
    return defaultLabel;
  }

  const trimmedLabel = priceDisplay.trim();

  // Truncate to 80 characters to fit within 3-line max constraint
  if (trimmedLabel.length > 80) {
    return trimmedLabel.substring(0, 77) + '...';
  }

  return trimmedLabel;
}

/**
 * Create a custom Leaflet DivIcon with price label for property markers
 *
 * Smart Search UI Redesign (Feature 001) - Phase 5 User Story 3
 * Theme-aware marker styling:
 * - Uses theme primary dark color for border and text
 * - White background
 * - Hover inverts to theme color background with white text
 * - Selected state with thicker border
 *
 * Features:
 * - Price formatted as $1.2M or $850K
 * - Pointer/pin below label
 * - Selected state with inverted colors and thicker border
 * - Smooth hover scale and color inversion animations
 */
export const createPriceMarkerIcon = ({
  price,
  selected = false,
  themeColor = '#0b2d2c' // Default to Theme-A primary dark
}: PriceMarkerIconOptions): L.DivIcon => {
  const formattedPrice = formatPriceShort(price);

  const html = `
    <div class="${styles.priceMarker} ${selected ? styles.selected : ''}" style="--theme-color: ${themeColor};">
      <div class="${styles.priceLabel}" style="border-color: ${themeColor}; color: ${themeColor};">${formattedPrice}</div>
      <div class="${styles.pricePointer}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: styles.customPriceMarker,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
    popupAnchor: [0, -40]
  });
};

/**
 * Create a custom Leaflet DivIcon with text label for no-price properties
 *
 * Task 2.33.3: Text Marker Icon Implementation
 * Theme-aware marker styling:
 * - Uses theme primary dark color for border and text
 * - White background
 * - Hover inverts to theme color background with white text
 * - Selected state with thicker border
 *
 * Features:
 * - Text formatted via formatTextMarkerLabel()
 * - Pointer/pin below label
 * - Selected state with inverted colors and thicker border
 * - Smooth hover scale and color inversion animations
 */
export const createTextMarkerIcon = ({
  priceDisplay = "Contact Agent",
  selected = false,
  themeColor = '#0b2d2c' // Default to Theme-A primary dark
}: TextMarkerIconOptions): L.DivIcon => {
  const formattedLabel = formatTextMarkerLabel(priceDisplay);

  const html = `
    <div class="${styles.textMarker} ${selected ? styles.selected : ''}" style="--theme-color: ${themeColor};">
      <div class="${styles.textMarkerLabel}" style="border-color: ${themeColor}; color: ${themeColor};">${formattedLabel}</div>
      <div class="${styles.pricePointer}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: styles.customPriceMarker,
    iconSize: [80, 50], // Taller to accommodate 3 lines of text
    iconAnchor: [40, 50],
    popupAnchor: [0, -50]
  });
};
