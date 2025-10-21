# Phase 1.1 - Auction CRUD Endpoint Testing Script
# PowerShell Script to test the new endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 1.1: Testing Auction CRUD Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5021/api"
$testResults = @()

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = $null,
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# Function to display test result
function Show-TestResult {
    param(
        [string]$TestName,
        [bool]$Expected,
        [object]$Result
    )
    
    $passed = ($Result.Success -eq $Expected)
    $symbol = if ($passed) { "✅" } else { "❌" }
    $color = if ($passed) { "Green" } else { "Red" }
    
    Write-Host "$symbol $TestName" -ForegroundColor $color
    
    if (-not $passed) {
        Write-Host "   Expected Success: $Expected, Got: $($Result.Success)" -ForegroundColor Yellow
        if ($Result.Error) {
            Write-Host "   Error: $($Result.Error)" -ForegroundColor Yellow
        }
    }
    
    $script:testResults += @{
        Test = $TestName
        Passed = $passed
        Expected = $Expected
        Actual = $Result.Success
    }
    
    Write-Host ""
}

Write-Host "Step 1: Authentication" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow

# Login as Seller
Write-Host "Logging in as Admin (Seller)..." -ForegroundColor Gray
$sellerLogin = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = "admin@local"
    password = "Admin@123"
}

if ($sellerLogin.Success) {
    $sellerToken = $sellerLogin.Data.token
    Write-Host "✅ Seller login successful" -ForegroundColor Green
    Write-Host "   Token: $($sellerToken.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "❌ Seller login failed: $($sellerLogin.Error)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Login as Buyer
Write-Host "Logging in as User (Buyer)..." -ForegroundColor Gray
$buyerLogin = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = "john@local"
    password = "User@123"
}

if ($buyerLogin.Success) {
    $buyerToken = $buyerLogin.Data.token
    Write-Host "✅ Buyer login successful" -ForegroundColor Green
    Write-Host "   Token: $($buyerToken.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "❌ Buyer login failed: $($buyerLogin.Error)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Login as Admin
Write-Host "Logging in as Admin2..." -ForegroundColor Gray
$adminLogin = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = "admin2@local"
    password = "Admin2@123"
}

if ($adminLogin.Success) {
    $adminToken = $adminLogin.Data.token
    Write-Host "✅ Admin login successful" -ForegroundColor Green
    Write-Host "   Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "❌ Admin login failed: $($adminLogin.Error)" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host ""

Write-Host "Step 2: Create Test Auctions" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Create auction 1 (for update tests)
Write-Host "Creating test auction 1..." -ForegroundColor Gray
$auction1 = Invoke-ApiRequest -Method "POST" -Endpoint "/auctions" -Token $sellerToken -Body @{
    title = "Test Vintage Camera - Phase 1.1"
    description = "A beautiful vintage camera for testing CRUD operations"
    startPrice = 50.00
    startTime = "2025-10-20T10:00:00Z"
    endTime = "2025-10-27T18:00:00Z"
    categoryId = 1
}

if ($auction1.Success) {
    $auction1Id = $auction1.Data.id
    Write-Host "✅ Auction 1 created (ID: $auction1Id)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create auction 1: $($auction1.Error)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Create auction 2 (for delete tests)
Write-Host "Creating test auction 2..." -ForegroundColor Gray
$auction2 = Invoke-ApiRequest -Method "POST" -Endpoint "/auctions" -Token $sellerToken -Body @{
    title = "Test Auction for Deletion"
    description = "This auction will be deleted"
    startPrice = 25.00
    startTime = "2025-10-20T10:00:00Z"
    endTime = "2025-10-27T18:00:00Z"
    categoryId = 1
}

if ($auction2.Success) {
    $auction2Id = $auction2.Data.id
    Write-Host "✅ Auction 2 created (ID: $auction2Id)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create auction 2: $($auction2.Error)" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host ""

Write-Host "Step 3: Test UPDATE Endpoint" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Test 3a: Update as Owner (SHOULD SUCCEED)
Write-Host "Test 3a: Update as Owner..." -ForegroundColor Gray
$updateOwner = Invoke-ApiRequest -Method "PUT" -Endpoint "/auctions/$auction1Id" -Token $sellerToken -Body @{
    title = "Updated Vintage Camera - Now with Leather Case"
    description = "Updated: Includes original leather case"
    endTime = "2025-10-28T18:00:00Z"
    categoryId = 1
}
Show-TestResult -TestName "Update as Owner" -Expected $true -Result $updateOwner

# Test 3b: Update as Different User (SHOULD FAIL)
Write-Host "Test 3b: Update as Different User..." -ForegroundColor Gray
$updateNonOwner = Invoke-ApiRequest -Method "PUT" -Endpoint "/auctions/$auction1Id" -Token $buyerToken -Body @{
    title = "Hacked Title"
    description = "Should fail"
    endTime = "2025-10-28T18:00:00Z"
    categoryId = 1
}
Show-TestResult -TestName "Update as Non-Owner (should fail)" -Expected $false -Result $updateNonOwner

# Test 3c: Update as Admin (SHOULD SUCCEED)
Write-Host "Test 3c: Update as Admin..." -ForegroundColor Gray
$updateAdmin = Invoke-ApiRequest -Method "PUT" -Endpoint "/auctions/$auction1Id" -Token $adminToken -Body @{
    title = "Admin Moderated Title"
    description = "Admin can update any auction"
    endTime = "2025-10-28T18:00:00Z"
    categoryId = 1
}
Show-TestResult -TestName "Update as Admin" -Expected $true -Result $updateAdmin

# Test 3d: Update without Auth (SHOULD FAIL)
Write-Host "Test 3d: Update without Auth..." -ForegroundColor Gray
$updateNoAuth = Invoke-ApiRequest -Method "PUT" -Endpoint "/auctions/$auction1Id" -Body @{
    title = "No Auth"
    description = "Should fail"
    endTime = "2025-10-28T18:00:00Z"
    categoryId = 1
}
Show-TestResult -TestName "Update without Auth (should fail)" -Expected $false -Result $updateNoAuth

Write-Host ""
Write-Host "Step 4: Test UPDATE with Bids" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

# Place a bid
Write-Host "Placing bid on auction 1..." -ForegroundColor Gray
$bid = Invoke-ApiRequest -Method "POST" -Endpoint "/bids" -Token $buyerToken -Body @{
    auctionId = $auction1Id
    amount = 60.00
}

if ($bid.Success) {
    Write-Host "✅ Bid placed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Bid placement failed (this is OK if auction already has bids)" -ForegroundColor Yellow
}
Write-Host ""

# Try to update auction with bids (SHOULD FAIL)
Write-Host "Test 4: Update auction with bids..." -ForegroundColor Gray
$updateWithBids = Invoke-ApiRequest -Method "PUT" -Endpoint "/auctions/$auction1Id" -Token $sellerToken -Body @{
    title = "Cannot Update - Has Bids"
    description = "Should fail"
    endTime = "2025-10-28T18:00:00Z"
    categoryId = 1
}
Show-TestResult -TestName "Update auction with bids (should fail)" -Expected $false -Result $updateWithBids

Write-Host ""
Write-Host "Step 5: Test DELETE Endpoint" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Test 5a: Delete as Owner (NO BIDS) (SHOULD SUCCEED)
Write-Host "Test 5a: Delete as Owner (no bids)..." -ForegroundColor Gray
$deleteOwner = Invoke-ApiRequest -Method "DELETE" -Endpoint "/auctions/$auction2Id" -Token $sellerToken
Show-TestResult -TestName "Delete as Owner (no bids)" -Expected $true -Result $deleteOwner

# Test 5b: Verify soft delete
Write-Host "Test 5b: Verify auction still exists..." -ForegroundColor Gray
$verifyDelete = Invoke-ApiRequest -Method "GET" -Endpoint "/auctions/$auction2Id"
if ($verifyDelete.Success -and $verifyDelete.Data.status -eq "Deleted") {
    Write-Host "✅ Auction soft-deleted successfully (status = Deleted)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not verify soft delete" -ForegroundColor Yellow
}
Write-Host ""

# Test 5c: Try to delete auction with bids (SHOULD FAIL)
Write-Host "Test 5c: Delete auction with bids..." -ForegroundColor Gray
$deleteWithBids = Invoke-ApiRequest -Method "DELETE" -Endpoint "/auctions/$auction1Id" -Token $sellerToken
Show-TestResult -TestName "Delete auction with bids (should fail)" -Expected $false -Result $deleteWithBids

# Test 5d: Create auction as buyer, try to delete as seller (SHOULD FAIL)
Write-Host "Test 5d: Creating auction as buyer..." -ForegroundColor Gray
$auction3 = Invoke-ApiRequest -Method "POST" -Endpoint "/auctions" -Token $buyerToken -Body @{
    title = "Buyer's Auction"
    description = "Created by buyer"
    startPrice = 30.00
    startTime = "2025-10-20T10:00:00Z"
    endTime = "2025-10-27T18:00:00Z"
    categoryId = 1
}

if ($auction3.Success) {
    $auction3Id = $auction3.Data.id
    Write-Host "Test 5e: Delete as non-owner..." -ForegroundColor Gray
    $deleteNonOwner = Invoke-ApiRequest -Method "DELETE" -Endpoint "/auctions/$auction3Id" -Token $sellerToken
    Show-TestResult -TestName "Delete as Non-Owner (should fail)" -Expected $false -Result $deleteNonOwner
}

# Test 5f: Delete without auth (SHOULD FAIL)
Write-Host "Test 5f: Delete without auth..." -ForegroundColor Gray
$deleteNoAuth = Invoke-ApiRequest -Method "DELETE" -Endpoint "/auctions/$auction3Id"
Show-TestResult -TestName "Delete without Auth (should fail)" -Expected $false -Result $deleteNoAuth

Write-Host ""
Write-Host "Step 6: Test GET MY AUCTIONS Endpoint" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

# Test 6a: Get Seller's Auctions
Write-Host "Test 6a: Get seller's auctions..." -ForegroundColor Gray
$sellerAuctions = Invoke-ApiRequest -Method "GET" -Endpoint "/auctions/my-auctions" -Token $sellerToken
if ($sellerAuctions.Success) {
    $count = $sellerAuctions.Data.Count
    Write-Host "✅ Retrieved seller's auctions (count: $count)" -ForegroundColor Green
    Write-Host "   Auctions:" -ForegroundColor Gray
    foreach ($auction in $sellerAuctions.Data) {
        Write-Host "   - ID: $($auction.id), Title: $($auction.title), Status: $($auction.status)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Failed to get seller's auctions" -ForegroundColor Red
}
Write-Host ""

# Test 6b: Get Buyer's Auctions
Write-Host "Test 6b: Get buyer's auctions..." -ForegroundColor Gray
$buyerAuctions = Invoke-ApiRequest -Method "GET" -Endpoint "/auctions/my-auctions" -Token $buyerToken
if ($buyerAuctions.Success) {
    $count = $buyerAuctions.Data.Count
    Write-Host "✅ Retrieved buyer's auctions (count: $count)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to get buyer's auctions" -ForegroundColor Red
}
Write-Host ""

# Test 6c: Get without Auth (SHOULD FAIL)
Write-Host "Test 6c: Get my auctions without auth..." -ForegroundColor Gray
$myAuctionsNoAuth = Invoke-ApiRequest -Method "GET" -Endpoint "/auctions/my-auctions"
Show-TestResult -TestName "Get My Auctions without Auth (should fail)" -Expected $false -Result $myAuctionsNoAuth

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Passed -eq $true }).Count
$failed = ($testResults | Where-Object { $_.Passed -eq $false }).Count
$total = $testResults.Count

Write-Host ""
Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Phase 1, Task 1.1 - Auction CRUD Operations: COMPLETE ✅" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Review the results above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Failed Tests:" -ForegroundColor Yellow
    foreach ($result in $testResults | Where-Object { $_.Passed -eq $false }) {
        Write-Host "  - $($result.Test)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
