import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Tabs, 
  Tab,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress
} from '@mui/material';
import { 
  Home, 
  TrendingUp, 
  LocationOn, 
  PhotoLibrary, 
  ChecklistRtl,
  Minimize,
  Maximize,
  Settings
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`panel-tabpanel-${index}`}
      aria-labelledby={`panel-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InformationPanels: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [minimizedPanels, setMinimizedPanels] = useState<Set<number>>(new Set());
  
  const property = useSelector((state: RootState) => state.property?.property);
  const currentStep = useSelector((state: RootState) => state.chat?.currentStep || 'welcome');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleMinimize = (tabIndex: number) => {
    const newMinimized = new Set(minimizedPanels);
    if (newMinimized.has(tabIndex)) {
      newMinimized.delete(tabIndex);
    } else {
      newMinimized.add(tabIndex);
    }
    setMinimizedPanels(newMinimized);
  };

  const tabs = [
    { label: 'Overview', icon: <Home fontSize="small" />, id: 'property_overview' },
    { label: 'Market', icon: <TrendingUp fontSize="small" />, id: 'market_intelligence' },
    { label: 'Location', icon: <LocationOn fontSize="small" />, id: 'location_insights' },
    { label: 'Media', icon: <PhotoLibrary fontSize="small" />, id: 'media_gallery' },
    { label: 'Progress', icon: <ChecklistRtl fontSize="small" />, id: 'progress_checklist' }
  ];

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'white',
      borderLeft: '1px solid #e5e7eb'
    }}>
      {/* Panel Header */}
      <Box sx={{ 
        p: 2,
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
          Property Insights
        </Typography>
        <IconButton size="small" sx={{ color: '#6b7280' }}>
          <Settings fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #e5e7eb' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#2563eb',
              }
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ minWidth: 'auto', px: 2 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Panel Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TabPanel value={activeTab} index={0}>
          {/* Property Overview Panel */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
            Property Overview
          </Typography>
          
          {property?.address?.formatted ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Address</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{property.address.formatted}</Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
              Address will appear here once provided
            </Typography>
          )}

          {property?.details?.type && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Property Type</Typography>
              <Chip label={property.details.type} size="small" variant="outlined" />
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Features</Typography>
            {property?.details?.features?.length ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {property.details.features.map((feature, index) => (
                  <Chip key={index} label={feature} size="small" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                Features will appear here after analysis
              </Typography>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Market Intelligence Panel */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
            Market Intelligence
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Price Range</Typography>
            {property?.pricing?.suggestedRange ? (
              <Typography variant="h6" sx={{ color: '#2563eb' }}>
                ${property.pricing.suggestedRange.min?.toLocaleString()} - ${property.pricing.suggestedRange.max?.toLocaleString()}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                Price analysis will appear here
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>Market Trends</Typography>
            <Box sx={{ p: 3, bgcolor: '#f9fafb', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                📈 Market trend chart will display here
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>Comparable Properties</Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
              Comparable properties will appear after analysis
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Location Insights Panel */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
            Location Insights
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>Interactive Map</Typography>
            <Box sx={{ p: 3, bgcolor: '#f9fafb', borderRadius: 2, textAlign: 'center', minHeight: 120 }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                🗺️ Interactive map will display here
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Nearby Amenities</Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
              Amenities will appear after address is provided
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Transport Links</Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
              Transport information will appear here
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Media Gallery Panel */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
            Media Gallery
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>Photos ({property?.media?.photos?.length || 0})</Typography>
            {property?.media?.photos?.length ? (
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1
              }}>
                {property.media.photos.map((photo, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      aspectRatio: '1',
                      bgcolor: '#f3f4f6',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      Photo {index + 1}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ p: 3, bgcolor: '#f9fafb', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  📷 Photos will appear here after upload
                </Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>Videos ({property?.media?.videos?.length || 0})</Typography>
            <Box sx={{ p: 3, bgcolor: '#f9fafb', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                🎥 Videos will appear here after upload
              </Typography>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {/* Progress Checklist Panel */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
            Progress Checklist
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%', 
                  bgcolor: property?.address?.formatted ? '#10b981' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {property?.address?.formatted && (
                    <Typography sx={{ color: 'white', fontSize: '0.75rem' }}>✓</Typography>
                  )}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary="Property Address" 
                secondary={property?.address?.formatted ? "Completed" : "Pending"}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%', 
                  bgcolor: property?.media?.photos?.length ? '#10b981' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {property?.media?.photos?.length && (
                    <Typography sx={{ color: 'white', fontSize: '0.75rem' }}>✓</Typography>
                  )}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary="Photos Upload" 
                secondary={property?.media?.photos?.length ? `${property.media.photos.length} photos` : "Pending"}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%', 
                  bgcolor: property?.analysis?.extractedFeatures?.length ? '#10b981' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {property?.analysis?.extractedFeatures?.length && (
                    <Typography sx={{ color: 'white', fontSize: '0.75rem' }}>✓</Typography>
                  )}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary="AI Analysis" 
                secondary={property?.analysis?.extractedFeatures?.length ? "Completed" : "Pending"}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%', 
                  bgcolor: property?.pricing?.suggestedRange ? '#10b981' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {property?.pricing?.suggestedRange && (
                    <Typography sx={{ color: 'white', fontSize: '0.75rem' }}>✓</Typography>
                  )}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary="Price Analysis" 
                secondary={property?.pricing?.suggestedRange ? "Completed" : "Pending"}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          </List>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>Overall Progress</Typography>
            <LinearProgress 
              variant="determinate" 
              value={25} // This would be calculated based on completed steps
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: '#2563eb'
                }
              }}
            />
            <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
              25% complete - Keep going!
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default InformationPanels; 