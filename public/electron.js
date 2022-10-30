/**
 * Desktop App with Electron and React: Part 1 - Getting Started with Electron
 *
 * https://youtu.be/Cdu2O6o2DCg
 *
 * IPC - https://www.electronjs.org/docs/latest/tutorial/ipc
 * - one way (toMain), use ipcRenderer.send and ipcMain.on
 * - two way, use ipcRenderer.invoke and ipcMain.handle
 */

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const fs = require("fs");

const handleFormats = require("./main/utilities/handleFormats");

const AdmZip = require("adm-zip");

const log = require("electron-log");

log.transports.console.level = isDev ? "info" : "info";

let win;

function createWindow() {
  const mylog = log.scope("createWindow");

  mylog.debug(`sort-folders: ${store.get("sort-folders")}`);
  mylog.debug(`sort-files: ${store.get("sort-files")}`);

  mylog.debug("creating window");
  win = new BrowserWindow({
    width: 1400,
    height: 800,
    title: "ZXInfo - file manager",
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  win.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);

  // Open the DevTools.
  if (isDev) {
    mylog.debug("opening DevTools");
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
  });
});

/**
 * Uses settings
 */
const Store = require("electron-store");
const store = new Store();

ipcMain.handle("getStoreValue", (event, key) => {
  const mylog = log.scope("getStoreValue");
  const value = store.get(key);

  mylog.debug(`key, value = {${key}, ${value}}`);
  return store.get(key);
});

ipcMain.handle("setStoreValue", (event, key, value) => {
  const mylog = log.scope("setStoreValue");
  mylog.debug(`key, value = {${key}, ${value}}`);

  store.set(key, value);
});

// supportedExts must be synced with startFolder.fileFilters in App.js
const supportedExts = [".sna", ".z80", ".slt", ".dsk", ".trd", ".mdr", ".tap", ".tzx", ".zip"];

/**
 *
 * Recursively scans a directory for known files, returns a list of directories with valid files.
 *
 * @param {*} dirPath
 * @param {*} obj
 * @returns
 */
function scanDirectory(dirPath, obj) {
  const mylog = log.scope("scanDirectory");
  mylog.log(dirPath);

  let filesInDir = 0;
  fs.readdirSync(dirPath).forEach(function (file) {
    let filepath = path.join(dirPath, file);
    let stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      let totalFiles = scanDirectory(filepath, obj).totalFiles;
      if (totalFiles > 0) {
        obj.set(filepath, totalFiles);
      }
    } else {
      let extension = path.extname(filepath).toLowerCase();
      if (supportedExts.indexOf(extension) >= 0) {
        filesInDir++;
        mylog.debug(`counting ${filepath} - ${supportedExts}`);
      }
    }
  });

  if (filesInDir > 0) {
    obj.set(dirPath, filesInDir);
    win.webContents.send("notify-about-folder", { folder: dirPath, totalFiles: filesInDir });
  }
  return { folders: obj, totalFiles: filesInDir };
}

/**
 * Returns an arrray with names of folders containing known files
 */
ipcMain.handle("dialog:openFolder", async (event, arg) => {
  const mylog = log.scope("dialog:openFolder");
  mylog.log("open:Folder");

  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    mylog.debug(`handle('dialog:openFolder'): CANCEL`);
    return { root: null, folders: [], total: 0 }; // TODO: Handling cancel - use previous or ...
  } else {
    const foldersWithFiles = scanDirectory(filePaths[0], new Map());
    const files = new Map([...foldersWithFiles.folders]);
    var result = [];

    let totalFiles = 0;
    files.forEach((value, key) => {
      result.push(key);
      totalFiles += value;
    });

    if (store.get("sort-folders") === true) {
      result.sort();
    } else if (store.get("sort-folders") === false) {
      result.sort().reverse();
    }

    return { root: filePaths[0], folders: result, total: totalFiles };
  }
});

/**
 * Scan a folder for known files and return array with filenames, NOT including subfolders. Consider userSettings for sorting option.
 */
ipcMain.handle("scan-folder", (event, arg) => {
  const mylog = log.scope("scan-folder");
  mylog.log(`input: ${arg}`);
  var result = [];

  const dirPath = arg; // TODO: Validate input

  let filesInDir = 0;
  fs.readdirSync(dirPath).forEach(function (folder) {
    let filepath = path.join(dirPath, folder);
    let stat = fs.statSync(filepath);
    if (!stat.isDirectory()) {
      let extension = path.extname(filepath).toLowerCase();
      if (supportedExts.indexOf(extension) >= 0) {
        filesInDir++;
        mylog.debug(`found a file: ${filepath}, count=${filesInDir}`);
        result.push(filepath);
        win.webContents.send("notify-about-file", path.basename(filepath));
        mylog.info("adding: " + path.basename(filepath));
      }
    }
  });

  mylog.log(`total files: ${filesInDir}`);
  return result;
});

/**
 *  identify metadata about file
 *
 * .SNA and 49179 bytes = SNA 48K
 * .SNA and 131103 OR 147487 bytes = SNA 128K
 * .Z80 and ...
 */
ipcMain.handle("load-file", async (event, arg) => {
  const mylog = log.scope("load-file");

  let result; // either object or array (zip)

  const filename = arg; // TODO: Validate input
  var extension = path.extname(filename).toLowerCase();
  let buf = fs.readFileSync(filename);

  let fileObj = handleFormats.getZXFormat(filename, null, buf);
  mylog.debug(fileObj.sha512);

  if (extension === ".sna") {
  } else if (extension === ".z80") {
  } else if (extension === ".tap") {
  } else if (extension === ".zip") {
    result = [fileObj];
    var zip = new AdmZip(filename);
    var zipEntries = zip.getEntries();
    mylog.info(`ZIP file detected, ${zipEntries.length} entries`);
    zipEntries.forEach(async function (zipEntry) {
      if (!zipEntry.isDirectory) {
        let zxObj = handleFormats.getZXFormat(filename, zipEntry.name, zipEntry.getData());
        if(zxObj !== null) result.push(zxObj);
      }
    });
  } else {
    fileObj.type = null;
    mylog.warn(`Can't identify file format`);
    fileObj.scr = "./images/no_image.png";
  }

  if (fileObj.error) {
    return [fileObj];
  }

  if (result && result.length > 0) {
    return result;
  } else {
    return [fileObj];
  }
});
