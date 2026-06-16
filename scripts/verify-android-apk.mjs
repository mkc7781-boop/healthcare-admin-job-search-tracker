import { existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apkPath = join(root, "dist", "Healthcare-Job-Tracker.apk");
const sdkRoot = join(homedir(), ".bubblewrap", "android-sdk");
const aapt = join(sdkRoot, "build-tools", "34.0.0", "aapt.exe");

if (!existsSync(apkPath)) {
  console.error(`Missing APK: ${apkPath}`);
  process.exit(1);
}

const badging = spawnSync(aapt, ["dump", "badging", apkPath], { encoding: "utf8" });
if (badging.status !== 0) {
  console.error(badging.stderr || "aapt failed");
  process.exit(1);
}

const iconLine = badging.stdout.split("\n").find((line) => line.startsWith("application-icon"));
const labelLine = badging.stdout.split("\n").find((line) => line.startsWith("application-label"));
const versionLine = badging.stdout.split("\n").find((line) => line.startsWith("package:"));

console.log(versionLine?.trim());
console.log(labelLine?.trim());
console.log(iconLine?.trim() || "No application-icon line found");

const resDir = join(root, "installers", "twa", "app", "src", "main", "res", "mipmap-xxhdpi");
const launcher = join(resDir, "ic_launcher.png");
if (!existsSync(launcher) || statSync(launcher).size < 5000) {
  console.error("Launcher icon source looks missing or too small.");
  process.exit(1);
}

console.log(`Launcher source OK (${statSync(launcher).size} bytes)`);
console.log(`APK size: ${statSync(apkPath).size} bytes`);
console.log("VERIFY_OK");