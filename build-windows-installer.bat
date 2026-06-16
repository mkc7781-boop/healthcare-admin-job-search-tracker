@echo off
echo ============================================
echo  Build Windows Installer (.exe)
echo ============================================
echo.

cd /d "%~dp0installers\windows"

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed.
    pause
    exit /b 1
)

echo Installing build tools (first run may take a few minutes)...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

echo.
echo Building installer...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  INSTALLER READY
echo  Open this folder:
echo  installers\windows\dist
echo.
echo  Run the .exe to install like a normal Windows app.
echo ============================================
start "" "%~dp0installers\windows\dist"
pause