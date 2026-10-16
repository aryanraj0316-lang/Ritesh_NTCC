# Dastaan Heritage Kitchen - PowerShell Launcher
$ErrorActionPreference = "SilentlyContinue"

Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "          DASTAAN HERITAGE KITCHEN - SYSTEM LAUNCHER" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/3] Starting Backend API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$scriptDir\server`" && npm run dev" -WindowStyle Normal

Write-Host "[2/3] Starting Frontend Web Application (Port 5173)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$scriptDir\client`" && npm run dev" -WindowStyle Normal

Write-Host "[3/3] Waiting for servers to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 4

Write-Host ""
Write-Host "Opening Dastaan Heritage Kitchen in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/"

Write-Host ""
Write-Host "System is active! Press Enter to close this launcher..." -ForegroundColor Gray
Read-Host
