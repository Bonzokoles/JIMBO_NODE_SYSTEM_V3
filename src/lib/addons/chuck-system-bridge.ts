import { Addon } from '@/lib/addons'

/**
 * CHUCK System Bridge Integration
 * Connects Node'y with CHUCK_indst_shemat's MCP Server, Setup Scoring, and DAG Validation
 */

// Mock CHUCK tool database (in real implementation, would fetch from CHUCK_indst_shemat)
const CHUCK_TOOLS = [
  {
    id: 'claude-ai',
    name: 'Claude AI',
    type: 'llm',
    workflow: ['seo', 'rag', 'ecom'],
    category: 'ai-model',
    description: 'Anthropic Claude AI assistant',
    stack: 'anthropic',
  },
  {
    id: 'openai-gpt',
    name: 'OpenAI GPT',
    type: 'llm',
    workflow: ['seo', 'rag', 'ecom'],
    category: 'ai-model',
    description: 'OpenAI GPT models',
    stack: 'openai',
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    type: 'writer',
    workflow: ['seo', 'ecom'],
    category: 'content',
    description: 'AI-powered content writing tool',
    stack: 'custom',
  },
  {
    id: 'vector-store',
    name: 'Vector Store',
    type: 'database',
    workflow: ['rag'],
    category: 'storage',
    description: 'Vector database for embeddings',
    stack: 'pinecone',
  },
  {
    id: 'web-scraper',
    name: 'Web Scraper',
    type: 'api',
    workflow: ['seo', 'ecom'],
    category: 'data',
    description: 'Web scraping and data extraction',
    stack: 'puppeteer',
  },
]

// Mock CHUCK setups
const CHUCK_SETUPS = [
  {
    id: 'seo-basic',
    name: 'Basic SEO Setup',
    workflow: 'seo',
    tools: ['openai-gpt', 'content-writer', 'web-scraper'],
    quality: 0.75,
  },
  {
    id: 'rag-advanced',
    name: 'Advanced RAG Setup',
    workflow: 'rag',
    tools: ['claude-ai', 'vector-store'],
    quality: 0.85,
  },
]

// DAG validation utilities (from CHUCK system)
function hasCycle(nodes: string[], edges: Array<[string, string]>): boolean {
  const graph = new Map<string, string[]>()
  
  // Build adjacency list
  for (const node of nodes) {
    graph.set(node, [])
  }
  
  for (const [from, to] of edges) {
    if (graph.has(from)) {
      graph.get(from)!.push(to)
    }
  }
  
  // DFS with recursion stack
  const visited = new Set<string>()
  const recStack = new Set<string>()
  
  function dfs(node: string): boolean {
    visited.add(node)
    recStack.add(node)
    
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true
        }
      } else if (recStack.has(neighbor)) {
        return true // Cycle detected
      }
    }
    
    recStack.delete(node)
    return false
  }
  
  for (const node of nodes) {
    if (!visited.has(node)) {
      if (dfs(node)) {
        return true
      }
    }
  }
  
  return false
}

function calculateSetupQuality(tools: string[], workflow: string): any {
  // Mock scoring based on CHUCK's algorithm
  const requiredTypes: Record<string, string[]> = {
    'seo': ['llm', 'writer', 'api'],
    'rag': ['llm', 'database'],
    'ecom': ['llm', 'writer', 'api'],
  }
  
  const required = requiredTypes[workflow] || []
  const toolObjs = CHUCK_TOOLS.filter(t => tools.includes(t.id))
  const toolTypes = toolObjs.map(t => t.type)
  
  // Completeness: how many required types are present
  const completeness = required.filter(type => toolTypes.includes(type)).length / required.length
  
  // Compatibility: tools work together
  const compatibility = 0.9 // Mock
  
  // Diversity: variety of tools
  const diversity = new Set(toolTypes).size / toolTypes.length
  
  // Overall score
  const score = (completeness * 0.5 + compatibility * 0.3 + diversity * 0.2) * 100
  
  return {
    score: Math.round(score),
    completeness: Math.round(completeness * 100),
    compatibility: Math.round(compatibility * 100),
    diversity: Math.round(diversity * 100),
    recommendations: generateRecommendations(required, toolTypes),
  }
}

function generateRecommendations(required: string[], present: string[]): string[] {
  const missing = required.filter(type => !present.includes(type))
  return missing.map(type => `Consider adding a ${type} tool`)
}

export const chuckSystemBridgeAddon: Addon = {
  metadata: {
    id: 'chuck-system-bridge',
    name: 'CHUCK System Bridge',
    version: '1.0.0',
    author: 'Node\'y Team',
    description: 'Integration with CHUCK_indst_shemat MCP Server, Setup Scoring, and DAG Validation',
    category: 'framework',
    enabled: true,
  },
  nodes: [
    // CHUCK Tool Search Node
    {
      type: 'chuck-tool-search',
      label: 'CHUCK Tool Search',
      category: 'CHUCK',
      inputs: [
        {
          id: 'workflow',
          label: 'Workflow Type',
          type: 'text',
          required: false,
        },
        {
          id: 'type',
          label: 'Tool Type',
          type: 'text',
          required: false,
        },
        {
          id: 'search',
          label: 'Search Term',
          type: 'text',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'tools',
          label: 'Matching Tools',
          type: 'array',
        },
        {
          id: 'count',
          label: 'Result Count',
          type: 'number',
        },
      ],
      config: [
        {
          id: 'workflow',
          label: 'Filter by Workflow',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'SEO', value: 'seo' },
            { label: 'RAG', value: 'rag' },
            { label: 'E-commerce', value: 'ecom' },
          ],
          defaultValue: '',
        },
        {
          id: 'type',
          label: 'Filter by Type',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'LLM', value: 'llm' },
            { label: 'Writer', value: 'writer' },
            { label: 'API', value: 'api' },
            { label: 'Database', value: 'database' },
          ],
          defaultValue: '',
        },
        {
          id: 'maxResults',
          label: 'Max Results',
          type: 'number',
          defaultValue: 10,
        },
      ],
      execute: async (inputs, config) => {
        let tools = [...CHUCK_TOOLS]
        
        // Filter by workflow
        const workflow = inputs.workflow || config.workflow
        if (workflow) {
          tools = tools.filter(t => t.workflow.includes(workflow))
        }
        
        // Filter by type
        const type = inputs.type || config.type
        if (type) {
          tools = tools.filter(t => t.type === type)
        }
        
        // Filter by search term
        const search = inputs.search
        if (search) {
          const searchLower = search.toLowerCase()
          tools = tools.filter(t => 
            t.name.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower)
          )
        }
        
        // Limit results
        tools = tools.slice(0, config.maxResults)
        
        return {
          tools,
          count: tools.length,
        }
      },
    },

    // CHUCK Setup Scorer Node
    {
      type: 'chuck-setup-scorer',
      label: 'CHUCK Setup Scorer',
      category: 'CHUCK',
      inputs: [
        {
          id: 'tools',
          label: 'Tool IDs',
          type: 'array',
          required: true,
        },
        {
          id: 'workflow',
          label: 'Workflow Type',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'score',
          label: 'Quality Score',
          type: 'number',
        },
        {
          id: 'completeness',
          label: 'Completeness',
          type: 'number',
        },
        {
          id: 'compatibility',
          label: 'Compatibility',
          type: 'number',
        },
        {
          id: 'diversity',
          label: 'Diversity',
          type: 'number',
        },
        {
          id: 'recommendations',
          label: 'Recommendations',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'workflow',
          label: 'Workflow Type',
          type: 'select',
          options: [
            { label: 'SEO', value: 'seo' },
            { label: 'RAG', value: 'rag' },
            { label: 'E-commerce', value: 'ecom' },
          ],
          defaultValue: 'seo',
        },
        {
          id: 'strictMode',
          label: 'Strict Mode',
          type: 'select',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
          defaultValue: 'false',
        },
      ],
      execute: async (inputs, config) => {
        const tools = inputs.tools || []
        const workflow = inputs.workflow || config.workflow
        
        const result = calculateSetupQuality(tools, workflow)
        
        return result
      },
    },

    // CHUCK DAG Validator Node
    {
      type: 'chuck-dag-validator',
      label: 'CHUCK DAG Validator',
      category: 'CHUCK',
      inputs: [
        {
          id: 'nodes',
          label: 'Node IDs',
          type: 'array',
          required: true,
        },
        {
          id: 'edges',
          label: 'Edges',
          type: 'array',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'isValid',
          label: 'Is Valid',
          type: 'boolean',
        },
        {
          id: 'hasCycle',
          label: 'Has Cycle',
          type: 'boolean',
        },
        {
          id: 'issues',
          label: 'Issues',
          type: 'array',
        },
        {
          id: 'suggestions',
          label: 'Suggestions',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'validationLevel',
          label: 'Validation Level',
          type: 'select',
          options: [
            { label: 'Strict', value: 'strict' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Loose', value: 'loose' },
          ],
          defaultValue: 'moderate',
        },
        {
          id: 'autoFix',
          label: 'Auto-fix Cycles',
          type: 'select',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
          defaultValue: 'false',
        },
      ],
      execute: async (inputs, config) => {
        const nodes = inputs.nodes || []
        const edges = inputs.edges || []
        
        // Convert edges to array of tuples
        const edgeTuples: Array<[string, string]> = edges.map((edge: any) => {
          if (Array.isArray(edge)) {
            return edge as [string, string]
          }
          return [edge.from || edge.source, edge.to || edge.target]
        })
        
        const cycleDetected = hasCycle(nodes, edgeTuples)
        const issues: string[] = []
        const suggestions: string[] = []
        
        if (cycleDetected) {
          issues.push('Cycle detected in graph')
          suggestions.push('Remove one or more edges to break the cycle')
        }
        
        // Check for disconnected nodes
        const connectedNodes = new Set<string>()
        for (const [from, to] of edgeTuples) {
          connectedNodes.add(from)
          connectedNodes.add(to)
        }
        
        const disconnected = nodes.filter(n => !connectedNodes.has(n))
        if (disconnected.length > 0 && config.validationLevel === 'strict') {
          issues.push(`${disconnected.length} disconnected nodes found`)
          suggestions.push('Connect all nodes to the workflow')
        }
        
        const isValid = issues.length === 0
        
        return {
          isValid,
          hasCycle: cycleDetected,
          issues,
          suggestions,
        }
      },
    },

    // CHUCK MCP Query Node
    {
      type: 'chuck-mcp-query',
      label: 'CHUCK MCP Query',
      category: 'CHUCK',
      inputs: [
        {
          id: 'query',
          label: 'Query',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'response',
          label: 'Response',
          type: 'text',
        },
        {
          id: 'tools',
          label: 'Relevant Tools',
          type: 'array',
        },
        {
          id: 'setups',
          label: 'Relevant Setups',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'mcpServerUrl',
          label: 'MCP Server URL',
          type: 'text',
          defaultValue: 'http://localhost:3000',
        },
        {
          id: 'queryType',
          label: 'Query Type',
          type: 'select',
          options: [
            { label: 'Search', value: 'search' },
            { label: 'Suggest', value: 'suggest' },
            { label: 'Compare', value: 'compare' },
            { label: 'Build', value: 'build' },
          ],
          defaultValue: 'search',
        },
      ],
      execute: async (inputs, config) => {
        const query = inputs.query || ''
        const queryType = config.queryType
        
        // Mock MCP query (in real implementation, would call CHUCK MCP server)
        const queryLower = query.toLowerCase()
        
        let tools = CHUCK_TOOLS
        let setups = CHUCK_SETUPS
        
        // Simple keyword matching
        if (queryLower.includes('seo')) {
          tools = tools.filter(t => t.workflow.includes('seo'))
          setups = setups.filter(s => s.workflow === 'seo')
        } else if (queryLower.includes('rag')) {
          tools = tools.filter(t => t.workflow.includes('rag'))
          setups = setups.filter(s => s.workflow === 'rag')
        }
        
        const response = `Found ${tools.length} tools and ${setups.length} setups matching "${query}"`
        
        return {
          response,
          tools,
          setups,
        }
      },
    },

    // CHUCK Workflow Import Node
    {
      type: 'chuck-workflow-import',
      label: 'CHUCK Workflow Import',
      category: 'CHUCK',
      inputs: [
        {
          id: 'setupId',
          label: 'Setup ID',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'workflow',
          label: 'Imported Workflow',
          type: 'object',
        },
        {
          id: 'nodes',
          label: 'Generated Nodes',
          type: 'array',
        },
        {
          id: 'edges',
          label: 'Generated Connections',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'setupId',
          label: 'Setup ID or Name',
          type: 'text',
          defaultValue: '',
        },
        {
          id: 'autoConnect',
          label: 'Auto-connect Nodes',
          type: 'select',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
          defaultValue: 'true',
        },
      ],
      execute: async (inputs, config) => {
        const setupId = inputs.setupId || config.setupId
        
        // Find setup
        const setup = CHUCK_SETUPS.find(s => s.id === setupId || s.name === setupId)
        if (!setup) {
          throw new Error(`Setup not found: ${setupId}`)
        }
        
        // Generate nodes for each tool
        const nodes = setup.tools.map((toolId, index) => {
          const tool = CHUCK_TOOLS.find(t => t.id === toolId)
          return {
            id: `node-${index}`,
            type: tool?.type || 'custom',
            label: tool?.name || toolId,
            toolId,
            x: 100 + index * 200,
            y: 100,
          }
        })
        
        // Generate edges (sequential chain)
        const edges: Array<[string, string]> = []
        if (config.autoConnect === 'true') {
          for (let i = 0; i < nodes.length - 1; i++) {
            edges.push([nodes[i].id, nodes[i + 1].id])
          }
        }
        
        const workflow = {
          id: setup.id,
          name: setup.name,
          type: setup.workflow,
          nodes,
          edges,
        }
        
        return {
          workflow,
          nodes,
          edges,
        }
      },
    },

    // List CHUCK Tools Node
    {
      type: 'chuck-tools-list',
      label: 'List CHUCK Tools',
      category: 'CHUCK',
      inputs: [],
      outputs: [
        {
          id: 'tools',
          label: 'All Tools',
          type: 'array',
        },
        {
          id: 'count',
          label: 'Total Count',
          type: 'number',
        },
        {
          id: 'categories',
          label: 'Categories',
          type: 'array',
        },
      ],
      config: [],
      execute: async () => {
        const categories = Array.from(new Set(CHUCK_TOOLS.map(t => t.category)))
        
        return {
          tools: CHUCK_TOOLS,
          count: CHUCK_TOOLS.length,
          categories,
        }
      },
    },

    // List CHUCK Setups Node
    {
      type: 'chuck-setups-list',
      label: 'List CHUCK Setups',
      category: 'CHUCK',
      inputs: [],
      outputs: [
        {
          id: 'setups',
          label: 'All Setups',
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
        return {
          setups: CHUCK_SETUPS,
          count: CHUCK_SETUPS.length,
        }
      },
    },
  ],
}
