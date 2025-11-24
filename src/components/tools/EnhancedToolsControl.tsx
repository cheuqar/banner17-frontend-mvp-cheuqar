import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Popover,
  Typography,
  Switch,
  Divider,
  Badge,
  Stack,
  Card,
  CardContent,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  Settings,
  Search,
  LocationOn,
  Analytics,
  CheckCircle,
  Error,
  Warning,
  Speed,
  DataObject,
  Map,
  Assessment,
  Api,
  CloudDownload,
  Memory,
  Lock,
  Tune
} from '@mui/icons-material';

interface ToolCapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tools: ToolConfig[];
}

interface ToolConfig {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  status: 'active' | 'limited' | 'disabled' | 'idle';
  usageCount?: number;
  isCore?: boolean; // Core tools cannot be disabled
  planRestricted?: boolean; // Restricted by plan
  lastUsed?: Date;
}

interface EnhancedToolsControlProps {
  className?: string;
}

const EnhancedToolsControl: React.FC<EnhancedToolsControlProps> = ({ className }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Mock data - this would come from props/context in real implementation
  const [capabilities, setCapabilities] = useState<ToolCapability[]>([
    {
      id: 'data-access',
      name: 'Data Access',
      description: 'Property databases and listings',
      icon: <DataObject fontSize="small" />,
      color: '#2563eb',
      tools: [
        {
          name: 'property_search',
          displayName: 'Property Search',
          description: 'Search property listings and databases',
          enabled: true,
          status: 'active',
          usageCount: 12,
          isCore: true
        },
        {
          name: 'market_data',
          displayName: 'Market Data',
          description: 'Access real-time market trends and prices',
          enabled: true,
          status: 'active',
          usageCount: 5
        },
        {
          name: 'property_history',
          displayName: 'Property History',
          description: 'Historical sales and price data',
          enabled: false,
          status: 'limited',
          planRestricted: true
        }
      ]
    },
    {
      id: 'location-services',
      name: 'Location Services',
      description: 'Maps, geocoding, and spatial analysis',
      icon: <Map fontSize="small" />,
      color: '#10b981',
      tools: [
        {
          name: 'geocoding',
          displayName: 'Geocoding',
          description: 'Convert addresses to coordinates',
          enabled: true,
          status: 'active',
          usageCount: 8,
          isCore: true
        },
        {
          name: 'distance_calc',
          displayName: 'Distance Calculator',
          description: 'Calculate distances and travel times',
          enabled: true,
          status: 'idle'
        },
        {
          name: 'boundary_analysis',
          displayName: 'Boundary Analysis',
          description: 'School zones, council areas, flood zones',
          enabled: true,
          status: 'active',
          usageCount: 3
        }
      ]
    },
    {
      id: 'analysis-tools',
      name: 'Analysis & Insights',
      description: 'AI-powered property analysis',
      icon: <Assessment fontSize="small" />,
      color: '#f59e0b',
      tools: [
        {
          name: 'property_analysis',
          displayName: 'Property Analysis',
          description: 'AI analysis of property features and value',
          enabled: true,
          status: 'active',
          usageCount: 15,
          isCore: true
        },
        {
          name: 'investment_calc',
          displayName: 'Investment Calculator',
          description: 'ROI, cash flow, and investment metrics',
          enabled: true,
          status: 'active',
          usageCount: 7
        },
        {
          name: 'risk_assessment',
          displayName: 'Risk Assessment',
          description: 'Property risk analysis and scoring',
          enabled: false,
          status: 'limited',
          planRestricted: true
        }
      ]
    },
    {
      id: 'external-data',
      name: 'External Research',
      description: 'Web search and external information',
      icon: <CloudDownload fontSize="small" />,
      color: '#8b5cf6',
      tools: [
        {
          name: 'web_search',
          displayName: 'Web Search',
          description: 'Search the web for property information',
          enabled: true,
          status: 'active',
          usageCount: 4
        },
        {
          name: 'news_monitor',
          displayName: 'News Monitor',
          description: 'Latest property news and market updates',
          enabled: false,
          status: 'idle'
        }
      ]
    },
    {
      id: 'api-integrations',
      name: 'API Integrations',
      description: 'Third-party data sources',
      icon: <Api fontSize="small" />,
      color: '#ec4899',
      tools: [
        {
          name: 'realestate_api',
          displayName: 'RealEstate.com API',
          description: 'Direct access to RealEstate.com data',
          enabled: false,
          status: 'limited',
          planRestricted: true
        },
        {
          name: 'domain_api',
          displayName: 'Domain API',
          description: 'Access Domain.com.au listings',
          enabled: false,
          status: 'limited',
          planRestricted: true
        }
      ]
    }
  ]);

  const handleToolToggle = (capabilityId: string, toolName: string, enabled: boolean) => {
    setCapabilities(prev => prev.map(cap => {
      if (cap.id === capabilityId) {
        return {
          ...cap,
          tools: cap.tools.map(tool => 
            tool.name === toolName ? { ...tool, enabled } : tool
          )
        };
      }
      return cap;
    }));
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Calculate totals
  const allTools = capabilities.flatMap(cap => cap.tools);
  const enabledTools = allTools.filter(tool => tool.enabled);
  const activeTools = allTools.filter(tool => tool.status === 'active');
  const totalUsage = allTools.reduce((sum, tool) => sum + (tool.usageCount || 0), 0);
  const coreTools = allTools.filter(tool => tool.isCore);
  const restrictedTools = allTools.filter(tool => tool.planRestricted);

  const getStatusIcon = (status: ToolConfig['status']) => {
    switch (status) {
      case 'active': return <CheckCircle fontSize="inherit" sx={{ color: '#10b981' }} />;
      case 'limited': return <Warning fontSize="inherit" sx={{ color: '#f59e0b' }} />;
      case 'disabled': return <Error fontSize="inherit" sx={{ color: '#ef4444' }} />;
      default: return <Memory fontSize="inherit" sx={{ color: '#9ca3af' }} />;
    }
  };

  return (
    <>
      <Tooltip title="AI Tools & Capabilities">
        <Box className={className}>
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{
              color: activeTools.length > 0 ? '#2563eb' : '#9ca3af',
              bgcolor: activeTools.length > 0 ? '#dbeafe' : '#f3f4f6',
              '&:hover': {
                bgcolor: activeTools.length > 0 ? '#bfdbfe' : '#e5e7eb',
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Badge
              badgeContent={enabledTools.length}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.625rem',
                  height: 14,
                  minWidth: 14,
                  right: -2,
                  top: -2
                }
              }}
            >
              <Tune fontSize="small" />
            </Badge>
          </IconButton>
        </Box>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 420,
            maxWidth: 500,
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: '#dbeafe',
                color: '#2563eb'
              }}>
                <Tune fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  AI Tools & Capabilities
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage your AI assistant's capabilities
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label={`${enabledTools.length}/${allTools.length} enabled`}
                color={enabledTools.length > 0 ? "primary" : "default"}
                sx={{ fontSize: '0.625rem' }}
              />
              <Chip
                size="small"
                label={`${activeTools.length} active`}
                color={activeTools.length > 0 ? "success" : "default"}
                sx={{ fontSize: '0.625rem' }}
              />
            </Stack>
          </Box>

          {/* Session Usage Stats */}
          {totalUsage > 0 && (
            <Alert 
              severity="info" 
              icon={<Speed />}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {totalUsage} tool calls made in this session
              </Typography>
            </Alert>
          )}

          {/* Capabilities */}
          <Stack spacing={2.5}>
            {capabilities.map((capability, capIndex) => {
              const enabledInCap = capability.tools.filter(t => t.enabled).length;
              const activeInCap = capability.tools.filter(t => t.status === 'active').length;
              
              return (
                <Card key={capability.id} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    {/* Capability Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: `${capability.color}15`,
                          color: capability.color
                        }}>
                          {capability.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: capability.color }}>
                            {capability.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {capability.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        {activeInCap > 0 && (
                          <Chip 
                            size="small" 
                            label={`${activeInCap} active`} 
                            sx={{ 
                              height: 16, 
                              fontSize: '0.6rem',
                              bgcolor: '#10b98120',
                              color: '#10b981'
                            }} 
                          />
                        )}
                        <Chip 
                          size="small" 
                          label={`${enabledInCap}/${capability.tools.length}`} 
                          sx={{ 
                            height: 16, 
                            fontSize: '0.6rem',
                            bgcolor: `${capability.color}15`,
                            color: capability.color
                          }} 
                        />
                      </Stack>
                    </Box>

                    {/* Tools in Capability */}
                    <Stack spacing={1.5}>
                      {capability.tools.map((tool, toolIndex) => (
                        <Box key={tool.name}>
                          {toolIndex > 0 && <Divider sx={{ my: 1 }} />}
                          
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            opacity: tool.status === 'disabled' ? 0.5 : 1
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: 1,
                                bgcolor: tool.enabled ? `${capability.color}15` : '#f3f4f6',
                                color: tool.enabled ? capability.color : '#9ca3af',
                                position: 'relative'
                              }}>
                                {getStatusIcon(tool.status)}
                                {tool.isCore && (
                                  <Lock 
                                    sx={{ 
                                      fontSize: 10, 
                                      position: 'absolute', 
                                      bottom: -1, 
                                      right: -1,
                                      bgcolor: 'white',
                                      borderRadius: '50%'
                                    }} 
                                  />
                                )}
                              </Box>

                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                                    {tool.displayName}
                                  </Typography>
                                  {tool.isCore && (
                                    <Chip 
                                      label="Core" 
                                      size="small" 
                                      sx={{ 
                                        height: 16, 
                                        fontSize: '0.6rem',
                                        bgcolor: '#f3f4f6',
                                        color: '#6b7280'
                                      }} 
                                    />
                                  )}
                                  {tool.planRestricted && (
                                    <Chip 
                                      label="Pro+" 
                                      size="small" 
                                      sx={{ 
                                        height: 16, 
                                        fontSize: '0.6rem',
                                        bgcolor: '#f59e0b15',
                                        color: '#f59e0b'
                                      }} 
                                    />
                                  )}
                                </Box>
                                
                                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                  {tool.description}
                                </Typography>
                                
                                {tool.usageCount && tool.usageCount > 0 && (
                                  <Typography variant="caption" sx={{ color: capability.color, fontWeight: 500 }}>
                                    Used {tool.usageCount}x this session
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={tool.enabled}
                                  onChange={(e) => handleToolToggle(capability.id, tool.name, e.target.checked)}
                                  disabled={tool.isCore || tool.status === 'disabled' || tool.planRestricted}
                                  color="primary"
                                />
                              }
                              label=""
                              sx={{ m: 0 }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {/* Footer */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e5e7eb' }}>
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                💡 Tools are automatically activated when relevant to your questions
              </Typography>
              {coreTools.length > 0 && (
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  🔒 {coreTools.length} core tools cannot be disabled
                </Typography>
              )}
              {restrictedTools.length > 0 && (
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  ⭐ {restrictedTools.length} tools require plan upgrade
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default EnhancedToolsControl;
