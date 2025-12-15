/**
 * Component: UserProfilePanel (TopNavigation)
 *
 * Side drawer panel for user profile menu (Phase 2.31)
 *
 * Features:
 * - Right-side Material-UI Drawer (360px wide)
 * - Menu items: History, Saved Properties, Comparisons
 * - Sticky bottom section: Account Settings, Sign Out, Version code
 * - Smooth slide-in animation (300ms)
 * - Mobile responsive: 90% viewport width on small screens
 * - WCAG AA accessibility compliance
 * - Click outside to close
 *
 * Design Tokens (Style4-V2):
 * - Drawer width: 360px (desktop), 90vw (mobile <600px)
 * - Background: #ffffff
 * - Menu item: 14px/500, color #0b2d2c
 * - Hover: background #f5f5f5
 * - Divider: #e0e0e0
 * - Icons: 20px, color #0b2d2c
 * - Version text: 12px/400, color #999999
 */

import React, { useCallback } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListSubheader,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PaletteIcon from '@mui/icons-material/Palette';
import MapIcon from '@mui/icons-material/Map';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { setTheme, selectCurrentTheme, type ThemeType } from '../../../../store/slices/themeSlice';
import { setMapTileStyle, selectCurrentMapStyle, selectAllTileConfigs, type MapTileStyle } from '../../../../store/slices/mapTileStyleSlice';
import { selectSearchMode, setSearchMode } from '../../../../store/slices/smartSearchSlice';
import SearchIcon from '@mui/icons-material/Search';

interface UserProfilePanelProps {
  open: boolean;
  onClose: () => void;
  onMenuItemClick: (item: 'history' | 'saved' | 'comparisons' | 'settings' | 'signout') => void;
  versionCode?: string;
  settingsOnly?: boolean; // When true, only show settings (Theme, Map Style, Search Mode) without auth-required items
}

interface MenuItem {
  id: 'history' | 'saved' | 'comparisons' | 'settings' | 'signout';
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isBottom?: boolean;
  isDanger?: boolean;
}

/**
 * User Profile Panel Drawer Component
 *
 * Displays user menu with navigation items and account settings
 */
export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({
  open,
  onClose,
  onMenuItemClick,
  versionCode = 'v2.31.0',
  settingsOnly = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectCurrentTheme);
  const currentMapStyle = useAppSelector(selectCurrentMapStyle);
  const allTileConfigs = useAppSelector(selectAllTileConfigs);
  const searchMode = useAppSelector(selectSearchMode);

  /**
   * Handle theme change
   */
  const handleThemeChange = useCallback(
    (event: any) => {
      const newTheme = event.target.value as ThemeType;
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  /**
   * Handle map tile style change
   */
  const handleMapStyleChange = useCallback(
    (event: any) => {
      const newStyle = event.target.value as MapTileStyle;
      dispatch(setMapTileStyle(newStyle));
    },
    [dispatch]
  );

  /**
   * Handle search mode change (Phase 2.56)
   */
  const handleSearchModeChange = useCallback(
    (event: any) => {
      const newMode = event.target.value as 'standard' | 'clustered';
      dispatch(setSearchMode(newMode));
    },
    [dispatch]
  );

  /**
   * Handle menu item click
   */
  const handleMenuItemClick = useCallback(
    (itemId: MenuItem['id']) => {
      onMenuItemClick(itemId);
    },
    [onMenuItemClick]
  );

  /**
   * Menu items configuration
   */
  const menuItems: MenuItem[] = [
    {
      id: 'history',
      label: 'History',
      icon: <HistoryIcon sx={{ fontSize: '20px', color: '#0b2d2c' }} />,
      action: () => handleMenuItemClick('history'),
      isBottom: false,
    },
    {
      id: 'saved',
      label: 'Saved Properties',
      icon: <BookmarkIcon sx={{ fontSize: '20px', color: '#0b2d2c' }} />,
      action: () => handleMenuItemClick('saved'),
      isBottom: false,
    },
    {
      id: 'comparisons',
      label: 'Comparisons',
      icon: <CompareArrowsIcon sx={{ fontSize: '20px', color: '#0b2d2c' }} />,
      action: () => handleMenuItemClick('comparisons'),
      isBottom: false,
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: <SettingsIcon sx={{ fontSize: '20px', color: '#0b2d2c' }} />,
      action: () => handleMenuItemClick('settings'),
      isBottom: true,
    },
    {
      id: 'signout',
      label: 'Sign Out',
      icon: <LogoutIcon sx={{ fontSize: '20px', color: '#d32f2f' }} />,
      action: () => handleMenuItemClick('signout'),
      isBottom: true,
      isDanger: true,
    },
  ];

  // Separate menu items into top and bottom sections
  const topMenuItems = menuItems.filter((item) => !item.isBottom);
  const bottomMenuItems = menuItems.filter((item) => item.isBottom);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      aria-label="User profile menu"
      sx={{
        '& .MuiDrawer-paper': {
          width: isMobile ? '90vw' : '360px',
          maxWidth: 'calc(100vw - 32px)',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #e0e0e0',
          boxShadow: 'none',
        },
      }}
    >
      {/* Drawer Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Settings-Only Header */}
        {settingsOnly && (
          <Box
            sx={{
              padding: '16px',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#0b2d2c',
              }}
            >
              Settings
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '12px',
                color: '#666666',
                marginTop: '4px',
              }}
            >
              Customize your experience
            </Typography>
          </Box>
        )}

        {/* Top Menu Items - Hidden when settingsOnly */}
        <List
          sx={{
            flex: 1,
            padding: 0,
            overflow: 'auto',
          }}
        >
          {!settingsOnly && topMenuItems.map((item, index) => (
            <ListItem
              key={item.id}
              disablePadding
              sx={{
                borderBottom: index < topMenuItems.length - 1 ? 'none' : '1px solid #e0e0e0',
              }}
            >
              <ListItemButton
                onClick={item.action}
                aria-label={item.label}
                sx={{
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  minHeight: '48px',
                  color: '#0b2d2c',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  '&:focus': {
                    outline: '2px solid #0b2d2c',
                    outlineOffset: '-2px',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#0b2d2c',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Theme Selector Section */}
          <Box
            sx={{
              padding: '16px',
              borderTop: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0',
              marginTop: 'auto',
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="theme-select-label" sx={{ fontSize: '14px', color: '#0b2d2c' }}>
                Theme
              </InputLabel>
              <Select
                labelId="theme-select-label"
                id="theme-select"
                value={currentTheme}
                label="Theme"
                onChange={handleThemeChange}
                aria-label="Select theme"
                sx={{
                  fontSize: '14px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0b2d2c',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0b2d2c',
                  },
                }}
              >
                <MenuItem value="theme-a">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0b2d2c 50%, #fff0de 50%)',
                        border: '1px solid #e0e0e0',
                      }}
                    />
                    <Typography fontSize="14px">Theme A (Warm Teal)</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="theme-b">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #022e35 50%, #cdecf5 50%)',
                        border: '1px solid #e0e0e0',
                      }}
                    />
                    <Typography fontSize="14px">Theme B (Cool Cyan)</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Map Tile Style Selector Section */}
          <Box
            sx={{
              padding: '16px',
              borderTop: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="map-tile-select-label" sx={{ fontSize: '14px', color: '#0b2d2c' }}>
                Map Style
              </InputLabel>
              <Select
                labelId="map-tile-select-label"
                id="map-tile-select"
                value={currentMapStyle}
                label="Map Style"
                onChange={handleMapStyleChange}
                aria-label="Select map tile style"
                sx={{
                  fontSize: '14px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0b2d2c',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0b2d2c',
                  },
                }}
              >
                {/* CARTO Maps Group */}
                <ListSubheader sx={{ fontSize: '12px', fontWeight: 600, color: '#666666' }}>
                  CARTO Maps
                </ListSubheader>
                <MenuItem value="light">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ fontSize: '16px', color: '#f5f5f5' }} />
                    <Typography fontSize="14px">Light</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="dark">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ fontSize: '16px', color: '#2c2c2c' }} />
                    <Typography fontSize="14px">Dark</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="voyager">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ fontSize: '16px', color: '#7b9ea8' }} />
                    <Typography fontSize="14px">Voyager</Typography>
                  </Box>
                </MenuItem>

                {/* OpenStreetMap Group */}
                <ListSubheader sx={{ fontSize: '12px', fontWeight: 600, color: '#666666' }}>
                  OpenStreetMap
                </ListSubheader>
                <MenuItem value="osm_standard">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ fontSize: '16px', color: '#7ebc6f' }} />
                    <Typography fontSize="14px">Standard</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="osm_humanitarian">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ fontSize: '16px', color: '#d96b6b' }} />
                    <Typography fontSize="14px">Humanitarian</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="osm_cyclosm">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ fontSize: '16px', color: '#8b4789' }} />
                    <Typography fontSize="14px">CyclOSM</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="osm_france">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ fontSize: '16px', color: '#0055a4' }} />
                    <Typography fontSize="14px">France</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="osm_topo">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon sx={{ fontSize: '16px', color: '#d2691e' }} />
                    <Typography fontSize="14px">Topo</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Search Mode Selector Section (Phase 2.56) */}
          <Box
            sx={{
              padding: '16px',
              borderTop: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="search-mode-select-label" sx={{ fontSize: '14px', color: '#0b2d2c' }}>
                Search Mode
              </InputLabel>
              <Select
                labelId="search-mode-select-label"
                id="search-mode-select"
                value={searchMode}
                label="Search Mode"
                onChange={handleSearchModeChange}
                aria-label="Select search mode"
                sx={{
                  fontSize: '14px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0b2d2c',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0b2d2c',
                  },
                }}
              >
                <MenuItem value="standard">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SearchIcon sx={{ fontSize: '16px', color: '#0b2d2c' }} />
                    <Typography fontSize="14px">Standard Search</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="clustered">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SearchIcon sx={{ fontSize: '16px', color: '#4caf50' }} />
                    <Typography fontSize="14px">Clustered Search (Beta)</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </List>

        {/* Sticky Bottom Section - Hidden when settingsOnly (except version) */}
        <Box
          sx={{
            padding: '16px',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Auth-required menu items - only show when not settingsOnly */}
          {!settingsOnly && bottomMenuItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={item.action}
              aria-label={item.label}
              sx={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '10px',
                paddingBottom: '10px',
                minHeight: '40px',
                color: item.isDanger ? '#d32f2f' : '#0b2d2c',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: item.isDanger ? 'rgba(211, 47, 47, 0.08)' : '#f5f5f5',
                },
                '&:focus': {
                  outline: '2px solid #0b2d2c',
                  outlineOffset: '-2px',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: item.isDanger ? '#d32f2f' : '#0b2d2c',
                }}
              />
            </ListItemButton>
          ))}

          {/* Version Code */}
          <Box
            sx={{
              marginTop: settingsOnly ? '0px' : '12px',
              paddingTop: '12px',
              borderTop: settingsOnly ? 'none' : '1px solid #e0e0e0',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '12px',
                fontWeight: 400,
                color: '#999999',
              }}
            >
              {versionCode}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default UserProfilePanel;
