# Node'y - Visual Workflow Builder

A powerful visual workflow builder for creating AI-powered node-based workflows with **complete RAG (Retrieval-Augmented Generation) system**. Build complex automation pipelines, data processing workflows, multi-agent systems, and intelligent document retrieval through an intuitive drag-and-drop interface.

## ✨ Features

- **🧠 Complete RAG System** - Vector stores, semantic search, embeddings, and database integration
- **🐳 Container Management** - Podman/Docker support for AI models and vector databases
- **📄 File Readers** - PDF, CSV, JSON, Markdown, TXT, and directory processing
- **💾 Vector Databases** - ChromaDB, Pinecone, Qdrant, PostgreSQL+pgvector integration
- **12 Pre-configured Templates** - Jump-start your workflows with ready-to-use templates
- **85+ Node Types** - Input, AI, Process, Output, RAG, Database, and Container nodes
- **Visual Workflow Builder** - Intuitive drag-and-drop canvas with real-time execution
- **🔌 Addon System** - Extensible plugin architecture for custom nodes
- **Multi-language Support** - English and Polish interface
- **Auto-save** - Workflows automatically persist across sessions
- **Real-time Execution** - Watch your workflows execute with live status updates

## 🧠 RAG System - NEW!

Node'y now includes a complete RAG implementation:

### Vectorization & Search
- **Create Vector Store** - In-memory vector storage with similarity search
- **Generate Embeddings** - OpenAI, local models, or mock embeddings
- **Semantic Search** - Find similar documents with configurable thresholds
- **Text Chunking** - Intelligent text splitting for RAG

### Database Integration
- **ChromaDB** - Local vector database
- **Pinecone** - Cloud vector database
- **Qdrant** - High-performance vector search
- **PostgreSQL + pgvector** - Vector search in PostgreSQL

### File Processing
- **PDF Reader** - Extract text from PDF documents
- **CSV Parser** - Parse CSV with configurable delimiters
- **JSON Reader** - Parse JSON files
- **Markdown Reader** - Read and optionally convert to HTML
- **Directory Reader** - Process multiple files with filtering

### Container Support
- **AI Models** - Ollama, vLLM, Text Generation Inference
- **Databases** - ChromaDB, Qdrant, pgvector, Redis, Milvus
- **Podman & Docker** - Full container runtime support

**📚 See [RAG_SYSTEM.md](./RAG_SYSTEM.md) for complete RAG documentation**

## 🖥️ PC Utility System - NEW!

Node'y now includes a comprehensive PC utility monitoring and optimization system:

### System Monitoring
- **System Monitor** - Real-time CPU, RAM, Disk, Network usage
- **GPU Monitor** - GPU utilization, memory, temperature tracking
- **Process Manager** - List and sort running processes

### System Operations
- **System Cleaner** - Clean temporary files, cache, logs, recycle bin
- **Memory Optimizer** - Python GC and GPU cache clearing

### AI Features
- **Sentiment Analyzer** - Text sentiment analysis using Hugging Face Transformers
- **GPU Acceleration** - Support for CUDA-enabled GPUs

### Database Integration
- **Metrics Storage** - SQLite database for metrics persistence
- **Historical Data** - Query and analyze historical metrics

**Backend Service:**
A FastAPI backend service (`pc_utility_backend/`) provides system monitoring, GPU stats, cleaning operations, and AI sentiment analysis. The service runs on `http://localhost:8765` and communicates with the Node'y frontend via HTTP.

**📚 See [docs/PC_UTILITY.md](./docs/PC_UTILITY.md) for complete PC Utility documentation**

## 🎯 Workflow Templates

### Starter Templates
- **Simple AI Pipeline** - Basic workflow with input → AI processing → output

### Data Processing
- **Document Processing** - Extract, analyze, and summarize documents
- **Web Scraping Pipeline** - Scrape websites and store structured data
- **Data Enrichment** - Load, transform, and enrich data across databases

### Advanced AI
- **RAG Pipeline** - Complete retrieval-augmented generation with embeddings
- **Multi-Agent System** - Collaborative AI agents (Planner, Researcher, Writer, Critic)
- **AI Model Comparison** - Compare responses across OpenAI, Claude, Gemini, Mistral, and Groq

### Media & Generation
- **Image Generation Workflow** - Generate images with DALL-E, Stable Diffusion, and Midjourney
- **Voice Transcription Pipeline** - Transcribe audio with Whisper and analyze sentiment

### Automation
- **Social Media Automation** - Generate and publish content across platforms
- **GitHub Automation** - Monitor repos and create automated code reviews
- **Error Handling & Retry** - Robust workflows with retry logic and fallbacks

## 🚀 Getting Started

1. **Choose a Template** - Click the "Templates" button in the toolbar
2. **Browse Categories** - Explore Starter, Data, Advanced, Automation, and Media templates
3. **Load Template** - Click any template to load it onto the canvas
4. **Customize** - Modify nodes, connections, and configurations as needed
5. **Execute** - Click "Run Workflow" to see your workflow in action

## 🎨 Node Types

### Input Nodes (15)
Text Input, File Upload, Web Scraper, API Request, Database Query, RSS Reader, CSV Reader, JSON Parser, Voice Input, Image Input, Video Input, Camera Capture, GitHub Repo, Google Drive, Clipboard

### AI Nodes (20)
OpenAI, Anthropic Claude, Google Gemini, Mistral, Cohere, Perplexity, HuggingFace, Ollama, Groq, Together AI, Replicate, DALL-E, Midjourney, Stable Diffusion, Whisper, ElevenLabs, GPT-4 Vision, Claude Vision, Embeddings, Agent Executor

### Process Nodes (30)
Text Chunker, ChromaDB, Pinecone, Weaviate, Qdrant, SQLite, PostgreSQL, MongoDB, Redis, Text Transform, Regex Extract, JSON Transform, Filter, Sort, Merge, Split, Conditional, Loop, Delay, Cache, Retry, Error Handler, Validator, Template, Summarize, Translate, Sentiment Analysis, Entity Extraction, Image Resize, PDF Extract

### Output Nodes (20)
Webhook, Slack, Discord, Telegram, Email, SMS, WhatsApp, Twitter/X, Notion, Airtable, Google Sheets, File Write, S3 Upload, FTP Upload, Console, Desktop Notification, Logger, Printer, Clipboard, QR Code

## 🛠️ Advanced Features

- ✅ Real-time workflow execution with visual feedback
- ✅ Automatic workflow persistence
- ✅ Multi-language support (EN/PL)
- ✅ Node configuration panel
- ✅ Topological sorting for correct execution order
- ✅ Error handling and retry logic
- ✅ Minimap for large workflow navigation
- ✅ **Custom Node Builder** - Create your own nodes visually without coding
- ✅ **Addons System** - Extend with plugins for indexers, frameworks, readers, and tools

## 🔌 Addon System - ISOLATED ARCHITECTURE

Node'y features a powerful **Addon System** that is completely isolated from the core application code. This ensures safe development and prevents addons from breaking the main workflow builder.

### What are Addons?

Addons are modular extensions that can add:
- **🔍 Indexers** - Analyze large data structures
- **📦 Frameworks** - Integrate external frameworks and libraries
- **📖 Readers** - Custom file format parsers
- **🛠️ Tools** - Utility functions and transformations
- **⚡ Custom Nodes** - Specialized workflow nodes with custom logic

### Isolation Architecture

The addon system is designed with strict separation:

**✅ CORE FILES (DO NOT MODIFY when creating addons):**
- `/src/lib/addons.ts` - Core addon types and registry
- `/src/components/AddonsManager.tsx` - Addon management UI
- `/src/components/NodePalette.tsx` - Node palette integration

**✅ ADDON DEVELOPMENT (Safe to create/modify):**
- `/src/lib/addons/` - Your addon implementations
- `/src/lib/addons/examples/` - Example addons for reference
- `/src/lib/addons/rag/` - RAG system addons
- `/src/lib/exampleAddons.ts` - Addon registration file

### Using Addons

1. Open **Toolbar** → Click **Addons** (puzzle piece icon)
2. Browse installed addons in the **Addons Manager**
3. Enable/disable addons with a simple toggle
4. Enabled addon nodes appear automatically in the Node Palette
5. Uninstall addons you no longer need

### Creating Your Own Addons

**🚀 Quick Start (5 minutes):**
See **[QUICK_START_ADDON.md](./QUICK_START_ADDON.md)** for a step-by-step guide to creating your first addon.

**📚 Complete Guide:**
1. Copy `/ADDON_TEMPLATE.ts` to `/src/lib/addons/your-addon/index.ts`
2. Customize the addon metadata and nodes
3. Import in `/src/lib/exampleAddons.ts` and add to `EXAMPLE_ADDONS` array
4. Enable in Addons Manager
5. Find your nodes in the palette!

**Complete Documentation:**
See **[ADDONS.md](./ADDONS.md)** for comprehensive documentation:
- Addon structure and types
- Node definitions (inputs, outputs, config)
- Execution logic
- Best practices and examples
- API reference
- Troubleshooting

**Architecture Details:**
See **[ADDON_ARCHITECTURE.md](./ADDON_ARCHITECTURE.md)** for architecture and isolation principles.

**Example Addons Included:**
- `textProcessing.ts` - Word count, case conversion, find/replace
- `weatherAPI.ts` - Weather API integration example
- RAG System - Complete RAG implementation (see RAG_SYSTEM.md)

**Example Use Cases:**
- Create an indexer for analyzing complex JSON structures
- Add a custom ML framework integration
- Build specialized data validators
- Implement proprietary file format readers
- Integrate with external APIs and services

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
