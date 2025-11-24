import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import {
  BugReport,
  ExpandMore,
  Close,
  Memory,
  AttachMoney,
  Build,
  SmartToy,
  Timeline,
  Info
} from '@mui/icons-material';
import { getModelDisplayName, calculateModelCost, MODEL_PRICING } from '../../config/modelPricing';

interface ToolUsage {
  name: string;
  count: number;
  totalTokens: number;
  totalCost: number;
  prompt?: string;
  parameters?: Record<string, any>;
}

interface DebugSessionMetrics {
  sessionName: string;
  totalInputTokens: string;
  totalOutputTokens: string;
  totalCreditsUsed: string;
  toolsUsed: Record<string, number>;
}

interface ChatSessionDebugInfoProps {
  sessionMetrics: DebugSessionMetrics;
  messages: any[];
  currentModel?: string;
  availableTools?: any[];
  debugInfo?: any;
}

const ChatSessionDebugInfo: React.FC<ChatSessionDebugInfoProps> = ({
  sessionMetrics,
  messages,
  currentModel = 'Unknown',
  availableTools = [],
  debugInfo
}) => {
  const [open, setOpen] = useState(false);
  const [expandedTool, setExpandedTool] = useState<string | false>(false);

  // Check if debug mode is enabled
  const isDebugMode = process.env.NODE_ENV === 'development' || 
                      process.env.REACT_APP_DEBUG === 'true' ||
                      window.location.search.includes('debug=true');

  if (!isDebugMode) {
    return null;
  }

  const handleToolExpand = (toolName: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedTool(isExpanded ? toolName : false);
  };

  // Calculate tool usage statistics
  const getToolUsageStats = (): ToolUsage[] => {
    const toolStats: Record<string, ToolUsage> = {};
    
    // Initialize with available tools
    availableTools.forEach(tool => {
      toolStats[tool.name] = {
        name: tool.name,
        count: sessionMetrics.toolsUsed[tool.name] || 0,
        totalTokens: 0,
        totalCost: 0,
        prompt: tool.prompt || tool.description,
        parameters: tool.parameters || {}
      };
    });

    // Calculate tokens and costs from messages - look at trace data
    messages.forEach(message => {
      if (message.metadata && message.metadata.trace) {
        const trace = message.metadata.trace;
        trace.forEach((step: any) => {
          if (step.tools_used && Array.isArray(step.tools_used)) {
            step.tools_used.forEach((toolName: string) => {
              if (!toolStats[toolName]) {
                toolStats[toolName] = {
                  name: toolName,
                  count: 0,
                  totalTokens: 0,
                  totalCost: 0
                };
              }
              toolStats[toolName].totalTokens += (step.tokens_in || 0) + (step.tokens_out || 0);
              toolStats[toolName].totalCost += step.estimated_cost || 0;
            });
          }
        });
      }
      
      // Legacy support for langGraphExecution format
      if (message.langGraphExecution && message.langGraphExecution.tools_used) {
        message.langGraphExecution.tools_used.forEach((toolName: string) => {
          if (toolStats[toolName]) {
            toolStats[toolName].totalTokens += message.langGraphExecution.total_tokens_in + message.langGraphExecution.total_tokens_out;
            toolStats[toolName].totalCost += message.langGraphExecution.total_estimated_cost;
          }
        });
      }
    });

    return Object.values(toolStats).sort((a, b) => b.count - a.count);
  };

  const toolUsageStats = getToolUsageStats();
  const totalTokens = parseInt(sessionMetrics.totalInputTokens) + parseInt(sessionMetrics.totalOutputTokens);
  const avgTokensPerMessage = messages.length > 0 ? Math.round(totalTokens / messages.length) : 0;

  return (
    <>
      {/* Debug Button */}
      <Tooltip title="Debug Session Info (Dev Mode)">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: '#ff6b35',
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': {
              bgcolor: '#e55a2b'
            },
            boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
          }}
        >
          <BugReport sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      {/* Debug Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            bgcolor: '#fafbfc'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#1f2937',
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport />
            <Typography variant="h6" fontWeight={600}>
              Debug Session Info
            </Typography>
            <Chip 
              label="DEV MODE" 
              size="small" 
              sx={{ 
                bgcolor: '#ff6b35', 
                color: 'white',
                fontSize: '0.7rem',
                height: 20
              }} 
            />
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflow: 'auto' }}>
          <Grid container spacing={3}>
            {/* Session & User Information */}
            <Grid item xs={12}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Memory color="primary" />
                    Session & User Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Session Details</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Session ID:</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {debugInfo?.sessionId || 'No session ID'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Session Name:</Typography>
                          <Typography variant="body2" fontWeight={600}>{sessionMetrics.sessionName}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Is Loading:</Typography>
                          <Chip label={debugInfo?.sessionState?.isLoading ? 'Yes' : 'No'} 
                                size="small" 
                                color={debugInfo?.sessionState?.isLoading ? 'warning' : 'success'} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Total Messages:</Typography>
                          <Typography variant="body2" fontWeight={600}>{messages.length}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>User Details</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">User ID:</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {debugInfo?.user?.id ? `${debugInfo.user.id.substring(0, 8)}...` : 'Not logged in'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Email:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {debugInfo?.user?.email || 'Not available'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Display Name:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {debugInfo?.user?.displayName || 'Not available'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Authenticated:</Typography>
                          <Chip label={debugInfo?.user?.isAuthenticated ? 'Yes' : 'No'} 
                                size="small" 
                                color={debugInfo?.user?.isAuthenticated ? 'success' : 'error'} />
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Environment & Request State */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Info color="info" />
                    Environment & State
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Environment</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Node Env:</Typography>
                          <Chip label={debugInfo?.environment?.nodeEnv || 'Unknown'} size="small" />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Debug Mode:</Typography>
                          <Chip label={debugInfo?.environment?.debugMode ? 'Enabled' : 'Disabled'} 
                                size="small" 
                                color={debugInfo?.environment?.debugMode ? 'success' : 'default'} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">API Base:</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                            {debugInfo?.environment?.apiBaseUrl || 'Not set'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Request State</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Is Streaming:</Typography>
                          <Chip label={debugInfo?.requestState?.isStreaming ? 'Yes' : 'No'} 
                                size="small" 
                                color={debugInfo?.requestState?.isStreaming ? 'warning' : 'default'} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Request Duration:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {debugInfo?.requestState?.lastRequestDuration ? 
                              `${debugInfo.requestState.lastRequestDuration}ms` : 'No recent request'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Browser & Location Info */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Timeline color="secondary" />
                    Browser & Location
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Location</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Current Path:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {debugInfo?.browserInfo?.currentPath || '/'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Search Params:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {debugInfo?.browserInfo?.currentSearch || 'None'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Referrer:</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                            {debugInfo?.browserInfo?.referrer || 'Direct'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Browser</Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">User Agent:</Typography>
                          <Paper sx={{ p: 1, mt: 0.5, bgcolor: 'grey.50' }}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }}>
                              {debugInfo?.browserInfo?.userAgent?.substring(0, 100) || 'Not available'}
                              {debugInfo?.browserInfo?.userAgent?.length > 100 ? '...' : ''}
                            </Typography>
                          </Paper>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Timestamp:</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                            {debugInfo?.browserInfo?.timestamp ? 
                              new Date(debugInfo.browserInfo.timestamp).toLocaleTimeString() : 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Cost Statistics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AttachMoney color="success" />
                    Cost Statistics
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'success.light', 
                      borderRadius: 2,
                      textAlign: 'center'
                    }}>
                      <Typography variant="h4" fontWeight={700} color="success.dark">
                        ${sessionMetrics.totalCreditsUsed}
                      </Typography>
                      <Typography variant="caption" color="success.dark">
                        Total Session Cost
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Avg. Cost/Message:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ${messages.length > 0 ? (parseFloat(sessionMetrics.totalCreditsUsed) / messages.length).toFixed(4) : '0.0000'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Avg. Tokens/Message:</Typography>
                      <Typography variant="body2" fontWeight={600}>{avgTokensPerMessage}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Model Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SmartToy color="info" />
                    Model Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="info.dark">
                        {getModelDisplayName(currentModel || 'gemini-2.5-flash-lite')}
                      </Typography>
                      <Typography variant="caption" color="info.dark">
                        Current LLM Model
                      </Typography>
                    </Box>
                    
                    {/* LLM Pricing Information */}
                    <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'warning.dark' }}>
                        Model Pricing
                      </Typography>
                      {(() => {
                        const pricing = MODEL_PRICING[currentModel || 'gemini-2.5-flash-lite'];
                        return pricing ? (
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="warning.dark">Input:</Typography>
                              <Typography variant="body2" fontWeight={600} color="warning.dark">
                                ${pricing.inputTokensPerMillion.toFixed(4)}/1M tokens
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="warning.dark">Output:</Typography>
                              <Typography variant="body2" fontWeight={600} color="warning.dark">
                                ${pricing.outputTokensPerMillion.toFixed(4)}/1M tokens
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="warning.dark">Tier:</Typography>
                              <Chip label={pricing.tier.toUpperCase()} size="small" 
                                    color={pricing.tier === 'free' ? 'success' : pricing.tier === 'low' ? 'info' : 'warning'} />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="warning.dark">Updated:</Typography>
                              <Typography variant="body2" fontWeight={600} color="warning.dark" sx={{ fontSize: '0.8rem' }}>
                                {pricing.lastUpdated}
                              </Typography>
                            </Box>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="warning.dark">
                            No pricing info for {currentModel}
                          </Typography>
                        );
                      })()}
                    </Box>
                    
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Total Tokens:</Typography>
                      <Typography variant="body2" fontWeight={600}>{totalTokens.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Input/Output Ratio:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {parseInt(sessionMetrics.totalOutputTokens) > 0 
                          ? (parseInt(sessionMetrics.totalInputTokens) / parseInt(sessionMetrics.totalOutputTokens)).toFixed(2)
                          : 'N/A'
                        }
                      </Typography>
                    </Box>
                    
                    {/* Cost Calculation Verification */}
                    <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'success.dark' }}>
                        Cost Calculation Check
                      </Typography>
                      {(() => {
                        const inputTokens = parseInt(sessionMetrics.totalInputTokens) || 0;
                        const outputTokens = parseInt(sessionMetrics.totalOutputTokens) || 0;
                        const frontendCalculatedCost = calculateModelCost(currentModel || 'gemini-2.5-flash-lite', inputTokens, outputTokens);
                        const backendReportedCost = parseFloat(sessionMetrics.totalCreditsUsed) || 0;
                        
                        return (
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="success.dark">Frontend Calc:</Typography>
                              <Typography variant="body2" fontWeight={600} color="success.dark">
                                ${frontendCalculatedCost.toFixed(6)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="success.dark">Backend Reported:</Typography>
                              <Typography variant="body2" fontWeight={600} color="success.dark">
                                ${backendReportedCost.toFixed(6)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="success.dark">Difference:</Typography>
                              <Typography variant="body2" fontWeight={600} 
                                        color={Math.abs(frontendCalculatedCost - backendReportedCost) < 0.000001 ? 'success.dark' : 'error.main'}>
                                ${Math.abs(frontendCalculatedCost - backendReportedCost).toFixed(6)}
                              </Typography>
                            </Box>
                          </Stack>
                        );
                      })()}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Raw Session Data (Debug) */}
            <Grid item xs={12}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Info color="secondary" />
                    Raw Session Data (Debug)
                  </Typography>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Session Metrics Raw Data
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify({
                            sessionMetrics: sessionMetrics,
                            messagesWithTokens: messages.filter(msg => msg.langGraphExecution).map(msg => ({
                              id: msg.id,
                              type: msg.type,
                              hasLangGraphExecution: !!msg.langGraphExecution,
                              tokenData: msg.langGraphExecution ? {
                                total_tokens_in: msg.langGraphExecution.total_tokens_in,
                                total_tokens_out: msg.langGraphExecution.total_tokens_out,
                                total_estimated_cost: msg.langGraphExecution.total_estimated_cost,
                                tools_used: msg.langGraphExecution.tools_used
                              } : null
                            })),
                            debugInfo: debugInfo ? {
                              sessionId: debugInfo.sessionId,
                              toolsState: debugInfo.toolsState,
                              sessionState: debugInfo.sessionState
                            } : null
                          }, null, 2)}
                        </Typography>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>

            {/* Tools Usage */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Build color="warning" />
                    Tools Usage & Details
                  </Typography>
                  
                  {toolUsageStats.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No tools available or used in this session
                    </Typography>
                  ) : (
                    <Box>
                      {toolUsageStats.map((tool) => (
                        <Accordion 
                          key={tool.name}
                          expanded={expandedTool === tool.name}
                          onChange={handleToolExpand(tool.name)}
                          sx={{ mb: 1 }}
                        >
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {tool.name}
                              </Typography>
                              <Chip 
                                label={`Used ${tool.count}x`} 
                                size="small" 
                                color={tool.count > 0 ? 'success' : 'default'}
                              />
                              {tool.count > 0 && (
                                <Chip 
                                  label={`${tool.totalTokens} tokens`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                              {tool.count > 0 && (
                                <Chip 
                                  label={`$${tool.totalCost.toFixed(4)}`} 
                                  size="small" 
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Tool Description/Prompt:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                    {tool.prompt || 'No description available'}
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Parameters:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                    {Object.keys(tool.parameters || {}).length > 0 
                                      ? JSON.stringify(tool.parameters, null, 2)
                                      : 'No parameters defined'
                                    }
                                  </Typography>
                                </Paper>
                              </Grid>
                              {tool.count > 0 && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Usage Statistics:
                                  </Typography>
                                  <TableContainer component={Paper} sx={{ bgcolor: 'grey.50' }}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Metric</TableCell>
                                          <TableCell align="right">Value</TableCell>
                                          <TableCell align="right">Average per Use</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        <TableRow>
                                          <TableCell>Invocations</TableCell>
                                          <TableCell align="right">{tool.count}</TableCell>
                                          <TableCell align="right">-</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>Total Tokens</TableCell>
                                          <TableCell align="right">{tool.totalTokens}</TableCell>
                                          <TableCell align="right">{Math.round(tool.totalTokens / tool.count)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>Total Cost</TableCell>
                                          <TableCell align="right">${tool.totalCost.toFixed(4)}</TableCell>
                                          <TableCell align="right">${(tool.totalCost / tool.count).toFixed(4)}</TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Grid>
                              )}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatSessionDebugInfo;
