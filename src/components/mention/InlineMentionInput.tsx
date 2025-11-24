import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Chip,
  Paper,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Send, AttachFile, ArrowUpward } from '@mui/icons-material';
import type { ChatSessionMention, MentionEntity } from '../../types/mention';

interface MentionChip {
  id: string;
  text: string;
  entity: MentionEntity;
  startIndex: number;
  endIndex: number;
}

interface InlineMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  mentions: ChatSessionMention[];
  onMentionAdd: (entity: MentionEntity) => void;
  onMentionRemove: (mentionId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const InlineMentionInput: React.FC<InlineMentionInputProps> = ({
  value,
  onChange,
  onSend,
  mentions,
  onMentionAdd,
  onMentionRemove,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [mentionChips, setMentionChips] = useState<MentionChip[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textFieldRef = useRef<HTMLInputElement>(null);

  // Parse text to find mention patterns like @property_name - optimized for performance
  const parseMentions = useCallback((text: string): MentionChip[] => {
    // Early return if no @ symbols to avoid regex overhead
    if (!text.includes('@')) {
      return [];
    }

    const mentionRegex = /@(\w+)/g;
    const chips: MentionChip[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionText = match[1];
      const startIndex = match.index;
      const endIndex = match.index + match[0].length;

      // Find corresponding mention entity
      const mentionEntity = mentions.find(m => 
        m.display_text.toLowerCase().includes(mentionText.toLowerCase()) ||
        m.entity_metadata?.title?.toLowerCase().includes(mentionText.toLowerCase())
      );

      if (mentionEntity) {
        chips.push({
          id: mentionEntity.id,
          text: match[0], // @property_name
          entity: mentionEntity as any, // Type assertion for now
          startIndex,
          endIndex
        });
      }
    }

    return chips;
  }, [mentions]);

  // Update mention chips when text or mentions change
  useEffect(() => {
    const chips = parseMentions(value);
    setMentionChips(chips);
  }, [value, mentions, parseMentions]);

  // Handle text input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
    setCursorPosition(event.target.selectionStart || 0);
  };

  // Handle key press events
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  // Render text with inline mention chips
  const renderTextWithMentions = () => {
    if (mentionChips.length === 0) {
      return (
        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          maxRows={4}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              bgcolor: '#f8fafc',
              '&:hover': {
                bgcolor: '#f1f5f9',
              },
              '&.Mui-focused': {
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2563eb',
                  borderWidth: 2,
                },
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton size="small" sx={{ color: '#6b7280' }} disabled={disabled}>
                  <AttachFile fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      );
    }

    // For now, render as regular TextField - we'll enhance this later
    return (
      <TextField
        ref={textFieldRef}
        fullWidth
        multiline
        maxRows={4}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            bgcolor: '#f8fafc',
            '&:hover': {
              bgcolor: '#f1f5f9',
            },
            '&.Mui-focused': {
              bgcolor: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2563eb',
                borderWidth: 2,
              },
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton size="small" sx={{ color: '#6b7280' }} disabled={disabled}>
                <AttachFile fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  };

  return (
    <Box>
      {/* Mentioned Entities Container - Similar to the image */}
      {mentions.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mb: 1,
            p: 1,
            backgroundColor: '#f8fafc',
            border: '1px solid',
            borderColor: '#e2e8f0',
            borderRadius: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 0.5,
              color: '#64748b',
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
          >
            Related to:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {mentions.map((mention) => (
              <Chip
                key={mention.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span style={{ fontSize: '12px' }}>
                      {mention.entity_type === 'property' ? '🏠' : '📍'}
                    </span>
                    <span style={{ fontSize: '0.75rem' }}>
                      @{mention.display_text.replace(/\s+/g, '_').toLowerCase()}
                    </span>
                  </Box>
                }
                size="small"
                variant="outlined"
                onDelete={() => onMentionRemove(mention.id)}
                sx={{
                  height: 24,
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  '& .MuiChip-label': {
                    px: 0.75,
                    py: 0,
                  },
                  '& .MuiChip-deleteIcon': {
                    fontSize: '14px',
                    margin: '0 2px 0 -2px',
                  },
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    borderColor: '#94a3b8',
                  },
                }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Input Field */}
      {renderTextWithMentions()}
    </Box>
  );
};

export default InlineMentionInput;
