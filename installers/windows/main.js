const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const APP_URL =
  process.env.APP_URL || "https://healthcare-admin-job-search-tracker.vercel.app";

if (process.env.ELECTRON_REMOTE_DEBUG) {
  app.commandLine.appendSwitch(
    "remote-debugging-port",
    process.env.ELECTRON_REMOTE_DEBUG
  );
}

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

  const sectionHorizontalScrollbar = `
    .overflow-x-auto { overflow-x: auto; overflow-y: hidden; scrollbar-width: thin; scrollbar-color: #cbd5e1 #ffffff; }
    .overflow-x-auto::-webkit-scrollbar { height: 12px; width: 0; }
    .overflow-x-auto::-webkit-scrollbar:horizontal { height: 12px; }
    .overflow-x-auto::-webkit-scrollbar:vertical { display: none; width: 0; }
    .overflow-x-auto::-webkit-scrollbar-track { background: #ffffff; border-top: 1px solid #e2e8f0; }
    .overflow-x-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  `;
  win.webContents.on("did-finish-load", () => {
    win.webContents.insertCSS(sectionHorizontalScrollbar).catch(() => {});
  });

  // Always load the latest cloud app (avoid stale cached JS after deploys).
  win.webContents.session.clearCache().finally(() => {
    win.loadURL(APP_URL);
  });

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
