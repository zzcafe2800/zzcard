/* ズズラジオ体操部 PC版（Electron）
   ・中身は いつもの サイトを 開く → サイトを 更新すれば PC版も 自動で 最新
   ・zzcard://link?c=コード で サイトと つなぐ（つなぎコード）
   ・音は さいしょから 鳴らせる（サイトの 自動再生の 制限なし） */
const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');

const SITE = 'https://zzcafe2800.github.io/zzcard/';
let win = null;
let pendingLink = null;

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (process.defaultApp && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient('zzcard', process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient('zzcard');
}

function linkFrom(argv) {
  const u = (argv || []).find((a) => typeof a === 'string' && a.startsWith('zzcard://'));
  if (!u) return null;
  try { return new URL(u).searchParams.get('c'); } catch (_) { return null; }
}

function sendLink(code) {
  if (!code) return;
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) win.restore();
    win.show(); win.focus();
    win.webContents.send('zz-link', code);
  } else {
    pendingLink = code;
  }
}

function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    backgroundColor: '#dfe7ef', title: 'ズズラジオ体操部',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadURL(SITE);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(SITE)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(SITE) && !url.startsWith('zzcard://')) { e.preventDefault(); shell.openExternal(url); }
  });
  win.webContents.on('did-fail-load', (_e, code, _d, url, isMain) => {
    if (isMain && code !== -3) win.loadFile(path.join(__dirname, 'offline.html'));
  });
  win.on('closed', () => { win = null; });
}

ipcMain.on('zz-ready', () => {
  if (pendingLink && win) { win.webContents.send('zz-link', pendingLink); pendingLink = null; }
});
ipcMain.on('zz-retry', () => { if (win) win.loadURL(SITE); });

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    const c = linkFrom(argv);
    if (c) sendLink(c);
    else if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.on('open-url', (e, url) => { e.preventDefault(); sendLink(linkFrom([url])); });
  app.whenReady().then(() => {
    pendingLink = linkFrom(process.argv);
    createWindow();
    try { require('electron-updater').autoUpdater.checkForUpdatesAndNotify(); } catch (_) {}
  });
  app.on('window-all-closed', () => app.quit());
}
