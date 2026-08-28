$ErrorActionPreference = "Stop"

Write-Host "============================================"
Write-Host " MIA PRO - WINDOWS INSTALL"
Write-Host "============================================"

Set-Location $PSScriptRoot

Write-Host "[1/3] Installing Node dependencies..."
npm ci

Write-Host "[2/3] Generating Prisma client..."
npx prisma generate

Write-Host "[3/3] Installation complete."
Write-Host ""
Write-Host "Run .\start-windows.ps1 to start MIA."
