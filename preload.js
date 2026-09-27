/* サイトに「PC版で 開いている」ことと、つなぎコードを わたす */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('zzDesktop', {
  isDesktop: true,
  platform: process.platform,
  onLink: (cb) => {
    ipcRenderer.on('zz-link', (_e, code) => { try { cb(code); } catch (_) {} });
    ipcRenderer.send('zz-ready');
  },
  retry: () => ipcRenderer.send('zz-retry')
});
