/**
 * KSoM Library OPAC - Local & Production Reverse Proxy Server
 * 
 * Powered by Node.js built-in modules (Zero dependencies required).
 * 
 * Features:
 * 1. Serves the OPAC portal landing page at `/` (index.html, assets).
 * 2. Transparently reverse-proxies Koha catalog requests (/cgi-bin/*, /opac-tmpl/*)
 *    directly to http://210.212.228.235 with host header preservation.
 * 3. Rewrites redirect headers and links so the IP 210.212.228.235 is never
 *    exposed in the browser address bar.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;
const KOHA_HOST = '210.212.228.235';
const KOHA_PORT = 80;
const KOHA_VHOST = 'opac.ksom.res.in';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((clientReq, clientRes) => {
  const parsedUrl = url.parse(clientReq.url, true);
  const pathname = parsedUrl.pathname;

  // 1. Check if request is for the OPAC Catalogue (Reverse Proxy)
  const isKohaPath = pathname.startsWith('/cgi-bin/') ||
                     pathname.startsWith('/opac-tmpl/') ||
                     pathname.startsWith('/opac/') ||
                     pathname === '/opac' ||
                     clientReq.url.includes('koha');

  if (isKohaPath) {
    proxyToKoha(clientReq, clientRes);
    return;
  }

  // 2. Serve static landing portal files
  let safePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(__dirname, safePath);

  // Security check to prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    clientRes.writeHead(403, { 'Content-Type': 'text/plain' });
    clientRes.end('Access denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      clientRes.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(clientRes);
    } else {
      // If path not found locally, route to Koha as fallback
      proxyToKoha(clientReq, clientRes);
    }
  });
});

/**
 * Handles reverse proxy forwarding to the Koha backend server
 */
function proxyToKoha(clientReq, clientRes) {
  let targetPath = clientReq.url;
  if (targetPath === '/opac') {
    targetPath = '/';
  }

  const clientHost = clientReq.headers.host || `localhost:${PORT}`;

  const proxyOptions = {
    hostname: KOHA_HOST,
    port: KOHA_PORT,
    path: targetPath,
    method: clientReq.method,
    headers: {
      ...clientReq.headers,
      'host': KOHA_VHOST, // Pass the Koha VirtualHost
      'x-forwarded-host': clientHost,
      'x-forwarded-for': clientReq.socket.remoteAddress || '',
      'x-forwarded-proto': 'http'
    }
  };

  const proxyReq = http.request(proxyOptions, (proxyRes) => {
    const headers = { ...proxyRes.headers };

    // Rewrite Location redirects so the user stays on the proxy domain
    if (headers.location) {
      headers.location = headers.location
        .replace(/http:\/\/210\.212\.228\.235(:\d+)?/gi, `http://${clientHost}`)
        .replace(/https?:\/\/opac\.ksom\.res\.in/gi, `http://${clientHost}`);
    }

    // Adjust cookies if necessary
    if (headers['set-cookie']) {
      headers['set-cookie'] = headers['set-cookie'].map(cookie =>
        cookie.replace(/Domain=[^;]+/i, '')
      );
    }

    clientRes.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(clientRes);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy connection error to Koha server:', err.message);
    clientRes.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
    clientRes.end(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>502 - Bad Gateway</h2>
        <p>Could not connect to the internal Koha Library catalog server.</p>
        <p><a href="/" style="color: #005c97;">Return to KSoM OPAC Portal</a></p>
      </div>
    `);
  });

  clientReq.pipe(proxyReq);
}

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  KSoM OPAC Reverse Proxy Server is running!`);
  console.log(`  Landing Page : http://localhost:${PORT}`);
  console.log(`  Koha OPAC    : http://localhost:${PORT}/cgi-bin/koha/opac-main.pl`);
  console.log(`  Target Host  : http://${KOHA_HOST}:${KOHA_PORT} (${KOHA_VHOST})`);
  console.log(`====================================================`);
});

