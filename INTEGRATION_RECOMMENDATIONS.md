# 🔗 Rekomendacje Integracji i Rozwoju Node'y System

**Data analizy:** 6 lutego 2026  
**Aplikacja:** jimbo-node-system-v2 (Visual Workflow Builder)  
**Port:** 4120  

---

## 📊 Analiza Obecnego Stanu

### ✅ Mocne Strony
- **Kompletny System RAG** - ChromaDB, Pinecone, Qdrant, pgvector
- **85+ typów węzłów** - szeroki zakres funkcjonalności
- **System dodatków (Addons)** - izolowana architektura rozszerzeń
- **12 szablonów workflow** - gotowe przepływy pracy
- **Multi-model AI** - OpenAI, Claude, Gemini, Mistral, Groq i inne
- **Auto-save** - automatyczne zapisywanie workflow
- **Minimap** - nawigacja w dużych workflow

### ⚠️ Obszary do Rozwoju
- **Brak integracji z CAY_DEN chatbox** (Port 4110)
- **Brak połączenia z JIMBO Libraries** (Port 6031)
- **Brak własnego backendu** - wszystko client-side
- **Ograniczone API calls** - brak centralnego gateway
- **Brak persystencji zewnętrznej** - tylko localStorage/KV

---

## 🚀 PRIORYTETOWE INTEGRACJE

### 1. 🔌 Integracja z CAY_DEN Chat (WYSOKI PRIORYTET)

**Cel:** Pozwól Node'y wykorzystać konwersacyjny AI z CAY_DEN i vice versa

#### Architektura Połączenia:
```
Node'y (4120)  <-->  Shared Service Layer  <-->  CAY_DEN (4110)
                            ↓
                    Gateway Hub (6000)
```

#### Implementacja:

**A. Utwórz nowy węzeł "CAY_DEN Chat"**
```typescript
// src/lib/nodeDefinitions.ts
{ 
  type: 'caydenChat', 
  label: 'CAY_DEN Chat', 
  iconName: 'ChatCircle', 
  category: 'ai', 
  description: 'Połączenie z CAY_DEN konwersacyjnym AI',
  color: 'oklch(0.65 0.2 180)' 
}
```

**B. Stwórz adapter serwisu**
```typescript
// src/services/caydenService.ts
export class CaydenIntegrationService {
  private baseUrl = 'http://localhost:4110';
  
  async sendMessage(message: string, context?: any) {
    // Wywołaj CAY_DEN API
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    return response.json();
  }
  
  async getGraphContext(nodeId: string) {
    // Pobierz kontekst z Graph Canvas CAY_DEN
  }
}
```

**C. Dodaj executor w executionEngine.ts**
```typescript
this.registerExecutor('caydenChat', this.executeCaydenChat.bind(this))

private async executeCaydenChat(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
  const caydenService = new CaydenIntegrationService();
  
  const inputText = inputs.map(i => i.value || i.text || '').join('\n');
  const result = await caydenService.sendMessage(inputText, {
    workflowId: node.id,
    previousResults: context.nodeResults
  });
  
  return {
    type: 'chat_response',
    value: result.response,
    timestamp: Date.now()
  };
}
```

**D. Reverse Integration - CAY_DEN wywołuje Node'y**
```typescript
// W CAY_DEN: services/nodeSystemService.ts
export const executeNodeWorkflow = async (workflowId: string, input: any) => {
  const response = await fetch('http://localhost:4120/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflowId, input })
  });
  return response.json();
};
```

---

### 2. 📚 Połączenie z JIMBO Libraries (KRYTYCZNY PRIORYTET)

**Cel:** Daj Node'y dostęp do całej biblioteki wiedzy na dysku

#### Implementacja:

**A. Utwórz węzeł "JIMBO Library Search"**
```typescript
{ 
  type: 'jimboLibrarySearch', 
  label: 'JIMBO Library', 
  iconName: 'Books', 
  category: 'input', 
  description: 'Przeszukuj lokalną bibliotekę JIMBO',
  color: 'oklch(0.6 0.15 280)' 
}
```

**B. Serwis biblioteki**
```typescript
// src/services/jimboLibraryService.ts
export class JimboLibraryService {
  private apiUrl = 'http://localhost:6031/api';
  
  async search(query: string, filters?: {
    category?: string;
    fileType?: string;
    maxResults?: number;
  }) {
    const response = await fetch(`${this.apiUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...filters })
    });
    return response.json();
  }
  
  async getFileContent(category: string, filename: string) {
    const response = await fetch(`${this.apiUrl}/view-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, filename })
    });
    return response.json();
  }
  
  async getFormattedContext(query: string, maxFiles: number = 5) {
    const searchResults = await this.search(query, { maxResults: maxFiles });
    
    let context = `=== JIMBO Library Context ===\n`;
    context += `Query: "${query}"\n\n`;
    
    for (const result of searchResults.results || []) {
      const fileContent = await this.getFileContent(result.category, result.filename);
      context += `--- ${result.filename} (${result.category}) ---\n`;
      context += fileContent.content + '\n\n';
    }
    
    return context;
  }
}
```

**C. Proxy w vite.config.ts**
```typescript
server: {
  port: 4120,
  proxy: {
    '/jimbo-api': {
      target: 'http://localhost:6031',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/jimbo-api/, '/api')
    }
  }
}
```

**D. Executor dla JIMBO węzła**
```typescript
private async executeJimboLibrary(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
  const jimboService = new JimboLibraryService();
  
  const query = inputs[0]?.value || node.data.config?.query || '';
  const maxResults = node.data.config?.maxResults || 5;
  
  const results = await jimboService.search(query, { 
    maxResults,
    category: node.data.config?.category 
  });
  
  // Opcjonalnie pobierz pełną treść
  if (node.data.config?.includeContent) {
    const context = await jimboService.getFormattedContext(query, maxResults);
    return { type: 'library_context', value: context, results };
  }
  
  return { type: 'library_results', value: results };
}
```

---

### 3. 🌐 Centralizacja przez AI Gateway (ŚREDNI PRIORYTET)

**Cel:** Jeden endpoint dla wszystkich wywołań AI

#### Dlaczego?
- CAY_DEN ma już `gateway/` folder z AI Gateway
- Node'y robi bezpośrednie wywołania do API providers
- Gateway może centralizować logi, rate limiting, caching

#### Implementacja:

**A. Wykorzystaj istniejący Gateway CAY_DEN**
```typescript
// src/services/gatewayService.ts
export class AIGatewayService {
  private gatewayUrl = 'http://localhost:6000'; // Gateway port z CAY_DEN
  
  async chat(provider: string, model: string, messages: any[], config?: any) {
    return fetch(`${this.gatewayUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, model, messages, ...config })
    }).then(r => r.json());
  }
  
  async embeddings(provider: string, text: string) {
    return fetch(`${this.gatewayUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, text })
    }).then(r => r.json());
  }
}
```

**B. Modyfikuj executory AI**
```typescript
private async executeOpenAI(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
  const useGateway = node.data.config?.useGateway ?? true;
  
  if (useGateway) {
    const gateway = new AIGatewayService();
    return gateway.chat('openai', node.data.config?.model || 'gpt-4', 
      this.buildMessages(inputs, node));
  }
  
  // Fallback do bezpośredniego wywołania
  return this.executeOpenAIDirect(node, inputs, context);
}
```

---

### 4. 📁 Lokalne Pliki - Czytanie/Zapis (WYSOKI PRIORYTET)

**Cel:** Bezpośredni dostęp do lokalnego systemu plików

#### Dlaczego?
- Workflow może czytać/zapisywać pliki bez uploadu
- Automatyzacja pracy z lokalnymi dokumentami
- Integracja z lokalnymi projektami
- Batch processing plików

#### Implementacja:

**A. Węzły do obsługi plików**
```typescript
// src/lib/nodeDefinitions.ts
{ 
  type: 'localFileRead', 
  label: 'Local File Read', 
  iconName: 'FileText', 
  category: 'input', 
  description: 'Czytaj pliki z lokalnego dysku',
  color: 'oklch(0.6 0.15 200)' 
},
{ 
  type: 'localFileWrite', 
  label: 'Local File Write', 
  iconName: 'FloppyDisk', 
  category: 'output', 
  description: 'Zapisz do lokalnego pliku',
  color: 'oklch(0.65 0.2 30)' 
},
{ 
  type: 'localFileBrowser', 
  label: 'File Browser', 
  iconName: 'FolderOpen', 
  category: 'input', 
  description: 'Przeglądaj lokalne foldery',
  color: 'oklch(0.6 0.15 200)' 
}
```

**B. Serwis do obsługi plików**
```typescript
// src/services/localFileService.ts
export class LocalFileService {
  private fileSystemSupported = 'showOpenFilePicker' in window;
  private baseDir: FileSystemDirectoryHandle | null = null;

  async pickFile(accept?: string[]): Promise<File> {
    if (!this.fileSystemSupported) {
      throw new Error('File System Access API not supported');
    }
    
    const [fileHandle] = await window.showOpenFilePicker({
      types: accept ? [{
        description: 'Files',
        accept: { 'text/*': accept }
      }] : undefined
    });
    
    return await fileHandle.getFile();
  }

  async readFile(path: string): Promise<string> {
    // File System Access API lub fallback do file input
    const file = await this.pickFile();
    return await file.text();
  }

  async writeFile(filename: string, content: string): Promise<void> {
    if (!this.fileSystemSupported) {
      // Fallback - download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const fileHandle = await window.showSaveFilePicker({
      suggestedName: filename
    });
    
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async pickDirectory(): Promise<FileSystemDirectoryHandle> {
    const dirHandle = await window.showDirectoryPicker();
    this.baseDir = dirHandle;
    return dirHandle;
  }

  async listFiles(dirHandle?: FileSystemDirectoryHandle): Promise<string[]> {
    const dir = dirHandle || this.baseDir;
    if (!dir) throw new Error('No directory selected');

    const files: string[] = [];
    for await (const entry of dir.values()) {
      if (entry.kind === 'file') {
        files.push(entry.name);
      }
    }
    return files;
  }
}

export const localFileService = new LocalFileService();
```

**C. Executory dla węzłów plików**
```typescript
// W executionEngine.ts
private async executeLocalFileRead(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
  const { localFileService } = await import('@/services/localFileService');
  
  const filePath = node.data.config?.filePath;
  const useFilePicker = node.data.config?.useFilePicker ?? true;
  
  let content: string;
  
  if (useFilePicker || !filePath) {
    const file = await localFileService.pickFile(
      node.data.config?.acceptedTypes
    );
    content = await file.text();
  } else {
    content = await localFileService.readFile(filePath);
  }
  
  return {
    type: 'file_content',
    value: content,
    metadata: {
      source: 'local_file'
    },
    timestamp: Date.now()
  };
}

private async executeLocalFileWrite(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
  const { localFileService } = await import('@/services/localFileService');
  
  const content = inputs.map(i => i.value || '').join('\n');
  const filename = node.data.config?.filename || 'output.txt';
  
  await localFileService.writeFile(filename, content);
  
  return {
    type: 'file_written',
    value: `File saved: ${filename}`,
    timestamp: Date.now()
  };
}

private async executeLocalFileBrowser(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
  const { localFileService } = await import('@/services/localFileService');
  
  const dirHandle = await localFileService.pickDirectory();
  const files = await localFileService.listFiles(dirHandle);
  
  return {
    type: 'file_list',
    value: files.join('\n'),
    metadata: {
      directory: dirHandle.name,
      count: files.length,
      files
    },
    timestamp: Date.now()
  };
}
```

**D. Backend Endpoint dla większej kontroli**
```typescript
// server/fileHandler.ts
import fs from 'fs/promises';
import path from 'path';

app.post('/api/files/read', async (req, res) => {
  const { filepath } = req.body;
  
  // Security: Tylko dozwolone ścieżki
  const allowedDirs = process.env.ALLOWED_DIRECTORIES?.split(',') || [];
  const resolvedPath = path.resolve(filepath);
  
  const isAllowed = allowedDirs.some(dir => 
    resolvedPath.startsWith(path.resolve(dir))
  );
  
  if (!isAllowed) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const content = await fs.readFile(resolvedPath, 'utf-8');
  res.json({ content, path: resolvedPath });
});

app.post('/api/files/write', async (req, res) => {
  const { filepath, content } = req.body;
  
  // Validation jak wyżej
  await fs.writeFile(filepath, content, 'utf-8');
  res.json({ success: true, path: filepath });
});

app.post('/api/files/list', async (req, res) => {
  const { directory } = req.body;
  const files = await fs.readdir(directory);
  res.json({ files });
});
```

---

### 5. ⚙️ Konfigurowalne Porty i Hosty (ŚREDNI PRIORYTET)

**Cel:** Elastyczna konfiguracja endpointów bez edycji kodu

#### Implementacja:

**A. Centralna konfiguracja**
```typescript
// src/lib/config.ts
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

const DEFAULT_CONFIG: AppConfig = {
  nodeSystem: {
    port: parseInt(import.meta.env.VITE_PORT || '4120'),
    host: import.meta.env.VITE_HOST || 'localhost'
  },
  integrations: {
    jimboLibrary: {
      enabled: import.meta.env.VITE_JIMBO_ENABLED === 'true',
      url: import.meta.env.VITE_JIMBO_URL || 'http://localhost:6031'
    },
    caydenChat: {
      enabled: import.meta.env.VITE_CAYDEN_ENABLED === 'true',
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
```

**B. Settings Panel w UI**
```typescript
// src/components/ConfigurationPanel.tsx
import { useState } from 'react';
import { useKV } from '@github/spark/hooks';

export const ConfigurationPanel = () => {
  const [config, setConfig] = useKV('app-config', getConfig());

  const updateIntegrationUrl = (integration: string, url: string) => {
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

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Integration Settings</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          JIMBO Library URL
          <input
            type="text"
            value={config.integrations.jimboLibrary.url}
            onChange={(e) => updateIntegrationUrl('jimboLibrary', e.target.value)}
            className="mt-1 block w-full rounded border p-2"
            placeholder="http://localhost:6031"
          />
        </label>

        <label className="block text-sm font-medium">
          CAY_DEN Chat URL
          <input
            type="text"
            value={config.integrations.caydenChat.url}
            onChange={(e) => updateIntegrationUrl('caydenChat', e.target.value)}
            className="mt-1 block w-full rounded border p-2"
            placeholder="http://localhost:4110"
          />
        </label>

        <label className="block text-sm font-medium">
          AI Gateway URL
          <input
            type="text"
            value={config.integrations.aiGateway.url}
            onChange={(e) => updateIntegrationUrl('aiGateway', e.target.value)}
            className="mt-1 block w-full rounded border p-2"
            placeholder="http://localhost:6000"
          />
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={config.localFiles.enabled}
          onChange={(e) => setConfig(prev => ({
            ...prev,
            localFiles: { ...prev.localFiles, enabled: e.target.checked }
          }))}
        />
        <label>Enable Local File Access</label>
      </div>
    </div>
  );
};
```

**C. .env.example rozszerzony**
```bash
# Node System Configuration
VITE_PORT=4120
VITE_HOST=localhost

# Integration URLs (możesz zmienić na swoje porty)
VITE_JIMBO_ENABLED=true
VITE_JIMBO_URL=http://localhost:6031

VITE_CAYDEN_ENABLED=true
VITE_CAYDEN_URL=http://localhost:4110

VITE_GATEWAY_ENABLED=true
VITE_GATEWAY_URL=http://localhost:6000

# Local Files
VITE_LOCAL_FILES_ENABLED=true
VITE_ALLOWED_DIRS=S:\THE_DEvz_HUB,C:\Users\YourUser\Documents

# API Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

**D. Dynamiczny vite.config.ts**
```typescript
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      createIconImportProxy() as PluginOption,
      sparkPlugin({ port: parseInt(env.VITE_PORT || '4120') }) as PluginOption,
    ],
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      }
    },
    server: {
      port: parseInt(env.VITE_PORT || '4120'),
      host: env.VITE_HOST || 'localhost',
      proxy: env.VITE_JIMBO_ENABLED === 'true' ? {
        '/jimbo-api': {
          target: env.VITE_JIMBO_URL || 'http://localhost:6031',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/jimbo-api/, '/api')
        }
      } : undefined
    }
  };
});
```

**E. Serwisy używające konfiguracji**
```typescript
// src/services/jimboLibraryService.ts
import { getConfig } from '@/lib/config';
import { useKV } from '@github/spark/hooks';

export class JimboLibraryService {
  private getApiUrl(): string {
    // Próbuj pobrać z runtime config (ustawienia użytkownika)
    const runtimeConfig = useKV.getState()['app-config'];
    if (runtimeConfig?.integrations?.jimboLibrary?.url) {
      return runtimeConfig.integrations.jimboLibrary.url.replace(
        'http://localhost:6031', 
        '/jimbo-api'
      );
    }
    
    // Fallback do env
    return '/jimbo-api';
  }

  async search(query: string, filters?: any) {
    const apiUrl = this.getApiUrl();
    const response = await fetch(`${apiUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...filters })
    });
    return response.json();
  }
}
```

---

### 6. 🧩 System Addonów - Rozszerzenia

**Cel:** Dodaj gotowe integracje jako addony

#### Rekomendowane Addony do Stworzenia:

**A. CAY_DEN Integration Addon**
```typescript
// src/lib/addons/cayden-integration/index.ts
export const caydenIntegrationAddon: Addon = {
  metadata: {
    id: 'cayden-integration',
    name: 'CAY_DEN Integration',
    version: '1.0.0',
    description: 'Connect to CAY_DEN Chat and Graph systems',
    author: 'THE_DEvz_HUB',
    category: 'integration'
  },
  nodes: [
    {
      type: 'caydenChat',
      handler: async (input, config) => {
        // Handler logic
      }
    },
    {
      type: 'caydenGraph',
      handler: async (input, config) => {
        // Graph integration
      }
    }
  ]
};
```

**B. JIMBO Library Addon**
```typescript
// src/lib/addons/jimbo-library/index.ts
export const jimboLibraryAddon: Addon = {
  metadata: {
    id: 'jimbo-library',
    name: 'JIMBO Library Integration',
    version: '1.0.0',
    description: 'Access THE_DEvz_HUB JIMBO Libraries',
    category: 'data'
  },
  nodes: [
    {
      type: 'jimboLibrarySearch',
      handler: async (input, config) => {
        const service = new JimboLibraryService();
        return service.search(input.query, config);
      }
    },
    {
      type: 'jimboFileReader',
      handler: async (input, config) => {
        // Read specific files from library
      }
    }
  ],
  indexers: [
    {
      name: 'JIMBO Library Indexer',
      handler: async () => {
        // Index all library files for fast search
      }
    }
  ]
};
```

**C. Gateway Integration Addon**
```typescript
// src/lib/addons/ai-gateway/index.ts
export const aiGatewayAddon: Addon = {
  metadata: {
    id: 'ai-gateway',
    name: 'AI Gateway Integration',
    version: '1.0.0',
    description: 'Route all AI calls through centralized gateway'
  },
  // Override existing AI nodes to use gateway
};
```

---

## 🛠️ ULEPSZENIA TECHNICZNE

### 1. Backend API dla Node'y

**Utwórz prosty Express/Fastify backend:**

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint do wykonywania workflow programowo
app.post('/api/execute', async (req, res) => {
  const { workflowId, input } = req.body;
  // Execute workflow logic
  res.json({ result: '...' });
});

// Endpoint do zapisywania workflow na serwerze
app.post('/api/workflows/save', async (req, res) => {
  // Save to database instead of localStorage
});

// Endpoint dla webhooków
app.post('/api/webhook/:workflowId', async (req, res) => {
  // Trigger workflow from external webhook
});

app.listen(4121, () => console.log('Node\'y API: 4121'));
```

**Dodaj do package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "server": "tsx watch server/index.ts",
    "dev:full": "concurrently \"npm run dev\" \"npm run server\""
  }
}
```

### 2. Baza Danych dla Workflow

**Zamiast tylko localStorage, dodaj PostgreSQL/SQLite:**

```typescript
// server/db/workflows.ts
import { Database } from 'better-sqlite3';

const db = new Database('workflows.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT,
    nodes TEXT,
    edges TEXT,
    created_at INTEGER,
    updated_at INTEGER
  )
`);

export const saveWorkflow = (id: string, data: any) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO workflows (id, name, nodes, edges, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.name, JSON.stringify(data.nodes), 
    JSON.stringify(data.edges), Date.now());
};
```

### 3. Współdzielona Konfiguracja API Keys

**Utwórz centralny plik .env dla całego THE_DEvz_HUB:**

```bash
# S:\THE_DEvz_HUB\.env.shared
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
JIMBO_LIBRARY_URL=http://localhost:6031
CAYDEN_CHAT_URL=http://localhost:4110
AI_GATEWAY_URL=http://localhost:6000
```

**Symlink w każdym projekcie:**
```powershell
# W jimbo-node-system-v2
New-Item -ItemType SymbolicLink -Path ".env" -Target "..\..\.env.shared"

# W CAY_DEN_chat_deepsearch
New-Item -ItemType SymbolicLink -Path ".env" -Target "..\.env.shared"
```

### 4. Ulepszony System Wykonywania

**Dodaj kolejkowanie zadań:**

```typescript
// src/lib/executionQueue.ts
import PQueue from 'p-queue';

export class ExecutionQueue {
  private queue = new PQueue({ concurrency: 5 });
  
  async addTask(nodeId: string, executor: () => Promise<any>) {
    return this.queue.add(async () => {
      console.log(`Executing node: ${nodeId}`);
      const result = await executor();
      console.log(`Completed node: ${nodeId}`);
      return result;
    });
  }
  
  pause() { this.queue.pause(); }
  resume() { this.queue.start(); }
  clear() { this.queue.clear(); }
}
```

### 5. Real-time Collaboration

**Dodaj WebSocket dla współdzielonych workflow:**

```typescript
// server/websocket.ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 4122 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    
    // Broadcast changes to all clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  });
});
```

---

## 📋 PLAN WDROŻENIA (Kolejność działań)

### Faza 1: Podstawowe Połączenia (1-2 dni)
- [ ] Dodaj konfigurowalne porty w .env
- [ ] Utwórz proxy dla JIMBO Library w vite.config.ts
- [ ] Napisz `jimboLibraryService.ts`
- [ ] Dodaj węzeł "JIMBO Library Search"
- [ ] Przetestuj podstawowe wyszukiwanie

### Faza 1.5: Lokalne Pliki (1 dzień)
- [ ] Dodaj `localFileService.ts`
- [ ] Węzły: Local File Read, Write, Browser
- [ ] Executory dla obsługi plików
- [ ] Panel konfiguracji dozwolonych folderów
- [ ] Test czytania/zapisu plików

### Faza 2: Integracja CAY_DEN (2-3 dni)
- [ ] Napisz `caydenService.ts`
- [ ] Dodaj węzeł "CAY_DEN Chat"
- [ ] Umożliw CAY_DEN wywoływanie workflow Node'y
- [ ] Test dwukierunkowej komunikacji

### Faza 3: Centralizacja przez Gateway (1-2 dni)
- [ ] Podłącz Node'y do AI Gateway z CAY_DEN
- [ ] Zmodyfikuj executory AI do używania gateway
- [ ] Dodaj centralne logowanie wywołań

### Faza 4: Backend i Persystencja (2-3 dni)
- [ ] Utwórz Express backend (port 4121)
- [ ] Dodaj SQLite dla workflow
- [ ] Endpointy API dla wykonywania workflow
- [ ] Webhook endpoints

### Faza 5: Addony i Rozszerzenia (2-3 dni)
- [ ] CAY_DEN Integration Addon
- [ ] JIMBO Library Addon
- [ ] AI Gateway Addon
- [ ] Dokumentacja dla twórców addonów

### Faza 6: Współdzielona Konfiguracja (1 dzień)
- [ ] Centralny .env.shared
- [ ] Symlinki w projektach
- [ ] Aktualizacja dokumentacji

---

## 🎯 QUICK WINS (Zrób to TERAZ)

### 1. Konfigurowalne Porty (5 min)
```bash
# .env - dodaj:
VITE_PORT=4120
VITE_JIMBO_URL=http://localhost:6031
VITE_CAYDEN_URL=http://localhost:4110
```

### 2. Dodaj JIMBO Library Search Node (30 min)
```typescript
// src/lib/nodeDefinitions.ts - dodaj:
{ 
  type: 'jimboLibrarySearch', 
  label: 'JIMBO Library', 
  iconName: 'Books', 
  category: 'input', 
  description: 'Search local JIMBO libraries',
  color: 'oklch(0.6 0.15 280)' 
}
```

### 3. Proxy do Library (5 min)
```typescript
// vite.config.ts - w server: { }
proxy: {
  '/jimbo-api': {
    target: 'http://localhost:6031',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/jimbo-api/, '/api')
  }
}
```

### 4. Lokalne Pliki - Quick Test (15 min)
```typescript
// Dodaj do nodeDefinitions.ts:
{ 
  type: 'localFileRead', 
  label: 'Local File Read', 
  iconName: 'FileText', 
  category: 'input', 
  description: 'Read local files',
  color: 'oklch(0.6 0.15 200)' 
}

// Test w console:
const [fileHandle] = await window.showOpenFilePicker();
const file = await fileHandle.getFile();
const content = await file.text();
console.log(content);
```

### 5. Test Connectivity (10 min)
Dodaj prosty test endpoint w Node'y:
```typescript
// src/App.tsx - dodaj gdzieś button:
<button onClick={async () => {
  const res = await fetch('/jimbo-api/health');
  console.log('JIMBO Library:', await res.json());
}}>Test JIMBO</button>
```

---

## 📊 PRZEWIDYWANE REZULTATY

### Po Integracji:
1. **Workflow w Node'y może automatycznie przeszukiwać bibliotekę JIMBO**
2. **CAY_DEN Chat może uruchamiać złożone workflow z Node'y**
3. **Jeden centralny gateway dla wszystkich wywołań AI**
4. **Łatwe współdzielenie konfiguracji między projektami**
5. **Persystencja workflow w bazie danych**
6. **Real-time collaboration na workflow**
7. **Bezpośredni dostęp do lokalnych plików (czytanie/zapis)**
8. **Konfigurowalne porty i URL w runtime bez przebudowy**
9. **Batch processing lokalnych dokumentów**
10. **Automatyzacja pracy z plikami projektu**

### Metryki Sukcesu:
- ✅ Node'y może znaleźć plik w JIMBO Library w < 2s
- ✅ CAY_DEN może wywołać workflow Node'y i otrzymać wynik
- ✅ Wszystkie AI calls logowane centralnie
- ✅ Zero duplikacji API keys między projektami
- ✅ Workflow zapisywane zarówno client-side jak i server-side
- ✅ Lokalne pliki czytane/zapisywane przez workflow
- ✅ Zmiana portów bez rebuild aplikacji
- ✅ File System Access API działa w Chrome/Edge

---

## 🚨 OSTRZEŻENIA

1. **CORS Issues:** Test proxy lokalnie przed wdrożeniem
2. **Port Conflicts:** Upewnij się że 4120, 4121, 6031, 6000 są wolne
3. **API Rate Limits:** Gateway powinien mieć rate limiting
4. **Security:** Nie eksponuj library server publicznie
5. **Error Handling:** Dodaj retry logic dla network calls

---

## 📚 Dodatkowe Zasoby

- [Node'y README](./README.md) - Główna dokumentacja
- [RAG System Guide](./RAG_SYSTEM.md) - System RAG
- [Addon Architecture](./ADDON_ARCHITECTURE.md) - Tworzenie addonów
- [CAY_DEN Integration Guide](../CAY_DEN_chat_deepsearch/INTEGRATION_GUIDE.md)
- [JIMBO Library Plan](../CAY_DEN_chat_deepsearch/JIMBO_LIBRARY_CONNECTION_PLAN.md)

---

**Ostatnia aktualizacja:** 6 lutego 2026  
**Status:** Gotowe do implementacji ✅
