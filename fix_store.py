import re

with open(r"Z:\jimbo-node-system-v2\src\store\workflowStore.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Add canvasConfig to interface
content = content.replace(
    "workflowName: string\n  history:",
    "workflowName: string\n  canvasConfig: { backgroundImage: string | null; backgroundOpacity: number; minimapEnabled: boolean; minimapOpacity: number }\n  history:"
)

# Add setter to interface
content = content.replace(
    "setWorkflowName: (name: string) => void\n  \n  executeWorkflow",
    "setWorkflowName: (name: string) => void\n  updateCanvasConfig: (config: Partial<WorkflowState['canvasConfig']>) => void\n  \n  executeWorkflow"
)

# Add default state
content = content.replace(
    "workflowName: 'Untitled Workflow',\n    history:",
    "workflowName: 'Untitled Workflow',\n    canvasConfig: { backgroundImage: null, backgroundOpacity: 0.3, minimapEnabled: true, minimapOpacity: 1 },\n    history:"
)

# Add setter implementation
content = content.replace(
    "setWorkflowName: (name) => set({ workflowName: name }),\n    \n    addToHistory",
    "setWorkflowName: (name) => set({ workflowName: name }),\n    \n    updateCanvasConfig: (config) => set((state) => { state.canvasConfig = { ...state.canvasConfig, ...config } }),\n    \n    addToHistory"
)

# Add to partialize
content = content.replace(
    "workflowName: state.workflowName,\n      }),",
    "workflowName: state.workflowName,\n        canvasConfig: state.canvasConfig,\n      }),"
)

with open(r"Z:\jimbo-node-system-v2\src\store\workflowStore.ts", "w", encoding="utf-8") as f:
    f.write(content)
