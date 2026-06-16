import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "public", "icon-512-source.jpg");
const publicDir = join(root, "public");

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(source)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(join(publicDir, `icon-${size}.png`));
}

await sharp(source)
  .resize(512, 512, { fit: "cover" })
  .extend({
    top: 64,
    bottom: 64,
    left: 64,
    right: 64,
    background: { r: 15, g: 118, b: 110, alpha: 1 },
  })
  .png()
  .toFile(join(publicDir, "icon-512-maskable.png"));

console.log("Icons generated in public/");