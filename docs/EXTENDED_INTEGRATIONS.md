# Extended Integrations for Node'y System

This document provides a comprehensive overview of the extended integrations added to the Node'y workflow builder system, including Extended AI Providers, Vector Database Integration, and CHUCK System Bridge.

## Table of Contents

1. [Overview](#overview)
2. [Extended AI Providers](#extended-ai-providers)
3. [Vector Database Integration](#vector-database-integration)
4. [CHUCK System Bridge](#chuck-system-bridge)
5. [Getting Started](#getting-started)
6. [Use Cases](#use-cases)

## Overview

The Node'y system now supports three major integration categories:

- **15 AI Providers** - Including OpenRouter, EdenAI, Together.ai, Replicate, Perplexity AI, and more
- **5 Vector Databases** - Pinecone, Weaviate, Qdrant, Chroma, and Milvus for semantic search and RAG
- **CHUCK System Bridge** - Deep integration with CHUCK_indst_shemat's 100+ AI tools and workflow system

## Extended AI Providers

### Supported Providers (15 Total)

#### Aggregators & Unified APIs

**1. OpenRouter** - Unified API for 100+ models
- Access GPT-4, Claude, Llama, Mixtral through one API
- Auto-routing to cheapest/fastest model
- Cost optimization
- Endpoint: `https://openrouter.ai/api/v1`

**2. EdenAI Platform** - Multi-provider aggregator
- 200+ AI models from 100+ providers
- Unified interface for text, image, audio, OCR
- Built-in fallback and load balancing
- Endpoint: `https://api.edenai.run/v2`

#### Open-Source Model Hosting

**3. Together.ai**
- Llama 2/3, Mixtral, Qwen, DeepSeek
- Fast inference on dedicated GPUs
- Endpoint: `https://api.together.xyz/v1`

**4. Anyscale Endpoints**
- Ray-powered inference
- Llama 2, Mistral, CodeLlama
- Serverless scaling
- Endpoint: `https://api.endpoints.anyscale.com/v1`

**5. Fireworks AI**
- Sub-second latency
- Code generation, function calling
- Endpoint: `https://api.fireworks.ai/inference/v1`

**6. Lepton AI**
- Serverless AI with zero-config
- Auto-optimization
- Endpoint: `https://api.lepton.ai/v1`

#### Specialized Services

**7. Replicate**
- Cloud API for ML models
- SDXL, Stable Video, Whisper
- Pay-per-use pricing
- Endpoint: `https://api.replicate.com/v1`

**8. Perplexity AI**
- Search-augmented LLM
- Real-time web search integration
- Citations and sources
- Endpoint: `https://api.perplexity.ai`

**9. Baseten**
- ML model deployment
- Custom model hosting
- Autoscaling infrastructure
- Endpoint: `https://app.baseten.co/models`

**10. OctoAI**
- Optimized AI inference
- Image generation, LLMs
- GPU acceleration
- Endpoint: `https://text.octoai.run/v1`

#### Major Cloud Providers (from PR #3)

**11. OpenAI** - GPT-4, GPT-3.5-turbo, embeddings
**12. Anthropic** - Claude 3 (Opus, Sonnet, Haiku)
**13. Google** - Gemini Pro, multimodal
**14. Cohere** - Command, embeddings, rerank
**15. HuggingFace** - 1000+ open-source models

### Available Nodes

#### 1. AI Provider Request (`ai-provider-request`)
Single provider API call with full configuration.

**Inputs:**
- `prompt` - User prompt text
- `provider` - Provider name (optional, uses config)
- `apiKey` - API key (optional, uses config)

**Outputs:**
- `response` - AI-generated response text
- `metadata` - Usage stats, latency, cost

**Configuration:**
- Provider selection (dropdown)
- Model name
- Temperature (0-2)
- Max tokens
- System prompt
- API key

#### 2. Multi-Provider Fallback (`ai-multi-provider-fallback`)
Automatic failover across multiple providers.

**Inputs:**
- `prompt` - User prompt
- `providers` - Array of provider configs (optional)

**Outputs:**
- `response` - Successful response
- `usedProvider` - Which provider succeeded
- `allAttempts` - Log of all attempts

**Configuration:**
- Provider priority list (comma-separated)
- API keys (JSON object)
- Timeout per provider (ms)
- Retry count

**Use Case:** Build resilient AI systems that automatically switch providers on failure.

#### 3. Provider Comparison (`ai-provider-compare`)
Compare multiple providers side-by-side.

**Inputs:**
- `prompt` - Same prompt for all providers
- `providers` - Providers to compare (optional)

**Outputs:**
- `responses` - All provider responses
- `comparison` - Comparison metrics
- `winner` - Best response (by criteria)

**Configuration:**
- Providers list
- API keys (JSON)
- Comparison criteria (speed, cost, quality)

**Use Case:** A/B testing, quality comparison, cost analysis.

#### 4. OpenRouter Auto-Route (`openrouter-request`)
OpenRouter-specific node with auto-routing.

**Inputs:**
- `prompt` - User prompt
- `preferences` - Model preferences (optional)

**Outputs:**
- `response` - AI response
- `usedModel` - Which model was selected
- `cost` - Actual cost

**Configuration:**
- API key
- Auto-routing preference (cheapest, fastest, quality)
- Budget limit per request

#### 5. EdenAI Aggregator (`edenai-request`)
EdenAI multi-provider aggregation.

**Inputs:**
- `prompt` - Input text/data
- `taskType` - Task type (optional)

**Outputs:**
- `response` - Aggregated response
- `providersUsed` - List of providers used
- `aggregatedResult` - Full metadata

**Configuration:**
- API key
- Task type (text, image, audio, ocr)
- Provider preferences

#### 6. List Providers (`ai-providers-list`)
List all available providers with their features.

**Outputs:**
- `providers` - Array of provider info
- `count` - Total count

## Vector Database Integration

### Supported Databases (5 Total)

**1. Pinecone** - Managed vector database
- Serverless option
- High-performance similarity search
- Metadata filtering
- Max dimension: 20,000

**2. Weaviate** - Open-source vector DB
- GraphQL API
- Hybrid search (vector + keyword)
- Multi-tenancy support
- Max dimension: 65,535

**3. Qdrant** - Vector similarity engine
- Payload-based filtering
- On-premise or cloud
- Quantization support
- Max dimension: 65,535

**4. Chroma** - AI-native DB
- Python-first
- Built-in embeddings
- Document collections
- Max dimension: 2,048

**5. Milvus** - Cloud-native vector DB
- Horizontal scaling
- GPU acceleration
- Billion-scale support
- Max dimension: 32,768

### Available Nodes

#### 1. Vector DB Connect (`vector-db-connect`)
Establish connection to vector database.

**Outputs:**
- `connection` - Connection handle
- `status` - Connection status

**Configuration:**
- Database type (dropdown)
- Base URL
- API key
- Collection/Index name
- Vector dimension

#### 2. Vector DB Insert (`vector-db-insert`)
Insert vectors with metadata.

**Inputs:**
- `connection` - DB connection
- `vectors` - Array of vectors
- `metadata` - Associated metadata

**Outputs:**
- `result` - Insert result
- `ids` - Inserted vector IDs

**Configuration:**
- Batch size
- Upsert vs insert mode

#### 3. Vector DB Search (`vector-db-search`)
Semantic similarity search.

**Inputs:**
- `connection` - DB connection
- `query_vector` - Query vector (optional)
- `query_text` - Query text (optional, auto-embeds)

**Outputs:**
- `results` - Top-k similar vectors
- `scores` - Similarity scores
- `metadata` - Associated metadata

**Configuration:**
- Top-k results
- Similarity metric (cosine, euclidean, dot)
- Min score threshold

#### 4. Generate Embedding (`vector-embed`)
Convert text to embedding vector.

**Inputs:**
- `text` - Input text

**Outputs:**
- `vector` - Embedding vector
- `dimension` - Vector dimension

**Configuration:**
- Embedding model (Mock, OpenAI, Cohere, HuggingFace)
- Normalize vectors

#### 5. Vector Visualizer (`vector-visualize`)
Visualize vector space.

**Inputs:**
- `connection` - DB connection
- `query` - Optional filter

**Outputs:**
- `visualization` - 2D/3D plot data
- `clusters` - Detected clusters

**Configuration:**
- Visualization type (2D UMAP, 3D t-SNE, 2D PCA)
- Sample size
- Color by metadata field

#### 6. Vector Analytics (`vector-analytics`)
Database statistics and quality metrics.

**Inputs:**
- `connection` - DB connection

**Outputs:**
- `stats` - Database statistics
- `quality` - Vector quality metrics

**Configuration:**
- Analysis type (coverage, distribution, clustering, all)

#### 7. List Vector DBs (`vector-db-list`)
List all supported vector databases.

**Outputs:**
- `databases` - Available databases
- `count` - Total count

## CHUCK System Bridge

### Overview

The CHUCK System Bridge connects Node'y with the CHUCK_indst_shemat repository's:
- **MCP Server** - 100+ AI tools database
- **Setup Scoring System** - Quality scoring for tool configurations
- **DAG Validation** - Cycle detection and workflow validation
- **Workflow Builder** - Import CHUCK workflows as Node'y workflows

### Available Nodes

#### 1. CHUCK Tool Search (`chuck-tool-search`)
Search CHUCK's database of 100+ AI tools.

**Inputs:**
- `workflow` - Workflow type (optional)
- `type` - Tool type (optional)
- `search` - Search term (optional)

**Outputs:**
- `tools` - Matching tools
- `count` - Result count

**Configuration:**
- Filter by workflow (SEO, RAG, E-commerce)
- Filter by type (LLM, Writer, API, Database)
- Max results

#### 2. CHUCK Setup Scorer (`chuck-setup-scorer`)
Score setup quality using CHUCK's algorithm.

**Inputs:**
- `tools` - Array of tool IDs
- `workflow` - Target workflow

**Outputs:**
- `score` - Quality score (0-100)
- `completeness` - Completeness score
- `compatibility` - Compatibility score
- `diversity` - Diversity score
- `recommendations` - Suggested improvements

**Configuration:**
- Workflow type
- Strict mode

#### 3. CHUCK DAG Validator (`chuck-dag-validator`)
Validate workflow graph structure.

**Inputs:**
- `nodes` - Array of node IDs
- `edges` - Array of connections

**Outputs:**
- `isValid` - Is DAG valid
- `hasCycle` - Cycle detected
- `issues` - List of issues
- `suggestions` - Fix suggestions

**Configuration:**
- Validation level (strict, moderate, loose)
- Auto-fix cycles

#### 4. CHUCK MCP Query (`chuck-mcp-query`)
Query CHUCK's MCP server.

**Inputs:**
- `query` - Natural language query

**Outputs:**
- `response` - MCP server response
- `tools` - Relevant tools
- `setups` - Relevant setups

**Configuration:**
- MCP server URL
- Query type (search, suggest, compare, build)

#### 5. CHUCK Workflow Import (`chuck-workflow-import`)
Import CHUCK setup as Node'y workflow.

**Inputs:**
- `setupId` - CHUCK setup ID

**Outputs:**
- `workflow` - Imported workflow
- `nodes` - Generated nodes
- `edges` - Generated connections

**Configuration:**
- Setup ID or name
- Auto-connect nodes

#### 6. List CHUCK Tools (`chuck-tools-list`)
List all CHUCK tools.

**Outputs:**
- `tools` - All tools
- `count` - Total count
- `categories` - Tool categories

#### 7. List CHUCK Setups (`chuck-setups-list`)
List all CHUCK setups.

**Outputs:**
- `setups` - All setups
- `count` - Total count

## Getting Started

### Step 1: Enable Addons

1. Open Node'y workflow builder
2. Go to Addons Manager
3. Enable the desired addons:
   - Extended AI Providers
   - Vector Database Integration
   - CHUCK System Bridge

### Step 2: Add API Keys

For AI providers, you'll need API keys from:
- OpenRouter: https://openrouter.ai
- EdenAI: https://edenai.co
- Together.ai: https://together.ai
- Other providers as needed

Store API keys in node configuration or pass as inputs.

### Step 3: Create Your First Workflow

**Example: Multi-Provider AI Workflow**

1. Add "Multi-Provider Fallback" node
2. Configure providers: `openrouter,openai,anthropic`
3. Add API keys in JSON format
4. Connect input prompt
5. Run workflow - automatically tries providers in order

**Example: Vector Search RAG**

1. Add "Vector DB Connect" node (Pinecone)
2. Add "Vector DB Insert" node with your documents
3. Add "Vector DB Search" node
4. Connect query text input
5. Get similar documents with scores

## Use Cases

### 1. Resilient AI Systems
Use Multi-Provider Fallback to build systems that never go down:
- Primary: OpenRouter (cheapest)
- Fallback 1: OpenAI (reliable)
- Fallback 2: Anthropic (high quality)

### 2. Cost Optimization
Use Provider Comparison to find the cheapest provider for your use case:
- Compare OpenRouter, Together.ai, Fireworks
- Track costs and latency
- Optimize based on results

### 3. Semantic Search
Use Vector Databases for intelligent document search:
- Store documents as embeddings
- Query with natural language
- Get relevant results ranked by similarity

### 4. RAG (Retrieval Augmented Generation)
Combine vector search with AI providers:
1. Search vector DB for relevant context
2. Send context + query to AI provider
3. Get grounded, accurate responses

### 5. Workflow Quality Assurance
Use CHUCK integration to validate workflows:
- Score tool combinations
- Detect workflow cycles
- Import proven setups

### 6. Tool Discovery
Use CHUCK Tool Search to find the right tools:
- Search by workflow type (SEO, RAG, etc.)
- Filter by tool type
- Get recommendations

## Next Steps

- See [PROVIDER_MATRIX.md](./PROVIDER_MATRIX.md) for detailed provider comparison
- See [VECTOR_DB_GUIDE.md](./VECTOR_DB_GUIDE.md) for vector database best practices
- Experiment with different provider combinations
- Build your own workflows using these integrations

## Support

For issues or questions:
- GitHub Issues: https://github.com/Bonzokoles/jimbo-node-system-v2/issues
- Documentation: Check other docs in `/docs` folder

## License

MIT License - See LICENSE file for details
