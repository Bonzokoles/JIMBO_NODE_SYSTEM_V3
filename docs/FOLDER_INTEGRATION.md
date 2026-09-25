# Folder Integration Guide

Complete guide for mounting and interacting with local file systems using the Folder Connector addon.

## Overview

The Folder Connector addon provides secure access to local file systems with 5 specialized nodes for file operations.

## Quick Start

### 1. Start Backend
```bash
cd pc_utility_backend
./setup.sh
python app.py
```

### 2. Basic Workflow
Mount Folder → List Files → Read File → Process → Write File

## Nodes

### 📁 Mount Folder
Establish connection to local directory
- **Inputs**: trigger (optional)
- **Outputs**: connection, metadata
- **Config**: path, read-only, watch changes, hidden files, pattern

### 📄 Read File
Read file contents
- **Inputs**: connection, filename
- **Outputs**: content, metadata
- **Config**: encoding, read mode, max size

### ✏️ Write File
Write content to file
- **Inputs**: connection, filename, content
- **Outputs**: result
- **Config**: mode (overwrite/append/create), create dirs, backup

### 📋 List Files
List all files in folder
- **Inputs**: connection
- **Outputs**: files array
- **Config**: sort by, filter, recursive, max results

### 👁️ Watch Folder
Monitor file system changes
- **Inputs**: connection
- **Outputs**: event, filepath
- **Config**: action (start/stop)

## Security

- Path validation prevents traversal attacks
- Configure `ALLOWED_DIRECTORIES` in backend `.env`
- Permissions checked before operations
- Read-only mode available

## Troubleshooting

- **Connection Failed**: Check backend running, path exists, permissions
- **Permission Denied**: Verify user permissions, check ALLOWED_DIRECTORIES
- **File Too Large**: Increase max size or use streaming

## Best Practices

1. Use absolute paths
2. Enable read-only when possible
3. Use file patterns for filtering
4. Enable backup for critical writes
5. Configure ALLOWED_DIRECTORIES in production

See `http://localhost:8765/docs` for API details.
