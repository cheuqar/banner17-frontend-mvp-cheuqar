import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Psychology,
  Build,
  Visibility,
  CheckCircle,
  Error as ErrorIcon,
  AccessTime,
  MonetizationOn,
  ArrowDownward,
  ArrowUpward,
  TrendingUp,
  Speed,
  BugReport
} from '@mui/icons-material';
import ExecutionTraceModal from './ExecutionTraceModal';

// LangGraph trace step data structure
interface LangGraphTraceStep {
  agent: string;
  duration_ms: number;
  success: boolean;
  tools_used?: string[];
  tokens_in?: number;
  tokens_out?: number;
  estimated_cost?: number;
  thinking_process?: string;
  tool_results?: {
    [toolName: string]: {
      input?: any;
      output?: any;
      execution_time_ms?: number;
      api_calls_made?: number;
      status?: string;
    };
  };
  metadata?: Record<string, any>;
}

interface LangGraphExecutionData {
  trace: LangGraphTraceStep[];
  total_duration_ms: number;
  total_tokens_in: number;
  total_tokens_out: number;
  total_estimated_cost: number;
  architecture: string;
  debug_trace?: Array<Record<string, any>>;  // Enhanced debug trace
  debug_mode?: boolean;  // Flag indicating debug mode is enabled
}

interface LangGraphExecutionDisplayProps {
  executionData: LangGraphExecutionData;
  isActive?: boolean;
}

const LangGraphExecutionDisplay: React.FC<LangGraphExecutionDisplayProps> = ({
  executionData,
  isActive = false
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [debugModalOpen, setDebugModalOpen] = useState(false);

  // Check if debug mode is enabled
  const isDebugMode = () => {
    const debugMode = (
      executionData.debug_mode ||
      import.meta.env.VITE_DEBUG === 'true' ||
      import.meta.env.NODE_ENV === 'development' ||
      window.location.search.includes('debug=true')
    );
    
    console.log('🐛 [LangGraphExecutionDisplay] Debug mode check:', {
      executionDataDebugMode: executionData.debug_mode,
      viteDebug: import.meta.env.VITE_DEBUG,
      nodeEnv: import.meta.env.NODE_ENV,
      urlDebug: window.location.search.includes('debug=true'),
      finalDebugMode: debugMode,
      hasDebugTrace: !!executionData.debug_trace,
      debugTraceLength: executionData.debug_trace ? executionData.debug_trace.length : 0,
      debugTraceType: typeof executionData.debug_trace
    });
    
    return debugMode;
  };

  const getAgentIcon = (agent: string) => {
    switch (agent.toLowerCase()) {
      case 'planner':
        return <Psychology fontSize="inherit" />;
      case 'tool_executor':
        return <Build fontSize="inherit" />;
      case 'presenter':
        return <Visibility fontSize="inherit" />;
      default:
        return <Build fontSize="inherit" />;
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent.toLowerCase()) {
      case 'planner':
        return '#8B5CF6'; // purple
      case 'tool_executor':
        return '#06B6D4'; // cyan
      case 'presenter':
        return '#10B981'; // emerald
      default:
        return '#6B7280'; // gray
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.01) return `$${(cost * 1000).toFixed(2)}‰`; // per mille for very small costs
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens === 0) return '0';
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}k`;
    return `${(tokens / 1000000).toFixed(1)}M`;
  };

  const formatTokenRate = (totalTokens: number, durationMs: number): string => {
    if (durationMs <= 0) return '0';
    const tokensPerSecond = totalTokens / (durationMs / 1000);
    if (tokensPerSecond < 1000) return tokensPerSecond.toFixed(0);
    return `${(tokensPerSecond / 1000).toFixed(1)}k`;
  };

  if (!executionData?.trace || executionData.trace.length === 0) return null;

  // Fix duration calculation if total_duration_ms is 0 or missing
  const actualTotalDuration = executionData.total_duration_ms > 0 
    ? executionData.total_duration_ms 
    : executionData.trace.reduce((sum, step) => sum + (step.duration_ms || 0), 0);

  // Calculate cumulative token usage for enhanced visualization
  let cumulativeTokensIn = 0;
  let cumulativeTokensOut = 0;
  const stepsWithCumulative = executionData.trace.map((step, index) => {
    cumulativeTokensIn += step.tokens_in || 0;
    cumulativeTokensOut += step.tokens_out || 0;
    return {
      ...step,
      cumulativeTokensIn,
      cumulativeTokensOut,
      stepIndex: index
    };
  });

  // Calculate token distribution percentages
  const totalTokensUsed = executionData.total_tokens_in + executionData.total_tokens_out;
  const getTokenPercentage = (tokens: number) => totalTokensUsed > 0 ? (tokens / totalTokensUsed * 100) : 0;

  return (
    <Box sx={{
      mt: 1.5,
      mb: 1,
      borderRadius: 1,
      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
      backgroundColor: alpha(theme.palette.background.paper, isActive ? 0.8 : 0.4),
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      opacity: isActive ? 1 : 0.85
    }}>
      {/* Minimal Header */}
      <Box sx={{
        px: 1.5,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: alpha(theme.palette.grey[100], 0.5),
        borderBottom: expanded ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.7rem',
            fontWeight: 500
          }}>
            Execution Trace
          </Typography>
          
          {/* Agent indicators - minimal chips */}
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {executionData.trace.map((step, index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: step.success ? getAgentColor(step.agent) : theme.palette.error.main,
                  opacity: 0.8
                }}
              />
            ))}
          </Box>
        </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Time duration */}
          <Typography variant="caption" sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.25
          }}>
            <AccessTime fontSize="inherit" />
            {formatDuration(actualTotalDuration)}
          </Typography>
          
          {/* Compact Token Usage Display */}
          {executionData.total_tokens_in + executionData.total_tokens_out > 0 && (
            <Box sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 0.5,
              backgroundColor: alpha(theme.palette.primary.light, 0.03),
              px: 0.6,
              py: 0.25,
              borderRadius: '6px',
              border: `1px solid ${alpha(theme.palette.primary.light, 0.12)}`,
              maxWidth: 'fit-content'
            }}>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.6rem',
                fontWeight: 500
              }}>
                {formatTokens(executionData.total_tokens_in)}↓
              </Typography>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.disabled,
                fontSize: '0.55rem'
              }}>
                •
              </Typography>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.6rem',
                fontWeight: 500
              }}>
                {formatTokens(executionData.total_tokens_out)}↑
              </Typography>
            </Box>
          )}
          
          {/* Compact warning when no token usage data - minimal layout impact */}
          {executionData.total_tokens_in + executionData.total_tokens_out === 0 && (
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: alpha(theme.palette.warning.light, 0.04),
              px: 0.6,
              py: 0.25,
              borderRadius: '4px',
              border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
              maxWidth: 'fit-content',
              flexShrink: 0
            }}>
              <Typography variant="caption" sx={{
                color: theme.palette.warning.main,
                fontSize: '0.6rem',
                fontWeight: 500,
                whiteSpace: 'nowrap'
              }}>
                ⚠️ No Tokens
              </Typography>
            </Box>
          )}
          
          {executionData.total_estimated_cost > 0 && (
            <Typography variant="caption" sx={{ 
              color: theme.palette.error.main,
              fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                fontWeight: 500
              }}>
                <MonetizationOn fontSize="inherit" />
                {formatCost(executionData.total_estimated_cost)}
              </Typography>
          )}
          
          {/* Total token throughput rate */}
          {executionData.total_tokens_in + executionData.total_tokens_out > 0 && actualTotalDuration > 0 && (
            <Typography variant="caption" sx={{ 
              color: theme.palette.grey[600],
              fontSize: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.25
            }}>
                <Speed fontSize="inherit" />
                {formatTokenRate(executionData.total_tokens_in + executionData.total_tokens_out, actualTotalDuration)}
                /s
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Debug Trace Button (only shown in debug mode) */}
          {(() => {
            const debugModeEnabled = isDebugMode();
            const hasDebugTrace = !!executionData.debug_trace;
            const hasDebugTraceLength = hasDebugTrace && executionData.debug_trace && executionData.debug_trace.length > 0;
            const shouldShowButton = debugModeEnabled && hasDebugTrace && hasDebugTraceLength;
            
                    console.log('🐛 [LangGraphExecutionDisplay] Debug button condition check:', {
          debugModeEnabled,
          hasDebugTrace,
          debugTraceLength: hasDebugTrace ? executionData.debug_trace?.length : 'N/A',
          hasDebugTraceLength,
          shouldShowButton,
          // Additional debug info about the trace structure
          debugTraceType: hasDebugTrace ? typeof executionData.debug_trace : 'none',
          debugTraceIsArray: hasDebugTrace ? Array.isArray(executionData.debug_trace) : false,
          debugTraceKeys: hasDebugTrace && executionData.debug_trace && typeof executionData.debug_trace === 'object' ? Object.keys(executionData.debug_trace) : 'N/A',
          debugTraceValue: hasDebugTrace ? executionData.debug_trace : 'none'
        });
            
            return shouldShowButton;
          })() && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<BugReport />}
              onClick={() => setDebugModalOpen(true)}
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                fontSize: '0.65rem',
                color: theme.palette.warning.main,
                borderColor: theme.palette.warning.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  borderColor: theme.palette.warning.main,
                }
              }}
            >
              Debug
            </Button>
          )}

          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: theme.palette.text.secondary,
              width: 20,
              height: 20,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.3)
              }
            }}
          >
            {expanded ? <ExpandLess fontSize="inherit" /> : <ExpandMore fontSize="inherit" />}
          </IconButton>
        </Box>
      </Box>

      {/* Detailed Steps */}
      <Collapse in={expanded}>
        <Box sx={{ p: 1.5 }}>
          {/* Enhanced Token Usage Summary with Distribution */}
          {executionData.total_tokens_in + executionData.total_tokens_out > 0 && (
            <Box sx={{
              mb: 2,
              p: 1,
              backgroundColor: alpha(theme.palette.primary.light, 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`
            }}>
              <Typography variant="caption" sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: theme.palette.primary.main,
                mb: 0.75,
                display: 'block'
              }}>
                📊 Token Usage Summary
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: 1.5,
                alignItems: 'center'
              }}>
                {/* Input Tokens */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
                    <ArrowDownward sx={{ fontSize: '0.8rem', color: theme.palette.info.main }} />
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 600,
                      color: theme.palette.info.main 
                    }}>
                      {formatTokens(executionData.total_tokens_in)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
                    Input Tokens
                  </Typography>
                </Box>

                {/* Output Tokens */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
                    <ArrowUpward sx={{ fontSize: '0.8rem', color: theme.palette.success.main }} />
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 600,
                      color: theme.palette.success.main 
                    }}>
                      {formatTokens(executionData.total_tokens_out)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
                    Output Tokens
                  </Typography>
                </Box>

                {/* Total */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 0.25
                  }}>
                    {formatTokens(executionData.total_tokens_in + executionData.total_tokens_out)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
                    Total Tokens
                  </Typography>
                </Box>

                {/* Efficiency Ratio */}
                {executionData.total_tokens_in > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
                      <TrendingUp sx={{ fontSize: '0.8rem', color: theme.palette.warning.main }} />
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        color: theme.palette.warning.main 
                      }}>
                        {(executionData.total_tokens_out / executionData.total_tokens_in).toFixed(1)}x
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
                      Expansion Ratio
                    </Typography>
                  </Box>
                )}

                {/* Throughput */}
                {actualTotalDuration > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
                      <Speed sx={{ fontSize: '0.8rem', color: theme.palette.grey[700] }} />
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        color: theme.palette.grey[700] 
                      }}>
                        {formatTokenRate(executionData.total_tokens_in + executionData.total_tokens_out, actualTotalDuration)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
                      Tokens/sec
                    </Typography>
                  </Box>
                )}

                {/* Cost */}
                {executionData.total_estimated_cost > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
                      <MonetizationOn sx={{ fontSize: '0.8rem', color: theme.palette.error.main }} />
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        color: theme.palette.error.main 
                      }}>
                        {formatCost(executionData.total_estimated_cost)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
                      Estimated Cost
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Debug Token Data (only when no tokens found) */}
          {executionData.total_tokens_in + executionData.total_tokens_out === 0 && (
            <Box sx={{
              mb: 2,
              p: 1.5,
              backgroundColor: alpha(theme.palette.grey[100], 0.8),
              borderRadius: 1,
              border: `1px dashed ${alpha(theme.palette.grey[400], 0.5)}`
            }}>
              <Typography variant="caption" sx={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: theme.palette.text.secondary,
                mb: 1,
                display: 'block'
              }}>
                🔍 Debug: Raw Token Data
              </Typography>
              <Typography variant="caption" sx={{
                fontSize: '0.6rem',
                color: theme.palette.text.disabled,
                fontFamily: 'monospace',
                display: 'block'
              }}>
                Total In: {executionData.total_tokens_in} | Total Out: {executionData.total_tokens_out}
              </Typography>
              <Typography variant="caption" sx={{
                fontSize: '0.6rem',
                color: theme.palette.text.disabled,
                fontFamily: 'monospace',
                display: 'block'
              }}>
                Step tokens: {executionData.trace.map(step => `${step.agent}(${step.tokens_in || 0}/${step.tokens_out || 0})`).join(', ')}
              </Typography>
            </Box>
          )}

          {/* Token Distribution Timeline */}
          {executionData.trace.some(step => step.tokens_in || step.tokens_out) && (
            <Box sx={{
              mb: 2,
              p: 1.5,
              backgroundColor: alpha(theme.palette.success.light, 0.04),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.success.light, 0.15)}`
            }}>
              <Typography variant="caption" sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: theme.palette.success.main,
                mb: 1,
                display: 'block'
              }}>
                📈 Token Flow Timeline
              </Typography>
              
              {/* Timeline bars showing cumulative token usage */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stepsWithCumulative.map((step, index) => {
                  const stepTokensIn = step.tokens_in || 0;
                  const stepTokensOut = step.tokens_out || 0;
                  const totalStepTokens = stepTokensIn + stepTokensOut;
                  
                  if (totalStepTokens === 0) return null;
                  
                  const inputPercentage = totalTokensUsed > 0 ? (stepTokensIn / totalTokensUsed * 100) : 0;
                  const outputPercentage = totalTokensUsed > 0 ? (stepTokensOut / totalTokensUsed * 100) : 0;
                  const cumulativePercentage = totalTokensUsed > 0 ? (step.cumulativeTokensIn + step.cumulativeTokensOut) / totalTokensUsed * 100 : 0;
                  
                  return (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Step indicator */}
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getAgentColor(step.agent),
                        flexShrink: 0
                      }} />
                      
                      {/* Step name */}
                      <Typography variant="caption" sx={{
                        fontSize: '0.65rem',
                        color: theme.palette.text.secondary,
                        minWidth: '70px',
                        textTransform: 'capitalize'
                      }}>
                        {step.agent.replace('_', ' ')}
                      </Typography>
                      
                      {/* Token bars */}
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {/* Input tokens bar */}
                        {stepTokensIn > 0 && (
                          <Box sx={{
                            height: 6,
                            width: `${Math.max(2, inputPercentage)}%`,
                            backgroundColor: theme.palette.info.main,
                            borderRadius: 1,
                            opacity: 0.8
                          }} />
                        )}
                        
                        {/* Output tokens bar */}
                        {stepTokensOut > 0 && (
                          <Box sx={{
                            height: 6,
                            width: `${Math.max(2, outputPercentage)}%`,
                            backgroundColor: theme.palette.success.main,
                            borderRadius: 1,
                            opacity: 0.8
                          }} />
                        )}
                        
                        {/* Token counts */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto' }}>
                          {stepTokensIn > 0 && (
                            <Typography variant="caption" sx={{
                              fontSize: '0.6rem',
                              color: theme.palette.info.main,
                              fontWeight: 500
                            }}>
                              ↓{formatTokens(stepTokensIn)}
                            </Typography>
                          )}
                          {stepTokensOut > 0 && (
                            <Typography variant="caption" sx={{
                              fontSize: '0.6rem',
                              color: theme.palette.success.main,
                              fontWeight: 500
                            }}>
                              ↑{formatTokens(stepTokensOut)}
                            </Typography>
                          )}
                          
                          {/* Cumulative indicator */}
                          <Typography variant="caption" sx={{
                            fontSize: '0.6rem',
                            color: theme.palette.text.disabled,
                            backgroundColor: alpha(theme.palette.grey[200], 0.5),
                            px: 0.5,
                            py: 0.1,
                            borderRadius: 0.5
                          }}>
                            {cumulativePercentage.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              
              {/* Duration distribution visualization */}
              {actualTotalDuration > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: theme.palette.warning.main,
                    mb: 0.75,
                    display: 'block'
                  }}>
                    ⏱️ Execution Time Distribution
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, height: 12 }}>
                    {executionData.trace.map((step, index) => {
                      const durationPercentage = (step.duration_ms || 0) / actualTotalDuration * 100;
                      return (
                        <Box
                          key={index}
                          sx={{
                            height: '100%',
                            width: `${Math.max(1, durationPercentage)}%`,
                            backgroundColor: getAgentColor(step.agent),
                            borderRadius: 0.25,
                            opacity: 0.8,
                            position: 'relative',
                            '&:hover': {
                              opacity: 1,
                              '&::after': {
                                content: `"${step.agent}: ${formatDuration(step.duration_ms || 0)}"`,
                                position: 'absolute',
                                top: '-25px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '0.6rem',
                                whiteSpace: 'nowrap',
                                zIndex: 1000
                              }
                            }
                          }}
                        />
                      );
                    })}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.disabled }}>
                      0ms
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.disabled }}>
                      {formatDuration(actualTotalDuration)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {executionData.trace.map((step, index) => (
            <Box
              key={index}
              sx={{
                mb: index < executionData.trace.length - 1 ? 1.5 : 0,
                border: `1px solid ${alpha(getAgentColor(step.agent), 0.2)}`,
                borderRadius: 1,
                backgroundColor: alpha(getAgentColor(step.agent), 0.03),
                overflow: 'hidden'
              }}
            >
              {/* Step Header */}
              <Box sx={{
                px: 1.25,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: alpha(getAgentColor(step.agent), 0.08),
                borderBottom: expandedStep === index ? `1px solid ${alpha(getAgentColor(step.agent), 0.15)}` : 'none'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{
                    color: getAgentColor(step.agent),
                    fontSize: '0.875rem'
                  }}>
                    {getAgentIcon(step.agent)}
                  </Box>
                  
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    textTransform: 'capitalize'
                  }}>
                    {step.agent.replace('_', ' ')}
                  </Typography>
                  
                  {step.success ? (
                    <CheckCircle sx={{ color: getAgentColor(step.agent), fontSize: '0.75rem' }} />
                  ) : (
                    <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: '0.75rem' }} />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Step metrics */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.65rem',
                      color: theme.palette.text.secondary
                    }}>
                      {formatDuration(step.duration_ms)}
                    </Typography>
                    
                    {step.tools_used && step.tools_used.length > 0 && (
                      <Chip
                        size="small"
                        label={`${step.tools_used.length} tool${step.tools_used.length > 1 ? 's' : ''}`}
                        sx={{
                          height: 16,
                          fontSize: '0.6rem',
                          backgroundColor: alpha(getAgentColor(step.agent), 0.15),
                          color: getAgentColor(step.agent),
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    )}
                  </Box>

                  {(step.thinking_process || step.tool_results) && (
                    <IconButton
                      size="small"
                      onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                      sx={{
                        color: getAgentColor(step.agent),
                        width: 16,
                        height: 16
                      }}
                    >
                      {expandedStep === index ? <ExpandLess fontSize="inherit" /> : <ExpandMore fontSize="inherit" />}
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Step Details */}
              <Collapse in={expandedStep === index}>
                <Box sx={{ p: 1.25 }}>
                  {/* Thinking Process */}
                  {step.thinking_process && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        mb: 0.5,
                        display: 'block'
                      }}>
                        Reasoning:
                      </Typography>
                      <Typography variant="body2" sx={{
                        fontSize: '0.7rem',
                        color: theme.palette.text.primary,
                        fontStyle: 'italic',
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        p: 0.75,
                        borderRadius: 0.5,
                        borderLeft: `2px solid ${getAgentColor(step.agent)}`
                      }}>
                        {step.thinking_process}
                      </Typography>
                    </Box>
                  )}

                  {/* Tool Results */}
                  {step.tool_results && Object.keys(step.tool_results).length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        mb: 0.75,
                        display: 'block'
                      }}>
                        Tools Used:
                      </Typography>
                      
                      {Object.entries(step.tool_results).map(([toolName, result]) => (
                        <Box key={toolName} sx={{
                          mb: 1,
                          p: 0.75,
                          backgroundColor: alpha(theme.palette.background.default, 0.3),
                          borderRadius: 0.5,
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ 
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              color: theme.palette.text.primary
                            }}>
                              {toolName}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {result.execution_time_ms && (
                                <Typography variant="caption" sx={{ 
                                  fontSize: '0.6rem',
                                  color: theme.palette.text.secondary
                                }}>
                                  {formatDuration(result.execution_time_ms)}
                                </Typography>
                              )}
                              
                              <Chip
                                size="small"
                                label={result.status || 'completed'}
                                color={result.status === 'error' ? 'error' : 'success'}
                                sx={{
                                  height: 14,
                                  fontSize: '0.55rem',
                                  '& .MuiChip-label': { px: 0.4 }
                                }}
                              />
                            </Box>
                          </Box>
                          
                          {result.output && (
                            <Typography variant="caption" sx={{
                              fontSize: '0.65rem',
                              color: theme.palette.text.secondary,
                              fontFamily: 'monospace',
                              display: 'block',
                              whiteSpace: 'pre-wrap',
                              maxHeight: '60px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {typeof result.output === 'string' 
                                ? result.output.substring(0, 200) + (result.output.length > 200 ? '...' : '')
                                : JSON.stringify(result.output, null, 2).substring(0, 200) + '...'
                              }
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Token and Cost Details - Enhanced */}
                  {(step.tokens_in || step.tokens_out || step.estimated_cost) && (
                    <Box sx={{
                      mt: 1,
                      p: 0.75,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 0.5,
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                    }}>
                      <Typography variant="caption" sx={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        mb: 0.5,
                        display: 'block'
                      }}>
                        Token Usage:
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {/* Step efficiency compared to overall */}
                        {(step.tokens_in || step.tokens_out) && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.25,
                            backgroundColor: alpha(theme.palette.primary.light, 0.1),
                            px: 0.5,
                            py: 0.1,
                            borderRadius: 0.5,
                            border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`
                          }}>
                            <Typography variant="caption" sx={{ 
                              fontSize: '0.6rem', 
                              color: theme.palette.primary.main,
                              fontWeight: 500
                            }}>
                              {getTokenPercentage((step.tokens_in || 0) + (step.tokens_out || 0)).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', color: theme.palette.text.disabled }}>
                              of total
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                        {/* Input tokens with icon - always show for clarity */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.25,
                          backgroundColor: alpha(theme.palette.info.light, 0.1),
                          px: 0.5,
                          py: 0.2,
                          borderRadius: 0.5
                        }}>
                          <ArrowDownward sx={{ fontSize: '0.7rem', color: theme.palette.info.main }} />
                          <Typography variant="caption" sx={{ 
                            fontSize: '0.7rem', 
                            color: theme.palette.info.main,
                            fontWeight: 600,
                            minWidth: '30px'
                          }}>
                            {formatTokens(step.tokens_in || 0)}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.disabled }}>
                            IN
                          </Typography>
                        </Box>
                        
                        {/* Output tokens with icon - always show for clarity */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.25,
                          backgroundColor: alpha(theme.palette.success.light, 0.1),
                          px: 0.5,
                          py: 0.2,
                          borderRadius: 0.5
                        }}>
                          <ArrowUpward sx={{ fontSize: '0.7rem', color: theme.palette.success.main }} />
                          <Typography variant="caption" sx={{ 
                            fontSize: '0.7rem', 
                            color: theme.palette.success.main,
                            fontWeight: 600,
                            minWidth: '30px'
                          }}>
                            {formatTokens(step.tokens_out || 0)}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.disabled }}>
                            OUT
                          </Typography>
                        </Box>
                        
                        {/* Token efficiency ratio */}
                        {step.tokens_in && step.tokens_out && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <TrendingUp sx={{ fontSize: '0.7rem', color: theme.palette.warning.main }} />
                            <Typography variant="caption" sx={{ 
                              fontSize: '0.65rem', 
                              color: theme.palette.warning.main,
                              fontWeight: 500
                            }}>
                              {(step.tokens_out / step.tokens_in).toFixed(1)}x
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.disabled }}>
                              ratio
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Cost with dollar icon */}
                        {step.estimated_cost && step.estimated_cost > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <MonetizationOn sx={{ fontSize: '0.7rem', color: theme.palette.error.main }} />
                            <Typography variant="caption" sx={{ 
                              fontSize: '0.65rem', 
                              color: theme.palette.error.main,
                              fontWeight: 500
                            }}>
                              {formatCost(step.estimated_cost)}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Tokens per second rate */}
                        {(step.tokens_in || step.tokens_out) && step.duration_ms > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <Speed sx={{ fontSize: '0.7rem', color: theme.palette.grey[600] }} />
                            <Typography variant="caption" sx={{ 
                              fontSize: '0.65rem', 
                              color: theme.palette.grey[600],
                              fontWeight: 500
                            }}>
                              {formatTokenRate((step.tokens_in || 0) + (step.tokens_out || 0), step.duration_ms)}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.disabled }}>
                              tok/s
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Step efficiency relative to time spent */}
                        {(step.tokens_in || step.tokens_out) && step.duration_ms && step.duration_ms > 0 && actualTotalDuration > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', color: theme.palette.text.disabled }}>
                              efficiency:
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              fontSize: '0.65rem', 
                              color: theme.palette.secondary.main,
                              fontWeight: 500,
                              backgroundColor: alpha(theme.palette.secondary.light, 0.2),
                              px: 0.4,
                              py: 0.1,
                              borderRadius: 0.5
                            }}>
                              {(((step.tokens_in || 0) + (step.tokens_out || 0)) / step.duration_ms * 1000).toFixed(0)} tok/s
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Time proportion vs token proportion comparison */}
                        {step.duration_ms && actualTotalDuration > 0 && (step.tokens_in || step.tokens_out) && totalTokensUsed > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', color: theme.palette.text.disabled }}>
                              time vs tokens:
                            </Typography>
                            {(() => {
                              const timePercentage = (step.duration_ms / actualTotalDuration) * 100;
                              const tokenPercentage = getTokenPercentage((step.tokens_in || 0) + (step.tokens_out || 0));
                              const efficiency = tokenPercentage / timePercentage;
                              const isEfficient = efficiency > 1;
                              return (
                                <Typography variant="caption" sx={{ 
                                  fontSize: '0.6rem', 
                                  color: isEfficient ? theme.palette.success.main : theme.palette.warning.main,
                                  fontWeight: 500,
                                  backgroundColor: alpha(isEfficient ? theme.palette.success.main : theme.palette.warning.main, 0.1),
                                  px: 0.4,
                                  py: 0.1,
                                  borderRadius: 0.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.25
                                }}>
                                  {isEfficient ? '⚡' : '🐌'} {efficiency.toFixed(1)}x
                                </Typography>
                              );
                            })()}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>
      </Collapse>
      
      {/* Debug Trace Modal */}
      {isDebugMode() && executionData.debug_trace && (
        <ExecutionTraceModal
          open={debugModalOpen}
          onClose={() => setDebugModalOpen(false)}
          debugTrace={executionData.debug_trace}
          title="LLM Agent Execution Trace"
        />
      )}
    </Box>
  );
};

export default LangGraphExecutionDisplay;
