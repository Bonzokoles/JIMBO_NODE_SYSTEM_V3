import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import * as PhosphorIcons from '@phosphor-icons/react'
import { Sparkle, Trash, Pencil, Plus } from '@phosphor-icons/react'
import { CustomNodeDefinition, CustomNodeBuilder } from './CustomNodeBuilder'
import { toast } from 'sonner'

interface CustomNodesManagerProps {
  open: boolean
  onClose: () => void
  onNodeAdd: (type: string) => void
}

export function CustomNodesManager({ open, onClose, onNodeAdd }: CustomNodesManagerProps) {
  const { t } = useTranslation()
  const [customNodes, setCustomNodes] = useKV<CustomNodeDefinition[]>('custom-nodes', [])
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<CustomNodeDefinition | null>(null)
  const [deleteConfirmNode, setDeleteConfirmNode] = useState<CustomNodeDefinition | null>(null)

  const handleCreateNew = () => {
    setEditingNode(null)
    setBuilderOpen(true)
  }

  const handleEdit = (node: CustomNodeDefinition) => {
    setEditingNode(node)
    setBuilderOpen(true)
  }

  const handleDelete = (node: CustomNodeDefinition) => {
    setDeleteConfirmNode(node)
  }

  const confirmDelete = () => {
    if (!deleteConfirmNode) return
    
    setCustomNodes((current) => {
      const nodes = current || []
      return nodes.filter(n => n.id !== deleteConfirmNode.id)
    })
    
    toast.success('Custom node deleted')
    setDeleteConfirmNode(null)
  }

  const handleAddToCanvas = (node: CustomNodeDefinition) => {
    onNodeAdd(node.type)
    toast.success(`Added ${node.label} to canvas`)
  }

  const getIcon = (iconName: string) => {
    const IconComponent = (PhosphorIcons as any)[iconName]
    return IconComponent ? IconComponent : PhosphorIcons.Cube
  }

  const nodes = customNodes || []

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-accent" />
              Custom Nodes Library
            </DialogTitle>
            <DialogDescription>
              Manage your custom workflow nodes. Create, edit, or delete custom nodes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="text-sm text-muted-foreground">
              {nodes.length} custom {nodes.length === 1 ? 'node' : 'nodes'}
            </div>
            <Button onClick={handleCreateNew} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create New Node
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkle className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
                <h3 className="font-medium text-lg mb-2">No custom nodes yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Create your first custom node to extend the workflow builder with your own processing logic
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Your First Node
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 pr-4">
                {nodes.map((node) => {
                  const IconComponent = getIcon(node.iconName)
                  return (
                    <Card key={node.id} className="hover:border-accent transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div 
                            className="p-2 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: `${node.color}20`, color: node.color }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{node.label}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {node.category}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {node.description || 'No description provided'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                              <span>{node.inputs.length} inputs</span>
                              <span>{node.outputs.length} outputs</span>
                              <span>{node.parameters.length} params</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAddToCanvas(node)}
                                className="h-7"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add to Canvas
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEdit(node)}
                                className="h-7"
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDelete(node)}
                                className="h-7 text-destructive hover:text-destructive"
                              >
                                <Trash className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomNodeBuilder
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false)
          setEditingNode(null)
        }}
        editNode={editingNode}
      />

      <Dialog open={!!deleteConfirmNode} onOpenChange={() => setDeleteConfirmNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Node</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmNode?.label}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmNode(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
