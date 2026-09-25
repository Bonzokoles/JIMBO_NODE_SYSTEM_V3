# PC Utility Monitoring & Optimization System

Complete documentation for the PC Utility addon for Node'y visual workflow builder.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Node Reference](#node-reference)
4. [Backend Setup](#backend-setup)
5. [GPU Setup Guide](#gpu-setup-guide)
6. [Database Integration](#database-integration)
7. [API Documentation](#api-documentation)
8. [Example Workflows](#example-workflows)
9. [Windows Installer](#windows-installer)
10. [Troubleshooting](#troubleshooting)

## Overview

The PC Utility system is a comprehensive addon that provides:

- **System Monitoring**: Real-time CPU, RAM, Disk, Network monitoring
- **GPU Monitoring**: GPU utilization, memory, temperature tracking
- **System Cleaning**: Temporary files, cache, logs cleanup
- **Memory Optimization**: Python GC and GPU cache clearing
- **Process Management**: List and sort running processes
- **AI Sentiment Analysis**: Text sentiment analysis using Hugging Face Transformers
- **Database Storage**: SQLite database for metrics persistence

### Architecture

```
┌─────────────────┐      HTTP Requests      ┌──────────────────┐
│  Node'y Frontend│ ──────────────────────► │ FastAPI Backend  │
│  (React/TS)     │ ◄────────────────────── │  (Python)        │
└─────────────────┘      JSON Responses     └──────────────────┘
                                                     │
                                                     ▼
                                             ┌──────────────────┐
                                             │  SQLite Database │
                                             │  pc_utility.db   │
                                             └──────────────────┘
```

## Installation

### Frontend (Node'y Addon)

The PC Utility addon is already integrated into the Node'y system. Simply enable it in the Addons Manager:

1. Open Node'y workflow builder
2. Navigate to Addons Manager
3. Find "PC Utility Monitoring & Optimization"
4. Enable the addon
5. Nodes will appear in the Node Palette under "PC Utility"

### Backend Service

#### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

#### Quick Setup

1. Navigate to the backend directory:
```bash
cd pc_utility_backend
```

2. Run the setup script:
```bash
# Linux/Mac
chmod +x setup.sh
./setup.sh

# Windows
bash setup.sh  # If Git Bash is installed
# Or manually follow steps below
```

#### Manual Setup

1. Create virtual environment:
```bash
python3 -m venv venv
```

2. Activate virtual environment:
```bash
# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the server:
```bash
python app.py
```

The backend will be available at `http://localhost:8765`

## Node Reference

### System Monitor Node

**Type**: `pc-system-monitor`  
**Category**: PC Utility

Monitors system metrics including CPU, RAM, Disk, and Network usage.

**Configuration:**
- `updateInterval` (number): Update interval in seconds (default: 1)
- `includeGpu` (boolean): Include GPU metrics (default: true)

**Outputs:**
- `metrics` (object): Complete system metrics

**Example Output:**
```json
{
  "cpu": { "percent": 45.2, "count": 8, "frequency": {...} },
  "memory": { "total_gb": 16.0, "used_gb": 8.5, "percent": 53.1 },
  "disk": { "total_gb": 500.0, "used_gb": 250.0, "percent": 50.0 },
  "network": { "bytes_sent_mb": 1024.5, "bytes_recv_mb": 2048.7 },
  "gpu": [...]
}
```

---

### GPU Monitor Node

**Type**: `pc-gpu-monitor`  
**Category**: PC Utility

Monitors GPU-specific statistics.

**Configuration:**
- `gpuIndex` (number): GPU device index (default: 0)

**Outputs:**
- `gpuStats` (object): GPU statistics

**Example Output:**
```json
{
  "id": 0,
  "name": "NVIDIA GeForce RTX 3080",
  "load": 75.5,
  "memory": {
    "used_mb": 8192,
    "total_mb": 10240,
    "percent": 80.0
  },
  "temperature": 72
}
```

---

### System Cleaner Node

**Type**: `pc-system-cleaner`  
**Category**: PC Utility

Cleans system temporary files and caches.

**Configuration:**
- `cleanTemp` (boolean): Clean temporary files (default: true)
- `clearCache` (boolean): Clear system cache (default: true)
- `cleanLogs` (boolean): Clean old logs (default: false)
- `emptyRecycleBin` (boolean): Empty recycle bin (default: false)

**Outputs:**
- `results` (object): Cleaning results

**Example Output:**
```json
{
  "cleaned": ["temporary files", "python cache"],
  "freed_space_mb": 1024.5,
  "files_removed": 1523
}
```

---

### Memory Optimizer Node

**Type**: `pc-memory-optimizer`  
**Category**: PC Utility

Optimizes system memory usage.

**Configuration:**
- `aggressiveMode` (boolean): More aggressive clearing (default: false)
- `clearPageFile` (boolean): Clear Windows page file (default: false)

**Outputs:**
- `results` (object): Optimization results

**Example Output:**
```json
{
  "before": { "used_gb": 12.5, "percent": 78.1 },
  "after": { "used_gb": 10.2, "percent": 63.8 },
  "freed_mb": 2355.2
}
```

---

### Process Manager Node

**Type**: `pc-process-manager`  
**Category**: PC Utility

Lists and sorts running processes.

**Configuration:**
- `sortBy` (select): Sort by CPU, Memory, or Name (default: "cpu")
- `limit` (number): Maximum results to return (default: 10)

**Outputs:**
- `processes` (array): List of processes

**Example Output:**
```json
{
  "processes": [
    { "pid": 1234, "name": "chrome.exe", "cpu_percent": 25.5, "memory_percent": 15.2 },
    { "pid": 5678, "name": "python.exe", "cpu_percent": 10.1, "memory_percent": 5.8 }
  ]
}
```

---

### Sentiment Analyzer Node

**Type**: `pc-sentiment-analyzer`  
**Category**: PC Utility

Analyzes text sentiment using AI models.

**Inputs:**
- `text` (text, required): Text to analyze

**Configuration:**
- `model` (select): tensorflow, pytorch, or transformers (default: "transformers")
- `useGpu` (boolean): Use GPU acceleration (default: false)

**Outputs:**
- `sentiment` (object): Sentiment analysis result

**Example Output:**
```json
{
  "sentiment": "POSITIVE",
  "score": 0.9987,
  "confidence": 99.87,
  "gpu_used": false
}
```

---

### Save Metrics to DB Node

**Type**: `pc-db-save-metrics`  
**Category**: PC Utility

Saves metrics to SQLite database.

**Inputs:**
- `metrics` (object, required): Metrics data to save

**Configuration:**
- `tableName` (text): Database table name (default: "system_metrics")

**Outputs:**
- `result` (object): Save result with record ID

**Example Output:**
```json
{
  "success": true,
  "record_id": 42,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## Backend Setup

### Dependencies

The backend requires the following Python packages:

```
fastapi==0.115.0        # Web framework
uvicorn[standard]==0.24.0  # ASGI server
psutil==5.9.6          # System monitoring
torch==2.6.0           # PyTorch for AI
transformers==4.48.0   # Hugging Face models
gputil==1.4.0          # GPU monitoring
pydantic==2.10.0       # Data validation
python-multipart==0.0.22  # Form parsing
winshell==0.6          # Windows shell integration (Windows only)
```

### Running the Backend

```bash
cd pc_utility_backend
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

python app.py
```

The server will start on `http://localhost:8765`

### Environment Variables

You can customize the backend behavior with environment variables:

```bash
export PORT=8765                    # Server port
export HOST=0.0.0.0                # Server host
export DB_FILE=pc_utility.db       # Database file path
```

## GPU Setup Guide

### Requirements

- NVIDIA GPU with CUDA support
- CUDA Toolkit installed
- Compatible GPU drivers

### Installing CUDA

#### Windows

1. Download CUDA Toolkit from [NVIDIA website](https://developer.nvidia.com/cuda-downloads)
2. Install CUDA Toolkit (recommended version: 11.8 or 12.1)
3. Verify installation:
```bash
nvcc --version
```

#### Linux

```bash
# Ubuntu/Debian
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
sudo apt-get update
sudo apt-get install cuda
```

### Installing PyTorch with CUDA

```bash
# CUDA 11.8
pip install torch --index-url https://download.pytorch.org/whl/cu118

# CUDA 12.1
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

### Verifying GPU Setup

Run this Python script to verify:

```python
import torch
import GPUtil

print(f"CUDA Available: {torch.cuda.is_available()}")
print(f"CUDA Version: {torch.version.cuda}")
print(f"GPU Count: {torch.cuda.device_count()}")

if torch.cuda.is_available():
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")

gpus = GPUtil.getGPUs()
for gpu in gpus:
    print(f"GPU {gpu.id}: {gpu.name} - {gpu.memoryTotal}MB")
```

### Memory Optimization Strategies

1. **Clear GPU Cache Regularly**:
```python
import torch
torch.cuda.empty_cache()
```

2. **Use Mixed Precision**:
```python
from torch.cuda.amp import autocast
with autocast():
    # Your inference code
```

3. **Batch Processing**:
Process data in smaller batches to avoid OOM errors.

4. **Monitor GPU Memory**:
```python
print(torch.cuda.memory_allocated() / 1024**3, "GB")
```

## Database Integration

### Schema

The SQLite database (`pc_utility.db`) uses the following schema:

```sql
CREATE TABLE system_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    cpu_percent REAL,
    ram_percent REAL,
    ram_used_gb REAL,
    ram_total_gb REAL,
    disk_percent REAL,
    disk_used_gb REAL,
    disk_total_gb REAL,
    network_sent_mb REAL,
    network_recv_mb REAL,
    gpu_info TEXT,           -- JSON string
    data TEXT                -- Full metrics JSON
)
```

### Querying Data

#### Using Python

```python
import sqlite3
import json

conn = sqlite3.connect('pc_utility.db')
cursor = conn.cursor()

# Get last 10 metrics
cursor.execute("""
    SELECT timestamp, cpu_percent, ram_percent 
    FROM system_metrics 
    ORDER BY timestamp DESC 
    LIMIT 10
""")

for row in cursor.fetchall():
    print(row)

conn.close()
```

#### Using SQL Browser

Open `pc_utility.db` with any SQLite browser:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Studio](https://sqlitestudio.pl/)

### Data Export

Export metrics to CSV:

```python
import sqlite3
import csv

conn = sqlite3.connect('pc_utility.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM system_metrics")

with open('metrics.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([desc[0] for desc in cursor.description])
    writer.writerows(cursor.fetchall())

conn.close()
```

## API Documentation

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "PC Utility Backend",
  "version": "1.0.0",
  "features": {
    "gpu_monitoring": true,
    "ai_sentiment": true,
    "windows_shell": false
  }
}
```

### System Monitor

**Endpoint**: `POST /api/system/monitor`

**Request Body**:
```json
{
  "include_gpu": true
}
```

**Response**: See [System Monitor Node](#system-monitor-node)

### GPU Stats

**Endpoint**: `GET /api/gpu/stats/{gpu_index}`

**Response**: See [GPU Monitor Node](#gpu-monitor-node)

### System Clean

**Endpoint**: `POST /api/system/clean`

**Request Body**:
```json
{
  "clean_temp": true,
  "clear_cache": true,
  "clean_logs": false,
  "empty_recycle_bin": false
}
```

### Memory Optimize

**Endpoint**: `POST /api/system/optimize-memory`

**Request Body**:
```json
{
  "aggressive": false,
  "clear_page_file": false
}
```

### Process List

**Endpoint**: `GET /api/system/processes?sort_by=cpu&limit=10`

**Query Parameters**:
- `sort_by`: cpu, memory, or name
- `limit`: Maximum results (default: 10)

### Sentiment Analysis

**Endpoint**: `POST /api/ai/sentiment`

**Request Body**:
```json
{
  "text": "I love this system!",
  "model": "transformers",
  "use_gpu": false
}
```

### Save Metrics

**Endpoint**: `POST /api/db/save-metrics`

**Request Body**:
```json
{
  "metrics": { /* metrics object */ },
  "table_name": "system_metrics"
}
```

### Get Metrics

**Endpoint**: `GET /api/db/metrics?limit=100&offset=0`

## Example Workflows

### 1. Basic System Monitoring

Monitor system and display metrics:

```
[System Monitor] → [Console Output]
```

### 2. Automated Cleaning

Clean system on schedule:

```
[Delay (3600s)] → [System Cleaner] → [Console Output]
                              ↓
                    [Memory Optimizer]
```

### 3. Performance Tracking

Monitor and store metrics:

```
[System Monitor] → [Save to DB] → [Console Output]
```

### 4. AI Text Analysis

Analyze sentiment of user feedback:

```
[Text Input] → [Sentiment Analyzer] → [Console Output]
                                   ↓
                           [Conditional]
                       ↙              ↘
            [Positive Action]   [Negative Action]
```

### 5. Resource Alert System

Alert when resources are high:

```
[System Monitor] → [Filter (CPU > 80%)] → [Webhook] → [Slack Notification]
```

## Windows Installer

### Creating the Installer

1. Install requirements:
```bash
pip install pyinstaller
```

2. Download [Inno Setup](https://jrsoftware.org/isdl.php)

3. Run the installer creator:
```bash
cd installer
python create_installer.py
```

4. The installer will be created as `PCUtilityBackend_Setup.exe`

### Installer Features

- Standalone executable (no Python required)
- Desktop and Start Menu shortcuts
- Auto-install to Program Files
- Includes all dependencies
- Uninstaller included

### Distribution

The installer includes:
- Backend executable
- AI models (downloaded on first run)
- SQLite database
- All required libraries

## Troubleshooting

### Backend Not Connecting

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Check if backend is running: `curl http://localhost:8765/health`
2. Verify port 8765 is not in use: `netstat -an | grep 8765`
3. Check firewall settings
4. Try restarting the backend

### GPU Not Detected

**Problem**: GPU monitoring not working

**Solutions**:
1. Install GPUtil: `pip install gputil`
2. Verify NVIDIA drivers: `nvidia-smi`
3. Check CUDA installation: `nvcc --version`
4. Restart the backend after installing GPU support

### AI Model Download Failed

**Problem**: Transformers model download fails

**Solutions**:
1. Check internet connection
2. Set Hugging Face cache: `export HF_HOME=/path/to/cache`
3. Manually download model:
```python
from transformers import pipeline
pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
```

### Database Locked Error

**Problem**: SQLite database locked

**Solutions**:
1. Close other connections to the database
2. Check file permissions
3. Delete `pc_utility.db-journal` if exists
4. Restart the backend

### Permission Errors When Cleaning

**Problem**: Access denied when cleaning files

**Solutions**:
1. Run with administrator privileges
2. Disable antivirus temporarily
3. Check file permissions
4. Use less aggressive cleaning options

### High Memory Usage

**Problem**: Backend using too much memory

**Solutions**:
1. Disable AI features if not needed
2. Use CPU instead of GPU for inference
3. Clear PyTorch cache regularly
4. Reduce update intervals
5. Limit database query sizes

### Port Already in Use

**Problem**: Port 8765 is already taken

**Solutions**:
1. Find and kill the process:
```bash
# Linux/Mac
lsof -ti:8765 | xargs kill -9

# Windows
netstat -ano | findstr :8765
taskkill /PID <PID> /F
```

2. Or change the port in `app.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8766)
```

And update the frontend addon:
```typescript
const BACKEND_URL = 'http://localhost:8766'
```

## Performance Tips

1. **Monitoring Intervals**: Use longer intervals (5-10s) for production
2. **GPU Usage**: Only enable GPU for AI tasks when needed
3. **Database Maintenance**: Regularly clean old metrics
4. **Batch Operations**: Process multiple items together
5. **Caching**: Cache frequently accessed data

## Security Considerations

1. **CORS**: Configure proper origins in production
2. **Authentication**: Add authentication for public deployments
3. **Input Validation**: All inputs are validated using Pydantic
4. **File Operations**: Safe file operations with proper permissions
5. **SQL Injection**: Parameterized queries prevent SQL injection

## Support

For issues or questions:

1. Check this documentation
2. Review example workflows
3. Check GitHub Issues
4. Create a new issue with:
   - Error message
   - System information
   - Steps to reproduce

## License

This project is part of the jimbo-node-system-v2 repository.

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Author**: Node'y Team
