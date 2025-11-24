import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'llm' | 'tool' | 'api' | 'function_call' | 'model' | 'general';
  message: string;
  data?: any;
}

interface FloatingDevConsoleProps {
  isEnabled: boolean;
}

const FloatingDevConsole: React.FC<FloatingDevConsoleProps> = ({ isEnabled }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [maxLogs] = useState(50); // Keep fewer logs for performance
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
          console.log('Dev console WebSocket connected');
          addLog('info', 'general', 'Dev console connected');
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
          addLog('warn', 'general', 'Dev console disconnected');
          
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
        addLog('error', 'general', 'Failed to connect to dev logs');
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
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-gray-400';
      default: return 'text-gray-300';
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
    <>
      {/* Floating Button */}
      <div 
        className="fixed bottom-4 right-4 z-[9999] bg-gray-800 hover:bg-gray-700 text-white rounded-full p-3 cursor-pointer shadow-lg transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Developer Console"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm">🔧</span>
          {logs.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {logs.length}
            </span>
          )}
        </div>
      </div>

      {/* Floating Console Panel */}
      {isExpanded && (
        <div 
          className="fixed bottom-20 right-4 z-[9998] bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700"
          style={{ 
            width: '400px', 
            height: '350px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">🔧 Dev Console</span>
              <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
                {filteredLogs.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Filter dropdown */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-1 py-1 min-w-[60px]"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="all">All</option>
                <option value="llm">LLM</option>
                <option value="tool">Tools</option>
                <option value="function_call">Calls</option>
                <option value="error">Errors</option>
              </select>
              
              {/* Clear button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearLogs();
                }}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                title="Clear logs"
              >
                Clear
              </button>
              
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Console content */}
          <div 
            className="overflow-y-auto bg-gray-900"
            style={{ height: 'calc(100% - 45px)' }}
          >
            <div className="p-2 space-y-1">
              {filteredLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-8 text-sm">
                  No logs to display.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-2 rounded text-xs border-l-2 ${
                      log.level === 'error' ? 'border-red-500 bg-red-900 bg-opacity-20' :
                      log.level === 'warn' ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' :
                      log.level === 'info' ? 'border-blue-500 bg-blue-900 bg-opacity-20' :
                      'border-gray-500 bg-gray-800 bg-opacity-50'
                    }`}
                  >
                    {/* Log header */}
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <span className="text-xs">{getCategoryIcon(log.category)}</span>
                      <span className={`text-xs font-bold ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">{log.category}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {/* Log message */}
                    <div className="text-xs text-gray-200 break-words">
                      {log.message}
                    </div>
                    
                    {/* Log data (expandable) */}
                    {log.data && (
                      <details className="text-xs text-gray-400 mt-1">
                        <summary className="cursor-pointer hover:text-gray-300 select-none">
                          📋 Data
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-800 rounded overflow-x-auto text-xs max-h-16 whitespace-pre-wrap">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingDevConsole;
