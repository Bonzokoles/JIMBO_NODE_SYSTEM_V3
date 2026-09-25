# PLAN WDROŻENIA: 36 Chambers & JIMBO Node System V2

> **Data:** 2026-09-25
> **Status:** W TRAKCIE (Faza 1 Zakończona)
> **Cel:** Połączenie zaawansowanego interfejsu wizualnego (Vite/React) z realnymi danymi bazy RAG (ChromaDB na dysku V:) oraz Orkiestratorem.

## Faza 1: Czyszczenie i Środowisko (ZAKOŃCZONO)
1. **Sanityzacja repozytorium**: Rozpakowane z ZIP pliki zostały poprawnie przeniesione z zagnieżdżonego folderu do głównego katalogu `Z:\jimbo-node-system-v2`. 
2. **Instalacja zależności**: Zbudowano środowisko deweloperskie (`npm install`).
3. **Konfiguracja Vite**: Przeanalizowano `vite.config.ts` – system nasłuchuje na porcie `4120` i jest przygotowany na proxy do backendów (np. `6031`, `3885`, `7071`). Naprawiono błąd z importami.

## Faza 2: Połączenie z Backendem (ChromaDB)
Obecnie Node System wita nas wizualnie, ale jego węzły (klocki) operują w próżni. Musimy podłączyć krew do tego systemu nerwowego:
1. Upewnić się, czy serwer RAG (`kb_server.py`) dla `devz-kb` jest aktywny (na domyślnym porcie `7072`).
2. Jeśli nie jest – postawić lekki proxy/backend (np. na wzór istniejącego `pc_utility_backend/app.py`), który będzie w czasie rzeczywistym czytał bazę `V:\chambers\03_chroma\devz-kb\chroma.sqlite3`.
3. Zaktualizować `.env` (lub `vite.config.ts`) w Node System, tworząc ścieżkę do naszego backendu.

## Faza 3: Tworzenie Addonu "36 Chambers"
Architektura systemu V2 zakłada pełną modularność przez "Addony". Zamiast psuć główny kod interfejsu, stworzymy:
1. `src/lib/addons/chambers-monitor` – nowy dodatek w systemie.
2. Zdefiniujemy **Niestandardowe Węzły (Custom Nodes)**:
   - `ChromaDB_Monitor_Node` – klocek pulsujący i ściągający statystyki wektorów na żywo.
   - `Shaolin_Orchestrator_Node` – klocek odbierający sygnały o routingach AI.
3. Rejestracja dodatku w `src/lib/exampleAddons.ts` – tak, by pojawił się w lewej palecie interfejsu.

## Faza 4: Kompozycja Szablonu
Po wdrożeniu punktów 2 i 3 stworzymy gotowy "Template" w systemie, abyś po każdym uruchomieniu widział ułożoną siatkę kontrolną 36 Chambers bez konieczności ponownego przeciągania klocków (użyjemy do tego silnika ELK lub zapisanych koordynatów JSON).

---
**Wniosek Operacyjny:** Baza (UI) jest gotowa i doskonała. Teraz musimy pociągnąć rury z danymi pod te wizualne zawory.
