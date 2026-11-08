import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from '../.vercel/output/functions/api/index.func/index.mjs';

test('Vercel output serves the UI and routes APIs to the Node function', async () => {
  const config = JSON.parse(await readFile('.vercel/output/config.json', 'utf8'));
  const fn = JSON.parse(await readFile('.vercel/output/functions/api/index.func/.vc-config.json', 'utf8'));
  assert.equal(config.version, 3);
  const route = config.routes.find(r => r.dest === '/api/index');
  assert.match('/api/search', new RegExp('^' + route.src + '$'));
  assert.match('/api/sources', new RegExp('^' + route.src + '$'));
  assert.doesNotMatch('/', new RegExp('^' + route.src + '$'));
  assert.equal(fn.runtime, 'nodejs22.x');
  assert.ok(fn.maxDuration > 18);
  assert.equal(await readFile('.vercel/output/static/index.html', 'utf8'), await readFile('public/index.html', 'utf8'));
});

test('Vercel Node handler supports sources, magnets, validation and method errors over HTTP', async () => {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    const sources = await fetch(origin + '/api/sources');
    assert.equal(sources.status, 200);
    assert.equal(sources.headers.get('cache-control'), 'no-store');
    assert.equal((await sources.json()).length, 8);
    const magnet = await fetch(origin + '/api/search?q=' + 'a'.repeat(40));
    const result = await magnet.json();
    assert.equal(result.ok, true);
    assert.match(result.results[0].magnet, /^magnet:\?xt=urn:btih:/);
    assert.equal((await fetch(origin + '/api/search?source=unknown')).status, 400);
    assert.equal((await fetch(origin + '/api/search', {method: 'POST'})).status, 405);
    assert.equal((await fetch(origin + '/api/missing')).status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
