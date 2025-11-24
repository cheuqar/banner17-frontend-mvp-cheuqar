import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Cancel,
  Dataset,
  Person,
  TrendingUp,
  LocationOn,
  Gavel,
  Campaign,
  Calculate,
  Star,
  Upgrade
} from '@mui/icons-material';

interface CapabilitiesMatrixModalProps {
  open: boolean;
  onClose: () => void;
}

interface PlanFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  pro: boolean | string;
  plus: boolean | string;
  enterprise: boolean | string;
}

interface PlanInfo {
  name: string;
  price: string;
  description: string;
  color: string;
  isCurrent?: boolean;
  features: string[];
}

const CapabilitiesMatrixModal: React.FC<CapabilitiesMatrixModalProps> = ({ open, onClose }) => {
  const theme = useTheme();

  const plans: PlanInfo[] = [
    {
      name: 'Free',
      price: '$0/month',
      description: 'Basic property search for casual browsers',
      color: '#9e9e9e',
      features: ['50 searches/month', '10 property analyses', '5 saved properties']
    },
    {
      name: 'Basic',
      price: '$29/month',
      description: 'Enhanced search with analytics',
      color: '#2196f3',
      features: ['200 searches/month', '50 property analyses', '25 saved properties', '6-month historical data']
    },
    {
      name: 'Pro',
      price: '$99/month',
      description: 'Professional tools with market insights',
      color: '#ff9800',
      features: ['Unlimited searches', '150 property analyses', 'Unlimited saved properties', '2-year historical data']
    },
    {
      name: 'Plus',
      price: '$199/month',
      description: 'Advanced analytics with portfolio management',
      color: '#9c27b0',
      isCurrent: true,
      features: ['5-year historical data', 'API access', 'Multi-user collaboration', 'Advanced market modeling']
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Complete platform access',
      color: '#4caf50',
      features: ['Unlimited everything', 'Full API access', 'White-label solutions', 'Custom integrations']
    }
  ];

  const featureCategories = [
    {
      name: 'Datasets & Information Access',
      icon: <Dataset />,
      features: [
        {
          name: 'Property searches per month',
          free: '50',
          basic: '200',
          pro: 'Unlimited',
          plus: 'Unlimited',
          enterprise: 'Unlimited'
        },
        {
          name: 'Historical data access',
          free: 'Current only',
          basic: '6 months',
          pro: '2 years',
          plus: '5 years',
          enterprise: 'Complete history'
        },
        {
          name: 'Off-market property alerts',
          free: false,
          basic: false,
          pro: true,
          plus: true,
          enterprise: true
        },
        {
          name: 'API access',
          free: false,
          basic: false,
          pro: false,
          plus: 'Rate limited',
          enterprise: 'Full access'
        }
      ]
    },
    {
      name: 'User Data & Portfolio Management',
      icon: <Person />,
      features: [
        {
          name: 'Saved properties',
          free: '5',
          basic: '25',
          pro: 'Unlimited',
          plus: 'Unlimited',
          enterprise: 'Unlimited'
        },
        {
          name: 'Portfolio tracking',
          free: false,
          basic: false,
          pro: '10 properties',
          plus: 'Unlimited',
          enterprise: 'Unlimited'
        },
        {
          name: 'Client management',
          free: false,
          basic: false,
          pro: false,
          plus: true,
          enterprise: true
        },
        {
          name: 'Multi-user collaboration',
          free: false,
          basic: false,
          pro: false,
          plus: true,
          enterprise: 'Advanced'
        }
      ]
    },
    {
      name: 'Market Insight & Analytics',
      icon: <TrendingUp />,
      features: [
        {
          name: 'Price estimates',
          free: 'Basic',
          basic: 'Enhanced',
          pro: 'AI-powered',
          plus: 'Advanced modeling',
          enterprise: 'Custom models'
        },
        {
          name: 'Market trends',
          free: 'Current month',
          basic: '6-month analysis',
          pro: 'Predictive modeling',
          plus: 'Advanced analytics',
          enterprise: 'Institutional grade'
        },
        {
          name: 'Investment scoring',
          free: false,
          basic: 'Basic',
          pro: 'Advanced',
          plus: 'Professional',
          enterprise: 'Custom algorithms'
        },
        {
          name: 'Competitive analysis',
          free: false,
          basic: false,
          pro: false,
          plus: true,
          enterprise: 'Market impact'
        }
      ]
    },
    {
      name: 'Financial Analysis & Tools',
      icon: <Calculate />,
      features: [
        {
          name: 'Mortgage calculator',
          free: 'Basic',
          basic: 'Advanced scenarios',
          pro: 'Multiple scenarios',
          plus: 'Professional modeling',
          enterprise: 'Custom models'
        },
        {
          name: 'ROI analysis',
          free: false,
          basic: false,
          pro: true,
          plus: 'Advanced',
          enterprise: 'Institutional'
        },
        {
          name: 'Portfolio optimization',
          free: false,
          basic: false,
          pro: false,
          plus: true,
          enterprise: 'Large scale'
        },
        {
          name: 'Risk assessment',
          free: false,
          basic: false,
          pro: false,
          plus: true,
          enterprise: 'Enterprise platform'
        }
      ]
    },
    {
      name: 'Marketing & Content Creation',
      icon: <Campaign />,
      features: [
        {
          name: 'AI property descriptions',
          free: false,
          basic: false,
          pro: true,
          plus: true,
          enterprise: true
        },
        {
          name: 'Marketing campaigns',
          free: false,
          basic: false,
          pro: false,
          plus: 'Multi-channel',
          enterprise: 'Enterprise automation'
        },
        {
          name: 'Lead generation',
          free: false,
          basic: false,
          pro: false,
          plus: true,
          enterprise: 'Advanced tools'
        },
        {
          name: 'A/B testing',
          free: false,
          basic: false,
          pro: false,
          plus: true,
          enterprise: true
        }
      ]
    },
    {
      name: 'Legal & Compliance',
      icon: <Gavel />,
      features: [
        {
          name: 'Contract templates',
          free: false,
          basic: 'Basic',
          pro: 'Advanced',
          plus: 'Professional',
          enterprise: 'Custom workflows'
        },
        {
          name: 'Legal risk assessment',
          free: false,
          basic: false,
          pro: false,
          plus: true,
          enterprise: 'Enterprise grade'
        },
        {
          name: 'Compliance tracking',
          free: false,
          basic: false,
          pro: true,
          plus: 'Advanced',
          enterprise: 'Full platform'
        }
      ]
    }
  ];

  const renderFeatureValue = (value: boolean | string, planColor: string) => {
    if (value === true) {
      return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />;
    }
    if (value === false) {
      return <Cancel sx={{ color: 'grey.400', fontSize: 20 }} />;
    }
    return (
      <Typography 
        variant="body2" 
        sx={{ 
          color: planColor,
          fontWeight: 600,
          textAlign: 'center'
        }}
      >
        {value}
      </Typography>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '95vh',
          height: '95vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              Plans & Capabilities Comparison
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare all subscription tiers and find the perfect plan for your needs
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'grey.500',
              '&:hover': { backgroundColor: 'rgba(31, 170, 188, 0.03)' } // SLEEK: brand hover
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3, overflow: 'auto' }}>
        {/* Plan Headers */}
        <Grid container spacing={1} sx={{ mb: 3, position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'background.default', pb: 2 }}>
          <Grid item xs={12} md={3}>
            <Box sx={{ height: 120 }} /> {/* Spacer for feature labels */}
          </Grid>
          {plans.map((plan) => (
            <Grid item xs={6} md={1.8} key={plan.name}>
              <Card 
                sx={{ 
                  height: 120,
                  border: plan.isCurrent ? '2px solid rgba(31, 170, 188, 0.4)' : '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: brand borders
                  borderColor: plan.isCurrent ? '#0d2b2c' : 'rgba(31, 170, 188, 0.1)',
                  backgroundColor: plan.isCurrent ? 'rgba(31, 170, 188, 0.05)' : 'transparent', // SLEEK: transparent/subtle fill
                  position: 'relative'
                }}
              >
                {plan.isCurrent && (
                  <Chip 
                    label="CURRENT"
                    size="small"
                    sx={{ 
                      position: 'absolute',
                      top: -8,
                      right: 8,
                      backgroundColor: '#0d2b2c', // SLEEK: brand color
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem'
                    }}
                  />
                )}
                <CardContent sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ color: plan.color, mb: 0.5 }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    sx={{ mb: 0.5 }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.2 }}
                  >
                    {plan.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Feature Comparison */}
        <Stack spacing={3}>
          {featureCategories.map((category) => (
            <Card key={category.name} variant="outlined">
              <CardContent sx={{ p: 0 }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(31, 170, 188, 0.02)', // SLEEK: subtle brand background
                    borderBottom: '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: brand border
                    borderColor: 'divider'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {category.icon}
                    <Typography variant="h6" fontWeight="bold">
                      {category.name}
                    </Typography>
                  </Box>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {category.features.map((feature) => (
                        <TableRow key={feature.name}>
                          <TableCell 
                            sx={{ 
                              width: '25%', 
                              fontWeight: 600,
                              borderRight: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            {feature.name}
                          </TableCell>
                          {plans.map((plan) => (
                            <TableCell 
                              key={plan.name} 
                              align="center"
                              sx={{ 
                                width: '15%',
                                backgroundColor: plan.isCurrent ? alpha(plan.color, 0.03) : 'transparent'
                              }}
                            >
                              {renderFeatureValue(
                                feature[plan.name.toLowerCase() as keyof PlanFeature], 
                                plan.color
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Box mt={4} textAlign="center">
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<Upgrade />}
              sx={{
                backgroundColor: 'transparent', // SLEEK: transparent by default
                color: '#0d2b2c', // SLEEK: brand color text
                border: '1px solid #0d2b2c', // SLEEK: brand border
                transition: 'all 0.3s ease', // SLEEK: smooth transitions
                '&:hover': {
                  backgroundColor: '#0d2b2c', // SLEEK: fill on hover
                  color: 'white' // SLEEK: white text on hover
                }
              }}
              onClick={() => alert('Upgrade functionality will be implemented when billing is integrated!')}
            >
              Upgrade Plan
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={onClose}
            >
              Manage Subscription
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CapabilitiesMatrixModal;
