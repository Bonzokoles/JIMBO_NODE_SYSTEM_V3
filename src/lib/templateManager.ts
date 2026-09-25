import { WorkflowTemplate } from './workflowTemplates'
import { WorkflowNode } from '@/store/workflowStore'
import { Edge } from '@xyflow/react'

const CUSTOM_TEMPLATES_KEY = 'custom-workflow-templates'

export interface CustomTemplate extends Omit<WorkflowTemplate, 'nodes' | 'edges'> {
  nodes: WorkflowNode[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
  author?: string
}

export class TemplateManager {
  static async saveCustomTemplate(
    name: string,
    description: string,
    nodes: WorkflowNode[],
    edges: Edge[],
    options?: {
      category?: string
      tags?: string[]
      difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      useCases?: string[]
    }
  ): Promise<CustomTemplate> {
    const template: CustomTemplate = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category: options?.category || 'custom',
      tags: options?.tags,
      difficulty: options?.difficulty,
      useCases: options?.useCases,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const existing = await this.getCustomTemplates()
    const updated = [...existing, template]
    
    if (typeof window !== 'undefined' && window.spark?.kv) {
      await window.spark.kv.set(CUSTOM_TEMPLATES_KEY, updated)
    }

    return template
  }

  static async getCustomTemplates(): Promise<CustomTemplate[]> {
    if (typeof window !== 'undefined' && window.spark?.kv) {
      const templates = await window.spark.kv.get<CustomTemplate[]>(CUSTOM_TEMPLATES_KEY)
      return templates || []
    }
    return []
  }

  static async deleteCustomTemplate(templateId: string): Promise<void> {
    const existing = await this.getCustomTemplates()
    const filtered = existing.filter(t => t.id !== templateId)
    
    if (typeof window !== 'undefined' && window.spark?.kv) {
      await window.spark.kv.set(CUSTOM_TEMPLATES_KEY, filtered)
    }
  }

  static async updateCustomTemplate(
    templateId: string,
    updates: Partial<Omit<CustomTemplate, 'id' | 'createdAt'>>
  ): Promise<CustomTemplate | null> {
    const existing = await this.getCustomTemplates()
    const index = existing.findIndex(t => t.id === templateId)
    
    if (index === -1) return null

    const updated = {
      ...existing[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    existing[index] = updated

    if (typeof window !== 'undefined' && window.spark?.kv) {
      await window.spark.kv.set(CUSTOM_TEMPLATES_KEY, existing)
    }

    return updated
  }

  static async exportTemplate(template: CustomTemplate): Promise<string> {
    return JSON.stringify(template, null, 2)
  }

  static async importTemplate(jsonString: string): Promise<CustomTemplate> {
    const template = JSON.parse(jsonString) as CustomTemplate
    
    const newTemplate: CustomTemplate = {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const existing = await this.getCustomTemplates()
    const updated = [...existing, newTemplate]
    
    if (typeof window !== 'undefined' && window.spark?.kv) {
      await window.spark.kv.set(CUSTOM_TEMPLATES_KEY, updated)
    }

    return newTemplate
  }

  static async getAllTemplates(includeCustom = true): Promise<WorkflowTemplate[]> {
    const { workflowTemplates } = await import('./workflowTemplates')
    
    if (!includeCustom) {
      return workflowTemplates
    }

    const customTemplates = await this.getCustomTemplates()
    return [...workflowTemplates, ...customTemplates]
  }

  static async searchTemplates(query: string): Promise<WorkflowTemplate[]> {
    const allTemplates = await this.getAllTemplates()
    const lowerQuery = query.toLowerCase()

    return allTemplates.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      t.useCases?.some(uc => uc.toLowerCase().includes(lowerQuery))
    )
  }

  static async getTemplatesByCategory(category: string): Promise<WorkflowTemplate[]> {
    const allTemplates = await this.getAllTemplates()
    return allTemplates.filter(t => t.category === category)
  }

  static async getTemplatesByDifficulty(difficulty: string): Promise<WorkflowTemplate[]> {
    const allTemplates = await this.getAllTemplates()
    return allTemplates.filter(t => t.difficulty === difficulty)
  }

  static async getTemplateStats() {
    const allTemplates = await this.getAllTemplates()
    const customTemplates = await this.getCustomTemplates()

    const totalTemplates = allTemplates.length
    const totalCustom = customTemplates.length
    const totalBuiltIn = totalTemplates - totalCustom

    const categoryCounts = allTemplates.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const difficultyCounts = allTemplates.reduce((acc, t) => {
      if (t.difficulty) {
        acc[t.difficulty] = (acc[t.difficulty] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const avgNodes = Math.round(
      allTemplates.reduce((sum, t) => sum + t.nodes.length, 0) / totalTemplates
    )

    const avgEdges = Math.round(
      allTemplates.reduce((sum, t) => sum + t.edges.length, 0) / totalTemplates
    )

    return {
      totalTemplates,
      totalCustom,
      totalBuiltIn,
      categoryCounts,
      difficultyCounts,
      avgNodes,
      avgEdges,
    }
  }
}
