/**
 * TopNavigation Component - Phase 2.28.2
 *
 * Tier 1 of the two-tier Smart Search Header
 *
 * Features:
 * - Brand (Banner17 home link)
 * - Navigation items: Buy, Sell, Sold, School (with state), Daycare, Amenities
 * - Sign In button
 * - Style4-V2 design system compliance
 * - Full responsive support (mobile, tablet, desktop)
 * - WCAG AA accessibility compliance
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { setTransactionType } from '../../../../store/slices/searchFilters';
import { togglePanel } from '../../../../store/slices/smartSearchSlice';
import { selectThemeColors } from '../../../../store/slices/themeSlice';
import { useAuth } from '../../../../contexts/AuthContext';
import UserProfileButton from './UserProfileButton';
import UserProfilePanel from './UserProfilePanel';

/**
 * Navigation item configuration
 */
interface NavItem {
  label: string;
  type?: 'buy' | 'sell' | 'sold';
  action?: () => void;
  enabled: boolean;
  active?: boolean;
}

/**
 * TopNavigation Component
 */
const TopNavigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const transactionType = useAppSelector((state) => state.searchFilters.transactionType);
  const activePanel = useAppSelector((state) => state.smartSearch.mapControls.activePanel);
  const themeColors = useAppSelector(selectThemeColors);
  const { isAuthenticated, signOut } = useAuth();

  // Coming Soon modal state
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState('');

  // User Profile Panel state
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  // Country selector state
  const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null);
  const countryMenuOpen = Boolean(countryAnchorEl);
  const [selectedCountry] = useState('AU'); // Currently only Australia is available

  // Country options
  const countries = [
    { code: 'AU', name: 'Australia', flag: '🇦🇺', available: true },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', available: false },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', available: false },
  ];

  const handleCountryMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCountryAnchorEl(event.currentTarget);
  };

  const handleCountryMenuClose = () => {
    setCountryAnchorEl(null);
  };

  const handleCountrySelect = (countryCode: string, available: boolean) => {
    if (!available) {
      setComingSoonMessage(`${countries.find(c => c.code === countryCode)?.name} property search is coming soon!`);
      setComingSoonOpen(true);
    }
    handleCountryMenuClose();
  };

  /**
   * Handle coming soon click
   */
  const handleComingSoon = (feature: string) => {
    setComingSoonMessage(`${feature} search is coming soon!`);
    setComingSoonOpen(true);
  };

  /**
   * Handle close coming soon modal
   */
  const handleCloseComingSoon = () => {
    setComingSoonOpen(false);
    setComingSoonMessage('');
  };

  /**
   * Handle navigation item click
   */
  const handleNavItemClick = (item: NavItem) => {
    if (!item.enabled) {
      return;
    }

    if (item.type) {
      // Buy, Sell, Sold buttons
      dispatch(setTransactionType(item.type));
    } else if (item.action) {
      // School or Coming Soon buttons
      item.action();
    }
  };

  /**
   * Handle user profile menu item click
   */
  const handleProfileMenuClick = useCallback(
    async (menuItem: 'history' | 'saved' | 'comparisons' | 'settings' | 'signout') => {
      switch (menuItem) {
        case 'history':
          // Navigate to chat history page
          window.location.href = '/chat-history';
          break;
        case 'saved':
          console.log('[TopNavigation] Saved Properties clicked - Coming Soon');
          // TODO: Navigate to saved properties page when available
          break;
        case 'comparisons':
          console.log('[TopNavigation] Comparisons clicked - Coming Soon');
          // TODO: Navigate to comparisons page when available
          break;
        case 'settings':
          console.log('[TopNavigation] Account Settings clicked - Coming Soon');
          // TODO: Navigate to settings page when available
          break;
        case 'signout':
          setProfilePanelOpen(false);
          await signOut();
          // FR-011, FR-048: Redirect to sign-in with return URL to preserve user location
          const returnUrl = window.location.pathname + window.location.search;
          window.location.href = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
          break;
        default:
          console.log('[TopNavigation] Unknown menu item:', menuItem);
      }
    },
    [signOut]
  );

  /**
   * Navigation items configuration
   */
  const navigationItems: NavItem[] = [
    {
      label: 'Buy',
      type: 'buy',
      enabled: true,
      active: transactionType === 'buy',
    },
    {
      label: 'Sell',
      type: 'sell',
      enabled: true,
      active: transactionType === 'sell',
    },
    {
      label: 'Sold',
      type: 'sold',
      enabled: true,
      active: transactionType === 'sold',
    },
    {
      label: 'School',
      action: () => dispatch(togglePanel('schools')),
      enabled: true,
      active: activePanel === 'schools',
    },
    {
      label: 'Daycare',
      action: () => handleComingSoon('Daycare'),
      enabled: false,
    },
    {
      label: 'Amenities',
      action: () => dispatch(togglePanel('amenities')),
      enabled: true,
      active: activePanel === 'amenities',
    },
  ];

  return (
    <>
      {/* Top Navigation Container */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '60px',
          px: { xs: 2, sm: 3, md: 4 }, // 16px, 24px, 32px
          py: 0, // Remove vertical padding to allow logo to use full height
          backgroundColor: themeColors.primaryLight, // Theme background color
        }}
      >
        {/* Left: Brand + Country Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link
            href="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '100%',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.3s ease',
              '&:hover': {
                opacity: 0.8,
              },
            }}
            aria-label="Banner17 home page"
          >
            <img
              src={themeColors.logo}
              alt="Banner17"
              style={{
                height: '44px',
                width: 'auto',
                display: 'block',
              }}
            />
          </Link>

          {/* Country Selector */}
          <Button
            onClick={handleCountryMenuOpen}
            aria-controls={countryMenuOpen ? 'country-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={countryMenuOpen ? 'true' : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.75,
              borderRadius: '20px',
              border: `1px solid ${themeColors.primaryDark}20`,
              backgroundColor: 'transparent',
              color: themeColors.primaryDark,
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: `${themeColors.primaryDark}08`,
                borderColor: `${themeColors.primaryDark}40`,
              },
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {countries.find(c => c.code === selectedCountry)?.flag}
            </span>
            <Typography
              component="span"
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              {countries.find(c => c.code === selectedCountry)?.name}
            </Typography>
            <KeyboardArrowDownIcon
              sx={{
                fontSize: '18px',
                transition: 'transform 0.2s ease',
                transform: countryMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Button>
          <Menu
            id="country-menu"
            anchorEl={countryAnchorEl}
            open={countryMenuOpen}
            onClose={handleCountryMenuClose}
            MenuListProps={{
              'aria-labelledby': 'country-button',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                minWidth: '200px',
              },
            }}
          >
            {countries.map((country) => (
              <MenuItem
                key={country.code}
                onClick={() => handleCountrySelect(country.code, country.available)}
                selected={country.code === selectedCountry}
                sx={{
                  py: 1.5,
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  opacity: country.available ? 1 : 0.5,
                  '&:hover': {
                    backgroundColor: country.available
                      ? `${themeColors.linkButtonActive}10`
                      : 'rgba(0,0,0,0.04)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: `${themeColors.linkButtonActive}15`,
                    '&:hover': {
                      backgroundColor: `${themeColors.linkButtonActive}20`,
                    },
                  },
                }}
              >
                <span style={{ fontSize: '20px' }}>{country.flag}</span>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: country.available ? themeColors.primaryDark : '#999999',
                    }}
                  >
                    {country.name}
                  </Typography>
                  {!country.available && (
                    <Typography
                      sx={{
                        fontSize: '11px',
                        color: '#999999',
                        fontStyle: 'italic',
                      }}
                    >
                      Coming Soon
                    </Typography>
                  )}
                </Box>
                {country.code === selectedCountry && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: themeColors.linkButtonActive,
                    }}
                  />
                )}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Center/Right: Navigation Items */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              onClick={() => handleNavItemClick(item)}
              disabled={!item.enabled}
              aria-label={`Navigation: ${item.label}`}
              aria-pressed={item.active || false}
              sx={{
                fontSize: '15px',
                fontWeight: item.active ? 700 : 600,
                color: item.active ? themeColors.linkButtonActive : (item.enabled ? themeColors.primaryDark : '#999999'),
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0px 4px',
                paddingBottom: '4px',
                cursor: item.enabled ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase',
                transition: 'opacity 0.3s ease',
                letterSpacing: '0.5px',
                '&:hover': {
                  opacity: item.enabled ? 0.7 : 0.5,
                  backgroundColor: 'transparent',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Far Right: User Profile Button (Authenticated) or Sign In Button (Unauthenticated) */}
        <UserProfileButton
          onProfileClick={() => setProfilePanelOpen(true)}
          isLoading={false}
        />
      </Box>

      {/* User Profile Panel Drawer */}
      <UserProfilePanel
        open={profilePanelOpen}
        onClose={() => setProfilePanelOpen(false)}
        onMenuItemClick={handleProfileMenuClick}
        versionCode="v2.31.0"
      />

      {/* Coming Soon Modal */}
      <Dialog
        open={comingSoonOpen}
        onClose={handleCloseComingSoon}
        aria-labelledby="coming-soon-title"
        aria-describedby="coming-soon-description"
      >
        <DialogTitle id="coming-soon-title">Coming Soon!</DialogTitle>
        <DialogContent id="coming-soon-description">
          <Box sx={{ mt: 2 }}>
            {comingSoonMessage && <p>{comingSoonMessage}</p>}
            <p>Stay tuned for this feature.</p>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseComingSoon}
            autoFocus
            sx={{
              color: themeColors.primaryDark,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TopNavigation;
