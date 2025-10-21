# Manual Bid Placement Test with Detailed Error Output
$baseUrl = "http://localhost:5021/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MANUAL BID PLACEMENT TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as buyer
Write-Host "Step 1: Login as buyer..." -ForegroundColor Yellow
$loginBody = @{
    email = "buyer@local"
    password = "Buyer@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $buyerToken = $loginResponse.token
    $buyerId = $loginResponse.userId
    Write-Host "✓ Logged in as buyer (ID: $buyerId)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 2: Find an open auction
Write-Host "Step 2: Finding an open auction..." -ForegroundColor Yellow
try {
    $auctions = Invoke-RestMethod -Uri "$baseUrl/auctions" -Method GET
    $openAuction = $auctions | Where-Object { $_.status -eq "Open" } | Select-Object -First 1
    
    if ($null -eq $openAuction) {
        Write-Host "✗ No open auctions found" -ForegroundColor Red
        exit
    }
    
    Write-Host "✓ Found open auction:" -ForegroundColor Green
    Write-Host "  ID: $($openAuction.id)"
    Write-Host "  Title: $($openAuction.title)"
    Write-Host "  Current Price: `$$($openAuction.currentPrice)"
    Write-Host "  Status: $($openAuction.status)"
    
    $auctionId = $openAuction.id
    $currentPrice = $openAuction.currentPrice
}
catch {
    Write-Host "✗ Failed to get auctions: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 3: Place a bid
Write-Host "Step 3: Placing bid..." -ForegroundColor Yellow
$bidAmount = $currentPrice + 10
Write-Host "  Bid amount: `$$bidAmount (current price + $10)"

$bidBody = @{
    auctionId = $auctionId
    amount = $bidAmount
} | ConvertTo-Json

Write-Host "  Request body: $bidBody"

try {
    $headers = @{ 
        Authorization = "Bearer $buyerToken"
    }
    
    Write-Host "  Sending POST request to $baseUrl/bids..." -ForegroundColor Cyan
    
    $bidResponse = Invoke-WebRequest -Uri "$baseUrl/bids" -Method POST -Body $bidBody -ContentType "application/json" -Headers $headers
    
    Write-Host "✓ Bid placed successfully!" -ForegroundColor Green
    Write-Host "  Response: $($bidResponse.Content)"
}
catch {
    Write-Host "✗ Bid placement failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Exception Details:" -ForegroundColor Yellow
    Write-Host "  Type: $($_.Exception.GetType().FullName)"
    Write-Host "  Message: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        Write-Host "  HTTP Status: $statusCode $statusDescription" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "  Response Body: $responseBody" -ForegroundColor Red
        }
        catch {
            Write-Host "  (Could not read response body)"
        }
    }
    
    if ($_.ErrorDetails) {
        Write-Host "  Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Full Exception:" -ForegroundColor Yellow
    Write-Host $_ -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
