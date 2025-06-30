#!/bin/bash

# SmartStudy Copilot - Quick Start Script

echo "🚀 SmartStudy Copilot - Quick Start"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully."
else
    echo "❌ Failed to install dependencies."
    exit 1
fi

# Create uploads directory
if [ ! -d uploads ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
    echo "✅ Uploads directory created."
fi

# Create study materials directory
if [ ! -d uploads/study-materials ]; then
    echo "📁 Creating study materials directory..."
    mkdir -p uploads/study-materials
    echo "✅ Study materials directory created."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your OpenAI API key"
echo "2. Run 'npm start' to start the server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Available commands:"
echo "  npm start     - Start the production server"
echo "  npm run dev   - Start the development server with auto-reload"
echo "  node test-api.js - Run API tests"
echo ""
echo "Features:"
echo "  📚 Multi-level AI tutoring (kid, high-school, advanced)"
echo "  🧠 Personalized quiz generation"
echo "  📖 Study materials management"
echo "  📊 Progress tracking and analytics"
echo "  👨‍👩‍👧‍👦 Parent updates and insights"
echo ""
echo "Happy learning! 🎓" 