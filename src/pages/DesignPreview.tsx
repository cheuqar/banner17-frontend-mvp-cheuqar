import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Paper,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Container,
  Grid,
  Tabs,
  Tab,
  Badge,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  CardMedia,
  CardActions,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  Favorite as FavoriteIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
  ShoppingCart as ShoppingIcon,
  LocalLibrary as LibraryIcon,
  Timeline,
  AutoAwesome,
  Bed,
  Bathtub,
  Square,
  GridView,
  ViewList,
  Map as MapIcon,
  Close,
  ExpandMore,
  Circle,
  Analytics
} from '@mui/icons-material';

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
      id={`preview-tabpanel-${index}`}
      aria-labelledby={`preview-tab-${index}`}
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

const DesignPreview: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sampleText, setSampleText] = useState('Type your message here...');
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'map'>('cards');
  const [journeyMenuAnchor, setJourneyMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeMenuJourney, setActiveMenuJourney] = useState<string | null>(null);
  const [expandedJourneys, setExpandedJourneys] = useState<Set<string>>(new Set(['journey-1']));
  const [activeSession, setActiveSession] = useState('session-grace-1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: 'list' | 'cards' | 'map' | null) => {
    if (newViewMode) {
      setViewMode(newViewMode);
    }
  };

  // Journey Tab System handlers
  const handleJourneyMenuOpen = (event: React.MouseEvent<HTMLElement>, journeyId: string) => {
    setJourneyMenuAnchor(event.currentTarget);
    setActiveMenuJourney(journeyId);
  };

  const handleJourneyMenuClose = () => {
    setJourneyMenuAnchor(null);
    setActiveMenuJourney(null);
  };

  const getAgentInfo = (scope: string) => {
    switch (scope) {
      case 'exploration':
        return { name: 'Grace', avatar: '/grace.png', color: '#0d2b2c' };
      case 'property_drill':
        return { name: 'Isaac', avatar: '/isaac.png', color: '#2563eb' };
      case 'comparison':
        return { name: 'Marcus', avatar: '/marcus.png', color: '#059669' };
      default:
        return { name: 'Agent', avatar: '/grace.png', color: '#6b7280' };
    }
  };

  // Sample journey data for testing
  const sampleJourneys = [
    {
      id: 'journey-1',
      title: 'Apartments under $2M in NSW',
      color_code: '#0d2b2c',
      icon_letters: 'AU',
      active_session_id: 'session-1',
      exploration_session_id: 'session-1',
      search_criteria: { states: ['NSW'], property_types: ['Apartment'], price_max: 2000000 },
      sessions: [
        {
          id: 'session-1',
          scope: 'exploration' as const,
          title: 'Property Exploration',
          created_at: '2025-09-04T10:00:00Z',
          session_order: 1
        },
        {
          id: 'session-2',
          scope: 'property_drill' as const,
          title: 'Property Analysis',
          created_at: '2025-09-04T10:30:00Z',
          session_purpose: 'Property Analysis: 234 Sussex Street',
          session_order: 2
        }
      ]
    },
    {
      id: 'journey-2', 
      title: 'Houses in VIC under $1M',
      color_code: '#2563eb',
      icon_letters: 'HV',
      active_session_id: 'session-3',
      exploration_session_id: 'session-3',
      search_criteria: { states: ['VIC'], property_types: ['House'], price_max: 1000000 },
      sessions: [
        {
          id: 'session-3',
          scope: 'exploration' as const,
          title: 'Property Exploration - VIC',
          created_at: '2025-09-04T11:00:00Z',
          session_order: 1
        }
      ]
    }
  ];

  // Sample property data for testing
  const sampleProperties = [
    {
      id: '1',
      title: '234 Sussex Street, Sydney CBD',
      price: '$2,450,000',
      bedrooms: 2,
      bathrooms: 2,
      propertyType: 'Apartment',
      distance: '0.8km from Sydney Opera House',
      image: '/hero-banner.jpg',
      status: 'Sale',
      landSize: '117.2m²'
    },
    {
      id: '2', 
      title: '90 Pitt Street, Sydney CBD',
      price: '$1,890,000',
      bedrooms: 1,
      bathrooms: 1,
      propertyType: 'Apartment',
      distance: '1.2km from Sydney Opera House',
      image: '/hero-banner.jpg',
      status: 'Sale',
      landSize: '89.5m²'
    },
    {
      id: '3',
      title: '456 George Street, Sydney CBD',
      price: 'Guide $1,600,000',
      bedrooms: 2,
      bathrooms: 1,
      propertyType: 'House',
      distance: '2.1km from Sydney Opera House',
      image: '/hero-banner.jpg',
      status: 'Sale',
      landSize: '238m²'
    }
  ];

  const sampleAmenities = [
    { id: '1', name: 'Sydney Hospital', category: 'Hospital', distance: '0.5km', icon: HospitalIcon },
    { id: '2', name: 'State Library of NSW', category: 'Library', distance: '0.8km', icon: LibraryIcon },
    { id: '3', name: 'Westfield Sydney', category: 'Shopping', distance: '1.2km', icon: ShoppingIcon },
    { id: '4', name: 'University of Sydney', category: 'Education', distance: '2.5km', icon: SchoolIcon }
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'transparent', // SLEEK: transparent hero section
        background: 'linear-gradient(135deg, rgba(31, 170, 188, 0.05) 0%, rgba(31, 170, 188, 0.02) 100%)', // SLEEK: subtle gradient
        border: '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: brand border
        borderRadius: 2, // SLEEK: rounded corners
        color: 'text.primary', 
        p: 4, 
        textAlign: 'center',
        m: 2 // SLEEK: margin for floating effect
      }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 300, color: '#0d2b2c' }}>
          Design Preview
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.7 }}>
          SLEEK Modern Component Library
        </Typography>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="design preview tabs">
            <Tab label="Typography" />
            <Tab label="Colors & Buttons" />
            <Tab label="Chat Components" />
            <Tab label="Property Cards" />
            <Tab label="Amenity Lists" />
            <Tab label="🚀 Interface Revamp" />
            <Tab label="Journey Tab System" />
          </Tabs>
        </Box>

        {/* Typography Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h3" gutterBottom color="primary">
            Typography System
          </Typography>
          
          {/* Caveat Font Showcase */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'transparent', border: '1px solid rgba(31, 170, 188, 0.1)', borderRadius: 2 }}> {/* SLEEK: transparent with brand border */}
            <Typography variant="h6" gutterBottom color="secondary">
              Marketing & Accent Font (Caveat)
            </Typography>
            <Typography 
              sx={{ 
                fontFamily: '"Caveat", cursive',
                fontSize: '2.25rem',
                fontWeight: 600,
                color: 'primary.main',
                mb: 2,
                textAlign: 'center'
              }}
            >
              "Find your dream property with confidence"
            </Typography>
            <Typography 
              sx={{ 
                fontFamily: '"Caveat", cursive',
                fontSize: '1.75rem',
                fontWeight: 500,
                color: 'text.primary',
                mb: 1,
                textAlign: 'center'
              }}
            >
              Perfect for call-to-actions and special highlights
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              Caveat font adds warmth and personality to marketing statements
            </Typography>
          </Paper>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="secondary">
                  Headings (Raleway)
                </Typography>
                <Typography variant="h1" gutterBottom>
                  H1 - Built for ambitious real estate agencies
                </Typography>
                <Typography variant="h2" gutterBottom>
                  H2 - Your complete toolkit
                </Typography>
                <Typography variant="h3" gutterBottom>
                  H3 - Marketing solutions
                </Typography>
                <Typography variant="h4" gutterBottom>
                  H4 - Professional platform
                </Typography>
                <Typography variant="h5" gutterBottom>
                  H5 - Industry leading
                </Typography>
                <Typography variant="h6" gutterBottom>
                  H6 - Powerful technology
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="secondary">
                  Body Text (Open Sans)
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Bold text example:</strong> Powerful, fast and easy to use, <strong>Real Estate Marketing platform</strong> that powers your agency and your personal marketing campaigns from digital and print providers Australia wide.
                </Typography>
                <Typography variant="body2" paragraph>
                  Body 2: You need the most powerful and easy to use platform available whether you're a single agent looking to grow your personal brand or a full service agency with hundreds of agents.
                </Typography>
                <Typography variant="caption" display="block" paragraph>
                  Caption: Built for professional agencies, just like yours.
                </Typography>
                <Typography variant="overline" display="block">
                  OVERLINE TEXT
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Colors & Buttons Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h3" gutterBottom color="primary">
            Colors & Buttons
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Color Palette
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: '#0d2b2c', borderRadius: 2, mb: 1, border: '1px solid rgba(31, 170, 188, 0.3)' }} /> {/* SLEEK: brand color with border */}
                    <Typography variant="caption">Primary<br/>#0d2b2c</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: 'transparent', border: '2px solid rgba(31, 170, 188, 0.3)', borderRadius: 2, mb: 1 }} /> {/* SLEEK: transparent secondary */}
                    <Typography variant="caption">Secondary<br/>Transparent</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: 'success.main', borderRadius: 2, mb: 1 }} />
                    <Typography variant="caption">Success<br/>#4CAF50</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: 'error.main', borderRadius: 2, mb: 1 }} />
                    <Typography variant="caption">Error<br/>#F44336</Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Button Variants
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Button variant="contained" color="primary">
                    REQUEST A DEMO
                  </Button>
                  <Button variant="outlined" color="primary">
                    Learn More
                  </Button>
                  <Button variant="text" color="primary">
                    Contact Us
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Button variant="contained" color="secondary">
                    Secondary Action
                  </Button>
                  <Button variant="contained" color="success">
                    Success Action
                  </Button>
                  <Button variant="contained" color="error">
                    Delete Action
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button variant="contained" size="small">Small</Button>
                  <Button variant="contained" size="medium">Medium</Button>
                  <Button variant="contained" size="large">Large</Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Chips & Badges
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip label="Location: NSW" color="primary" />
                  <Chip label="Price: ≤ $2M" color="secondary" />
                  <Chip label="Type: Apartment" variant="outlined" />
                  <Chip label="Bedrooms: ≥ 2" onDelete={() => {}} />
                </Box>

                <Typography variant="h6" gutterBottom>
                  Badges & Icons
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Badge badgeContent={4} color="primary">
                    <HomeIcon />
                  </Badge>
                  <Badge badgeContent="NEW" color="error">
                    <LocationIcon />
                  </Badge>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    G
                  </Avatar>
                  <IconButton color="primary">
                    <FavoriteIcon />
                  </IconButton>
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Interactive Elements
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch color="primary" defaultChecked />}
                    label="Enable notifications"
                  />
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Dark mode"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Dark Header Theme Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#0d2b2c' }}>
              Dark Header Theme
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
                  <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                    Dark Header Design Specification
                  </Typography>
                  <Typography variant="body2" sx={{ px: 2, pb: 2, color: 'text.secondary' }}>
                    Professional dark theme with subtle transparency and brand accents
                  </Typography>
                  
                  {/* Dark Header Preview */}
                  <Box sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', // Dark gradient
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(31, 170, 188, 0.2)', // SLEEK: brand border
                    borderTop: 'none'
                  }}>
                    {/* Left side - Brand */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#0d2b2c',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        L
                      </Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        Banner17
                      </Typography>
                    </Box>
                    
                    {/* Right side - Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Plan Indicator (Mock) */}
                      <Paper sx={{
                        bgcolor: 'rgba(31, 170, 188, 0.1)',
                        color: '#0d2b2c',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        border: '1px solid rgba(31, 170, 188, 0.3)'
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          PRO PLAN
                        </Typography>
                      </Paper>
                      
                      {/* Session Debug Button (Mock) */}
                      <IconButton sx={{
                        bgcolor: 'transparent',
                        color: '#0d2b2c',
                        border: '1px solid rgba(31, 170, 188, 0.2)',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          bgcolor: 'rgba(31, 170, 188, 0.1)'
                        }
                      }}>
                        <Timeline sx={{ fontSize: 16 }} />
                      </IconButton>
                      
                      {/* User Menu (Mock) */}
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#0d2b2c' }}>
                        U
                      </Avatar>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Dark Theme Colors
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, bgcolor: '#1a1a1a', borderRadius: 1, border: '1px solid #333' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Primary Dark</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>#1a1a1a</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, bgcolor: '#2d2d2d', borderRadius: 1, border: '1px solid #444' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Secondary Dark</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>#2d2d2d</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(31, 170, 188, 0.1)', borderRadius: 1, border: '1px solid rgba(31, 170, 188, 0.3)' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Brand Accent</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>rgba(31, 170, 188, 0.1)</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Implementation Guidelines
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Use dark gradient background (#1a1a1a to #2d2d2d)
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      White text with high contrast for readability
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Brand color (#0d2b2c) for accents and active states
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Subtle brand borders for visual hierarchy
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Transparent overlays for interactive elements
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Chat Components Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h3" gutterBottom color="primary">
            Chat Interface Components
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Message Bubbles
                </Typography>
                
                {/* User Message */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      maxWidth: '80%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: '20px 20px 6px 20px',
                      boxShadow: '0 8px 24px rgba(2, 183, 226, 0.15)',
                    }}
                  >
                    <Typography>
                      Show me apartments under $2M in NSW with at least 2 bedrooms
                    </Typography>
                  </Paper>
                </Box>

                {/* AI Message */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      maxWidth: '80%',
                      bgcolor: 'background.paper',
                      borderRadius: '20px 20px 20px 6px',
                      p: 3,
                      boxShadow: '0 4px 16px rgba(64, 64, 65, 0.08)',
                      border: '1px solid rgba(64, 64, 65, 0.08)',
                    }}
                  >
                    <Typography>
                      I found several apartments that match your criteria. Here are properties under $2M in NSW with at least 2 bedrooms.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Chat Input
                </Typography>
                <Box
                  sx={{
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 4,
                    bgcolor: 'white',
                    p: 2,
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(2, 183, 226, 0.12)',
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    maxRows={6}
                    variant="standard"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    placeholder="Type your message here..."
                    sx={{
                      mb: 2,
                      '& .MuiInput-root': {
                        fontFamily: 'var(--font-secondary)',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        color: 'text.primary',
                        '&:before': { display: 'none' },
                        '&:after': { display: 'none' },
                      },
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Press Enter to send
                    </Typography>
                    <IconButton
                      color="primary"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Property Cards Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h3" gutterBottom color="primary">
            Enhanced Property Cards with Horizontal View
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Title and Description */}
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Found 3 properties within 5km of Sydney CBD
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Showcasing the new compact horizontal card layout with enhanced UX
            </Typography>
            
            {/* Active Filters */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                🔍 Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Location: Within 5km of Sydney CBD" color="primary" size="small" />
                <Chip label="Price: ≤ $2,500,000" color="secondary" size="small" />
              </Box>
            </Paper>

            {/* View Mode Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                View Mode Selection:
              </Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value="cards" aria-label="cards view">
                  <Tooltip title="Horizontal Cards View (Default)">
                    <GridView />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <Tooltip title="Vertical List View">
                    <ViewList />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="map" aria-label="map view">
                  <Tooltip title="Map View">
                    <MapIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Horizontal Cards View (NEW DEFAULT) */}
            {viewMode === 'cards' && (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, color: 'success.main' }}>
                  ✨ NEW: Horizontal Cards View (Default)
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 3,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    pb: 2,
                    px: 1,
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(31, 170, 188, 0.1)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(31, 170, 188, 0.3)',
                      borderRadius: '4px',
                      '&:hover': {
                        background: 'rgba(31, 170, 188, 0.5)'
                      }
                    },
                  }}
                >
                  {sampleProperties.map((property) => (
                    <Card
                      key={property.id}
                      sx={{
                        minWidth: 280,
                        maxWidth: 320,
                        flexShrink: 0,
                        borderRadius: '16px',
                        border: '1px solid rgba(31, 170, 188, 0.1)',
                        boxShadow: '0 2px 12px rgba(31, 170, 188, 0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(31, 170, 188, 0.15)',
                          borderColor: 'rgba(31, 170, 188, 0.3)',
                        }
                      }}
                    >
                      {/* Cover Photo with Status Badge and Price Overlay */}
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={property.image}
                          alt={property.title}
                          sx={{
                            objectFit: 'cover',
                            borderRadius: '16px 16px 0 0',
                          }}
                        />
                        {/* Status Badge */}
                        <Chip
                          label={property.status}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: 'rgba(76, 175, 80, 0.9)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                        {/* Price - Inside Cover Photo with Transparent Dark Background */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: 'white',
                              fontSize: '0.85rem',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.4
                            }}
                          >
                            {property.price}
                          </Typography>
                        </Box>
                      </Box>

                      <CardContent sx={{ p: 2, pb: 1 }}>
                        {/* Ask Follow Up Button */}
                        <Button
                          startIcon={<AutoAwesome />}
                          fullWidth
                          sx={{
                            mb: 1.5,
                            bgcolor: 'rgba(31, 170, 188, 0.08)',
                            color: '#0d2b2c',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            py: 0.75,
                            '&:hover': {
                              bgcolor: 'rgba(31, 170, 188, 0.15)',
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          Ask Follow Up
                        </Button>

                        {/* Address */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            lineHeight: 1.3,
                            mb: 1.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {property.title}
                        </Typography>

                        {/* Property Specs - INLINE STYLE (Enhanced) */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 1.5,
                            mb: 1
                          }}
                        >
                          {property.bedrooms && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Bed sx={{ fontSize: 16, color: 'rgba(31, 170, 188, 0.8)' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                {property.bedrooms} bed
                              </Typography>
                            </Box>
                          )}
                          {property.bathrooms && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Bathtub sx={{ fontSize: 16, color: 'rgba(31, 170, 188, 0.8)' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                {property.bathrooms} bath
                              </Typography>
                            </Box>
                          )}
                          {property.landSize && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Square sx={{ fontSize: 16, color: 'rgba(31, 170, 188, 0.8)' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                {property.landSize}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>

                      <CardActions sx={{ p: 1, pt: 0, pb: 0.5, justifyContent: 'center' }}>
                        {/* More... Subtle Text Link */}
                        <Typography
                          sx={{
                            color: 'rgba(31, 170, 188, 0.7)',
                            fontWeight: 400,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textDecorationColor: 'transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: '#0d2b2c',
                              textDecorationColor: '#0d2b2c',
                            }
                          }}
                        >
                          more...
                        </Typography>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Traditional List View */}
            {viewMode === 'list' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 1, color: 'info.main' }}>
                  📋 Traditional List View
                </Typography>
                <Box
                  sx={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(2, 183, 226, 0.08)',
                  }}
                >
                  {sampleProperties.map((property, index) => (
                    <Box
                      key={property.id}
                      sx={{
                        px: 3,
                        py: 2,
                        cursor: 'pointer',
                        borderRadius: '16px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid transparent',
                        '&:hover': {
                          bgcolor: 'primary.50',
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 20px rgba(2, 183, 226, 0.15)',
                          transform: 'translateY(-2px)',
                        },
                        ...(index !== sampleProperties.length - 1 && {
                          borderBottom: '1px solid',
                          borderBottomColor: 'grey.200',
                        }),
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {property.title}
                      </Typography>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                        {property.price}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="body2">{property.bedrooms} bed</Typography>
                        <Typography variant="body2">{property.bathrooms} bath</Typography>
                        <Typography variant="body2">{property.propertyType}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        📍 {property.distance}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Map View Placeholder */}
            {viewMode === 'map' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 1, color: 'warning.main' }}>
                  🗺️ Map View
                </Typography>
                <Paper 
                  sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'grey.100'
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Map visualization would appear here
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Enhancement Summary */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'success.50' }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'success.main' }}>
                ✨ Recent Enhancements Applied:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Horizontal Cards View:</strong> New default view with scrollable property cards
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Compact Price Display:</strong> Price overlay inside cover photo with ellipsis overflow
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Inline Property Specs:</strong> Bedrooms, bathrooms, and area in horizontal layout
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Subtle "More..." Links:</strong> Clean text links instead of prominent buttons
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>Reduced Padding:</strong> More compact cards with optimized spacing
                </Typography>
              </Box>
            </Paper>
          </Paper>
        </TabPanel>

        {/* Amenity Lists Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h3" gutterBottom color="primary">
            Amenity Lists
          </Typography>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Found 4 amenities within 5km
            </Typography>
            
            <List>
              {sampleAmenities.map((amenity, index) => {
                const IconComponent = amenity.icon;
                return (
                  <React.Fragment key={amenity.id}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'grey.50',
                          transform: 'translateX(4px)',
                          transition: 'all 0.2s ease-in-out',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <IconComponent />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={amenity.name}
                        secondary={`${amenity.category} • ${amenity.distance} away`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    {index < sampleAmenities.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </TabPanel>

        {/* Forms & Inputs Tab - REMOVED for Interface Revamp */}

        {/* Journey Navigation System Preview */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Journey Navigation System
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 4 }}>
            REPLACES Contextual Bar + Session Chips. Integrates agent profiles, active filters, and buyer profile management with Journey concept and hierarchical navigation tree.
          </Typography>

          <Grid container spacing={4}>
            {/* Journey Tab System Implementation */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {/* Journey Tab Bar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {/* Journey Tabs */}
                  {sampleJourneys.map((journey) => (
                    <Box key={journey.id} sx={{ display: 'flex', alignItems: 'center' }}>
                      {/* Journey Tab */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: journey.id === 'journey-1' ? journey.color_code + '20' : 'transparent',
                          border: journey.id === 'journey-1' ? `2px solid ${journey.color_code}` : '2px solid transparent',
                          '&:hover': {
                            bgcolor: journey.color_code + '10',
                          },
                        }}
                      >
                        {/* Journey Icon */}
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: journey.color_code,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {journey.icon_letters}
                        </Box>

                        {/* Journey Title */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {journey.title}
                        </Typography>

                        {/* Close Button */}
                        <IconButton
                          size="small"
                          sx={{
                            ml: 0.5,
                            width: 20,
                            height: 20,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Navigation Menu Button */}
                      {journey.id === 'journey-1' && (
                        <Tooltip title="Journey Navigation Tree">
                          <IconButton
                            size="small"
                            onClick={(e) => handleJourneyMenuOpen(e, journey.id)}
                            sx={{
                              ml: 0.5,
                              color: journey.color_code,
                              '&:hover': { bgcolor: journey.color_code + '10' },
                            }}
                          >
                            <ExpandMore />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ))}

                  {/* Buyer Profile Management - Bulb Icon (Replaces Contextual Bar functionality) */}
                  <Tooltip title="Buyer Profile Management (AI-powered insights)">
                    <IconButton
                      size="medium"
                      sx={{
                        ml: 2,
                        bgcolor: 'warning.50',
                        border: '2px solid',
                        borderColor: 'warning.200',
                        color: 'warning.600',
                        '&:hover': {
                          bgcolor: 'warning.100',
                          borderColor: 'warning.400'
                        }
                      }}
                    >
                      <AutoAwesome sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Preview Content Area */}
                <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: 200 }}>
                  <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center', mt: 8 }}>
                    Journey Content Area
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
                    Active session content would display here
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Navigation Menu Preview */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: sampleJourneys[0].color_code, fontWeight: 600 }}>
                  Journey Navigation Tree
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {sampleJourneys[0].sessions.map((session, index) => {
                    const agent = getAgentInfo(session.scope);
                    const isActive = session.id === 'session-1';
                    const isExploration = session.scope === 'exploration';
                    
                    return (
                      <Box
                        key={session.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          gap: 1.5,
                          p: 1.5,
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: isActive ? `${agent.color}15` : 'transparent',
                          border: isActive ? `1px solid ${agent.color}` : '1px solid transparent',
                          '&:hover': {
                            bgcolor: `${agent.color}10`,
                          },
                        }}
                      >
                        {/* Hierarchy indicator */}
                        <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                          {isExploration ? (
                            <Circle sx={{ fontSize: 8, color: agent.color }} />
                          ) : (
                            <Timeline sx={{ fontSize: 12, color: agent.color, ml: 0.5 }} />
                          )}
                        </Box>

                        {/* Agent Avatar */}
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            border: `2px solid ${agent.color}`,
                            bgcolor: agent.color,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          {agent.name[0]}
                        </Avatar>

                        {/* Session Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, display: 'block' }}>
                            {isExploration ? 'Exploration Session' : session.session_purpose || `${agent.name} Session`}
                          </Typography>
                          
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            {isExploration 
                              ? `${Object.keys(sampleJourneys[0].search_criteria).length} active filters`
                              : session.session_purpose?.slice(0, 30) || 'Property Analysis'
                            }...
                          </Typography>
                        </Box>

                        {/* Active indicator */}
                        {isActive && (
                          <Chip
                            size="small"
                            label="Active"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              bgcolor: agent.color,
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>

            {/* Journey Features */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Journey System Integration
                </Typography>
                
                <Box sx={{ mt: 2, space: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 600, mb: 1 }}>
                    ❌ REPLACES:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, ml: 2 }}>
                    <Typography variant="body2">
                      • Current Contextual Bar (Grace/Isaac profiles, active filters)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, ml: 2 }}>
                    <Typography variant="body2">
                      • Current Session Chips (flat navigation)
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 600, mb: 1 }}>
                    ✅ INTEGRATES:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, ml: 2 }}>
                    <Circle sx={{ fontSize: 8, color: '#0d2b2c' }} />
                    <Typography variant="body2">
                      <strong>Journey-based navigation</strong> (one exploration root + drill/comparison nodes)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, ml: 2 }}>
                    <Timeline sx={{ fontSize: 14, color: '#2563eb' }} />
                    <Typography variant="body2">
                      <strong>Hierarchical session tree</strong> with agent avatars and session purposes
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, ml: 2 }}>
                    <Analytics sx={{ fontSize: 14, color: '#059669' }} />
                    <Typography variant="body2">
                      <strong>Dynamic journey titles</strong> from active search criteria
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, ml: 2 }}>
                    <AutoAwesome sx={{ fontSize: 14, color: '#ea580c' }} />
                    <Typography variant="body2">
                      <strong>Buyer profile management</strong> (💡 bulb icon functionality preserved)
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    <strong>Key:</strong> This is NOT the main app tab system (My Properties, Billing, etc.). 
                    This replaces the contextual bar and session navigation within the chat interface only.
                  </Typography>

                  <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', display: 'block', mt: 1 }}>
                    <strong>Left Nav Update:</strong> "Chats" → "My Journeys" with "New Journey" and "Journey Histories" submenus.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Interface Revamp Tab */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            🚀 Interface Revamp Preview
            <Chip label="NEW" color="primary" size="small" />
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Complete interface transformation from tab-based to journey-centric navigation system.
            This preview shows the new left navigation structure and URL-based routing approach.
          </Typography>

          <Grid container spacing={3}>
            {/* Journey-Centric Left Navigation Preview */}
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(31, 170, 188, 0.2)',
                  height: 'fit-content'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#0d2b2c', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Timeline fontSize="small" />
                  Journey Navigation System
                </Typography>
                
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  New left navigation structure replaces horizontal session tabs with hierarchical journey organization.
                </Typography>

                {/* Simulated Left Navigation */}
                <Box sx={{ 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2, 
                  p: 2, 
                  border: '1px solid #e2e8f0' 
                }}>
                  {/* Brand Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    pb: 2,
                    mb: 2,
                    borderBottom: '1px solid rgba(31, 170, 188, 0.1)'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0d2b2c' }}>
                      BANNER17
                    </Typography>
                  </Box>

                  {/* Journey Items */}
                  {[
                    {
                      id: 'journey-1',
                      title: 'Sydney Property Search',
                      color: '#0d2b2c',
                      icon: 'SP',
                      expanded: expandedJourneys.has('journey-1'),
                      sessions: [
                        { id: 'session-grace-1', agent: 'Grace', title: 'Near Sydney Opera House', context: '3bed ≤ $1M NSW', type: 'exploration' },
                        { id: 'session-isaac-1', agent: 'Isaac', title: 'Analysis: 123 Sussex St', context: '🏠 $950k • 3bed 2bath', type: 'property_drill' }
                      ]
                    },
                    {
                      id: 'journey-2', 
                      title: 'Melbourne Investigation',
                      color: '#059669',
                      icon: 'MI',
                      expanded: false,
                      sessions: []
                    },
                    {
                      id: 'journey-3',
                      title: 'Investment Options',
                      color: '#dc2626', 
                      icon: 'IO',
                      expanded: false,
                      sessions: []
                    }
                  ].map((journey) => (
                    <Box key={journey.id} sx={{ mb: 1 }}>
                      {/* Journey Header */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: journey.expanded ? `${journey.color}08` : 'transparent',
                          border: `1px solid ${journey.expanded ? journey.color + '30' : 'transparent'}`,
                          '&:hover': { bgcolor: `${journey.color}05` }
                        }}
                        onClick={() => {
                          const newExpanded = new Set(expandedJourneys);
                          if (journey.expanded) {
                            newExpanded.delete(journey.id);
                          } else {
                            newExpanded.add(journey.id);
                          }
                          setExpandedJourneys(newExpanded);
                        }}
                      >
                        {/* Journey Icon */}
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: journey.color,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            mr: 1.5
                          }}
                        >
                          {journey.icon}
                        </Avatar>

                        {/* Journey Title */}
                        <Typography
                          variant="body2"
                          sx={{ 
                            flex: 1,
                            fontWeight: 500,
                            fontSize: '0.85rem'
                          }}
                        >
                          {journey.title}
                        </Typography>

                        {/* Expand Icon */}
                        <ExpandMore 
                          sx={{ 
                            fontSize: 18,
                            color: 'text.secondary',
                            transform: journey.expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }} 
                        />
                      </Box>

                      {/* Sessions (when expanded) */}
                      {journey.expanded && (
                        <Box sx={{ ml: 2, mt: 0.5 }}>
                          {journey.sessions.map((session) => (
                            <Box
                              key={session.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                p: 1.5,
                                mb: 0.5,
                                borderRadius: 1,
                                cursor: 'pointer',
                                bgcolor: activeSession === session.id ? `${journey.color}15` : 'transparent',
                                border: `1px solid ${activeSession === session.id ? journey.color + '40' : 'transparent'}`,
                                '&:hover': { bgcolor: `${journey.color}08` }
                              }}
                              onClick={() => setActiveSession(session.id)}
                            >
                              {/* Agent Avatar */}
                              <Avatar
                                sx={{
                                  width: 20,
                                  height: 20,
                                  bgcolor: session.agent === 'Grace' ? '#0d2b2c' : '#7c3aed',
                                  fontSize: '0.65rem',
                                  fontWeight: 600
                                }}
                              >
                                {session.agent[0]}
                              </Avatar>

                              {/* Session Details */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                {/* Line 1: Session Title */}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {session.title}
                                </Typography>
                                
                                {/* Line 2: Context Summary */}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    color: 'text.secondary',
                                    display: 'block'
                                  }}
                                >
                                  {session.context}
                                </Typography>
                              </Box>

                              {/* Active Indicator */}
                              {activeSession === session.id && (
                                <Circle sx={{ fontSize: 6, color: journey.color, mt: 0.5 }} />
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}

                  {/* New Journey Button */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      mt: 2,
                      borderRadius: 1,
                      border: '1px solid rgba(31, 170, 188, 0.3)',
                      cursor: 'pointer',
                      color: '#0d2b2c',
                      '&:hover': { bgcolor: 'rgba(31, 170, 188, 0.04)' }
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{ 
                        color: 'inherit', 
                        mr: 1.5,
                        width: 24,
                        height: 24
                      }}
                    >
                      <AutoAwesome fontSize="small" />
                    </IconButton>
                    <Typography 
                      variant="body2" 
                      sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      New Journey
                    </Typography>
                  </Box>

                  {/* User Profile Menu (Bottom) */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(31, 170, 188, 0.1)' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid rgba(31, 170, 188, 0.2)',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(31, 170, 188, 0.05)' }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: '#0d2b2c',
                          fontSize: '0.7rem',
                          mr: 1
                        }}
                      >
                        U
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 500, display: 'block' }}>
                          User Menu
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                          Properties • Settings • Billing
                        </Typography>
                      </Box>
                      <ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Changes Summary */}
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  height: 'fit-content'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#22c55e', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  ✅ Key Changes Overview
                </Typography>

                <Box sx={{ mt: 2, space: 2 }}>
                  {[
                    {
                      title: "Journey-Centric Navigation",
                      desc: "Left nav becomes journey organizer with expandable session hierarchies",
                      icon: "🗺️"
                    },
                    {
                      title: "Remove Global Tabs",
                      desc: "No more horizontal tabs - direct URL routing to pages",
                      icon: "🗂️"
                    },
                    {
                      title: "User Profile Menu",
                      desc: "My Properties, Settings, Billing moved to bottom profile menu",
                      icon: "👤"
                    },
                    {
                      title: "Session Context Preview",
                      desc: "Two-line session display with agent avatars and context summaries",
                      icon: "📋"
                    },
                    {
                      title: "Grace-Isaac Workflow",
                      desc: "Seamless multi-agent handoff with journey session grouping",
                      icon: "🤝"
                    }
                  ].map((item, index) => (
                    <Box key={index} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '1.2rem' }}>{item.icon}</Typography>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" sx={{ 
                  color: 'text.secondary', 
                  fontStyle: 'italic',
                  display: 'block' 
                }}>
                  <strong>Architecture:</strong> Complete transformation from tab-based to journey-first navigation 
                  while preserving all existing functionality and agent handoff capabilities.
                </Typography>
              </Paper>
            </Grid>

            {/* Implementation Status */}
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(245, 101, 101, 0.2)',
                  height: 'fit-content'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#f56565', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  🚧 Implementation Plan
                </Typography>

                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Comprehensive development plan created with detailed technical specifications.
                </Typography>

                {[
                  { phase: "Phase 1: Foundation", status: "ready", desc: "Remove tab system, implement URL routing" },
                  { phase: "Phase 2: Journey Nav", status: "ready", desc: "Build journey navigator and session previews" },
                  { phase: "Phase 3: Profile Menu", status: "ready", desc: "Relocate user pages to profile dropdown" },
                  { phase: "Phase 4: Polish", status: "ready", desc: "Testing, optimization, and documentation" }
                ].map((phase, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={phase.status.toUpperCase()}
                        size="small"
                        color={phase.status === 'ready' ? 'success' : 'default'}
                        sx={{ fontSize: '0.6rem', fontWeight: 600 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {phase.phase}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1 }}>
                      {phase.desc}
                    </Typography>
                  </Box>
                ))}

                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    📋 Files Created:
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    • devplan/01_interface_revamp_comprehensive_plan.md<br/>
                    • Updated DesignPreview with component prototypes<br/>
                    • Ready for development with full specifications
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* URL Structure Preview */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#8b5cf6', 
                  fontWeight: 600,
                  mb: 3
                }}>
                  🔗 New URL Structure & Routing
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      Current (Tab-Based)
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: '#fee2e2', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                        /chat → Tab system with:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', display: 'block', ml: 2 }}>
                        • Chat Tab (active)<br/>
                        • My Properties Tab<br/>
                        • Usage & Billing Tab<br/>
                        • Settings Tab
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      New (URL-Based)
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                        /chat → Journey navigation<br/>
                        /my-properties → Direct page<br/>
                        /usage-billing → Direct page<br/>
                        /settings → Direct page<br/>
                        /design-preview → Existing<br/>
                        /chat-history → Existing
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 500 }}>
                    💡 Benefits: Clean URLs, better browser navigation, simplified state management, 
                    and elimination of complex tab system overhead.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
      </Container>
    </Box>
  );
};

export default DesignPreview;
