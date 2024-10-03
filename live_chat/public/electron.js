const electron = require("electron");
const path = require("path");

const { app, BrowserWindow } = electron;

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Đặt thành false để tăng cường bảo mật
      contextIsolation: true, // Bảo mật tốt hơn
      webviewTag: true, // Bật webview
    },
  });

  // Load the index.html of the app.
  console.log(__dirname);
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));

  // Mở Developer Tools nếu cần
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", createWindow);
