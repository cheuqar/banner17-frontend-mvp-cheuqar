import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Fade,
  Slide,
  Chip,
  Card,
  CardMedia,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Person as UserIcon,
  Psychology as GraceIcon,
  Analytics as IsaacIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Home as PropertyIcon,
  LocalCafe as CafeIcon,
  TrendingUp as AnalysisIcon,
  Map as MapIcon,
  Handshake as HandoffIcon,
} from '@mui/icons-material';

interface ChatMessage {
  id: string;
  sender: 'user' | 'grace' | 'isaac';
  text: string;
  timestamp: number;
  component?: 'PropertyList' | 'AmenityMap' | 'Analysis' | 'Handoff';
  data?: any;
}

interface AnimatedChatDemoProps {
  demoIndex: number;
  isActive: boolean;
}

const DEMO_SCENARIOS = [
  {
    title: "Smart Property Discovery",
    subtitle: "Natural language search with intelligent filtering",
    icon: PropertyIcon,
    color: "#1976d2",
    messages: [
      {
        id: "1",
        sender: "user" as const,
        text: "Show me apartments under $800k in Sydney",
        timestamp: 0
      },
      {
        id: "2", 
        sender: "grace" as const,
        text: "Perfect! I found 12 apartments under $800k in Sydney. Here are the best matches with active filters applied.",
        timestamp: 1500,
        component: "PropertyList" as const,
        data: {
          properties: [
            { address: "234 Sussex Street, Sydney", price: "$750,000", beds: 2, baths: 1 },
            { address: "90 Pitt Street, Sydney", price: "$680,000", beds: 1, baths: 1 },
            { address: "15 York Street, Sydney", price: "$795,000", beds: 2, baths: 2 }
          ],
          filters: ["Location: Sydney", "Type: Apartment", "Price: ≤ $800k"]
        }
      }
    ]
  },
  {
    title: "Spatial Intelligence",
    subtitle: "Location-aware amenity search and mapping",
    icon: MapIcon,
    color: "#388e3c",
    messages: [
      {
        id: "1",
        sender: "user" as const,  
        text: "Find cafes within 2km of this property",
        timestamp: 0
      },
      {
        id: "2",
        sender: "grace" as const,
        text: "Found 8 cafes within 2km of 234 Sussex Street. Here's your spatial search with distance-ordered results.",
        timestamp: 1800,
        component: "AmenityMap" as const,
        data: {
          amenities: [
            { name: "Blue Bottle Coffee", distance: "0.3km", rating: "4.8" },
            { name: "Single Origin", distance: "0.7km", rating: "4.6" },  
            { name: "The Grounds", distance: "1.2km", rating: "4.9" }
          ]
        }
      }
    ]
  },
  {
    title: "AI-Powered Analysis",
    subtitle: "Deep market insights and investment intelligence", 
    icon: AnalysisIcon,
    color: "#f57c00",
    messages: [
      {
        id: "1",
        sender: "user" as const,
        text: "Which one has the best investment potential?",
        timestamp: 0
      },
      {
        id: "2",
        sender: "isaac" as const,
        text: "Based on comprehensive analysis, 234 Sussex Street offers the strongest investment potential with 8.2% rental yield and 15% projected capital growth.",
        timestamp: 2200,
        component: "Analysis" as const,
        data: {
          analysis: {
            property: "234 Sussex Street",
            rentalYield: "8.2%",
            capitalGrowth: "15%",
            score: "9.1/10"
          }
        }
      }
    ]
  },
  {
    title: "Expert Agent Handoff",
    subtitle: "Seamless transition to specialized analysis",
    icon: HandoffIcon, 
    color: "#7b1fa2",
    messages: [
      {
        id: "1",
        sender: "user" as const,
        text: "I want detailed analysis of this property",
        timestamp: 0
      },
      {
        id: "2",
        sender: "grace" as const,
        text: "Let me introduce you to Isaac - our property deep dive specialist for comprehensive analysis.",
        timestamp: 1200
      },
      {
        id: "3",
        sender: "isaac" as const, 
        text: "Hello! I'm Isaac, and I specialize in detailed property analysis. I'll provide comprehensive insights about market trends, ROI potential, and investment strategies.",
        timestamp: 2400,
        component: "Handoff" as const
      }
    ]
  }
];

export const AnimatedChatDemo: React.FC<AnimatedChatDemoProps> = ({ demoIndex, isActive }) => {
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const demo = DEMO_SCENARIOS[demoIndex];

  useEffect(() => {
    if (!isActive) {
      setCurrentMessages([]);
      setIsTyping(false);
      setIsRunning(false);
      return;
    }

    // Prevent overlapping demo runs
    if (isRunning) return;

    let isCancelled = false;

    const playDemo = async () => {
      setIsRunning(true);
      setCurrentMessages([]);
      setIsTyping(false);
      
      for (let i = 0; i < demo.messages.length; i++) {
        // Check if demo was cancelled
        if (isCancelled) break;
        
        const message = demo.messages[i];
        
        // Wait for message timestamp
        await new Promise(resolve => setTimeout(resolve, message.timestamp));
        if (isCancelled) break;
        
        if (message.sender !== 'user') {
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 800));
          if (isCancelled) break;
          setIsTyping(false);
        }
        
        if (!isCancelled) {
          setCurrentMessages(prev => [...prev, message]);
        }
        
        // Extra delay for complex components
        if (message.component && !isCancelled) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!isCancelled) {
        setIsRunning(false);
      }
    };

    playDemo();

    // Cleanup function to cancel demo if component unmounts or deps change
    return () => {
      isCancelled = true;
      setIsRunning(false);
      setIsTyping(false);
    };
  }, [isActive, demoIndex]);

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    const isGrace = message.sender === 'grace';
    const isIsaac = message.sender === 'isaac';

    return (
      <Slide
        key={message.id}
        direction={isUser ? "left" : "right"}
        in={true}
        timeout={500}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            mb: 2,
            alignItems: 'flex-end',
            gap: 1
          }}
        >
          {!isUser && (
            <Avatar
              src={isGrace ? '/px-grace.png' : '/px-isaac.png'}
              sx={{
                width: 32,
                height: 32,
                border: `2px solid ${isGrace ? '#1976d2' : '#ff6f00'}`,
              }}
            >
              {isGrace ? <GraceIcon sx={{ fontSize: 18 }} /> : <IsaacIcon sx={{ fontSize: 18 }} />}
            </Avatar>
          )}
          
          <Paper
            elevation={0}
            sx={{
              p: 1.5, // Slightly smaller padding for more compact display
              maxWidth: '75%', // Slightly larger max width for better readability
              bgcolor: isUser 
                ? 'rgba(25, 118, 210, 0.95)' // Stronger blue for user
                : 'rgba(255, 255, 255, 0.95)', // Stronger white background for AI
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isUser 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(0, 0, 0, 0.2)'}`, // Stronger border for better definition
              color: isUser ? 'white' : '#2c2c2c', // Darker text color for AI messages
              borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', // Slightly smaller radius
              boxShadow: isUser 
                ? '0 6px 24px rgba(25, 118, 210, 0.4)'
                : '0 3px 12px rgba(0, 0, 0, 0.15)', // Better shadows for readability
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)', // Smaller hover effect
                boxShadow: isUser 
                  ? '0 8px 30px rgba(25, 118, 210, 0.5)'
                  : '0 5px 18px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            <Typography variant="body2" sx={{ 
              lineHeight: 1.4, 
              fontSize: '0.875rem', // Slightly larger font for better readability
              fontWeight: isUser ? 500 : 600, // Bold text for better contrast
            }}>
              {message.text}
            </Typography>
          </Paper>
          
          {isUser && (
            <Avatar sx={{ bgcolor: '#666', width: 32, height: 32 }}>
              <UserIcon sx={{ fontSize: 18 }} />
            </Avatar>
          )}
        </Box>
      </Slide>
    );
  };

  const renderComponent = (message: ChatMessage) => {
    if (!message.component) return null;

    return (
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 3, mx: 1 }}>
          {message.component === 'PropertyList' && (
            <Card 
              elevation={0}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.9)', // Much more opaque white background
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(25, 118, 210, 0.4)',
                borderRadius: 2,
                boxShadow: '0 6px 24px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)', // Reduced hover effect for scale
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {message.data?.filters?.map((filter: string, idx: number) => (
                    <Chip key={idx} label={filter} size="small" color="primary" />
                  ))}
                </Box>
                {message.data?.properties?.map((prop: any, idx: number) => (
                  <Box key={idx} sx={{ 
                    p: 2, 
                    border: '1px solid #eee', 
                    borderRadius: 1, 
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{prop.address}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {prop.beds} bed • {prop.baths} bath
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {prop.price}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {message.component === 'AmenityMap' && (
            <Card 
              elevation={0}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.9)', // White background for better readability
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(56, 142, 60, 0.4)',
                borderRadius: 2,
                boxShadow: '0 6px 24px rgba(56, 142, 60, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)', // Reduced hover effect
                  boxShadow: '0 8px 32px rgba(56, 142, 60, 0.4)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MapIcon color="success" />
                  <Typography variant="body2" fontWeight={600}>Nearby Amenities</Typography>
                </Box>
                {message.data?.amenities?.map((amenity: any, idx: number) => (
                  <Box key={idx} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 1.5,
                    border: '1px solid #eee',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <CafeIcon color="action" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{amenity.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {amenity.distance} • ⭐ {amenity.rating}
                      </Typography>
                    </Box>
                    <LocationIcon color="success" />
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {message.component === 'Analysis' && (
            <Card 
              elevation={0}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.9)', // White background for better readability
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(245, 124, 0, 0.4)',
                borderRadius: 2,
                boxShadow: '0 6px 24px rgba(245, 124, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)', // Reduced hover effect
                  boxShadow: '0 8px 32px rgba(245, 124, 0, 0.4)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AnalysisIcon color="warning" />
                  <Typography variant="body2" fontWeight={600}>Investment Analysis</Typography>
                </Box>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 2,
                  textAlign: 'center'
                }}>
                  <Box>
                    <Typography variant="h5" color="warning.main" fontWeight={700}>
                      {message.data?.analysis?.rentalYield}
                    </Typography>
                    <Typography variant="caption">Rental Yield</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" color="success.main" fontWeight={700}>
                      {message.data?.analysis?.capitalGrowth}  
                    </Typography>
                    <Typography variant="caption">Capital Growth</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                      {message.data?.analysis?.score}
                    </Typography>
                    <Typography variant="caption">Investment Score</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {message.component === 'Handoff' && (
            <Card 
              elevation={0}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.9)', // White background for better readability
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(123, 31, 162, 0.4)',
                borderRadius: 2,
                boxShadow: '0 6px 24px rgba(123, 31, 162, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)', // Reduced hover effect
                  boxShadow: '0 8px 32px rgba(123, 31, 162, 0.4)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HandoffIcon color="secondary" />
                  <Typography variant="body2" fontWeight={600}>Agent Transition</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Seamlessly connecting you with our specialized analysis expert for comprehensive property insights.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Fade>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Chat Container - Enhanced Readability */}
      <Box sx={{ 
        flex: 1,
        bgcolor: 'rgba(0, 0, 0, 0.5)', // Darker for better text visibility
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: 3,
        p: 2,
        overflow: 'visible', // Remove scrolling - show full content
        minHeight: 'auto', // Auto height to show all content
        maxHeight: 'none', // Remove height restrictions
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        // Prevent white hover effect
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.6)', // Darker on hover for better readability
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }
      }}>
        {currentMessages.map((message) => (
          <Box key={`${message.id}-container`}>
            {renderMessage(message)}
            {renderComponent(message)}
          </Box>
        ))}
        
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar 
              src="/px-grace.png" 
              sx={{ 
                width: 32, 
                height: 32, 
                border: '2px solid #1976d2' 
              }}
            >
              <GraceIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: '20px 20px 20px 4px',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main',
                  animation: 'bounce 1.4s infinite ease-in-out'
                }} />
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main',
                  animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                }} />
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main',
                  animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                }} />
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AnimatedChatDemo;
