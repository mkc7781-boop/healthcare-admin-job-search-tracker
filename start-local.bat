@echo off
echo ============================================
echo  Healthcare Admin Job Tracker (LOCAL ONLY)
echo ============================================
echo.
echo WARNING: Data stays on this computer only.
echo For phone sync, use start.bat instead.
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed.
    echo Download it from https://nodejs.org/ and run setup.bat first.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo node_modules not found. Running setup first...
    call setup.bat
)

echo Stopping any old servers on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo.
echo Starting LOCAL app at http://localhost:3000
echo Keep this window open. Press Ctrl+C to stop.
echo.
call npm run dev
pause