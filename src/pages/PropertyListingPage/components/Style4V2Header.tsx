import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import style4V2Theme, { style4V2Styles } from '../theme/style4V2Theme';

/**
 * Style4-V2 Header Component
 * Clean, minimalist header following Banner17's Style4-V2 design system
 */
const Style4V2Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={style4V2Theme}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: style4V2Styles.colors.backgroundWhite,
          borderBottom: `1px solid ${style4V2Styles.colors.dividerColor}`,
          boxShadow: 'none',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 2, px: 0 }}>
            {/* Banner17 Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Box
                sx={{
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                  transition: 'opacity 0.3s ease'
                }}
                onClick={() => navigate('/')}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: style4V2Styles.colors.primaryBlack,
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                  }}
                >
                  Banner17
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.85rem',
                    color: style4V2Styles.colors.secondaryGray,
                    ml: 2,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  Property Discovery
                </Typography>
              </Box>
            </Box>

            {/* Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={() => navigate('/chat')}
                sx={{
                  color: style4V2Styles.colors.secondaryGray,
                  fontWeight: 'normal',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    color: style4V2Styles.colors.primaryBlack,
                    backgroundColor: style4V2Styles.colors.hoverOverlay,
                  },
                }}
              >
                Chat with Grace
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                sx={{
                  ml: 1,
                  px: 3,
                  py: 1,
                  fontSize: '0.875rem',
                }}
              >
                Account
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
};

export default Style4V2Header;