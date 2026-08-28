$ErrorActionPreference = "Stop"

Write-Host "============================================"
Write-Host " MIA PRO - WINDOWS START"
Write-Host "============================================"

Set-Location $PSScriptRoot

Write-Host "[1/3] Checking Node.js..."
node --version

Write-Host "[2/3] Checking npm..."
npm --version

Write-Host "[3/3] Starting MIA backend..."
npm start
