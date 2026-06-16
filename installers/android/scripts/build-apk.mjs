import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const isWin = process.platform === "win32";
const gradlew = isWin ? "gradlew.bat" : "gradlew";
const gradlePath = join(root, "android", gradlew);

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: isWin });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Syncing Capacitor Android project...");
run("npx", ["cap", "sync", "android"], root);

if (!existsSync(gradlePath)) {
  console.error("Android project missing. Run: npx cap add android");
  process.exit(1);
}

const javaHome = process.env.JAVA_HOME;
if (!javaHome) {
  console.error("\nJAVA_HOME is not set.");
  console.error("Install Android Studio, then set JAVA_HOME to its bundled JDK.");
  console.error('Example: C:\\Program Files\\Android\\Android Studio\\jbr');
  process.exit(1);
}

console.log("\nBuilding debug APK...");
run(gradlew, ["assembleDebug"], join(root, "android"));

const apk = join(root, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
console.log(`\nAPK ready:\n${apk}`);