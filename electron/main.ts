import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import * as os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.mjs')
    }
  });

  win.loadFile('dist/index.html');
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('read-initial-directory', async (_event) => {
  try {
    const root = os.platform() === 'win32' ? process.env.SystemDrive + '\\' : '/';
    
    let files_arr: any = fs.readdirSync(root);

    let files: any = [];
    for (let i = 0; i < files_arr.length; i++) {
      const file = files_arr[i];
      
      const path = await getPath([root, file]);
      const stat = fs.statSync(path);
      
      if (!stat.isDirectory()) continue;

      files.push(
        {
          file_name: file,
          file_size: stat.size,
        }
      );
    }

    return files_arr;
  } catch (error: any) {
    return {error: error.message};
  }
});

// util //

async function getPath(directories: string[]): Promise<string> {
  let path = '';
  for (let i = 0; i < directories.length; i++) {
    const name = directories[i];
    path = path + name;
    if (i < directories.length -1) {
      path = path + '/';
    }
  }

  return path;
}