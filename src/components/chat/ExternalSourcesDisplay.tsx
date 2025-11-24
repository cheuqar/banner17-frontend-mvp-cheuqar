import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export interface ExternalSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  sourceType: 'web_search' | 'training_data' | 'geocoding' | 'external_api';
  confidence?: number;
  timestamp: Date;
  description?: string;
  verified?: boolean;
}

interface ExternalSourcesDisplayProps {
  sources: ExternalSource[];
  isActive?: boolean;
}

const ExternalSourcesDisplay: React.FC<ExternalSourcesDisplayProps> = ({
  sources,
  isActive = false
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const getSourceTypeColor = (sourceType: ExternalSource['sourceType']) => {
    switch (sourceType) {
      case 'web_search':
        return '#1976d2'; // Blue
      case 'training_data':
        return '#ed6c02'; // Orange
      case 'geocoding':
        return '#2e7d32'; // Green
      case 'external_api':
        return '#9c27b0'; // Purple
      default:
        return '#757575'; // Grey
    }
  };

  const getSourceTypeLabel = (sourceType: ExternalSource['sourceType']) => {
    switch (sourceType) {
      case 'web_search':
        return 'Web Search';
      case 'training_data':
        return 'Training Data';
      case 'geocoding':
        return 'Geocoding';
      case 'external_api':
        return 'External API';
      default:
        return 'Unknown';
    }
  };

  const uniqueDomains = [...new Set(sources.map(s => s.domain))].length;
  const webSearchCount = sources.filter(s => s.sourceType === 'web_search').length;
  const trainingDataCount = sources.filter(s => s.sourceType === 'training_data').length;

  return (
    <Box sx={{ 
      maxWidth: '800px',
      mx: 'auto',
      width: '100%',
      px: 3,
      py: 1,
      borderTop: '1px solid #f1f5f9',
      bgcolor: '#fefefe'
    }}>
      <Accordion 
        expanded={expanded} 
        onChange={handleToggle}
        sx={{ 
          boxShadow: 'none',
          bgcolor: 'transparent',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            px: 0,
            minHeight: 'auto',
            '& .MuiAccordionSummary-content': {
              margin: '8px 0',
              alignItems: 'center'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <WarningIcon sx={{ fontSize: 16, color: '#ed6c02' }} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#666' }}>
              External Sources ({sources.length})
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
              {webSearchCount > 0 && (
                <Chip 
                  label={`${webSearchCount} web`} 
                  size="small" 
                  sx={{ 
                    height: 18, 
                    fontSize: '0.65rem',
                    bgcolor: getSourceTypeColor('web_search'),
                    color: 'white'
                  }} 
                />
              )}
              {trainingDataCount > 0 && (
                <Chip 
                  label={`${trainingDataCount} training`} 
                  size="small" 
                  sx={{ 
                    height: 18, 
                    fontSize: '0.65rem',
                    bgcolor: getSourceTypeColor('training_data'),
                    color: 'white'
                  }} 
                />
              )}
              <Chip 
                label={`${uniqueDomains} domains`} 
                size="small" 
                sx={{ 
                  height: 18, 
                  fontSize: '0.65rem',
                  bgcolor: '#757575',
                  color: 'white'
                }} 
              />
            </Box>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ px: 0, pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {sources.map((source, index) => (
              <Box key={source.id || index}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1,
                  p: 1,
                  bgcolor: '#f8fafc',
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                    {source.verified ? (
                      <VerifiedIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                    ) : (
                      <WarningIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                    )}
                    
                    <Chip 
                      label={getSourceTypeLabel(source.sourceType)} 
                      size="small" 
                      sx={{ 
                        height: 16, 
                        fontSize: '0.6rem',
                        bgcolor: getSourceTypeColor(source.sourceType),
                        color: 'white',
                        minWidth: 'auto'
                      }} 
                    />
                    
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {source.title}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.65rem', 
                          color: '#64748b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {source.domain}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {source.confidence && (
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#64748b' }}>
                        {Math.round(source.confidence * 100)}%
                      </Typography>
                    )}
                    
                    {source.url && (
                      <Tooltip title="Open source">
                        <IconButton
                          size="small"
                          onClick={() => window.open(source.url, '_blank')}
                          sx={{ p: 0.25 }}
                        >
                          <LaunchIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                
                {source.description && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.65rem', 
                      color: '#64748b',
                      ml: 1,
                      display: 'block',
                      mt: 0.5
                    }}
                  >
                    {source.description}
                  </Typography>
                )}
                
                {index < sources.length - 1 && (
                  <Divider sx={{ my: 0.5, opacity: 0.3 }} />
                )}
              </Box>
            ))}
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.6rem', 
              color: '#94a3b8',
              mt: 1,
              display: 'block',
              textAlign: 'center'
            }}
          >
            💡 External sources are provided for transparency. Always verify important information.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ExternalSourcesDisplay;
