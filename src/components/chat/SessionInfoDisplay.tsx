import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Popover
} from '@mui/material';
import {
  Token as TokenIcon,
  Build as ToolIcon,
  AttachMoney as CreditIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon
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

interface SessionInfoDisplayProps {
  metrics: SessionMetrics;
  showDetails?: boolean;
  onToggleDetails?: () => void;
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

const SessionInfoDisplay: React.FC<SessionInfoDisplayProps> = ({ 
  metrics, 
  showDetails = false, 
  onToggleDetails,
  onEditSessionName,
  messages = []
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [timelineAnchor, setTimelineAnchor] = useState<HTMLElement | null>(null);

  const handleEditClick = () => {
    setEditingName(sessionDisplayName);
    setEditDialogOpen(true);
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

  const handleTimelineOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTimelineAnchor(event.currentTarget);
  };

  const handleTimelineClose = () => {
    setTimelineAnchor(null);
  };

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
    return `$${num.toFixed(2)}`;
  };

  // Calculate total tokens
  const totalTokens = (parseInt(metrics.totalInputTokens) || 0) + (parseInt(metrics.totalOutputTokens) || 0);
  
  // Get total tools used count
  const totalToolsUsed = Object.values(metrics.toolsUsed).reduce((sum, count) => sum + count, 0);

  const sessionDisplayName = metrics.sessionName || 'Current Session';

  if (showDetails) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography 
              variant="body2" 
              onClick={onEditSessionName ? handleEditClick : undefined}
              sx={{ 
                fontWeight: 600, 
                color: '#1f2937', 
                textDecoration: onEditSessionName ? 'underline' : 'none',
                cursor: onEditSessionName ? 'pointer' : 'default',
                '&:hover': onEditSessionName ? {
                  color: '#2563eb'
                } : {}
              }}
            >
              {sessionDisplayName}
            </Typography>
            {onEditSessionName && (
              <Tooltip title="Edit session name">
                <IconButton size="small" onClick={handleEditClick} sx={{ color: '#6b7280' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title={`Input tokens: ${formatNumber(metrics.totalInputTokens)}`}>
              <Chip
                size="small"
                icon={<TokenIcon fontSize="small" />}
                label={`${formatNumber(metrics.totalInputTokens)} in`}
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 24, color: '#3b82f6' }}
              />
            </Tooltip>

            <Tooltip title={`Output tokens: ${formatNumber(metrics.totalOutputTokens)}`}>
              <Chip
                size="small"
                icon={<TokenIcon fontSize="small" />}
                label={`${formatNumber(metrics.totalOutputTokens)} out`}
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 24, color: '#10b981' }}
              />
            </Tooltip>

            {totalToolsUsed > 0 && (
              <Tooltip title={`Tools used: ${Object.entries(metrics.toolsUsed).map(([tool, count]) => `${tool}: ${count}`).join(', ')}`}>
                <Chip
                  size="small"
                  icon={<ToolIcon fontSize="small" />}
                  label={totalToolsUsed}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 24 }}
                />
              </Tooltip>
            )}

            <Tooltip title={`Total cost: ${formatCurrency(metrics.totalCreditsUsed)}`}>
              <Chip
                size="small"
                icon={<CreditIcon fontSize="small" />}
                label={formatCurrency(metrics.totalCreditsUsed)}
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.75rem', height: 24 }}
              />
            </Tooltip>
          </Box>
        </Box>

        {onToggleDetails && (
          <IconButton
            size="small"
            onClick={onToggleDetails}
            sx={{ color: '#6b7280' }}
            title="Hide session details"
          >
            <TimelineIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  // Compact view
  return (
    <>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography 
        variant="body2" 
        onClick={onEditSessionName ? handleEditClick : undefined}
        sx={{ 
          fontWeight: 600, 
          color: '#1f2937', 
          maxWidth: 200, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          textDecoration: onEditSessionName ? 'underline' : 'none',
          cursor: onEditSessionName ? 'pointer' : 'default',
          '&:hover': onEditSessionName ? {
            color: '#2563eb'
          } : {}
        }}
      >
        {sessionDisplayName}
      </Typography>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title={`Input: ${formatNumber(metrics.totalInputTokens)} | Output: ${formatNumber(metrics.totalOutputTokens)}`}>
          <Chip
            size="small"
            label={`${formatNumber(metrics.totalInputTokens)}↓/${formatNumber(metrics.totalOutputTokens)}↑`}
            sx={{ 
              fontSize: '0.65rem', 
              height: 20,
              minWidth: 'auto',
              '& .MuiChip-label': { px: 1 },
              bgcolor: '#f1f5f9',
              color: '#475569'
            }}
          />
        </Tooltip>

        {totalToolsUsed > 0 && (
          <Tooltip title={`${totalToolsUsed} tools used`}>
            <Chip
              size="small"
              icon={<ToolIcon sx={{ fontSize: '0.7rem !important' }} />}
              label={totalToolsUsed}
              sx={{ 
                fontSize: '0.7rem', 
                height: 20,
                minWidth: 'auto',
                '& .MuiChip-label': { px: 0.5 },
                '& .MuiChip-icon': { ml: 0.5, mr: -0.5 },
                bgcolor: '#eff6ff',
                color: '#3b82f6'
              }}
            />
          </Tooltip>
        )}

        <Tooltip title={`Cost: ${formatCurrency(metrics.totalCreditsUsed)}`}>
          <Chip
            size="small"
            label={formatCurrency(metrics.totalCreditsUsed)}
            color="primary"
            sx={{ 
              fontSize: '0.7rem', 
              height: 20,
              minWidth: 'auto',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Tooltip>
      </Box>

      {/* Timeline Graph Icon */}
      <Tooltip title="View token usage timeline">
        <IconButton
          size="small"
          onMouseEnter={handleTimelineOpen}
          sx={{ color: '#6b7280', ml: 0.5 }}
        >
          <TimelineIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Timeline Popover */}
      <Popover
        open={Boolean(timelineAnchor)}
        anchorEl={timelineAnchor}
        onClose={handleTimelineClose}
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
            mt: 0.5,
            boxShadow: 'none',
            border: 'none',
            bgcolor: 'transparent'
          }
        }}
        onMouseLeave={handleTimelineClose}
        disableRestoreFocus
        disableScrollLock
        transitionDuration={150}
      >
        <TokenTimelineGraph data={getTokenTimelineData()} />
      </Popover>
    </Box>

    {/* Edit Name Dialog */}
    <Dialog 
      open={editDialogOpen} 
      onClose={handleEditCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Session Name</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Session Name"
          fullWidth
          variant="outlined"
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleEditSave();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEditCancel}>Cancel</Button>
        <Button onClick={handleEditSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default SessionInfoDisplay;
