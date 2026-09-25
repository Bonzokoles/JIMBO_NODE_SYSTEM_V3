import { useState, useEffect } from 'react'
import { CaretUp, CaretDown, MapTrifold, Image as ImageIcon, Brain, Plug } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEnvConfig } from '@/store/configStore'
import { AI_PROVIDERS, AIProvider, getEnvFallback } from '@/lib/envConfig'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AddonsManager } from '@/components/AddonsManager'
import { addonRegistry } from '@/lib/addons'

interface ConfigurationBarProps {
  minimapEnabled: boolean
  minimapOpacity: number
  onMinimapToggle: () => void
  onMinimapOpacityChange: (opacity: number) => void
  backgroundImage: string | null
  backgroundOpacity: number
  onBackgroundImageChange: (url: string | null) => void
  onBackgroundOpacityChange: (opacity: number) => void
}

export function ConfigurationBar({
  minimapEnabled,
  minimapOpacity,
  onMinimapToggle,
  onMinimapOpacityChange,
  backgroundImage,
  backgroundOpacity,
  onBackgroundImageChange,
  onBackgroundOpacityChange,
}: ConfigurationBarProps) {
  const [expanded, setExpanded] = useState(false)
  const { config, updateKey } = useEnvConfig()
  const [imageUrl, setImageUrl] = useState(backgroundImage || '')
  
  useEffect(() => {
    setImageUrl(backgroundImage || '')
  }, [backgroundImage])
  const [addonsManagerOpen, setAddonsManagerOpen] = useState(false)
  const [addonsCount, setAddonsCount] = useState(0)
  const [enabledAddonsCount, setEnabledAddonsCount] = useState(0)

  useEffect(() => {
    const updateCounts = () => {
      const allAddons = addonRegistry.getAll()
      const enabledAddons = addonRegistry.getEnabled()
      setAddonsCount(allAddons.length)
      setEnabledAddonsCount(enabledAddons.length)
    }

    updateCounts()
    const unsubscribe = addonRegistry.subscribe(updateCounts)

    return unsubscribe
  }, [])

  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    updateKey(provider.apiKeyName, value)
    toast.success(`${provider.name} API key updated`)
  }

  const handleImageApply = () => {
    onBackgroundImageChange(imageUrl || null)
    toast.success('Background image updated')
  }

  const handleImageClear = () => {
    setImageUrl('')
    onBackgroundImageChange(null)
    toast.success('Background image cleared')
  }

  const getProviderStatus = (provider: AIProvider) => {
    return (config[provider.apiKeyName] || getEnvFallback(provider.apiKeyName)) ? 'configured' : 'not-configured'
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1a202c] bg-[#05070a]/70 backdrop-blur-md">
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <CaretDown size={20} /> : <CaretUp size={20} />}
          <span className="text-sm font-medium">Configuration Panel</span>
          <div className="flex items-center gap-1 ml-2">
            <MapTrifold size={16} className="text-muted-foreground" />
            <ImageIcon size={16} className="text-muted-foreground" />
            <Brain size={16} className="text-muted-foreground" />
            <Plug size={16} className="text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {AI_PROVIDERS.filter(p => getProviderStatus(p) === 'configured').length}/{AI_PROVIDERS.length} Providers
          </Badge>
          <Badge variant="outline" className="text-xs">
            {enabledAddonsCount}/{addonsCount} Addons
          </Badge>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border">
          <Tabs defaultValue="canvas" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
              <TabsTrigger value="canvas" className="rounded-none border-r data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <ImageIcon size={16} className="mr-2" />
                Canvas Background
              </TabsTrigger>
              <TabsTrigger value="minimap" className="rounded-none border-r data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <MapTrifold size={16} className="mr-2" />
                Minimap
              </TabsTrigger>
              <TabsTrigger value="providers" className="rounded-none border-r data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Brain size={16} className="mr-2" />
                AI Providers
              </TabsTrigger>
              <TabsTrigger value="addons" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Plug size={16} className="mr-2" />
                Addons
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-64">
              <TabsContent value="canvas" className="p-4 space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Background Image URL</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="background-image-url"
                        placeholder="https://example.com/image.jpg or /src/assets/images/bg.png"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleImageApply} size="sm">
                        Apply
                      </Button>
                      <Button onClick={handleImageClear} size="sm" variant="outline">
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Background Opacity</Label>
                      <span className="text-xs text-muted-foreground">{Math.round(backgroundOpacity * 100)}%</span>
                    </div>
                    <Slider
                      value={[backgroundOpacity * 100]}
                      onValueChange={([value]) => onBackgroundOpacityChange(value / 100)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="minimap" className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minimap-toggle" className="text-sm font-medium">
                      Enable Minimap
                    </Label>
                    <Switch
                      id="minimap-toggle"
                      checked={minimapEnabled}
                      onCheckedChange={onMinimapToggle}
                    />
                  </div>

                  {minimapEnabled && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Minimap Opacity</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(minimapOpacity * 100)}%</span>
                      </div>
                      <Slider
                        value={[minimapOpacity * 100]}
                        onValueChange={([value]) => onMinimapOpacityChange(value / 100)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="providers" className="p-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure API keys for AI providers. Click on a provider in node configuration to select it.
                  </p>
                  {AI_PROVIDERS.map((provider) => (
                    <Card key={provider.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">{provider.name}</Label>
                            <Badge
                              variant={getProviderStatus(provider) === 'configured' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {getProviderStatus(provider) === 'configured' ? 'Configured' : 'Not Configured'}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{provider.models.length} models</span>
                        </div>
                        <Input
                          id={`api-key-${provider.id}`}
                          type="password"
                          placeholder={`Enter ${provider.apiKeyName}`}
                          defaultValue={config[provider.apiKeyName] || getEnvFallback(provider.apiKeyName) || ''}
                          onBlur={(e) => handleApiKeyChange(provider, e.target.value)}
                          className="font-mono text-xs"
                        />
                        <div className="flex flex-wrap gap-1">
                          {provider.models.slice(0, 3).map((model) => (
                            <Badge key={model} variant="outline" className="text-xs font-mono">
                              {model}
                            </Badge>
                          ))}
                          {provider.models.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{provider.models.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="addons" className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Extend workflow capabilities with custom addons
                    </p>
                    <Button size="sm" onClick={() => setAddonsManagerOpen(true)}>
                      <Plug size={16} className="mr-2" />
                      Manage Addons
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{addonsCount}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </Card>
                    <Card className="p-3 text-center">
                      <div className="text-2xl font-bold text-accent">{enabledAddonsCount}</div>
                      <div className="text-xs text-muted-foreground">Enabled</div>
                    </Card>
                    <Card className="p-3 text-center">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {addonRegistry.getAllNodes().length}
                      </div>
                      <div className="text-xs text-muted-foreground">Nodes</div>
                    </Card>
                  </div>

                  {addonsCount === 0 ? (
                    <Card className="p-6 text-center">
                      <Plug size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                      <h4 className="font-semibold mb-2">No Addons Installed</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Install addons to extend your workflow with custom nodes, indexers, frameworks, and more
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setAddonsManagerOpen(true)}>
                        Open Addons Manager
                      </Button>
                    </Card>
                  ) : (
                    <Card className="p-4">
                      <h4 className="font-semibold text-sm mb-3">Enabled Addons</h4>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {addonRegistry.getEnabled().map((addon) => (
                            <div
                              key={addon.metadata.id}
                              className="flex items-center justify-between p-2 bg-muted rounded text-xs"
                            >
                              <span className="font-medium">{addon.metadata.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {addon.nodes?.length || 0} nodes
                              </Badge>
                            </div>
                          ))}
                          {enabledAddonsCount === 0 && (
                            <p className="text-center text-muted-foreground py-4">No enabled addons</p>
                          )}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}

                  <Card className="p-4 bg-accent/20">
                    <h4 className="font-semibold text-sm mb-2">Quick Start</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Check <span className="font-mono">ADDONS.md</span> for documentation</li>
                      <li>• Create custom nodes for specialized workflows</li>
                      <li>• Install indexers for large data analysis</li>
                      <li>• Add framework integrations and custom readers</li>
                    </ul>
                  </Card>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      <AddonsManager open={addonsManagerOpen} onClose={() => setAddonsManagerOpen(false)} />
    </div>
  )
}



