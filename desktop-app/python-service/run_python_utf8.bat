@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
set PYTHONLEGACYWINDOWSSTDIO=0
set PYTHONHASHSEED=0
set LANG=en_US.UTF-8
set LC_ALL=en_US.UTF-8
"%~dp0pdf_analyzer.exe" %*