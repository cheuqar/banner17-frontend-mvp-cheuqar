import { supabase } from '../lib/supabase';
import type { ToolConfig } from '../components/tools/ToolControlPanel';

export interface ToolUsageStats {
  toolName: string;
  usageCount: number;
  lastUsed: Date | null;
  totalCost: number;
  avgExecutionTime: number;
}

export interface ToolPreference {
  userId: string;
  toolName: string;
  enabled: boolean;
  customSettings?: Record<string, any>;
  updatedAt: Date;
}

class ToolService {
  private static instance: ToolService;
  private toolConfigs: Map<string, ToolConfig> = new Map();
  private usageStats: Map<string, ToolUsageStats> = new Map();

  static getInstance(): ToolService {
    if (!ToolService.instance) {
      ToolService.instance = new ToolService();
    }
    return ToolService.instance;
  }

  /**
   * Initialize default tool configurations
   */
  private initializeDefaultTools(): ToolConfig[] {
    return [
      {
        name: 'web_search',
        displayName: 'Web Search',
        description: 'Search the web for current information, news, and real-time data',
        icon: null as any, // Will be set by component
        enabled: true,
        category: 'search',
        features: ['Real-time information', 'News & trends', 'Market data', 'Free to use'],
        status: 'active',
        usageCount: 0
      },
      {
        name: 'geocoding',
        displayName: 'Location Intelligence',
        description: 'Convert addresses to coordinates and provide location insights',
        icon: null as any, // Will be set by component
        enabled: true,
        category: 'location',
        features: ['Address lookup', 'Coordinate conversion', 'Suburb data', 'Property context'],
        status: 'active',
        usageCount: 0
      },
      {
        name: 'property_analysis',
        displayName: 'Property Analysis',
        description: 'Analyze property data using internal market information',
        icon: null as any, // Will be set by component
        enabled: true,
        category: 'analysis',
        features: ['Market trends', 'Price analysis', 'Comparable sales', 'Investment insights'],
        status: 'active',
        usageCount: 0
      }
    ];
  }

  /**
   * Get all available tools with current settings
   */
  async getTools(): Promise<ToolConfig[]> {
    // For now, return default tools without database integration
    // This avoids Supabase table access errors during development
    return this.initializeDefaultTools();
  }

  /**
   * Update tool enabled/disabled state
   */
  async updateToolSetting(toolName: string, enabled: boolean): Promise<boolean> {
    try {
      // Update local cache only for now (avoid database calls)
      const currentTools = await this.getTools();
      const updatedTools = currentTools.map(tool => 
        tool.name === toolName ? { ...tool, enabled } : tool
      );
      
      // Store in local cache
      updatedTools.forEach(tool => {
        this.toolConfigs.set(tool.name, tool);
      });

      return true;

    } catch (error) {
      console.error('Error updating tool setting:', error);
      return false;
    }
  }

  /**
   * Get usage statistics for tools
   */
  private async getUsageStats(userId: string): Promise<Map<string, ToolUsageStats>> {
    try {
      // Get usage stats from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs, error } = await supabase
        .from('tool_usage_logs')
        .select('tool_name, created_at, execution_time_ms, estimated_cost')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        // Don't log table not found errors as they're expected during development
        if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
          console.warn('Failed to fetch usage stats:', error);
        }
        return new Map();
      }

      // Process logs into stats
      const statsMap = new Map<string, ToolUsageStats>();
      
      logs?.forEach(log => {
        const existing = statsMap.get(log.tool_name);
        
        if (existing) {
          existing.usageCount++;
          existing.totalCost += log.estimated_cost || 0;
          existing.avgExecutionTime = (existing.avgExecutionTime + (log.execution_time_ms || 0)) / 2;
          if (!existing.lastUsed || new Date(log.created_at) > existing.lastUsed) {
            existing.lastUsed = new Date(log.created_at);
          }
        } else {
          statsMap.set(log.tool_name, {
            toolName: log.tool_name,
            usageCount: 1,
            lastUsed: new Date(log.created_at),
            totalCost: log.estimated_cost || 0,
            avgExecutionTime: log.execution_time_ms || 0
          });
        }
      });

      return statsMap;

    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return new Map();
    }
  }

  /**
   * Determine tool status based on usage and system state
   */
  private determineToolStatus(toolName: string, stats?: ToolUsageStats): ToolConfig['status'] {
    // For now, assume all tools are active
    // In a real implementation, you might check:
    // - API quotas and limits
    // - System health
    // - User subscription status
    // - Tool-specific issues
    
    return 'active';
  }

  /**
   * Get real-time tool usage for current session
   */
  getSessionUsage(): Map<string, number> {
    // This would track usage during the current session
    // For now, return empty map
    return new Map();
  }

  /**
   * Reset session usage counters
   */
  resetSessionUsage(): void {
    // Implementation for resetting session counters
  }

  /**
   * Increment session usage for a tool
   */
  incrementSessionUsage(toolName: string): void {
    const sessionStats = this.getSessionUsage();
    const currentCount = sessionStats.get(toolName) || 0;
    sessionStats.set(toolName, currentCount + 1);
  }

  /**
   * Check if a tool is available and enabled for the current user
   */
  async isToolEnabled(toolName: string): Promise<boolean> {
    const tools = await this.getTools();
    const tool = tools.find(t => t.name === toolName);
    return (tool?.enabled ?? false) && tool?.status === 'active';
  }

  /**
   * Get tool configuration for a specific tool
   */
  async getToolConfig(toolName: string): Promise<ToolConfig | null> {
    const tools = await this.getTools();
    return tools.find(t => t.name === toolName) || null;
  }
}

// Export singleton instance
export const toolService = ToolService.getInstance();
export default toolService;