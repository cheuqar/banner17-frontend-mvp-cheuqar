/**
 * Buyer Profile Editor - Phase 3.7.1 Prompt-Centric Design
 *
 * Main container for the new prompt-first interface with:
 * - 60% Prompt Editor Panel (primary focus)
 * - 40% Chat Assistant Panel (collapsible helper)
 * - Dual-path editing (chat + direct editing)
 * - Real-time prompt updates with highlight animation
 */

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { PromptEditorPanel } from '../components/buyerProfile/PromptEditorPanel';
import { ChatAssistantPanel } from '../components/buyerProfile/ChatAssistantPanel';
import TemplateLibraryModal from '../components/buyerProfile/TemplateLibraryModal';
import { buyerProfileService } from '../services/buyerProfileService';
import { supabase } from '../lib/supabase';

/**
 * Main buyer profile editor page component
 */
const BuyerProfileEditor: React.FC = () => {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId?: string }>();

  // Prompt editor state
  const [prompt, setPrompt] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Chat assistant state
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [workflowState, setWorkflowState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Template library modal state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  /**
   * Handle chat response from assistant
   * Updates prompt editor with new search_prompt from backend
   */
  const handleChatResponse = (response: any) => {
    const newPrompt = response.workflow_state?.search_prompt || '';

    // Only update prompt if not in edit mode (don't override user's manual edits)
    if (!editMode) {
      setPrompt(newPrompt);
    }

    setWorkflowState(response.workflow_state);
  };

  /**
   * Start conversation on mount (NEW profile creation)
   */
  useEffect(() => {
    const startConversation = async () => {
      if (hasStarted || profileId || isLoading) return; // Skip if already started, editing existing, or already loading

      try {
        setIsLoading(true);
        setError(null);

        console.log('🚀 Starting buyer profile builder conversation...');

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        // Start conversation
        const response = await buyerProfileService.startBuilderConversation();

        console.log('✅ Conversation started:', response);

        // Initialize workflow state
        setWorkflowState(response.workflow_state);
        setPrompt(response.workflow_state?.search_prompt || '');
        setHasStarted(true);

      } catch (err: any) {
        console.error('❌ Failed to start conversation:', err);
        setError(err.message || 'Failed to start conversation');
      } finally {
        setIsLoading(false);
      }
    };

    startConversation();
  }, [hasStarted, profileId]);

  /**
   * Load existing profile for editing
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId || isLoading) return; // Prevent duplicate loading

      try {
        setIsLoading(true);
        setError(null);

        console.log('📝 Loading existing profile for editing:', profileId);

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        // Fetch profile
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
        console.log('✅ Profile loaded:', data);

        // Set prompt from existing profile
        setPrompt(data.data.profile.search_prompt || '');
        setEditMode(true); // Start in edit mode for existing profiles

      } catch (err: any) {
        console.error('❌ Failed to load profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  /**
   * Handle template selection from library
   */
  const handleTemplateSelect = async (template: any) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🎯 Template selected:', template.name);

      // Method 1: Direct prompt replacement (Phase 3.7.2)
      // Replace the current prompt with the template prompt
      setPrompt(template.search_prompt);

      // Pre-populate workflow state with template criteria
      const templateWorkflowState = {
        ...workflowState,
        search_prompt: template.search_prompt,
        basic_criteria: template.basic_criteria || {},
        location_criteria: template.location_criteria || {},
        advanced_criteria: template.advanced_criteria || {},
        buyer_context: template.buyer_context || {},
        template_used: {
          template_id: template.id,
          template_name: template.name,
          template_category: template.category
        }
      };

      setWorkflowState(templateWorkflowState);
      setHasStarted(true);

      // Turn off edit mode to show the new prompt
      setEditMode(false);

      console.log('✅ Template applied successfully');

    } catch (err: any) {
      console.error('❌ Failed to apply template:', err);
      setError(err.message || 'Failed to apply template');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle save profile
   */
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('💾 Saving profile...');

      // TODO: Implement profile save logic
      // This will be implemented in Phase 3.7.5

      console.log('✅ Profile saved successfully');
      navigate('/buyer-profiles');

    } catch (err: any) {
      console.error('❌ Failed to save profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#fafafa'
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: '1px solid #e0e0e0',
        bgcolor: '#fff'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              {profileId ? 'Edit Buyer Profile' : 'Create Buyer Profile'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setTemplateModalOpen(true)}
                disabled={isLoading}
              >
                Browse Templates
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/buyer-profiles')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isLoading || !prompt || prompt.length < 50}
              >
                Save Profile
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Error Display */}
      {error && (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Container>
      )}

      {/* Main Content: 60/40 Layout */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            py: 2,
            overflow: 'hidden'
          }}
        >
          {/* Prompt Editor Panel - 60% */}
          <PromptEditorPanel
            prompt={prompt}
            editMode={editMode}
            onToggleEdit={() => setEditMode(!editMode)}
            onPromptChange={setPrompt}
            workflowState={workflowState}
            sx={{
              flex: '0 0 60%',
              minHeight: '400px',
              mb: 2
            }}
          />

          {/* Chat Assistant Panel - 40% (collapsible to 10%) */}
          <ChatAssistantPanel
            collapsed={chatCollapsed}
            onToggleCollapse={() => setChatCollapsed(!chatCollapsed)}
            onResponse={handleChatResponse}
            currentPrompt={editMode ? prompt : undefined}
            workflowState={workflowState}
            isLoading={isLoading}
            sx={{
              flex: chatCollapsed ? '0 0 10%' : '0 0 40%',
              minHeight: chatCollapsed ? '60px' : '300px',
              transition: 'flex 0.3s ease-in-out, min-height 0.3s ease-in-out'
            }}
          />
        </Container>
      </Box>

      {/* Template Library Modal */}
      <TemplateLibraryModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        hasExistingContent={!!prompt && prompt.length > 0}
      />
    </Box>
  );
};

export default BuyerProfileEditor;
