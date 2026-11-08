import html from '../public/index.html';
import { SOURCES } from './upstream/sources/registry';
import { cachedSearch } from './upstream/sources/cache';
import { parseInput } from './upstream/sources/magnet';
const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers});
export default {
 async fetch(request: Request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return json({error:'Method not allowed'},405);
  if (url.pathname === '/api/sources') return json(SOURCES.map(({id,label,groups,reportsHealth})=>({id,label,groups,reportsHealth})));
  if (url.pathname === '/api/search') {
   const query = (url.searchParams.get('q') || '').trim();
   if (query.length > 300) return json({error:'Search must be 300 characters or fewer.'},400);
   const direct = parseInput(query);
   if (direct) return json({results:[{...direct,sizeBytes:0,seeders:0,leechers:0,source:'direct'}],ok:true});
   if (/^magnet:/i.test(query)) return json({error:'Invalid magnet link. A valid BitTorrent info hash is required.'},400);
   const source = SOURCES.find(s=>s.id === url.searchParams.get('source'));
   if (!source) return json({error:'Select a valid source.'},400);
   const controller = new AbortController();
   let timer: ReturnType<typeof setTimeout>;
   try {
    const timeout = new Promise<never>((_,reject)=> {timer = setTimeout(()=>{controller.abort();reject(new Error('Source timed out after 18 seconds.'));},18000);});
    const results = await Promise.race([cachedSearch(source,query,{signal:controller.signal}), timeout]);
    const valid = results.filter(r=>parseInput(r.magnet));
    return json({ok:true,source:source.id,results:valid.slice(0,150)});
   } catch(error) {
    return json({ok:false,source:source.id,results:[],error:controller.signal.aborted?'Source timed out.': error instanceof Error?error.message:'Source unavailable.'});
   } finally {clearTimeout(timer!);}
  }
  if (url.pathname.startsWith('/api/')) return json({error:'Not found'},404);
  if (url.pathname !== '/') return new Response('Not found',{status:404});
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self' https://chatgpt.com"}});
 }
};
