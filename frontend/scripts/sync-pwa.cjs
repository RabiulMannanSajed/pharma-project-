/**
 * Copy generated PWA assets (sw.js, workbox-*.js, manifest.webmanifest) into
 * `public/` so they're served by `npm run dev` AND shipped in production builds.
 *
 * Run automatically via the postbuild npm script.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const pub = path.join(root, 'public');

if (!fs.existsSync(dist)) {
  console.warn('[sync-pwa] dist/ not found — skipping');
  process.exit(0);
}
if (!fs.existsSync(pub)) {
  fs.mkdirSync(pub, { recursive: true });
}

const copy = (src, dest) => {
  fs.copyFileSync(src, dest);
  console.log(`[sync-pwa] ${path.relative(root, src)} -> ${path.relative(root, dest)}`);
};

const sync = (name) => {
  const src = path.join(dist, name);
  const dest = path.join(pub, name);
  if (!fs.existsSync(src)) return;
  copy(src, dest);
};

// Service worker + workbox runtime
sync('sw.js');
const wb = fs.readdirSync(dist).find((f) => /^workbox-[A-Za-z0-9]+\.js$/.test(f));
if (wb) sync(wb);

// Web manifest (Vite-PWA generates this into dist/ at build time)
sync('manifest.webmanifest');

console.log('[sync-pwa] done');
