#!/usr/bin/env node
import { createServer } from 'node:http';
import { createReadStream, stat } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 8080);
const PUBLIC_DIR = resolve(process.argv[2] || 'examples');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 – Datei nicht gefunden');
}

function sendError(res, error) {
  res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`500 – Fehler: ${error.message}`);
}

const server = createServer((req, res) => {
  if (!req.url) {
    sendNotFound(res);
    return;
  }

  const requestedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = requestedUrl.pathname;

  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const filePath = join(PUBLIC_DIR, decodeURIComponent(pathname));
  stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendNotFound(res);
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = createReadStream(filePath);
    stream.on('error', (streamError) => sendError(res, streamError));
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Albert Chat Dev Server läuft auf http://localhost:${PORT}`);
  console.log(`Serving Inhalte aus: ${PUBLIC_DIR}`);
});
