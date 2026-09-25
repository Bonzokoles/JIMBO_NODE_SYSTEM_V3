import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import * as PhosphorIcons from '@phosphor-icons/react'
import { Plus, Trash, Sparkle, Code, Database, Brain, ArrowRight } from '@phosphor-icons/react'

export interface CustomNodeDefinition {
  id: string
  type: string
  label: string
  iconName: string
  category: 'input' | 'ai' | 'process' | 'output' | 'custom'
  description: string
  color: string
  inputs: NodeInput[]
  outputs: NodeOutput[]
  parameters: NodeParameter[]
  logic?: string
  createdAt: number
}

export interface NodeInput {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'
  required: boolean
  description: string
}

export interface NodeOutput {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'
  description: string
}

export interface NodeParameter {
  id: string
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'text'
  defaultValue?: any
  options?: string[]
  required: boolean
  description: string
}

interface CustomNodeBuilderProps {
  open: boolean
  onClose: () => void
  onSave?: (node: CustomNodeDefinition) => void
  editNode?: CustomNodeDefinition | null
}

const AVAILABLE_ICONS = [
  'Cube', 'Lightning', 'Brain', 'Code', 'Database', 'Gear', 
  'Sparkle', 'Star', 'Heart', 'Fire', 'Cloud', 'Robot',
  'Wrench', 'Hammer', 'Pencil', 'Rocket', 'Target', 'Trophy',
  'BookOpen', 'FlaskConical', 'Atom', 'CircuitBoard', 'Cpu',
  'Function', 'Package', 'Puzzle', 'Stack', 'TreeStructure'
]

const CATEGORY_COLORS = {
  input: 'oklch(0.6 0.15 220)',
  ai: 'oklch(0.65 0.2 145)',
  process: 'oklch(0.7 0.18 265)',
  output: 'oklch(0.65 0.2 30)',
  custom: 'oklch(0.75 0.19 145)'
}

export function CustomNodeBuilder({ open, onClose, onSave, editNode }: CustomNodeBuilderProps) {
  const { t } = useTranslation()
  const [customNodes, setCustomNodes] = useKV<CustomNodeDefinition[]>('custom-nodes', [])
  
  const [nodeName, setNodeName] = useState(editNode?.label || '')
  const [nodeDescription, setNodeDescription] = useState(editNode?.description || '')
  const [nodeCategory, setNodeCategory] = useState<CustomNodeDefinition['category']>(editNode?.category || 'custom')
  const [nodeIcon, setNodeIcon] = useState(editNode?.iconName || 'Cube')
  const [inputs, setInputs] = useState<NodeInput[]>(editNode?.inputs || [])
  const [outputs, setOutputs] = useState<NodeOutput[]>(editNode?.outputs || [])
  const [parameters, setParameters] = useState<NodeParameter[]>(editNode?.parameters || [])
  const [logicCode, setLogicCode] = useState(editNode?.logic || '')
  
  const [currentTab, setCurrentTab] = useState<'basic' | 'inputs' | 'outputs' | 'params' | 'logic'>('basic')

  const handleAddInput = () => {
    const newInput: NodeInput = {
      id: `input-${Date.now()}`,
      name: `input${inputs.length + 1}`,
      type: 'any',
      required: true,
      description: ''
    }
    setInputs([...inputs, newInput])
  }

  const handleRemoveInput = (id: string) => {
    setInputs(inputs.filter(i => i.id !== id))
  }

  const handleUpdateInput = (id: string, field: keyof NodeInput, value: any) => {
    setInputs(inputs.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const handleAddOutput = () => {
    const newOutput: NodeOutput = {
      id: `output-${Date.now()}`,
      name: `output${outputs.length + 1}`,
      type: 'any',
      description: ''
    }
    setOutputs([...outputs, newOutput])
  }

  const handleRemoveOutput = (id: string) => {
    setOutputs(outputs.filter(o => o.id !== id))
  }

  const handleUpdateOutput = (id: string, field: keyof NodeOutput, value: any) => {
    setOutputs(outputs.map(o => o.id === id ? { ...o, [field]: value } : o))
  }

  const handleAddParameter = () => {
    const newParam: NodeParameter = {
      id: `param-${Date.now()}`,
      name: `param${parameters.length + 1}`,
      label: `Parameter ${parameters.length + 1}`,
      type: 'string',
      required: false,
      description: ''
    }
    setParameters([...parameters, newParam])
  }

  const handleRemoveParameter = (id: string) => {
    setParameters(parameters.filter(p => p.id !== id))
  }

  const handleUpdateParameter = (id: string, field: keyof NodeParameter, value: any) => {
    setParameters(parameters.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleSave = () => {
    if (!nodeName.trim()) {
      toast.error('Please enter a node name')
      return
    }

    const nodeType = nodeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const customNode: CustomNodeDefinition = {
      id: editNode?.id || `custom-${Date.now()}`,
      type: `custom-${nodeType}`,
      label: nodeName,
      iconName: nodeIcon,
      category: nodeCategory,
      description: nodeDescription,
      color: CATEGORY_COLORS[nodeCategory],
      inputs,
      outputs,
      parameters,
      logic: logicCode,
      createdAt: editNode?.createdAt || Date.now()
    }

    setCustomNodes((current) => {
      const nodes = current || []
      if (editNode) {
        return nodes.map(n => n.id === editNode.id ? customNode : n)
      }
      return [...nodes, customNode]
    })

    if (onSave) {
      onSave(customNode)
    }

    toast.success(editNode ? 'Custom node updated!' : 'Custom node created!')
    handleClose()
  }

  const handleClose = () => {
    setNodeName('')
    setNodeDescription('')
    setNodeCategory('custom')
    setNodeIcon('Cube')
    setInputs([])
    setOutputs([])
    setParameters([])
    setLogicCode('')
    setCurrentTab('basic')
    onClose()
  }

  const getIcon = (iconName: string) => {
    const IconComponent = (PhosphorIcons as any)[iconName]
    return IconComponent ? IconComponent : PhosphorIcons.Cube
  }

  const IconComponent = getIcon(nodeIcon)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-accent" />
            {editNode ? 'Edit Custom Node' : 'Create Custom Node'}
          </DialogTitle>
          <DialogDescription>
            Build your own custom workflow node with inputs, outputs, and processing logic
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b border-border pb-2">
          <Button
            variant={currentTab === 'basic' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentTab('basic')}
          >
            Basic Info
          </Button>
          <Button
            variant={currentTab === 'inputs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentTab('inputs')}
          >
            Inputs ({inputs.length})
          </Button>
          <Button
            variant={currentTab === 'outputs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentTab('outputs')}
          >
            Outputs ({outputs.length})
          </Button>
          <Button
            variant={currentTab === 'params' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentTab('params')}
          >
            Parameters ({parameters.length})
          </Button>
          <Button
            variant={currentTab === 'logic' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentTab('logic')}
          >
            <Code className="w-4 h-4 mr-1" />
            Logic
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {currentTab === 'basic' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Node Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="p-4 rounded-lg border-2 inline-flex items-center gap-2"
                      style={{ borderColor: CATEGORY_COLORS[nodeCategory], background: `${CATEGORY_COLORS[nodeCategory]}15` }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: CATEGORY_COLORS[nodeCategory] }} />
                      <span className="font-medium">{nodeName || 'Unnamed Node'}</span>
                      <Badge variant="outline" className="text-xs">{nodeCategory}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label htmlFor="node-name">Node Name *</Label>
                  <Input
                    id="node-name"
                    placeholder="e.g., Custom Transformer"
                    value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="node-description">Description</Label>
                  <Textarea
                    id="node-description"
                    placeholder="Describe what this node does..."
                    value={nodeDescription}
                    onChange={(e) => setNodeDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={nodeCategory} onValueChange={(v: any) => setNodeCategory(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="input">Input</SelectItem>
                        <SelectItem value="ai">AI</SelectItem>
                        <SelectItem value="process">Process</SelectItem>
                        <SelectItem value="output">Output</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select value={nodeIcon} onValueChange={setNodeIcon}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map(icon => {
                          const Icon = getIcon(icon)
                          return (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {icon}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'inputs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Input Connections</h3>
                    <p className="text-sm text-muted-foreground">Define what data this node receives</p>
                  </div>
                  <Button onClick={handleAddInput} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Input
                  </Button>
                </div>

                {inputs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No inputs defined. Add your first input to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {inputs.map((input, idx) => (
                      <Card key={input.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Name *</Label>
                                  <Input
                                    value={input.name}
                                    onChange={(e) => handleUpdateInput(input.id, 'name', e.target.value)}
                                    placeholder="inputName"
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Type</Label>
                                  <Select 
                                    value={input.type} 
                                    onValueChange={(v) => handleUpdateInput(input.id, 'type', v)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="any">Any</SelectItem>
                                      <SelectItem value="string">String</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="boolean">Boolean</SelectItem>
                                      <SelectItem value="object">Object</SelectItem>
                                      <SelectItem value="array">Array</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Description</Label>
                                <Input
                                  value={input.description}
                                  onChange={(e) => handleUpdateInput(input.id, 'description', e.target.value)}
                                  placeholder="What is this input for?"
                                  className="h-8"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`input-required-${input.id}`}
                                  checked={input.required}
                                  onChange={(e) => handleUpdateInput(input.id, 'required', e.target.checked)}
                                  className="rounded"
                                />
                                <Label htmlFor={`input-required-${input.id}`} className="text-xs cursor-pointer">
                                  Required
                                </Label>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveInput(input.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'outputs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Output Connections</h3>
                    <p className="text-sm text-muted-foreground">Define what data this node produces</p>
                  </div>
                  <Button onClick={handleAddOutput} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Output
                  </Button>
                </div>

                {outputs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      <ArrowRight className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No outputs defined. Add your first output to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {outputs.map((output) => (
                      <Card key={output.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Name *</Label>
                                  <Input
                                    value={output.name}
                                    onChange={(e) => handleUpdateOutput(output.id, 'name', e.target.value)}
                                    placeholder="outputName"
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Type</Label>
                                  <Select 
                                    value={output.type} 
                                    onValueChange={(v) => handleUpdateOutput(output.id, 'type', v)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="any">Any</SelectItem>
                                      <SelectItem value="string">String</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="boolean">Boolean</SelectItem>
                                      <SelectItem value="object">Object</SelectItem>
                                      <SelectItem value="array">Array</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Description</Label>
                                <Input
                                  value={output.description}
                                  onChange={(e) => handleUpdateOutput(output.id, 'description', e.target.value)}
                                  placeholder="What does this output contain?"
                                  className="h-8"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOutput(output.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'params' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Configuration Parameters</h3>
                    <p className="text-sm text-muted-foreground">Define configurable settings for this node</p>
                  </div>
                  <Button onClick={handleAddParameter} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Parameter
                  </Button>
                </div>

                {parameters.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No parameters defined. Add configuration options for your node.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {parameters.map((param) => (
                      <Card key={param.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs">Name *</Label>
                                  <Input
                                    value={param.name}
                                    onChange={(e) => handleUpdateParameter(param.id, 'name', e.target.value)}
                                    placeholder="paramName"
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Label *</Label>
                                  <Input
                                    value={param.label}
                                    onChange={(e) => handleUpdateParameter(param.id, 'label', e.target.value)}
                                    placeholder="Display Label"
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Type</Label>
                                  <Select 
                                    value={param.type} 
                                    onValueChange={(v) => handleUpdateParameter(param.id, 'type', v)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="string">String</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="boolean">Boolean</SelectItem>
                                      <SelectItem value="text">Text Area</SelectItem>
                                      <SelectItem value="select">Select</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Description</Label>
                                <Input
                                  value={param.description}
                                  onChange={(e) => handleUpdateParameter(param.id, 'description', e.target.value)}
                                  placeholder="Parameter description"
                                  className="h-8"
                                />
                              </div>
                              {param.type === 'select' && (
                                <div>
                                  <Label className="text-xs">Options (comma-separated)</Label>
                                  <Input
                                    value={param.options?.join(', ') || ''}
                                    onChange={(e) => handleUpdateParameter(param.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                    placeholder="option1, option2, option3"
                                    className="h-8"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`param-required-${param.id}`}
                                  checked={param.required}
                                  onChange={(e) => handleUpdateParameter(param.id, 'required', e.target.checked)}
                                  className="rounded"
                                />
                                <Label htmlFor={`param-required-${param.id}`} className="text-xs cursor-pointer">
                                  Required
                                </Label>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveParameter(param.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'logic' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Processing Logic</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Define how this node processes data (optional - can be implemented later)
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-4">
                    <Label className="text-xs mb-2 block">JavaScript/TypeScript Code</Label>
                    <Textarea
                      value={logicCode}
                      onChange={(e) => setLogicCode(e.target.value)}
                      placeholder={`// Example processing logic\nfunction process(inputs, params) {\n  // Process your data here\n  return {\n    output: "processed data"\n  }\n}`}
                      rows={15}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Available variables: <code className="bg-muted px-1 py-0.5 rounded">inputs</code>, <code className="bg-muted px-1 py-0.5 rounded">params</code>, <code className="bg-muted px-1 py-0.5 rounded">config</code>
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Sparkle className="w-4 h-4 mr-1" />
            {editNode ? 'Update Node' : 'Create Node'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
