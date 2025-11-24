import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Popover,
  Paper,
  Stack,
  Divider,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import {
  SmartToy,
  Person,
  AutoAwesome,
  MoreHoriz,
  Close,
  Search,
  LocationOn,
  AttachMoney,
  Home,
  Bed,
  Bathtub,
  FilterList,
  Timeline,
  Edit,
  HomeWork,
  EmojiObjects,
  Menu as MenuIcon
} from '@mui/icons-material';
import type { BuyerProfile } from '../../services/buyerProfileService';
import { SessionScope } from '../../types/sessionTypes';
import type { SessionMetrics } from './CompactSessionInfo';

interface ActiveFilters {
  [key: string]: any;
}

interface ContextualBarProps {
  sessionScope: SessionScope;
  activeFilters: ActiveFilters;
  buyerProfile?: BuyerProfile;
  onBuyerProfileUpdate: (profile: BuyerProfile) => void;
  onRefreshBuyerProfile: () => void;
  // Session activity props (moved from header)
  sessionMetrics?: SessionMetrics;
  onEditSessionName?: (newName: string) => void;
  messages?: Array<{
    id: string;
    type: 'user' | 'ai' | 'system' | 'error';
    timestamp: Date;
    langGraphExecution?: {
      total_tokens_in: number;
      total_tokens_out: number;
      total_estimated_cost: number;
    };
  }>;
}

interface AgentInfo {
  name: string;
  title: string;
  avatar: string;
  description: string;
  capabilities: string[];
  limitations: string[];
}

// LLM-driven agent configurations
const AGENT_CONFIG: Record<string, AgentInfo> = {
  'exploration': {
    name: 'Grace',
    title: 'Property Exploration Assistant',
    avatar: '/px-grace.png',
    description: 'Grace specializes in helping you discover the perfect property by understanding your needs and progressively refining your search criteria.',
    capabilities: [
      '🔍 Intelligent property discovery based on your lifestyle and budget',
      '🗺️ Location-aware search with proximity to amenities you care about',
      '💰 Budget optimization and market insights',
      '📊 Progressive filter refinement to narrow down your ideal home',
      '🎯 Personalized recommendations based on your buyer profile',
      '📍 Spatial search near schools, hospitals, transport, and shopping'
    ],
    limitations: [
      '📋 Focused on exploration - for detailed property analysis, we can switch to drill mode',
      '🏠 Works with available property listings - some off-market properties may not be included',
      '📍 Location data accuracy depends on property listing information'
    ]
  },
  'property_drill': {
    name: 'Isaac',
    title: 'Property Analysis Specialist',
    avatar: '/px-isaac.png',
    description: 'Isaac is a meticulous property analyst who provides comprehensive, data-driven insights about specific properties. He combines listing information with real-time market research to give you the complete picture.',
    capabilities: [
      '🏠 Comprehensive property profile creation with all available details',
      '🔍 Real-time web research for up-to-date market information',
      '📍 Detailed neighborhood analysis and local amenity insights',
      '💰 Investment analysis including rental potential and growth projections',
      '🏘️ Market positioning and comparable property analysis',
      '📊 Property history, price trends, and market context',
      '🔧 Property condition insights and potential renovation considerations',
      '🎯 Personalized analysis based on your buyer profile and preferences'
    ],
    limitations: [
      '🎯 Focused on single property deep analysis - for exploration, return to Grace',
      '🌐 Analysis quality depends on available online information and listing details',
      '📊 Some insights may require physical property inspection to confirm',
      '⏰ Comprehensive analysis takes time for thoroughness and accuracy'
    ]
  },
  'comparison': {
    name: 'Sofia',
    title: 'Property Comparison Expert',
    avatar: '/px-grace.png', // Will be different avatar later
    description: 'Sofia helps you compare multiple properties side-by-side with weighted analysis based on your priorities and decision criteria.',
    capabilities: [
      '⚖️ Side-by-side property comparison with scoring',
      '🎯 Decision matrix based on your priorities',
      '💡 Trade-off analysis and recommendation guidance',
      '📊 Financial comparison across multiple properties',
      '🗺️ Location comparison and accessibility analysis',
      '🏆 Clear recommendations with reasoning'
    ],
    limitations: [
      '📋 Best with 2-4 properties - too many can be overwhelming',
      '🎯 Requires clear priorities to provide meaningful comparisons',
      '📊 Comparison quality depends on available property data'
    ]
  }
};

const FILTER_ICONS: Record<string, React.ReactElement> = {
  'states': <LocationOn sx={{ fontSize: 14 }} />,
  'location': <LocationOn sx={{ fontSize: 14 }} />,
  'price': <AttachMoney sx={{ fontSize: 14 }} />,
  'price_max': <AttachMoney sx={{ fontSize: 14 }} />,
  'price_min': <AttachMoney sx={{ fontSize: 14 }} />,
  'property_type': <Home sx={{ fontSize: 14 }} />,
  'property_types': <Home sx={{ fontSize: 14 }} />,
  'bedrooms': <Bed sx={{ fontSize: 14 }} />,
  'bedrooms_min': <Bed sx={{ fontSize: 14 }} />,
  'bathrooms': <Bathtub sx={{ fontSize: 14 }} />,
  'bathrooms_min': <Bathtub sx={{ fontSize: 14 }} />,
  'near_address': <Search sx={{ fontSize: 14 }} />,
  'radius_km': <Search sx={{ fontSize: 14 }} />
};

const ContextualBar: React.FC<ContextualBarProps> = ({
  sessionScope,
  activeFilters,
  buyerProfile,
  onBuyerProfileUpdate,
  onRefreshBuyerProfile,
  sessionMetrics,
  onEditSessionName,
  messages = []
}) => {
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [showBuyerProfileDialog, setShowBuyerProfileDialog] = useState(false);
  const [showSessionActivityDialog, setShowSessionActivityDialog] = useState(false);
  const [overflowAnchor, setOverflowAnchor] = useState<HTMLElement | null>(null);
  const [activeFiltersAnchor, setActiveFiltersAnchor] = useState<HTMLElement | null>(null);
  const [bulbMenuAnchor, setBulbMenuAnchor] = useState<HTMLElement | null>(null);
  
  const agent = AGENT_CONFIG[sessionScope.toLowerCase()] || AGENT_CONFIG['exploration'];

  // Convert active filters to display format
  const formatFilterValue = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'number') {
      if (key.includes('price')) {
        return value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : `$${(value / 1000).toFixed(0)}K`;
      }
      if (key.includes('radius')) {
        return `${value}km`;
      }
      return value.toString();
    }
    if (typeof value === 'string' && key === 'near_address') {
      return `Within ${activeFilters.radius_km || 5}km of ${value}`;
    }
    return String(value);
  };

  const formatFilterKey = (key: string): string => {
    const keyMap: Record<string, string> = {
      'states': 'Location',
      'location': 'Location', 
      'price_max': 'Price',
      'price_min': 'Min Price',
      'property_types': 'Type',
      'property_type': 'Type',
      'bedrooms_min': 'Bedrooms',
      'bathrooms_min': 'Bathrooms',
      'near_address': 'Location',
      'radius_km': 'Radius'
    };
    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Process filters for display
  const displayFilters = Object.entries(activeFilters || {})
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .filter(([key]) => key !== 'limit' && key !== 'offset') // Exclude technical params
    .map(([key, value]) => ({
      key,
      displayKey: formatFilterKey(key),
      displayValue: formatFilterValue(key, value),
      icon: FILTER_ICONS[key] || <Search sx={{ fontSize: 14 }} />
    }));

  // Show first 3 filters, rest in overflow
  const visibleFilters = displayFilters.slice(0, 3);
  const overflowFilters = displayFilters.slice(3);

  const handleOverflowClick = (event: React.MouseEvent<HTMLElement>) => {
    setOverflowAnchor(event.currentTarget);
  };

  const handleActiveFiltersClick = (event: React.MouseEvent<HTMLElement>) => {
    setActiveFiltersAnchor(event.currentTarget);
  };

  const handleActiveFiltersClose = () => {
    setActiveFiltersAnchor(null);
  };

  const handleOverflowClose = () => {
    setOverflowAnchor(null);
  };

  return (
    <>
      {/* Contextual Bar - Full Width Background */}
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 0,
          borderBottom: '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: subtle brand border
          minHeight: '64px',
          maxHeight: '64px',
          bgcolor: 'transparent', // SLEEK: transparent background instead of gradient
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%'
        }}
      >
        {/* Inner Content Container with width constraint */}
        <Box sx={{
          maxWidth: '1200px', // Same as chat messages area
          mx: 'auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2, 
          py: 1,
          minHeight: '64px',
          overflow: 'hidden'
        }}>
        {/* Left Section: Agent Avatar with Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: '0 0 auto', gap: 1.5 }}>
          <Tooltip title={`Chat with ${agent.name} - ${agent.title}`}>
            <IconButton 
              onClick={() => setShowAgentDialog(true)}
              sx={{ p: 0 }}
            >
              <Avatar 
                src={agent.avatar} 
                alt={agent.name}
                sx={{ width: 36, height: 36 }}
              />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 600, 
              fontSize: '0.875rem',
              color: '#1f2937',
              lineHeight: 1.2
            }}>
              {agent.name}
            </Typography>
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem',
              color: '#6b7280',
              lineHeight: 1
            }}>
              {agent.title}
            </Typography>
          </Box>
        </Box>

        {/* Center Section: Spacer */}
        <Box sx={{ flex: '1 1 auto' }} />

        {/* Right Section: Consolidated Smart Assistant Dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 auto' }}>
          {/* Smart Assistant Bulb Dropdown */}
          <Tooltip title="Smart Assistant - Quick Access">
            <IconButton
              onClick={(e) => setBulbMenuAnchor(e.currentTarget)}
              sx={{ 
                p: 0,
                bgcolor: 'transparent',
                border: '1px solid rgba(31, 170, 188, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(31, 170, 188, 0.05)',
                  border: '1px solid rgba(31, 170, 188, 0.3)'
                }
              }}
            >
              <Avatar 
                alt="Smart Assistant"
                sx={{ 
                  width: 34, 
                  height: 34, 
                  background: 'linear-gradient(135deg, #ff9800, #ffc107)', // Warm bulb gradient
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
                }}
              >
                <EmojiObjects sx={{ fontSize: 19 }} />
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Bulb Dropdown Menu */}
          <Menu
            anchorEl={bulbMenuAnchor}
            open={Boolean(bulbMenuAnchor)}
            onClose={() => setBulbMenuAnchor(null)}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 320,
                maxWidth: 380,
                borderRadius: 2,
                border: '1px solid rgba(31, 170, 188, 0.15)',
                bgcolor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(31, 170, 188, 0.12)'
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* Session Description Header */}
            <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid rgba(31, 170, 188, 0.1)' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0d2b2c', mb: 0.5 }}>
                {sessionScope.toLowerCase() === 'exploration' ? 'Property Exploration Session' : 
                 sessionScope.toLowerCase() === 'property_drill' ? 'Property Deep Dive Session' : 
                 sessionScope.toLowerCase() === 'comparison' ? 'Property Comparison Session' : 
                 'Property Session'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {agent.description}
              </Typography>
            </Box>

            {/* Active Search Criteria - Direct Display */}
            {sessionScope.toLowerCase() === 'exploration' && displayFilters.length > 0 && (
              <Box sx={{ p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FilterList sx={{ fontSize: 16, color: '#0d2b2c' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Search Criteria
                  </Typography>
                  <Badge
                    badgeContent={displayFilters.length}
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        minWidth: '14px',
                        height: '14px'
                      }
                    }}
                  />
                </Box>
                <Stack spacing={0.5}>
                  {displayFilters.slice(0, 4).map((filter) => (
                    <Box key={filter.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {filter.key}:
                      </Typography>
                      <Chip 
                        label={filter.displayValue} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.65rem', 
                          height: '20px',
                          bgcolor: 'rgba(31, 170, 188, 0.08)',
                          color: '#0d2b2c'
                        }} 
                      />
                    </Box>
                  ))}
                  {displayFilters.length > 4 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      +{displayFilters.length - 4} more filters
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}

            {/* Buyer Profile - Direct Display */}
            <Box sx={{ p: 2, borderTop: displayFilters.length > 0 ? '1px solid rgba(31, 170, 188, 0.05)' : 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeWork sx={{ fontSize: 16, color: '#0d2b2c' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Buyer Profile
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    setBulbMenuAnchor(null);
                    setShowBuyerProfileDialog(true);
                  }}
                  sx={{
                    fontSize: '0.7rem',
                    py: 0.5,
                    px: 1,
                    minWidth: 'auto',
                    borderColor: 'rgba(31, 170, 188, 0.3)',
                    color: '#0d2b2c',
                    '&:hover': {
                      borderColor: 'rgba(31, 170, 188, 0.5)',
                      bgcolor: 'rgba(31, 170, 188, 0.05)'
                    }
                  }}
                >
                  Edit
                </Button>
              </Box>
              
              {/* Profile Summary */}
              <Box sx={{ pl: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  {buyerProfile?.life_stage 
                    ? `${buyerProfile.life_stage} • ${buyerProfile?.timeline || 'Timeline not set'} • ${buyerProfile?.risk_tolerance || 'Risk tolerance not set'}` 
                    : 'Profile not configured - click Edit to set your preferences'}
                </Typography>
              </Box>
            </Box>

            {/* Session Stats - Subtle Link */}
            {sessionMetrics && (
              <Box sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(31, 170, 188, 0.05)' }}>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<Timeline sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    setBulbMenuAnchor(null);
                    setShowSessionActivityDialog(true);
                  }}
                  sx={{
                    fontSize: '0.7rem',
                    color: 'rgba(156, 163, 175, 0.8)',
                    textTransform: 'none',
                    py: 0.5,
                    justifyContent: 'flex-start',
                    '&:hover': {
                      color: 'rgba(31, 170, 188, 0.8)',
                      bgcolor: 'rgba(31, 170, 188, 0.03)'
                    }
                  }}
                >
                  View session stats & metrics
                </Button>
              </Box>
            )}
          </Menu>
        </Box>
        </Box>
      </Paper>

      {/* Grace's Handwritten Resume - Physical Paper Style */}
      <Dialog
        open={showAgentDialog}
        onClose={() => setShowAgentDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#fefcf0', // Cream paper color
            backgroundImage: `
              radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,0.3) 21%, rgba(255,255,255,0.3) 34%, transparent 35%, transparent),
              linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 76%, transparent 77%, transparent),
              radial-gradient(circle at 50% 100%, rgba(240,240,235,0.4) 0%, transparent 50%)
            `, // Paper texture
            color: '#2c1810', // Dark brown ink color
            borderRadius: 2,
            border: '1px solid #e8d5b7', // Paper edge color
            boxShadow: '0 20px 60px rgba(44, 24, 16, 0.15), 0 8px 24px rgba(44, 24, 16, 0.1)', // Paper shadow
            maxHeight: '90vh',
            transform: 'rotate(-0.5deg)', // Slight paper rotation for authenticity
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(transparent, transparent 24px, rgba(44, 24, 16, 0.03) 25px)', // Ruled paper lines
              pointerEvents: 'none'
            }
          }
        }}
        BackdropProps={{
          sx: {
            bgcolor: 'rgba(139, 119, 101, 0.15)', // Warm brown backdrop
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        {/* Handwritten Resume Header */}
        <Box sx={{ 
          p: 5, 
          position: 'relative',
          zIndex: 2 // Above ruled lines
        }}>
          {/* Close Button - styled like paper clip */}
          <IconButton
            onClick={() => setShowAgentDialog(false)}
            sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#8b6f47',
              bgcolor: '#f0e6d2',
              border: '2px solid #d4c4a8',
              width: 32,
              height: 32,
              '&:hover': { 
                bgcolor: '#e8dcc4',
                transform: 'rotate(5deg)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>

          {/* Header with photo and name */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4, mb: 4 }}>
            <Avatar 
              src={agent.avatar} 
              alt={agent.name} 
              sx={{ 
                width: 120, 
                height: 120,
                border: '3px solid #d4c4a8',
                borderRadius: 2, // Less circular for a photo look
                boxShadow: '4px 4px 12px rgba(44, 24, 16, 0.2)',
                transform: 'rotate(-2deg)'
              }} 
            />
            <Box sx={{ flex: 1, mt: 2 }}>
              <Typography sx={{ 
                fontFamily: '"Kalam", cursive', // Handwriting font
                fontSize: '2.8rem',
                fontWeight: 700,
                color: '#2c1810',
                mb: 1,
                textShadow: '1px 1px 2px rgba(44, 24, 16, 0.1)',
                transform: 'rotate(-1deg)',
                display: 'inline-block'
              }}>
                {agent.name}
              </Typography>
              <Typography sx={{ 
                fontFamily: '"Kalam", cursive',
                fontSize: '1.6rem',
                fontWeight: 500,
                color: '#8b6f47',
                mb: 2,
                fontStyle: 'italic',
                transform: 'rotate(0.5deg)',
                display: 'inline-block'
              }}>
                {agent.title}
              </Typography>
              <Typography sx={{ 
                fontFamily: '"Kalam", cursive',
                fontSize: '1.2rem',
                color: '#5d4e37',
                fontStyle: 'italic'
              }}>
                ✨ Your AI Property Guide at Banner17 ✨
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: 5, pb: 3, position: 'relative', zIndex: 2 }}>
          {/* About Me Section - handwritten style */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ 
              fontFamily: '"Kalam", cursive',
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#2c1810',
              mb: 3,
              textDecoration: 'underline',
              textDecorationColor: '#d4c4a8',
              textDecorationThickness: '2px',
              transform: 'rotate(-0.5deg)',
              display: 'inline-block'
            }}>
              About Me 💫
            </Typography>
            <Typography sx={{ 
              fontFamily: '"Kalam", cursive',
              fontSize: '1.1rem',
              color: '#2c1810',
              lineHeight: 1.8,
              fontWeight: 500,
              mb: 2
            }}>
              {agent.description}
            </Typography>
          </Box>

          {/* What I Can Help With - handwritten list */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ 
              fontFamily: '"Kalam", cursive',
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#2c1810',
              mb: 3,
              textDecoration: 'underline',
              textDecorationColor: '#d4c4a8',
              textDecorationThickness: '2px',
              transform: 'rotate(0.5deg)',
              display: 'inline-block'
            }}>
              What I Can Help You With 🏠
            </Typography>
            <Stack spacing={1.5}>
              {agent.capabilities.map((capability, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2,
                  transform: `rotate(${(index % 2 === 0) ? '-0.3deg' : '0.3deg'})`
                }}>
                  <Typography sx={{
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.2rem',
                    color: '#8b6f47',
                    fontWeight: 600,
                    minWidth: 'auto'
                  }}>
                    •
                  </Typography>
                  <Typography sx={{ 
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.05rem',
                    color: '#2c1810',
                    lineHeight: 1.6,
                    fontWeight: 500
                  }}>
                    {capability}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Important Notes - handwritten style */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ 
              fontFamily: '"Kalam", cursive',
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#2c1810',
              mb: 3,
              textDecoration: 'underline',
              textDecorationColor: '#d4c4a8',
              textDecorationThickness: '2px',
              transform: 'rotate(-0.5deg)',
              display: 'inline-block'
            }}>
              Important Notes 📝
            </Typography>
            <Stack spacing={1.5}>
              {agent.limitations.map((limitation, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2,
                  transform: `rotate(${(index % 2 === 0) ? '0.2deg' : '-0.2deg'})`
                }}>
                  <Typography sx={{
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.2rem',
                    color: '#d2691e',
                    fontWeight: 600,
                    minWidth: 'auto'
                  }}>
                    *
                  </Typography>
                  <Typography sx={{ 
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.05rem',
                    color: '#5d4e37',
                    lineHeight: 1.6,
                    fontWeight: 500,
                    fontStyle: 'italic'
                  }}>
                    {limitation}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Handwritten signature */}
          <Box sx={{ 
            pt: 3, 
            borderTop: '1px dashed #d4c4a8',
            textAlign: 'right' 
          }}>
            <Typography sx={{ 
              fontFamily: '"Kalam", cursive',
              fontSize: '1.4rem',
              color: '#8b6f47',
              fontStyle: 'italic',
              transform: 'rotate(1deg)',
              display: 'inline-block'
            }}>
              Happy to help! 😊
            </Typography>
            <Typography sx={{ 
              fontFamily: '"Kalam", cursive',
              fontSize: '2rem',
              color: '#2c1810',
              fontWeight: 600,
              transform: 'rotate(-2deg)',
              display: 'block',
              mt: 1
            }}>
              - {agent.name} ✨
            </Typography>
          </Box>
        </Box>


      </Dialog>

      {/* Buyer Profile Dialog */}
      <Dialog
        open={showBuyerProfileDialog}
        onClose={() => setShowBuyerProfileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Your Buyer Profile</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<AutoAwesome />}
              variant="outlined"
              size="small"
              onClick={onRefreshBuyerProfile}
              sx={{ 
                background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                color: 'white',
                border: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #f57000, #ff9800)',
                  border: 'none'
                }
              }}
            >
              Refresh (AI)
            </Button>
            <IconButton onClick={() => setShowBuyerProfileDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            This is what {agent.name} understands about your property preferences based on our conversation:
          </Typography>
          
          {buyerProfile ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Life Stage</Typography>
                <Chip 
                  label={buyerProfile?.life_stage ? buyerProfile.life_stage.replace('_', ' ').toUpperCase() : 'NOT SET'} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Timeline</Typography>
                <Chip 
                  label={buyerProfile?.timeline ? buyerProfile.timeline.replace('_', ' ').toUpperCase() : 'NOT SET'} 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Risk Tolerance</Typography>
                <Chip 
                  label={buyerProfile?.risk_tolerance ? buyerProfile.risk_tolerance.toUpperCase() : 'NOT SET'} 
                  color="success" 
                  variant="outlined"
                />
              </Box>

              {buyerProfile?.property_priorities?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Property Priorities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {buyerProfile.property_priorities?.map((priority: string, index: number) => (
                      <Chip 
                        key={index}
                        label={priority} 
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {buyerProfile?.location_priorities?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Location Priorities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {buyerProfile.location_priorities?.map((priority: string, index: number) => (
                      <Chip 
                        key={index}
                        label={priority} 
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              {agent.name} is still learning about your preferences. Continue chatting to help build your buyer profile!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBuyerProfileDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Activity Dialog (moved from header CompactSessionInfo) */}
      {sessionMetrics && (
        <Dialog
          open={showSessionActivityDialog}
          onClose={() => setShowSessionActivityDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid rgba(31, 170, 188, 0.2)', // SLEEK: subtle brand border
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 1
          }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Timeline sx={{ color: '#0d2b2c', fontSize: 20 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d2b2c' }}>
                  {sessionMetrics.sessionName || 'Current Session'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Session Activity & Metrics
                </Typography>
              </Box>
            </Box>
            {onEditSessionName && (
              <Tooltip title="Edit session name">
                <IconButton size="small" onClick={() => {
                  // For now, we'll create a simple prompt. This can be enhanced later.
                  const newName = prompt('Enter new session name:', sessionMetrics.sessionName || 'New Chat');
                  if (newName && newName.trim()) {
                    onEditSessionName(newName.trim());
                  }
                }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={() => setShowSessionActivityDialog(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {/* Session Metrics - Similar to CompactSessionInfo content */}
            <Stack spacing={2}>
              {/* Tokens */}
              {((parseInt(sessionMetrics.totalInputTokens) || 0) + (parseInt(sessionMetrics.totalOutputTokens) || 0)) > 0 && (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: '#0d2b2c',
                      mr: 1
                    }} />
                    <Typography variant="body2" color="text.secondary">
                      Total Tokens
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight="bold" color="#0d2b2c">
                      {((parseInt(sessionMetrics.totalInputTokens) || 0) + (parseInt(sessionMetrics.totalOutputTokens) || 0)).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {parseInt(sessionMetrics.totalInputTokens).toLocaleString()} in • {parseInt(sessionMetrics.totalOutputTokens).toLocaleString()} out
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Cost */}
              {parseFloat(sessionMetrics.totalCreditsUsed) > 0 && (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: '#4caf50',
                      mr: 1
                    }} />
                    <Typography variant="body2" color="text.secondary">
                      Session Cost
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" color="#4caf50">
                    ${parseFloat(sessionMetrics.totalCreditsUsed).toFixed(3)}
                  </Typography>
                </Box>
              )}

              {/* Tools Used */}
              {Object.values(sessionMetrics.toolsUsed).reduce((sum, count) => sum + count, 0) > 0 && (
                <Box>
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: '#ff9800',
                      mr: 1
                    }} />
                    <Typography variant="body2" color="text.secondary">
                      Tools Used ({Object.values(sessionMetrics.toolsUsed).reduce((sum, count) => sum + count, 0)})
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {Object.entries(sessionMetrics.toolsUsed).map(([tool, count]) => (
                      count > 0 && (
                        <Chip
                          key={tool}
                          label={`${tool} (${count})`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 24,
                            color: '#ff9800',
                            borderColor: '#ff9800'
                          }}
                        />
                      )
                    ))}
                  </Box>
                </Box>
              )}

              {/* Empty state */}
              {((parseInt(sessionMetrics.totalInputTokens) || 0) + (parseInt(sessionMetrics.totalOutputTokens) || 0)) === 0 && 
               parseFloat(sessionMetrics.totalCreditsUsed) === 0 && 
               Object.values(sessionMetrics.toolsUsed).reduce((sum, count) => sum + count, 0) === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2} fontStyle="italic">
                  No activity yet in this session
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSessionActivityDialog(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Active Filters Dropdown */}
      <Popover
        open={Boolean(activeFiltersAnchor)}
        anchorEl={activeFiltersAnchor}
        onClose={handleActiveFiltersClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        elevation={8}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: 2,
            mt: 1
          }
        }}
      >
        <Paper sx={{ minWidth: 280, maxWidth: 400 }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.50',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600,
              color: 'primary.dark',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <FilterList sx={{ fontSize: 18 }} />
              Active Filters ({displayFilters.length})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Current search criteria for this exploration session
            </Typography>
          </Box>
          
          <List sx={{ py: 0 }}>
            {displayFilters.map((filter, index) => (
              <ListItem 
                key={filter.key}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  borderBottom: index < displayFilters.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {filter.icon}
                </ListItemIcon>
                <ListItemText
                  primary={filter.displayKey}
                  secondary={filter.displayValue}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                  secondaryTypographyProps={{
                    variant: 'body2',
                    color: 'primary.dark',
                    fontWeight: 600
                  }}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.50',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontStyle: 'italic'
            }}>
              These filters will apply to all property searches in this session. 
              Say "clear all filters" to start fresh.
            </Typography>
          </Box>
        </Paper>
      </Popover>

      {/* Overflow Filters Popover */}
      <Popover
        open={Boolean(overflowAnchor)}
        anchorEl={overflowAnchor}
        onClose={handleOverflowClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Additional Filters
          </Typography>
          <Stack spacing={0.5}>
            {overflowFilters.map((filter) => (
              <Chip
                key={filter.key}
                icon={filter.icon}
                label={`${filter.displayKey}: ${filter.displayValue}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem',
                  justifyContent: 'flex-start',
                  bgcolor: 'primary.50',
                  color: 'primary.dark',
                  borderColor: 'primary.200'
                }}
              />
            ))}
          </Stack>
        </Paper>
      </Popover>
    </>
  );
};

export default ContextualBar;
