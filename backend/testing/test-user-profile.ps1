# Test script for User Profile Endpoint (GET /auth/me)
# Tests Phase 1, Task 1.3 - User Profile Endpoints

$baseUrl = "http://localhost:5021/api"
$testResults = @()

Write-Host "`n=== TESTING USER PROFILE ENDPOINT (GET /auth/me) ===" -ForegroundColor Cyan
Write-Host "Testing Phase 1, Task 1.3 - User Profile Endpoints`n" -ForegroundColor Gray

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

# Test 2: Get current user profile with valid token
Write-Host "`nTest 2: GET /auth/me with valid token..." -ForegroundColor Yellow
$profileResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $token

if ($profileResult.Success) {
    Write-Host "[PASS] Profile retrieved successfully" -ForegroundColor Green
    
    # Validate response structure
    $profile = $profileResult.Data
    Write-Host "  Profile Data:" -ForegroundColor Cyan
    Write-Host "    - Id: $($profile.id)" -ForegroundColor White
    Write-Host "    - Username: $($profile.username)" -ForegroundColor White
    Write-Host "    - Email: $($profile.email)" -ForegroundColor White
    Write-Host "    - Role: $($profile.role)" -ForegroundColor White
    
    # Check that password hash is NOT exposed
    if ($profile.PSObject.Properties.Name -contains "passwordHash") {
        Write-Host "  [FAIL] SECURITY ISSUE: PasswordHash is exposed in response!" -ForegroundColor Red
        $testResults += "FAIL: PasswordHash exposed (security issue)"
    } else {
        Write-Host "  [PASS] PasswordHash correctly excluded from response" -ForegroundColor Green
        $testResults += "PASS: PasswordHash not exposed"
    }
    
    # Validate user ID matches login
    if ($profile.id -eq $userId) {
        Write-Host "  [PASS] User ID matches logged-in user" -ForegroundColor Green
        $testResults += "PASS: User ID validation"
    } else {
        Write-Host "  [FAIL] User ID mismatch (expected $userId, got $($profile.id))" -ForegroundColor Red
        $testResults += "FAIL: User ID mismatch"
    }
    
    # Validate all required fields are present
    $requiredFields = @("id", "username", "email", "role")
    $missingFields = @()
    foreach ($field in $requiredFields) {
        if (-not ($profile.PSObject.Properties.Name -contains $field)) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -eq 0) {
        Write-Host "  [PASS] All required fields present" -ForegroundColor Green
        $testResults += "PASS: All required fields present"
    } else {
        Write-Host "  [FAIL] Missing fields: $($missingFields -join ', ')" -ForegroundColor Red
        $testResults += "FAIL: Missing required fields"
    }
} else {
    Write-Host "[FAIL] Failed to retrieve profile: $($profileResult.Error)" -ForegroundColor Red
    $testResults += "FAIL: Profile retrieval with valid token"
}

# Test 3: Get current user profile without token (should fail with 401)
Write-Host "`nTest 3: GET /auth/me without token (should fail)..." -ForegroundColor Yellow
$noTokenResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me"

if (-not $noTokenResult.Success -and $noTokenResult.StatusCode -eq 401) {
    Write-Host "[PASS] Correctly rejected request without token (401 Unauthorized)" -ForegroundColor Green
    $testResults += "PASS: No token rejection"
} else {
    Write-Host "[FAIL] Request without token should have returned 401" -ForegroundColor Red
    $testResults += "FAIL: No token should return 401"
}

# Test 4: Get current user profile with invalid token (should fail with 401)
Write-Host "`nTest 4: GET /auth/me with invalid token (should fail)..." -ForegroundColor Yellow
$invalidToken = "invalid.token.here"
$invalidTokenResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $invalidToken

if (-not $invalidTokenResult.Success -and $invalidTokenResult.StatusCode -eq 401) {
    Write-Host "[PASS] Correctly rejected request with invalid token (401 Unauthorized)" -ForegroundColor Green
    $testResults += "PASS: Invalid token rejection"
} else {
    Write-Host "[FAIL] Request with invalid token should have returned 401" -ForegroundColor Red
    $testResults += "FAIL: Invalid token should return 401"
}

# Test 5: Test with different user (jane@local)
Write-Host "`nTest 5: Test with different user (jane@local)..." -ForegroundColor Yellow
$janeLoginResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = "jane@local"
    password = "User@123"
}

if ($janeLoginResult.Success) {
    $janeToken = $janeLoginResult.Data.token
    $janeUserId = $janeLoginResult.Data.userId
    
    $janeProfileResult = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $janeToken
    
    if ($janeProfileResult.Success) {
        $janeProfile = $janeProfileResult.Data
        Write-Host "[PASS] Jane profile retrieved successfully" -ForegroundColor Green
        Write-Host "  - Id: $($janeProfile.id), Username: $($janeProfile.username), Email: $($janeProfile.email)" -ForegroundColor White
        
        if ($janeProfile.id -eq $janeUserId -and $janeProfile.email -eq "jane@local") {
            Write-Host "  [PASS] Correct user profile returned" -ForegroundColor Green
            $testResults += "PASS: Different user profile retrieval"
        } else {
            Write-Host "  [FAIL] Profile data mismatch" -ForegroundColor Red
            $testResults += "FAIL: Profile data mismatch"
        }
    } else {
        Write-Host "[FAIL] Failed to retrieve Jane profile" -ForegroundColor Red
        $testResults += "FAIL: Different user profile retrieval"
    }
} else {
    Write-Host "[FAIL] Failed to login as Jane" -ForegroundColor Red
    $testResults += "FAIL: Jane login failed"
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
    Write-Host "`n[SUCCESS] ALL TESTS PASSED! User Profile endpoint is working correctly." -ForegroundColor Green
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
