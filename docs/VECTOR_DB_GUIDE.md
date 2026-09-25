# Vector Database Guide

Comprehensive guide to using vector databases in the Node'y system for semantic search, RAG, and AI workflows.

## Table of Contents

1. [Introduction to Vector Databases](#introduction)
2. [Supported Databases](#supported-databases)
3. [When to Use Which Database](#when-to-use)
4. [Embedding Model Selection](#embedding-models)
5. [Performance Optimization](#performance-optimization)
6. [Scaling Strategies](#scaling-strategies)
7. [Visualization Techniques](#visualization-techniques)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

## Introduction to Vector Databases {#introduction}

Vector databases store and query high-dimensional vectors (embeddings) that represent semantic meaning. They enable:

- **Semantic Search**: Find similar content by meaning, not just keywords
- **RAG (Retrieval Augmented Generation)**: Provide context to LLMs
- **Recommendation Systems**: Find similar items
- **Anomaly Detection**: Identify outliers
- **Clustering**: Group similar items

### Key Concepts

**Embedding**: A vector representation of data (text, images, audio) that captures semantic meaning.

**Similarity Metrics**:
- **Cosine Similarity**: Measures angle between vectors (0-1)
- **Euclidean Distance**: Straight-line distance between points
- **Dot Product**: Inner product of vectors

**Metadata Filtering**: Combine vector search with traditional filters.

## Supported Databases {#supported-databases}

### 1. Pinecone

**Type:** Managed cloud service

**Pros:**
- Fully managed, zero ops
- Serverless option available
- Excellent performance
- Good documentation
- Pod-based or serverless architecture

**Cons:**
- Cloud-only
- Costs can add up
- Limited free tier

**Best For:**
- Production applications
- When you want zero ops burden
- When cost is not the primary concern

**Max Dimension:** 20,000

**Pricing:**
- Serverless: Pay per use ($0.002/query)
- Pod-based: Fixed cost per pod ($70-120/month)

**Setup:**
```typescript
// Configuration in Node'y
{
  dbType: 'pinecone',
  baseUrl: 'https://your-index.pinecone.io',
  apiKey: 'your-api-key',
  collection: 'your-index-name',
  dimension: 1536
}
```

---

### 2. Weaviate

**Type:** Open-source, self-hosted or cloud

**Pros:**
- Open-source
- GraphQL API
- Hybrid search (vector + keyword)
- Multi-tenancy support
- Strong schema system
- Active community

**Cons:**
- More complex setup
- Requires more management
- Learning curve

**Best For:**
- When you need hybrid search
- When you want control
- When you prefer GraphQL
- Multi-tenant applications

**Max Dimension:** 65,535

**Pricing:**
- Self-hosted: Free (your infrastructure costs)
- Cloud: Starting at $25/month

**Setup:**
```typescript
{
  dbType: 'weaviate',
  baseUrl: 'http://localhost:8080',
  apiKey: 'optional-api-key',
  collection: 'YourClass',
  dimension: 768
}
```

---

### 3. Qdrant

**Type:** Open-source, Rust-based

**Pros:**
- Written in Rust (fast, memory-safe)
- Powerful payload filtering
- Good documentation
- Easy to deploy
- Quantization support

**Cons:**
- Smaller community than Weaviate
- Fewer integrations
- Newer platform

**Best For:**
- When performance matters
- Complex filtering requirements
- When you want quantization
- Self-hosted preference

**Max Dimension:** 65,535

**Pricing:**
- Self-hosted: Free
- Cloud: Starting at $25/month

**Setup:**
```typescript
{
  dbType: 'qdrant',
  baseUrl: 'http://localhost:6333',
  apiKey: 'optional-api-key',
  collection: 'your-collection',
  dimension: 384
}
```

---

### 4. Chroma

**Type:** AI-native, Python-first

**Pros:**
- Built for AI applications
- Easy to use
- Built-in embeddings
- Good for prototyping
- Lightweight

**Cons:**
- Less mature
- Limited scalability
- Fewer features
- Python-centric

**Best For:**
- Prototyping
- Python applications
- Simple use cases
- Getting started quickly

**Max Dimension:** 2,048

**Pricing:**
- Open-source: Free

**Setup:**
```typescript
{
  dbType: 'chroma',
  baseUrl: 'http://localhost:8000',
  collection: 'your-collection',
  dimension: 384
}
```

---

### 5. Milvus

**Type:** Cloud-native, scalable

**Pros:**
- Built for massive scale
- GPU acceleration
- Horizontal scaling
- Enterprise features
- Strong performance

**Cons:**
- Complex setup
- Requires more resources
- Overkill for small projects
- Steeper learning curve

**Best For:**
- Large-scale applications
- When you need billions of vectors
- GPU acceleration
- Enterprise deployments

**Max Dimension:** 32,768

**Pricing:**
- Self-hosted: Free (infrastructure costs)
- Cloud: Custom pricing

**Setup:**
```typescript
{
  dbType: 'milvus',
  baseUrl: 'http://localhost:19530',
  collection: 'your-collection',
  dimension: 768
}
```

## When to Use Which Database {#when-to-use}

### Decision Matrix

| Requirement | Recommended DB |
|------------|----------------|
| Zero ops, managed | Pinecone |
| Hybrid search | Weaviate |
| Open-source, fast | Qdrant |
| Quick prototyping | Chroma |
| Massive scale (billions) | Milvus |
| Cost-conscious | Qdrant, Chroma (self-hosted) |
| Python integration | Chroma, Weaviate |
| Complex filtering | Qdrant, Weaviate |
| GPU acceleration | Milvus |
| GraphQL API | Weaviate |

### Use Case Recommendations

**Small Project (<100k vectors):**
- Chroma or Qdrant (self-hosted)
- Easy to set up, low overhead

**Medium Project (100k-10M vectors):**
- Pinecone (serverless)
- Weaviate or Qdrant (self-hosted)
- Balance of features and scale

**Large Project (>10M vectors):**
- Pinecone (pods)
- Milvus
- Weaviate (distributed)
- Need robust infrastructure

**RAG Application:**
- Any database works well
- Pinecone for simplicity
- Weaviate for hybrid search
- Qdrant for filtering

**Semantic Search:**
- Weaviate (hybrid search)
- Pinecone (pure vector)
- Qdrant (with filters)

## Embedding Model Selection {#embedding-models}

### Available Models

**1. OpenAI Ada-002**
- Dimension: 1,536
- Cost: $0.0001/1k tokens
- Quality: Excellent
- Speed: Fast
- Best for: Production, English text

**2. Cohere Embed**
- Dimension: 4,096 or 768
- Cost: $0.0001/1k tokens
- Quality: Excellent
- Speed: Fast
- Best for: Multilingual, production

**3. HuggingFace Sentence Transformers**
- Dimension: 384-768 (model dependent)
- Cost: Free (self-hosted)
- Quality: Good
- Speed: Medium
- Best for: Self-hosted, cost-conscious

**4. Mock Embeddings (for testing)**
- Dimension: 384
- Cost: Free
- Quality: Testing only
- Speed: Very fast
- Best for: Development, testing

### Model Recommendations

**For Production:**
- OpenAI Ada-002 or Cohere Embed
- High quality, reliable
- Worth the cost

**For Development:**
- Mock embeddings
- Fast iteration
- No API costs

**For Self-Hosted:**
- HuggingFace models
- Full control
- No ongoing costs

**For Multilingual:**
- Cohere Embed
- Best multilingual support

### Dimension Considerations

**Lower Dimensions (384-768):**
- Faster search
- Less storage
- Good for many use cases
- Models: Sentence Transformers

**Medium Dimensions (1024-1536):**
- Better quality
- More nuance
- Industry standard
- Models: OpenAI Ada-002

**High Dimensions (2048-4096):**
- Best quality
- More expensive
- Slower search
- Models: Cohere Embed

## Performance Optimization {#performance-optimization}

### Query Optimization

**1. Adjust Top-K**
```typescript
// Lower K = faster queries
topK: 5  // Instead of 100
```

**2. Use Score Thresholds**
```typescript
// Filter low-quality matches
minScore: 0.7  // Cosine similarity
```

**3. Metadata Filtering**
```typescript
// Pre-filter before vector search
metadata: { category: 'tech' }
```

**4. Choose Right Metric**
- Cosine: Best for normalized vectors (most cases)
- Euclidean: When magnitude matters
- Dot Product: Fastest, when vectors are normalized

### Indexing Optimization

**1. Batch Inserts**
```typescript
// Insert in batches of 100-1000
batchSize: 100
```

**2. Use Upsert**
```typescript
// Avoid duplicates
upsert: true
```

**3. Normalize Vectors**
```typescript
// Improves cosine similarity performance
normalize: true
```

### Storage Optimization

**1. Use Quantization (Qdrant)**
- Reduces storage by 4x
- Minimal quality loss
- Faster search

**2. Limit Metadata Size**
- Only store essential metadata
- Large metadata = slower queries

**3. Regular Cleanup**
- Remove old/unused vectors
- Optimize indices periodically

## Scaling Strategies {#scaling-strategies}

### Vertical Scaling

**Increase Resources:**
- More RAM (vectors stored in memory)
- More CPU (faster search)
- More storage (more vectors)

**Limits:**
- Single machine limits
- Expensive at scale
- Not fault-tolerant

### Horizontal Scaling

**Sharding:**
- Split vectors across multiple nodes
- Supported: Milvus, Weaviate, Qdrant (commercial)

**Replication:**
- Multiple copies for availability
- Read scaling
- Fault tolerance

**Partitioning:**
- Split by metadata (e.g., by category)
- Search within partitions
- Better performance

### Caching Strategies

**1. Query Caching**
```typescript
// Cache frequent queries
cache: {
  'common-query': results
}
```

**2. Embedding Caching**
```typescript
// Cache generated embeddings
embeddingCache: {
  'text-hash': vector
}
```

**3. Result Caching**
```typescript
// Cache search results
resultCache: {
  'query-id': topKResults
}
```

## Visualization Techniques {#visualization-techniques}

### 2D Visualization (UMAP)

Best for:
- Quick overview
- Large datasets
- Interactive exploration

```typescript
{
  visualizationType: 'umap-2d',
  sampleSize: 1000,
  colorBy: 'category'
}
```

### 3D Visualization (t-SNE)

Best for:
- Detailed exploration
- Cluster visualization
- Presentations

```typescript
{
  visualizationType: 'tsne-3d',
  sampleSize: 500,
  colorBy: 'cluster'
}
```

### PCA (Principal Component Analysis)

Best for:
- Simple projection
- Fast computation
- Linear relationships

```typescript
{
  visualizationType: 'pca-2d',
  sampleSize: 2000
}
```

### Visualization Best Practices

1. **Sample First**: Don't visualize millions of points
2. **Color by Metadata**: Makes clusters interpretable
3. **Interactive**: Allow zooming and selection
4. **Regular Updates**: Re-visualize as data changes
5. **Export Options**: Save as PNG/HTML for sharing

## Common Patterns {#common-patterns}

### Pattern 1: RAG (Retrieval Augmented Generation)

```
1. Vector DB Connect
2. Vector Embed (user query)
3. Vector Search (top-5 similar docs)
4. AI Provider Request (with context)
5. Return augmented response
```

**Benefits:**
- Grounded responses
- Up-to-date information
- Reduced hallucinations

### Pattern 2: Semantic Search

```
1. Vector DB Connect
2. Vector Embed (search query)
3. Vector Search (top-10 results)
4. Return ranked results
```

**Benefits:**
- Find by meaning, not keywords
- Better user experience
- More relevant results

### Pattern 3: Document Clustering

```
1. Vector DB Connect
2. Vector Insert (all documents)
3. Vector Analytics (clustering)
4. Vector Visualize (2D/3D)
5. Group by clusters
```

**Benefits:**
- Discover topics
- Organize content
- Find duplicates

### Pattern 4: Hybrid Search (Weaviate)

```
1. Vector DB Connect (Weaviate)
2. Hybrid Query:
   - Vector search (semantic)
   - Keyword search (BM25)
3. Combine results
4. Return ranked results
```

**Benefits:**
- Best of both worlds
- More accurate
- Handles edge cases

## Troubleshooting {#troubleshooting}

### Problem: Slow Queries

**Causes:**
- Too many vectors
- High dimensionality
- Poor indexing
- No filtering

**Solutions:**
- Reduce top-K
- Add metadata filters
- Use quantization
- Upgrade hardware

### Problem: Poor Results

**Causes:**
- Wrong embedding model
- Low-quality embeddings
- Wrong similarity metric
- No normalization

**Solutions:**
- Use better embedding model
- Normalize vectors
- Try different metrics
- Increase data quality

### Problem: High Costs

**Causes:**
- Too many queries
- Large embeddings
- No caching
- Wrong provider

**Solutions:**
- Implement caching
- Use smaller embeddings
- Batch operations
- Switch to self-hosted

### Problem: Out of Memory

**Causes:**
- Too many vectors
- High dimensionality
- All vectors in RAM

**Solutions:**
- Use disk-backed storage
- Reduce dimensions
- Implement sharding
- Upgrade RAM

## Best Practices Summary

1. **Choose the right database** for your scale
2. **Use appropriate embeddings** for your use case
3. **Normalize vectors** for cosine similarity
4. **Implement caching** to reduce costs
5. **Batch operations** for better performance
6. **Monitor metrics** (latency, cost, quality)
7. **Regular cleanup** of old data
8. **Test with mock embeddings** first
9. **Visualize regularly** to understand your data
10. **Start small, scale up** as needed

## Resources

- Pinecone Docs: https://docs.pinecone.io
- Weaviate Docs: https://weaviate.io/developers/weaviate
- Qdrant Docs: https://qdrant.tech/documentation
- Chroma Docs: https://docs.trychroma.com
- Milvus Docs: https://milvus.io/docs

## Next Steps

1. Enable Vector Database addon
2. Choose a database (Pinecone for ease, Qdrant for control)
3. Select embedding model (OpenAI for quality, Mock for testing)
4. Build your first RAG workflow
5. Monitor and optimize performance

For more information, see [EXTENDED_INTEGRATIONS.md](./EXTENDED_INTEGRATIONS.md)
