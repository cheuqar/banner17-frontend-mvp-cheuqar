import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, ThemeProvider } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { style4V2SharedTheme } from './theme/style4V2SharedTheme';
import AuthGuard from './components/auth/AuthGuard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import WelcomeScreen from './pages/WelcomeScreen';
import ChatInterface from './pages/ChatInterface';
import DesignPreview from './pages/DesignPreview';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PropertyListingPageStyle4V2 from './pages/PropertyListingPage/PropertyListingPageStyle4V2';
import BuyerProfileBuilder from './pages/BuyerProfileBuilder';
import BuyerProfileEditor from './pages/BuyerProfileEditor'; // Phase 3.7.1: New prompt-centric editor
import BuyerProfileList from './pages/BuyerProfileList';
import ChatHistory from './components/organisms/ChatHistory';
import SmartSearchPage from './pages/SmartSearch';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import EmailVerificationRequired from './pages/EmailVerificationRequired';


import LeftNavigation, { type NavigationPage } from './components/layout/LeftNavigation';
import MyProperties from './components/pages/MyProperties';
import UsageBilling from './components/pages/UsageBilling';
import SettingsPage from './components/pages/SettingsPage';
import CompactPlanInfo from './components/chat/CompactPlanInfo';
import CompactSessionInfo, { type SessionMetrics } from './components/chat/CompactSessionInfo';
import EnhancedToolsControl from './components/tools/EnhancedToolsControl';
import CapabilitiesMatrixModal from './components/CapabilitiesMatrixModal';
import { useTools } from './hooks/useTools';

// Inner component that has access to AuthContext
function AppContent() {
  // Get tools data (now inside AuthProvider)
  const { tools } = useTools();
  
  // Layout state - navigation always shown since no header toggle
  const [currentPage, setCurrentPage] = useState<NavigationPage>('chat');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  
  // Chat-specific state
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
  
  // Track current active session ID for highlighting in Left Navigation
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // 🎯 NEW: Journey loading animation methods from LeftNavigation
  const [loadingJourneyMethods, setLoadingJourneyMethods] = useState<{
    addLoadingJourney: () => string;
    removeLoadingJourney: (id: string) => void;
  } | null>(null);
  
  // Mock plan data - matches CompactPlanInfo interface
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
  
  // Removed tab management - now using direct component rendering
  
  // Chat interface refs for communication
  const chatInterfaceCanvasCloseRef = useRef<((tabId: string) => void) | null>(null);
  const chatInterfaceSessionResumeRef = useRef<((sessionId: string, messages: any[], session?: any) => void) | null>(null);
  const chatInterfaceNewJourneyRef = useRef<(() => void) | null>(null);
  const chatHistoryRefreshRef = useRef<(() => void) | null>(null);

  // Removed tab ID generation - no longer needed

  // Handle new journey/chat creation - simplified
  const handleNewChat = useCallback(() => {
    console.log('🚀 [App] New Journey request received');
    
    // Switch to chat page and let registered handler create new journey
    setCurrentPage('chat');
    if (chatInterfaceNewJourneyRef.current) {
      console.log('✅ [App] Using registered New Journey handler');
      chatInterfaceNewJourneyRef.current();
    }
  }, []);

  // Simplified canvas handlers - keep for ChatInterface compatibility
  const handleCanvasAdd = useCallback((canvasTab: any) => {
    console.log('🎨 [App] Canvas add requested:', canvasTab.title);
    // For now, just log - may implement as modals or overlays later
  }, []);

  const handleCanvasClose = useCallback((tabId: string) => {
    console.log('🎨 [App] Canvas close requested:', tabId);
    // For now, just log - canvas management to be handled differently
  }, []);

  // Handle page navigation - simplified for direct rendering
  const handlePageChange = useCallback((page: NavigationPage) => {
    console.log('🔄 [App] Page navigation:', { from: currentPage, to: page });
    setCurrentPage(page);
  }, [currentPage]);

  // ✅ FIX: Stable callback for new journey handler registration
  const handleRegisterNewJourney = useCallback((handler: () => void) => {
    chatInterfaceNewJourneyRef.current = handler;
    console.log('✅ [App] New Journey handler registered for direct chat');
  }, []);

  // Removed tab initialization - now using direct component rendering

  // Determine if we're currently on chat page
  const isOnChatTab = currentPage === 'chat';
  
  // Debug logging for header visibility (commented out for performance)
  // console.log('🔍 [App] Header visibility debug:', {
  //   currentPage,
  //   activeTabId,
  //   activeTab: activeTab ? { id: activeTab.id, title: activeTab.title, type: activeTab.type } : null,
  //   isOnChatTab,
  //   tabsLength: tabs.length
  // });
  
  // Create chat props for header
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

  // Handle navigation collapse toggle
  const handleNavToggle = useCallback(() => {
    setIsNavCollapsed(!isNavCollapsed);
  }, [isNavCollapsed]);

  // Calculate layout dimensions - navigation responsive to collapse state
  const navigationWidth = isNavCollapsed ? 0 : 320;
  const mainPanelWidth = `calc(100vw - ${navigationWidth}px)`;

  return (
    <Box sx={{
      minHeight: '100vh',
      height: 'auto',  // Allow scrolling instead of 100vh constraint
      bgcolor: '#ffffff',
      overflow: 'auto'  // Allow scrolling instead of hidden
    }}>
        <Routes>
          {/* Public Landing Page - No Authentication Required */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Authentication Routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/verify-email" element={<EmailVerificationRequired />} />

          {/* Authenticated Routes */}
          <Route path="/welcome" element={
            <AuthGuard>
              <WelcomeScreen />
            </AuthGuard>
          } />
          <Route path="/design-preview" element={
            <AuthGuard>
              <DesignPreview />
            </AuthGuard>
          } />
          <Route path="/property/detail/:propertyId" element={
            <AuthGuard>
              <PropertyDetailPage />
            </AuthGuard>
          } />
          <Route path="/properties" element={
            <AuthGuard>
              <PropertyListingPageStyle4V2 />
            </AuthGuard>
          } />
          {/* Smart Search Route - Phase 1 - FR-025: Protected with ProtectedRoute */}
          <Route path="/smart-search" element={
            <ProtectedRoute>
              <SmartSearchPage />
            </ProtectedRoute>
          } />
          {/* Legacy /search route for backward compatibility - FR-025: Protected with ProtectedRoute */}
          <Route path="/search" element={
            <ProtectedRoute>
              <SmartSearchPage />
            </ProtectedRoute>
          } />
          {/* Buyer Profile Routes - Phase 3.6 & 3.7.1 */}
          <Route path="/buyer-profiles" element={
            <AuthGuard>
              <BuyerProfileList />
            </AuthGuard>
          } />
          {/* Phase 3.7.1: New prompt-centric editor */}
          <Route path="/buyer-profile-editor" element={
            <AuthGuard>
              <BuyerProfileEditor />
            </AuthGuard>
          } />
          <Route path="/buyer-profile-editor/:profileId" element={
            <AuthGuard>
              <BuyerProfileEditor />
            </AuthGuard>
          } />
          {/* Legacy chat-first builder (kept for backward compatibility) */}
          <Route path="/buyer-profile-builder" element={
            <AuthGuard>
              <BuyerProfileBuilder />
            </AuthGuard>
          } />
          <Route path="/buyer-profile-builder/:profileId" element={
            <AuthGuard>
              <BuyerProfileBuilder />
            </AuthGuard>
          } />
          <Route path="/chat-history" element={
            <AuthGuard>
              <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Simple header for chat history page */}
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
                {/* Chat History Component */}
                <Box sx={{ flex: 1 }}>
                  <ChatHistory />
                </Box>
              </Box>
            </AuthGuard>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ThemeProvider theme={style4V2SharedTheme}>
                <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}> {/* SLEEK: Removed header, direct flex layout */}
                    {/* Left Navigation - Responsive to collapse state */}
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
                      onSessionResume={(sessionId, messages, session) => {
                        console.log('🔄 [App] Session resume requested from left nav:', { sessionId, sessionTitle: session?.title });
                        if (chatInterfaceSessionResumeRef.current) {
                          chatInterfaceSessionResumeRef.current(sessionId, messages, session);
                        }
                      }}
                      currentSessionId={currentSessionId}
                      // Pass props for new functionality
                      chatProps={chatProps}
                      planData={planData}
                      sessionMetrics={currentSessionMetrics}
                      onShowCapabilities={() => setShowCapabilitiesModal(true)}
                      // Navigation collapse functionality
                      isCollapsed={isNavCollapsed}
                      onToggleCollapse={handleNavToggle}
                      
                      // 🎯 NEW: Journey loading animation methods callback
                      onLoadingJourneyMethodsReady={setLoadingJourneyMethods}
                    />
                  </Box>

                  {/* Main Content Area - Direct Component Rendering */}
                  <Box sx={{ 
                    width: mainPanelWidth,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Render component directly based on currentPage */}
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
                        
                        // 🎯 NEW: Journey loading animation methods for Getting Started
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

                {/* Capabilities Matrix Modal */}
                <CapabilitiesMatrixModal
                  open={showCapabilitiesModal}
                  onClose={() => setShowCapabilitiesModal(false)}
                />
              </ThemeProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </Box>
  );
}

// Main App component that provides AuthContext
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;