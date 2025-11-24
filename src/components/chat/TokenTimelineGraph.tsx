import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface TokenDataPoint {
  timestamp: Date;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

interface TokenTimelineGraphProps {
  data: TokenDataPoint[];
  width?: number;
  height?: number;
}

const TokenTimelineGraph: React.FC<TokenTimelineGraphProps> = ({ 
  data, 
  width = 160, 
  height = 80 
}) => {
  const theme = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ 
        width,
        minWidth: width,
        maxWidth: width,
        bgcolor: 'white',
        borderRadius: '8px',
        p: 1.5,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 60
      }}>
        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
          No token data yet
        </Typography>
      </Box>
    );
  }

  // Calculate dimensions and scaling
  const padding = 6;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - 20; // Leave space for header
  const barWidth = Math.max(1, Math.min(4, (chartWidth / data.length) - 0.5));
  
  // Find max values for scaling
  const maxInputTokens = Math.max(...data.map(d => d.inputTokens));
  const maxOutputTokens = Math.max(...data.map(d => d.outputTokens));
  const maxTotal = Math.max(...data.map(d => d.inputTokens + d.outputTokens));
  
  // Color palette similar to the provided image
  const colors = {
    input: '#3b82f6',    // Blue
    output: '#10b981',   // Green
    high: '#ef4444',     // Red for high usage
    medium: '#f59e0b',   // Amber for medium usage
    low: '#6b7280'       // Gray for low usage
  };

  const getBarColor = (inputTokens: number, outputTokens: number) => {
    const total = inputTokens + outputTokens;
    const ratio = total / maxTotal;
    
    if (ratio > 0.8) return colors.high;
    if (ratio > 0.5) return colors.medium;
    if (ratio > 0.2) return colors.input;
    return colors.low;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return tokens.toString();
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{
      width,
      minWidth: width,
      maxWidth: width,
      bgcolor: 'white',
      borderRadius: '8px',
      p: 1.5,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      border: '1px solid rgba(0,0,0,0.08)'
    }}>
      {/* Compact Header */}
      <Typography variant="caption" sx={{ 
        fontSize: '0.7rem', 
        fontWeight: 500,
        color: '#374151',
        mb: 1,
        display: 'block'
      }}>
        Token Timeline
      </Typography>

      {/* Compact Chart Container */}
      <Box sx={{ 
        position: 'relative',
        height: chartHeight,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1px',
        justifyContent: 'center',
        mb: 1
      }}>
        {data.map((point, index) => {
          const total = point.inputTokens + point.outputTokens;
          const barHeight = Math.max(3, (total / maxTotal) * chartHeight);
          const color = getBarColor(point.inputTokens, point.outputTokens);
          
          return (
            <Box
              key={index}
              sx={{
                width: barWidth,
                height: barHeight,
                bgcolor: color,
                borderRadius: '2px 2px 0 0',
                transition: 'all 0.15s ease',
                '&:hover': {
                  opacity: 0.7,
                  transform: 'scaleY(1.05)',
                  transformOrigin: 'bottom'
                }
              }}
              title={`${formatTime(point.timestamp)}\n${formatTokens(point.inputTokens)}↓ ${formatTokens(point.outputTokens)}↑`}
            />
          );
        })}
      </Box>

      {/* Compact Summary */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pt: 0.5,
        borderTop: '1px solid #f1f5f9'
      }}>
        <Typography variant="caption" sx={{ 
          fontSize: '0.65rem',
          color: '#6b7280',
          fontWeight: 400
        }}>
          {data.length} msgs
        </Typography>
        <Typography variant="caption" sx={{ 
          fontSize: '0.65rem',
          color: '#374151',
          fontWeight: 500
        }}>
          {formatTokens(data.reduce((sum, d) => sum + d.inputTokens, 0))}↓ {formatTokens(data.reduce((sum, d) => sum + d.outputTokens, 0))}↑
        </Typography>
      </Box>
    </Box>
  );
};

export default TokenTimelineGraph;
