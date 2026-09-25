import { Addon } from '@/lib/addons'

// Backend URL can be configured via environment variable
const BACKEND_URL = 'http://localhost:7072'

export const terminalControllerAddon: Addon = {
  metadata: {
    id: 'terminal-controller',
    name: 'Terminal Controller',
    version: '1.0.0',
    author: 'PC Utility Team',
    description: 'Dynamic workflow management through code execution and workflow control',
    category: 'tool',
    enabled: true,
    tags: ['terminal', 'automation', 'workflow', 'control'],
  },
  nodes: [
    {
      type: 'terminal-executor',
      label: 'Terminal Executor',
      category: 'Tools',
      inputs: [
        {
          id: 'trigger',
          label: 'Trigger',
          type: 'any',
          required: false,
        },
        {
          id: 'code',
          label: 'Code Input',
          type: 'text',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'result',
          label: 'Execution Result',
          type: 'any',
        },
        {
          id: 'stdout',
          label: 'Standard Output',
          type: 'text',
        },
        {
          id: 'stderr',
          label: 'Error Output',
          type: 'text',
        },
      ],
      config: [
        {
          id: 'language',
          label: 'Language',
          type: 'select',
          options: [
            { label: 'Python', value: 'python' },
            { label: 'JavaScript', value: 'javascript' },
            { label: 'Bash', value: 'bash' },
          ],
          defaultValue: 'python',
          description: 'Select the language for code execution',
        },
        {
          id: 'codeEditor',
          label: 'Code',
          type: 'textarea',
          defaultValue: '# Python code\nresult = "Hello from Terminal Executor!"\nprint(result)',
          placeholder: 'Enter your code here...',
          description: 'Code to execute',
        },
        {
          id: 'workflowContext',
          label: 'Enable Workflow Context',
          type: 'boolean',
          defaultValue: true,
          description: 'Provide access to workflow state and API',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const dynamicCommands = (inputs.dynamic && inputs.dynamic.length > 0) ? inputs.dynamic.map(d => typeof d === 'object' ? (d.command || d.output || JSON.stringify(d)) : String(d)).join('\n') : ''
          const code = inputs.code || inputs.trigger?.command || inputs.trigger || dynamicCommands || config.codeEditor || ''
          const language = config.language || 'python'
          const workflowContext = config.workflowContext !== false

          const response = await fetch(`${BACKEND_URL}/api/terminal/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              language,
              workflow_context: workflowContext,
            }),
          })

          if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(error.detail || `HTTP ${response.status}`)
          }

          const data = await response.json()

          return data
        } catch (error) {
          console.error('Terminal Executor error:', error)
          return {
            result: null,
            stdout: '',
            stderr: error instanceof Error ? error.message : 'Unknown error occurred',
          }
        }
      },
    },
    {
      type: 'workflow-controller',
      label: 'Workflow Controller',
      category: 'Tools',
      inputs: [
        {
          id: 'action',
          label: 'Action',
          type: 'text',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'status',
          label: 'Workflow Status',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'action',
          label: 'Action',
          type: 'select',
          options: [
            { label: 'Start', value: 'start' },
            { label: 'Stop', value: 'stop' },
            { label: 'Pause', value: 'pause' },
            { label: 'Resume', value: 'resume' },
            { label: 'Get Status', value: 'status' },
            { label: 'Modify', value: 'modify' },
          ],
          defaultValue: 'status',
          description: 'Control action to perform',
        },
        {
          id: 'workflowId',
          label: 'Workflow ID',
          type: 'text',
          required: true,
          placeholder: 'workflow-123',
          description: 'Target workflow identifier',
        },
        {
          id: 'modifications',
          label: 'Modifications JSON',
          type: 'textarea',
          placeholder: '{"key": "value"}',
          description: 'JSON configuration for modify action',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const action = inputs.action || config.action || 'status'
          const workflowId = config.workflowId

          if (!workflowId) {
            throw new Error('Workflow ID is required')
          }

          const payload: any = {
            action,
            workflow_id: workflowId,
          }

          if (action === 'modify' && config.modifications) {
            try {
              payload.modifications = JSON.parse(config.modifications)
            } catch (e) {
              throw new Error('Invalid JSON in modifications field')
            }
          }

          const response = await fetch(`${BACKEND_URL}/api/workflow/control`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(error.detail || `HTTP ${response.status}`)
          }

          const data = await response.json()

          return {
            status: data,
          }
        } catch (error) {
          console.error('Workflow Controller error:', error)
          return {
            status: {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
          }
        }
      },
    },
    {
      type: 'parallel-task-manager',
      label: 'Parallel Task Manager',
      category: 'Tools',
      inputs: [
        {
          id: 'tasks',
          label: 'Tasks Array',
          type: 'array',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'results',
          label: 'Task Results',
          type: 'array',
        },
        {
          id: 'status',
          label: 'Execution Status',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'maxConcurrent',
          label: 'Max Concurrent Tasks',
          type: 'number',
          defaultValue: 3,
          description: 'Maximum number of tasks to run concurrently',
        },
        {
          id: 'timeout',
          label: 'Timeout (seconds)',
          type: 'number',
          defaultValue: 300,
          description: 'Maximum time for each task in seconds',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const tasks = inputs.tasks || []
          const maxConcurrent = config.maxConcurrent || 3
          const timeout = config.timeout || 300

          if (!Array.isArray(tasks)) {
            throw new Error('Tasks input must be an array')
          }

          const response = await fetch(`${BACKEND_URL}/api/workflow/parallel`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tasks,
              max_concurrent: maxConcurrent,
              timeout,
            }),
          })

          if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(error.detail || `HTTP ${response.status}`)
          }

          const data = await response.json()

          return {
            results: data.results || [],
            status: data.status || {},
          }
        } catch (error) {
          console.error('Parallel Task Manager error:', error)
          return {
            results: [],
            status: {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
          }
        }
      },
    },
    {
      type: 'dynamic-node-creator',
      label: 'Dynamic Node Creator',
      category: 'Tools',
      inputs: [
        {
          id: 'nodeSpec',
          label: 'Node Specification',
          type: 'object',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'nodeId',
          label: 'Created Node ID',
          type: 'text',
        },
        {
          id: 'node',
          label: 'Complete Node Object',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'nodeType',
          label: 'Node Type',
          type: 'text',
          required: true,
          placeholder: 'text-input',
          description: 'Type of node to create',
        },
        {
          id: 'nodeLabel',
          label: 'Node Label',
          type: 'text',
          required: true,
          placeholder: 'My Node',
          description: 'Display label for the node',
        },
        {
          id: 'nodeConfig',
          label: 'Node Configuration (JSON)',
          type: 'textarea',
          placeholder: '{"value": "Hello"}',
          description: 'Node configuration as JSON',
        },
      ],
      execute: async (inputs, config) => {
        try {
          let nodeSpec = inputs.nodeSpec

          if (!nodeSpec) {
            nodeSpec = {
              type: config.nodeType,
              label: config.nodeLabel,
              config: {},
            }

            if (config.nodeConfig) {
              try {
                nodeSpec.config = JSON.parse(config.nodeConfig)
              } catch (e) {
                throw new Error('Invalid JSON in node configuration')
              }
            }
          }

          if (!nodeSpec.type) {
            throw new Error('Node type is required')
          }

          const response = await fetch(`${BACKEND_URL}/api/workflow/create-node`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(nodeSpec),
          })

          if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(error.detail || `HTTP ${response.status}`)
          }

          const data = await response.json()

          return {
            nodeId: data.node_id,
            node: data.node,
          }
        } catch (error) {
          console.error('Dynamic Node Creator error:', error)
          return {
            nodeId: null,
            node: {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
          }
        }
      },
    },
  ],
  initialize: async () => {
    console.log('Terminal Controller addon initialized')
    // Test backend connectivity
    try {
      const response = await fetch(`${BACKEND_URL}/health`, { method: 'GET' })
      if (response.ok) {
        console.log('Terminal Controller backend is available')
      } else {
        console.warn('Terminal Controller backend is not responding correctly')
      }
    } catch (error) {
      console.warn('Terminal Controller backend is not available. Make sure the backend is running on port 8765.')
    }
  },
  cleanup: async () => {
    console.log('Terminal Controller addon cleaned up')
  },
}



