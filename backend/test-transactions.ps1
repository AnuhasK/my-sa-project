# Phase 2: Transaction System Test Script
# Tests all transaction endpoints

$baseUrl = "http://localhost:5021/api"
$testsPassed = 0
$testsFailed = 0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 2: TRANSACTION SYSTEM TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param (
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "Test: $Name" -ForegroundColor Yellow
    try {
        & $Test
        Write-Host "PASSED" -ForegroundColor Green
        Write-Host ""
        $script:testsPassed++
    }
    catch {
        Write-Host "FAILED: $_" -ForegroundColor Red
        Write-Host ""
        $script:testsFailed++
    }
}

# Test 1: Login as admin
Test-Endpoint "Login as Admin" {
    $body = @{
        email = "admin@local"
        password = "Admin@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    if (-not $response.token) {
        throw "No token received"
    }
    
    $script:adminToken = $response.token
    $script:adminId = $response.userId
    Write-Host "Admin ID: $adminId"
}

# Test 2: Login as buyer (or register if doesn't exist)
Test-Endpoint "Login as Buyer" {
    $body = @{
        email = "user2@local"
        password = "User@123"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    }
    catch {
        # User doesn't exist, register
        Write-Host "User doesn't exist, registering..."
        $registerBody = @{
            username = "testbuyer"
            email = "user2@local"
            password = "User@123"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    }
    
    if (-not $response.token) {
        throw "No token received"
    }
    
    $script:buyerToken = $response.token
    $script:buyerId = $response.userId
    Write-Host "Buyer ID: $buyerId"
}

# Test 3: Create test auction
Test-Endpoint "Create Test Auction" {
    # Create auction that starts now (should be Open immediately)
    $body = @{
        title = "Transaction Test Auction"
        description = "Test auction for transactions"
        startPrice = 100.00
        startTime = (Get-Date).AddMinutes(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        endTime = (Get-Date).AddHours(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        categoryId = 1
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auctions" -Method POST -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" }
    
    $script:testAuctionId = $response.id
    Write-Host "Created auction ID: $testAuctionId"
    Write-Host "Auction status: $($response.status)"
    
    # If still scheduled, wait and check again
    if ($response.status -eq "Scheduled") {
        Write-Host "Waiting for auction to become Open..."
        Start-Sleep -Seconds 2
        $auction = Invoke-RestMethod -Uri "$baseUrl/auctions/$testAuctionId" -Method GET
        Write-Host "Updated status: $($auction.status)"
    }
}

# Test 4: Place bid
Test-Endpoint "Place Bid on Auction" {
    # First verify the auction exists and is open
    $auction = Invoke-RestMethod -Uri "$baseUrl/auctions/$testAuctionId" -Method GET
    Write-Host "Auction Status before bid: $($auction.status)"
    Write-Host "Current Price: $($auction.currentPrice)"
    
    $body = @{
        auctionId = $testAuctionId
        amount = 150.00
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/bids" -Method POST -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $buyerToken" }
        Write-Host "Placed bid: $($response.amount)"
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorDetails = ""
        if ($_.ErrorDetails) {
            $errorDetails = $_.ErrorDetails.Message
        }
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Red
        Write-Host "Error: $errorDetails" -ForegroundColor Red
        throw "Bid placement failed"
    }
}

# Test 5: Close auction
Test-Endpoint "Close Auction" {
    Invoke-RestMethod -Uri "$baseUrl/auctions/$testAuctionId/close" -Method POST -Headers @{ Authorization = "Bearer $adminToken" } | Out-Null
    
    Write-Host "Auction closed"
    Write-Host "Waiting for background service to create transaction..."
    Start-Sleep -Seconds 3
}

# Test 6: Get buyer transactions
Test-Endpoint "Get Buyer Transactions" {
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions/buyer" -Method GET -Headers @{ Authorization = "Bearer $buyerToken" }
    
    if ($response.Count -eq 0) {
        throw "No transactions found"
    }
    
    $script:transactionId = $response[0].id
    Write-Host "Found $($response.Count) transaction(s)"
    Write-Host "Transaction ID: $transactionId"
}

# Test 7: Get seller transactions
Test-Endpoint "Get Seller Transactions" {
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions/seller" -Method GET -Headers @{ Authorization = "Bearer $adminToken" }
    
    if ($response.Count -eq 0) {
        throw "No transactions found"
    }
    
    Write-Host "Found $($response.Count) transaction(s)"
}

# Test 8: Get transaction details
Test-Endpoint "Get Transaction Details" {
    if (-not $script:transactionId) {
        throw "No transaction ID available from previous test"
    }
    
    Write-Host "Attempting to get transaction $transactionId with buyer token"
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions/$transactionId" -Method GET -Headers @{ Authorization = "Bearer $buyerToken" }
    
    if ($response.id -ne $transactionId) {
        throw "Transaction ID mismatch"
    }
    
    Write-Host "Auction: $($response.auctionTitle)"
    Write-Host "Amount: $($response.amount)"
    Write-Host "Status: $($response.paymentStatus)"
}

# Test 9: Update payment status
Test-Endpoint "Update Payment Status" {
    $body = @{
        paymentStatus = "Paid"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/transactions/$transactionId/payment-status" -Method PATCH -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $buyerToken" } | Out-Null
    
    Write-Host "Payment status updated to Paid"
}

# Test 10: Verify status updated
Test-Endpoint "Verify Payment Status" {
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions/$transactionId" -Method GET -Headers @{ Authorization = "Bearer $buyerToken" }
    
    if ($response.paymentStatus -ne "Paid") {
        throw "Status not updated"
    }
    
    Write-Host "Status confirmed: $($response.paymentStatus)"
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
}
else {
    Write-Host "Some tests failed" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
