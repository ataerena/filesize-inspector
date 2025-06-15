import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    ForceQuit: () => ipcRenderer.invoke('force-quit'),
    GetOSInfo: () => ipcRenderer.invoke('get-osi-info'),
    SelectDirectory: () => ipcRenderer.invoke('select-directory'),
    ReadDirectory: (directory: string | null) => ipcRenderer.invoke('read-directory', directory),
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