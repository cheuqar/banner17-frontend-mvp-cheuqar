import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LocationData, Amenity, SchoolDistrict, TransportLink, ComparableProperty } from '../../types';

const initialState: LocationData = {
  currentLocation: null,
  nearbyAmenities: [],
  marketData: {},
  comparableProperties: [],
  schoolDistricts: [],
  transportLinks: [],
  demographics: {},
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<{ lat: number; lng: number } | null>) => {
      state.currentLocation = action.payload;
    },
    setNearbyAmenities: (state, action: PayloadAction<Amenity[]>) => {
      state.nearbyAmenities = action.payload;
    },
    updateMarketData: (state, action: PayloadAction<Record<string, any>>) => {
      state.marketData = { ...state.marketData, ...action.payload };
    },
    setComparableProperties: (state, action: PayloadAction<ComparableProperty[]>) => {
      state.comparableProperties = action.payload;
    },
    setSchoolDistricts: (state, action: PayloadAction<SchoolDistrict[]>) => {
      state.schoolDistricts = action.payload;
    },
    setTransportLinks: (state, action: PayloadAction<TransportLink[]>) => {
      state.transportLinks = action.payload;
    },
    updateDemographics: (state, action: PayloadAction<Record<string, any>>) => {
      state.demographics = { ...state.demographics, ...action.payload };
    },
    clearLocationData: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentLocation,
  setNearbyAmenities,
  updateMarketData,
  setComparableProperties,
  setSchoolDistricts,
  setTransportLinks,
  updateDemographics,
  clearLocationData,
} = locationSlice.actions;

export default locationSlice.reducer; 