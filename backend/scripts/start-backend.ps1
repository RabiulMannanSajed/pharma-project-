Set-Location C:\Novanix\pharma-work\pharma-sell-system\pharma-server\backend
if (-not (Test-Path logs)) { New-Item -ItemType Directory -Path logs | Out-Null }
$p = Start-Process -FilePath 'node' -ArgumentList 'src/server.js' -WorkingDirectory (Get-Location) -RedirectStandardOutput 'logs\out.log' -RedirectStandardError 'logs\err.log' -PassThru -NoNewWindow
Write-Host "started PID=$($p.Id)"
