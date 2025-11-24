import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Home,
  LocationOn,
  AttachMoney,
  Bed,
  Bathtub,
  SquareFoot
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Property {
  id: string;
  title: string;
  address: string;
  suburb: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_size: number;
  property_type: string;
  status: 'active' | 'inactive' | 'pending';
  image_url?: string;
  created_at: string;
}

const MyProperties: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for demonstration
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern Apartment in CBD',
      address: '123 Collins Street',
      suburb: 'Melbourne',
      price: 650000,
      bedrooms: 2,
      bathrooms: 1,
      area_size: 85,
      property_type: 'Apartment',
      status: 'active',
      image_url: '/placeholder-property.jpg',
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Family Home with Garden',
      address: '456 Suburban Drive',
      suburb: 'Richmond',
      price: 950000,
      bedrooms: 3,
      bathrooms: 2,
      area_size: 180,
      property_type: 'House',
      status: 'active',
      image_url: '/placeholder-property.jpg',
      created_at: '2024-01-10T00:00:00Z'
    },
    {
      id: '3',
      title: 'Luxury Penthouse',
      address: '789 Harbor View',
      suburb: 'South Yarra',
      price: 1500000,
      bedrooms: 3,
      bathrooms: 2,
      area_size: 220,
      property_type: 'Penthouse',
      status: 'pending',
      image_url: '/placeholder-property.jpg',
      created_at: '2024-01-05T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadProperties = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProperties(mockProperties);
        setTotalPages(1);
      } catch (err) {
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.suburb.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: Property['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending Review';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
            My Properties
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Manage your property listings and track their performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            bgcolor: '#3b82f6',
            '&:hover': { bgcolor: '#2563eb' }
          }}
        >
          Add Property
        </Button>
      </Box>

      {/* Search and Stats */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                  {properties.filter(p => p.status === 'active').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Active
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#d97706', fontWeight: 600 }}>
                  {properties.filter(p => p.status === 'pending').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Pending
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
                  {properties.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Total
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} md={6} lg={4} key={property.id}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Home sx={{ fontSize: 48, color: '#9ca3af' }} />
                )}
                
                {/* Status Badge */}
                <Chip
                  label={getStatusLabel(property.status)}
                  color={getStatusColor(property.status)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontWeight: 600
                  }}
                />
              </CardMedia>

              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {property.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ fontSize: 16, color: '#6b7280', mr: 0.5 }} />
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {property.address}, {property.suburb}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ fontSize: 18, color: '#059669', mr: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                    {formatPrice(property.price)}
                  </Typography>
                </Box>

                {/* Property Details */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Bed sx={{ fontSize: 16, color: '#6b7280', mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {property.bedrooms}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Bathtub sx={{ fontSize: 16, color: '#6b7280', mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {property.bathrooms}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SquareFoot sx={{ fontSize: 16, color: '#6b7280', mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {property.area_size}m²
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                  {property.property_type}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <IconButton size="small" sx={{ color: '#3b82f6' }}>
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#059669' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#dc2626' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <Box sx={{
          textAlign: 'center',
          py: 8,
          bgcolor: '#f9fafb',
          borderRadius: 2,
          border: '1px dashed #d1d5db'
        }}>
          <Home sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#374151', mb: 1 }}>
            {searchTerm ? 'No properties found' : 'No properties yet'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first property listing'
            }
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              Add Your First Property
            </Button>
          )}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default MyProperties;
