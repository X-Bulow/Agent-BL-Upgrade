// Self-hosted browser dependencies (public/vendor).
//
// The dashboard used to import ethers and @cosmjs/stargate from esm.sh / jsDelivr at
// runtime. A wallet-connected page should not execute third-party code fetched at
// load time (a compromised CDN could request signatures), so both modules are
// committed under public/vendor and the CSP only allows same-origin scripts.
//
//   node scripts/vendor-frontend.mjs           verify files against the manifest (offline)
//   node scripts/vendor-frontend.mjs --build   rebuild everything from pinned sources
//
// ethers comes from the root node_modules (version pinned in package.json);
// @cosmjs/stargate is bundled by esbuild from scripts/vendor (lockfile-pinned).
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = path.join(root, 'public', 'vendor');
const buildDir = path.join(root, 'scripts', 'vendor');
const manifestPath = path.join(vendorDir, 'manifest.json');
const MANIFEST_SCHEMA = 'agentbl-vendor-manifest-v1';

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

function rootDependencyVersion(name) {
  return readJson(path.join(root, 'package.json')).dependencies?.[name];
}

/** Everything under public/vendor except the manifest and docs, relative to that folder. */
export function vendoredFiles() {
  return fs.readdirSync(vendorDir)
    .filter((name) => !['manifest.json', 'README.md', 'THIRD_PARTY_LICENSES.md'].includes(name))
    .sort();
}

/** Returns a list of problems; empty means the vendor folder is consistent. */
export function verifyVendor() {
  const problems = [];
  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    return [`public/vendor/manifest.json is unreadable: ${error.message}`];
  }
  if (manifest.schema !== MANIFEST_SCHEMA) problems.push(`manifest schema must be ${MANIFEST_SCHEMA}`);

  const listed = new Set(Object.keys(manifest.files ?? {}));
  for (const name of vendoredFiles()) {
    if (!listed.has(name)) problems.push(`${name} is in public/vendor but not in the manifest`);
  }
  for (const [name, entry] of Object.entries(manifest.files ?? {})) {
    const file = path.join(vendorDir, name);
    if (!fs.existsSync(file)) {
      problems.push(`${name} is listed in the manifest but missing`);
      continue;
    }
    const actual = sha256(fs.readFileSync(file));
    if (actual !== entry.sha256) problems.push(`${name}: sha256 ${actual} does not match the manifest (${entry.sha256})`);
    if (!name.includes(entry.version)) problems.push(`${name}: file name must contain its version ${entry.version}`);
  }

  const ethers = Object.entries(manifest.files ?? {}).find(([, entry]) => entry.package === 'ethers');
  if (ethers && ethers[1].version !== rootDependencyVersion('ethers')) {
    problems.push(`vendored ethers ${ethers[1].version} differs from package.json (${rootDependencyVersion('ethers')}); run npm run vendor:build`);
  }
  return problems;
}

function buildEthers() {
  const version = rootDependencyVersion('ethers');
  const installed = readJson(path.join(root, 'node_modules', 'ethers', 'package.json'));
  if (installed.version !== version) {
    throw new Error(`node_modules has ethers ${installed.version}, package.json pins ${version}; run npm ci first`);
  }
  const name = `ethers-${version}.min.js`;
  fs.copyFileSync(path.join(root, 'node_modules', 'ethers', 'dist', 'ethers.min.js'), path.join(vendorDir, name));
  return { name, package: 'ethers', version, license: installed.license, source: 'node_modules/ethers/dist/ethers.min.js' };
}

function buildCosmjs() {
  // Fixed command line (no user input), so a shell string is fine and works with npm.cmd on Windows.
  execSync(`npm ci --prefix "${buildDir}" --no-audit --no-fund`, { stdio: 'inherit' });

  const require = createRequire(path.join(buildDir, 'package.json'));
  const esbuild = require('esbuild');
  const lock = readJson(path.join(buildDir, 'package-lock.json'));
  const version = lock.packages['node_modules/@cosmjs/stargate'].version;
  const name = `cosmjs-stargate-${version}.js`;
  esbuild.buildSync({
    entryPoints: [path.join(buildDir, 'entry-cosmjs.js')],
    outfile: path.join(vendorDir, name),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    legalComments: 'none',
    // @cosmjs/crypto only reaches for node:crypto when WebCrypto is missing (never in a browser).
    alias: { crypto: path.join(buildDir, 'node-crypto-stub.js') }
  });
  return {
    name,
    package: '@cosmjs/stargate',
    version,
    license: lock.packages['node_modules/@cosmjs/stargate'].license ?? 'Apache-2.0',
    source: `scripts/vendor (esbuild ${lock.packages['node_modules/esbuild'].version}, lockfile-pinned)`
  };
}

function thirdPartyLicenses(ethersEntry) {
  const lock = readJson(path.join(buildDir, 'package-lock.json'));
  const rows = Object.entries(lock.packages)
    .filter(([key, pkg]) => key.startsWith('node_modules/') && !pkg.dev && !pkg.optional)
    .map(([key, pkg]) => `| ${key.replace(/^.*node_modules\//u, '')} | ${pkg.version} | ${pkg.license ?? 'see package'} |`)
    .sort();
  return [
    '# Third-party licenses (public/vendor)',
    '',
    'Generated by `node scripts/vendor-frontend.mjs --build`. Each module is redistributed under its own license;',
    'consult the upstream package for the full license text.',
    '',
    `## ${ethersEntry.name}`,
    '',
    `ethers ${ethersEntry.version} — ${ethersEntry.license}. Unmodified build from the npm package.`,
    '',
    '## cosmjs-stargate bundle',
    '',
    'Contains the following production packages (resolved from scripts/vendor/package-lock.json):',
    '',
    '| Package | Version | License |',
    '| --- | --- | --- |',
    ...rows,
    ''
  ].join('\n');
}

function build() {
  fs.mkdirSync(vendorDir, { recursive: true });
  for (const name of vendoredFiles()) fs.rmSync(path.join(vendorDir, name));
  const entries = [buildEthers(), buildCosmjs()];
  const files = {};
  for (const entry of entries) {
    files[entry.name] = {
      package: entry.package,
      version: entry.version,
      license: entry.license,
      source: entry.source,
      sha256: sha256(fs.readFileSync(path.join(vendorDir, entry.name)))
    };
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify({ schema: MANIFEST_SCHEMA, files }, null, 2)}\n`);
  fs.writeFileSync(path.join(vendorDir, 'THIRD_PARTY_LICENSES.md'), thirdPartyLicenses(entries[0]));
  console.log(`vendor: rebuilt ${entries.map((entry) => entry.name).join(', ')}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  if (process.argv.includes('--build')) build();
  const problems = verifyVendor();
  if (problems.length > 0) {
    console.error(`vendor check failed:\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
  console.log('vendor check passed: public/vendor matches manifest.json');
}
