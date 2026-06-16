$sdkRoot = "C:\Users\MK\.bubblewrap\android-sdk"
$tmp = "C:\Users\MK\.bubblewrap\tmp"
$zip = Join-Path $tmp "cmdline-tools.zip"

New-Item -ItemType Directory -Force -Path $sdkRoot, $tmp | Out-Null

if (-not (Test-Path (Join-Path $sdkRoot "cmdline-tools\latest\bin\sdkmanager.bat"))) {
  Write-Host "Downloading Android command line tools..."
  Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile $zip
  $extract = Join-Path $tmp "extract"
  if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
  Expand-Archive -Path $zip -DestinationPath $extract -Force
  $target = Join-Path $sdkRoot "cmdline-tools\latest"
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Move-Item -Path (Join-Path $extract "cmdline-tools\*") -Destination $target -Force
}

$sdkmanager = Join-Path $sdkRoot "cmdline-tools\latest\bin\sdkmanager.bat"
$yes = ("y`n" * 200)

Write-Host "Accepting Android SDK licenses..."
$yes | & $sdkmanager --licenses | Out-Host

$packages = @(
  "platform-tools",
  "platforms;android-35",
  "build-tools;35.0.0",
  "build-tools;34.0.0"
)

Write-Host "Installing Android SDK packages..."
foreach ($pkg in $packages) {
  & $sdkmanager $pkg
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Android SDK ready at $sdkRoot"