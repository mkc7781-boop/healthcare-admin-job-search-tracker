@echo off
echo ============================================
echo  Build Android APK (no Android Studio)
echo ============================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed.
    pause
    exit /b 1
)

echo [1/4] Generating icons...
call node scripts\generate-icons.mjs
if errorlevel 1 exit /b 1

echo [2/4] Installing Bubblewrap...
cd installers\twa
call npm install @bubblewrap/cli --no-save
if errorlevel 1 exit /b 1

echo [3/4] Generating Android project...
call npx bubblewrap update --manifest .
if errorlevel 1 exit /b 1

echo [4/4] Building APK (first run may download Android tools)...
set BUBBLEWRAP_KEYSTORE_PASSWORD=jobtracker2026
set BUBBLEWRAP_KEY_PASSWORD=jobtracker2026
call npx bubblewrap build --manifest . --skipPwaValidation
if errorlevel 1 exit /b 1

echo.
echo ============================================
echo  APK READY
echo  %CD%\app-release-signed.apk
echo ============================================
copy /Y app-release-signed.apk "..\..\dist\Healthcare-Job-Tracker.apk" >nul 2>&1
if exist "..\..\dist\Healthcare-Job-Tracker.apk" (
    echo Also copied to: dist\Healthcare-Job-Tracker.apk
)
start "" "%CD%"
pause