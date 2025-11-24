import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Avatar,
  Paper,
  Fade,
  Chip,
  IconButton,
  Divider,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Close,
  AutoAwesome,
  Analytics,
  TrendingUp,
  LocationOn,
  AttachMoney,
  Home,
  Schedule
} from '@mui/icons-material';

// Import the adaptive timing service
import { 
  getHandoffTimingConfig, 
  recordHandoffSeen, 
  getUserFamiliarityLevel,
  isFirstTimeUser,
  handoffAnimationService 
} from '../../services/handoffAnimationService';

interface PropertyItem {
  id?: string;
  title?: string;
  full_address?: string;
  address?: string;
  price?: string | number;
  price_display?: string;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  distance_km?: number;
  [key: string]: any;
}

interface GraceIsaacTransitionDialogProps {
  open: boolean;
  onClose: () => void;
  property: PropertyItem;
  onStartDrillSession: (property: PropertyItem) => void;
  onHoldAndReturn: () => void;
}

interface ConversationMessage {
  id: string;
  agent: 'grace' | 'isaac';
  message: string;
  timestamp: number;
  typing?: boolean;
}

const GraceIsaacTransitionDialog: React.FC<GraceIsaacTransitionDialogProps> = ({
  open,
  onClose,
  property,
  onStartDrillSession,
  onHoldAndReturn
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [animationConfig, setAnimationConfig] = useState<any>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Generate conversation based on property details
  const generateConversation = (property: PropertyItem): ConversationMessage[] => {
    const propertyAddress = property.full_address || property.address || property.title || 'this property';
    const propertyPrice = property.price_display || property.price || 'the listed price';
    const propertyType = property.property_type || 'property';
    
    return [
      {
        id: 'grace-1',
        agent: 'grace',
        message: `Hi Isaac! I have a client who's interested in diving deeper into ${propertyAddress}. They've been exploring properties with me and this one caught their attention.`,
        timestamp: Date.now()
      },
      {
        id: 'isaac-1', 
        agent: 'isaac',
        message: `Hello Grace! I'd be happy to help analyze this property in detail. Let me take a look... ${propertyAddress} at ${propertyPrice} - this looks like an interesting ${propertyType.toLowerCase()}.`,
        timestamp: Date.now() + 1000
      },
      {
        id: 'grace-2',
        agent: 'grace', 
        message: `Perfect! The client has been building their search criteria with me, and I think they're ready for your comprehensive analysis. I'll hand them over to you.`,
        timestamp: Date.now() + 2000
      },
      {
        id: 'isaac-2',
        agent: 'isaac',
        message: `Thanks Grace! Hi there! I'm Isaac, your Property Deep Dive Specialist. I can provide you with comprehensive analysis of this property - from market insights to investment potential and neighborhood details.`,
        timestamp: Date.now() + 3000
      },
      {
        id: 'isaac-3',
        agent: 'isaac',
        message: `Would you like me to start a detailed Property Analysis Session for ${propertyAddress}? I'll gather all available information and provide professional insights tailored to your needs.`,
        timestamp: Date.now() + 4000
      }
    ];
  };

  useEffect(() => {
    if (open) {
      const conversation = generateConversation(property);
      setMessages(conversation);
      setCurrentMessageIndex(0);
      setShowActions(false);
      
      // 🎭 ADAPTIVE TIMING: Use smart animation timing based on user familiarity
      const timingConfig = getHandoffTimingConfig();
      const familiarityLevel = getUserFamiliarityLevel();
      const isNewUser = isFirstTimeUser();
      const fullConfig = handoffAnimationService.getAnimationConfig();
      
      // Store animation config for UI display
      setAnimationConfig({
        ...fullConfig,
        timingConfig,
        familiarityLevel,
        isNewUser,
        description: handoffAnimationService.getTimingDescription()
      });
      
      console.log(`[GraceIsaacTransition] Animation config:`, {
        totalDuration: timingConfig.totalDuration,
        messageInterval: timingConfig.messageInterval,
        familiarityLevel,
        isNewUser,
        description: handoffAnimationService.getTimingDescription()
      });

      // Handle instant mode (disabled animations)
      if (timingConfig.totalDuration === 0) {
        // Show all messages immediately
        setCurrentMessageIndex(conversation.length - 1);
        setShowActions(true);
        // Still record the handoff was seen
        recordHandoffSeen();
        return;
      }
      
      // Animate messages appearing one by one with adaptive timing
      const timer = setInterval(() => {
        setCurrentMessageIndex(prev => {
          if (prev < conversation.length - 1) {
            return prev + 1;
          } else {
            // Show action buttons after last message with appropriate delay
            const actionDelay = Math.max(200, timingConfig.messageInterval * 0.3);
            setTimeout(() => setShowActions(true), actionDelay);
            clearInterval(timer);
            return prev;
          }
        });
      }, timingConfig.messageInterval);

      // Record that user has seen the handoff (for future adaptive timing)
      recordHandoffSeen();

      return () => clearInterval(timer);
    }
  }, [open, property]);

  // Auto-scroll when new message appears
  useEffect(() => {
    if (conversationRef.current && currentMessageIndex >= 0) {
      setTimeout(() => {
        conversationRef.current?.scrollTo({
          top: conversationRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure the message has rendered
    }
  }, [currentMessageIndex]);

  const handleStartPropertyAnalysis = async () => {
    try {
      setIsCreatingSession(true);
      console.log('Starting property drill session for:', property);
      
      // Call the parent's drill session handler
      await onStartDrillSession(property);
      
      // Success - dialog will be closed by the parent component
      console.log('Property drill session created successfully');
    } catch (error) {
      console.error('Failed to create property drill session:', error);
      setIsCreatingSession(false);
      // Keep dialog open so user can try again
      alert('Failed to start property analysis session. Please try again.');
    }
  };

  const handleHoldForNow = () => {
    onHoldAndReturn();
    onClose();
  };

  const handleClose = () => {
    // Reset all states when dialog closes
    setIsCreatingSession(false);
    setCurrentMessageIndex(0);
    setShowActions(false);
    onClose();
  };

  const getAgentConfig = (agent: 'grace' | 'isaac') => {
    if (agent === 'grace') {
      return {
        name: 'Grace',
        avatar: '/px-grace.png',
        color: '#0d2b2c',
        bgColor: 'rgba(31, 170, 188, 0.1)'
      };
    } else {
      return {
        name: 'Isaac', 
        avatar: '/px-isaac.png',
        color: '#2563eb',
        bgColor: 'rgba(37, 99, 235, 0.1)'
      };
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(31, 170, 188, 0.1)'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src="/px-grace.png" sx={{ width: 32, height: 32 }} />
            <AutoAwesome sx={{ color: '#0d2b2c', fontSize: 20 }} />
            <Avatar src="/px-isaac.png" sx={{ width: 32, height: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Agent Handoff
          </Typography>
          
          {/* Adaptive Timing Indicator */}
          {animationConfig && (
            <Chip
              size="small"
              label={
                animationConfig.isNewUser 
                  ? "New User Experience" 
                  : animationConfig.familiarityLevel === 'expert' 
                    ? "Expert Mode" 
                    : "Quick Handoff"
              }
              sx={{
                ml: 2,
                fontSize: '0.7rem',
                height: 20,
                bgcolor: animationConfig.isNewUser 
                  ? 'info.50' 
                  : 'success.50',
                color: animationConfig.isNewUser 
                  ? 'info.700' 
                  : 'success.700',
                border: `1px solid ${animationConfig.isNewUser ? 'rgba(3, 102, 214, 0.2)' : 'rgba(22, 163, 74, 0.2)'}`,
                '& .MuiChip-label': {
                  px: 1,
                  py: 0
                }
              }}
            />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Property Context */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Paper sx={{ p: 2, bgcolor: 'rgba(31, 170, 188, 0.05)', borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Home sx={{ color: '#0d2b2c', fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {property.full_address || property.address || property.title}
              </Typography>
              {(property.price_display || property.price) && (
                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <AttachMoney sx={{ fontSize: 14 }} />
                  {property.price_display || property.price}
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Conversation */}
      <DialogContent 
        ref={conversationRef}
        sx={{ px: 3, py: 1, maxHeight: '400px', overflowY: 'auto' }}
      >
        <Stack spacing={2}>
          {messages.slice(0, currentMessageIndex + 1).map((message, index) => {
            const agentConfig = getAgentConfig(message.agent);
            const isVisible = index <= currentMessageIndex;
            
            return (
              <Fade 
                key={message.id} 
                in={isVisible} 
                timeout={500}
                style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}
              >
                <Box>
                  <Stack 
                    direction="row" 
                    spacing={2}
                    sx={{
                      alignItems: 'flex-start',
                      justifyContent: message.agent === 'grace' ? 'flex-start' : 'flex-end'
                    }}
                  >
                    {message.agent === 'grace' && (
                      <Avatar 
                        src={agentConfig.avatar} 
                        sx={{ width: 36, height: 36, mt: 0.5 }} 
                      />
                    )}
                    
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '75%',
                        bgcolor: agentConfig.bgColor,
                        border: `1px solid ${agentConfig.color}20`,
                        borderRadius: 2,
                        position: 'relative'
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip
                          label={agentConfig.name}
                          size="small"
                          sx={{
                            bgcolor: agentConfig.color,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 20
                          }}
                        />
                      </Stack>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.primary',
                          lineHeight: 1.5
                        }}
                      >
                        {message.message}
                      </Typography>
                    </Paper>

                    {message.agent === 'isaac' && (
                      <Avatar 
                        src={agentConfig.avatar} 
                        sx={{ width: 36, height: 36, mt: 0.5 }} 
                      />
                    )}
                  </Stack>
                </Box>
              </Fade>
            );
          })}
        </Stack>
      </DialogContent>

      {/* Action Buttons */}
      <Fade in={showActions} timeout={500}>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Divider />
            
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
              Ready to dive deeper into this property?
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={handleHoldForNow}
                startIcon={<Schedule />}
                disabled={isCreatingSession}
                sx={{
                  borderColor: 'rgba(31, 170, 188, 0.5)',
                  color: '#0d2b2c',
                  '&:hover': {
                    borderColor: '#0d2b2c',
                    bgcolor: 'rgba(31, 170, 188, 0.05)'
                  }
                }}
              >
                Hold & Return to Grace
              </Button>
              
              <Button
                variant="contained"
                onClick={handleStartPropertyAnalysis}
                startIcon={isCreatingSession ? <CircularProgress size={16} color="inherit" /> : <Analytics />}
                endIcon={!isCreatingSession ? <TrendingUp /> : undefined}
                disabled={isCreatingSession}
                sx={{
                  bgcolor: '#2563eb',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  minWidth: '200px',
                  '&:hover': {
                    bgcolor: '#1d4ed8'
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(37, 99, 235, 0.6)',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }
                }}
              >
                {isCreatingSession ? 'Starting Analysis...' : 'Start Property Analysis'}
              </Button>
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
              Isaac will provide comprehensive analysis including market insights, investment potential, and neighborhood details
            </Typography>
          </Stack>
        </DialogActions>
      </Fade>
    </Dialog>
  );
};

export default GraceIsaacTransitionDialog;
