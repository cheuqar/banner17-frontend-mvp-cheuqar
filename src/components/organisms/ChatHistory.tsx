import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Paper,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Pagination,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Chat, 
  Delete,
  DeleteSweep,
  MoreVert,
  Refresh,
  AccessTime,
  Token,
  AttachMoney,
  Build,
  PlayArrow,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { 
  chatService, 
  type ChatSessionSummary, 
  type ChatHistoryResponse,
  type SessionDeletionResponse,
  type ConversationHistoryResponse
} from '../../services/chatService';

interface ChatHistoryProps {
  onSessionResume?: (sessionId: string, messages: any[], session?: any) => void;
  onRefresh?: () => void;
  onNewSessionCreated?: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onSessionResume, onRefresh, onNewSessionCreated }) => {
  const { isAuthenticated } = useAuth();
  
  // State management
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Load chat history
  const loadChatHistory = useCallback(async (page: number = 1) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📚 [ChatHistory] Loading chat history, page:', page);
      const response: ChatHistoryResponse = await chatService.getChatHistory(page, pagination.pageSize);
      
      setSessions(response.sessions);
      setPagination({
        page: response.page,
        pageSize: response.page_size,
        totalCount: response.total_count,
        hasNext: response.has_next,
        hasPrevious: response.has_previous
      });
      
      console.log('✅ [ChatHistory] Loaded sessions:', response.sessions.length);
    } catch (error) {
      console.error('❌ [ChatHistory] Failed to load chat history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load chat history');
      setNotification({ message: 'Failed to load chat history', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pagination.pageSize]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory(1);
    }
  }, [isAuthenticated, loadChatHistory]);

  // Expose refresh function to parent through callback
  useEffect(() => {
    if (onRefresh && typeof onRefresh === 'function') {
      // Store the refresh function reference for parent to call
      (onRefresh as any).current = () => loadChatHistory(pagination.page);
    }
  }, [onRefresh, loadChatHistory, pagination.page]);

  // Handle new session created callback
  useEffect(() => {
    if (onNewSessionCreated && typeof onNewSessionCreated === 'function') {
      // Store the refresh function for new sessions
      (onNewSessionCreated as any).current = () => {
        console.log('🔄 [ChatHistory] Refreshing due to new session created');
        loadChatHistory(1); // Always go to first page to show newest session
      };
    }
  }, [onNewSessionCreated, loadChatHistory]);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    loadChatHistory(value);
  };

  // Handle session resume
  const handleSessionResume = async (sessionId: string) => {
    try {
      console.log('🔄 [ChatHistory] Resuming session:', sessionId);
      setLoading(true);
      
      const response: ConversationHistoryResponse = await chatService.resumeSession(sessionId);
      
      if (onSessionResume) {
        onSessionResume(sessionId, response.messages, response.session);
      }
      
      setNotification({ message: 'Session resumed successfully', severity: 'success' });
      console.log('✅ [ChatHistory] Session resumed with', response.messages.length, 'messages');
    } catch (error) {
      console.error('❌ [ChatHistory] Failed to resume session:', error);
      setNotification({ message: 'Failed to resume session', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle individual session deletion
  const handleDeleteSession = async (sessionId: string) => {
    try {
      console.log('🗑️ [ChatHistory] Deleting session:', sessionId);
      setLoading(true);
      
      const response: SessionDeletionResponse = await chatService.deleteSession(sessionId);
      
      if (response.success) {
        setNotification({ message: 'Session deleted successfully', severity: 'success' });
        // Reload current page
        await loadChatHistory(pagination.page);
      }
    } catch (error) {
      console.error('❌ [ChatHistory] Failed to delete session:', error);
      setNotification({ message: 'Failed to delete session', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  // Handle delete all sessions
  const handleDeleteAllSessions = async () => {
    if (confirmationText.toUpperCase() !== 'DELETE ALL') {
      setNotification({ message: 'Please type "DELETE ALL" to confirm', severity: 'warning' });
      return;
    }

    try {
      console.log('🗑️ [ChatHistory] Deleting all sessions');
      setLoading(true);
      
      const response: SessionDeletionResponse = await chatService.deleteAllSessions(confirmationText);
      
      if (response.success) {
        setNotification({ 
          message: `Successfully deleted ${response.deleted_count} sessions`, 
          severity: 'success' 
        });
        // Reload first page
        await loadChatHistory(1);
      }
    } catch (error) {
      console.error('❌ [ChatHistory] Failed to delete all sessions:', error);
      setNotification({ message: 'Failed to delete all sessions', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteAllDialogOpen(false);
      setConfirmationText('');
    }
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sessionId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSessionId(null);
  };

  // Format utilities
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTokens = (tokens: string) => {
    const num = parseInt(tokens);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return tokens;
  };

  const formatCost = (cost: string) => {
    const num = parseFloat(cost);
    return `$${num.toFixed(4)}`;
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Please sign in to view chat history
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3,
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#1f2937',
              mb: 0.5
            }}
          >
            Chat History
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6b7280'
            }}
          >
            {pagination.totalCount} conversations
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton 
              size="small" 
              onClick={() => loadChatHistory(pagination.page)}
              disabled={loading}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear All History">
            <IconButton 
              size="small" 
              onClick={() => setDeleteAllDialogOpen(true)}
              disabled={loading || sessions.length === 0}
              color="error"
            >
              <DeleteSweep />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" action={
            <Button size="small" onClick={() => loadChatHistory(pagination.page)}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      )}

      {/* Sessions List */}
      {!loading && !error && (
        <>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {sessions.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No chat sessions found
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {sessions.map((session, index) => (
                  <React.Fragment key={session.id}>
                    <ListItem
                      sx={{ 
                        px: 0,
                        '&:hover': {
                          bgcolor: '#f8fafc'
                        }
                      }}
                    >
                      <ListItemButton
                        onClick={() => handleSessionResume(session.id)}
                        sx={{ 
                          borderRadius: 2,
                          mx: 1,
                          py: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: 0.5,
                          minHeight: 'auto'
                        }}
                      >
                        {/* Enhanced Session Layout */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', minHeight: '72px', py: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {/* Session Title - More prominent */}
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 600,
                                color: '#1f2937',
                                fontSize: '0.95rem',
                                lineHeight: 1.3,
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-word'
                              }}
                            >
                              {session.title}
                            </Typography>
                            
                            {/* Last Message Preview - More prominent */}
                            {session.last_message_preview && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#6b7280',
                                  fontSize: '0.85rem',
                                  lineHeight: 1.4,
                                  mb: 1.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {session.last_message_preview}
                              </Typography>
                            )}
                            
                            {/* Bottom Row - Timestamp and Stats */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                              {/* Left side - Date and message count */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                                  {formatDate(session.updated_at)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                                  •
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                                  {session.message_count} messages
                                </Typography>
                              </Box>
                              
                              {/* Right side - Usage stats */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                {(parseInt(session.total_input_tokens) > 0 || parseInt(session.total_output_tokens) > 0) && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Token sx={{ fontSize: '0.75rem', color: '#9ca3af' }} />
                                    <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                                      {formatTokens(session.total_input_tokens)}/{formatTokens(session.total_output_tokens)}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {parseFloat(session.total_credits_used) > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AttachMoney sx={{ fontSize: '0.75rem', color: '#10b981' }} />
                                    <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 500 }}>
                                      {formatCost(session.total_credits_used)}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {Object.keys(session.tools_used).length > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Build sx={{ fontSize: '0.75rem', color: '#3b82f6' }} />
                                    <Typography variant="caption" sx={{ color: '#3b82f6', fontSize: '0.7rem' }}>
                                      {Object.keys(session.tools_used).length}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, session.id);
                            }}
                            sx={{ ml: 1, mt: 0.5 }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                    {index < sessions.length - 1 && <Divider variant="middle" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Pagination */}
          {pagination.totalCount > pagination.pageSize && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(pagination.totalCount / pagination.pageSize)}
                page={pagination.page}
                onChange={handlePageChange}
                disabled={loading}
                size="small"
              />
            </Box>
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            if (selectedSessionId) {
              handleSessionResume(selectedSessionId);
            }
            handleMenuClose();
          }}
        >
          <PlayArrow sx={{ mr: 1 }} fontSize="small" />
          Resume Session
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedSessionId) {
              setSessionToDelete(selectedSessionId);
              setDeleteDialogOpen(true);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete Session
        </MenuItem>
      </Menu>

      {/* Delete Session Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Confirm Delete Session
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this chat session? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Sessions Dialog */}
      <Dialog open={deleteAllDialogOpen} onClose={() => setDeleteAllDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            Clear All Chat History
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will permanently delete all your chat sessions and messages. This action cannot be undone.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            To confirm, please type <strong>DELETE ALL</strong> below:
          </Typography>
          <TextField
            fullWidth
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type DELETE ALL"
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteAllDialogOpen(false);
            setConfirmationText('');
          }}>
            Cancel
          </Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={handleDeleteAllSessions}
            disabled={loading || confirmationText.toUpperCase() !== 'DELETE ALL'}
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      {notification && (
        <Snackbar
          open={notification !== null}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={notification.severity} 
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default ChatHistory; 