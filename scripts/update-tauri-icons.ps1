$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$logoPath = Join-Path $repoRoot "logo.png"
$iconSourcePath = Join-Path $repoRoot "src-tauri\icon-source.png"
$faviconPath = Join-Path $repoRoot "public\favicon.png"

if (!(Test-Path $logoPath)) {
    throw "logo.png not found at $logoPath"
}

$logo = [System.Drawing.Image]::FromFile($logoPath)

try {
    $squareSize = [Math]::Max($logo.Width, $logo.Height)
    $bitmap = New-Object System.Drawing.Bitmap $squareSize, $squareSize
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        $offsetX = [int](($squareSize - $logo.Width) / 2)
        $offsetY = [int](($squareSize - $logo.Height) / 2)
        $graphics.DrawImage($logo, $offsetX, $offsetY, $logo.Width, $logo.Height)

        $bitmap.Save($iconSourcePath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}
finally {
    $logo.Dispose()
}

Push-Location $repoRoot
try {
    npx tauri icon $iconSourcePath
    Copy-Item (Join-Path $repoRoot "src-tauri\icons\32x32.png") $faviconPath -Force
}
finally {
    Pop-Location
}
