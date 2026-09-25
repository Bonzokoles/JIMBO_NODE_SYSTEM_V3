/**
 * ADDON REGISTRATION FILE
 * 
 * ✅ SAFE TO MODIFY when adding new addons
 * 
 * This file imports and exports all addons for the workflow builder.
 * 
 * To add your addon:
 * 1. Import it: import { myAddon } from '@/lib/addons/my-addon/index'
 * 2. Add to EXAMPLE_ADDONS array below
 * 3. Refresh the application
 * 4. Enable in Addons Manager
 * 
 * See /ADDONS.md for complete documentation.
 */

import { Addon } from '@/lib/addons'
import { deepseekCliAgentAddon } from '@/lib/addons/ai/deepseek-cli'
import { typeSafeAiAddon } from '@/lib/addons/typesafe-ai/index'
import { devzKbMonitorAddon } from '@/lib/addons/devz-kb/monitor'
import { RAG_ADDONS } from '@/lib/ragAddons'
import { exampleTextProcessingAddon } from '@/lib/addons/examples/textProcessing'
import { exampleWeatherAddon } from '@/lib/addons/examples/weatherAPI'
import { terminalControllerAddon } from '@/lib/addons/pc-utility/terminal-controller'
import { extendedAIProvidersAddon } from '@/lib/addons/extended-ai-providers'
import { vectorDatabaseAddon } from '@/lib/addons/vector-database'
import { chuckSystemBridgeAddon } from '@/lib/addons/chuck-system-bridge'
import { pcUtilityAddon } from '@/lib/addons/pc-utility/index'

export const exampleIndexerAddon: Addon = {
  metadata: {
    id: 'example-indexer',
    name: 'Example Indexer',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Example indexer addon for analyzing large data structures',
    category: 'indexer',
    enabled: false,
  },
  nodes: [
    {
      type: 'indexer-analyze',
      label: 'Analyze Structure',
      category: 'Indexers',
      inputs: [
        {
          id: 'data',
          label: 'Data',
          type: 'object',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'analysis',
          label: 'Analysis Result',
          type: 'object',
        },
        {
          id: 'metadata',
          label: 'Metadata',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'depth',
          label: 'Analysis Depth',
          type: 'number',
          defaultValue: 3,
          description: 'How deep to analyze nested structures',
        },
        {
          id: 'includeMetadata',
          label: 'Include Metadata',
          type: 'boolean',
          defaultValue: true,
        },
      ],
      execute: async (inputs, config) => {
        return {
          analysis: { status: 'analyzed', depth: config.depth },
          metadata: config.includeMetadata ? { timestamp: Date.now() } : null,
        }
      },
    },
    {
      type: 'indexer-search',
      label: 'Search Index',
      category: 'Indexers',
      inputs: [
        {
          id: 'query',
          label: 'Query',
          type: 'text',
          required: true,
        },
        {
          id: 'index',
          label: 'Index',
          type: 'object',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'results',
          label: 'Results',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'limit',
          label: 'Result Limit',
          type: 'number',
          defaultValue: 10,
        },
        {
          id: 'threshold',
          label: 'Match Threshold',
          type: 'number',
          defaultValue: 0.5,
        },
      ],
      execute: async (inputs, config) => {
        return {
          results: [],
        }
      },
    },
  ],
  initialize: async () => {
    console.log('Example Indexer initialized')
  },
  cleanup: async () => {
    console.log('Example Indexer cleaned up')
  },
}

export const exampleFrameworkAddon: Addon = {
  metadata: {
    id: 'example-framework',
    name: 'Example Framework',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Example framework integration addon',
    category: 'framework',
    enabled: false,
  },
  nodes: [
    {
      type: 'framework-init',
      label: 'Initialize Framework',
      category: 'Frameworks',
      inputs: [
        {
          id: 'config',
          label: 'Configuration',
          type: 'object',
        },
      ],
      outputs: [
        {
          id: 'instance',
          label: 'Framework Instance',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'name',
          label: 'Framework Name',
          type: 'text',
          placeholder: 'Enter framework name',
          required: true,
        },
        {
          id: 'mode',
          label: 'Mode',
          type: 'select',
          options: [
            { label: 'Development', value: 'dev' },
            { label: 'Production', value: 'prod' },
          ],
          defaultValue: 'dev',
        },
      ],
      execute: async (inputs, config) => {
        return {
          instance: { name: config.name, mode: config.mode, initialized: true },
        }
      },
    },
  ],
}

export const exampleReaderAddon: Addon = {
  metadata: {
    id: 'example-reader',
    name: 'Example Reader',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Example custom file reader addon',
    category: 'reader',
    enabled: false,
  },
  nodes: [
    {
      type: 'reader-custom-format',
      label: 'Read Custom Format',
      category: 'Readers',
      inputs: [
        {
          id: 'file',
          label: 'File',
          type: 'file',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'data',
          label: 'Parsed Data',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'encoding',
          label: 'Encoding',
          type: 'select',
          options: [
            { label: 'UTF-8', value: 'utf8' },
            { label: 'ASCII', value: 'ascii' },
            { label: 'Base64', value: 'base64' },
          ],
          defaultValue: 'utf8',
        },
        {
          id: 'parseOptions',
          label: 'Parse Options',
          type: 'textarea',
          placeholder: 'JSON parse options',
        },
      ],
      execute: async (inputs, config) => {
        return {
          data: { encoding: config.encoding, content: 'parsed data' },
        }
      },
    },
  ],
}

export const exampleToolAddon: Addon = {
  metadata: {
    id: 'example-tool',
    name: 'Example Tool',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Example utility tool addon',
    category: 'tool',
    enabled: false,
  },
  nodes: [
    {
      type: 'tool-transform',
      label: 'Custom Transform',
      category: 'Tools',
      inputs: [
        {
          id: 'input',
          label: 'Input',
          type: 'any',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'output',
          label: 'Output',
          type: 'any',
        },
      ],
      config: [
        {
          id: 'transformType',
          label: 'Transform Type',
          type: 'select',
          options: [
            { label: 'Uppercase', value: 'uppercase' },
            { label: 'Lowercase', value: 'lowercase' },
            { label: 'Reverse', value: 'reverse' },
          ],
          defaultValue: 'uppercase',
        },
      ],
      execute: async (inputs, config) => {
        const input = inputs.input
        let output = input
        
        if (typeof input === 'string') {
          switch (config.transformType) {
            case 'uppercase':
              output = input.toUpperCase()
              break
            case 'lowercase':
              output = input.toLowerCase()
              break
            case 'reverse':
              output = input.split('').reverse().join('')
              break
          }
        }
        
        return { output }
      },
    },
  ],
}

/**
 * BUILT-IN EXAMPLE ADDONS
 * 
 * These are example addons provided with the workflow builder.
 * They demonstrate different addon capabilities and serve as reference implementations.
 * 
 * Feel free to:
 * - Disable any example addons you don't need in the Addons Manager
 * - Use them as templates for your own addons
 * - Modify their enabled state
 * 
 * DO NOT modify these addon definitions directly.
 * Instead, create your own addon files in /src/lib/addons/
 */

export const EXAMPLE_ADDONS = [
  deepseekCliAgentAddon,
  typeSafeAiAddon,
  devzKbMonitorAddon,
  ...RAG_ADDONS,
  terminalControllerAddon,
  exampleIndexerAddon,
  exampleFrameworkAddon,
  exampleReaderAddon,
  exampleToolAddon,
  exampleTextProcessingAddon,
  exampleWeatherAddon,
  extendedAIProvidersAddon,
  vectorDatabaseAddon,
  chuckSystemBridgeAddon,
  pcUtilityAddon,
]




