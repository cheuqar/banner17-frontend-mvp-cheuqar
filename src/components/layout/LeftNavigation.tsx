import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  Chip,
  Skeleton,
  IconButton,
  Avatar,
  MenuItem,
  Menu,
  Tooltip,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import {
  Home,
  Business,
  Receipt,
  Settings,
  ExpandLess,
  ExpandMore,
  Chat,
  Add,
  Close,
  AccountCircle,
  Logout,
  Person,
  Timeline,
  BarChart,
  Star,
  Upgrade,
  BugReport,
  MoreVert,
  Edit,
  Delete
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { 
  chatService
} from '../../services/chatService';
import JourneyService, { type Journey, type JourneyNavigationTree } from '../../services/journeyService';
import UserProfileMenu from '../auth/UserProfileMenu';
import CompactPlanInfo from '../chat/CompactPlanInfo';
import ComprehensiveDebugInfo from '../developer/ComprehensiveDebugInfo';
import type { SessionMetrics } from '../chat/CompactSessionInfo';

/**
 * Generate context summary based on session type
 * According to comprehensive plan requirements
 */
function generateContextSummary(node: any): string {
  switch (node.session_type) {
    case 'exploration':
      // Expected: Active search criteria (price, location, bedrooms)
      if (node.context_data?.active_filters) {
        const filters = node.context_data.active_filters;
        const parts = [];
        if (filters.price_max) parts.push(`≤ $${(filters.price_max / 1000000).toFixed(1)}M`);
        if (filters.bedrooms_min) parts.push(`${filters.bedrooms_min}+ bed`);
        if (filters.states && filters.states.length > 0) parts.push(filters.states.join(', '));
        return parts.length > 0 ? parts.join(' • ') : 'Property exploration';
      }
      return 'Property exploration';
      
    case 'property_drill':
      // Expected: Property cover photo + address
      if (node.context_data?.property_address) {
        return `🏠 ${node.context_data.property_address}`;
      }
      return '🏠 Property analysis';
      
    case 'comparison':
      // Expected: Multiple property thumbnails
      const count = node.context_data?.comparison_count || 2;
      return `📊 Comparing ${count} properties`;
      
    default:
      return `${node.session_scope || 'Session'}`;
  }
}

/**
 * Enhanced session information interface
 */
interface EnhancedSessionInfo {
  title: string;
  subtitle: string;
  tags: string[];
  searchSummary: string;
  messageCount?: number;
  lastActivity?: string;
}

/**
 * Extract search criteria from the last message with render instructions
 */
async function extractSearchCriteria(sessionId: string, providedMessages?: any[]): Promise<{
  filters: Record<string, string>;
  resultCount: number;
  searchLocation: string;
  title: string;
} | null> {
  try {
    console.log('🔍 [SessionInfo] Extracting search criteria for session:', sessionId);
    
    // 🚨 FIX: Use provided messages to avoid triggering another session resume
    let messages: any[];
    if (providedMessages) {
      console.log('✅ [SessionInfo] Using provided messages to avoid session resume loop');
      messages = providedMessages;
    } else {
      console.log('📡 [SessionInfo] Fetching messages via getSessionMessages (fallback)');
      const result = await chatService.getSessionMessages(sessionId);
      messages = result.messages;
    }
    
    // Find the most recent AI message with render instruction
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.type === 'ai' && msg.message_metadata?.render_instruction) {
        const renderInst = msg.message_metadata.render_instruction;
        
        if (renderInst.type === 'PropertyList') {
          const criteria = {
            filters: renderInst.active_filters || {},
            resultCount: renderInst.items?.length || 0,
            searchLocation: renderInst.spatial_context?.search_address || '',
            title: renderInst.title || ''
          };
          console.log('✅ [SessionInfo] Extracted criteria:', criteria);
          return criteria;
        }
      }
    }
    console.log('⚠️ [SessionInfo] No PropertyList render instruction found');
    return null;
  } catch (error) {
    console.warn('❌ [SessionInfo] Failed to extract search criteria:', error);
    return null;
  }
}

/**
 * Generate enhanced context summary with search criteria
 */
async function generateEnhancedContextSummary(node: any, providedMessages?: any[]): Promise<EnhancedSessionInfo> {
  const sessionType = node.session_type || node.scope || 'exploration';
  const scope = node.scope || node.session_type || 'exploration';
  const agentInfo = mapScopeToAgent(scope);
  const agentName = node.agent_name || agentInfo.name;
  
  if (sessionType === 'property_drill' && node.context_data?.property_address) {
    return {
      title: 'Property Deep Dive',
      subtitle: node.context_data.property_address,
      tags: ['Property Analysis', 'Isaac'],
      searchSummary: `Detailed analysis of ${node.context_data.property_address}`,
      lastActivity: node.last_accessed_at
    };
  }
  
  if (sessionType === 'exploration') {
    // Try to extract search criteria from session messages
    const criteria = await extractSearchCriteria(node.session_id, providedMessages);
    
    if (criteria && Object.keys(criteria.filters).length > 0) {
      const filterTags = Object.entries(criteria.filters).map(([key, value]) => 
        `${key}: ${value}`
      );
      
      const locationTag = criteria.searchLocation ? 
        criteria.searchLocation.replace(' Station', '').replace('Sydney ', '') : 
        'Property Search';
        
      const title = locationTag || 'Property Search';
      const subtitle = `${criteria.resultCount} properties found`;
      
      return {
        title,
        subtitle,
        tags: filterTags.slice(0, 2), // Limit to 2 main tags for space
        searchSummary: `Found ${criteria.resultCount} properties with filters: ${filterTags.join(', ')}`,
        lastActivity: node.last_accessed_at
      };
    }
  }
  
  // Fallback for other session types or when data extraction fails
  return {
    title: `${agentName} Session`,
    subtitle: sessionType === 'exploration' ? 'Property exploration' : 'Property analysis',
    tags: [agentName || 'Agent'],
    searchSummary: `${agentName} ${sessionType} session`,
    lastActivity: node.last_accessed_at
  };
}

/**
 * Flatten hierarchical navigation tree to extract all sessions
 * Handles both navigation_nodes (flat) and root_session.children (hierarchical)
 */
function flattenNavigationTree(navigationTree: any): any[] {
  const allSessions: any[] = [];
  
  // Add sessions from navigation_nodes (flat structure)
  if (navigationTree.navigation_nodes && Array.isArray(navigationTree.navigation_nodes)) {
    allSessions.push(...navigationTree.navigation_nodes);
  }
  
  // Add sessions from root_session and its children (hierarchical structure)  
  if (navigationTree.root_session) {
    const addSessionAndChildren = (session: any) => {
      allSessions.push(session);
      if (session.children && Array.isArray(session.children)) {
        session.children.forEach(addSessionAndChildren);
      }
    };
    addSessionAndChildren(navigationTree.root_session);
  }
  
  // Remove duplicates based on session_id
  const uniqueSessions = allSessions.filter((session, index, arr) => 
    arr.findIndex(s => s.session_id === session.session_id) === index
  );
  
  console.log(`🔍 [LeftNav] Flattened navigation tree: ${allSessions.length} total, ${uniqueSessions.length} unique sessions`);
  return uniqueSessions;
}

/**
 * Map session scope to agent information
 * This is the authoritative mapping based on database schema
 */
function mapScopeToAgent(scope: string): { name: string; avatar: string } {
  switch (scope) {
    case 'property_drill':
      return { name: 'Isaac', avatar: '/px-isaac.png' };
    case 'exploration':
    default:
      return { name: 'Grace', avatar: '/px-grace.png' };
  }
}

/**
 * Generate session title based on session type and agent
 * According to comprehensive plan requirements
 */
function generateSessionTitle(node: any): string {
  const scope = node.scope || node.session_type || 'exploration';
  const agentInfo = mapScopeToAgent(scope);
  const agentName = node.agent_name || agentInfo.name;
  
  switch (node.session_type) {
    case 'exploration':
      return `${agentName}: Property Search`;
      
    case 'property_drill':
      if (node.context_data?.property_address) {
        const addressParts = node.context_data.property_address.split(',');
        const shortAddress = addressParts[0] || 'Property';
        return `${agentName}: ${shortAddress}`;
      }
      return `${agentName}: Property Analysis`;
      
    case 'comparison':
      const count = node.context_data?.comparison_count || 2;
      return `${agentName}: Compare ${count} Properties`;
      
    default:
      return `${agentName}: ${node.session_scope || 'Session'}`;
  }
}

export type NavigationPage = 'chat' | 'my-properties' | 'usage-billing' | 'settings';

interface LeftNavigationProps {
  currentPage: NavigationPage;
  onPageChange: (page: NavigationPage) => void;
  onNewChat: () => void;
  onSessionResume?: (sessionId: string, messages: any[], session?: any) => void;
  currentSessionId?: string | null; // Track active session for highlighting
  // New props for enhanced functionality
  chatProps?: {
    onNewChat: () => void;
    onEditSessionName?: (newName: string) => void;
    onShowCapabilities?: () => void;
    sessionMetrics?: SessionMetrics;
    messages?: Array<any>;
    planData?: any;
    isLoading?: boolean;
    currentModel?: string;
    availableTools?: any[];
    debugInfo?: any;
  };
  planData?: {
    planName: string;
    planTier: 'FREE' | 'PRO' | 'ENTERPRISE';
    monthlyQueries: { current: number; limit: number; period: string };
    apiCalls: { current: number; limit: number; period: string };
    propertyAnalyses: { current: number; limit: number; period: string };
  };
  sessionMetrics?: SessionMetrics;
  onShowCapabilities?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  
  // 🎯 NEW: Journey loading animation methods
  onLoadingJourneyMethodsReady?: (methods: {
    addLoadingJourney: () => string;
    removeLoadingJourney: (id: string) => void;
  }) => void;
}

const LeftNavigation: React.FC<LeftNavigationProps> = ({
  currentPage,
  onPageChange,
  onNewChat,
  onSessionResume,
  currentSessionId,
  chatProps,
  planData,
  sessionMetrics,
  onShowCapabilities,
  isCollapsed = false,
  onToggleCollapse,
  onLoadingJourneyMethodsReady // 🎯 NEW: Journey loading methods callback
}) => {
  const { isAuthenticated, user } = useAuth();
  
  // ✅ FIX: Prevent double journey loading from auth state changes
  const journeyLoadStartedRef = useRef(false);
  
  // Chat submenu state
  const [chatExpanded, setChatExpanded] = useState(true); // Chat submenu expanded by default
  
  // Debug logging for main Journeys group expansion state
  useEffect(() => {
    console.log('🏗️ [LeftNav] Main Journeys group expansion state:', chatExpanded ? 'EXPANDED' : 'COLLAPSED');
  }, [chatExpanded]);
  // ✅ LEGACY CLEANUP: Removed dead history states (redundant with journeys architecture)
  
  // Journey menu state
  const [journeyMenuAnchor, setJourneyMenuAnchor] = useState<{ [journeyId: string]: HTMLElement | null }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  
  // Debug console state
  const [showDebugDialog, setShowDebugDialog] = useState(false);

  // ✅ LEGACY CLEANUP: Removed loadRecentHistory and handleHistoryToggle (redundant with journeys)

  // Handle session resume
  const handleSessionResume = async (sessionId: string) => {
    if (onSessionResume) {
      try {
        const response = await chatService.resumeSession(sessionId);
        onSessionResume(sessionId, response.messages, response.session);
      } catch (error) {
        console.error('Failed to resume session:', error);
      }
    }
  };

  // ✅ LEGACY CLEANUP: Removed full history loading and delete methods (redundant with journeys)

  // Format date for session display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Simplified navigation structure - user pages moved to profile menu
  const navigationItems = [
    {
      id: 'chats' as const,
      label: 'Journeys',
      icon: <Chat />,
      page: 'chat' as NavigationPage,
      expandable: true,
      expanded: chatExpanded,
      onToggle: () => setChatExpanded(!chatExpanded)
    }
  ];

  // Journey state management
  const [journeys, setJourneys] = useState<any[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  
  // 🎯 NEW: Loading journey management for creation animation
  const addLoadingJourney = useCallback(() => {
    const loadingJourney = {
      id: 'creating-journey-' + Date.now(),
      title: 'Creating Journey...',
      icon_letters: 'CJ',
      color_code: '#000000',
      isExpanded: false, // Don't auto-expand loading journey
      sessions: [],
      sessionsLoaded: true,
      sessionsLoading: false,
      isCreating: true // Special flag for loading animation
    };
    
    console.log('🎯 [LeftNav] Adding loading journey animation');
    setJourneys(prev => [loadingJourney, ...prev]); // Add to top of list
    
    return loadingJourney.id;
  }, []);
  
  const removeLoadingJourney = useCallback((loadingJourneyId: string) => {
    console.log('🎯 [LeftNav] Removing loading journey:', loadingJourneyId);
    setJourneys(prev => prev.filter(j => j.id !== loadingJourneyId));
    
    // 🎯 FIX Issue #2: Refresh journey list after removing loading animation to show updated counts
    console.log('🔄 [LeftNav] Refreshing journey list after loading journey removal');
    setTimeout(async () => {
      // Use JourneyService directly instead of loadJourneys to avoid dependency issue
      try {
        const updatedJourneys = await JourneyService.getUserJourneys();
        setJourneys(updatedJourneys);
        console.log('✅ [LeftNav] Journey list refreshed after loading journey removal');
      } catch (error) {
        console.error('❌ [LeftNav] Failed to refresh journey list:', error);
      }
    }, 500); // Small delay to ensure backend is consistent
  }, []);
  
  // 🎯 NEW: Expose loading journey methods to parent component (register once only)
  useEffect(() => {
    if (onLoadingJourneyMethodsReady) {
      onLoadingJourneyMethodsReady({
        addLoadingJourney,
        removeLoadingJourney
      });
    }
  }, []); // ✅ FIX: Empty dependency - register methods once only (methods are stable via useCallback)
  
  // Enhanced session info cache
  const [sessionInfoCache, setSessionInfoCache] = useState<Map<string, EnhancedSessionInfo>>(new Map());
  
  // Hover dialog state
  const [hoveredSession, setHoveredSession] = useState<{
    sessionId: string;
    anchorEl: HTMLElement;
    info: EnhancedSessionInfo;
  } | null>(null);
  
  
  // Animation state for sessions
  const [animatingSessionIds, setAnimatingSessionIds] = useState<Set<string>>(new Set());
  
  // Placeholder sessions for handoff loading
  const [placeholderSessions, setPlaceholderSessions] = useState<Map<string, any>>(new Map());

  // Journey navigation handlers
  const handleJourneyToggle = useCallback(async (journeyId: string) => {
    console.log('🔄 [LeftNav] Journey toggled:', journeyId);
    
    // Find the journey being toggled
    const targetJourney = journeys.find(j => j.id === journeyId);
    if (!targetJourney) return;
    
    console.log('🔍 [LeftNav] TARGET JOURNEY STATE:', {
      id: targetJourney.id,
      title: targetJourney.title,
      isExpanded: targetJourney.isExpanded,
      sessionsLoaded: targetJourney.sessionsLoaded,
      sessionsLoading: targetJourney.sessionsLoading,
      sessionCount: targetJourney.sessions?.length || 0
    });
    
    // If expanding a journey and sessions aren't loaded yet, load them
    if (!targetJourney.isExpanded && !targetJourney.sessionsLoaded && !targetJourney.sessionsLoading) {
      console.log('📡 [LeftNav] Loading sessions for journey on-demand:', journeyId);
      
      // Set loading state
      setJourneys(prev => prev.map(journey => 
        journey.id === journeyId 
          ? { ...journey, sessionsLoading: true }
          : journey
      ));
      
      try {
        // Load navigation tree for this journey
        const navigationTree = await JourneyService.getJourneyNavigationTree(journeyId);
        const flattenedSessions = flattenNavigationTree(navigationTree);
        
        // Create basic session data immediately, prioritizing real database data
        const sessions = flattenedSessions.map((node: any) => {
          // 🎯 FIX: Map scope to proper agent info instead of using potentially missing fields
          const scope = node.scope || node.session_type || 'exploration';
          const agentInfo = mapScopeToAgent(scope);
          
          return {
            id: node.session_id,
            agent_name: node.agent_name || agentInfo.name,
            agent_avatar: node.agent_avatar || agentInfo.avatar,
            session_type: node.session_type || scope,
            session_title: node.context_summary || generateSessionTitle(node), // Use real title from database first
            context_summary: node.context_summary || generateContextSummary(node), // Use real context from database first
            is_active: node.is_active,
            enhanced_loading: false // Real data loaded, no need for enhancement loading state
          };
        });
        
        // Update journey with loaded sessions and expand it
        setJourneys(prev => prev.map(journey => 
          journey.id === journeyId 
            ? { 
                ...journey, 
                sessions,
                sessionsLoaded: true,
                sessionsLoading: false,
                isExpanded: true
              }
            : journey
        ));
        
        console.log(`✅ [LeftNav] Sessions loaded for journey ${journeyId}:`, sessions.length);
        
        // ✅ PERFORMANCE FIX: Skip enhanced context during journey expansion to avoid unnecessary session resume calls
        // Enhanced context will be loaded on-demand during hover or when actually needed
        console.log(`🚀 [LeftNav] Enhanced context loading skipped during expansion (loads on-demand during hover)`);
        
      } catch (error) {
        console.error('❌ [LeftNav] Failed to load sessions for journey:', journeyId, error);
        
        // Reset loading state on error
        setJourneys(prev => prev.map(journey => 
          journey.id === journeyId 
            ? { ...journey, sessionsLoading: false }
            : journey
        ));
      }
    } else {
      // Just toggle expansion state (sessions already loaded or journey is collapsing)
      console.log('🔄 [LeftNav] Toggling expansion state. Current isExpanded:', targetJourney.isExpanded, '-> New isExpanded:', !targetJourney.isExpanded);
      
      setJourneys(prev => prev.map(journey => 
        journey.id === journeyId 
          ? { ...journey, isExpanded: !journey.isExpanded }
          : journey
      ));
    }
  }, [journeys, setJourneys]);

  const handleSessionSelect = async (sessionId: string) => {
    console.log('🎯 [LeftNav] Session selected:', sessionId);
    
    if (!onSessionResume) {
      console.warn('⚠️ [LeftNav] onSessionResume not provided, falling back to page navigation');
      onPageChange('chat');
      return;
    }
    
    try {
      console.log('📡 [LeftNav] Fetching session messages for resume:', sessionId);
      
      // Fetch session messages and data from backend
      const { messages, session } = await chatService.getSessionMessages(sessionId);
      
      console.log('✅ [LeftNav] Session data fetched:', {
        sessionId,
        sessionTitle: session?.title,
        messageCount: messages?.length || 0
      });
      
      // Call the session resume handler with all the data
      onSessionResume(sessionId, messages, session);
      
      // Navigate to chat page to show the resumed session
      onPageChange('chat');
      
    } catch (error) {
      console.error('❌ [LeftNav] Failed to resume session:', sessionId, error);
      
      // Fallback: just navigate to chat page if session resume fails
      console.log('🔄 [LeftNav] Falling back to chat page navigation');
      onPageChange('chat');
    }
  };

  const handleNewJourney = () => {
    console.log('🚀 [LeftNav] New Journey requested');
    onNewChat();
  };

  // Journey menu handlers
  const handleJourneyMenuOpen = (event: React.MouseEvent<HTMLElement>, journeyId: string) => {
    event.stopPropagation(); // Prevent journey toggle
    setJourneyMenuAnchor({
      ...journeyMenuAnchor,
      [journeyId]: event.currentTarget
    });
  };

  const handleJourneyMenuClose = (journeyId: string) => {
    setJourneyMenuAnchor({
      ...journeyMenuAnchor,
      [journeyId]: null
    });
  };

  const handleEditJourneyTitle = (journeyId: string, currentTitle: string) => {
    setEditingTitle(currentTitle);
    setShowEditDialog(journeyId);
    handleJourneyMenuClose(journeyId);
  };

  const handleDeleteJourney = (journeyId: string) => {
    setShowDeleteConfirm(journeyId);
    handleJourneyMenuClose(journeyId);
  };

  const confirmDeleteJourney = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      console.log('🗑️ [LeftNav] Deleting journey:', showDeleteConfirm);
      
      // Call actual delete journey API
      await JourneyService.deleteJourney(showDeleteConfirm, false); // false = permanent delete, not archive
      
      // Remove from local state after successful deletion
      setJourneys(prev => prev.filter(j => j.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      
      console.log('✅ [LeftNav] Journey successfully deleted');
    } catch (error) {
      console.error('❌ [LeftNav] Failed to delete journey:', error);
      // TODO: Could show error toast notification here
    }
  };

  const saveJourneyTitle = async () => {
    if (!showEditDialog || !editingTitle.trim()) return;
    
    try {
      console.log('📝 [LeftNav] Updating journey title:', showEditDialog, editingTitle);
      
      // Call actual update journey title API
      await JourneyService.updateJourneyTitle(showEditDialog, {
        title_override: editingTitle.trim()
      });
      
      // Update local state after successful API call
      setJourneys(prev => prev.map(j => 
        j.id === showEditDialog 
          ? { ...j, title: editingTitle.trim() }
          : j
      ));
      setShowEditDialog(null);
      setEditingTitle('');
      
      console.log('✅ [LeftNav] Journey title successfully updated');
    } catch (error) {
      console.error('❌ [LeftNav] Failed to update journey title:', error);
      // TODO: Could show error toast notification here
    }
  };

  // Add a new session to a journey without full reload
  const addSessionToJourneyInPlace = useCallback(async (journeyId: string, sessionData: any) => {
    try {
      console.log('🔗 [LeftNav] Adding session to journey in-place:', journeyId, sessionData.id);
      
      // 🔍 DEBUG: Show available journey IDs for comparison (only when journey not found)
      if (journeys.length === 0) {
        console.log('🔍 [LeftNav] No journeys loaded in state yet');
      }
      
      // Find the target journey
      const targetJourney = journeys.find(j => j.id === journeyId);
      if (!targetJourney) {
        console.warn('⚠️ [LeftNav] Journey not found for in-place session addition:', journeyId);
        console.log('🔄 [LeftNav] Loading fresh data and performing differential update...');
        
        // 🎯 SMART DIFFERENTIAL UPDATE: Load fresh data and surgically update only what's needed
        try {
          const freshJourneysWithSessions = await JourneyService.getJourneysWithSessions();
          console.log('✅ [LeftNav] Fresh data loaded, performing differential analysis...');
          
          // Find the target journey in fresh data
          const freshTargetJourney = freshJourneysWithSessions.find(item => item.journey.id === journeyId);
          if (!freshTargetJourney) {
            console.error('❌ [LeftNav] Journey not found even in fresh data:', journeyId);
            return;
          }
          
          console.log('🎯 [LeftNav] Target journey found in fresh data, performing TRUE surgical update...');
          
          // 🔧 TRUE SURGICAL UPDATE: Find the current journey and only add the NEW session
          const currentJourney = journeys.find(j => j.id === journeyId);
          if (!currentJourney) {
            console.error('❌ [LeftNav] Current journey not found in state:', journeyId);
            return;
          }
          
          console.log('📋 [LeftNav] Current sessions in journey:', currentJourney.sessions?.map((s: any) => s.id) || []);
          console.log('📋 [LeftNav] Fresh sessions from API:', freshTargetJourney.sessions?.map((s: any) => s.id) || []);
          
          // Find sessions that exist in fresh data but NOT in current state (NEW sessions)
          const currentSessionIds = new Set((currentJourney.sessions || []).map((s: any) => s.id));
          const newSessions = (freshTargetJourney.sessions || []).filter(session => 
            !currentSessionIds.has(session.id)
          );
          
          if (newSessions.length === 0) {
            console.warn('⚠️ [LeftNav] No new sessions found in API data - this suggests timing issue!');
            console.log('🔍 [LeftNav] Expected session ID:', sessionData.id);
            console.log('🔍 [LeftNav] Fresh API session IDs:', freshTargetJourney.sessions?.map((s: any) => s.id) || []);
            console.log('🔄 [LeftNav] Falling back to direct addition using handoff session data...');
            
            // 🎯 FALLBACK: Use the sessionData directly from handoff event
            const agentInfo = mapScopeToAgent(sessionData.scope || 'property_drill');
            const fallbackSession = {
              id: sessionData.id,
              title: sessionData.title || `${agentInfo.name}: Property Analysis`,
              agent_name: agentInfo.name,
              agent_avatar: agentInfo.avatar,
              scope: sessionData.scope || 'property_drill',
              is_active: false,
              enhanced_loading: false
            };
            
            console.log('🆕 [LeftNav] Creating fallback session:', fallbackSession);
            
            // Add the fallback session directly
            setJourneys(prev => {
              return prev.map(journey => {
                if (journey.id === journeyId) {
                  // Check if session already exists to avoid duplicates
                  const sessionExists = journey.sessions?.some((s: any) => s.id === sessionData.id);
                  if (sessionExists) {
                    console.log('ℹ️ [LeftNav] Session already exists in current state');
                    return journey;
                  }
                  
                  const existingSessions = journey.sessions || [];
                  const updatedSessions = [...existingSessions, fallbackSession];
                  
                  console.log('🔧 [LeftNav] FALLBACK: Adding session directly to journey');
                  console.log('🔧 [LeftNav] Preserving', existingSessions.length, 'existing sessions');
                  console.log('🆕 [LeftNav] Adding 1 fallback session');
                  
                  return {
                    ...journey,
                    sessions: updatedSessions,
                    isExpanded: true,
                    session_count: updatedSessions.length
                  };
                }
                return journey;
              });
            });
            
            console.log('✅ [LeftNav] Fallback session addition completed');
            return;
          }
          
          console.log('🆕 [LeftNav] Found NEW sessions to add:', newSessions.map(s => `${s.id} (${s.scope})`));
          
          // Transform only the NEW sessions
          const transformedNewSessions = newSessions.map((session: any) => {
            const agentInfo = mapScopeToAgent(session.scope || 'exploration');
            return {
              id: session.id,
              title: session.title || 'New Chat', 
              agent_name: agentInfo.name,
              agent_avatar: agentInfo.avatar,
              scope: session.scope || 'exploration',
              is_active: session.is_active !== undefined ? session.is_active : false,
              enhanced_loading: false
            };
          });
          
          console.log('✅ [LeftNav] Transformed new sessions:', transformedNewSessions.map(s => `${s.agent_name}: ${s.title.substring(0, 30)}...`));
          
          // 🎯 SURGICAL UPDATE: Add ONLY new sessions to existing sessions (preserve existing session objects)
          setJourneys(prev => {
            return prev.map(journey => {
              if (journey.id === journeyId) {
                // This is the target journey - add NEW sessions to its existing sessions
                const existingSessions = journey.sessions || [];
                const updatedSessions = [...existingSessions, ...transformedNewSessions];
                
                console.log('🔧 [LeftNav] Surgical update - preserving', existingSessions.length, 'existing sessions');
                console.log('🆕 [LeftNav] Surgical update - adding', transformedNewSessions.length, 'new sessions');
                console.log('🎯 [LeftNav] Final session count:', updatedSessions.length);
                
                return {
                  ...journey, // Preserve all journey properties
                  sessions: updatedSessions, // Only update sessions with NEW additions
                  isExpanded: true, // Expand so we can see the new session
                  sessionsLoaded: true, // Mark as loaded
                  session_count: updatedSessions.length // Update count
                };
              }
              return journey; // Preserve other journeys unchanged
            });
          });
          
          console.log('✅ [LeftNav] TRUE surgical update completed - only new sessions added');
          return; // Exit after successful surgical update
          
        } catch (error) {
          console.error('❌ [LeftNav] Failed to perform differential update:', error);
          return;
        }
      }
      
      // 🎯 DIRECT ADDITION: Journey found in state, add session directly
      console.log('✅ [LeftNav] Target journey found in state, adding session directly...');
      
      const agentInfo = mapScopeToAgent(sessionData.scope || 'property_drill');
      const newSession = {
        id: sessionData.id,
        title: sessionData.title || `${agentInfo.name}: Property Analysis`,
        agent_name: agentInfo.name,
        agent_avatar: agentInfo.avatar,
        scope: sessionData.scope || 'property_drill',
        is_active: false,
        enhanced_loading: false
      };
      
      // Add the session directly to the existing journey
      setJourneys(prev => prev.map(journey => {
        if (journey.id === journeyId) {
          // Check if session already exists to avoid duplicates
          const sessionExists = journey.sessions?.some((s: any) => s.id === sessionData.id);
          if (sessionExists) {
            console.log('ℹ️ [LeftNav] Session already exists, skipping addition');
            return journey;
          }
          
          const updatedSessions = [...(journey.sessions || []), newSession];
          console.log('🎯 [LeftNav] Direct addition - adding 1 session to', journey.sessions?.length || 0, 'existing sessions');
          
          return {
            ...journey,
            sessions: updatedSessions,
            isExpanded: true, // Expand to show new session
            session_count: updatedSessions.length
          };
        }
        return journey;
      }));
      
      console.log('✅ [LeftNav] Session added to journey directly');
      
    } catch (error) {
      console.error('❌ [LeftNav] Failed to add session to journey in-place:', error);
    }
  }, [journeys, setJourneys, setSessionInfoCache]);


  // Enhanced session hover handlers
  const handleSessionHover = (sessionId: string, event: React.MouseEvent<HTMLElement>) => {
    const sessionInfo = sessionInfoCache.get(sessionId);
    if (sessionInfo) {
      setHoveredSession({
        sessionId,
        anchorEl: event.currentTarget,
        info: sessionInfo
      });
    }
  };

  const handleSessionHoverLeave = () => {
    setHoveredSession(null);
  };
  

  // Listen for session summary updates from auto-update system
  useEffect(() => {
    const handleSessionSummaryUpdate = (event: CustomEvent) => {
      const { sessionId, context } = event.detail;
      console.log('🔄 [LeftNav] Received session summary update:', { sessionId, context });

      // Update session info cache
      setSessionInfoCache(prev => {
        const updated = new Map(prev);
        updated.set(sessionId, context);
        return updated;
      });

      // Refresh the specific journey that contains this session
      setJourneys(prevJourneys => {
        return prevJourneys.map(journey => {
            // Check if this journey contains the updated session (with safety check for race conditions)
            const hasSession = journey.sessions && journey.sessions.some((session: any) => session.id === sessionId);
          
          if (hasSession) {
            // Update the session within this journey
            const updatedSessions = journey.sessions.map((session: any) => {
              if (session.id === sessionId) {
                return {
                  ...session,
                  session_title: context.title,
                  context_summary: context.subtitle,
                  enhanced_info: context
                };
              }
              return session;
            });

            return {
              ...journey,
              sessions: updatedSessions
            };
          }
          
          return journey;
        });
      });
    };
    
    const handleSessionUpdateAnimation = (event: CustomEvent) => {
      const { sessionId, animationType, duration } = event.detail;
      console.log('✨ [LeftNav] Triggering session animation:', { sessionId, animationType });
      
      // Add session to animating set
      setAnimatingSessionIds(prev => new Set(prev).add(sessionId));
      
      // Remove animation after duration
      setTimeout(() => {
        setAnimatingSessionIds(prev => {
          const updated = new Set(prev);
          updated.delete(sessionId);
          return updated;
        });
      }, duration || 2000);
    };

    // Add event listeners
    window.addEventListener('sessionSummaryUpdated', handleSessionSummaryUpdate as EventListener);
    window.addEventListener('sessionUpdateAnimation', handleSessionUpdateAnimation as EventListener);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('sessionSummaryUpdated', handleSessionSummaryUpdate as EventListener);
      window.removeEventListener('sessionUpdateAnimation', handleSessionUpdateAnimation as EventListener);
    };
  }, []);

  // Listen for handoff events (Isaac session creation)
  useEffect(() => {
    const handleHandoffEvent = (event: CustomEvent) => {
      const { type, placeholderSessionId, propertyInfo, newSessionData, error, parentSessionId, journeyId } = event.detail;
      
      console.log('🔄 [LeftNav] Received handoff event:', { type, placeholderSessionId });

      switch (type) {
        case 'handoff_start':
          // Create placeholder session with loading animation
          const placeholderSession = {
            id: placeholderSessionId,
            type: 'placeholder',
            title: 'Creating Property Analysis...',
            subtitle: propertyInfo.address || propertyInfo.title,
            agent_name: 'Isaac',
            agent_avatar: '/px-isaac.png',
            isLoading: true,
            timestamp: Date.now(),
            enhanced_loading: true
          };
          
          setPlaceholderSessions(prev => new Map(prev.set(placeholderSessionId, placeholderSession)));
          
          // No need to refresh journeys - placeholder is shown via state
          break;
          
        case 'handoff_complete':
          // Remove placeholder and add real session to the journey
          setPlaceholderSessions(prev => {
            const updated = new Map(prev);
            updated.delete(placeholderSessionId);
            return updated;
          });
          
          console.log('✅ [LeftNav] Handoff completed, adding new session to journey:', newSessionData?.id);
          
          // Enrich session data with property address for Isaac sessions
          const propertyAddress = propertyInfo?.address || propertyInfo?.title;
          const enrichedSessionData = newSessionData ? {
            ...newSessionData,
            title: propertyAddress || newSessionData.title || 'Property Analysis',
            subtitle: 'Isaac - Property Deep Dive',
            context: 'Isaac Property Analysis'
          } : null;
          
          // 🎯 NEW STRATEGY 1: Use direct journey ID from handoff event (OPTION 1 IMPLEMENTATION)
          if (enrichedSessionData?.id && journeyId) {
            console.log('🎯 [LeftNav] Using direct journey ID from handoff event:', journeyId);
            const finalSessionData = { ...enrichedSessionData, journey_id: journeyId };
            addSessionToJourneyInPlace(journeyId, finalSessionData);
          }
          // Strategy 2: Try to add to specific journey if we have the enriched session data journey_id
          else if (enrichedSessionData?.id && enrichedSessionData?.journey_id) {
            console.log('🔄 [LeftNav] Using journey_id from session data:', enrichedSessionData.journey_id);
            addSessionToJourneyInPlace(enrichedSessionData.journey_id, enrichedSessionData);
          }
          // Strategy 3: If no direct journey_id but we have parentSessionId, find journey containing the parent session
          else if (enrichedSessionData?.id && parentSessionId) {
            console.log('🔍 [LeftNav] No journey_id, but parentSessionId provided:', parentSessionId);
            // Find the journey that contains the parent Grace session
            // 🔍 DEBUG: Log all journey session IDs to understand why lookup fails
            console.log('🔍 [LeftNav] Looking for parentSessionId:', parentSessionId);
            journeys.forEach(journey => {
              if (journey.sessions && journey.sessions.length > 0) {
                const sessionIds = journey.sessions.map((s: any) => s.id);
                console.log(`🔍 [LeftNav] Journey "${journey.title}" sessions:`, sessionIds);
              }
            });

            const parentJourney = journeys.find(journey => 
              journey.sessions && journey.sessions.some((session: any) => session.id === parentSessionId)
            );
            if (parentJourney) {
              console.log('🎯 [LeftNav] Found parent journey for handoff:', parentJourney.title);
              const finalSessionData = { ...enrichedSessionData, journey_id: parentJourney.id };
              addSessionToJourneyInPlace(parentJourney.id, finalSessionData);
            } else {
              console.log('⚠️ [LeftNav] Parent session not found in any journey, trying fallback strategy');
              
              // Debug: Show all journey expansion states
              console.log('🔍 [LeftNav] All journey expansion states:');
              journeys.forEach(j => {
                console.log(`  Journey "${j.title}": isExpanded=${j.isExpanded}, sessionsLoaded=${j.sessionsLoaded}, sessionCount=${j.sessions?.length || 0}`);
              });
              
              // Strategy 4: Fallback to expanded journey (original strategy)
              const expandedJourney = journeys.find(j => j.isExpanded && j.sessionsLoaded);
              if (expandedJourney) {
                console.log('🔄 [LeftNav] Adding session to expanded journey:', expandedJourney.title);
                const finalSessionData = { ...enrichedSessionData, journey_id: expandedJourney.id };
                addSessionToJourneyInPlace(expandedJourney.id, finalSessionData);
              } else {
                console.warn('⚠️ [LeftNav] No expanded journey found for fallback - session may not appear until refresh');
              }
            }
          }
          // Strategy 4: Final fallback - add to first expanded journey (original strategy)
          else if (enrichedSessionData?.id) {
            console.log('⚠️ [LeftNav] No journey_id or parentSessionId provided, using final fallback');
            const expandedJourney = journeys.find(j => j.isExpanded && j.sessionsLoaded);
            if (expandedJourney) {
              console.log('🔄 [LeftNav] Adding session to expanded journey:', expandedJourney.title);
              const finalSessionData = { ...enrichedSessionData, journey_id: expandedJourney.id };
              addSessionToJourneyInPlace(expandedJourney.id, finalSessionData);
            } else {
              console.warn('⚠️ [LeftNav] No expanded journey found for final fallback - session may not appear until refresh');
            }
          } else {
            console.warn('⚠️ [LeftNav] Missing session data for handoff completion');
          }
          break;
          
        case 'handoff_error':
          // Remove placeholder on error
          setPlaceholderSessions(prev => {
            const updated = new Map(prev);
            updated.delete(placeholderSessionId);
            return updated;
          });
          
          console.error('❌ [LeftNav] Handoff failed:', error);
          break;
      }
    };

    window.addEventListener('leftNavHandoffEvent', handleHandoffEvent as EventListener);
    
    return () => {
      window.removeEventListener('leftNavHandoffEvent', handleHandoffEvent as EventListener);
    };
  }, []);


  // Load journeys from API
  const loadJourneys = useCallback(async () => {
    if (!isAuthenticated) {
      setJourneys([]);
      return;
    }

    try {
      setJourneyLoading(true);
      setJourneyError(null);
      
      console.log('🔄 [LeftNav] Loading journeys WITH SESSIONS from API...');
      const fetchedJourneysWithSessions = await JourneyService.getJourneysWithSessions();
      
      // Transform API data to match UI structure (sessions are now preloaded!)
      const transformedJourneys = fetchedJourneysWithSessions.map((item, index) => {
        const journey = item.journey;
        const sessions = item.sessions || [];
        
        // Transform raw API session data to UI format
        const transformedSessions = sessions.map((session: any) => {
          const sessionTitle = session.title || 'New Chat';
          const sessionMetadata = session.session_metadata || {};
          
          // 🎯 USE RICH METADATA: Get subtitle and tags from persisted session_metadata
          let contextSummary = sessionMetadata.subtitle || 'Exploration session';
          
          // Fallback to generated summary only if no rich subtitle exists
          if (!sessionMetadata.subtitle) {
            if (sessionTitle.length > 30) {
              contextSummary = sessionTitle.substring(0, 30) + '...';
            } else if (sessionTitle !== 'New Chat') {
              contextSummary = `${session.scope === 'exploration' ? 'Search' : 'Analysis'} session`;
            }
          }
          
          return {
            id: session.id,
            agent_name: session.scope === 'exploration' ? 'Grace' : session.scope === 'property_drill' ? 'Isaac' : 'Agent',
            agent_avatar: session.scope === 'exploration' ? '/px-grace.png' : session.scope === 'property_drill' ? '/px-isaac.png' : '/default-avatar.png',
            session_type: session.scope || 'exploration',
            session_title: sessionTitle, // Full title from API
            context_summary: contextSummary, // 🎯 RICH SUBTITLE from persisted metadata
            tags: sessionMetadata.tags || [], // 🎯 RICH TAGS from persisted metadata
            enhanced_info: { // 🎯 CRITICAL: Set enhanced_info for UI rendering compatibility
              title: sessionTitle,
              subtitle: contextSummary,
              tags: sessionMetadata.tags || [],
              searchSummary: contextSummary,
              messageCount: sessionMetadata.messageCount,
              lastActivity: sessionMetadata.lastActivity || session.updated_at
            },
            is_active: false, // Will be updated when session is selected
            enhanced_loading: false,
            updated_at: session.updated_at,
            session_order: session.session_order || 1
          };
        });
        
        return {
          id: journey.id,
          title: journey.title,
          icon_letters: journey.icon_letters,
          color_code: journey.color_code,
          created_at: journey.created_at,
          isExpanded: false, // Start collapsed
          sessions: transformedSessions, // ✅ PROPERLY TRANSFORMED SESSIONS!
          sessionsLoaded: true, // Sessions are already loaded
          sessionsLoading: false // Not loading
        };
      });
      
      setJourneys(transformedJourneys);
      console.log('✅ [LeftNav] Journeys loaded successfully:', transformedJourneys.length);
      
      
    } catch (error) {
      console.error('❌ [LeftNav] Failed to load journeys:', error);
      setJourneyError(error instanceof Error ? error.message : 'Failed to load journeys');
      
      // Fallback to empty state
      setJourneys([]);
    } finally {
      setJourneyLoading(false);
    }
  }, [isAuthenticated]);

  // Load journeys on component mount and auth change (prevent double loading)
  useEffect(() => {
    if (isAuthenticated && !journeyLoadStartedRef.current) {
      journeyLoadStartedRef.current = true;
      loadJourneys();
    } else if (!isAuthenticated) {
      journeyLoadStartedRef.current = false; // Reset on sign out
    }
  }, [isAuthenticated]); // ✅ FIX: Depend on isAuthenticated directly, prevent double auth loading

  // (Duplicate useEffect removed - handled above)

  // Listen for journey refresh events (only for exceptional cases)
  useEffect(() => {
    const handleRefreshJourneys = (event: CustomEvent) => {
      console.log('🔄 [LeftNav] Journey refresh event received');
      
      // Only do full reload if specifically requested (e.g., for error recovery)
      if (event.detail?.force) {
        console.log('⚠️ [LeftNav] Forced journey refresh requested');
        loadJourneys();
      } else {
        console.log('ℹ️ [LeftNav] Ignoring non-forced journey refresh (using targeted updates)');
      }
    };

    window.addEventListener('refreshJourneys', handleRefreshJourneys as EventListener);
    
    return () => {
      window.removeEventListener('refreshJourneys', handleRefreshJourneys as EventListener);
    };
  }, []); // ✅ FIX: Empty dependency array - loadJourneys is stable via useCallback

  return (
    <>
      {/* Toggle Button (visible when collapsed) */}
      {isCollapsed && onToggleCollapse && (
        <Box sx={{
          position: 'fixed',
          top: '50%',
          left: 12,
          transform: 'translateY(-50%)',
          zIndex: 1300,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(0, 0, 0, 0.3)',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-50%) scale(1.05)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
          },
          transition: 'all 0.3s ease-in-out'
        }}
        onClick={onToggleCollapse}
        >
          <ExpandMore sx={{ color: '#000000', transform: 'rotate(-90deg)' }} />
        </Box>
      )}

      {/* Main Navigation Container with Glass Effect */}
      <Box sx={{
        height: '100%',
        width: isCollapsed ? 0 : 320,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        // Glass effect with animated spotlight
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(0, 0, 0, 0.15)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(135deg, 
              rgba(0, 0, 0, 0.08) 0%, 
              rgba(31, 170, 188, 0.02) 30%, 
              transparent 60%,
              rgba(147, 51, 234, 0.04) 100%
            )
          `,
          animation: 'subtleGlow 8s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 1
        },
        '@keyframes subtleGlow': {
          '0%': {
            background: `
              linear-gradient(135deg, 
                rgba(0, 0, 0, 0.08) 0%, 
                rgba(31, 170, 188, 0.02) 30%, 
                transparent 60%,
                rgba(147, 51, 234, 0.04) 100%
              )
            `
          },
          '100%': {
            background: `
              linear-gradient(135deg, 
                rgba(0, 0, 0, 0.12) 0%, 
                rgba(0, 0, 0, 0.04) 40%, 
                transparent 70%,
                rgba(147, 51, 234, 0.08) 100%
              )
            `
          }
        }
      }}>
        <Box sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2, // Above the glass effect
        }}>
      {/* Brand Logo and Toggle at Top */}
      <Box sx={{ 
        p: 2, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1, // Add margin instead of border
        borderRadius: 1.5
      }}>
        <img
          src="/brand.png"
          alt="Banner17"
          style={{
            height: '28px',
            width: 'auto'
          }}
        />
        {onToggleCollapse && (
          <IconButton 
            onClick={onToggleCollapse}
            sx={{
              width: 32,
              height: 32,
              color: '#6b7280',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.08)',
                color: '#000000'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ExpandMore sx={{ transform: 'rotate(90deg)', fontSize: '20px' }} />
          </IconButton>
        )}
      </Box>

      {/* Navigation Items - Compact */}
      <List sx={{ px: 1, py: 1 }}>
        {navigationItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={currentPage === item.page}
                onClick={() => {
                  if (item.expandable) {
                    item.onToggle?.();
                    // For Chats menu, also navigate to chat page when expanding/collapsing
                    if (item.id === 'chats') {
                      onPageChange(item.page);
                    }
                  } else {
                    onPageChange(item.page);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  minHeight: '44px',
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(0, 0, 0, 0.12)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.16)'
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.06)',
                    transform: 'translateX(2px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: '32px', // SLEEK: compact icon space
                  color: currentPage === item.page ? '#000000' : '#6b7280'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: currentPage === item.page ? 600 : 500,
                    fontSize: '0.875rem', // SLEEK: slightly smaller text
                    color: currentPage === item.page ? '#000000' : '#374151'
                  }}
                />
                {item.expandable && (
                  item.expanded ? <ExpandLess sx={{ fontSize: '18px', color: '#6b7280' }} /> : <ExpandMore sx={{ fontSize: '18px', color: '#6b7280' }} />
                )}
              </ListItemButton>
            </ListItem>
            
            {/* Journey Navigation System */}
            {item.id === 'chats' && item.expandable && (
              <Collapse in={item.expanded} timeout="auto" unmountOnExit>
                <Box sx={{ 
                  pl: 1, 
                  pr: 0.5, 
                  py: 0.5,
                  maxHeight: 'calc(100vh - 300px)', // Allow space for header and other navigation items
                  overflowY: 'auto', // Enable vertical scrolling
                  overflowX: 'hidden', // Prevent horizontal scroll
                  position: 'relative', // For gradient overlays
                  // Custom scrollbar styling
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '3px',
                    '&:hover': {
                      background: 'rgba(31, 170, 188, 0.5)',
                    },
                  },
                  // Firefox scrollbar styling
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.05)',
                  // Subtle fade gradients to indicate scrollable content
                  '&::before': {
                    content: '""',
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '8px',
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  },
                  '&::after': {
                    content: '""',
                    position: 'sticky',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '8px',
                    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  },
                }}>
                  
                  {/* New Journey Button */}
                  <ListItemButton
                    onClick={handleNewJourney}
                    sx={{
                      borderRadius: 2,
                      minHeight: '44px',
                      bgcolor: 'rgba(0, 0, 0, 0.06)',
                      color: '#000000',
                      mb: 2,
                      mx: 1,
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: '32px', color: 'inherit' }}>
                      <Add />
                    </ListItemIcon>
                    <ListItemText
                      primary="New Journey"
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    />
                  </ListItemButton>

                  {/* Journey List */}
                  {journeyLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={20} sx={{ color: '#6b7280' }} />
                    </Box>
                  )}
                  
                  {journeyError && (
                    <Typography variant="caption" sx={{ color: '#ef4444', pl: 2, py: 1, display: 'block' }}>
                      Failed to load journeys: {journeyError}
                    </Typography>
                  )}
                  
                  {!journeyLoading && journeys.map((journey) => (
                    <React.Fragment key={journey.id}>
                      
                      {/* Journey Header - Timeline Design */}
                      <Box sx={{ position: 'relative' }}>
                        {/* Journey Timeline Node - Standard Brand Color */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: '#000000', // Standard brand color
                            border: '3px solid rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            zIndex: 2
                          }}
                        />
                        
                        {/* Vertical Timeline Line (continues below) */}
                        {journey.isExpanded && journey.sessions && journey.sessions.length > 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: -1,
                              top: 24,
                              bottom: -12,
                              width: 2,
                              bgcolor: 'rgba(0, 0, 0, 0.25)', // Standard brand color with transparency
                              borderRadius: 1,
                              zIndex: 1
                            }}
                          />
                        )}
                        
                        <ListItemButton
                          onClick={() => handleJourneyToggle(journey.id)}
                          sx={{
                            borderRadius: 3,
                            minHeight: '52px',
                            mb: 2,
                            ml: 2, // Space for timeline
                            mr: 1,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 3px 16px rgba(0, 0, 0, 0.15)',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.08)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)'
                            },
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          
                          {/* 🎯 ENHANCED: Loading animation for journey creation */}
                          {journey.isCreating ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} sx={{ color: '#000000' }} />
                              <ListItemText
                                primary="Creating Your Journey..."
                                secondary="Setting up your property exploration"
                                primaryTypographyProps={{
                                  fontWeight: 600,
                                  fontSize: '0.9rem',
                                  color: '#000000', // Highlighted color for loading
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                secondaryTypographyProps={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  mt: 0.25,
                                  fontStyle: 'italic'
                                }}
                              />
                            </Box>
                          ) : (
                            <ListItemText
                              primary={journey.title}
                              secondary={journey.created_at ? new Date(journey.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              }) : 'Recently created'}
                              primaryTypographyProps={{
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                color: '#1f2937',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              secondaryTypographyProps={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                mt: 0.25
                              }}
                            />
                          )}

                          {/* Journey Menu Button */}
                          <IconButton
                            size="small"
                            onClick={(e) => handleJourneyMenuOpen(e, journey.id)}
                            sx={{
                              color: '#6b7280',
                              '&:hover': {
                                color: '#000000',
                                bgcolor: 'rgba(0, 0, 0, 0.08)'
                              },
                              transition: 'all 0.2s ease-in-out',
                              mr: 1
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                          
                          {journey.sessionsLoading ? (
                            <CircularProgress 
                              size={18} 
                              sx={{ color: '#000000' }} // Standard brand color
                            />
                          ) : journey.isExpanded ? (
                            <ExpandLess sx={{ fontSize: '20px', color: '#000000' }} />
                          ) : (
                            <ExpandMore sx={{ fontSize: '20px', color: '#000000' }} />
                          )}
                        </ListItemButton>
                      </Box>

                      {/* Journey Sessions - Timeline Design */}
                      <Collapse in={journey.isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                          pl: 4, // More space for timeline
                          pr: 0.5, 
                          py: 0.5,
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 22,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            bgcolor: `${journey.color_code}25`,
                            borderRadius: 1
                          }
                        }}>
                          {journey.sessionsLoading ? (
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              py: 2.5, 
                              px: 2,
                              gap: 1
                            }}>
                              <CircularProgress size={20} sx={{ color: '#000000' }} />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#6b7280', 
                                  fontSize: '0.75rem',
                                  fontStyle: 'italic'
                                }}
                              >
                                Loading sessions...
                              </Typography>
                            </Box>
                          ) : (!journey.sessions || journey.sessions.length === 0) && placeholderSessions.size === 0 ? (
                            <Typography variant="caption" sx={{ color: '#6b7280', pl: 2, py: 1, display: 'block' }}>
                              No sessions in this journey
                            </Typography>
                          ) : (
                            // Combine real sessions and placeholder sessions
                            [...(journey.sessions || []), ...Array.from(placeholderSessions.values())].map((session: any) => {
                              const enhancedInfo = session.enhanced_info || sessionInfoCache.get(session.id);
                              
                              // Special handling for placeholder sessions
                              const isPlaceholder = session.type === 'placeholder' || session.isLoading;
                              
                              const isActiveSession = session.is_active || session.id === currentSessionId;
                              
                              return (
                                <Box
                                  key={session.id}
                                  sx={{
                                    position: 'relative',
                                    mb: 1,
                                  }}
                                >
                                  {/* Session Timeline Dot */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: -26,
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: isActiveSession ? 12 : 8,
                                      height: isActiveSession ? 12 : 8,
                                      borderRadius: '50%',
                                      bgcolor: isPlaceholder 
                                        ? '#000000' // Use standard brand color for placeholders too
                                        : '#000000', // Standard brand color for all sessions
                                      border: `2px solid rgba(255, 255, 255, 0.9)`,
                                      boxShadow: isActiveSession 
                                        ? '0 0 12px rgba(31, 170, 188, 0.6)' 
                                        : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                      zIndex: 2,
                                      transition: 'all 0.2s ease-in-out',
                                      ...(isActiveSession && {
                                        animation: 'sessionPulse 2s ease-in-out infinite'
                                      })
                                    }}
                                  />
                                  
                                  <ListItemButton
                                    onClick={isPlaceholder ? undefined : () => handleSessionSelect(session.id)}
                                    onMouseEnter={!isPlaceholder ? (e) => handleSessionHover(session.id, e) : undefined}
                                    onMouseLeave={!isPlaceholder ? handleSessionHoverLeave : undefined}
                                    disabled={isPlaceholder}
                                    sx={{
                                      borderRadius: 2.5,
                                      py: 2,
                                      px: 2.5,
                                      ml: 0.5,
                                      mb: 1.5,
                                      minHeight: enhancedInfo ? '80px' : '60px',
                                      bgcolor: isPlaceholder 
                                        ? 'rgba(37, 99, 235, 0.08)' 
                                        : isActiveSession 
                                          ? 'rgba(0, 0, 0, 0.12)' 
                                          : 'rgba(255, 255, 255, 0.7)',
                                      backdropFilter: 'blur(6px)',
                                      boxShadow: isPlaceholder
                                        ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                                        : isActiveSession 
                                          ? '0 4px 16px rgba(0, 0, 0, 0.25)'
                                          : '0 2px 10px rgba(0, 0, 0, 0.15)',
                                      opacity: isPlaceholder ? 0.8 : 1,
                                      cursor: isPlaceholder ? 'default' : 'pointer',
                                      '&:hover': !isPlaceholder ? {
                                        bgcolor: 'rgba(0, 0, 0, 0.15)',
                                        transform: 'translateX(6px) translateY(-1px)',
                                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
                                      } : undefined,
                                      transition: 'all 0.3s ease-in-out',
                                      // Animation effects when session is updating
                                      ...(animatingSessionIds.has(session.id) && {
                                        animation: 'sessionUpdateWave 2s ease-in-out',
                                        boxShadow: '0 0 12px rgba(31, 170, 188, 0.4), inset 0 0 12px rgba(0, 0, 0, 0.08)',
                                        '&::before': {
                                          content: '""',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          borderRadius: 1.5,
                                          background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.3), transparent)',
                                          animation: 'sessionUpdateWaveMove 2s ease-in-out infinite'
                                        }
                                      }),
                                      // Global animation keyframes
                                      '@keyframes sessionUpdateWave': {
                                        '0%': { transform: 'scale(1)', opacity: 1 },
                                        '25%': { transform: 'scale(1.02)', opacity: 0.9 },
                                        '50%': { transform: 'scale(1.01)', opacity: 0.95 },
                                        '75%': { transform: 'scale(1.015)', opacity: 0.85 },
                                        '100%': { transform: 'scale(1)', opacity: 1 }
                                      },
                                      '@keyframes sessionUpdateWaveMove': {
                                        '0%': { transform: 'translateX(-100%)' },
                                        '100%': { transform: 'translateX(100%)' }
                                      },
                                      '@keyframes sessionPulse': {
                                        '0%, 100%': { boxShadow: '0 0 12px rgba(31, 170, 188, 0.6)' },
                                        '50%': { boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)' }
                                      },
                                      position: 'relative',
                                      overflow: 'hidden'
                                    }}
                                  >
                                  {/* Agent Avatar with Loading for Placeholder */}
                                  <Box sx={{ 
                                    position: 'relative', 
                                    mr: 1.5, 
                                    alignSelf: 'flex-start', 
                                    mt: 0.5 
                                  }}>
                                    <Avatar
                                      src={session.agent_avatar}
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        bgcolor: isPlaceholder ? '#2563eb' : '#000000',
                                        fontSize: '0.7rem',
                                      }}
                                    >
                                      {session.agent_name?.charAt(0) || '?'}
                                    </Avatar>
                                    
                                    {/* Loading spinner overlay for placeholder */}
                                    {isPlaceholder && (
                                      <CircularProgress
                                        size={12}
                                        sx={{
                                          position: 'absolute',
                                          top: '50%',
                                          left: '50%',
                                          transform: 'translate(-50%, -50%)',
                                          color: '#2563eb'
                                        }}
                                      />
                                    )}
                                  </Box>
                                  
                                  <Box sx={{ width: '100%', minWidth: 0 }}>
                                    {/* Enhanced Session Info */}
                                    {enhancedInfo ? (
                                      <>
                                        {/* Line 1: Title */}
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            fontWeight: session.is_active ? 600 : 500,
                                            fontSize: '0.8rem',
                                            color: session.is_active ? '#000000' : '#374151',
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            lineHeight: 1.2
                                          }}
                                        >
                                          {enhancedInfo.title}
                                        </Typography>
                                        
                                        {/* Line 2: Subtitle */}
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            fontSize: '0.7rem',
                                            color: 'rgba(0,0,0,0.7)',
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            mt: 0.25,
                                            lineHeight: 1.1
                                          }}
                                        >
                                          {enhancedInfo.subtitle}
                                        </Typography>
                                        
                                        {/* Line 3: Tags */}
                                        {enhancedInfo.tags.length > 0 && (
                                          <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {enhancedInfo.tags.slice(0, 3).map((tag: string, index: number) => (
                                              <Chip
                                                key={index}
                                                label={tag}
                                                size="small"
                                                sx={{
                                                  height: '16px',
                                                  fontSize: '0.6rem',
                                                  bgcolor: 'rgba(0, 0, 0, 0.08)',
                                                  color: '#000000',
                                                  '& .MuiChip-label': {
                                                    px: 0.5
                                                  }
                                                }}
                                              />
                                            ))}
                                          </Box>
                                        )}
                                      </>
                                    ) : session.enhanced_loading ? (
                                      <>
                                        <Skeleton variant="text" width="80%" height={20} />
                                        <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
                                        <Skeleton variant="rectangular" width={40} height={12} sx={{ mt: 0.5, borderRadius: 1 }} />
                                      </>
                                    ) : (
                                      // Fallback to basic session info
                                      <>
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            fontWeight: session.is_active ? 600 : 500,
                                            fontSize: '0.75rem',
                                            color: session.is_active ? '#000000' : '#374151',
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {session.session_title || `${session.agent_name || 'Agent'}: Session`}
                                        </Typography>
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            fontSize: '0.65rem',
                                            color: 'rgba(0,0,0,0.6)',
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            mt: 0.25
                                          }}
                                        >
                                          {session.context_summary || 'Session'}
                                        </Typography>
                                      </>
                                    )}
                                  </Box>
                                </ListItemButton>
                                </Box>
                              );
                            })
                          )}
                        </Box>
                      </Collapse>

                      {/* Journey Menu */}
                      <Menu
                        anchorEl={journeyMenuAnchor[journey.id]}
                        open={Boolean(journeyMenuAnchor[journey.id])}
                        onClose={() => handleJourneyMenuClose(journey.id)}
                        PaperProps={{
                          sx: {
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 2,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                            border: '1px solid rgba(0, 0, 0, 0.08)'
                          }
                        }}
                      >
                        <MenuItem 
                          onClick={() => handleEditJourneyTitle(journey.id, journey.title)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.08)'
                            }
                          }}
                        >
                          <Edit sx={{ fontSize: 18, mr: 1.5, color: '#000000' }} />
                          <Typography sx={{ fontSize: '0.875rem', color: '#374151' }}>
                            Edit Journey Title
                          </Typography>
                        </MenuItem>
                        
                        <MenuItem 
                          onClick={() => handleDeleteJourney(journey.id)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                              bgcolor: 'rgba(239, 68, 68, 0.08)'
                            }
                          }}
                        >
                          <Delete sx={{ fontSize: 18, mr: 1.5, color: '#ef4444' }} />
                          <Typography sx={{ fontSize: '0.875rem', color: '#374151' }}>
                            Delete Journey
                          </Typography>
                        </MenuItem>
                      </Menu>
                      
                    </React.Fragment>
                  ))}

                  {/* Empty State / Refresh Option */}
                  {!journeyLoading && journeys.length === 0 && !journeyError && (
                    <Typography variant="caption" sx={{ color: '#9ca3af', pl: 2, py: 1, display: 'block' }}>
                      No journeys yet. Create your first journey!
                    </Typography>
                  )}
                  
                  {journeyError && (
                    <Button
                      onClick={loadJourneys}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        color: '#6b7280',
                        minHeight: '28px',
                        textTransform: 'none',
                        fontWeight: 500,
                        width: '100%',
                        justifyContent: 'flex-start',
                        pl: 2,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                          color: '#000000'
                        }
                      }}
                      startIcon={<BugReport sx={{ fontSize: '12px' }} />}
                    >
                      Retry loading journeys
                    </Button>
                  )}
                  
                </Box>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>



      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Plan Indicator and Member Menu Group */}
      <Box sx={{ px: 1, py: 1.5, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        {/* Plan Indicator - Above Member Menu */}
        {planData && (
          <Box sx={{ mb: 1 }}>
            <CompactPlanInfo 
              planData={planData}
              onShowCapabilities={onShowCapabilities}
            />
          </Box>
        )}

        {/* Member User Menu */}
        {isAuthenticated && user && (
          <ListItemButton
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            sx={{
              borderRadius: 1.5,
              py: 1,
              px: 1.5,
              minHeight: '44px',
              bgcolor: 'transparent', // SLEEK: transparent by default
              border: '1px solid rgba(0, 0, 0, 0.2)', // SLEEK: subtle brand border
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)', // SLEEK: subtle brand hover
                borderColor: 'rgba(0, 0, 0, 0.3)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: '36px' }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: '#000000', // SLEEK: brand color
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#1f2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.email?.split('@')[0] || 'Member'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.7rem',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {planData?.planName || 'Pro Plan'}
                  </Typography>
                </Box>
              }
            />
            <Box sx={{ ml: 1 }}>
              <ExpandMore sx={{ fontSize: '18px', color: '#6b7280' }} />
            </Box>
          </ListItemButton>
        )}

        {/* User Profile Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          PaperProps={{
            sx: {
              minWidth: 200,
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.2)', // SLEEK: brand border
              bgcolor: 'rgba(255, 255, 255, 0.95)', // SLEEK: semi-transparent
              '& .MuiMenuItem-root': {
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.08)' // SLEEK: brand hover
                }
              }
            }
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <MenuItem 
            onClick={() => {
              setUserMenuAnchor(null);
              onPageChange('my-properties');
            }}
          >
            <ListItemIcon>
              <Business fontSize="small" sx={{ color: '#000000' }} />
            </ListItemIcon>
            My Properties
          </MenuItem>
          <MenuItem 
            onClick={() => {
              setUserMenuAnchor(null);
              onPageChange('usage-billing');
            }}
          >
            <ListItemIcon>
              <Receipt fontSize="small" sx={{ color: '#000000' }} />
            </ListItemIcon>
            Usage & Billing
          </MenuItem>
          <MenuItem 
            onClick={() => {
              setUserMenuAnchor(null);
              onPageChange('settings');
            }}
          >
            <ListItemIcon>
              <Settings fontSize="small" sx={{ color: '#000000' }} />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider sx={{ mx: 1, borderColor: 'rgba(0, 0, 0, 0.15)' }} />
          <MenuItem 
            onClick={() => {
              setUserMenuAnchor(null);
              // Add logout functionality here
            }}
            sx={{ color: '#ef4444' }} // Red for logout
          >
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: '#ef4444' }} />
            </ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>
      </Box>

      {/* Subtle Debug Console Link (Development) */}
      {chatProps?.sessionMetrics && (
        <Box sx={{ px: 2, py: 0.5, textAlign: 'center' }}>
          <Button
            size="small"
            variant="text"
            startIcon={<BugReport sx={{ fontSize: 14 }} />}
            onClick={() => setShowDebugDialog(true)}
            sx={{
              fontSize: '0.65rem',
              color: 'rgba(156, 163, 175, 0.7)', // Very subtle gray
              textTransform: 'none',
              minWidth: 'auto',
              padding: '2px 6px',
              '&:hover': {
                color: 'rgba(0, 0, 0, 0.8)', // Brand color on hover
                bgcolor: 'rgba(0, 0, 0, 0.04)' // Very subtle background
              }
            }}
          >
            Debug Console
          </Button>
        </Box>
      )}

      {/* Compact Footer */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#9ca3af',
            display: 'block',
            textAlign: 'center',
            fontSize: '0.65rem' // SLEEK: smaller footer text
          }}
        >
          {import.meta.env.VITE_APP_VERSION || `v0.0.${new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)}`}
        </Typography>
      </Box>

      {/* ✅ LEGACY CLEANUP: Removed Full History Dialog (redundant with journeys architecture) */}

      {/* Comprehensive Debug Session Info Dialog */}
      <Dialog
        open={showDebugDialog}
        onClose={() => setShowDebugDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <ComprehensiveDebugInfo
            sessionMetrics={chatProps?.sessionMetrics}
            messages={chatProps?.messages || []}
            currentModel={chatProps?.currentModel || 'gemini-2.5-flash-lite'}
            availableTools={chatProps?.availableTools || []}
            debugInfo={chatProps?.debugInfo}
            directRender={true}
          />
        </DialogContent>
      </Dialog>

      {/* Session Hover Information Popover */}
      <Popover
        open={Boolean(hoveredSession)}
        anchorEl={hoveredSession?.anchorEl}
        onClose={handleSessionHoverLeave}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            maxWidth: 320,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }
        }}
        sx={{
          pointerEvents: 'none' // Allow mouse to pass through for better UX
        }}
      >
        {hoveredSession?.info && (
          <Box sx={{ p: 2 }}>
            {/* Header */}
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 600, 
              color: '#000000',
              mb: 0.5
            }}>
              {hoveredSession.info.title}
            </Typography>
            
            <Typography variant="caption" sx={{ 
              color: 'rgba(0,0,0,0.7)',
              display: 'block',
              mb: 1
            }}>
              {hoveredSession.info.subtitle}
            </Typography>
            
            {/* Search Summary */}
            <Typography variant="caption" sx={{ 
              color: 'rgba(0,0,0,0.6)',
              display: 'block',
              mb: 1,
              lineHeight: 1.3
            }}>
              {hoveredSession.info.searchSummary}
            </Typography>
            
            {/* Tags */}
            {hoveredSession.info.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                {hoveredSession.info.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    sx={{
                      height: '18px',
                      fontSize: '0.65rem',
                      bgcolor: 'rgba(0, 0, 0, 0.08)',
                      color: '#000000',
                      '& .MuiChip-label': {
                        px: 0.75
                      }
                    }}
                  />
                ))}
              </Box>
            )}
            
            {/* Footer */}
            {hoveredSession.info.lastActivity && (
              <Typography variant="caption" sx={{ 
                color: 'rgba(0,0,0,0.5)',
                fontStyle: 'italic',
                fontSize: '0.6rem'
              }}>
                Last activity: {new Date(hoveredSession.info.lastActivity).toLocaleDateString()}
              </Typography>
            )}
            
            <Typography variant="caption" sx={{ 
              color: 'rgba(0, 0, 0, 0.8)',
              fontWeight: 500,
              fontSize: '0.6rem',
              display: 'block',
              mt: 0.5
            }}>
              Click to resume session
            </Typography>
          </Box>
        )}
      </Popover>


      {/* Edit Journey Title Dialog */}
      <Dialog
        open={Boolean(showEditDialog)}
        onClose={() => setShowEditDialog(null)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#1f2937', fontWeight: 600 }}>
          Edit Journey Title
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Enter journey title"
              variant="outlined"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000'
                  }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowEditDialog(null)}
            sx={{ color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveJourneyTitle}
            variant="contained"
            disabled={!editingTitle.trim()}
            sx={{
              bgcolor: '#000000',
              '&:hover': { bgcolor: '#333333' },
              borderRadius: 2
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Journey Confirmation Dialog */}
      <Dialog
        open={Boolean(showDeleteConfirm)}
        onClose={() => setShowDeleteConfirm(null)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#1f2937', fontWeight: 600 }}>
          Delete Journey
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#374151', mb: 2 }}>
            Are you sure you want to delete this journey?
          </Typography>
          <Box sx={{
            bgcolor: 'rgba(239, 68, 68, 0.08)',
            borderRadius: 2,
            p: 2,
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <Typography sx={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
              ⚠️ Warning: All related chat sessions will also be permanently deleted.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowDeleteConfirm(null)}
            sx={{ color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteJourney}
            variant="contained"
            sx={{
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
              borderRadius: 2
            }}
          >
            Delete Journey
          </Button>
        </DialogActions>
      </Dialog>
        </Box> {/* Close inner navigation container */}
      </Box> {/* Close main glass effect container */}
    </> 
  );
};

export default LeftNavigation;

