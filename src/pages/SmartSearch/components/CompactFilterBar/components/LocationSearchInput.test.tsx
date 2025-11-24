/**
 * Tests: LocationSearchInput Component
 *
 * Unit tests for location search input in compact filter bar
 * Tests: Rendering, user input, Redux dispatch, clear button, autocomplete
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LocationSearchInput from './LocationSearchInput';
import smartSearchReducer from '../../../../../store/slices/smartSearchSlice';
import type { SmartSearchState } from '../../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../../store';

/**
 * Mock useAddressAutocomplete hook
 */
jest.mock('../../../../../hooks/useAddressAutocomplete', () => ({
  useAddressAutocomplete: jest.fn((options) => ({
    suggestions: [
      {
        id: 'sydney-nsw-2000',
        label: 'Sydney, NSW 2000',
        address: 'Sydney',
        state: 'NSW',
        postcode: '2000',
      },
      {
        id: 'mosman-nsw-2088',
        label: 'Mosman, NSW 2088',
        address: 'Mosman',
        state: 'NSW',
        postcode: '2088',
      },
    ],
    loading: false,
    error: null,
    searchQuery: '',
    setSearchQuery: jest.fn(),
    handleSuggestionSelect: jest.fn(),
  })),
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

describe('LocationSearchInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Component renders without errors
   */
  it('renders location search input without errors', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <LocationSearchInput />
      </Provider>
    );

    const input = screen.getByRole('combobox', { hidden: true });
    expect(input).toBeInTheDocument();
  });

  /**
   * Test 2: Accepts user input and triggers autocomplete
   */
  it('accepts user input and shows suggestions', async () => {
    const store = createTestStore();
    const { useAddressAutocomplete } = require('../../../../../hooks/useAddressAutocomplete');

    render(
      <Provider store={store}>
        <LocationSearchInput />
      </Provider>
    );

    const input = screen.getByRole('combobox', { hidden: true }) as HTMLInputElement;

    // Simulate user typing
    await userEvent.type(input, 'Sydney');

    // Verify setSearchQuery was called
    await waitFor(() => {
      expect(useAddressAutocomplete().setSearchQuery).toHaveBeenCalled();
    });
  });

  /**
   * Test 3: Clear button clears location and input
   */
  it('clears location and input when clear button clicked', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <LocationSearchInput />
      </Provider>
    );

    const input = screen.getByRole('combobox', { hidden: true }) as HTMLInputElement;

    // Type in the input
    await userEvent.type(input, 'Sydney, NSW');
    await waitFor(() => {
      expect(input.value).toContain('Sydney');
    });

    // Find and click clear button
    const clearButton = screen.getByLabelText('clear location search');
    fireEvent.click(clearButton);

    // Verify input is cleared
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  /**
   * Test 4: Placeholder renders correctly
   */
  it('renders with correct placeholder text', () => {
    const store = createTestStore();
    const customPlaceholder = 'Search address, suburb, or postcode';

    render(
      <Provider store={store}>
        <LocationSearchInput placeholder={customPlaceholder} />
      </Provider>
    );

    const input = screen.getByRole('combobox', { hidden: true }) as HTMLInputElement;
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });

  /**
   * Test 5: Disabled state respected
   */
  it('respects disabled prop', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <LocationSearchInput disabled={true} />
      </Provider>
    );

    const input = screen.getByRole('combobox', { hidden: true }) as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  /**
   * Test 6: Has ARIA labels for accessibility
   */
  it('has ARIA labels for accessibility', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <LocationSearchInput />
      </Provider>
    );

    const clearButton = screen.getByLabelText('clear location search');
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveAttribute('aria-label', 'clear location search');
  });
});
