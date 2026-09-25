"""
PC Utility Backend Service
FastAPI backend for Node'y PC utility monitoring and optimization system

This service provides:
- System monitoring (CPU, RAM, Disk, Network)
- GPU monitoring and statistics
- System cleaning and optimization
- Memory optimization
- Process management
- AI-powered sentiment analysis
- Database integration for metrics storage

Author: Node'y Team
Version: 1.0.0
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import psutil
import platform
import gc
import sqlite3
import json
from datetime import datetime
import sys

# Optional dependencies with graceful fallback
try:
    import GPUtil
    GPU_AVAILABLE = True
except ImportError:
    GPU_AVAILABLE = False
    print("Warning: GPUtil not available. GPU monitoring disabled.")

try:
    import torch
    from transformers import pipeline
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("Warning: transformers/torch not available. AI features disabled.")

try:
    if platform.system() == 'Windows':
        import winshell
        WINSHELL_AVAILABLE = True
    else:
        WINSHELL_AVAILABLE = False
except ImportError:
    WINSHELL_AVAILABLE = False

# Initialize FastAPI app
app = FastAPI(
    title="PC Utility Backend",
    description="Backend service for Node'y PC utility system",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sentiment analyzer (lazy loading)
sentiment_analyzer = None

# Database initialization
DB_FILE = "pc_utility.db"

def init_database():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_metrics (
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
            gpu_info TEXT,
            data TEXT
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# ==================== REQUEST/RESPONSE MODELS ====================

class SystemMonitorRequest(BaseModel):
    include_gpu: bool = True

class SystemCleanRequest(BaseModel):
    clean_temp: bool = True
    clear_cache: bool = True
    clean_logs: bool = False
    empty_recycle_bin: bool = False

class MemoryOptimizeRequest(BaseModel):
    aggressive: bool = False
    clear_page_file: bool = False

class SentimentAnalysisRequest(BaseModel):
    text: str
    model: str = "transformers"
    use_gpu: bool = False

class SaveMetricsRequest(BaseModel):
    metrics: Dict[str, Any]
    table_name: str = "system_metrics"

# ==================== HELPER FUNCTIONS ====================

def get_gpu_info() -> Optional[List[Dict[str, Any]]]:
    """Get GPU information using GPUtil"""
    if not GPU_AVAILABLE:
        return None
    
    try:
        gpus = GPUtil.getGPUs()
        gpu_list = []
        
        for gpu in gpus:
            gpu_list.append({
                "id": gpu.id,
                "name": gpu.name,
                "load": round(gpu.load * 100, 2),
                "memory_used": round(gpu.memoryUsed, 2),
                "memory_total": round(gpu.memoryTotal, 2),
                "memory_percent": round((gpu.memoryUsed / gpu.memoryTotal) * 100, 2),
                "temperature": gpu.temperature,
            })
        
        return gpu_list
    except Exception as e:
        print(f"Error getting GPU info: {e}")
        return None

def bytes_to_gb(bytes_value: int) -> float:
    """Convert bytes to gigabytes"""
    return round(bytes_value / (1024 ** 3), 2)

def bytes_to_mb(bytes_value: int) -> float:
    """Convert bytes to megabytes"""
    return round(bytes_value / (1024 ** 2), 2)

# ==================== API ENDPOINTS ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "PC Utility Backend",
        "version": "1.0.0",
        "features": {
            "gpu_monitoring": GPU_AVAILABLE,
            "ai_sentiment": AI_AVAILABLE,
            "windows_shell": WINSHELL_AVAILABLE,
        }
    }

@app.post("/api/system/monitor")
async def monitor_system(request: SystemMonitorRequest):
    """Get current system metrics"""
    try:
        # CPU Information
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        # Memory Information
        memory = psutil.virtual_memory()
        
        # Disk Information
        disk = psutil.disk_usage('/')
        
        # Network Information
        net_io = psutil.net_io_counters()
        
        result = {
            "cpu": {
                "percent": round(cpu_percent, 2),
                "count": cpu_count,
                "frequency": {
                    "current": round(cpu_freq.current, 2) if cpu_freq else None,
                    "min": round(cpu_freq.min, 2) if cpu_freq else None,
                    "max": round(cpu_freq.max, 2) if cpu_freq else None,
                }
            },
            "memory": {
                "total_gb": bytes_to_gb(memory.total),
                "used_gb": bytes_to_gb(memory.used),
                "available_gb": bytes_to_gb(memory.available),
                "percent": round(memory.percent, 2),
            },
            "disk": {
                "total_gb": bytes_to_gb(disk.total),
                "used_gb": bytes_to_gb(disk.used),
                "free_gb": bytes_to_gb(disk.free),
                "percent": round(disk.percent, 2),
            },
            "network": {
                "bytes_sent_mb": bytes_to_mb(net_io.bytes_sent),
                "bytes_recv_mb": bytes_to_mb(net_io.bytes_recv),
                "packets_sent": net_io.packets_sent,
                "packets_recv": net_io.packets_recv,
            },
            "system": {
                "platform": platform.system(),
                "platform_release": platform.release(),
                "platform_version": platform.version(),
                "architecture": platform.machine(),
                "processor": platform.processor(),
            }
        }
        
        # Add GPU info if requested
        if request.include_gpu:
            result["gpu"] = get_gpu_info()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error monitoring system: {str(e)}")

@app.get("/api/gpu/stats/{gpu_index}")
async def get_gpu_stats(gpu_index: int):
    """Get detailed GPU statistics"""
    if not GPU_AVAILABLE:
        raise HTTPException(status_code=503, detail="GPU monitoring not available. Install GPUtil package.")
    
    try:
        gpus = GPUtil.getGPUs()
        
        if gpu_index >= len(gpus):
            raise HTTPException(status_code=404, detail=f"GPU {gpu_index} not found")
        
        gpu = gpus[gpu_index]
        
        return {
            "id": gpu.id,
            "name": gpu.name,
            "uuid": gpu.uuid,
            "load": round(gpu.load * 100, 2),
            "memory": {
                "used_mb": round(gpu.memoryUsed, 2),
                "total_mb": round(gpu.memoryTotal, 2),
                "free_mb": round(gpu.memoryFree, 2),
                "percent": round((gpu.memoryUsed / gpu.memoryTotal) * 100, 2),
            },
            "temperature": gpu.temperature,
            "driver": gpu.driver,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting GPU stats: {str(e)}")

@app.post("/api/system/clean")
async def clean_system(request: SystemCleanRequest):
    """Clean system temporary files and caches"""
    try:
        results = {
            "cleaned": [],
            "freed_space_mb": 0,
            "files_removed": 0,
        }
        
        # Clean temporary files
        if request.clean_temp:
            import tempfile
            import os
            import shutil
            
            temp_dir = tempfile.gettempdir()
            temp_files = 0
            temp_size = 0
            
            try:
                for item in os.listdir(temp_dir):
                    item_path = os.path.join(temp_dir, item)
                    try:
                        if os.path.isfile(item_path):
                            size = os.path.getsize(item_path)
                            os.unlink(item_path)
                            temp_files += 1
                            temp_size += size
                        elif os.path.isdir(item_path):
                            size = sum(os.path.getsize(os.path.join(dirpath, filename))
                                     for dirpath, dirnames, filenames in os.walk(item_path)
                                     for filename in filenames)
                            shutil.rmtree(item_path)
                            temp_files += 1
                            temp_size += size
                    except (PermissionError, OSError):
                        pass
                
                results["cleaned"].append("temporary files")
                results["freed_space_mb"] += bytes_to_mb(temp_size)
                results["files_removed"] += temp_files
            except Exception as e:
                print(f"Error cleaning temp files: {e}")
        
        # Clear Python garbage collection
        if request.clear_cache:
            collected = gc.collect()
            results["cleaned"].append("python cache")
            results["gc_collected"] = collected
        
        # Empty recycle bin (Windows only)
        if request.empty_recycle_bin and WINSHELL_AVAILABLE:
            try:
                winshell.recycle_bin().empty(confirm=False, show_progress=False, sound=False)
                results["cleaned"].append("recycle bin")
            except Exception as e:
                print(f"Error emptying recycle bin: {e}")
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning system: {str(e)}")

@app.post("/api/system/optimize-memory")
async def optimize_memory(request: MemoryOptimizeRequest):
    """Optimize system memory"""
    try:
        # Get memory stats before optimization
        memory_before = psutil.virtual_memory()
        
        # Python garbage collection
        gc.collect()
        
        # Clear PyTorch cache if available and aggressive mode enabled
        if request.aggressive and AI_AVAILABLE:
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        
        # Get memory stats after optimization
        memory_after = psutil.virtual_memory()
        
        freed_mb = bytes_to_mb(memory_before.used - memory_after.used)
        
        return {
            "before": {
                "used_gb": bytes_to_gb(memory_before.used),
                "percent": round(memory_before.percent, 2),
            },
            "after": {
                "used_gb": bytes_to_gb(memory_after.used),
                "percent": round(memory_after.percent, 2),
            },
            "freed_mb": round(freed_mb, 2),
            "aggressive": request.aggressive,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error optimizing memory: {str(e)}")

@app.get("/api/system/processes")
async def get_processes(sort_by: str = "cpu", limit: int = 10):
    """Get list of running processes"""
    try:
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status']):
            try:
                proc_info = proc.info
                processes.append({
                    "pid": proc_info['pid'],
                    "name": proc_info['name'],
                    "cpu_percent": round(proc_info['cpu_percent'] or 0, 2),
                    "memory_percent": round(proc_info['memory_percent'] or 0, 2),
                    "status": proc_info['status'],
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Sort processes
        if sort_by == "cpu":
            processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
        elif sort_by == "memory":
            processes.sort(key=lambda x: x['memory_percent'], reverse=True)
        elif sort_by == "name":
            processes.sort(key=lambda x: x['name'])
        
        # Limit results
        processes = processes[:limit]
        
        return {
            "processes": processes,
            "total_count": len(processes),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting processes: {str(e)}")

@app.post("/api/ai/sentiment")
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """Analyze text sentiment using AI models"""
    if not AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI features not available. Install transformers and torch packages.")
    
    try:
        global sentiment_analyzer
        
        # Initialize sentiment analyzer if not already done
        if sentiment_analyzer is None:
            device = 0 if (request.use_gpu and torch.cuda.is_available()) else -1
            sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=device
            )
        
        # Analyze sentiment
        result = sentiment_analyzer(request.text[:512])  # Limit text length
        
        return {
            "sentiment": result[0]['label'],
            "score": round(result[0]['score'], 4),
            "confidence": round(result[0]['score'] * 100, 2),
            "model": request.model,
            "gpu_used": request.use_gpu and torch.cuda.is_available(),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sentiment: {str(e)}")

@app.post("/api/db/save-metrics")
async def save_metrics(request: SaveMetricsRequest):
    """Save metrics to database"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        metrics = request.metrics
        timestamp = datetime.now().isoformat()
        
        # Extract key metrics
        cpu_percent = metrics.get('cpu', {}).get('percent')
        ram_data = metrics.get('memory', {})
        disk_data = metrics.get('disk', {})
        network_data = metrics.get('network', {})
        gpu_info = json.dumps(metrics.get('gpu'))
        
        cursor.execute("""
            INSERT INTO system_metrics (
                timestamp, cpu_percent, ram_percent, ram_used_gb, ram_total_gb,
                disk_percent, disk_used_gb, disk_total_gb,
                network_sent_mb, network_recv_mb, gpu_info, data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            timestamp,
            cpu_percent,
            ram_data.get('percent'),
            ram_data.get('used_gb'),
            ram_data.get('total_gb'),
            disk_data.get('percent'),
            disk_data.get('used_gb'),
            disk_data.get('total_gb'),
            network_data.get('bytes_sent_mb'),
            network_data.get('bytes_recv_mb'),
            gpu_info,
            json.dumps(metrics)
        ))
        
        conn.commit()
        record_id = cursor.lastrowid
        conn.close()
        
        return {
            "success": True,
            "record_id": record_id,
            "timestamp": timestamp,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving metrics: {str(e)}")

@app.get("/api/db/metrics")
async def get_metrics(limit: int = 100, offset: int = 0):
    """Retrieve stored metrics from database"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, timestamp, cpu_percent, ram_percent, disk_percent, data
            FROM system_metrics
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        
        rows = cursor.fetchall()
        
        metrics = []
        for row in rows:
            metrics.append({
                "id": row[0],
                "timestamp": row[1],
                "cpu_percent": row[2],
                "ram_percent": row[3],
                "disk_percent": row[4],
                "data": json.loads(row[5]) if row[5] else None,
            })
        
        cursor.execute("SELECT COUNT(*) FROM system_metrics")
        total_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "metrics": metrics,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving metrics: {str(e)}")

# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("PC Utility Backend Service")
    print("=" * 60)
    print(f"GPU Monitoring: {'✓' if GPU_AVAILABLE else '✗'}")
    print(f"AI Sentiment Analysis: {'✓' if AI_AVAILABLE else '✗'}")
    print(f"Windows Shell Integration: {'✓' if WINSHELL_AVAILABLE else '✗'}")
    print("=" * 60)
    print("\nStarting server on http://localhost:8765")
    print("Press CTRL+C to stop\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")
