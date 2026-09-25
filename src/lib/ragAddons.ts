import { Addon } from '@/lib/addons'

interface VectorStore {
  id: string
  name: string
  documents: Array<{
    id: string
    text: string
    embedding: number[]
    metadata?: any
    timestamp: number
  }>
}

const vectorStores = new Map<string, VectorStore>()

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
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

async function generateMockEmbedding(text: string): Promise<number[]> {
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
  
  return embedding
}

export const ragVectorizationAddon: Addon = {
  metadata: {
    id: 'rag-vectorization',
    name: 'RAG Vectorization',
    version: '1.0.0',
    author: 'Node\'y Team',
    description: 'Vector store and semantic search for RAG workflows',
    category: 'framework',
    enabled: true,
  },
  nodes: [
    {
      type: 'rag-create-store',
      label: 'Create Vector Store',
      category: 'RAG',
      inputs: [],
      outputs: [
        {
          id: 'store',
          label: 'Vector Store',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'storeName',
          label: 'Store Name',
          type: 'text',
          required: true,
          defaultValue: 'default-store',
        },
        {
          id: 'embeddingModel',
          label: 'Embedding Model',
          type: 'select',
          options: [
            { label: 'Mock Embedding', value: 'mock' },
          ],
          defaultValue: 'mock',
        },
      ],
      execute: async (inputs, config) => {
        const storeName = config.storeName || 'default-store'
        
        if (!vectorStores.has(storeName)) {
          vectorStores.set(storeName, {
            id: storeName,
            name: storeName,
            documents: [],
          })
        }

        return {
          store: {
            id: storeName,
            name: storeName,
          },
        }
      },
    },
    {
      type: 'rag-add-document',
      label: 'Add Document to Store',
      category: 'RAG',
      inputs: [
        {
          id: 'store',
          label: 'Vector Store',
          type: 'object',
          required: true,
        },
        {
          id: 'text',
          label: 'Text',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'documentId',
          label: 'Document ID',
          type: 'text',
        },
        {
          id: 'store',
          label: 'Vector Store',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'metadata',
          label: 'Metadata (JSON)',
          type: 'text',
          placeholder: '{"key": "value"}',
        },
      ],
      execute: async (inputs, config) => {
        const store = vectorStores.get(inputs.store.id)
        if (!store) {
          throw new Error('Vector store not found')
        }

        const text = inputs.text as string
        const embedding = await generateMockEmbedding(text)
        const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        let metadata = {}
        try {
          if (config.metadata) {
            metadata = JSON.parse(config.metadata)
          }
        } catch (e) {
          metadata = { raw: config.metadata }
        }

        store.documents.push({
          id: docId,
          text,
          embedding,
          metadata,
          timestamp: Date.now(),
        })

        return {
          documentId: docId,
          store: {
            id: store.id,
            name: store.name,
          },
        }
      },
    },
    {
      type: 'rag-semantic-search',
      label: 'Semantic Search',
      category: 'RAG',
      inputs: [
        {
          id: 'store',
          label: 'Vector Store',
          type: 'object',
          required: true,
        },
        {
          id: 'query',
          label: 'Search Query',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'results',
          label: 'Search Results',
          type: 'array',
        },
        {
          id: 'topResult',
          label: 'Top Result',
          type: 'object',
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
          id: 'minSimilarity',
          label: 'Similarity Threshold',
          type: 'number',
          defaultValue: 0.5,
        },
      ],
      execute: async (inputs, config) => {
        const store = vectorStores.get(inputs.store.id)
        if (!store) {
          throw new Error('Vector store not found')
        }

        const queryEmbedding = await generateMockEmbedding(inputs.query as string)
        const topK = Number(config.topK) || 5
        const minSimilarity = Number(config.minSimilarity) || 0.5

        const results: Array<{ text: string; score: number; metadata?: any; id: string }> = []

        for (const doc of store.documents) {
          const similarity = cosineSimilarity(queryEmbedding, doc.embedding)
          if (similarity >= minSimilarity) {
            results.push({
              id: doc.id,
              text: doc.text,
              score: similarity,
              metadata: doc.metadata,
            })
          }
        }

        results.sort((a, b) => b.score - a.score)
        const topResults = results.slice(0, topK)

        return {
          results: topResults,
          topResult: topResults[0] || null,
        }
      },
    },
    {
      type: 'rag-chunk-text',
      label: 'Chunk Text',
      category: 'RAG',
      inputs: [
        {
          id: 'text',
          label: 'Text',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'chunks',
          label: 'Text Chunks',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'chunkSize',
          label: 'Chunk Size',
          type: 'number',
          defaultValue: 500,
        },
        {
          id: 'overlap',
          label: 'Overlap',
          type: 'number',
          defaultValue: 50,
        },
        {
          id: 'separator',
          label: 'Separator',
          type: 'select',
          options: [
            { label: 'Sentence (.)', value: '.' },
            { label: 'Word (space)', value: ' ' },
            { label: 'Paragraph (\\n\\n)', value: '\n\n' },
          ],
          defaultValue: '.',
        },
      ],
      execute: async (inputs, config) => {
        const text = inputs.text as string
        const chunkSize = Number(config.chunkSize) || 500
        const overlap = Number(config.overlap) || 50
        const separator = config.separator || '.'

        const chunks: string[] = []
        const parts = text.split(separator)
        
        let currentChunk = ''
        for (const part of parts) {
          if ((currentChunk + part).length <= chunkSize) {
            currentChunk += part + separator
          } else {
            if (currentChunk) {
              chunks.push(currentChunk.trim())
            }
            currentChunk = currentChunk.slice(-overlap) + part + separator
          }
        }
        
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }

        return {
          chunks,
        }
      },
    },
  ],
  initialize: async () => {
    vectorStores.clear()
  },
  cleanup: async () => {
    vectorStores.clear()
  },
}

export const ragDatabaseAddon: Addon = {
  metadata: {
    id: 'rag-databases',
    name: 'RAG Database Connectors',
    version: '1.0.0',
    author: 'Node\'y Team',
    description: 'Connect to vector databases',
    category: 'framework',
    enabled: true,
  },
  nodes: [
    {
      type: 'db-chromadb-connect',
      label: 'ChromaDB Connect',
      category: 'Databases',
      inputs: [],
      outputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'host',
          label: 'Host',
          type: 'text',
          defaultValue: 'localhost',
        },
        {
          id: 'port',
          label: 'Port',
          type: 'number',
          defaultValue: 8000,
        },
        {
          id: 'collection',
          label: 'Collection Name',
          type: 'text',
          required: true,
        },
      ],
      execute: async (inputs, config) => {
        return {
          connection: {
            type: 'chromadb',
            host: config.host,
            port: config.port,
            collection: config.collection,
            connected: true,
          },
        }
      },
    },
    {
      type: 'db-pinecone-connect',
      label: 'Pinecone Connect',
      category: 'Databases',
      inputs: [],
      outputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: true,
        },
        {
          id: 'environment',
          label: 'Environment',
          type: 'text',
          defaultValue: 'us-west1-gcp',
        },
        {
          id: 'indexName',
          label: 'Index Name',
          type: 'text',
          required: true,
        },
      ],
      execute: async (inputs, config) => {
        return {
          connection: {
            type: 'pinecone',
            apiKey: config.apiKey,
            environment: config.environment,
            indexName: config.indexName,
            connected: true,
          },
        }
      },
    },
    {
      type: 'db-qdrant-connect',
      label: 'Qdrant Connect',
      category: 'Databases',
      inputs: [],
      outputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'url',
          label: 'Qdrant URL',
          type: 'text',
          defaultValue: 'http://localhost:6333',
        },
        {
          id: 'apiKey',
          label: 'API Key (optional)',
          type: 'text',
        },
        {
          id: 'collection',
          label: 'Collection Name',
          type: 'text',
          required: true,
        },
      ],
      execute: async (inputs, config) => {
        return {
          connection: {
            type: 'qdrant',
            url: config.url,
            apiKey: config.apiKey,
            collection: config.collection,
            connected: true,
          },
        }
      },
    },
    {
      type: 'db-pgvector-connect',
      label: 'PostgreSQL (pgvector) Connect',
      category: 'Databases',
      inputs: [],
      outputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'connectionString',
          label: 'Connection String',
          type: 'text',
          placeholder: 'postgresql://user:pass@localhost:5432/db',
          required: true,
        },
        {
          id: 'tableName',
          label: 'Table Name',
          type: 'text',
          defaultValue: 'embeddings',
        },
      ],
      execute: async (inputs, config) => {
        return {
          connection: {
            type: 'pgvector',
            connectionString: config.connectionString,
            tableName: config.tableName,
            connected: true,
          },
        }
      },
    },
    {
      type: 'db-vector-insert',
      label: 'Insert Vector',
      category: 'Databases',
      inputs: [
        {
          id: 'connection',
          label: 'Database Connection',
          type: 'object',
          required: true,
        },
        {
          id: 'embedding',
          label: 'Embedding Vector',
          type: 'array',
          required: true,
        },
        {
          id: 'metadata',
          label: 'Metadata',
          type: 'object',
        },
      ],
      outputs: [
        {
          id: 'documentId',
          label: 'Document ID',
          type: 'text',
        },
        {
          id: 'success',
          label: 'Success',
          type: 'boolean',
        },
      ],
      config: [],
      execute: async (inputs, config) => {
        const docId = `doc-${Date.now()}`
        return {
          documentId: docId,
          success: true,
        }
      },
    },
    {
      type: 'db-vector-query',
      label: 'Query Vectors',
      category: 'Databases',
      inputs: [
        {
          id: 'connection',
          label: 'Database Connection',
          type: 'object',
          required: true,
        },
        {
          id: 'queryVector',
          label: 'Query Vector',
          type: 'array',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'results',
          label: 'Search Results',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'topK',
          label: 'Top K Results',
          type: 'number',
          defaultValue: 10,
        },
      ],
      execute: async (inputs, config) => {
        return {
          results: [],
        }
      },
    },
  ],
}

export const ragFileReaderAddon: Addon = {
  metadata: {
    id: 'rag-file-readers',
    name: 'File Readers',
    version: '1.0.0',
    author: 'Node\'y Team',
    description: 'Read and process local files',
    category: 'framework',
    enabled: true,
  },
  nodes: [
    {
      type: 'file-read-local',
      label: 'Read Local File',
      category: 'File Readers',
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
          id: 'content',
          label: 'File Content',
          type: 'text',
        },
        {
          id: 'metadata',
          label: 'File Metadata',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'encoding',
          label: 'Encoding',
          type: 'select',
          options: [
            { label: 'UTF-8', value: 'utf-8' },
            { label: 'ASCII', value: 'ascii' },
          ],
          defaultValue: 'utf-8',
        },
      ],
      execute: async (inputs, config) => {
        const file = inputs.file
        if (file instanceof File) {
          const content = await file.text()
          return {
            content,
            metadata: {
              name: file.name,
              size: file.size,
              type: file.type,
            },
          }
        }
        
        return {
          content: '',
          metadata: {},
        }
      },
    },
    {
      type: 'file-read-csv',
      label: 'Read CSV',
      category: 'File Readers',
      inputs: [
        {
          id: 'file',
          label: 'CSV File',
          type: 'file',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'data',
          label: 'Parsed Data',
          type: 'array',
        },
        {
          id: 'headers',
          label: 'Headers',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'hasHeaders',
          label: 'Has Headers',
          type: 'boolean',
          defaultValue: true,
        },
        {
          id: 'separator',
          label: 'Separator',
          type: 'select',
          options: [
            { label: 'Comma (,)', value: ',' },
            { label: 'Semicolon (;)', value: ';' },
            { label: 'Tab', value: '\t' },
          ],
          defaultValue: ',',
        },
      ],
      execute: async (inputs, config) => {
        const file = inputs.file
        
        if (file instanceof File) {
          const content = await file.text()
          const lines = content.split('\n').filter(line => line.trim())
          const separator = config.separator

          let headers: string[] = []
          let data: any[] = []

          if (config.hasHeaders && lines.length > 0) {
            headers = lines[0].split(separator).map(h => h.trim())
            data = lines.slice(1).map(line => {
              const values = line.split(separator)
              const row: any = {}
              headers.forEach((header, i) => {
                row[header] = values[i]?.trim() || ''
              })
              return row
            })
          } else {
            data = lines.map(line => line.split(separator).map(v => v.trim()))
          }
          
          return {
            data,
            headers,
          }
        }
        
        return {
          data: [],
          headers: [],
        }
      },
    },
    {
      type: 'file-read-json',
      label: 'Read JSON',
      category: 'File Readers',
      inputs: [
        {
          id: 'file',
          label: 'JSON File',
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
      config: [],
      execute: async (inputs, config) => {
        const file = inputs.file
        
        if (file instanceof File) {
          const content = await file.text()
          const data = JSON.parse(content)
          
          return {
            data,
          }
        }
        
        return {
          data: null,
        }
      },
    },
    {
      type: 'file-read-markdown',
      label: 'Read Markdown',
      category: 'File Readers',
      inputs: [
        {
          id: 'file',
          label: 'Markdown File',
          type: 'file',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'content',
          label: 'Content',
          type: 'text',
        },
      ],
      config: [
        {
          id: 'parseHeaders',
          label: 'Parse Headers',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      execute: async (inputs, config) => {
        const file = inputs.file
        
        if (file instanceof File) {
          const content = await file.text()
          
          return {
            content,
          }
        }
        
        return {
          content: '',
        }
      },
    },
    {
      type: 'file-batch-read',
      label: 'Batch Read Files',
      category: 'File Readers',
      inputs: [
        {
          id: 'files',
          label: 'Files',
          type: 'array',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'contents',
          label: 'File Contents',
          type: 'array',
        },
        {
          id: 'metadata',
          label: 'Files Metadata',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'filterExtension',
          label: 'Filter by Extension',
          type: 'text',
          placeholder: '.txt,.md',
        },
      ],
      execute: async (inputs, config) => {
        let files = inputs.files as any[]
        
        if (config.filterExtension) {
          const extensions = config.filterExtension.split(',').map((e: string) => e.trim())
          files = files.filter((file: any) => {
            if (file.name) {
              return extensions.some(ext => file.name.endsWith(ext))
            }
            return false
          })
        }
        
        return {
          contents: [],
          metadata: [],
        }
      },
    },
  ],
}

export const ragContainerAddon: Addon = {
  metadata: {
    id: 'rag-containers',
    name: 'RAG Container Management',
    version: '1.0.0',
    author: 'Node\'y Team',
    description: 'Manage Docker/Podman containers for AI models and vector databases',
    category: 'framework',
    enabled: true,
  },
  nodes: [
    {
      type: 'container-ai-model',
      label: 'Configure AI Model Container',
      category: 'Containers',
      inputs: [],
      outputs: [
        {
          id: 'config',
          label: 'Container Config',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'runtime',
          label: 'Container Runtime',
          type: 'select',
          options: [
            { label: 'Docker', value: 'docker' },
            { label: 'Podman', value: 'podman' },
          ],
          defaultValue: 'docker',
        },
        {
          id: 'modelType',
          label: 'Model Type',
          type: 'select',
          options: [
            { label: 'Ollama', value: 'ollama' },
            { label: 'LocalAI (Multi-modal)', value: 'localai' },
            { label: 'Custom Image', value: 'custom' },
          ],
          defaultValue: 'ollama',
        },
        {
          id: 'customImage',
          label: 'Custom Image (if custom)',
          type: 'text',
          placeholder: 'myregistry/mymodel:latest',
        },
        {
          id: 'port',
          label: 'Port',
          type: 'number',
          defaultValue: 11434,
        },
        {
          id: 'gpuEnabled',
          label: 'Enable GPU',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      execute: async (inputs, config) => {
        const imageMap: Record<string, string> = {
          ollama: 'ollama/ollama',
          localai: 'quay.io/go-skynet/local-ai',
          custom: config.customImage || 'ollama/ollama',
        }

        return {
          config: {
            runtime: config.runtime,
            image: imageMap[config.modelType],
            port: config.port,
            gpuEnabled: config.gpuEnabled,
          },
        }
      },
    },
    {
      type: 'container-vector-db',
      label: 'Configure Vector DB Container',
      category: 'Containers',
      inputs: [],
      outputs: [
        {
          id: 'config',
          label: 'Container Config',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'runtime',
          label: 'Container Runtime',
          type: 'select',
          options: [
            { label: 'Docker', value: 'docker' },
            { label: 'Podman', value: 'podman' },
          ],
          defaultValue: 'docker',
        },
        {
          id: 'dbType',
          label: 'Database Type',
          type: 'select',
          options: [
            { label: 'ChromaDB', value: 'chromadb' },
            { label: 'Qdrant', value: 'qdrant' },
            { label: 'Milvus', value: 'milvus' },
            { label: 'PostgreSQL + pgvector', value: 'pgvector' },
          ],
          defaultValue: 'chromadb',
        },
        {
          id: 'port',
          label: 'Port',
          type: 'number',
        },
        {
          id: 'volumePath',
          label: 'Volume Path (optional)',
          type: 'text',
          placeholder: '/path/to/data',
        },
      ],
      execute: async (inputs, config) => {
        const imageMap: Record<string, string> = {
          chromadb: 'chromadb/chroma',
          qdrant: 'qdrant/qdrant',
          milvus: 'milvusdb/milvus',
          pgvector: 'ankane/pgvector',
        }

        const defaultPorts: Record<string, number> = {
          chromadb: 8000,
          qdrant: 6333,
          milvus: 19530,
          pgvector: 5432,
        }

        const port = config.port || defaultPorts[config.dbType]

        return {
          config: {
            runtime: config.runtime,
            image: imageMap[config.dbType],
            port,
            command: config.runtime === 'docker' 
              ? `docker run -p ${port}:${port} ${imageMap[config.dbType]}`
              : `podman run -p ${port}:${port} ${imageMap[config.dbType]}`,
          },
        }
      },
    },
    {
      type: 'container-execute',
      label: 'Execute Container Command',
      category: 'Containers',
      inputs: [
        {
          id: 'config',
          label: 'Container Config',
          type: 'object',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'command',
          label: 'Command',
          type: 'text',
        },
        {
          id: 'status',
          label: 'Status',
          type: 'text',
        },
      ],
      config: [],
      execute: async (inputs, config) => {
        return {
          command: inputs.config.command || '',
          status: 'Command prepared (manual execution required)',
        }
      },
    },
  ],
}

export const RAG_ADDONS = [
  ragVectorizationAddon,
  ragDatabaseAddon,
  ragFileReaderAddon,
  ragContainerAddon,
]
