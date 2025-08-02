@echo off
REM Set console code page to UTF-8
chcp 65001 >nul 2>&1

REM Set Windows system locale to UTF-8 (Windows 10 1903+)
set /a "_UNICODE_ENABLED=1" >nul 2>&1

REM Set environment variables for UTF-8 encoding
set PYTHONIOENCODING=utf-8:replace
set PYTHONUTF8=1
set PYTHONLEGACYWINDOWSSTDIO=0
set PYTHONHASHSEED=0
set LANG=en_US.UTF-8
set LC_ALL=en_US.UTF-8
set PYTHONUNBUFFERED=1
set PYTHONDONTWRITEBYTECODE=1
set PYTHONMALLOC=malloc
set PYTHONCOERCECLOCALE=0

REM Change to script directory
cd /d "%~dp0"

REM Run the Python executable with all arguments
"%~dp0pdf_analyzer.exe" %*