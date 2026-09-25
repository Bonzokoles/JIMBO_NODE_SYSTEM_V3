import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Play, ArrowClockwise, Trash, ArrowCounterClockwise, ArrowClockwise as Redo, DownloadSimple, UploadSimple, FloppyDisk, Sparkle, TreeStructure, Image as ImageIcon, FilePdf, FolderOpen } from '@phosphor-icons/react'
import { useWorkflowStore } from '@/store/workflowStore'
import { toast } from 'sonner'
import { getLayoutedElements } from '@/lib/autoLayout'
import { exportToPNG, exportToJPEG, exportToPDF } from '@/lib/exportUtils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation as useI18n } from 'react-i18next'
import { TemplateDialog } from '@/components/TemplateDialog'
import { SaveAsTemplateDialog } from '@/components/SaveAsTemplateDialog'
import { WorkflowTemplate } from '@/lib/workflowTemplates'
import { useRef, useState } from 'react'
import { CustomNodesManager } from '@/components/CustomNodesManager'
import { AIOrchestratorDialog } from '@/components/AIOrchestratorDialog'

export function Toolbar() {
  const { t } = useTranslation()
  const { i18n } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [customNodesOpen, setCustomNodesOpen] = useState(false)
    const [orchestratorOpen, setOrchestratorOpen] = useState(false)
  
  const {
    workflowName,
    setWorkflowName,
    executeWorkflow,
    resetWorkflow,
    isExecuting,
    nodes,
    edges,
    setNodes,
    setEdges,
    undo,
    redo,
    canUndo,
    canRedo,
    exportWorkflow,
    importWorkflow,
    clearWorkflow,
  } = useWorkflowStore()

  const handleExecute = async () => {
    if (nodes.length === 0) {
      toast.error('Workflow is empty', {
        description: 'Add some nodes to execute the workflow',
      })
      return
    }

    try {
      toast.info('Starting workflow execution...', {
        description: `Executing ${nodes.length} nodes`,
      })
      await executeWorkflow()
      
      const errorNodes = nodes.filter(n => n.data.status === 'error')
      if (errorNodes.length > 0) {
        toast.error('Workflow execution failed', {
          description: `${errorNodes.length} node(s) encountered errors`,
        })
      } else {
        toast.success('Workflow execution complete!', {
          description: `All ${nodes.length} nodes executed successfully`,
        })
      }
    } catch (error) {
      toast.error('Workflow execution failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handleReset = () => {
    resetWorkflow()
    toast.info('Workflow reset')
  }

  const handleClearWorkflow = () => {
    clearWorkflow()
    toast.info('Workflow cleared')
  }

  const handleExport = () => {
    const data = exportWorkflow()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Workflow exported')
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = event.target?.result as string
          importWorkflow(data)
          toast.success('Workflow imported')
        } catch (error) {
          toast.error('Failed to import workflow')
        }
      }
      reader.readAsText(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleLoadTemplate = (template: WorkflowTemplate) => {
    setNodes(template.nodes)
    setEdges(template.edges)
    setWorkflowName(template.name)
    toast.success(`Template "${template.name}" loaded`)
  }

  const handleCustomNodeAdd = (type: string) => {
    const nodeDef = { type, label: type }
    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: {
        label: nodeDef.label,
        type,
        status: 'idle' as const,
        config: {},
      },
    }
    setNodes([...nodes, newNode as any])
    setCustomNodesOpen(false)
  }

  const handleAutoLayout = async () => {
    if (nodes.length === 0) {
      toast.error('No nodes to layout')
      return
    }

    try {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
        nodes,
        edges
      )
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
      toast.success('Auto-layout applied')
    } catch (error) {
      toast.error('Failed to apply auto-layout')
    }
  }

  const handleExportImage = async (format: 'png' | 'jpeg' | 'pdf') => {
    if (nodes.length === 0) {
      toast.error('No workflow to export')
      return
    }

    try {
      const fileName = `${workflowName.replace(/\s+/g, '-').toLowerCase()}`
      
      if (format === 'png') {
        await exportToPNG('workflow-canvas', `${fileName}.png`)
        toast.success('Exported as PNG')
      } else if (format === 'jpeg') {
        await exportToJPEG('workflow-canvas', `${fileName}.jpg`)
        toast.success('Exported as JPEG')
      } else if (format === 'pdf') {
        await exportToPDF('workflow-canvas', `${fileName}.pdf`)
        toast.success('Exported as PDF')
      }
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`)
    }
  }

  return (
    <>
    <div className="h-14 border-b border-[#1a202c] bg-[#05070a]/70 backdrop-blur-md px-4 flex items-center gap-3 relative z-50">
      <div className="flex items-center gap-2 min-w-[280px]">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-none" />
        <h1 className="text-xl font-bold text-primary tracking-tight whitespace-nowrap">
          JIMBO_NODE_SYSTEM_V3
        </h1>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <Input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        className="w-56 h-9"
        placeholder={t('workflow.untitled')}
      />

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <ArrowCounterClockwise className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          disabled={nodes.length === 0}
          title="Save Workflow (Ctrl+S)"
        >
          <FloppyDisk className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImport}
          title="Open Workflow"
        >
          <FolderOpen className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={nodes.length === 0}
              title="Export as Image/PDF"
            >
              <DownloadSimple className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExportImage('png')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Export PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportImage('jpeg')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Export JPEG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportImage('pdf')}>
              <FilePdf className="w-4 h-4 mr-2" />
              Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAutoLayout}
          disabled={nodes.length === 0}
          title="Auto-Layout (ELK.js)"
        >
          <TreeStructure className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="flex-1" />

      <Select
        value={i18n.language}
        onValueChange={(lng) => i18n.changeLanguage(lng)}
      >
        <SelectTrigger className="w-24 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">EN</SelectItem>
          <SelectItem value="pl">PL</SelectItem>
        </SelectContent>
      </Select>

      <TemplateDialog onSelectTemplate={handleLoadTemplate} />

      <SaveAsTemplateDialog />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCustomNodesOpen(true)}
        title="Custom Node Builder"
      >
        <Sparkle className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearWorkflow}
        disabled={isExecuting}
      >
        <Trash className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex gap-2">
        <Button
          onClick={handleExecute}
          disabled={isExecuting}
          className="gap-2"
        >
          <Play className="w-4 h-4" weight="fill" />
          {isExecuting ? t('workflow.executing') : t('workflow.execute')}
        </Button>

        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isExecuting}
          className="gap-2"
        >
          <ArrowClockwise className="w-4 h-4" />
          {t('workflow.reset')}
        </Button>
      </div>
    </div>

    <CustomNodesManager
      open={customNodesOpen}
      onClose={() => setCustomNodesOpen(false)}
      onNodeAdd={handleCustomNodeAdd}
    />
      <AIOrchestratorDialog open={orchestratorOpen} onOpenChange={setOrchestratorOpen} />
    </>
  )
}



