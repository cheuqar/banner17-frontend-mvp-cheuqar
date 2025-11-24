import React from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  NotificationAdd,
  EventBusy,
  Gavel,
  Home,
  Event,
} from '@mui/icons-material';
import type {
  InspectionTime,
  InspectionTimesCardProps,
} from '../../../types/property-enhanced';

/**
 * Inspection Times Card Component
 * Displays property inspection times with formatting and actions
 * Handles multiple inspection formats and empty states
 */
const InspectionTimesCard: React.FC<InspectionTimesCardProps> = ({
  inspections,
  onScheduleReminder,
}) => {
  // Parse inspection times from various formats
  const parseInspectionTimes = (inspections: (string | InspectionTime)[]): InspectionTime[] => {
    return inspections.map((inspection, index) => {
      if (typeof inspection === 'string') {
        // Parse string format like "Sat 14 Dec 2:00-2:30 PM"
        return {
          formatted_display: inspection,
          date: extractDate(inspection),
          time_start: extractTimeStart(inspection),
          time_end: extractTimeEnd(inspection),
        };
      }
      return inspection;
    });
  };

  // Extract date from inspection string
  const extractDate = (inspection: string): string => {
    const dateMatch = inspection.match(/(\w{3}\s+\d{1,2}\s+\w{3})/);
    return dateMatch ? dateMatch[1] : '';
  };

  // Extract start time from inspection string
  const extractTimeStart = (inspection: string): string => {
    const timeMatch = inspection.match(/(\d{1,2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '';
  };

  // Extract end time from inspection string
  const extractTimeEnd = (inspection: string): string => {
    const timeMatch = inspection.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
    return timeMatch ? timeMatch[2] : '';
  };

  // Format inspection time for better display
  const formatInspectionTime = (inspection: InspectionTime): string => {
    if (inspection.formatted_display) {
      return inspection.formatted_display;
    }

    const parts = [];
    if (inspection.date) parts.push(inspection.date);
    if (inspection.time_start && inspection.time_end) {
      parts.push(`${inspection.time_start} - ${inspection.time_end}`);
    } else if (inspection.time_start) {
      parts.push(`from ${inspection.time_start}`);
    }

    return parts.join(' • ') || 'Time TBA';
  };

  // Get inspection type icon
  const getInspectionTypeIcon = (type?: string) => {
    switch (type) {
      case 'auction':
        return <Gavel color="warning" />;
      case 'private':
        return <Home color="info" />;
      case 'open_house':
      default:
        return <AccessTime color="primary" />;
    }
  };

  // Get inspection type chip
  const getInspectionTypeChip = (type?: string) => {
    if (!type || type === 'open_house') return null;

    const typeConfig = {
      auction: { label: 'Auction', color: 'warning' as const },
      private: { label: 'Private', color: 'info' as const },
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    if (!config) return null;

    return (
      <Chip
        label={config.label}
        size="small"
        color={config.color}
        sx={{ ml: 1, fontSize: '0.75rem' }}
      />
    );
  };

  // Handle reminder scheduling
  const handleReminder = (inspection: InspectionTime) => {
    if (onScheduleReminder) {
      onScheduleReminder(inspection);
    } else {
      // Default reminder action - could integrate with calendar API
      console.log('Schedule reminder for:', inspection);
    }
  };

  // Parse all inspections
  const parsedInspections = parseInspectionTimes(inspections);

  // Empty state
  if (!parsedInspections || parsedInspections.length === 0) {
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
        <Typography variant="h6" gutterBottom fontWeight={600}>
          <CalendarToday sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
          Inspection Times
        </Typography>

        <Box
          sx={{
            textAlign: 'center',
            py: 3,
            color: 'text.secondary'
          }}
        >
          <EventBusy sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body2" gutterBottom>
            No scheduled inspections
          </Typography>
          <Typography variant="caption">
            Contact agent for private viewing
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2,
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
      <Typography variant="h6" gutterBottom fontWeight={600}>
        <CalendarToday sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
        Inspection Times
        <Chip
          label={`${parsedInspections.length} scheduled`}
          size="small"
          sx={{ ml: 2, fontSize: '0.75rem' }}
          color="primary"
        />
      </Typography>

      <List dense sx={{ mt: 1 }}>
        {parsedInspections.map((inspection, index) => (
          <ListItem
            key={index}
            sx={{
              px: 0,
              py: 1,
              borderBottom: index < parsedInspections.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getInspectionTypeIcon(inspection.type)}
            </ListItemIcon>

            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight={500}>
                    {formatInspectionTime(inspection)}
                  </Typography>
                  {getInspectionTypeChip(inspection.type)}
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  {inspection.date && inspection.time_start && (
                    <Typography variant="caption" color="text.secondary">
                      📅 {inspection.date} • ⏰ {inspection.time_start}
                      {inspection.time_end && ` - ${inspection.time_end}`}
                    </Typography>
                  )}
                </Box>
              }
            />

            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                size="small"
                onClick={() => handleReminder(inspection)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                  },
                }}
              >
                <NotificationAdd />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Event />}
            sx={{
              textTransform: 'none',
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          >
            Add to Calendar
          </Button>

          <Button
            variant="text"
            size="small"
            startIcon={<NotificationAdd />}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            Set Reminders
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 Tip: Arrive 5-10 minutes early for inspections
        </Typography>
      </Box>
    </Paper>
  );
};

export default InspectionTimesCard;