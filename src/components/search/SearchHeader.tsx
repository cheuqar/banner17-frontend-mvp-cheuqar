/**
 * Component: SearchHeader
 * 
 * Main Smart Search Header container - combines Row 1 and Row 2
 * Two-row layout with visual separation (border-bottom divider)
 * 
 * Features:
 * - Row 1: Brand + Transaction/Amenity filters (height: 56px)
 * - Row 2: Address search + State filters (height: 60px)
 * - Border-bottom: 1px solid #e0e0e0 (divider)
 * - Background: white (#ffffff)
 * - Responsive padding at all breakpoints
 */

import React from 'react';
import { Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectTransactionType,
  selectStateFilter,
  setTransactionType,
  setStateFilter,
  autoCleanStateFilter,
} from '../../store/slices/searchFilters';
import {
  togglePanel,
  centerMapAtLocation,
  performSearch,
} from '../../store/slices/smartSearchSlice';
import type { TransactionType, StateCode } from '../../types/searchFilters';
import { SearchHeaderRow1 } from './SearchHeaderRow1';
import { SearchHeaderRow2 } from './SearchHeaderRow2';
import { ComingSoonModal } from './ComingSoonModal';

interface SearchHeaderProps {
  className?: string;
}

/**
 * SearchHeader Component
 * 
 * Main container for the redesigned smart search header
 * Connects to Redux state and provides callbacks for user interactions
 */
// State center coordinates for map centering (Issue #3 fix)
const STATE_COORDINATES: Record<StateCode, { lat: number; lon: number; name: string }> = {
  NSW: { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
  VIC: { lat: -37.8136, lon: 144.9631, name: 'Melbourne' },
  QLD: { lat: -27.4698, lon: 153.0251, name: 'Brisbane' },
  SA: { lat: -34.9285, lon: 138.6007, name: 'Adelaide' },
  WA: { lat: -31.9505, lon: 115.8605, name: 'Perth' },
  TAS: { lat: -42.8821, lon: 147.3272, name: 'Hobart' },
  ACT: { lat: -35.2809, lon: 149.1300, name: 'Canberra' },
  NT: { lat: -12.4634, lon: 130.8456, name: 'Darwin' },
};

export const SearchHeader: React.FC<SearchHeaderProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  
  // Read state from Redux
  const transactionType = useAppSelector(selectTransactionType);
  const stateFilter = useAppSelector(selectStateFilter);
  
  // Issue #1 fix: Read school panel state from existing smartSearch slice
  const activePanel = useAppSelector((state) => state.smartSearch.mapControls.activePanel);
  const schoolPanelOpen = activePanel === 'schools';

  // Coming Soon modal state
  const [comingSoonOpen, setComingSoonOpen] = React.useState(false);
  const [comingSoonMessage, setComingSoonMessage] = React.useState('');

  /**
   * Handle transaction type change (Buy/Sell/Sold)
   */
  const handleTransactionTypeChange = (type: TransactionType) => {
    dispatch(setTransactionType(type));
  };

  /**
   * Handle state filter change (NSW/VIC/etc)
   * Issue #3 fix: Center map to state capital and trigger property search
   */
  const handleStateFilterChange = (state: StateCode | null) => {
    dispatch(setStateFilter(state));
    
    if (state) {
      const coordinates = STATE_COORDINATES[state];
      
      // Center map at state capital
      dispatch(centerMapAtLocation({
        lat: coordinates.lat,
        lon: coordinates.lon,
        zoom: 12,
        address: coordinates.name
      }));
      
      // Trigger property search after map centers (slight delay for smooth UX)
      setTimeout(() => {
        dispatch(performSearch());
      }, 500);
      
      console.log(`[SearchHeader] Centered map on ${coordinates.name} and triggered search`);
    }
  };

  /**
   * Handle school panel toggle
   * Issue #1 fix: Use existing togglePanel action from smartSearchSlice
   */
  const handleSchoolPanelToggle = () => {
    dispatch(togglePanel('schools'));
    console.log('[SearchHeader] Toggled school panel:', !schoolPanelOpen);
  };

  /**
   * Handle Coming Soon clicks for Daycare
   */
  const handleDaycareClick = () => {
    setComingSoonMessage('Daycare search is coming soon! This feature is currently in development.');
    setComingSoonOpen(true);
  };

  /**
   * Handle Coming Soon clicks for Amenities
   */
  const handleAmenitiesClick = () => {
    setComingSoonMessage('Amenities search is coming soon! This feature is currently in development.');
    setComingSoonOpen(true);
  };

  /**
   * Handle address search selection
   * Q1 logic: Auto-clear state filter if address state doesn't match current filter
   */
  const handleAddressSearch = (address: string, state?: StateCode) => {
    console.log('[SearchHeader] Address selected:', address, 'State:', state);
    
    // Trigger search or navigation logic here
    // TODO: Integrate with search functionality
  };

  /**
   * Handle state detection from address selection
   * Q1 logic: Auto-clear state filter if detected state doesn't match current filter
   */
  const handleStateDetected = (detectedState: StateCode) => {
    console.log('[SearchHeader] State detected from address:', detectedState);
    dispatch(autoCleanStateFilter(detectedState));
  };

  return (
    <>
      <Box
        className={className}
        component="header"
        sx={{
          width: '100%',
          backgroundColor: '#ffffff',  // White background
          borderBottom: '1px solid #e0e0e0',  // Divider line
          
          // Ensure header stays at top
          position: 'sticky',
          top: 0,
          zIndex: 1100,  // Above content but below modals
        }}
      >
        {/* Row 1: Brand + Transaction/Amenity Filters */}
        <SearchHeaderRow1
          transactionType={transactionType}
          onTransactionTypeChange={handleTransactionTypeChange}
          schoolPanelOpen={schoolPanelOpen}
          onSchoolPanelToggle={handleSchoolPanelToggle}
          onDaycareClick={handleDaycareClick}
          onAmenitiesClick={handleAmenitiesClick}
        />

        {/* Row 2: Address Search + State Filters */}
        <SearchHeaderRow2
          stateFilter={stateFilter}
          onStateFilterChange={handleStateFilterChange}
          onAddressSearch={handleAddressSearch}
          onStateDetected={handleStateDetected}
        />
      </Box>

      {/* Coming Soon Modal for Daycare/Amenities */}
      <ComingSoonModal
        open={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        message={comingSoonMessage}
      />
    </>
  );
};

export default SearchHeader;

