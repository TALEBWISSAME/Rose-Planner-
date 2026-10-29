import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';

const read = path => readFile(new URL(`../dist/${path}`, import.meta.url));
const manifest = JSON.parse(await read('manifest.webmanifest'));
assert.equal(manifest.id, '/');
assert.equal(manifest.start_url, '/');
assert.equal(manifest.scope, '/');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.prefer_related_applications, false);
assert.ok(manifest.name && manifest.short_name);

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

for (const size of [192, 512]) {
  const icon = manifest.icons.find(i => i.sizes === `${size}x${size}` && i.purpose === 'any');
  assert.ok(icon, `Icône ${size} déclarée avec purpose any`);
  assert.equal(icon.type, 'image/png');
  assert.equal(icon.src, `/icon-${size}.png`);
  const png = await read(icon.src.slice(1));
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const chunks = [];
  let ended = false;
  let bytesPerPixel;
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    const end = offset + 12 + length;
    assert.ok(end <= png.length, 'PNG non tronqué');
    const type = png.toString('ascii', offset + 4, offset + 8);
    const bytes = png.subarray(offset + 8, offset + 8 + length);
    assert.equal(crc32(png.subarray(offset + 4, offset + 8 + length)), png.readUInt32BE(offset + 8 + length), `CRC ${type}`);
    if (type === 'IHDR') {
      assert.equal(bytes.readUInt32BE(0), size);
      assert.equal(bytes.readUInt32BE(4), size);
      assert.equal(bytes[8], 8, 'PNG 8 bits');
      assert.ok([2, 6].includes(bytes[9]), 'PNG RGB ou RGBA');
      bytesPerPixel = bytes[9] === 6 ? 4 : 3;
      assert.equal(bytes[12], 0, 'PNG non entrelacé');
    }
    if (type === 'IDAT') chunks.push(bytes);
    if (type === 'IEND') ended = true;
    offset = end;
  }
  assert.ok(ended && chunks.length && bytesPerPixel);
  const pixels = inflateSync(Buffer.concat(chunks));
  const stride = size * bytesPerPixel + 1;
  assert.equal(pixels.length, size * stride, 'Données PNG décompressables');
  for (let row = 0; row < size; row++) assert.ok(pixels[row * stride] <= 4, 'Filtre PNG valide');
  console.log(`OK : ${icon.src}, PNG ${size} × ${size}, intégrité et décompression`);
}

const html = (await read('index.html')).toString();
assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest">/);
const sw = (await read('sw.js')).toString();
assert.match(sw, /precacheAndRoute/);
assert.match(sw, /index\.html/);
for (const asset of ['icon-192.png', 'icon-512.png']) assert.ok(sw.includes(asset), `${asset} précaché`);
const assets = await readdir(new URL('../dist/assets/', import.meta.url));
const bundles = (await Promise.all(assets.filter(n => n.endsWith('.js')).map(n => read(`assets/${n}`)))).join('\n');
assert.ok(/new [\w$.]+\("\/sw\.js",\{scope:"\/",type:"classic"\}/.test(bundles), 'Service worker enregistré à /sw.js avec scope /');
assert.ok(bundles.includes('serviceWorker') && bundles.includes('Workbox'), 'Enregistrement Workbox présent');
const headers = (await read('_headers')).toString();
assert.ok(headers.includes('application/manifest+json') && headers.includes('Service-Worker-Allowed: /'));
console.log('OK : manifeste, chemins, scope, enregistrement SW, précache et en-têtes Netlify');
console.log('À confirmer après déploiement : réponses HTTPS publiques et installation sur Android.');
