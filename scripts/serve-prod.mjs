import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = join(root, 'dist');
const envFile = join(root, '.env.local');

loadLocalEnv();

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 5173);
const apiTarget = trimTrailingSlash(process.env.VITE_ADMIN_API_TARGET || 'http://localhost:5011');
const appSecret = process.env.ADMIN_APP_SECRET || '';

if (!existsSync(distDir)) {
  console.error('dist klasoru bulunamadi. Once `npm run build` calistirin.');
  process.exit(1);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/admin-api')) {
      await proxyRequest(req, res, url, '/admin-api', '');
      return;
    }

    if (url.pathname.startsWith('/admin-map-assets')) {
      await proxyRequest(req, res, url, '/admin-map-assets', '/storage/maps');
      return;
    }

    if (url.pathname.startsWith('/storage/maps')) {
      await proxyRequest(req, res, url, '', '');
      return;
    }

    serveStatic(url, res);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal server error');
  }
});

server.listen(port, host, () => {
  console.log(`Bulocation web serving on http://${host}:${port}`);
  console.log(`Proxying /admin-api -> ${apiTarget}`);
});

function loadLocalEnv() {
  if (!existsSync(envFile)) {
    return;
  }

  const lines = readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function proxyRequest(req, res, url, prefix, replacement) {
  const proxiedPath = prefix
    ? `${replacement}${url.pathname.slice(prefix.length)}`
    : url.pathname;
  const targetUrl = `${apiTarget}${proxiedPath}${url.search}`;
  const headers = new Headers();

  const skippedRequestHeaders = new Set([
    'connection',
    'expect',
    'host',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
  ]);

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || skippedRequestHeaders.has(key.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else {
      headers.set(key, value);
    }
  }

  if (appSecret) {
    headers.set('x-app-secret', appSecret);
  }

  const method = req.method || 'GET';
  const hasBody = !['GET', 'HEAD'].includes(method.toUpperCase());
  const response = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? req : undefined,
    duplex: hasBody ? 'half' : undefined,
  });

  const responseHeaders = {};
  response.headers.forEach((value, key) => {
    if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
      responseHeaders[key] = value;
    }
  });

  res.writeHead(response.status, responseHeaders);
  if (response.body) {
    for await (const chunk of response.body) {
      res.write(chunk);
    }
  }
  res.end();
}

function serveStatic(url, res) {
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = normalize(join(distDir, requestedPath));
  const safeFilePath = filePath.startsWith(distDir) && existsSync(filePath)
    ? filePath
    : join(distDir, 'index.html');

  res.writeHead(200, {
    'Content-Type': getContentType(safeFilePath),
    'Cache-Control': safeFilePath.endsWith('index.html')
      ? 'no-cache'
      : 'public, max-age=31536000, immutable',
  });
  createReadStream(safeFilePath).pipe(res);
}

function trimTrailingSlash(value) {
  return value.replace(/\/$/, '');
}

function getContentType(filePath) {
  switch (extname(filePath)) {
    case '.css':
      return 'text/css; charset=utf-8';
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}
