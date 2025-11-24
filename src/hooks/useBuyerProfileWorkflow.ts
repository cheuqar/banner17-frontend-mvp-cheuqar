/**
 * Buyer Profile Workflow State Management Hook
 *
 * Manages workflow_state for buyer profile builder (stateless pattern)
 * Handles state updates, node progression, and message accumulation
 *
 * Phase 3.3: Core state management hook
 */

import { useState, useCallback } from 'react';
import type {
  BuyerProfileWorkflowState,
  ProfileBuilderNode,
  WorkflowMessage,
  ChatDisplayMessage,
} from '../types/buyerProfile';
import {
  NODE_ORDER,
  TOTAL_WORKFLOW_NODES,
} from '../types/buyerProfile';

/**
 * Hook return type
 */
interface UseBuyerProfileWorkflowReturn {
  // Workflow state
  workflowState: BuyerProfileWorkflowState | null;
  currentNode: ProfileBuilderNode | null;
  completedNodes: ProfileBuilderNode[];

  // Display messages
  displayMessages: ChatDisplayMessage[];

  // Progress tracking
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;

  // State update methods
  setWorkflowState: (state: BuyerProfileWorkflowState) => void;
  updateWorkflowState: (updates: Partial<BuyerProfileWorkflowState>) => void;
  resetWorkflow: () => void;

  // Message management
  addMessage: (role: 'user' | 'assistant', content: string) => void;

  // Node navigation
  isFirstNode: boolean;
  isLastNode: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

/**
 * Custom hook for managing buyer profile workflow state
 *
 * Features:
 * - Stateless workflow_state management (passed between API calls)
 * - Message history tracking
 * - Progress calculation
 * - Node progression logic
 *
 * @returns Workflow state and management functions
 */
export const useBuyerProfileWorkflow = (): UseBuyerProfileWorkflowReturn => {
  // Core workflow state (null = not started)
  const [workflowState, setWorkflowStateInternal] = useState<BuyerProfileWorkflowState | null>(null);

  // Display messages for UI rendering
  const [displayMessages, setDisplayMessages] = useState<ChatDisplayMessage[]>([]);

  /**
   * Set complete workflow state (from API response)
   */
  const setWorkflowState = useCallback((state: BuyerProfileWorkflowState) => {
    setWorkflowStateInternal(state);

    // Update display messages from workflow state messages
    const messages: ChatDisplayMessage[] = state.messages.map((msg, index) => ({
      id: `msg-${index}`,
      role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: new Date(),
      node: state.current_node,
    }));

    setDisplayMessages(messages);
  }, []);

  /**
   * Update partial workflow state
   */
  const updateWorkflowState = useCallback((updates: Partial<BuyerProfileWorkflowState>) => {
    setWorkflowStateInternal(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  /**
   * Reset workflow to initial state
   */
  const resetWorkflow = useCallback(() => {
    setWorkflowStateInternal(null);
    setDisplayMessages([]);
  }, []);

  /**
   * Add a message to display messages
   */
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatDisplayMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      node: workflowState?.current_node || 'welcome',
    };

    setDisplayMessages(prev => [...prev, newMessage]);
  }, [workflowState?.current_node]);

  // Derived state - current node
  const currentNode = workflowState?.current_node || null;

  // Derived state - completed nodes
  const completedNodes = workflowState?.completed_nodes || [];

  // Derived state - current step (1-based index for UI)
  const currentStep = currentNode ? NODE_ORDER.indexOf(currentNode) + 1 : 0;

  // Derived state - total steps
  const totalSteps = TOTAL_WORKFLOW_NODES;

  // Derived state - progress percentage
  const progressPercentage = currentStep > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  // Derived state - navigation flags
  const isFirstNode = currentNode === NODE_ORDER[0];
  const isLastNode = currentNode === NODE_ORDER[NODE_ORDER.length - 1];
  const canGoBack = currentStep > 1; // Can go back if not on first node
  const canGoForward = currentStep < totalSteps && completedNodes.includes(currentNode || 'welcome');

  return {
    // Workflow state
    workflowState,
    currentNode,
    completedNodes,

    // Display messages
    displayMessages,

    // Progress tracking
    currentStep,
    totalSteps,
    progressPercentage,

    // State update methods
    setWorkflowState,
    updateWorkflowState,
    resetWorkflow,

    // Message management
    addMessage,

    // Node navigation
    isFirstNode,
    isLastNode,
    canGoBack,
    canGoForward,
  };
};

/**
 * Helper: Create initial workflow state (for testing)
 * In production, this comes from API /builder/start
 */
export const createInitialWorkflowState = (): BuyerProfileWorkflowState => {
  return {
    current_node: 'welcome',
    completed_nodes: [],
    messages: [],
    current_user_message: '',
    basic_criteria: {},
    location_criteria: { state: '' },
    advanced_criteria: {},
    buyer_context: {},
    unsupported_criteria: [],
    profile_name: '',
    search_prompt: '',
    disambiguation_required: false,
  };
};

/**
 * Helper: Convert workflow message to display message
 */
export const workflowMessageToDisplayMessage = (
  msg: WorkflowMessage,
  index: number,
  node: ProfileBuilderNode
): ChatDisplayMessage => {
  return {
    id: `msg-${index}`,
    role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
    timestamp: new Date(),
    node,
  };
};
