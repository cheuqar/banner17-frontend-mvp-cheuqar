import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  TextField,
  Slider,
  InputAdornment,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Analytics,
  AttachMoney,
  CompareArrows,
  Assessment,
  Warning,
  CheckCircle,
  Launch,
  Speed,
  Timer
} from '@mui/icons-material';

// Price insights calculation function (moved outside component to prevent recreation)
const getPriceInsights = (price: number, medianPrice: number) => {
  const percentageAboveMedian = ((price - medianPrice) / medianPrice) * 100;

  if (percentageAboveMedian < -15) {
    return {
      level: 'well-below',
      color: '#10b981',
      icon: <TrendingDown />,
      title: 'Well Below Market',
      description: 'Excellent value, quick sale expected',
      expectedDays: '14-30 days',
      demandLevel: 'Very High',
      buyerInterest: 'Excellent',
      riskLevel: 'Low',
      advice: 'This price point will generate significant interest. Consider if leaving money on the table.',
      confidence: 0.95,
      insights: [
        'Multiple offers likely',
        'Quick settlement expected',
        'May trigger bidding war',
        'Consider market testing higher'
      ]
    };
  } else if (percentageAboveMedian < -5) {
    return {
      level: 'below',
      color: '#10b981',
      icon: <TrendingDown />,
      title: 'Below Market Value',
      description: 'Attractive pricing for quick sale',
      expectedDays: '30-45 days',
      demandLevel: 'High',
      buyerInterest: 'Very Good',
      riskLevel: 'Low',
      advice: 'Good balance between speed and value. Expect strong interest.',
      confidence: 0.85,
      insights: [
        'Strong buyer interest expected',
        'Competitive advantage in market',
        'Good negotiation position',
        'Quick settlement likely'
      ]
    };
  } else if (percentageAboveMedian <= 10) {
    return {
      level: 'market',
      color: '#2563eb',
      icon: <Analytics />,
      title: 'Market Value',
      description: 'Aligned with current market conditions',
      expectedDays: '45-60 days',
      demandLevel: 'Moderate',
      buyerInterest: 'Good',
      riskLevel: 'Moderate',
      advice: 'Fair market pricing. Standard marketing timeline expected.',
      confidence: 0.75,
      insights: [
        'Typical market response expected',
        'Standard marketing period',
        'Fair negotiation position',
        'Market-aligned expectations'
      ]
    };
  } else if (percentageAboveMedian <= 25) {
    return {
      level: 'above',
      color: '#f59e0b',
      icon: <TrendingUp />,
      title: 'Above Market Value',
      description: 'Premium pricing strategy',
      expectedDays: '60-90 days',
      demandLevel: 'Low-Moderate',
      buyerInterest: 'Selective',
      riskLevel: 'Moderate-High',
      advice: 'Premium pricing requires exceptional presentation and marketing.',
      confidence: 0.60,
      insights: [
        'Extended marketing period likely',
        'Requires premium presentation',
        'Limited buyer pool',
        'Strong justification needed'
      ]
    };
  } else {
    return {
      level: 'well-above',
      color: '#dc2626',
      icon: <Warning />,
      title: 'Well Above Market',
      description: 'Significantly overpriced for current market',
      expectedDays: '90+ days',
      demandLevel: 'Very Low',
      buyerInterest: 'Limited',
      riskLevel: 'High',
      advice: 'Consider reducing price to align with market realities.',
      confidence: 0.45,
      insights: [
        'Risk of property becoming stale',
        'Very limited buyer pool',
        'May harm property perception',
        'Likely to require significant reduction'
      ]
    };
  }
};

// Main component's price insights calculation (different logic/colors than canvas)
const getPriceInsightsMain = (currentPrice: number, medianPrice: number) => {
  const priceRatio = currentPrice / medianPrice;
  
  if (priceRatio < 0.85) {
    return {
      level: 'well-below',
      color: '#ef4444',
      icon: <TrendingDown />,
      title: 'Well Below Market',
      description: 'This price is significantly below market median',
      expectedDays: '7-14 days',
      demandLevel: 'Very High',
      buyerInterest: 'Exceptional',
      riskLevel: 'Low',
      advice: 'You may be leaving money on the table. Consider if a quick sale is your priority.',
      confidence: 0.95,
      insights: [
        'Will likely receive multiple offers quickly',
        'May signal property issues to buyers',
        'Good for urgent sales or distressed situations',
        'Consider testing slightly higher first'
      ]
    };
  } else if (priceRatio < 0.95) {
    return {
      level: 'below',
      color: '#f59e0b',
      icon: <TrendingDown />,
      title: 'Below Market',
      description: 'Priced below market median for faster sale',
      expectedDays: '14-21 days',
      demandLevel: 'High',
      buyerInterest: 'Strong',
      riskLevel: 'Low',
      advice: 'Good strategy for reliable sale within 3 weeks.',
      confidence: 0.92,
      insights: [
        'Attracts serious buyers quickly',
        'Reduces time on market significantly',
        'Good for competitive markets',
        'Still within reasonable range'
      ]
    };
  } else if (priceRatio <= 1.05) {
    return {
      level: 'market',
      color: '#2563eb',
      icon: <TrendingFlat />,
      title: 'At Market Value',
      description: 'Competitive pricing aligned with market',
      expectedDays: '28-35 days',
      demandLevel: 'Moderate',
      buyerInterest: 'Good',
      riskLevel: 'Medium',
      advice: 'Balanced approach with fair market expectations.',
      confidence: 0.87,
      insights: [
        'Standard market timeline expected',
        'Good baseline for negotiating',
        'Attracts informed buyers',
        'Safe and predictable approach'
      ]
    };
  } else if (priceRatio <= 1.15) {
    return {
      level: 'above',
      color: '#10b981',
      icon: <TrendingUp />,
      title: 'Above Market',
      description: 'Premium pricing to test market ceiling',
      expectedDays: '42-60 days',
      demandLevel: 'Lower',
      buyerInterest: 'Selective',
      riskLevel: 'Medium-High',
      advice: 'Test premium positioning but be prepared for longer timeline.',
      confidence: 0.68,
      insights: [
        'Longer time on market expected',
        'Attracts premium buyers only',
        'Good room for negotiation',
        'May need price adjustment later'
      ]
    };
  } else {
    return {
      level: 'well-above',
      color: '#dc2626',
      icon: <Warning />,
      title: 'Well Above Market',
      description: 'Significantly overpriced for current market',
      expectedDays: '90+ days',
      demandLevel: 'Very Low',
      buyerInterest: 'Limited',
      riskLevel: 'High',
      advice: 'Consider reducing price to align with market realities.',
      confidence: 0.45,
      insights: [
        'Risk of property becoming stale',
        'Very limited buyer pool',
        'May harm property perception',
        'Likely to require significant reduction'
      ]
    };
  }
};

// Canvas Content Component with Interactive State
const PriceCanvasContent: React.FC<{
  initialPrice: number;
  marketData: any;
  marketComparables: any[];
}> = ({ initialPrice, marketData, marketComparables }) => {
  const [canvasPrice, setCanvasPrice] = useState(initialPrice);

  // Use useMemo to calculate insights instead of useEffect to prevent infinite re-renders
  const canvasInsights = React.useMemo(() => {
    return getPriceInsights(canvasPrice, marketData.medianPrice);
  }, [canvasPrice, marketData.medianPrice]);

  const handleCanvasPriceChange = (event: Event, newValue: number | number[]) => {
    setCanvasPrice(newValue as number);
  };

  if (!canvasInsights) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Comprehensive Market Analysis
      </Typography>
      
      {/* Current Price Analysis */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8fafc' }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney sx={{ color: '#2563eb' }} />
          Current Price Analysis: ${canvasPrice.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                {React.cloneElement(canvasInsights.icon, { sx: { color: canvasInsights.color } })}
              </Box>
              <Typography variant="body2" sx={{ color: canvasInsights.color, fontWeight: 600 }}>
                {canvasInsights.title}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 600 }}>
                {canvasInsights.expectedDays}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Expected Timeline
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 600 }}>
                {canvasInsights.demandLevel}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Demand Level
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                {Math.round(canvasInsights.confidence * 100)}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Confidence
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* AI Advice */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>AI Recommendation:</strong> {canvasInsights.advice}
          </Typography>
        </Alert>

        {/* Key Insights */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          📊 Key Market Insights:
        </Typography>
        <List dense>
          {canvasInsights.insights.map((insight: string, index: number) => (
            <ListItem key={index} sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Typography variant="body2">•</Typography>
              </ListItemIcon>
              <ListItemText 
                primary={insight}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Interactive Price Slider */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Analytics sx={{ color: '#2563eb' }} />
          Interactive Price Analysis
        </Typography>
        <Box sx={{ px: 2, mb: 3 }}>
          <Slider
            value={canvasPrice}
            onChange={handleCanvasPriceChange}
            min={1500000}
            max={4500000}
            step={25000}
            marks={[
              { value: 1500000, label: '$1.5M' },
              { value: 2200000, label: '$2.2M' },
              { value: 2850000, label: 'Median' },
              { value: 3800000, label: '$3.8M' },
              { value: 4500000, label: '$4.5M' }
            ]}
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: canvasInsights.color,
              },
              '& .MuiSlider-track': {
                backgroundColor: canvasInsights.color,
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#e5e7eb',
              }
            }}
          />
        </Box>
        <TextField
          fullWidth
          value={`$${canvasPrice.toLocaleString()}`}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                Current Price:
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Paper>

      {/* Market Comparables */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrows sx={{ color: '#2563eb' }} />
          Comparable Properties Analysis
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {marketComparables.map((comp: any, index: number) => (
            <Box key={index} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              bgcolor: canvasPrice > comp.price ? '#fef2f2' : canvasPrice < comp.price ? '#f0f9ff' : '#f9fafb',
              '&:hover': { bgcolor: '#f3f4f6' }
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {comp.address}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {comp.beds}BR • {comp.baths}BA • {comp.sqft} sqft • Sold {comp.daysAgo} days ago
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  ${comp.price.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: canvasPrice > comp.price ? '#dc2626' : canvasPrice < comp.price ? '#2563eb' : '#6b7280' 
                }}>
                  ${Math.abs(canvasPrice - comp.price).toLocaleString()} {canvasPrice > comp.price ? 'higher' : canvasPrice < comp.price ? 'lower' : 'same'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Market Trend Chart Placeholder */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment sx={{ color: '#2563eb' }} />
          Market Trend Analysis
        </Typography>
        <Box sx={{ 
          height: 200,
          bgcolor: '#f8fafc',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #cbd5e1'
        }}>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            📈 Interactive Market Trend Chart - Coming Soon
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

interface PriceInputControlProps {
  onComplete: (data: any) => void;
  onPanelUpdate: (panelId: string, data: any) => void;
  onExpandToCanvas?: (data: any) => void;
  isExpanded?: boolean;
  isActive?: boolean;
}

const PriceInputControl: React.FC<PriceInputControlProps> = ({ 
  onComplete, 
  onPanelUpdate, 
  onExpandToCanvas,
  isExpanded = false,
  isActive = true
}) => {
  const [price, setPrice] = useState(2850000);
  const [priceInput, setPriceInput] = useState('2850000');
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [confidence, setConfidence] = useState(0.87);
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Market data for comparisons
  const marketData = {
    medianPrice: 2850000,
    priceRange: { min: 2200000, max: 3800000 },
    averageDaysOnMarket: 28,
    recentSales: 12,
    priceGrowth: 0.18,
    marketHotness: 'high'
  };

  const strategies = [
    {
      id: 'quick',
      name: 'Quick Sale',
      description: 'Price below market for faster sale',
      priceMultiplier: 0.92,
      expectedDays: 14,
      confidence: 0.95,
      color: '#ef4444',
      pros: ['Fast sale', 'High buyer interest', 'Reduced holding costs'],
      cons: ['Lower profit margin', 'May signal issues', 'Limited negotiation room']
    },
    {
      id: 'market',
      name: 'Market Value',
      description: 'Competitive market pricing',
      priceMultiplier: 1.0,
      expectedDays: 28,
      confidence: 0.87,
      color: '#2563eb',
      pros: ['Balanced approach', 'Good market response', 'Fair market value'],
      cons: ['Standard timeline', 'More competition', 'Market dependent']
    },
    {
      id: 'premium',
      name: 'Premium Strategy',
      description: 'Test higher price point',
      priceMultiplier: 1.08,
      expectedDays: 45,
      confidence: 0.68,
      color: '#10b981',
      pros: ['Maximum profit potential', 'Quality positioning', 'Room for negotiation'],
      cons: ['Longer sale time', 'Limited buyer pool', 'Market risk']
    }
  ];

  const marketComparables = [
    { address: '125 Campbell Parade, Bondi Beach', price: 2750000, days: 22, beds: 3, baths: 2, type: 'Similar', status: 'sold' },
    { address: '130 Campbell Parade, Bondi Beach', price: 3100000, days: 35, beds: 4, baths: 3, type: 'Similar', status: 'sold' },
    { address: '135 Campbell Parade, Bondi Beach', price: 2450000, days: 18, beds: 2, baths: 2, type: 'Similar', status: 'sold' },
    { address: '140 Campbell Parade, Bondi Beach', price: 3350000, days: 62, beds: 4, baths: 3, type: 'Premium', status: 'sold' },
    { address: '145 Campbell Parade, Bondi Beach', price: 2950000, days: 41, beds: 3, baths: 3, type: 'Similar', status: 'sold' }
  ];

  // Use useMemo to calculate current insights to prevent recreation on every render
  const currentInsights = React.useMemo(() => {
    return getPriceInsightsMain(price, marketData.medianPrice);
  }, [price, marketData.medianPrice]);

  // Update price input when slider changes
  useEffect(() => {
    setPriceInput(price.toString());
  }, [price]);

  // Update confidence and strategy based on price
  useEffect(() => {
    setConfidence(currentInsights.confidence);
    
    // Auto-suggest strategy based on price level
    if (currentInsights.level === 'well-below' || currentInsights.level === 'below') {
      setSelectedStrategy(strategies[0]); // Quick sale
    } else if (currentInsights.level === 'market') {
      setSelectedStrategy(strategies[1]); // Market value
    } else {
      setSelectedStrategy(strategies[2]); // Premium
    }
  }, [price, currentInsights]);

  const handlePriceSliderChange = (event: Event, newValue: number | number[]) => {
    const newPrice = newValue as number;
    setPrice(newPrice);
  };

  const handlePriceInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setPriceInput(value);
    
    if (value && !isNaN(Number(value))) {
      const newPrice = Math.max(1000000, Math.min(5000000, Number(value)));
      setPrice(newPrice);
    }
  };

  const handleStrategySelect = (strategy: any) => {
    setSelectedStrategy(strategy);
    setShowAnalysis(true);
    
    // Update panels with comprehensive market data
    onPanelUpdate('market-intelligence', {
      strategy: strategy.name,
      price: price,
      expectedDays: currentInsights.expectedDays,
      confidence: currentInsights.confidence,
      marketComparables,
      priceRange: marketData.priceRange,
      medianPrice: marketData.medianPrice,
      priceGrowth: marketData.priceGrowth,
      marketHotness: marketData.marketHotness,
      insights: currentInsights
    });
  };

  const handleComplete = () => {
    if (selectedStrategy) {
      onComplete({
        price,
        strategy: selectedStrategy,
        expectedDays: currentInsights.expectedDays,
        confidence: currentInsights.confidence,
        marketComparables,
        insights: currentInsights
      });
    }
  };

  const handleExpandToCanvas = () => {
    if (onExpandToCanvas) {
      onExpandToCanvas({
        id: 'price-input',
        title: 'Market Analysis',
        type: 'price',
        data: { price, strategy: selectedStrategy, confidence: currentInsights.confidence, marketComparables, insights: currentInsights },
        isActive: isActive,
        content: (
          <PriceCanvasContent
            initialPrice={price}
            marketData={marketData}
            marketComparables={marketComparables}
          />
        )
      });
    }
  };

  // If expanded to canvas, show link button state
  if (isExpanded) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          bgcolor: '#f8fafc',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#2563eb',
            bgcolor: '#eff6ff'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Launch sx={{ color: '#2563eb', fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ 
              color: '#2563eb',
              fontWeight: 500,
              mb: 0.5
            }}>
              Market Analysis - Expanded in Canvas
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              {selectedStrategy ? `${selectedStrategy.name} - $${price.toLocaleString()}` : 'Click to focus canvas tab'}
            </Typography>
          </Box>
          <Chip 
            label="Canvas" 
            size="small"
            sx={{ 
              bgcolor: '#2563eb',
              color: 'white',
              fontSize: '0.75rem'
            }}
          />
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header with Expand Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
          Interactive Market Pricing Analysis
      </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleExpandToCanvas}
            sx={{ 
              color: '#6b7280',
              '&:hover': { color: '#2563eb' }
            }}
            title="Expand to Canvas"
          >
            <Launch fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Interactive Price Input */}
      <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
          🎯 Set Your Target Price
      </Typography>

        {/* Price Slider */}
        <Box sx={{ px: 1, mb: 2 }}>
          <Slider
            value={price}
            onChange={handlePriceSliderChange}
            min={1500000}
            max={4500000}
            step={25000}
            disabled={!isActive}
            marks={[
              { value: 2200000, label: 'Low $2.2M' },
              { value: 2850000, label: 'Median' },
              { value: 3800000, label: 'High $3.8M' }
            ]}
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: currentInsights.color,
              },
              '& .MuiSlider-track': {
                backgroundColor: currentInsights.color,
              }
            }}
          />
        </Box>

        {/* Manual Price Input */}
        <TextField
          fullWidth
          label="Price"
          value={priceInput}
          onChange={handlePriceInputChange}
          disabled={!isActive}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          helperText="Enter price between $1.5M - $4.5M"
        />
      </Paper>

      {/* Dynamic Price Insights */}
      <Paper sx={{ 
        p: 2, 
        bgcolor: `${currentInsights.color}10`,
        border: `1px solid ${currentInsights.color}40`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: currentInsights.color, 
            borderRadius: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {React.cloneElement(currentInsights.icon, { sx: { color: 'white', fontSize: 20 } })}
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
              {currentInsights.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              {currentInsights.description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>Expected Timeline</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentInsights.expectedDays}
        </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>Buyer Interest</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentInsights.buyerInterest}
          </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>Confidence</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {Math.round(currentInsights.confidence * 100)}%
          </Typography>
        </Box>
      </Box>

        <Alert severity="info" sx={{ mb: 1 }}>
          <Typography variant="caption">
            <strong>💡 AI Advice:</strong> {currentInsights.advice}
          </Typography>
        </Alert>
      </Paper>

      {/* Strategy Selection */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
          📋 Recommended pricing strategies:
      </Typography>
        {strategies.map(strategy => (
              <Card 
            key={strategy.id}
            variant="outlined"
            onClick={() => isActive && handleStrategySelect(strategy)}
                sx={{ 
              cursor: isActive ? 'pointer' : 'default',
              borderColor: selectedStrategy?.id === strategy.id ? strategy.color : '#e5e7eb',
              bgcolor: selectedStrategy?.id === strategy.id ? `${strategy.color}10` : 'white',
              '&:hover': isActive ? {
                borderColor: strategy.color,
                boxShadow: 1
              } : {}
            }}
              >
                <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {strategy.id === 'quick' && <Speed sx={{ fontSize: 16, color: strategy.color }} />}
                    {strategy.id === 'market' && <TrendingFlat sx={{ fontSize: 16, color: strategy.color }} />}
                    {strategy.id === 'premium' && <Timer sx={{ fontSize: 16, color: strategy.color }} />}
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {strategy.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1 }}>
                    {strategy.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={`${Math.round(strategy.confidence * 100)}% confidence`} 
                      size="small" 
                      sx={{ fontSize: '0.75rem', height: 20 }}
                    />
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      ~{strategy.expectedDays} days
                    </Typography>
                  </Box>
            </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: strategy.color }}>
                    ${Math.round(price * strategy.priceMultiplier).toLocaleString()}
            </Typography>
                  {selectedStrategy?.id === strategy.id && (
                    <CheckCircle sx={{ fontSize: 16, color: '#10b981', mt: 0.5 }} />
                  )}
                  </Box>
              </Box>
            </CardContent>
          </Card>
                ))}
              </Box>

      {/* Action Button */}
      {selectedStrategy && (
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={!isActive}
          sx={{ alignSelf: 'flex-start', mt: 1 }}
        >
          Confirm Pricing Strategy
        </Button>
      )}

      {/* Inactive State Notice */}
      {!isActive && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="caption">
            ℹ️ Pricing strategy has been confirmed and is no longer editable
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default PriceInputControl; 