import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    ReadDirectory: (directory: string) => ipcRenderer.invoke('read-directory', directory),
    GetOSInfo: () => ipcRenderer.invoke('get-osi-info'),
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const type of ['chrome', 'node', 'electron']) {
      const version = (process.versions as Record<string, string>)[type];
      replaceText(`${type}-version`, version);
    }
});