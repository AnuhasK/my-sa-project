# Quick Backend Restart and Test Script
Write-Host "=== BACKEND RESTART REQUIRED ===" -ForegroundColor Yellow
Write-Host ""

# Check current backend process
$process = Get-Process -Name "AuctionHouse.Api" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "Current backend process:" -ForegroundColor Cyan
    Write-Host "  PID: $($process.Id)"
    Write-Host "  Started: $($process.StartTime)"
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "1. Stop the backend (Ctrl+C in the terminal running it)"
    Write-Host "2. Run: dotnet run --project AuctionHouse.Api"
    Write-Host "3. Wait for 'Now listening on: http://localhost:5021'"
    Write-Host "4. Run this test script again"
    Write-Host ""
    
    $response = Read-Host "Has the backend been restarted? (y/n)"
    if ($response -ne 'y') {
        Write-Host "Please restart the backend first" -ForegroundColor Red
        exit
    }
}

Write-Host "Testing if new code is loaded..." -ForegroundColor Cyan

# Login as admin
$body = @{
    email = "admin@local"
    password = "Admin@123"
} | ConvertTo-Json

$adminResp = Invoke-RestMethod -Uri "http://localhost:5021/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$adminToken = $adminResp.token

# Create test auction
$auctionBody = @{
    title = "Restart Test Auction"
    description = "Testing after restart"
    startPrice = 100.00
    startTime = (Get-Date).AddMinutes(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    endTime = (Get-Date).AddHours(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    categoryId = 1
} | ConvertTo-Json

Write-Host "Creating test auction..." -ForegroundColor Cyan
$auction = Invoke-RestMethod -Uri "http://localhost:5021/api/auctions" -Method POST -Body $auctionBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "  Auction ID: $($auction.id), Status: $($auction.status)" -ForegroundColor Green

# Register/login buyer
$buyerBody = @{
    username = "quicktest"
    email = "quicktest@test.com"
    password = "Test@123"
} | ConvertTo-Json

try {
    $buyerResp = Invoke-RestMethod -Uri "http://localhost:5021/api/auth/register" -Method POST -Body $buyerBody -ContentType "application/json"
}
catch {
    $loginBody = @{
        email = "quicktest@test.com"
        password = "Test@123"
    } | ConvertTo-Json
    $buyerResp = Invoke-RestMethod -Uri "http://localhost:5021/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
}

$buyerToken = $buyerResp.token
Write-Host "  Buyer logged in (ID: $($buyerResp.userId))" -ForegroundColor Green

# Try to place bid
$bidBody = @{
    auctionId = $auction.id
    amount = 150.00
} | ConvertTo-Json

Write-Host "Attempting to place bid..." -ForegroundColor Cyan
try {
    $bid = Invoke-RestMethod -Uri "http://localhost:5021/api/bids" -Method POST -Body $bidBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $buyerToken" }
    Write-Host "SUCCESS! Bid placed for $($bid.amount)" -ForegroundColor Green
    Write-Host ""
    Write-Host "The fix is working! You can now run the full test suite:" -ForegroundColor Green
    Write-Host "  .\test-transactions.ps1" -ForegroundColor Cyan
}
catch {
    Write-Host "FAILED: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "The backend may not have been restarted with the new code." -ForegroundColor Yellow
    Write-Host "Please ensure you:" -ForegroundColor Yellow
    Write-Host "1. Stopped the old backend process" -ForegroundColor Yellow
    Write-Host "2. Ran 'dotnet run --project AuctionHouse.Api'" -ForegroundColor Yellow
    Write-Host "3. Waited for it to fully start" -ForegroundColor Yellow
}
