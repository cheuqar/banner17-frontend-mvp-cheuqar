import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Box, Paper, Typography, Chip, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import MentionPopup from './MentionPopup';
import MentionContext from './MentionContext';
import { mentionService } from '../../services/mentionService';
import { chatService } from '../../services/chatService';
import type { 
  MentionState, 
  MentionCategory, 
  MentionEntity,
  ChatSessionMention 
} from '../../types/mention';

interface MentionSystemProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  sessionId?: string;
  onMentionsChange?: (mentions: ChatSessionMention[]) => void;
  onSessionCreated?: (sessionId: string) => void;
  disabled?: boolean;
}

export interface MentionSystemRef {
  handleKeyDown: (event: React.KeyboardEvent) => boolean;
}

const MentionSystem = forwardRef<MentionSystemRef, MentionSystemProps>(({
  inputValue,
  onInputChange,
  sessionId,
  onMentionsChange,
  onSessionCreated,
  disabled = false
}, ref) => {
  const [mentionState, setMentionState] = useState<MentionState>({
    isActive: false,
    currentLevel: 'categories',
    selectedCategory: null,
    selectedSubcategory: null,
    highlightedIndex: 0,
    searchQuery: '',
    mentions: [],
    entities: [],
    hasMore: false,
    currentPage: 1,
    isLoading: false,
  });

  const [categories, setCategories] = useState<MentionCategory[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Load mention categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await mentionService.getMentionCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load mention categories:', error);
      }
    };

    if (!disabled) {
      loadCategories();
    }
  }, [disabled]);

  // Load existing mentions for session
  useEffect(() => {
    const loadSessionMentions = async () => {
      if (!sessionId || disabled) return;
      
      try {
        const mentions = await mentionService.getSessionMentions(sessionId);
        setMentionState(prev => ({ ...prev, mentions }));
        onMentionsChange?.(mentions);
      } catch (error) {
        // Handle any remaining errors (service should handle 404s gracefully now)
        console.error('Failed to load session mentions:', error);
        // Initialize with empty mentions as fallback
        setMentionState(prev => ({ ...prev, mentions: [] }));
        onMentionsChange?.([]);
      }
    };

    loadSessionMentions();
  }, [sessionId, onMentionsChange, disabled]);

  // Helper function to close mention popup and optionally clean up @ symbol
  const closeMentionPopup = useCallback((removeAtSymbol: boolean = true) => {
    setMentionState(prev => ({ ...prev, isActive: false }));
    
    // Remove trailing @ symbol if it exists and requested
    if (removeAtSymbol) {
      const lastAtIndex = inputValue.lastIndexOf('@');
      if (lastAtIndex !== -1 && lastAtIndex === inputValue.length - 1) {
        const newValue = inputValue.substring(0, lastAtIndex);
        onInputChange(newValue);
      }
    }
  }, [inputValue, onInputChange]);

  // Detect @ character in input changes - optimized with debouncing
  useEffect(() => {
    if (disabled) return;

    // Debounce the @ detection to avoid excessive state updates
    const timeoutId = setTimeout(() => {
      const textBeforeCursor = inputValue;
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      // Only update state if there's an actual change needed
      if (lastAtIndex !== -1 && lastAtIndex === textBeforeCursor.length - 1) {
        // @ character at the end (just typed)
        setMentionState(prev => {
          if (!prev.isActive) {
            console.log('🔍 [MentionSystem] Activating mention popup for @ character');
            return {
              ...prev,
              isActive: true,
              currentLevel: 'categories',
              selectedCategory: null,
              selectedSubcategory: null,
              highlightedIndex: 0,
              searchQuery: '',
            };
          }
          return prev;
        });
      } else if (lastAtIndex === -1) {
        // @ character was removed
        setMentionState(prev => {
          if (prev.isActive) {
            return { ...prev, isActive: false };
          }
          return prev;
        });
      }
    }, 50); // 50ms debounce

    return () => clearTimeout(timeoutId);
  }, [inputValue, disabled]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentionState.isActive && popupRef.current && !popupRef.current.contains(event.target as Node)) {
        closeMentionPopup();
      }
    };

    if (mentionState.isActive) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [mentionState.isActive, closeMentionPopup]);

  // Handle loading more entities for pagination
  const loadMoreEntities = useCallback(async () => {
    if (!mentionState.hasMore || mentionState.isLoading || mentionState.selectedCategory !== 'properties') {
      return;
    }

    setMentionState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const nextPage = mentionState.currentPage + 1;
      const result = await mentionService.getMentionableProperties(nextPage, 20);
      
      setMentionState(prev => ({
        ...prev,
        entities: [...prev.entities, ...result.entities], // Append new entities
        hasMore: result.has_more,
        currentPage: result.page,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load more properties:', error);
      setMentionState(prev => ({ ...prev, isLoading: false }));
    }
  }, [mentionState.hasMore, mentionState.isLoading, mentionState.selectedCategory, mentionState.currentPage]);

  // Handle category selection
  const handleCategorySelect = useCallback(async (category: MentionCategory) => {
    if (category.id === 'properties') {
      setMentionState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const result = await mentionService.getMentionableProperties(1, 20);
        setMentionState(prev => ({
          ...prev,
          currentLevel: 'entities',
          selectedCategory: category.id,
          entities: result.entities,
          hasMore: result.has_more,
          currentPage: result.page,
          highlightedIndex: 0,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to load properties:', error);
        setMentionState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  // Handle entity selection
  const handleEntitySelect = useCallback(async (entity: MentionEntity) => {
    console.log('🎯 [MentionSystem] Entity selected:', { entity, sessionId });
    
    let currentSessionId = sessionId;
    
    // Create session if it doesn't exist
    if (!currentSessionId) {
      console.log('🆕 [MentionSystem] No session exists, creating one for mention...');
      try {
        const response = await chatService.createChatSession('New Chat');
        if (response && response.sessionId) {
          currentSessionId = response.sessionId;
          console.log('✅ [MentionSystem] Session created for mention:', currentSessionId);
          
          // Notify parent component about the new session
          if (onSessionCreated) {
            onSessionCreated(currentSessionId);
          }
        } else {
          console.error('❌ [MentionSystem] Failed to create session for mention');
          return;
        }
      } catch (error) {
        console.error('💥 [MentionSystem] Error creating session for mention:', error);
        return;
      }
    }

    try {
      console.log('📡 [MentionSystem] Adding mention to session:', { sessionId: currentSessionId, entity });
      const mention = await mentionService.addMentionToSession(currentSessionId, {
        entity_type: entity.type,
        entity_id: entity.id,
        entity_category: entity.category,
        display_text: entity.display_text,
        entity_metadata: entity.entity_metadata,
      });

      console.log('✅ [MentionSystem] Mention added successfully:', mention);

      // Update local state - close without removing @ since we're replacing it
      const updatedMentions = [...mentionState.mentions, mention];
      setMentionState(prev => ({
        ...prev,
        mentions: updatedMentions,
        isActive: false,
      }));
      
      // Notify parent
      onMentionsChange?.(updatedMentions);

      // Replace @ with inline mention in the format @entity_name
      const lastAtIndex = inputValue.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const beforeAt = inputValue.substring(0, lastAtIndex);
        const afterAt = inputValue.substring(lastAtIndex + 1);
        
        // Create mention text like @property_name or @entity_name
        const mentionText = `@${entity.display_text.replace(/\s+/g, '_').toLowerCase()}`;
        const newValue = beforeAt + mentionText + ' ' + afterAt;
        onInputChange(newValue);
      }
      
    } catch (error) {
      console.error('Failed to add mention:', error);
    }
  }, [sessionId, mentionState.mentions, onMentionsChange, inputValue, onInputChange, onSessionCreated]);

  // Handle mention removal
  const handleRemoveMention = useCallback(async (mentionId: string) => {
    if (!sessionId) return;

    try {
      await mentionService.removeMentionFromSession(sessionId, mentionId);
      
      const updatedMentions = mentionState.mentions.filter(m => m.id !== mentionId);
      setMentionState(prev => ({ ...prev, mentions: updatedMentions }));
      onMentionsChange?.(updatedMentions);
    } catch (error) {
      console.error('Failed to remove mention:', error);
    }
  }, [sessionId, mentionState.mentions, onMentionsChange]);

  // Handle mention keyboard navigation
  const handleMentionKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled || !mentionState.isActive) return false;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeMentionPopup();
        return true;
      
      case 'ArrowUp':
        event.preventDefault();
        setMentionState(prev => ({
          ...prev,
          highlightedIndex: Math.max(0, prev.highlightedIndex - 1)
        }));
        return true;
      
      case 'ArrowDown':
        event.preventDefault();
        const maxIndex = mentionState.currentLevel === 'categories' 
          ? categories.length - 1 
          : mentionState.entities.length - 1;
        
        const newIndex = Math.min(maxIndex, mentionState.highlightedIndex + 1);
        setMentionState(prev => ({
          ...prev,
          highlightedIndex: newIndex
        }));
        
        // Load more entities if we're near the end and there are more available
        if (mentionState.currentLevel === 'entities' && 
            newIndex >= maxIndex - 3 && // Load when 3 items from end
            mentionState.hasMore && 
            !mentionState.isLoading) {
          loadMoreEntities();
        }
        return true;
      
      case 'ArrowRight':
        event.preventDefault();
        if (mentionState.currentLevel === 'categories' && categories[mentionState.highlightedIndex]) {
          handleCategorySelect(categories[mentionState.highlightedIndex]);
        }
        return true;
      
      case 'Enter':
      case ' ': // Space key
        event.preventDefault();
        if (mentionState.currentLevel === 'categories' && categories[mentionState.highlightedIndex]) {
          handleCategorySelect(categories[mentionState.highlightedIndex]);
        } else if (mentionState.currentLevel === 'entities' && mentionState.entities[mentionState.highlightedIndex]) {
          handleEntitySelect(mentionState.entities[mentionState.highlightedIndex]);
        }
        return true;
    }
    
    return false;
  }, [mentionState, categories, disabled, closeMentionPopup, loadMoreEntities, handleCategorySelect, handleEntitySelect]);

  // Expose keyboard handler to parent via ref
  useImperativeHandle(ref, () => ({
    handleKeyDown: handleMentionKeyDown
  }), [handleMentionKeyDown]);

  return (
    <Box>
      {/* Mention Popup */}
      {mentionState.isActive && (
        <MentionPopup
          ref={popupRef}
          mentionState={mentionState}
          categories={categories}
          onCategorySelect={handleCategorySelect}
          onEntitySelect={handleEntitySelect}
          onClose={closeMentionPopup}
        />
      )}
    </Box>
  );
});

MentionSystem.displayName = 'MentionSystem';

export default MentionSystem;
