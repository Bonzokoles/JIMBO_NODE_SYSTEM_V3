# Planning Guide

**Experience Qualities**: 


This is a sophisticated workflow builder requiring real-time state management, complex canvas interactions, node ty
## Essential Features
### Visual Workflow Canvas

- **Progression**: Load canvas → Drag node from palette → Drop on canvas → Connect nodes via p


- **Trigger**: Canvas

### RAG System - NEW
- **Purpose**: Enable intelligent document retrieval and augmented AI responses
- **Progression**: Create vector store → Chunk text → Generate embeddings →

- **Functionality**: Connect to ChromaDB, Pinecone, Qdrant, PostgreSQL+pgvector for persistent vector storage
- **Trigger**: User adds database connector node

### File Readers - NEW
- **Purpose**: Import data from various sources for processing and vectorization
- **Progression**: Select file → Parse content → Extract text/d

- **Functionality**: Configure and manage containers for AI models and databases
- **Trigger**: User adds container configuration node

### Node Connection 
- **Purpose**: Define data flow through the workflow
- **Progression**: Click output port → Drag connection line → Hover over compat

- **Functionality**: Create custom nodes with user-defined inputs, outputs, and logic
- **Trigger**: User clicks "Create Custom Node"

### Addon System - ISOLATED ARCHITECT
- **Functionality**: Connect to ChromaDB, Pinecone, Qdrant, PostgreSQL+pgvector for persistent vector storage
- **Purpose**: Professional-grade vector storage for production RAG workflows
- **Trigger**: User adds database connector node
- **Progression**: Configure connection → Test connection → Insert/query vectors → Process results
- **Success criteria**: Successful database connections, reliable vector operations, proper error handling

### File Readers - NEW
- **Functionality**: Read local files (PDF, CSV, JSON, Markdown, TXT, directories) for RAG ingestion
- **Purpose**: Import data from various sources for processing and vectorization
- **Trigger**: User uploads file or selects file reader node
- **Progression**: Select file → Parse content → Extract text/data → Output structured data
- **Success criteria**: Support for multiple formats, accurate parsing, metadata extraction

### Container Management (Podman/Docker) - NEW
- **Functionality**: Configure and manage containers for AI models and databases
- **Purpose**: Simplify deployment of local AI models (Ollama, vLLM) and vector databases
- **Trigger**: User adds container configuration node
- **Progression**: Select runtime → Choose service type → Configure ports/volumes → Generate command
- **Success criteria**: Accurate container commands, GPU support, volume mapping

### Node Connection System
- **Functionality**: Click-and-drag system to create connections between node output ports and input ports
- **Purpose**: Define data flow through the workflow
- **Trigger**: User clicks on a node port
- **Progression**: Click output port → Drag connection line → Hover over compatible input port → Release to connect → Connection validated
- **Success criteria**: Visual feedback during drag, type-safe connections only, connection deletion support

### Custom Node Builder
- **Functionality**: Create custom nodes with user-defined inputs, outputs, and logic
- **Purpose**: Extend the workflow system with user-defined nodes for specialized use cases
- **Trigger**: User clicks "Create Custom Node"
- **Progression**: Open custom node manager → Define ports and config → Save → Node appears in palette
- **Success criteria**: Nodes persist, execute correctly, fully configurable

### Addon System - ISOLATED ARCHITECTURE
- **Functionality**: Plugin architecture for extending Node'y with external functionality (indexers, frameworks, readers, tools)
- **Progression**: Browse templates by category → Select template → Preview nodes/connections → Load te
- **Categories**:
  - **Data Processing** (📊): ETL, transformation, batch processing
  - **Automation** (⚙️): Scheduled tasks, webhooks, integrations
  - **RAG Systems** 

- **Invalid Connections**: Only allow connections between compatible po
- **Disconnected Nodes**: Allow orphaned nodes but warn when executing incomplete w
- **Container Failures**: Provide clear error messages for container runtime issues


## Color Selection

- **Secondary Colors**: Deep purples and blues for categorizati
- **Foreground/Background Pairings**: 
  - Card/Panel: `oklch(0.22 0.02 265)` with Foreground: `oklch(0.9 0.02 265)` - R


- **Typographic
  - H2 (Panel Headers): IBM Plex Sans Semibold / 18px / normal letter-spacing
  - Body (UI Labels): IBM Plex Sans Regular / 13p
  - Accent (Headings): Playfair Display for decorative hea
## Animations


- **Success Moments**: 

- **Components**: 
  - Toolbar: Fixed top bar with Button g
  - Node Palette: ScrollArea with Accordion for categories
  - Toast: Sonner for execution notifications and errors

  - Custom node components
  - Custom handles with glow effects on hover
- **States**: 
  - Nodes: Default, Selected (border glow), Executing (p

  - Phosphor Icons throughout for consistency
  - Plus for addi
  - GearSix for node settings
  - Database for storage nodes
  - Brain for AI nodes
- **Spacing**: 
  - Panel padding: p-6 (24px)
  - Button groups: gap-2 (8px)
- **Mobile**: 

  - Reduced node deta
























- **Typographic Hierarchy**: 
  - H1 (App Title): IBM Plex Sans Bold / 28px / tight letter-spacing
  - H2 (Panel Headers): IBM Plex Sans Semibold / 18px / normal letter-spacing
  - H3 (Section Headers): IBM Plex Sans Medium / 14px
  - Body (UI Labels): IBM Plex Sans Regular / 13px / line-height 1.5
  - Code (Node Data): IBM Plex Mono Regular / 12px / relaxed letter-spacing
  - Accent (Headings): Playfair Display for decorative headers

## Animations
Animations emphasize the flow of data and the tactile nature of node manipulation - purposeful, not decorative.

- **Node Connections**: Animated "energy flow" particles traveling along connection paths when executing
- **Panel Transitions**: Side panels slide in from right with spring physics (400ms) when nodes are selected
- **Canvas Navigation**: Smooth easing on zoom/pan operations with momentum (200ms deceleration)
- **Success Moments**: Brief pulse animation on nodes when execution completes successfully (500ms)
- **Drag Interactions**: Node follows cursor with slight lag (spring physics) for natural feel

## Component Selection
- **Components**: 
  - Canvas: React Flow with custom node components
  - Toolbar: Fixed top bar with Button groups and Separator dividers
  - Side Panels: Sheet component (right-anchored) for node configuration
  - Node Palette: ScrollArea with Accordion for categories
  - Inputs: Standard Input with Label for text fields, Select for dropdowns in node properties
  - Toast: Sonner for execution notifications and errors
  - Custom minimap with workflow overview and opacity controls

- **Customizations**: 
  - Custom node components extending React Flow's base with integrated action menus
  - Styled connection lines with animated gradients for active workflows
  - Custom handles with glow effects on hover

- **States**: 
  - Buttons: Distinct hover (brightness +10%), active (scale 0.98), disabled (opacity 40%)
  - Nodes: Default, Selected (border glow), Executing (pulsing), Success (green border), Error (red border)
  - Connections: Default (muted), Active (accent animated), Invalid (destructive dashed)

- **Icon Selection**: 
  - Phosphor Icons throughout for consistency
  - Play/Pause for workflow execution
  - Plus for adding nodes
  - Trash for deletion
  - GearSix for node settings
  - WarningCircle for errors
  - Database for storage nodes
  - FileText for file operations
  - Brain for AI nodes

- **Spacing**: 
  - Node padding: p-4 (16px)
  - Panel padding: p-6 (24px)
  - Canvas grid: 16px base grid
  - Button groups: gap-2 (8px)

- **Mobile**: 
  - Collapse node palette into bottom drawer that slides up
  - Larger touch targets for nodes and ports (minimum 44px)
  - Gesture-based pan/zoom using native touch events
  - Reduced node detail/information density for smaller screens
  - Stack toolbar buttons vertically or hide in hamburger menu
