@echo off
setlocal

:: Setze Arbeitsverzeichnis auf das Skript-Verzeichnis
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Prüfe ob node_modules existiert
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Running build...
call npm run build

if %ERRORLEVEL% equ 0 (
    echo.
    echo Build erfolgreich abgeschlossen!
) else (
    echo.
    echo Build fehlgeschlagen mit Fehlercode %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

endlocal