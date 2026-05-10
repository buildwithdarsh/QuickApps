import { build } from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const isWatch = process.argv.includes('--watch');

const common = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  target: ['es2017', 'chrome90', 'firefox90', 'safari14'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
};

// ── IIFE bundle (injected into www/ in Capacitor builds)
await build({
  ...common,
  format: 'iife',
  globalName: 'QuickAppsBridge',
  outfile: 'dist/quickapps-bridge.js',
  minify: true,
  banner: {
    js: `/* QuickApps Bridge v${pkg.version} — https://quickapps.in */`,
  },
});

// ── UMD bundle (for npm users)
await build({
  ...common,
  format: 'cjs',
  outfile: 'dist/quickapps-bridge.umd.js',
  minify: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});

// ── ESM bundle (for npm/bundler users)
await build({
  ...common,
  format: 'esm',
  outfile: 'dist/quickapps-bridge.esm.js',
  minify: false,
  splitting: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});

console.log('✓ QuickApps Bridge built:');
console.log('  dist/quickapps-bridge.js     (IIFE — used in builds)');
console.log('  dist/quickapps-bridge.umd.js (CJS  — npm)');
console.log('  dist/quickapps-bridge.esm.js (ESM  — bundler)');
