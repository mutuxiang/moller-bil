// Local preview: loopback only; API calls use the existing deployed API.
const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.js':'text/javascript'};
http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  if (['/api/cars','/api/gemini','/api/deepseek'].includes(url.pathname)) {
    const upstream = https.request('https://moller-bil.vercel.app'+url.pathname+url.search,
      {method:req.method,headers:{'content-type':req.headers['content-type'] || 'application/json'}}, reply=>{
        res.writeHead(reply.statusCode, {'content-type':reply.headers['content-type'] || 'application/json'});
        reply.pipe(res);
      });
    upstream.setTimeout(60000,()=>upstream.destroy(new Error('Upstream timeout')));
    upstream.on('error',()=>{res.writeHead(502);res.end('Preview API unavailable')});
    req.pipe(upstream);
    return;
  }
  const file = path.resolve(root, '.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if (!file.startsWith(root+path.sep) || path.relative(root,file).split(path.sep).some(part=>part.startsWith('.'))) {
    res.writeHead(403);res.end();return;
  }
  fs.readFile(file,(err,data)=>{
    res.writeHead(err?404:200,{'content-type':types[path.extname(file)] || 'application/octet-stream','cache-control':'no-store'});
    res.end(err?'Not found':data);
  });
}).listen(8766,'127.0.0.1',()=>console.log('Preview ready at http://127.0.0.1:8766'));

