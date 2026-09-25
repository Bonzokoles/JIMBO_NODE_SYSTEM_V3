# Terminal Controller Documentation

## Overview

The Terminal Controller addon extends the workflow system with powerful capabilities for dynamic workflow management through code execution. It enables users to:

- Execute Python, JavaScript, and Bash code within workflows
- Control multiple workflows programmatically (start, stop, pause, resume)
- Run tasks in parallel with configurable concurrency
- Create nodes dynamically during workflow execution
- Access workflow state and API from executed code

## Use Cases

1. **Automated Testing**: Execute test scripts and validate results
2. **Data Processing**: Run parallel data transformation tasks
3. **DevOps Automation**: Control deployment workflows programmatically
4. **Dynamic Workflows**: Create workflow nodes based on runtime conditions
5. **System Integration**: Execute scripts to integrate with external systems
6. **Batch Processing**: Process multiple items concurrently
7. **Workflow Orchestration**: Manage complex multi-workflow scenarios

## Nodes Reference

### 1. Terminal Executor Node

Execute code in Python, JavaScript, or Bash with optional workflow context.

#### Inputs
- **trigger**: Execution trigger (any type)
- **code**: Code input (text, optional - can use config instead)

#### Outputs
- **result**: Execution result (captured from `result` variable or stdout)
- **stdout**: Standard output from code execution
- **stderr**: Error output (if any)

#### Configuration
- **Language**: Select Python, JavaScript, or Bash
- **Code**: Code editor for writing/editing code
- **Enable Workflow Context**: Provide access to workflow API (Python only)

#### Example Usage

**Python with Workflow Context:**
```python
# Access workflow registry
workflow_id = "my-workflow"

# Start a workflow
workflow.control_workflow(workflow_id, "start")

# Create a dynamic node
node_id = workflow.create_node(
    "text-input",
    "Dynamic Input",
    {"value": "Hello from code!"}
)

# Get workflow status
status = workflow.get_status(workflow_id)
print(f"Workflow {workflow_id} is {status['state']}")

# Set result (will be available in 'result' output)
result = {
    "workflow": workflow_id,
    "node": node_id,
    "status": status
}
```

**JavaScript Example:**
```javascript
// Node.js script
const data = [1, 2, 3, 4, 5];
const sum = data.reduce((a, b) => a + b, 0);
console.log(`Sum: ${sum}`);
console.log(`Average: ${sum / data.length}`);
```

**Bash Example:**
```bash
#!/bin/bash
echo "System Information:"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime)"
echo "Disk Usage:"
df -h | grep -E '^/dev/'
```

### 2. Workflow Controller Node

Control workflow execution programmatically.

#### Inputs
- **action**: Control action (text, optional - can use config)

#### Outputs
- **status**: Workflow status object containing state and metadata

#### Configuration
- **Action**: Select from start, stop, pause, resume, status, modify
- **Workflow ID**: Target workflow identifier (required)
- **Modifications JSON**: JSON configuration for modify action

#### Actions

**start**: Start a workflow
```json
{
  "action": "start",
  "workflow_id": "workflow-123"
}
```

**stop**: Stop a running workflow
```json
{
  "action": "stop",
  "workflow_id": "workflow-123"
}
```

**pause**: Pause execution
```json
{
  "action": "pause",
  "workflow_id": "workflow-123"
}
```

**resume**: Resume paused workflow
```json
{
  "action": "resume",
  "workflow_id": "workflow-123"
}
```

**status**: Get current status
```json
{
  "action": "status",
  "workflow_id": "workflow-123"
}
```

**modify**: Update workflow configuration
```json
{
  "action": "modify",
  "workflow_id": "workflow-123",
  "modifications": {
    "priority": "high",
    "tags": ["critical", "production"]
  }
}
```

#### Status Object Structure
```json
{
  "id": "workflow-123",
  "state": "running",
  "tasks": [],
  "completed": 0,
  "errors": 0,
  "created_at": 1234567890.123,
  "started_at": 1234567891.456
}
```

### 3. Parallel Task Manager Node

Execute multiple tasks concurrently with configurable parallelism.

#### Inputs
- **tasks**: Array of task specifications (required)

#### Outputs
- **results**: Array of task results (one per task)
- **status**: Execution status summary

#### Configuration
- **Max Concurrent Tasks**: Maximum parallel tasks (default: 3, max: 10)
- **Timeout (seconds)**: Per-task timeout (default: 300)

#### Task Specification

Each task in the array should be an object with:
- `type`: Task type ("python", "javascript", "bash")
- Additional fields depending on type

**Note**: HTTP task type is planned but not yet implemented in v1.0.0.

**Python Task:**
```json
{
  "type": "python",
  "code": "result = 2 + 2"
}
```

**JavaScript Task:**
```json
{
  "type": "javascript",
  "code": "console.log('Hello from JS');"
}
```

**Bash Task:**
```json
{
  "type": "bash",
  "code": "echo 'Hello from Bash'"
}
```

#### Example Task Array
```json
[
  {
    "type": "python",
    "code": "result = 'Task 1: ' + str(10 * 10)"
  },
  {
    "type": "python",
    "code": "import time\ntime.sleep(2)\nresult = 'Task 2: Delayed result'"
  },
  {
    "type": "bash",
    "code": "echo 'Task 3: System info'; uname -a"
  }
]
```

#### Status Object
```json
{
  "total": 3,
  "completed": 3,
  "errors": 0,
  "success_rate": 1.0
}
```

### 4. Dynamic Node Creator Node

Create workflow nodes programmatically during execution.

#### Inputs
- **nodeSpec**: Node specification object (optional - can use config)

#### Outputs
- **nodeId**: Created node's unique identifier
- **node**: Complete node object with all metadata

#### Configuration
- **Node Type**: Type of node to create (e.g., "text-input")
- **Node Label**: Display label for the node
- **Node Configuration (JSON)**: Node-specific configuration

#### Example

**Configuration:**
```
Node Type: text-input
Node Label: Generated Input
Node Config: {"value": "Dynamically created!"}
```

**Created Node Object:**
```json
{
  "id": "node-a1b2c3d4",
  "type": "text-input",
  "label": "Generated Input",
  "config": {
    "value": "Dynamically created!"
  },
  "position": {"x": 0, "y": 0},
  "created_at": 1234567890.123
}
```

## Workflow Context API

When **Enable Workflow Context** is enabled in Terminal Executor, Python code has access to a `workflow` object with these functions:

### workflow.control_workflow(workflow_id, action)
Control a workflow's execution state.

```python
# Start workflow
workflow.control_workflow("wf-001", "start")

# Stop workflow
workflow.control_workflow("wf-001", "stop")

# Pause workflow
workflow.control_workflow("wf-001", "pause")

# Resume workflow
workflow.control_workflow("wf-001", "resume")
```

### workflow.get_status(workflow_id)
Get the current status of a workflow.

```python
status = workflow.get_status("wf-001")
print(f"State: {status['state']}")
print(f"Completed tasks: {status['completed']}")
print(f"Errors: {status['errors']}")
```

### workflow.create_node(node_type, label, config)
Create a new node dynamically.

```python
node = workflow.create_node(
    "text-input",
    "My Dynamic Node",
    {"value": "Initial value"}
)
print(f"Created node: {node['id']}")
```

### workflow.workflows
Access the global workflow registry.

```python
# List all workflows
for wf_id, wf_data in workflow.workflows.items():
    print(f"{wf_id}: {wf_data['state']}")

# Check if workflow exists
if "wf-001" in workflow.workflows:
    print("Workflow exists!")
```

## Parallel Execution Patterns

### Pattern 1: Data Processing Pipeline
```python
# Generate tasks for processing multiple items
items = ["item1", "item2", "item3"]
tasks = []

for item in items:
    tasks.append({
        "type": "python",
        "code": f"result = process('{item}')"
    })

# Execute in parallel with 3 workers
# Use parallel-task-manager node with tasks array
```

### Pattern 2: Multi-Step Workflow
```python
# Step 1: Start multiple workflows
workflow_ids = ["wf-001", "wf-002", "wf-003"]

for wf_id in workflow_ids:
    workflow.control_workflow(wf_id, "start")

# Step 2: Monitor status
statuses = [workflow.get_status(wf_id) for wf_id in workflow_ids]

# Step 3: Wait for completion (implement polling)
result = {
    "workflows": statuses,
    "running": sum(1 for s in statuses if s['state'] == 'running')
}
```

### Pattern 3: Conditional Node Creation
```python
# Create nodes based on runtime conditions
data = {"type": "alert", "severity": "high"}

if data["severity"] == "high":
    node = workflow.create_node(
        "notification",
        "High Priority Alert",
        {"message": "Critical issue detected!"}
    )
    result = f"Created alert node: {node['id']}"
else:
    result = "No action needed"
```

## Error Handling Best Practices

### 1. Try-Catch in Python
```python
try:
    workflow.control_workflow("wf-001", "start")
    result = {"success": True}
except Exception as e:
    result = {"success": False, "error": str(e)}
    print(f"Error: {e}")
```

### 2. Validate Inputs
```python
workflow_id = "wf-001"

# Check if workflow exists before controlling
if workflow_id not in workflow.workflows:
    print(f"Warning: Workflow {workflow_id} not found, creating...")
    workflow.workflows[workflow_id] = {
        "id": workflow_id,
        "state": "stopped",
        "tasks": []
    }

workflow.control_workflow(workflow_id, "start")
result = "Workflow started"
```

### 3. Handle Parallel Task Failures
```python
# Tasks with error handling
tasks = [
    {
        "type": "python",
        "code": """
try:
    result = risky_operation()
except Exception as e:
    result = {"error": str(e)}
"""
    }
]
```

### 4. Check stderr Output
Monitor the `stderr` output from Terminal Executor for error messages:
```javascript
// In workflow logic
if (stderr && stderr.length > 0) {
    console.error("Execution errors:", stderr);
    // Handle error appropriately
}
```

## Security Considerations

### Code Execution Safety

1. **Sandboxing**: Code execution has limited scope
   - Python: Restricted builtins (no `open()`, `eval()`, etc.), limited to safe operations only
   - JavaScript: Runs in Node.js subprocess with timeout
   - Bash: Limited shell environment

2. **Timeouts**: All code execution has timeout limits
   - Subprocess: 30 seconds
   - Parallel tasks: Configurable (default 300s)

3. **Resource Limits**:
   - Max concurrent workers: 10
   - Memory: Limited by Python/Node.js defaults
   - No arbitrary file system access

4. **Input Validation**:
   - All inputs are validated via Pydantic models
   - JSON configuration is parsed safely
   - Error messages are sanitized

### Production Recommendations

1. **CORS Configuration**: CORS is environment-aware by default
   - Development: Set `ALLOW_ALL_ORIGINS=true` environment variable
   - Production: Set `FRONTEND_ORIGIN=https://your-frontend.com`
   - Default origins: localhost:5173, localhost:3000

```bash
# Development
export ALLOW_ALL_ORIGINS=true

# Production
export FRONTEND_ORIGIN=https://your-frontend.com
```

Or update `app.py` directly:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.com"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)
```

2. **Backend URL Configuration**: Configure the backend URL in frontend
```bash
# Set in .env file
VITE_TERMINAL_BACKEND_URL=https://your-backend.com
```

3. **Authentication**: Add authentication middleware
```python
from fastapi import Header, HTTPException

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401)
    # Verify token
```

4. **Rate Limiting**: Implement rate limiting for endpoints

5. **Logging**: Enable comprehensive logging
```python
import logging
logging.basicConfig(level=logging.INFO)
```

6. **Network Isolation**: Restrict network access for executed code

## Performance Optimization

### 1. Optimize Parallel Tasks
- Use appropriate `max_concurrent` based on CPU cores
- Balance between parallelism and resource usage
- Set realistic timeouts

```python
# Good: Matches CPU cores
max_concurrent = 4

# Good: Short timeout for fast operations
timeout = 30

# Avoid: Too many concurrent tasks
max_concurrent = 100  # May overwhelm system
```

### 2. Minimize Code Complexity
Keep executed code simple and focused:
```python
# Good: Simple, focused task
result = data.process()

# Avoid: Complex operations in single execution
# (split into multiple nodes instead)
```

### 3. Reuse Workflow Registry
Access `workflow.workflows` efficiently:
```python
# Good: Single lookup
wf = workflow.workflows.get("wf-001")
if wf:
    print(wf['state'])

# Avoid: Multiple lookups
if "wf-001" in workflow.workflows:
    print(workflow.workflows["wf-001"]['state'])
```

### 4. Use Appropriate Languages
- Python: Complex logic, workflow API access
- JavaScript: JSON processing, API calls
- Bash: System commands, file operations

## API Reference

### Backend Endpoints

#### POST /api/terminal/execute
Execute code in the specified language.

**Request Body:**
```json
{
  "code": "print('Hello')",
  "language": "python",
  "workflow_context": true
}
```

**Response:**
```json
{
  "result": null,
  "stdout": "Hello\n",
  "stderr": "",
  "success": true
}
```

#### POST /api/workflow/control
Control workflow execution.

**Request Body:**
```json
{
  "action": "start",
  "workflow_id": "wf-001",
  "modifications": {}
}
```

**Response:**
```json
{
  "id": "wf-001",
  "state": "running",
  "tasks": [],
  "completed": 0,
  "errors": 0,
  "started_at": 1234567890.123
}
```

#### POST /api/workflow/parallel
Execute multiple tasks in parallel.

**Request Body:**
```json
{
  "tasks": [
    {"type": "python", "code": "result = 1+1"}
  ],
  "max_concurrent": 3,
  "timeout": 300
}
```

**Response:**
```json
{
  "results": [
    {
      "result": null,
      "stdout": "",
      "stderr": "",
      "success": true,
      "task_type": "python"
    }
  ],
  "status": {
    "total": 1,
    "completed": 1,
    "errors": 0,
    "success_rate": 1.0
  }
}
```

#### POST /api/workflow/create-node
Create a node dynamically.

**Request Body:**
```json
{
  "type": "text-input",
  "label": "My Node",
  "config": {"value": "Hello"},
  "position": {"x": 100, "y": 200}
}
```

**Response:**
```json
{
  "node_id": "node-a1b2c3d4",
  "node": {
    "id": "node-a1b2c3d4",
    "type": "text-input",
    "label": "My Node",
    "config": {"value": "Hello"},
    "position": {"x": 100, "y": 200},
    "created_at": 1234567890.123
  }
}
```

#### GET /api/workflow/list
List all active workflows.

**Response:**
```json
{
  "workflows": [
    {
      "id": "wf-001",
      "state": "running",
      "tasks": [],
      "completed": 5,
      "errors": 0
    }
  ],
  "count": 1
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "pc-utility-backend",
  "terminal_controller": "active"
}
```

## Troubleshooting

### Backend Not Available
**Symptom**: "Terminal Controller backend is not available" warning

**Solution:**
1. Check if backend is running: `curl http://localhost:8765/health`
2. Start the backend: `cd pc_utility_backend && python app.py`
3. Check port availability: `lsof -i :8765`

### Code Execution Timeout
**Symptom**: "Execution timed out" in stderr

**Solutions:**
- Reduce code complexity
- Increase timeout in parallel task manager
- Split long-running operations into smaller tasks

### Node.js Not Found
**Symptom**: "Node.js is not installed" error for JavaScript execution

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install nodejs

# macOS
brew install node

# Verify installation
node --version
```

### Import Errors in Python
**Symptom**: "ModuleNotFoundError" in stderr

**Solution:**
Python code runs in restricted environment. Use only built-in modules or install in backend environment:
```bash
cd pc_utility_backend
source venv/bin/activate
pip install <module-name>
```

### Workflow Not Found
**Symptom**: Workflow state is "not_found"

**Solution:**
Workflows are created on first access. Either:
1. Use "start" action to create and start
2. Check workflow ID for typos
3. List all workflows: `GET /api/workflow/list`

## Examples

### Example 1: Automated Workflow Orchestration
```python
# Start 3 workflows for parallel processing
workflow_ids = ["data-proc-1", "data-proc-2", "data-proc-3"]

for wf_id in workflow_ids:
    workflow.control_workflow(wf_id, "start")
    print(f"Started {wf_id}")

# Create monitoring node
monitor_node = workflow.create_node(
    "workflow-controller",
    "Status Monitor",
    {"action": "status", "workflowId": "data-proc-1"}
)

result = {
    "started_workflows": workflow_ids,
    "monitor_node": monitor_node['id']
}
```

### Example 2: Conditional Processing
```python
# Check data and create appropriate nodes
data_size = 1000000  # Example: 1M records

if data_size > 500000:
    # Large dataset: use parallel processing
    node = workflow.create_node(
        "parallel-task-manager",
        "Parallel Processor",
        {"maxConcurrent": 5, "timeout": 600}
    )
    strategy = "parallel"
else:
    # Small dataset: sequential processing
    node = workflow.create_node(
        "terminal-executor",
        "Sequential Processor",
        {"language": "python"}
    )
    strategy = "sequential"

result = {
    "strategy": strategy,
    "processor_node": node['id'],
    "data_size": data_size
}
```

### Example 3: Error Recovery Workflow
```python
# Monitor workflow and restart on error
workflow_id = "critical-workflow"
status = workflow.get_status(workflow_id)

if status.get('errors', 0) > 5:
    # Too many errors, restart workflow
    workflow.control_workflow(workflow_id, "stop")
    print("Workflow stopped due to errors")
    
    # Wait briefly (in real scenario, use proper delay)
    workflow.control_workflow(workflow_id, "start")
    print("Workflow restarted")
    
    result = "Workflow recovered from errors"
else:
    result = f"Workflow healthy: {status['errors']} errors"
```

## Support

For issues, questions, or contributions:
- Check the troubleshooting section
- Review API documentation: http://localhost:8765/docs
- Check backend logs for detailed error messages
- Verify Node.js and Python versions meet requirements

## Version History

### Version 1.0.0
- Initial release
- Python, JavaScript, and Bash execution
- Workflow control (start, stop, pause, resume, status, modify)
- Parallel task execution with ThreadPoolExecutor
- Dynamic node creation
- Workflow context API for Python
- Security sandbox and timeouts
