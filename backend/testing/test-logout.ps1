# Test script for Logout Endpoint (POST /auth/logout)
# Tests Phase 1, Task 1.4 - Logout Endpoint

$baseUrl = "http://localhost:5021/api"
$testResults = @()

Write-Host "`n=== TESTING LOGOUT ENDPOINT (POST /auth/logout) ===" -ForegroundColor Cyan
Write-Host "Testing Phase 1, Task 1.4 - Logout Endpoint`n" -ForegroundColor Gray

# Helper function to make API calls
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Method = $Method
        Uri = "$baseUrl$Endpoint"
        Headers = $headers
        ErrorAction = "Stop"
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $_.Exception.Response.StatusCode.value__ }
    }
}

# Test 1: Login to get a valid token
Write-Host "Test 1: Login to get valid token..." -ForegroundColor Yellow
$loginResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = "admin@local"
    password = "Admin@123"
}

if ($loginResult.Success) {
    $token = $loginResult.Data.token
    $userId = $loginResult.Data.userId
    Write-Host "[PASS] Login successful - Token obtained for user ID: $userId" -ForegroundColor Green
    $testResults += "PASS: Login successful"
} else {
    Write-Host "[FAIL] Login failed: $($loginResult.Error)" -ForegroundColor Red
    $testResults += "FAIL: Login failed"
    exit 1
}

# Test 2: Access protected endpoint with valid token (before logout)
Write-Host "`nTest 2: Access /auth/me with valid token (before logout)..." -ForegroundColor Yellow
$profileBeforeResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $token

if ($profileBeforeResult.Success) {
    Write-Host "[PASS] Successfully accessed protected endpoint before logout" -ForegroundColor Green
    $testResults += "PASS: Access before logout"
} else {
    Write-Host "[FAIL] Failed to access protected endpoint: $($profileBeforeResult.Error)" -ForegroundColor Red
    $testResults += "FAIL: Access before logout"
}

# Test 3: Logout with valid token
Write-Host "`nTest 3: POST /auth/logout with valid token..." -ForegroundColor Yellow
$logoutResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/logout" -Token $token

if ($logoutResult.Success) {
    Write-Host "[PASS] Logout successful" -ForegroundColor Green
    Write-Host "  Message: $($logoutResult.Data.message)" -ForegroundColor White
    $testResults += "PASS: Logout successful"
} else {
    Write-Host "[FAIL] Logout failed: $($logoutResult.Error)" -ForegroundColor Red
    $testResults += "FAIL: Logout failed"
}

# Test 4: Try to access protected endpoint with revoked token (after logout)
Write-Host "`nTest 4: Access /auth/me with revoked token (after logout)..." -ForegroundColor Yellow
$profileAfterResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $token

if (-not $profileAfterResult.Success -and $profileAfterResult.StatusCode -eq 401) {
    Write-Host "[PASS] Correctly rejected revoked token (401 Unauthorized)" -ForegroundColor Green
    $testResults += "PASS: Revoked token rejected"
} else {
    Write-Host "[FAIL] Revoked token should have been rejected with 401" -ForegroundColor Red
    Write-Host "  StatusCode: $($profileAfterResult.StatusCode)" -ForegroundColor Red
    $testResults += "FAIL: Revoked token not rejected"
}

# Test 5: Try to logout without token
Write-Host "`nTest 5: POST /auth/logout without token (should fail)..." -ForegroundColor Yellow
$logoutNoTokenResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/logout"

if (-not $logoutNoTokenResult.Success -and $logoutNoTokenResult.StatusCode -eq 401) {
    Write-Host "[PASS] Correctly rejected logout without token (401 Unauthorized)" -ForegroundColor Green
    $testResults += "PASS: No token rejection"
} else {
    Write-Host "[FAIL] Logout without token should return 401" -ForegroundColor Red
    $testResults += "FAIL: No token should return 401"
}

# Test 6: Login again and verify new token works
Write-Host "`nTest 6: Login again with same user (get new token)..." -ForegroundColor Yellow
Start-Sleep -Milliseconds 500  # Small delay to ensure DB transaction completes
$newLoginResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = "admin@local"
    password = "Admin@123"
}

if ($newLoginResult.Success) {
    $newToken = $newLoginResult.Data.token
    Write-Host "[PASS] New login successful" -ForegroundColor Green
    
    # Test 7: Verify new token works
    Write-Host "`nTest 7: Access /auth/me with new token..." -ForegroundColor Yellow
    $profileNewTokenResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $newToken
    
    if ($profileNewTokenResult.Success) {
        Write-Host "[PASS] New token works correctly" -ForegroundColor Green
        $testResults += "PASS: New token works"
    } else {
        Write-Host "[FAIL] New token should work: $($profileNewTokenResult.Error)" -ForegroundColor Red
        $testResults += "FAIL: New token doesn't work"
    }
    
    # Test 8: Try to use old revoked token again (double check)
    Write-Host "`nTest 8: Try old revoked token again (double check)..." -ForegroundColor Yellow
    $oldTokenCheckResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $token
    
    if (-not $oldTokenCheckResult.Success -and $oldTokenCheckResult.StatusCode -eq 401) {
        Write-Host "[PASS] Old revoked token still rejected" -ForegroundColor Green
        $testResults += "PASS: Old token still revoked"
    } else {
        Write-Host "[FAIL] Old revoked token should still be rejected" -ForegroundColor Red
        $testResults += "FAIL: Old token not rejected"
    }
} else {
    Write-Host "[FAIL] New login failed: $($newLoginResult.Error)" -ForegroundColor Red
    $testResults += "FAIL: New login failed"
}

# Test 9: Logout with invalid token
Write-Host "`nTest 9: POST /auth/logout with invalid token (should fail)..." -ForegroundColor Yellow
$invalidToken = "invalid.token.here"
$logoutInvalidResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/logout" -Token $invalidToken

if (-not $logoutInvalidResult.Success -and $logoutInvalidResult.StatusCode -eq 401) {
    Write-Host "[PASS] Correctly rejected invalid token (401 Unauthorized)" -ForegroundColor Green
    $testResults += "PASS: Invalid token rejection"
} else {
    Write-Host "[FAIL] Invalid token should return 401" -ForegroundColor Red
    $testResults += "FAIL: Invalid token should return 401"
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
$passCount = ($testResults | Where-Object { $_ -like "PASS:*" }).Count
$failCount = ($testResults | Where-Object { $_ -like "FAIL:*" }).Count
$totalCount = $testResults.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`n[SUCCESS] ALL TESTS PASSED! Logout endpoint and token revocation working correctly." -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] SOME TESTS FAILED. Review the results above." -ForegroundColor Red
}

Write-Host "`nDetailed Results:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    if ($result -like "PASS:*") {
        Write-Host "  $result" -ForegroundColor Green
    } else {
        Write-Host "  $result" -ForegroundColor Red
    }
}

# Calculate success rate
$successRate = [math]::Round(($passCount / $totalCount) * 100, 2)
Write-Host "`nSuccess Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
