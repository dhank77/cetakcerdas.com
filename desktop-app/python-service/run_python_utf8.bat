@echo off
REM Set UTF-8 code page
chcp 65001 >nul 2>&1

REM Set comprehensive UTF-8 environment
set PYTHONIOENCODING=utf-8:replace
set PYTHONUTF8=1
set PYTHONLEGACYWINDOWSSTDIO=0
set LC_ALL=en_US.UTF-8
set LANG=en_US.UTF-8
set PYTHONUNBUFFERED=1
set PYTHONDONTWRITEBYTECODE=1
set PYTHONCOERCECLOCALE=0

REM Change to script directory
cd /d "%~dp0"

REM Run the compiled executable directly
if exist "%~dp0pdf_analyzer.exe" (
    "%~dp0pdf_analyzer.exe" %*
) else (
    echo Error: pdf_analyzer.exe not found in %~dp0
    exit /b 1
)