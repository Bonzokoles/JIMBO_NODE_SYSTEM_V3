# Addon Development Guide

This guide explains how to create, register, and manage custom addons for the workflow builder.

## Table of Contents

1. [What are Addons?](#what-are-addons)
2. [Addon Structure](#addon-structure)
3. [Creating an Addon](#creating-an-addon)
4. [Node Definitions](#node-definitions)
5. [Execution Logic](#execution-logic)
6. [Registration](#registration)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

## What are Addons?

Addons are modular extensions that add custom functionality to the workflow builder. They can:

- Add new node types to the palette
- Provide custom execution logic
- Integrate with external services
- Extend processing capabilities

## Addon Structure

Every addon follows this TypeScript interface:

```typescript
interface Addon {
  metadata: AddonMetadata
  nodes?: AddonNodeDefinition[]
  initialize?: () => Promise<void>
  cleanup?: () => Promise<void>
}

interface AddonMetadata {
  id: string              // Unique identifier (kebab-case)
  name: string            // Display name
  version: string         // Semver version
  author: string          // Author name
  description: string     // Brief description
  category: 'indexer' | 'framework' | 'reader' | 'tool' | 'custom' | 'rag' | 'database' | 'container'
  enabled: boolean        // Initial enabled state
  tags?: string[]         // Optional tags for search
  homepage?: string       // Optional homepage URL
  repository?: string     // Optional repository URL
}
```

## Creating an Addon

### Step 1: Create a new file

Create a new file in `/src/lib/addons/` directory:

```bash
src/lib/addons/myCustomAddon.ts
```

### Step 2: Define your addon

```typescript
import { Addon } from '@/lib/addons'

export const myCustomAddon: Addon = {
  metadata: {
    id: 'my-custom-addon',
    name: 'My Custom Addon',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Description of what this addon does',
    category: 'tool',
    enabled: true,
    tags: ['custom', 'utility'],
    homepage: 'https://example.com',
    repository: 'https://github.com/user/repo',
  },
  nodes: [
    // Node definitions go here
  ],
  initialize: async () => {
    console.log('My addon initialized')
    // Perform any initialization logic
  },
  cleanup: async () => {
    console.log('My addon cleaned up')
    // Perform cleanup when disabled/uninstalled
  },
}
```

## Node Definitions

Each addon can provide multiple node types:

```typescript
interface AddonNodeDefinition {
  type: string                    // Unique node type identifier
  label: string                   // Display label
  category: string                // Category for grouping
  inputs: AddonPortDefinition[]   // Input ports
  outputs: AddonPortDefinition[]  // Output ports
  config: AddonConfigField[]      // Configuration fields
  execute?: (inputs: Record<string, any>, config: Record<string, any>) => Promise<any>
}
```

### Port Definition

```typescript
interface AddonPortDefinition {
  id: string          // Port identifier
  label: string       // Display label
  type: 'text' | 'number' | 'boolean' | 'object' | 'array' | 'file' | 'any'
  required?: boolean  // Whether port is required
}
```

### Config Field Definition

```typescript
interface AddonConfigField {
  id: string                     // Field identifier
  label: string                  // Display label
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password'
  defaultValue?: any             // Default value
  options?: { label: string; value: any }[]  // For select type
  required?: boolean             // Whether field is required
  placeholder?: string           // Placeholder text
  description?: string           // Help text
}
```

## Execution Logic

The `execute` function receives inputs and config, and returns outputs:

```typescript
execute: async (inputs, config) => {
  // inputs: Record<string, any> - values from input ports
  // config: Record<string, any> - values from config fields
  
  // Your processing logic here
  const result = processData(inputs.data, config.option)
  
  // Return object with output port IDs as keys
  return {
    result: result,
    metadata: { timestamp: Date.now() }
  }
}
```

### Example: Simple Transform Node

```typescript
{
  type: 'custom-uppercase',
  label: 'Uppercase Text',
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
      label: 'Uppercase Text',
      type: 'text',
    },
  ],
  config: [
    {
      id: 'trim',
      label: 'Trim Whitespace',
      type: 'boolean',
      defaultValue: false,
    },
  ],
  execute: async (inputs, config) => {
    let text = inputs.text || ''
    if (config.trim) {
      text = text.trim()
    }
    return {
      result: text.toUpperCase()
    }
  },
}
```

## Registration

### Method 1: Add to exampleAddons.ts

Add your addon to the `EXAMPLE_ADDONS` array in `/src/lib/exampleAddons.ts`:

```typescript
import { myCustomAddon } from '@/lib/addons/myCustomAddon'

export const EXAMPLE_ADDONS = [
  ...RAG_ADDONS,
  exampleIndexerAddon,
  exampleFrameworkAddon,
  exampleReaderAddon,
  exampleToolAddon,
  myCustomAddon, // Add your addon here
]
```

### Method 2: Runtime Registration

Register your addon programmatically:

```typescript
import { addonRegistry } from '@/lib/addons'
import { myCustomAddon } from '@/lib/addons/myCustomAddon'

// Register
addonRegistry.register(myCustomAddon)

// Enable
addonRegistry.enable('my-custom-addon')

// Disable
addonRegistry.disable('my-custom-addon')

// Unregister
addonRegistry.unregister('my-custom-addon')
```

## Best Practices

### 1. Unique IDs
Always use unique, descriptive IDs in kebab-case:
```typescript
id: 'my-company-special-processor'
```

### 2. Error Handling
Always handle errors gracefully:
```typescript
execute: async (inputs, config) => {
  try {
    const result = await externalAPI.process(inputs.data)
    return { result }
  } catch (error) {
    console.error('Processing failed:', error)
    return { 
      result: null, 
      error: error.message 
    }
  }
}
```

### 3. Input Validation
Validate inputs before processing:
```typescript
execute: async (inputs, config) => {
  if (!inputs.data || typeof inputs.data !== 'string') {
    throw new Error('Input data must be a string')
  }
  // Process...
}
```

### 4. Type Safety
Provide clear port types:
```typescript
inputs: [
  { id: 'count', label: 'Count', type: 'number', required: true },
  { id: 'items', label: 'Items', type: 'array', required: true },
]
```

### 5. Documentation
Add helpful descriptions:
```typescript
config: [
  {
    id: 'apiKey',
    label: 'API Key',
    type: 'password',
    required: true,
    description: 'Your API key from https://example.com/settings',
    placeholder: 'sk-...',
  },
]
```

### 6. Cleanup Resources
Always cleanup in the cleanup function:
```typescript
let connection = null

initialize: async () => {
  connection = await connectToService()
},

cleanup: async () => {
  if (connection) {
    await connection.close()
    connection = null
  }
}
```

## Examples

### Example 1: Text Processing Addon

```typescript
export const textProcessingAddon: Addon = {
  metadata: {
    id: 'text-processing',
    name: 'Text Processing Suite',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Advanced text processing utilities',
    category: 'tool',
    enabled: true,
  },
  nodes: [
    {
      type: 'text-word-count',
      label: 'Word Count',
      category: 'Tools',
      inputs: [
        { id: 'text', label: 'Text', type: 'text', required: true },
      ],
      outputs: [
        { id: 'count', label: 'Word Count', type: 'number' },
        { id: 'characters', label: 'Character Count', type: 'number' },
      ],
      config: [],
      execute: async (inputs) => {
        const text = inputs.text || ''
        const words = text.trim().split(/\s+/).filter(w => w.length > 0)
        return {
          count: words.length,
          characters: text.length,
        }
      },
    },
  ],
}
```

### Example 2: API Integration Addon

```typescript
export const weatherAddon: Addon = {
  metadata: {
    id: 'weather-api',
    name: 'Weather API',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Fetch weather data from external API',
    category: 'custom',
    enabled: true,
  },
  nodes: [
    {
      type: 'weather-fetch',
      label: 'Get Weather',
      category: 'Custom',
      inputs: [
        { id: 'city', label: 'City', type: 'text', required: true },
      ],
      outputs: [
        { id: 'weather', label: 'Weather Data', type: 'object' },
      ],
      config: [
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          description: 'Weather API key',
        },
        {
          id: 'units',
          label: 'Units',
          type: 'select',
          options: [
            { label: 'Metric', value: 'metric' },
            { label: 'Imperial', value: 'imperial' },
          ],
          defaultValue: 'metric',
        },
      ],
      execute: async (inputs, config) => {
        const response = await fetch(
          `https://api.weather.com/data?city=${inputs.city}&units=${config.units}&apiKey=${config.apiKey}`
        )
        const weather = await response.json()
        return { weather }
      },
    },
  ],
}
```

### Example 3: Database Addon

```typescript
let dbConnection = null

export const customDatabaseAddon: Addon = {
  metadata: {
    id: 'custom-database',
    name: 'Custom Database',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Connect to custom database',
    category: 'database',
    enabled: true,
  },
  nodes: [
    {
      type: 'db-query',
      label: 'Database Query',
      category: 'Databases',
      inputs: [
        { id: 'query', label: 'SQL Query', type: 'text', required: true },
      ],
      outputs: [
        { id: 'results', label: 'Results', type: 'array' },
      ],
      config: [
        {
          id: 'connectionString',
          label: 'Connection String',
          type: 'password',
          required: true,
        },
      ],
      execute: async (inputs, config) => {
        const results = await dbConnection.query(inputs.query)
        return { results }
      },
    },
  ],
  initialize: async () => {
    dbConnection = await initializeDatabase()
  },
  cleanup: async () => {
    if (dbConnection) {
      await dbConnection.close()
      dbConnection = null
    }
  },
}
```

## Testing Your Addon

1. Create your addon file in `/src/lib/addons/`
2. Export it and add to `EXAMPLE_ADDONS` in `/src/lib/exampleAddons.ts`
3. Refresh the application
4. Open the Addons Manager to verify registration
5. Enable your addon
6. Check the Node Palette for your new nodes
7. Test node execution in a workflow

## Troubleshooting

### Addon not appearing
- Check console for registration errors
- Verify unique addon ID
- Ensure proper export in exampleAddons.ts

### Nodes not showing
- Verify addon is enabled
- Check node category matches palette categories
- Ensure nodes array is properly defined

### Execution fails
- Check inputs are being passed correctly
- Verify output keys match output port IDs
- Add error handling and logging

## API Reference

### AddonRegistry Methods

```typescript
// Register an addon
addonRegistry.register(addon: Addon): void

// Unregister an addon
addonRegistry.unregister(addonId: string): void

// Get a specific addon
addonRegistry.get(addonId: string): Addon | undefined

// Get all addons
addonRegistry.getAll(): Addon[]

// Get enabled addons
addonRegistry.getEnabled(): Addon[]

// Get addons by category
addonRegistry.getByCategory(category: string): Addon[]

// Get all nodes from enabled addons
addonRegistry.getAllNodes(): AddonNodeDefinition[]

// Enable an addon
addonRegistry.enable(addonId: string): void

// Disable an addon
addonRegistry.disable(addonId: string): void

// Subscribe to changes
addonRegistry.subscribe(listener: () => void): () => void
```

## Contributing

When creating addons for public distribution:

1. Include comprehensive documentation
2. Add unit tests for execution logic
3. Provide example workflows
4. Follow naming conventions
5. Include license information
6. Specify dependencies clearly

---

For questions or issues, please refer to the main project documentation or open an issue on GitHub.
