/**
 * BuyerProfileCard Component
 *
 * Displays a single buyer profile as a card with actions
 * Phase 3.6: Profile Management UI
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { BuyerProfile } from '../../hooks/useBuyerProfiles';

interface BuyerProfileCardProps {
  profile: BuyerProfile;
  onEdit: (profileId: string) => void;
  onCopy: (profileId: string) => void;
  onDelete: (profileId: string) => Promise<boolean>;
}

/**
 * Format relative time (e.g., "5 days ago")
 */
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Format location summary
 */
const formatLocationSummary = (locationCriteria?: BuyerProfile['basic_criteria']['location_criteria']): string => {
  if (!locationCriteria) return 'No location specified';

  const state = locationCriteria.state || 'Unknown';
  const suburbs = locationCriteria.suburbs || [];

  if (suburbs.length === 0) return `${state} - Any suburb`;
  if (suburbs.length === 1) return `${state} - ${suburbs[0]}`;
  return `${state} - ${suburbs.length} suburbs`;
};

/**
 * Format property criteria summary
 */
const formatPropertySummary = (basicCriteria: BuyerProfile['basic_criteria']): string => {
  const parts: string[] = [];

  // Property types
  if (basicCriteria.property_types && basicCriteria.property_types.length > 0) {
    parts.push(basicCriteria.property_types.join(', '));
  }

  // Bedrooms
  if (basicCriteria.bedrooms_min) {
    parts.push(`${basicCriteria.bedrooms_min}+ bed`);
  }

  // Budget
  if (basicCriteria.budget_min && basicCriteria.budget_max) {
    const formatPrice = (price: number) => {
      if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
      if (price >= 1000) return `$${(price / 1000).toFixed(0)}k`;
      return `$${price}`;
    };
    parts.push(`${formatPrice(basicCriteria.budget_min)}-${formatPrice(basicCriteria.budget_max)}`);
  }

  return parts.join(', ') || 'No criteria specified';
};

const BuyerProfileCard: React.FC<BuyerProfileCardProps> = ({
  profile,
  onEdit,
  onCopy,
  onDelete,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const success = await onDelete(profile.id);
    setDeleting(false);

    if (success) {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          backgroundColor: '#fff',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Header: Icon + Name */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                fontSize: '32px',
                mr: 2,
                flexShrink: 0,
              }}
            >
              {profile.icon_emoji}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#000',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={profile.profile_name}
              >
                {profile.profile_name}
              </Typography>
              {profile.profile_description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={profile.profile_description}
                >
                  {profile.profile_description}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Location */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
              Location:
            </Typography>
            <Chip
              label={formatLocationSummary(profile.basic_criteria.location_criteria)}
              size="small"
              sx={{
                backgroundColor: '#f5f5f5',
                color: '#000',
                fontWeight: 500,
                fontSize: '12px',
              }}
            />
          </Box>

          {/* Property Criteria */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
              Criteria:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#333',
                fontSize: '13px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={formatPropertySummary(profile.basic_criteria)}
            >
              {formatPropertySummary(profile.basic_criteria)}
            </Typography>
          </Box>

          {/* Created Date */}
          <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
            Created {formatRelativeTime(profile.created_at)}
          </Typography>
        </CardContent>

        {/* Actions */}
        <Box
          sx={{
            p: 2,
            pt: 0,
            display: 'flex',
            gap: 1,
            borderTop: '1px solid #f0f0f0',
            mt: 'auto',
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(profile.id)}
            sx={{
              flex: 1,
              textTransform: 'none',
              color: '#000',
              borderColor: '#e0e0e0',
              '&:hover': {
                borderColor: '#000',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CopyIcon />}
            onClick={() => onCopy(profile.id)}
            sx={{
              flex: 1,
              textTransform: 'none',
              color: '#000',
              borderColor: '#e0e0e0',
              '&:hover': {
                borderColor: '#000',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Copy
          </Button>
          <IconButton
            size="small"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: '#ffebee',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Profile</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{profile.profile_name}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ textTransform: 'none', color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            sx={{
              textTransform: 'none',
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BuyerProfileCard;
