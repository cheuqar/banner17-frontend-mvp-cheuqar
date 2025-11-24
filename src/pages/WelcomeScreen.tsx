import React, { useState, useMemo, useEffect } from 'react';

// Add CSS animations for the futuristic effects
const globalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(34, 196, 220, 0.3); }
    50% { box-shadow: 0 0 40px rgba(34, 196, 220, 0.6); }
  }
`;

// Inject global styles
if (typeof document !== 'undefined' && !document.getElementById('futuristic-animations')) {
  const style = document.createElement('style');
  style.id = 'futuristic-animations';
  style.textContent = globalStyles;
  document.head.appendChild(style);
}
import { Box, Typography, Button, Container, TextField, InputAdornment, IconButton, Chip, Divider, Paper, Tooltip, Fade, Slide, LinearProgress, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Send, Home, TrendingUp, Assessment, LocalOffer, LocationOn,
  Analytics, MonetizationOn, CompareArrows, Gavel, Calculate, Business, Star, 
  Timeline, MyLocation, Explore, Today, AutoGraph, Add, AccessTime,
  AutoAwesome as AIIcon, Psychology as GraceIcon, Speed as SpeedIcon, 
  Chat as ChatIcon, RocketLaunch as RocketIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import UserProfileMenu from '../components/auth/UserProfileMenu';
import CompactPlanInfo from '../components/chat/CompactPlanInfo';
import CapabilitiesMatrixModal from '../components/CapabilitiesMatrixModal';
import { chatService } from '../services/chatService';
import type { ChatSessionSummary } from '../services/chatService';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [recentSessions, setRecentSessions] = useState<ChatSessionSummary[]>([]);
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  
  // Mock plan data (this would come from user context in real implementation)
  const [planData] = useState({
    planName: 'Plus Plan',
    planTier: 'PLUS' as const,
    monthlyQueries: { current: 347, limit: 1500, period: 'monthly' },
    apiCalls: { current: 125, limit: 10000, period: 'daily' },
    propertyAnalyses: { current: 89, limit: 500, period: 'monthly' }
  });

  // Fetch recent sessions on component mount
  useEffect(() => {
    const fetchRecentSessions = async () => {
      if (isAuthenticated) {
        try {
          const response = await chatService.getChatHistory(1, 3);
          setRecentSessions(response.sessions || []);
        } catch (error) {
          console.error('Failed to fetch recent sessions:', error);
        }
      }
    };

    fetchRecentSessions();
  }, [isAuthenticated]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      console.log('🎯 [WelcomeScreen] Navigating to chat with initial message:', searchInput.trim());
      navigate('/chat', { state: { initialMessage: searchInput.trim() } });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log('💡 [WelcomeScreen] Suggestion clicked:', suggestion);
    setSearchInput(suggestion);
    // Auto-navigate when suggestion is clicked
    setTimeout(() => {
      console.log('🚀 [WelcomeScreen] Auto-navigating with suggestion:', suggestion);
      navigate('/chat', { state: { initialMessage: suggestion } });
    }, 100);
  };

  const handleSessionClick = (sessionId: string) => {
    console.log('🔄 [WelcomeScreen] Navigating to resume session:', sessionId);
    navigate('/chat', { state: { resumeSessionId: sessionId } });
  };

  // Pool of 30 preset starting queries
  const allStartingQueries = [
    { label: 'Find Properties', icon: <Home />, query: 'Show me properties in my area' },
    { label: 'Market Analysis', icon: <TrendingUp />, query: 'What are the market trends for my suburb?' },
    { label: 'Property Valuation', icon: <Assessment />, query: 'Help me value my property' },
    { label: 'Pricing Strategy', icon: <LocalOffer />, query: 'What\'s the best pricing strategy for my listing?' },
    { label: 'Investment Analysis', icon: <Analytics />, query: 'Analyze the investment potential of properties under $800k' },
    { label: 'Rental Yields', icon: <MonetizationOn />, query: 'Compare rental yields in different suburbs' },
    { label: 'Market Comparison', icon: <CompareArrows />, query: 'Compare property prices between Bondi and Manly' },
    { label: 'Auction Guide', icon: <Gavel />, query: 'How should I prepare for a property auction?' },
    { label: 'Mortgage Calculator', icon: <Calculate />, query: 'Calculate mortgage payments for a $750,000 property' },
    { label: 'Commercial Properties', icon: <Business />, query: 'Show me commercial properties for lease in CBD' },
    { label: 'Top Suburbs', icon: <Star />, query: 'What are the top performing suburbs this quarter?' },
    { label: 'Price History', icon: <Timeline />, query: 'Show me price history for houses in Paddington' },
    { label: 'Near Me', icon: <MyLocation />, query: 'Find properties within 5km of my current location' },
    { label: 'Explore Areas', icon: <Explore />, query: 'Explore family-friendly suburbs with good schools' },
    { label: 'Today\'s Listings', icon: <Today />, query: 'Show me new listings posted today' },
    { label: 'Growth Trends', icon: <AutoGraph />, query: 'Which areas have the highest growth potential?' },
    { label: 'First Home Buyer', icon: <Home />, query: 'Help me find affordable options for first home buyers' },
    { label: 'Luxury Properties', icon: <Star />, query: 'Show me luxury waterfront properties' },
    { label: 'Development Sites', icon: <Business />, query: 'Find development opportunities in inner suburbs' },
    { label: 'School Zones', icon: <LocationOn />, query: 'Properties in top school catchment areas' },
    { label: 'Transport Links', icon: <TrendingUp />, query: 'Properties near new transport infrastructure' },
    { label: 'Strata Reports', icon: <Assessment />, query: 'How to interpret strata building reports' },
    { label: 'Off-Plan Purchases', icon: <Calculate />, query: 'Risks and benefits of buying off-the-plan' },
    { label: 'Renovation Costs', icon: <LocalOffer />, query: 'Estimate renovation costs for older properties' },
    { label: 'Land Valuations', icon: <Analytics />, query: 'Value vacant land for development potential' },
    { label: 'International Buyers', icon: <Explore />, query: 'Guide for international property investors' },
    { label: 'Stamp Duty', icon: <MonetizationOn />, query: 'Calculate stamp duty costs across different states' },
    { label: 'Property Management', icon: <Business />, query: 'Best practices for managing investment properties' },
    { label: 'Market Cycles', icon: <Timeline />, query: 'Understanding Australian property market cycles' },
    { label: 'Due Diligence', icon: <Gavel />, query: 'Property inspection and due diligence checklist' }
  ];

  // Randomly select 5 queries each time the component mounts
  const suggestions = useMemo(() => {
    const shuffled = [...allStartingQueries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, 
          rgba(25, 118, 210, 0.3) 0%, 
          rgba(31, 170, 188, 0.4) 50%,
          rgba(76, 175, 80, 0.3) 100%
        ),
        url('/banner17-hero-2.png')
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(31, 170, 188, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(25, 118, 210, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(76, 175, 80, 0.3) 0%, transparent 50%)
          `,
          animation: 'float 20s ease-in-out infinite',
        }}
      />

      {/* Futuristic Header */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        p: 3,
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #1976d2, #0d2b2c)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
            }}
          >
            <ChatIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography variant="h5" sx={{
            fontWeight: 800,
            color: 'white',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          }}>
            Banner17
          </Typography>
        </Box>
        
        {/* Right Side Controls */}
        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Futuristic Plan Info */}
            <Paper
              sx={{
                px: 2,
                py: 1,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => setShowCapabilitiesModal(true)}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                {planData.planName}
              </Typography>
            </Paper>
            
            <Divider orientation="vertical" flexItem sx={{ height: 24, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
            
            <Tooltip title="Start new conversation">
              <Button
                onClick={() => navigate('/chat')}
                startIcon={<Add />}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  bgcolor: 'rgba(34, 196, 220, 0.9)',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(34, 196, 220, 0.3)',
                  '&:hover': {
                    bgcolor: '#0d2b2c',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(34, 196, 220, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                New Chat
              </Button>
            </Tooltip>
            
            {user && (
              <UserProfileMenu 
                user={user}
                onSignOut={signOut}
              />
            )}
          </Box>
        )}
        
        {!isAuthenticated && (
          <Typography variant="h6" sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 400,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            AI-powered property intelligence
          </Typography>
        )}
      </Box>

      {/* Futuristic Main Content Area */}
      <Box sx={{
        flex: 1,
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: { xs: 4, md: 8 }
      }}>
        {/* AI Stats Display */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            mb: 6,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center'
          }}>
            {[
              { icon: GraceIcon, label: 'Grace AI', value: 'Active', color: '#1976d2' },
              { icon: SpeedIcon, label: 'Response Time', value: '<10s', color: '#22c4dc' },
              { icon: AIIcon, label: 'Smart Search', value: '30K+', color: '#4caf50' }
            ].map((stat, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  minWidth: 140,
                  textAlign: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  animation: `float 3s ease-in-out infinite ${index * 0.5}s`,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                    bgcolor: 'rgba(255, 255, 255, 0.25)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <stat.icon sx={{ color: stat.color, fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {stat.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Fade>

        {/* Welcome Message - Futuristic */}
        <Slide direction="up" in={true} timeout={1200}>
          <Box sx={{ textAlign: 'center', mb: 6, maxWidth: '700px' }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                color: 'white',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                lineHeight: 1.1,
                mb: 3
              }}
            >
              Welcome to the{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(45deg, #22c4dc, #4caf50)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Future
              </Box>
              <br />
              of Property Intelligence
            </Typography>
            <Typography 
              variant="h5"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                lineHeight: 1.4
              }}
            >
              Your AI-powered property assistant is ready to help you explore, analyze, and make smarter real estate decisions.
            </Typography>
          </Box>
        </Slide>

        {/* Futuristic Search Container */}
        <Fade in={true} timeout={1500}>
          <Container maxWidth="md" sx={{ width: '100%', maxWidth: '800px' }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}>
              {/* Glassmorphism Search Input */}
              <Paper
                elevation={0}
                sx={{ 
                  width: '100%',
                  maxWidth: '700px',
                  p: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <TextField
                  fullWidth
                  value={searchInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about properties, market trends, spatial search, or get AI insights..."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      minHeight: '64px',
                      fontSize: '1.1rem',
                      color: 'white',
                      '&:hover': {
                        border: '2px solid rgba(34, 196, 220, 0.5)',
                        '& fieldset': {
                          border: 'none'
                        }
                      },
                      '&.Mui-focused': {
                        border: '2px solid #22c4dc',
                        boxShadow: '0 0 0 4px rgba(34, 196, 220, 0.2)',
                        '& fieldset': {
                          border: 'none'
                        }
                      },
                      '& fieldset': {
                        border: 'none'
                      }
                    },
                    '& .MuiInputBase-input': {
                      pl: 2,
                      pr: 2,
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        opacity: 1
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 24 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={handleSearch}
                          disabled={!searchInput.trim()}
                          startIcon={<RocketIcon />}
                          sx={{
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            bgcolor: searchInput.trim() ? 'rgba(34, 196, 220, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: searchInput.trim() ? '0 4px 20px rgba(34, 196, 220, 0.3)' : 'none',
                            '&:hover': {
                              bgcolor: searchInput.trim() ? '#0d2b2c' : 'rgba(255, 255, 255, 0.15)',
                              transform: 'translateY(-2px)',
                              boxShadow: searchInput.trim() ? '0 8px 32px rgba(34, 196, 220, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.1)'
                            },
                            '&.Mui-disabled': {
                              color: 'rgba(255, 255, 255, 0.5)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Launch
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Paper>

              {/* Futuristic Example Queries Section */}
              <Box sx={{ width: '100%', maxWidth: '800px' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                    mb: 1
                  }}>
                    🚀 AI-Powered Examples
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem'
                  }}>
                    Tap any card to launch an AI conversation
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 3,
                  mb: 4
                }}>
                  {suggestions.map((suggestion, index) => (
                    <Slide key={index} direction="up" in={true} timeout={800 + index * 200}>
                      <Paper
                        onClick={() => handleSuggestionClick(suggestion.query)}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 3,
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(34, 196, 220, 0.5)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: 'rgba(34, 196, 220, 0.2)',
                            border: '1px solid rgba(34, 196, 220, 0.3)'
                          }}>
                            {React.cloneElement(suggestion.icon, { 
                              sx: { color: '#22c4dc', fontSize: 20 } 
                            })}
                          </Box>
                          <Typography variant="subtitle1" sx={{
                            color: 'white',
                            fontWeight: 700,
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                          }}>
                            {suggestion.label}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                          {suggestion.query}
                        </Typography>
                      </Paper>
                    </Slide>
                  ))}
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    ✨ {allStartingQueries.length} intelligent queries available • {suggestions.length} dynamically selected
                  </Typography>
                </Box>
              </Box>
          </Box>
        </Container>
        </Fade>

        {/* Recent Sessions Section */}
        {isAuthenticated && recentSessions.length > 0 && (
          <Box sx={{ 
            mt: 6, 
            width: '100%', 
            maxWidth: '800px',
            px: 3
          }}>
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ 
                color: '#64748b', 
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Recent Conversations
              </Typography>
            </Divider>
            
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              maxWidth: '600px',
              mx: 'auto'
            }}>
              {recentSessions.map((session) => (
                <Paper
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                      border: '1px solid rgba(34, 196, 220, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: 'white',
                          fontWeight: 600,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        {session.title || 'Untitled conversation'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <AccessTime sx={{ fontSize: 12 }} />
                        {new Date(session.updated_at).toLocaleDateString()} • {session.message_count || 0} messages
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <Search fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

      </Box>
      
      {/* Capabilities Modal */}
      <CapabilitiesMatrixModal
        open={showCapabilitiesModal}
        onClose={() => setShowCapabilitiesModal(false)}
      />
    </Box>
  );
};

export default WelcomeScreen; 