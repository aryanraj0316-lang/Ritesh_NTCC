@echo off
title Dastaan Heritage Kitchen - System Launcher
color 0A

echo =====================================================================
echo           DASTAAN HERITAGE KITCHEN - SYSTEM LAUNCHER
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend API Server (Port 5000)...
start "Dastaan Backend Server [Port 5000]" cmd /c "cd /d "%~dp0server" && npm run dev"

echo [2/3] Starting Frontend Web Application (Port 5173)...
start "Dastaan Frontend Client [Port 5173]" cmd /c "cd /d "%~dp0client" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Launching Dastaan Heritage Kitchen in your browser...
start http://localhost:5173/

echo.
echo =====================================================================
echo                   SYSTEM RUNNING SUCCESSFULLY
echo =====================================================================
echo.
echo   Customer Storefront:      http://localhost:5173/
echo   Admin Operations Portal:  http://localhost:5173/admin
echo   Backend REST API:         http://localhost:5000/api
echo.
echo   Seeded Admin Credentials:
echo     Email:    admin@dastaan.com
echo     Password: Admin@12345
echo.
echo   Seeded Customer Account:
echo     Email:    rahul.sharma@example.com
echo     Password: Customer@123
echo.
echo =====================================================================
echo Press any key or close this window to exit launcher.
echo (The server windows will continue running in the background)
echo =====================================================================
pause >nul
