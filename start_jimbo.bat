@echo off
echo ==============================================
echo JIMBO_NODE_SYSTEM_V3 STARTUP SEQUENCE
echo ==============================================
cd /d Z:\jimbo-node-system-v2
start "JIMBO Vite Server" cmd /c "npm run dev"
start "JIMBO Python Backend" cmd /c "python chambers_backend\app.py"
echo Waiting for Vite to start...
timeout /t 5 /nobreak
start http://localhost:4120
