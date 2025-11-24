/**
 * Prompt Quality Analyzer Component
 *
 * Displays AI-powered quality analysis with:
 * - 5-dimension star rating system
 * - Overall quality score (0-100) with color coding
 * - Strengths and weaknesses lists
 * - Missing criteria identification
 *
 * Phase 3.7.4: UI Integration for AI Refinement Service
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as StrengthIcon,
  TrendingDown as WeaknessIcon,
  Help as MissingIcon,
} from '@mui/icons-material';
import type { PromptQualityAnalysis, QualityDimension } from '../../types/buyerProfile';

interface PromptQualityAnalyzerProps {
  analysis: PromptQualityAnalysis | null;
  isLoading?: boolean;
  error?: string | null;
  sx?: any;
}

/**
 * Get color for quality score
 */
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50'; // Green
  if (score >= 60) return '#ff9800'; // Orange
  if (score >= 40) return '#f44336'; // Red
  return '#9e9e9e'; // Gray
};

/**
 * Get grade color
 */
const getGradeColor = (grade: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (grade) {
    case 'A': return 'success';
    case 'B': return 'success';
    case 'C': return 'warning';
    case 'D': return 'error';
    case 'F': return 'error';
    default: return 'default';
  }
};

/**
 * Dimension icon mapping
 */
const getDimensionIcon = (dimension: string) => {
  switch (dimension) {
    case 'location_specificity': return '📍';
    case 'budget_realism': return '💰';
    case 'criteria_completeness': return '📋';
    case 'buyer_context': return '👤';
    case 'australian_market': return '🇦🇺';
    default: return '📊';
  }
};

/**
 * Quality dimension card component
 */
const QualityDimensionCard: React.FC<{
  dimension: QualityDimension;
  dimensionKey: string;
}> = ({ dimension, dimensionKey }) => {
  const icon = getDimensionIcon(dimensionKey);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        border: `2px solid ${dimension.color === 'success' ? '#4caf50' :
                              dimension.color === 'warning' ? '#ff9800' :
                              dimension.color === 'error' ? '#f44336' : '#2196f3'}`,
        backgroundColor: `${dimension.color === 'success' ? '#f1f8e9' :
                          dimension.color === 'warning' ? '#fff3e0' :
                          dimension.color === 'error' ? '#ffebee' : '#e3f2fd'}`,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ mr: 1 }}>
            {icon}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
            {dimension.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating
            value={dimension.score}
            max={5}
            readOnly
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {dimension.score}/5
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {dimension.description}
        </Typography>

        {dimension.feedback && (
          <Typography variant="body2" sx={{ fontSize: '12px', fontStyle: 'italic' }}>
            {dimension.feedback}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Loading skeleton for quality analyzer
 */
const QualityAnalyzerSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, mb: 3 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
        ))}
      </Box>

      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={20} />
      <Skeleton variant="text" width="100%" height={20} />
    </CardContent>
  </Card>
);

/**
 * Main PromptQualityAnalyzer component
 */
export const PromptQualityAnalyzer: React.FC<PromptQualityAnalyzerProps> = ({
  analysis,
  isLoading = false,
  error,
  sx,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <Box sx={sx}>
        <QualityAnalyzerSkeleton />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Card sx={sx}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ErrorIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6" color="error">
              Analysis Failed
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // No analysis state or malformed analysis
  if (!analysis || !analysis.overall_score || typeof analysis.overall_score !== 'number') {
    return (
      <Card sx={sx}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Quality Analysis
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Click "Analyze Quality" to get AI-powered insights about your prompt.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={sx}>
      <CardContent>
        {/* Header with Overall Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: getScoreColor(analysis.overall_score),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <Typography variant="h5" color="white" fontWeight="bold">
              {Math.round(analysis.overall_score)}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Quality Score: {Math.round(analysis.overall_score)}/100
            </Typography>
            <Chip
              label={`Grade: ${analysis.overall_grade}`}
              color={getGradeColor(analysis.overall_grade)}
              variant="filled"
              size="small"
            />
            <LinearProgress
              variant="determinate"
              value={analysis.overall_score}
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(analysis.overall_score),
                },
              }}
            />
          </Box>
        </Box>

        {/* Quality Dimensions Grid */}
        <Typography variant="h6" gutterBottom>
          Quality Dimensions
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(280px, 1fr))' },
            gap: { xs: 1, md: 2 },
            mb: 3,
          }}
        >
          {Object.entries(analysis.dimensions).map(([key, dimension]) => (
            <QualityDimensionCard
              key={key}
              dimension={dimension}
              dimensionKey={key}
            />
          ))}
        </Box>

        {/* Strengths, Weaknesses, and Missing Criteria */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' }, gap: { xs: 2, md: 3 } }}>
          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#4caf50' }}>
                <StrengthIcon sx={{ mr: 1 }} />
                Strengths
              </Typography>
              <List dense>
                {analysis.strengths.map((strength, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={strength}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Weaknesses */}
          {analysis.weaknesses.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#ff9800' }}>
                <WeaknessIcon sx={{ mr: 1 }} />
                Areas for Improvement
              </Typography>
              <List dense>
                {analysis.weaknesses.map((weakness, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <WarningIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={weakness}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Missing Criteria */}
          {analysis.missing_criteria.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#f44336' }}>
                <MissingIcon sx={{ mr: 1 }} />
                Missing Information
              </Typography>
              <List dense>
                {analysis.missing_criteria.map((missing, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={missing}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* Confidence Footer */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary">
            Analysis Confidence: {Math.round(analysis.confidence * 100)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PromptQualityAnalyzer;