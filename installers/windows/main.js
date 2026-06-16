const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const APP_URL =
  process.env.APP_URL || "https://healthcare-admin-job-search-tracker.vercel.app";

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 920,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    title: "Healthcare Admin Job Tracker",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadURL(APP_URL);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});