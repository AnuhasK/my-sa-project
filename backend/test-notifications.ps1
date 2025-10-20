# Phase 4: Notification System Test Script

$baseUrl = "http://localhost:5021/api"
$testsPassed = 0
$testsFailed = 0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 4: NOTIFICATION SYSTEM TESTS" -ForegroundColor Cyan
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

# Test 1: Login as seller (admin)
Test-Endpoint "Login as Seller (Admin)" {
    $body = @{
        email = "admin@local"
        password = "Admin@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    if (-not $response.token) {
        throw "No token received"
    }
    
    $script:sellerToken = $response.token
    $script:sellerId = $response.userId
    Write-Host "Seller ID: $sellerId"
}

# Test 2: Login as buyer
Test-Endpoint "Login as Buyer (john)" {
    $body = @{
        email = "john@local"
        password = "User@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    if (-not $response.token) {
        throw "No token received"
    }
    
    $script:buyerToken = $response.token
    $script:buyerId = $response.userId
    Write-Host "Buyer ID: $buyerId"
}

# Test 3: Create auction as seller
Test-Endpoint "Create Auction as Seller" {
    $body = @{
        title = "Notification Test Auction"
        description = "Testing notifications"
        startPrice = 100.00
        startTime = (Get-Date).AddMinutes(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        endTime = (Get-Date).AddHours(2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        categoryId = 1
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auctions" -Method POST -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $sellerToken" }
    
    $script:auctionId = $response.id
    Write-Host "Created auction ID: $auctionId"
}

# Test 4: Place bid (should create notification for seller)
Test-Endpoint "Place Bid (triggers notification)" {
    Start-Sleep -Seconds 2  # Give background task time to process
    
    $body = @{
        auctionId = $auctionId
        amount = 150.00
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/bids" -Method POST -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $buyerToken" }
    
    Write-Host "Placed bid: $($response.amount)"
    
    # Wait for notification to be created
    Start-Sleep -Seconds 2
}

# Test 5: Get seller's notifications (should have notification about bid)
Test-Endpoint "Get Seller Notifications" {
    $notifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers @{ Authorization = "Bearer $sellerToken" }
    
    if ($notifications.Count -eq 0) {
        throw "No notifications found for seller"
    }
    
    Write-Host "Found $($notifications.Count) notification(s)"
    $latestNotification = $notifications[0]
    Write-Host "Latest: $($latestNotification.title)"
    Write-Host "Type: $($latestNotification.type)"
    Write-Host "Read: $($latestNotification.isRead)"
}

# Test 6: Get unread count for seller
Test-Endpoint "Get Unread Count" {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers @{ Authorization = "Bearer $sellerToken" }
    
    Write-Host "Unread count: $($response.count)"
    
    if ($response.count -eq 0) {
        throw "Expected at least 1 unread notification"
    }
    
    # Save notification ID for next tests
    $allNotifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers @{ Authorization = "Bearer $sellerToken" }
    $script:notificationId = $allNotifications[0].id
}

# Test 7: Mark notification as read
Test-Endpoint "Mark Notification as Read" {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications/$notificationId/read" -Method PUT -Headers @{ Authorization = "Bearer $sellerToken" }
    
    Write-Host "Marked notification $notificationId as read"
    
    # Verify it's marked as read
    $notification = (Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers @{ Authorization = "Bearer $sellerToken" }) | Where-Object { $_.id -eq $notificationId }
    
    if ($notification -and -not $notification.isRead) {
        throw "Notification not marked as read"
    }
}

# Test 8: Place another bid (create another notification)
Test-Endpoint "Place Second Bid" {
    $body = @{
        email = "jane@local"
        password = "User@123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    $janeToken = $loginResponse.token
    
    $bidBody = @{
        auctionId = $auctionId
        amount = 200.00
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/bids" -Method POST -Body $bidBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $janeToken" }
    
    Write-Host "Jane placed bid: 200"
    Start-Sleep -Seconds 2
}

# Test 9: Mark all notifications as read
Test-Endpoint "Mark All Notifications as Read" {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications/mark-all-read" -Method PUT -Headers @{ Authorization = "Bearer $sellerToken" }
    
    Write-Host "Marked all notifications as read"
    
    # Verify unread count is 0
    $unreadResponse = Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers @{ Authorization = "Bearer $sellerToken" }
    
    if ($unreadResponse.count -ne 0) {
        throw "Expected unread count to be 0, got $($unreadResponse.count)"
    }
}

# Test 10: Delete notification
Test-Endpoint "Delete Notification" {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications/$notificationId" -Method DELETE -Headers @{ Authorization = "Bearer $sellerToken" }
    
    Write-Host "Deleted notification $notificationId"
    
    # Try to get it again (should not be in list)
    $notifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers @{ Authorization = "Bearer $sellerToken" }
    $deletedNotification = $notifications | Where-Object { $_.id -eq $notificationId }
    
    if ($deletedNotification) {
        throw "Notification still exists after deletion"
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testsPassed + $testsFailed)"
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
