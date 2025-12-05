import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { selectThemeColors } from '../../store/slices/themeSlice';

/**
 * HeaderStyle4V2 - Shared navigation header component
 * Clean white header with brand and navigation following Style4-V2 design system
 */
const HeaderStyle4V2: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const themeColors = useAppSelector(selectThemeColors);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const navItems = [
    { label: 'Features', path: '/#features' },
    { label: 'Who We Serve', path: '/#who-we-serve' },
    { label: 'About', path: '/#about' }
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        boxShadow: 'none',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            py: 2,
            minHeight: '64px !important',
          }}
        >
          {/* Brand Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            {/* Theme-aware Logo */}
            <Box
              component="img"
              src={themeColors.logo}
              alt="Banner17"
              sx={{
                height: { xs: 32, sm: 40 },
                width: 'auto',
                mr: 2,
                transition: 'opacity 0.3s ease',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.85rem',
                color: '#666666',
                fontStyle: 'italic',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              AI-powered property search
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  sx={{
                    color: '#666666',
                    fontWeight: 'normal',
                    textTransform: 'none',
                    fontSize: '1rem',
                    px: 2,
                    '&:hover': {
                      color: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  onClick={() => {
                    if (item.path.startsWith('/#')) {
                      // Scroll to section if on landing page
                      const element = document.getElementById(item.path.substring(2));
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        // Navigate to landing page first
                        navigate('/');
                        setTimeout(() => {
                          const element = document.getElementById(item.path.substring(2));
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#000000',
                  color: '#000000',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  ml: 2,
                  border: '2px solid #000000',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: '#000000',
                  },
                }}
                onClick={() => navigate('/search')}
              >
                Get Started
              </Button>
            </Box>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{ color: '#000000' }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {navItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      color: '#666666',
                      '&:hover': {
                        color: '#000000',
                      },
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={() => handleNavigation('/search')}
                  sx={{
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Get Started
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default HeaderStyle4V2;