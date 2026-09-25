import sqlite3
import os
import time
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="36 Chambers Data API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = r"V:\chambers\03_chroma\devz-kb\chroma.sqlite3"

class ChamberStatus(BaseModel):
    status: str
    embeddings: int
    collections: int
    db_size_mb: float
    timestamp: float

@app.get("/api/stats", response_model=ChamberStatus)
def get_stats():
    if not os.path.exists(DB_PATH):
        return {"status": "offline", "embeddings": 0, "collections": 0, "db_size_mb": 0, "timestamp": time.time()}
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM embeddings")
        total_embeddings = cursor.fetchone()[0]
        cursor.execute("SELECT count(*) FROM collections")
        total_collections = cursor.fetchone()[0]
        conn.close()
        db_size = os.path.getsize(DB_PATH) / (1024 * 1024)
        return {
            "status": "online",
            "embeddings": total_embeddings,
            "collections": total_collections,
            "db_size_mb": round(db_size, 2),
            "timestamp": time.time()
        }
    except Exception as e:
        return {"status": "error", "embeddings": 0, "collections": 0, "db_size_mb": 0, "timestamp": time.time()}

class CommandRequest(BaseModel):
    code: str
    language: str = 'powershell'
    workflowContext: bool = False

@app.post("/api/terminal/execute")
def execute_command(req: CommandRequest):
    try:
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", req.code],
            capture_output=True,
            text=True,
            shell=False
        )
        output = result.stdout
        if result.stderr:
            output += "\n" + result.stderr
        
        logs = [line for line in output.split("\n") if line.strip()]
        if not logs:
            logs = ["(no output)"]
            
        return {
            "status": "success" if result.returncode == 0 else "error",
            "logs": logs,
            "exit_code": result.returncode
        }
    except Exception as e:
        return {"status": "error", "logs": [str(e)], "exit_code": -1}

class FileWriteRequest(BaseModel):
    filepath: str
    content: str

@app.post("/api/fs/write")
def write_file(req: FileWriteRequest):
    try:
        path = req.filepath
        if not os.path.isabs(path):
            path = os.path.join(r"Z:\jimbo-node-system-v2\public", path)
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(req.content)
            
        return {"status": "success", "filepath": path}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7072)


