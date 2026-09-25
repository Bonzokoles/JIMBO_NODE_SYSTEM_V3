/**
 * Custom Model Deployer Addon
 * Deploy and manage specialized models for custom use cases
 */

import { Addon } from '@/lib/addons'

const BACKEND_URL = 'http://localhost:8765'

export const customModelDeployerAddon: Addon = {
  metadata: {
    id: 'custom-model-deployer',
    name: 'Custom Model Deployer',
    version: '1.0.0',
    author: 'PC Utility Team',
    description: 'Deploy and manage custom ML models with inference support',
    category: 'tool',
    enabled: true,
    tags: ['ml', 'ai', 'models', 'inference', 'deployment'],
  },
  
  nodes: [
    // Model Upload Node
    {
      type: 'model-upload',
      label: 'Upload Model',
      category: 'Model Operations',
      inputs: [
        {
          id: 'modelFile',
          label: 'Model File',
          type: 'file',
          required: false,
        },
        {
          id: 'config',
          label: 'Configuration',
          type: 'object',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'modelId',
          label: 'Model ID',
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
          id: 'name',
          label: 'Model Name',
          type: 'text',
          required: true,
          placeholder: 'My Custom Model',
          description: 'Friendly name for the model',
        },
        {
          id: 'modelType',
          label: 'Model Type',
          type: 'select',
          options: [
            { label: 'PyTorch', value: 'pytorch' },
            { label: 'TensorFlow', value: 'tensorflow' },
            { label: 'ONNX', value: 'onnx' },
            { label: 'Scikit-learn', value: 'sklearn' },
            { label: 'HuggingFace', value: 'huggingface' },
            { label: 'LightGBM', value: 'lightgbm' },
            { label: 'XGBoost', value: 'xgboost' },
            { label: 'Custom', value: 'custom' },
          ],
          required: true,
          description: 'Type of model framework',
        },
        {
          id: 'version',
          label: 'Version Tag',
          type: 'text',
          defaultValue: '1.0.0',
          placeholder: '1.0.0',
          description: 'Version identifier',
        },
        {
          id: 'useGpu',
          label: 'Enable GPU',
          type: 'boolean',
          defaultValue: false,
          description: 'Use GPU for inference',
        },
        {
          id: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Model description...',
          description: 'Optional model description',
        },
      ],
      execute: async (inputs, config) => {
        try {
          // Note: This is a simplified implementation
          // In a real implementation, you would handle file uploads properly
          
          if (!config.name || !config.modelType) {
            throw new Error('Model name and type are required')
          }
          
          // For now, return a mock response since file upload requires special handling
          return {
            modelId: `model-${Date.now()}`,
            status: 'Note: File upload requires special handling. Use the backend API directly for actual model uploads.',
          }
          
        } catch (error) {
          throw new Error(`Model upload failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // Model Inference Node
    {
      type: 'model-inference',
      label: 'Model Inference',
      category: 'Model Operations',
      inputs: [
        {
          id: 'modelId',
          label: 'Model ID',
          type: 'text',
          required: true,
        },
        {
          id: 'input',
          label: 'Input Data',
          type: 'any',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'prediction',
          label: 'Prediction',
          type: 'any',
        },
        {
          id: 'confidence',
          label: 'Confidence',
          type: 'any',
        },
        {
          id: 'latency',
          label: 'Latency (ms)',
          type: 'number',
        },
      ],
      config: [
        {
          id: 'batchSize',
          label: 'Batch Size',
          type: 'number',
          defaultValue: 1,
          description: 'Number of samples per batch',
        },
        {
          id: 'temperature',
          label: 'Temperature',
          type: 'number',
          placeholder: '0.7',
          description: 'Temperature for generative models (optional)',
        },
        {
          id: 'maxTokens',
          label: 'Max Tokens',
          type: 'number',
          placeholder: '100',
          description: 'Max tokens for generative models (optional)',
        },
        {
          id: 'useGpu',
          label: 'Use GPU',
          type: 'boolean',
          defaultValue: false,
          description: 'Enable GPU acceleration',
        },
      ],
      execute: async (inputs, config) => {
        try {
          if (!inputs.modelId) {
            throw new Error('Model ID is required')
          }
          
          const response = await fetch(`${BACKEND_URL}/api/models/inference`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model_id: inputs.modelId,
              input_data: inputs.input,
              batch_size: config.batchSize || 1,
              temperature: config.temperature || null,
              max_tokens: config.maxTokens || null,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Inference failed')
          }
          
          const data = await response.json()
          
          return {
            prediction: data.prediction,
            confidence: data.confidence,
            latency: data.latency_ms,
          }
        } catch (error) {
          throw new Error(`Model inference failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // Model Manager Node
    {
      type: 'model-manager',
      label: 'Manage Models',
      category: 'Model Operations',
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
            { label: 'List Models', value: 'list' },
            { label: 'Delete Model', value: 'delete' },
            { label: 'Get Metrics', value: 'metrics' },
            { label: 'List Model Types', value: 'types' },
          ],
          defaultValue: 'list',
          description: 'Management action to perform',
        },
        {
          id: 'modelId',
          label: 'Model ID',
          type: 'text',
          placeholder: 'Required for delete/metrics',
          description: 'Model ID for specific actions',
        },
        {
          id: 'modelTypeFilter',
          label: 'Model Type Filter',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'PyTorch', value: 'pytorch' },
            { label: 'ONNX', value: 'onnx' },
            { label: 'Scikit-learn', value: 'sklearn' },
          ],
          description: 'Filter by model type (for list)',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const action = inputs.action || config.action
          
          if (action === 'list') {
            const modelType = config.modelTypeFilter || ''
            const url = modelType
              ? `${BACKEND_URL}/api/models/list?model_type=${modelType}`
              : `${BACKEND_URL}/api/models/list`
            
            const response = await fetch(url)
            if (!response.ok) throw new Error('Failed to list models')
            
            const data = await response.json()
            return { result: data }
            
          } else if (action === 'delete') {
            if (!config.modelId) throw new Error('Model ID required for delete')
            
            const response = await fetch(`${BACKEND_URL}/api/models/delete/${config.modelId}`, {
              method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete model')
            
            const data = await response.json()
            return { result: data }
            
          } else if (action === 'metrics') {
            if (!config.modelId) throw new Error('Model ID required for metrics')
            
            const response = await fetch(`${BACKEND_URL}/api/models/metrics/${config.modelId}`)
            if (!response.ok) throw new Error('Failed to get metrics')
            
            const data = await response.json()
            return { result: data }
            
          } else if (action === 'types') {
            const response = await fetch(`${BACKEND_URL}/api/models/types`)
            if (!response.ok) throw new Error('Failed to list model types')
            
            const data = await response.json()
            return { result: data }
          }
          
          throw new Error(`Unknown action: ${action}`)
          
        } catch (error) {
          throw new Error(`Model management failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // Model Fine-tune Node
    {
      type: 'model-fine-tune',
      label: 'Fine-tune Model',
      category: 'Model Operations',
      inputs: [
        {
          id: 'baseModel',
          label: 'Base Model ID',
          type: 'text',
          required: true,
        },
        {
          id: 'trainingData',
          label: 'Training Data',
          type: 'any',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'newModelId',
          label: 'New Model ID',
          type: 'text',
        },
        {
          id: 'metrics',
          label: 'Training Metrics',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'learningRate',
          label: 'Learning Rate',
          type: 'number',
          defaultValue: 0.001,
          placeholder: '0.001',
          description: 'Learning rate for training',
        },
        {
          id: 'epochs',
          label: 'Epochs',
          type: 'number',
          defaultValue: 10,
          description: 'Number of training epochs',
        },
        {
          id: 'batchSize',
          label: 'Batch Size',
          type: 'number',
          defaultValue: 32,
          description: 'Training batch size',
        },
        {
          id: 'validationSplit',
          label: 'Validation Split',
          type: 'number',
          defaultValue: 0.2,
          placeholder: '0.2',
          description: 'Fraction of data for validation',
        },
      ],
      execute: async (inputs, config) => {
        try {
          // Fine-tuning is a complex operation that requires special handling
          // This is a placeholder implementation
          
          return {
            newModelId: `finetuned-${inputs.baseModel}-${Date.now()}`,
            metrics: {
              message: 'Fine-tuning requires special implementation',
              learningRate: config.learningRate,
              epochs: config.epochs,
              batchSize: config.batchSize,
            },
          }
          
        } catch (error) {
          throw new Error(`Fine-tuning failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // Model A/B Test Node
    {
      type: 'model-ab-test',
      label: 'A/B Test Models',
      category: 'Model Operations',
      inputs: [
        {
          id: 'modelA',
          label: 'Model A ID',
          type: 'text',
          required: true,
        },
        {
          id: 'modelB',
          label: 'Model B ID',
          type: 'text',
          required: true,
        },
        {
          id: 'input',
          label: 'Test Input',
          type: 'any',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'resultA',
          label: 'Model A Result',
          type: 'any',
        },
        {
          id: 'resultB',
          label: 'Model B Result',
          type: 'any',
        },
        {
          id: 'comparison',
          label: 'Comparison',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'metrics',
          label: 'Metrics to Compare',
          type: 'text',
          defaultValue: 'latency,prediction',
          placeholder: 'latency,prediction',
          description: 'Comma-separated metrics to compare',
        },
        {
          id: 'sampleSize',
          label: 'Sample Size',
          type: 'number',
          defaultValue: 1,
          description: 'Number of times to run each model',
        },
      ],
      execute: async (inputs, config) => {
        try {
          if (!inputs.modelA || !inputs.modelB) {
            throw new Error('Both model IDs are required')
          }
          
          const metrics = (config.metrics || 'latency,prediction').split(',').map(m => m.trim())
          
          const response = await fetch(`${BACKEND_URL}/api/models/ab-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model_a_id: inputs.modelA,
              model_b_id: inputs.modelB,
              input_data: inputs.input,
              metrics,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'A/B test failed')
          }
          
          const data = await response.json()
          
          return {
            resultA: data.model_a,
            resultB: data.model_b,
            comparison: data.comparison,
          }
          
        } catch (error) {
          throw new Error(`A/B test failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
  ],
  
  initialize: async () => {
    console.log('🤖 Custom Model Deployer addon initialized')
    try {
      const response = await fetch(`${BACKEND_URL}/health`)
      if (response.ok) {
        console.log('✅ Model Deployment service is available')
      }
    } catch {
      console.warn('⚠️ Model Deployment service not available. Start the backend server at', BACKEND_URL)
    }
  },
  
  cleanup: async () => {
    console.log('🤖 Custom Model Deployer addon cleaned up')
  },
}
