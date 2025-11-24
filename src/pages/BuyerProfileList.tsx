/**
 * Buyer Profile List Page
 *
 * Displays all saved buyer profiles with management actions
 * Phase 3.6: Profile Management UI
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBuyerProfiles } from '../hooks/useBuyerProfiles';
import BuyerProfileCard from '../components/buyerProfile/BuyerProfileCard';

/**
 * Main buyer profile list page component
 */
const BuyerProfileList: React.FC = () => {
  const navigate = useNavigate();
  const { profiles, loading, error, refetch, deleteProfile } = useBuyerProfiles();

  /**
   * Handle edit profile
   */
  const handleEdit = (profileId: string) => {
    navigate(`/buyer-profile-builder/${profileId}`);
  };

  /**
   * Handle copy profile
   */
  const handleCopy = async (profileId: string) => {
    // Find the profile to copy
    const profileToCopy = profiles.find((p) => p.id === profileId);
    if (!profileToCopy) {
      console.error('Profile not found:', profileId);
      return;
    }

    console.log('📋 Copying profile:', profileToCopy.profile_name);

    // Navigate to builder with copy mode
    navigate('/buyer-profile-builder', {
      state: {
        copyFrom: profileToCopy,
      },
    });
  };

  /**
   * Handle delete profile
   */
  const handleDelete = async (profileId: string): Promise<boolean> => {
    return await deleteProfile(profileId);
  };

  /**
   * Handle create new profile
   */
  const handleCreateNew = () => {
    navigate('/buyer-profile-builder');
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#000', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666' }}>
            Loading your profiles...
          </Typography>
        </Box>
      </Box>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  /**
   * Render empty state
   */
  if (profiles.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#000',
                mb: 2,
              }}
            >
              No Buyer Profiles Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                mb: 4,
              }}
            >
              Create your first buyer profile to start saving your property search criteria.
              Profiles help you quickly search with your preferred filters.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{
                textTransform: 'none',
                backgroundColor: '#000',
                color: '#fff',
                px: 4,
                py: 1.5,
                fontSize: '16px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              Create Your First Profile
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  /**
   * Render profile list
   */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: '#000',
                mb: 1,
              }}
            >
              Buyer Profiles
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
              }}
            >
              Manage your saved property search profiles
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{
              textTransform: 'none',
              backgroundColor: '#000',
              color: '#fff',
              px: 3,
              py: 1.5,
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#333',
              },
            }}
          >
            Create New Profile
          </Button>
        </Box>

        {/* Profile Grid */}
        <Grid container spacing={3}>
          {profiles.map((profile) => (
            <Grid item xs={12} sm={6} md={4} key={profile.id}>
              <BuyerProfileCard
                profile={profile}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BuyerProfileList;
