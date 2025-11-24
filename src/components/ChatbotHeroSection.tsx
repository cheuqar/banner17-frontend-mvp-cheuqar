import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Slide,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Psychology as GraceIcon,
  Analytics as IsaacIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import AnimatedChatDemo from './AnimatedChatDemo';

const DEMO_TITLES = [
  "Smart Property Discovery",
  "Spatial Intelligence", 
  "AI-Powered Analysis",
  "Expert Agent Handoff"
];

export const ChatbotHeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Auto-advance demos - with initial delay to prevent duplication
  useEffect(() => {
    if (!isPlaying) return;

    let interval: NodeJS.Timeout;

    // Add initial delay of 5 seconds to let the first demo complete initial setup
    const startDelay = setTimeout(() => {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setCurrentDemo(prev => (prev + 1) % 4);
            return 0;
          }
          return prev + 1;
        });
      }, 150); // 15 second cycles (100 * 150ms)
    }, 5000); // 5 second initial delay

    return () => {
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handleDemoSelect = (index: number) => {
    setCurrentDemo(index);
    setProgress(0);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStartChat = () => {
    navigate('/chat');
  };

  const handleLearnMore = () => {
    // Scroll to features or about section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      id="hero"
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, rgba(26, 26, 26, 0.69) 0%, rgba(45, 45, 45, 0.81) 100%), url('/banner17-hero-4.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
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

      <Container maxWidth="lg" sx={{ mx: 'auto', width: '100%' }}>
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          {/* Left Side - Main Content */}
          <Grid item xs={12} lg={7}>
            <Box sx={{ color: 'white', mb: 4, textAlign: { xs: 'center', lg: 'left' } }}>
              <Typography
                sx={{
                  fontFamily: '"Caveat", cursive',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 600,
                  color: '#0d2b2c',
                  mb: 2,
                  textAlign: { xs: 'center', lg: 'left' },
                }}
              >
                "AI That Makes Everyone a Property Expert"
              </Typography>
              
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 300,
                  mb: 3,
                  color: 'white',
                  textAlign: { xs: 'center', lg: 'left' },
                  textShadow: '0 2px 15px rgba(0, 0, 0, 0.7)',
                  lineHeight: 1.2,
                }}
              >
                Chat with{' '}
                <Box component="span" sx={{ 
                  color: '#0d2b2c', 
                  fontWeight: 600,
                  fontStyle: 'italic' 
                }}>
                  Grace & Isaac,
                </Box>
                <br />
                <Box component="span" sx={{ 
                  fontSize: '0.85em',
                  fontWeight: 400,
                  opacity: 0.9
                }}>
                  your AI property experts
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  opacity: 0.9,
                  mb: 2,
                  lineHeight: 1.6,
                  textAlign: { xs: 'center', lg: 'left' },
                  maxWidth: '600px',
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: '#0d2b2c' }}>
                  Discover properties instantly
                </Box>{' '}
                with{' '}
                <Box component="span" sx={{ fontWeight: 600, color: '#0d2b2c' }}>
                  professional insights,
                </Box>{' '}
                through{' '}
                <Box component="span" sx={{ fontWeight: 600, color: '#0d2b2c' }}>
                  natural conversation
                </Box>
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  opacity: 0.8,
                  mb: 4,
                  lineHeight: 1.6,
                  textAlign: { xs: 'center', lg: 'left' },
                  maxWidth: '550px',
                  fontSize: '1.1rem',
                }}
              >
                Revolutionary AI platform that transforms property search, analysis, 
                and decision-making. Empowering *everyone* to navigate the real estate 
                market with confidence and expertise.
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                  mb: 5,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartChat}
                  sx={{
                    px: 5,
                    py: 1.8,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '50px',
                    boxShadow: '0 8px 32px rgba(31, 170, 188, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(31, 170, 188, 0.5)',
                    },
                  }}
                >
                  🚀 Start Chatting Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLearnMore}
                  sx={{
                    px: 6, // Increased padding for better clickability
                    py: 2, // Increased padding for better clickability
                    fontSize: '1.1rem', // Slightly larger font
                    fontWeight: 600,
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'none',
                    borderRadius: '50px',
                    minWidth: '220px', // Ensure minimum width to prevent shrinking
                    flexShrink: 0, // Prevent flex shrinking
                    whiteSpace: 'nowrap', // Prevent text wrapping that could make button smaller
                    '&:hover': {
                      borderColor: '#0d2b2c',
                      color: '#0d2b2c',
                      bgcolor: 'rgba(31, 170, 188, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  See How It Works
                </Button>
              </Box>

              {/* AI Agent Stats */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 4,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                  mt: 3,
                  pb: 2,
                }}
              >
                <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0d2b2c', mb: 0.5 }}>
                    30K+
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Properties Available
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0d2b2c', mb: 0.5 }}>
                    2
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    AI Specialists
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0d2b2c', mb: 0.5 }}>
                    &lt;10s
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Response Time
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Live AI Demo */}
          <Grid item xs={12} lg={5}>
            <Slide direction="left" in={true} timeout={1200}>
              <Box sx={{ position: 'relative' }}>
                {/* 🌟 HEAVENLY PRESENCE BACKGROUND EFFECTS */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    right: -50,
                    bottom: -50,
                    borderRadius: '50%',
                    background: `
                      radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%),
                      radial-gradient(circle at 30% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(135, 206, 235, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 20% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 40%)
                    `,
                    animation: 'heavenlyGlow 8s ease-in-out infinite',
                    zIndex: -1,
                  }}
                />

                {/* Floating Light Orbs */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: '10%',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 215, 0, 0.4) 70%, transparent 100%)',
                    animation: 'heavenlyFloat1 6s ease-in-out infinite',
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.6)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    right: '15%',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(135, 206, 235, 0.5) 70%, transparent 100%)',
                    animation: 'heavenlyFloat2 8s ease-in-out infinite',
                    boxShadow: '0 0 12px rgba(135, 206, 235, 0.5)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '20%',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, rgba(255, 215, 0, 0.3) 70%, transparent 100%)',
                    animation: 'heavenlyFloat3 7s ease-in-out infinite',
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
                  }}
                />

                {/* Twinkling Stars */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '25%',
                    width: 3,
                    height: 3,
                    background: 'white',
                    borderRadius: '50%',
                    animation: 'twinkle 3s ease-in-out infinite',
                    boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '60%',
                    right: '30%',
                    width: 2,
                    height: 2,
                    background: 'white',
                    borderRadius: '50%',
                    animation: 'twinkle 4s ease-in-out infinite 1s',
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '40%',
                    right: '10%',
                    width: 2.5,
                    height: 2.5,
                    background: 'rgba(255, 215, 0, 0.8)',
                    borderRadius: '50%',
                    animation: 'twinkle 5s ease-in-out infinite 2s',
                    boxShadow: '0 0 5px rgba(255, 215, 0, 0.7)',
                  }}
                />

                {/* Soft Divine Halo Effect around Demo */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    left: -30,
                    right: -30,
                    bottom: -30,
                    borderRadius: '20px',
                    background: 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 215, 0, 0.03) 50%, rgba(135, 206, 235, 0.05) 75%, transparent 100%)',
                    animation: 'divinePulse 6s ease-in-out infinite',
                    zIndex: -1,
                  }}
                />

                {/* Demo Controls */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                    p: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.6)', // Dark semi-transparent for text visibility
                    borderRadius: 2,
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 255, 255, 0.1)', // Added heavenly glow
                  }}
                >
                  <Typography variant="h6" color="white" fontWeight={600}>
                    🤖 Live AI Demo
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      onClick={togglePlayback}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(31, 170, 188, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(31, 170, 188, 0.4)',
                        },
                      }}
                    >
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Demo Selection Tabs - Remove strange background */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}> {/* Reduced margin */}
                  {DEMO_TITLES.map((title, index) => (
                    <Button
                      key={index}
                      variant={currentDemo === index ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleDemoSelect(index)}
                      sx={{
                        flex: 1,
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        borderRadius: 2,
                        minWidth: 0,
                        px: 1,
                        py: 0.5,
                        color: currentDemo === index ? 'white' : 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        bgcolor: currentDemo === index ? '#0d2b2c' : 'transparent', // Transparent background
                        '&:hover': {
                          borderColor: '#0d2b2c',
                          bgcolor: currentDemo === index ? '#22c4dc' : 'rgba(31, 170, 188, 0.2)',
                        },
                      }}
                    >
                      {title}
                    </Button>
                  ))}
                </Box>

                {/* Progress Bar - Seamless Integration */}
                {isPlaying && (
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      mb: 1, // Reduced margin for seamless integration
                      height: 4, // Thinner for better integration
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.2)', // Light transparent background
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#0d2b2c', // Match brand color
                        borderRadius: 3,
                      },
                    }}
                  />
                )}

                {/* Animated Chat Demo - Borderless & Compact */}
                <Box
                  sx={{
                    height: 'auto', // Auto height to show all content
                    minHeight: 380, // Much smaller minimum height
                    maxHeight: 480, // Much smaller maximum height
                    borderRadius: 2,
                    overflow: 'visible', // Show all content
                    // Remove all borders and background for seamless integration
                    transform: 'scale(0.75)', // Scale down to 75% for much more compact display
                    transformOrigin: 'top center', // Scale from top center
                    mb: -2, // Negative margin to reduce spacing after scaling
                  }}
                >
                  <AnimatedChatDemo 
                    demoIndex={currentDemo}
                    isActive={true}
                  />
                </Box>
              </Box>
            </Slide>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Animation Keyframes */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(5px) rotate(-1deg); }
          }

          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }

          /* 🌟 HEAVENLY PRESENCE ANIMATIONS */
          @keyframes heavenlyGlow {
            0%, 100% { 
              opacity: 0.3;
              transform: scale(1) rotate(0deg);
            }
            50% { 
              opacity: 0.6;
              transform: scale(1.05) rotate(2deg);
            }
          }

          @keyframes heavenlyFloat1 {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 0.6;
            }
            33% { 
              transform: translateY(-15px) translateX(5px) scale(1.1);
              opacity: 0.9;
            }
            66% { 
              transform: translateY(8px) translateX(-3px) scale(0.9);
              opacity: 0.7;
            }
          }

          @keyframes heavenlyFloat2 {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 0.7;
            }
            40% { 
              transform: translateY(-20px) translateX(-8px) scale(1.2);
              opacity: 1;
            }
            80% { 
              transform: translateY(12px) translateX(4px) scale(0.8);
              opacity: 0.5;
            }
          }

          @keyframes heavenlyFloat3 {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 0.5;
            }
            30% { 
              transform: translateY(-10px) translateX(-5px) scale(1.15);
              opacity: 0.8;
            }
            70% { 
              transform: translateY(15px) translateX(7px) scale(0.85);
              opacity: 0.6;
            }
          }

          @keyframes twinkle {
            0%, 100% { 
              opacity: 0.3;
              transform: scale(0.8);
            }
            50% { 
              opacity: 1;
              transform: scale(1.2);
            }
          }

          @keyframes divinePulse {
            0%, 100% { 
              opacity: 0.4;
              transform: scale(1);
              filter: blur(1px);
            }
            50% { 
              opacity: 0.7;
              transform: scale(1.02);
              filter: blur(0px);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ChatbotHeroSection;