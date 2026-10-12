// Static file server for /public: traversal-safe, ETag/304 revalidation, per-type
// Cache-Control, and cached br/gzip variants for text assets.
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { HttpError, safeDecodeURIComponent, sendText } from './http.js';

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

const TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
});

const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.json', '.map', '.txt', '.xml', '.svg']);
const MIN_COMPRESS_BYTES = 1024;
const MAX_CACHED_BYTES = 4 * 1024 * 1024; // covers the 2.4 MB cosmjs vendor bundle and its br/gzip variants

function cacheControlFor(urlPath, ext) {
  if (urlPath.startsWith('/vendor/')) return 'public, max-age=31536000, immutable'; // filenames carry the version
  if (ext === '.html') return 'no-cache';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.ico', '.woff2', '.svg'].includes(ext)) {
    return 'public, max-age=86400';
  }
  return 'no-cache'; // js/css/json: always revalidate via ETag
}

function pickEncoding(request) {
  const accepted = String(request.headers['accept-encoding'] ?? '');
  if (/\bbr\b/iu.test(accepted)) return 'br';
  if (/\bgzip\b/iu.test(accepted)) return 'gzip';
  return null;
}

export function createStaticHandler({ rootDir, csp = null, maxEntries = 128 } = {}) {
  const root = path.resolve(rootDir);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  const cache = new Map(); // absolute path -> { mtimeMs, size, etag, body, encoded: {br?, gzip?} }

  async function load(filePath, stat) {
    const cached = cache.get(filePath);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) return cached;
    const entry = {
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      etag: `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`,
      body: await fs.readFile(filePath),
      encoded: {}
    };
    if (entry.body.length <= MAX_CACHED_BYTES) {
      if (cache.size >= maxEntries) cache.delete(cache.keys().next().value);
      cache.set(filePath, entry);
    }
    return entry;
  }

  async function encode(entry, encoding) {
    if (!(encoding in entry.encoded)) {
      entry.encoded[encoding] = encoding === 'br'
        ? await brotli(entry.body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
        : await gzip(entry.body, { level: 6 });
    }
    return entry.encoded[encoding];
  }

  return async function serveStatic(request, response, pathname) {
    const decoded = safeDecodeURIComponent(pathname);
    if (decoded.includes('\0')) throw new HttpError(400, 'malformed_url', 'Malformed request path');

    const urlPath = decoded === '/' ? '/index.html' : decoded;
    const filePath = path.normalize(path.join(root, urlPath));
    if (filePath !== root && !filePath.startsWith(rootWithSep)) {
      sendText(response, 403, 'Forbidden');
      return;
    }

    let stat;
    try {
      stat = await fs.stat(filePath);
    } catch {
      sendText(response, 404, 'Not found');
      return;
    }
    if (!stat.isFile()) {
      sendText(response, 404, 'Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const entry = await load(filePath, stat);
    const headers = {
      'content-type': TYPES[ext] ?? 'application/octet-stream',
      'cache-control': cacheControlFor(urlPath, ext),
      etag: entry.etag
    };
    if (ext === '.html' && csp) headers['content-security-policy'] = csp;

    if (request.headers['if-none-match'] === entry.etag) {
      response.writeHead(304, headers);
      response.end();
      return;
    }

    let body = entry.body;
    if (COMPRESSIBLE.has(ext) && body.length >= MIN_COMPRESS_BYTES) {
      headers.vary = 'Accept-Encoding';
      const encoding = pickEncoding(request);
      if (encoding) {
        body = await encode(entry, encoding);
        headers['content-encoding'] = encoding;
      }
    }
    headers['content-length'] = body.length;
    response.writeHead(200, headers);
    response.end(request.method === 'HEAD' ? undefined : body);
  };
}
