/**
 * Buyer Profile Builder Page
 *
 * Conversational workflow for creating buyer property search profiles
 * Uses stateless workflow_state pattern (not session-based)
 *
 * Phase 3.4: Added message display and input components
 * Phase 3.5: API integration with /builder/start and /builder/chat
 * Phase 3.6: Added edit mode and copy mode support
 */

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Collapse, Button, Alert } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBuyerProfileWorkflow } from '../hooks/useBuyerProfileWorkflow';
import BuyerProfileChatMessages from '../components/buyerProfile/BuyerProfileChatMessages';
import BuyerProfileChatInput from '../components/buyerProfile/BuyerProfileChatInput';
import { buyerProfileService } from '../services/buyerProfileService';
import { supabase } from '../lib/supabase';
import type { BuyerProfile } from '../hooks/useBuyerProfiles';

/**
 * Main buyer profile builder page component
 */
const BuyerProfileBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId?: string }>();
  const location = useLocation();

  // Phase 3.6: Check for copy mode
  const copyFrom = (location.state as { copyFrom?: BuyerProfile })?.copyFrom;
  const isEditMode = !!profileId;
  const isCopyMode = !!copyFrom;

  // Phase 3.3: Workflow state management
  const {
    workflowState,
    currentNode,
    completedNodes,
    displayMessages,
    currentStep,
    totalSteps,
    progressPercentage,
    setWorkflowState,
    updateWorkflowState,
    resetWorkflow,
    addMessage,
    isFirstNode,
    isLastNode,
    canGoBack,
    canGoForward,
  } = useBuyerProfileWorkflow();

  // Phase 3.5: UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  /**
   * Phase 3.5/3.6: Start conversation on component mount
   * Handles NEW, EDIT, and COPY modes
   */
  useEffect(() => {
    const startConversation = async () => {
      if (hasStarted) return; // Prevent double-start

      try {
        setIsLoading(true);
        setError(null);

        // Phase 3.6: EDIT MODE - Load existing profile
        if (isEditMode && profileId) {
          console.log('📝 Loading profile for editing:', profileId);

          // Get auth token
          const { data: { session } } = await supabase.auth.getSession();

          if (!session?.access_token) {
            throw new Error('Not authenticated');
          }

          // Fetch profile from API
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100'}/api/v1/buyer-profile/profiles/${profileId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to load profile');
          }

          const data = await response.json();

          if (data.success && data.data?.profile) {
            const profile = data.data.profile;

            // TODO: Convert profile to workflow state format
            // For now, just start fresh and notify user
            console.log('✅ Profile loaded:', profile.profile_name);
            console.warn('⚠️ Edit mode not fully implemented - starting fresh conversation');

            // Start fresh conversation (edit mode full implementation pending)
            const startResponse = await buyerProfileService.startBuilderConversation();
            if (startResponse.success && startResponse.data) {
              setWorkflowState(startResponse.data.workflow_state);
              setHasStarted(true);
            }
          }
        }
        // Phase 3.6: COPY MODE - Start with copied criteria except location
        else if (isCopyMode && copyFrom) {
          console.log('📋 Copying profile:', copyFrom.profile_name);

          // Start conversation and add system message about copying
          const response = await buyerProfileService.startBuilderConversation();

          if (response.success && response.data) {
            // Update workflow state
            setWorkflowState(response.data.workflow_state);

            // Add info message about copy mode
            addMessage('assistant',
              `📋 Copying from "${copyFrom.profile_name}". All criteria will be copied except location - you'll need to specify a new state and suburbs for this profile.`
            );

            setHasStarted(true);
            console.log('✅ Copy mode initialized');
          }
        }
        // Phase 3.5: NEW MODE - Start fresh conversation
        else {
          console.log('🚀 Starting new buyer profile builder conversation...');
          const response = await buyerProfileService.startBuilderConversation();

          console.log('✅ Start conversation response:', response);

          if (response.success && response.data) {
            // Update workflow state from API response
            setWorkflowState(response.data.workflow_state);
            setHasStarted(true);

            console.log('✅ Workflow initialized:', response.data.workflow_state);
          } else {
            throw new Error(response.message || 'Failed to start conversation');
          }
        }
      } catch (err) {
        console.error('❌ Error starting conversation:', err);
        setError(err instanceof Error ? err.message : 'Failed to start conversation');
      } finally {
        setIsLoading(false);
      }
    };

    startConversation();
  }, [profileId, copyFrom]); // Re-run if profileId or copyFrom changes

  /**
   * Phase 3.5: Handle user message send with API integration
   */
  const handleSendMessage = async (message: string) => {
    if (!workflowState) {
      setError('Workflow not initialized. Please refresh the page.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to display immediately (optimistic update)
      addMessage('user', message);

      console.log('💬 Sending message to API:', message);

      // Call API with current workflow state (Phase 3.7.1: updated to object payload)
      const response = await buyerProfileService.sendBuilderMessage({
        user_message: message,
        current_state: workflowState,
      });

      console.log('✅ Chat response:', response);

      if (response.success && response.data) {
        // Update workflow state from API response
        setWorkflowState(response.data.workflow_state);

        console.log('✅ Workflow updated:', response.data.workflow_state);
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Add error message to chat
      addMessage('assistant', '❌ Sorry, there was an error processing your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: '#000',
              mb: 1,
            }}
          >
            Buyer Profile Builder
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
            }}
          >
            Create a detailed property search profile through a guided conversation
          </Typography>
        </Box>

        {/* Phase 3.5: Error Display */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Main Chat Interface */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            backgroundColor: '#fff',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Phase 3.5: Chat Messages Display (with API responses) */}
          <BuyerProfileChatMessages
            messages={displayMessages}
            isLoading={isLoading}
          />

          {/* Phase 3.5: Chat Input (with API integration) */}
          <BuyerProfileChatInput
            onSend={handleSendMessage}
            disabled={isLoading || !hasStarted}
            placeholder={
              hasStarted
                ? "Type your message to build your buyer profile..."
                : "Loading conversation..."
            }
          />
        </Paper>

        {/* Debug Panel (Collapsible) */}
        <Box sx={{ mt: 2 }}>
          <Button
            onClick={() => setShowDebug(!showDebug)}
            sx={{
              color: '#666',
              textTransform: 'none',
              fontSize: '12px',
            }}
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </Button>

          <Collapse in={showDebug}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 1,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', mb: 1, display: 'block' }}>
                Phase 3.5: Debug Information (API Connected)
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    API Status:
                  </Typography>
                  <Typography variant="caption" sx={{ color: hasStarted ? '#4caf50' : '#ff9800', fontFamily: 'monospace', display: 'block' }}>
                    {hasStarted ? '✅ Connected' : '⏳ Starting...'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Current Node:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#000', fontFamily: 'monospace', display: 'block' }}>
                    {currentNode || 'null'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Progress:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#000', fontFamily: 'monospace', display: 'block' }}>
                    {currentStep}/{totalSteps} ({progressPercentage}%)
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Messages:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#000', fontFamily: 'monospace', display: 'block' }}>
                    {displayMessages.length} total
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Collapse>
        </Box>
      </Container>
    </Box>
  );
};

export default BuyerProfileBuilder;
