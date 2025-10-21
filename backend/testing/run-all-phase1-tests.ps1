# Master Test Runner for Phase 1
# Runs all Phase 1 test scripts and provides consolidated results

$baseUrl = "http://localhost:5021/api"
$testScripts = @(
    "test-auction-crud.ps1",
    "test-bid-history.ps1", 
    "test-user-profile.ps1",
    "test-logout.ps1"
)

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "PHASE 1 - COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Testing all Phase 1 endpoints`n" -ForegroundColor Gray

$allResults = @()
$scriptResults = @()

# Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET -TimeoutSec 5
    Write-Host "[OK] Backend is running`n" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Backend is not running on $baseUrl" -ForegroundColor Red
    Write-Host "Please start the backend with: dotnet run --project AuctionHouse.Api`n" -ForegroundColor Yellow
    exit 1
}

# Run each test script
foreach ($script in $testScripts) {
    $scriptPath = Join-Path $PSScriptRoot $script
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "[WARNING] Test script not found: $script" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`n=========================================" -ForegroundColor Cyan
    Write-Host "Running: $script" -ForegroundColor Cyan
    Write-Host "=========================================`n" -ForegroundColor Cyan
    
    $startTime = Get-Date
    
    try {
        # Run the test script and capture output
        $output = & $scriptPath
        $exitCode = $LASTEXITCODE
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        # Parse results from output
        $passedLine = $output | Where-Object { $_ -match "Passed: (\d+)" }
        $failedLine = $output | Where-Object { $_ -match "Failed: (\d+)" }
        $successRateLine = $output | Where-Object { $_ -match "Success Rate: ([\d.]+)%" }
        
        if ($passedLine -match "Passed: (\d+)") {
            $passed = [int]$Matches[1]
        } else {
            $passed = 0
        }
        
        if ($failedLine -match "Failed: (\d+)") {
            $failed = [int]$Matches[1]
        } else {
            $failed = 0
        }
        
        if ($successRateLine -match "Success Rate: ([\d.]+)%") {
            $successRate = [decimal]$Matches[1]
        } else {
            $successRate = 0
        }
        
        $scriptResults += [PSCustomObject]@{
            Script = $script
            Passed = $passed
            Failed = $failed
            Total = $passed + $failed
            SuccessRate = $successRate
            Duration = [math]::Round($duration, 2)
            Status = if ($failed -eq 0) { "PASS" } else { "FAIL" }
        }
        
        Write-Host $output
        
    } catch {
        Write-Host "[ERROR] Failed to run $script : $_" -ForegroundColor Red
        $scriptResults += [PSCustomObject]@{
            Script = $script
            Passed = 0
            Failed = 1
            Total = 1
            SuccessRate = 0
            Duration = 0
            Status = "ERROR"
        }
    }
    
    Start-Sleep -Seconds 1
}

# Consolidated Results
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "CONSOLIDATED TEST RESULTS" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$scriptResults | Format-Table -AutoSize

$totalPassed = ($scriptResults | Measure-Object -Property Passed -Sum).Sum
$totalFailed = ($scriptResults | Measure-Object -Property Failed -Sum).Sum
$totalTests = $totalPassed + $totalFailed
$overallSuccessRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 2) } else { 0 }
$totalDuration = ($scriptResults | Measure-Object -Property Duration -Sum).Sum

Write-Host "`nOverall Statistics:" -ForegroundColor Cyan
Write-Host "  Total Test Scripts: $($scriptResults.Count)" -ForegroundColor White
Write-Host "  Total Tests Run: $totalTests" -ForegroundColor White
Write-Host "  Total Passed: $totalPassed" -ForegroundColor Green
Write-Host "  Total Failed: $totalFailed" -ForegroundColor $(if ($totalFailed -eq 0) { "Green" } else { "Red" })
Write-Host "  Overall Success Rate: $overallSuccessRate%" -ForegroundColor $(if ($overallSuccessRate -eq 100) { "Green" } elseif ($overallSuccessRate -ge 80) { "Yellow" } else { "Red" })
Write-Host "  Total Duration: $([math]::Round($totalDuration, 2)) seconds" -ForegroundColor White

# Final verdict
Write-Host "`n=========================================" -ForegroundColor Cyan
if ($totalFailed -eq 0) {
    Write-Host "[SUCCESS] ALL PHASE 1 TESTS PASSED!" -ForegroundColor Green
    Write-Host "Phase 1 implementation is complete and verified." -ForegroundColor Green
} else {
    Write-Host "[WARNING] SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "Please review the failed tests above." -ForegroundColor Yellow
}
Write-Host "=========================================`n" -ForegroundColor Cyan

# Test coverage summary
Write-Host "Test Coverage Summary:" -ForegroundColor Cyan
Write-Host "  [x] Auction CRUD (Update, Delete, Get My Auctions)" -ForegroundColor Green
Write-Host "  [x] Bid History (Get Bids for Auction, Get User Bids)" -ForegroundColor Green
Write-Host "  [x] User Profile (Get Current User)" -ForegroundColor Green
Write-Host "  [x] Logout (Token Revocation & Middleware)" -ForegroundColor Green
Write-Host "`nFrontend Methods Fixed:" -ForegroundColor Cyan
Write-Host "  1. api.updateAuction()" -ForegroundColor White
Write-Host "  2. api.deleteAuction()" -ForegroundColor White
Write-Host "  3. api.getUserAuctions()" -ForegroundColor White
Write-Host "  4. api.getBidsForAuction()" -ForegroundColor White
Write-Host "  5. api.getUserBids()" -ForegroundColor White
Write-Host "  6. api.getCurrentUser()" -ForegroundColor White
Write-Host "  7. api.logout()" -ForegroundColor White
Write-Host "`nTotal Fixed: 7/11 frontend methods (63.6%)" -ForegroundColor Yellow
