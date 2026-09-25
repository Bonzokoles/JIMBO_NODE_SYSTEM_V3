import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { TemplateManager } from '@/lib/templateManager'
import { useWorkflowStore } from '@/store/workflowStore'
import { Badge } from '@/components/ui/badge'

export function SaveAsTemplateDialog() {
  const { t } = useTranslation()
  const { nodes, edges } = useWorkflowStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('custom')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate')
  const [tags, setTags] = useState('')
  const [useCases, setUseCases] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Template name is required')
      return
    }

    if (nodes.length === 0) {
      toast.error('Cannot save empty workflow as template')
      return
    }

    setSaving(true)

    try {
      const tagList = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const useCaseList = useCases
        .split(',')
        .map(uc => uc.trim())
        .filter(Boolean)

      await TemplateManager.saveCustomTemplate(
        name,
        description,
        nodes,
        edges,
        {
          category,
          tags: tagList.length > 0 ? tagList : undefined,
          difficulty,
          useCases: useCaseList.length > 0 ? useCaseList : undefined,
        }
      )

      toast.success('Template saved successfully', {
        description: `"${name}" has been added to your custom templates`,
      })

      setOpen(false)
      setName('')
      setDescription('')
      setCategory('custom')
      setDifficulty('intermediate')
      setTags('')
      setUseCases('')
    } catch (error) {
      toast.error('Failed to save template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={nodes.length === 0}>
          <FloppyDisk className="w-4 h-4" />
          Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save Workflow as Template</DialogTitle>
          <DialogDescription>
            Save your current workflow as a reusable template. You can load it later or share it with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Workflow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does and when to use it..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="data">Data Processing</SelectItem>
                  <SelectItem value="advanced">Advanced AI</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="rag">RAG</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                <SelectTrigger id="template-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-tags">Tags (comma-separated)</Label>
            <Input
              id="template-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ai, automation, api, rag"
            />
            <p className="text-xs text-muted-foreground">
              Add tags to make your template easier to find
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-use-cases">Use Cases (comma-separated)</Label>
            <Input
              id="template-use-cases"
              value={useCases}
              onChange={(e) => setUseCases(e.target.value)}
              placeholder="Customer Support, Data Analysis, Report Generation"
            />
            <p className="text-xs text-muted-foreground">
              Describe scenarios where this template is useful
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Current workflow:</span>
              <Badge variant="outline">{nodes.length} nodes</Badge>
              <Badge variant="outline">{edges.length} connections</Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
