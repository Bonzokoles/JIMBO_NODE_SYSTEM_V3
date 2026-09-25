import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WorkflowNode, useWorkflowStore } from '@/store/workflowStore'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, File, Code, ChatText, Upload, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { AIProviderSelector } from '@/components/AIProviderSelector'
import { getProviderForNodeType } from '@/lib/envConfig'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRef } from 'react'
import { toast } from 'sonner'

interface PropertiesPanelProps {
  open: boolean
  onClose: () => void
}

export function PropertiesPanel({ open, onClose }: PropertiesPanelProps) {
  const { t } = useTranslation()
  const selectedNode = useWorkflowStore(state => state.selectedNode)
  const updateNode = useWorkflowStore(state => state.updateNode)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const configImportRef = useRef<HTMLInputElement>(null)

  if (!selectedNode) return null

  const handleLabelChange = (label: string) => {
    updateNode(selectedNode.id, { label })
  }

  const handleConfigChange = (key: string, value: any) => {
    updateNode(selectedNode.id, {
      config: { ...selectedNode.data.config, [key]: value }
    })
  }

  const handleExportConfig = () => {
    const config = {
      nodeType: selectedNode.data.type,
      label: selectedNode.data.label,
      config: selectedNode.data.config
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedNode.data.type}-config.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Node configuration exported')
  }

  const handleImportConfig = () => {
    configImportRef.current?.click()
  }

  const handleConfigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.label) {
            handleLabelChange(data.label)
          }
          if (data.config) {
            updateNode(selectedNode.id, { config: data.config })
          }
          toast.success('Configuration imported')
        } catch (error) {
          toast.error('Failed to import configuration')
        }
      }
      reader.readAsText(file)
    }
    if (configImportRef.current) {
      configImportRef.current.value = ''
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileType = file.type
      const isTextFile = fileType.startsWith('text/') || 
                        fileType === 'application/json' || 
                        fileType === '' ||
                        file.name.endsWith('.csv') ||
                        file.name.endsWith('.txt') ||
                        file.name.endsWith('.json')
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result
        handleConfigChange('fileContent', content)
        handleConfigChange('fileName', file.name)
        handleConfigChange('fileType', file.type || 'text/plain')
        handleConfigChange('fileSize', file.size)
        handleConfigChange('lastModified', file.lastModified)
        toast.success(`File "${file.name}" uploaded successfully`)
      }
      
      reader.onerror = () => {
        toast.error('Failed to read file')
      }
      
      if (isTextFile) {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    }
  }

  const handleDownloadFile = () => {
    if (!selectedNode.data.config?.fileContent || !selectedNode.data.config?.fileName) {
      toast.error('No file content to download')
      return
    }

    const content = selectedNode.data.config.fileContent
    const fileName = selectedNode.data.config.fileName
    const fileType = selectedNode.data.config.fileType || 'text/plain'

    let blob: Blob
    if (content.startsWith('data:')) {
      const arr = content.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || fileType
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      blob = new Blob([u8arr], { type: mime })
    } else {
      blob = new Blob([content], { type: fileType })
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File downloaded')
  }

  const statusColors = {
    idle: 'bg-muted text-muted-foreground',
    running: 'bg-accent text-accent-foreground',
    complete: 'bg-green-600 text-white',
    error: 'bg-destructive text-destructive-foreground',
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{t('properties.title')}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportConfig}
              className="flex-1"
              title={t('properties.exportConfig')}
            >
              <DownloadSimple className="mr-2" size={16} />
              {t('properties.exportConfig')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportConfig}
              className="flex-1"
              title={t('properties.importConfig')}
            >
              <UploadSimple className="mr-2" size={16} />
              {t('properties.importConfig')}
            </Button>
            <input
              ref={configImportRef}
              type="file"
              accept=".json"
              onChange={handleConfigFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="node-label">{t('properties.label')}</Label>
            <Input
              id="node-label"
              value={selectedNode.data.label}
              onChange={(e) => handleLabelChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('properties.type')}</Label>
            <div className="p-3 bg-muted rounded-md">
              <code className="text-sm font-mono">{selectedNode.data.type}</code>
            </div>
          </div>

          {selectedNode.data.status && (
            <div className="space-y-2">
              <Label>{t('properties.status')}</Label>
              <Badge className={statusColors[selectedNode.data.status]}>
                {t(`status.${selectedNode.data.status}`)}
              </Badge>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('properties.configuration')}</h3>
            
            {selectedNode.data.type === 'textInput' && (
              <div className="space-y-2">
                <Label htmlFor="textContent">Text Content</Label>
                <Textarea
                  id="textContent"
                  value={selectedNode.data.config?.textContent || ''}
                  onChange={(e) => handleConfigChange('textContent', e.target.value)}
                  placeholder="Enter text..."
                  rows={6}
                />
              </div>
            )}

            {(selectedNode.data.type === 'fileUpload' || selectedNode.data.type === 'csvReader' || 
              selectedNode.data.type === 'jsonParser' || selectedNode.data.type === 'pdfExtract') && (
              <div className="space-y-4">
                <Tabs defaultValue={selectedNode.data.config?.inputMode || 'upload'} onValueChange={(value) => handleConfigChange('inputMode', value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      <Upload className="mr-2" size={16} />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <Code className="mr-2" size={16} />
                      Manual Input
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept={selectedNode.data.type === 'csvReader' ? '.csv' : selectedNode.data.type === 'jsonParser' ? '.json' : selectedNode.data.type === 'pdfExtract' ? '.pdf' : '*'}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2" size={16} />
                      Choose File
                    </Button>
                    {selectedNode.data.config?.fileName && (
                      <Card className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <File size={16} className="text-primary" />
                          <span className="text-sm font-medium truncate">{selectedNode.data.config.fileName}</span>
                        </div>
                        {selectedNode.data.config?.fileSize && (
                          <div className="text-xs text-muted-foreground">
                            Size: {(selectedNode.data.config.fileSize / 1024).toFixed(2)} KB
                          </div>
                        )}
                        {selectedNode.data.config?.fileType && (
                          <div className="text-xs text-muted-foreground">
                            Type: {selectedNode.data.config.fileType}
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleDownloadFile}
                          >
                            <DownloadSimple size={14} className="mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              handleConfigChange('fileContent', undefined)
                              handleConfigChange('fileName', undefined)
                              handleConfigChange('fileType', undefined)
                              handleConfigChange('fileSize', undefined)
                              toast.info('File removed')
                            }}
                          >
                            <Trash size={14} className="mr-1" />
                            Remove
                          </Button>
                        </div>
                      </Card>
                    )}
                  </TabsContent>
                  <TabsContent value="manual" className="space-y-2">
                    <Label htmlFor="manualContent">Content</Label>
                    <Textarea
                      id="manualContent"
                      value={selectedNode.data.config?.manualContent || ''}
                      onChange={(e) => handleConfigChange('manualContent', e.target.value)}
                      placeholder="Paste content here..."
                      rows={8}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {(selectedNode.data.type === 'webScraper' || selectedNode.data.type === 'rssReader') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={selectedNode.data.config?.url || ''}
                    onChange={(e) => handleConfigChange('url', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                {selectedNode.data.type === 'webScraper' && (
                  <div className="space-y-2">
                    <Label htmlFor="selector">CSS Selector (optional)</Label>
                    <Input
                      id="selector"
                      value={selectedNode.data.config?.selector || ''}
                      onChange={(e) => handleConfigChange('selector', e.target.value)}
                      placeholder="e.g., .content, #main"
                    />
                  </div>
                )}
              </div>
            )}

            {selectedNode.data.type === 'apiRequest' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select
                    value={selectedNode.data.config?.method || 'GET'}
                    onValueChange={(value) => handleConfigChange('method', value)}
                  >
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">API URL</Label>
                  <Input
                    id="apiUrl"
                    type="url"
                    value={selectedNode.data.config?.apiUrl || ''}
                    onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headers">Headers (JSON)</Label>
                  <Textarea
                    id="headers"
                    value={selectedNode.data.config?.headers || ''}
                    onChange={(e) => handleConfigChange('headers', e.target.value)}
                    placeholder='{"Authorization": "Bearer token"}'
                    rows={3}
                  />
                </div>
                {(selectedNode.data.config?.method !== 'GET') && (
                  <div className="space-y-2">
                    <Label htmlFor="body">Request Body (JSON)</Label>
                    <Textarea
                      id="body"
                      value={selectedNode.data.config?.body || ''}
                      onChange={(e) => handleConfigChange('body', e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}

            {selectedNode.data.type === 'databaseQuery' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dbType">Database Type</Label>
                  <Select
                    value={selectedNode.data.config?.dbType || 'sqlite'}
                    onValueChange={(value) => handleConfigChange('dbType', value)}
                  >
                    <SelectTrigger id="dbType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connectionString">Connection String</Label>
                  <Input
                    id="connectionString"
                    value={selectedNode.data.config?.connectionString || ''}
                    onChange={(e) => handleConfigChange('connectionString', e.target.value)}
                    placeholder="Connection string or file path"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="query">Query</Label>
                  <Textarea
                    id="query"
                    value={selectedNode.data.config?.query || ''}
                    onChange={(e) => handleConfigChange('query', e.target.value)}
                    placeholder="SELECT * FROM table..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {(selectedNode.data.type === 'textTransform' || selectedNode.data.type === 'regexExtract' || 
              selectedNode.data.type === 'jsonTransform') && (
              <div className="space-y-4">
                <Tabs defaultValue={selectedNode.data.config?.transformMode || 'code'} onValueChange={(value) => handleConfigChange('transformMode', value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code">
                      <Code className="mr-2" size={16} />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="prompt">
                      <ChatText className="mr-2" size={16} />
                      AI Prompt
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="code" className="space-y-2">
                    <Label htmlFor="transformCode">Transformation Code</Label>
                    <Textarea
                      id="transformCode"
                      value={selectedNode.data.config?.transformCode || ''}
                      onChange={(e) => handleConfigChange('transformCode', e.target.value)}
                      placeholder="// JavaScript code&#x0a;return input.toUpperCase();"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </TabsContent>
                  <TabsContent value="prompt" className="space-y-2">
                    <Label htmlFor="transformPrompt">AI Transformation Prompt</Label>
                    <Textarea
                      id="transformPrompt"
                      value={selectedNode.data.config?.transformPrompt || ''}
                      onChange={(e) => handleConfigChange('transformPrompt', e.target.value)}
                      placeholder="Describe how to transform the input..."
                      rows={6}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {selectedNode.data.type === 'moa' && (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base">AI Agents Configuration</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const agents = selectedNode.data.config?.agents || []
                        const newAgent = {
                          id: `agent-${agents.length + 1}`,
                          model: 'gpt-4o-mini',
                          provider: 'openai',
                          prompt: '',
                          role: `Agent ${agents.length + 1}`,
                        }
                        handleConfigChange('agents', [...agents, newAgent])
                      }}
                    >
                      <Plus className="mr-1" size={16} />
                      Add Agent
                    </Button>
                  </div>

                  {(selectedNode.data.config?.agents || []).map((agent: any, index: number) => (
                    <Card key={agent.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Agent {index + 1}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const agents = selectedNode.data.config?.agents || []
                            handleConfigChange('agents', agents.filter((_: any, i: number) => i !== index))
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`agent-${index}-role`}>Role</Label>
                        <Input
                          id={`agent-${index}-role`}
                          value={agent.role || ''}
                          onChange={(e) => {
                            const agents = [...(selectedNode.data.config?.agents || [])]
                            agents[index] = { ...agents[index], role: e.target.value }
                            handleConfigChange('agents', agents)
                          }}
                          placeholder="e.g., Technical Analyst"
                        />
                      </div>

                      <AIProviderSelector
                        nodeType={agent.provider || 'openai'}
                        selectedProvider={agent.provider}
                        selectedModel={agent.model}
                        onProviderChange={(provider) => {
                          const agents = [...(selectedNode.data.config?.agents || [])]
                          agents[index] = { ...agents[index], provider }
                          handleConfigChange('agents', agents)
                        }}
                        onModelChange={(model) => {
                          const agents = [...(selectedNode.data.config?.agents || [])]
                          agents[index] = { ...agents[index], model }
                          handleConfigChange('agents', agents)
                        }}
                      />

                      <div className="space-y-2">
                        <Label htmlFor={`agent-${index}-prompt`}>Custom Prompt</Label>
                        <Textarea
                          id={`agent-${index}-prompt`}
                          value={agent.prompt || ''}
                          onChange={(e) => {
                            const agents = [...(selectedNode.data.config?.agents || [])]
                            agents[index] = { ...agents[index], prompt: e.target.value }
                            handleConfigChange('agents', agents)
                          }}
                          placeholder="Enter specific instructions for this agent..."
                          rows={3}
                        />
                      </div>
                    </Card>
                  ))}

                  {(!selectedNode.data.config?.agents || selectedNode.data.config.agents.length === 0) && (
                    <div className="text-center py-6 text-muted-foreground">
                      No agents configured. Click "Add Agent" to start.
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="aggregationStrategy">Aggregation Strategy</Label>
                    <Select
                      value={selectedNode.data.config?.aggregationStrategy || 'weighted_consensus'}
                      onValueChange={(value) => handleConfigChange('aggregationStrategy', value)}
                    >
                      <SelectTrigger id="aggregationStrategy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weighted_consensus">Weighted Consensus</SelectItem>
                        <SelectItem value="majority_vote">Majority Vote</SelectItem>
                        <SelectItem value="best_response">Best Response</SelectItem>
                        <SelectItem value="concatenate">Concatenate All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {(selectedNode.data.type === 'openai' || selectedNode.data.type === 'anthropicClaude' || 
              selectedNode.data.type === 'googleGemini' || selectedNode.data.type === 'mistral' ||
              selectedNode.data.type === 'groq' || selectedNode.data.type === 'ollama' || 
              selectedNode.data.type === 'cohere' || selectedNode.data.type === 'perplexity' ||
              selectedNode.data.type === 'huggingface' || selectedNode.data.type === 'togetherAI' ||
              selectedNode.data.type === 'replicate' || selectedNode.data.type === 'dalle' ||
              selectedNode.data.type === 'stableDiffusion' || selectedNode.data.type === 'whisper' ||
              selectedNode.data.type === 'elevenlabs' || selectedNode.data.type === 'gpt4Vision' ||
              selectedNode.data.type === 'claudeVision' || selectedNode.data.type === 'embeddings' ||
              selectedNode.data.type === 'caydenGeminiChat' || selectedNode.data.type === 'caydenGeminiVision' ||
              selectedNode.data.type === 'caydenReactAgent' || selectedNode.data.type === 'caydenDeepSearch' ||
              selectedNode.data.type === 'caydenRAGQuery') && (
              <>
                <AIProviderSelector
                  nodeType={selectedNode.data.type}
                  selectedProvider={selectedNode.data.config?.provider}
                  selectedModel={selectedNode.data.config?.model}
                  onProviderChange={(provider) => handleConfigChange('provider', provider)}
                  onModelChange={(model) => handleConfigChange('model', model)}
                />

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={selectedNode.data.config?.prompt || ''}
                    onChange={(e) => handleConfigChange('prompt', e.target.value)}
                    placeholder="Enter AI prompt..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={selectedNode.data.config?.temperature || 0.7}
                    onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={selectedNode.data.config?.maxTokens || 1000}
                    onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                  />
                </div>
              </>
            )}

            {selectedNode.data.type === 'transform' && (
              <div className="space-y-2">
                <Label htmlFor="transformation">Transformation</Label>
                <Textarea
                  id="transformation"
                  value={selectedNode.data.config?.transformation || ''}
                  onChange={(e) => handleConfigChange('transformation', e.target.value)}
                  placeholder="Enter transformation logic..."
                  rows={4}
                />
              </div>
            )}

            {selectedNode.data.type === 'condition' && (
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Input
                  id="condition"
                  value={selectedNode.data.config?.condition || ''}
                  onChange={(e) => handleConfigChange('condition', e.target.value)}
                  placeholder="e.g., value > 10"
                />
              </div>
            )}

            {(selectedNode.data.type === 'webhook' || selectedNode.data.type === 'slack' || 
              selectedNode.data.type === 'discord' || selectedNode.data.type === 'telegram') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    value={selectedNode.data.config?.webhookUrl || ''}
                    onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                    placeholder="https://hooks.example.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message Template</Label>
                  <Textarea
                    id="message"
                    value={selectedNode.data.config?.message || ''}
                    onChange={(e) => handleConfigChange('message', e.target.value)}
                    placeholder="Message to send..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {selectedNode.data.type === 'email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    type="email"
                    value={selectedNode.data.config?.to || ''}
                    onChange={(e) => handleConfigChange('to', e.target.value)}
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={selectedNode.data.config?.subject || ''}
                    onChange={(e) => handleConfigChange('subject', e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailBody">Body</Label>
                  <Textarea
                    id="emailBody"
                    value={selectedNode.data.config?.emailBody || ''}
                    onChange={(e) => handleConfigChange('emailBody', e.target.value)}
                    placeholder="Email content..."
                    rows={6}
                  />
                </div>
              </div>
            )}

            {(selectedNode.data.type === 'fileWrite' || selectedNode.data.type === 'localFileWrite' || selectedNode.data.type === 's3Upload' || 
              selectedNode.data.type === 'ftpUpload') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={selectedNode.data.config?.fileName || ''}
                    onChange={(e) => handleConfigChange('fileName', e.target.value)}
                    placeholder="output.txt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filePath">File Path / Destination</Label>
                  <Input
                    id="filePath"
                    value={selectedNode.data.config?.filePath || ''}
                    onChange={(e) => handleConfigChange('filePath', e.target.value)}
                    placeholder="/path/to/destination"
                  />
                </div>
                {(selectedNode.data.type === 's3Upload' || selectedNode.data.type === 'ftpUpload') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="credentials">Credentials (JSON)</Label>
                      <Textarea
                        id="credentials"
                        value={selectedNode.data.config?.credentials || ''}
                        onChange={(e) => handleConfigChange('credentials', e.target.value)}
                        placeholder='{"accessKey": "...", "secretKey": "..."}'
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {(selectedNode.data.type === 'filter' || selectedNode.data.type === 'conditional') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="filterCondition">Filter Condition</Label>
                  <Input
                    id="filterCondition"
                    value={selectedNode.data.config?.filterCondition || ''}
                    onChange={(e) => handleConfigChange('filterCondition', e.target.value)}
                    placeholder="e.g., item.value > 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filterType">Filter Type</Label>
                  <Select
                    value={selectedNode.data.config?.filterType || 'include'}
                    onValueChange={(value) => handleConfigChange('filterType', value)}
                  >
                    <SelectTrigger id="filterType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="include">Include matching items</SelectItem>
                      <SelectItem value="exclude">Exclude matching items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedNode.data.type === 'delay' && (
              <div className="space-y-2">
                <Label htmlFor="delayMs">Delay (milliseconds)</Label>
                <Input
                  id="delayMs"
                  type="number"
                  value={selectedNode.data.config?.delayMs || 1000}
                  onChange={(e) => handleConfigChange('delayMs', parseInt(e.target.value))}
                  placeholder="1000"
                />
              </div>
            )}

            {selectedNode.data.type === 'template' && (
              <div className="space-y-2">
                <Label htmlFor="templateString">Template String</Label>
                <Textarea
                  id="templateString"
                  value={selectedNode.data.config?.templateString || ''}
                  onChange={(e) => handleConfigChange('templateString', e.target.value)}
                  placeholder="Hello {{name}}, your order {{orderId}} is ready!"
                  rows={4}
                />
              </div>
            )}

            {(selectedNode.data.type === 'textChunker') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chunkSize">Chunk Size (characters)</Label>
                  <Input
                    id="chunkSize"
                    type="number"
                    value={selectedNode.data.config?.chunkSize || 1000}
                    onChange={(e) => handleConfigChange('chunkSize', parseInt(e.target.value))}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overlap">Overlap (characters)</Label>
                  <Input
                    id="overlap"
                    type="number"
                    value={selectedNode.data.config?.overlap || 100}
                    onChange={(e) => handleConfigChange('overlap', parseInt(e.target.value))}
                    placeholder="100"
                  />
                </div>
              </div>
            )}

            {(selectedNode.data.type === 'chromadb' || selectedNode.data.type === 'pinecone' || 
              selectedNode.data.type === 'weaviate' || selectedNode.data.type === 'qdrant') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operation">Operation</Label>
                  <Select
                    value={selectedNode.data.config?.operation || 'query'}
                    onValueChange={(value) => handleConfigChange('operation', value)}
                  >
                    <SelectTrigger id="operation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="query">Query / Search</SelectItem>
                      <SelectItem value="insert">Insert / Upsert</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collectionName">Collection / Index Name</Label>
                  <Input
                    id="collectionName"
                    value={selectedNode.data.config?.collectionName || ''}
                    onChange={(e) => handleConfigChange('collectionName', e.target.value)}
                    placeholder="my-collection"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vectorDbUrl">Database URL / API Key</Label>
                  <Input
                    id="vectorDbUrl"
                    value={selectedNode.data.config?.vectorDbUrl || ''}
                    onChange={(e) => handleConfigChange('vectorDbUrl', e.target.value)}
                    placeholder="Connection details"
                  />
                </div>
                {selectedNode.data.config?.operation === 'query' && (
                  <div className="space-y-2">
                    <Label htmlFor="topK">Number of results (top K)</Label>
                    <Input
                      id="topK"
                      type="number"
                      value={selectedNode.data.config?.topK || 5}
                      onChange={(e) => handleConfigChange('topK', parseInt(e.target.value))}
                      placeholder="5"
                    />
                  </div>
                )}
              </div>
            )}

            {(selectedNode.data.type === 'librariesMoneyMachine' || selectedNode.data.type === 'librariesBucketOfBlood' ||
              selectedNode.data.type === 'librariesShadowBoxing' || selectedNode.data.type === 'librariesTheNow' ||
              selectedNode.data.type === 'librariesSearch' || selectedNode.data.type === 'knowledgeBaseCategory' ||
              selectedNode.data.type === 'knowledgeBaseSearch') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="query">Search Query</Label>
                  <Textarea
                    id="query"
                    value={selectedNode.data.config?.query || ''}
                    onChange={(e) => handleConfigChange('query', e.target.value)}
                    placeholder="Enter search query..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Results Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    min="1"
                    max="50"
                    value={selectedNode.data.config?.limit || 5}
                    onChange={(e) => handleConfigChange('limit', parseInt(e.target.value))}
                    placeholder="5"
                  />
                </div>
                {selectedNode.data.type === 'knowledgeBaseCategory' && (
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Knowledge Base Category</Label>
                    <Select
                      value={selectedNode.data.config?.categoryId || 'ai_agents'}
                      onValueChange={(value) => handleConfigChange('categoryId', value)}
                    >
                      <SelectTrigger id="categoryId">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_agents">AI Agents</SelectItem>
                        <SelectItem value="automation">Automation</SelectItem>
                        <SelectItem value="business_intelligence">Business Intelligence</SelectItem>
                        <SelectItem value="customer_engagement">Customer Engagement</SelectItem>
                        <SelectItem value="data_analysis">Data Analysis</SelectItem>
                        <SelectItem value="development_tools">Development Tools</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="integration_apis">Integration APIs</SelectItem>
                        <SelectItem value="machine_learning">Machine Learning</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="project_management">Project Management</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="workflow_optimization">Workflow Optimization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedNode.data.result && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>{t('properties.result')}</Label>
                <pre className="p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto">
                  {JSON.stringify(selectedNode.data.result, null, 2)}
                </pre>
              </div>
            </>
          )}

          {selectedNode.data.error && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-destructive">{t('properties.error')}</Label>
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {selectedNode.data.error}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

