/**
 * Buyer Profile Refinement Hook
 *
 * Manages AI-powered prompt refinement workflow:
 * - Quality analysis with 5-dimension scoring
 * - Suggestion generation with gap detection
 * - Complete refinement with before/after comparison
 *
 * Phase 3.7.4: UI Integration for AI Refinement Service
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import type {
  RefinementState,
  PromptQualityAnalysis,
  RefinementSuggestions,
  PromptRefinementResult,
  BasicCriteria,
  LocationCriteria,
  AdvancedCriteria,
  BuyerContext,
} from '../types/buyerProfile';
import { buyerProfileService } from '../services/buyerProfileService';

/**
 * Hook return type
 */
interface UseBuyerProfileRefinementReturn {
  // State
  refinementState: RefinementState;

  // Analysis functions
  analyzePrompt: (prompt: string, criteria?: RefinementCriteria) => Promise<void>;

  // Suggestions functions
  getSuggestions: (prompt: string, criteria?: RefinementCriteria) => Promise<void>;
  toggleSuggestion: (suggestionId: string) => void;
  selectAllSuggestions: () => void;
  clearSelectedSuggestions: () => void;

  // Refinement functions
  refinePrompt: (prompt: string, criteria?: RefinementCriteria) => Promise<void>;
  acceptRefinement: () => string | null;
  rejectRefinement: () => void;

  // Modal functions
  openModal: () => void;
  closeModal: () => void;
  setStep: (step: RefinementState['currentStep']) => void;

  // Reset
  resetRefinement: () => void;

  // Computed properties
  hasAnalysis: boolean;
  hasSuggestions: boolean;
  hasRefinement: boolean;
  selectedSuggestionsCount: number;
  isLoading: boolean;
}

/**
 * Criteria interface for refinement
 */
interface RefinementCriteria {
  basic_criteria?: BasicCriteria;
  location_criteria?: LocationCriteria;
  advanced_criteria?: AdvancedCriteria;
  buyer_context?: BuyerContext;
}

/**
 * Initial refinement state
 */
const initialRefinementState: RefinementState = {
  // Analysis phase
  isAnalyzing: false,
  qualityAnalysis: null,

  // Suggestions phase
  isLoadingSuggestions: false,
  suggestions: null,
  selectedSuggestions: [],

  // Refinement phase
  isRefining: false,
  refinementResult: null,

  // UI state
  showModal: false,
  currentStep: 'analysis',

  // Error handling
  error: null,
};

/**
 * Custom hook for buyer profile prompt refinement
 */
export const useBuyerProfileRefinement = (): UseBuyerProfileRefinementReturn => {
  const [refinementState, setRefinementState] = useState<RefinementState>(initialRefinementState);

  // Store last analysis inputs for automatic suggestions fetch
  const [lastAnalysisInputs, setLastAnalysisInputs] = useState<{
    prompt: string;
    criteria?: RefinementCriteria;
  } | null>(null);


  // Analysis mutation
  const analyzePromptMutation = useMutation({
    mutationFn: async ({ prompt, criteria }: { prompt: string; criteria?: RefinementCriteria }) => {
      console.log('🔍 [Refinement] Analyzing prompt quality...');
      const response = await buyerProfileService.analyzePrompt(prompt, criteria);
      return response.data as PromptQualityAnalysis;
    },
    onMutate: ({ prompt, criteria }) => {
      // Store inputs for automatic suggestions fetch
      setLastAnalysisInputs({ prompt, criteria });
      setRefinementState(prev => ({
        ...prev,
        isAnalyzing: true,
        error: null,
      }));
    },
    onSuccess: (analysis) => {
      console.log('✅ [Refinement] Analysis complete:', analysis);
      setRefinementState(prev => ({
        ...prev,
        isAnalyzing: false,
        qualityAnalysis: analysis,
        currentStep: 'suggestions',
      }));
    },
    onError: (error) => {
      console.error('❌ [Refinement] Analysis failed:', error);
      setRefinementState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      }));
    },
  });

  // Suggestions mutation
  const getSuggestionsMutation = useMutation({
    mutationFn: async ({ prompt, criteria }: { prompt: string; criteria?: RefinementCriteria }) => {
      console.log('💡 [Refinement] Getting suggestions...');
      const response = await buyerProfileService.getRefinementSuggestions(prompt, criteria);
      return response.data as RefinementSuggestions;
    },
    onMutate: () => {
      setRefinementState(prev => ({
        ...prev,
        isLoadingSuggestions: true,
        error: null,
      }));
    },
    onSuccess: (suggestions) => {
      console.log('✅ [Refinement] Suggestions loaded:', suggestions);

      // Add IDs to suggestions since backend doesn't include them
      // Also ensure proper data structure with fallbacks for missing fields
      const suggestionsWithIds = {
        suggestions: (suggestions.suggestions || []).map((suggestion: any, index: number) => ({
          ...suggestion,
          id: `suggestion-${index}-${Date.now()}`, // Generate unique ID
        })),
        categories: suggestions.categories || {},
        overall_priority: suggestions.overall_priority || 'medium',
        estimated_improvement: suggestions.estimated_improvement || 25,
      };

      setRefinementState(prev => ({
        ...prev,
        isLoadingSuggestions: false,
        suggestions: suggestionsWithIds,
        selectedSuggestions: [], // Start with none selected
      }));
    },
    onError: (error) => {
      console.error('❌ [Refinement] Suggestions failed:', error);
      setRefinementState(prev => ({
        ...prev,
        isLoadingSuggestions: false,
        error: error instanceof Error ? error.message : 'Failed to load suggestions',
      }));
    },
  });

  // Refinement mutation
  const refinePromptMutation = useMutation({
    mutationFn: async ({
      prompt,
      selectedSuggestions,
      criteria
    }: {
      prompt: string;
      selectedSuggestions: string[];
      criteria?: RefinementCriteria;
    }) => {
      console.log(`✨ [Refinement] Refining prompt with ${selectedSuggestions.length} suggestions...`);
      const response = await buyerProfileService.refinePrompt(prompt, selectedSuggestions, criteria);
      return response.data as PromptRefinementResult;
    },
    onMutate: () => {
      setRefinementState(prev => ({
        ...prev,
        isRefining: true,
        error: null,
      }));
    },
    onSuccess: (result) => {
      console.log('✅ [Refinement] Refinement complete:', result);

      // Extract refinement data from nested structure
      // Backend returns { refinement: { original_prompt, refined_prompt, etc. } }
      const refinementData = (result as any).refinement || result;

      setRefinementState(prev => ({
        ...prev,
        isRefining: false,
        refinementResult: refinementData,
        currentStep: 'review',
      }));
    },
    onError: (error) => {
      console.error('❌ [Refinement] Refinement failed:', error);
      setRefinementState(prev => ({
        ...prev,
        isRefining: false,
        error: error instanceof Error ? error.message : 'Refinement failed',
      }));
    },
  });

  // Automatic suggestions fetch after analysis completes
  useEffect(() => {
    // Only fetch suggestions if:
    // 1. Analysis is complete (we have qualityAnalysis)
    // 2. We're on the suggestions step
    // 3. We don't already have suggestions
    // 4. We're not currently loading suggestions
    // 5. We have the last analysis inputs
    if (
      refinementState.qualityAnalysis &&
      refinementState.currentStep === 'suggestions' &&
      !refinementState.suggestions &&
      !refinementState.isLoadingSuggestions &&
      lastAnalysisInputs
    ) {
      console.log('🤖 [Refinement] Auto-fetching suggestions after analysis completion');
      getSuggestionsMutation.mutate({
        prompt: lastAnalysisInputs.prompt,
        criteria: lastAnalysisInputs.criteria,
      });
    }
  }, [
    refinementState.qualityAnalysis,
    refinementState.currentStep,
    refinementState.suggestions,
    refinementState.isLoadingSuggestions,
    lastAnalysisInputs,
    getSuggestionsMutation,
  ]);

  // Analysis function
  const analyzePrompt = useCallback(async (prompt: string, criteria?: RefinementCriteria) => {
    if (!prompt.trim()) {
      setRefinementState(prev => ({
        ...prev,
        error: 'Please enter a prompt to analyze',
      }));
      return;
    }

    await analyzePromptMutation.mutateAsync({ prompt, criteria });
  }, [analyzePromptMutation]);

  // Suggestions function
  const getSuggestions = useCallback(async (prompt: string, criteria?: RefinementCriteria) => {
    if (!prompt.trim()) {
      setRefinementState(prev => ({
        ...prev,
        error: 'Please enter a prompt to get suggestions',
      }));
      return;
    }

    await getSuggestionsMutation.mutateAsync({ prompt, criteria });
  }, [getSuggestionsMutation]);

  // Toggle suggestion selection
  const toggleSuggestion = useCallback((suggestionId: string) => {
    setRefinementState(prev => ({
      ...prev,
      selectedSuggestions: prev.selectedSuggestions.includes(suggestionId)
        ? prev.selectedSuggestions.filter(id => id !== suggestionId)
        : [...prev.selectedSuggestions, suggestionId],
    }));
  }, []);

  // Select all suggestions
  const selectAllSuggestions = useCallback(() => {
    setRefinementState(prev => ({
      ...prev,
      selectedSuggestions: prev.suggestions?.suggestions.map(s => s.id) || [],
    }));
  }, []);

  // Clear all suggestions
  const clearSelectedSuggestions = useCallback(() => {
    setRefinementState(prev => ({
      ...prev,
      selectedSuggestions: [],
    }));
  }, []);

  // Refinement function
  const refinePrompt = useCallback(async (prompt: string, criteria?: RefinementCriteria) => {
    if (!prompt.trim()) {
      setRefinementState(prev => ({
        ...prev,
        error: 'Please enter a prompt to refine',
      }));
      return;
    }

    if (refinementState.selectedSuggestions.length === 0) {
      setRefinementState(prev => ({
        ...prev,
        error: 'Please select at least one suggestion to apply',
      }));
      return;
    }

    await refinePromptMutation.mutateAsync({
      prompt,
      selectedSuggestions: refinementState.selectedSuggestions,
      criteria,
    });
  }, [refinePromptMutation, refinementState.selectedSuggestions]);

  // Accept refinement
  const acceptRefinement = useCallback((): string | null => {
    const refinedPrompt = refinementState.refinementResult?.refined_prompt;
    if (refinedPrompt) {
      setRefinementState(prev => ({
        ...prev,
        currentStep: 'complete',
      }));
      return refinedPrompt;
    }
    return null;
  }, [refinementState.refinementResult]);

  // Reject refinement
  const rejectRefinement = useCallback(() => {
    setRefinementState(prev => ({
      ...prev,
      refinementResult: null,
      currentStep: 'suggestions',
    }));
  }, []);

  // Modal functions
  const openModal = useCallback(() => {
    setRefinementState(prev => ({
      ...prev,
      showModal: true,
      currentStep: 'analysis',
    }));
  }, []);

  const closeModal = useCallback(() => {
    setRefinementState(prev => ({
      ...prev,
      showModal: false,
    }));
  }, []);

  const setStep = useCallback((step: RefinementState['currentStep']) => {
    setRefinementState(prev => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  // Reset refinement
  const resetRefinement = useCallback(() => {
    setRefinementState(initialRefinementState);
    setLastAnalysisInputs(null); // Clear stored analysis inputs
  }, []);

  // Computed properties
  const hasAnalysis = refinementState.qualityAnalysis !== null;
  const hasSuggestions = refinementState.suggestions !== null;
  const hasRefinement = refinementState.refinementResult !== null;
  const selectedSuggestionsCount = refinementState.selectedSuggestions.length;
  const isLoading = refinementState.isAnalyzing ||
                   refinementState.isLoadingSuggestions ||
                   refinementState.isRefining;

  return {
    // State
    refinementState,

    // Analysis functions
    analyzePrompt,

    // Suggestions functions
    getSuggestions,
    toggleSuggestion,
    selectAllSuggestions,
    clearSelectedSuggestions,

    // Refinement functions
    refinePrompt,
    acceptRefinement,
    rejectRefinement,

    // Modal functions
    openModal,
    closeModal,
    setStep,

    // Reset
    resetRefinement,

    // Computed properties
    hasAnalysis,
    hasSuggestions,
    hasRefinement,
    selectedSuggestionsCount,
    isLoading,
  };
};

/**
 * Helper function to extract criteria from workflow state
 */
export const extractCriteriaFromWorkflowState = (workflowState: any): RefinementCriteria => {
  return {
    basic_criteria: workflowState?.basic_criteria || {},
    location_criteria: workflowState?.location_criteria || {},
    advanced_criteria: workflowState?.advanced_criteria || {},
    buyer_context: workflowState?.buyer_context || {},
  };
};