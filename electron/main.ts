import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

import DirectoryNode from '../src/types/DirectoryNode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    fullscreen: true,
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

ipcMain.handle('get-osi-info', async (_event) => {
  const osi_info: OsiInfo = {
    rootdir: os.platform() === 'win32' ? (process.env.SystemDrive || process.cwd().slice(0, 3)) + '\\' : '/',
    homedir: os.homedir(),
    tmpdir: os.tmpdir(),
    hostname: os.hostname(),
  };

  return osi_info;
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('read-directory', async (_event, directory: string | null) => {
  if (directory) {
    console.log("Directory: ", directory);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(directory);
    } catch (error) {
      throw new Error('Error getting the stats of root directory!');
    }

    const node_info: FileInfo = {
      relative_idx: 0,
      file_name: directory,
      file_size: stat.size, // bytes
      file_size_percentage: 100,
      file_path: directory,
      is_directory: stat.isDirectory(),
      order_key: '',
      order_increasingly: false,
    };

    return await ReadProcess(new DirectoryNode(node_info, null));
  } else {
    return await ReadProcess(null);
  }
});

async function ReadProcess(node: DirectoryNode | null): Promise<DirectoryNode | null> {
  try {
    let directory: string = '';
    if (!node) {
      directory = os.homedir();
      let stat: fs.Stats;
      try {
        stat = fs.statSync(directory);
      } catch (error) {
        throw new Error('Error getting the stats of root directory!');
      }

      const node_info: FileInfo = {
        relative_idx: 0,
        file_name: directory,
        file_size: stat.size, // bytes
        file_size_percentage: 100,
        file_path: directory,
        is_directory: stat.isDirectory(),
        order_key: '',
      order_increasingly: false,
      };

      node = new DirectoryNode(node_info, null);
    } else {
      directory = node.info.file_path;
    }

    const files_arr: any = fs.readdirSync(directory);
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

      const new_node_info: FileInfo = {
        relative_idx: i,
        file_name: file,
        file_size: stat.size, // bytes
        file_size_percentage: 0,
        file_path: full_path,
        is_directory: stat.isDirectory(),
        order_key: '',
      order_increasingly: false,
      };

      const new_node = new DirectoryNode(new_node_info, node);
      if (new_node.info.is_directory) {
        await ReadProcess(new_node);
      }

      node.info.file_size += new_node_info.file_size;

      node.AddToChildren(new_node);
    }

    for (let i = 0; i < node.children.length; i++) {
      const _node = node.children[i];
      _node.info.file_size_percentage = Number(((_node.info.file_size / node.info.file_size) * 100).toFixed(4));
    }

    return node;
  } catch (error: any) {
    return null;
  }
}