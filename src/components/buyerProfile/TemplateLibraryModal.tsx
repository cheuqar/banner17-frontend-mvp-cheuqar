import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  People as FamilyIcon,
  SentimentVeryDissatisfied as DownsizerIcon,
} from '@mui/icons-material';
import { useBuyerProfileTemplates } from '../../hooks/useBuyerProfileTemplates';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  search_prompt: string;
  basic_criteria: any;
  location_criteria: any;
  advanced_criteria: any;
  buyer_context: any;
  tags: string[];
  usage_count: number;
  created_by: string;
  created_at: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface TemplateLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  hasExistingContent: boolean;
}

const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  open,
  onClose,
  onSelectTemplate,
  hasExistingContent,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState<'samples' | 'profiles'>('samples');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    template: Template | null;
  }>({ open: false, template: null });

  const {
    templates,
    categories,
    loading,
    error,
    fetchTemplates,
    fetchCategories,
  } = useBuyerProfileTemplates();

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchTemplates(selectedCategory, searchQuery);
    }
  }, [open, selectedCategory, searchQuery]);

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'first_home_buyer':
        return <HomeIcon />;
      case 'investor':
        return <BusinessIcon />;
      case 'family':
        return <FamilyIcon />;
      case 'downsizer':
        return <DownsizerIcon />;
      default:
        return <HomeIcon />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'samples' | 'profiles') => {
    setActiveTab(newValue);
    setSelectedCategory(''); // Reset category filter when switching tabs
    setSearchQuery(''); // Reset search when switching tabs
  };

  const handleCategoryFilter = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(''); // Toggle off if already selected
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTemplateSelect = (template: Template) => {
    if (hasExistingContent) {
      setConfirmationDialog({ open: true, template });
    } else {
      onSelectTemplate(template);
      onClose();
    }
  };

  const handleConfirmReplace = () => {
    if (confirmationDialog.template) {
      onSelectTemplate(confirmationDialog.template);
      setConfirmationDialog({ open: false, template: null });
      onClose();
    }
  };

  const handleCopyToClipboard = async (template: Template) => {
    try {
      await navigator.clipboard.writeText(template.search_prompt);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationDialog({ open: false, template: null });
  };

  const formatCriteriaSummary = (template: Template) => {
    const parts = [];

    if (template.basic_criteria?.bedrooms_min || template.basic_criteria?.bedrooms_max) {
      const min = template.basic_criteria.bedrooms_min || '';
      const max = template.basic_criteria.bedrooms_max || '';
      if (min && max && min === max) {
        parts.push(`${min} beds`);
      } else if (min && max) {
        parts.push(`${min}-${max} beds`);
      } else if (min) {
        parts.push(`${min}+ beds`);
      }
    }

    if (template.basic_criteria?.price_min || template.basic_criteria?.price_max) {
      const min = template.basic_criteria.price_min;
      const max = template.basic_criteria.price_max;
      if (min && max) {
        parts.push(`$${(min / 1000000).toFixed(1)}M-$${(max / 1000000).toFixed(1)}M`);
      } else if (min) {
        parts.push(`$${(min / 1000000).toFixed(1)}M+`);
      } else if (max) {
        parts.push(`Under $${(max / 1000000).toFixed(1)}M`);
      }
    }

    if (template.location_criteria?.state) {
      parts.push(template.location_criteria.state);
    }

    if (template.buyer_context?.intention) {
      const intention = template.buyer_context.intention.replace(/_/g, ' ');
      parts.push(intention);
    }

    return parts.join(' | ');
  };

  const filteredTemplates = templates?.sample_templates || [];
  const userProfiles = templates?.user_profiles || [];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            height: isMobile ? '100%' : '80vh',
            maxHeight: isMobile ? '100%' : '80vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Template Library</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 3, pt: 1 }}>
            <Tab label="Sample Templates" value="samples" />
            <Tab label="My Profiles" value="profiles" disabled />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Search and Category Filters */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {activeTab === 'samples' && categories && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {categories.map((category: TemplateCategory) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      icon={getCategoryIcon(category.id)}
                      onClick={() => handleCategoryFilter(category.id)}
                      variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                      sx={{
                        '& .MuiChip-icon': {
                          color: selectedCategory === category.id ? 'white' : category.color,
                        },
                        backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                        borderColor: category.color,
                        color: selectedCategory === category.id ? 'white' : category.color,
                        '&:hover': {
                          backgroundColor: selectedCategory === category.id ? category.color : `${category.color}15`,
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Content */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load templates: {error}
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {activeTab === 'samples' && filteredTemplates.map((template: Template) => (
                  <Grid item xs={12} md={6} key={template.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                            {template.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Used {template.usage_count} times
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                          {template.description}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {template.search_prompt}
                        </Typography>

                        <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                          {formatCriteriaSummary(template)}
                        </Typography>

                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {template.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                          ))}
                          {template.tags.length > 3 && (
                            <Chip
                              label={`+${template.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                          )}
                        </Box>
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Button
                          size="small"
                          startIcon={<CopyIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(template);
                          }}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateSelect(template);
                          }}
                        >
                          Use Template
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}

                {activeTab === 'profiles' && userProfiles.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Saved Profiles
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create and save buyer profiles to access them here.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialog.open}
        onClose={handleConfirmationClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Replace Existing Prompt?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You already have content in your prompt.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>Replace:</strong> Overwrite current prompt with template<br />
            • <strong>Copy to Clipboard:</strong> Copy template for manual paste
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (confirmationDialog.template) {
                handleCopyToClipboard(confirmationDialog.template);
                handleConfirmationClose();
              }
            }}
          >
            Copy to Clipboard
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmReplace}
          >
            Replace
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TemplateLibraryModal;