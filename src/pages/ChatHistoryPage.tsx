import React from 'react';
import { Box, Typography } from '@mui/material';
import ChatHistory from '../components/organisms/ChatHistory';

export default function ChatHistoryPage() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        minHeight: '64px',
        bgcolor: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        py: 1
      }}>
        <img
          src="/brand.png"
          alt="Banner17"
          style={{
            height: '32px',
            width: 'auto',
            marginRight: '16px'
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
          Chat History
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <ChatHistory />
      </Box>
    </Box>
  );
}

