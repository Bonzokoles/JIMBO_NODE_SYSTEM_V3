import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ListChecks, CheckCircle, WarningCircle, Clock, ArrowRight } from '@phosphor-icons/react'
import { useWorkflowStore } from '@/store/workflowStore'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function ExecutionLog() {
  const { nodes } = useWorkflowStore()
  const [open, setOpen] = useState(false)
  
  const executedNodes = nodes.filter(n => n.data.status && n.data.status !== 'idle')
  const hasExecutions = executedNodes.length > 0
  
  if (!hasExecutions) return null
  
  const completedCount = nodes.filter(n => n.data.status === 'complete').length
  const errorCount = nodes.filter(n => n.data.status === 'error').length
  const runningCount = nodes.filter(n => n.data.status === 'running').length
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="fixed bottom-6 right-6 z-40 gap-2 shadow-lg"
        >
          <ListChecks className="w-4 h-4" />
          Execution Log
          {hasExecutions && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {executedNodes.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Execution Log
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                <div>
                  <div className="font-semibold">{completedCount}</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <div>
                  <div className="font-semibold">{runningCount}</div>
                  <div className="text-xs text-muted-foreground">Running</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <WarningCircle className="w-4 h-4 text-destructive" weight="fill" />
                <div>
                  <div className="font-semibold">{errorCount}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </Card>
          </div>
          
          <Separator />
          
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3 pr-4">
              {executedNodes.map((node, index) => (
                <Card key={node.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-sm">{node.data.label}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{node.data.type}</p>
                    </div>
                    <Badge 
                      variant={
                        node.data.status === 'complete' ? 'default' :
                        node.data.status === 'error' ? 'destructive' :
                        node.data.status === 'running' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {node.data.status === 'complete' && <CheckCircle className="w-3 h-3 mr-1" weight="fill" />}
                      {node.data.status === 'error' && <WarningCircle className="w-3 h-3 mr-1" weight="fill" />}
                      {node.data.status === 'running' && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                      {node.data.status}
                    </Badge>
                  </div>
                  
                  {node.data.result && node.data.status === 'complete' && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1 mb-1">
                        <ArrowRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">Output</span>
                      </div>
                      <div className="text-xs font-mono bg-muted/50 p-2 rounded border border-border/50 max-h-32 overflow-auto">
                        {typeof node.data.result === 'string' 
                          ? node.data.result
                          : node.data.result.response 
                          ? node.data.result.response
                          : node.data.result.summary
                          ? node.data.result.summary
                          : node.data.result.translation
                          ? node.data.result.translation
                          : JSON.stringify(node.data.result, null, 2)
                        }
                      </div>
                    </div>
                  )}
                  
                  {node.data.error && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1 mb-1">
                        <WarningCircle className="w-3 h-3 text-destructive" weight="fill" />
                        <span className="text-xs font-semibold text-destructive">Error</span>
                      </div>
                      <div className="text-xs bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">
                        {node.data.error}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
