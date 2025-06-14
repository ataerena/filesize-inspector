import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import * as os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    fullscreen: true,
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

ipcMain.handle('read-directory', async (_event, directory: string | null) => {
  if (!directory) {
    directory = os.platform() === 'win32' ? (process.env.SystemDrive || process.cwd().slice(0, 3)) + '\\' : '/';;
  }
  
  return await ReadProcess(directory);
});

async function ReadProcess(directory: string): Promise<FileItem[] | {error: string}> {
  try {
    const files_arr: any = fs.readdirSync(directory);

    let files: any = [];
    for (let i = 0; i < files_arr.length; i++) {
      const file = files_arr[i];
      let stat: fs.Stats;
      const full_path = path.join(directory, file);

      try {
        stat = fs.statSync(full_path);
      } catch (error) {
        console.warn(`Skipping unaccessible path: ${full_path}`);
        continue;
      }

      files.push(
        {
          relative_idx: i,
          file_name: file,
          file_size: stat.size, // bytes
          full_path: full_path,
          is_directory: stat.isDirectory()
        }
      );
    }

    return files;
  } catch (error: any) {
    return { error: error.message };
  }
}