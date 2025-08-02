# PowerShell script to run Python with UTF-8 encoding
# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# Set Windows console to UTF-8 mode
chcp 65001 | Out-Null

# Set environment variables for UTF-8 encoding
$env:PYTHONIOENCODING = "utf-8:replace"
$env:PYTHONUTF8 = "1"
$env:PYTHONLEGACYWINDOWSSTDIO = "0"
$env:PYTHONHASHSEED = "0"
$env:LANG = "en_US.UTF-8"
$env:LC_ALL = "en_US.UTF-8"
$env:PYTHONUNBUFFERED = "1"
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:PYTHONMALLOC = "malloc"
$env:PYTHONCOERCECLOCALE = "0"

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to script directory
Set-Location $scriptDir

# Run the Python executable with all arguments
$exePath = Join-Path $scriptDir "pdf_analyzer.exe"
& $exePath $args