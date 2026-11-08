import worker from './worker.ts';

// Vercel's Node.js launcher supplies IncomingMessage / ServerResponse objects.
export default async function handler(req, res) {
  try {
    const request = new Request(new URL(req.url, 'https://torlink.internal'), {
      method: req.method,
    });
    const response = await worker.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((value, name) => res.setHeader(name, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({error: 'Search service unavailable. Please try again.'}));
  }
}
