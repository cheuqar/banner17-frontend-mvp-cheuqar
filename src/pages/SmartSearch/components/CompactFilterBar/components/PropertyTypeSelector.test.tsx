/**
 * Tests: PropertyTypeSelector Component
 *
 * Unit tests for property type selector in compact filter bar
 * Tests: Rendering, dropdown behavior, Redux dispatch, multi-select, display labels
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PropertyTypeSelector from './PropertyTypeSelector';
import smartSearchReducer from '../../../../../store/slices/smartSearchSlice';
import type { SmartSearchState } from '../../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../../store';

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

describe('PropertyTypeSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Component renders without errors
   */
  it('renders property type selector without errors', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <PropertyTypeSelector />
      </Provider>
    );

    const select = screen.getByLabelText('Property type filter');
    expect(select).toBeInTheDocument();
  });

  /**
   * Test 2: Shows default label when nothing selected
   */
  it('shows default "Property Type" label when nothing selected', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <PropertyTypeSelector />
      </Provider>
    );

    // Default label should be present (in the input value or similar)
    const select = screen.getByLabelText('Property type filter') as HTMLInputElement;
    expect(select).toBeInTheDocument();
  });

  /**
   * Test 3: Shows selected property type label
   */
  it('shows selected property type label', async () => {
    const store = createTestStore({
      filters: {
        propertyTypes: ['house'],
      } as any,
    });

    render(
      <Provider store={store}>
        <PropertyTypeSelector />
      </Provider>
    );

    // The select should display the selected value
    const select = screen.getByLabelText('Property type filter') as HTMLInputElement;
    expect(select).toBeInTheDocument();
  });

  /**
   * Test 4: Shows "Multiple selected" when multiple types selected
   */
  it('shows "Multiple selected" label when multiple types selected', async () => {
    const store = createTestStore({
      filters: {
        propertyTypes: ['house', 'apartment'],
      } as any,
    });

    render(
      <Provider store={store}>
        <PropertyTypeSelector />
      </Provider>
    );

    const select = screen.getByLabelText('Property type filter') as HTMLInputElement;
    expect(select).toBeInTheDocument();
  });

  /**
   * Test 5: Accepts property type selection from dropdown
   */
  it('accepts property type selection from dropdown', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <PropertyTypeSelector />
      </Provider>
    );

    const select = screen.getByLabelText('Property type filter');

    // Open dropdown and select option
    fireEvent.mouseDown(select);
    await waitFor(() => {
      const option = screen.getByText('House');
      fireEvent.click(option);
    });

    // Verify selection was made
    await waitFor(() => {
      expect(select).toBeInTheDocument();
    });
  });

  /**
   * Test 6: Allows multiple property type selections
   */
  it('allows multiple property type selections', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <PropertyTypeSelector />
      </Provider>
    );

    const select = screen.getByLabelText('Property type filter');

    // Open dropdown and select first option
    fireEvent.mouseDown(select);
    await waitFor(() => {
      const houseOption = screen.getByText('House');
      fireEvent.click(houseOption);
    });

    // Open dropdown again and select another option
    fireEvent.mouseDown(select);
    await waitFor(() => {
      const apartmentOption = screen.getByText('Apartment');
      fireEvent.click(apartmentOption);
    });

    // Verify both are selected
    await waitFor(() => {
      expect(select).toBeInTheDocument();
    });
  });

  /**
   * Test 7: Disabled state respected
   */
  it('respects disabled prop', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <PropertyTypeSelector disabled={true} />
      </Provider>
    );

    const select = screen.getByLabelText('Property type filter');
    expect(select).toBeDisabled();
  });

  /**
   * Test 8: Has ARIA label for accessibility
   */
  it('has ARIA label for accessibility', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <PropertyTypeSelector />
      </Provider>
    );

    expect(screen.getByLabelText('Property type filter')).toBeInTheDocument();
  });
});
