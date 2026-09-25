/**
 * Custom Model Workflow Template
 * Demonstrates deploying a custom model, running inference, and A/B testing
 */

import { WorkflowTemplate } from '@/lib/workflowTemplates'

export const customModelTemplate: WorkflowTemplate = {
  id: 'custom-model-inference',
  name: '🤖 Custom Model Deployment & Inference',
  description: 'Deploy custom ML models and run inference with A/B testing',
  category: 'advanced',
  tags: ['ml', 'models', 'inference', 'deployment', 'ab-testing'],
  difficulty: 'advanced',
  estimatedTime: '15-20 minutes',
  useCases: [
    'Deploy custom PyTorch/TensorFlow models',
    'Run inference on custom models',
    'Compare model performance with A/B testing',
    'Track model metrics and latency',
  ],
  nodes: [
    {
      id: 'text-input-1',
      type: 'custom',
      position: { x: 50, y: 100 },
      data: {
        label: 'Input Data',
        type: 'textInput',
        status: 'idle',
        config: {
          text: '[0.5, 0.3, 0.8, 0.1]',
        },
      },
    },
    {
      id: 'model-manager-1',
      type: 'custom',
      position: { x: 350, y: 50 },
      data: {
        label: 'List Models',
        type: 'model-manager',
        status: 'idle',
        config: {
          action: 'list',
          modelTypeFilter: '',
        },
      },
    },
    {
      id: 'model-inference-1',
      type: 'custom',
      position: { x: 650, y: 100 },
      data: {
        label: 'Run Inference',
        type: 'model-inference',
        status: 'idle',
        config: {
          batchSize: 1,
          temperature: null,
          maxTokens: null,
          useGpu: false,
        },
      },
    },
    {
      id: 'console-1',
      type: 'custom',
      position: { x: 950, y: 100 },
      data: {
        label: 'Prediction',
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
        label: 'Latency',
        type: 'console',
        status: 'idle',
        config: {},
      },
    },
    {
      id: 'model-ab-test-1',
      type: 'custom',
      position: { x: 350, y: 300 },
      data: {
        label: 'A/B Test Models',
        type: 'model-ab-test',
        status: 'idle',
        config: {
          metrics: 'latency,prediction',
          sampleSize: 1,
        },
      },
    },
    {
      id: 'console-3',
      type: 'custom',
      position: { x: 650, y: 300 },
      data: {
        label: 'Model A Result',
        type: 'console',
        status: 'idle',
        config: {},
      },
    },
    {
      id: 'console-4',
      type: 'custom',
      position: { x: 650, y: 400 },
      data: {
        label: 'Model B Result',
        type: 'console',
        status: 'idle',
        config: {},
      },
    },
    {
      id: 'console-5',
      type: 'custom',
      position: { x: 950, y: 350 },
      data: {
        label: 'Comparison',
        type: 'console',
        status: 'idle',
        config: {},
      },
    },
    {
      id: 'model-manager-2',
      type: 'custom',
      position: { x: 50, y: 500 },
      data: {
        label: 'Get Metrics',
        type: 'model-manager',
        status: 'idle',
        config: {
          action: 'metrics',
          modelId: 'your-model-id',
        },
      },
    },
    {
      id: 'console-6',
      type: 'custom',
      position: { x: 350, y: 500 },
      data: {
        label: 'Model Metrics',
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
      target: 'model-inference-1',
      sourceHandle: 'text',
      targetHandle: 'input',
    },
    {
      id: 'e2',
      source: 'model-inference-1',
      target: 'console-1',
      sourceHandle: 'prediction',
      targetHandle: 'input',
    },
    {
      id: 'e3',
      source: 'model-inference-1',
      target: 'console-2',
      sourceHandle: 'latency',
      targetHandle: 'input',
    },
    {
      id: 'e4',
      source: 'text-input-1',
      target: 'model-ab-test-1',
      sourceHandle: 'text',
      targetHandle: 'input',
    },
    {
      id: 'e5',
      source: 'model-ab-test-1',
      target: 'console-3',
      sourceHandle: 'resultA',
      targetHandle: 'input',
    },
    {
      id: 'e6',
      source: 'model-ab-test-1',
      target: 'console-4',
      sourceHandle: 'resultB',
      targetHandle: 'input',
    },
    {
      id: 'e7',
      source: 'model-ab-test-1',
      target: 'console-5',
      sourceHandle: 'comparison',
      targetHandle: 'input',
    },
    {
      id: 'e8',
      source: 'model-manager-2',
      target: 'console-6',
      sourceHandle: 'result',
      targetHandle: 'input',
    },
  ],
}
