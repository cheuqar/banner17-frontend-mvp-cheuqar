import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Paper,
  InputAdornment,
  Chip, 
  Alert,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  LocationOn, 
  Search, 
  Check, 
  OpenInNew,
  Link as LinkIcon,
  MyLocation, 
  School,
  Train,
  LocalGroceryStore,
  LocalHospital,
  Park,
  Restaurant,
  Home,
  TrendingUp,
  TrendingDown,
  Info
} from '@mui/icons-material';

interface AddressInputControlProps {
  onComplete: (data: any) => void;
  onPanelUpdate: (panelId: string, data: any) => void;
  onExpandToCanvas?: (data: any) => void;
  isExpanded?: boolean;
  isActive?: boolean;
}

const AddressInputControl: React.FC<AddressInputControlProps> = ({ 
  onComplete, 
  onPanelUpdate,
  onExpandToCanvas,
  isExpanded = false,
  isActive = true
}) => {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'error'>('idle');
  const [showInsights, setShowInsights] = useState(false);

  const handleSearch = async () => {
    if (!address.trim()) return;
    
    setIsSearching(true);
    setValidationState('validating');
    
    // Simulate comprehensive API call to Google Places/Maps
    setTimeout(() => {
      const mockResults = [
        {
          id: '1',
          formattedAddress: `${address}, NSW, Australia`,
          placeId: 'ChIJ1234567890',
          coordinates: { lat: -33.8688, lng: 151.2093 },
          components: {
            streetNumber: address.split(' ')[0] || '',
            streetName: address.split(' ').slice(1).join(' ') || '',
            suburb: 'Bondi Beach',
            state: 'NSW',
            postcode: '2026',
            country: 'Australia'
          },
          confidence: 0.95,
          nearbyAmenities: [
            { name: 'Bondi Beach', type: 'Recreation', distance: '0.2km', icon: 'beach', rating: 4.7 },
            { name: 'Westfield Bondi Junction', type: 'Shopping', distance: '1.2km', icon: 'shopping', rating: 4.3 },
            { name: 'Bondi Junction Station', type: 'Transport', distance: '1.5km', icon: 'train', rating: 4.1 },
            { name: 'Waverley College', type: 'Education', distance: '0.8km', icon: 'school', rating: 4.5 },
            { name: 'Prince of Wales Hospital', type: 'Healthcare', distance: '3.2km', icon: 'hospital', rating: 4.0 },
            { name: 'Centennial Park', type: 'Recreation', distance: '2.1km', icon: 'park', rating: 4.8 }
          ],
          marketData: {
            medianPrice: 2850000,
            priceRange: { min: 2200000, max: 3800000 },
            averageDaysOnMarket: 28,
            recentSales: 12,
            priceGrowth: 0.18,
            marketHotness: 'high',
            walkScore: 85,
            bikeScore: 72,
            transitScore: 78
          },
          demographicData: {
            medianAge: 32,
            averageIncome: 95000,
            populationDensity: 8500,
            familyFriendly: 4.2,
            nightlife: 4.7,
            cafesRestaurants: 4.6
          },
          schoolDistricts: [
            { name: 'Bondi Beach Public School', rating: 8.2, distance: '0.6km', type: 'Primary' },
            { name: 'Rose Bay Secondary College', rating: 7.8, distance: '1.8km', type: 'High School' },
            { name: 'Waverley College', rating: 8.9, distance: '0.8km', type: 'Private' }
          ]
        },
        {
          id: '2', 
          formattedAddress: `${address}, QLD, Australia`,
          placeId: 'ChIJ0987654321',
          coordinates: { lat: -27.4698, lng: 153.0251 },
          components: {
            streetNumber: address.split(' ')[0] || '',
            streetName: address.split(' ').slice(1).join(' ') || '',
            suburb: 'Brisbane CBD',
            state: 'QLD', 
            postcode: '4000',
            country: 'Australia'
          },
          confidence: 0.87,
      nearbyAmenities: [
            { name: 'South Bank Parklands', type: 'Recreation', distance: '0.5km', icon: 'park', rating: 4.6 },
            { name: 'Queen Street Mall', type: 'Shopping', distance: '0.3km', icon: 'shopping', rating: 4.2 },
            { name: 'Central Station', type: 'Transport', distance: '0.8km', icon: 'train', rating: 4.0 }
      ],
      marketData: {
            medianPrice: 1650000,
            priceRange: { min: 1200000, max: 2400000 },
            averageDaysOnMarket: 35,
            recentSales: 8,
            priceGrowth: 0.12,
            marketHotness: 'medium',
            walkScore: 92,
            bikeScore: 68,
            transitScore: 85
          }
        }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
      setValidationState('valid');
    }, 1500);
  };

  const handleAddressSelect = (addressData: any) => {
    setSelectedAddress(addressData);
    setAddress(addressData.formattedAddress);
    setShowInsights(true);
    
    // Update information panels with comprehensive data
    onPanelUpdate('location-insights', {
      address: addressData.formattedAddress,
      coordinates: addressData.coordinates,
      amenities: addressData.nearbyAmenities,
      confidence: addressData.confidence,
      marketData: addressData.marketData,
      demographicData: addressData.demographicData,
      schoolDistricts: addressData.schoolDistricts
    });

    onPanelUpdate('market-intelligence', {
      medianPrice: addressData.marketData?.medianPrice,
      priceRange: addressData.marketData?.priceRange,
      priceGrowth: addressData.marketData?.priceGrowth,
      marketHotness: addressData.marketData?.marketHotness,
      averageDaysOnMarket: addressData.marketData?.averageDaysOnMarket,
      recentSales: addressData.marketData?.recentSales
    });
  };

  const handleComplete = () => {
    if (selectedAddress) {
      onComplete(selectedAddress);
    }
  };

  const handleExpandToCanvas = () => {
    if (onExpandToCanvas && selectedAddress) {
      onExpandToCanvas({
        id: 'address-input',
        title: 'Location Analysis',
        type: 'address',
        data: selectedAddress,
        isActive: isActive,
        content: (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Location Analysis Dashboard
            </Typography>
            
            {/* Interactive Map Section */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#2563eb' }} />
                Interactive Map & Surroundings
              </Typography>
              <Box sx={{ 
                height: 300, 
                bgcolor: '#e5e7eb', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  🗺️ Interactive Google Maps would display here
                </Typography>
                <Box sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10,
                  display: 'flex',
                  gap: 1
                }}>
                  <Chip label="Satellite" size="small" />
                  <Chip label="Street View" size="small" variant="outlined" />
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Chip icon={<LocationOn />} label={`${selectedAddress.coordinates.lat.toFixed(4)}, ${selectedAddress.coordinates.lng.toFixed(4)}`} />
                <Chip label={`Walk Score: ${selectedAddress.marketData?.walkScore}`} color="primary" />
                <Chip label={`Transit Score: ${selectedAddress.marketData?.transitScore}`} color="secondary" />
              </Box>
            </Paper>

                         {/* Market Overview */}
             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
               <Card>
                 <CardContent>
                   <Typography variant="h6" sx={{ mb: 1, color: '#2563eb' }}>
                     ${selectedAddress.marketData?.medianPrice?.toLocaleString()}
                   </Typography>
                   <Typography variant="body2" sx={{ color: '#6b7280' }}>
                     Median Price
                   </Typography>
                   <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                     <TrendingUp sx={{ fontSize: 16, color: '#10b981', mr: 0.5 }} />
                     <Typography variant="caption" sx={{ color: '#10b981' }}>
                       +{(selectedAddress.marketData?.priceGrowth * 100).toFixed(1)}% this year
                     </Typography>
                   </Box>
                 </CardContent>
               </Card>
               <Card>
                 <CardContent>
                   <Typography variant="h6" sx={{ mb: 1, color: '#10b981' }}>
                     {selectedAddress.marketData?.averageDaysOnMarket} days
                   </Typography>
                   <Typography variant="body2" sx={{ color: '#6b7280' }}>
                     Average Days on Market
                   </Typography>
                   <Chip 
                     label={`${selectedAddress.marketData?.marketHotness} demand`} 
                     size="small" 
                     color={selectedAddress.marketData?.marketHotness === 'high' ? 'error' : 'default'}
                     sx={{ mt: 1 }}
                   />
                 </CardContent>
               </Card>
             </Box>

            {/* Comprehensive Amenities */}
            <Paper sx={{ p: 3, mb: 3 }}>
                             <Typography variant="h6" sx={{ mb: 2 }}>
                 Nearby Amenities & Services
               </Typography>
               <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                 {selectedAddress.nearbyAmenities?.map((amenity: any, index: number) => (
                   <Box key={index} sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     p: 2, 
                     border: '1px solid #e5e7eb', 
                     borderRadius: 2,
                     '&:hover': { bgcolor: '#f9fafb' }
                   }}>
                     {amenity.type === 'Shopping' && <LocalGroceryStore sx={{ color: '#2563eb', mr: 2 }} />}
                     {amenity.type === 'Transport' && <Train sx={{ color: '#10b981', mr: 2 }} />}
                     {amenity.type === 'Education' && <School sx={{ color: '#f59e0b', mr: 2 }} />}
                     {amenity.type === 'Healthcare' && <LocalHospital sx={{ color: '#ef4444', mr: 2 }} />}
                     {amenity.type === 'Recreation' && <Park sx={{ color: '#059669', mr: 2 }} />}
                     <Box sx={{ flex: 1 }}>
                       <Typography variant="body2" sx={{ fontWeight: 500 }}>
                         {amenity.name}
                       </Typography>
                       <Typography variant="caption" sx={{ color: '#6b7280' }}>
                         {amenity.distance} • ⭐ {amenity.rating}
                       </Typography>
                     </Box>
                   </Box>
                 ))}
               </Box>
            </Paper>

            {/* Schools Information */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                School Districts & Education
              </Typography>
              <List>
                {selectedAddress.schoolDistricts?.map((school: any, index: number) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <School sx={{ color: '#f59e0b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={school.name}
                      secondary={`${school.type} • ${school.distance} • Rating: ${school.rating}/10`}
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={school.rating * 10} 
                      sx={{ width: 60, mr: 2 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )
      });
    }
  };

  const getAmenityIcon = (type: string) => {
    switch (type) {
      case 'Shopping': return <LocalGroceryStore sx={{ fontSize: 16, color: '#2563eb' }} />;
      case 'Transport': return <Train sx={{ fontSize: 16, color: '#10b981' }} />;
      case 'Education': return <School sx={{ fontSize: 16, color: '#f59e0b' }} />;
      case 'Healthcare': return <LocalHospital sx={{ fontSize: 16, color: '#ef4444' }} />;
      case 'Recreation': return <Park sx={{ fontSize: 16, color: '#059669' }} />;
      default: return <Home sx={{ fontSize: 16, color: '#6b7280' }} />;
    }
  };

  // If expanded to canvas, show link button state
  if (isExpanded) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          bgcolor: '#f8fafc',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#2563eb',
            bgcolor: '#eff6ff'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinkIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ 
              color: '#2563eb',
              fontWeight: 500,
              mb: 0.5
            }}>
              Location Analysis - Expanded in Canvas
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              {selectedAddress?.formattedAddress || 'Click to focus canvas tab'}
            </Typography>
          </Box>
          <Chip 
            label="Canvas" 
            size="small"
            sx={{ 
              bgcolor: '#2563eb',
              color: 'white',
              fontSize: '0.75rem'
            }}
          />
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header with Expand Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
          Property Address & Location Analysis
      </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectedAddress && (
            <IconButton
              size="small"
              onClick={handleExpandToCanvas}
              sx={{ 
                color: '#6b7280',
                '&:hover': { color: '#2563eb' }
              }}
              title="Expand to Canvas"
            >
              <OpenInNew fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Address Search Input */}
        <TextField
          fullWidth
        value={address}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Enter property address (e.g. 123 Campbell Parade, Bondi Beach)"
          variant="outlined"
        disabled={!isActive}
        size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
              <LocationOn sx={{ color: '#6b7280', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" sx={{ color: '#6b7280' }}>
                  <MyLocation fontSize="small" />
                </IconButton>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSearch}
                  disabled={!address.trim() || isSearching || !isActive}
                  sx={{ 
                    minWidth: 'auto',
                    px: 2
                  }}
                >
                  {isSearching ? '...' : <Search fontSize="small" />}
                </Button>
              </Box>
              </InputAdornment>
          )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
            bgcolor: isActive ? 'white' : '#f9fafb',
          }
        }}
      />

      {/* Validation State */}
      {validationState === 'validating' && (
        <Alert severity="info" sx={{ py: 0.5 }}>
          <Typography variant="caption">
            🔍 Searching address database and analyzing location insights...
          </Typography>
        </Alert>
      )}

      {/* Search Results */}
      <Collapse in={searchResults.length > 0 && validationState === 'valid'}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
            Select the correct address:
            </Typography>
          {searchResults.map((result) => (
            <Paper
              key={result.id}
              elevation={0}
            sx={{ 
                p: 2,
                border: selectedAddress?.id === result.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                borderRadius: 2,
                cursor: isActive ? 'pointer' : 'default',
                bgcolor: selectedAddress?.id === result.id ? '#eff6ff' : 'white',
                '&:hover': isActive ? {
                  borderColor: '#2563eb',
                  bgcolor: '#f8fafc'
                } : {}
              }}
              onClick={() => isActive && handleAddressSelect(result)}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {result.formattedAddress}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    <Chip label={`Walk Score: ${result.marketData?.walkScore}`} size="small" />
                    <Chip label={`${result.nearbyAmenities?.length} amenities`} size="small" variant="outlined" />
                    <Chip label={`$${result.marketData?.medianPrice?.toLocaleString()}`} size="small" color="primary" />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Confidence: {Math.round(result.confidence * 100)}% • {result.components.suburb}, {result.components.state}
          </Typography>
                </Box>
                {selectedAddress?.id === result.id && (
                  <Check sx={{ color: '#10b981', fontSize: 20 }} />
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Collapse>

      {/* Comprehensive Location Insights */}
      <Collapse in={showInsights && selectedAddress != null}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Divider />
          
          {/* Quick Market Overview */}
          <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                         <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#1f2937' }}>
               📊 Market Snapshot
             </Typography>
             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
               <Box>
                 <Typography variant="caption" sx={{ color: '#6b7280' }}>Median Price</Typography>
                 <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563eb' }}>
                   ${selectedAddress?.marketData?.medianPrice?.toLocaleString()}
              </Typography>
            </Box>
               <Box>
                 <Typography variant="caption" sx={{ color: '#6b7280' }}>Days on Market</Typography>
                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
                   {selectedAddress?.marketData?.averageDaysOnMarket} days
            </Typography>
               </Box>
            </Box>
          </Paper>

          {/* Top Amenities Preview */}
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, mb: 1, display: 'block' }}>
              🌟 Nearby Highlights
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {selectedAddress?.nearbyAmenities?.slice(0, 3).map((amenity: any, index: number) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5, 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  {getAmenityIcon(amenity.type)}
                  <Box sx={{ ml: 1, flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 500, display: 'block' }}>
                      {amenity.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {amenity.distance} • ⭐ {amenity.rating}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {selectedAddress?.nearbyAmenities?.length > 3 && (
              <Typography variant="caption" sx={{ color: '#2563eb', mt: 1, display: 'block', textAlign: 'center' }}>
                +{selectedAddress.nearbyAmenities.length - 3} more amenities (expand to see all)
              </Typography>
            )}
            </Box>
        </Box>
      </Collapse>

      {/* Action Button */}
      {selectedAddress && (
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={!isActive}
          sx={{ 
            alignSelf: 'flex-start',
            mt: 1
          }}
        >
          Confirm Location
        </Button>
      )}

      {/* Inactive State Notice */}
      {!isActive && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="caption">
            ℹ️ Location has been confirmed and is no longer editable
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default AddressInputControl; 