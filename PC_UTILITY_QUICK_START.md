# PC Utility Quick Start Guide

Get started with the PC Utility Monitoring & Optimization System in 5 minutes!

## Step 1: Enable the Addon (30 seconds)

1. Open Node'y workflow builder
2. Click the **Addons** button (puzzle icon) in the toolbar
3. Find "PC Utility Monitoring & Optimization" in the list
4. Toggle it to **Enabled** ✓
5. Close the Addons Manager

✅ The PC Utility nodes will now appear in the Node Palette under "PC Utility"

## Step 2: Start the Backend Service (2 minutes)

### Quick Start

```bash
# Navigate to the backend directory
cd pc_utility_backend

# Run the setup script
chmod +x setup.sh
./setup.sh

# Start the backend
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

python app.py
```

### What You'll See

```
====================================
PC Utility Backend Service
====================================
GPU Monitoring: ✓
AI Sentiment Analysis: ✓
Windows Shell Integration: ✓
====================================

Starting server on http://localhost:8765
Press CTRL+C to stop
```

✅ Backend is now running on `http://localhost:8765`

## Step 3: Create Your First Workflow (2 minutes)

### Option A: Use a Template

1. Click **Templates** in the toolbar
2. Look for PC Utility templates (coming soon)
3. Or manually create a workflow as shown below

### Option B: Manual Creation

1. **Drag nodes** from the Node Palette:
   - Drag "System Monitor" to the canvas
   - Drag "Console" node to the canvas

2. **Connect nodes**:
   - Click the output port of System Monitor
   - Connect it to the input port of Console

3. **Configure** (optional):
   - Click System Monitor to open configuration
   - Set update interval to 2 seconds
   - Enable GPU monitoring

4. **Execute**:
   - Click "Run Workflow" in the toolbar
   - Watch the console output show system metrics!

## Example Workflows

### 1. Basic Monitoring

```
[System Monitor] → [Console]
```

**What it does**: Shows real-time CPU, RAM, Disk, Network usage

---

### 2. System Cleanup

```
[System Cleaner] → [Console]
                ↓
        [Memory Optimizer]
```

**What it does**: Cleans temp files, clears cache, optimizes memory

---

### 3. GPU Monitoring

```
[GPU Monitor] → [Console]
```

**What it does**: Shows GPU utilization, memory, temperature

---

### 4. Sentiment Analysis

```
[Text Input] → [Sentiment Analyzer] → [Console]
```

**What it does**: Analyzes text sentiment using AI

---

### 5. Metrics Storage

```
[System Monitor] → [Save to DB] → [Console]
```

**What it does**: Monitors system and saves metrics to database

## Troubleshooting

### Backend Not Connected

**Problem**: Frontend shows "Backend not available" warning

**Solution**:
```bash
# Check if backend is running
curl http://localhost:8765/health

# If not running, start it:
cd pc_utility_backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

---

### Nodes Not Appearing

**Problem**: PC Utility nodes don't show in Node Palette

**Solution**:
1. Check Addons Manager - ensure addon is **Enabled**
2. Refresh the page (Ctrl+R / Cmd+R)
3. Clear browser cache if still not appearing

---

### GPU Not Detected

**Problem**: GPU monitoring shows null or errors

**Solution**:
```bash
# Install GPU support
pip install gputil

# Verify GPU drivers
nvidia-smi  # Should show your GPU

# Restart the backend
```

---

### AI Model Download Slow

**Problem**: First sentiment analysis is very slow

**Solution**: This is normal! The Hugging Face model downloads on first use (~500MB). Subsequent analyses will be instant.

---

### Permission Errors

**Problem**: "Permission denied" when cleaning files

**Solution**: Run backend with administrator/sudo privileges:
```bash
# Linux/Mac
sudo python app.py

# Windows (Run terminal as Administrator)
python app.py
```

## Next Steps

### Learn More

- **Full Documentation**: [docs/PC_UTILITY.md](../docs/PC_UTILITY.md)
- **Backend API**: [pc_utility_backend/README.md](../pc_utility_backend/README.md)
- **Workflow Templates**: [src/lib/PC_UTILITY_TEMPLATE.ts](../src/lib/PC_UTILITY_TEMPLATE.ts)

### Advanced Features

1. **Database Analytics**:
   - Store metrics over time
   - Query historical data
   - Export to CSV for analysis

2. **GPU Acceleration**:
   - Install CUDA toolkit
   - Enable GPU for AI models
   - Much faster sentiment analysis

3. **Automation**:
   - Schedule workflows with Delay nodes
   - Set up alerts with Webhook nodes
   - Create monitoring dashboards

4. **Windows Installer**:
   - Create standalone executable
   - Distribute to users without Python
   - See [installer/README.md](../installer/README.md)

## Common Use Cases

### 1. Performance Monitoring Dashboard

Monitor system performance in real-time:
- System metrics every 5 seconds
- Save to database
- Query and visualize trends

### 2. Automated Maintenance

Schedule regular system maintenance:
- Run cleaner every hour
- Optimize memory when RAM > 80%
- Alert via Slack when done

### 3. Content Moderation

Analyze user comments for sentiment:
- Process text input
- Detect negative sentiment
- Flag for manual review

### 4. Resource Alerts

Monitor and alert on high resource usage:
- Check CPU/RAM every minute
- Send webhook when > 90%
- Integrate with monitoring tools

## Tips & Best Practices

1. **Backend First**: Always start backend before using PC Utility nodes
2. **Monitoring Intervals**: Use 5-10s intervals for production (not 1s)
3. **Database Maintenance**: Clean old metrics periodically
4. **GPU Memory**: Clear cache after AI operations
5. **Error Handling**: Add retry logic for network operations

## Support

Need help? Check:
1. ✅ This quick start guide
2. ✅ Full documentation in [docs/PC_UTILITY.md](../docs/PC_UTILITY.md)
3. ✅ Backend logs in terminal
4. ✅ Browser console for frontend errors
5. ✅ GitHub Issues for bugs

---

**Ready to build amazing PC utility workflows? Let's go! 🚀**
