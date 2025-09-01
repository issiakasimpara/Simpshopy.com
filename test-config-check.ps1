# Test script for checking configuration endpoint
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdXdvcmxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4NzQsImV4cCI6MjA1MTI0ODg3NH0.cqKxbF"

Write-Host "Testing check-configuration endpoint..." -ForegroundColor Green

$testData = @{
    provider = "moneroo"
    storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"
} | ConvertTo-Json

Write-Host "Sending test request to check-configuration..." -ForegroundColor Yellow
Write-Host "Test data: $testData" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/payment-gateway/check-configuration" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "apikey" = $anonKey
        } `
        -Body $testData

    Write-Host "Response received:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "Test completed." -ForegroundColor Green
