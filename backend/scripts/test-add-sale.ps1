$base = 'http://localhost:5000'

Write-Host '=== login as admin ==='
$loginBody = '{"email":"pharmarashid9@gmail.com","password":"Rashidtamim20"}'
$login = Invoke-RestMethod "$base/api/auth/login" -Method POST -ContentType 'application/json' -Body $loginBody
$tok = if ($login.data.accessToken) { $login.data.accessToken } else { $login.data.token }
Write-Host "token=$($tok.Substring(0,20))..."

Write-Host '=== list salesmen ==='
$me = Invoke-RestMethod "$base/api/users?page=1&limit=20" -Headers @{ Authorization = "Bearer $tok" }
$salesmen = @($me.data.items | Where-Object { $_.role -eq 'salesman' -and $_.isActive })
Write-Host "salesmen=$($salesmen.Count)"
if ($salesmen.Count -eq 0) { Write-Host 'no salesmen — aborting'; exit 0 }

$sid = $salesmen[0]._id
Write-Host "picked salesman: id=$sid name=$($salesmen[0].name)"

Write-Host '=== sales BEFORE for this salesman ==='
$bef = Invoke-RestMethod "$base/api/sales?page=1&limit=10&salesmanId=$sid" -Headers @{ Authorization = "Bearer $tok" }
Write-Host "before.count=$($bef.data.items.Count)"

Write-Host '=== CREATE new sale ==='
$amt = Get-Random -Minimum 500 -Maximum 10000
$createBody = (@{ amount = $amt; productName = 'PWA Test Product'; quantity = 1; salesmanId = $sid } | ConvertTo-Json)
$cr = Invoke-RestMethod "$base/api/sales" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer $tok" } -Body $createBody
Write-Host "create.status=$($cr.status) id=$($cr.data._id) amount=$($cr.data.amount)"

Write-Host '=== sales AFTER for this salesman ==='
$aft = Invoke-RestMethod "$base/api/sales?page=1&limit=10&salesmanId=$sid" -Headers @{ Authorization = "Bearer $tok" }
Write-Host "after.count=$($aft.data.items.Count) top.amount=$($aft.data.items[0].amount)"

Write-Host '=== customReport daily for this salesman ==='
$today = Get-Date -Format 'yyyy-MM-dd'
$daily = Invoke-RestMethod "$base/api/sales/reports/custom?range=daily&salesmanId=$sid" -Headers @{ Authorization = "Bearer $tok" }
Write-Host "daily.totalAmount=$($daily.data.totalAmount) count=$($daily.data.count)"

Write-Host '=== customReport weekly ==='
$weekly = Invoke-RestMethod "$base/api/sales/reports/custom?range=weekly&salesmanId=$sid" -Headers @{ Authorization = "Bearer $tok" }
Write-Host "weekly.totalAmount=$($weekly.data.totalAmount) count=$($weekly.data.count)"

Write-Host '=== customReport monthly ==='
$monthly = Invoke-RestMethod "$base/api/sales/reports/custom?range=monthly&salesmanId=$sid" -Headers @{ Authorization = "Bearer $tok" }
Write-Host "monthly.totalAmount=$($monthly.data.totalAmount) count=$($monthly.data.count)"

Write-Host ''
Write-Host 'DONE'
