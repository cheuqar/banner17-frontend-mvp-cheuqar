/**
 * School Filters Component
 * Phase 2.12.5 - School Name Filter (Explicit Search)
 * =====================================================
 *
 * Renders school filter interface with:
 * - School name filter with explicit search action (button or Enter)
 * - Selective school toggle (primary filter)
 * - Collapsible secondary filters (education level, school type, gender, etc.)
 *
 * Features:
 * - NO auto-trigger on typing (user must click Search or press Enter)
 * - Filter application only on explicit user action
 * - Style4-V2 theming (black/white/gray palette)
 * - Responsive design
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Collapse,
  IconButton,
  Typography,
  FormGroup,
  Checkbox,
  Paper,
  Button,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectThemeColors } from '../../store/slices/themeSlice';
import {
  setSchoolName,
  setSelectiveSchool,
  setEducationLevels,
  setSchoolTypes,
  setGenders,
  setDenominations,
  setOpportunityClass,
  setBoardingSchool,
  setSpecialNeeds,
  clearFilter,
  resetFilters,
  setSearchResults,
  setLoading,
  setError,
} from '../../store/slices/smartSearch/schoolPanelSlice';
import { setSelectiveSchoolFilter } from '../../store/slices/smartSearchSlice';
import type { School } from '../../types/smartSearch';
import {
  EDUCATION_LEVELS,
  SCHOOL_TYPES,
  GENDER_OPTIONS,
  SELECTIVE_OPTIONS,
  BOARDING_OPTIONS,
} from '../../types/smartSearch';

interface SchoolFiltersProps {
  onAutocompleteSelect?: (school: School) => void;
}

/**
 * Phase 2.12.5: Removed useDebounce - no longer needed
 * School name filter now only applies on explicit user action (button click or Enter key)
 */

/**
 * SchoolFilters Component
 */
export const SchoolFilters: React.FC<SchoolFiltersProps> = ({ onAutocompleteSelect }) => {
  const dispatch = useAppDispatch();
  const themeColors = useAppSelector(selectThemeColors);
  const filters = useAppSelector(state => state.schoolPanel.filters);
  const searchResults = useAppSelector(state => state.schoolPanel.searchResults);
  const loading = useAppSelector(state => state.schoolPanel.loading);
  const error = useAppSelector(state => state.schoolPanel.error);

  // Local state for school name input
  const [secondaryFiltersOpen, setSecondaryFiltersOpen] = useState(false);
  const [schoolNameInput, setSchoolNameInput] = useState(filters.schoolName);

  /**
   * Phase 2.12.5: Apply school name as a filter to the main school list
   * When user clicks Search button or presses Enter, apply the filter
   * NO autocomplete dropdown - simple explicit search action
   */
  const handleApplySchoolNameFilter = useCallback(() => {
    if (!schoolNameInput.trim()) {
      dispatch(setError('Please enter a school name'));
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Apply the school name filter to Redux state
      dispatch(setSchoolName(schoolNameInput.trim()));
      console.log('[SchoolFilters] Applied school name filter:', schoolNameInput.trim());
    } catch (err) {
      console.error('Failed to apply school name filter:', err);
      dispatch(setError('Failed to apply school name filter'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [schoolNameInput, dispatch]);

  /**
   * Handle school name input change
   * Phase 2.12.5: Only update local state, NOT Redux (don't auto-apply filter)
   */
  const handleSchoolNameChange = useCallback((value: string) => {
    setSchoolNameInput(value);
    // NO dispatch to Redux - only apply filter when user clicks Search button or presses Enter
  }, []);

  /**
   * Phase 2.12.5: Removed handleAutocompleteSelect
   * No longer using Autocomplete component, so no need for selection handler
   */

  /**
   * Handle selective school toggle
   * Phase 2.12.4: Also update smartSearchSlice for search criteria
   */
  const handleSelectiveSchoolChange = useCallback((value: string | undefined) => {
    // Update schoolPanel filter state
    dispatch(setSelectiveSchool(value));
    // Phase 2.12.4: Update smartSearch filter state for spatial search
    dispatch(setSelectiveSchoolFilter(value !== undefined));
    console.log('[SchoolFilters] Selective school changed:', value);
  }, [dispatch]);

  /**
   * Handle education levels multi-select
   */
  const handleEducationLevelChange = useCallback((level: string) => {
    const newLevels = filters.educationLevels.includes(level)
      ? filters.educationLevels.filter(l => l !== level)
      : [...filters.educationLevels, level];
    dispatch(setEducationLevels(newLevels));
  }, [filters.educationLevels, dispatch]);

  /**
   * Handle school types multi-select
   */
  const handleSchoolTypeChange = useCallback((type: string) => {
    const newTypes = filters.schoolTypes.includes(type)
      ? filters.schoolTypes.filter(t => t !== type)
      : [...filters.schoolTypes, type];
    dispatch(setSchoolTypes(newTypes));
  }, [filters.schoolTypes, dispatch]);

  /**
   * Handle genders multi-select
   */
  const handleGenderChange = useCallback((gender: string) => {
    const newGenders = filters.genders.includes(gender)
      ? filters.genders.filter(g => g !== gender)
      : [...filters.genders, gender];
    dispatch(setGenders(newGenders));
  }, [filters.genders, dispatch]);

  /**
   * Handle denominations multi-select
   */
  const handleDenominationChange = useCallback((denomination: string) => {
    const newDenominations = filters.denominations.includes(denomination)
      ? filters.denominations.filter(d => d !== denomination)
      : [...filters.denominations, denomination];
    dispatch(setDenominations(newDenominations));
  }, [filters.denominations, dispatch]);

  /**
   * Handle opportunity class toggle
   */
  const handleOpportunityClassChange = useCallback((checked: boolean) => {
    dispatch(setOpportunityClass(checked || undefined));
  }, [dispatch]);

  /**
   * Handle boarding school toggle
   */
  const handleBoardingSchoolChange = useCallback((value: string | undefined) => {
    dispatch(setBoardingSchool(value));
  }, [dispatch]);

  /**
   * Handle special needs toggle
   */
  const handleSpecialNeedsChange = useCallback((checked: boolean) => {
    dispatch(setSpecialNeeds(checked || undefined));
  }, [dispatch]);

  // Count active secondary filters
  const activeSecondaryFilters = useMemo(() => {
    let count = 0;
    if (filters.educationLevels.length > 0) count++;
    if (filters.schoolTypes.length > 0) count++;
    if (filters.genders.length > 0) count++;
    if (filters.denominations.length > 0) count++;
    if (filters.opportunityClass) count++;
    if (filters.boardingSchool) count++;
    if (filters.specialNeeds) count++;
    return count;
  }, [filters]);

  // Denomination options - common Australian school denominations
  const denominationOptions = useMemo(() => [
    'Catholic',
    'Anglican',
    'Jewish',
    'Islamic',
    'Christian',
    'Buddhist',
    'Presbyterian',
    'Methodist',
    'Uniting',
  ], []);

  return (
    <Box sx={{ p: 1.5, bgcolor: themeColors.primaryLight, borderBottom: '1px solid #e0e0e0' }}>
      {/* Header with Clear All Button - Inline */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        {(filters.schoolName || filters.selectiveSchool || filters.educationLevels.length > 0 ||
          filters.schoolTypes.length > 0 || filters.genders.length > 0 || filters.denominations.length > 0 ||
          filters.opportunityClass || filters.boardingSchool || filters.specialNeeds) && (
          <Button
            size="small"
            startIcon={<ClearIcon sx={{ fontSize: '0.85rem' }} />}
            onClick={() => dispatch(resetFilters())}
            sx={{
              color: '#666',
              fontSize: '0.7rem',
              textTransform: 'none',
              padding: '2px 4px',
              minWidth: 'auto',
              '&:hover': {
                color: '#000',
                backgroundColor: 'transparent',
              },
            }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Primary Filters */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* School Name Filter - Phase 2.12.5 */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', fontSize: '0.8rem' }}>
              School Name
            </Typography>
            {schoolNameInput && (
              <IconButton
                size="small"
                onClick={() => {
                  setSchoolNameInput('');
                  dispatch(setSchoolName(''));
                  console.log('[SchoolFilters] Cleared school name filter');
                }}
                sx={{
                  padding: 0,
                  color: '#999',
                  '&:hover': { color: '#666' },
                }}
                title="Clear school name"
              >
                <ClearIcon sx={{ fontSize: '0.85rem' }} />
              </IconButton>
            )}
          </Box>

          {/* Simple TextField with Search button - NO autocomplete dropdown */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search schools..."
            value={schoolNameInput}
            onChange={(e) => handleSchoolNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && schoolNameInput.trim()) {
                handleApplySchoolNameFilter();
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleApplySchoolNameFilter()}
                    disabled={!schoolNameInput.trim()}
                    title="Apply school name filter"
                    sx={{ p: 0.3, color: '#2196F3' }}
                  >
                    <SearchIcon sx={{ fontSize: '0.95rem' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mt: 0.25,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
          {schoolNameInput && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.25,
                color: '#999',
                fontSize: '0.7rem',
              }}
            >
              Click search or press Enter
            </Typography>
          )}
        </Box>
      </Box>

      {/* Secondary Filters - Collapsible */}
      <Box sx={{ mt: 1, borderTop: '1px solid #e0e0e0', pt: 1 }}>
        <Box
          onClick={() => setSecondaryFiltersOpen(!secondaryFiltersOpen)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            mb: 0.75,
            py: 0.5,
            '&:hover': { opacity: 0.7 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', fontSize: '0.8rem' }}>
              Advanced Filters
            </Typography>
            {(activeSecondaryFilters > 0 || filters.selectiveSchool) && (
              <Chip
                label={filters.selectiveSchool ? activeSecondaryFilters + 1 : activeSecondaryFilters}
                size="small"
                sx={{
                  height: 18,
                  minWidth: 18,
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '0.65rem',
                  padding: 0,
                }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            sx={{
              transform: secondaryFiltersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              padding: '2px',
            }}
          >
            <ExpandMoreIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>

        <Collapse in={secondaryFiltersOpen}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.75 }}>
            {/* Selective School Toggle - Moved to Advanced Filters */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', fontSize: '0.8rem' }}>
                  Selective School
                </Typography>
                {filters.selectiveSchool && (
                  <IconButton
                    size="small"
                    onClick={() => handleSelectiveSchoolChange(undefined)}
                    sx={{
                      padding: 0,
                      color: '#999',
                      '&:hover': { color: '#666' },
                    }}
                    title="Clear selective school filter"
                  >
                    <ClearIcon sx={{ fontSize: '0.85rem' }} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {SELECTIVE_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    onClick={() => {
                      handleSelectiveSchoolChange(
                        filters.selectiveSchool === option ? undefined : option
                      );
                    }}
                    variant={filters.selectiveSchool === option ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                      backgroundColor:
                        filters.selectiveSchool === option ? '#000' : 'transparent',
                      color: filters.selectiveSchool === option ? '#fff' : '#000',
                      borderColor: filters.selectiveSchool === option ? '#000' : '#ccc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#000',
                        backgroundColor: filters.selectiveSchool === option ? '#000' : '#f5f5f5',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
            {/* Education Levels */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                  Education Level
                </Typography>
                {filters.educationLevels.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => dispatch(clearFilter('educationLevels'))}
                    sx={{
                      padding: 0,
                      color: '#999',
                      '&:hover': { color: '#666' },
                    }}
                    title="Clear education level filters"
                  >
                    <ClearIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {EDUCATION_LEVELS.map((level) => (
                  <Chip
                    key={level}
                    label={level}
                    onClick={() => handleEducationLevelChange(level)}
                    variant={filters.educationLevels.includes(level) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                      backgroundColor:
                        filters.educationLevels.includes(level) ? '#000' : 'transparent',
                      color: filters.educationLevels.includes(level) ? '#fff' : '#000',
                      borderColor: filters.educationLevels.includes(level) ? '#000' : '#ccc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* School Types */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                  School Type
                </Typography>
                {filters.schoolTypes.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => dispatch(clearFilter('schoolTypes'))}
                    sx={{
                      padding: 0,
                      color: '#999',
                      '&:hover': { color: '#666' },
                    }}
                    title="Clear school type filters"
                  >
                    <ClearIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {SCHOOL_TYPES.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => handleSchoolTypeChange(type)}
                    variant={filters.schoolTypes.includes(type) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                      backgroundColor:
                        filters.schoolTypes.includes(type) ? '#000' : 'transparent',
                      color: filters.schoolTypes.includes(type) ? '#fff' : '#000',
                      borderColor: filters.schoolTypes.includes(type) ? '#000' : '#ccc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Genders */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                  Gender
                </Typography>
                {filters.genders.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => dispatch(clearFilter('genders'))}
                    sx={{
                      padding: 0,
                      color: '#999',
                      '&:hover': { color: '#666' },
                    }}
                    title="Clear gender filters"
                  >
                    <ClearIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {GENDER_OPTIONS.map((gender) => (
                  <Chip
                    key={gender}
                    label={gender}
                    onClick={() => handleGenderChange(gender)}
                    variant={filters.genders.includes(gender) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                      backgroundColor:
                        filters.genders.includes(gender) ? '#000' : 'transparent',
                      color: filters.genders.includes(gender) ? '#fff' : '#000',
                      borderColor: filters.genders.includes(gender) ? '#000' : '#ccc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Denominations */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                  Denomination
                </Typography>
                {filters.denominations.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => dispatch(clearFilter('denominations'))}
                    sx={{
                      padding: 0,
                      color: '#999',
                      '&:hover': { color: '#666' },
                    }}
                    title="Clear denomination filters"
                  >
                    <ClearIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {denominationOptions.map((denom) => (
                  <Chip
                    key={denom}
                    label={denom}
                    onClick={() => handleDenominationChange(denom)}
                    variant={filters.denominations.includes(denom) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                      backgroundColor:
                        filters.denominations.includes(denom) ? '#000' : 'transparent',
                      color: filters.denominations.includes(denom) ? '#fff' : '#000',
                      borderColor: filters.denominations.includes(denom) ? '#000' : '#ccc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Special Features */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                  Special Features
                </Typography>
                {(filters.opportunityClass || filters.boardingSchool || filters.specialNeeds) && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      dispatch(clearFilter('opportunityClass'));
                      dispatch(clearFilter('boardingSchool'));
                      dispatch(clearFilter('specialNeeds'));
                    }}
                    sx={{
                      padding: 0,
                      color: '#999',
                      '&:hover': { color: '#666' },
                    }}
                    title="Clear special features filters"
                  >
                    <ClearIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                )}
              </Box>
              <FormGroup sx={{ gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.opportunityClass || false}
                      onChange={(e) => handleOpportunityClassChange(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="caption">Opportunity Class</Typography>}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                    Boarding:
                  </Typography>
                  {BOARDING_OPTIONS.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      onClick={() => {
                        handleBoardingSchoolChange(
                          filters.boardingSchool === option ? undefined : option
                        );
                      }}
                      variant={filters.boardingSchool === option ? 'filled' : 'outlined'}
                      size="small"
                      sx={{
                        backgroundColor:
                          filters.boardingSchool === option ? '#000' : 'transparent',
                        color: filters.boardingSchool === option ? '#fff' : '#000',
                        borderColor: filters.boardingSchool === option ? '#000' : '#ccc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.specialNeeds || false}
                      onChange={(e) => handleSpecialNeedsChange(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="caption">Special Needs Support</Typography>}
                />
              </FormGroup>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Error display */}
      {error && (
        <Box sx={{ mt: 1, p: 1, bgcolor: '#ffe0e0', borderRadius: 1, border: '1px solid #ffcccc' }}>
          <Typography variant="caption" sx={{ color: '#c00', fontWeight: 500 }}>
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SchoolFilters;
