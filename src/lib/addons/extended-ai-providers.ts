import { Addon } from '@/lib/addons'

/**
 * Extended AI Provider Support
 * Supports 15+ AI providers including OpenRouter, EdenAI, Together.ai, and more
 */

interface ProviderConfig {
  baseUrl: string
  authHeader: string
  models?: string[]
  features?: string[]
}

const EXTENDED_PROVIDERS: Record<string, ProviderConfig> = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    authHeader: 'Authorization',
    models: ['auto', 'gpt-4', 'claude-3-opus', 'llama-3-70b', 'mixtral-8x7b'],
    features: ['auto-routing', 'cost-optimization', '100+ models'],
  },
  edenai: {
    baseUrl: 'https://api.edenai.run/v2',
    authHeader: 'authorization',
    models: ['text', 'image', 'audio', 'ocr'],
    features: ['multi-provider', 'fallback', 'load-balancing'],
  },
  together: {
    baseUrl: 'https://api.together.xyz/v1',
    authHeader: 'Authorization',
    models: ['llama-3-70b', 'mixtral-8x7b', 'qwen-72b', 'deepseek-coder'],
    features: ['open-source', 'fast-inference', 'dedicated-gpu'],
  },
  replicate: {
    baseUrl: 'https://api.replicate.com/v1',
    authHeader: 'Authorization',
    models: ['sdxl', 'stable-video', 'whisper', 'llama-2'],
    features: ['ml-models', 'pay-per-use', 'image-generation'],
  },
  perplexity: {
    baseUrl: 'https://api.perplexity.ai',
    authHeader: 'Authorization',
    models: ['sonar-small', 'sonar-medium', 'sonar-large'],
    features: ['search-augmented', 'citations', 'real-time-web'],
  },
  anyscale: {
    baseUrl: 'https://api.endpoints.anyscale.com/v1',
    authHeader: 'Authorization',
    models: ['llama-2-70b', 'mistral-7b', 'codellama-34b'],
    features: ['ray-powered', 'serverless', 'scaling'],
  },
  fireworks: {
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    authHeader: 'Authorization',
    models: ['llama-v3-70b', 'mixtral-8x22b', 'qwen-72b'],
    features: ['sub-second-latency', 'function-calling', 'code-generation'],
  },
  baseten: {
    baseUrl: 'https://app.baseten.co/models',
    authHeader: 'Authorization',
    models: ['custom-models'],
    features: ['custom-hosting', 'autoscaling', 'ml-deployment'],
  },
  octoai: {
    baseUrl: 'https://text.octoai.run/v1',
    authHeader: 'Authorization',
    models: ['llama-2-70b', 'mixtral-8x7b'],
    features: ['gpu-acceleration', 'optimized-inference', 'image-generation'],
  },
  lepton: {
    baseUrl: 'https://api.lepton.ai/v1',
    authHeader: 'Authorization',
    models: ['llama-3', 'mixtral'],
    features: ['serverless', 'zero-config', 'auto-optimization'],
  },
  // Existing providers from PR #3
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    authHeader: 'Authorization',
    models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
    features: ['chat', 'completions', 'embeddings'],
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    authHeader: 'x-api-key',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    features: ['chat', 'long-context', '200k-tokens'],
  },
  google: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    authHeader: 'x-goog-api-key',
    models: ['gemini-pro', 'gemini-pro-vision'],
    features: ['multimodal', 'long-context', 'grounding'],
  },
  cohere: {
    baseUrl: 'https://api.cohere.ai/v1',
    authHeader: 'Authorization',
    models: ['command', 'command-light', 'embed-multilingual'],
    features: ['chat', 'embeddings', 'rerank'],
  },
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co/models',
    authHeader: 'Authorization',
    models: ['custom'],
    features: ['1000+ models', 'inference-api', 'open-source'],
  },
}

async function makeProviderRequest(
  provider: string,
  apiKey: string,
  prompt: string,
  config: any
): Promise<any> {
  const providerConfig = EXTENDED_PROVIDERS[provider]
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (providerConfig.authHeader === 'Authorization') {
    headers['Authorization'] = `Bearer ${apiKey}`
  } else {
    headers[providerConfig.authHeader] = apiKey
  }

  const requestBody: any = {
    prompt: prompt,
    model: config.model || 'auto',
    temperature: config.temperature || 0.7,
    max_tokens: config.maxTokens || 1000,
  }

  if (config.systemPrompt) {
    requestBody.system = config.systemPrompt
  }

  try {
    const response = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Provider request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      response: data.choices?.[0]?.message?.content || data.text || 'No response',
      metadata: {
        provider: provider,
        model: data.model || config.model,
        usage: data.usage,
        cost: calculateCost(provider, data.usage),
        latency: Date.now(),
      },
    }
  } catch (error) {
    throw new Error(`Provider ${provider} error: ${error}`)
  }
}

function calculateCost(provider: string, usage: any): number {
  // Simplified cost calculation
  if (!usage) return 0
  const inputCost = (usage.prompt_tokens || 0) * 0.00001
  const outputCost = (usage.completion_tokens || 0) * 0.00003
  return inputCost + outputCost
}

export const extendedAIProvidersAddon: Addon = {
  metadata: {
    id: 'extended-ai-providers',
    name: 'Extended AI Providers',
    version: '1.0.0',
    author: 'Node\'y Team',
    description: 'Support for 15+ AI providers including OpenRouter, EdenAI, Together.ai, and more',
    category: 'framework',
    enabled: true,
  },
  nodes: [
    // AI Provider Request Node
    {
      type: 'ai-provider-request',
      label: 'AI Provider Request',
      category: 'AI',
      inputs: [
        {
          id: 'prompt',
          label: 'Prompt',
          type: 'text',
          required: true,
        },
        {
          id: 'provider',
          label: 'Provider',
          type: 'text',
          required: false,
        },
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'response',
          label: 'Response',
          type: 'text',
        },
        {
          id: 'metadata',
          label: 'Metadata',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'provider',
          label: 'Provider',
          type: 'select',
          options: Object.keys(EXTENDED_PROVIDERS).map(key => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: key,
          })),
          defaultValue: 'openrouter',
          required: true,
        },
        {
          id: 'model',
          label: 'Model',
          type: 'text',
          defaultValue: 'auto',
        },
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: true,
        },
        {
          id: 'temperature',
          label: 'Temperature',
          type: 'number',
          defaultValue: 0.7,
        },
        {
          id: 'maxTokens',
          label: 'Max Tokens',
          type: 'number',
          defaultValue: 1000,
        },
        {
          id: 'systemPrompt',
          label: 'System Prompt',
          type: 'text',
          defaultValue: '',
        },
      ],
      execute: async (inputs, config) => {
        const prompt = inputs.prompt || ''
        const provider = inputs.provider || config.provider || 'openrouter'
        const apiKey = inputs.apiKey || config.apiKey

        if (!apiKey) {
          throw new Error('API key is required')
        }

        const result = await makeProviderRequest(provider, apiKey, prompt, config)
        return {
          response: result.response,
          metadata: result.metadata,
        }
      },
    },

    // Multi-Provider Fallback Node
    {
      type: 'ai-multi-provider-fallback',
      label: 'Multi-Provider Fallback',
      category: 'AI',
      inputs: [
        {
          id: 'prompt',
          label: 'Prompt',
          type: 'text',
          required: true,
        },
        {
          id: 'providers',
          label: 'Provider List',
          type: 'array',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'response',
          label: 'Response',
          type: 'text',
        },
        {
          id: 'usedProvider',
          label: 'Used Provider',
          type: 'text',
        },
        {
          id: 'allAttempts',
          label: 'All Attempts',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'providers',
          label: 'Provider Priority (comma-separated)',
          type: 'text',
          defaultValue: 'openrouter,together,openai',
        },
        {
          id: 'apiKeys',
          label: 'API Keys (JSON)',
          type: 'text',
          defaultValue: '{}',
        },
        {
          id: 'timeout',
          label: 'Timeout per Provider (ms)',
          type: 'number',
          defaultValue: 30000,
        },
        {
          id: 'retryCount',
          label: 'Retry Count',
          type: 'number',
          defaultValue: 2,
        },
      ],
      execute: async (inputs, config) => {
        const prompt = inputs.prompt || ''
        const providersInput = inputs.providers || config.providers.split(',').map((p: string) => p.trim())
        const apiKeys = JSON.parse(config.apiKeys || '{}')
        const attempts: any[] = []

        for (const provider of providersInput) {
          const apiKey = apiKeys[provider]
          if (!apiKey) {
            attempts.push({ provider, status: 'skipped', reason: 'No API key' })
            continue
          }

          try {
            const startTime = Date.now()
            const result = await makeProviderRequest(provider, apiKey, prompt, config)
            const latency = Date.now() - startTime

            attempts.push({ provider, status: 'success', latency, cost: result.metadata.cost })
            return {
              response: result.response,
              usedProvider: provider,
              allAttempts: attempts,
            }
          } catch (error) {
            attempts.push({ provider, status: 'failed', error: String(error) })
          }
        }

        throw new Error('All providers failed')
      },
    },

    // Provider Comparison Node
    {
      type: 'ai-provider-compare',
      label: 'Provider Comparison',
      category: 'AI',
      inputs: [
        {
          id: 'prompt',
          label: 'Prompt',
          type: 'text',
          required: true,
        },
        {
          id: 'providers',
          label: 'Providers to Compare',
          type: 'array',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'responses',
          label: 'All Responses',
          type: 'array',
        },
        {
          id: 'comparison',
          label: 'Comparison',
          type: 'object',
        },
        {
          id: 'winner',
          label: 'Best Response',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'providers',
          label: 'Providers (comma-separated)',
          type: 'text',
          defaultValue: 'openrouter,openai,anthropic',
        },
        {
          id: 'apiKeys',
          label: 'API Keys (JSON)',
          type: 'text',
          defaultValue: '{}',
        },
        {
          id: 'criteria',
          label: 'Comparison Criteria',
          type: 'select',
          options: [
            { label: 'Speed', value: 'speed' },
            { label: 'Cost', value: 'cost' },
            { label: 'Quality', value: 'quality' },
          ],
          defaultValue: 'speed',
        },
      ],
      execute: async (inputs, config) => {
        const prompt = inputs.prompt || ''
        const providersInput = inputs.providers || config.providers.split(',').map((p: string) => p.trim())
        const apiKeys = JSON.parse(config.apiKeys || '{}')
        const responses: any[] = []

        for (const provider of providersInput) {
          const apiKey = apiKeys[provider]
          if (!apiKey) continue

          try {
            const startTime = Date.now()
            const result = await makeProviderRequest(provider, apiKey, prompt, config)
            const latency = Date.now() - startTime

            responses.push({
              provider,
              response: result.response,
              metadata: { ...result.metadata, latency },
            })
          } catch (error) {
            responses.push({
              provider,
              error: String(error),
            })
          }
        }

        // Determine winner based on criteria
        let winner = responses[0]
        if (config.criteria === 'speed') {
          winner = responses.reduce((best, current) =>
            (current.metadata?.latency || Infinity) < (best.metadata?.latency || Infinity) ? current : best
          )
        } else if (config.criteria === 'cost') {
          winner = responses.reduce((best, current) =>
            (current.metadata?.cost || Infinity) < (best.metadata?.cost || Infinity) ? current : best
          )
        }

        return {
          responses,
          comparison: {
            totalProviders: responses.length,
            criteria: config.criteria,
            avgLatency: responses.reduce((sum, r) => sum + (r.metadata?.latency || 0), 0) / responses.length,
          },
          winner,
        }
      },
    },

    // OpenRouter Specific Node
    {
      type: 'openrouter-request',
      label: 'OpenRouter Auto-Route',
      category: 'AI',
      inputs: [
        {
          id: 'prompt',
          label: 'Prompt',
          type: 'text',
          required: true,
        },
        {
          id: 'preferences',
          label: 'Model Preferences',
          type: 'object',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'response',
          label: 'Response',
          type: 'text',
        },
        {
          id: 'usedModel',
          label: 'Used Model',
          type: 'text',
        },
        {
          id: 'cost',
          label: 'Actual Cost',
          type: 'number',
        },
      ],
      config: [
        {
          id: 'apiKey',
          label: 'OpenRouter API Key',
          type: 'text',
          required: true,
        },
        {
          id: 'autoRoute',
          label: 'Auto-Routing',
          type: 'select',
          options: [
            { label: 'Cheapest', value: 'cheapest' },
            { label: 'Fastest', value: 'fastest' },
            { label: 'Best Quality', value: 'quality' },
          ],
          defaultValue: 'cheapest',
        },
        {
          id: 'budgetLimit',
          label: 'Budget Limit ($)',
          type: 'number',
          defaultValue: 0.1,
        },
      ],
      execute: async (inputs, config) => {
        const prompt = inputs.prompt || ''
        const result = await makeProviderRequest('openrouter', config.apiKey, prompt, {
          ...config,
          model: 'auto',
        })

        return {
          response: result.response,
          usedModel: result.metadata.model,
          cost: result.metadata.cost,
        }
      },
    },

    // EdenAI Aggregator Node
    {
      type: 'edenai-request',
      label: 'EdenAI Aggregator',
      category: 'AI',
      inputs: [
        {
          id: 'prompt',
          label: 'Prompt/Input',
          type: 'text',
          required: true,
        },
        {
          id: 'taskType',
          label: 'Task Type',
          type: 'text',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'response',
          label: 'Response',
          type: 'text',
        },
        {
          id: 'providersUsed',
          label: 'Providers Used',
          type: 'array',
        },
        {
          id: 'aggregatedResult',
          label: 'Aggregated Result',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'apiKey',
          label: 'EdenAI API Key',
          type: 'text',
          required: true,
        },
        {
          id: 'taskType',
          label: 'Task Type',
          type: 'select',
          options: [
            { label: 'Text Generation', value: 'text' },
            { label: 'Image Generation', value: 'image' },
            { label: 'Audio Processing', value: 'audio' },
            { label: 'OCR', value: 'ocr' },
          ],
          defaultValue: 'text',
        },
        {
          id: 'providers',
          label: 'Provider Preferences',
          type: 'text',
          defaultValue: 'openai,cohere,anthropic',
        },
      ],
      execute: async (inputs, config) => {
        const prompt = inputs.prompt || ''
        const taskType = inputs.taskType || config.taskType || 'text'
        const result = await makeProviderRequest('edenai', config.apiKey, prompt, {
          ...config,
          taskType,
        })

        return {
          response: result.response,
          providersUsed: [result.metadata.provider],
          aggregatedResult: result.metadata,
        }
      },
    },

    // Provider List Node
    {
      type: 'ai-providers-list',
      label: 'List Available Providers',
      category: 'AI',
      inputs: [],
      outputs: [
        {
          id: 'providers',
          label: 'Providers',
          type: 'array',
        },
        {
          id: 'count',
          label: 'Total Count',
          type: 'number',
        },
      ],
      config: [],
      execute: async () => {
        const providers = Object.entries(EXTENDED_PROVIDERS).map(([name, config]) => ({
          name,
          baseUrl: config.baseUrl,
          models: config.models,
          features: config.features,
        }))

        return {
          providers,
          count: providers.length,
        }
      },
    },
  ],
}
