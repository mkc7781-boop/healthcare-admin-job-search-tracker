@echo off
echo ============================================
echo  Configure Cloud Sync (optional)
echo ============================================
echo.
echo This lets start.bat run a local server that syncs
echo with your phone via Supabase.
echo.
echo You need the same keys already saved in Vercel.
echo.

cd /d "%~dp0"

set /p SUPABASE_URL=Paste NEXT_PUBLIC_SUPABASE_URL: 
set /p SUPABASE_ANON=Paste NEXT_PUBLIC_SUPABASE_ANON_KEY: 
set /p SUPABASE_SERVICE=Paste SUPABASE_SERVICE_ROLE_KEY: 
set /p TRACKER_USER=Paste TRACKER_OWNER_USER_ID (from Supabase -^> Users): 

if "%SUPABASE_URL%"=="" (
    echo ERROR: URL is required.
    pause
    exit /b 1
)
if "%SUPABASE_ANON%"=="" (
    echo ERROR: Anon/publishable key is required.
    pause
    exit /b 1
)

(
echo # Cloud sync - configured by configure-cloud.bat
echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL%
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_ANON%
echo SUPABASE_SERVICE_ROLE_KEY=%SUPABASE_SERVICE%
echo TRACKER_OWNER_USER_ID=%TRACKER_USER%
) > .env.local

echo.
echo Saved .env.local
echo.
echo Optional: upload local leads from data/leads.json to the cloud?
set /p MIGRATE=Run migrate now? (y/n): 
if /i "%MIGRATE%"=="y" (
    call npm run migrate:cloud
)

echo.
echo Done. Double-click start.bat to run with cloud sync.
pause