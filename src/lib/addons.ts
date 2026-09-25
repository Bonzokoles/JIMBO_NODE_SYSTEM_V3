/**
 * CORE ADDON SYSTEM
 * 
 * ⚠️ WARNING: This is a core file for the addon system.
 * DO NOT MODIFY this file when creating addons.
 * 
 * This file defines:
 * - Addon type interfaces
 * - AddonRegistry singleton
 * - Core addon management functionality
 * 
 * For creating addons, see:
 * - /ADDONS.md - Complete addon development guide
 * - /QUICK_START_ADDON.md - 5-minute quick start
 * - /ADDON_TEMPLATE.ts - Template for new addons
 * - /src/lib/addons/ - Directory for addon implementations
 */

export interface AddonMetadata {
  id: string
  name: string
  version: string
  author: string
  description: string
  category: 'indexer' | 'framework' | 'reader' | 'tool' | 'custom' | 'rag' | 'database' | 'container'
  enabled: boolean
  tags?: string[]
  homepage?: string
  repository?: string
}

export interface AddonNodeDefinition {
  type: string
  label: string
  category: string
  inputs: AddonPortDefinition[]
  outputs: AddonPortDefinition[]
  config: AddonConfigField[]
  execute?: (inputs: Record<string, any>, config: Record<string, any>) => Promise<any>
}

export interface AddonPortDefinition {
  id: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'object' | 'array' | 'file' | 'any'
  required?: boolean
}

export interface AddonConfigField {
  id: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password'
  defaultValue?: any
  options?: { label: string; value: any }[]
  required?: boolean
  placeholder?: string
  description?: string
}

export interface Addon {
  metadata: AddonMetadata
  nodes?: AddonNodeDefinition[]
  initialize?: () => Promise<void>
  cleanup?: () => Promise<void>
}

export class AddonRegistry {
  private static instance: AddonRegistry
  private addons: Map<string, Addon> = new Map()
  private listeners: Set<() => void> = new Set()

  static getInstance(): AddonRegistry {
    if (!AddonRegistry.instance) {
      AddonRegistry.instance = new AddonRegistry()
    }
    return AddonRegistry.instance
  }

  register(addon: Addon): void {
    if (this.addons.has(addon.metadata.id)) {
      throw new Error(`Addon with id "${addon.metadata.id}" is already registered`)
    }
    
    this.addons.set(addon.metadata.id, addon)
    
    if (addon.initialize && addon.metadata.enabled) {
      addon.initialize().catch(err => {
        console.error(`Failed to initialize addon "${addon.metadata.id}":`, err)
      })
    }
    
    this.notifyListeners()
  }

  unregister(addonId: string): void {
    const addon = this.addons.get(addonId)
    if (addon?.cleanup) {
      addon.cleanup().catch(err => {
        console.error(`Failed to cleanup addon "${addonId}":`, err)
      })
    }
    
    this.addons.delete(addonId)
    this.notifyListeners()
  }

  get(addonId: string): Addon | undefined {
    return this.addons.get(addonId)
  }

  getAll(): Addon[] {
    return Array.from(this.addons.values())
  }

  getEnabled(): Addon[] {
    return this.getAll().filter(addon => addon.metadata.enabled)
  }

  getByCategory(category: AddonMetadata['category']): Addon[] {
    return this.getAll().filter(addon => addon.metadata.category === category)
  }

  getAllNodes(): AddonNodeDefinition[] {
    const nodes: AddonNodeDefinition[] = []
    
    this.getEnabled().forEach(addon => {
      if (addon.nodes) {
        nodes.push(...addon.nodes)
      }
    })
    
    return nodes
  }

  enable(addonId: string): void {
    const addon = this.addons.get(addonId)
    if (addon) {
      addon.metadata.enabled = true
      
      if (addon.initialize) {
        addon.initialize().catch(err => {
          console.error(`Failed to initialize addon "${addonId}":`, err)
        })
      }
      
      this.notifyListeners()
    }
  }

  disable(addonId: string): void {
    const addon = this.addons.get(addonId)
    if (addon) {
      addon.metadata.enabled = false
      
      if (addon.cleanup) {
        addon.cleanup().catch(err => {
          console.error(`Failed to cleanup addon "${addonId}":`, err)
        })
      }
      
      this.notifyListeners()
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }
}

export const addonRegistry = AddonRegistry.getInstance()
