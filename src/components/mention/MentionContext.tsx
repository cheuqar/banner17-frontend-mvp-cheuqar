import React from 'react';
import {
  Box,
  Chip,
  Typography,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { Close } from '@mui/icons-material';
import type { ChatSessionMention } from '../../types/mention';

interface MentionContextProps {
  mentions: ChatSessionMention[];
  onRemove: (mentionId: string) => void;
}

const MentionContext: React.FC<MentionContextProps> = ({
  mentions,
  onRemove
}) => {
  if (mentions.length === 0) {
    return null;
  }

  const getMentionIcon = (entityType: string): string => {
    switch (entityType) {
      case 'property':
        return '🏠';
      case 'amenity':
        return '📍';
      default:
        return '💬';
    }
  };

  const getMentionColor = (entityType: string): 'primary' | 'secondary' | 'success' | 'warning' => {
    switch (entityType) {
      case 'property':
        return 'primary';
      case 'amenity':
        return 'secondary';
      default:
        return 'success';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.25,
        alignItems: 'center',
        mb: 0.5,
        lineHeight: 1,
      }}
    >
      {mentions.map((mention) => (
        <Chip
          key={mention.id}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <span style={{ fontSize: '10px' }}>
                {getMentionIcon(mention.entity_type)}
              </span>
              <span style={{ fontSize: '0.65rem', lineHeight: 1 }}>
                @{mention.display_text.replace(/\s+/g, '_').toLowerCase()}
              </span>
            </Box>
          }
          variant="outlined"
          size="small"
          onDelete={() => onRemove(mention.id)}
          deleteIcon={
            <Tooltip title="Remove">
              <Close fontSize="inherit" />
            </Tooltip>
          }
          sx={{
            height: 18,
            backgroundColor: 'transparent',
            borderColor: '#cbd5e1',
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              px: 0.5,
              py: 0,
              lineHeight: 1,
            },
            '& .MuiChip-deleteIcon': {
              fontSize: '10px',
              margin: '0 1px 0 -1px',
            },
            '&:hover': {
              backgroundColor: 'rgba(241, 245, 249, 0.5)',
              borderColor: '#94a3b8',
            },
          }}
        />
      ))}
    </Box>
  );
};

export default MentionContext;
