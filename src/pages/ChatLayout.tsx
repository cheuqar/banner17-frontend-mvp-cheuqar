import React, { useState, useCallback, useRef } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import { style4V2SharedTheme } from '../theme/style4V2SharedTheme';
import LeftNavigation, { type NavigationPage } from '../components/layout/LeftNavigation';
import ChatInterface from './ChatInterface';
import MyProperties from '../components/pages/MyProperties';
import UsageBilling from '../components/pages/UsageBilling';
import SettingsPage from '../components/pages/SettingsPage';
import CapabilitiesMatrixModal from '../components/CapabilitiesMatrixModal';
import CompactPlanInfo from '../components/chat/CompactPlanInfo';
import CompactSessionInfo, { type SessionMetrics } from '../components/chat/CompactSessionInfo';
import EnhancedToolsControl from '../components/tools/EnhancedToolsControl';
import { useTools } from '../hooks/useTools';

export default function ChatLayout() {
  const { tools } = useTools();
  
  const [currentPage, setCurrentPage] = useState<NavigationPage>('chat');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionMetrics, setCurrentSessionMetrics] = useState<SessionMetrics>({
    sessionName: 'New Chat',
    totalTextCount: '0',
    totalInputTokens: '0',
    totalOutputTokens: '0',
    totalCreditsUsed: '0.00',
    toolsUsed: {}
  });
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);
  const [currentModel, setCurrentModel] = useState<string>('gemini-2.5-flash-lite');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingJourneyMethods, setLoadingJourneyMethods] = useState<{
    addLoadingJourney: () => string;
    removeLoadingJourney: (id: string) => void;
  } | null>(null);

  const planData = {
    planName: 'Pro Plan',
    planTier: 'PRO' as const,
    monthlyQueries: {
      current: 247,
      limit: 1000,
      period: 'monthly'
    },
    apiCalls: {
      current: 89,
      limit: 500,
      period: 'monthly'
    },
    propertyAnalyses: {
      current: 12,
      limit: 50,
      period: 'monthly'
    }
  };

  const chatInterfaceCanvasCloseRef = useRef<((tabId: string) => void) | null>(null);
  const chatInterfaceSessionResumeRef = useRef<((sessionId: string, messages: any[], session?: any) => void) | null>(null);
  const chatInterfaceNewJourneyRef = useRef<(() => void) | null>(null);
  const chatHistoryRefreshRef = useRef<(() => void) | null>(null);

  const handleNewChat = useCallback(() => {
    console.log('🚀 [ChatLayout] New Journey request received');
    setCurrentPage('chat');
    if (chatInterfaceNewJourneyRef.current) {
      console.log('✅ [ChatLayout] Using registered New Journey handler');
      chatInterfaceNewJourneyRef.current();
    }
  }, []);

  const handleCanvasAdd = useCallback((canvasTab: any) => {
    console.log('🎨 [ChatLayout] Canvas add requested:', canvasTab.title);
  }, []);

  const handleCanvasClose = useCallback((tabId: string) => {
    console.log('🎨 [ChatLayout] Canvas close requested:', tabId);
  }, []);

  const handlePageChange = useCallback((page: NavigationPage) => {
    console.log('🔄 [ChatLayout] Page navigation:', { from: currentPage, to: page });
    setCurrentPage(page);
  }, [currentPage]);

  const handleRegisterNewJourney = useCallback((handler: () => void) => {
    chatInterfaceNewJourneyRef.current = handler;
    console.log('✅ [ChatLayout] New Journey handler registered');
  }, []);

  const handleNavToggle = useCallback(() => {
    setIsNavCollapsed(!isNavCollapsed);
  }, [isNavCollapsed]);

  const isOnChatTab = currentPage === 'chat';
  const navigationWidth = isNavCollapsed ? 0 : 320;
  const mainPanelWidth = `calc(100vw - ${navigationWidth}px)`;

  const chatProps = isOnChatTab ? {
    onNewChat: handleNewChat,
    onShowCapabilities: () => setShowCapabilitiesModal(true),
    isLoading,
    planData,
    sessionMetrics: currentSessionMetrics,
    messages: currentMessages,
    onEditSessionName: (name: string) => {
      console.log('Edit session name:', name);
    },
    CompactPlanInfo,
    CompactSessionInfo,
    EnhancedToolsControl,
    currentModel,
    availableTools: tools,
    debugInfo
  } : undefined;

  const handleSessionResume = useCallback((sessionId: string, messages: any[], session?: any) => {
    console.log('🔄 [ChatLayout] Session resume requested from left nav:', { sessionId, sessionTitle: session?.title });
    if (chatInterfaceSessionResumeRef.current) {
      chatInterfaceSessionResumeRef.current(sessionId, messages, session);
    }
  }, []);
  return (
    <ThemeProvider theme={style4V2SharedTheme}>
      <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
        <Box sx={{
          width: navigationWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease-in-out',
          borderRight: isNavCollapsed ? 'none' : '1px solid #e5e5e5'
        }}>
          <LeftNavigation
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onNewChat={handleNewChat}
            onSessionResume={handleSessionResume}
            currentSessionId={currentSessionId}
            chatProps={chatProps}
            planData={planData}
            sessionMetrics={currentSessionMetrics}
            onShowCapabilities={() => setShowCapabilitiesModal(true)}
            isCollapsed={isNavCollapsed}
            onToggleCollapse={handleNavToggle}
            onLoadingJourneyMethodsReady={setLoadingJourneyMethods}
          />
        </Box>

        <Box sx={{ 
          width: mainPanelWidth,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {currentPage === 'chat' && (
            <ChatInterface
              key="direct-chat-interface"
              onCanvasAdd={handleCanvasAdd}
              onCanvasClose={handleCanvasClose}
              onRegisterCanvasClose={(handler) => {
                chatInterfaceCanvasCloseRef.current = handler;
              }}
              onRegisterSessionResume={(handler) => {
                chatInterfaceSessionResumeRef.current = handler;
              }}
              onRegisterNewJourney={handleRegisterNewJourney}
              onNewSessionCreated={() => {
                if (chatHistoryRefreshRef.current) {
                  chatHistoryRefreshRef.current();
                }
              }}
              onSessionMetricsChange={setCurrentSessionMetrics}
              onMessagesChange={setCurrentMessages}
              onCurrentModelChange={setCurrentModel}
              onDebugInfoChange={setDebugInfo}
              onSessionIdChange={setCurrentSessionId}
              onSessionNameChange={() => {
                // Session name changes handled by chat interface
              }}
              loadingJourneyMethods={loadingJourneyMethods}
            />
          )}
          
          {currentPage === 'my-properties' && (
            <MyProperties key="direct-my-properties" />
          )}
          
          {currentPage === 'usage-billing' && (
            <UsageBilling key="direct-usage-billing" />
          )}
          
          {currentPage === 'settings' && (
            <SettingsPage key="direct-settings" />
          )}
        </Box>
      </Box>

      <CapabilitiesMatrixModal
        open={showCapabilitiesModal}
        onClose={() => setShowCapabilitiesModal(false)}
      />
    </ThemeProvider>
  );
}

