import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Lightning, Database, GitMerge, Robot, Image, BookOpen, Plugs, MagnifyingGlass, Clock, ChartBar } from '@phosphor-icons/react'
import { workflowTemplates, WorkflowTemplate, templateCategories } from '@/lib/workflowTemplates'
import { cn } from '@/lib/utils'

interface TemplateDialogProps {
  onSelectTemplate: (template: WorkflowTemplate) => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  starter: <Lightning className="w-4 h-4" />,
  data: <Database className="w-4 h-4" />,
  advanced: <GitMerge className="w-4 h-4" />,
  automation: <Robot className="w-4 h-4" />,
  media: <Image className="w-4 h-4" />,
  rag: <BookOpen className="w-4 h-4" />,
  integration: <Plugs className="w-4 h-4" />,
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-600 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  advanced: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  expert: 'bg-red-500/10 text-red-600 border-red-500/20',
}

export function TemplateDialog({ onSelectTemplate }: TemplateDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['all', ...Array.from(new Set(workflowTemplates.map(t => t.category)))]

  const filteredTemplates = useMemo(() => {
    let templates = workflowTemplates

    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        t.useCases?.some(uc => uc.toLowerCase().includes(query))
      )
    }

    return templates
  }, [selectedCategory, searchQuery])

  const templateStats = useMemo(() => {
    const totalTemplates = workflowTemplates.length
    const totalNodes = workflowTemplates.reduce((sum, t) => sum + t.nodes.length, 0)
    const avgNodes = Math.round(totalNodes / totalTemplates)
    
    return { totalTemplates, avgNodes }
  }, [])

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    onSelectTemplate(template)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          {t('templates.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {t('templates.title')}
            <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <ChartBar className="w-3 h-3" />
                {templateStats.totalTemplates} templates
              </Badge>
              <Badge variant="outline" className="gap-1">
                ~{templateStats.avgNodes} nodes avg
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            {t('templates.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, tags, or use case..."
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start grid grid-cols-8 gap-1">
            <TabsTrigger value="all" className="gap-1 text-xs">
              All
            </TabsTrigger>
            {Object.entries(templateCategories).map(([key, cat]) => (
              <TabsTrigger key={key} value={key} className="gap-1 text-xs" title={cat.description}>
                {categoryIcons[key]}
                <span className="hidden lg:inline">{cat.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="flex-1 mt-4">
            <ScrollArea className="h-[480px] pr-4">
              {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <MagnifyingGlass className="w-12 h-12 mb-2" />
                  <p>No templates found</p>
                  <p className="text-sm">Try adjusting your search or category filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredTemplates.map(template => (
                    <Card
                      key={template.id}
                      className={cn(
                        'p-4 cursor-pointer transition-all duration-200',
                        'hover:bg-accent/10 hover:border-primary/50 hover:shadow-lg',
                        'group relative'
                      )}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="text-primary">
                            {categoryIcons[template.category]}
                          </div>
                          <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                            {template.name}
                          </h3>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">
                          {templateCategories[template.category as keyof typeof templateCategories]?.icon}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-medium">{template.nodes.length}</span>
                          <span>{t('templates.nodes')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-medium">{template.edges.length}</span>
                          <span>{t('templates.connections')}</span>
                        </div>
                        {template.estimatedTime && (
                          <div className="flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3" />
                            <span>{template.estimatedTime}</span>
                          </div>
                        )}
                      </div>

                      {template.difficulty && (
                        <div className="mb-3">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs px-2 py-0.5',
                              difficultyColors[template.difficulty]
                            )}
                          >
                            {template.difficulty}
                          </Badge>
                        </div>
                      )}

                      {template.tags && template.tags.length > 0 && (
                        <div className="pt-3 border-t border-border/50">
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 4).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 4 && (
                              <Badge variant="secondary" className="text-xs px-2 py-0">
                                +{template.tags.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {template.useCases && template.useCases.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Use cases:</p>
                          <p className="text-xs text-foreground/80 line-clamp-1">
                            {template.useCases.join(' • ')}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
