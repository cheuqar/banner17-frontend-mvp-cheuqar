import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Property, PropertyAddress, PropertyMedia, PropertyDetails, PropertyAnalysis, PropertyPricing, PropertyContent } from '../../types';

interface PropertyState {
  property: Property;
}

const initialState: PropertyState = {
  property: {
    id: null,
    address: {
      formatted: '',
      components: {},
      coordinates: { lat: 0, lng: 0 },
      validationStatus: 'pending',
      confidence: 0,
    },
    media: {
      photos: [],
      videos: [],
      uploadProgress: {},
      analysisResults: {},
      thumbnails: [],
    },
    details: {
      type: '',
      bedrooms: 0,
      bathrooms: 0,
      features: [],
      condition: '',
      age: 0,
      description: '',
      customFeatures: [],
    },
    analysis: {
      aiInsights: {},
      extractedFeatures: [],
      confidence: 0,
      userConfirmations: {},
      corrections: [],
    },
    pricing: {
      suggestedRange: { min: 0, max: 0 },
      factors: [],
      comparables: [],
      marketTrends: {},
      selectedStrategy: '',
      userAdjustments: {},
    },
    content: {
      descriptions: [],
      highlights: [],
      selectedStyle: 'professional',
      userEdits: [],
      versions: [],
    },
    status: 'draft',
  },
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperty: (state, action: PayloadAction<Property>) => {
      state.property = action.payload;
    },
    updateAddress: (state, action: PayloadAction<Partial<PropertyAddress>>) => {
      state.property.address = { ...state.property.address, ...action.payload };
    },
    updateMedia: (state, action: PayloadAction<Partial<PropertyMedia>>) => {
      state.property.media = { ...state.property.media, ...action.payload };
    },
    updateDetails: (state, action: PayloadAction<Partial<PropertyDetails>>) => {
      state.property.details = { ...state.property.details, ...action.payload };
    },
    updateAnalysis: (state, action: PayloadAction<Partial<PropertyAnalysis>>) => {
      state.property.analysis = { ...state.property.analysis, ...action.payload };
    },
    updatePricing: (state, action: PayloadAction<Partial<PropertyPricing>>) => {
      state.property.pricing = { ...state.property.pricing, ...action.payload };
    },
    updateContent: (state, action: PayloadAction<Partial<PropertyContent>>) => {
      state.property.content = { ...state.property.content, ...action.payload };
    },
    setPropertyStatus: (state, action: PayloadAction<Property['status']>) => {
      state.property.status = action.payload;
    },
    clearProperty: (state) => {
      state.property = initialState.property;
    },
  },
});

export const {
  setProperty,
  updateAddress,
  updateMedia,
  updateDetails,
  updateAnalysis,
  updatePricing,
  updateContent,
  setPropertyStatus,
  clearProperty,
} = propertySlice.actions;

export default propertySlice.reducer; 