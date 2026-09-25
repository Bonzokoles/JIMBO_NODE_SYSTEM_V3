/**
 * Terminal Workflow Template
 * Demonstrates the Terminal Controller addon capabilities
 */

export const TERMINAL_WORKFLOW_TEMPLATE = {
  name: 'Terminal Controller Demo',
  description: 'Demonstration of Terminal Controller features: code execution, workflow control, parallel tasks, and dynamic node creation',
  nodes: [
    {
      id: 'text-input-1',
      type: 'text-input',
      position: { x: 50, y: 50 },
      data: {
        label: 'Trigger Input',
        config: {
          value: 'Start Terminal Workflow',
        },
      },
    },
    {
      id: 'terminal-executor-1',
      type: 'terminal-executor',
      position: { x: 50, y: 200 },
      data: {
        label: 'Python Executor',
        config: {
          language: 'python',
          codeEditor: `# Python code with workflow context
import time

# Access workflow API
workflow_id = "demo-workflow-001"
workflow.control_workflow(workflow_id, "start")

# Perform computation
result = {
    "message": "Workflow started successfully",
    "workflow_id": workflow_id,
    "timestamp": time.time(),
    "computed_value": 42 * 2
}

print(f"Executed Python code at {time.time()}")
print(f"Result: {result}")
`,
          workflowContext: true,
        },
      },
    },
    {
      id: 'workflow-controller-1',
      type: 'workflow-controller',
      position: { x: 400, y: 200 },
      data: {
        label: 'Control Workflow',
        config: {
          action: 'status',
          workflowId: 'demo-workflow-001',
        },
      },
    },
    {
      id: 'parallel-task-manager-1',
      type: 'parallel-task-manager',
      position: { x: 50, y: 400 },
      data: {
        label: 'Parallel Tasks',
        config: {
          maxConcurrent: 3,
          timeout: 300,
        },
      },
    },
    {
      id: 'dynamic-node-creator-1',
      type: 'dynamic-node-creator',
      position: { x: 400, y: 400 },
      data: {
        label: 'Create Dynamic Node',
        config: {
          nodeType: 'text-input',
          nodeLabel: 'Dynamically Created Input',
          nodeConfig: JSON.stringify({
            value: 'This node was created dynamically!',
          }, null, 2),
        },
      },
    },
    {
      id: 'console-output-1',
      type: 'console-output',
      position: { x: 750, y: 200 },
      data: {
        label: 'Workflow Status',
      },
    },
    {
      id: 'console-output-2',
      type: 'console-output',
      position: { x: 750, y: 400 },
      data: {
        label: 'Dynamic Node Info',
      },
    },
    {
      id: 'text-generator-1',
      type: 'text-generator',
      position: { x: 50, y: 600 },
      data: {
        label: 'Task Array Generator',
        config: {
          template: JSON.stringify([
            {
              type: 'python',
              code: 'result = "Task 1: " + str(1 + 1)',
            },
            {
              type: 'python',
              code: 'result = "Task 2: " + str(2 * 2)',
            },
            {
              type: 'python',
              code: 'result = "Task 3: " + str(3 ** 2)',
            },
          ], null, 2),
        },
      },
    },
    {
      id: 'console-output-3',
      type: 'console-output',
      position: { x: 400, y: 600 },
      data: {
        label: 'Parallel Task Results',
      },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'text-input-1',
      sourceHandle: 'value',
      target: 'terminal-executor-1',
      targetHandle: 'trigger',
    },
    {
      id: 'e2',
      source: 'terminal-executor-1',
      sourceHandle: 'result',
      target: 'workflow-controller-1',
      targetHandle: 'action',
    },
    {
      id: 'e3',
      source: 'workflow-controller-1',
      sourceHandle: 'status',
      target: 'console-output-1',
      targetHandle: 'input',
    },
    {
      id: 'e4',
      source: 'text-input-1',
      sourceHandle: 'value',
      target: 'dynamic-node-creator-1',
      targetHandle: 'nodeSpec',
    },
    {
      id: 'e5',
      source: 'dynamic-node-creator-1',
      sourceHandle: 'node',
      target: 'console-output-2',
      targetHandle: 'input',
    },
    {
      id: 'e6',
      source: 'text-generator-1',
      sourceHandle: 'output',
      target: 'parallel-task-manager-1',
      targetHandle: 'tasks',
    },
    {
      id: 'e7',
      source: 'parallel-task-manager-1',
      sourceHandle: 'results',
      target: 'console-output-3',
      targetHandle: 'input',
    },
  ],
  metadata: {
    author: 'Terminal Controller',
    created: new Date().toISOString(),
    tags: ['terminal', 'automation', 'workflow', 'demo'],
    category: 'Examples',
  },
}
