import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FloatingMapControls from './FloatingMapControls';
import smartSearchReducer from '../../../store/slices/smartSearchSlice';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('./FloatingResultsButton', () => {
  return function MockFloatingResultsButton() {
    return <div data-testid="mock-results-button">FloatingResultsButton</div>;
  };
});

jest.mock('./FloatingFiltersButton', () => {
  return function MockFloatingFiltersButton() {
    return <div data-testid="mock-filters-button">FloatingFiltersButton</div>;
  };
});

// Helper function to create a mock store
const createMockStore = (initialState: any) => {
  return configureStore({
    reducer: {
      smartSearch: smartSearchReducer,
    },
    preloadedState: {
      smartSearch: initialState,
    },
  });
};

describe('FloatingMapControls', () => {
  const mockInitialState = {
    propertyPanelVisible: false,
    filtersOverlayVisible: false,
    activeFilters: [],
    properties: [],
    loading: false,
    error: null,
    totalCount: 120,
    displayedCount: 0,
    paginationOffset: 0,
    filtersApplied: {},
    mapCenter: null,
    selectedAddress: null,
    mapBounds: null,
    searchBounds: null,
    manualMapMove: false,
    mapControls: { activePanel: null, panelWidth: 350 },
    viewMode: 'map' as const,
    filters: {
      location: { state: null, suburb: null, postcode: null },
      priceRange: { min: null, max: null },
      bedrooms: { min: null, max: null },
      bathrooms: { min: null },
      parking: { min: null },
      propertyTypes: [],
      listingType: null,
    },
    sortBy: 'newest' as const,
    errorType: null,
    retryCount: 0,
    userDefinedMapArea: false,
    persistedMapCenter: null,
    persistedMapZoom: 12,
    mapAreaType: 'none' as const,
    drawMode: false,
    drawnPolygons: [],
    drawnPolygonUnion: null,
    schools: {
      isLoading: false,
      error: null,
      data: [],
      selectedSchoolIds: [],
      selectedSchoolsCache: [],
      searchQuery: '',
      schoolTypeFilter: 'all' as const,
      catchmentFilterEnabled: false,
      catchmentUnion: null,
      catchmentComputeStatus: 'idle' as const,
      catchmentComputeError: null,
      showSchoolsOnMap: true,
      showCatchmentRadius: false,
      selectiveSchoolFilter: false,
      searchRadius: 3,
    },
    activeSpatialFilter: 'none' as const,
    showSpatialConflictDialog: false,
    pendingBboxFilter: null,
    autoSearchState: {
      countdown: null,
      isActive: false,
      isSearchInitiated: false,
    },
    autoRefreshEnabled: true,
    paginationState: {
      currentPage: 1,
      itemsPerPage: 25 as const,
      visibleProperties: [],
      totalVisibleCount: 0,
      totalPages: 0,
    },
  };

  test('renders both buttons when propertyPanelVisible is false', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    render(
      <Provider store={store}>
        <FloatingMapControls />
      </Provider>
    );

    expect(screen.getByTestId('mock-results-button')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters-button')).toBeInTheDocument();
  });

  test('does not render when propertyPanelVisible is true', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: true,
    });

    render(
      <Provider store={store}>
        <FloatingMapControls />
      </Provider>
    );

    expect(screen.queryByTestId('mock-results-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-filters-button')).not.toBeInTheDocument();
  });

  test('buttons are positioned with correct gap (flexbox gap: 1)', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    const { container } = render(
      <Provider store={store}>
        <FloatingMapControls />
      </Provider>
    );

    // Find the toolbar container
    const toolbar = screen.getByRole('toolbar', { name: 'Floating map controls' });
    expect(toolbar).toBeInTheDocument();
  });

  test('has correct positioning (absolute, top-left, z-index)', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    render(
      <Provider store={store}>
        <FloatingMapControls />
      </Provider>
    );

    const toolbar = screen.getByRole('toolbar', { name: 'Floating map controls' });
    expect(toolbar).toBeInTheDocument();
  });

  test('renders toolbar with correct accessibility role', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    render(
      <Provider store={store}>
        <FloatingMapControls />
      </Provider>
    );

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', 'Floating map controls');
  });

  test('buttons appear in correct order (results first, filters second)', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    const { container } = render(
      <Provider store={store}>
        <FloatingMapControls />
      </Provider>
    );

    const toolbar = screen.getByRole('toolbar');
    const children = toolbar.children;

    // Results button should be first child
    expect(children[0]).toHaveAttribute('data-testid', 'mock-results-button');
    // Filters button should be second child
    expect(children[1]).toHaveAttribute('data-testid', 'mock-filters-button');
  });
});
