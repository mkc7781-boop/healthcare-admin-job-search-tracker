import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "public", "icon-512-source.jpg");
const resRoot = join(root, "installers", "twa", "app", "src", "main", "res");

const densities = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

const splashSizes = {
  mdpi: 320,
  hdpi: 480,
  xhdpi: 720,
  xxhdpi: 1080,
  xxxhdpi: 1440,
};

async function writePng(bufferPromise, path) {
  mkdirSync(dirname(path), { recursive: true });
  await bufferPromise.png().toFile(path);
}

for (const [density, size] of Object.entries(densities)) {
  const mipmapDir = join(resRoot, `mipmap-${density}`);
  const launcher = sharp(source).resize(size, size, { fit: "cover" });
  const maskable = sharp(source)
    .resize(Math.round(size * 0.72), Math.round(size * 0.72), { fit: "cover" })
    .extend({
      top: Math.round(size * 0.14),
      bottom: Math.round(size * 0.14),
      left: Math.round(size * 0.14),
      right: Math.round(size * 0.14),
      background: { r: 15, g: 118, b: 110, alpha: 1 },
    });

  await writePng(launcher, join(mipmapDir, "ic_launcher.png"));
  await writePng(launcher, join(mipmapDir, "ic_launcher_foreground.png"));
  await writePng(maskable, join(mipmapDir, "ic_maskable.png"));
}

for (const [density, size] of Object.entries(splashSizes)) {
  const drawableDir = join(resRoot, `drawable-${density}`);
  await writePng(
    sharp(source).resize(Math.round(size * 0.35), Math.round(size * 0.35), { fit: "inside" }),
    join(drawableDir, "splash.png")
  );
}

const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/icon_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;

writeFileSync(join(resRoot, "mipmap-anydpi-v26", "ic_launcher.xml"), adaptiveIconXml);
writeFileSync(join(resRoot, "mipmap-anydpi-v26", "ic_launcher_round.xml"), adaptiveIconXml);

const colorsPath = join(resRoot, "values", "colors.xml");
writeFileSync(
  colorsPath,
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="shortcut_background">#F5F5F5</color>
    <color name="icon_background">#0F766E</color>
</resources>
`
);

console.log("Android launcher icons applied.");