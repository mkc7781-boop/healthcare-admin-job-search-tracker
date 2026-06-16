@echo off
echo ============================================
echo  Build Android APK
echo ============================================
echo.
echo Requires Android Studio (one-time install).
echo Download: https://developer.android.com/studio
echo.

cd /d "%~dp0installers\android"

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed.
    pause
    exit /b 1
)

echo Installing Capacitor tools...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

if not exist "android\" (
    echo Creating Android project (first time only)...
    call npx cap add android
    if errorlevel 1 (
        echo ERROR: Could not create Android project.
        pause
        exit /b 1
    )
)

if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Android\Android Studio\jbr\" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
        echo Using JAVA_HOME=%JAVA_HOME%
    ) else (
        echo.
        echo ERROR: JAVA_HOME is not set and Android Studio JDK was not found.
        echo Install Android Studio, then run this script again.
        pause
        exit /b 1
    )
)

if "%ANDROID_HOME%"=="" (
    if exist "%LOCALAPPDATA%\Android\Sdk\" (
        set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
        set "PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%"
        echo Using ANDROID_HOME=%ANDROID_HOME%
    )
)

echo.
echo Building APK...
call npm run build
if errorlevel 1 (
    echo ERROR: APK build failed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  APK READY
echo  Copy app-debug.apk to your phone and open it.
echo  Path:
echo  installers\android\android\app\build\outputs\apk\debug\app-debug.apk
echo ============================================
start "" "%~dp0installers\android\android\app\build\outputs\apk\debug"
pause