import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings,
  AccountCircle,
  Timeline
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import UserProfileMenu from '../auth/UserProfileMenu';
import ComprehensiveDebugInfo from '../developer/ComprehensiveDebugInfo';

interface AppHeaderProps {
  showHistory: boolean;
  onToggleHistory: () => void;
  showNavigation: boolean;
  onToggleNavigation: () => void;
  // Chat-specific props (optional)
  currentPage?: string;
  chatProps?: {
    onNewChat?: () => void;
    onShowCapabilities?: () => void;
    isLoading?: boolean;
    planData?: any;
    sessionMetrics?: any;
    messages?: any[];
    onEditSessionName?: (name: string) => void;
    CompactPlanInfo?: React.ComponentType<any>;
    CompactSessionInfo?: React.ComponentType<any>;
    EnhancedToolsControl?: React.ComponentType<any>;
    currentModel?: string;
    availableTools?: any[];
    debugInfo?: any;
  };
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showHistory,
  onToggleHistory,
  showNavigation,
  onToggleNavigation,
  currentPage,
  chatProps
}) => {
  const { user } = useAuth();
  const isChatPage = currentPage === 'chat';

  return (
    <Box sx={{
      minHeight: '64px',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', // SLEEK: dark gradient theme
      borderBottom: '1px solid rgba(31, 170, 188, 0.2)', // SLEEK: brand border for dark theme
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 3,
      py: 1,
      zIndex: 1000,
      flexWrap: 'wrap',
      gap: 1,
      color: 'white' // SLEEK: white text for dark background
    }}>
      {/* Left side - Navigation toggle and title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <Tooltip title={showNavigation ? 'Hide Navigation' : 'Show Navigation'}>
          <IconButton
            onClick={onToggleNavigation}
            sx={{
              bgcolor: 'rgba(31, 170, 188, 0.1)', // SLEEK: brand color background
              '&:hover': {
                bgcolor: 'rgba(31, 170, 188, 0.2)' // SLEEK: brand hover
              }
            }}
          >
            <MenuIcon sx={{ color: '#0d2b2c' }} />
          </IconButton>
        </Tooltip>
        
        <img
          src="/brand.png"
          alt="Banner17"
          style={{
            height: '32px',
            width: 'auto'
          }}
        />
      </Box>

      {/* Center - Chat-specific controls (only show when in chat) */}
      {isChatPage && chatProps && user && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          flex: 1, 
          justifyContent: 'center',
          minWidth: 0,
          overflow: 'hidden'
        }}>

          {/* Comprehensive Debug Info (Development Only) */}
          <ComprehensiveDebugInfo
            sessionMetrics={chatProps.sessionMetrics}
            messages={chatProps.messages || []}
            currentModel={chatProps.currentModel || 'gemini-2.5-flash-lite'}
            availableTools={chatProps.availableTools || []}
            debugInfo={chatProps.debugInfo}
          />
        </Box>
      )}

      {/* Right side - Plan info, history toggle and user menu */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        {/* Plan Info - Compact (moved from center) */}
        {isChatPage && chatProps && chatProps.CompactPlanInfo && chatProps.planData && (
          <chatProps.CompactPlanInfo
            planName={chatProps.planData.planName}
            planTier={chatProps.planData.planTier}
            monthlyQueries={chatProps.planData.monthlyQueries}
            apiCalls={chatProps.planData.apiCalls}
            propertyAnalyses={chatProps.planData.propertyAnalyses}
            onUpgradeClick={chatProps.onShowCapabilities}
          />
        )}
        
        {/* Session Debug Button (moved from contextual bar) */}
        {isChatPage && chatProps?.sessionMetrics && (
          <Tooltip title="Session Activity & Metrics">
            <IconButton
              onClick={() => {
                // This will trigger the debug info from the chat interface
                if (chatProps.onEditSessionName) {
                  console.log('Session debug clicked'); 
                  // You could expand this to show a proper session debug dialog
                }
              }}
              sx={{
                bgcolor: 'transparent',
                color: '#0d2b2c', // SLEEK: brand color
                border: '1px solid rgba(31, 170, 188, 0.2)', // SLEEK: brand border
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: 'rgba(31, 170, 188, 0.05)', // SLEEK: brand hover
                  borderColor: 'rgba(31, 170, 188, 0.3)'
                }
              }}
            >
              <Timeline sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}

        {user && <UserProfileMenu user={user} />}
      </Box>
    </Box>
  );
};

export default AppHeader;
