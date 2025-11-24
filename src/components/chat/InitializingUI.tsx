/**
 * Initializing UI Component
 * 
 * Displays a beautiful loading interface while the DB-first initialization
 * system loads journeys and sessions from the database.
 */

import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  LinearProgress,
  Fade
} from '@mui/material';
import { Analytics, Timeline, CloudSync } from '@mui/icons-material';
import type { InitializationState } from '../../services/dbFirstInitService';

interface InitializingUIProps {
  initializationState: InitializationState;
  journeyCount?: number;
  sessionCount?: number;
}

const InitializingUI: React.FC<InitializingUIProps> = ({
  initializationState,
  journeyCount = 0,
  sessionCount = 0
}) => {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 4
      }}
    >
      <Fade in timeout={600}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(31, 170, 188, 0.05) 0%, rgba(31, 170, 188, 0.02) 100%)',
            border: '1px solid rgba(31, 170, 188, 0.1)',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            minWidth: 400
          }}
        >
          {/* Loading Animation */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <Timeline sx={{ fontSize: 32, color: '#0d2b2c', opacity: 0.8 }} />
            <CircularProgress 
              size={40} 
              thickness={3}
              sx={{ 
                color: '#0d2b2c',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round'
                }
              }} 
            />
            <Analytics sx={{ fontSize: 32, color: '#0d2b2c', opacity: 0.8 }} />
          </Box>

          {/* Main Status */}
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#1f2937',
              mb: 1
            }}
          >
            {initializationState.status === 'initializing' && '🚀 Initializing Your Property Journey'}
            {initializationState.status === 'ready' && '✅ Ready to Explore Properties'}
            {initializationState.status === 'error' && '❌ Initialization Error'}
          </Typography>

          {/* Progress Description */}
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#6b7280',
              mb: 3,
              fontWeight: 500
            }}
          >
            {initializationState.progress || 'Loading your personalized experience...'}
          </Typography>

          {/* Progress Bar */}
          {initializationState.status === 'initializing' && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(31, 170, 188, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#0d2b2c',
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          )}

          {/* Stats Display */}
          {(journeyCount > 0 || sessionCount > 0) && (
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center',
                mt: 2
              }}
            >
              {journeyCount > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#0d2b2c', fontWeight: 600 }}>
                    {journeyCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Journeys Found
                  </Typography>
                </Box>
              )}
              {sessionCount > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#0d2b2c', fontWeight: 600 }}>
                    {sessionCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Sessions Loaded
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Error Display */}
          {initializationState.status === 'error' && initializationState.error && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <Typography variant="body2" sx={{ color: '#dc2626' }}>
                {initializationState.error}
              </Typography>
            </Box>
          )}

          {/* DB-First Benefits Info */}
          {initializationState.status === 'initializing' && (
            <Box sx={{ mt: 3, opacity: 0.7 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <CloudSync sx={{ fontSize: 16, color: '#0d2b2c' }} />
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                  Loading latest data from database
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                We're getting your most recent conversations and progress
              </Typography>
            </Box>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default InitializingUI;
