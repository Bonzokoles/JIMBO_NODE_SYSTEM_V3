/**
 * API Key Management Workflow Template
 * Demonstrates storing, retrieving, and using API keys with multiple providers
 */

import { WorkflowTemplate } from '@/lib/workflowTemplates'

export const apiKeyManagementTemplate: WorkflowTemplate = {
  id: 'api-key-management',
  name: '🔑 Multi-Provider API Key Management',
  description: 'Store API keys securely and use them with multiple AI providers',
  category: 'integration',
  tags: ['security', 'api-keys', 'multi-provider', 'encryption'],
  difficulty: 'intermediate',
  estimatedTime: '5-10 minutes',
  useCases: [
    'Secure API key storage and retrieval',
    'Multi-provider AI requests with failover',
    'API key rotation and management',
    'Encrypted key vault operations',
  ],
  nodes: [
    {
      id: 'text-input-1',
      type: 'custom',
      position: { x: 50, y: 100 },
      data: {
        label: 'Input Prompt',
        type: 'textInput',
        status: 'idle',
        config: {
          text: 'What is artificial intelligence?',
        },
      },
    },
    {
      id: 'key-retrieve-1',
      type: 'custom',
      position: { x: 350, y: 50 },
      data: {
        label: 'Get OpenAI Key',
        type: 'api-key-retrieve',
        status: 'idle',
        config: {
          keyId: 'your-openai-key-id',
          autoRefresh: false,
        },
      },
    },
    {
      id: 'key-retrieve-2',
      type: 'custom',
      position: { x: 350, y: 200 },
      data: {
        label: 'Get Anthropic Key',
        type: 'api-key-retrieve',
        status: 'idle',
        config: {
          keyId: 'your-anthropic-key-id',
          autoRefresh: false,
        },
      },
    },
    {
      id: 'multi-provider-1',
      type: 'custom',
      position: { x: 650, y: 100 },
      data: {
        label: 'Multi-Provider Request',
        type: 'multi-provider-request',
        status: 'idle',
        config: {
          providers: 'openai,anthropic,google',
          fallbackOrder: 'parallel',
          timeout: 30,
          loadBalancing: 'fastest',
        },
      },
    },
    {
      id: 'console-1',
      type: 'custom',
      position: { x: 950, y: 50 },
      data: {
        label: 'All Responses',
        type: 'console',
        status: 'idle',
        config: {},
      },
    },
    {
      id: 'console-2',
      type: 'custom',
      position: { x: 950, y: 200 },
      data: {
        label: 'Fastest Response',
        type: 'console',
        status: 'idle',
        config: {},
      },
    },
    {
      id: 'key-manager-1',
      type: 'custom',
      position: { x: 50, y: 350 },
      data: {
        label: 'List All Keys',
        type: 'api-key-manager',
        status: 'idle',
        config: {
          action: 'list',
          providerFilter: '',
        },
      },
    },
    {
      id: 'console-3',
      type: 'custom',
      position: { x: 350, y: 350 },
      data: {
        label: 'Keys List',
        type: 'console',
        status: 'idle',
        config: {},
      },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'text-input-1',
      target: 'multi-provider-1',
      sourceHandle: 'text',
      targetHandle: 'prompt',
    },
    {
      id: 'e2',
      source: 'multi-provider-1',
      target: 'console-1',
      sourceHandle: 'responses',
      targetHandle: 'input',
    },
    {
      id: 'e3',
      source: 'multi-provider-1',
      target: 'console-2',
      sourceHandle: 'fastest',
      targetHandle: 'input',
    },
    {
      id: 'e4',
      source: 'key-manager-1',
      target: 'console-3',
      sourceHandle: 'result',
      targetHandle: 'input',
    },
  ],
}
