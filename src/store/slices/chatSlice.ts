import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatMessage } from '../../types';
import { CHAT_STEPS } from '../../constants';

const initialState: ChatState = {
  messages: [],
  currentStep: CHAT_STEPS.WELCOME,
  isTyping: false,
  quickReplies: [],
  conversationContext: {},
  pendingInputs: [],
  inputHistory: [],
  activeInputControl: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateCurrentStep: (state, action: PayloadAction<string>) => {
      state.currentStep = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setQuickReplies: (state, action: PayloadAction<string[]>) => {
      state.quickReplies = action.payload;
    },
    updateConversationContext: (state, action: PayloadAction<Record<string, any>>) => {
      state.conversationContext = { ...state.conversationContext, ...action.payload };
    },
    addPendingInput: (state, action: PayloadAction<string>) => {
      if (!state.pendingInputs.includes(action.payload)) {
        state.pendingInputs.push(action.payload);
      }
    },
    removePendingInput: (state, action: PayloadAction<string>) => {
      state.pendingInputs = state.pendingInputs.filter(input => input !== action.payload);
    },
    setActiveInputControl: (state, action: PayloadAction<string | null>) => {
      state.activeInputControl = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    resetChat: (state) => {
      return initialState;
    },
  },
});

export const {
  addMessage,
  updateCurrentStep,
  setTyping,
  setQuickReplies,
  updateConversationContext,
  addPendingInput,
  removePendingInput,
  setActiveInputControl,
  clearMessages,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer; 