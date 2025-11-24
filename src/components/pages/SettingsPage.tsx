import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Palette,
  Language,
  Save,
  Edit
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Profile settings
    displayName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    bio: '',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    
    // Chat settings
    autoSave: true,
    showTimestamps: true,
    compactMode: false,
    
    // Privacy settings
    dataCollection: true,
    analytics: true,
    
    // Appearance settings
    theme: 'light',
    language: 'en'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving settings:', settings);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Customize your experience and manage your preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ color: '#3b82f6', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={settings.displayName}
                    onChange={(e) => handleSettingChange('displayName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={settings.email}
                    disabled
                    helperText="Contact support to change your email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={settings.bio}
                    onChange={(e) => handleSettingChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Chat Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Chat Settings
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSave}
                        onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                      />
                    }
                    label="Auto-save conversations"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showTimestamps}
                          onChange={(e) => handleSettingChange('showTimestamps', e.target.checked)}
                        />
                      }
                      label="Show message timestamps"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.compactMode}
                          onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                        />
                      }
                      label="Compact chat mode"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ color: '#3b82f6', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                  }
                  label="Push notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.marketingEmails}
                      onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                    />
                  }
                  label="Marketing emails"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ color: '#3b82f6', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Privacy & Security
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.dataCollection}
                      onChange={(e) => handleSettingChange('dataCollection', e.target.checked)}
                    />
                  }
                  label="Allow data collection for service improvement"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.analytics}
                      onChange={(e) => handleSettingChange('analytics', e.target.checked)}
                    />
                  }
                  label="Enable usage analytics"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" color="error">
                  Delete Account
                </Button>
                <Button variant="outlined">
                  Export Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Profile Preview */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#3b82f6'
                }}
              >
                {settings.displayName.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {settings.displayName || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                {settings.email}
              </Typography>
              <Button variant="outlined" startIcon={<Edit />} size="small">
                Change Avatar
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Palette sx={{ color: '#3b82f6', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Appearance
                </Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Account Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Member since
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Jan 2024
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Total chats
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    156
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Properties
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    3
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{
            bgcolor: '#3b82f6',
            '&:hover': { bgcolor: '#2563eb' }
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
