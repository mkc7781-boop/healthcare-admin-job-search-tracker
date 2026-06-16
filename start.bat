@echo off
echo ============================================
echo  Healthcare Admin Job Tracker
echo ============================================
echo.

cd /d "%~dp0"

set "CLOUD_URL=https://healthcare-admin-job-search-tracker.vercel.app"

REM Use cloud app when Supabase is not configured in .env.local
if not exist ".env.local" goto OPEN_CLOUD
findstr /R /C:"^NEXT_PUBLIC_SUPABASE_URL=https" ".env.local" >nul 2>&1
if errorlevel 1 goto OPEN_CLOUD
findstr /R /C:"^NEXT_PUBLIC_SUPABASE_ANON_KEY=" ".env.local" >nul 2>&1
if errorlevel 1 goto OPEN_CLOUD

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
echo Cloud sync enabled - starting local server at http://localhost:3000
echo Sign in with the same email/password you use on your phone.
echo Keep this window open. Press Ctrl+C to stop.
echo.
call npm run dev
pause
exit /b 0

:OPEN_CLOUD
echo Opening your cloud tracker (same data as your phone)...
echo %CLOUD_URL%
echo.
echo To run a local server with cloud sync instead, run configure-cloud.bat
echo.
start "" "%CLOUD_URL%"
pause
exit /b 0