import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Close,
  MoreHoriz,
  Chat,
  Business,
  Receipt,
  Settings,
  Add,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';

export interface TabData {
  id: string;
  title: string;
  type: 'chat' | 'properties' | 'usage' | 'settings' | 'other';
  content: React.ReactNode;
  closable?: boolean;
  modified?: boolean;
  sessionId?: string;
}

interface TabGroup {
  id: string;
  label: string;
  tabs: TabData[];
}

interface TabbedMainPanelProps {
  tabs: TabData[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  maxVisibleTabs?: number;
}

const TabbedMainPanel: React.FC<TabbedMainPanelProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  maxVisibleTabs = 8
}) => {
  const [tabMenuAnchor, setTabMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTabForMenu, setSelectedTabForMenu] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Group tabs by type for better organization
  const groupTabs = (tabs: TabData[]): TabGroup[] => {
    const groups: { [key: string]: TabData[] } = {
      chat: [],
      properties: [],
      usage: [],
      settings: [],
      other: []
    };

    tabs.forEach(tab => {
      groups[tab.type].push(tab);
    });

    return [
      { id: 'chat', label: 'Chats', tabs: groups.chat },
      { id: 'properties', label: 'Properties', tabs: groups.properties },
      { id: 'usage', label: 'Usage', tabs: groups.usage },
      { id: 'settings', label: 'Settings', tabs: groups.settings },
      { id: 'other', label: 'Other', tabs: groups.other }
    ].filter(group => group.tabs.length > 0);
  };

  const getTabIcon = (type: TabData['type']) => {
    switch (type) {
      case 'chat': return <Chat fontSize="small" />;
      case 'properties': return <Business fontSize="small" />;
      case 'usage': return <Receipt fontSize="small" />;
      case 'settings': return <Settings fontSize="small" />;
      default: return null;
    }
  };

  const handleTabContextMenu = (event: React.MouseEvent, tabId: string) => {
    event.preventDefault();
    setTabMenuAnchor(event.currentTarget as HTMLElement);
    setSelectedTabForMenu(tabId);
  };

  const handleCloseTabMenu = () => {
    setTabMenuAnchor(null);
    setSelectedTabForMenu(null);
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const visibleTabs = tabs.slice(scrollPosition, scrollPosition + maxVisibleTabs);
  const hasHiddenTabs = tabs.length > maxVisibleTabs;
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition + maxVisibleTabs < tabs.length;

  const scrollTabs = (direction: 'left' | 'right') => {
    if (direction === 'left' && canScrollLeft) {
      setScrollPosition(Math.max(0, scrollPosition - 1));
    } else if (direction === 'right' && canScrollRight) {
      setScrollPosition(Math.min(tabs.length - maxVisibleTabs, scrollPosition + 1));
    }
  };

  // Auto-scroll to active tab if it's not visible
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTabId);
    if (activeIndex >= 0) {
      if (activeIndex < scrollPosition) {
        setScrollPosition(activeIndex);
      } else if (activeIndex >= scrollPosition + maxVisibleTabs) {
        setScrollPosition(Math.max(0, activeIndex - maxVisibleTabs + 1));
      }
    }
  }, [activeTabId, tabs, scrollPosition, maxVisibleTabs]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Bar */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        minHeight: '48px'
      }}>
        {/* Left scroll button */}
        {hasHiddenTabs && (
          <IconButton
            size="small"
            onClick={() => scrollTabs('left')}
            disabled={!canScrollLeft}
            sx={{ mx: 0.5 }}
          >
            <KeyboardArrowLeft />
          </IconButton>
        )}

        {/* Tabs container */}
        <Box
          ref={tabsContainerRef}
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Tabs
            value={activeTabId}
            onChange={(_, newValue) => onTabChange(newValue)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              minHeight: '48px',
              '& .MuiTab-root': {
                minHeight: '48px',
                minWidth: '120px',
                maxWidth: '200px',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                px: 1
              }
            }}
          >
            {visibleTabs.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    {getTabIcon(tab.type)}
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        textAlign: 'left'
                      }}
                    >
                      {tab.title}
                    </Typography>
                    {tab.modified && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#f59e0b',
                          flexShrink: 0
                        }}
                      />
                    )}
                    {tab.closable !== false && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTabClose(tab.id);
                        }}
                        sx={{
                          p: 0.25,
                          ml: 0.5,
                          opacity: 0.7,
                          '&:hover': { opacity: 1 }
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Right scroll button */}
        {hasHiddenTabs && (
          <IconButton
            size="small"
            onClick={() => scrollTabs('right')}
            disabled={!canScrollRight}
            sx={{ mx: 0.5 }}
          >
            <KeyboardArrowRight />
          </IconButton>
        )}

        {/* Hidden tabs indicator */}
        {hasHiddenTabs && (
          <Tooltip title={`${tabs.length - maxVisibleTabs} more tabs`}>
            <Chip
              size="small"
              label={`+${tabs.length - visibleTabs.length}`}
              sx={{
                mx: 1,
                height: 24,
                fontSize: '0.75rem',
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6'
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeTab ? (
          activeTab.content
        ) : (
          <Box sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}>
            <Typography variant="body1">
              No active tab selected
            </Typography>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={tabMenuAnchor}
        open={Boolean(tabMenuAnchor)}
        onClose={handleCloseTabMenu}
      >
        <MenuItem
          onClick={() => {
            if (selectedTabForMenu) {
              onTabClose(selectedTabForMenu);
            }
            handleCloseTabMenu();
          }}
        >
          Close Tab
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Close all other tabs except the selected one
            tabs.forEach(tab => {
              if (tab.id !== selectedTabForMenu && tab.closable !== false) {
                onTabClose(tab.id);
              }
            });
            handleCloseTabMenu();
          }}
        >
          Close Others
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Close all tabs to the right
            const selectedIndex = tabs.findIndex(tab => tab.id === selectedTabForMenu);
            if (selectedIndex >= 0) {
              tabs.slice(selectedIndex + 1).forEach(tab => {
                if (tab.closable !== false) {
                  onTabClose(tab.id);
                }
              });
            }
            handleCloseTabMenu();
          }}
        >
          Close to the Right
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TabbedMainPanel;
