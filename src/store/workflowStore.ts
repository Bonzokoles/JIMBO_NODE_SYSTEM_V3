import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react'
import { WorkflowExecutionEngine, topologicalSort, detectCycles, ExecutionContext } from '@/lib/executionEngine'

export type NodeStatus = 'idle' | 'running' | 'complete' | 'error'

export interface WorkflowNode extends Node {
  data: {
    label: string
    type: string
    status?: NodeStatus
    config?: Record<string, any>
    result?: any
    error?: string
  }
}

export interface WorkflowState {
  nodes: WorkflowNode[]
  edges: Edge[]
  selectedNode: WorkflowNode | null
  isExecuting: boolean
  workflowName: string
  history: { nodes: WorkflowNode[], edges: Edge[] }[]
  historyIndex: number
  executionEngine: WorkflowExecutionEngine
  
  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  
  addNode: (node: WorkflowNode) => void
  removeNode: (nodeId: string) => void
  updateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void
  setNodeStatus: (nodeId: string, status: NodeStatus) => void
  
  selectNode: (nodeId: string | null) => void
  setWorkflowName: (name: string) => void
  
  executeWorkflow: () => Promise<void>
  resetWorkflow: () => void
  
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  addToHistory: () => void
  
  exportWorkflow: () => string
  importWorkflow: (data: string) => void
  clearWorkflow: () => void
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    immer((set, get) => ({
    nodes: [],
    edges: [],
    selectedNode: null,
    isExecuting: false,
    workflowName: 'Untitled Workflow',
    history: [],
    historyIndex: -1,
    executionEngine: new WorkflowExecutionEngine(),
    
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    
    onNodesChange: (changes) => set((state) => {
      state.nodes = applyNodeChanges(changes, state.nodes) as WorkflowNode[]
    }),
    
    onEdgesChange: (changes) => set((state) => {
      state.edges = applyEdgeChanges(changes, state.edges)
    }),
    
    onConnect: (connection) => set((state) => {
      state.edges = addEdge(connection, state.edges)
    }),
    
    addNode: (node) => set((state) => {
      state.nodes.push(node)
      get().addToHistory()
    }),
    
    removeNode: (nodeId) => set((state) => {
      state.nodes = state.nodes.filter(n => n.id !== nodeId)
      state.edges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
      if (state.selectedNode?.id === nodeId) {
        state.selectedNode = null
      }
      get().addToHistory()
    }),
    
    updateNode: (nodeId, data) => set((state) => {
      const node = state.nodes.find(n => n.id === nodeId)
      if (node) {
        node.data = { ...node.data, ...data }
        if (state.selectedNode && state.selectedNode.id === nodeId) {
          state.selectedNode.data = node.data
        }
      }
    }),
    
    setNodeStatus: (nodeId, status) => set((state) => {
      const node = state.nodes.find(n => n.id === nodeId)
      if (node) {
        node.data = { ...node.data, status }
      }
    }),
    
    selectNode: (nodeId) => set((state) => {
      state.selectedNode = nodeId ? state.nodes.find(n => n.id === nodeId) || null : null
    }),
    
    setWorkflowName: (name) => set({ workflowName: name }),
    
    addToHistory: () => set((state) => {
      const currentState = { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)) }
      state.history = state.history.slice(0, state.historyIndex + 1)
      state.history.push(currentState)
      if (state.history.length > 50) {
        state.history.shift()
      } else {
        state.historyIndex++
      }
    }),
    
    undo: () => set((state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--
        const previousState = state.history[state.historyIndex]
        state.nodes = JSON.parse(JSON.stringify(previousState.nodes))
        state.edges = JSON.parse(JSON.stringify(previousState.edges))
      }
    }),
    
    redo: () => set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++
        const nextState = state.history[state.historyIndex]
        state.nodes = JSON.parse(JSON.stringify(nextState.nodes))
        state.edges = JSON.parse(JSON.stringify(nextState.edges))
      }
    }),
    
    canUndo: () => {
      return get().historyIndex > 0
    },
    
    canRedo: () => {
      const { history, historyIndex } = get()
      return historyIndex < history.length - 1
    },
    
    exportWorkflow: () => {
      const { nodes, edges, workflowName } = get()
      return JSON.stringify({ nodes, edges, workflowName }, null, 2)
    },
    
    importWorkflow: (data: string) => {
      try {
        const workflow = JSON.parse(data)
        set({
          nodes: workflow.nodes || [],
          edges: workflow.edges || [],
          workflowName: workflow.workflowName || 'Imported Workflow'
        })
        get().addToHistory()
      } catch (error) {
        console.error('Failed to import workflow:', error)
      }
    },
    
    clearWorkflow: () => set({
      nodes: [],
      edges: [],
      selectedNode: null,
      workflowName: 'Untitled Workflow'
    }),
    
    executeWorkflow: async () => {
      const { nodes, edges, executionEngine } = get()
      
      if (detectCycles(nodes, edges)) {
        throw new Error('Workflow contains circular dependencies')
      }
      
      set({ isExecuting: true })
      
      nodes.forEach(node => {
        get().setNodeStatus(node.id, 'idle')
        get().updateNode(node.id, { result: undefined, error: undefined })
      })
      
      const context: ExecutionContext = {
        nodeResults: new Map(),
        startTime: Date.now(),
      }
      
      try {
        const executionOrder = topologicalSort(nodes, edges)
        
        for (const nodeId of executionOrder) {
          const node = nodes.find(n => n.id === nodeId)
          if (!node) continue
          
          get().setNodeStatus(nodeId, 'running')
          
          await new Promise(resolve => setTimeout(resolve, 300))
          
          try {
            const inputEdges = edges.filter(e => e.target === nodeId)
            const inputs = inputEdges.map(e => context.nodeResults.get(e.source))
            
            const result = await executionEngine.executeNode(node, inputs, context)
            
            context.nodeResults.set(nodeId, result)
            
            get().updateNode(nodeId, { 
              result, 
              status: 'complete',
              error: undefined 
            })
          } catch (error) {
            get().updateNode(nodeId, { 
              error: error instanceof Error ? error.message : 'Unknown error',
              status: 'error'
            })
            break
          }
        }
      } catch (error) {
        console.error('Workflow execution failed:', error)
      } finally {
        set({ isExecuting: false })
      }
    },
    
    resetWorkflow: () => set((state) => {
      state.nodes.forEach(node => {
        node.data.status = 'idle'
        node.data.result = undefined
        node.data.error = undefined
      })
    }),
      })),
    {
      name: 'jimbo-workspace-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        workflowName: state.workflowName,
      }),
    }
  )
)

