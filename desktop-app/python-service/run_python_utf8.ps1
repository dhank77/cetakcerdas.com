# Set UTF-8 encoding for PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Set comprehensive UTF-8 environment variables
$env:PYTHONIOENCODING = "utf-8:replace"
$env:PYTHONUTF8 = "1"
$env:PYTHONLEGACYWINDOWSSTDIO = "0"
$env:LC_ALL = "en_US.UTF-8"
$env:LANG = "en_US.UTF-8"
$env:PYTHONUNBUFFERED = "1"
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:PYTHONCOERCECLOCALE = "0"

# Change to script directory
Set-Location $PSScriptRoot

# Try to find Python and run wrapper
try {
    if (Get-Command python3 -ErrorAction SilentlyContinue) {
        & python3 python_wrapper.py @args
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        & python python_wrapper.py @args
    } else {
        Write-Error "Python not found in PATH"
        exit 1
    }
} catch {
    Write-Error "Error running Python service: $_"
    exit 1
}