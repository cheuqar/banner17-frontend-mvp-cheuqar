import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Paper
} from '@mui/material';
import { Close as CloseIcon, Clear as ClearIcon, BugReport as BugReportIcon } from '@mui/icons-material';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'llm' | 'tool' | 'api' | 'function_call' | 'model' | 'general';
  message: string;
  data?: any;
}

interface PopupDevConsoleProps {
  open: boolean;
  onClose: () => void;
}

const PopupDevConsole: React.FC<PopupDevConsoleProps> = ({ open, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [maxLogs] = useState(100);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-scroll to bottom when new logs arrive
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // WebSocket connection for real-time logs
  useEffect(() => {
    if (!open) return;

    const connectWebSocket = () => {
      try {
        const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8100';
        const wsUrl = `${wsBaseUrl}/ws/developer-logs`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('Dev console WebSocket connected');
          addLog('info', 'general', 'Developer console connected to backend');
        };

        ws.onmessage = (event) => {
          try {
            const logData = JSON.parse(event.data);
            addLogFromBackend(logData);
          } catch (error) {
            console.error('Failed to parse log message:', error);
          }
        };

        ws.onclose = () => {
          console.log('Dev console WebSocket disconnected');
          addLog('warn', 'general', 'Developer console disconnected');
          
          // Attempt to reconnect after 3 seconds if still open
          setTimeout(() => {
            if (open) {
              connectWebSocket();
            }
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          addLog('error', 'general', 'WebSocket connection error');
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        addLog('error', 'general', 'Failed to connect to developer logs');
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [open]);

  const addLog = (level: LogEntry['level'], category: LogEntry['category'], message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      return updatedLogs.slice(-maxLogs);
    });
  };

  const addLogFromBackend = (logData: any) => {
    addLog(
      logData.level || 'info',
      logData.category || 'general',
      logData.message || 'Unknown log message',
      logData.data
    );
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.category === filter || log.level === filter
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return '#f44336';
      case 'warn': return '#ff9800';
      case 'info': return '#2196f3';
      case 'debug': return '#9e9e9e';
      default: return '#424242';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'llm': return '🤖';
      case 'tool': return '🔧';
      case 'function_call': return '📞';
      case 'model': return '🧠';
      case 'api': return '🌐';
      default: return '📝';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugReportIcon color="primary" />
          <Typography variant="h6">Developer Console</Typography>
          <Typography variant="body2" color="text.secondary">
            ({filteredLogs.length} logs)
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Logs</MenuItem>
              <MenuItem value="llm">LLM</MenuItem>
              <MenuItem value="tool">Tools</MenuItem>
              <MenuItem value="function_call">Function Calls</MenuItem>
              <MenuItem value="model">Models</MenuItem>
              <MenuItem value="api">API</MenuItem>
              <MenuItem value="error">Errors Only</MenuItem>
              <MenuItem value="warn">Warnings Only</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton onClick={clearLogs} size="small" title="Clear logs">
            <ClearIcon />
          </IconButton>
          
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#1a1a1a' }}>
        <Box sx={{ 
          height: '100%', 
          overflow: 'auto',
          fontFamily: 'Consolas, "Courier New", monospace'
        }}>
          {filteredLogs.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '200px',
              color: '#888'
            }}>
              <Typography>No logs to display. Logs will appear here in real-time.</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1 }}>
              {filteredLogs.map((log) => (
                <Paper
                  key={log.id}
                  elevation={0}
                  sx={{
                    mb: 0.5,
                    p: 1.5,
                    backgroundColor: log.level === 'error' ? '#2d1b1b' :
                                   log.level === 'warn' ? '#2d2419' :
                                   log.level === 'info' ? '#1b2332' :
                                   '#1e1e1e',
                    borderLeft: `3px solid ${getLevelColor(log.level)}`,
                    '&:hover': {
                      backgroundColor: log.level === 'error' ? '#3d2b2b' :
                                     log.level === 'warn' ? '#3d3429' :
                                     log.level === 'info' ? '#2b3342' :
                                     '#2e2e2e',
                    }
                  }}
                >
                  {/* Log header */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 0.5,
                    flexWrap: 'wrap'
                  }}>
                    <Typography variant="caption" sx={{ color: '#fff' }}>
                      {getCategoryIcon(log.category)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: getLevelColor(log.level),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {log.level}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#aaa' }}>
                      {log.category}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  
                  {/* Log message */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#e0e0e0',
                      fontFamily: 'inherit',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {log.message}
                  </Typography>
                  
                  {/* Log data (expandable) */}
                  {log.data && (
                    <details style={{ marginTop: '8px' }}>
                      <summary style={{ 
                        color: '#aaa', 
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        📋 Show Data
                      </summary>
                      <Box
                        component="pre"
                        sx={{
                          mt: 1,
                          p: 1,
                          backgroundColor: '#0d1117',
                          color: '#f0f6fc',
                          fontSize: '11px',
                          overflow: 'auto',
                          maxHeight: '150px',
                          border: '1px solid #30363d',
                          borderRadius: 1
                        }}
                      >
                        {JSON.stringify(log.data, null, 2)}
                      </Box>
                    </details>
                  )}
                </Paper>
              ))}
              <div ref={logsEndRef} />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        borderTop: '1px solid #e0e0e0'
      }}>
        <Typography variant="body2" color="text.secondary">
          WebSocket: {wsRef.current?.readyState === WebSocket.OPEN ? '🟢 Connected' : '🔴 Disconnected'}
        </Typography>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupDevConsole;
