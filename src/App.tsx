import { useEffect, useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Toolbar } from '@/components/Toolbar'
import { NodePalette } from '@/components/NodePalette'
import { WorkflowCanvasWithProvider } from '@/components/WorkflowCanvas'
import { PropertiesPanel } from '@/components/PropertiesPanel'
import { ExecutionLog } from '@/components/ExecutionLog'
import { ConfigurationBar } from '@/components/ConfigurationBar'
import { CodeInputWindow } from '@/components/CodeInputWindow'
import { useWorkflowStore, WorkflowNode } from '@/store/workflowStore'
import { getNodeDefinition } from '@/lib/nodeDefinitions'
import { Edge } from '@xyflow/react'
import '@/lib/i18n'
import { addonRegistry } from '@/lib/addons'
import { EXAMPLE_ADDONS } from '@/lib/exampleAddons'

interface SavedWorkflow {
  nodes: WorkflowNode[]
  edges: Edge[]
}

function App() {
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false)
  const { nodes, edges, setNodes, setEdges, removeNode, selectNode, addNode, undo, redo, canUndo, canRedo, exportWorkflow } = useWorkflowStore()
  const [savedWorkflow, setSavedWorkflow] = useKV<SavedWorkflow>('jimbo-workflow', { nodes: [], edges: [] })

  const [minimapEnabled, setMinimapEnabled] = useKV<boolean>('minimap-enabled', true)
  const [minimapOpacity, setMinimapOpacity] = useKV<number>('minimap-opacity', 1)
  const [backgroundImage, setBackgroundImage] = useKV<string | null>('canvas-background-image', null)
  const [backgroundOpacity, setBackgroundOpacity] = useKV<number>('canvas-background-opacity', 0.3)

  useEffect(() => {
    const registeredAddons = new Set<string>()
    
    EXAMPLE_ADDONS.forEach(addon => {
      if (!registeredAddons.has(addon.metadata.id)) {
        try {
          addonRegistry.register(addon)
          registeredAddons.add(addon.metadata.id)
        } catch (err) {
          console.log(`Addon ${addon.metadata.id} already registered`)
        }
      }
    })
  }, [])

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('ResizeObserver loop')) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    if (savedWorkflow && savedWorkflow.nodes) {
      setNodes(savedWorkflow.nodes)
      setEdges(savedWorkflow.edges)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSavedWorkflow(() => ({ nodes, edges }))
    }, 1000)

    return () => clearTimeout(timer)
  }, [nodes, edges, setSavedWorkflow])

  useEffect(() => {
    const handleNodeConfigure = (e: Event) => {
      const customEvent = e as CustomEvent
      selectNode(customEvent.detail)
      setPropertiesPanelOpen(true)
    }

    const handleNodeDelete = (e: Event) => {
      const customEvent = e as CustomEvent
      removeNode(customEvent.detail)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo()) undo()
      }
      
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        if (canRedo()) redo()
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const data = exportWorkflow()
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'workflow.json'
        a.click()
        URL.revokeObjectURL(url)
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNode = useWorkflowStore.getState().selectedNode
        if (selectedNode && !propertiesPanelOpen) {
          e.preventDefault()
          removeNode(selectedNode.id)
        }
      }
    }

    window.addEventListener('node-configure', handleNodeConfigure)
    window.addEventListener('node-delete', handleNodeDelete)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('node-configure', handleNodeConfigure)
      window.removeEventListener('node-delete', handleNodeDelete)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectNode, removeNode, undo, redo, canUndo, canRedo, exportWorkflow, propertiesPanelOpen])

  const handleNodeAdd = useCallback((type: string) => {
    const nodeDef = getNodeDefinition(type)
    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: {
        label: nodeDef?.label || type,
        type,
        status: 'idle' as const,
        config: {},
      },
    }
    addNode(newNode)
  }, [addNode])

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Toolbar />
      
      <div className="flex-1 flex overflow-hidden">
        <NodePalette onNodeAdd={handleNodeAdd} />
        <WorkflowCanvasWithProvider
          minimapEnabled={canvasConfig?.minimapEnabled ?? true}
          minimapOpacity={canvasConfig?.minimapOpacity ?? 1}
          backgroundImage={canvasConfig?.backgroundImage ?? null}
          backgroundOpacity={canvasConfig?.backgroundOpacity ?? 0.3}
        />
      </div>

      <PropertiesPanel
        open={propertiesPanelOpen}
        onClose={() => setPropertiesPanelOpen(false)}
      />

      <ExecutionLog />

      <ConfigurationBar
        minimapEnabled={canvasConfig?.minimapEnabled ?? true}
        minimapOpacity={canvasConfig?.minimapOpacity ?? 1}
        onMinimapToggle={() => updateCanvasConfig({ minimapEnabled: !canvasConfig?.minimapEnabled })}
        onMinimapOpacityChange={(opacity) => updateCanvasConfig({ minimapOpacity: opacity })}
        backgroundImage={canvasConfig?.backgroundImage ?? null}
        backgroundOpacity={(canvasConfig?.backgroundOpacity ?? 0.3) * 100}
        onBackgroundImageChange={(url) => updateCanvasConfig({ backgroundImage: url })}
        onBackgroundOpacityChange={(opacity) => updateCanvasConfig({ backgroundOpacity: opacity / 100 })}
      />

      <CodeInputWindow />

      <Toaster />
    </div>
  )
}

export default App