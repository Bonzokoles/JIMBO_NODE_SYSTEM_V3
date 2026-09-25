import { Addon } from '@/lib/addons'

export const exampleTextProcessingAddon: Addon = {
  metadata: {
    id: 'example-text-processing',
    name: 'Text Processing Suite',
    version: '1.0.0',
    author: 'Example Author',
    description: 'Advanced text processing utilities for workflows',
    category: 'tool',
    enabled: false,
    tags: ['text', 'processing', 'utility'],
  },
  nodes: [
    {
      type: 'text-word-count',
      label: 'Word Count',
      category: 'Tools',
      inputs: [
        {
          id: 'text',
          label: 'Input Text',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'wordCount',
          label: 'Word Count',
          type: 'number',
        },
        {
          id: 'charCount',
          label: 'Character Count',
          type: 'number',
        },
        {
          id: 'lineCount',
          label: 'Line Count',
          type: 'number',
        },
      ],
      config: [
        {
          id: 'countSpaces',
          label: 'Count Spaces in Characters',
          type: 'boolean',
          defaultValue: true,
        },
      ],
      execute: async (inputs, config) => {
        const text = inputs.text || ''
        const words = text.trim().split(/\s+/).filter(w => w.length > 0)
        const chars = config.countSpaces ? text.length : text.replace(/\s/g, '').length
        const lines = text.split('\n').length
        
        return {
          wordCount: words.length,
          charCount: chars,
          lineCount: lines,
        }
      },
    },
    {
      type: 'text-case-converter',
      label: 'Case Converter',
      category: 'Tools',
      inputs: [
        {
          id: 'text',
          label: 'Input Text',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'result',
          label: 'Converted Text',
          type: 'text',
        },
      ],
      config: [
        {
          id: 'caseType',
          label: 'Case Type',
          type: 'select',
          options: [
            { label: 'UPPERCASE', value: 'upper' },
            { label: 'lowercase', value: 'lower' },
            { label: 'Title Case', value: 'title' },
            { label: 'Sentence case', value: 'sentence' },
          ],
          defaultValue: 'upper',
        },
      ],
      execute: async (inputs, config) => {
        const text = inputs.text || ''
        let result = text
        
        switch (config.caseType) {
          case 'upper':
            result = text.toUpperCase()
            break
          case 'lower':
            result = text.toLowerCase()
            break
          case 'title':
            result = text.replace(/\w\S*/g, (txt) => 
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            )
            break
          case 'sentence':
            result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
            break
        }
        
        return { result }
      },
    },
    {
      type: 'text-find-replace',
      label: 'Find & Replace',
      category: 'Tools',
      inputs: [
        {
          id: 'text',
          label: 'Input Text',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'result',
          label: 'Modified Text',
          type: 'text',
        },
        {
          id: 'count',
          label: 'Replacements Made',
          type: 'number',
        },
      ],
      config: [
        {
          id: 'find',
          label: 'Find',
          type: 'text',
          required: true,
          placeholder: 'Text to find',
        },
        {
          id: 'replace',
          label: 'Replace With',
          type: 'text',
          defaultValue: '',
          placeholder: 'Replacement text',
        },
        {
          id: 'caseSensitive',
          label: 'Case Sensitive',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      execute: async (inputs, config) => {
        const text = inputs.text || ''
        const find = config.find || ''
        const replace = config.replace || ''
        
        if (!find) {
          return { result: text, count: 0 }
        }
        
        const flags = config.caseSensitive ? 'g' : 'gi'
        const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
        
        let count = 0
        const result = text.replace(regex, () => {
          count++
          return replace
        })
        
        return { result, count }
      },
    },
  ],
  initialize: async () => {
    console.log('Text Processing Suite initialized')
  },
  cleanup: async () => {
    console.log('Text Processing Suite cleaned up')
  },
}
