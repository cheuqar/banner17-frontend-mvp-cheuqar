/**
 * JourneyTabSystem - Revolutionary navigation system replacing contextual bar
 * 
 * Features:
 * - Journey tabs with unique colors and icons
 * - Agent navigation within journeys (Grace → Isaac → Marcus)
 * - Buyer profile management integration
 * - Session switching and management
 * - Real-time journey updates
 * 
 * Architecture:
 * - One Journey = One Tab
 * - One Journey = One Exploration Session (root) + Multiple drill/comparison sessions
 * - Agent avatars in horizontal dropdown for session navigation
 * 
 * Created: September 4, 2025
 * Replaces: ContextualBar system
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Chip,
  Button,
  Tooltip,
  Badge,
  CircularProgress,
  Alert,
  Divider,
  ListItemIcon,
  ListItemText,
  Popover,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  Circle as CircleIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import { type BuyerProfile } from '../../services/buyerProfileService';
import { useAuth } from '../../contexts/AuthContext';

// Types
interface Journey {
  id: string;
  title: string;
  icon_letters: string;
  color_code: string;
  status: string;
  exploration_session_id: string;
  active_session_id?: string;
  session_count: number;
  last_activity_at: string;
  created_at: string;
  search_criteria?: Record<string, any>;
}

interface NavigationNode {
  session_id: string;
  session_type: 'exploration' | 'property_drill' | 'comparison';
  agent_name: string;
  agent_role: string;
  agent_avatar: string;
  is_active: boolean;
  created_at: string;
  children?: NavigationNode[];
}

interface NavigationTree {
  journey_id: string;
  journey_title: string;
  journey_icon: string;
  journey_color: string;
  active_session_id?: string;
  navigation_nodes: NavigationNode[];
}


interface JourneyTabSystemProps {
  currentSessionId?: string;
  onSessionSwitch: (sessionId: string, journeyId: string) => void;
  onNewJourney: () => void;
  onBuyerProfileUpdate: (profile: BuyerProfile) => void;
  buyerProfile?: BuyerProfile;
  refreshNavigationTreeTrigger?: number; // NEW: Counter that triggers navigation tree refresh when incremented
}

const JourneyTabSystem: React.FC<JourneyTabSystemProps> = ({
  currentSessionId,
  onSessionSwitch,
  onNewJourney,
  onBuyerProfileUpdate,
  buyerProfile,
  refreshNavigationTreeTrigger
}) => {
  const theme = useTheme();
  const { session } = useAuth(); // Get authentication session for API calls
  
  // API Configuration
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
  
  // State management
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [navigationTrees, setNavigationTrees] = useState<Record<string, NavigationTree>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Menu states
  const [agentMenuAnchor, setAgentMenuAnchor] = useState<HTMLElement | null>(null);
  const [buyerProfileAnchor, setBuyerProfileAnchor] = useState<HTMLElement | null>(null);
  const [activeMenuJourney, setActiveMenuJourney] = useState<string | null>(null);
  
  // Session details dialog states
  const [sessionDetailsAnchor, setSessionDetailsAnchor] = useState<HTMLElement | null>(null);
  const [activeSessionDetails, setActiveSessionDetails] = useState<NavigationNode | null>(null);

  // ==========================================
  // DATA FETCHING AND MANAGEMENT
  // ==========================================

  const fetchUserJourneys = useCallback(async () => {
    if (!session?.access_token) {
      console.warn('❌ [JourneyTabSystem] No authentication token available');
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${baseUrl}/api/v1/journeys/`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch journeys: ${response.statusText}`);
      }
      
      const journeyData = await response.json();
      setJourneys(journeyData);
      
      // Set active journey based on current session
      if (currentSessionId && journeyData.length > 0) {
        const currentJourney = journeyData.find((journey: Journey) => 
          journey.exploration_session_id === currentSessionId ||
          journey.active_session_id === currentSessionId
        );
        if (currentJourney) {
          setActiveJourneyId(currentJourney.id);
        } else {
          setActiveJourneyId(journeyData[0].id); // Default to first journey
        }
      }
      
      console.log('✅ [JourneyTabSystem] Loaded journeys:', journeyData.length);
    } catch (error) {
      console.error('❌ [JourneyTabSystem] Error fetching journeys:', error);
      setError(error instanceof Error ? error.message : 'Failed to load journeys');
    } finally {
      setLoading(false);
    }
  }, [currentSessionId, session?.access_token, baseUrl]);

  const fetchNavigationTree = useCallback(async (journeyId: string) => {
    if (!session?.access_token) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/journeys/${journeyId}/navigation-tree`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch navigation tree: ${response.statusText}`);
      }
      
      const treeData = await response.json();
      setNavigationTrees(prev => ({
        ...prev,
        [journeyId]: treeData
      }));
      
      console.log(`✅ [JourneyTabSystem] Loaded navigation tree for journey ${journeyId}`);
    } catch (error) {
      console.error(`❌ [JourneyTabSystem] Error fetching navigation tree:`, error);
    }
  }, [session?.access_token, baseUrl]);

  // NEW: Function to refresh navigation tree for the active journey
  const refreshActiveNavigationTree = useCallback(() => {
    if (activeJourneyId && activeJourneyId !== '__new__') {
      console.log('🔄 [JourneyTabSystem] Refreshing navigation tree for active journey:', activeJourneyId);
      // Clear the cached navigation tree first, then refetch
      setNavigationTrees(prev => {
        const updated = { ...prev };
        delete updated[activeJourneyId];
        return updated;
      });
      fetchNavigationTree(activeJourneyId);
    }
  }, [activeJourneyId, fetchNavigationTree]);

  const updateJourneyTitle = useCallback(async (
    journeyId: string, 
    searchCriteria?: any, 
    resultCount?: number
  ) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/journeys/${journeyId}/title`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search_criteria: searchCriteria,
          result_count: resultCount
        })
      });
      
      if (response.ok) {
        // Refresh journeys to get updated title
        await fetchUserJourneys();
        console.log('✅ [JourneyTabSystem] Journey title updated');
      }
    } catch (error) {
      console.error('❌ [JourneyTabSystem] Error updating journey title:', error);
    }
  }, [fetchUserJourneys, session?.access_token, baseUrl]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    // Handle special "__new__" tab case
    if (newValue === '__new__') {
      setActiveJourneyId('__new__');
      onNewJourney();
      return;
    }
    
    setActiveJourneyId(newValue);
    
    // Switch to the journey's active session
    const journey = journeys.find(j => j.id === newValue);
    if (journey) {
      const sessionId = journey.active_session_id || journey.exploration_session_id;
      onSessionSwitch(sessionId, newValue);
    }
  }, [journeys, onSessionSwitch, onNewJourney]);

  const handleAgentMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, journeyId: string) => {
    event.stopPropagation();
    setAgentMenuAnchor(event.currentTarget);
    setActiveMenuJourney(journeyId);
    
    // Load navigation tree if not already loaded
    if (!navigationTrees[journeyId]) {
      fetchNavigationTree(journeyId);
    }
  }, [navigationTrees, fetchNavigationTree]);

  const handleAgentMenuClose = useCallback(() => {
    setAgentMenuAnchor(null);
    setActiveMenuJourney(null);
  }, []);

  const handleSessionSwitch = useCallback((sessionId: string, journeyId: string) => {
    handleAgentMenuClose();
    onSessionSwitch(sessionId, journeyId);
  }, [onSessionSwitch, handleAgentMenuClose]);

  const handleBuyerProfileOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setBuyerProfileAnchor(event.currentTarget);
  }, []);

  const handleBuyerProfileClose = useCallback(() => {
    setBuyerProfileAnchor(null);
  }, []);

  const handleSessionDetailsOpen = useCallback((event: React.MouseEvent<HTMLElement>, node: NavigationNode) => {
    event.stopPropagation();
    setSessionDetailsAnchor(event.currentTarget);
    setActiveSessionDetails(node);
  }, []);

  const handleSessionDetailsClose = useCallback(() => {
    setSessionDetailsAnchor(null);
    setActiveSessionDetails(null);
  }, []);

  const handleResumeSession = useCallback((sessionId: string, journeyId: string) => {
    handleSessionDetailsClose();
    onSessionSwitch(sessionId, journeyId);
  }, [onSessionSwitch, handleSessionDetailsClose]);

  const handleCloseJourney = useCallback(async (journeyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/journeys/${journeyId}?archive_only=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Remove from local state
        setJourneys(prev => prev.filter(j => j.id !== journeyId));
        
        // If this was the active journey, switch to another
        if (activeJourneyId === journeyId) {
          const remainingJourneys = journeys.filter(j => j.id !== journeyId);
          if (remainingJourneys.length > 0) {
            setActiveJourneyId(remainingJourneys[0].id);
            onSessionSwitch(remainingJourneys[0].active_session_id || remainingJourneys[0].exploration_session_id, remainingJourneys[0].id);
          } else {
            onNewJourney(); // Create new journey if none left
          }
        }
        
        console.log('✅ [JourneyTabSystem] Journey archived');
      }
    } catch (error) {
      console.error('❌ [JourneyTabSystem] Error archiving journey:', error);
    }
  }, [activeJourneyId, journeys, onSessionSwitch, onNewJourney, session?.access_token, baseUrl]);

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    fetchUserJourneys();
  }, [fetchUserJourneys]);

  // Load navigation tree for active journey (but not for __new__ placeholder)
  useEffect(() => {
    if (activeJourneyId && activeJourneyId !== '__new__' && !navigationTrees[activeJourneyId]) {
      fetchNavigationTree(activeJourneyId);
    }
  }, [activeJourneyId, navigationTrees, fetchNavigationTree]);

  // NEW: Trigger navigation tree refresh when counter increments
  useEffect(() => {
    if (refreshNavigationTreeTrigger && refreshNavigationTreeTrigger > 0) {
      console.log('🔄 [JourneyTabSystem] Navigation tree refresh triggered by parent component');
      refreshActiveNavigationTree();
    }
  }, [refreshNavigationTreeTrigger, refreshActiveNavigationTree]);

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const activeJourney = useMemo(() => 
    journeys.find(j => j.id === activeJourneyId), 
    [journeys, activeJourneyId]
  );

  const activeNavigationTree = useMemo(() => 
    activeJourneyId ? navigationTrees[activeJourneyId] : null, 
    [activeJourneyId, navigationTrees]
  );

  const menuNavigationNodes = useMemo(() => {
    if (!activeMenuJourney || !navigationTrees[activeMenuJourney]) {
      return [];
    }
    return navigationTrees[activeMenuJourney].navigation_nodes || [];
  }, [activeMenuJourney, navigationTrees]);

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================

  const renderJourneyTab = useCallback((journey: Journey) => {
    const isActive = journey.id === activeJourneyId;
    const navigationTree = navigationTrees[journey.id];
    const hasMultipleSessions = (navigationTree?.navigation_nodes?.length || 1) > 1;
    
    return (
      <Tab
        key={journey.id}
        value={journey.id}
        sx={{
          minWidth: 120,
          maxWidth: 280,
          padding: '8px 40px 8px 12px', // Extra right padding for buttons
          margin: '0 4px',
          borderRadius: '12px 12px 0 0',
          backgroundColor: isActive ? alpha(journey.color_code, 0.1) : 'transparent',
          borderBottom: isActive ? `3px solid ${journey.color_code}` : '3px solid transparent',
          '&:hover': {
            backgroundColor: alpha(journey.color_code, 0.05)
          }
        }}
        label={
          <Box display="flex" alignItems="center" gap={1} width="100%" justifyContent="space-between">
            {/* Journey Icon and Title */}
            <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: journey.color_code,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                {journey.icon_letters}
              </Box>
              
              <Typography 
                variant="body2" 
                noWrap 
                sx={{ 
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '13px',
                  color: isActive ? journey.color_code : 'text.primary'
                }}
              >
                {journey.title}
              </Typography>
            </Box>

            {/* Action buttons in the tab label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Agent Navigation Dropdown */}
              {hasMultipleSessions && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAgentMenuOpen(e, journey.id);
                  }}
                  sx={{ 
                    padding: '2px',
                    color: journey.color_code,
                    '&:hover': { backgroundColor: alpha(journey.color_code, 0.1) }
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              )}

              {/* Close Button */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseJourney(journey.id, e);
                }}
                sx={{ 
                  padding: '2px',
                  opacity: 0.6,
                  '&:hover': { 
                    opacity: 1,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        }
      />
    );
  }, [activeJourneyId, navigationTrees, handleAgentMenuOpen, handleCloseJourney, theme.palette.error.main]);

  const renderAgentMenu = () => (
    <Menu
      anchorEl={agentMenuAnchor}
      open={Boolean(agentMenuAnchor)}
      onClose={handleAgentMenuClose}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 280,
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }
      }}
      transformOrigin={{ horizontal: 'center', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
    >
      {/* Menu Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle2" fontWeight="bold">
          Session Navigation
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Switch between agents in this journey
        </Typography>
      </Box>

      {/* Navigation Nodes */}
      {menuNavigationNodes.map((node, index) => (
        <MenuItem
          key={node.session_id}
          onClick={() => handleSessionSwitch(node.session_id, activeMenuJourney!)}
          selected={node.is_active}
          sx={{
            py: 1.5,
            px: 2,
            borderLeft: node.is_active ? `4px solid ${activeNavigationTree?.journey_color || theme.palette.primary.main}` : '4px solid transparent'
          }}
        >
          <ListItemIcon>
            <Badge
              color="primary"
              variant="dot"
              invisible={!node.is_active}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: activeNavigationTree?.journey_color || theme.palette.primary.main
                }
              }}
            >
              <Avatar
                src={node.agent_avatar}
                sx={{ 
                  width: 32, 
                  height: 32,
                  borderRadius: '5px' // 🔧 TASK 1: Square avatar with 5px radius (consistent design)
                }}
              >
                {node.agent_name.charAt(0)}
              </Avatar>
            </Badge>
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight={node.is_active ? 600 : 400}>
                  {node.agent_name}
                </Typography>
                {node.is_active && (
                  <Chip 
                    label="Active" 
                    size="small" 
                    sx={{ 
                      height: 18, 
                      fontSize: '10px',
                      backgroundColor: alpha(activeNavigationTree?.journey_color || theme.palette.primary.main, 0.1),
                      color: activeNavigationTree?.journey_color || theme.palette.primary.main
                    }}
                  />
                )}
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {node.agent_role}
              </Typography>
            }
          />
        </MenuItem>
      ))}

      {menuNavigationNodes.length === 0 && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <CircularProgress size={20} />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Loading sessions...
          </Typography>
        </Box>
      )}
    </Menu>
  );

  const renderBuyerProfilePopover = () => (
    <Popover
      open={Boolean(buyerProfileAnchor)}
      anchorEl={buyerProfileAnchor}
      onClose={handleBuyerProfileClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { 
          mt: 1, 
          minWidth: 320,
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Buyer Profile
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Personalized property guidance
              </Typography>
            </Box>
          </Box>

          {buyerProfile ? (
            <Box>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {buyerProfile.life_stage && (
                  <Chip 
                    icon={<TrendingUpIcon />}
                    label={buyerProfile.life_stage} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                )}
                {buyerProfile.timeline && (
                  <Chip 
                    icon={<ScheduleIcon />}
                    label={buyerProfile.timeline} 
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              
              {buyerProfile.budget_range && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Budget: ${buyerProfile.budget_range.min?.toLocaleString() || '0'} - ${buyerProfile.budget_range.max?.toLocaleString() || '0'}
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Location: {(buyerProfile.location_priorities && Array.isArray(buyerProfile.location_priorities)) ? buyerProfile.location_priorities.join(', ') : 'Not specified'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Property: {(buyerProfile.property_priorities && Array.isArray(buyerProfile.property_priorities)) ? buyerProfile.property_priorities.join(', ') : 'Not specified'}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No buyer profile configured yet. The AI will learn your preferences as you search.
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />
          
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<StarIcon />}
            onClick={() => {
              // Future: Open buyer profile edit dialog
              handleBuyerProfileClose();
            }}
          >
            Update Preferences
          </Button>
        </CardContent>
      </Card>
    </Popover>
  );

  const renderSessionDetailsDialog = () => (
    <Popover
      open={Boolean(sessionDetailsAnchor) && Boolean(activeSessionDetails)}
      anchorEl={sessionDetailsAnchor}
      onClose={handleSessionDetailsClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: { 
          mt: 1, 
          minWidth: 280,
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      {activeSessionDetails && (
        <Card elevation={0}>
          <CardContent sx={{ p: 2.5 }}>
            {/* Session Header */}
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                src={activeSessionDetails.agent_avatar}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '5px', // 🔧 TASK 1: Square avatar with 5px radius (consistent with timeline)
                  bgcolor: activeJourney?.color_code || theme.palette.primary.main
                }}
              >
                {activeSessionDetails.agent_name.charAt(0)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {activeSessionDetails.agent_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeSessionDetails.agent_role}
                </Typography>
              </Box>
              {activeSessionDetails.is_active && (
                <Chip 
                  label="Active" 
                  size="small" 
                  color="success"
                  variant="filled"
                />
              )}
            </Box>

            {/* Session Type Specific Content */}
            {activeSessionDetails.session_type === 'exploration' ? (
              <Box>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  🔍 Property Exploration Session
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Searching and filtering properties with Grace's guidance
                </Typography>
                
                {/* Active Filters (if available) */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Active Search Filters:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {activeJourney?.search_criteria ? (
                      Object.entries(activeJourney.search_criteria).map(([key, value]) => (
                        <Chip 
                          key={key}
                          label={`${key}: ${Array.isArray(value) ? value.join(', ') : value}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary" fontStyle="italic">
                        No active filters
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : activeSessionDetails.session_type === 'property_drill' ? (
              <Box>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  🏠 Property Analysis Session
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Deep dive analysis of a specific property with Isaac's insights
                </Typography>
                
                {/* Property Details Placeholder */}
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Property Focus:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    Property Analysis Session
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Detailed property information and market analysis
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  ⚖️ Comparison Session
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Side-by-side property comparison with Marcus's analysis
                </Typography>
              </Box>
            )}

            {/* Session Actions */}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" gap={1}>
              {(() => {
                // 🔧 ISSUE 2 FIX: Properly determine if session is current by comparing session IDs
                const isCurrentSession = activeSessionDetails.session_id === currentSessionId;
                
                return (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={isCurrentSession ? <CircleIcon sx={{ fontSize: 8 }} /> : <HistoryIcon />}
                    onClick={() => handleResumeSession(activeSessionDetails.session_id, activeJourneyId!)}
                    disabled={isCurrentSession}
                    sx={{ 
                      flex: 1,
                      backgroundColor: activeJourney?.color_code || theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(activeJourney?.color_code || theme.palette.primary.main, 0.8)
                      }
                    }}
                  >
                    {isCurrentSession ? 'Current' : 'Resume'}
                  </Button>
                );
              })()}
              <Button
                variant="outlined"
                size="small"
                onClick={handleSessionDetailsClose}
                sx={{ minWidth: 60 }}
              >
                Close
              </Button>
            </Box>

            {/* Session Metadata */}
            <Box sx={{ mt: 2, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(activeSessionDetails.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Popover>
  );

  // ==========================================
  // MAIN RENDER
  // ==========================================

  if (loading && journeys.length === 0) {
    return (
      <Box 
        sx={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }} color="text.secondary">
          Loading journeys...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center',
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar - 1
      }}
    >
      {/* Journey Tab Bar */}
      <Box display="flex" alignItems="center" minHeight={64}>
        <Box flex={1}>
          <Tabs
            value={(() => {
              // Simple logic: if activeJourneyId is set and we have journeys, use it
              // Otherwise default to __new__ (which always exists)
              
              if (activeJourneyId === '__new__') {
                return '__new__';
              }
              
              if (activeJourneyId && journeys.length > 0 && journeys.some(j => j.id === activeJourneyId)) {
                return activeJourneyId;
              }
              
              if (journeys.length > 0) {
                // Set activeJourneyId to first journey to sync state
                const firstJourneyId = journeys[0].id;
                if (activeJourneyId !== firstJourneyId) {
                  // Use setTimeout to avoid setState during render
                  setTimeout(() => setActiveJourneyId(firstJourneyId), 0);
                }
                return firstJourneyId;
              }
              
              // No journeys, default to __new__ tab
              return '__new__';
            })()}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 64,
              '& .MuiTabs-scrollButtons': {
                color: 'text.secondary'
              },
              '& .MuiTabs-indicator': {
                display: 'none' // Custom border on tabs instead
              }
            }}
          >
            {journeys.map((journey, index) => renderJourneyTab(journey))}
            
            {/* New Journey Tab */}
            <Tab
              value="__new__"
              sx={{
                minWidth: 80,
                maxWidth: 120,
                padding: '8px 12px',
                margin: '0 4px',
                borderRadius: '12px 12px 0 0',
                border: `2px dashed ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `2px dashed ${theme.palette.primary.main}`
                }
              }}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <AddIcon fontSize="small" />
                  <Typography variant="body2" fontSize="12px">
                    New
                  </Typography>
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Buyer Profile Management - Bulb Icon */}
        <Box sx={{ pr: 2 }}>
          <Tooltip title="Buyer Profile Management">
            <IconButton
              onClick={handleBuyerProfileOpen}
              sx={{
                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.warning.main, 0.2)
                }
              }}
            >
              <AnalyticsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Agent Timeline Navigation - Sub-contextbar under active journey */}
      {activeJourney && activeNavigationTree && (
        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: alpha(activeJourney.color_code, 0.05),
            borderBottom: `1px solid ${alpha(activeJourney.color_code, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minHeight: 48
          }}
        >
          <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary', minWidth: 'fit-content' }}>
            Session Timeline:
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flex: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { height: '4px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: alpha(activeJourney.color_code, 0.3), borderRadius: '2px' }
            }}
          >
            {activeNavigationTree.navigation_nodes.map((node, index) => (
              <Tooltip
                key={node.session_id}
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {node.agent_name} - {node.session_type === 'exploration' ? 'Property Search' : node.session_type === 'property_drill' ? 'Property Analysis' : 'Comparison'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'grey.300' }}>
                      Click to view session details
                    </Typography>
                  </Box>
                }
                placement="top"
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleSessionDetailsOpen(e, node)}
                >
                  {/* Timeline connector line */}
                  {index > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -8,
                        width: 16,
                        height: 2,
                        backgroundColor: alpha(activeJourney.color_code, 0.3),
                        zIndex: 0
                      }}
                    />
                  )}
                  
                  {/* Agent Avatar - 🎨 TASK 1 ENHANCEMENTS: Square avatars + Dimming for inactive sessions */}
                  <Avatar
                    src={node.agent_avatar}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '5px', // 🔧 TASK 1: Square avatar with 5px radius (instead of circular)
                      border: node.is_active ? `3px solid ${activeJourney.color_code}` : `2px solid ${alpha(activeJourney.color_code, 0.3)}`,
                      backgroundColor: node.is_active ? activeJourney.color_code : 'background.paper',
                      color: node.is_active ? 'white' : activeJourney.color_code,
                      opacity: node.is_active ? 1 : 0.6, // 🔧 TASK 1: Dim non-active session avatars
                      fontSize: '12px',
                      fontWeight: 'bold',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: theme.shadows[4],
                        opacity: 1 // 🎨 ENHANCEMENT: Full opacity on hover for better UX
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {node.agent_name.charAt(0)}
                  </Avatar>
                  
                  {/* Active indicator dot */}
                  {node.is_active && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.success.main,
                        border: '2px solid white',
                        zIndex: 2
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}

      {/* Agent Navigation Menu */}
      {renderAgentMenu()}
      
      {/* Session Details Dialog */}
      {renderSessionDetailsDialog()}
      
      {/* Buyer Profile Popover */}
      {renderBuyerProfilePopover()}
    </Box>
  );
};

export default JourneyTabSystem;
