@echo off
echo ============================================
echo  Verifying Job Tracker
echo ============================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Node.js not installed. Get it from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

if not exist "node_modules\" (
    echo [FAIL] Dependencies not installed. Run setup.bat first.
    pause
    exit /b 1
)
echo [OK] node_modules exists

echo.
echo Stopping any running servers...
taskkill /F /IM node.exe >nul 2>&1

echo Building...
call npm run build
if errorlevel 1 (
    echo [FAIL] Build failed.
    pause
    exit /b 1
)
echo [OK] Build passed

echo.
echo Starting server for test (wait 8 seconds)...
start "job-tracker-test" /MIN cmd /c "npm run dev"
ping -n 9 127.0.0.1 >nul

call npm run test:api
set TEST_RESULT=%errorlevel%

taskkill /F /IM node.exe >nul 2>&1

if %TEST_RESULT% neq 0 (
    echo [FAIL] Server test failed. Run start.bat manually and open http://localhost:3000
    pause
    exit /b 1
)

echo.
echo ============================================
echo  ALL CHECKS PASSED
echo  Double-click start.bat to use the app.
echo ============================================
pause