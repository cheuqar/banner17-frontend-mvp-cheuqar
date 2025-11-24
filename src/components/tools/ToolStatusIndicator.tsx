import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Popover,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Badge
} from '@mui/material';
import {
  Settings,
  Search,
  LocationOn,
  Analytics,
  CheckCircle,
  Error,
  Warning,
  Speed
} from '@mui/icons-material';
import type { ToolConfig } from './ToolControlPanel';

interface ToolStatusIndicatorProps {
  tools: ToolConfig[];
  onToolToggle: (toolName: string, enabled: boolean) => void;
  showUsageStats?: boolean;
  className?: string;
}

const ToolStatusIndicator: React.FC<ToolStatusIndicatorProps> = ({
  tools,
  onToolToggle,
  showUsageStats = true,
  className
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const enabledTools = tools.filter(tool => tool.enabled);
  const totalUsage = tools.reduce((sum, tool) => sum + (tool.usageCount || 0), 0);
  
  const hasActiveTools = enabledTools.length > 0;
  const hasRecentUsage = totalUsage > 0;

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'web_search': return <Search fontSize="small" />;
      case 'geocoding': return <LocationOn fontSize="small" />;
      case 'property_analysis': return <Analytics fontSize="small" />;
      default: return <Settings fontSize="small" />;
    }
  };

  const getStatusIcon = (status: ToolConfig['status']) => {
    switch (status) {
      case 'active': return <CheckCircle fontSize="small" sx={{ color: '#10b981' }} />;
      case 'limited': return <Warning fontSize="small" sx={{ color: '#f59e0b' }} />;
      case 'disabled': return <Error fontSize="small" sx={{ color: '#ef4444' }} />;
      default: return null;
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="AI Tools Status">
        <Box className={className}>
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{
              color: hasActiveTools ? '#2563eb' : '#9ca3af',
              bgcolor: hasActiveTools ? '#dbeafe' : '#f3f4f6',
              '&:hover': {
                bgcolor: hasActiveTools ? '#bfdbfe' : '#e5e7eb',
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
              <Settings fontSize="small" />
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
        sx={{
          '& .MuiPopover-paper': {
            mt: 1,
            minWidth: 320,
            maxWidth: 400,
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings fontSize="small" sx={{ color: '#2563eb' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                AI Tools
              </Typography>
            </Box>
            <Chip
              size="small"
              label={`${enabledTools.length}/${tools.length} active`}
              color={hasActiveTools ? "primary" : "default"}
              sx={{ fontSize: '0.625rem' }}
            />
          </Box>

          {/* Usage Stats */}
          {showUsageStats && hasRecentUsage && (
            <Box sx={{ 
              mb: 2, 
              p: 1.5, 
              bgcolor: '#f0f9ff', 
              borderRadius: 1,
              border: '1px solid #e0f2fe'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed fontSize="small" sx={{ color: '#0369a1' }} />
                <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 500 }}>
                  {totalUsage} tool calls in this session
                </Typography>
              </Box>
            </Box>
          )}

          {/* Tools List */}
          {tools.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center', py: 2 }}>
              No tools configured
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tools.map((tool, index) => (
                <Box key={tool.name}>
                  {index > 0 && <Divider sx={{ my: 1 }} />}
                  
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: tool.enabled ? '#dbeafe' : '#f3f4f6',
                        color: tool.enabled ? '#2563eb' : '#9ca3af'
                      }}>
                        {getToolIcon(tool.name)}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                            {tool.displayName}
                          </Typography>
                          {getStatusIcon(tool.status)}
                        </Box>
                        
                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                          {tool.description}
                        </Typography>
                        
                        {tool.usageCount && tool.usageCount > 0 && (
                          <Typography variant="caption" sx={{ color: '#2563eb' }}>
                            Used {tool.usageCount}x this session
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Switch
                      size="small"
                      checked={tool.enabled}
                      onChange={(e) => onToolToggle(tool.name, e.target.checked)}
                      disabled={tool.status === 'disabled'}
                      color="primary"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #e5e7eb' }}>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
              💡 Tools are automatically used when relevant to your questions
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default ToolStatusIndicator;