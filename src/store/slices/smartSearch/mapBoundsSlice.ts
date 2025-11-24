import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface MapBoundsState {
  /** Current map viewport bounds */
  north: number;
  south: number;
  east: number;
  west: number;
}

const initialState: MapBoundsState = {
  north: -33.7,
  south: -34.0,
  east: 151.3,
  west: 151.0,
};

export const mapBoundsSlice = createSlice({
  name: 'mapBounds',
  initialState,
  reducers: {
    // Set map bounds from extracted map viewport
    setMapBounds: (state, action: PayloadAction<MapBoundsState>) => {
      state.north = action.payload.north;
      state.south = action.payload.south;
      state.east = action.payload.east;
      state.west = action.payload.west;
    },
  },
});

export const { setMapBounds } = mapBoundsSlice.actions;

export default mapBoundsSlice.reducer;

// Selectors
export const selectMapBounds = (state: any): MapBoundsState => ({
  north: state.mapBounds?.north ?? -33.7,
  south: state.mapBounds?.south ?? -34.0,
  east: state.mapBounds?.east ?? 151.3,
  west: state.mapBounds?.west ?? 151.0,
});

export const selectMapNorth = (state: any) => state.mapBounds?.north ?? -33.7;
export const selectMapSouth = (state: any) => state.mapBounds?.south ?? -34.0;
export const selectMapEast = (state: any) => state.mapBounds?.east ?? 151.3;
export const selectMapWest = (state: any) => state.mapBounds?.west ?? 151.0;
