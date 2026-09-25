# JIMBO_NODE_SYSTEM_V3

## ARCHITECTURE OVERVIEW
Advanced Visual Workflow Builder & AI Orchestration Engine. 
Designed for high-throughput, autonomous node-based execution and AI-driven pipeline synthesis. 
System operates natively in Polish (Pelna polska lokalizacja interfejsu).

## CORE COMPONENTS
*   **Workflow Canvas Engine**: React Flow ecosystem with Zustand-based state persistence. Dark-technical UI/UX schema.
*   **Execution Runtime**: Dual-layer architecture. Local Vite frontend binding to a headless Python Flask backend for raw OS-level execution and telemetry.
*   **AI Orchestrator**: LLM-powered node synthesis. Translates natural language intents directly into physical workflow graphs on the canvas.
*   **Terminal Executor**: Direct OS bridge. Executes generated PowerShell/Bash commands with strict STDOUT/STDERR parsing.

## STRATEGIC OBJECTIVES (ROADMAP)

1.  **AUTONOMOUS AGENTIC LOOP (SELF-HEALING ARCHITECTURE)**
    Implementation of self-modifying nodes. The AI Orchestrator will gain I/O write access to the backend repository, allowing on-the-fly generation of missing dependencies, custom Python scripts, and automatic node patching without human intervention.

2.  **PERSISTENT COGNITIVE MATRIX (WORKSPACE MEMORY)**
    Deployment of a persistent state file and vector integration. The system will maintain cross-session context, retaining structural decisions, execution logs, and architectural constraints to prevent regression loops.

3.  **DISTRIBUTED WORKFLOW COMPILATION**
    Transitioning from abstract canvas execution to hard-code compilation. Visual workflows will be exportable as standalone, headless CLI binaries or pure Python operational scripts.

4.  **TELEMETRIC DATA STREAMING**
    Real-time standard output (STDOUT/STDERR) WebSocket streaming from the backend executor directly to the visual nodes, bypassing standard browser polling limitations.
