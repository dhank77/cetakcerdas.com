import { Menu, dialog, app } from 'electron';
import { mainWindow, createTestWindow } from './window-manager.js';

// Create application menu
export function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 1);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 1);
            }
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        }
      ]
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Office Application',
          submenu: [
            {
              label: 'Auto Detect',
              type: 'radio',
              checked: true,
              click: () => {
                // Set preference to auto-detect office application
                if (mainWindow) {
                  mainWindow.webContents.send('office-app-preference', { type: 'auto' });
                }
              }
            },
            {
              label: 'LibreOffice',
              type: 'radio',
              click: () => {
                // Set preference to use LibreOffice
                if (mainWindow) {
                  mainWindow.webContents.send('office-app-preference', { type: 'libreoffice' });
                }
              }
            },
            {
              label: 'Microsoft Office',
              type: 'radio',
              click: () => {
                // Set preference to use Microsoft Office
                if (mainWindow) {
                  mainWindow.webContents.send('office-app-preference', { type: 'msoffice' });
                }
              }
            },
            {
              label: 'WPS Office',
              type: 'radio',
              click: () => {
                // Set preference to use WPS Office
                if (mainWindow) {
                  mainWindow.webContents.send('office-app-preference', { type: 'wps' });
                }
              }
            }
          ]
        },
        {
          type: 'separator'
        },
        {
          label: 'Install LibreOffice Guide',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Install LibreOffice',
              message: 'LibreOffice Installation Guide',
              detail: 'To print DOCX files optimally, please install LibreOffice (free) from:\n\nhttps://www.libreoffice.org/download/\n\nAfter installation, restart the application to enable DOCX conversion and printing features.',
              buttons: ['OK', 'Open Download Page'],
              defaultId: 0
            }).then((result) => {
              if (result.response === 1) {
                // Open LibreOffice download page
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                require('electron').shell.openExternal('https://www.libreoffice.org/download/');
              }
            });
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Cetak Cerdas',
              detail: 'Desktop application for print management with local PDF processing capabilities.'
            });
          }
        },
        {
          label: 'Check for compability',
          click: () => createTestWindow(),
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}