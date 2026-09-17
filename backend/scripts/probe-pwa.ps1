$out = "===== PWA probe =====`n"

function Probe([string]$url, [string]$label) {
  try {
    $r = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 5 -Method GET
    $ct = $r.Headers['Content-Type']
    $len = $r.Content.Length
    $tag = if ($r.StatusCode -eq 200) { 'PASS' } else { 'FAIL' }
    $script:out += "[$tag] $label status=$($r.StatusCode) ct=$ct bytes=$len`n"
  } catch {
    $script:out += "[FAIL] $label EXC $($_.Exception.Message)`n"
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
Probe 'http://localhost:5000/health'                         'backend health'

$out += "`n--- /sw.js head ---`n"
try {
  $sw = (Invoke-WebRequest 'http://localhost:5173/sw.js' -UseBasicParsing).Content
  foreach ($n in 'workbox','precacheAndRoute','NetworkOnly','api-no-cache','/api/') {
    $ok = $sw -match [regex]::Escape($n)
    $out += "[$([string](if($ok){'PASS'}else{'FAIL'}))] sw.js contains '$n'`n"
  }
  $out += "sw.js first 220 chars: $($sw.Substring(0, [Math]::Min(220, $sw.Length)))`n"
} catch { $out += "sw fetch failed: $_`n" }

$out += "`n--- manifest content ---`n"
try {
  $m = Invoke-RestMethod 'http://localhost:5173/manifest.webmanifest'
  foreach ($k in 'name','short_name','start_url','scope','display','theme_color','background_color','icons') {
    $v = $m.$k
    $ok = $null -ne $v -and "$v" -ne ''
    $out += "[$([string](if($ok){'PASS'}else{'FAIL'}))] manifest.$k = $($v -as [string])`n"
  }
  $out += "icons count = $(@($m.icons).Count)`n"
} catch { $out += "manifest fetch failed: $_`n" }

Set-Content 'C:\Novanix\pharma-work\pharma-sell-system\pharma-server\backend\logs\pwa-probe.txt' -Value $out -Encoding utf8
