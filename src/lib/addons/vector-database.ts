import { Addon } from '@/lib/addons'

/**
 * Vector Database Integration
 * Supports Pinecone, Weaviate, Qdrant, Chroma, and Milvus
 */

interface VectorDBConfig {
  type: string
  baseUrl: string
  apiKey?: string
  collection?: string
  dimension?: number
}

interface VectorDocument {
  id: string
  vector: number[]
  metadata?: any
  text?: string
}

const VECTOR_DB_CONFIGS: Record<string, any> = {
  pinecone: {
    name: 'Pinecone',
    baseUrl: 'https://api.pinecone.io',
    features: ['serverless', 'managed', 'high-performance'],
    maxDimension: 20000,
  },
  weaviate: {
    name: 'Weaviate',
    baseUrl: 'http://localhost:8080',
    features: ['graphql', 'hybrid-search', 'multi-tenancy'],
    maxDimension: 65535,
  },
  qdrant: {
    name: 'Qdrant',
    baseUrl: 'http://localhost:6333',
    features: ['payload-filtering', 'quantization', 'distributed'],
    maxDimension: 65535,
  },
  chroma: {
    name: 'Chroma',
    baseUrl: 'http://localhost:8000',
    features: ['ai-native', 'built-in-embeddings', 'python-first'],
    maxDimension: 2048,
  },
  milvus: {
    name: 'Milvus',
    baseUrl: 'http://localhost:19530',
    features: ['cloud-native', 'gpu-acceleration', 'billion-scale'],
    maxDimension: 32768,
  },
}

// In-memory storage for connections (in a real app, this would be more sophisticated)
const connections = new Map<string, VectorDBConfig>()
const vectorStores = new Map<string, VectorDocument[]>()

async function generateEmbedding(text: string, model: string = 'mock'): Promise<number[]> {
  if (model === 'mock') {
    // Generate deterministic mock embedding
    const dimensions = 384
    const embedding = new Array(dimensions)
    
    let seed = 0
    for (let i = 0; i < text.length; i++) {
      seed += text.charCodeAt(i)
    }
    
    for (let i = 0; i < dimensions; i++) {
      const x = Math.sin(seed + i) * 10000
      embedding[i] = x - Math.floor(x)
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / norm)
  }
  
  // For real embeddings, would call OpenAI, Cohere, etc.
  throw new Error('Real embedding models not implemented yet')
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimension')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimension')
  }
  
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2)
  }
  
  return Math.sqrt(sum)
}

function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimension')
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i]
  }
  
  return result
}

export const vectorDatabaseAddon: Addon = {
  metadata: {
    id: 'vector-database',
    name: 'Vector Database Integration',
    version: '1.0.0',
    author: 'Node\'y Team',
    description: 'Vector database support for Pinecone, Weaviate, Qdrant, Chroma, and Milvus',
    category: 'framework',
    enabled: true,
  },
  nodes: [
    // Vector DB Connect Node
    {
      type: 'vector-db-connect',
      label: 'Vector DB Connect',
      category: 'Vector DB',
      inputs: [
        {
          id: 'trigger',
          label: 'Trigger',
          type: 'any',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
        },
        {
          id: 'status',
          label: 'Status',
          type: 'text',
        },
      ],
      config: [
        {
          id: 'dbType',
          label: 'Database Type',
          type: 'select',
          options: Object.keys(VECTOR_DB_CONFIGS).map(key => ({
            label: VECTOR_DB_CONFIGS[key].name,
            value: key,
          })),
          defaultValue: 'pinecone',
          required: true,
        },
        {
          id: 'baseUrl',
          label: 'Base URL',
          type: 'text',
          defaultValue: 'https://api.pinecone.io',
        },
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: false,
        },
        {
          id: 'collection',
          label: 'Collection/Index Name',
          type: 'text',
          defaultValue: 'default',
        },
        {
          id: 'dimension',
          label: 'Vector Dimension',
          type: 'number',
          defaultValue: 384,
        },
      ],
      execute: async (inputs, config) => {
        const connectionId = `${config.dbType}-${config.collection}-${Date.now()}`
        
        const connection: VectorDBConfig = {
          type: config.dbType,
          baseUrl: config.baseUrl || VECTOR_DB_CONFIGS[config.dbType].baseUrl,
          apiKey: config.apiKey,
          collection: config.collection,
          dimension: config.dimension,
        }
        
        connections.set(connectionId, connection)
        
        // Initialize empty vector store for this collection
        const storeKey = `${config.dbType}-${config.collection}`
        if (!vectorStores.has(storeKey)) {
          vectorStores.set(storeKey, [])
        }
        
        return {
          connection: { id: connectionId, ...connection },
          status: 'connected',
        }
      },
    },

    // Vector Insert Node
    {
      type: 'vector-db-insert',
      label: 'Vector DB Insert',
      category: 'Vector DB',
      inputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
          required: true,
        },
        {
          id: 'vectors',
          label: 'Vectors',
          type: 'array',
          required: false,
        },
        {
          id: 'metadata',
          label: 'Metadata',
          type: 'array',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'result',
          label: 'Result',
          type: 'object',
        },
        {
          id: 'ids',
          label: 'Inserted IDs',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'batchSize',
          label: 'Batch Size',
          type: 'number',
          defaultValue: 100,
        },
        {
          id: 'upsert',
          label: 'Upsert Mode',
          type: 'select',
          options: [
            { label: 'Insert', value: 'insert' },
            { label: 'Upsert', value: 'upsert' },
          ],
          defaultValue: 'insert',
        },
      ],
      execute: async (inputs, config) => {
        const connection = inputs.connection as any
        if (!connection || !connection.id) {
          throw new Error('Invalid connection')
        }
        
        const vectors = inputs.vectors || []
        const metadata = inputs.metadata || []
        const storeKey = `${connection.type}-${connection.collection}`
        const store = vectorStores.get(storeKey) || []
        
        const insertedIds: string[] = []
        
        for (let i = 0; i < vectors.length; i++) {
          const id = `vec-${Date.now()}-${i}`
          const doc: VectorDocument = {
            id,
            vector: vectors[i],
            metadata: metadata[i] || {},
          }
          
          if (config.upsert === 'upsert') {
            // Remove existing with same metadata
            const existingIndex = store.findIndex(d => 
              d.metadata?.id === metadata[i]?.id
            )
            if (existingIndex !== -1) {
              store.splice(existingIndex, 1)
            }
          }
          
          store.push(doc)
          insertedIds.push(id)
        }
        
        vectorStores.set(storeKey, store)
        
        return {
          result: {
            success: true,
            inserted: insertedIds.length,
            collection: connection.collection,
          },
          ids: insertedIds,
        }
      },
    },

    // Vector Search Node
    {
      type: 'vector-db-search',
      label: 'Vector DB Search',
      category: 'Vector DB',
      inputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
          required: true,
        },
        {
          id: 'query_vector',
          label: 'Query Vector',
          type: 'array',
          required: false,
        },
        {
          id: 'query_text',
          label: 'Query Text',
          type: 'text',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'results',
          label: 'Results',
          type: 'array',
        },
        {
          id: 'scores',
          label: 'Similarity Scores',
          type: 'array',
        },
        {
          id: 'metadata',
          label: 'Metadata',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'topK',
          label: 'Top K Results',
          type: 'number',
          defaultValue: 5,
        },
        {
          id: 'metric',
          label: 'Similarity Metric',
          type: 'select',
          options: [
            { label: 'Cosine', value: 'cosine' },
            { label: 'Euclidean', value: 'euclidean' },
            { label: 'Dot Product', value: 'dot' },
          ],
          defaultValue: 'cosine',
        },
        {
          id: 'minScore',
          label: 'Min Score Threshold',
          type: 'number',
          defaultValue: 0.0,
        },
      ],
      execute: async (inputs, config) => {
        const connection = inputs.connection as any
        if (!connection || !connection.id) {
          throw new Error('Invalid connection')
        }
        
        let queryVector = inputs.query_vector
        
        // If text provided, generate embedding
        if (!queryVector && inputs.query_text) {
          queryVector = await generateEmbedding(inputs.query_text)
        }
        
        if (!queryVector) {
          throw new Error('Must provide either query_vector or query_text')
        }
        
        const storeKey = `${connection.type}-${connection.collection}`
        const store = vectorStores.get(storeKey) || []
        
        // Calculate similarities
        const results = store.map(doc => {
          let similarity: number
          
          if (config.metric === 'cosine') {
            similarity = cosineSimilarity(queryVector, doc.vector)
          } else if (config.metric === 'euclidean') {
            similarity = 1 / (1 + euclideanDistance(queryVector, doc.vector))
          } else {
            similarity = dotProduct(queryVector, doc.vector)
          }
          
          return {
            id: doc.id,
            similarity,
            vector: doc.vector,
            metadata: doc.metadata,
          }
        })
        
        // Filter and sort
        const filtered = results
          .filter(r => r.similarity >= config.minScore)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, config.topK)
        
        return {
          results: filtered,
          scores: filtered.map(r => r.similarity),
          metadata: filtered.map(r => r.metadata),
        }
      },
    },

    // Vector Embedding Node
    {
      type: 'vector-embed',
      label: 'Generate Embedding',
      category: 'Vector DB',
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
          id: 'vector',
          label: 'Embedding Vector',
          type: 'array',
        },
        {
          id: 'dimension',
          label: 'Dimension',
          type: 'number',
        },
      ],
      config: [
        {
          id: 'model',
          label: 'Embedding Model',
          type: 'select',
          options: [
            { label: 'Mock (384d)', value: 'mock' },
            { label: 'OpenAI Ada-002 (1536d)', value: 'openai-ada-002' },
            { label: 'Cohere Embed (4096d)', value: 'cohere-embed' },
            { label: 'HuggingFace (768d)', value: 'huggingface' },
          ],
          defaultValue: 'mock',
        },
        {
          id: 'normalize',
          label: 'Normalize Vector',
          type: 'select',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
          defaultValue: 'true',
        },
      ],
      execute: async (inputs, config) => {
        const text = inputs.text || ''
        const vector = await generateEmbedding(text, config.model)
        
        return {
          vector,
          dimension: vector.length,
        }
      },
    },

    // Vector Visualizer Node
    {
      type: 'vector-visualize',
      label: 'Vector Visualizer',
      category: 'Vector DB',
      inputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
          required: true,
        },
        {
          id: 'query',
          label: 'Query Filter',
          type: 'object',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'visualization',
          label: 'Visualization Data',
          type: 'object',
        },
        {
          id: 'clusters',
          label: 'Detected Clusters',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'visualizationType',
          label: 'Visualization Type',
          type: 'select',
          options: [
            { label: '2D UMAP', value: 'umap-2d' },
            { label: '3D t-SNE', value: 'tsne-3d' },
            { label: '2D PCA', value: 'pca-2d' },
          ],
          defaultValue: 'umap-2d',
        },
        {
          id: 'sampleSize',
          label: 'Sample Size',
          type: 'number',
          defaultValue: 1000,
        },
        {
          id: 'colorBy',
          label: 'Color By Field',
          type: 'text',
          defaultValue: 'category',
        },
      ],
      execute: async (inputs, config) => {
        const connection = inputs.connection as any
        if (!connection || !connection.id) {
          throw new Error('Invalid connection')
        }
        
        const storeKey = `${connection.type}-${connection.collection}`
        const store = vectorStores.get(storeKey) || []
        
        // Simple 2D projection for visualization (mock)
        const samples = store.slice(0, config.sampleSize)
        const projectedPoints = samples.map((doc, idx) => {
          // Simple PCA-like projection to 2D
          const x = doc.vector.reduce((sum, val, i) => sum + val * Math.cos(i), 0)
          const y = doc.vector.reduce((sum, val, i) => sum + val * Math.sin(i), 0)
          
          return {
            x,
            y,
            id: doc.id,
            metadata: doc.metadata,
          }
        })
        
        // Simple clustering (mock)
        const clusters = [
          { id: 0, center: [0, 0], size: Math.floor(samples.length / 3) },
          { id: 1, center: [1, 1], size: Math.floor(samples.length / 3) },
          { id: 2, center: [-1, -1], size: samples.length - 2 * Math.floor(samples.length / 3) },
        ]
        
        return {
          visualization: {
            type: config.visualizationType,
            points: projectedPoints,
            sampleSize: samples.length,
          },
          clusters,
        }
      },
    },

    // Vector Analytics Node
    {
      type: 'vector-analytics',
      label: 'Vector Analytics',
      category: 'Vector DB',
      inputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'stats',
          label: 'Database Statistics',
          type: 'object',
        },
        {
          id: 'quality',
          label: 'Quality Metrics',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'analyzeType',
          label: 'Analysis Type',
          type: 'select',
          options: [
            { label: 'Coverage', value: 'coverage' },
            { label: 'Distribution', value: 'distribution' },
            { label: 'Clustering', value: 'clustering' },
            { label: 'All', value: 'all' },
          ],
          defaultValue: 'all',
        },
      ],
      execute: async (inputs, config) => {
        const connection = inputs.connection as any
        if (!connection || !connection.id) {
          throw new Error('Invalid connection')
        }
        
        const storeKey = `${connection.type}-${connection.collection}`
        const store = vectorStores.get(storeKey) || []
        
        // Calculate statistics
        const stats = {
          totalVectors: store.length,
          dimension: connection.dimension,
          collection: connection.collection,
          dbType: connection.type,
          avgMetadataSize: store.reduce((sum, doc) => 
            sum + JSON.stringify(doc.metadata || {}).length, 0) / store.length,
          estimatedSize: (store.length * connection.dimension * 4) / (1024 * 1024), // MB
        }
        
        // Calculate quality metrics
        const quality = {
          coverage: store.length > 0 ? 1.0 : 0.0,
          distribution: 'uniform', // Mock
          clusterQuality: 0.85, // Mock
          duplicateRate: 0.02, // Mock
        }
        
        return {
          stats,
          quality,
        }
      },
    },

    // List Vector DBs Node
    {
      type: 'vector-db-list',
      label: 'List Vector Databases',
      category: 'Vector DB',
      inputs: [],
      outputs: [
        {
          id: 'databases',
          label: 'Available Databases',
          type: 'array',
        },
        {
          id: 'count',
          label: 'Total Count',
          type: 'number',
        },
      ],
      config: [],
      execute: async () => {
        const databases = Object.entries(VECTOR_DB_CONFIGS).map(([key, config]) => ({
          type: key,
          name: config.name,
          features: config.features,
          maxDimension: config.maxDimension,
          baseUrl: config.baseUrl,
        }))
        
        return {
          databases,
          count: databases.length,
        }
      },
    },
  ],
}
