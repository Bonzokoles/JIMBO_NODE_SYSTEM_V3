import { useWorkflowStore } from '@/store/workflowStore'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, WarningCircle, Circle, Clock } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

export function ExecutionProgress() {
  const { nodes, isExecuting } = useWorkflowStore()
  const [executionTime, setExecutionTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  
  useEffect(() => {
    if (isExecuting && !startTime) {
      setStartTime(Date.now())
    } else if (!isExecuting && startTime) {
      setStartTime(null)
      setExecutionTime(0)
    }
  }, [isExecuting, startTime])
  
  useEffect(() => {
    if (!isExecuting || !startTime) return
    
    const interval = setInterval(() => {
      setExecutionTime(Date.now() - startTime)
    }, 100)
    
    return () => clearInterval(interval)
  }, [isExecuting, startTime])
  
  if (!isExecuting && nodes.every(n => n.data.status === 'idle' || !n.data.status)) {
    return null
  }
  
  const totalNodes = nodes.length
  const completedNodes = nodes.filter(n => n.data.status === 'complete').length
  const errorNodes = nodes.filter(n => n.data.status === 'error').length
  const runningNodes = nodes.filter(n => n.data.status === 'running').length
  const progress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const milliseconds = ms % 1000
    return `${seconds}.${Math.floor(milliseconds / 100)}s`
  }
  
  return (
    <Card className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 min-w-[400px] bg-card/95 backdrop-blur-sm border-border shadow-lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            {isExecuting ? (
              <>
                <Circle className="w-4 h-4 animate-spin text-accent" weight="bold" />
                Executing Workflow
              </>
            ) : errorNodes > 0 ? (
              <>
                <WarningCircle className="w-4 h-4 text-destructive" weight="fill" />
                Execution Failed
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                Execution Complete
              </>
            )}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatTime(executionTime)}
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {completedNodes}/{totalNodes} Completed
            </Badge>
            {runningNodes > 0 && (
              <Badge className="text-xs bg-accent text-accent-foreground">
                {runningNodes} Running
              </Badge>
            )}
            {errorNodes > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorNodes} Failed
              </Badge>
            )}
          </div>
          
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </Card>
  )
}
