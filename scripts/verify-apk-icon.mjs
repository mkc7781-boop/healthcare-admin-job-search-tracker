import { existsSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apkPath = join(root, "dist", "Healthcare-Job-Tracker.apk");
const extractDir = join(root, "dist", "apk-extract");
const aapt = join(homedir(), ".bubblewrap", "android-sdk", "build-tools", "34.0.0", "aapt.exe");

if (!existsSync(apkPath)) {
  console.error("APK missing");
  process.exit(1);
}

const badging = spawnSync(aapt, ["dump", "badging", apkPath], { encoding: "utf8" });
const version = badging.stdout.match(/versionCode='(\d+)'/)?.[1];
const label = badging.stdout.match(/application-label:'([^']+)'/)?.[1];
const icon = badging.stdout.match(/application-icon-\d+:'([^']+)'/)?.[1];

console.log(`versionCode: ${version}`);
console.log(`label: ${label}`);
console.log(`icon resource: ${icon}`);

if (!version || Number(version) < 3) {
  console.error("Expected versionCode >= 3");
  process.exit(1);
}

if (label !== "Healthcare Admin Job Tracker") {
  console.error("Unexpected app label");
  process.exit(1);
}

if (!icon) {
  console.error("No launcher icon in APK badging");
  process.exit(1);
}

if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });
mkdirSync(extractDir, { recursive: true });

const unzip = spawnSync(
  "powershell",
  [
    "-NoProfile",
    "-Command",
    `Expand-Archive -LiteralPath '${apkPath.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force`,
  ],
  { encoding: "utf8" }
);

// APK is zip but Expand-Archive may fail - use tar or jar
if (unzip.status !== 0) {
  const jar = spawnSync("jar", ["xf", apkPath], { cwd: extractDir, encoding: "utf8" });
  if (jar.status !== 0) {
    // fallback: copy jar from jdk
    const jarExe = join(homedir(), ".bubblewrap", "jdk", "bin", "jar.exe");
    spawnSync(jarExe, ["xf", apkPath], { cwd: extractDir, encoding: "utf8" });
  }
}

const adaptive = join(
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
const xml = readFileSync(adaptive, "utf8");
if (!xml.includes("ic_launcher_foreground")) {
  console.error("Adaptive icon XML missing ic_launcher_foreground");
  process.exit(1);
}

console.log("APK_ICON_VERIFY_OK");