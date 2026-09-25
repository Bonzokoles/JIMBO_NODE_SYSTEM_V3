/**
 * CAY_DEN Gateway Service
 * Provides integration with CAY_DEN Gateway (port 3885), LIBRARIES (7070), and Knowledge Base (7071)
 */

// ============================
// CAY_DEN GATEWAY (AI Services)
// ============================

export interface GeminiChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiChatResponse {
  response: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface DeepSearchRequest {
  query: string;
  sources?: ('google' | 'tavily' | 'exa' | 'brave')[];
  maxResults?: number;
}

export interface DeepSearchResponse {
  query: string;
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    source: string;
    relevance?: number;
  }>;
  totalResults: number;
}

export interface RAGQueryRequest {
  query: string;
  collectionName?: string;
  limit?: number;
}

export interface RAGQueryResponse {
  query: string;
  results: Array<{
    content: string;
    metadata: Record<string, any>;
    score: number;
  }>;
  context: string;
}

// ============================
// LIBRARIES API (Business Intelligence)
// ============================

export interface LibrarySearchRequest {
  query: string;
  limit?: number;
}

export interface LibrarySearchResponse {
  query: string;
  results: {
    documents: string[][];
    metadatas: Record<string, any>[][];
    distances: number[][];
  };
  total_documents: number;
}

export interface LibraryRAGQueryRequest {
  query: string;
  limit?: number;
}

export interface LibraryRAGQueryResponse {
  context: string;
  source: string;
  library_name: string;
  num_documents: number;
  query: string;
}

// ============================
// KNOWLEDGE BASE API
// ============================

export interface KBSearchRequest {
  query: string;
  limit?: number;
}

export interface KBCategorySearchRequest {
  query: string;
  limit?: number;
}

export interface KBRAGQueryRequest {
  query: string;
  categories?: string[];
  limit?: number;
}

export interface KBRAGQueryResponse {
  context: string;
  num_documents: number;
  query: string;
  categories_searched: string[] | string;
}

// ============================
// SERVICE CLASS
// ============================

class CaydenGatewayService {
  private gatewayUrl = '/cayden-gateway';
  private librariesUrl = '/api/libraries';
  private kbUrl = '/api/kb';

  // ========== CAY_DEN GATEWAY METHODS ==========

  async geminiChat(request: GeminiChatRequest): Promise<GeminiChatResponse> {
    try {
      const response = await fetch(`${this.gatewayUrl}/ai/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Gemini Chat failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini Chat error:', error);
      throw error;
    }
  }

  async geminiVision(imageData: string, prompt: string): Promise<GeminiChatResponse> {
    try {
      const response = await fetch(`${this.gatewayUrl}/ai/gemini/vision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, prompt })
      });

      if (!response.ok) {
        throw new Error(`Gemini Vision failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini Vision error:', error);
      throw error;
    }
  }

  async deepSearch(request: DeepSearchRequest): Promise<DeepSearchResponse> {
    try {
      const response = await fetch(`${this.gatewayUrl}/search/deep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Deep Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Deep Search error:', error);
      throw error;
    }
  }

  async ragQuery(request: RAGQueryRequest): Promise<RAGQueryResponse> {
    try {
      const response = await fetch(`${this.gatewayUrl}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`RAG Query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RAG Query error:', error);
      throw error;
    }
  }

  // ========== LIBRARIES API METHODS ==========

  async listLibraries() {
    try {
      const response = await fetch(`${this.librariesUrl}`);
      
      if (!response.ok) {
        throw new Error(`List Libraries failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('List Libraries error:', error);
      throw error;
    }
  }

  async searchLibrary(libraryId: string, request: LibrarySearchRequest): Promise<LibrarySearchResponse> {
    try {
      const response = await fetch(`${this.librariesUrl}/${libraryId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Library Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Library Search error (${libraryId}):`, error);
      throw error;
    }
  }

  async searchAllLibraries(request: LibrarySearchRequest): Promise<LibrarySearchResponse> {
    try {
      const response = await fetch(`${this.librariesUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Libraries Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Libraries Search error:', error);
      throw error;
    }
  }

  async libraryRAGQuery(libraryId: string, request: LibraryRAGQueryRequest): Promise<LibraryRAGQueryResponse> {
    try {
      const response = await fetch(`${this.librariesUrl}/${libraryId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Library RAG Query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Library RAG Query error (${libraryId}):`, error);
      throw error;
    }
  }

  // ========== KNOWLEDGE BASE API METHODS ==========

  async listKBCategories() {
    try {
      const response = await fetch(`${this.kbUrl}/categories`);
      
      if (!response.ok) {
        throw new Error(`List KB Categories failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('List KB Categories error:', error);
      throw error;
    }
  }

  async searchKBCategory(categoryId: string, request: KBCategorySearchRequest): Promise<any> {
    try {
      const response = await fetch(`${this.kbUrl}/categories/${categoryId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`KB Category Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`KB Category Search error (${categoryId}):`, error);
      throw error;
    }
  }

  async searchAllKB(request: KBSearchRequest): Promise<any> {
    try {
      const response = await fetch(`${this.kbUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`KB Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('KB Search error:', error);
      throw error;
    }
  }

  async kbRAGQuery(request: KBRAGQueryRequest): Promise<KBRAGQueryResponse> {
    try {
      const response = await fetch(`${this.kbUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`KB RAG Query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('KB RAG Query error:', error);
      throw error;
    }
  }

  // ========== HEALTH CHECKS ==========

  async healthCheck() {
    const results = {
      gateway: false,
      libraries: false,
      knowledgeBase: false
    };

    try {
      const gatewayResponse = await fetch(`${this.gatewayUrl}/health`, { method: 'GET' });
      results.gateway = gatewayResponse.ok;
    } catch (e) {
      console.warn('CAY_DEN Gateway health check failed');
    }

    try {
      const librariesResponse = await fetch(`${this.librariesUrl}`, { method: 'GET' });
      results.libraries = librariesResponse.ok;
    } catch (e) {
      console.warn('LIBRARIES API health check failed');
    }

    try {
      const kbResponse = await fetch(`${this.kbUrl}/categories`, { method: 'GET' });
      results.knowledgeBase = kbResponse.ok;
    } catch (e) {
      console.warn('Knowledge Base API health check failed');
    }

    return results;
  }
}

// Export singleton instance
export const caydenGatewayService = new CaydenGatewayService();
