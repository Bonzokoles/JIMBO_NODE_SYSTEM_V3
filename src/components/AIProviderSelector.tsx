import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, Circle } from '@phosphor-icons/react'
import { AI_PROVIDERS, getProviderForNodeType } from '@/lib/envConfig'
import { useEnvConfig } from '@/store/configStore'
import { cn } from '@/lib/utils'

interface AIProviderSelectorProps {
  nodeType: string
  selectedProvider?: string
  selectedModel?: string
  onProviderChange: (providerId: string) => void
  onModelChange: (model: string) => void
}

export function AIProviderSelector({
  nodeType,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: AIProviderSelectorProps) {
  const [providerSelectorOpen, setProviderSelectorOpen] = useState(false)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const { config } = useEnvConfig()

  const defaultProvider = getProviderForNodeType(nodeType)
  const currentProvider = selectedProvider || defaultProvider || 'openai'
  const currentProviderConfig = AI_PROVIDERS.find(p => p.id === currentProvider)

  const isProviderConfigured = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId)
    return provider ? !!config[provider.apiKeyName] : false
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">AI Provider</Label>
        <Card
          className={cn(
            "p-3 cursor-pointer transition-all border-2",
            providerSelectorOpen ? "border-primary bg-accent/50 shadow-lg" : "border-border hover:border-primary/50"
          )}
          onClick={() => {
            setProviderSelectorOpen(!providerSelectorOpen)
            setModelSelectorOpen(false)
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentProviderConfig?.name || 'Select Provider'}</span>
              {isProviderConfigured(currentProvider) ? (
                <Badge variant="default" className="text-xs">Configured</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Not Configured</Badge>
              )}
            </div>
            <Circle className={cn(
              "transition-all",
              providerSelectorOpen && "text-primary animate-pulse"
            )} size={20} weight={providerSelectorOpen ? "fill" : "regular"} />
          </div>
        </Card>

        {providerSelectorOpen && (
          <Card className="border-primary/50 shadow-xl">
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1">
                {AI_PROVIDERS.map((provider) => (
                  <div
                    key={provider.id}
                    className={cn(
                      "p-3 rounded-md cursor-pointer transition-all flex items-center justify-between",
                      currentProvider === provider.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                    onClick={() => {
                      onProviderChange(provider.id)
                      setProviderSelectorOpen(false)
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{provider.name}</span>
                        {isProviderConfigured(provider.id) ? (
                          <Badge variant={currentProvider === provider.id ? "secondary" : "default"} className="text-xs">
                            ✓
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">No API Key</Badge>
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-0.5">{provider.models.length} models available</p>
                    </div>
                    {currentProvider === provider.id && (
                      <CheckCircle size={20} weight="fill" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Model</Label>
        <Card
          className={cn(
            "p-3 cursor-pointer transition-all border-2",
            modelSelectorOpen ? "border-primary bg-accent/50 shadow-lg" : "border-border hover:border-primary/50"
          )}
          onClick={() => {
            setModelSelectorOpen(!modelSelectorOpen)
            setProviderSelectorOpen(false)
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{selectedModel || 'Select Model'}</span>
            <Circle className={cn(
              "transition-all",
              modelSelectorOpen && "text-primary animate-pulse"
            )} size={20} weight={modelSelectorOpen ? "fill" : "regular"} />
          </div>
        </Card>

        {modelSelectorOpen && currentProviderConfig && (
          <Card className="border-primary/50 shadow-xl">
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1">
                {currentProviderConfig.models.map((model) => (
                  <div
                    key={model}
                    className={cn(
                      "p-3 rounded-md cursor-pointer transition-all flex items-center justify-between",
                      selectedModel === model
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                    onClick={() => {
                      onModelChange(model)
                      setModelSelectorOpen(false)
                    }}
                  >
                    <span className="font-mono text-sm">{model}</span>
                    {selectedModel === model && (
                      <CheckCircle size={20} weight="fill" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>

      {!isProviderConfigured(currentProvider) && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-xs text-destructive">
            ⚠️ API key for {currentProviderConfig?.name} is not configured. Add it in the Configuration Panel at the bottom of the screen.
          </p>
        </div>
      )}
    </div>
  )
}
