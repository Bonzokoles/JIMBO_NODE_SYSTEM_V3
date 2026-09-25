"""
Folder Manager Module for PC Utility Backend
Handles local folder mounting, file operations, and watching.
"""

import os
import asyncio
import aiofiles
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent
import uuid

router = APIRouter(prefix="/api/folder", tags=["folder"])

# Connection pool for mounted folders
mounted_folders: Dict[str, Dict[str, Any]] = {}
folder_watchers: Dict[str, Observer] = {}

# Security: Allowed base directories (configure via environment)
ALLOWED_BASE_DIRS = os.getenv("ALLOWED_DIRECTORIES", "").split(",")


class FolderMountRequest(BaseModel):
    path: str
    read_only: bool = False
    watch_changes: bool = False
    include_hidden: bool = False
    file_pattern: Optional[str] = None


class FolderMountResponse(BaseModel):
    connection_id: str
    path: str
    metadata: Dict[str, Any]


class FileReadRequest(BaseModel):
    connection_id: str
    filename: str
    encoding: str = "utf-8"
    read_mode: str = "full"
    max_size: int = 10 * 1024 * 1024  # 10MB default


class FileWriteRequest(BaseModel):
    connection_id: str
    filename: str
    content: str
    mode: str = "overwrite"
    create_dirs: bool = True
    backup: bool = False


class FileListRequest(BaseModel):
    connection_id: str
    sort_by: str = "name"
    filter_pattern: Optional[str] = None
    recursive: bool = False
    max_results: int = 1000


class FolderWatchEvent(BaseModel):
    event_type: str
    filepath: str
    timestamp: str


class FileSystemWatcher(FileSystemEventHandler):
    """Custom file system event handler"""
    
    def __init__(self, connection_id: str):
        self.connection_id = connection_id
        self.events: List[FolderWatchEvent] = []
        
    def on_any_event(self, event: FileSystemEvent):
        if not event.is_directory:
            watch_event = FolderWatchEvent(
                event_type=event.event_type,
                filepath=event.src_path,
                timestamp=datetime.now().isoformat()
            )
            self.events.append(watch_event)
            # Keep only last 100 events
            if len(self.events) > 100:
                self.events.pop(0)


def validate_path(requested_path: str) -> Path:
    """Validate and sanitize file path to prevent traversal attacks"""
    try:
        resolved_path = Path(requested_path).resolve()
        
        # Security check: Prevent parent directory traversal
        if ".." in str(requested_path):
            raise ValueError("Parent directory traversal not allowed")
        
        # Security check: Ensure path is within allowed directories (if configured)
        if ALLOWED_BASE_DIRS and ALLOWED_BASE_DIRS[0]:
            allowed = False
            for base_dir in ALLOWED_BASE_DIRS:
                if base_dir.strip():
                    base_path = Path(base_dir.strip()).resolve()
                    if resolved_path.is_relative_to(base_path):
                        allowed = True
                        break
            if not allowed:
                raise ValueError(f"Access to {resolved_path} not allowed")
        
        return resolved_path
    except Exception as e:
        raise ValueError(f"Invalid path: {str(e)}")


def calculate_folder_stats(folder_path: Path, include_hidden: bool = False) -> Dict[str, Any]:
    """Calculate folder statistics"""
    stats = {
        "total_files": 0,
        "total_size": 0,
        "file_types": {},
        "total_dirs": 0,
    }
    
    try:
        for item in folder_path.rglob("*"):
            # Skip hidden files if not included
            if not include_hidden and item.name.startswith('.'):
                continue
                
            if item.is_file():
                stats["total_files"] += 1
                stats["total_size"] += item.stat().st_size
                
                # Track file types
                ext = item.suffix or "no_extension"
                stats["file_types"][ext] = stats["file_types"].get(ext, 0) + 1
            elif item.is_dir():
                stats["total_dirs"] += 1
    except Exception as e:
        stats["error"] = str(e)
    
    return stats


@router.post("/mount", response_model=FolderMountResponse)
async def mount_folder(request: FolderMountRequest):
    """Mount a local folder and return connection handle"""
    try:
        # Validate path
        folder_path = validate_path(request.path)
        
        if not folder_path.exists():
            raise HTTPException(status_code=404, detail="Folder not found")
        
        if not folder_path.is_dir():
            raise HTTPException(status_code=400, detail="Path is not a directory")
        
        # Check permissions
        if not os.access(folder_path, os.R_OK):
            raise HTTPException(status_code=403, detail="No read permission")
        
        if not request.read_only and not os.access(folder_path, os.W_OK):
            raise HTTPException(status_code=403, detail="No write permission")
        
        # Generate connection ID
        connection_id = str(uuid.uuid4())
        
        # Calculate folder statistics
        stats = calculate_folder_stats(folder_path, request.include_hidden)
        
        # Store connection
        mounted_folders[connection_id] = {
            "path": str(folder_path),
            "read_only": request.read_only,
            "watch_changes": request.watch_changes,
            "include_hidden": request.include_hidden,
            "file_pattern": request.file_pattern,
            "mounted_at": datetime.now().isoformat(),
        }
        
        # Setup watcher if requested
        if request.watch_changes:
            event_handler = FileSystemWatcher(connection_id)
            observer = Observer()
            observer.schedule(event_handler, str(folder_path), recursive=True)
            observer.start()
            folder_watchers[connection_id] = observer
        
        metadata = {
            "path": str(folder_path),
            "read_only": request.read_only,
            "permissions": {
                "readable": os.access(folder_path, os.R_OK),
                "writable": os.access(folder_path, os.W_OK),
                "executable": os.access(folder_path, os.X_OK),
            },
            **stats,
        }
        
        return FolderMountResponse(
            connection_id=connection_id,
            path=str(folder_path),
            metadata=metadata
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mount folder: {str(e)}")


@router.post("/read")
async def read_file(request: FileReadRequest):
    """Read file from mounted folder"""
    try:
        # Get connection
        if request.connection_id not in mounted_folders:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        connection = mounted_folders[request.connection_id]
        base_path = Path(connection["path"])
        
        # Build and validate file path
        file_path = base_path / request.filename
        file_path = file_path.resolve()
        
        # Security: Ensure file is within mounted folder
        if not file_path.is_relative_to(base_path):
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        if not file_path.is_file():
            raise HTTPException(status_code=400, detail="Not a file")
        
        # Check file size
        file_size = file_path.stat().st_size
        if file_size > request.max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large: {file_size} bytes (max: {request.max_size})"
            )
        
        # Read file content
        async with aiofiles.open(file_path, mode='r', encoding=request.encoding) as f:
            if request.read_mode == "full":
                content = await f.read()
            elif request.read_mode == "lines":
                content = await f.readlines()
            else:
                content = await f.read()
        
        # Get file metadata
        stat = file_path.stat()
        metadata = {
            "filename": file_path.name,
            "size": stat.st_size,
            "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "extension": file_path.suffix,
        }
        
        return {
            "content": content,
            "metadata": metadata,
            "encoding": request.encoding,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")


@router.post("/write")
async def write_file(request: FileWriteRequest):
    """Write file to mounted folder"""
    try:
        # Get connection
        if request.connection_id not in mounted_folders:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        connection = mounted_folders[request.connection_id]
        
        if connection["read_only"]:
            raise HTTPException(status_code=403, detail="Folder is read-only")
        
        base_path = Path(connection["path"])
        file_path = base_path / request.filename
        file_path = file_path.resolve()
        
        # Security: Ensure file is within mounted folder
        if not file_path.is_relative_to(base_path):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Create directories if needed
        if request.create_dirs:
            file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Backup existing file if requested
        if request.backup and file_path.exists():
            backup_path = file_path.with_suffix(file_path.suffix + ".bak")
            file_path.rename(backup_path)
        
        # Write mode handling
        write_mode = 'w'
        if request.mode == "append":
            write_mode = 'a'
        elif request.mode == "create new" and file_path.exists():
            raise HTTPException(status_code=409, detail="File already exists")
        
        # Write file
        async with aiofiles.open(file_path, mode=write_mode, encoding='utf-8') as f:
            await f.write(request.content)
        
        return {
            "success": True,
            "path": str(file_path),
            "size": len(request.content.encode('utf-8')),
            "mode": request.mode,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file: {str(e)}")


@router.post("/list")
async def list_files(request: FileListRequest):
    """List files in mounted folder"""
    try:
        # Get connection
        if request.connection_id not in mounted_folders:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        connection = mounted_folders[request.connection_id]
        base_path = Path(connection["path"])
        
        files = []
        pattern = request.filter_pattern or "*"
        
        # List files
        if request.recursive:
            items = base_path.rglob(pattern)
        else:
            items = base_path.glob(pattern)
        
        for item in items:
            # Skip hidden files if not included
            if not connection["include_hidden"] and item.name.startswith('.'):
                continue
            
            if item.is_file():
                stat = item.stat()
                files.append({
                    "name": item.name,
                    "path": str(item.relative_to(base_path)),
                    "size": stat.st_size,
                    "extension": item.suffix,
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                })
            
            # Limit results
            if len(files) >= request.max_results:
                break
        
        # Sort files
        if request.sort_by == "name":
            files.sort(key=lambda x: x["name"])
        elif request.sort_by == "date":
            files.sort(key=lambda x: x["modified"], reverse=True)
        elif request.sort_by == "size":
            files.sort(key=lambda x: x["size"], reverse=True)
        
        return {
            "files": files,
            "total": len(files),
            "truncated": len(files) >= request.max_results,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


@router.post("/watch")
async def start_watching(connection_id: str):
    """Start watching folder for changes"""
    try:
        if connection_id not in mounted_folders:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        if connection_id in folder_watchers:
            return {"message": "Already watching"}
        
        connection = mounted_folders[connection_id]
        folder_path = Path(connection["path"])
        
        event_handler = FileSystemWatcher(connection_id)
        observer = Observer()
        observer.schedule(event_handler, str(folder_path), recursive=True)
        observer.start()
        folder_watchers[connection_id] = observer
        
        connection["watch_changes"] = True
        
        return {"message": "Watching started", "connection_id": connection_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start watching: {str(e)}")


@router.post("/unwatch")
async def stop_watching(connection_id: str):
    """Stop watching folder"""
    try:
        if connection_id not in mounted_folders:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        if connection_id in folder_watchers:
            observer = folder_watchers[connection_id]
            observer.stop()
            observer.join(timeout=1)
            del folder_watchers[connection_id]
        
        if connection_id in mounted_folders:
            mounted_folders[connection_id]["watch_changes"] = False
        
        return {"message": "Watching stopped"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop watching: {str(e)}")


@router.get("/metadata/{connection_id}")
async def get_folder_metadata(connection_id: str):
    """Get metadata for mounted folder"""
    try:
        if connection_id not in mounted_folders:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        connection = mounted_folders[connection_id]
        folder_path = Path(connection["path"])
        
        stats = calculate_folder_stats(folder_path, connection["include_hidden"])
        
        return {
            "connection_id": connection_id,
            "path": connection["path"],
            "mounted_at": connection["mounted_at"],
            "read_only": connection["read_only"],
            "watching": connection["watch_changes"],
            **stats,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metadata: {str(e)}")


# Cleanup on shutdown
async def cleanup_watchers():
    """Stop all file watchers"""
    for observer in folder_watchers.values():
        observer.stop()
    for observer in folder_watchers.values():
        observer.join(timeout=1)
    folder_watchers.clear()
