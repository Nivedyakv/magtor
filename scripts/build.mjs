import {build} from 'esbuild';
import {mkdir, copyFile, writeFile, rm} from 'node:fs/promises';

// Retain the existing Sites / Cloudflare Worker artifact.
await mkdir('dist/server', {recursive: true});
await mkdir('dist/.openai', {recursive: true});
await build({entryPoints: ['src/worker.ts'], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', outfile: 'dist/server/index.js', loader: {'.html': 'text'}});
await copyFile('.openai/hosting.json', 'dist/.openai/hosting.json');

// Vercel Build Output API v3: static UI plus a bundled Node.js API function.
const output = '.vercel/output';
const fn = `${output}/functions/api/index.func`;
await rm(output, {recursive: true, force: true});
await mkdir(fn, {recursive: true});
await mkdir(`${output}/static`, {recursive: true});
await copyFile('public/index.html', `${output}/static/index.html`);
await build({entryPoints: ['src/vercel.mjs'], bundle: true, format: 'esm', platform: 'node', target: 'node22', outfile: `${fn}/index.mjs`, loader: {'.html': 'text'}});
await writeFile(`${fn}/.vc-config.json`, JSON.stringify({runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', maxDuration: 30}, null, 2));
await writeFile(`${output}/config.json`, JSON.stringify({
  version: 3,
  routes: [
    {src: '/.*', headers: {'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self' https://chatgpt.com"}, continue: true},
    {src: '/api(?:/.*)?', dest: '/api/index'},
    {handle: 'filesystem'},
  ],
}, null, 2));
console.log('Built Worker and Vercel static UI + Node.js API function.');
