/**
 * Schools Tab Component - Displays school catchments and nearby schools
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Badge,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import {
  ExpandMore,
  School,
  Refresh,
  Star,
  FilterList,
} from '@mui/icons-material';

import { usePropertySchools } from '../../hooks/usePropertySchools';
import { 
  formatDistance, 
  getSectorColor, 
  getSectorIcon, 
  getLevelBadgeColor 
} from '../../services/schoolsService';
import type { SchoolCatchment, NearbySchool } from '../../services/schoolsService';

interface SchoolsTabProps {
  propertyId: string;
  property?: any; // Property object to check coordinates
}

// Filter state interface
interface SchoolFilters {
  levels: ('primary' | 'high')[];
  sectors: ('government' | 'catholic' | 'independent')[];
  showSelective: boolean;
  maxDistance: number;
}

const SchoolsTab: React.FC<SchoolsTabProps> = ({ propertyId, property }) => {
  // Schools data hook
  const {
    catchments,
    nearbySchoolsGrouped,
    loading,
    error,
    refetch,
    totalSchools,
    calendarYear,
    disclaimer,
  } = usePropertySchools(propertyId, true, { includeGeoData: false }, property);

  // UI state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['catchments', 'primary', 'high'])
  );

  // Filter state
  const [filters, setFilters] = useState<SchoolFilters>({
    levels: ['primary', 'high'],
    sectors: ['government', 'catholic', 'independent'],
    showSelective: true,
    maxDistance: 5.0, // km
  });

  // Filter functions
  const filterSchools = (schools: NearbySchool[]): NearbySchool[] => {
    return schools.filter(school => {
      // Level filter
      if (!filters.levels.includes(school.level)) return false;
      
      // Sector filter
      if (!filters.sectors.includes(school.sector)) return false;
      
      // Selective filter
      if (!filters.showSelective && school.selective) return false;
      
      // Distance filter
      if (school.distance_km > filters.maxDistance) return false;
      
      return true;
    });
  };

  const filterCatchments = (catchments: SchoolCatchment[]): SchoolCatchment[] => {
    return catchments.filter(catchment => {
      // Level filter
      if (!filters.levels.includes(catchment.level)) return false;
      
      // Sector filter
      if (!filters.sectors.includes(catchment.sector)) return false;
      
      // Selective filter
      if (!filters.showSelective && catchment.selective) return false;
      
      return true;
    });
  };

  // Event handlers
  const handleSectionToggle = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleFilterChange = (filterType: keyof SchoolFilters, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Render school item
  const renderSchoolItem = (school: SchoolCatchment | NearbySchool, isCatchment: boolean = false) => {
    const isNearby = !isCatchment;
    const distance = isNearby ? (school as NearbySchool).distance_km : undefined;

    return (
      <ListItem
        key={`${school.school_id}-${isCatchment ? 'catchment' : 'nearby'}`}
        sx={{
          bgcolor: isCatchment ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
          borderLeft: isCatchment ? '3px solid #4caf50' : 'none',
          mb: 1,
          borderRadius: 1,
          '&:hover': {
            bgcolor: isCatchment ? 'rgba(76, 175, 80, 0.1)' : 'rgba(31, 170, 188, 0.05)',
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          <School sx={{ 
            fontSize: 18, 
            color: getSectorColor(school.sector)
          }} />
        </ListItemIcon>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>
                {school.school_name}
              </Typography>
              
              {/* Level Badge */}
              <Chip
                label={school.level}
                size="small"
                sx={{
                  bgcolor: getLevelBadgeColor(school.level),
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
              
              {/* Sector Badge */}
              <Chip
                label={`${getSectorIcon(school.sector)} ${school.sector}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: getSectorColor(school.sector),
                  color: getSectorColor(school.sector),
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
              
              {/* Selective Badge */}
              {school.selective && (
                <Chip
                  label="Selective"
                  size="small"
                  icon={<Star sx={{ fontSize: 12 }} />}
                  sx={{
                    bgcolor: '#ffc107',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              )}
              
              {/* Distance Badge (for nearby schools) */}
              {distance !== undefined && (
                <Chip
                  label={formatDistance(distance)}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(31, 170, 188, 0.3)',
                    color: '#0d2b2c',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              )}
              
              {/* Catchment Badge */}
              {isCatchment && (
                <Chip
                  label="In Catchment"
                  size="small"
                  sx={{
                    bgcolor: '#4caf50',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              )}
            </Box>
          }
          secondary={
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {school.sector.charAt(0).toUpperCase() + school.sector.slice(1)} • {school.level} school
                {school.selective && ' • Selective entry'}
              </Typography>
            </Box>
          }
        />
      </ListItem>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress size={40} sx={{ color: '#0d2b2c' }} />
        <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
          Loading schools data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    if (error === 'coordinates_unavailable') {
      return (
        <Box sx={{ p: 2 }}>
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button
                onClick={() => window.open('mailto:report@banner17.ai?subject=Property Location Issue&body=Property ID: ' + propertyId + '%0A%0AThis property is missing location coordinates. Please add latitude/longitude data so we can show nearby schools.', '_blank')}
                size="small"
                variant="outlined"
                sx={{ color: '#2196f3', borderColor: '#2196f3' }}
              >
                Report Issue
              </Button>
            }
          >
            Schools nearby is not available for this property due to missing location information.
          </Alert>
        </Box>
      );
    }

    const isAddressIssue = error.includes('valid address') || error.includes('location data');

    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity={isAddressIssue ? "warning" : "error"}
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isAddressIssue && (
                <Button
                  onClick={() => window.open('mailto:report@banner17.ai?subject=Property Address Issue&body=Property ID: ' + propertyId + '%0A%0APlease fix the address/location data for this property.', '_blank')}
                  size="small"
                  variant="outlined"
                  sx={{ color: '#ff9800', borderColor: '#ff9800' }}
                >
                  Report Issue
                </Button>
              )}
              <Button onClick={refetch} size="small" startIcon={<Refresh />}>
                Retry
              </Button>
            </Box>
          }
        >
          {isAddressIssue ? error : `Failed to load schools data: ${error}`}
        </Alert>
      </Box>
    );
  }

  // Filter data
  const filteredCatchments = filterCatchments(catchments);
  const filteredNearbyPrimary = {
    government: filterSchools(nearbySchoolsGrouped.primary.government),
    catholic: filterSchools(nearbySchoolsGrouped.primary.catholic),
    independent: filterSchools(nearbySchoolsGrouped.primary.independent),
  };
  const filteredNearbyHigh = {
    government: filterSchools(nearbySchoolsGrouped.high.government),
    catholic: filterSchools(nearbySchoolsGrouped.high.catholic),
    independent: filterSchools(nearbySchoolsGrouped.high.independent),
  };

  const totalFiltered = filteredCatchments.length +
    Object.values(filteredNearbyPrimary).flat().length +
    Object.values(filteredNearbyHigh).flat().length;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with summary and filters */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#0d2b2c', fontWeight: 600 }}>
            Schools & Catchments
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={totalFiltered} color="primary">
              <FilterList sx={{ color: 'rgba(31, 170, 188, 0.7)' }} />
            </Badge>
            <Typography variant="body2" color="text.secondary">
              {totalFiltered} of {totalSchools} schools
            </Typography>
          </Box>
        </Box>

        {/* Quick Filters */}
        <Paper sx={{ p: 2, bgcolor: 'rgba(31, 170, 188, 0.02)' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Filters
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {/* Level filters */}
            {(['primary', 'high'] as const).map(level => (
              <FormControlLabel
                key={level}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.levels.includes(level)}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...filters.levels, level]
                        : filters.levels.filter(l => l !== level);
                      handleFilterChange('levels', newLevels);
                    }}
                  />
                }
                label={level.charAt(0).toUpperCase() + level.slice(1)}
                sx={{ mr: 2 }}
              />
            ))}
            
            {/* Sector filters */}
            {(['government', 'catholic', 'independent'] as const).map(sector => (
              <FormControlLabel
                key={sector}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.sectors.includes(sector)}
                    onChange={(e) => {
                      const newSectors = e.target.checked
                        ? [...filters.sectors, sector]
                        : filters.sectors.filter(s => s !== sector);
                      handleFilterChange('sectors', newSectors);
                    }}
                  />
                }
                label={sector.charAt(0).toUpperCase() + sector.slice(1)}
                sx={{ mr: 2 }}
              />
            ))}
            
            {/* Selective filter */}
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filters.showSelective}
                  onChange={(e) => handleFilterChange('showSelective', e.target.checked)}
                />
              }
              label="Include Selective"
            />
          </Box>
        </Paper>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* School Catchments */}
        {filteredCatchments.length > 0 && (
          <Accordion 
            expanded={expandedSections.has('catchments')}
            onChange={() => handleSectionToggle('catchments')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School sx={{ color: '#4caf50' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  School Catchments
                </Typography>
                <Badge badgeContent={filteredCatchments.length} color="success" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {filteredCatchments.map(catchment => renderSchoolItem(catchment, true))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Primary Schools */}
        {(Object.values(filteredNearbyPrimary).flat().length > 0) && (
          <Accordion 
            expanded={expandedSections.has('primary')}
            onChange={() => handleSectionToggle('primary')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School sx={{ color: getLevelBadgeColor('primary') }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Nearby Primary Schools
                </Typography>
                <Badge 
                  badgeContent={Object.values(filteredNearbyPrimary).flat().length} 
                  sx={{ '& .MuiBadge-badge': { bgcolor: getLevelBadgeColor('primary') } }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {Object.entries(filteredNearbyPrimary).map(([sector, schools]) =>
                  schools.map(school => renderSchoolItem(school, false))
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* High Schools */}
        {(Object.values(filteredNearbyHigh).flat().length > 0) && (
          <Accordion 
            expanded={expandedSections.has('high')}
            onChange={() => handleSectionToggle('high')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School sx={{ color: getLevelBadgeColor('high') }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Nearby High Schools
                </Typography>
                <Badge 
                  badgeContent={Object.values(filteredNearbyHigh).flat().length} 
                  sx={{ '& .MuiBadge-badge': { bgcolor: getLevelBadgeColor('high') } }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {Object.entries(filteredNearbyHigh).map(([sector, schools]) =>
                  schools.map(school => renderSchoolItem(school, false))
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* No Results */}
        {totalFiltered === 0 && totalSchools > 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <School sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No schools match your filters
            </Typography>
            <Typography variant="body2">
              Try adjusting the filters above to see more schools.
            </Typography>
          </Box>
        )}

        {/* No Data */}
        {totalSchools === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <School sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No schools data available
            </Typography>
            <Typography variant="body2">
              School catchment and nearby schools data is not available for this property.
            </Typography>
            <Button
              onClick={refetch}
              sx={{ mt: 2, color: '#0d2b2c' }}
              startIcon={<Refresh />}
            >
              Try Again
            </Button>
          </Box>
        )}
      </Box>

      {/* Footer with disclaimer */}
      {disclaimer && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(31, 170, 188, 0.1)' }}>
          <Alert severity="info" sx={{ bgcolor: 'rgba(31, 170, 188, 0.05)' }}>
            <Typography variant="caption">
              <strong>Calendar Year {calendarYear}:</strong> {disclaimer}
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default SchoolsTab;
