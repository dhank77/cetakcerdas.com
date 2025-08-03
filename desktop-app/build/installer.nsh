; Minimal NSIS customization to avoid conflicts
; Only essential customizations for antivirus compatibility

; Custom installation message
!macro customInstall
  ; Simple file association for PDF
  WriteRegStr HKCU "Software\Classes\.pdf\OpenWithProgids" "CetakCerdas.pdf" ""
  WriteRegStr HKCU "Software\Classes\CetakCerdas.pdf" "" "PDF Document for Print Analysis"
  WriteRegStr HKCU "Software\Classes\CetakCerdas.pdf\DefaultIcon" "" "$INSTDIR\Cetak Cerdas.exe,0"
  WriteRegStr HKCU "Software\Classes\CetakCerdas.pdf\shell\open\command" "" '"$INSTDIR\Cetak Cerdas.exe" "%1"'
!macroend