@echo off
call build.bat
setlocal enabledelayedexpansion

:: Setze Arbeitsverzeichnis auf das Skript-Verzeichnis
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Setze Standard-Werte
set "EXAMPLES_DIR=%~1"
if "%EXAMPLES_DIR%"=="" set "EXAMPLES_DIR=examples"

if not defined PROXY_PORT set "PROXY_PORT=8010"
if not defined PROXY_TARGET set "PROXY_TARGET=https://www.agorum.com/albert/chat/"

:: Prüfe ob dist-Ordner existiert
if not exist "dist\" (
    echo Build-Ordner nicht gefunden. Starte build.bat ...
    if exist "build.bat" (
        call build.bat
    ) else (
        echo build.bat nicht gefunden. Fuehre npm run build aus...
        call npm run build
    )
)

echo.
echo Starte lokalen CORS-Proxy fuer %PROXY_TARGET% auf Port %PROXY_PORT% ...
echo.

:: Starte CORS-Proxy im Hintergrund
start /b cmd /c "node scripts/cors-proxy.mjs "%PROXY_TARGET%" "%PROXY_PORT%""

:: Warte kurz, damit der Proxy hochfahren kann
timeout /t 2 /nobreak >nul

:: Setze Umgebungsvariable für den Proxy-Endpoint
set "ALBERT_CHAT_PROXY_ENDPOINT=http://localhost:%PROXY_PORT%"

echo.
echo CORS-Proxy laeuft auf http://localhost:%PROXY_PORT%
echo Starte Dev-Server mit Examples aus %EXAMPLES_DIR% ...
echo.
echo Druecke Strg+C zum Beenden (beendet beide Server)
echo.

:: Starte Dev-Server (dieser blockiert und wartet auf Strg+C)
node scripts/dev-server.mjs "%EXAMPLES_DIR%"

:: Wenn Dev-Server beendet wird, beende auch den Proxy
echo.
echo Beende Server...
taskkill /f /fi "WINDOWTITLE eq *cors-proxy*" >nul 2>&1

endlocal