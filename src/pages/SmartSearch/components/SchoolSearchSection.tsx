import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  Typography,
  CircularProgress,
  InputAdornment,
  ListItemIcon,
  IconButton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { School } from '../../../store/slices/smartSearchSlice';

const MAX_SCHOOLS = 3;

interface SchoolSearchSectionProps {
  schools: School[];
  selectedSchoolIds: string[];
  searchQuery: string;
  schoolTypeFilter: 'all' | 'primary' | 'secondary' | 'infants';
  isLoading: boolean;
  error: string | null;
  onSearchChange: (query: string) => void;
  onSchoolTypeChange: (type: 'all' | 'primary' | 'secondary' | 'infants') => void;
  onSelect: (school: School) => void;
  onCenter?: (school: School) => void;
}

export const SchoolSearchSection: React.FC<SchoolSearchSectionProps> = ({
  schools,
  selectedSchoolIds,
  searchQuery,
  schoolTypeFilter,
  isLoading,
  error,
  onSearchChange,
  onSchoolTypeChange,
  onSelect,
  onCenter
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showMaxWarning, setShowMaxWarning] = useState(false);

  // FIX Issue 1: Sync local search query with Redux prop
  // This ensures the search input reflects the current search query from Redux
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const isSelected = (school: School) => {
    return selectedSchoolIds.includes(school.id);
  };

  const isMaxSelected = selectedSchoolIds.length >= MAX_SCHOOLS;

  const handleSearch = () => {
    // Only trigger search on explicit action (Enter or Search button click)
    onSearchChange(localSearchQuery);
  };

  const handleInputChange = (value: string) => {
    // Only update local state, don't trigger search
    setLocalSearchQuery(value);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange('');
  };

  const handleSelect = (school: School) => {
    if (isMaxSelected) {
      // Show warning when trying to select more than max
      setShowMaxWarning(true);
      setTimeout(() => setShowMaxWarning(false), 3000);
      return;
    }
    onSelect(school);
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Search Input with Autocomplete */}
      <Box sx={{ p: 2, position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1, borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <Autocomplete
          freeSolo
          options={schools.map((s) => s.name)}
          inputValue={localSearchQuery}
          onInputChange={(event, value) => {
            // Update local state as user types (for typing)
            setLocalSearchQuery(value);
          }}
          onChange={(event, value) => {
            // Called when user selects from dropdown or clears
            if (value) {
              // When user selects a school from dropdown
              setLocalSearchQuery(value);
              // Trigger search immediately (bypass debounce)
              onSearchChange(value);
            }
          }}
          onKeyDown={(event) => {
            // Allow Enter key to trigger search even without autocomplete selection
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
          disabled={isLoading}
          noOptionsText="No schools found"
          data-testid="school-search-input"
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              placeholder={isLoading ? "Loading schools..." : "Search schools..."}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {localSearchQuery && (
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          sx={{ p: 0.5 }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={handleSearch}
                        disabled={!localSearchQuery.trim() || isLoading}
                        sx={{
                          p: 0.5,
                          bgcolor: 'black',
                          color: 'white',
                          '&:hover': { bgcolor: 'grey.800' },
                          '&.Mui-disabled': {
                            bgcolor: 'grey.300',
                            color: 'grey.500'
                          }
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={16} sx={{ color: 'white' }} />
                        ) : (
                          <SearchIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  </InputAdornment>
                )
              }}
            />
          )}
        />
      </Box>

      {/* Max Selection Warning */}
      {showMaxWarning && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="warning" sx={{ py: 0.5 }}>
            Maximum {MAX_SCHOOLS} school catchments allowed
          </Alert>
        </Box>
      )}

      {/* Max Selected Info */}
      {isMaxSelected && !showMaxWarning && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="info" sx={{ py: 0.5 }}>
            {selectedSchoolIds.length} schools selected (maximum reached)
          </Alert>
        </Box>
      )}

      {/* School Type Filter */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <FormControl component="fieldset" fullWidth disabled={isLoading}>
          <FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 1 }}>
            School Type
          </FormLabel>
          <RadioGroup
            value={schoolTypeFilter}
            onChange={(e) => onSchoolTypeChange(e.target.value as any)}
          >
            <FormControlLabel
              value="all"
              control={<Radio size="small" disabled={isLoading} />}
              label={<Typography variant="body2">All Schools</Typography>}
            />
            <FormControlLabel
              value="primary"
              control={<Radio size="small" disabled={isLoading} />}
              label={<Typography variant="body2">Primary Schools</Typography>}
            />
            <FormControlLabel
              value="secondary"
              control={<Radio size="small" disabled={isLoading} />}
              label={<Typography variant="body2">Secondary Schools</Typography>}
            />
            <FormControlLabel
              value="infants"
              control={<Radio size="small" disabled={isLoading} />}
              label={<Typography variant="body2">Infants Schools</Typography>}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Typography color="error" variant="body2" sx={{ p: 2 }}>
          {error}
        </Typography>
      )}

      {/* School Results List */}
      {!isLoading && !error && (
        <List
          sx={{
            flexGrow: 1,
            overflow: 'auto'
          }}
        >
          {schools.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              No schools found. Try adjusting your search or filters.
            </Typography>
          ) : (
            schools.map((school, index) => {
              const selected = isSelected(school);
              const canSelect = !selected && !isMaxSelected;

              return (
                <ListItem
                  key={school.id}
                  component="div"
                  disabled={selected || (!selected && isMaxSelected)}
                  data-testid={`school-item-${index}`}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 40px',
                    gap: 0.5,
                    p: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    alignItems: 'center',
                    bgcolor: selected ? '#f0f7ff' : 'transparent',
                    border: selected ? '1px solid #2196F3' : 'none',
                    '&:hover': !selected && canSelect ? { bgcolor: '#f5f5f5' } : {},
                    '&.Mui-disabled': {
                      opacity: !canSelect && !selected ? 0.5 : 1,
                    }
                  }}
                >
                  {/* Checkbox - Clickable only when can select or deselect */}
                  <Box
                    onClick={() => {
                      if (selected) {
                        handleSelect(school); // Deselect
                      } else if (canSelect) {
                        handleSelect(school); // Select
                      }
                    }}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 40,
                      height: 40,
                      cursor: (selected || canSelect) ? 'pointer' : 'default',
                      borderRadius: '4px',
                      '&:hover': (selected || canSelect) ? { bgcolor: '#e3f2fd' } : {}
                    }}
                  >
                    {selected ? (
                      <CheckBoxIcon sx={{ fontSize: '1.2rem' }} color="success" />
                    ) : (
                      <CheckBoxOutlineBlankIcon sx={{ fontSize: '1.2rem' }} />
                    )}
                  </Box>

                  {/* School Info - Flexible */}
                  <Box sx={{ minWidth: 0, overflow: 'hidden', px: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {school.name}
                    </Typography>
                    {!selected && school.school_type && (
                      <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                        {school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1)}
                      </Typography>
                    )}
                    {!selected && school.has_catchment_boundary && (
                      <Typography variant="caption" sx={{ color: '#2196F3' }}>
                        Has catchment boundary
                      </Typography>
                    )}
                  </Box>

                  {/* Action Button - 40px (Location or Remove) */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 40, height: 40 }}>
                    {selected ? (
                      // Remove/Deselect button
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(school); // Deselect
                        }}
                        title="Remove school"
                        sx={{
                          p: 0,
                          color: '#d32f2f',
                          '&:hover': { backgroundColor: '#ffebee' },
                          width: 40,
                          height: 40
                        }}
                      >
                        <CloseIcon sx={{ fontSize: '1.2rem' }} />
                      </IconButton>
                    ) : (
                      // Location/Pan button
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCenter?.(school);
                        }}
                        title="Center map on this school"
                        sx={{
                          p: 0,
                          color: '#2196F3',
                          '&:hover': { backgroundColor: '#e3f2fd' },
                          width: 40,
                          height: 40
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: '1.2rem' }} />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              );
            })
          )}
        </List>
      )}

      {/* Results Count */}
      {!isLoading && !error && schools.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50' }}>
          <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary', display: 'block' }}>
            Showing {schools.length} school{schools.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
