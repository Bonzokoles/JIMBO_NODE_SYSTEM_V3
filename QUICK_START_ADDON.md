# Quick Start - Creating Your First Addon

This guide will walk you through creating a simple addon in **5 minutes**.

## Step 1: Copy the Template (30 seconds)

```bash
# Create your addon directory
mkdir -p src/lib/addons/hello-world

# Copy the template
cp ADDON_TEMPLATE.ts src/lib/addons/hello-world/index.ts
```

## Step 2: Customize Your Addon (2 minutes)

Edit `src/lib/addons/hello-world/index.ts`:

```typescript
import { Addon } from '@/lib/addons'

export const helloWorldAddon: Addon = {
  metadata: {
    id: 'hello-world',
    name: 'Hello World',
    version: '1.0.0',
    author: 'Your Name',
    description: 'My first addon!',
    category: 'tool',
    enabled: true,  // Changed to true for auto-enable
  },
  
  nodes: [
    {
      type: 'hello-greeter',
      label: 'Greet User',
      category: 'Tools',
      
      inputs: [
        {
          id: 'name',
          label: 'Name',
          type: 'text',
          required: true,
        },
      ],
      
      outputs: [
        {
          id: 'greeting',
          label: 'Greeting Message',
          type: 'text',
        },
      ],
      
      config: [
        {
          id: 'language',
          label: 'Language',
          type: 'select',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Polish', value: 'pl' },
            { label: 'Spanish', value: 'es' },
          ],
          defaultValue: 'en',
        },
      ],
      
      execute: async (inputs, config) => {
        const greetings = {
          en: 'Hello',
          pl: 'Cześć',
          es: 'Hola',
        }
        
        const greeting = greetings[config.language] || greetings.en
        const message = `${greeting}, ${inputs.name}!`
        
        return {
          greeting: message,
        }
      },
    },
  ],
  
  initialize: async () => {
    console.log('✅ Hello World addon initialized!')
  },
  
  cleanup: async () => {
    console.log('👋 Hello World addon cleanup')
  },
}
```

## Step 3: Register Your Addon (1 minute)

Edit `src/lib/exampleAddons.ts`:

```typescript
// Add import at the top
import { helloWorldAddon } from '@/lib/addons/hello-world/index'

// Add to EXAMPLE_ADDONS array
export const EXAMPLE_ADDONS = [
  ...RAG_ADDONS,
  exampleIndexerAddon,
  exampleFrameworkAddon,
  exampleReaderAddon,
  exampleToolAddon,
  exampleTextProcessingAddon,
  exampleWeatherAddon,
  helloWorldAddon,  // Add your addon here
]
```

## Step 4: Test Your Addon (1.5 minutes)

1. **Refresh the application** in your browser
2. **Check console** - You should see: `✅ Hello World addon initialized!`
3. **Open Node Palette** - Find "Tools" category
4. **Look for "Greet User"** node
5. **Drag it to canvas** and configure it
6. **Connect input node** with some text (your name)
7. **Add output node** (Console or Logger)
8. **Run workflow** and see your greeting!

## Step 5: Verify in Addons Manager (30 seconds)

1. Click the **puzzle icon** in toolbar (Addons Manager)
2. Find **"Hello World"** in the list
3. Verify it shows as **Enabled**
4. See **1 node** provided
5. Click on it to see details

## 🎉 Congratulations!

You've created your first addon! You now understand:
- ✅ Addon structure
- ✅ Node definitions
- ✅ Input/output ports
- ✅ Configuration fields
- ✅ Execute function
- ✅ Registration process

## Next Steps

### Make It More Interesting

Add more functionality to your addon:

```typescript
{
  type: 'hello-counter',
  label: 'Greeting Counter',
  category: 'Tools',
  inputs: [
    { id: 'greeting', label: 'Greeting', type: 'text', required: true },
  ],
  outputs: [
    { id: 'count', label: 'Character Count', type: 'number' },
    { id: 'words', label: 'Word Count', type: 'number' },
  ],
  config: [],
  execute: async (inputs) => {
    const text = inputs.greeting || ''
    return {
      count: text.length,
      words: text.split(/\s+/).filter(w => w).length,
    }
  },
}
```

### Add State Management

```typescript
let callCount = 0

export const statefulAddon: Addon = {
  // ... metadata
  
  nodes: [
    {
      type: 'call-counter',
      label: 'Count Executions',
      category: 'Tools',
      inputs: [],
      outputs: [
        { id: 'count', label: 'Execution Count', type: 'number' },
      ],
      config: [],
      execute: async () => {
        callCount++
        return { count: callCount }
      },
    },
  ],
  
  cleanup: async () => {
    callCount = 0  // Reset on disable
  },
}
```

### Add External API Integration

```typescript
{
  type: 'fetch-joke',
  label: 'Random Joke',
  category: 'Tools',
  inputs: [],
  outputs: [
    { id: 'joke', label: 'Joke', type: 'text' },
  ],
  config: [
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Programming', value: 'programming' },
        { label: 'General', value: 'general' },
      ],
      defaultValue: 'programming',
    },
  ],
  execute: async (inputs, config) => {
    const response = await fetch(
      `https://api.jokes.com/joke/${config.category}`
    )
    const data = await response.json()
    return { joke: data.joke }
  },
}
```

## Common Patterns

### Error Handling

```typescript
execute: async (inputs, config) => {
  try {
    const result = await someAsyncOperation(inputs.data)
    return { result }
  } catch (error) {
    console.error('Addon error:', error)
    return { 
      result: null, 
      error: error.message 
    }
  }
}
```

### Input Validation

```typescript
execute: async (inputs, config) => {
  if (!inputs.data || typeof inputs.data !== 'string') {
    throw new Error('Input must be a non-empty string')
  }
  
  if (inputs.data.length > 1000) {
    throw new Error('Input too long (max 1000 characters)')
  }
  
  // Process validated input
  return { result: process(inputs.data) }
}
```

### Multiple Outputs

```typescript
outputs: [
  { id: 'success', label: 'Success Result', type: 'object' },
  { id: 'error', label: 'Error Message', type: 'text' },
  { id: 'metadata', label: 'Metadata', type: 'object' },
],

execute: async (inputs, config) => {
  try {
    const result = await process(inputs.data)
    return {
      success: result,
      error: null,
      metadata: { timestamp: Date.now(), version: '1.0' }
    }
  } catch (error) {
    return {
      success: null,
      error: error.message,
      metadata: { timestamp: Date.now(), failed: true }
    }
  }
}
```

## Resources

- **[ADDONS.md](./ADDONS.md)** - Complete addon documentation
- **[ADDON_ARCHITECTURE.md](./ADDON_ARCHITECTURE.md)** - Architecture details
- **[ADDON_TEMPLATE.ts](./ADDON_TEMPLATE.ts)** - Commented template
- **[/src/lib/addons/examples/](./src/lib/addons/examples/)** - Example addons

## Need Help?

1. Check the example addons in `/src/lib/addons/examples/`
2. Review the complete docs in `ADDONS.md`
3. Look at the RAG system addon in `/src/lib/ragAddons.ts`
4. Open an issue on GitHub

Happy coding! 🚀
