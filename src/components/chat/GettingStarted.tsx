import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Fade,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Explore,
  Search,
  Analytics,
  TrendingUp,
  LocationOn,
  Home,
  Person,
  AutoAwesome,
  PlayArrow
} from '@mui/icons-material';

interface GettingStartedProps {
  onStartExploration?: () => void;
  
  // 🎯 NEW: Journey loading animation methods
  loadingJourneyMethods?: {
    addLoadingJourney: () => string;
    removeLoadingJourney: (id: string) => void;
  } | null;
}

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  features?: string[];
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const GettingStarted: React.FC<GettingStartedProps> = ({ 
  onStartExploration, 
  loadingJourneyMethods 
}) => {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCreatingJourney, setIsCreatingJourney] = useState(false);
  
  // 🎯 NEW: Enhanced start exploration with loading journey animation
  const handleStartExplorationWithAnimation = async () => {
    try {
      setIsCreatingJourney(true);
      console.log('🎯 [GettingStarted] Starting exploration with loading animation...');
      
      // Add loading journey animation to left navigation
      let loadingJourneyId: string | null = null;
      if (loadingJourneyMethods?.addLoadingJourney) {
        loadingJourneyId = loadingJourneyMethods.addLoadingJourney();
        console.log('🎯 [GettingStarted] Added loading journey:', loadingJourneyId);
      }
      
      // Call the actual start exploration handler
      await onStartExploration?.();
      
      // Remove loading journey after creation completes (with small delay for UX)
      if (loadingJourneyId && loadingJourneyMethods?.removeLoadingJourney) {
        setTimeout(() => {
          loadingJourneyMethods.removeLoadingJourney(loadingJourneyId!);
          console.log('🎯 [GettingStarted] Removed loading journey:', loadingJourneyId);
        }, 1000); // 1 second delay to show the loading state
      }
      
    } catch (error) {
      console.error('❌ [GettingStarted] Failed to start exploration:', error);
      setIsCreatingJourney(false);
    }
  };

  const slides: Slide[] = [
    {
      id: 'welcome',
      title: "Hey there! 👋 I'm Grace",
      subtitle: "Your AI Property Assistant",
      content: "Welcome to your personalized property journey! I'm here to help you navigate Australia's property market with intelligence and ease. Whether you're buying your first home, investing, or exploring options, I've got you covered.",
      features: [
        "🔍 Smart property search across 30,000+ listings",
        "🗺️ Location-aware spatial analysis",
        "📊 Market trends and insights",
        "💡 Personalized recommendations"
      ],
      icon: <Person sx={{ fontSize: 48, color: theme.palette.primary.main }} />
    },
    {
      id: 'journeys',
      title: "Understanding Your Journey",
      subtitle: "Organize Your Property Adventure",
      content: "Every great property adventure starts with a Journey. Think of Journeys as your organized workspace where all your property explorations, analyses, and decisions come together in one place.",
      features: [
        "🧭 Each Journey contains multiple chat sessions",
        "📝 Automatic organization by property search criteria",
        "🔄 Easy switching between different property goals",
        "📊 Track your progress and preferences over time"
      ],
      icon: <Explore sx={{ fontSize: 48, color: theme.palette.success.main }} />
    },
    {
      id: 'exploration',
      title: "Exploration Sessions with Grace",
      subtitle: "Discover Properties That Match Your Dreams",
      content: "Exploration Sessions are where the magic happens! Chat with me naturally about what you're looking for, and I'll help you discover properties, refine your criteria, and understand the market.",
      features: [
        "💬 Natural conversation - just tell me what you want",
        "🎯 Progressive filter building (\"3 bedrooms\", \"near good schools\")",
        "🗺️ Spatial search (\"apartments within 5km of Sydney CBD\")",
        "📈 Market insights and comparable analysis"
      ],
      icon: <Search sx={{ fontSize: 48, color: theme.palette.info.main }} />
    },
    {
      id: 'property-drill',
      title: "Property Deep Dives with Isaac",
      subtitle: "Expert Analysis When You're Interested",
      content: "Found a property that caught your eye? That's where Isaac comes in! He's our property analysis specialist who provides comprehensive insights, market research, and investment analysis.",
      features: [
        "🔍 Detailed property breakdowns and condition analysis",
        "📊 Market comparisons and pricing insights",
        "🏘️ Neighborhood analysis and lifestyle factors",
        "💰 Investment potential and ROI calculations"
      ],
      icon: <Analytics sx={{ fontSize: 48, color: theme.palette.warning.main }} />
    },
    {
      id: 'getting-started',
      title: "Ready to Start Your Journey?",
      subtitle: "Let's Find Your Perfect Property",
      content: "You're all set! Click \"Start Exploring\" to begin your first Journey with me. I'll help you discover properties that match your needs and guide you through every step of the process.",
      features: [
        "🚀 Start with a simple description of what you're looking for",
        "🎯 I'll ask smart questions to understand your preferences",
        "🔍 Discover properties with intelligent search and filtering",
        "📱 Seamlessly hand off to Isaac for detailed analysis when needed"
      ],
      icon: <AutoAwesome sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
      action: {
        label: isCreatingJourney ? "Creating Journey..." : "Start Exploring",
        onClick: handleStartExplorationWithAnimation
      }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        minHeight: '80vh'
      }}
    >
      {/* Grace Avatar */}
      <Avatar
        src="/px-grace.png"
        alt="Grace"
        sx={{
          width: 80,
          height: 80,
          mb: 2,
          border: `3px solid ${theme.palette.primary.main}`,
          boxShadow: theme.shadows[4]
        }}
      />

      {/* Main Content Card */}
      <Paper
        elevation={8}
        sx={{
          maxWidth: 700,
          width: '100%',
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          position: 'relative',
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Fade in={true} key={currentSlide} timeout={300}>
          <Box>
            {/* Slide Icon */}
            <Box sx={{ mb: 3 }}>
              {currentSlideData.icon}
            </Box>

            {/* Title and Subtitle */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              {currentSlideData.title}
            </Typography>
            
            {currentSlideData.subtitle && (
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                {currentSlideData.subtitle}
              </Typography>
            )}

            {/* Main Content */}
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6, mb: 3 }}>
              {currentSlideData.content}
            </Typography>

            {/* Features */}
            {currentSlideData.features && (
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                {currentSlideData.features.map((feature, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1, fontSize: '1rem' }}>
                    {feature}
                  </Typography>
                ))}
              </Box>
            )}

            {/* Action Button */}
            {currentSlideData.action && (
              <Button
                variant="contained"
                size="large"
                startIcon={isCreatingJourney ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                onClick={currentSlideData.action.onClick}
                disabled={isCreatingJourney}
                sx={{
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  '&:hover': !isCreatingJourney ? {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                  } : {},
                  '&:disabled': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}60 30%, ${theme.palette.secondary.main}60 90%)`,
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }}
              >
                {currentSlideData.action.label}
              </Button>
            )}
          </Box>
        </Fade>

        {/* Navigation Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          {/* Previous Button */}
          <IconButton 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            sx={{ 
              opacity: currentSlide === 0 ? 0.3 : 1,
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
            }}
          >
            <NavigateBefore />
          </IconButton>

          {/* Slide Indicators */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {slides.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: currentSlide === index ? theme.palette.primary.main : theme.palette.grey[300],
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: currentSlide === index ? theme.palette.primary.main : theme.palette.grey[400],
                    transform: 'scale(1.2)'
                  }
                }}
              />
            ))}
          </Box>

          {/* Next Button */}
          <IconButton 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            sx={{ 
              opacity: currentSlide === slides.length - 1 ? 0.3 : 1,
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
            }}
          >
            <NavigateNext />
          </IconButton>
        </Box>

        {/* Progress Indicator */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {currentSlide + 1} of {slides.length}
          </Typography>
        </Box>
      </Paper>

      {/* Skip Option */}
      <Button
        variant="text"
        size="small"
        onClick={handleStartExplorationWithAnimation}
        disabled={isCreatingJourney}
        startIcon={isCreatingJourney ? <CircularProgress size={16} color="inherit" /> : undefined}
        sx={{ 
          mt: 2, 
          color: theme.palette.text.secondary,
          '&:disabled': {
            color: theme.palette.text.disabled
          }
        }}
      >
        {isCreatingJourney ? "Creating..." : "Skip introduction"}
      </Button>
    </Box>
  );
};

export default GettingStarted;
