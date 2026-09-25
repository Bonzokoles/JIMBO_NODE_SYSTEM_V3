# 🧠 RAG System - Retrieval-Augmented Generation

## Przegląd

Node'y zawiera kompletny system RAG (Retrieval-Augmented Generation) umożliwiający budowanie zaawansowanych workflow'ów z:
- **Wektoryzacją** dokumentów i semantycznym wyszukiwaniem
- **Integracją z bazami wektorowymi** (ChromaDB, Pinecone, Qdrant, pgvector)
- **Czytnikami plików** (PDF, CSV, JSON, Markdown, TXT)
- **Zarządzaniem kontenerami** (Podman/Docker) dla modeli AI i baz danych

## 🎯 Dostępne Node'y RAG

### Wektoryzacja

#### Create Vector Store
Tworzy nowy magazyn wektorów w pamięci.
- **Konfiguracja:**
  - Store Name - nazwa magazynu
  - Embedding Model - model embeddingów (OpenAI, lokalne, mock)
- **Wyjścia:** Vector Store object

#### Generate Embeddings
Generuje wektory embeddingów dla tekstu.
- **Wejścia:** Text
- **Konfiguracja:**
  - Model - wybór modelu embeddingów
  - API Key - klucz API (jeśli wymagany)
- **Wyjścia:** Embedding Vector, Dimensions

#### Add to Vector Store
Dodaje tekst z embeddingiem do magazynu wektorów.
- **Wejścia:** Vector Store, Text, Metadata (optional)
- **Wyjścia:** Updated Store, Document ID

#### Semantic Search
Wyszukuje semantycznie podobne dokumenty.
- **Wejścia:** Vector Store, Search Query
- **Konfiguracja:**
  - Top K Results - ilość wyników (domyślnie 5)
  - Similarity Threshold - próg podobieństwa 0-1 (domyślnie 0.5)
- **Wyjścia:** Search Results (array), Top Result

#### Chunk Text for RAG
Dzieli tekst na fragmenty dla efektywnego RAG.
- **Wejścia:** Text
- **Konfiguracja:**
  - Chunk Size - rozmiar fragmentu w znakach (domyślnie 500)
  - Overlap - nakładanie fragmentów (domyślnie 50)
  - Separator - metoda podziału (paragraph/sentence/word/character)
- **Wyjścia:** Text Chunks (array), Chunk Count

### Bazy Danych

#### ChromaDB Connect
Połączenie z bazą ChromaDB.
- **Konfiguracja:**
  - Host (domyślnie localhost)
  - Port (domyślnie 8000)
  - Collection Name
- **Wyjścia:** ChromaDB Connection

#### Pinecone Connect
Połączenie z bazą Pinecone.
- **Konfiguracja:**
  - API Key
  - Environment (np. us-east-1-aws)
  - Index Name
- **Wyjścia:** Pinecone Connection

#### Qdrant Connect
Połączenie z bazą Qdrant.
- **Konfiguracja:**
  - Qdrant URL (domyślnie http://localhost:6333)
  - API Key (opcjonalnie)
  - Collection Name
- **Wyjścia:** Qdrant Connection

#### PostgreSQL pgvector
Połączenie z PostgreSQL + pgvector.
- **Konfiguracja:**
  - Connection String
  - Table Name (domyślnie embeddings)
- **Wyjścia:** PostgreSQL Connection

#### Insert Vector
Wstawia wektor do bazy danych.
- **Wejścia:** Database Connection, Embedding Vector, Metadata (optional)
- **Wyjścia:** Document ID, Success

#### Query Vector DB
Wyszukuje w bazie wektorowej.
- **Wejścia:** Database Connection, Query Vector
- **Konfiguracja:**
  - Top K Results (domyślnie 10)
- **Wyjścia:** Search Results

### Czytniki Plików

#### Read Local File
Odczytuje lokalne pliki tekstowe.
- **Wejścia:** File
- **Konfiguracja:**
  - Encoding (UTF-8/ASCII/ISO-8859-1)
- **Wyjścia:** File Content, File Metadata

#### Read PDF
Ekstrahuje tekst z plików PDF.
- **Wejścia:** PDF File
- **Konfiguracja:**
  - Include Images (czy uwzględniać obrazy)
- **Wyjścia:** Extracted Text, Page Count, PDF Metadata

#### Read CSV
Parsuje pliki CSV.
- **Wejścia:** CSV File
- **Konfiguracja:**
  - Delimiter (`,` `;` `\t` `|`)
  - Has Headers (czy pierwsza linia to nagłówki)
- **Wyjścia:** Parsed Data (array), Headers

#### Read JSON
Parsuje pliki JSON.
- **Wejścia:** JSON File
- **Wyjścia:** Parsed Data

#### Read Markdown
Odczytuje pliki Markdown.
- **Wejścia:** Markdown File
- **Konfiguracja:**
  - Parse to HTML (czy konwertować do HTML)
- **Wyjścia:** Markdown Content, HTML (parsed)

#### Read Directory
Przetwarza wiele plików z katalogu.
- **Wejścia:** Files (array)
- **Konfiguracja:**
  - Filter by Extension (np. .txt,.md,.pdf)
- **Wyjścia:** File List, File Count

### Kontenery

#### Configure AI Model Container
Konfiguruje kontenery dla modeli AI.
- **Konfiguracja:**
  - Container Runtime (Podman/Docker)
  - Model Type (Ollama/vLLM/TGI/Sentence Transformers)
  - Container Image
  - Port
  - Enable GPU
- **Wyjścia:** Container Config (z poleceniem do wykonania)

#### Configure Database Container
Konfiguruje kontenery dla baz danych.
- **Konfiguracja:**
  - Container Runtime (Podman/Docker)
  - Database Type (ChromaDB/Qdrant/pgvector/Redis/Milvus)
  - Port
  - Volume Path (opcjonalnie)
- **Wyjścia:** Container Config

#### Execute Container Command
Przygotowuje polecenie do uruchomienia kontenera.
- **Wejścia:** Container Config
- **Wyjścia:** Command, Status

## 📚 Przykładowe Workflow'y

### 1. Podstawowy RAG Workflow

```
Read Local File
    ↓ content
Chunk Text for RAG
    ↓ chunks
Generate Embeddings
    ↓ embedding
Create Vector Store ──→ Add to Vector Store
                            ↓ store
                        Semantic Search
                            ↓ results
                        [Use in AI model]
```

### 2. RAG z Bazą Danych

```
ChromaDB Connect ──→ Insert Vector ←── Generate Embeddings
         ↓                                        ↑
    Query Vector DB                          Text Input
         ↓
    Search Results
```

### 3. Setup Kontenerów

```
Configure AI Model Container
    ↓ config
Execute Container Command
    ↓ command
[Run in terminal]

Configure Database Container
    ↓ config
Execute Container Command
    ↓ command
[Run in terminal]
```

### 4. Przetwarzanie Wielu Plików

```
Read Directory
    ↓ fileList
[For each file]
    ↓
Read Local File
    ↓ content
Chunk Text for RAG
    ↓ chunks
Generate Embeddings
    ↓ embedding
Add to Vector Store
```

## 🚀 Quick Start

### Krok 1: Uruchom bazę danych (opcjonalnie)

Użyj node'ów container do wygenerowania poleceń:

```bash
# ChromaDB
podman run -d -p 8000:8000 -v /var/lib/chromadb:/data chromadb/chroma:latest

# Qdrant
podman run -d -p 6333:6333 -v /var/lib/qdrant:/data qdrant/qdrant:latest
```

### Krok 2: Uruchom lokalny model (opcjonalnie)

```bash
# Ollama
podman run -d -p 11434:11434 ollama/ollama:latest

# Po uruchomieniu, załaduj model:
ollama pull llama2
```

### Krok 3: Zbuduj workflow

1. Dodaj **Read Local File** - załaduj dokument
2. Dodaj **Chunk Text for RAG** - podziel na fragmenty
3. Dodaj **Create Vector Store** - stwórz magazyn
4. Dodaj **Generate Embeddings** - wygeneruj wektory
5. Dodaj **Add to Vector Store** - zapisz w magazynie
6. Dodaj **Semantic Search** - wyszukaj podobne fragmenty
7. Połącz z **OpenAI** lub innym modelem AI

### Krok 4: Wykonaj workflow

Kliknij **Play** w toolbarze i obserwuj wykonanie.

## 💡 Best Practices

### Chunking Strategies

**Dla dokumentów technicznych:**
- Chunk Size: 500-1000 znaków
- Overlap: 50-100 znaków
- Separator: paragraph

**Dla kodu:**
- Chunk Size: 200-500 znaków
- Overlap: 20-50 znaków
- Separator: sentence lub word

**Dla długich artykułów:**
- Chunk Size: 1000-2000 znaków
- Overlap: 100-200 znaków
- Separator: paragraph

### Similarity Thresholds

- **Wysokie podobieństwo** (0.8-1.0): Prawie identyczne dokumenty
- **Średnie podobieństwo** (0.5-0.8): Podobne tematy
- **Niskie podobieństwo** (0.3-0.5): Luźne powiązania
- **Poniżej 0.3**: Prawdopodobnie nieistotne

### Embedding Models

**OpenAI text-embedding-3-small:**
- Wymiary: 1536
- Szybki i ekonomiczny
- Dobry dla większości przypadków

**OpenAI text-embedding-3-large:**
- Wymiary: 3072
- Najwyższa jakość
- Droższy

**Lokalne modele (all-MiniLM-L6-v2):**
- Wymiary: 384
- Darmowy
- Dobry dla podstawowych potrzeb
- Wymaga uruchomienia lokalnego serwera

### Vector Databases

**ChromaDB:**
- ✅ Łatwy setup
- ✅ Dobry dla prototypów
- ✅ Lokalna instalacja
- ⚠️ Gorsze skalowanie

**Pinecone:**
- ✅ Świetne skalowanie
- ✅ Zarządzana usługa
- ✅ Szybkie wyszukiwanie
- ⚠️ Płatna

**Qdrant:**
- ✅ Wysoka wydajność
- ✅ Dobre API
- ✅ Self-hosted lub cloud
- ✅ Darmowa opcja

**PostgreSQL + pgvector:**
- ✅ Znana technologia
- ✅ Transakcje
- ✅ Istniejąca infrastruktura
- ⚠️ Wolniejsze niż dedykowane rozwiązania

## 🔧 Troubleshooting

### "Vector store not found"
- Upewnij się, że **Create Vector Store** został wykonany przed **Add to Vector Store**
- Sprawdź, czy store ID jest prawidłowo przekazywany między node'ami

### "Embedding dimensions mismatch"
- Wszystkie embeddingi w magazynie muszą mieć te same wymiary
- Nie mieszaj różnych modeli embeddingów w jednym magazynie

### "No results found"
- Obniż similarity threshold
- Zwiększ topK (ilość wyników)
- Sprawdź, czy dokument został dodany do magazynu

### Container nie startuje
- Sprawdź czy port nie jest zajęty: `netstat -tlnp | grep PORT`
- Sprawdź logi: `podman logs CONTAINER_ID`
- Upewnij się, że masz wystarczające uprawnienia

## 📖 Dalsze Zasoby

- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Podman Documentation](https://docs.podman.io/)

## 🤝 Contributing

Masz pomysł na nowy node RAG? Otwórz issue lub PR!

Przykładowe pomysły:
- Support dla więcej formatów plików (DOCX, PPTX)
- Integracja z Weaviate
- Advanced chunking strategies
- Multi-modal embeddings (tekst + obrazy)
- RAG evaluation metrics
