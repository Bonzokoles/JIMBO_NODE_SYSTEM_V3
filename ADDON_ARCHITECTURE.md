# ADDON ISOLATION - DEVELOPER NOTES

## Overview

The addon system has been designed with **complete isolation** from the core application code. This architecture allows for safe addon development without risk of breaking the main workflow builder.

## Architecture Principles

### 1. Separation of Concerns

**CORE SYSTEM (Stable - Do Not Modify for Addon Development):**
- `/src/lib/addons.ts` - Type definitions, AddonRegistry class
- `/src/components/AddonsManager.tsx` - UI for managing addons
- `/src/components/NodePalette.tsx` - Integration with node palette
- `/src/App.tsx` - Addon initialization (minimal integration point)

**ADDON IMPLEMENTATIONS (Safe to Modify):**
- `/src/lib/addons/` - Directory for all addon implementations
- `/src/lib/addons/examples/` - Example addons (textProcessing, weatherAPI)
- `/src/lib/addons/rag/` - RAG system addons
- `/src/lib/exampleAddons.ts` - Addon registration file
- `/src/lib/ragAddons.ts` - RAG addon implementations (legacy, can be moved)

### 2. Registration Pattern

Addons are registered via a centralized registry:

```typescript
// In /src/lib/exampleAddons.ts
import { myAddon } from '@/lib/addons/my-addon/index'

export const EXAMPLE_ADDONS = [
  ...RAG_ADDONS,
  exampleIndexerAddon,
  myAddon, // Add your addon here
]
```

The registry pattern ensures:
- Single source of truth for all addons
- Easy enable/disable functionality
- Subscription-based updates to UI
- Proper initialization and cleanup lifecycle

### 3. Isolation Guarantees

**What addons CAN do:**
- Define custom node types with inputs/outputs
- Implement custom execution logic
- Access configuration from users
- Initialize resources (DB connections, API clients)
- Clean up resources on disable/uninstall
- Subscribe to registry events

**What addons CANNOT do:**
- Modify core workflow store
- Access other addons' private data
- Interfere with canvas rendering
- Break core application functionality
- Access or modify the AddonRegistry singleton directly (use provided API)

### 4. Type Safety

All addon interfaces are strongly typed:

```typescript
interface Addon {
  metadata: AddonMetadata
  nodes?: AddonNodeDefinition[]
  initialize?: () => Promise<void>
  cleanup?: () => Promise<void>
}
```

TypeScript ensures:
- Compile-time validation of addon structure
- Autocomplete support in IDE
- Type-safe config and port definitions
- Clear error messages for misconfigurations

## Development Workflow

### Creating a New Addon

1. **Create addon directory:**
   ```bash
   mkdir -p src/lib/addons/my-addon
   ```

2. **Create implementation:**
   Copy `/ADDON_TEMPLATE.ts` as starting point:
   ```bash
   cp ADDON_TEMPLATE.ts src/lib/addons/my-addon/index.ts
   ```

3. **Implement your addon:**
   Edit the file with your custom nodes and logic

4. **Register addon:**
   Add to `/src/lib/exampleAddons.ts`:
   ```typescript
   import { myAddon } from '@/lib/addons/my-addon/index'
   export const EXAMPLE_ADDONS = [..., myAddon]
   ```

5. **Test:**
   - Refresh application
   - Open Addons Manager
   - Enable your addon
   - Test nodes in workflow

### Best Practices for Addon Developers

1. **Unique IDs**: Always use unique addon IDs (kebab-case)
   ```typescript
   id: 'company-name-addon-purpose'
   ```

2. **Error Handling**: Wrap execution in try-catch
   ```typescript
   execute: async (inputs, config) => {
     try {
       // Your logic
       return { result }
     } catch (error) {
       console.error('Addon error:', error)
       throw error
     }
   }
   ```

3. **Resource Cleanup**: Always clean up in cleanup()
   ```typescript
   let connection = null
   
   initialize: async () => {
     connection = await connect()
   },
   
   cleanup: async () => {
     if (connection) {
       await connection.close()
       connection = null
     }
   }
   ```

4. **Input Validation**: Validate inputs before processing
   ```typescript
   execute: async (inputs, config) => {
     if (!inputs.data) {
       throw new Error('Data input is required')
     }
     // Process...
   }
   ```

5. **Documentation**: Add JSDoc comments
   ```typescript
   /**
    * Converts text to uppercase with optional prefix
    * @param inputs.text - The text to convert
    * @param config.prefix - Optional prefix to add
    * @returns Object with result property
    */
   execute: async (inputs, config) => {
     // ...
   }
   ```

## Core System Modifications

**When to modify core files:**
- Adding new port types to AddonPortDefinition
- Extending AddonMetadata with new fields
- Adding new config field types
- Modifying the registry API

**How to safely modify core:**
1. Update type definitions in `/src/lib/addons.ts`
2. Update UI components if needed
3. Maintain backward compatibility
4. Update ADDONS.md documentation
5. Test all existing addons still work

## Testing Strategy

### Unit Testing Addons

```typescript
// Example test structure
describe('MyAddon', () => {
  it('should process text correctly', async () => {
    const node = myAddon.nodes[0]
    const result = await node.execute?.(
      { input: 'test' },
      { uppercase: true }
    )
    expect(result.output).toBe('TEST')
  })
})
```

### Integration Testing

1. Load addon in application
2. Enable in Addons Manager
3. Add node to canvas
4. Configure node
5. Execute workflow
6. Verify output

### Edge Cases to Test

- Missing required inputs
- Invalid configuration
- Network failures (for API addons)
- Database connection failures
- Cleanup after disable
- Re-enable after cleanup

## Performance Considerations

### Addon Loading

Addons are registered on app initialization:
- Keep addon files small
- Lazy load heavy dependencies in execute()
- Use initialize() for one-time setup

### Execution Performance

- Avoid heavy computation in main thread
- Use Web Workers for CPU-intensive tasks
- Cache results when appropriate
- Implement streaming for large data

### Memory Management

- Clean up resources in cleanup()
- Avoid memory leaks from event listeners
- Use WeakMap for caching when appropriate

## Security Considerations

### Input Sanitization

Always sanitize user inputs:
```typescript
execute: async (inputs, config) => {
  const sanitized = inputs.text
    .replace(/[<>]/g, '')  // Remove HTML
    .trim()
  // Process sanitized input
}
```

### API Keys

- Store API keys in config (password type)
- Never log API keys
- Use environment variables when possible

### External Resources

- Validate URLs before fetching
- Set timeouts on network requests
- Limit request sizes
- Handle CORS appropriately

## Future Enhancements

Potential addon system improvements:
- [ ] Addon marketplace/repository
- [ ] Version management and updates
- [ ] Dependency resolution between addons
- [ ] Sandboxed execution environment
- [ ] Hot reload during development
- [ ] Addon testing framework
- [ ] Performance profiling tools
- [ ] Addon analytics and usage tracking

## Troubleshooting

### Addon not appearing in manager
- Check console for registration errors
- Verify unique addon ID
- Ensure import in exampleAddons.ts
- Check TypeScript compilation errors

### Nodes not in palette
- Verify addon is enabled
- Check node category matches palette
- Refresh application
- Check console for initialization errors

### Execution fails
- Add console.log in execute function
- Verify input/output port IDs match
- Check type compatibility
- Review error messages in execution log

### Cleanup not working
- Verify cleanup() is defined
- Check async/await usage
- Test by toggling addon on/off
- Monitor resource cleanup in dev tools

## Contributing

When contributing addons:
1. Follow the addon template structure
2. Include comprehensive documentation
3. Add example workflows
4. Test thoroughly
5. Submit with README explaining use case

## Questions?

See:
- `/ADDONS.md` - Complete addon development guide
- `/ADDON_TEMPLATE.ts` - Working template with comments
- `/src/lib/addons/examples/` - Example implementations
