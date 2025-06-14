import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    ReadInitialDirectory: () => ipcRenderer.invoke('read-initial-directory'),
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