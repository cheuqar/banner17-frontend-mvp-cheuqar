import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Divider
} from '@mui/material';
import CompactThemeSwitcher from '../common/CompactThemeSwitcher';

/**
 * FooterStyle4V2 - Shared footer component
 * Clean white footer with structured links following Style4-V2 design system
 */
const FooterStyle4V2: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const linkCategories = [
    {
      title: 'Search',
      links: [
        { label: 'Property Search', href: '/search' },
        { label: 'Advanced Filters', href: '/search' },
        { label: 'Saved Searches', href: '/search' },
        { label: 'Market Insights', href: '/search' }
      ]
    },
    {
      title: 'Buyers',
      links: [
        { label: 'First Home Buyers', href: '/#who-we-serve' },
        { label: 'Growing Families', href: '/#who-we-serve' },
        { label: 'Downsizers', href: '/#who-we-serve' },
        { label: 'Investors', href: '/#who-we-serve' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/#about' },
        { label: 'How It Works', href: '/#features' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' }
      ]
    }
  ];


  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e5e5',
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#000000',
                letterSpacing: '-0.5px',
                mb: 2,
              }}
            >
              Banner17
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                lineHeight: 1.6,
                maxWidth: 300,
              }}
            >
              AI-powered property search that understands what you're really looking for.
              Find your perfect home with intelligent search, comprehensive data, and insights
              beyond traditional real estate platforms.
            </Typography>
          </Grid>

          {/* Link Categories */}
          {linkCategories.map((category) => (
            <Grid item xs={6} sm={3} md={2} key={category.title}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#000000',
                  mb: 2,
                }}
              >
                {category.title}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {category.links.map((link) => (
                  <Box component="li" key={link.label} sx={{ mb: 1 }}>
                    <Link
                      href={link.href}
                      sx={{
                        color: '#666666',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        transition: 'color 0.3s ease',
                        '&:hover': {
                          color: '#000000',
                        },
                      }}
                    >
                      {link.label}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: '#e5e5e5', mb: 4 }} />

        {/* Bottom Section */}
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Copyright */}
          <Grid item xs={12} sm={4} md={4}>
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              © {currentYear} Banner17 Limited. Hong Kong.
            </Typography>
          </Grid>

          {/* Theme Switcher - Right */}
          <Grid item xs={12} sm={8} md={8}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', sm: 'flex-end' },
              }}
            >
              <CompactThemeSwitcher darkMode />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FooterStyle4V2;