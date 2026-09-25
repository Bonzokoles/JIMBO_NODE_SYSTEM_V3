import { useWorkflowStore } from '@/store/workflowStore'
import { memo, useState, useEffect } from 'react'
import { Handle, Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash, GearSix, CheckCircle, WarningCircle, Circle, Clock, CaretUp, CaretDown } from '@phosphor-icons/react'
import * as PhosphorIcons from '@phosphor-icons/react'
import { WorkflowNode } from '@/store/workflowStore'
import { getNodeDefinition } from '@/lib/nodeDefinitions'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { XtermDisplay } from './XtermDisplay'

export const CustomNode = memo(({ data, id, selected }: NodeProps<WorkflowNode>) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const updateNodeInternals = useUpdateNodeInternals()
  
  useEffect(() => {
    updateNodeInternals(id)
  }, [data.dynamicInputs, data.dynamicOutputs, id, updateNodeInternals])
  
  const addDynamicPort = (type: 'input' | 'output') => {
    if (type === 'input') {
      const current = data.dynamicInputs || 0
      updateNode(id, { dynamicInputs: current + 1 })
    } else {
      const current = data.dynamicOutputs || 0
      updateNode(id, { dynamicOutputs: current + 1 })
    }
  }
  
  const removeDynamicPort = (type: 'input' | 'output') => {
    if (type === 'input') {
      const current = data.dynamicInputs || 0
      if (current > 0) updateNode(id, { dynamicInputs: current - 1 })
    } else {
      const current = data.dynamicOutputs || 0
      if (current > 0) updateNode(id, { dynamicOutputs: current - 1 })
    }
  }

  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const statusColors = {
    idle: 'bg-muted text-muted-foreground',
    running: 'bg-accent text-accent-foreground',
    complete: 'bg-[#00E6A8] text-black',
    error: 'bg-destructive text-destructive-foreground',
  }

  const statusIcons = {
    idle: <Clock className="w-3 h-3" />,
    running: <Circle className="w-3 h-3 animate-spin" weight="bold" />,
    complete: <CheckCircle className="w-3 h-3" weight="fill" />,
    error: <WarningCircle className="w-3 h-3" weight="fill" />,
  }

  const borderClass = data.status === 'running' 
    ? 'border-accent shadow-lg shadow-accent/30 animate-[pulse-border_2s_ease-in-out_infinite]'
    : data.status === 'error'
    ? 'border-destructive shadow-md shadow-destructive/20'
    : data.status === 'complete'
    ? 'border-[#00E6A8]/50 shadow-sm shadow-[#00E6A8]/10'
    : selected
    ? 'border-primary shadow-lg shadow-primary/20'
    : 'border-border'

  const nodeDef = getNodeDefinition(data.type)
  
  const getIcon = () => {
    if (!nodeDef) return <PhosphorIcons.Terminal className="w-4 h-4" />
    const IconComponent = (PhosphorIcons as any)[nodeDef.iconName]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <PhosphorIcons.Terminal className="w-4 h-4" />
  }

  const getCategoryColor = () => {
    if (!nodeDef) return 'text-muted-foreground'
    switch (nodeDef.category) {
      case 'input': return 'text-[#d4a574]'
      case 'ai': return 'text-[#00E6A8]'
      case 'process': return 'text-[#00e5ff]'
      case 'output': return 'text-orange-500'
      default: return 'text-muted-foreground'
    }
  }

  const formatResult = (result: any) => {
    if (!result) return null
    if (typeof result === 'string') return result.length > 100 ? result.slice(0, 100) + '...' : result
    if (result.response) return result.response.length > 100 ? result.response.slice(0, 100) + '...' : result.response
    if (result.summary) return result.summary.length > 100 ? result.summary.slice(0, 100) + '...' : result.summary
    if (result.translation) return result.translation.length > 100 ? result.translation.slice(0, 100) + '...' : result.translation
    return JSON.stringify(result, null, 2).slice(0, 150) + '...'
  }

  const isNodeActive = data.status === 'running' || data.status === 'complete'

  return (
    <>
      <Handle
        id="target"
        type="target"
        position={Position.Left}
        className="!w-2 !h-6 !rounded-none transition-all duration-200 !bg-[#d4a574] !border-[#d4a574] hover:!bg-white"
        style={{ left: -1, top: data.dynamicInputs ? `${100 / ((data.dynamicInputs || 0) + 2)}%` : '50%' }}
      />
      {Array.from({ length: data.dynamicInputs || 0 }).map((_, i) => (
        <Handle
          key={`target-${i + 1}`}
          id={`target-${i + 1}`}
          type="target"
          position={Position.Left}
          className="!w-2 !h-4 !rounded-none transition-all duration-200 !bg-[#d4a574]/70 !border-[#d4a574] hover:!bg-white"
          style={{ left: -1, top: `${(100 / ((data.dynamicInputs || 0) + 2)) * (i + 2)}%` }}
        >
           <span className="absolute -left-3 text-[8px] text-gray-500 font-mono">{i+1}</span>
        </Handle>
      ))}
      <Card className={cn(
        'font-mono min-w-[260px] transition-all duration-300 bg-[#0a0e14] border-[#1a202c] shadow-none !rounded-none',
        isCollapsed ? 'max-w-[280px]' : 'max-w-[340px]',
        borderClass
      )}>
        <div 
          className={cn(
            "flex items-center justify-between gap-2 cursor-pointer p-3",
            !isCollapsed && "border-b border-[#1a202c]"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div 
              className={cn(
                "w-2 h-2 !rounded-none flex-shrink-0 transition-all duration-300",
                isNodeActive ? "bg-[#00E6A8] animate-pulse shadow-[0_0_8px_rgba(0,230,168,0.6)]" : "bg-gray-600"
              )}
            />
            <div className={getCategoryColor()}>
              {getIcon()}
            </div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-gray-200 truncate">{data.label}</h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 text-gray-500">
            {isCollapsed && data.status && (
              <Badge className={cn('text-[10px] !rounded-none px-1 py-0', statusColors[data.status])}>
                {statusIcons[data.status]}
              </Badge>
            )}
            {isCollapsed ? <CaretDown className="w-3 h-3" /> : <CaretUp className="w-3 h-3" />}
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex flex-col">
            <div className="p-3">
              {data.status && (
                <div className="flex justify-start mb-3">
                  <Badge className={cn('text-[10px] uppercase tracking-widest !rounded-none px-1.5 py-0.5', statusColors[data.status])}>
                    <span className="flex items-center gap-1">
                      {statusIcons[data.status]}
                      {data.status}
                    </span>
                  </Badge>
                </div>
              )}
              
              {data.status === 'running' && data.type !== 'terminal-executor' && (
                <div className="mb-2">
                  <div className="h-0.5 w-full bg-[#1a202c] overflow-hidden">
                    <div className="h-full bg-[#00E6A8] animate-[shimmer_1.5s_ease-in-out_infinite] w-full" 
                         style={{
                           backgroundImage: 'linear-gradient(90deg, transparent, #00E6A8, transparent)',
                           backgroundSize: '200% 100%',
                         }}
                    />
                  </div>
                </div>
              )}
              
              {data.type === 'terminal-executor' && (
                <div className="mb-2">
                  <XtermDisplay logs={Array.isArray(data.result?.logs) ? data.result.logs : (data.result ? [String(data.result.output || data.result)] : [])} isRunning={data.status === 'running'} />
                </div>
              )}

              {data.result && data.status === 'complete' && data.type !== 'terminal-executor' && (
                <ScrollArea className="max-h-24 mb-2">
                  <div className="text-[11px] text-gray-400 p-2 bg-[#05070a] border border-[#1a202c]">
                    {formatResult(data.result)}
                  </div>
                </ScrollArea>
              )}
              
              {data.error && (
                <div className="text-[11px] text-destructive mb-2 p-2 bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-1">
                    <WarningCircle className="w-3 h-3 flex-shrink-0 mt-0.5" weight="fill" />
                    <span>{data.error}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-1 p-2 bg-[#05070a] border-t border-[#1a202c]">
              <div className="flex-1 flex gap-2 items-center">
                <div className="flex gap-1 items-center bg-[#1a202c] p-0.5">
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-[10px] !rounded-none hover:bg-white/10" onClick={(e) => { e.stopPropagation(); addDynamicPort('input'); }}>+</Button>
                  <span className="text-[9px] text-gray-400 font-mono">IN</span>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-[10px] !rounded-none hover:bg-white/10" onClick={(e) => { e.stopPropagation(); removeDynamicPort('input'); }}>-</Button>
                </div>
                <div className="flex gap-1 items-center bg-[#1a202c] p-0.5">
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-[10px] !rounded-none hover:bg-white/10" onClick={(e) => { e.stopPropagation(); addDynamicPort('output'); }}>+</Button>
                  <span className="text-[9px] text-gray-400 font-mono">OUT</span>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-[10px] !rounded-none hover:bg-white/10" onClick={(e) => { e.stopPropagation(); removeDynamicPort('output'); }}>-</Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-gray-500 hover:text-white hover:bg-white/10 !rounded-none"
                onClick={(e) => {
                  e.stopPropagation()
                  const event = new CustomEvent('node-configure', { detail: id })
                  window.dispatchEvent(event)
                }}
              >
                <GearSix className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-red-500 hover:text-white hover:bg-red-500/20 !rounded-none"
                onClick={(e) => {
                  e.stopPropagation()
                  const event = new CustomEvent('node-delete', { detail: id })
                  window.dispatchEvent(event)
                }}
              >
                <Trash className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      <Handle
        id="source"
        type="source"
        position={Position.Right}
        className="!w-2 !h-6 !rounded-none transition-all duration-200 !bg-[#00E6A8] !border-[#00E6A8] hover:!bg-white"
        style={{ right: -1, top: data.dynamicOutputs ? `${100 / ((data.dynamicOutputs || 0) + 2)}%` : '50%' }}
      />
      {Array.from({ length: data.dynamicOutputs || 0 }).map((_, i) => (
        <Handle
          key={`source-${i + 1}`}
          id={`source-${i + 1}`}
          type="source"
          position={Position.Right}
          className="!w-2 !h-4 !rounded-none transition-all duration-200 !bg-[#00E6A8]/70 !border-[#00E6A8] hover:!bg-white"
          style={{ right: -1, top: `${(100 / ((data.dynamicOutputs || 0) + 2)) * (i + 2)}%` }}
        >
           <span className="absolute -right-3 text-[8px] text-gray-500 font-mono">{i+1}</span>
        </Handle>
      ))}
    </>
  )
})

CustomNode.displayName = 'CustomNode'
