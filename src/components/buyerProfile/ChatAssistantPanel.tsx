/**
 * Chat Assistant Panel - Phase 3.7.1 Component
 *
 * Collapsible chat interface for conversational profile building with:
 * - Expandable/collapsible header (40% expanded, 10% collapsed)
 * - Message history display
 * - Message input with send functionality
 * - Integration with edited prompt (dual-path editing)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { buyerProfileService } from '../../services/buyerProfileService';
import BuyerProfileChatMessages from './BuyerProfileChatMessages';

interface ChatAssistantPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onResponse: (response: any) => void;
  currentPrompt?: string; // User's manually edited prompt
  workflowState: any;
  isLoading?: boolean;
  sx?: any;
}

export const ChatAssistantPanel: React.FC<ChatAssistantPanelProps> = ({
  collapsed,
  onToggleCollapse,
  onResponse,
  currentPrompt,
  workflowState,
  isLoading: externalLoading,
  sx
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract AI messages from workflow state
  useEffect(() => {
    if (workflowState?.messages) {
      const formattedMessages = workflowState.messages.map((msg: any) => ({
        role: msg.type === 'human' || msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      setMessages(formattedMessages);
    }
  }, [workflowState]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Send message to backend
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    try {
      setIsSending(true);

      console.log('💬 Sending message:', userMessage);
      console.log('📝 Current edited prompt:', currentPrompt);

      // Send message to backend with current workflow state and edited prompt
      const response = await buyerProfileService.sendBuilderMessage({
        user_message: userMessage,
        current_state: workflowState,
        edited_prompt: currentPrompt // Phase 3.7.1: Include manually edited prompt
      });

      console.log('✅ Received response:', response);

      // Notify parent component with updated state
      onResponse(response);

    } catch (error: any) {
      console.error('❌ Failed to send message:', error);

      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`
      };
      setMessages(prev => [...prev, errorMessage]);

    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isLoading = externalLoading || isSending;

  return (
    <Paper
      elevation={2}
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}
    >
      {/* Collapsible Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: collapsed ? 'none' : '1px solid #e0e0e0',
          bgcolor: '#f5f5f5',
          cursor: 'pointer'
        }}
        onClick={onToggleCollapse}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            💬 Building Assistant
          </Typography>
          {!collapsed && messages.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              ({messages.length} messages)
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#f0f0f0' } }}
        >
          {collapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Chat Content (hidden when collapsed) */}
      {!collapsed && (
        <>
          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              bgcolor: '#fafafa',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {messages.length === 0 && !isLoading && (
              <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                Loading conversation...
              </Typography>
            )}

            <BuyerProfileChatMessages messages={messages} />

            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Grace is thinking...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #e0e0e0',
              bgcolor: '#fff'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fafafa'
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                endIcon={<SendIcon />}
                sx={{ minWidth: '100px' }}
              >
                Send
              </Button>
            </Box>

            {currentPrompt && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                💡 Your manual edits will be considered in the next response
              </Typography>
            )}
          </Box>
        </>
      )}

      {/* Collapsed State Info */}
      {collapsed && messages.length > 0 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Click to expand chat assistant
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
