Write-Host '===== PWA verification ====='

$fe = 'http://localhost:5173'
$be = 'http://localhost:5000'

function Check([string]$label, [string]$url, [string]$expectContentType = '') {
  try {
    $r = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 8 -Method GET
    $ct = $r.Headers['Content-Type']
    $status = $r.StatusCode
    $len = $r.Content.Length
    $match = if ($expectContentType) { $ct -like "*$expectContentType*" } else { $true }
    $tag = if ($status -eq 200 -and $match) { 'PASS' } else { 'FAIL' }
    Write-Host ("[{0}] {1,-30} {2}  ct={3}  bytes={4}" -f $tag, $label, $status, $ct, $len)
  } catch {
    Write-Host ("[FAIL] {0,-30} EXC {1}" -f $label, $_.Exception.Message)
  }
}

Write-Host ''
Write-Host '--- Servers ---'
Check 'backend /health' "$be/health"
Check 'frontend root /' "$fe/" 'text/html'
Check 'frontend SPA fallback' "$fe/admin/sales" 'text/html'

Write-Host ''
Write-Host '--- PWA assets ---'
Check 'service worker /sw.js' "$fe/sw.js" 'javascript'
Check 'manifest.webmanifest' "$fe/manifest.webmanifest" 'json'
Check 'icon-192.png' "$fe/icons/icon-192.png" 'png'
Check 'icon-512.png' "$fe/icons/icon-512.png" 'png'
Check 'icon-maskable-512.png' "$fe/icons/icon-maskable-512.png" 'png'
Check 'favicon.svg' "$fe/favicon.svg" 'image'

Write-Host ''
Write-Host '--- index.html PWA meta ---'
try {
  $html = (Invoke-WebRequest "$fe/" -UseBasicParsing).Content
  $checks = @(
    @{ name = 'theme-color';     pattern = 'name="theme-color"' },
    @{ name = 'apple-capable';   pattern = 'apple-mobile-web-app-capable' },
    @{ name = 'manifest-link';   pattern = 'rel="manifest"' },
    @{ name = 'viewport';        pattern = 'name="viewport"' },
    @{ name = 'app-title';       pattern = '<title>' }
  )
  foreach ($c in $checks) {
    $hit = $html -match [regex]::Escape($c.pattern)
    Write-Host ("[{0}] {1,-30} {2}" -f $(if ($hit) { 'PASS' } else { 'FAIL' }), $c.name, $c.pattern)
  }
} catch {
  Write-Host "[FAIL] could not fetch index.html: $_"
}

Write-Host ''
Write-Host '--- Manifest content ---'
try {
  $m = Invoke-RestMethod "$fe/manifest.webmanifest"
  foreach ($k in 'name','short_name','start_url','scope','display','theme_color','background_color','icons') {
    $hit = $null -ne $m.$k
    Write-Host ("[{0}] manifest.{1,-15} = {2}" -f $(if ($hit) { 'PASS' } else { 'FAIL' }), $k, ($m.$k -as [string]))
  }
  $ic = @($m.icons).Count
  Write-Host ("[{0}] manifest.icons count = {1}" -f $(if ($ic -ge 2) { 'PASS' } else { 'FAIL' }), $ic)
} catch {
  Write-Host "[FAIL] manifest parse: $_"
}

Write-Host ''
Write-Host '--- SW content (workbox precache) ---'
try {
  $sw = (Invoke-WebRequest "$fe/sw.js" -UseBasicParsing).Content
  foreach ($needle in 'workbox','precacheAndRoute','NetworkOnly','api-no-cache') {
    $hit = $sw -match [regex]::Escape($needle)
    Write-Host ("[{0}] sw contains '{1}'" -f $(if ($hit) { 'PASS' } else { 'FAIL' }), $needle)
  }
} catch {
  Write-Host "[FAIL] sw fetch: $_"
}

Write-Host ''
Write-Host '--- Backend auth + /api/* still 401 (not cached) ---'
Check '/api/auth/me (no token)' "$be/api/auth/me"

Write-Host ''
Write-Host 'DONE'
