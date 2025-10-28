@echo off
setlocal

:: Set working directory to the script location
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Ensure dependencies are installed
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Running build...
call npm run build

if %ERRORLEVEL% equ 0 (
    echo.
    echo Build completed successfully.
) else (
    echo.
    echo Build failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

endlocal
