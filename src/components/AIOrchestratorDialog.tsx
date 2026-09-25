import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkle, Key, Spinner } from '@phosphor-icons/react'
import { useWorkflowStore } from '@/store/workflowStore'
import { addonRegistry } from '@/lib/addons'
import { toast } from 'sonner'
import { getAllNodeDefinitions } from '@/lib/nodeDefinitions'

interface AIOrchestratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIOrchestratorDialog({ open, onOpenChange }: AIOrchestratorDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { importWorkflow } = useWorkflowStore()

  useEffect(() => {
    const savedKey = localStorage.getItem('JIMBO_DEEPSEEK_API_KEY')
    if (savedKey) setApiKey(savedKey)
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to build.')
      return
    }
    if (!apiKey.trim()) {
      toast.error('Please provide a DeepSeek API Key.')
      return
    }
    
    localStorage.setItem('JIMBO_DEEPSEEK_API_KEY', apiKey)
    setIsGenerating(true)

    try {
      const nativeNodes = getAllNodeDefinitions().map(n => ({ type: n.type, label: n.label, description: n.description }))
      const addonNodes = addonRegistry.getAllNodes().map(n => ({ type: n.type, label: n.label, config: n.config?.map(c => c.id) }))
      
      const systemPrompt = `You are the Jimbo Workflow Orchestrator. 
Your task is to generate a JSON representation of a React Flow workflow based on the user's description.
The workflow consists of 'nodes' and 'edges'. 

Available Native Node Types:
${JSON.stringify(nativeNodes, null, 2)}

Available Addon Node Types:
${JSON.stringify(addonNodes, null, 2)}

Rules:
1. Return ONLY valid JSON matching this schema: 
{ 
  "workflowName": "string",
  "nodes": [ { "id": "string", "type": "string", "position": { "x": 0, "y": 0 }, "data": { "label": "string", "type": "string", "config": {} } } ],
  "edges": [ { "id": "string", "source": "string", "target": "string" } ]
}
2. The 'type' property of the node MUST be 'customNode' (this is required by the React Flow engine for our app).
3. The actual specific tool type MUST be placed in 'data.type'.
4. Ensure node positions (x, y) are spaced out logically (e.g. x: 0, 250, 500).
5. Output ONLY the JSON, without markdown formatting like \`\`\`json.
6. Connect the output of one node to the input of another via edges.`

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        })
      })

      if (!response.ok) {
        throw new Error('DeepSeek API request failed: ' + response.statusText)
      }

      const data = await response.json()
      let jsonContent = data.choices[0].message.content
      
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json/, '').replace(/```$/, '')
      }

      const workflowData = JSON.parse(jsonContent)
      importWorkflow(JSON.stringify(workflowData))
      toast.success('AI Workflow Generated successfully!')
      onOpenChange(false)
      
    } catch (error: any) {
      console.error(error)
      toast.error('Failed to generate workflow: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-panel border-panel-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Sparkle weight="fill" className="w-5 h-5" />
            AI Orchestrator (DeepSeek)
          </DialogTitle>
          <DialogDescription>
            Describe the workflow you want to build and the AI will generate the architecture automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              DeepSeek API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prompt">Workflow Description</Label>
            <Textarea
              id="prompt"
              placeholder="e.g. A workflow that takes text input, sends it to DeepSeek CLI, and saves the output to a local file."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Spinner className="w-4 h-4 animate-spin" /> : <Sparkle weight="fill" className="w-4 h-4" />}
            Generate Architecture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


