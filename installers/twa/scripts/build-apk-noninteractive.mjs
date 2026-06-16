import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const {
  TwaManifest,
  TwaGenerator,
  Config,
  JdkHelper,
  AndroidSdkTools,
  ConsoleLog,
  BufferedLog,
  GradleWrapper,
} = require("@bubblewrap/core");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "twa-manifest.json");
const configPath = join(homedir(), ".bubblewrap", "config.json");

function checksum(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function main() {
  process.chdir(root);

  const configData = readFileSync(configPath, "utf8");
  const config = Config.deserialize(configData);
  const log = new ConsoleLog("apk-build");

  const manifest = await TwaManifest.fromFile(manifestPath);
  manifest.signingKey.path = join(root, "android.keystore");

  log.info("Generating Android project...");
  const twaGenerator = new TwaGenerator();
  const buffered = new BufferedLog(log);
  await twaGenerator.createTwaProject(root, manifest, buffered);
  buffered.flush();

  const applyIcons = spawnSync(
    process.execPath,
    [join(root, "..", "..", "scripts", "apply-android-icons.mjs")],
    { stdio: "inherit" }
  );
  if (applyIcons.status !== 0) {
    throw new Error("Failed to apply Android launcher icons.");
  }

  const manifestContents = readFileSync(manifestPath);
  writeFileSync(join(root, "manifest-checksum.txt"), checksum(manifestContents));

  process.env.ANDROID_HOME = config.androidSdkPath;
  process.env.ANDROID_SDK_ROOT = config.androidSdkPath;
  process.env.JAVA_HOME = config.jdkPath;

  const jdkHelper = new JdkHelper(process, config);
  const androidSdkTools = await AndroidSdkTools.create(process, config, jdkHelper, log);
  const gradleWrapper = new GradleWrapper(process, androidSdkTools);

  log.info("Building release APK...");
  await gradleWrapper.assembleRelease();

  const unsignedApk = join(root, "app/build/outputs/apk/release/app-release-unsigned.apk");
  const alignedApk = join(root, "app-release-unsigned-aligned.apk");
  const signedApk = join(root, "app-release-signed.apk");

  await androidSdkTools.zipalignOnlyVerification(unsignedApk);
  copyFileSync(unsignedApk, alignedApk);

  const keystorePassword = process.env.BUBBLEWRAP_KEYSTORE_PASSWORD;
  const keyPassword = process.env.BUBBLEWRAP_KEY_PASSWORD;
  if (!keystorePassword || !keyPassword) {
    throw new Error("Missing BUBBLEWRAP_KEYSTORE_PASSWORD or BUBBLEWRAP_KEY_PASSWORD");
  }

  await androidSdkTools.apksigner(
    manifest.signingKey.path,
    `"${keystorePassword}"`,
    manifest.signingKey.alias,
    `"${keyPassword}"`,
    alignedApk,
    signedApk
  );

  const distDir = join(root, "..", "..", "dist");
  mkdirSync(distDir, { recursive: true });
  const finalApk = join(distDir, "Healthcare-Job-Tracker.apk");
  copyFileSync(signedApk, finalApk);

  log.info(`APK ready: ${finalApk}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});