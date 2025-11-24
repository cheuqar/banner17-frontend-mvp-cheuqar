import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Popover,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import {
  Chat,
  ExpandMore,
  Token as TokenIcon,
  AttachMoney as CreditIcon,
  Build as ToolIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import TokenTimelineGraph, { type TokenDataPoint } from './TokenTimelineGraph';

export interface SessionMetrics {
  sessionName?: string;
  totalTextCount: string;
  totalInputTokens: string;
  totalOutputTokens: string;
  totalCreditsUsed: string;
  toolsUsed: Record<string, number>;
  lastFilters?: Record<string, string>; // For tracking search criteria changes
}

interface CompactSessionInfoProps {
  metrics: SessionMetrics;
  onEditSessionName?: (newName: string) => void;
  messages?: Array<{
    id: string;
    type: 'user' | 'ai' | 'system' | 'error';
    timestamp: Date;
    langGraphExecution?: {
      total_tokens_in: number;
      total_tokens_out: number;
      total_estimated_cost: number;
    };
  }>;
}

const CompactSessionInfo: React.FC<CompactSessionInfoProps> = ({ 
  metrics,
  onEditSessionName,
  messages = []
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditingName(sessionDisplayName);
    setEditDialogOpen(true);
    handleClose();
  };

  const handleEditSave = () => {
    if (editingName.trim() && onEditSessionName) {
      onEditSessionName(editingName.trim());
    }
    setEditDialogOpen(false);
    setEditingName('');
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingName('');
  };

  const open = Boolean(anchorEl);

  // Generate token timeline data from messages
  const getTokenTimelineData = (): TokenDataPoint[] => {
    return messages
      .filter(msg => msg.type === 'ai' && msg.langGraphExecution)
      .map(msg => ({
        timestamp: msg.timestamp,
        inputTokens: msg.langGraphExecution!.total_tokens_in,
        outputTokens: msg.langGraphExecution!.total_tokens_out,
        cost: msg.langGraphExecution!.total_estimated_cost
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  // Helper function to format numbers
  const formatNumber = (value: string): string => {
    const num = parseInt(value) || 0;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Helper function to format currency
  const formatCurrency = (value: string): string => {
    const num = parseFloat(value) || 0;
    if (num === 0) return '$0';
    if (num < 0.001) return '<$0.001';
    return `$${num.toFixed(3)}`;
  };

  // Calculate total tokens
  const totalTokens = (parseInt(metrics.totalInputTokens) || 0) + (parseInt(metrics.totalOutputTokens) || 0);
  
  // Get total tools used count
  const totalToolsUsed = Object.values(metrics.toolsUsed).reduce((sum, count) => sum + count, 0);

  const sessionDisplayName = metrics.sessionName || 'New Chat';
  const cost = parseFloat(metrics.totalCreditsUsed) || 0;

  return (
    <>
      <Tooltip title="Click for session details">
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            border: '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: brand border
            backgroundColor: 'transparent', // SLEEK: transparent by default
            cursor: 'pointer',
            transition: 'all 0.3s ease', // SLEEK: smooth transitions
            '&:hover': {
              backgroundColor: 'rgba(31, 170, 188, 0.05)', // SLEEK: subtle brand fill
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(31, 170, 188, 0.1)' // SLEEK: brand shadow
            }
          }}
        >
          <Chat sx={{ fontSize: 16, color: 'primary.main' }} />
          
          <Typography variant="caption" fontWeight="600" sx={{ color: 'primary.main', maxWidth: 120 }} noWrap>
            {sessionDisplayName}
          </Typography>

          {totalTokens > 0 && (
            <Chip
              label={formatNumber(totalTokens.toString())}
              size="small"
              icon={<TokenIcon sx={{ fontSize: 12 }} />}
              sx={{
                height: 20,
                fontSize: '0.6rem',
                color: 'info.main',
                backgroundColor: 'info.light',
                '& .MuiChip-label': { px: 0.5 },
                '& .MuiChip-icon': { ml: 0.5, mr: -0.5 }
              }}
            />
          )}

          {cost > 0 && (
            <Chip
              label={formatCurrency(metrics.totalCreditsUsed)}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6rem',
                color: 'success.dark',
                backgroundColor: 'success.light',
                '& .MuiChip-label': { px: 0.5 }
              }}
            />
          )}

          <ExpandMore sx={{ fontSize: 14, color: 'text.secondary' }} />
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
            minWidth: 280,
            borderRadius: 2,
            border: '1px solid rgba(31, 170, 188, 0.1)', // SLEEK: brand border
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Chat sx={{ color: 'primary.main', fontSize: 18 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                  {sessionDisplayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This session
                </Typography>
              </Box>
            </Box>
            {onEditSessionName && (
              <Tooltip title="Edit session name">
                <IconButton size="small" onClick={handleEditClick}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Session Metrics */}
          <Stack spacing={2}>
            {/* Tokens */}
            {totalTokens > 0 && (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TokenIcon sx={{ fontSize: 14, color: 'info.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Tokens
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" fontWeight="bold" color="info.main">
                    {formatNumber(totalTokens.toString())}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatNumber(metrics.totalInputTokens)} in / {formatNumber(metrics.totalOutputTokens)} out
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Cost */}
            {cost > 0 && (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CreditIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Session Cost
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold" color="success.main">
                  {formatCurrency(metrics.totalCreditsUsed)}
                </Typography>
              </Box>
            )}

            {/* Tools Used */}
            {totalToolsUsed > 0 && (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <ToolIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Tools Used ({totalToolsUsed})
                  </Typography>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {Object.entries(metrics.toolsUsed).map(([tool, count]) => (
                    count > 0 && (
                      <Chip
                        key={tool}
                        label={`${tool} (${count})`}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.65rem',
                          height: 18,
                          color: 'warning.main',
                          borderColor: 'warning.main',
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    )
                  ))}
                </Box>
              </Box>
            )}

            {/* Empty state */}
            {totalTokens === 0 && cost === 0 && totalToolsUsed === 0 && (
              <Typography variant="caption" color="text.secondary" textAlign="center" py={1}>
                No activity yet in this session
              </Typography>
            )}

            {/* Token Timeline */}
            {getTokenTimelineData().length > 0 && (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <TimelineIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Token Usage Timeline
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="center">
                  <TokenTimelineGraph
                    data={getTokenTimelineData()}
                    width={240}
                    height={60}
                  />
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
      </Popover>

      {/* Edit Session Name Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Session Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Session Name"
            variant="outlined"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompactSessionInfo;
