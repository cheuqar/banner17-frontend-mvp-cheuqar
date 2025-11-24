/**
 * Unit Tests for TopNavigation Component
 *
 * Tests cover:
 * 1. Component renders with all navigation items
 * 2. Buy button dispatches setTransactionType('buy') action
 * 3. School button toggles panel correctly
 * 4. Daycare/Amenities show Coming Soon modal
 * 5. Sign In button renders and is clickable
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TopNavigation from './index';
import searchFiltersReducer from '../../../../store/slices/searchFilters';
import smartSearchReducer from '../../../../store/slices/smartSearchSlice';
import '@testing-library/jest-dom';

/**
 * Helper function to create a mock store with default state
 */
const createMockStore = (initialState?: any) => {
  const defaultSearchFiltersState = {
    transactionType: null,
    stateFilter: null,
    schoolPanelOpen: false,
    selectedSchools: [],
    lastUpdated: 0,
  };

  const defaultSmartSearchState = {
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
    activeFilters: [],
    sortBy: 'newest' as const,
    properties: [],
    loading: false,
    error: null,
    searchPending: false,
    errorType: null,
    retryCount: 0,
    totalCount: 0,
    displayedCount: 0,
    paginationOffset: 0,
    filtersApplied: {},
    mapCenter: null,
    selectedAddress: null,
    mapBounds: null,
    searchBounds: null,
    manualMapMove: false,
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
    propertyPanelVisible: false,
    filtersOverlayVisible: false,
    searchPendingError: null,
  };

  return configureStore({
    reducer: {
      searchFilters: searchFiltersReducer,
      smartSearch: smartSearchReducer,
    },
    preloadedState: {
      searchFilters: initialState?.searchFilters || defaultSearchFiltersState,
      smartSearch: initialState?.smartSearch || defaultSmartSearchState,
    },
  });
};

describe('TopNavigation Component', () => {
  /**
   * Test 1: Component renders with all navigation items
   */
  test('renders all navigation items correctly', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    // Check Brand
    const brandLink = screen.getByRole('link', { name: /Banner17/i });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/');

    // Check Navigation Items
    const buyButton = screen.getByRole('button', { name: /Navigation: Buy/i });
    const sellButton = screen.getByRole('button', { name: /Navigation: Sell/i });
    const soldButton = screen.getByRole('button', { name: /Navigation: Sold/i });
    const schoolButton = screen.getByRole('button', { name: /Navigation: School/i });
    const daycareButton = screen.getByRole('button', { name: /Navigation: Daycare/i });
    const amenitiesButton = screen.getByRole('button', { name: /Navigation: Amenities/i });

    expect(buyButton).toBeInTheDocument();
    expect(sellButton).toBeInTheDocument();
    expect(soldButton).toBeInTheDocument();
    expect(schoolButton).toBeInTheDocument();
    expect(daycareButton).toBeInTheDocument();
    expect(amenitiesButton).toBeInTheDocument();

    // Check Sign In Button
    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    expect(signInButton).toBeInTheDocument();
  });

  /**
   * Test 2: Buy button dispatches setTransactionType('buy')
   */
  test('Buy button dispatches correct Redux action', () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const buyButton = screen.getByRole('button', { name: /Navigation: Buy/i });
    fireEvent.click(buyButton);

    // Verify state was updated
    const state = store.getState();
    expect(state.searchFilters.transactionType).toBe('buy');
  });

  /**
   * Test 3: Sell button dispatches correct action
   */
  test('Sell button dispatches correct Redux action', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const sellButton = screen.getByRole('button', { name: /Navigation: Sell/i });
    fireEvent.click(sellButton);

    const state = store.getState();
    expect(state.searchFilters.transactionType).toBe('sell');
  });

  /**
   * Test 4: Sold button dispatches correct action
   */
  test('Sold button dispatches correct Redux action', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const soldButton = screen.getByRole('button', { name: /Navigation: Sold/i });
    fireEvent.click(soldButton);

    const state = store.getState();
    expect(state.searchFilters.transactionType).toBe('sold');
  });

  /**
   * Test 5: School button toggles panel correctly
   */
  test('School button toggles schools panel', () => {
    const store = createMockStore();

    const { rerender } = render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const schoolButton = screen.getByRole('button', { name: /Navigation: School/i });

    // Initial state: panel should be closed
    expect(schoolButton).toHaveAttribute('aria-pressed', 'false');

    // Click to open
    fireEvent.click(schoolButton);

    // Re-render to pick up new state
    rerender(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    // Verify panel is open
    const state = store.getState();
    expect(state.smartSearch.mapControls.activePanel).toBe('schools');
  });

  /**
   * Test 6: Daycare button opens Coming Soon modal
   */
  test('Daycare button opens Coming Soon modal', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const daycareButton = screen.getByRole('button', { name: /Navigation: Daycare/i });
    fireEvent.click(daycareButton);

    // Check modal appears
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    // Check modal content
    expect(screen.getByText(/Daycare search is coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay tuned for this feature/i)).toBeInTheDocument();

    // Check OK button
    const okButton = screen.getByRole('button', { name: /OK/i });
    expect(okButton).toBeInTheDocument();
  });

  /**
   * Test 7: Amenities button opens Coming Soon modal
   */
  test('Amenities button opens Coming Soon modal', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const amenitiesButton = screen.getByRole('button', { name: /Navigation: Amenities/i });
    fireEvent.click(amenitiesButton);

    // Check modal appears
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    // Check modal content
    expect(screen.getByText(/Amenities search is coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay tuned for this feature/i)).toBeInTheDocument();
  });

  /**
   * Test 8: Coming Soon modal closes when OK is clicked
   */
  test('Coming Soon modal closes when OK is clicked', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const daycareButton = screen.getByRole('button', { name: /Navigation: Daycare/i });
    fireEvent.click(daycareButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click OK button
    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    // Modal should be closed (no dialog in document)
    await waitFor(() => {
      const dialog = screen.queryByRole('dialog');
      // Dialog should either not exist or be hidden
      expect(dialog).not.toBeInTheDocument();
    });
  });

  /**
   * Test 9: Disabled buttons don't dispatch actions
   */
  test('Disabled buttons (Daycare) do not dispatch actions on click', () => {
    const store = createMockStore();
    const initialState = store.getState();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const daycareButton = screen.getByRole('button', { name: /Navigation: Daycare/i });

    // Verify button is disabled
    expect(daycareButton).toBeDisabled();

    // Click disabled button
    fireEvent.click(daycareButton);

    // State should be unchanged (no action dispatched)
    const finalState = store.getState();
    expect(finalState.searchFilters.transactionType).toBe(initialState.searchFilters.transactionType);
  });

  /**
   * Test 10: Sign In button is clickable and responds to click
   */
  test('Sign In button renders and responds to click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    expect(signInButton).toBeInTheDocument();

    fireEvent.click(signInButton);

    // Verify console.log was called
    expect(consoleSpy).toHaveBeenCalledWith('Sign in clicked');

    consoleSpy.mockRestore();
  });

  /**
   * Test 11: Buy button shows active state
   */
  test('Buy button shows active state when selected', () => {
    const store = createMockStore({
      searchFilters: {
        transactionType: 'buy',
        stateFilter: null,
        schoolPanelOpen: false,
        selectedSchools: [],
        lastUpdated: 0,
      },
      smartSearch: require('./TopNavigation.test.tsx').getDefaultSmartSearchState?.(),
    });

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const buyButton = screen.getByRole('button', { name: /Navigation: Buy/i });
    expect(buyButton).toHaveAttribute('aria-pressed', 'true');
  });

  /**
   * Test 12: Brand link has correct styling and behavior
   */
  test('Brand link has correct attributes and styling', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const brandLink = screen.getByRole('link', { name: /Banner17/i });
    expect(brandLink).toHaveAttribute('href', '/');
    expect(brandLink).toHaveStyle({ textDecoration: 'none' });
  });

  /**
   * Test 13: Multiple button clicks in sequence work correctly
   */
  test('Multiple button clicks update state correctly', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    const buyButton = screen.getByRole('button', { name: /Navigation: Buy/i });
    const sellButton = screen.getByRole('button', { name: /Navigation: Sell/i });

    // Click Buy
    fireEvent.click(buyButton);
    expect(store.getState().searchFilters.transactionType).toBe('buy');

    // Click Sell
    fireEvent.click(sellButton);
    expect(store.getState().searchFilters.transactionType).toBe('sell');

    // Click Buy again
    fireEvent.click(buyButton);
    expect(store.getState().searchFilters.transactionType).toBe('buy');
  });

  /**
   * Test 14: Navigation items count is correct
   */
  test('renders exactly 6 navigation items', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TopNavigation />
      </Provider>
    );

    // Get all buttons that are navigation items (excluding Sign In)
    const navButtons = screen.getAllByRole('button').filter((btn) =>
      btn.getAttribute('aria-label')?.includes('Navigation:')
    );

    expect(navButtons).toHaveLength(6);
  });
});
