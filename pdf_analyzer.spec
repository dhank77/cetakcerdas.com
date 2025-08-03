# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['fastapi\\document-analyzer\\main_hybrid.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['PIL._avif', 'PIL._webp', 'PIL._imagingtk', 'PIL._imagingcms', 'PIL._imagingmath'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['PIL._avif'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='pdf_analyzer',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=['PIL\_avif.cp312-win_amd64.pyd'],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
