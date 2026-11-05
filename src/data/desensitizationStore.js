import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const DATA_DIR = path.join(rootDir, 'data/desensitizationData');

// In-memory cache, reused after the first load
const cache = new Map();

/**
 * Load data.json from a desensitizationData subdirectory
 * @param {string} category - subdirectory name (spotPurchase | spotSale | transport | warehouse)
 * @returns {Promise<Array>}
 */
async function loadCategory(category) {
  if (cache.has(category)) return cache.get(category);

  const filePath = path.join(DATA_DIR, category, 'data.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      throw new Error(`${category}/data.json must be an array`);
    }
    cache.set(category, data);
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`[desensitizationStore] file not found: ${filePath}`);
      return [];
    }
    throw error;
  }
}

/**
 * Load spot purchase data
 */
export function loadSpotPurchase() {
  return loadCategory('spotPurchase');
}

/**
 * Load spot sale data
 */
export function loadSpotSale() {
  return loadCategory('spotSale');
}

/**
 * Load transport data
 */
export function loadTransport() {
  return loadCategory('transport');
}

/**
 * Load warehouse data
 */
export function loadWarehouse() {
  return loadCategory('warehouse');
}

/**
 * Load all four categories of anonymised data
 * @returns {Promise<{spotPurchase: Array, spotSale: Array, transport: Array, warehouse: Array}>}
 */
export async function loadAllDesensitizationData() {
  const [spotPurchase, spotSale, transport, warehouse] = await Promise.all([
    loadSpotPurchase(),
    loadSpotSale(),
    loadTransport(),
    loadWarehouse()
  ]);

  return { spotPurchase, spotSale, transport, warehouse };
}

/**
 * Return a statistical summary of the anonymised data
 * @returns {Promise<{total: number, categories: Array<{name: string, label: string, count: number}>}>}
 */
export async function getDesensitizationSummary() {
  const all = await loadAllDesensitizationData();
  const categories = [
    { name: 'spotPurchase', label: 'Spot purchase', count: all.spotPurchase.length },
    { name: 'spotSale', label: 'Spot sale', count: all.spotSale.length },
    { name: 'transport', label: 'Transport', count: all.transport.length },
    { name: 'warehouse', label: 'Warehouse', count: all.warehouse.length }
  ];

  return {
    total: categories.reduce((sum, c) => sum + c.count, 0),
    categories
  };
}

/**
 * Clear the cache (for tests or hot-reload scenarios)
 */
export function clearDesensitizationCache() {
  cache.clear();
}
