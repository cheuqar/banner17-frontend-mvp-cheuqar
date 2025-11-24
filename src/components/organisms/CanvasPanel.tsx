import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  Close,
  PushPin,
  PushPinOutlined,
  Fullscreen,
  FullscreenExit,
  Settings,
  ArrowBack
} from '@mui/icons-material';

export interface CanvasTab {
  id: string;
  title: string;
  type: 'address' | 'price' | 'media' | 'features';
  data: any;
  isActive: boolean;
  isPinned: boolean;
  content: React.ReactNode;
}

interface CanvasPanelProps {
  tabs?: CanvasTab[];
  onTabClose?: (tabId: string) => void;
  onTabAdd?: (tab: CanvasTab) => void;
  onTabFocus?: (tabId: string) => void;
  onBackToChat?: (tabId: string) => void;
}

const CanvasPanel: React.FC<CanvasPanelProps> = ({ 
  tabs = [], 
  onTabClose,
  onTabAdd,
  onTabFocus,
  onBackToChat
}) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localTabs, setLocalTabs] = useState<CanvasTab[]>([
    // Demo tabs for showcase
    {
      id: 'demo-address',
      title: 'Location Analysis',
      type: 'address',
      data: { address: '123 Campbell Parade, Bondi Beach' },
      isActive: true,
      isPinned: false,
      content: (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Demo Location Analysis</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            This is a demo of the comprehensive location analysis that would appear when you expand an address input card.
            Try expanding an actual address input to see the full interactive dashboard!
          </Typography>
        </Box>
      )
    },
    {
      id: 'demo-pricing',
      title: 'Market Analysis',
      type: 'price',
      data: { price: 2850000 },
      isActive: true,
      isPinned: true,
      content: (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Demo Market Analysis</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            This is a demo of the comprehensive market analysis that would appear when you expand a pricing input card.
            Try expanding an actual pricing input to see the full interactive dashboard with sliders and insights!
          </Typography>
        </Box>
      )
    }
  ]);

  // Combine props tabs with local demo tabs
  const allTabs = [...tabs, ...localTabs];
  const activeTabs = allTabs.filter(tab => tab.isActive);

  // Set first tab as active if none selected
  useEffect(() => {
    if (activeTabs.length > 0 && !activeTab) {
      setActiveTab(activeTabs[0].id);
    }
  }, [activeTabs, activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    if (onTabFocus) {
      onTabFocus(newValue);
    }
  };

  const handleTabClose = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Update local tabs first
    setLocalTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, isActive: false } : tab
    ));

    // Call external close handler - this will communicate back to ChatInterface
    if (onTabClose) {
      onTabClose(tabId);
    }

    // Switch to another tab if current was closed
    if (activeTab === tabId) {
      const remainingTabs = allTabs.filter(tab => tab.isActive && tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0].id);
      } else {
        setActiveTab('');
      }
    }
  };

  const handleTabPin = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setLocalTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, isPinned: !tab.isPinned } : tab
    ));
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleBackToChat = () => {
    const currentTab = allTabs.find(tab => tab.id === activeTab);
    if (currentTab && onBackToChat) {
      onBackToChat(currentTab.id);
    }
  };

  const currentTab = allTabs.find(tab => tab.id === activeTab);

  // If no active tabs, show empty state
  if (activeTabs.length === 0) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#fafbfc',
        p: 4
      }}>
        <Typography variant="h6" sx={{ color: '#6b7280', mb: 2, textAlign: 'center' }}>
          Canvas Panel
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', textAlign: 'center', mb: 3 }}>
          Expand info cards from the chat to view detailed analysis here.
        </Typography>
        <Box sx={{ 
          width: 120, 
          height: 80, 
          border: '2px dashed #cbd5e1', 
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            📊 Charts & Data
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#9ca3af', mt: 2, textAlign: 'center' }}>
          Look for the ↗️ expand button on contextual inputs
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: isFullscreen ? 'white' : 'transparent',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      right: isFullscreen ? 0 : 'auto',
      bottom: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto'
    }}>
      {/* Canvas Header with Tabs */}
      <Box sx={{ borderBottom: '1px solid #e5e7eb', bgcolor: 'white' }}>
        {/* Header Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          px: 2, 
          py: 1.5,
          borderBottom: '1px solid #f3f4f6'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
            Canvas ({activeTabs.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={handleFullscreenToggle}
              sx={{ color: '#6b7280' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
            </IconButton>
            <IconButton 
              size="small"
              sx={{ color: '#6b7280' }}
              title="Settings"
            >
              <Settings fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
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
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#6b7280',
              minWidth: 120,
              '&.Mui-selected': {
                color: '#2563eb',
              }
            }
          }}
        >
          {activeTabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  minWidth: 0,
                  maxWidth: 200
                }}>
                  {/* Tab Icon */}
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: tab.type === 'address' ? '#10b981' : 
                             tab.type === 'price' ? '#2563eb' : 
                             tab.type === 'media' ? '#f59e0b' : '#6b7280',
                    borderRadius: '50%',
                    flexShrink: 0
                  }} />
                  
                  {/* Tab Title */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0
                    }}
                  >
                    {tab.title}
                  </Typography>
                  
                  {/* Pin Button */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleTabPin(tab.id, e)}
                    sx={{ 
                      p: 0.25,
                      minWidth: 'auto',
                      color: tab.isPinned ? '#2563eb' : '#9ca3af',
                      '&:hover': {
                        color: '#2563eb'
                      }
                    }}
                  >
                    {tab.isPinned ? 
                      <PushPin sx={{ fontSize: 12 }} /> : 
                      <PushPinOutlined sx={{ fontSize: 12 }} />
                    }
                  </IconButton>
                  
                  {/* Close Button */}
                  {!tab.isPinned && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleTabClose(tab.id, e)}
                      sx={{ 
                        p: 0.25,
                        minWidth: 'auto',
                        color: '#9ca3af',
                        '&:hover': {
                          color: '#ef4444'
                        }
                      }}
                    >
                      <Close sx={{ fontSize: 12 }} />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Canvas Content */}
      <Box sx={{ flex: 1, bgcolor: 'white', overflow: 'auto' }}>
        {currentTab ? (
          <Box sx={{ height: '100%' }}>
            {/* Tab Status Bar */}
            <Box sx={{ 
              px: 3, 
              py: 2, 
              bgcolor: '#f8fafc', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={currentTab.isActive ? 'Active' : 'Read Only'}
                  size="small"
                  color={currentTab.isActive ? 'success' : 'default'}
                  sx={{ fontSize: '0.75rem' }}
                />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {currentTab.type === 'address' && '📍 Location Analysis'}
                  {currentTab.type === 'price' && '💰 Market Analysis'}
                  {currentTab.type === 'media' && '📸 Media Analysis'}
                  {currentTab.type === 'features' && '🏠 Feature Analysis'}
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<ArrowBack />}
                onClick={handleBackToChat}
                sx={{ 
                  color: '#6b7280',
                  '&:hover': {
                    color: '#2563eb',
                    bgcolor: '#eff6ff'
                  }
                }}
              >
                Back to Chat
              </Button>
            </Box>

            {/* Tab Content */}
            <Box sx={{ 
              height: 'calc(100% - 73px)', 
              overflow: 'auto'
            }}>
              {currentTab.content}
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af'
          }}>
            <Typography variant="body2">
              Select a tab to view content
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CanvasPanel; 