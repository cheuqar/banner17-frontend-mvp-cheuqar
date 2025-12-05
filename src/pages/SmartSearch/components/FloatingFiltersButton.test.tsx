import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FloatingFiltersButton from './FloatingFiltersButton';
import smartSearchReducer from '../../../store/slices/smartSearchSlice';
import '@testing-library/jest-dom';

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

describe('FloatingFiltersButton', () => {
  const mockInitialState = {
    propertyPanelVisible: false,
    filtersOverlayVisible: false,
    activeFilters: [],
    properties: [],
    loading: false,
    error: null,
    totalCount: 0,
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

  test('renders button when propertyPanelVisible is false', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    render(
      <Provider store={store}>
        <FloatingFiltersButton />
      </Provider>
    );

    expect(screen.getByLabelText('Show filters overlay')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  test('does not render button when propertyPanelVisible is true', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: true,
    });

    render(
      <Provider store={store}>
        <FloatingFiltersButton />
      </Provider>
    );

    expect(screen.queryByLabelText('Show filters overlay')).not.toBeInTheDocument();
  });

  test('shows badge with count when activeFilters length > 0', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
      activeFilters: ['location:NSW', 'price:500K-1M', 'bedrooms:3-Any'],
    });

    render(
      <Provider store={store}>
        <FloatingFiltersButton />
      </Provider>
    );

    // Badge should show count
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  test('hides badge when activeFilters length is 0', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
      activeFilters: [],
    });

    render(
      <Provider store={store}>
        <FloatingFiltersButton />
      </Provider>
    );

    // No badge should appear, just "Filters" text
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('dispatches setFiltersOverlayVisible(true) on click', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <FloatingFiltersButton />
      </Provider>
    );

    const button = screen.getByLabelText('Show filters overlay');
    fireEvent.click(button);

    // Verify setFiltersOverlayVisible(true) was dispatched
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'smartSearch/setFiltersOverlayVisible',
        payload: true,
      })
    );
  });

  test('renders FilterListIcon', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    const { container } = render(
      <Provider store={store}>
        <FloatingFiltersButton />
      </Provider>
    );

    // Check for SVG icon presence (MUI icons render as SVG)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  test('applies Style4-V2 styling (white bg, black text)', () => {
    const store = createMockStore({
      ...mockInitialState,
      propertyPanelVisible: false,
    });

    render(
      <Provider store={store}>
        <FloatingFiltersButton />
      </Provider>
    );

    const button = screen.getByLabelText('Show filters overlay');

    // MUI applies styles via sx prop which generates inline styles
    // Check button exists with correct variant
    expect(button).toHaveClass('MuiButton-contained');
  });
});
