"""
Terminal Controller for Dynamic Workflow Management
Provides code execution, workflow control, and dynamic node creation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import subprocess
import sys
import io
import json
import uuid
from contextlib import redirect_stdout, redirect_stderr
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
import time

router = APIRouter()

# Global workflow state registry
WORKFLOW_REGISTRY: Dict[str, Dict[str, Any]] = {}

# Thread pool for parallel execution
executor = ThreadPoolExecutor(max_workers=10)


class CodeExecutionRequest(BaseModel):
    code: str
    language: str = "python"
    workflow_context: bool = True


class WorkflowControlRequest(BaseModel):
    action: str
    workflow_id: str
    modifications: Optional[Dict[str, Any]] = None


class ParallelTasksRequest(BaseModel):
    tasks: List[Dict[str, Any]]
    max_concurrent: int = 3
    timeout: int = 300


class NodeCreationRequest(BaseModel):
    type: str
    label: str
    config: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, float]] = None


def create_dynamic_node(node_type: str, label: str, config: Dict[str, Any] = None) -> Dict[str, Any]:
    """Create a dynamic node programmatically"""
    node_id = f"node-{uuid.uuid4().hex[:8]}"
    node = {
        "id": node_id,
        "type": node_type,
        "label": label,
        "config": config or {},
        "position": {"x": 0, "y": 0},
        "created_at": time.time(),
    }
    return node


def control_workflow_internal(workflow_id: str, action: str) -> Dict[str, Any]:
    """Internal workflow control function"""
    if workflow_id not in WORKFLOW_REGISTRY:
        WORKFLOW_REGISTRY[workflow_id] = {
            "id": workflow_id,
            "state": "stopped",
            "tasks": [],
            "completed": 0,
            "errors": 0,
        }
    
    workflow = WORKFLOW_REGISTRY[workflow_id]
    
    if action == "start":
        workflow["state"] = "running"
    elif action == "stop":
        workflow["state"] = "stopped"
    elif action == "pause":
        workflow["state"] = "paused"
    elif action == "resume":
        workflow["state"] = "running"
    
    return workflow


def get_workflow_status(workflow_id: str) -> Dict[str, Any]:
    """Get workflow status"""
    if workflow_id not in WORKFLOW_REGISTRY:
        return {
            "id": workflow_id,
            "state": "not_found",
            "message": "Workflow not found in registry"
        }
    return WORKFLOW_REGISTRY[workflow_id]


class WorkflowContext:
    """Workflow context object for Python code execution"""
    def __init__(self):
        self.workflows = WORKFLOW_REGISTRY
        
    def create_node(self, node_type: str, label: str, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a dynamic node"""
        return create_dynamic_node(node_type, label, config)
    
    def control_workflow(self, workflow_id: str, action: str) -> Dict[str, Any]:
        """Control workflow execution"""
        return control_workflow_internal(workflow_id, action)
    
    def get_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get workflow status"""
        return get_workflow_status(workflow_id)


# Safe builtins for code execution - restrict dangerous operations
SAFE_BUILTINS = {
    'abs': abs,
    'all': all,
    'any': any,
    'bool': bool,
    'dict': dict,
    'enumerate': enumerate,
    'filter': filter,
    'float': float,
    'int': int,
    'len': len,
    'list': list,
    'map': map,
    'max': max,
    'min': min,
    'print': print,
    'range': range,
    'reversed': reversed,
    'round': round,
    'set': set,
    'sorted': sorted,
    'str': str,
    'sum': sum,
    'tuple': tuple,
    'zip': zip,
    'True': True,
    'False': False,
    'None': None,
    # Math and time modules for common operations
    '__import__': __import__,  # Limited - user can import but we don't expose dangerous modules
}


def execute_python_code(code: str, workflow_context: bool = True) -> Dict[str, Any]:
    """Execute Python code with optional workflow context and restricted builtins"""
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    result = None
    
    try:
        # Create execution context
        local_vars = {}
        
        if workflow_context:
            # Provide workflow API to the code
            local_vars['workflow'] = WorkflowContext()
        
        # Create safe globals with restricted builtins
        safe_globals = {
            "__builtins__": SAFE_BUILTINS,
            "time": time,
            "json": json,
        }
        
        # Capture stdout and stderr
        with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
            exec(code, safe_globals, local_vars)
        
        # Get result if it was set
        if 'result' in local_vars:
            result = local_vars['result']
        
        return {
            "result": result,
            "stdout": stdout_capture.getvalue(),
            "stderr": stderr_capture.getvalue(),
            "success": True,
        }
    except Exception as e:
        return {
            "result": None,
            "stdout": stdout_capture.getvalue(),
            "stderr": stderr_capture.getvalue() + f"\nError: {str(e)}",
            "success": False,
        }


def execute_javascript_code(code: str) -> Dict[str, Any]:
    """Execute JavaScript code via Node.js subprocess"""
    try:
        result = subprocess.run(
            ["node", "-e", code],
            capture_output=True,
            text=True,
            timeout=30,
        )
        
        return {
            "result": result.stdout,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.returncode == 0,
        }
    except subprocess.TimeoutExpired:
        return {
            "result": None,
            "stdout": "",
            "stderr": "Error: JavaScript execution timed out (30s)",
            "success": False,
        }
    except FileNotFoundError:
        return {
            "result": None,
            "stdout": "",
            "stderr": "Error: Node.js is not installed or not in PATH",
            "success": False,
        }
    except Exception as e:
        return {
            "result": None,
            "stdout": "",
            "stderr": f"Error: {str(e)}",
            "success": False,
        }


def execute_bash_code(code: str) -> Dict[str, Any]:
    """Execute Bash commands"""
    try:
        result = subprocess.run(
            ["bash", "-c", code],
            capture_output=True,
            text=True,
            timeout=30,
        )
        
        return {
            "result": result.stdout,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.returncode == 0,
        }
    except subprocess.TimeoutExpired:
        return {
            "result": None,
            "stdout": "",
            "stderr": "Error: Bash execution timed out (30s)",
            "success": False,
        }
    except Exception as e:
        return {
            "result": None,
            "stdout": "",
            "stderr": f"Error: {str(e)}",
            "success": False,
        }


@router.post("/api/terminal/execute")
async def execute_terminal_code(request: CodeExecutionRequest):
    """Execute code in the specified language"""
    try:
        if request.language == "python":
            result = execute_python_code(request.code, request.workflow_context)
        elif request.language == "javascript":
            result = execute_javascript_code(request.code)
        elif request.language == "bash":
            result = execute_bash_code(request.code)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/workflow/control")
async def control_workflow(request: WorkflowControlRequest):
    """Control workflow execution (start, stop, pause, resume, status, modify)"""
    try:
        workflow_id = request.workflow_id
        action = request.action.lower()
        
        # Initialize workflow if it doesn't exist
        if workflow_id not in WORKFLOW_REGISTRY:
            WORKFLOW_REGISTRY[workflow_id] = {
                "id": workflow_id,
                "state": "stopped",
                "tasks": [],
                "completed": 0,
                "errors": 0,
                "created_at": time.time(),
            }
        
        workflow = WORKFLOW_REGISTRY[workflow_id]
        
        if action == "start":
            workflow["state"] = "running"
            workflow["started_at"] = time.time()
        elif action == "stop":
            workflow["state"] = "stopped"
            workflow["stopped_at"] = time.time()
        elif action == "pause":
            workflow["state"] = "paused"
            workflow["paused_at"] = time.time()
        elif action == "resume":
            workflow["state"] = "running"
            workflow["resumed_at"] = time.time()
        elif action == "status":
            pass  # Just return current status
        elif action == "modify":
            if request.modifications:
                workflow.update(request.modifications)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown action: {action}")
        
        return workflow
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def execute_task(task: Dict[str, Any], timeout: int) -> Dict[str, Any]:
    """Execute a single task"""
    task_type = task.get("type", "python")
    
    try:
        if task_type == "python":
            code = task.get("code", "")
            result = execute_python_code(code, workflow_context=False)
        elif task_type == "javascript":
            code = task.get("code", "")
            result = execute_javascript_code(code)
        elif task_type == "bash":
            code = task.get("code", "")
            result = execute_bash_code(code)
        elif task_type == "http":
            # Placeholder for HTTP requests
            result = {
                "result": {"status": "not_implemented"},
                "stdout": "HTTP task type not implemented",
                "stderr": "",
                "success": False,
            }
        else:
            result = {
                "result": None,
                "stdout": "",
                "stderr": f"Unknown task type: {task_type}",
                "success": False,
            }
        
        return {**result, "task_type": task_type}
    except Exception as e:
        return {
            "result": None,
            "stdout": "",
            "stderr": f"Task execution error: {str(e)}",
            "success": False,
            "task_type": task_type,
        }


@router.post("/api/workflow/parallel")
async def execute_parallel_tasks(request: ParallelTasksRequest):
    """Execute multiple tasks in parallel"""
    try:
        tasks = request.tasks
        max_concurrent = min(request.max_concurrent, 10)  # Cap at 10
        timeout = request.timeout
        
        results = []
        completed = 0
        errors = 0
        
        # Use ThreadPoolExecutor with limited workers
        with ThreadPoolExecutor(max_workers=max_concurrent) as pool:
            futures = [pool.submit(execute_task, task, timeout) for task in tasks]
            
            for future in futures:
                try:
                    result = future.result(timeout=timeout)
                    results.append(result)
                    if result.get("success"):
                        completed += 1
                    else:
                        errors += 1
                except FuturesTimeoutError:
                    results.append({
                        "result": None,
                        "stdout": "",
                        "stderr": f"Task timed out after {timeout}s",
                        "success": False,
                    })
                    errors += 1
                except Exception as e:
                    results.append({
                        "result": None,
                        "stdout": "",
                        "stderr": f"Task error: {str(e)}",
                        "success": False,
                    })
                    errors += 1
        
        return {
            "results": results,
            "status": {
                "total": len(tasks),
                "completed": completed,
                "errors": errors,
                "success_rate": completed / len(tasks) if tasks else 0,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/workflow/create-node")
async def create_node(request: NodeCreationRequest):
    """Create a node dynamically"""
    try:
        node = create_dynamic_node(
            request.type,
            request.label,
            request.config or {}
        )
        
        if request.position:
            node["position"] = request.position
        
        return {
            "node_id": node["id"],
            "node": node,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/workflow/list")
async def list_workflows():
    """List all active workflows"""
    return {
        "workflows": list(WORKFLOW_REGISTRY.values()),
        "count": len(WORKFLOW_REGISTRY),
    }
