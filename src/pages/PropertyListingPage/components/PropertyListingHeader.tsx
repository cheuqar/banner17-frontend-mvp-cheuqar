import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Chat as ChatIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Property Listing Header Component
 * Features: Banner17 branding, navigation, modern design
 */
const PropertyListingHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
        borderBottom: '3px solid #0d47a1'
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        {/* Banner17 Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 }
            }}
            onClick={() => navigate('/')}
          >
            {/* Logo Icon */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #ffffff 0%, #f0f7ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <HomeIcon sx={{ color: '#1976d2', fontSize: 28 }} />
            </Box>

            {/* Brand Name */}
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                Banner17
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem'
                }}
              >
                Property Discovery
              </Typography>
            </Box>
          </Box>

          {/* Beta Badge */}
          <Chip
            label="BETA"
            size="small"
            sx={{
              ml: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          />
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<ChatIcon />}
            onClick={() => navigate('/chat')}
            sx={{
              color: 'white',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }
            }}
          >
            Chat with Grace
          </Button>

          <IconButton
            color="inherit"
            onClick={() => navigate('/profile')}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <PersonIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Breadcrumb/Page Info */}
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          px: 3,
          py: 1,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500
          }}
        >
          Browse Properties / Search & Discover
        </Typography>
      </Box>
    </AppBar>
  );
};

export default PropertyListingHeader;