function Probe([string]$url, [string]$label) {
  try {
    $r = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 5 -Method GET
    $ct = $r.Headers['Content-Type']
    $len = $r.Content.Length
    Write-Host ("[{0}] {1,-30} status={2}  ct={3}  bytes={4}" -f $(if ($r.StatusCode -eq 200) {'PASS'} else {'FAIL'}), $label, $r.StatusCode, $ct, $len)
  } catch {
    Write-Host ("[FAIL] {0,-30} EXC {1}" -f $label, $_.Exception.Message)
  }
}

Probe 'http://localhost:5173/'                              'frontend root'
Probe 'http://localhost:5173/admin/dashboard'                'SPA fallback'
Probe 'http://localhost:5173/sw.js'                          'service worker'
Probe 'http://localhost:5173/manifest.webmanifest'           'manifest'
Probe 'http://localhost:5173/workbox-e217238d.js'            'workbox runtime'
Probe 'http://localhost:5173/icons/icon-192.png'             'icon-192'
Probe 'http://localhost:5173/icons/icon-512.png'             'icon-512'
Probe 'http://localhost:5173/icons/icon-maskable-512.png'    'icon-maskable'
Probe 'http://localhost:5173/favicon.svg'                    'favicon'

Write-Host ''
Write-Host '--- /sw.js head ---'
try {
  $sw = (Invoke-WebRequest 'http://localhost:5173/sw.js' -UseBasicParsing).Content
  foreach ($n in 'workbox','precacheAndRoute','NetworkOnly','api-no-cache') {
    $ok = $sw -match [regex]::Escape($n)
    Write-Host ("[{0}] sw.js contains '{1}'" -f $(if ($ok) {'PASS'} else {'FAIL'}), $n)
  }
  Write-Host "sw.js first 200 chars: $($sw.Substring(0, [Math]::Min(200, $sw.Length)))"
} catch { Write-Host "sw fetch failed: $_" }

Write-Host ''
Write-Host '--- manifest content ---'
try {
  $m = Invoke-RestMethod 'http://localhost:5173/manifest.webmanifest'
  foreach ($k in 'name','short_name','start_url','scope','display','theme_color','background_color','icons') {
    $v = $m.$k
    $ok = $null -ne $v -and "$v" -ne ''
    Write-Host ("[{0}] manifest.{1,-15} = {2}" -f $(if ($ok) {'PASS'} else {'FAIL'}), $k, ($v -as [string]))
  }
} catch { Write-Host "manifest fetch failed: $_" }
