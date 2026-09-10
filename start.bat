@echo off
echo ============================================
echo  Healthcare Admin Job Tracker
echo ============================================
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

set "CLOUD_SYNC="
if exist ".env.local" (
    findstr /R /C:"^NEXT_PUBLIC_SUPABASE_URL=https" ".env.local" >nul 2>&1
    if not errorlevel 1 (
        findstr /R /C:"^NEXT_PUBLIC_SUPABASE_ANON_KEY=" ".env.local" >nul 2>&1
        if not errorlevel 1 set "CLOUD_SYNC=1"
    )
)

echo.
if defined CLOUD_SYNC (
    echo Cloud sync enabled - starting local server at http://localhost:3000
    echo Sign in with the same email/password you use on your phone.
) else (
    echo Starting local tracker at http://localhost:3000
    echo Add and remove as many jobs as you need. Data is saved in this folder.
    echo Optional phone sync: run configure-cloud.bat
)
echo Keep this window open. Press Ctrl+C to stop.
echo Then open http://localhost:3000
echo.
call npm run dev
pause
exit /b 0