import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon,
  Code as CodeIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import type { PropertySearchRequest, PropertySearchResponse } from '../types';

interface DebugPanelProps {
  lastSearchRequest?: PropertySearchRequest;
  lastSearchResponse?: PropertySearchResponse;
  apiStatus?: 'idle' | 'testing' | 'success' | 'error';
  error?: string | null;
  onTestConnection?: () => void;
  onRunSampleSearch?: () => void;
}

/**
 * Debug Panel Component
 * Development and debugging tools for the property listing page
 */
const DebugPanel: React.FC<DebugPanelProps> = ({
  lastSearchRequest,
  lastSearchResponse,
  apiStatus = 'idle',
  error,
  onTestConnection,
  onRunSampleSearch
}) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Paper
        elevation={1}
        sx={{
          border: '2px dashed #e0e0e0',
          backgroundColor: '#fafafa',
          borderRadius: 2
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <BugIcon color="action" />
          <Typography variant="h6" color="text.secondary" sx={{ flex: 1 }}>
            🔧 Development Debug Panel
          </Typography>
          <Chip
            label="DEV ONLY"
            size="small"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* API Status Testing */}
        <Accordion
          expanded={expanded === 'api'}
          onChange={handleChange('api')}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ApiIcon color="action" />
              <Typography variant="subtitle1" fontWeight={500}>
                API Connection Test
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {apiStatus === 'testing' && <CircularProgress size={16} />}
                {apiStatus === 'success' && (
                  <Chip label="✅ Connected" size="small" color="success" />
                )}
                {apiStatus === 'error' && (
                  <Chip label="❌ Error" size="small" color="error" />
                )}
                {apiStatus === 'idle' && (
                  <Chip label="⏳ Ready" size="small" color="default" />
                )}
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onTestConnection}
                  disabled={apiStatus === 'testing'}
                  startIcon={<RefreshIcon />}
                >
                  Test Connection
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={onRunSampleSearch}
                  disabled={apiStatus === 'testing' || apiStatus === 'error'}
                  startIcon={<ApiIcon />}
                >
                  Run Sample Search
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>API Error:</strong> {error}
                  </Typography>
                </Alert>
              )}

              {lastSearchResponse && (
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Last Search:</strong> Found {lastSearchResponse.total_count} properties
                    (returned {lastSearchResponse.returned_count}) in {lastSearchResponse.execution_time_seconds}s
                  </Typography>
                </Alert>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Search Request Debug */}
        <Accordion
          expanded={expanded === 'request'}
          onChange={handleChange('request')}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CodeIcon color="action" />
              <Typography variant="subtitle1" fontWeight={500}>
                Last Search Request
              </Typography>
              {lastSearchRequest && (
                <Chip label="Available" size="small" color="info" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {lastSearchRequest ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Search parameters sent to Grace API:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    maxHeight: 300
                  }}
                >
                  <pre>{formatJson(lastSearchRequest)}</pre>
                </Paper>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No search request data available. Run a search to see the request parameters.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Search Response Debug */}
        <Accordion
          expanded={expanded === 'response'}
          onChange={handleChange('response')}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StorageIcon color="action" />
              <Typography variant="subtitle1" fontWeight={500}>
                Last Search Response
              </Typography>
              {lastSearchResponse && (
                <Chip
                  label={`${lastSearchResponse.properties?.length || 0} properties`}
                  size="small"
                  color="info"
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {lastSearchResponse ? (
              <Box>
                {/* Response Summary */}
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Metric</strong></TableCell>
                        <TableCell><strong>Value</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Count</TableCell>
                        <TableCell>{lastSearchResponse.total_count?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Returned Count</TableCell>
                        <TableCell>{lastSearchResponse.returned_count}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Execution Time</TableCell>
                        <TableCell>{lastSearchResponse.execution_time_seconds}s</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Has More</TableCell>
                        <TableCell>{lastSearchResponse.has_more ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Limit</TableCell>
                        <TableCell>{lastSearchResponse.limit}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Offset</TableCell>
                        <TableCell>{lastSearchResponse.offset}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                {/* Full Response */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Full API response (properties truncated for readability):
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: 400
                  }}
                >
                  <pre>
                    {formatJson({
                      ...lastSearchResponse,
                      properties: lastSearchResponse.properties?.slice(0, 2).map(p => ({
                        ...p,
                        images: p.images ? `[${p.images.length} images]` : null
                      }))
                    })}
                  </pre>
                </Paper>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No search response data available. Run a search to see the API response.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Development Status */}
        <Box sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            🚧 Development Phase Status
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            ✅ Phase 1.1-1.4: Basic functionality complete<br/>
            🔄 Phase 2: Enhanced search with autocomplete, pagination, and modern UI<br/>
            📋 Next: Advanced filters, map view, saved searches
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DebugPanel;