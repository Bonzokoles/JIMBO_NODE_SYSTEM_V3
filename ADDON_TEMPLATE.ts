import { Addon } from '@/lib/addons'

/**
 * ADDON TEMPLATE
 * 
 * This is a template for creating new addons for the Node'y workflow builder.
 * 
 * QUICK START:
 * 1. Copy this file to /src/lib/addons/[your-addon-name]/index.ts
 * 2. Customize the metadata and nodes below
 * 3. Import and register in /src/lib/exampleAddons.ts
 * 4. See /ADDONS.md for comprehensive documentation
 * 
 * IMPORTANT: This addon system is ISOLATED from core code.
 * Changes here will NOT affect the main workflow builder functionality.
 */

export const myFirstAddon: Addon = {
  metadata: {
    id: 'my-first-addon',                    // MUST be unique (kebab-case)
    name: 'My First Addon',                   // Display name
    version: '1.0.0',                         // Semver version
    author: 'Your Name',                      // Your name
    description: 'Template for creating your first addon',
    category: 'custom',                       // indexer | framework | reader | tool | custom | rag | database | container
    enabled: false,                           // Start disabled by default
    tags: ['template', 'example'],            // Optional: for search/filtering
    homepage: 'https://example.com',          // Optional: addon homepage
    repository: 'https://github.com/...',     // Optional: source repository
  },
  
  nodes: [
    {
      type: 'my-first-node',                  // MUST be unique across all addons
      label: 'My First Node',                 // Display name in palette
      category: 'Tools',                      // Category for palette grouping
      
      inputs: [
        {
          id: 'input',                        // Input port ID
          label: 'Input Text',                // Display label
          type: 'text',                       // text | number | boolean | object | array | file | any
          required: true,                     // Optional: mark as required
        },
      ],
      
      outputs: [
        {
          id: 'output',                       // Output port ID (must match execute return keys)
          label: 'Output Text',               // Display label
          type: 'text',                       // Port type
        },
      ],
      
      config: [
        {
          id: 'prefix',                       // Config field ID
          label: 'Prefix',                    // Display label
          type: 'text',                       // text | number | boolean | select | textarea | password
          placeholder: 'Enter prefix...',     // Optional: placeholder text
          defaultValue: 'Hello',              // Optional: default value
          description: 'Prefix to add',       // Optional: help text
        },
        {
          id: 'uppercase',
          label: 'Uppercase Output',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      
      /**
       * Execute function - called when workflow runs this node
       * 
       * @param inputs - Object with input port IDs as keys
       * @param config - Object with config field IDs as keys
       * @returns Object with output port IDs as keys
       */
      execute: async (inputs, config) => {
        // Access inputs by port ID
        const inputText = inputs.input || ''
        
        // Access config by field ID
        const prefix = config.prefix || ''
        const shouldUppercase = config.uppercase || false
        
        // Your processing logic here
        let result = `${prefix} ${inputText}`
        
        if (shouldUppercase) {
          result = result.toUpperCase()
        }
        
        // Return object with output port IDs as keys
        return {
          output: result,
        }
      },
    },
    
    // Add more nodes here...
  ],
  
  /**
   * Initialize function - called when addon is enabled
   * Use for setup, connections, etc.
   */
  initialize: async () => {
    console.log('My First Addon initialized!')
    // Setup code here (database connections, API clients, etc.)
  },
  
  /**
   * Cleanup function - called when addon is disabled/uninstalled
   * Use for cleanup, closing connections, etc.
   */
  cleanup: async () => {
    console.log('My First Addon cleanup')
    // Cleanup code here (close connections, clear caches, etc.)
  },
}

/**
 * NEXT STEPS:
 * 
 * 1. Customize this addon for your needs
 * 2. Test it by importing in /src/lib/exampleAddons.ts:
 *    import { myFirstAddon } from '@/lib/addons/my-addon/index'
 *    export const EXAMPLE_ADDONS = [..., myFirstAddon]
 * 
 * 3. Enable it in the Addons Manager UI
 * 4. Find your node in the palette and test it!
 * 
 * For more examples and detailed docs, see:
 * - /ADDONS.md - Complete addon development guide
 * - /src/lib/addons/examples/ - Example addons
 * - /src/lib/ragAddons.ts - Complex RAG system addon
 */
