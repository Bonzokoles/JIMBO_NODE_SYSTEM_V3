import { Addon } from '@/lib/addons'

/**
 * PC Utility Monitoring & Optimization System
 * 
 * This addon provides comprehensive PC utility capabilities including:
 * - System monitoring (CPU, RAM, Disk, Network)
 * - GPU monitoring and statistics
 * - System cleaning and optimization
 * - Memory optimization
 * - Process management
 * - AI-powered sentiment analysis
 * - Database integration for metrics storage
 * 
 * Backend Service: FastAPI server at http://localhost:8765
 */

const BACKEND_URL = 'http://localhost:8765'

/**
 * Helper function to make HTTP requests to the backend
 */
async function makeBackendRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  data?: any
): Promise<any> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (data && method === 'POST') {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend request failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect to PC Utility backend at ${BACKEND_URL}: ${error.message}`)
    }
    throw error
  }
}

export const pcUtilityAddon: Addon = {
  metadata: {
    id: 'pc-utility',
    name: 'PC Utility Monitoring & Optimization',
    version: '1.0.0',
    author: 'Node\'y Team',
    description: 'Comprehensive PC utility system with monitoring, cleaning, optimization, and AI sentiment analysis',
    category: 'tool',
    enabled: true,
    tags: ['system', 'monitoring', 'optimization', 'ai', 'gpu', 'performance'],
    homepage: 'https://github.com/Bonzokoles/jimbo-node-system-v2',
    repository: 'https://github.com/Bonzokoles/jimbo-node-system-v2',
  },

  nodes: [
    // ==================== MONITORING NODES ====================
    {
      type: 'pc-system-monitor',
      label: 'System Monitor',
      category: 'PC Utility',
      inputs: [],
      outputs: [
        {
          id: 'metrics',
          label: 'System Metrics',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'updateInterval',
          label: 'Update Interval (seconds)',
          type: 'number',
          defaultValue: 1,
          description: 'How often to refresh system metrics',
        },
        {
          id: 'includeGpu',
          label: 'Include GPU Metrics',
          type: 'boolean',
          defaultValue: true,
          description: 'Include GPU information in metrics',
        },
      ],
      execute: async (inputs, config) => {
        const interval = config.updateInterval || 1
        const includeGpu = config.includeGpu !== false

        const result = await makeBackendRequest('/api/system/monitor', 'POST', {
          include_gpu: includeGpu,
        })

        return {
          metrics: {
            ...result,
            interval,
            timestamp: new Date().toISOString(),
          },
        }
      },
    },

    {
      type: 'pc-gpu-monitor',
      label: 'GPU Monitor',
      category: 'PC Utility',
      inputs: [],
      outputs: [
        {
          id: 'gpuStats',
          label: 'GPU Statistics',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'gpuIndex',
          label: 'GPU Index',
          type: 'number',
          defaultValue: 0,
          description: 'GPU device index (0 for first GPU)',
        },
      ],
      execute: async (inputs, config) => {
        const gpuIndex = config.gpuIndex || 0

        const result = await makeBackendRequest(`/api/gpu/stats/${gpuIndex}`, 'GET')

        return {
          gpuStats: {
            ...result,
            timestamp: new Date().toISOString(),
          },
        }
      },
    },

    // ==================== CLEANING NODES ====================
    {
      type: 'pc-system-cleaner',
      label: 'System Cleaner',
      category: 'PC Utility',
      inputs: [],
      outputs: [
        {
          id: 'results',
          label: 'Cleaning Results',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'cleanTemp',
          label: 'Clean Temporary Files',
          type: 'boolean',
          defaultValue: true,
        },
        {
          id: 'clearCache',
          label: 'Clear System Cache',
          type: 'boolean',
          defaultValue: true,
        },
        {
          id: 'cleanLogs',
          label: 'Clean Old Logs',
          type: 'boolean',
          defaultValue: false,
        },
        {
          id: 'emptyRecycleBin',
          label: 'Empty Recycle Bin',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      execute: async (inputs, config) => {
        const options = {
          clean_temp: config.cleanTemp !== false,
          clear_cache: config.clearCache !== false,
          clean_logs: config.cleanLogs === true,
          empty_recycle_bin: config.emptyRecycleBin === true,
        }

        const result = await makeBackendRequest('/api/system/clean', 'POST', options)

        return {
          results: {
            ...result,
            timestamp: new Date().toISOString(),
          },
        }
      },
    },

    // ==================== OPTIMIZATION NODES ====================
    {
      type: 'pc-memory-optimizer',
      label: 'Memory Optimizer',
      category: 'PC Utility',
      inputs: [],
      outputs: [
        {
          id: 'results',
          label: 'Optimization Results',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'aggressiveMode',
          label: 'Aggressive Mode',
          type: 'boolean',
          defaultValue: false,
          description: 'More aggressive memory clearing (may affect performance)',
        },
        {
          id: 'clearPageFile',
          label: 'Clear Page File',
          type: 'boolean',
          defaultValue: false,
          description: 'Clear Windows page file on shutdown',
        },
      ],
      execute: async (inputs, config) => {
        const options = {
          aggressive: config.aggressiveMode === true,
          clear_page_file: config.clearPageFile === true,
        }

        const result = await makeBackendRequest('/api/system/optimize-memory', 'POST', options)

        return {
          results: {
            ...result,
            timestamp: new Date().toISOString(),
          },
        }
      },
    },

    {
      type: 'pc-process-manager',
      label: 'Process Manager',
      category: 'PC Utility',
      inputs: [],
      outputs: [
        {
          id: 'processes',
          label: 'Process List',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'sortBy',
          label: 'Sort By',
          type: 'select',
          options: [
            { label: 'CPU Usage', value: 'cpu' },
            { label: 'Memory Usage', value: 'memory' },
            { label: 'Process Name', value: 'name' },
          ],
          defaultValue: 'cpu',
        },
        {
          id: 'limit',
          label: 'Result Limit',
          type: 'number',
          defaultValue: 10,
          description: 'Maximum number of processes to return',
        },
      ],
      execute: async (inputs, config) => {
        const sortBy = config.sortBy || 'cpu'
        const limit = config.limit || 10

        const result = await makeBackendRequest(
          `/api/system/processes?sort_by=${sortBy}&limit=${limit}`,
          'GET'
        )

        return {
          processes: result.processes || [],
        }
      },
    },

    // ==================== AI NODES ====================
    {
      type: 'pc-sentiment-analyzer',
      label: 'Sentiment Analyzer',
      category: 'PC Utility',
      inputs: [
        {
          id: 'text',
          label: 'Text to Analyze',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'sentiment',
          label: 'Sentiment Result',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'model',
          label: 'Model Type',
          type: 'select',
          options: [
            { label: 'TensorFlow', value: 'tensorflow' },
            { label: 'PyTorch', value: 'pytorch' },
            { label: 'Transformers (Hugging Face)', value: 'transformers' },
          ],
          defaultValue: 'transformers',
        },
        {
          id: 'useGpu',
          label: 'Use GPU Acceleration',
          type: 'boolean',
          defaultValue: false,
          description: 'Use GPU for faster inference (requires CUDA)',
        },
      ],
      execute: async (inputs, config) => {
        const text = inputs.text || ''

        if (!text) {
          throw new Error('Text input is required for sentiment analysis')
        }

        const options = {
          text,
          model: config.model || 'transformers',
          use_gpu: config.useGpu === true,
        }

        const result = await makeBackendRequest('/api/ai/sentiment', 'POST', options)

        return {
          sentiment: {
            ...result,
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            timestamp: new Date().toISOString(),
          },
        }
      },
    },

    // ==================== DATABASE NODES ====================
    {
      type: 'pc-db-save-metrics',
      label: 'Save Metrics to DB',
      category: 'PC Utility',
      inputs: [
        {
          id: 'metrics',
          label: 'Metrics Data',
          type: 'object',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'result',
          label: 'Save Result',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'tableName',
          label: 'Table Name',
          type: 'text',
          defaultValue: 'system_metrics',
          description: 'Database table name for storing metrics',
        },
      ],
      execute: async (inputs, config) => {
        const metrics = inputs.metrics

        if (!metrics) {
          throw new Error('Metrics data is required')
        }

        const options = {
          metrics,
          table_name: config.tableName || 'system_metrics',
        }

        const result = await makeBackendRequest('/api/db/save-metrics', 'POST', options)

        return {
          result: {
            ...result,
            timestamp: new Date().toISOString(),
          },
        }
      },
    },
  ],

  /**
   * Initialize the addon - check backend connectivity
   */
  initialize: async () => {
    console.log('PC Utility addon initializing...')
    
    try {
      // Check if backend is available
      const response = await fetch(`${BACKEND_URL}/health`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('PC Utility backend connected successfully:', data)
      } else {
        console.warn('PC Utility backend is not responding. Please start the backend service.')
        console.warn(`Run: cd pc_utility_backend && python app.py`)
      }
    } catch (error) {
      console.warn('PC Utility backend is not available at', BACKEND_URL)
      console.warn('Please start the backend service: cd pc_utility_backend && python app.py')
      console.warn('Some nodes may not work without the backend service.')
    }
  },

  /**
   * Cleanup function
   */
  cleanup: async () => {
    console.log('PC Utility addon cleanup complete')
  },
}
