// Description:
// in this file we define utility functions to render product listings into a container element
// including escaping HTML, resolving asset paths, and converting product data to HTML structure.

// Escape HTML special characters to prevent XSS
// Used when inserting dynamic content into HTML
// s: input string to escape
// returns: escaped string
// Default to empty string if input is falsy
// Example: esc('<script>') => '&lt;script&gt;'

// file: product-renderer.js

const isPagesFolder = window.location.pathname.includes('/pages/');

const pathPrefix = isPagesFolder ? '..' : '.';

export function esc(s = '') {
  return String(s).replaceAll(/[&<>']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}

export function resolveAssetPath(path = '') {
  const p = String(path).trim();
  if (!p || p === 'false') return '';

  if (p.startsWith('http') || p.startsWith('data:')) return p;

  let cleanPath = p.startsWith('/') ? p.slice(1) : p;

  if (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.slice(2);
  }

  if (cleanPath.startsWith('src/')) {
    cleanPath = cleanPath.slice(4);
  }

  return `${pathPrefix}/${cleanPath}`;
}
export function renderBlock({ products = [], containerSelector, limit }) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    // console.warn('renderBlock: container not found', containerSelector);
    return;
  }
  const items = limit ? (products || []).slice(0, limit) : products || [];
  container.innerHTML = items.map((p) => productToHtml(p)).join('');
}

export function productToHtml(p = {}) {
  const id = esc(p.id ?? p.sku ?? '');
  const title = esc(p.name ?? p.title ?? 'Unnamed product');
  const rawThumb = p.imageUrl ?? p.image ?? '';

  const finalSrc = resolveAssetPath(rawThumb);

  const badge = p.salesStatus
    ? `<span class='product-card__badge'>SALE</span>`
    : '';

  const linkBase = isPagesFolder ? '.' : './pages';
  const nameLink = `${linkBase}/product-details-template.html?id=${encodeURIComponent(id)}`;

  return `
<li class='product-card' data-id='${esc(id)}' role='listitem'>
  ${badge}
  <a class='product-card__link' href='${nameLink}' aria-label='${title}'>
    <img class='product-card__img' src='${finalSrc}' alt='${title}' loading='lazy' />
  </a>
  <section class='product-card__body'>
    <a class='product-card__name' href='${nameLink}'>${title}</a>
    <p class='product-card__price'>$${Number(p.price || 0).toFixed(0)}</p>
    <footer class='product-card__actions'>
      <button class='btn btn_pink product-card__add' data-action='add-to-cart' data-id='${esc(id)}'>Add To Cart</button>
    </footer>
  </section>
</li>`.trim();
}