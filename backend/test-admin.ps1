# Test Admin Panel API Endpoints
$baseUrl = "http://localhost:5021/api"

Write-Host "`n=== PHASE 4 - ADMIN PANEL API TESTING ===" -ForegroundColor Cyan
Write-Host "Testing admin functionality...`n" -ForegroundColor Cyan

# Test 1: Create and login as admin
Write-Host "Test 1: Create and login as admin..." -ForegroundColor Yellow
$adminRegister = @{
    username = "admin_$(Get-Random)"
    email = "admin_$(Get-Random)@test.com"
    password = "Admin123!"
    role = "Admin"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $adminRegister -ContentType "application/json"
$adminToken = $adminResponse.token
Write-Host "[PASS] Admin created and logged in (ID: $($adminResponse.userId))" -ForegroundColor Green

# Test 2: Create regular users for testing
Write-Host "`nTest 2: Create test users..." -ForegroundColor Yellow
$user1Register = @{
    username = "testuser1_$(Get-Random)"
    email = "user1_$(Get-Random)@test.com"
    password = "User123!"
    role = "Buyer"
} | ConvertTo-Json

$user1Response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $user1Register -ContentType "application/json"
$user1Id = $user1Response.userId
$user1Token = $user1Response.token
Write-Host "[PASS] Test user 1 created (ID: $user1Id)" -ForegroundColor Green

$user2Register = @{
    username = "testuser2_$(Get-Random)"
    email = "user2_$(Get-Random)@test.com"
    password = "User123!"
    role = "Seller"
} | ConvertTo-Json

$user2Response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $user2Register -ContentType "application/json"
$user2Id = $user2Response.userId
$user2Token = $user2Response.token
Write-Host "[PASS] Test user 2 created (ID: $user2Id)" -ForegroundColor Green

# Test 3: Create test auction
Write-Host "`nTest 3: Create test auction..." -ForegroundColor Yellow
$auctionData = @{
    title = "Test Auction for Admin Testing"
    description = "This auction is for testing admin moderation"
    startingPrice = 50.00
    reservePrice = 100.00
    endTime = (Get-Date).AddDays(2).ToString("yyyy-MM-ddTHH:mm:ss")
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $user2Token"
    "Content-Type" = "application/json"
}

$auctionResponse = Invoke-RestMethod -Uri "$baseUrl/auctions" -Method Post -Body $auctionData -Headers $headers
$auctionId = $auctionResponse.id
Write-Host "[PASS] Test auction created (ID: $auctionId)" -ForegroundColor Green

# Test 4: Place test bid
Write-Host "`nTest 4: Place test bid..." -ForegroundColor Yellow
$bidData = @{
    amount = 75.00
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $user1Token"
    "Content-Type" = "application/json"
}

$bidResponse = Invoke-RestMethod -Uri "$baseUrl/bids/$auctionId" -Method Post -Body $bidData -Headers $headers
Write-Host "[PASS] Bid placed successfully" -ForegroundColor Green

# Test 5: Get Dashboard Stats (Admin only)
Write-Host "`nTest 5: Get admin dashboard stats..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $adminToken"
}

try {
    $dashboardStats = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method Get -Headers $headers
    Write-Host "[PASS] Dashboard stats retrieved:" -ForegroundColor Green
    Write-Host "  - Total Users: $($dashboardStats.totalUsers)" -ForegroundColor Gray
    Write-Host "  - Total Auctions: $($dashboardStats.totalAuctions)" -ForegroundColor Gray
    Write-Host "  - Active Auctions: $($dashboardStats.activeAuctions)" -ForegroundColor Gray
    Write-Host "  - Total Bids: $($dashboardStats.totalBids)" -ForegroundColor Gray
    Write-Host "  - Total Transactions: $($dashboardStats.totalTransactions)" -ForegroundColor Gray
    Write-Host "  - Total Revenue: `$$($dashboardStats.totalRevenue)" -ForegroundColor Gray
    Write-Host "  - Average Auction Price: `$$($dashboardStats.averageAuctionPrice)" -ForegroundColor Gray
    Write-Host "  - Recent Activity Items: $($dashboardStats.recentActivity.Count)" -ForegroundColor Gray
}
catch {
    Write-Host "[FAIL] Failed to get dashboard stats: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get All Users (Admin only)
Write-Host "`nTest 6: Get all users list..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/admin/users?pageNumber=1&pageSize=10" -Method Get -Headers $headers
    Write-Host "[PASS] Users list retrieved:" -ForegroundColor Green
    Write-Host "  - Total Users: $($usersResponse.totalCount)" -ForegroundColor Gray
    Write-Host "  - Users on page: $($usersResponse.users.Count)" -ForegroundColor Gray
    
    foreach ($user in $usersResponse.users) {
        Write-Host "  - User: $($user.username) (Role: $($user.role), Auctions: $($user.auctionsCreated), Bids: $($user.bidsPlaced))" -ForegroundColor Gray
    }
}
catch {
    Write-Host "[FAIL] Failed to get users list: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get User Details (Admin only)
Write-Host "`nTest 7: Get user details..." -ForegroundColor Yellow
try {
    $userDetails = Invoke-RestMethod -Uri "$baseUrl/admin/users/$user1Id" -Method Get -Headers $headers
    Write-Host "[PASS] User details retrieved:" -ForegroundColor Green
    Write-Host "  - Username: $($userDetails.username)" -ForegroundColor Gray
    Write-Host "  - Email: $($userDetails.email)" -ForegroundColor Gray
    Write-Host "  - Role: $($userDetails.role)" -ForegroundColor Gray
    Write-Host "  - Auctions Created: $($userDetails.auctionsCreated)" -ForegroundColor Gray
    Write-Host "  - Bids Placed: $($userDetails.bidsPlaced)" -ForegroundColor Gray
    Write-Host "  - Auctions Won: $($userDetails.auctionsWon)" -ForegroundColor Gray
    Write-Host "  - Recent Auctions: $($userDetails.recentAuctions.Count)" -ForegroundColor Gray
    Write-Host "  - Recent Bids: $($userDetails.recentBids.Count)" -ForegroundColor Gray
    Write-Host "  - Recent Transactions: $($userDetails.recentTransactions.Count)" -ForegroundColor Gray
}
catch {
    Write-Host "[FAIL] Failed to get user details: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Search Users (Admin only)
Write-Host "`nTest 8: Search users..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "$baseUrl/admin/users?searchTerm=testuser&pageNumber=1&pageSize=10" -Method Get -Headers $headers
    Write-Host "[PASS] User search completed:" -ForegroundColor Green
    Write-Host "  - Matching users: $($searchResponse.totalCount)" -ForegroundColor Gray
    
    foreach ($user in $searchResponse.users) {
        Write-Host "  - Found: $($user.username) ($($user.email))" -ForegroundColor Gray
    }
}
catch {
    Write-Host "[FAIL] Failed to search users: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Suspend User (Admin only)
Write-Host "`nTest 9: Suspend user..." -ForegroundColor Yellow
$suspendData = @{
    action = "suspend"
    reason = "Testing suspension functionality"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/admin/users/$user1Id/suspend" -Method Put -Body $suspendData -Headers $headers
    Write-Host "[PASS] User suspended successfully" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] Failed to suspend user: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Activate User (Admin only)
Write-Host "`nTest 10: Activate user..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $adminToken"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/admin/users/$user1Id/activate" -Method Put -Headers $headers
    Write-Host "[PASS] User activated successfully" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] Failed to activate user: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 11: Get Flagged Auctions (Admin only)
Write-Host "`nTest 11: Get flagged auctions..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $adminToken"
}

try {
    $flaggedAuctions = Invoke-RestMethod -Uri "$baseUrl/admin/auctions/flagged" -Method Get -Headers $headers
    Write-Host "[PASS] Flagged auctions retrieved:" -ForegroundColor Green
    Write-Host "  - Flagged auction count: $($flaggedAuctions.Count)" -ForegroundColor Gray
    
    foreach ($auction in $flaggedAuctions) {
        Write-Host "  - Auction: $($auction.title) (Status: $($auction.status), Price: `$$($auction.currentPrice))" -ForegroundColor Gray
    }
}
catch {
    Write-Host "[FAIL] Failed to get flagged auctions: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 12: Remove Auction (Admin only)
Write-Host "`nTest 12: Remove auction..." -ForegroundColor Yellow
$removeData = @{
    action = "remove"
    reason = "Testing auction removal functionality"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/admin/auctions/$auctionId/remove" -Method Put -Body $removeData -Headers $headers
    Write-Host "[PASS] Auction removed successfully" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] Failed to remove auction: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 13: Verify auction is flagged
Write-Host "`nTest 13: Verify auction appears in flagged list..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $adminToken"
}

try {
    $flaggedAuctions = Invoke-RestMethod -Uri "$baseUrl/admin/auctions/flagged" -Method Get -Headers $headers
    $removedAuction = $flaggedAuctions | Where-Object { $_.id -eq $auctionId }
    
    if ($removedAuction) {
        Write-Host "[PASS] Removed auction found in flagged list (Status: $($removedAuction.status))" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] Removed auction not found in flagged list" -ForegroundColor Red
    }
}
catch {
    Write-Host "[FAIL] Failed to verify flagged auction: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 14: Try to access admin endpoints as regular user (should fail)
Write-Host "`nTest 14: Test authorization - regular user accessing admin endpoints..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $user1Token"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method Get -Headers $headers
    Write-Host "[FAIL] Regular user should NOT have access to admin dashboard!" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "[PASS] Authorization working correctly - regular user denied access" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 15: Delete User (Admin only)
Write-Host "`nTest 15: Delete user..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $adminToken"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/admin/users/$user1Id" -Method Delete -Headers $headers
    Write-Host "[PASS] User deleted successfully" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] Failed to delete user: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ADMIN PANEL TESTING COMPLETE ===" -ForegroundColor Cyan
Write-Host "All admin endpoints have been tested!`n" -ForegroundColor Cyan
