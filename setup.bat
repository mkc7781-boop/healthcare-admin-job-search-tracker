@echo off
echo ============================================
echo  Healthcare Admin Job Tracker - SETUP
echo ============================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed.
    echo Download it from https://nodejs.org/ and run this again.
    pause
    exit /b 1
)

echo Stopping any old servers...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

echo.
echo Verifying build...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed. Copy the error above and share it.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  SETUP COMPLETE
echo  Double-click start.bat to run the app.
echo ============================================
pause