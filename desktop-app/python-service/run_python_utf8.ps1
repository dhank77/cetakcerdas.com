# Set UTF-8 encoding for PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Set comprehensive UTF-8 environment variables
$env:PYTHONIOENCODING = "utf-8:replace"
$env:PYTHONUTF8 = "1"
$env:PYTHONLEGACYWINDOWSSTDIO = "0"
$env:LC_ALL = "C.UTF-8"
$env:LANG = "C.UTF-8"
$env:PYTHONUNBUFFERED = "1"
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:PYTHONCOERCECLOCALE = "0"
# Force UTF-8 for Windows console
$env:PYTHONMALLOC = "malloc"
$env:PYTHONFAULTHANDLER = "1"
# Override Windows default encoding
$env:PYTHONDEFAULTENCODING = "utf-8"

# Change to script directory
Set-Location $PSScriptRoot

# Run the compiled executable directly
try {
    $exePath = Join-Path $PSScriptRoot "pdf_analyzer.exe"
    if (Test-Path $exePath) {
        & $exePath @args
    } else {
        Write-Error "pdf_analyzer.exe not found in $PSScriptRoot"
        exit 1
    }
} catch {
    Write-Error "Error running PDF analyzer: $_"
    exit 1
}