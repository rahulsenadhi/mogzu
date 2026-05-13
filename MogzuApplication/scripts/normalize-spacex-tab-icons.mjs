/**
 * Makes light/near-corner background pixels transparent for SpaceX tab PNGs.
 * Run: node scripts/normalize-spacex-tab-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../src/assets/spacex-tabs");

const files = [
  "conference.png",
  "coworking.png",
  "casual.png",
  "corporate-events.png",
];

function distSq(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

async function processFile(name) {
  const inputPath = path.join(dir, name);
  if (!fs.existsSync(inputPath)) {
    console.warn("skip missing:", inputPath);
    return;
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const stride = 4;

  const idx = (x, y) => (y * w + x) * stride;
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];
  let br = 0,
    bg = 0,
    bb = 0;
  for (const [cx, cy] of corners) {
    const i = idx(cx, cy);
    br += data[i];
    bg += data[i + 1];
    bb += data[i + 2];
  }
  br = Math.round(br / 4);
  bg = Math.round(bg / 4);
  bb = Math.round(bb / 4);

  // Max squared distance in RGB space to treat as background (tune per asset family)
  const thresholdSq = 55 * 55;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(x, y);
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (distSq(r, g, b, br, bg, bb) <= thresholdSq) {
        data[i + 3] = 0;
      }
    }
  }

  await sharp(data, {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toFile(inputPath);

  console.log("normalized:", name);
}

for (const f of files) {
  await processFile(f);
}

console.log("done");
