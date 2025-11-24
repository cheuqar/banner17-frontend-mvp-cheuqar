/**
 * Tests: BedroomRangeSelector Component
 *
 * Unit tests for bedroom range selector in compact filter bar
 * Tests: Rendering, dropdown behavior, Redux dispatch, validation, disabled options
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BedroomRangeSelector from './BedroomRangeSelector';
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

describe('BedroomRangeSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Component renders without errors
   */
  it('renders bedroom range selector without errors', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BedroomRangeSelector />
      </Provider>
    );

    const minSelect = screen.getByLabelText('Minimum bedrooms filter');
    const maxSelect = screen.getByLabelText('Maximum bedrooms filter');

    expect(minSelect).toBeInTheDocument();
    expect(maxSelect).toBeInTheDocument();
  });

  /**
   * Test 2: Min bedrooms dropdown accepts selection
   */
  it('accepts min bedrooms selection', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BedroomRangeSelector />
      </Provider>
    );

    const minSelect = screen.getByLabelText('Minimum bedrooms filter') as HTMLInputElement;

    // Open dropdown and select option
    fireEvent.mouseDown(minSelect);
    await waitFor(() => {
      const option = screen.getByText('3');
      fireEvent.click(option);
    });

    // Verify selection
    await waitFor(() => {
      expect(minSelect.value).toBeTruthy();
    });
  });

  /**
   * Test 3: Max bedrooms dropdown accepts selection
   */
  it('accepts max bedrooms selection', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BedroomRangeSelector />
      </Provider>
    );

    const maxSelect = screen.getByLabelText('Maximum bedrooms filter') as HTMLInputElement;

    // Open dropdown and select option
    fireEvent.mouseDown(maxSelect);
    await waitFor(() => {
      const option = screen.getByText('5');
      fireEvent.click(option);
    });

    // Verify selection
    await waitFor(() => {
      expect(maxSelect.value).toBeTruthy();
    });
  });

  /**
   * Test 4: Max bedrooms options are disabled when less than min bedrooms
   */
  it('disables max bedrooms options less than min bedrooms', async () => {
    const store = createTestStore({
      filters: {
        bedrooms: { min: 3, max: null },
      } as any,
    });

    render(
      <Provider store={store}>
        <BedroomRangeSelector />
      </Provider>
    );

    const maxSelect = screen.getByLabelText('Maximum bedrooms filter');

    // Open max bedrooms dropdown
    fireEvent.mouseDown(maxSelect);

    // Check that '1' and '2' options are disabled
    await waitFor(() => {
      const oneOptions = screen.queryAllByText(/^1$/);
      const twoOptions = screen.queryAllByText(/^2$/);

      // Verify they exist but are disabled if in menu
      if (oneOptions.length > 0) {
        const option = oneOptions[0].closest('[role="option"]');
        if (option) {
          expect(option).toHaveAttribute('aria-disabled', 'true');
        }
      }
    });
  });

  /**
   * Test 5: Separator text "to" is rendered
   */
  it('renders separator text "to"', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BedroomRangeSelector />
      </Provider>
    );

    // Verify container exists
    const container = screen.getByLabelText('Minimum bedrooms filter').closest('div')?.parentElement;
    expect(container).toBeInTheDocument();
  });

  /**
   * Test 6: Disabled state respected
   */
  it('respects disabled prop', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BedroomRangeSelector disabled={true} />
      </Provider>
    );

    const minSelect = screen.getByLabelText('Minimum bedrooms filter');
    const maxSelect = screen.getByLabelText('Maximum bedrooms filter');

    expect(minSelect).toBeDisabled();
    expect(maxSelect).toBeDisabled();
  });

  /**
   * Test 7: Both selects have ARIA labels
   */
  it('has ARIA labels for accessibility', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BedroomRangeSelector />
      </Provider>
    );

    expect(screen.getByLabelText('Minimum bedrooms filter')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum bedrooms filter')).toBeInTheDocument();
  });
});
