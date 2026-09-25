import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkle, Plus, Lightbulb } from '@phosphor-icons/react'
import { CustomNodeDefinition } from './CustomNodeBuilder'
import { useState } from 'react'
import { CustomNodesManager } from './CustomNodesManager'

export function CustomNodeWelcome() {
  const [customNodes] = useKV<CustomNodeDefinition[]>('custom-nodes', [])
  const [managerOpen, setManagerOpen] = useState(false)

  const nodes = customNodes || []

  if (nodes.length > 0) return null

  return (
    <>
      <Card className="border-2 border-dashed border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkle className="w-5 h-5 text-accent" />
            Create Your First Custom Node
          </CardTitle>
          <CardDescription>
            Extend the workflow builder with your own custom nodes. Define inputs, outputs, and processing logic visually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">What can you build?</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• Custom data transformers for your specific use case</li>
                  <li>• Integration nodes for APIs you frequently use</li>
                  <li>• Specialized processing nodes with unique parameters</li>
                  <li>• Reusable workflow components</li>
                </ul>
              </div>
            </div>
            
            <Button onClick={() => setManagerOpen(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Open Custom Node Builder
            </Button>
          </div>
        </CardContent>
      </Card>

      <CustomNodesManager
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        onNodeAdd={() => {}}
      />
    </>
  )
}
