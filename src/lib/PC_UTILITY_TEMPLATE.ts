/**
 * PC UTILITY WORKFLOW TEMPLATE
 * 
 * This file demonstrates example workflows using the PC Utility addon.
 * Import these templates into Node'y to quickly set up monitoring and optimization workflows.
 * 
 * Templates included:
 * 1. System Monitoring Workflow
 * 2. Cleaning and Optimization Workflow
 * 3. Sentiment Analysis Integration
 * 4. Database Storage Workflow
 */

export const PC_UTILITY_TEMPLATES = {
  // ==================== TEMPLATE 1: SYSTEM MONITORING ====================
  systemMonitoring: {
    name: "System Monitoring",
    description: "Monitor CPU, RAM, Disk, GPU, and Network usage",
    nodes: [
      {
        id: "monitor-1",
        type: "pc-system-monitor",
        position: { x: 100, y: 100 },
        data: {
          label: "System Monitor",
          type: "pc-system-monitor",
          config: {
            updateInterval: 2,
            includeGpu: true,
          },
        },
      },
      {
        id: "gpu-monitor-1",
        type: "pc-gpu-monitor",
        position: { x: 100, y: 250 },
        data: {
          label: "GPU Monitor",
          type: "pc-gpu-monitor",
          config: {
            gpuIndex: 0,
          },
        },
      },
      {
        id: "console-1",
        type: "console",
        position: { x: 400, y: 100 },
        data: {
          label: "Console Output",
          type: "console",
          config: {},
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "monitor-1",
        sourceHandle: "metrics",
        target: "console-1",
        targetHandle: "input",
      },
      {
        id: "e2",
        source: "gpu-monitor-1",
        sourceHandle: "gpuStats",
        target: "console-1",
        targetHandle: "input",
      },
    ],
  },

  // ==================== TEMPLATE 2: CLEANING & OPTIMIZATION ====================
  cleaningOptimization: {
    name: "System Cleaning & Optimization",
    description: "Clean temporary files and optimize memory",
    nodes: [
      {
        id: "cleaner-1",
        type: "pc-system-cleaner",
        position: { x: 100, y: 100 },
        data: {
          label: "System Cleaner",
          type: "pc-system-cleaner",
          config: {
            cleanTemp: true,
            clearCache: true,
            cleanLogs: false,
            emptyRecycleBin: false,
          },
        },
      },
      {
        id: "memory-opt-1",
        type: "pc-memory-optimizer",
        position: { x: 100, y: 250 },
        data: {
          label: "Memory Optimizer",
          type: "pc-memory-optimizer",
          config: {
            aggressiveMode: false,
            clearPageFile: false,
          },
        },
      },
      {
        id: "console-2",
        type: "console",
        position: { x: 400, y: 175 },
        data: {
          label: "Results",
          type: "console",
          config: {},
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "cleaner-1",
        sourceHandle: "results",
        target: "console-2",
        targetHandle: "input",
      },
      {
        id: "e2",
        source: "memory-opt-1",
        sourceHandle: "results",
        target: "console-2",
        targetHandle: "input",
      },
    ],
  },

  // ==================== TEMPLATE 3: SENTIMENT ANALYSIS ====================
  sentimentAnalysis: {
    name: "AI Sentiment Analysis",
    description: "Analyze text sentiment using AI models",
    nodes: [
      {
        id: "text-input-1",
        type: "textInput",
        position: { x: 100, y: 100 },
        data: {
          label: "Text Input",
          type: "textInput",
          config: {
            textContent: "I love using this PC utility system! It's amazing and makes my computer run so much faster.",
          },
        },
      },
      {
        id: "sentiment-1",
        type: "pc-sentiment-analyzer",
        position: { x: 400, y: 100 },
        data: {
          label: "Sentiment Analyzer",
          type: "pc-sentiment-analyzer",
          config: {
            model: "transformers",
            useGpu: false,
          },
        },
      },
      {
        id: "console-3",
        type: "console",
        position: { x: 700, y: 100 },
        data: {
          label: "Sentiment Result",
          type: "console",
          config: {},
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "text-input-1",
        sourceHandle: "value",
        target: "sentiment-1",
        targetHandle: "text",
      },
      {
        id: "e2",
        source: "sentiment-1",
        sourceHandle: "sentiment",
        target: "console-3",
        targetHandle: "input",
      },
    ],
  },

  // ==================== TEMPLATE 4: DATABASE STORAGE ====================
  databaseStorage: {
    name: "Metrics Database Storage",
    description: "Monitor system and save metrics to database",
    nodes: [
      {
        id: "monitor-2",
        type: "pc-system-monitor",
        position: { x: 100, y: 100 },
        data: {
          label: "System Monitor",
          type: "pc-system-monitor",
          config: {
            updateInterval: 5,
            includeGpu: true,
          },
        },
      },
      {
        id: "db-save-1",
        type: "pc-db-save-metrics",
        position: { x: 400, y: 100 },
        data: {
          label: "Save to Database",
          type: "pc-db-save-metrics",
          config: {
            tableName: "system_metrics",
          },
        },
      },
      {
        id: "console-4",
        type: "console",
        position: { x: 700, y: 100 },
        data: {
          label: "Save Result",
          type: "console",
          config: {},
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "monitor-2",
        sourceHandle: "metrics",
        target: "db-save-1",
        targetHandle: "metrics",
      },
      {
        id: "e2",
        source: "db-save-1",
        sourceHandle: "result",
        target: "console-4",
        targetHandle: "input",
      },
    ],
  },

  // ==================== TEMPLATE 5: COMPLETE MONITORING PIPELINE ====================
  completeMonitoring: {
    name: "Complete Monitoring Pipeline",
    description: "Full system monitoring with database storage and process tracking",
    nodes: [
      {
        id: "monitor-3",
        type: "pc-system-monitor",
        position: { x: 100, y: 100 },
        data: {
          label: "System Monitor",
          type: "pc-system-monitor",
          config: {
            updateInterval: 2,
            includeGpu: true,
          },
        },
      },
      {
        id: "process-mgr-1",
        type: "pc-process-manager",
        position: { x: 100, y: 250 },
        data: {
          label: "Process Manager",
          type: "pc-process-manager",
          config: {
            sortBy: "cpu",
            limit: 10,
          },
        },
      },
      {
        id: "db-save-2",
        type: "pc-db-save-metrics",
        position: { x: 400, y: 100 },
        data: {
          label: "Save Metrics",
          type: "pc-db-save-metrics",
          config: {
            tableName: "system_metrics",
          },
        },
      },
      {
        id: "console-5",
        type: "console",
        position: { x: 700, y: 100 },
        data: {
          label: "Monitor Output",
          type: "console",
          config: {},
        },
      },
      {
        id: "console-6",
        type: "console",
        position: { x: 400, y: 250 },
        data: {
          label: "Processes",
          type: "console",
          config: {},
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "monitor-3",
        sourceHandle: "metrics",
        target: "db-save-2",
        targetHandle: "metrics",
      },
      {
        id: "e2",
        source: "db-save-2",
        sourceHandle: "result",
        target: "console-5",
        targetHandle: "input",
      },
      {
        id: "e3",
        source: "process-mgr-1",
        sourceHandle: "processes",
        target: "console-6",
        targetHandle: "input",
      },
    ],
  },
}

/**
 * How to use these templates:
 * 
 * 1. Import this file in your workflow builder
 * 2. Select a template from PC_UTILITY_TEMPLATES
 * 3. Load the nodes and edges into your workflow
 * 4. Customize the configuration as needed
 * 5. Execute the workflow
 * 
 * Example:
 * ```typescript
 * import { PC_UTILITY_TEMPLATES } from '@/lib/PC_UTILITY_TEMPLATE'
 * 
 * // Load system monitoring template
 * const template = PC_UTILITY_TEMPLATES.systemMonitoring
 * workflowStore.setNodes(template.nodes)
 * workflowStore.setEdges(template.edges)
 * ```
 */

export default PC_UTILITY_TEMPLATES
