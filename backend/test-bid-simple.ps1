# Simple Bid Test
$baseUrl = "http://localhost:5021/api"

# Login
$loginBody = '{"email":"john@local","password":"User@123"}'
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $login.token

Write-Host "Logged in as buyer, token: $token"

# Find open auction  
$auctions = Invoke-RestMethod -Uri "$baseUrl/auctions" -Method GET
$openAuction = $auctions | Where-Object { $_.status -eq "Open" } | Select-Object -First 1

if ($null -eq $openAuction) {
    Write-Host "No open auctions found"
    exit
}

Write-Host "Found auction $($openAuction.id): $($openAuction.title)"
Write-Host "Current price: $($openAuction.currentPrice)"

# Place bid
$bidAmount = $openAuction.currentPrice + 10
$bidBody = "{`"auctionId`":$($openAuction.id),`"amount`":$bidAmount}"

Write-Host "Placing bid of $bidAmount..."
Write-Host "Body: $bidBody"

try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-WebRequest -Uri "$baseUrl/bids" -Method POST -Body $bidBody -ContentType "application/json" -Headers $headers
    Write-Host "Success! Response: $($response.Content)" -ForegroundColor Green
}
catch {
    Write-Host "Failed! Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Error body: $body" -ForegroundColor Red
    }
    catch {}
}
