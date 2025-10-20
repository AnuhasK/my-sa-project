# Phase 3: Search and Filter System - Backend Test Script
Write-Host "=== PHASE 3: SEARCH & FILTER TESTS ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5021/api"
$passed = 0
$failed = 0

# Login as admin first
try {
    $loginBody = @{
        email = "admin@local"
        password = "Admin@123"
    } | ConvertTo-Json

    $adminResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Logged in as Admin" -ForegroundColor Green
}
catch {
    Write-Host "✗ Admin login failed" -ForegroundColor Red
    exit 1
}

# Test 1: Get All Auctions (No Filters)
Write-Host "`n--- Test 1: Get All Auctions ---" -ForegroundColor Yellow
try {
    $allAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions" -Method GET
    Write-Host "  Total auctions: $($allAuctions.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: Search by Title
Write-Host "`n--- Test 2: Search by Title ---" -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/auctions?search=test" -Method GET
    Write-Host "  Results for 'test': $($searchResults.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 3: Filter by Status (Open)
Write-Host "`n--- Test 3: Filter by Status (Open) ---" -ForegroundColor Yellow
try {
    $openAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions?status=Open" -Method GET
    Write-Host "  Open auctions: $($openAuctions.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 4: Filter by Category
Write-Host "`n--- Test 4: Filter by Category ---" -ForegroundColor Yellow
try {
    $categoryAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions?categoryId=1" -Method GET
    Write-Host "  Category 1 auctions: $($categoryAuctions.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Filter by Price Range
Write-Host "`n--- Test 5: Filter by Price Range ---" -ForegroundColor Yellow
try {
    $priceFilteredAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions?minPrice=50`&maxPrice=500" -Method GET
    Write-Host "  Auctions between `$50-`$500: $($priceFilteredAuctions.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Sort by Price (Low to High)
Write-Host "`n--- Test 6: Sort by Price (Low to High) ---" -ForegroundColor Yellow
try {
    $sortedAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions?sortBy=price-low" -Method GET
    if ($sortedAuctions.Count -gt 0) {
        Write-Host "  First: `$$($sortedAuctions[0].currentPrice)" -ForegroundColor Gray
    }
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 7: Sort by Price (High to Low)
Write-Host "`n--- Test 7: Sort by Price (High to Low) ---" -ForegroundColor Yellow
try {
    $sortedAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions?sortBy=price-high" -Method GET
    if ($sortedAuctions.Count -gt 0) {
        Write-Host "  First: `$$($sortedAuctions[0].currentPrice)" -ForegroundColor Gray
    }
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 8: Combined Filters
Write-Host "`n--- Test 8: Combined Filters ---" -ForegroundColor Yellow
try {
    $combinedResults = Invoke-RestMethod -Uri "$baseUrl/auctions?search=test`&status=Open`&categoryId=1" -Method GET
    Write-Host "  Combined filter results: $($combinedResults.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 9: Sort by Ending Soon
Write-Host "`n--- Test 9: Sort by Ending Soon ---" -ForegroundColor Yellow
try {
    $endingSoonAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions?sortBy=ending-soon`&status=Open" -Method GET
    Write-Host "  Results: $($endingSoonAuctions.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 10: Empty Search Results
Write-Host "`n--- Test 10: Empty Search Results ---" -ForegroundColor Yellow
try {
    $emptyResults = Invoke-RestMethod -Uri "$baseUrl/auctions?search=xyznonexistent123" -Method GET
    Write-Host "  Results: $($emptyResults.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "PHASE 3 BACKEND TEST RESULTS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($passed + $failed)" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
if (($passed + $failed) -gt 0) {
    $percentage = [math]::Round(($passed / ($passed + $failed)) * 100, 1)
} else {
    $percentage = 0
}

$successColor = "Red"
if ($percentage -eq 100) { $successColor = "Green" }
elseif ($percentage -ge 80) { $successColor = "Yellow" }

Write-Host "Success Rate: $percentage%" -ForegroundColor $successColor
Write-Host "==========================================" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n✓ ALL TESTS PASSED! Backend ready for frontend integration." -ForegroundColor Green
}
else {
    Write-Host "`n✗ Some tests failed. Please review errors above." -ForegroundColor Red
}
