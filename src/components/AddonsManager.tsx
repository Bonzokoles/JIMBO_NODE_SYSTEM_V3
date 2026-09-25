import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Addon, addonRegistry } from '@/lib/addons'
import { Plug, Package, FileCode, Book, Wrench, Plus, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const CATEGORY_ICONS = {
  indexer: FileCode,
  framework: Package,
  reader: Book,
  tool: Wrench,
  custom: Plug,
}

const CATEGORY_LABELS = {
  indexer: 'Indexer',
  framework: 'Framework',
  reader: 'Reader',
  tool: 'Tool',
  custom: 'Custom',
}

interface AddonsManagerProps {
  open: boolean
  onClose: () => void
}

export function AddonsManager({ open, onClose }: AddonsManagerProps) {
  const [addons, setAddons] = useState<Addon[]>([])
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null)

  useEffect(() => {
    const updateAddons = () => {
      setAddons(addonRegistry.getAll())
    }

    updateAddons()
    const unsubscribe = addonRegistry.subscribe(updateAddons)

    return unsubscribe
  }, [])

  const handleToggle = (addonId: string, enabled: boolean) => {
    if (enabled) {
      addonRegistry.enable(addonId)
      toast.success('Addon enabled')
    } else {
      addonRegistry.disable(addonId)
      toast.success('Addon disabled')
    }
  }

  const handleUninstall = (addonId: string) => {
    addonRegistry.unregister(addonId)
    toast.success('Addon uninstalled')
    setSelectedAddon(null)
  }

  const enabledCount = addons.filter(a => a.metadata.enabled).length
  const totalNodes = addons.reduce((sum, addon) => sum + (addon.nodes?.length || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug size={24} />
            Addons Manager
          </DialogTitle>
          <DialogDescription>
            Manage and configure addon extensions for your workflow builder
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 my-4">
          <Card className="flex-1 p-4">
            <div className="text-2xl font-bold">{addons.length}</div>
            <div className="text-sm text-muted-foreground">Total Addons</div>
          </Card>
          <Card className="flex-1 p-4">
            <div className="text-2xl font-bold">{enabledCount}</div>
            <div className="text-sm text-muted-foreground">Enabled</div>
          </Card>
          <Card className="flex-1 p-4">
            <div className="text-2xl font-bold">{totalNodes}</div>
            <div className="text-sm text-muted-foreground">Total Nodes</div>
          </Card>
        </div>

        <div className="flex gap-4 h-96">
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-4 space-y-2">
              {addons.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Plug size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No addons installed</p>
                  <p className="text-sm mt-2">Check ADDONS.md for installation instructions</p>
                </div>
              ) : (
                addons.map((addon) => {
                  const Icon = CATEGORY_ICONS[addon.metadata.category]
                  const isSelected = selectedAddon?.metadata.id === addon.metadata.id

                  return (
                    <Card
                      key={addon.metadata.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedAddon(addon)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon size={24} className="text-primary mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">
                                {addon.metadata.name}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                v{addon.metadata.version}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {addon.metadata.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {CATEGORY_LABELS[addon.metadata.category]}
                              </Badge>
                              {addon.nodes && addon.nodes.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {addon.nodes.length} node{addon.nodes.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={addon.metadata.enabled}
                          onCheckedChange={(checked) => handleToggle(addon.metadata.id, checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <div className="w-96 border rounded-lg">
            {selectedAddon ? (
              <div className="p-4 h-full flex flex-col">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    {(() => {
                      const Icon = CATEGORY_ICONS[selectedAddon.metadata.category]
                      return <Icon size={32} className="text-primary" />
                    })()}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{selectedAddon.metadata.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        v{selectedAddon.metadata.version} by {selectedAddon.metadata.author}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm mb-4">{selectedAddon.metadata.description}</p>

                  <Separator className="my-4" />

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={selectedAddon.metadata.enabled ? 'default' : 'secondary'}>
                        {selectedAddon.metadata.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Category</Label>
                      <Badge variant="outline">
                        {CATEGORY_LABELS[selectedAddon.metadata.category]}
                      </Badge>
                    </div>

                    {selectedAddon.nodes && selectedAddon.nodes.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Provided Nodes</Label>
                        <ScrollArea className="h-32 border rounded-md p-2">
                          <div className="space-y-1">
                            {selectedAddon.nodes.map((node) => (
                              <div
                                key={node.type}
                                className="text-xs p-2 bg-muted rounded flex justify-between items-center"
                              >
                                <span className="font-mono">{node.label}</span>
                                <Badge variant="outline" className="text-xs">
                                  {node.category}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t space-y-2">
                  <Button
                    variant={selectedAddon.metadata.enabled ? 'secondary' : 'default'}
                    className="w-full"
                    onClick={() =>
                      handleToggle(selectedAddon.metadata.id, !selectedAddon.metadata.enabled)
                    }
                  >
                    {selectedAddon.metadata.enabled ? 'Disable' : 'Enable'} Addon
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleUninstall(selectedAddon.metadata.id)}
                  >
                    <Trash size={16} className="mr-2" />
                    Uninstall
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Select an addon to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            See <span className="font-mono">ADDONS.md</span> for how to create custom addons
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
