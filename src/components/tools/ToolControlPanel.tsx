import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  Collapse,
  Chip,
  Badge,
  Divider,
  Alert
} from '@mui/material';
import {
  Settings,
  Search,
  LocationOn,
  Analytics,
  ExpandMore,
  ExpandLess,
  Info,
  Speed,
  Security,
  Public
} from '@mui/icons-material';

export interface ToolConfig {
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactElement;
  enabled: boolean;
  category: 'search' | 'location' | 'analysis';
  features: string[];
  usageCount?: number;
  lastUsed?: Date;
  status: 'active' | 'limited' | 'disabled';
}

interface ToolControlPanelProps {
  tools: ToolConfig[];
  onToolToggle: (toolName: string, enabled: boolean) => void;
  onSettingsClick?: () => void;
  compact?: boolean;
  className?: string;
}

const ToolControlPanel: React.FC<ToolControlPanelProps> = ({
  tools,
  onToolToggle,
  onSettingsClick,
  compact = false,
  className
}) => {
  const [expanded, setExpanded] = useState(!compact);
  const [showDetails, setShowDetails] = useState(false);

  const enabledToolsCount = tools.filter(tool => tool.enabled).length;
  const totalUsageCount = tools.reduce((sum, tool) => sum + (tool.usageCount || 0), 0);

  const getStatusColor = (status: ToolConfig['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'limited': return 'warning';
      case 'disabled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: ToolConfig['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'limited': return 'Limited';
      case 'disabled': return 'Disabled';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category: ToolConfig['category']) => {
    switch (category) {
      case 'search': return <Search fontSize="small" />;
      case 'location': return <LocationOn fontSize="small" />;
      case 'analysis': return <Analytics fontSize="small" />;
      default: return <Settings fontSize="small" />;
    }
  };

  if (compact) {
    return (
      <Paper
        elevation={0}
        className={className}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#f8fafc'
        }}
      >
        {/* Compact Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          bgcolor: 'white',
          borderBottom: expanded ? '1px solid #e5e7eb' : 'none'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings fontSize="small" sx={{ color: '#6b7280' }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
              AI Tools
            </Typography>
            <Badge
              badgeContent={enabledToolsCount}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.625rem',
                  height: 16,
                  minWidth: 16
                }
              }}
            >
              <Box />
            </Badge>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {totalUsageCount > 0 && (
              <Chip
                size="small"
                label={`${totalUsageCount} used`}
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  bgcolor: '#dbeafe',
                  color: '#1d4ed8'
                }}
              />
            )}
            <Tooltip title={expanded ? "Collapse tools" : "Expand tools"}>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ color: '#6b7280' }}
              >
                {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Expandable Content */}
        <Collapse in={expanded}>
          <Box sx={{ p: 1.5, pt: 1 }}>
            {tools.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                No tools available. Check your configuration.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {tools.map((tool) => (
                  <Box
                    key={tool.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: tool.enabled ? '#2563eb' : '#9ca3af' }}>
                        {tool.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                          {tool.displayName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size="small"
                            label={getStatusText(tool.status)}
                            color={getStatusColor(tool.status)}
                            sx={{ height: 16, fontSize: '0.625rem' }}
                          />
                          {tool.usageCount && tool.usageCount > 0 && (
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Used {tool.usageCount}x
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Switch
                      size="small"
                      checked={tool.enabled}
                      onChange={(e) => onToolToggle(tool.name, e.target.checked)}
                      disabled={tool.status === 'disabled'}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    );
  }

  // Full Panel View
  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        bgcolor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Settings sx={{ color: '#2563eb' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              AI Tools & Capabilities
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Enhance your chat with intelligent tools
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${enabledToolsCount}/${tools.length} enabled`}
            color="primary"
            size="small"
          />
          {onSettingsClick && (
            <Tooltip title="Advanced settings">
              <IconButton onClick={onSettingsClick} size="small">
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Tools List */}
      <Box sx={{ p: 2 }}>
        {tools.length === 0 ? (
          <Alert severity="info">
            No tools are currently configured. Contact your administrator to enable AI tools.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tools.map((tool, index) => (
              <Box key={tool.name}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    <Box sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: tool.enabled ? '#dbeafe' : '#f3f4f6',
                      color: tool.enabled ? '#2563eb' : '#9ca3af'
                    }}>
                      {tool.icon}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                          {tool.displayName}
                        </Typography>
                        <Chip
                          size="small"
                          label={getStatusText(tool.status)}
                          color={getStatusColor(tool.status)}
                          sx={{ height: 18, fontSize: '0.625rem' }}
                        />
                        {getCategoryIcon(tool.category)}
                      </Box>

                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        {tool.description}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {tool.features.map((feature) => (
                          <Chip
                            key={feature}
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.625rem',
                              borderColor: '#e5e7eb',
                              color: '#6b7280'
                            }}
                          />
                        ))}
                      </Box>

                      {(tool.usageCount || tool.lastUsed) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {tool.usageCount && tool.usageCount > 0 && (
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              <Speed fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                              Used {tool.usageCount} times
                            </Typography>
                          )}
                          {tool.lastUsed && (
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Last used: {tool.lastUsed.toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={tool.enabled ? "Disable this tool" : "Enable this tool"}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={tool.enabled}
                            onChange={(e) => onToolToggle(tool.name, e.target.checked)}
                            disabled={tool.status === 'disabled'}
                            color="primary"
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer Info */}
      <Box sx={{
        p: 2,
        pt: 1,
        bgcolor: '#f8fafc',
        borderTop: '1px solid #e5e7eb'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info fontSize="small" sx={{ color: '#6b7280' }} />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            Tools are automatically used when relevant to your questions. 
            {totalUsageCount > 0 && ` Total usage: ${totalUsageCount} calls.`}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ToolControlPanel;