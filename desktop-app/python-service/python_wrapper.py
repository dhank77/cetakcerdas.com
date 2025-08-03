#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Python wrapper to handle UTF-8 encoding issues with PyInstaller executable
"""

import os
import sys
import subprocess
import locale
import platform
import io

def main():
    # Force UTF-8 encoding with comprehensive Windows support
    if sys.platform == 'win32':
        # Set console code page to UTF-8
        try:
            os.system('chcp 65001 >nul 2>&1')
        except:
            pass
        
        # Wrap stdout/stderr with UTF-8 encoding
        if not isinstance(sys.stdout, io.TextIOWrapper) or sys.stdout.encoding != 'utf-8':
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        if not isinstance(sys.stderr, io.TextIOWrapper) or sys.stderr.encoding != 'utf-8':
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
        
        # Set locale to UTF-8 with fallbacks
        for locale_name in ['en_US.UTF-8', 'C.UTF-8', 'en_US', 'C']:
            try:
                locale.setlocale(locale.LC_ALL, locale_name)
                break
            except locale.Error:
                continue
    
    # Set environment variables
    env = os.environ.copy()
    env.update({
        'PYTHONIOENCODING': 'utf-8:replace',
        'PYTHONUTF8': '1',
        'PYTHONLEGACYWINDOWSSTDIO': '0',
        'LANG': 'en_US.UTF-8',
        'LC_ALL': 'en_US.UTF-8',
        'PYTHONUNBUFFERED': '1',
        'PYTHONDONTWRITEBYTECODE': '1',
        'PYTHONMALLOC': 'malloc',
        'PYTHONCOERCECLOCALE': '0'
    })
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the actual executable
    exe_path = os.path.join(script_dir, 'pdf_analyzer.exe')
    
    if not os.path.exists(exe_path):
        exe_path = os.path.join(script_dir, 'pdf_analyzer')
    
    if not os.path.exists(exe_path):
        print(f"Error: Could not find pdf_analyzer executable in {script_dir}")
        sys.exit(1)
    
    # Run the executable with the same arguments
    try:
        # Use subprocess with proper encoding handling
        result = subprocess.run(
            [exe_path] + sys.argv[1:], 
            env=env, 
            cwd=script_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        
        # Print output with proper encoding
        if result.stdout:
            print(result.stdout, end='')
        if result.stderr:
            print(result.stderr, end='', file=sys.stderr)
            
        sys.exit(result.returncode)
    except UnicodeDecodeError as e:
        print(f"Encoding error: {e}", file=sys.stderr)
        # Try without text mode as fallback
        try:
            result = subprocess.run([exe_path] + sys.argv[1:], env=env, cwd=script_dir)
            sys.exit(result.returncode)
        except Exception as fallback_e:
            print(f"Fallback execution failed: {fallback_e}", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"Error running executable: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()