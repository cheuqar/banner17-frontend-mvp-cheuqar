import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Rating,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Language,
  Star,
  Reviews,
} from '@mui/icons-material';
import type {
  AgentDetails,
  ContactAction,
  AgentContactCardProps,
} from '../../../types/property-enhanced';

/**
 * Agent Contact Card Component
 * Displays agent information with contact actions
 * Handles missing agent information gracefully
 */
const AgentContactCard: React.FC<AgentContactCardProps> = ({
  agent,
  onContactClick,
  compact = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle contact action
  const handleContact = (method: ContactAction, value: string) => {
    switch (method) {
      case 'phone':
        window.open(`tel:${value}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${value}`, '_self');
        break;
      case 'website':
        window.open(value, '_blank', 'noopener,noreferrer');
        break;
    }
    onContactClick(method, value);
  };

  // Format phone number for display
  const formatPhoneNumber = (phone?: string): string => {
    if (!phone) return '';

    // Remove any non-numeric characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Basic Australian phone formatting
    if (cleaned.startsWith('+61')) {
      const number = cleaned.slice(3);
      if (number.length >= 9) {
        return `+61 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5)}`;
      }
    } else if (cleaned.startsWith('04') && cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
    }

    return phone; // Return original if formatting fails
  };

  // Show fallback if no agent information
  if (!agent || !agent.name) {
    return (
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'grey.300' }}>
            <Person sx={{ color: 'grey.600' }} />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" color="text.secondary">
              Contact Agent
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Agent information not available
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: compact ? 1.5 : 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: isMobile && !compact ? 'flex-start' : 'center',
        flexDirection: isMobile && !compact ? 'column' : 'row',
        gap: 2
      }}>
        {/* Agent Avatar */}
        <Avatar
          src={agent.photo_url}
          sx={{
            width: compact ? 48 : 56,
            height: compact ? 48 : 56,
            alignSelf: isMobile && !compact ? 'center' : 'auto',
          }}
          alt={agent.name}
        >
          {!agent.photo_url && <Person />}
        </Avatar>

        {/* Agent Information */}
        <Box flex={1} sx={{ textAlign: isMobile && !compact ? 'center' : 'left' }}>
          <Typography
            variant={compact ? "subtitle1" : "h6"}
            fontWeight={600}
            gutterBottom
          >
            {agent.name}
          </Typography>

          {agent.company && (
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              {agent.company}
            </Typography>
          )}

          {/* Agent Rating */}
          {agent.rating && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 0.5,
              justifyContent: isMobile && !compact ? 'center' : 'flex-start'
            }}>
              <Rating
                value={agent.rating}
                readOnly
                size="small"
                icon={<Star fontSize="inherit" />}
              />
              {agent.reviews_count && (
                <Typography variant="caption" color="text.secondary">
                  ({agent.reviews_count} reviews)
                </Typography>
              )}
            </Box>
          )}

          {/* Agent Specialties */}
          {agent.specialties && agent.specialties.length > 0 && !compact && (
            <Box sx={{
              mt: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              {agent.specialties.slice(0, 2).map((specialty, index) => (
                <Chip
                  key={index}
                  label={specialty}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  }}
                />
              ))}
              {agent.specialties.length > 2 && (
                <Chip
                  label={`+${agent.specialties.length - 2} more`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    borderColor: 'grey.400',
                    color: 'text.secondary',
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Contact Actions */}
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile && !compact ? 'row' : 'column',
          gap: 1,
          minWidth: isMobile && !compact ? 'auto' : 120,
          width: isMobile && !compact ? '100%' : 'auto',
        }}>
          {agent.phone && (
            <Button
              variant="contained"
              size={compact ? "small" : "medium"}
              startIcon={<Phone />}
              onClick={() => handleContact('phone', agent.phone!)}
              sx={{
                minWidth: compact ? 100 : 120,
                flex: isMobile && !compact ? 1 : 'none',
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  color: 'white',
                },
              }}
            >
              Call
            </Button>
          )}

          {agent.email && (
            <Button
              variant="outlined"
              size={compact ? "small" : "medium"}
              startIcon={<Email />}
              onClick={() => handleContact('email', agent.email!)}
              sx={{
                minWidth: compact ? 100 : 120,
                flex: isMobile && !compact ? 1 : 'none',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              Email
            </Button>
          )}

          {agent.website_url && !compact && (
            <Button
              variant="text"
              size="small"
              startIcon={<Language />}
              onClick={() => handleContact('website', agent.website_url!)}
              sx={{
                minWidth: 120,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Website
            </Button>
          )}
        </Box>
      </Box>

      {/* Agent Bio (non-compact mode only) */}
      {agent.bio && !compact && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {agent.bio.length > 150 ? `${agent.bio.substring(0, 150)}...` : agent.bio}
          </Typography>
        </Box>
      )}

      {/* Contact Information Display */}
      {(agent.phone || agent.email) && compact && (
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          {agent.phone && (
            <Typography variant="caption" color="text.secondary" display="block">
              📞 {formatPhoneNumber(agent.phone)}
            </Typography>
          )}
          {agent.email && (
            <Typography variant="caption" color="text.secondary" display="block">
              ✉️ {agent.email}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default AgentContactCard;