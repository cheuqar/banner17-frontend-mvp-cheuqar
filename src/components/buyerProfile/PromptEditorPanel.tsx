/**
 * Prompt Editor Panel - Phase 3.7.1 Component
 *
 * Primary UI component for prompt-centric design with:
 * - Read-only preview mode (default)
 * - Editable textarea mode (toggle)
 * - Real-time highlight animation on changes
 * - Character/word counter
 * - AI refinement button (Phase 3.7.3)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Paper, TextField, Typography, Chip } from '@mui/material';
import { Edit as EditIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { useBuyerProfileRefinement, extractCriteriaFromWorkflowState } from '../../hooks/useBuyerProfileRefinement';
import AIRefinementModal from './AIRefinementModal';

interface PromptEditorPanelProps {
  prompt: string;
  editMode: boolean;
  onToggleEdit: () => void;
  onPromptChange: (prompt: string) => void;
  workflowState?: any; // For extracting criteria for refinement
  sx?: any;
}

export const PromptEditorPanel: React.FC<PromptEditorPanelProps> = ({
  prompt,
  editMode,
  onToggleEdit,
  onPromptChange,
  workflowState,
  sx
}) => {
  const [highlightChanges, setHighlightChanges] = useState(false);
  const [prevPrompt, setPrevPrompt] = useState('');

  // Phase 3.7.4: AI Refinement integration
  const refinement = useBuyerProfileRefinement();

  // Trigger highlight animation when prompt changes (not in edit mode)
  useEffect(() => {
    if (prompt !== prevPrompt && prompt && !editMode) {
      setHighlightChanges(true);
      const timer = setTimeout(() => setHighlightChanges(false), 2000);
      setPrevPrompt(prompt);
      return () => clearTimeout(timer);
    }
  }, [prompt, editMode, prevPrompt]);

  // Phase 3.7.1: Use useMemo to ensure counter always syncs with prompt changes
  const characterCount = useMemo(() => prompt.length, [prompt]);
  const wordCount = useMemo(() => prompt.trim().split(/\s+/).filter(Boolean).length, [prompt]);
  const minCharacters = 50;
  const maxCharacters = 2000;

  const characterCountColor =
    characterCount < minCharacters ? 'error.main' :
    characterCount > maxCharacters * 0.9 ? 'warning.main' :
    'text.secondary';

  // Phase 3.7.4: Refinement handlers
  const handleRefinementClick = () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt before analyzing');
      return;
    }
    refinement.openModal();
  };

  const handleAnalyze = async () => {
    const criteria = workflowState ? extractCriteriaFromWorkflowState(workflowState) : undefined;
    await refinement.analyzePrompt(prompt, criteria);
  };

  const handleGetSuggestions = async () => {
    const criteria = workflowState ? extractCriteriaFromWorkflowState(workflowState) : undefined;
    await refinement.getSuggestions(prompt, criteria);
  };

  const handleRefine = async () => {
    const criteria = workflowState ? extractCriteriaFromWorkflowState(workflowState) : undefined;
    await refinement.refinePrompt(prompt, criteria);
  };

  const handleAcceptRefinement = () => {
    const refinedPrompt = refinement.acceptRefinement();
    if (refinedPrompt) {
      onPromptChange(refinedPrompt);
      refinement.closeModal();
    }
  };

  const handleRejectRefinement = () => {
    refinement.rejectRefinement();
  };

  // Quality indicator
  const qualityScore = refinement.refinementState.qualityAnalysis?.overall_score;
  const getQualityColor = (score?: number) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Paper
      elevation={2}
      sx={{
        ...sx,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Search Prompt
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={editMode ? 'contained' : 'outlined'}
            startIcon={<EditIcon />}
            onClick={onToggleEdit}
            size="small"
            color={editMode ? 'primary' : 'inherit'}
          >
            Edit Mode: {editMode ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefinementClick}
            startIcon={<span>✨</span>}
            disabled={!prompt.trim() || refinement.isLoading}
            sx={{
              borderColor: qualityScore ? getQualityColor(qualityScore) === 'success' ? '#4caf50' :
                                         getQualityColor(qualityScore) === 'warning' ? '#ff9800' : '#f44336' : undefined,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: qualityScore ? 'scale(1.02)' : 'none',
                boxShadow: qualityScore ? '0 4px 8px rgba(0,0,0,0.12)' : 'none',
              },
            }}
          >
            Refine with AI
            {qualityScore && (
              <Chip
                label={`${Math.round(qualityScore)}`}
                size="small"
                color={getQualityColor(qualityScore)}
                sx={{ ml: 1, height: 20, fontSize: '10px' }}
              />
            )}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HelpIcon />}
            onClick={() => {
              // TODO: Show help dialog explaining prompt editor
              console.log('Help clicked');
            }}
          >
            Help
          </Button>
        </Box>
      </Box>

      {/* Prompt Display/Editor */}
      <Box sx={{ flex: 1, mb: 2, overflow: 'auto' }}>
        {editMode ? (
          <TextField
            multiline
            fullWidth
            minRows={12}
            maxRows={20}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your ideal property search criteria...

Example: I'm looking for a modern 2-bedroom apartment in Sydney suburbs with good public transport access. Budget is $700k-$950k. Need to be close to the CBD (within 15km) and near good schools as planning to start a family. First home buyer actively searching in the next 3-6 months."
            variant="outlined"
            sx={{
              height: '100%',
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: 1.6,
                backgroundColor: '#fff',
                border: '2px solid #1976d2',
                '&:hover': {
                  borderColor: '#1565c0'
                },
                '&.Mui-focused': {
                  borderColor: '#0d47a1'
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              }
            }}
          />
        ) : (
          <Box
            sx={{
              bgcolor: highlightChanges ? '#fff9c4' : '#f5f5f5',
              p: 2,
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              minHeight: '300px',
              maxHeight: '100%',
              overflow: 'auto',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              transition: 'background-color 2s ease-out'
            }}
          >
            {prompt || (
              <Typography color="text.secondary" fontStyle="italic">
                Start typing or use the assistant below to build your profile...

                <Box component="span" sx={{ display: 'block', mt: 2, fontSize: '13px' }}>
                  💡 Tip: Use the chat assistant below to describe your property needs conversationally,
                  or click "Edit Mode" to type directly. Your search prompt will update automatically
                  as you chat with the assistant.
                </Box>
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Character/Word Count & Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: characterCountColor }}>
            {characterCount}/{maxCharacters} characters
            {characterCount < minCharacters && (
              <Box component="span" sx={{ color: 'error.main', ml: 1 }}>
                (minimum {minCharacters} required)
              </Box>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {wordCount} words
          </Typography>
        </Box>

        {!editMode && (
          <Typography variant="caption" color="text.secondary" fontStyle="italic">
            Read-only mode - Click "Edit Mode" to modify
          </Typography>
        )}
      </Box>

      {/* Phase 3.7.4: AI Refinement Modal */}
      <AIRefinementModal
        open={refinement.refinementState.showModal}
        onClose={refinement.closeModal}
        refinementState={refinement.refinementState}
        originalPrompt={prompt}
        onAnalyze={handleAnalyze}
        onGetSuggestions={handleGetSuggestions}
        onRefine={handleRefine}
        onAccept={handleAcceptRefinement}
        onReject={handleRejectRefinement}
        onToggleSuggestion={refinement.toggleSuggestion}
        onSelectAllSuggestions={refinement.selectAllSuggestions}
        onClearSelectedSuggestions={refinement.clearSelectedSuggestions}
      />
    </Paper>
  );
};
