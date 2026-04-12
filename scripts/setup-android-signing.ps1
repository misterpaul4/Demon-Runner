$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$androidRoot = Join-Path $repoRoot "src-tauri\gen\android"
$keystoreDir = Join-Path $androidRoot "keystore"
$keystorePath = Join-Path $keystoreDir "hiro-run-release.jks"
$keyPropertiesPath = Join-Path $androidRoot "key.properties"
$alias = "hiro_run_release"

function Get-KeytoolPath {
    $command = Get-Command keytool -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $androidStudioKeytool = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
    if (Test-Path $androidStudioKeytool) {
        return $androidStudioKeytool
    }

    throw "keytool.exe not found. Please install a JDK or Android Studio first."
}

function New-RandomSecret {
    $chars = ((48..57) + (65..90) + (97..122)) | ForEach-Object { [char]$_ }
    -join (1..32 | ForEach-Object { Get-Random -InputObject $chars })
}

if (-not (Test-Path $keystoreDir)) {
    New-Item -ItemType Directory -Path $keystoreDir | Out-Null
}

if ((Test-Path $keystorePath) -or (Test-Path $keyPropertiesPath)) {
    Write-Host "Android release signing already exists:"
    if (Test-Path $keystorePath) {
        Write-Host "  keystore: $keystorePath"
    }
    if (Test-Path $keyPropertiesPath) {
        Write-Host "  properties: $keyPropertiesPath"
    }
    exit 0
}

$storePassword = New-RandomSecret
$keyPassword = New-RandomSecret
$keytool = Get-KeytoolPath

& $keytool `
    -genkeypair `
    -v `
    -keystore $keystorePath `
    -storetype JKS `
    -storepass $storePassword `
    -alias $alias `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -keypass $keyPassword `
    -dname "CN=Hiro Run, OU=Development, O=Hiro Run, L=Shanghai, ST=Shanghai, C=CN"

@"
storeFile=keystore/hiro-run-release.jks
storePassword=$storePassword
keyAlias=$alias
keyPassword=$keyPassword
"@ | Set-Content -Path $keyPropertiesPath -Encoding ASCII

Write-Host "Android release signing created:"
Write-Host "  keystore: $keystorePath"
Write-Host "  properties: $keyPropertiesPath"
Write-Host "These files are local-only and ignored by git."
