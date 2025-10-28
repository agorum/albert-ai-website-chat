#!/usr/bin/env node
import { createServer } from 'node:http';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const DEFAULT_TARGET = 'https://www.agorum.com/albert/chat';
const DEFAULT_PORT = 8010;

const targetArg = process.argv[2];
const portArg = process.argv[3];

const TARGET = process.env.PROXY_TARGET || targetArg || DEFAULT_TARGET;
const PORT = Number(process.env.PROXY_PORT || portArg || DEFAULT_PORT);

const targetUrl = new URL(TARGET);
const targetOrigin = `${targetUrl.protocol}//${targetUrl.host}`;
const basePath = targetUrl.pathname.replace(/\/+$/, '');

function buildUpstreamUrl(requestPath) {
  const incoming = requestPath || '/';
  const [pathname, search = ''] = incoming.split('?');
  const normalizedRequestPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  let upstreamPath = `${basePath}${normalizedRequestPath}`.replace(/\/{2,}/g, '/');
  if (!upstreamPath.startsWith('/')) {
    upstreamPath = `/${upstreamPath}`;
  }
  const upstreamUrl = new URL(upstreamPath, targetOrigin);
  if (search) {
    upstreamUrl.search = `?${search}`;
  }
  return upstreamUrl;
}

function createCorsHeaders(req, upstreamHeaders = {}) {
  const origin = req.headers.origin || '*';
  const allowHeaders = req.headers['access-control-request-headers'];

  return {
    ...upstreamHeaders,
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-expose-headers': upstreamHeaders['access-control-expose-headers'] || '*',
    ...(allowHeaders ? { 'access-control-allow-headers': allowHeaders } : {}),
    'access-control-allow-methods': upstreamHeaders['access-control-allow-methods'] || 'GET,POST,OPTIONS',
    'access-control-max-age': upstreamHeaders['access-control-max-age'] || '86400',
  };
}

const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Fehler: Keine URL angegeben.');
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, createCorsHeaders(req));
    res.end();
    return;
  }

  const upstreamUrl = buildUpstreamUrl(req.url);

  const requestHeaders = {
    ...req.headers,
    host: upstreamUrl.host,
    origin: targetOrigin,
  };
  delete requestHeaders['content-length'];

  const transport = upstreamUrl.protocol === 'https:' ? https : http;

  const proxyReq = transport.request(
    upstreamUrl,
    {
      method: req.method,
      headers: requestHeaders,
    },
    (proxyRes) => {
      const headers = createCorsHeaders(req, proxyRes.headers);
      res.writeHead(proxyRes.statusCode || 500, headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (error) => {
    console.error('CORS-Proxy Fehler:', error);
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('502 – Fehler beim Weiterleiten der Anfrage.');
  });

  if (req.readable) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

server.listen(PORT, () => {
  console.log(`CORS proxy running at http://localhost:${PORT}`);
  console.log(`→ Weiterleitung zu ${TARGET}`);
});
