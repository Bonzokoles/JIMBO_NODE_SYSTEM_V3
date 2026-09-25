// ==============================================
// JIMBO LIBRARY INTEGRATION - CODE EXAMPLES
// Gotowe do skopiowania i wklejenia
// ==============================================

// ===== 1. JIMBO LIBRARY SERVICE =====
// Plik: src/services/jimboLibraryService.ts

export interface JimboSearchResult {
  filename: string;
  category: string;
  relevance?: number;
  preview?: string;
}

export interface JimboSearchResponse {
  results: JimboSearchResult[];
  total: number;
  query: string;
}

export class JimboLibraryService {
  private apiUrl = '/jimbo-api'; // Używa proxy z vite.config

  /**
   * Wyszukaj pliki w bibliotece JIMBO
   */
  async search(
    query: string,
    filters?: {
      category?: string;
      fileType?: string;
      maxResults?: number;
    }
  ): Promise<JimboSearchResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          ...filters,
          maxResults: filters?.maxResults || 10 
        })
      });

      if (!response.ok) {
        throw new Error(`JIMBO search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('JIMBO Library search error:', error);
      throw error;
    }
  }

  /**
   * Pobierz zawartość konkretnego pliku
   */
  async getFileContent(category: string, filename: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/view-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, filename })
      });

      if (!response.ok) {
        throw new Error(`Failed to get file: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('JIMBO Library file read error:', error);
      throw error;
    }
  }

  /**
   * Pobierz sformatowany kontekst dla AI
   */
  async getFormattedContext(
    query: string, 
    maxFiles: number = 5
  ): Promise<string> {
    const searchResults = await this.search(query, { maxResults: maxFiles });
    
    let context = `=== JIMBO Library Context ===\n`;
    context += `Query: "${query}"\n`;
    context += `Found: ${searchResults.total} results\n\n`;
    
    for (const result of searchResults.results || []) {
      try {
        const fileContent = await this.getFileContent(
          result.category, 
          result.filename
        );
        
        context += `\n--- ${result.filename} (${result.category}) ---\n`;
        context += fileContent.substring(0, 2000); // Limit to 2000 chars per file
        context += fileContent.length > 2000 ? '\n...[truncated]...\n' : '\n';
      } catch (error) {
        context += `\n[Error loading ${result.filename}]\n`;
      }
    }
    
    return context;
  }

  /**
   * Health check - sprawdź czy library server działa
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const jimboLibraryService = new JimboLibraryService();


// ===== 2. NODE DEFINITION =====
// Dodaj do: src/lib/nodeDefinitions.ts

// W sekcji INPUT NODES, dodaj:
{ 
  type: 'jimboLibrarySearch', 
  label: 'JIMBO Library', 
  iconName: 'Books', 
  category: 'input', 
  description: 'Search THE_DEvz_HUB JIMBO Libraries',
  color: 'oklch(0.6 0.15 280)' 
},


// ===== 3. EXECUTION ENGINE =====
// Dodaj do: src/lib/executionEngine.ts

// W konstruktorze registerDefaultExecutors(), dodaj:
this.registerExecutor('jimboLibrarySearch', this.executeJimboLibrary.bind(this))

// Dodaj metodę wykonawczą:
private async executeJimboLibrary(
  node: WorkflowNode, 
  inputs: any[], 
  context: ExecutionContext
) {
  const { jimboLibraryService } = await import('@/services/jimboLibraryService');
  
  // Pobierz query z inputów lub konfiguracji węzła
  const query = inputs[0]?.value || 
                inputs[0]?.text || 
                node.data.config?.query || 
                '';
  
  if (!query) {
    throw new Error('JIMBO Library: No search query provided');
  }

  const config = node.data.config || {};
  const maxResults = config.maxResults || 5;
  const includeContent = config.includeContent ?? true;

  try {
    // Wyszukaj w bibliotece
    const results = await jimboLibraryService.search(query, { 
      maxResults,
      category: config.category,
      fileType: config.fileType
    });

    // Jeśli trzeba dołączyć pełną treść
    if (includeContent) {
      const context = await jimboLibraryService.getFormattedContext(
        query, 
        maxResults
      );
      
      return {
        type: 'library_context',
        value: context,
        metadata: {
          query,
          total: results.total,
          results: results.results
        },
        timestamp: Date.now()
      };
    }

    // Tylko wyniki wyszukiwania bez treści
    return {
      type: 'library_results',
      value: JSON.stringify(results, null, 2),
      metadata: {
        query,
        total: results.total,
        results: results.results
      },
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('JIMBO Library execution error:', error);
    throw new Error(`JIMBO Library: ${error.message}`);
  }
}


// ===== 4. VITE CONFIG PROXY =====
// Zaktualizuj: vite.config.ts

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    createIconImportProxy() as PluginOption,
    sparkPlugin({ port: 4120 }) as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  server: {
    port: 4120,
    // 🔥 NOWY PROXY DLA JIMBO LIBRARY 🔥
    proxy: {
      '/jimbo-api': {
        target: 'http://localhost:6031',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jimbo-api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('JIMBO Library proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('JIMBO Library request:', req.method, req.url);
          });
        }
      }
    }
  }
});


// ===== 5. CAYDEN INTEGRATION SERVICE =====
// Plik: src/services/caydenService.ts

export interface CaydenChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface CaydenChatRequest {
  message: string;
  context?: any;
  model?: string;
  provider?: string;
}

export class CaydenIntegrationService {
  private baseUrl = 'http://localhost:4110';

  /**
   * Wyślij wiadomość do CAY_DEN Chat
   */
  async sendMessage(
    message: string, 
    context?: any
  ): Promise<{ response: string; metadata?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      });

      if (!response.ok) {
        throw new Error(`CAY_DEN request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CAY_DEN integration error:', error);
      throw error;
    }
  }

  /**
   * Pobierz kontekst z Graph Canvas CAY_DEN
   */
  async getGraphContext(nodeId?: string): Promise<any> {
    try {
      const url = nodeId 
        ? `${this.baseUrl}/api/graph/node/${nodeId}`
        : `${this.baseUrl}/api/graph/context`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to get graph context: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CAY_DEN graph context error:', error);
      throw error;
    }
  }

  /**
   * Wywołaj agent system CAY_DEN
   */
  async executeAgent(
    goal: string, 
    tools?: string[]
  ): Promise<{ result: string; steps: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, tools })
      });

      if (!response.ok) {
        throw new Error(`Agent execution failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CAY_DEN agent error:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const caydenService = new CaydenIntegrationService();


// ===== 6. CAYDEN NODE EXECUTOR =====
// Dodaj do: src/lib/executionEngine.ts

// W registerDefaultExecutors():
this.registerExecutor('caydenChat', this.executeCaydenChat.bind(this))

// Executor:
private async executeCaydenChat(
  node: WorkflowNode, 
  inputs: any[], 
  context: ExecutionContext
) {
  const { caydenService } = await import('@/services/caydenService');

  // Zbierz input text
  const inputText = inputs
    .map(i => i.value || i.text || '')
    .filter(Boolean)
    .join('\n');

  if (!inputText) {
    throw new Error('CAY_DEN Chat: No input text provided');
  }

  const config = node.data.config || {};

  try {
    const result = await caydenService.sendMessage(inputText, {
      workflowId: node.id,
      workflowContext: {
        nodeResults: Array.from(context.nodeResults.entries()),
        executionTime: Date.now() - context.startTime
      },
      model: config.model,
      provider: config.provider
    });

    return {
      type: 'chat_response',
      value: result.response,
      metadata: result.metadata,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('CAY_DEN Chat execution error:', error);
    throw new Error(`CAY_DEN Chat: ${error.message}`);
  }
}


// ===== 7. ENVIRONMENT CONFIG =====
// Dodaj do: .env (skopiuj z .env.example)

# JIMBO Library
JIMBO_LIBRARY_URL=http://localhost:6031

# CAY_DEN Integration
CAYDEN_CHAT_URL=http://localhost:4110
CAYDEN_GATEWAY_URL=http://localhost:6000

# AI Providers (jeśli nie masz, dodaj)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=


// ===== 8. TEST COMPONENT (OPCJONALNE) =====
// Dodaj gdzieś w UI do testowania połączenia
// np. src/components/TestConnections.tsx

import { useState } from 'react';
import { jimboLibraryService } from '@/services/jimboLibraryService';
import { caydenService } from '@/services/caydenService';

export const TestConnections = () => {
  const [status, setStatus] = useState({ jimbo: false, cayden: false });

  const testJimbo = async () => {
    const healthy = await jimboLibraryService.healthCheck();
    setStatus(s => ({ ...s, jimbo: healthy }));
    
    if (healthy) {
      const results = await jimboLibraryService.search('test', { maxResults: 1 });
      console.log('JIMBO test results:', results);
    }
  };

  const testCayden = async () => {
    const healthy = await caydenService.healthCheck();
    setStatus(s => ({ ...s, cayden: healthy }));
    
    if (healthy) {
      const response = await caydenService.sendMessage('Hello from Node\'y!');
      console.log('CAY_DEN response:', response);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Integration Tests</h3>
      <div className="space-y-2">
        <button 
          onClick={testJimbo}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
        >
          Test JIMBO {status.jimbo ? '✅' : '❌'}
        </button>
        <button 
          onClick={testCayden}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test CAY_DEN {status.cayden ? '✅' : '❌'}
        </button>
      </div>
    </div>
  );
};


// ===== 9. ADDON TEMPLATE - JIMBO LIBRARY =====
// Plik: src/lib/addons/jimbo-library/index.ts

import { Addon } from '@/lib/addons';
import { jimboLibraryService } from '@/services/jimboLibraryService';

export const jimboLibraryAddon: Addon = {
  metadata: {
    id: 'jimbo-library',
    name: 'JIMBO Library Integration',
    version: '1.0.0',
    description: 'Access THE_DEvz_HUB JIMBO Libraries from workflows',
    author: 'THE_DEvz_HUB Team',
    category: 'data',
    icon: 'Books',
    tags: ['library', 'search', 'knowledge']
  },

  nodes: [
    {
      type: 'jimboAdvancedSearch',
      label: 'JIMBO Advanced Search',
      category: 'input',
      config: {
        query: { type: 'text', label: 'Search Query', required: true },
        category: { type: 'text', label: 'Category Filter' },
        maxResults: { type: 'number', label: 'Max Results', default: 10 },
        includeContent: { type: 'boolean', label: 'Include File Content', default: true }
      },
      handler: async (input, config) => {
        const results = await jimboLibraryService.search(config.query, {
          category: config.category,
          maxResults: config.maxResults
        });

        if (config.includeContent) {
          const context = await jimboLibraryService.getFormattedContext(
            config.query, 
            config.maxResults
          );
          return { value: context, metadata: results };
        }

        return { value: JSON.stringify(results, null, 2), metadata: results };
      }
    },

    {
      type: 'jimboFileReader',
      label: 'JIMBO File Reader',
      category: 'input',
      config: {
        category: { type: 'text', label: 'Category', required: true },
        filename: { type: 'text', label: 'Filename', required: true }
      },
      handler: async (input, config) => {
        const content = await jimboLibraryService.getFileContent(
          config.category,
          config.filename
        );
        return { value: content };
      }
    }
  ],

  indexers: [
    {
      name: 'JIMBO Library Full Indexer',
      description: 'Index all files in JIMBO Library for faster search',
      handler: async () => {
        // Implement full library indexing
        console.log('Indexing JIMBO Library...');
        // This would call a backend endpoint that indexes everything
      }
    }
  ]
};


// ===== 10. REGISTER ADDON =====
// Dodaj do: src/lib/exampleAddons.ts

import { jimboLibraryAddon } from './addons/jimbo-library';

export const EXAMPLE_ADDONS = [
  // ...existing addons
  jimboLibraryAddon,
];


// ===== 11. LOCAL FILE SERVICE =====
// Plik: src/services/localFileService.ts

/**
 * Serwis do obsługi lokalnych plików używając File System Access API
 * Fallback do tradycyjnego input[type=file] dla nieobsługiwanych przeglądarek
 */

export class LocalFileService {
  private fileSystemSupported = 'showOpenFilePicker' in window;
  private baseDir: FileSystemDirectoryHandle | null = null;

  /**
   * Wybierz plik do odczytu
   */
  async pickFile(accept?: string[]): Promise<File> {
    if (!this.fileSystemSupported) {
      return this.pickFileFallback(accept);
    }
    
    try {
      const options: any = {};
      if (accept) {
        options.types = [{
          description: 'Files',
          accept: { 'text/*': accept }
        }];
      }
      
      const [fileHandle] = await (window as any).showOpenFilePicker(options);
      return await fileHandle.getFile();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('File selection cancelled');
      }
      throw error;
    }
  }

  /**
   * Fallback dla starszych przeglądarek
   */
  private pickFileFallback(accept?: string[]): Promise<File> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) {
        input.accept = accept.join(',');
      }
      
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error('No file selected'));
        }
      };
      
      input.click();
    });
  }

  /**
   * Czytaj plik tekstowy
   */
  async readTextFile(file?: File): Promise<string> {
    const selectedFile = file || await this.pickFile(['.txt', '.md', '.json', '.csv']);
    return await selectedFile.text();
  }

  /**
   * Czytaj plik jako DataURL (dla obrazków)
   */
  async readAsDataURL(file?: File): Promise<string> {
    const selectedFile = file || await this.pickFile(['.jpg', '.png', '.gif', '.webp']);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(selectedFile);
    });
  }

  /**
   * Zapisz plik
   */
  async writeFile(filename: string, content: string | Blob): Promise<void> {
    if (!this.fileSystemSupported) {
      return this.writeFileFallback(filename, content);
    }

    try {
      const options = {
        suggestedName: filename,
        types: [{
          description: 'Text Files',
          accept: { 'text/plain': ['.txt', '.md', '.json'] }
        }]
      };
      
      const fileHandle = await (window as any).showSaveFilePicker(options);
      const writable = await fileHandle.createWritable();
      
      if (typeof content === 'string') {
        await writable.write(content);
      } else {
        await writable.write(content);
      }
      
      await writable.close();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('File save cancelled');
      }
      throw error;
    }
  }

  /**
   * Fallback - download file
   */
  private writeFileFallback(filename: string, content: string | Blob): void {
    const blob = typeof content === 'string' 
      ? new Blob([content], { type: 'text/plain' })
      : content;
      
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Wybierz folder
   */
  async pickDirectory(): Promise<FileSystemDirectoryHandle> {
    if (!this.fileSystemSupported) {
      throw new Error('Directory picker not supported in this browser');
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      this.baseDir = dirHandle;
      return dirHandle;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Directory selection cancelled');
      }
      throw error;
    }
  }

  /**
   * Listuj pliki w folderze
   */
  async listFiles(
    dirHandle?: FileSystemDirectoryHandle,
    options?: { recursive?: boolean; fileTypes?: string[] }
  ): Promise<Array<{ name: string; kind: string; path: string }>> {
    const dir = dirHandle || this.baseDir;
    if (!dir) throw new Error('No directory selected');

    const files: Array<{ name: string; kind: string; path: string }> = [];
    
    const processDirectory = async (handle: FileSystemDirectoryHandle, path = '') => {
      for await (const entry of (handle as any).values()) {
        const currentPath = path ? `${path}/${entry.name}` : entry.name;
        
        if (entry.kind === 'file') {
          if (!options?.fileTypes || 
              options.fileTypes.some(ext => entry.name.endsWith(ext))) {
            files.push({
              name: entry.name,
              kind: 'file',
              path: currentPath
            });
          }
        } else if (entry.kind === 'directory' && options?.recursive) {
          await processDirectory(entry, currentPath);
        }
      }
    };
    
    await processDirectory(dir);
    return files;
  }

  /**
   * Czytaj wiele plików z folderu
   */
  async readFilesFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filter?: (filename: string) => boolean
  ): Promise<Array<{ name: string; content: string }>> {
    const results: Array<{ name: string; content: string }> = [];

    for await (const entry of (dirHandle as any).values()) {
      if (entry.kind === 'file') {
        if (!filter || filter(entry.name)) {
          const file = await entry.getFile();
          const content = await file.text();
          results.push({ name: entry.name, content });
        }
      }
    }

    return results;
  }

  /**
   * Sprawdź wsparcie File System Access API
   */
  isFileSystemAccessSupported(): boolean {
    return this.fileSystemSupported;
  }
}

export const localFileService = new LocalFileService();


// ===== 12. LOCAL FILE NODE DEFINITIONS =====
// Dodaj do: src/lib/nodeDefinitions.ts

// W sekcji INPUT NODES:
{ 
  type: 'localFileRead', 
  label: 'Local File Read', 
  iconName: 'FileText', 
  category: 'input', 
  description: 'Read files from local disk',
  color: 'oklch(0.6 0.15 200)' 
},
{ 
  type: 'localFileBrowser', 
  label: 'File Browser', 
  iconName: 'FolderOpen', 
  category: 'input', 
  description: 'Browse and list local files',
  color: 'oklch(0.6 0.15 200)' 
},
{ 
  type: 'localBatchReader', 
  label: 'Batch File Reader', 
  iconName: 'Files', 
  category: 'input', 
  description: 'Read multiple files from directory',
  color: 'oklch(0.6 0.15 200)' 
},

// W sekcji OUTPUT NODES:
{ 
  type: 'localFileWrite', 
  label: 'Local File Write', 
  iconName: 'FloppyDisk', 
  category: 'output', 
  description: 'Save to local file',
  color: 'oklch(0.65 0.2 30)' 
},


// ===== 13. LOCAL FILE EXECUTORS =====
// Dodaj do: src/lib/executionEngine.ts

// W registerDefaultExecutors():
this.registerExecutor('localFileRead', this.executeLocalFileRead.bind(this))
this.registerExecutor('localFileWrite', this.executeLocalFileWrite.bind(this))
this.registerExecutor('localFileBrowser', this.executeLocalFileBrowser.bind(this))
this.registerExecutor('localBatchReader', this.executeLocalBatchReader.bind(this))

// Metody wykonawcze:

private async executeLocalFileRead(
  node: WorkflowNode, 
  inputs: any[], 
  context: ExecutionContext
) {
  const { localFileService } = await import('@/services/localFileService');
  
  const config = node.data.config || {};
  const useFilePicker = config.useFilePicker ?? true;
  
  try {
    let content: string;
    
    if (useFilePicker) {
      const acceptedTypes = config.acceptedTypes || ['.txt', '.md', '.json', '.csv'];
      const file = await localFileService.pickFile(acceptedTypes);
      content = await file.text();
    } else {
      // Dla automatyzacji - używa ostatnio wybranego pliku
      throw new Error('Auto file reading not implemented - enable file picker');
    }
    
    return {
      type: 'file_content',
      value: content,
      metadata: {
        source: 'local_file',
        size: content.length
      },
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`Local File Read: ${error.message}`);
  }
}

private async executeLocalFileWrite(
  node: WorkflowNode, 
  inputs: any[], 
  context: ExecutionContext
) {
  const { localFileService } = await import('@/services/localFileService');
  
  const content = inputs.map(i => i.value || i.text || '').join('\n');
  const config = node.data.config || {};
  const filename = config.filename || 'output.txt';
  
  try {
    await localFileService.writeFile(filename, content);
    
    return {
      type: 'file_written',
      value: `File saved: ${filename}`,
      metadata: {
        filename,
        size: content.length
      },
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`Local File Write: ${error.message}`);
  }
}

private async executeLocalFileBrowser(
  node: WorkflowNode, 
  inputs: any[], 
  context: ExecutionContext
) {
  const { localFileService } = await import('@/services/localFileService');
  
  const config = node.data.config || {};
  
  try {
    const dirHandle = await localFileService.pickDirectory();
    const files = await localFileService.listFiles(dirHandle, {
      recursive: config.recursive ?? false,
      fileTypes: config.fileTypes
    });
    
    return {
      type: 'file_list',
      value: files.map(f => f.path).join('\n'),
      metadata: {
        directory: dirHandle.name,
        count: files.length,
        files: files
      },
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`File Browser: ${error.message}`);
  }
}

private async executeLocalBatchReader(
  node: WorkflowNode, 
  inputs: any[], 
  context: ExecutionContext
) {
  const { localFileService } = await import('@/services/localFileService');
  
  const config = node.data.config || {};
  
  try {
    const dirHandle = await localFileService.pickDirectory();
    const fileContents = await localFileService.readFilesFromDirectory(
      dirHandle,
      config.filter ? new Function('filename', config.filter) : undefined
    );
    
    // Połącz wszystkie pliki lub zwróć jako JSON
    const output = config.outputFormat === 'json'
      ? JSON.stringify(fileContents, null, 2)
      : fileContents.map(f => `=== ${f.name} ===\n${f.content}`).join('\n\n');
    
    return {
      type: 'batch_file_content',
      value: output,
      metadata: {
        directory: dirHandle.name,
        filesRead: fileContents.length,
        files: fileContents.map(f => f.name)
      },
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`Batch Reader: ${error.message}`);
  }
}


// ===== 14. CONFIGURABLE PORTS & URLS =====
// Plik: src/lib/config.ts

export interface AppConfig {
  nodeSystem: {
    port: number;
    host: string;
  };
  integrations: {
    jimboLibrary: {
      enabled: boolean;
      url: string;
    };
    caydenChat: {
      enabled: boolean;
      url: string;
    };
    aiGateway: {
      enabled: boolean;
      url: string;
    };
  };
  localFiles: {
    enabled: boolean;
    allowedDirectories: string[];
  };
}

// Wczytaj z environment variables
const DEFAULT_CONFIG: AppConfig = {
  nodeSystem: {
    port: parseInt(import.meta.env.VITE_PORT || '4120'),
    host: import.meta.env.VITE_HOST || 'localhost'
  },
  integrations: {
    jimboLibrary: {
      enabled: import.meta.env.VITE_JIMBO_ENABLED !== 'false',
      url: import.meta.env.VITE_JIMBO_URL || 'http://localhost:6031'
    },
    caydenChat: {
      enabled: import.meta.env.VITE_CAYDEN_ENABLED !== 'false',
      url: import.meta.env.VITE_CAYDEN_URL || 'http://localhost:4110'
    },
    aiGateway: {
      enabled: import.meta.env.VITE_GATEWAY_ENABLED === 'true',
      url: import.meta.env.VITE_GATEWAY_URL || 'http://localhost:6000'
    }
  },
  localFiles: {
    enabled: import.meta.env.VITE_LOCAL_FILES_ENABLED !== 'false',
    allowedDirectories: import.meta.env.VITE_ALLOWED_DIRS?.split(',') || []
  }
};

export const getConfig = (): AppConfig => DEFAULT_CONFIG;

// Hook do runtime config (z localStorage/KV)
import { useKV } from '@github/spark/hooks';

export const useAppConfig = () => {
  const [config, setConfig] = useKV<AppConfig>('app-config', DEFAULT_CONFIG);
  return { config, setConfig };
};


// ===== 15. UPDATED .env.example =====
// Skopiuj do: .env

# ===== NODE SYSTEM CONFIGURATION =====
# Port aplikacji Node'y
VITE_PORT=4120
VITE_HOST=localhost

# ===== INTEGRATIONS =====
# JIMBO Library Server
VITE_JIMBO_ENABLED=true
VITE_JIMBO_URL=http://localhost:6031

# CAY_DEN Chat
VITE_CAYDEN_ENABLED=true
VITE_CAYDEN_URL=http://localhost:4110

# AI Gateway
VITE_GATEWAY_ENABLED=false
VITE_GATEWAY_URL=http://localhost:6000

# ===== LOCAL FILES =====
VITE_LOCAL_FILES_ENABLED=true
# Dozwolone foldery (oddzielone przecinkami)
VITE_ALLOWED_DIRS=S:\THE_DEvz_HUB,C:\Users\YourUser\Documents

# ===== API KEYS =====
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
MISTRAL_API_KEY=
COHERE_API_KEY=
PERPLEXITY_API_KEY=
HUGGINGFACE_API_KEY=
GROQ_API_KEY=
TOGETHER_API_KEY=
REPLICATE_API_KEY=
ELEVENLABS_API_KEY=


// ===== 16. VITE CONFIG WITH DYNAMIC PORTS =====
// Zaktualizuj: vite.config.ts

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv, PluginOption } from "vite";
import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

export default defineConfig(({ mode }) => {
  // Wczytaj zmienne środowiskowe
  const env = loadEnv(mode, process.cwd(), '');
  
  const port = parseInt(env.VITE_PORT || '4120');
  const jimboUrl = env.VITE_JIMBO_URL || 'http://localhost:6031';
  const jimboEnabled = env.VITE_JIMBO_ENABLED !== 'false';

  return {
    plugins: [
      react(),
      tailwindcss(),
      createIconImportProxy() as PluginOption,
      sparkPlugin({ port }) as PluginOption,
    ],
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      }
    },
    server: {
      port,
      host: env.VITE_HOST || 'localhost',
      // Dynamiczny proxy na podstawie konfiguracji
      proxy: jimboEnabled ? {
        '/jimbo-api': {
          target: jimboUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/jimbo-api/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('JIMBO Library proxy error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('→ JIMBO:', req.method, req.url);
            });
          }
        }
      } : undefined
    }
  };
});


// ===== 17. SETTINGS PANEL COMPONENT =====
// Plik: src/components/IntegrationSettings.tsx

import { useState } from 'react';
import { useAppConfig } from '@/lib/config';

export const IntegrationSettings = () => {
  const { config, setConfig } = useAppConfig();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const updateUrl = (integration: keyof typeof config.integrations, url: string) => {
    setConfig(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integration]: {
          ...prev.integrations[integration],
          url
        }
      }
    }));
  };

  const toggleIntegration = (integration: keyof typeof config.integrations) => {
    setConfig(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integration]: {
          ...prev.integrations[integration],
          enabled: !prev.integrations[integration].enabled
        }
      }
    }));
  };

  const testConnection = async (name: string, url: string) => {
    try {
      const response = await fetch(`${url}/api/health`, { method: 'GET' });
      setTestResults(prev => ({ ...prev, [name]: response.ok }));
    } catch {
      setTestResults(prev => ({ ...prev, [name]: false }));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Integration Settings</h2>
      
      {/* JIMBO Library */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">JIMBO Library</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integrations.jimboLibrary.enabled}
              onChange={() => toggleIntegration('jimboLibrary')}
            />
            <span className="text-sm">Enabled</span>
          </label>
        </div>
        
        <input
          type="text"
          value={config.integrations.jimboLibrary.url}
          onChange={(e) => updateUrl('jimboLibrary', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="http://localhost:6031"
        />
        
        <button
          onClick={() => testConnection('jimbo', config.integrations.jimboLibrary.url)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection {testResults['jimbo'] === true ? '✅' : testResults['jimbo'] === false ? '❌' : ''}
        </button>
      </div>

      {/* CAY_DEN Chat */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">CAY_DEN Chat</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integrations.caydenChat.enabled}
              onChange={() => toggleIntegration('caydenChat')}
            />
            <span className="text-sm">Enabled</span>
          </label>
        </div>
        
        <input
          type="text"
          value={config.integrations.caydenChat.url}
          onChange={(e) => updateUrl('caydenChat', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="http://localhost:4110"
        />
        
        <button
          onClick={() => testConnection('cayden', config.integrations.caydenChat.url)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Connection {testResults['cayden'] === true ? '✅' : testResults['cayden'] === false ? '❌' : ''}
        </button>
      </div>

      {/* AI Gateway */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">AI Gateway</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.integrations.aiGateway.enabled}
              onChange={() => toggleIntegration('aiGateway')}
            />
            <span className="text-sm">Enabled</span>
          </label>
        </div>
        
        <input
          type="text"
          value={config.integrations.aiGateway.url}
          onChange={(e) => updateUrl('aiGateway', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="http://localhost:6000"
        />
        
        <button
          onClick={() => testConnection('gateway', config.integrations.aiGateway.url)}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Connection {testResults['gateway'] === true ? '✅' : testResults['gateway'] === false ? '❌' : ''}
        </button>
      </div>

      {/* Local Files */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Local File Access</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.localFiles.enabled}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              localFiles: { ...prev.localFiles, enabled: e.target.checked }
            }))}
          />
          <span className="text-sm">Enable File System Access API</span>
        </label>
        
        <p className="text-sm text-gray-600">
          {localFileService.isFileSystemAccessSupported()
            ? '✅ Your browser supports File System Access API'
            : '⚠️ Your browser does not support File System Access API (will use fallback)'}
        </p>
      </div>
    </div>
  );
};


// ==============================================
// DEPLOYMENT CHECKLIST - UPDATED
// ==============================================

/*
✅ LOKALNE PLIKI:
1. Skopiuj localFileService.ts do src/services/
2. Dodaj node definitions dla local file nodes
3. Dodaj executory w executionEngine.ts
4. Test w Chrome/Edge (File System Access API)
5. Test fallback w Firefox/Safari

✅ KONFIGUROWALNE PORTY:
1. Skopiuj config.ts do src/lib/
2. Zaktualizuj .env z przykładu powyżej
3. Zmodyfikuj vite.config.ts aby używał loadEnv
4. Dodaj IntegrationSettings component
5. Dodaj link do settings w UI

✅ JIMBO LIBRARY:
1. Upewnij się że JIMBO Library Server działa na swoim porcie
2. Ustaw VITE_JIMBO_URL w .env
3. Test proxy: fetch('/jimbo-api/health')

✅ TESTY:
- Zmień port w .env i zrestartuj - sprawdź czy działa
- Test czytania pliku lokalnego
- Test zapisu pliku lokalnego
- Test listowania folderu
- Test batch reading

NOTATKI:
- File System Access API działa tylko w Chrome/Edge
- CORS wymaga ustawienia changeOrigin: true w proxy
- Porty można zmieniać w runtime przez Settings Panel
*/


