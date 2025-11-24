/**
 * Redux slice for map tile style management (Phase 2.33)
 *
 * Features:
 * - Tile style selection (8 styles: 3 CARTO + 5 OSM variants)
 * - Tile configuration management (URL, attribution, provider)
 * - localStorage persistence via Redux Persist
 *
 * Providers:
 * - CARTO/CartoDB: Light (default), Dark, Voyager (no API key)
 * - OpenStreetMap: Standard, Humanitarian, CyclOSM, France, Topo (no API key)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export type MapTileStyle = 'light' | 'dark' | 'voyager' | 'osm_standard' | 'osm_humanitarian' | 'osm_cyclosm' | 'osm_france' | 'osm_topo';

interface TileConfig {
  name: string;
  provider: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

interface MapTileStyleState {
  currentStyle: MapTileStyle;
  tileConfigs: Record<MapTileStyle, TileConfig>;
}

/**
 * Tile configuration for all available providers
 *
 * CARTO/CartoDB (Free tier: 75,000 mapviews/month):
 * - light_all: Default light theme (current style)
 * - dark_all: Dark theme for low-light environments
 * - voyager: Alternative aesthetic with subdued colors
 *
 * OpenStreetMap (Free, unlimited with fair use):
 * - Standard: Classic OSM rendering
 * - Humanitarian: High-contrast style from HOT
 * - CyclOSM: Cycling-focused rendering with bike routes
 * - France: French language prioritization
 * - Topo: Topographic map with terrain contours
 */
const TILE_CONFIGS: Record<MapTileStyle, TileConfig> = {
  // CARTO styles (no API key required)
  light: {
    name: 'Light',
    provider: 'CARTO',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  dark: {
    name: 'Dark',
    provider: 'CARTO',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  voyager: {
    name: 'Voyager',
    provider: 'CARTO',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  // OpenStreetMap styles (no API key required, fallback provider)
  osm_standard: {
    name: 'Standard',
    provider: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  osm_humanitarian: {
    name: 'Humanitarian',
    provider: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>',
    maxZoom: 19,
  },
  osm_cyclosm: {
    name: 'CyclOSM',
    provider: 'OpenStreetMap',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases">CyclOSM</a>',
    maxZoom: 20,
  },
  osm_france: {
    name: 'France',
    provider: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.openstreetmap.fr/">OSM France</a>',
    maxZoom: 20,
  },
  osm_topo: {
    name: 'Topo',
    provider: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://opentopomap.org/">OpenTopoMap</a>',
    maxZoom: 17,
  },
};

const initialState: MapTileStyleState = {
  currentStyle: 'light', // Default to light (current style in production)
  tileConfigs: TILE_CONFIGS,
};

const mapTileStyleSlice = createSlice({
  name: 'mapTileStyle',
  initialState,
  reducers: {
    /**
     * Set the current map tile style
     * @param action.payload - The tile style to activate
     */
    setMapTileStyle: (state, action: PayloadAction<MapTileStyle>) => {
      state.currentStyle = action.payload;
    },
  },
});

export const { setMapTileStyle } = mapTileStyleSlice.actions;

// Selectors

/**
 * Select the current active map tile style
 */
export const selectCurrentMapStyle = (state: RootState) => state.mapTileStyle.currentStyle;

/**
 * Select the tile configuration for the current active style
 * Falls back to 'light' config if current style is invalid
 */
export const selectTileConfig = (state: RootState) =>
  state.mapTileStyle.tileConfigs[state.mapTileStyle.currentStyle] || state.mapTileStyle.tileConfigs.light;

/**
 * Select all available tile configurations
 */
export const selectAllTileConfigs = (state: RootState) => state.mapTileStyle.tileConfigs;

export default mapTileStyleSlice.reducer;
