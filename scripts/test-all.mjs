import { existsSync, statSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const productionUrl = "https://healthcare-admin-job-search-tracker.vercel.app";
const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";
let failed = 0;
let devProcess = null;

function pass(label) {
  console.log(`[PASS] ${label}`);
}

function fail(label, detail = "") {
  console.log(`[FAIL] ${label}${detail ? ` — ${detail}` : ""}`);
  failed += 1;
}

function runNode(script, cwd = root) {
  return spawnSync(process.execPath, [script], { cwd, encoding: "utf8", shell: false });
}

function runNpm(args, cwd = root) {
  if (isWin) {
    return spawnSync("cmd.exe", ["/c", "npm", ...args], { cwd, encoding: "utf8", shell: false });
  }
  return spawnSync(npmCmd, args, { cwd, encoding: "utf8", shell: false });
}

function stopDevServer() {
  if (!devProcess?.pid) return;
  if (isWin) {
    spawnSync("taskkill", ["/F", "/T", "/PID", String(devProcess.pid)], { shell: false });
  } else {
    try {
      process.kill(-devProcess.pid, "SIGTERM");
    } catch {
      // already stopped
    }
  }
  devProcess = null;
}

async function fetchOk(url, label, expectStatus = 200) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (res.status === expectStatus) {
      pass(`${label} (${res.status})`);
      return res;
    }
    fail(label, `status ${res.status}`);
  } catch (err) {
    fail(label, err.message);
  }
  return null;
}

console.log("=== Healthcare Job Tracker — Full Test Suite ===\n");

// Static checks first
console.log("-- Icons --");
for (const icon of ["icon-192.png", "icon-512.png", "icon-512-maskable.png"]) {
  const path = join(root, "public", icon);
  if (existsSync(path) && statSync(path).size > 1000) pass(`public/${icon}`);
  else fail(`public/${icon}`, "missing or too small");
}

console.log("\n-- Android launcher resources --");
const mipmap = join(root, "installers", "twa", "app", "src", "main", "res", "mipmap-xxhdpi");
for (const file of ["ic_launcher.png", "ic_launcher_foreground.png", "ic_maskable.png"]) {
  const path = join(mipmap, file);
  if (existsSync(path) && statSync(path).size > 3000) pass(`mipmap-xxhdpi/${file}`);
  else fail(`mipmap-xxhdpi/${file}`, "missing or too small");
}

const adaptiveXml = join(
  root,
  "installers",
  "twa",
  "app",
  "src",
  "main",
  "res",
  "mipmap-anydpi-v26",
  "ic_launcher.xml"
);
if (existsSync(adaptiveXml)) {
  const xml = readFileSync(adaptiveXml, "utf8");
  if (xml.includes("ic_launcher_foreground") && xml.includes("icon_background")) {
    pass("adaptive icon XML configured");
  } else {
    fail("adaptive icon XML configured", "bad foreground/background refs");
  }
} else {
  fail("adaptive icon XML configured", "file missing");
}

console.log("\n-- APK --");
const apk = join(root, "dist", "Healthcare-Job-Tracker.apk");
if (existsSync(apk) && statSync(apk).size > 500000) {
  pass(`APK exists (${statSync(apk).size} bytes)`);
  const verify = runNode(join(root, "scripts", "verify-android-apk.mjs"));
  if (verify.status === 0 && verify.stdout.includes("VERIFY_OK")) pass("APK metadata verify");
  else fail("APK metadata verify", (verify.stdout || verify.stderr || "").trim().split("\n").pop());
  const iconVerify = runNode(join(root, "scripts", "verify-apk-icon.mjs"));
  if (iconVerify.status === 0 && iconVerify.stdout.includes("APK_ICON_VERIFY_OK")) pass("APK icon verify");
  else fail("APK icon verify", (iconVerify.stdout || iconVerify.stderr || "").trim().split("\n").pop());
} else {
  fail("APK exists", "missing — run build-android-apk.bat");
}

console.log("\n-- Windows installer --");
const winInstaller = join(
  root,
  "installers",
  "windows",
  "dist",
  "Healthcare Admin Job Tracker Setup 1.0.0.exe"
);
if (existsSync(winInstaller) && statSync(winInstaller).size > 1000000) {
  pass("Windows installer exists");
} else {
  fail("Windows installer exists", "run build-windows-installer.bat");
}

console.log("\n-- Production URLs --");
await fetchOk(`${productionUrl}/login`, "Production /login");
await fetchOk(`${productionUrl}/manifest.json`, "Production manifest.json");
await fetchOk(`${productionUrl}/icon-512.png`, "Production icon-512.png");
const assetRes = await fetchOk(`${productionUrl}/.well-known/assetlinks.json`, "Production assetlinks.json");
if (assetRes) {
  const text = await assetRes.text();
  try {
    const json = JSON.parse(text);
    if (json[0]?.target?.package_name === "com.healthcare.jobtracker") {
      pass("Production assetlinks package name");
    } else {
      fail("Production assetlinks package name", "unexpected content");
    }
  } catch {
    fail("Production assetlinks JSON parse", "got HTML or invalid JSON — deploy middleware fix");
  }
}

const manifestRes = await fetch(`${productionUrl}/manifest.json`);
if (manifestRes.ok) {
  const manifest = await manifestRes.json();
  const hasPng = manifest.icons?.some((i) => i.src?.includes(".png"));
  if (hasPng) pass("Production manifest has PNG icons");
  else fail("Production manifest has PNG icons");
}

// Local API with ephemeral dev server (kill only our child, not all node.exe)
console.log("\n-- Local API --");
stopDevServer();
const devCmd = isWin ? "cmd.exe" : npmCmd;
const devArgs = isWin ? ["/c", "npm run dev"] : ["run", "dev"];
devProcess = spawn(devCmd, devArgs, {
  cwd: root,
  detached: true,
  stdio: "ignore",
  shell: false,
  windowsHide: true,
});
devProcess.unref();
await new Promise((r) => setTimeout(r, 15000));

const local = runNode(join(root, "scripts", "test-agent-api.mjs"));
if (local.status === 0) pass("Local agent API");
else fail("Local agent API", (local.stdout || local.stderr || "").trim().split("\n").pop());

stopDevServer();
await new Promise((r) => setTimeout(r, 2000));

// Dev + production build share .next; clear it so build does not corrupt a running dev server.
const nextDir = join(root, ".next");
if (existsSync(nextDir)) rmSync(nextDir, { recursive: true, force: true });

console.log("\n-- Build --");
const build = runNpm(["run", "build"]);
if (build.status === 0) pass("npm run build");
else fail("npm run build", (build.stderr || build.stdout || "").trim().split("\n").slice(-3).join(" "));

console.log("\n-- Lint --");
const lint = runNpm(["run", "lint"]);
if (lint.status === 0) pass("npm run lint");
else fail("npm run lint", (lint.stderr || lint.stdout || "").trim().split("\n").slice(-3).join(" "));

console.log(`\n=== RESULT: ${failed === 0 ? "ALL PASSED" : `${failed} FAILED`} ===`);
process.exit(failed === 0 ? 0 : 1);