/**
 * Model pricing configuration for accurate cost calculations
 * Based on Google AI Gemini API pricing as of January 2025
 */

export interface ModelPricing {
  inputTokensPerMillion: number;  // Cost per million input tokens
  outputTokensPerMillion: number; // Cost per million output tokens
  currency: 'USD';
  lastUpdated: string;
  tier: 'free' | 'low' | 'medium' | 'high';
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Gemini 2.5 Flash models
  'gemini-2.5-flash': {
    inputTokensPerMillion: 0.075,  // $0.075 per 1M input tokens
    outputTokensPerMillion: 0.30,  // $0.30 per 1M output tokens
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'low'
  },
  'gemini-2.5-flash-lite': {
    inputTokensPerMillion: 0.0375, // $0.0375 per 1M input tokens (50% of flash)
    outputTokensPerMillion: 0.15,  // $0.15 per 1M output tokens (50% of flash)
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'free'
  },
  
  // Gemini 1.5 Flash models
  'gemini-1.5-flash': {
    inputTokensPerMillion: 0.075,  // $0.075 per 1M input tokens
    outputTokensPerMillion: 0.30,  // $0.30 per 1M output tokens
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'low'
  },
  'gemini-1.5-flash-8b': {
    inputTokensPerMillion: 0.0375, // $0.0375 per 1M input tokens
    outputTokensPerMillion: 0.15,  // $0.15 per 1M output tokens
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'free'
  },
  
  // Gemini Pro models
  'gemini-1.5-pro': {
    inputTokensPerMillion: 1.25,   // $1.25 per 1M input tokens
    outputTokensPerMillion: 5.00,  // $5.00 per 1M output tokens
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'medium'
  },
  'gemini-2.0-flash-thinking': {
    inputTokensPerMillion: 0.075,  // $0.075 per 1M input tokens
    outputTokensPerMillion: 0.30,  // $0.30 per 1M output tokens
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'low'
  },
  
  // Local models (free)
  'local-openai-gpt-oss-20b': {
    inputTokensPerMillion: 0,
    outputTokensPerMillion: 0,
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'free'
  },
  'local-deepseek-deepseek-r1-0528-qwen3-8b': {
    inputTokensPerMillion: 0,
    outputTokensPerMillion: 0,
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'free'
  },
  
  // OpenRouter models (approximate pricing)
  'openai/gpt-4-turbo': {
    inputTokensPerMillion: 10.00,  // $10 per 1M input tokens
    outputTokensPerMillion: 30.00, // $30 per 1M output tokens
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'high'
  },
  'anthropic/claude-3-sonnet': {
    inputTokensPerMillion: 3.00,   // $3 per 1M input tokens
    outputTokensPerMillion: 15.00, // $15 per 1M output tokens
    currency: 'USD',
    lastUpdated: '2025-01-08',
    tier: 'medium'
  }
};

/**
 * Calculate cost for a given model and token usage
 */
export function calculateModelCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) {
    console.warn(`No pricing information found for model: ${modelId}`);
    return 0;
  }
  
  const inputCost = (inputTokens / 1000000) * pricing.inputTokensPerMillion;
  const outputCost = (outputTokens / 1000000) * pricing.outputTokensPerMillion;
  
  return inputCost + outputCost;
}

/**
 * Get model display name from model ID
 */
export function getModelDisplayName(modelId: string): string {
  const displayNames: Record<string, string> = {
    'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'gemini-1.5-flash-8b': 'Gemini 1.5 Flash 8B',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gemini-2.0-flash-thinking': 'Gemini 2.0 Flash (Thinking)',
    'local-openai-gpt-oss-20b': 'GPT-OSS 20B (Local)',
    'local-deepseek-deepseek-r1-0528-qwen3-8b': 'DeepSeek R1 (Local)',
    'openai/gpt-4-turbo': 'GPT-4 Turbo',
    'anthropic/claude-3-sonnet': 'Claude 3 Sonnet'
  };
  
  return displayNames[modelId] || modelId;
}

/**
 * Get all supported Gemini model versions
 */
export function getSupportedGeminiModels(): string[] {
  return Object.keys(MODEL_PRICING).filter(modelId => 
    modelId.startsWith('gemini-')
  );
}

/**
 * Check if a model is free tier
 */
export function isModelFree(modelId: string): boolean {
  const pricing = MODEL_PRICING[modelId];
  return pricing?.tier === 'free' || false;
}
