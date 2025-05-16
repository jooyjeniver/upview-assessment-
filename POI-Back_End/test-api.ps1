# Testing script for POI Explorer API
# This script tests various endpoints of the API

# Base URL
$BASE_URL = "http://localhost:5000"

Write-Host "Starting API Test" -ForegroundColor Green

# Testing root endpoint
Write-Host "`nTesting Root Endpoint" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$BASE_URL/" -Method GET -ContentType "application/json" -ErrorAction SilentlyContinue

if ($response) {
    Write-Host "✅ Root endpoint works!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
} else {
    Write-Host "❌ Failed to access root endpoint" -ForegroundColor Red
}

# Testing registration
Write-Host "`nTesting User Registration" -ForegroundColor Yellow
$registerData = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" -Method POST -Body $registerData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ User registration successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Save the token for authenticated requests
    $token = $response.token
    $userId = $response.user.id
    
    # Testing login
    Write-Host "`nTesting User Login" -ForegroundColor Yellow
    $loginData = @{
        username = "testuser"
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ User login successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Use the new token from login
    $token = $response.token
    
    # Testing profile retrieval
    Write-Host "`nTesting Profile Retrieval" -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/profile" -Method GET -Headers $headers -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Profile retrieval successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Testing POI creation
    Write-Host "`nTesting POI Creation" -ForegroundColor Yellow
    $poiData = @{
        name = "Test POI"
        description = "This is a test POI"
        latitude = 40.7128
        longitude = -74.0060
        category = "test"
        is_visited = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/pois" -Method POST -Headers $headers -Body $poiData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ POI creation successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Save the POI ID
    $poiId = $response.data.id
    
    # Testing Get All POIs
    Write-Host "`nTesting Get All POIs" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/pois" -Method GET -Headers $headers -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Retrieved all POIs successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Testing Get POI by ID
    Write-Host "`nTesting Get POI by ID" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/pois/$poiId" -Method GET -Headers $headers -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Retrieved POI by ID successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Testing Update POI
    Write-Host "`nTesting Update POI" -ForegroundColor Yellow
    $updateData = @{
        name = "Updated POI"
        description = "This is an updated test POI"
        is_visited = $true
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/pois/$poiId" -Method PUT -Headers $headers -Body $updateData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ POI update successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Testing Create Second POI for distance calculation
    Write-Host "`nCreating Second POI for Distance Calculation" -ForegroundColor Yellow
    $poi2Data = @{
        name = "Second Test POI"
        description = "This is a second test POI for distance calculation"
        latitude = 40.7580
        longitude = -73.9855
        category = "test"
        is_visited = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/pois" -Method POST -Headers $headers -Body $poi2Data -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Second POI creation successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    $poi2Id = $response.data.id
    
    # Testing Distance Calculation between POIs
    Write-Host "`nTesting Distance Calculation between POIs" -ForegroundColor Yellow
    $distanceData = @{
        poiId1 = $poiId
        poiId2 = $poi2Id
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/distance/pois" -Method POST -Headers $headers -Body $distanceData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Distance calculation successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Testing Distance Calculation between Coordinates
    Write-Host "`nTesting Distance Calculation between Coordinates" -ForegroundColor Yellow
    $coordData = @{
        lat1 = 40.7128
        lon1 = -74.0060
        lat2 = 40.7580
        lon2 = -73.9855
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/distance/coordinates" -Method POST -Headers $headers -Body $coordData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Coordinate distance calculation successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Testing POI Sync
    Write-Host "`nTesting POI Sync" -ForegroundColor Yellow
    $syncData = @{
        pois = @(
            @{
                id = $poiId
                name = "Synced Test POI"
                description = "This POI was updated via sync"
                latitude = 40.7128
                longitude = -74.0060
                category = "synced"
                is_visited = $true
            },
            @{
                name = "New Synced POI"
                description = "This is a new POI created via sync"
                latitude = 40.6892
                longitude = -74.0445
                category = "new"
                is_visited = $false
            }
        )
    } | ConvertTo-Json -Depth 4
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/sync" -Method POST -Headers $headers -Body $syncData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ POI sync successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    # Testing Delete POI
    Write-Host "`nTesting Delete POI" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/pois/$poiId" -Method DELETE -Headers $headers -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ POI deletion successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 4)"
    
    Write-Host "`nAll tests completed successfully!" -ForegroundColor Green
} catch {
    $errorInfo = $_.Exception
    Write-Host "❌ Test failed: $($errorInfo.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseBody)
        $responseContent = $reader.ReadToEnd()
        Write-Host "Response: $responseContent" -ForegroundColor Red
    }
} 