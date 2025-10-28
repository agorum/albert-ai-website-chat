#!/usr/bin/env node
import { createServer } from 'node:http';
import { createReadStream, stat } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 8080);
const PUBLIC_DIR = resolve(process.argv[2] || 'examples');
const PROJECT_ROOT = resolve(PUBLIC_DIR, '..');
const DIST_DIR = resolve(PROJECT_ROOT, 'dist');

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

function trySendFile(res, filePath, fallbackPath) {
  const candidate = fallbackPath ?? filePath;
  stat(candidate, (err, stats) => {
    if (err || !stats.isFile()) {
      if (fallbackPath === undefined) {
        sendNotFound(res);
        return;
      }
      trySendFile(res, fallbackPath);
      return;
    }
    const ext = extname(candidate).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = createReadStream(candidate);
    stream.on('error', (streamError) => sendError(res, streamError));
    stream.pipe(res);
  });
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

  const decodedPath = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (decodedPath.includes('..')) {
    sendNotFound(res);
    return;
  }

  const requestedWithinDist = decodedPath.startsWith('dist/');

  const primaryPath = join(PUBLIC_DIR, decodedPath);
  const fallbackPath = requestedWithinDist ? resolve(DIST_DIR, decodedPath.slice('dist/'.length)) : undefined;

  trySendFile(res, primaryPath, fallbackPath);
});

server.listen(PORT, () => {
  console.log(`ALBERT | AI dev server running at http://localhost:${PORT}`);
  console.log(`Serving Inhalte aus: ${PUBLIC_DIR}`);
});
