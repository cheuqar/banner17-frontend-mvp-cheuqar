/**
 * Buyer Profile Chat Messages Component
 *
 * Displays conversation messages in buyer profile builder workflow
 * Supports user and assistant messages with clean styling
 *
 * Phase 3.4: Message display component
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type { ChatDisplayMessage } from '../../types/buyerProfile';

/**
 * Component props
 */
interface BuyerProfileChatMessagesProps {
  messages: ChatDisplayMessage[];
  isLoading?: boolean;
}

/**
 * Individual message bubble component
 */
const MessageBubble: React.FC<{
  message: ChatDisplayMessage;
}> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Don't display system messages in UI
  if (isSystem) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: '70%',
          px: 2,
          py: 1.5,
          backgroundColor: isUser ? '#000' : '#f5f5f5',
          color: isUser ? '#fff' : '#000',
          borderRadius: 2,
          border: isUser ? 'none' : '1px solid #e0e0e0',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.6,
          }}
        >
          {message.content}
        </Typography>
      </Paper>
    </Box>
  );
};

/**
 * Loading indicator
 */
const LoadingIndicator: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#999',
              animation: 'pulse 1.4s infinite ease-in-out',
              animationDelay: '0s',
              '@keyframes pulse': {
                '0%, 80%, 100%': {
                  opacity: 0.3,
                },
                '40%': {
                  opacity: 1,
                },
              },
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#999',
              animation: 'pulse 1.4s infinite ease-in-out',
              animationDelay: '0.2s',
              '@keyframes pulse': {
                '0%, 80%, 100%': {
                  opacity: 0.3,
                },
                '40%': {
                  opacity: 1,
                },
              },
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#999',
              animation: 'pulse 1.4s infinite ease-in-out',
              animationDelay: '0.4s',
              '@keyframes pulse': {
                '0%, 80%, 100%': {
                  opacity: 0.3,
                },
                '40%': {
                  opacity: 1,
                },
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#999',
          mb: 1,
        }}
      >
        No messages yet
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#bbb',
        }}
      >
        Start a conversation to create your buyer profile
      </Typography>
    </Box>
  );
};

/**
 * Main chat messages component
 */
const BuyerProfileChatMessages: React.FC<BuyerProfileChatMessagesProps> = ({
  messages,
  isLoading = false,
}) => {
  // Filter out system messages for display
  const displayMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2,
        py: 3,
      }}
    >
      {displayMessages.length === 0 && !isLoading ? (
        <EmptyState />
      ) : (
        <>
          {displayMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && <LoadingIndicator />}
        </>
      )}
    </Box>
  );
};

export default BuyerProfileChatMessages;
