export interface AIProvider {
  id: string
  name: string
  apiKeyName: string
  models: string[]
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    apiKeyName: 'OPENAI_API_KEY',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4-vision-preview']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    apiKeyName: 'ANTHROPIC_API_KEY',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
  },
  {
    id: 'google',
    name: 'Google',
    apiKeyName: 'GOOGLE_API_KEY',
    models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro']
  },
  {
    id: 'mistral',
    name: 'Mistral',
    apiKeyName: 'MISTRAL_API_KEY',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'open-mistral-7b', 'open-mixtral-8x7b']
  },
  {
    id: 'cohere',
    name: 'Cohere',
    apiKeyName: 'COHERE_API_KEY',
    models: ['command-r-plus', 'command-r', 'command', 'command-light']
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    apiKeyName: 'PERPLEXITY_API_KEY',
    models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-chat', 'llama-3.1-sonar-small-128k-chat']
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    apiKeyName: 'HUGGINGFACE_API_KEY',
    models: ['meta-llama/Meta-Llama-3-8B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.2', 'google/flan-t5-xxl']
  },
  {
    id: 'groq',
    name: 'Groq',
    apiKeyName: 'GROQ_API_KEY',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it']
  },
  {
    id: 'together',
    name: 'Together AI',
    apiKeyName: 'TOGETHER_API_KEY',
    models: ['meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1']
  },
  {
    id: 'replicate',
    name: 'Replicate',
    apiKeyName: 'REPLICATE_API_KEY',
    models: ['meta/meta-llama-3-70b-instruct', 'mistralai/mistral-7b-instruct-v0.2', 'stability-ai/sdxl']
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    apiKeyName: 'ELEVENLABS_API_KEY',
    models: ['eleven_multilingual_v2', 'eleven_turbo_v2', 'eleven_monolingual_v1']
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    apiKeyName: 'OLLAMA_BASE_URL',
    models: ['llama3.2', 'llama3.1', 'mistral', 'phi3', 'gemma2', 'qwen2.5']
  }
]

export const NODE_PROVIDER_MAP: Record<string, string[]> = {
  'openai': ['openai', 'dalle', 'gpt4Vision', 'whisper'],
  'anthropic': ['anthropicClaude', 'claudeVision'],
  'google': ['googleGemini'],
  'mistral': ['mistral'],
  'cohere': ['cohere'],
  'perplexity': ['perplexity'],
  'huggingface': ['huggingface'],
  'ollama': ['ollama'],
  'groq': ['groq'],
  'together': ['togetherAI'],
  'replicate': ['replicate', 'stableDiffusion', 'midjourney'],
  'elevenlabs': ['elevenlabs'],
  'moa': ['moa']
}

export function getProviderForNodeType(nodeType: string): string | null {
  for (const [providerId, nodeTypes] of Object.entries(NODE_PROVIDER_MAP)) {
    if (nodeTypes.includes(nodeType)) {
      return providerId
    }
  }
  return null
}

export function getProviderConfig(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === providerId)
}

export function getEnvFallback(apiKeyName: string): string {
  // Vite injects these at build time, so we must map them explicitly
  const envMap: Record<string, string | undefined> = {
    'OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY,
    'ANTHROPIC_API_KEY': import.meta.env.VITE_ANTHROPIC_API_KEY,
    'GOOGLE_API_KEY': import.meta.env.VITE_GOOGLE_API_KEY,
    'MISTRAL_API_KEY': import.meta.env.VITE_MISTRAL_API_KEY,
    'COHERE_API_KEY': import.meta.env.VITE_COHERE_API_KEY,
    'PERPLEXITY_API_KEY': import.meta.env.VITE_PERPLEXITY_API_KEY,
    'HUGGINGFACE_API_KEY': import.meta.env.VITE_HUGGINGFACE_API_KEY,
    'GROQ_API_KEY': import.meta.env.VITE_GROQ_API_KEY,
    'TOGETHER_API_KEY': import.meta.env.VITE_TOGETHER_API_KEY,
    'REPLICATE_API_KEY': import.meta.env.VITE_REPLICATE_API_KEY,
    'ELEVENLABS_API_KEY': import.meta.env.VITE_ELEVENLABS_API_KEY,
  }
  return envMap[apiKeyName] || ''
}
