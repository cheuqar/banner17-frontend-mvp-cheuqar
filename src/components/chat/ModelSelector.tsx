import React, { useState, useEffect, useMemo } from 'react'
import { chatService } from '../../services/chatService'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  ListSubheader,
  Divider
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  AttachMoney as CostIcon,
  Memory as MemoryIcon,
  Cloud as CloudIcon,
  Computer as LocalIcon,
  SmartToy as GeminiIcon,
  Hub as OpenRouterIcon,
  Storage as ServerIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

interface ModelInfo {
  id: string
  display_name: string
  description: string
  provider: string
  max_tokens: number
  supports_streaming: boolean
  cost_tier: string
  available: boolean
}

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
}

const getCostTierColor = (tier: string) => {
  switch (tier) {
    case 'free': return '#4caf50'
    case 'low': return '#2196f3'
    case 'medium': return '#ff9800'
    case 'high': return '#f44336'
    default: return '#757575'
  }
}

const getCostTierIcon = (tier: string) => {
  switch (tier) {
    case 'free': return <SpeedIcon fontSize="small" />
    case 'low': return <CostIcon fontSize="small" />
    case 'medium': return <CostIcon fontSize="small" />
    case 'high': return <CostIcon fontSize="small" />
    default: return <MemoryIcon fontSize="small" />
  }
}

const getProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'gemini': return <GeminiIcon fontSize="small" />
    case 'openrouter': return <OpenRouterIcon fontSize="small" />
    case 'local': return <LocalIcon fontSize="small" />
    case 'ollama': return <ServerIcon fontSize="small" />
    case 'google': return <GeminiIcon fontSize="small" />
    default: return <CloudIcon fontSize="small" />
  }
}

const getProviderDisplayName = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'gemini': return 'Google Gemini'
    case 'openrouter': return 'OpenRouter'
    case 'local': return 'Local Models'
    case 'ollama': return 'Ollama'
    case 'google': return 'Google'
    default: return provider
  }
}

const getProviderOrder = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'gemini': return 1
    case 'openrouter': return 2
    case 'local': return 3
    case 'ollama': return 4
    default: return 5
  }
}

export default function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const { session } = useAuth()

  // Fallback models when API is not available
  const fallbackModels: ModelInfo[] = [
    {
      id: 'gemini-2.5-flash-lite',
      display_name: 'Gemini 2.5 Flash Lite (Pure LangGraph)',
      description: 'Google Gemini 2.5 Flash Lite via Pure LangGraph architecture',
      provider: 'gemini',
      max_tokens: 8192,
      supports_streaming: true,
      cost_tier: 'free',
      available: true
    },
    {
      id: 'local-openai-gpt-oss-20b',
      display_name: 'GPT-OSS 20B (Local)',
      description: 'Local LLM running on localhost:1234',
      provider: 'Local',
      max_tokens: 4096,
      supports_streaming: true,
      cost_tier: 'free',
      available: true
    },
    {
      id: 'local-deepseek-deepseek-r1-0528-qwen3-8b',
      display_name: 'DeepSeek R1 (Local)',
      description: 'Local DeepSeek model',
      provider: 'Local',
      max_tokens: 4096,
      supports_streaming: true,
      cost_tier: 'free',
      available: true
    },
    {
      id: 'gemini-1.5-flash',
      display_name: 'Gemini 1.5 Flash',
      description: 'Fast and efficient Google AI model',
      provider: 'Google',
      max_tokens: 8192,
      supports_streaming: true,
      cost_tier: 'low',
      available: true
    }
  ]

  useEffect(() => {
    fetchAvailableModels()
  }, [session])

  // Also retry when selectedModel prop changes and we don't have models yet
  useEffect(() => {
    if (session?.access_token && models.length === 0 && !loading && !error) {
      console.log('Retrying model fetch after selectedModel change...')
      fetchAvailableModels()
    }
  }, [selectedModel, session?.access_token, models.length, loading, error])

  const fetchAvailableModels = async () => {
    if (!session?.access_token) {
      console.log('No access token available, using fallback models...')
      setModels(fallbackModels)
      setError(null)
      setLoading(false)
      
      // Set default model to first local model if none selected
      if (!selectedModel || selectedModel === '' || selectedModel === 'local-llm') {
        console.log('Setting default model to first local model:', fallbackModels[0].id)
        onModelChange(fallbackModels[0].id)
      }
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching models with auth token...')

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100'
      // Use chatService to get Pure LangGraph models
      console.log('Fetching models from Pure LangGraph system...')
      const data = await chatService.getAvailableModels()
      console.log('Pure LangGraph models:', data)
      setModels(data.models || [])
      
      // Set default model if none selected
      if (!selectedModel || selectedModel === '' || selectedModel === 'local-llm') {
        const defaultModel = data.default_model || data.models[0]?.id
        if (defaultModel) {
          console.log('Setting default Pure LangGraph model:', defaultModel)
          onModelChange(defaultModel)
        }
      }

    } catch (err) {
      console.error('Error fetching models:', err)
      console.log('Using fallback models...')
      setModels(fallbackModels)
      setError(null) // Clear error since we have fallback models
      
      // Set default model to first local model if none selected
      if (!selectedModel || selectedModel === '' || selectedModel === 'local-llm') {
        console.log('Setting default model to first local model:', fallbackModels[0].id)
        onModelChange(fallbackModels[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  // Ensure selectedModel is valid for MUI Select component
  const validSelectedModel = selectedModel === 'local-llm' ? '' : selectedModel
  const selectedModelInfo = models.find(model => model.id === validSelectedModel)
  const availableModels = models.filter(model => model.available)

  // Group models by provider for better UI organization
  const groupedModels = useMemo(() => {
    const groups: Record<string, ModelInfo[]> = {}
    
    availableModels.forEach(model => {
      const provider = model.provider.toLowerCase()
      if (!groups[provider]) {
        groups[provider] = []
      }
      groups[provider].push(model)
    })
    
    // Sort groups by provider order and models within each group
    return Object.keys(groups)
      .sort((a, b) => getProviderOrder(a) - getProviderOrder(b))
      .map(provider => ({
        provider,
        displayName: getProviderDisplayName(provider),
        icon: getProviderIcon(provider),
        models: groups[provider].sort((a, b) => a.display_name.localeCompare(b.display_name))
      }))
  }, [availableModels])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading models...
        </Typography>
      </Box>
    )
  }

  // Show a message when not authenticated
  if (!session?.access_token) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Sign in to select AI models
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button size="small" onClick={fetchAvailableModels} sx={{ ml: 1 }}>
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>AI Model</InputLabel>
          <Select
            value={validSelectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            label="AI Model"
            disabled={disabled || availableModels.length === 0}
          >
            {groupedModels.map((group, groupIndex) => [
              // Provider group header
              <ListSubheader 
                key={`header-${group.provider}`}
                sx={{ 
                  bgcolor: 'background.paper',
                  lineHeight: '36px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  borderTop: groupIndex > 0 ? '1px solid #e0e0e0' : 'none'
                }}
              >
                {group.icon}
                {group.displayName}
                <Chip 
                  size="small" 
                  label={group.models.length}
                  sx={{ 
                    ml: 'auto',
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: 'action.hover',
                    color: 'text.secondary'
                  }}
                />
              </ListSubheader>,
              // Models in this group
              ...group.models.map((model) => (
                <MenuItem key={model.id} value={model.id} sx={{ pl: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {model.display_name}
                    </Typography>
                    <Chip
                      size="small"
                      label={model.cost_tier}
                      sx={{
                        bgcolor: getCostTierColor(model.cost_tier),
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  </Box>
                </MenuItem>
              ))
            ]).flat()}
          </Select>
        </FormControl>

        {selectedModelInfo && (
          <Tooltip title={selectedModelInfo.description}>
            <Chip
              icon={getProviderIcon(selectedModelInfo.provider)}
              label={getProviderDisplayName(selectedModelInfo.provider)}
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: getCostTierColor(selectedModelInfo.cost_tier),
                color: getCostTierColor(selectedModelInfo.cost_tier)
              }}
            />
          </Tooltip>
        )}

        <Tooltip title="Model Details">
          <IconButton
            size="small"
            onClick={() => setShowDetails(true)}
            disabled={models.length === 0}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Model Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Available AI Models
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the AI model that best fits your needs. Each model has different capabilities and costs.
          </Typography>

          <List>
            {groupedModels.map((group) => [
              // Provider group header
              <ListSubheader 
                key={`dialog-header-${group.provider}`}
                sx={{ 
                  bgcolor: 'grey.50',
                  lineHeight: '48px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderRadius: 1,
                  mt: 1,
                  mb: 1
                }}
              >
                {group.icon}
                {group.displayName}
                <Chip 
                  size="small" 
                  label={`${group.models.length} model${group.models.length !== 1 ? 's' : ''}`}
                  sx={{ 
                    ml: 'auto',
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: 'primary.main',
                    color: 'white'
                  }}
                />
              </ListSubheader>,
              // Models in this group
              ...group.models.map((model) => (
              <ListItem
                key={model.id}
                sx={{
                  border: '1px solid',
                  borderColor: model.id === selectedModel ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  mb: 1,
                  ml: 2,
                  mr: 2,
                  bgcolor: model.available ? 'background.paper' : 'action.disabledBackground'
                }}
              >
                <ListItemIcon>
                  {model.available ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {model.display_name}
                      </Typography>

                      <Chip
                        size="small"
                        label={model.cost_tier}
                        sx={{
                          bgcolor: getCostTierColor(model.cost_tier),
                          color: 'white'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {model.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          Max tokens: {model.max_tokens.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Streaming: {model.supports_streaming ? 'Yes' : 'No'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Status: {model.available ? 'Available' : 'Unavailable'}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                {model.available && (
                  <Button
                    variant={model.id === selectedModel ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      onModelChange(model.id)
                      setShowDetails(false)
                    }}
                  >
                    {model.id === selectedModel ? 'Selected' : 'Select'}
                  </Button>
                )}
              </ListItem>
            ))
            ]).flat()}
          </List>

          {availableModels.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No models are currently available. Please check your API configuration or try again later.
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button onClick={fetchAvailableModels} variant="outlined">
            Refresh
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}