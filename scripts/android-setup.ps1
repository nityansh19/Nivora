$ErrorActionPreference = 'Stop'

Write-Host 'Nivora Android setup' -ForegroundColor Green
Write-Host '1/4 Installing dependencies...'
npm install

Write-Host '2/4 Building web assets...'
npm run build

Write-Host '3/4 Creating/syncing Capacitor Android project...'
if (-not (Test-Path './android')) {
  npm run cap:add:android
}
npm run cap:sync

Write-Host '4/4 Opening Android Studio...'
npm run cap:open:android
