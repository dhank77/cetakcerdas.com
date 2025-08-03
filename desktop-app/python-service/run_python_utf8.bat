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

REM Try Python 3 first, then fallback to python
where python3 >nul 2>&1
if %errorlevel% equ 0 (
    python3 python_wrapper.py %*
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        python python_wrapper.py %*
    ) else (
        echo Error: Python not found in PATH
        exit /b 1
    )
)