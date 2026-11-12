/**
 * Disbox Ultra - Electron Preload Script
 * Bridges safe desktop system capabilities to the Disbox web frontend.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('disboxDesktop', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron,
  nodeVersion: process.versions.node,
});
