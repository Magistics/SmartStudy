@echo off
REM SmartStudy Copilot - Quick Start Script for Windows

echo 🚀 SmartStudy Copilot - Quick Start
echo ====================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14 or higher.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% LSS 14 (
    echo ❌ Node.js version 14 or higher is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ npm version: 
npm --version

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created. Please update it with your configuration.
) else (
    echo ✅ .env file already exists.
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully.
) else (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

REM Create uploads directory
if not exist uploads (
    echo 📁 Creating uploads directory...
    mkdir uploads
    echo ✅ Uploads directory created.
)

REM Create study materials directory
if not exist uploads\study-materials (
    echo 📁 Creating study materials directory...
    mkdir uploads\study-materials
    echo ✅ Study materials directory created.
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update the .env file with your OpenAI API key
echo 2. Run 'npm start' to start the server
echo 3. Open http://localhost:3000 in your browser
echo.
echo Available commands:
echo   npm start     - Start the production server
echo   npm run dev   - Start the development server with auto-reload
echo   node test-api.js - Run API tests
echo.
echo Features:
echo   📚 Multi-level AI tutoring (kid, high-school, advanced)
echo   🧠 Personalized quiz generation
echo   📖 Study materials management
echo   📊 Progress tracking and analytics
echo   👨‍👩‍👧‍👦 Parent updates and insights
echo.
echo Happy learning! 🎓
pause 