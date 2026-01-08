// Module to load and manage product data from a JSON file
// It tries multiple paths to locate the file and builds an index for quick access.

export const PRODUCTS = [];
export const PRODUCT_INDEX = new Map();

/**
 * Try fetching JSON from a URL, return null on failure
 * @param {string} url - The URL to fetch
 * @returns {Promise<object|null>} The JSON data or null
 */
async function tryFetch(url) {
  try {
    // Using no-store to ensure the latest data is fetched during development/testing
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    // Log errors for debugging, but return null to indicate failure
    console.warn(`Failed to fetch from ${url}:`, e);
    return null;
  }
}

/**
 * Return array with unique, truthy values
 * @param {Array} arr - The array to process
 * @returns {Array} A new array with unique values
 */
function unique(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

/**
 * Load products from a JSON file, trying multiple locations if needed.
 * This function will mutate the exported PRODUCTS array and PRODUCT_INDEX map.
 * @param {string} [url='./assets/data.json'] - The base URL for the data file
 * @returns {Promise<Array>} A promise that resolves with the products array
 */
export async function loadProducts(url = './assets/data.json') {
  const candidates = buildCandidates(url);
  const json = await fetchFirstAvailable(candidates);

  resetData();

  if (!json) {
    handleFetchFailure(candidates);
    return PRODUCTS;
  }

  const normalized = normalizeProducts(json);
  const idx = buildIndex(normalized);

  updateExports(normalized, idx);
  exposeGlobals();

  return PRODUCTS;
}

/** Return array of possible data file locations */
function buildCandidates(url) {
  return unique([
    url,
    './assets/data.json',
    '/assets/data.json',
    './assets/data.json',
    '../assets/data.json',
    '/data.json',
    './data.json'
  ]);
}

/** Try fetching from candidate URLs until one succeeds */
async function fetchFirstAvailable(candidates) {
  for (const u of candidates) {
    const json = await tryFetch(u);
    if (json) return json;
  }
  return null;
}

/** Clear existing PRODUCTS and PRODUCT_INDEX */
function resetData() {
  PRODUCTS.length = 0;
  PRODUCT_INDEX.clear();
}

/** Handle failure to fetch any JSON */
function handleFetchFailure(candidates) {
  console.error('loadProducts: failed to fetch data.json from any candidate location', candidates);
  exposeGlobals();
}

/** Normalize and ensure each product has an id */
function extractProductArray(json) {
  if (!json) return [];

  if (Array.isArray(json.data)) {
    return json.data;
  }
  if (Array.isArray(json.products)) {
    return json.products;
  }
  if (Array.isArray(json)) {
    return json;
  }

  return [];
}

function normalizeProducts(json) {
  const arr = extractProductArray(json);

  return arr.map((p, i) => {
    const o = { ...p };

    if (o.id == null) {
      o.id = `auto-${i}`;
    }
    return o;
  });
}

/** Build index and handle duplicate ids */
function buildIndex(normalized) {
  const idx = new Map();
  const counts = new Map();

  for (const p of normalized) {
    let key = String(p.id);
    if (counts.has(key)) {
      const c = counts.get(key) + 1;
      counts.set(key, c);
      key = `${key}-${c}`;
    } else {
      counts.set(key, 0);
    }
    p._rendererId = key;
    idx.set(key, p);
  }

  return idx;
}

/** Push products and populate index map */
function updateExports(normalized, idx) {
  PRODUCTS.push(...normalized);
  for (const [key, product] of idx.entries()) {
    PRODUCT_INDEX.set(key, product);
  }
}

/** Expose globals for debugging/cross-environment access */
function exposeGlobals() {
  try {
    globalThis.PRODUCTS = PRODUCTS;
    globalThis.PRODUCT_INDEX = PRODUCT_INDEX;
  } catch {
    // ignore non-browser
  }
}
