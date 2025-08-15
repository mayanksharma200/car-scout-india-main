#!/bin/bash

# Start development servers for car marketplace

echo "🚀 Starting Car Marketplace Development Environment"
echo "================================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

echo "🔧 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo "📍 Frontend: http://localhost:8080"
echo "📍 Backend: http://localhost:3001"
echo "📍 Backend Health: http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
