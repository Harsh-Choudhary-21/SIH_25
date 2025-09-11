#!/bin/bash

# FRA Atlas WebGIS - Local Development Startup Script
echo "🚀 Starting FRA Atlas WebGIS Local Development Environment"
echo ""

# Check if Node.js is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed. Please install Python 3.x first."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd frontend && npm install

echo ""
echo "📦 Installing backend dependencies..."
cd ../backend && pip install -r requirements.txt

echo ""
echo "✅ Setup complete! Starting services..."
echo ""
echo "🔧 Backend API will run on: http://localhost:8000"
echo "🌐 Frontend will run on: http://localhost:5000"
echo ""
echo "📋 Available API Endpoints:"
echo "   - POST /upload/     - Upload documents"
echo "   - GET  /claims/     - List claims"
echo "   - GET  /map/        - Get map data"
echo "   - GET  /recommend/{id} - Get recommendations"
echo "   - GET  /docs        - API documentation"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start backend in background
echo "🚀 Starting Backend API..."
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🚀 Starting Frontend..."
cd ../frontend && npm run dev

# Cleanup on exit
trap "echo 'Stopping services...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM