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

echo [1/4] Generating app icons...
call node scripts\generate-icons.mjs
if errorlevel 1 exit /b 1

call node scripts\apply-android-icons.mjs
if errorlevel 1 exit /b 1

echo [2/4] Ensuring Android SDK...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-android-sdk.ps1"
if errorlevel 1 exit /b 1

if not exist "%USERPROFILE%\.bubblewrap\android-sdk\bin" (
    mklink /J "%USERPROFILE%\.bubblewrap\android-sdk\bin" "%USERPROFILE%\.bubblewrap\android-sdk\cmdline-tools\latest\bin" >nul 2>&1
)

echo [3/4] Building signed APK...
cd installers\twa
set BUBBLEWRAP_KEYSTORE_PASSWORD=jobtracker2026
set BUBBLEWRAP_KEY_PASSWORD=jobtracker2026
call node scripts\build-apk-noninteractive.mjs
if errorlevel 1 exit /b 1

echo.
echo ============================================
echo  APK READY
echo  dist\Healthcare-Job-Tracker.apk
echo ============================================
start "" "%~dp0dist"
pause