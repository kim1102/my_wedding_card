# =========================================================
#  모바일 청첩장 로컬 서버
#  사용법:  powershell -ExecutionPolicy Bypass -File serve.ps1
# =========================================================
param([int]$Port = 8080)

$python = 'C:\Anaconda3\python.exe'
if (-not (Test-Path $python)) {
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd) { $python = $cmd.Source } else { Write-Error 'python.exe 를 찾을 수 없습니다.'; exit 1 }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$ips = Get-NetIPAddress -AddressFamily IPv4 |
       Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
       Select-Object -ExpandProperty IPAddress

Write-Host ''
Write-Host '  모바일 청첩장 서버' -ForegroundColor Yellow
Write-Host '  ------------------------------------------'
Write-Host "  이 PC     :  http://localhost:$Port"
foreach ($ip in $ips) {
  Write-Host "  같은 Wi-Fi:  http://${ip}:$Port" -ForegroundColor Green
}
Write-Host '  ------------------------------------------'
Write-Host '  종료하려면 Ctrl+C' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  * 폰에서 안 열리면 방화벽에서 이 포트를 열어주세요:' -ForegroundColor DarkGray
Write-Host "    New-NetFirewallRule -DisplayName 'Wedding $Port' -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow" -ForegroundColor DarkGray
Write-Host ''

& $python -m http.server $Port --bind 0.0.0.0 --directory $root
