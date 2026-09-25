# PC Utility Backend Service

FastAPI backend service for the Node'y PC Utility Monitoring & Optimization System.

## Features

- **System Monitoring**: CPU, RAM, Disk, and Network usage
- **GPU Monitoring**: GPU statistics and temperature (requires GPUtil)
- **System Cleaning**: Temporary files, cache, logs, recycle bin
- **Memory Optimization**: Python GC, PyTorch cache clearing
- **Process Management**: List and sort running processes
- **AI Sentiment Analysis**: Text sentiment analysis using Hugging Face Transformers
- **Database Storage**: SQLite database for metrics storage

## Requirements

- Python 3.8 or higher
- pip (Python package manager)

### Optional Requirements

- **GPU Support**: NVIDIA GPU with CUDA toolkit
- **Windows Features**: Windows OS for recycle bin operations

## Installation

### Quick Setup

Run the setup script:

```bash
# Make the script executable (Linux/Mac)
chmod +x setup.sh

# Run setup
./setup.sh
```

### Manual Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
```

2. Activate the virtual environment:
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

## Running the Server

1. Activate the virtual environment (if not already activated):
```bash
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Start the server:
```bash
python app.py
```

The server will start on `http://localhost:8765`

## API Endpoints

### Health Check
- `GET /health` - Check service status and available features

### System Monitoring
- `POST /api/system/monitor` - Get current system metrics
- `GET /api/gpu/stats/{gpu_index}` - Get GPU statistics
- `GET /api/system/processes` - List running processes

### System Operations
- `POST /api/system/clean` - Clean temporary files and caches
- `POST /api/system/optimize-memory` - Optimize system memory

### AI Features
- `POST /api/ai/sentiment` - Analyze text sentiment

### Database
- `POST /api/db/save-metrics` - Save metrics to database
- `GET /api/db/metrics` - Retrieve stored metrics

## Configuration

The backend service runs on port `8765` by default. To change this, modify the port in `app.py`:

```python
uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")
```

## GPU Support

For GPU acceleration with AI models:

1. Install CUDA Toolkit (version compatible with PyTorch)
2. Install PyTorch with CUDA support:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

## Database

The service uses SQLite database (`pc_utility.db`) to store system metrics. The database is automatically created on first run.

### Schema

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
    gpu_info TEXT,
    data TEXT
)
```

## Troubleshooting

### ImportError: No module named 'GPUtil'

GPU monitoring is optional. The service will work without it but GPU features will be disabled.

To enable GPU monitoring:
```bash
pip install gputil
```

### ImportError: No module named 'transformers'

AI sentiment analysis is optional. Install with:
```bash
pip install transformers torch
```

### Port Already in Use

If port 8765 is already in use, change the port number in `app.py` or kill the process using the port:

```bash
# Linux/Mac
lsof -ti:8765 | xargs kill -9

# Windows
netstat -ano | findstr :8765
taskkill /PID <PID> /F
```

### Permission Errors When Cleaning Files

Some system files require administrator privileges. Run with elevated permissions:

```bash
# Linux/Mac
sudo python app.py

# Windows
# Run terminal as Administrator
python app.py
```

## Development

### CORS Configuration

The service allows all origins by default for local development. For production, modify the CORS settings in `app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Adding New Endpoints

1. Define request/response models using Pydantic
2. Add endpoint function with appropriate decorator
3. Implement logic and error handling
4. Update this README with endpoint documentation

## License

This project is part of the jimbo-node-system-v2 repository.

## Support

For issues or questions, please refer to the main project documentation or create an issue on GitHub.
