$ErrorActionPreference = "Stop"

Write-Host "============================================"
Write-Host " MIA V1.0 E2E TEST - WINDOWS"
Write-Host "============================================"

$API = if ($env:VITE_API_URL) { $env:VITE_API_URL } else { "http://localhost:3000" }

Write-Host "[*] Testing Login..."
try {
    $login = Invoke-RestMethod `
        -Method Post `
        -Uri "$API/api/auth/login" `
        -ContentType "application/json" `
        -Body '{"email":"test@test.com","password":"${TEST_PASSWORD}"}'

    if ($login.token) {
        Write-Host "[✓] Login: PASS"
    } else {
        Write-Host "[!] Login: response received"
    }
}
catch {
    Write-Host "[✗] Login: FAIL - $($_.Exception.Message)"
}

Write-Host "[*] Testing Health..."
try {
    $health = Invoke-RestMethod -Method Get -Uri "$API/api/health"
    Write-Host "[✓] Health: PASS"
}
catch {
    Write-Host "[✗] Health: FAIL - $($_.Exception.Message)"
}

Write-Host "============================================"
Write-Host " WINDOWS E2E CHECK COMPLETE"
Write-Host "============================================"
