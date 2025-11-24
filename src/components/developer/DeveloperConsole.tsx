import React, { useState, useEffect, useRef } from 'react';
import { ChevronUpIcon, ChevronDownIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'llm' | 'tool' | 'api' | 'function_call' | 'model' | 'general';
  message: string;
  data?: any;
}

interface DeveloperConsoleProps {
  isEnabled: boolean;
}

const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ isEnabled }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [maxLogs] = useState(100); // Keep only last 100 logs
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
    if (!isEnabled) return;

    const connectWebSocket = () => {
      try {
        const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8100';
        const wsUrl = `${wsBaseUrl}/ws/developer-logs`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('Developer console WebSocket connected');
          addLog('info', 'general', 'Developer console connected to backend logs');
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
          console.log('Developer console WebSocket disconnected');
          addLog('warn', 'general', 'Developer console disconnected from backend logs');
          
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (isEnabled) {
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
  }, [isEnabled]);

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
      // Keep only the last maxLogs entries
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
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-800 bg-gray-50';
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

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-lg" style={{ maxHeight: isExpanded ? '360px' : '40px' }}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">🔧 Developer Console</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
            {filteredLogs.length} logs
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isExpanded && (
            <>
              {/* Filter dropdown */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="all">All</option>
                <option value="llm">LLM</option>
                <option value="tool">Tools</option>
                <option value="function_call">Function Calls</option>
                <option value="model">Models</option>
                <option value="api">API</option>
                <option value="error">Errors</option>
                <option value="warn">Warnings</option>
              </select>
              
              {/* Clear button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearLogs();
                }}
                className="p-1 hover:bg-gray-700 rounded"
                title="Clear logs"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
          
          {/* Expand/collapse button */}
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronUpIcon className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Console content */}
      {isExpanded && (
        <div className="h-80 overflow-y-auto bg-gray-900 text-gray-100 font-mono text-xs">
          <div className="p-2">
            {filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No logs to display. Logs will appear here when DEBUG=true is enabled.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`mb-1 p-2 rounded border-l-2 ${
                    log.level === 'error' ? 'border-red-500 bg-red-900/20' :
                    log.level === 'warn' ? 'border-yellow-500 bg-yellow-900/20' :
                    log.level === 'info' ? 'border-blue-500 bg-blue-900/20' :
                    'border-gray-500 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs">
                          {getCategoryIcon(log.category)}
                        </span>
                        <span className={`text-xs px-1 rounded ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {log.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-200 mb-1">
                        {log.message}
                      </div>
                      
                      {log.data && (
                        <details className="text-xs text-gray-400">
                          <summary className="cursor-pointer hover:text-gray-300">
                            Show data
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-800 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperConsole;
