/**
 * Component: SearchHeaderRow2
 * 
 * Second row of Smart Search Header - Address Search + State Filters
 * Left (70%): Address search autocomplete input
 * Right (30%): State filter buttons (NSW, VIC, QLD, etc.)
 * 
 * Layout: Flexbox with gap, height 60px, responsive padding (FR-001, FR-012, FR-015)
 */

import React from 'react';
import { Box } from '@mui/material';
import type { StateCode } from '../../types/searchFilters';
import { AddressSearchInput } from './AddressSearchInput';
import { StateFilterButtons } from './StateFilterButtons';

interface SearchHeaderRow2Props {
  stateFilter: StateCode | null;
  onStateFilterChange: (state: StateCode | null) => void;
  onAddressSearch?: (address: string, state?: StateCode) => void;
  onStateDetected?: (state: StateCode) => void;
}

/**
 * SearchHeaderRow2 Component
 * 
 * Address search + state filter buttons in horizontal layout
 */
export const SearchHeaderRow2: React.FC<SearchHeaderRow2Props> = ({
  stateFilter,
  onStateFilterChange,
  onAddressSearch,
  onStateDetected,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,  // 16px gap between search and state filters
        alignItems: 'center',
        height: '60px',  // Row 2 height per design tokens
        
        // Responsive padding: 12px→16px→24px (xs→sm→md)
        px: { xs: 1.5, sm: 2, md: 3 },  // 12px→16px→24px
        
        // Responsive layout: stack on mobile if needed
        flexDirection: { xs: 'column', sm: 'row' },  // Stack on extra-small mobile
      }}
    >
      {/* Left Section: Address Search Input (~70% width) */}
      <Box
        sx={{
          flex: 1,
          maxWidth: '600px',  // Maximum width for address search
          width: '100%',
        }}
      >
        <AddressSearchInput
          placeholder="Search address, suburb, or postcode"
          onAddressSelect={onAddressSearch}
          onStateDetected={onStateDetected}
        />
      </Box>

      {/* Right Section: State Filter Buttons (~30% width) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flex: { xs: 'none', sm: '0 0 auto' },  // Don't flex on mobile
        }}
      >
        <StateFilterButtons
          active={stateFilter}
          onChange={onStateFilterChange}
        />
      </Box>
    </Box>
  );
};

export default SearchHeaderRow2;

