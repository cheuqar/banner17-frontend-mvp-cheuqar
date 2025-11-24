import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toolService } from '../services/toolService';
import type { ToolConfig } from '../components/tools/ToolControlPanel';

export interface UseToolsReturn {
  tools: ToolConfig[];
  loading: boolean;
  error: string | null;
  enabledCount: number;
  totalUsage: number;
  toggleTool: (toolName: string, enabled: boolean) => Promise<boolean>;
  refreshTools: () => Promise<void>;
  getToolByName: (toolName: string) => ToolConfig | undefined;
  incrementUsage: (toolName: string) => void;
}

export const useTools = (): UseToolsReturn => {
  const { isAuthenticated, user } = useAuth();
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionUsage, setSessionUsage] = useState<Map<string, number>>(new Map());

  const refreshTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedTools = await toolService.getTools();
      
      // Merge with session usage
      const toolsWithSessionUsage = fetchedTools.map(tool => ({
        ...tool,
        usageCount: (tool.usageCount || 0) + (sessionUsage.get(tool.name) || 0)
      }));
      
      setTools(toolsWithSessionUsage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tools';
      setError(errorMessage);
      console.error('Error loading tools:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionUsage]);

  const toggleTool = useCallback(async (toolName: string, enabled: boolean): Promise<boolean> => {
    try {
      setError(null);
      
      // Optimistically update the UI
      setTools(prevTools => 
        prevTools.map(tool => 
          tool.name === toolName ? { ...tool, enabled } : tool
        )
      );

      const success = await toolService.updateToolSetting(toolName, enabled);
      
      if (!success) {
        // Revert the optimistic update
        setTools(prevTools => 
          prevTools.map(tool => 
            tool.name === toolName ? { ...tool, enabled: !enabled } : tool
          )
        );
        setError('Failed to update tool setting');
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tool';
      setError(errorMessage);
      console.error('Error toggling tool:', err);
      
      // Revert the optimistic update
      setTools(prevTools => 
        prevTools.map(tool => 
          tool.name === toolName ? { ...tool, enabled: !enabled } : tool
        )
      );
      
      return false;
    }
  }, []);

  const incrementUsage = useCallback((toolName: string) => {
    setSessionUsage(prev => {
      const newUsage = new Map(prev);
      const currentCount = newUsage.get(toolName) || 0;
      newUsage.set(toolName, currentCount + 1);
      return newUsage;
    });

    // Update tools with new usage count
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.name === toolName 
          ? { ...tool, usageCount: (tool.usageCount || 0) + 1 }
          : tool
      )
    );
  }, []);

  const getToolByName = useCallback((toolName: string): ToolConfig | undefined => {
    return tools.find(tool => tool.name === toolName);
  }, [tools]);

  // Load tools when component mounts or user changes
  useEffect(() => {
    refreshTools();
  }, [isAuthenticated, user?.id, refreshTools]);

  // Calculate derived values
  const enabledCount = tools.filter(tool => tool.enabled).length;
  const totalUsage = tools.reduce((sum, tool) => sum + (tool.usageCount || 0), 0);

  return {
    tools,
    loading,
    error,
    enabledCount,
    totalUsage,
    toggleTool,
    refreshTools,
    getToolByName,
    incrementUsage
  };
};