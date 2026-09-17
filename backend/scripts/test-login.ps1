$body = '{"email":"pharmarashid9@gmail.com","password":"Rashidtamim20"}'
try {
  $r = Invoke-WebRequest http://localhost:5000/api/auth/login -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
  Write-Host "status=$($r.StatusCode)"
  Write-Host "body=$($r.Content)"
} catch {
  Write-Host "EXCEPTION: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "BODY: $($sr.ReadToEnd())"
  }
}
