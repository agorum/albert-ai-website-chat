@echo off
call build.bat
setlocal enabledelayedexpansion

:: Set working directory to the script location
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Default values
set "EXAMPLES_DIR=%~1"
if "%EXAMPLES_DIR%"=="" set "EXAMPLES_DIR=examples"

if not defined PROXY_PORT set "PROXY_PORT=8010"
if not defined PROXY_TARGET set "PROXY_TARGET=https://www.agorum.com/albert/chat/"

:: Ensure the dist folder exists
if not exist "dist\" (
    echo Build folder not found. Running build.bat...
    if exist "build.bat" (
        call build.bat
    ) else (
        echo build.bat not found. Running npm run build...
        call npm run build
    )
)

echo.
echo Starting local CORS proxy for %PROXY_TARGET% on port %PROXY_PORT%...
echo.

:: Start CORS proxy in the background
start /b cmd /c "node scripts/cors-proxy.mjs "%PROXY_TARGET%" "%PROXY_PORT%""

:: Give the proxy a moment to boot
timeout /t 2 /nobreak >nul

:: Expose proxy endpoint to the environment
rem set "ALBERT_CHAT_PROXY_ENDPOINT=http://localhost:%PROXY_PORT%"
set "ALBERT_CHAT_PROXY_ENDPOINT=http://10.0.1.86:%PROXY_PORT%"

echo.
echo CORS proxy ready at http://localhost:%PROXY_PORT%
echo Starting dev server with examples from %EXAMPLES_DIR%...
echo.
echo Press Ctrl+C to stop (this will exit both servers)
echo.

:: Start dev server (runs until Ctrl+C)
node scripts/dev-server.mjs "%EXAMPLES_DIR%"

:: When the dev server stops, stop the proxy as well
echo.
echo Shutting down servers...
taskkill /f /fi "WINDOWTITLE eq *cors-proxy*" >nul 2>&1

endlocal
