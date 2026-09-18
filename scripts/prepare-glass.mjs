import sharp from 'sharp';

const source = 'public/products/thermo-t/glass-photoreal-v1.png';
const target = 'public/products/thermo-t/glass-photoreal-v1-trim.png';
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
  if (data[(y * info.width + x) * 4 + 3] > 10) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
}
const padding = 8;
const left = Math.max(0, minX - padding), top = Math.max(0, minY - padding);
const width = Math.min(info.width - left, maxX - minX + 1 + padding * 2);
const height = Math.min(info.height - top, maxY - minY + 1 + padding * 2);
await sharp(source).extract({ left, top, width, height }).png({ compressionLevel: 9 }).toFile(target);
console.log(JSON.stringify({ source, target, sourceSize: [info.width, info.height], crop: { left, top, width, height } }, null, 2));
