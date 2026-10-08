// Processo principal do Electron.
// O package.json declara "type": "module", então este arquivo é um módulo ES
// (import/export). Com require() o app não abria: "require is not defined".
import { app, BrowserWindow, session } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !!process.env.ELECTRON_DEV;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: '#0b0b14',
    title: 'Piano Interativo',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Janelas de projeção do Piano Tipográfico e do Piano Gelatina (window.open).
  // Abrem sem menu e podem ir para tela cheia (duplo clique ou F11) no telão.
  win.webContents.setWindowOpenHandler(() => ({
    action: 'allow',
    overrideBrowserWindowOptions: {
      backgroundColor: '#000000',
      autoHideMenuBar: true,
      fullscreenable: true,
      title: 'Projeção',
    },
  }));

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  // Permissões liberadas: MIDI (os três apps) e tela cheia (janelas de
  // projeção). Todo o resto continua bloqueado. Sem 'fullscreen' aqui, o
  // duplo clique na projeção falhava com "Permissions check failed".
  const PERMITIDAS = new Set(['midi', 'midiSysex', 'fullscreen']);
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(PERMITIDAS.has(permission));
  });
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => PERMITIDAS.has(permission));

  // F11 alterna tela cheia em qualquer janela, inclusive nas de projeção
  app.on('browser-window-created', (_e, w) => {
    w.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key === 'F11') {
        w.setFullScreen(!w.isFullScreen());
        event.preventDefault();
      }
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
