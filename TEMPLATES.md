# Workflow Template Library

A comprehensive collection of pre-configured workflow templates for Node'y Visual Workflow Builder. This library helps you quickly create powerful workflows without starting from scratch.

## 📚 Template Categories

### 🚀 Starter Templates
Simple, beginner-friendly workflows perfect for learning the system:
- Simple AI Pipeline
- Basic ETL Process
- Quick Automation

**Best for:** New users, simple tasks, quick prototypes

### 📊 Data Processing
ETL, transformation, and data pipeline workflows:
- Document Processing
- Web Scraping Pipeline
- Data Enrichment
- Batch Processing
- ETL Pipeline
- Sentiment Analysis

**Best for:** Data engineers, analysts, batch operations

### 🧠 Advanced AI
Complex AI workflows with multiple models and sophisticated logic:
- Multi-Agent System (MOA)
- AI Model Comparison
- RAG Pipeline
- Chatbot with Memory
- Cohere Semantic Search
- HuggingFace NLP Pipeline

**Best for:** AI engineers, researchers, complex reasoning tasks

### ⚙️ Automation
Automated workflows for various tasks:
- Social Media Bot
- GitHub Automation
- Email Automation
- Code Review Assistant
- Error Handling & Retry
- AI Content Moderation

**Best for:** DevOps, workflow automation, scheduled tasks

### 🎨 Media Processing
Image, video, and audio processing workflows:
- Image Generation
- Voice Transcription
- Voice Assistant
- Stable Diffusion Art Studio
- Replicate Multi-Model Pipeline
- Claude Vision Analysis
- Gemini Multimodal Studio

**Best for:** Content creators, media processing, creative AI

### 📚 RAG Systems
Retrieval-Augmented Generation workflows with vector databases:
- Complete Local RAG System
- RAG Pipeline (OpenAI + ChromaDB)
- Perplexity Research Engine

**Best for:** Document Q&A, knowledge bases, semantic search

### 🔌 Integrations
Connect to external services and APIs:
- REST API Integration
- Web Scraping + AI
- Research Assistant

**Best for:** Third-party integrations, API connections, data sync

## 🎯 Featured Templates

### Complete Local RAG System
**Difficulty:** Advanced | **Time:** 5-10 min

Full RAG implementation with local embeddings, ChromaDB, and retrieval. Perfect for:
- Document Q&A systems
- Knowledge base search
- Semantic document retrieval

**Workflow:**
1. Upload documents (PDF, TXT, MD, DOCX)
2. Extract and chunk text
3. Generate embeddings
4. Store in ChromaDB
5. Query with semantic search
6. GPT-4 generates contextual answers

### MOA (Mixture of Agents)
**Difficulty:** Expert | **Time:** 5-10 min

Advanced multi-model orchestration with 2-3 AI models working in parallel:
- Technical analysis (GPT-4o)
- Strategic perspective (Claude 3.5)
- Creative solutions (Gemini 1.5 Pro)
- Final synthesis and recommendations

Perfect for complex decision-making and multi-perspective analysis.

### Chatbot with Memory
**Difficulty:** Intermediate | **Time:** 5 min

Conversational AI with persistent context:
- Load chat history
- Maintain conversation context
- Claude-powered responses
- Persistent memory storage

Ideal for customer support bots and personal assistants.

### Batch Data Processing
**Difficulty:** Advanced | **Time:** 10+ min

Process large datasets in parallel with error handling:
- Split data into batches
- Parallel processing
- Error recovery
- Result aggregation

Perfect for bulk operations and mass processing.

## 🔍 Using Templates

### Load a Template

1. Click the **Templates** button in the toolbar
2. Browse categories or use search
3. Click a template card to load it
4. Customize nodes and configuration as needed

### Save Custom Template

1. Build your workflow
2. Click **Save as Template** button
3. Fill in template details:
   - Name and description
   - Category and difficulty
   - Tags for searchability
   - Use cases
4. Click **Save Template**

Your template will be available in the Templates dialog under "Custom" category.

### Search Templates

Use the search bar to find templates by:
- Name
- Description
- Tags
- Use cases

Example searches:
- "RAG" - Find all RAG-related templates
- "chatbot" - Find conversational AI templates
- "image" - Find media processing templates
- "API" - Find integration templates

## 📊 Template Metadata

Each template includes:

- **Name & Description:** Clear identification
- **Category:** Organizational grouping
- **Difficulty:** Beginner → Intermediate → Advanced → Expert
- **Estimated Time:** How long to configure
- **Tags:** Keywords for search
- **Use Cases:** Real-world applications
- **Node Count:** Workflow complexity
- **Connection Count:** Data flow complexity

## 🎨 Template Difficulty Levels

### 🟢 Beginner
- Simple linear workflows
- Few nodes (3-5)
- Basic configurations
- Good for learning

### 🟡 Intermediate
- Moderate complexity
- Multiple branches (5-10 nodes)
- Some advanced features
- Requires basic understanding

### 🟠 Advanced
- Complex workflows
- Many nodes (10-20)
- Advanced configurations
- Multiple integrations

### 🔴 Expert
- Highly sophisticated
- 20+ nodes
- Complex logic and branching
- Multiple AI models
- Production-ready systems

## 💡 Template Development Guidelines

### Creating Good Templates

1. **Clear Purpose:** Template should solve a specific problem
2. **Self-Documenting:** Node names should be descriptive
3. **Proper Categorization:** Choose the right category
4. **Realistic Examples:** Use meaningful placeholder data
5. **Error Handling:** Include error nodes where appropriate
6. **Comments in Config:** Document non-obvious configurations

### Template Naming Conventions

- Use descriptive, action-oriented names
- Include emojis for visual identification (optional)
- Keep names under 50 characters
- Examples:
  - ✅ "📚 Complete Local RAG System"
  - ✅ "🤝 MOA - Simple (2 Agents)"
  - ❌ "Template 1"
  - ❌ "My Workflow"

### Description Best Practices

- First sentence: What it does
- Second sentence: What makes it special
- Keep under 150 characters
- Focus on outcomes, not implementation

## 🔧 Advanced Template Management

### Programmatic Access

```typescript
import { TemplateManager } from '@/lib/templateManager'

// Get all templates
const templates = await TemplateManager.getAllTemplates()

// Search templates
const results = await TemplateManager.searchTemplates('RAG')

// Get by category
const ragTemplates = await TemplateManager.getTemplatesByCategory('rag')

// Save custom template
await TemplateManager.saveCustomTemplate(
  'My Custom Workflow',
  'Description here',
  nodes,
  edges,
  {
    category: 'custom',
    tags: ['ai', 'automation'],
    difficulty: 'intermediate'
  }
)

// Get statistics
const stats = await TemplateManager.getTemplateStats()
console.log(stats.totalTemplates) // Total count
console.log(stats.categoryCounts) // Per-category breakdown
console.log(stats.avgNodes) // Average node count
```

### Export/Import Custom Templates

```typescript
// Export template
const template = await TemplateManager.getCustomTemplates()
const json = await TemplateManager.exportTemplate(template[0])
// Share this JSON string

// Import template
const imported = await TemplateManager.importTemplate(jsonString)
```

## 📈 Template Statistics

Current library includes:
- **40+ Built-in Templates** across 7 categories
- **Average 8-12 nodes** per template
- **Covers 30+ use cases**
- **Supports 85+ node types**

## 🤝 Contributing Templates

To contribute a template:

1. Create and test your workflow thoroughly
2. Add meaningful names and descriptions
3. Document any special configurations
4. Choose appropriate metadata (category, difficulty, tags)
5. Save as custom template
6. Export and share the JSON

## 📚 Additional Resources

- [Node Definitions](../src/lib/nodeDefinitions.ts) - All available node types
- [Workflow Store](../src/store/workflowStore.ts) - Workflow state management
- [Execution Engine](../src/lib/executionEngine.ts) - How workflows run
- [PRD](../PRD.md) - Product requirements and design

## 🆘 Support

If you encounter issues with templates:

1. Check node configurations are complete
2. Verify all required API keys are set
3. Review execution logs for errors
4. Try the workflow step-by-step
5. Consult the main README for troubleshooting

## 📄 License

All templates are provided as-is for use within Node'y Visual Workflow Builder.
