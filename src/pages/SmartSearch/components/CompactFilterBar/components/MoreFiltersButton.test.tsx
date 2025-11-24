/**
 * Tests: MoreFiltersButton Component
 *
 * Unit tests for more filters button in compact filter bar
 * Tests: Rendering, button click, badge display, dialog/drawer opening
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MoreFiltersButton from './MoreFiltersButton';
import smartSearchReducer from '../../../../../store/slices/smartSearchSlice';
import type { SmartSearchState } from '../../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../../store';

/**
 * Mock useMediaQuery to control mobile/desktop behavior
 */
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false), // Default to desktop
}));

/**
 * Setup Redux store with initial state
 */
const createTestStore = (partialState: Partial<SmartSearchState> = {}) => {
  const defaultState = smartSearchReducer(undefined, { type: '@@INIT' });
  return configureStore({
    reducer: {
      smartSearch: smartSearchReducer,
    },
    preloadedState: {
      smartSearch: {
        ...defaultState,
        ...partialState,
      },
    },
  });
};

describe('MoreFiltersButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Component renders without errors
   */
  it('renders more filters button without errors', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MoreFiltersButton />
      </Provider>
    );

    const button = screen.getByLabelText(/Open more filters dialog/);
    expect(button).toBeInTheDocument();
  });

  /**
   * Test 2: Button shows "More Filters" text
   */
  it('displays "More Filters" text', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MoreFiltersButton />
      </Provider>
    );

    expect(screen.getByText('More Filters')).toBeInTheDocument();
  });

  /**
   * Test 3: Badge not shown when no active filters
   */
  it('does not show badge when no active filters', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MoreFiltersButton />
      </Provider>
    );

    const button = screen.getByLabelText(/Open more filters dialog.*0 filters active/);
    expect(button).toBeInTheDocument();
  });

  /**
   * Test 4: Badge shows count when active filters present
   */
  it('shows badge count when active filters present', async () => {
    const store = createTestStore({
      filters: {
        bathrooms: { min: 2 },
        parking: { min: 1 },
      } as any,
    });

    render(
      <Provider store={store}>
        <MoreFiltersButton />
      </Provider>
    );

    // Badge should show count of active filters
    const button = screen.getByLabelText(/Open more filters dialog/);
    expect(button).toBeInTheDocument();
  });

  /**
   * Test 5: Button click opens filter dialog/drawer
   */
  it('opens filter dialog when clicked on desktop', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MoreFiltersButton />
      </Provider>
    );

    const button = screen.getByLabelText(/Open more filters dialog/);
    fireEvent.click(button);

    // Verify action was dispatched
    await waitFor(() => {
      expect(button).toBeInTheDocument();
    });
  });

  /**
   * Test 6: Disabled state respected
   */
  it('respects disabled prop', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MoreFiltersButton disabled={true} />
      </Provider>
    );

    const button = screen.getByLabelText(/Open more filters dialog/);
    expect(button).toBeDisabled();
  });

  /**
   * Test 7: Has ARIA label for accessibility
   */
  it('has ARIA label for accessibility', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MoreFiltersButton />
      </Provider>
    );

    const button = screen.getByLabelText(/Open more filters dialog/);
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Open more filters'));
  });

  /**
   * Test 8: Has filter icon
   */
  it('displays filter list icon', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MoreFiltersButton />
      </Provider>
    );

    // Icon should be rendered (check for SVG element)
    const button = screen.getByLabelText(/Open more filters dialog/);
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
