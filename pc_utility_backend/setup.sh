#!/bin/bash
# PC Utility Backend Setup Script
# This script sets up the Python environment and installs dependencies

echo "======================================"
echo "PC Utility Backend Setup"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "Python version:"
python3 --version
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created"
else
    echo "Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo ""

echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "To start the backend service:"
echo "  1. Activate the virtual environment:"
echo "     source venv/bin/activate  (Linux/Mac)"
echo "     venv\\Scripts\\activate     (Windows)"
echo ""
echo "  2. Run the server:"
echo "     python app.py"
echo ""
echo "The server will be available at:"
echo "  http://localhost:8765"
echo ""
echo "For GPU support, ensure you have:"
echo "  - NVIDIA GPU with CUDA support"
echo "  - CUDA Toolkit installed"
echo "  - PyTorch with CUDA support"
echo ""
