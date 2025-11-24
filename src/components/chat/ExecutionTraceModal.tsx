import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  Psychology as PsychologyIcon,
  Build as BuildIcon,
  Palette as PaletteIcon,
  Timeline as TimelineIcon,
  DataObject as DataObjectIcon,
  Visibility as VisibilityIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Token as TokenIcon,
  Memory as MemoryIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

interface DebugTraceEntry {
  agent: string;
  timestamp_ms: number;
  duration_ms?: number;
  input_state?: Record<string, any>;
  output_state?: Record<string, any>;
  llm_request?: Record<string, any>;
  llm_response?: Record<string, any>;
  tool_calls?: Array<Record<string, any>>;
  observations?: string[];
  reasoning?: string;
  tokens_in?: number;
  tokens_out?: number;
  model_used?: string;
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

interface ExecutionTraceModalProps {
  open: boolean;
  onClose: () => void;
  debugTrace: DebugTraceEntry[] | { agents: DebugTraceEntry[] } | any;  // Support both old and new formats
  title?: string;
}

const ExecutionTraceModal: React.FC<ExecutionTraceModalProps> = ({
  open,
  onClose,
  debugTrace,
  title = 'LLM Agent Execution Trace'
}) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Normalize debug trace data to handle different formats (old vs new)
  const normalizedDebugTrace = React.useMemo(() => {
    if (!debugTrace) {
      return [];
    }
    
    // Handle different data formats
    if (Array.isArray(debugTrace)) {
      // Old format: direct array of debug trace entries
      return debugTrace;
    } else if (typeof debugTrace === 'object' && debugTrace.agents && Array.isArray(debugTrace.agents)) {
      // New format: structured object with agents array
      return debugTrace.agents;
    } else {
      // Fallback: try to extract data or return empty array
      console.warn('🐛 [ExecutionTraceModal] Unexpected debug trace format:', debugTrace);
      return [];
    }
  }, [debugTrace]);

  if (!normalizedDebugTrace || normalizedDebugTrace.length === 0) {
    return null;
  }

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'planner':
        return <PsychologyIcon sx={{ color: theme.palette.primary.main }} />;
      case 'tool_executor':
        return <BuildIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'presenter':
        return <PaletteIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <BugReportIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'planner':
        return theme.palette.primary.main;
      case 'tool_executor':
        return theme.palette.secondary.main;
      case 'presenter':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) {
      return `${duration}ms`;
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(2)}s`;
    } else {
      return `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;
    }
  };

  const renderFlowVisualization = () => (
    <Box sx={{ p: 2 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {normalizedDebugTrace.map((entry: any, index: number) => (
          <Step key={index} completed={index < activeStep}>
            <StepLabel
              StepIconComponent={() => (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: alpha(getAgentColor(entry.agent), 0.1),
                  border: `2px solid ${getAgentColor(entry.agent)}`
                }}>
                  {getAgentIcon(entry.agent)}
                </Box>
              )}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {entry.agent.replace('_', ' ')}
                </Typography>
                <Chip 
                  size="small" 
                  label={formatDuration(entry.duration_ms || 0)}
                  sx={{ 
                    backgroundColor: alpha(getAgentColor(entry.agent), 0.1),
                    color: getAgentColor(entry.agent)
                  }}
                />
                {entry.errors && entry.errors.length > 0 && (
                  <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />
                )}
                {entry.warnings && entry.warnings.length > 0 && (
                  <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 16 }} />
                )}
              </Box>
            </StepLabel>
            <StepContent>
              <Card sx={{ mb: 1 }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  
                  {/* Basic Information */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Started At
                      </Typography>
                      <Typography variant="body2">
                        {formatTimestamp(entry.timestamp_ms)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {formatDuration(entry.duration_ms || 0)}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Token Usage */}
                  {(entry.tokens_in || entry.tokens_out) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        <TokenIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        Token Usage
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Chip size="small" label={`In: ${entry.tokens_in || 0}`} />
                        <Chip size="small" label={`Out: ${entry.tokens_out || 0}`} />
                        {entry.model_used && (
                          <Chip size="small" label={entry.model_used} variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Reasoning */}
                  {entry.reasoning && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        💭 Reasoning
                      </Typography>
                      <Paper sx={{ p: 1.5, backgroundColor: alpha(getAgentColor(entry.agent), 0.05) }}>
                        <Typography variant="body2">
                          {entry.reasoning}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Observations */}
                  {entry.observations && entry.observations.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        <VisibilityIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        Observations
                      </Typography>
                      <List dense>
                        {entry.observations.map((observation: any, obsIndex: number) => (
                          <ListItem key={obsIndex} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <CheckCircleIcon 
                                sx={{ 
                                  fontSize: 12, 
                                  color: getAgentColor(entry.agent) 
                                }} 
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary={observation}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Tool Calls */}
                  {entry.tool_calls && entry.tool_calls.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        🔧 Tool Calls
                      </Typography>
                      {entry.tool_calls.map((toolCall: any, toolIndex: number) => (
                        <Paper key={toolIndex} sx={{ p: 1.5, mb: 1, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {toolCall.action}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={toolCall.success ? 'Success' : 'Failed'} 
                              color={toolCall.success ? 'success' : 'error'}
                            />
                            {toolCall.duration_ms && (
                              <Chip 
                                size="small" 
                                label={formatDuration(toolCall.duration_ms)}
                                variant="outlined"
                              />
                            )}
                          </Box>
                          {toolCall.error && (
                            <Typography variant="body2" color="error">
                              Error: {toolCall.error}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* Errors and Warnings */}
                  {((entry.errors && entry.errors.length > 0) || (entry.warnings && entry.warnings.length > 0)) && (
                    <Box sx={{ mb: 2 }}>
                      {entry.errors && entry.errors.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                            <ErrorIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            Errors
                          </Typography>
                          {entry.errors.map((error: any, errorIndex: number) => (
                            <Paper key={errorIndex} sx={{ p: 1.5, mb: 1, backgroundColor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
                              <Typography variant="body2" color="error">
                                {error}
                              </Typography>
                            </Paper>
                          ))}
                        </Box>
                      )}
                      
                      {entry.warnings && entry.warnings.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
                            <WarningIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            Warnings
                          </Typography>
                          {entry.warnings.map((warning: any, warningIndex: number) => (
                            <Paper key={warningIndex} sx={{ p: 1.5, mb: 1, backgroundColor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
                              <Typography variant="body2" color="warning.main">
                                {warning}
                              </Typography>
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}

                </CardContent>
              </Card>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          size="small"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          Previous
        </Button>
        <Button
          size="small"
          onClick={() => setActiveStep(Math.min(normalizedDebugTrace.length - 1, activeStep + 1))}
          disabled={activeStep === normalizedDebugTrace.length - 1}
        >
          Next
        </Button>
        <Button
          size="small"
          onClick={() => setActiveStep(normalizedDebugTrace.length - 1)}
          variant="outlined"
        >
          Show All
        </Button>
      </Box>
    </Box>
  );

  const renderDetailedView = () => (
    <Box sx={{ p: 2 }}>
      {normalizedDebugTrace.map((entry: any, index: number) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {getAgentIcon(entry.agent)}
              <Typography variant="h6" sx={{ textTransform: 'capitalize', flexGrow: 1 }}>
                {entry.agent.replace('_', ' ')}
              </Typography>
              <Chip 
                size="small" 
                label={formatDuration(entry.duration_ms || 0)}
                sx={{ 
                  backgroundColor: alpha(getAgentColor(entry.agent), 0.1),
                  color: getAgentColor(entry.agent)
                }}
              />
              <Typography variant="caption" color="textSecondary">
                {formatTimestamp(entry.timestamp_ms)}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              
              {/* LLM Request/Response */}
              {(entry.llm_request || entry.llm_response) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <DataObjectIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    LLM Interaction
                  </Typography>
                  <Grid container spacing={1}>
                    {entry.llm_request && (
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1.5, height: 200, overflow: 'auto', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                          <Typography variant="caption" color="primary" fontWeight="bold">
                            Request
                          </Typography>
                          <pre style={{ fontSize: '11px', margin: 0, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(entry.llm_request, null, 2)}
                          </pre>
                        </Paper>
                      </Grid>
                    )}
                    {entry.llm_response && (
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1.5, height: 200, overflow: 'auto', backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                          <Typography variant="caption" color="success.main" fontWeight="bold">
                            Response
                          </Typography>
                          <pre style={{ fontSize: '11px', margin: 0, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(entry.llm_response, null, 2)}
                          </pre>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}

              {/* State Information */}
              {(entry.input_state || entry.output_state) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <MemoryIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    State Objects
                  </Typography>
                  <Grid container spacing={1}>
                    {entry.input_state && (
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1.5, height: 200, overflow: 'auto', backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                          <Typography variant="caption" color="info.main" fontWeight="bold">
                            Input State
                          </Typography>
                          <pre style={{ fontSize: '11px', margin: 0, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(entry.input_state, null, 2)}
                          </pre>
                        </Paper>
                      </Grid>
                    )}
                    {entry.output_state && (
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1.5, height: 200, overflow: 'auto', backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>
                          <Typography variant="caption" color="secondary.main" fontWeight="bold">
                            Output State
                          </Typography>
                          <pre style={{ fontSize: '11px', margin: 0, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(entry.output_state, null, 2)}
                          </pre>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}

              {/* Metadata */}
              {entry.metadata && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    📋 Metadata
                  </Typography>
                  <Paper sx={{ p: 1.5, backgroundColor: alpha(theme.palette.grey[500], 0.05) }}>
                    <pre style={{ fontSize: '11px', margin: 0, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              )}

            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  const renderSummaryView = () => {
    const totalDuration = normalizedDebugTrace.reduce((sum: number, entry: any) => sum + (entry.duration_ms || 0), 0);
    const totalTokensIn = normalizedDebugTrace.reduce((sum: number, entry: any) => sum + (entry.tokens_in || 0), 0);
    const totalTokensOut = normalizedDebugTrace.reduce((sum: number, entry: any) => sum + (entry.tokens_out || 0), 0);
    const errorCount = normalizedDebugTrace.reduce((sum: number, entry: any) => sum + (entry.errors?.length || 0), 0);
    const warningCount = normalizedDebugTrace.reduce((sum: number, entry: any) => sum + (entry.warnings?.length || 0), 0);

    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          
          {/* Summary Statistics */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              📊 Execution Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AccessTimeIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="h6">{formatDuration(totalDuration)}</Typography>
                    <Typography variant="caption" color="textSecondary">Total Duration</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TokenIcon sx={{ fontSize: 32, color: theme.palette.secondary.main, mb: 1 }} />
                    <Typography variant="h6">{totalTokensIn + totalTokensOut}</Typography>
                    <Typography variant="caption" color="textSecondary">Total Tokens</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 32, color: theme.palette.error.main, mb: 1 }} />
                    <Typography variant="h6">{errorCount}</Typography>
                    <Typography variant="caption" color="textSecondary">Errors</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <WarningIcon sx={{ fontSize: 32, color: theme.palette.warning.main, mb: 1 }} />
                    <Typography variant="h6">{warningCount}</Typography>
                    <Typography variant="caption" color="textSecondary">Warnings</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Agent Breakdown */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              🤖 Agent Performance
            </Typography>
            {normalizedDebugTrace.map((entry: any, index: number) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getAgentIcon(entry.agent)}
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                        {entry.agent.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip size="small" label={formatDuration(entry.duration_ms || 0)} />
                      <Chip size="small" label={`${(entry.tokens_in || 0) + (entry.tokens_out || 0)} tokens`} variant="outlined" />
                      {entry.errors && entry.errors.length > 0 && (
                        <Chip size="small" label={`${entry.errors.length} errors`} color="error" />
                      )}
                      {entry.warnings && entry.warnings.length > 0 && (
                        <Chip size="small" label={`${entry.warnings.length} warnings`} color="warning" />
                      )}
                    </Box>
                  </Box>
                  {entry.reasoning && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      {entry.reasoning}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Grid>

        </Grid>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BugReportIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6">{title}</Typography>
          <Chip 
            size="small" 
            label={`${normalizedDebugTrace.length} steps`} 
            sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab icon={<TimelineIcon />} label="Flow View" />
          <Tab icon={<DataObjectIcon />} label="Detailed View" />
          <Tab icon={<BugReportIcon />} label="Summary" />
        </Tabs>
      </Box>
      
      <DialogContent sx={{ p: 0, height: 'calc(100% - 120px)', overflow: 'auto' }}>
        {selectedTab === 0 && renderFlowVisualization()}
        {selectedTab === 1 && renderDetailedView()}
        {selectedTab === 2 && renderSummaryView()}
      </DialogContent>
    </Dialog>
  );
};

export default ExecutionTraceModal;
