$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "== Build klijenta ==" -ForegroundColor Cyan
Set-Location "$root\client"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build klijenta neuspesan." -ForegroundColor Red; exit 1 }

Write-Host "== Build servera ==" -ForegroundColor Cyan
Set-Location "$root\server"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build servera neuspesan." -ForegroundColor Red; exit 1 }

Write-Host "== Pokretanje aplikacije (PM2) ==" -ForegroundColor Cyan
$idOutput = pm2 id export-tracking-app
if ($idOutput -match '\d') {
    pm2 restart export-tracking-app
} else {
    pm2 start dist/main.js --name export-tracking-app
}
pm2 save
pm2 status export-tracking-app
