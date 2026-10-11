// Local preview: loopback only; API calls use the existing deployed API.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.js':'text/javascript'};
http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  if (['/api/cars','/api/gemini','/api/deepseek'].includes(url.pathname)) {
    // PowerShell uses Windows' configured proxy, including the user's VPN.
    const { spawn } = require('node:child_process');
    const bridge = spawn('pwsh', ['-NoProfile', '-Command', `
      $request = [Console]::In.ReadToEnd() | ConvertFrom-Json
      try {
        $parameters = @{ Uri=$request.url; Method=$request.method; TimeoutSec=60; UseBasicParsing=$true }
        if ($request.body) { $parameters.Body=$request.body; $parameters.ContentType='application/json' }
        $reply = Invoke-WebRequest @parameters
        @{ status=[int]$reply.StatusCode; body=[string]$reply.Content } | ConvertTo-Json -Compress
      } catch { @{ status=502; body='Preview API unavailable' } | ConvertTo-Json -Compress }
    `], { windowsHide: true });
    let output = '', body = '';
    bridge.stdout.on('data', chunk => output += chunk);
    bridge.on('error', () => { if (!res.writableEnded) { res.writeHead(502); res.end('Preview API unavailable'); } });
    bridge.on('close', () => {
      if (res.writableEnded) return;
      try { const reply = JSON.parse(output); res.writeHead(reply.status, {'content-type':'application/json'}); res.end(reply.body); }
      catch { res.writeHead(502); res.end('Preview API unavailable'); }
    });
    req.on('data', chunk => body += chunk);
    req.on('end', () => bridge.stdin.end(JSON.stringify({url:'https://moller-bil.vercel.app'+url.pathname+url.search,method:req.method,body})));
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

