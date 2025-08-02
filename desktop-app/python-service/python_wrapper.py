#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Python wrapper to handle UTF-8 encoding issues with PyInstaller executable
"""

import os
import sys
import subprocess
import locale

def main():
    # Force UTF-8 encoding
    if sys.platform == 'win32':
        # Set console code page to UTF-8
        os.system('chcp 65001 >nul 2>&1')
        
        # Set locale to UTF-8
        try:
            locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
        except locale.Error:
            try:
                locale.setlocale(locale.LC_ALL, 'C.UTF-8')
            except locale.Error:
                pass
    
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
        result = subprocess.run([exe_path] + sys.argv[1:], env=env, cwd=script_dir)
        sys.exit(result.returncode)
    except Exception as e:
        print(f"Error running executable: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()