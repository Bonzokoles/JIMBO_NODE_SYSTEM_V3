import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import * as PhosphorIcons from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { nodeDefinitions } from '@/lib/nodeDefinitions'
import { CustomNodeDefinition } from '@/components/CustomNodeBuilder'
import { CustomNodeWelcome } from '@/components/CustomNodeWelcome'
import { addonRegistry, AddonNodeDefinition } from '@/lib/addons'
import { Badge } from '@/components/ui/badge'

interface NodePaletteProps {
  onNodeAdd: (type: string) => void
}

export function NodePalette({ onNodeAdd }: NodePaletteProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [customNodes] = useKV<CustomNodeDefinition[]>('custom-nodes', [])
  const [addonNodes, setAddonNodes] = useState<AddonNodeDefinition[]>([])

  useEffect(() => {
    const updateAddonNodes = () => {
      setAddonNodes(addonRegistry.getAllNodes())
    }

    updateAddonNodes()
    const unsubscribe = addonRegistry.subscribe(updateAddonNodes)

    return unsubscribe
  }, [])

  const customNodeDefs = (customNodes || []).map(cn => ({
    type: cn.type,
    label: cn.label,
    iconName: cn.iconName,
    category: cn.category,
    description: cn.description,
    color: cn.color
  }))

  const addonNodeDefs = addonNodes.map(an => ({
    type: an.type,
    label: an.label,
    iconName: 'Plug',
    category: an.category.toLowerCase(),
    description: `${an.inputs.length} inputs, ${an.outputs.length} outputs`,
    color: '#9b59b6'
  }))

  const allNodes = [...nodeDefinitions, ...customNodeDefs, ...addonNodeDefs]

  const filteredNodes = allNodes.filter(node =>
    node.label.toLowerCase().includes(search.toLowerCase()) ||
    node.description.toLowerCase().includes(search.toLowerCase())
  )

  const categories = [
    { key: 'input', label: 'Inputs' },
    { key: 'ai', label: 'AI Models' },
    { key: 'process', label: 'Processing' },
    { key: 'output', label: 'Outputs' },
    { key: 'custom', label: '✨ Custom Nodes' },
    { key: 'rag', label: '🧠 RAG System' },
    { key: 'databases', label: '💾 Databases' },
    { key: 'file readers', label: '📄 File Readers' },
    { key: 'containers', label: '🐳 Containers' },
    { key: 'indexers', label: '🔍 Indexers' },
    { key: 'frameworks', label: '📦 Frameworks' },
    { key: 'readers', label: '📖 Readers' },
    { key: 'tools', label: '🛠️ Tools' },
  ]

  const getIcon = (iconName: string) => {
    const IconComponent = (PhosphorIcons as any)[iconName]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <PhosphorIcons.Cube className="w-4 h-4" />
  }

  return (
    <div className="w-72 border-r border-[#1a202c] bg-[#05070a]/70 backdrop-blur-md h-full flex flex-col relative z-50">
      <div className="p-4 border-b border-[#1a202c]">
        <h2 className="text-lg font-semibold mb-2 text-primary">{t('palette.title')}</h2>
        <div className="text-xs text-muted-foreground mb-3">
          {allNodes.length} nodes available
          {customNodeDefs.length > 0 && ` (${customNodeDefs.length} custom)`}
          {addonNodeDefs.length > 0 && ` (${addonNodeDefs.length} addon)`}
        </div>
        <Input
          placeholder={t('palette.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {customNodeDefs.length === 0 && !search && (
            <div className="mb-3">
              <CustomNodeWelcome />
            </div>
          )}
          
          <Accordion type="multiple" defaultValue={categories.map(c => c.key)} className="w-full">
            {categories.map(category => {
              const categoryNodes = filteredNodes.filter(node => node.category === category.key)
              
              if (categoryNodes.length === 0) return null
              
              return (
                <AccordionItem key={category.key} value={category.key}>
                  <AccordionTrigger className="text-sm font-medium px-2">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span>{category.label}</span>
                      <span className="text-xs text-muted-foreground">{categoryNodes.length}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-1 pt-1 pr-2">
                      {categoryNodes.map(node => (
                        <Card
                          key={node.type}
                          className={cn(
                            'p-3 cursor-grab active:cursor-grabbing',
                            'hover:bg-accent/10 hover:border-primary/50',
                            'transition-all duration-150'
                          )}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/reactflow', node.type)
                            e.dataTransfer.effectAllowed = 'move'
                          }}
                          onClick={() => onNodeAdd(node.type)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-primary" style={{ color: node.color }}>
                              {getIcon(node.iconName)}
                            </div>
                            <span className="text-sm font-medium">{node.label}</span>
                            {addonNodeDefs.some(an => an.type === node.type) && (
                              <Badge variant="secondary" className="text-xs ml-auto">Addon</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">
                            {node.description}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
