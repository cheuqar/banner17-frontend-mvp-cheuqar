/**
 * Buyer Profile Chat Input Component
 *
 * Input field for user to send messages in buyer profile builder
 * Supports Enter to send, disabled state during loading
 *
 * Phase 3.4: Chat input component
 */

import React, { useState, type KeyboardEvent } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

/**
 * Component props
 */
interface BuyerProfileChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Chat input component with send button
 */
const BuyerProfileChatInput: React.FC<BuyerProfileChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [input, setInput] = useState('');

  /**
   * Handle send message
   */
  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSend(trimmedInput);
      setInput('');
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 2,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fff',
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fafafa',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#000',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000',
            },
          },
        }}
      />
      <IconButton
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        sx={{
          backgroundColor: input.trim() && !disabled ? '#000' : '#e0e0e0',
          color: '#fff',
          width: 48,
          height: 48,
          '&:hover': {
            backgroundColor: input.trim() && !disabled ? '#333' : '#e0e0e0',
          },
          '&.Mui-disabled': {
            backgroundColor: '#e0e0e0',
            color: '#999',
          },
        }}
      >
        {disabled ? (
          <CircularProgress size={20} sx={{ color: '#999' }} />
        ) : (
          <SendIcon />
        )}
      </IconButton>
    </Box>
  );
};

export default BuyerProfileChatInput;
