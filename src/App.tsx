import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import WelcomeScreen from './pages/WelcomeScreen';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PropertyListingPageStyle4V2 from './pages/PropertyListingPage/PropertyListingPageStyle4V2';
import BuyerProfileBuilder from './pages/BuyerProfileBuilder';
import BuyerProfileEditor from './pages/BuyerProfileEditor'; // Phase 3.7.1: New prompt-centric editor
import BuyerProfileList from './pages/BuyerProfileList';
import ChatLayout from './pages/ChatLayout';
import ChatHistoryPage from './pages/ChatHistoryPage';
import SmartSearchPage from './pages/SmartSearch';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import EmailVerificationRequired from './pages/EmailVerificationRequired';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import NotFoundPage from './pages/NotFoundPage';

// Inner component that has access to AuthContext
function AppContent() {
  return (
    <Box sx={{
      minHeight: '100vh',
      height: 'auto',  // Allow scrolling instead of 100vh constraint
      bgcolor: '#ffffff',
      overflow: 'auto'  // Allow scrolling instead of hidden
    }}>
      <Routes>
        {/* ============================================ */}
        {/* Public Routes - No Authentication Required */}
        {/* ============================================ */}

        <Route path="/" element={<LandingPage />} />

        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/verify-email" element={<EmailVerificationRequired />} />

        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />

        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/properties" element={<PropertyListingPageStyle4V2 />} />
        <Route path="/property/detail/:propertyId" element={<PropertyDetailPage />} />

        <Route path="/search" element={<SmartSearchPage />} />
        
        {/* ============================================ */}
        {/* Protected Routes - Core Features */}
        {/* Full Auth + Email Verification Required */}
        {/* ============================================ */}

        <Route element={<ProtectedRoute />}>
          {/* Chat Route - Special layout with navigation */}
          <Route path="/chat" element={<ChatLayout />} />

          {/* Chat History */}
          <Route path="/chat-history" element={<ChatHistoryPage />} />

        </Route>

        {/* ============================================ */}
        {/* Authenticated Routes - Basic Auth Only */}
        {/* Shows modal, no email verification required */}
        {/* ============================================ */}

        <Route element={<AuthGuard />}>
          <Route path="/buyer-profiles" element={<BuyerProfileList />} />
          <Route path="/buyer-profile-editor" element={<BuyerProfileEditor />} />
          <Route path="/buyer-profile-editor/:profileId" element={<BuyerProfileEditor />} />
          <Route path="/buyer-profile-builder" element={<BuyerProfileBuilder />} />
          <Route path="/buyer-profile-builder/:profileId" element={<BuyerProfileBuilder />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
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