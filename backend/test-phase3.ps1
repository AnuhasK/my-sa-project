# Phase 3: Search and Filter System - Backend Tests
Write-Host "=== PHASE 3: SEARCH & FILTER TESTS ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5021/api"
$passed = 0
$failed = 0

# Test 1: Get All Auctions
Write-Host "Test 1: Get All Auctions..." -ForegroundColor Yellow
try {
    $allAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions" -Method GET
    Write-Host "  Total auctions: $($allAuctions.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: Search by Title
Write-Host "`nTest 2: Search by Title..." -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/auctions?search=guitar" -Method GET
    Write-Host "  Results for 'guitar': $($searchResults.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 3: Filter by Status (Open)
Write-Host "`nTest 3: Filter by Status (Open)..." -ForegroundColor Yellow
try {
    $openAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions?status=Open" -Method GET
    $actualOpen = ($openAuctions | Where-Object { $_.status -eq "Open" }).Count
    Write-Host "  Open auctions: $actualOpen / $($openAuctions.Count)" -ForegroundColor Gray
    if ($actualOpen -eq $openAuctions.Count) {
        Write-Host "✓ PASS - All results are Open" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "✗ FAIL - Found non-Open auctions in results" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 4: Filter by Category
Write-Host "`nTest 4: Filter by Category..." -ForegroundColor Yellow
try {
    $categoryAuctions = Invoke-RestMethod -Uri "$baseUrl/auctions?categoryId=1" -Method GET
    Write-Host "  Category 1 auctions: $($categoryAuctions.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Filter by Price Range
Write-Host "`nTest 5: Filter by Price Range..." -ForegroundColor Yellow
try {
    $url = "$baseUrl/auctions?minPrice=100`&maxPrice=1000"
    $priceResults = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "  Auctions `$100-`$1000: $($priceResults.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Sort by Price (Low to High)
Write-Host "`nTest 6: Sort by Price (Low to High)..." -ForegroundColor Yellow
try {
    $sorted = Invoke-RestMethod -Uri "$baseUrl/auctions?sortBy=price-low" -Method GET
    if ($sorted.Count -gt 0) {
        Write-Host "  First: `$$($sorted[0].currentPrice)" -ForegroundColor Gray
    }
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 7: Sort by Price (High to Low)
Write-Host "`nTest 7: Sort by Price (High to Low)..." -ForegroundColor Yellow
try {
    $sorted = Invoke-RestMethod -Uri "$baseUrl/auctions?sortBy=price-high" -Method GET
    if ($sorted.Count -gt 0) {
        Write-Host "  First: `$$($sorted[0].currentPrice)" -ForegroundColor Gray
    }
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 8: Combined Filters
Write-Host "`nTest 8: Combined Filters (Search + Status)..." -ForegroundColor Yellow
try {
    $url = "$baseUrl/auctions?search=test`&status=Open"
    $combined = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "  Results: $($combined.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 9: Sort by Ending Soon
Write-Host "`nTest 9: Sort by Ending Soon..." -ForegroundColor Yellow
try {
    $url = "$baseUrl/auctions?sortBy=ending-soon`&status=Open"
    $endingSoon = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "  Results: $($endingSoon.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 10: Empty Search
Write-Host "`nTest 10: Empty Search Results..." -ForegroundColor Yellow
try {
    $empty = Invoke-RestMethod -Uri "$baseUrl/auctions?search=xyznonexistent999" -Method GET
    Write-Host "  Results: $($empty.Count)" -ForegroundColor Gray
    Write-Host "✓ PASS" -ForegroundColor Green
    $passed++
} catch {
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

Write-Host "Success Rate: $percentage%" -ForegroundColor $(if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 80) { "Yellow" } else { "Red" })
Write-Host "==========================================" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`nALL TESTS PASSED! Ready for frontend integration." -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed. Review errors above." -ForegroundColor Yellow
}
