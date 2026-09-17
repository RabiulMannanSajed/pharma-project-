Set-Location C:\Novanix\pharma-work\pharma-sell-system\pharma-server\frontend
if (-not (Test-Path logs)) { New-Item -ItemType Directory -Path logs | Out-Null }
$p = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory (Get-Location) -RedirectStandardOutput 'logs\fe-out.log' -RedirectStandardError 'logs\fe-err.log' -PassThru -NoNewWindow
Write-Host "started frontend PID=$($p.Id)"
