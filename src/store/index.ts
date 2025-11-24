import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import propertyReducer from './slices/propertySlice';
import chatReducer from './slices/chatSlice';
import locationReducer from './slices/locationSlice';
import uiReducer from './slices/uiSlice';
import smartSearchReducer from './slices/smartSearchSlice';
import schoolPanelReducer from './slices/smartSearch/schoolPanelSlice';
import schoolBboxReducer from './slices/smartSearch/schoolBboxSlice';
import mapBoundsReducer from './slices/smartSearch/mapBoundsSlice';
import searchFiltersReducer from './slices/searchFilters';
import themeReducer from './slices/themeSlice';
import mapTileStyleReducer from './slices/mapTileStyleSlice';

// Persist configuration
const persistConfig = {
  key: 'listez-chatbot',
  storage,
  whitelist: ['user', 'property', 'chat', 'smartSearch', 'schoolPanel', 'schoolBbox', 'mapBounds', 'searchFilters', 'theme', 'mapTileStyle'], // Persist smartSearch for school selections, schoolPanel state, schoolBbox for bbox schools, mapBounds for map viewport, searchFilters for header state, theme for user theme preference, and mapTileStyle for map tile style preference
  // Phase 2.33 v15: Add 3 new OSM tile styles (CyclOSM, France, Topo)
  // Phase 2.32.6 v14: Remove radiusKm from amenities (bbox-only pattern)
  // Phase 2.32.1 v13: Convert amenities to single-selection
  // Phase 2.32 v12: Add amenities state migration
  // Phase 2.22 BUG FIX v11: Reliable migration-based approach
  // Transforms were unreliable for this use case, reverting to proven migrate() solution
  blacklist: [],
  version: 15, // Phase 2.33 v15: Add 3 new OSM tile styles
  migrate: (state: any) => {
    // Phase 2.8: Add autoSearchState to existing persisted state
    if (state?.smartSearch && !state.smartSearch.autoSearchState) {
      console.log('[Redux Persist] Migrating smartSearch state to v2 (adding autoSearchState)');
      state.smartSearch.autoSearchState = {
        countdown: null,
        isActive: false,
        isSearchInitiated: false,
      };
    }

    // Phase 2.10: Add paginationState to existing persisted state
    if (state?.smartSearch && !state.smartSearch.paginationState) {
      console.log('[Redux Persist] Migrating smartSearch state to v3 (adding paginationState)');
      state.smartSearch.paginationState = {
        currentPage: 1,
        itemsPerPage: 25,
        visibleProperties: [],
        totalVisibleCount: 0,
        totalPages: 0,
      };
    }

    // BUG-01 FIX (Option C): Clean up empty or undefined drawnPolygons from old persisted state
    if (state?.smartSearch) {
      // Initialize drawnPolygons if missing
      if (!state.smartSearch.drawnPolygons) {
        console.log('[Redux Persist] BUG-01 FIX: Initializing missing drawnPolygons array');
        state.smartSearch.drawnPolygons = [];
      }
      // Clean up empty array that was being treated as active filter
      else if (Array.isArray(state.smartSearch.drawnPolygons) && state.smartSearch.drawnPolygons.length === 0) {
        console.log('[Redux Persist] BUG-01 FIX: Clearing empty drawnPolygons array from old persisted state');
        // Ensure it stays as empty array (correct state)
        state.smartSearch.drawnPolygons = [];
      }

      // Also clear activeSpatialFilter if it was set to drawnPolygon with empty array
      if (state.smartSearch.activeSpatialFilter === 'drawnPolygon' &&
          (!state.smartSearch.drawnPolygons || state.smartSearch.drawnPolygons.length === 0)) {
        console.log('[Redux Persist] BUG-01 FIX: Clearing invalid drawnPolygon spatial filter with no polygons');
        state.smartSearch.activeSpatialFilter = 'none';
      }
    }

    // Phase 2.10.7.2: Initialize schoolPanel state if missing
    if (!state?.schoolPanel) {
      console.log('[Redux Persist] Migrating to v5 (adding schoolPanel state)');
      state.schoolPanel = {
        filters: {
          schoolName: '',
          educationLevels: [],
          schoolTypes: [],
          genders: [],
          denominations: [],
        },
        searchResults: [],
        selectedSchools: [],
        showMarkersOnMap: false,
        visibleSchoolMarkers: [],
        loading: false,
        error: null,
      };
    }

    // Phase 2.12.1 FIX: Initialize smartSearch.schools.showSchoolsOnMap if missing
    // This toggle controls school marker visibility on the map
    if (state?.smartSearch?.schools) {
      if (state.smartSearch.schools.showSchoolsOnMap === undefined) {
        console.log('[Redux Persist] Migrating smartSearch.schools.showSchoolsOnMap to v6 (initializing toggle)');
        state.smartSearch.schools.showSchoolsOnMap = true; // Default to showing markers
      }
      if (state.smartSearch.schools.showCatchmentRadius === undefined) {
        console.log('[Redux Persist] Migrating smartSearch.schools.showCatchmentRadius to v6 (initializing toggle)');
        state.smartSearch.schools.showCatchmentRadius = false; // Default to hiding catchment areas
      }
    }

    // Phase 2.12.2: Initialize schoolBbox state if missing
    if (!state?.schoolBbox) {
      console.log('[Redux Persist] Migrating to v7 (adding schoolBbox state for bbox schools)');
      state.schoolBbox = {
        schools: [],
        loading: false,
        error: null,
        lastBounds: undefined,
      };
    }

    // Phase 2.12.2: Initialize mapBounds state if missing
    if (!state?.mapBounds) {
      console.log('[Redux Persist] Migrating to v7 (adding mapBounds state for map viewport)');
      state.mapBounds = {
        north: -33.7,
        south: -34.0,
        east: 151.3,
        west: 151.0,
      };
    }

    // Phase 2.17.1: Initialize collapsible property panel state if missing
    if (state?.smartSearch) {
      if (state.smartSearch.propertyPanelVisible === undefined) {
        console.log('[Redux Persist] Migrating smartSearch.propertyPanelVisible to v8 (initializing panel visibility)');
        state.smartSearch.propertyPanelVisible = true; // Default: panel open
      }
      if (state.smartSearch.filtersOverlayVisible === undefined) {
        console.log('[Redux Persist] Migrating smartSearch.filtersOverlayVisible to v8 (initializing drawer state)');
        state.smartSearch.filtersOverlayVisible = false; // Default: drawer closed
      }
    }

    // Phase 2.32: Initialize amenities state if missing
    if (state?.smartSearch && !state.smartSearch.amenities) {
      console.log('[Redux Persist] Migrating smartSearch state to v12 (adding amenities)');
      state.smartSearch.amenities = {
        isLoading: false,
        error: null,
        data: [],
        selectedAmenityId: null, // Phase 2.32.1: Single selection
        selectedAmenity: null, // Phase 2.32.1: Single cached amenity
        searchQuery: '',
        categoryFilters: [],
        radiusKm: 5,
        showAmenitiesOnMap: true,
      };
    }

    // Phase 2.32.1: Convert amenities from multi-select to single-select
    if (state?.smartSearch?.amenities) {
      const amenities = state.smartSearch.amenities;

      // Check if old array-based fields exist
      if (amenities.selectedAmenityIds !== undefined || amenities.selectedAmenitiesCache !== undefined) {
        console.log('[Redux Persist] Migrating amenities to v13 (single-selection pattern)');

        // Convert from arrays to single values
        // If user had selections, take the first one; otherwise null
        const firstSelectedId = Array.isArray(amenities.selectedAmenityIds) && amenities.selectedAmenityIds.length > 0
          ? amenities.selectedAmenityIds[0]
          : null;

        const firstSelectedAmenity = Array.isArray(amenities.selectedAmenitiesCache) && amenities.selectedAmenitiesCache.length > 0
          ? amenities.selectedAmenitiesCache[0]
          : null;

        amenities.selectedAmenityId = firstSelectedId;
        amenities.selectedAmenity = firstSelectedAmenity;

        // Remove old array fields
        delete amenities.selectedAmenityIds;
        delete amenities.selectedAmenitiesCache;
      }
    }

    // Phase 2.32.6: Remove radiusKm from amenities (bbox-only pattern)
    if (state?.smartSearch?.amenities) {
      const amenities = state.smartSearch.amenities;

      // Remove radiusKm if it exists
      if (amenities.radiusKm !== undefined) {
        console.log('[Redux Persist] Migrating amenities to v14 (removing radiusKm for bbox-only pattern)');
        delete amenities.radiusKm;
      }
    }

    // Phase 2.22 BUG FIX v11: Reset searchPending UNCONDITIONALLY on every app startup
    // This is the ONLY place searchPending gets initialized/reset
    // searchPending should NEVER be persisted - it's a transient operational flag
    // If searchPending=true from previous session, it blocks all searches on page reload
    // By resetting here, we guarantee every app startup has searchPending=false
    if (state?.smartSearch) {
      const previousValue = state.smartSearch.searchPending;
      state.smartSearch.searchPending = false;

      // Log only if we actually changed the value from true
      if (previousValue === true) {
        console.log('[Redux Persist] Phase 2.22 FIX v11: Reset searchPending from true to false', {
          reason: 'Transient flag must never block searches on app startup',
          previousValue: previousValue,
          newValue: false,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.warn('[Redux Persist] WARNING: smartSearch state not found during migration!');
    }

    // Phase 2.33: Merge new map tile styles into persisted config
    if (state?.mapTileStyle?.tileConfigs) {
      const persistedConfigs = state.mapTileStyle.tileConfigs;
      const hasNewStyles = persistedConfigs.osm_cyclosm && persistedConfigs.osm_france && persistedConfigs.osm_topo;

      if (!hasNewStyles) {
        console.log('[Redux Persist] Migrating mapTileStyle to v15 (adding 3 new OSM tile styles)');

        // Add CyclOSM if missing
        if (!persistedConfigs.osm_cyclosm) {
          persistedConfigs.osm_cyclosm = {
            name: 'CyclOSM',
            provider: 'OpenStreetMap',
            url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases">CyclOSM</a>',
            maxZoom: 20,
          };
        }

        // Add OSM France if missing
        if (!persistedConfigs.osm_france) {
          persistedConfigs.osm_france = {
            name: 'France',
            provider: 'OpenStreetMap',
            url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.openstreetmap.fr/">OSM France</a>',
            maxZoom: 20,
          };
        }

        // Add OpenTopoMap if missing
        if (!persistedConfigs.osm_topo) {
          persistedConfigs.osm_topo = {
            name: 'Topo',
            provider: 'OpenTopoMap',
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://opentopomap.org/">OpenTopoMap</a>',
            maxZoom: 17,
          };
        }

        // Update names for existing OSM styles to match new pattern
        if (persistedConfigs.osm_standard && persistedConfigs.osm_standard.name === 'OSM Standard') {
          persistedConfigs.osm_standard.name = 'Standard';
        }
        if (persistedConfigs.osm_humanitarian && persistedConfigs.osm_humanitarian.name === 'OSM Humanitarian') {
          persistedConfigs.osm_humanitarian.name = 'Humanitarian';
        }
      }
    }

    console.log('[Redux Persist] Migrate function v11 completed', {
      hasSmartSearch: !!state?.smartSearch,
      searchPending: state?.smartSearch?.searchPending,
      timestamp: new Date().toISOString(),
    });

    return Promise.resolve(state);
  },
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  property: propertyReducer,
  chat: chatReducer,
  location: locationReducer,
  ui: uiReducer,
  smartSearch: smartSearchReducer,
  schoolPanel: schoolPanelReducer, // Phase 2.10.7.2: School panel state
  schoolBbox: schoolBboxReducer, // Phase 2.12.2: Schools fetched from bbox endpoint
  mapBounds: mapBoundsReducer, // Phase 2.12.2: Current map viewport bounds
  searchFilters: searchFiltersReducer, // Feature 003: Smart Search Header filters
  theme: themeReducer, // Theme management for Smart Search page
  mapTileStyle: mapTileStyleReducer, // Phase 2.33: Map tile style management
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks for use throughout the app
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 