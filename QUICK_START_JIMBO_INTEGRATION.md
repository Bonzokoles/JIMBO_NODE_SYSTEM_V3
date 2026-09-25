# 🚀 Quick Start - Połączenie Node'y z JIMBO Library + Lokalne Pliki

**Czas: 20-25 minut**  
**Poziom: Początkujący**

---

## ⚡ 4 Kroki do Działającej Integracji

### KROK 0: Konfiguracja Portów (3 minuty) 🆕

Najpierw ustaw swoje porty w `.env`:

```bash
# .env (skopiuj z .env.example jeśli nie istnieje)

# Port Node'y (możesz zmienić na dowolny)
VITE_PORT=4120

# URLe integracji (dostosuj do swoich portów)
VITE_JIMBO_ENABLED=true
VITE_JIMBO_URL=http://localhost:6031

VITE_CAYDEN_ENABLED=true
VITE_CAYDEN_URL=http://localhost:4110

# Lokalne pliki
VITE_LOCAL_FILES_ENABLED=true
VITE_ALLOWED_DIRS=S:\THE_DEvz_HUB,C:\Users\YourUser\Documents
```

**Możesz zmienić te porty w dowolnym momencie!**

---

### KROK 1: Dodaj Proxy (2 minuty)

Otwórz `vite.config.ts` i zastąp całość tym kodem (używa dynamicznych portów):

```typescript
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv, PluginOption } from "vite";
import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT || '4120');
  const jimboUrl = env.VITE_JIMBO_URL || 'http://localhost:6031';

  return {
    plugins: [
      react(),
      tailwindcss(),
      createIconImportProxy() as PluginOption,
      sparkPlugin({ port }) as PluginOption,
    ],
    resolve: {
      alias: { '@': resolve(projectRoot, 'src') }
    },
    server: {
      port,
      proxy: {
        '/jimbo-api': {
          target: jimboUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/jimbo-api/, '/api')
        }
      }
    }
  };
});
```

**Restart dev server** (Ctrl+C i `npm run dev`)

---

### KROK 2: Utwórz Serwisy (10 minut)

**2A. JIMBO Library Service** - Utwórz `src/services/jimboLibraryService.ts`:

```typescript
export class JimboLibraryService {
  private apiUrl = '/jimbo-api';

  async search(query: string, maxResults = 5) {
    const response = await fetch(`${this.apiUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, maxResults })
    });
    return response.json();
  }

  async getFileContent(category: string, filename: string) {
    const response = await fetch(`${this.apiUrl}/view-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, filename })
    });
    const data = await response.json();
    return data.content;
  }
}

export const jimboLibraryService = new JimboLibraryService();
```

---

### KROK 3: Dodaj Węzeł (8 minut)

**3A. Definicja węzła** - W `src/lib/nodeDefinitions.ts` dodaj:

```typescript
// W sekcji INPUT NODES:
{ 
  type: 'jimboLibrarySearch', 
  label: 'JIMBO Library', 
  iconName: 'Books', 
  category: 'input', 
  description: 'Search JIMBO Libraries',
  color: 'oklch(0.6 0.15 280)' 
}
```

**3B. Executor** - W `src/lib/executionEngine.ts`:

```typescript
// W registerDefaultExecutors():
this.registerExecutor('jimboLibrarySearch', this.executeJimboLibrary.bind(this))

// Dodaj metodę:
private async executeJimboLibrary(node: WorkflowNode, inputs: any[]) {
  const { jimboLibraryService } = await import('@/services/jimboLibraryService');
  
  const query = inputs[0]?.value || node.data.config?.query || '';
  const results = await jimboLibraryService.search(query, 5);
  
  // Pobierz treść pierwszych 3 plików
  let context = `JIMBO Search: "${query}"\n\n`;
  for (const file of results.results?.slice(0, 3) || []) {
    const content = await jimboLibraryService.getFileContent(
      file.category, 
      file.filename
    );
    context += `--- ${file.filename} ---\n${content.substring(0, 1000)}\n\n`;
  }
  
  return {
    type: 'library_context',
    value: context,
    timestamp: Date.now()
  };
}
```

**3C. Import** - Na górze `executionEngine.ts` sprawdź czy masz:

```typescript
import { WorkflowNode } from '@/store/workflowStore'
```

---

## ✅ Test Połączenia

### 1. Sprawdź czy JIMBO Library Server działa:

```powershell
# W nowym terminalu
curl http://localhost:6031/api/health
```

Jeśli nie działa, uruchom:
```powershell
cd S:\THE_DEvz_HUB\CAY_DEN_chat_deepsearch\gateway
python library_server.py
```

### 2. Sprawdź Node'y proxy:

Otwórz console w przeglądarce (F12) na http://localhost:4120:

```javascript
fetch('/jimbo-api/health')
  .then(r => r.json())
  .then(console.log)
```

Powinno zwrócić `{ status: "ok" }` lub podobne.

### 3. Przetestuj wyszukiwanie:

```javascript
fetch('/jimbo-api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'AI', maxResults: 3 })
})
  .then(r => r.json())
  .then(console.log)
```

---

## 🎨 Użycie w Workflow

1. **Odśwież przeglądarkę** lub restart dev server
2. **Otwórz Node Palette** (po lewej stronie)
3. **W sekcji "Input Nodes"** znajdź **"JIMBO Library"**
4. **Przeciągnij na canvas**
5. **Kliknij węzeł** → Configure
6. **Ustaw query** np. "Python tutorials"
7. **Podłącz do węzła AI** (np. OpenAI)
8. **Uruchom workflow**

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch"
**Rozwiązanie:** 
- Sprawdź czy JIMBO server działa (port 6031)
- Sprawdź czy proxy w vite.config jest poprawny
- Restart Node'y dev server

### Problem: "Proxy error"
**Rozwiązanie:**
- W vite.config dodaj `changeOrigin: true`
- Upewnij się że nie ma spacji w konfiguracji

### Problem: "Node not found"
**Rozwiązanie:**
- Sprawdź czy dodałeś definicję w `nodeDefinitions.ts`
- Sprawdź czy nazwa typu to dokładnie `'jimboLibrarySearch'`
- Restart dev server

### Problem: "Executor not found"
**Rozwiązanie:**
- Sprawdź czy `registerExecutor` jest w konstruktorze
- Sprawdź binding: `.bind(this)`
- Refresh przeglądarki (Ctrl+Shift+R)

---

## � BONUS: Lokalne Pliki (10 minut) 🆕

Dodaj możliwość czytania i zapisu lokalnych plików!

### 1. Serwis Lokalnych Plików

Utwórz `src/services/localFileService.ts`:

```typescript
export class LocalFileService {
  private fileSystemSupported = 'showOpenFilePicker' in window;

  async pickFile(accept?: string[]): Promise<File> {
    if (!this.fileSystemSupported) {
      return this.pickFileFallback(accept);
    }
    
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: accept ? [{
        description: 'Files',
        accept: { 'text/*': accept }
      }] : undefined
    });
    
    return await fileHandle.getFile();
  }

  private pickFileFallback(accept?: string[]): Promise<File> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) input.accept = accept.join(',');
      
      input.onchange = () => {
        const file = input.files?.[0];
        file ? resolve(file) : reject(new Error('No file'));
      };
      
      input.click();
    });
  }

  async readTextFile(): Promise<string> {
    const file = await this.pickFile(['.txt', '.md', '.json']);
    return await file.text();
  }

  async writeFile(filename: string, content: string): Promise<void> {
    if (!this.fileSystemSupported) {
      // Fallback - download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: filename
    });
    
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}

export const localFileService = new LocalFileService();
```

### 2. Dodaj Węzły

W `src/lib/nodeDefinitions.ts`:

```typescript
// INPUT NODES:
{ 
  type: 'localFileRead', 
  label: 'Local File Read', 
  iconName: 'FileText', 
  category: 'input', 
  description: 'Read local files',
  color: 'oklch(0.6 0.15 200)' 
},

// OUTPUT NODES:
{ 
  type: 'localFileWrite', 
  label: 'Local File Write', 
  iconName: 'FloppyDisk', 
  category: 'output', 
  description: 'Save to local file',
  color: 'oklch(0.65 0.2 30)' 
}
```

### 3. Executory

W `src/lib/executionEngine.ts`:

```typescript
// W registerDefaultExecutors():
this.registerExecutor('localFileRead', this.executeLocalFileRead.bind(this))
this.registerExecutor('localFileWrite', this.executeLocalFileWrite.bind(this))

// Metody:
private async executeLocalFileRead(node: WorkflowNode, inputs: any[]) {
  const { localFileService } = await import('@/services/localFileService');
  
  const content = await localFileService.readTextFile();
  
  return {
    type: 'file_content',
    value: content,
    timestamp: Date.now()
  };
}

private async executeLocalFileWrite(node: WorkflowNode, inputs: any[]) {
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
```

### 4. Test w Console

```javascript
// Test czytania
const [handle] = await window.showOpenFilePicker();
const file = await handle.getFile();
const content = await file.text();
console.log('File content:', content);

// Test zapisu
const saveHandle = await window.showSaveFilePicker({
  suggestedName: 'test.txt'
});
const writable = await saveHandle.createWritable();
await writable.write('Hello from Node\'y!');
await writable.close();
```

### 5. Przykładowy Workflow

**Workflow: "Process Local Document"**
1. Local File Read → wybierz plik
2. OpenAI (Summarize) → podsumuj treść
3. Local File Write → zapisz podsumowanie

**⚠️ Uwaga:** File System Access API działa tylko w Chrome/Edge. W Firefox/Safari używany jest fallback.

---

## 🔧 Zmiana Portów w Runtime

Możesz zmienić porty bez rebuild aplikacji:

### Opcja 1: Zmień .env i restartuj

```bash
# .env
VITE_PORT=5000  # Zmień z 4120 na 5000
VITE_JIMBO_URL=http://localhost:7000  # Zmień port JIMBO
```

Restart: `npm run dev`

### Opcja 2: Panel Ustawień w UI (opcjonalne)

Pełna implementacja w [INTEGRATION_CODE_EXAMPLES.ts](./INTEGRATION_CODE_EXAMPLES.ts) sekcja 17 - pozwala zmieniać URLe bez restartowania aplikacji.

---

## 📈 Następne Kroki

Po pomyślnym uruchomieniu podstawowej integracji:

1. **Dodaj lokalne pliki** - sekcja BONUS powyżej 🆕
2. **Dodaj CAY_DEN Chat integration** - patrz [INTEGRATION_CODE_EXAMPLES.ts](./INTEGRATION_CODE_EXAMPLES.ts)
3. **Stwórz addon** - patrz sekcja 9 w CODE_EXAMPLES
4. **Dodaj backend API** - patrz [INTEGRATION_RECOMMENDATIONS.md](./INTEGRATION_RECOMMENDATIONS.md)
5. **Współdziel .env** - centralna konfiguracja API keys

---

## 💡 Pro Tips

- **Użyj Template "RAG Pipeline"** i zamień źródło danych na JIMBO Library
- **Podłącz JIMBO → Text Chunker → Embeddings → ChromaDB** dla lokalnego RAG
- **Łącz z Multi-Agent System** - agent może wyszukiwać w library podczas pracy
- **Combine z Web Scraper** - porównaj web data z twoim knowledge base
- **Local File Read → AI Processing → Local File Write** - automatyzuj przetwarzanie dokumentów 🆕
- **Batch process folderu** - przetwórz wszystkie pliki .md w folderze jednocześnie 🆕
- **Zmień porty w .env** - dostosuj do swojego środowiska bez edycji kodu 🆕

---

## 📞 Potrzebujesz Pomocy?

Sprawdź pełną dokumentację:
- [INTEGRATION_RECOMMENDATIONS.md](./INTEGRATION_RECOMMENDATIONS.md) - Pełen plan integracji + lokalne pliki + porty
- [INTEGRATION_CODE_EXAMPLES.ts](./INTEGRATION_CODE_EXAMPLES.ts) - Wszystkie code snippets (17 sekcji)
- [README.md](./README.md) - Główna dokumentacja Node'y

---

**Status:** ✅ Gotowe do użycia (JIMBO + Lokalne Pliki + Konfigurowalne Porty)  
**Oszacowany czas setup:** 20-25 minut  
**Poziom trudności:** ⭐⭐☆☆☆
