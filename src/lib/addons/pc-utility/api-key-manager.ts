/**
 * API Key Manager Addon
 * Secure storage and management of API keys for various AI providers
 */

import { Addon } from '@/lib/addons'

const BACKEND_URL = 'http://localhost:8765'

export const apiKeyManagerAddon: Addon = {
  metadata: {
    id: 'api-key-manager',
    name: 'API Key Manager',
    version: '1.0.0',
    author: 'PC Utility Team',
    description: 'Secure storage and management of API keys with encryption',
    category: 'tool',
    enabled: true,
    tags: ['security', 'api', 'keys', 'encryption'],
  },
  
  nodes: [
    // API Key Store Node
    {
      type: 'api-key-store',
      label: 'Store API Key',
      category: 'API Keys',
      inputs: [
        {
          id: 'provider',
          label: 'Provider',
          type: 'text',
          required: true,
        },
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'keyId',
          label: 'Key ID',
          type: 'text',
        },
        {
          id: 'status',
          label: 'Status',
          type: 'text',
        },
      ],
      config: [
        {
          id: 'provider',
          label: 'Provider',
          type: 'select',
          options: [
            { label: 'OpenAI', value: 'openai' },
            { label: 'Anthropic', value: 'anthropic' },
            { label: 'Google', value: 'google' },
            { label: 'Cohere', value: 'cohere' },
            { label: 'HuggingFace', value: 'huggingface' },
            { label: 'Azure OpenAI', value: 'azure_openai' },
            { label: 'AWS Bedrock', value: 'aws_bedrock' },
            { label: 'Groq', value: 'groq' },
            { label: 'Mistral AI', value: 'mistral' },
            { label: 'Custom', value: 'custom' },
          ],
          required: true,
          description: 'Select the API provider',
        },
        {
          id: 'alias',
          label: 'Key Alias',
          type: 'text',
          placeholder: 'my-openai-key',
          description: 'Optional friendly name for the key',
        },
        {
          id: 'encryptionEnabled',
          label: 'Enable Encryption',
          type: 'boolean',
          defaultValue: true,
          description: 'Encrypt key at rest (recommended)',
        },
        {
          id: 'autoRotation',
          label: 'Auto-Rotation',
          type: 'boolean',
          defaultValue: false,
          description: 'Enable automatic key rotation',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const provider = inputs.provider || config.provider
          const apiKey = inputs.apiKey
          
          if (!provider || !apiKey) {
            throw new Error('Provider and API key are required')
          }
          
          const response = await fetch(`${BACKEND_URL}/api/keys/store`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider,
              api_key: apiKey,
              alias: config.alias || null,
              encryption_enabled: config.encryptionEnabled !== false,
              auto_rotation: config.autoRotation || false,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to store API key')
          }
          
          const data = await response.json()
          
          return {
            keyId: data.key_id,
            status: data.status,
          }
        } catch (error) {
          throw new Error(`API key storage failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // API Key Retrieve Node
    {
      type: 'api-key-retrieve',
      label: 'Retrieve API Key',
      category: 'API Keys',
      inputs: [
        {
          id: 'keyId',
          label: 'Key ID',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'text',
        },
        {
          id: 'provider',
          label: 'Provider',
          type: 'text',
        },
      ],
      config: [
        {
          id: 'keyId',
          label: 'Key ID',
          type: 'text',
          placeholder: 'Enter key ID or use input',
          description: 'The ID of the key to retrieve',
        },
        {
          id: 'autoRefresh',
          label: 'Auto-Refresh on Expiry',
          type: 'boolean',
          defaultValue: false,
          description: 'Automatically refresh expired keys',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const keyId = inputs.keyId || config.keyId
          
          if (!keyId) {
            throw new Error('Key ID is required')
          }
          
          const response = await fetch(`${BACKEND_URL}/api/keys/retrieve/${keyId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to retrieve API key')
          }
          
          const data = await response.json()
          
          return {
            apiKey: data.api_key,
            provider: data.provider,
          }
        } catch (error) {
          throw new Error(`API key retrieval failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // API Key Manager Node
    {
      type: 'api-key-manager',
      label: 'Manage API Keys',
      category: 'API Keys',
      inputs: [
        {
          id: 'action',
          label: 'Action',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'result',
          label: 'Result',
          type: 'any',
        },
      ],
      config: [
        {
          id: 'action',
          label: 'Action',
          type: 'select',
          options: [
            { label: 'List Keys', value: 'list' },
            { label: 'Delete Key', value: 'delete' },
            { label: 'Rotate Key', value: 'rotate' },
            { label: 'Validate Key', value: 'validate' },
            { label: 'List Providers', value: 'providers' },
          ],
          defaultValue: 'list',
          description: 'Management action to perform',
        },
        {
          id: 'keyId',
          label: 'Key ID',
          type: 'text',
          placeholder: 'Required for delete, rotate, validate',
          description: 'Key ID for delete/rotate/validate actions',
        },
        {
          id: 'newKey',
          label: 'New API Key',
          type: 'password',
          placeholder: 'Required for rotate action',
          description: 'New key value for rotation',
        },
        {
          id: 'providerFilter',
          label: 'Provider Filter',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'OpenAI', value: 'openai' },
            { label: 'Anthropic', value: 'anthropic' },
            { label: 'Google', value: 'google' },
          ],
          description: 'Filter by provider for list action',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const action = inputs.action || config.action
          
          if (action === 'list') {
            const provider = config.providerFilter || ''
            const url = provider 
              ? `${BACKEND_URL}/api/keys/list?provider=${provider}`
              : `${BACKEND_URL}/api/keys/list`
            
            const response = await fetch(url)
            if (!response.ok) throw new Error('Failed to list keys')
            
            const data = await response.json()
            return { result: data }
            
          } else if (action === 'delete') {
            if (!config.keyId) throw new Error('Key ID required for delete')
            
            const response = await fetch(`${BACKEND_URL}/api/keys/delete/${config.keyId}`, {
              method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete key')
            
            const data = await response.json()
            return { result: data }
            
          } else if (action === 'rotate') {
            if (!config.keyId || !config.newKey) {
              throw new Error('Key ID and new key required for rotation')
            }
            
            const response = await fetch(`${BACKEND_URL}/api/keys/rotate?key_id=${config.keyId}&new_api_key=${encodeURIComponent(config.newKey)}`, {
              method: 'POST',
            })
            if (!response.ok) throw new Error('Failed to rotate key')
            
            const data = await response.json()
            return { result: data }
            
          } else if (action === 'validate') {
            if (!config.keyId) throw new Error('Key ID required for validation')
            
            const response = await fetch(`${BACKEND_URL}/api/keys/validate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                key_id: config.keyId,
                provider: config.providerFilter || 'openai',
              }),
            })
            if (!response.ok) throw new Error('Failed to validate key')
            
            const data = await response.json()
            return { result: data }
            
          } else if (action === 'providers') {
            const response = await fetch(`${BACKEND_URL}/api/keys/providers`)
            if (!response.ok) throw new Error('Failed to list providers')
            
            const data = await response.json()
            return { result: data }
          }
          
          throw new Error(`Unknown action: ${action}`)
          
        } catch (error) {
          throw new Error(`API key management failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // Multi-Provider Request Node
    {
      type: 'multi-provider-request',
      label: 'Multi-Provider Request',
      category: 'API Keys',
      inputs: [
        {
          id: 'prompt',
          label: 'Prompt',
          type: 'text',
          required: true,
        },
        {
          id: 'providers',
          label: 'Providers',
          type: 'array',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'responses',
          label: 'All Responses',
          type: 'array',
        },
        {
          id: 'fastest',
          label: 'Fastest Response',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'providers',
          label: 'Providers (comma-separated)',
          type: 'text',
          placeholder: 'openai,anthropic,google',
          description: 'List of providers to query',
        },
        {
          id: 'fallbackOrder',
          label: 'Fallback Order',
          type: 'select',
          options: [
            { label: 'Parallel', value: 'parallel' },
            { label: 'Sequential', value: 'sequential' },
          ],
          defaultValue: 'parallel',
          description: 'How to execute requests',
        },
        {
          id: 'timeout',
          label: 'Timeout (seconds)',
          type: 'number',
          defaultValue: 30,
          description: 'Timeout per provider',
        },
        {
          id: 'loadBalancing',
          label: 'Load Balancing',
          type: 'select',
          options: [
            { label: 'Round Robin', value: 'round-robin' },
            { label: 'Fastest First', value: 'fastest' },
            { label: 'Random', value: 'random' },
          ],
          defaultValue: 'round-robin',
          description: 'Load balancing strategy',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const prompt = inputs.prompt
          let providers: string[]
          
          if (inputs.providers && Array.isArray(inputs.providers)) {
            providers = inputs.providers
          } else if (config.providers) {
            providers = config.providers.split(',').map((p: string) => p.trim())
          } else {
            throw new Error('Providers list required')
          }
          
          // This is a placeholder implementation
          // In a real implementation, you would:
          // 1. Retrieve keys for each provider
          // 2. Make actual AI API calls
          // 3. Compare response times
          // 4. Handle failures gracefully
          
          const responses: Array<{ provider: string; response: string; latency: number; error?: string }> = []
          
          for (const provider of providers) {
            try {
              const startTime = Date.now()
              
              // Placeholder: In real implementation, make actual API call here
              await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
              
              responses.push({
                provider,
                response: `Mock response from ${provider} for: ${prompt}`,
                latency: Date.now() - startTime,
              })
            } catch (error) {
              responses.push({
                provider,
                response: '',
                latency: 0,
                error: error instanceof Error ? error.message : String(error),
              })
            }
          }
          
          // Find fastest successful response
          const successfulResponses = responses.filter(r => !r.error)
          const fastest = successfulResponses.length > 0
            ? successfulResponses.reduce((prev, curr) => 
                prev.latency < curr.latency ? prev : curr
              )
            : null
          
          return {
            responses,
            fastest: fastest || { error: 'All providers failed' },
          }
          
        } catch (error) {
          throw new Error(`Multi-provider request failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
  ],
  
  initialize: async () => {
    console.log('🔑 API Key Manager addon initialized')
    try {
      const response = await fetch(`${BACKEND_URL}/health`)
      if (response.ok) {
        console.log('✅ API Key Vault is available')
      }
    } catch {
      console.warn('⚠️ API Key Vault not available. Start the backend server at', BACKEND_URL)
    }
  },
  
  cleanup: async () => {
    console.log('🔑 API Key Manager addon cleaned up')
  },
}
