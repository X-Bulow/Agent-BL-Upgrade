// Where mutable runtime state lives (x402 receipts, cached paid reports, Mystery reveals,
// agent decision logs). It is anchored to the project root, NOT the process's working
// directory: several stores used path.resolve('data/runtime/...'), so starting the server
// from another directory (PM2, systemd, `node /opt/app/src/app/server.js`) silently
// scattered state across directories. AGENTBL_RUNTIME_DIR overrides the location
// (e.g. a mounted volume in a container).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function runtimeDir(env = process.env) {
  const configured = String(env.AGENTBL_RUNTIME_DIR ?? '').trim();
  return configured ? path.resolve(configured) : path.join(projectRoot, 'data', 'runtime');
}

export function runtimePath(fileName, env = process.env) {
  return path.join(runtimeDir(env), fileName);
}
