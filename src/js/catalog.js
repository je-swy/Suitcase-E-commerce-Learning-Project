// Catalog page script: handles product listing, filtering, sorting, pagination, and search functionality.

import { loadProducts } from './products-data.js';
import { renderBlock, resolveAssetPath, esc } from './product-renderer.js';
import { attachCartDelegation } from './cart.js';

const filtersForm = document.getElementById('catalog-filters-form');
const searchInput = document.getElementById('catalog-search');
const productListContainer = document.getElementById('catalog-list');
const clearFiltersBtn = document.getElementById('filter-clear');
const salesCheckbox = document.getElementById('sales-checkbox');
const hideFiltersBtn = document.getElementById('filter-toggle-compact');
const filtersContainer = document.getElementById('catalog-filters');
const paginationContainer = document.getElementById('pagination-controls');
const resultsContainer = document.getElementById('catalog-results');
const sortSelect = document.getElementById('sort-select');
const topSetsContainer = document.getElementById('top-sets-container');

// State variables
let allProducts = [];
let currentPage = 1;
const productsPerPage = 12;

const activeFilters = {
  category: '',
  color: '',
  size: '',
  salesStatus: '',
  searchQuery: '',
  sortBy: 'default'
};

function renderPagination(totalPages) {
  paginationContainer.innerHTML = '';
  if (totalPages <= 1) return;
  const prevButton = document.createElement('button');
  prevButton.textContent = '< Previous';
  prevButton.className = 'btn btn_pagination-next-prev';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => { if (currentPage > 1) { currentPage--; updateProductList(); } });
  paginationContainer.appendChild(prevButton);

  const btnContainer = document.createElement('article');
  btnContainer.className = 'btn_container';
  paginationContainer.appendChild(btnContainer);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = 'btn btn_pagination';
    if (i === currentPage) pageButton.classList.add('is-active');
    pageButton.addEventListener('click', () => { currentPage = i; updateProductList(); });
    btnContainer.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next >';
  nextButton.className = 'btn btn_pagination-next-prev';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; updateProductList(); } });
  paginationContainer.appendChild(nextButton);
}

function renderWidgetRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  const starsHTML = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  return `<span class="rating-stars" aria-label="Rating: ${rating} out of 5 stars">${starsHTML}</span>`;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderTopSets() {
  const sets = allProducts.filter(p => p.category === 'luggage sets');
  const setsCopy = [...sets];
  const shuffledSets = shuffleArray(setsCopy);
  const randomSets = shuffledSets.slice(0, 4);
  const listElement = topSetsContainer.querySelector('.widget-list');
  if (!listElement) {
    console.error('Render Top Sets: list element not found');
    return;
  }

  // check if we are in pages folder
  const isPagesFolder = window.location.pathname.includes('/pages/');

  // and prepare link base accordingly
  const linkBase = isPagesFolder ? '.' : './pages';

  listElement.innerHTML = randomSets.map(product => {
    const ratingHtml = product.rating ? renderWidgetRatingStars(product.rating) : '';

    const productLink = `${linkBase}/product-details-template.html?id=${esc(product.id)}`;

    return `
      <li>
        <a href="${productLink}">
           <img src="${esc(resolveAssetPath(product.imageUrl))}" alt="${esc(product.name)}">
        </a>
        <article>
          <a href="${productLink}">${esc(product.name)}</a>
          <br>
          ${ratingHtml}
          <p>$${product.price.toFixed(2)}</p>
        </article>
      </li>
    `;
  }).join('');
}

function updateResultsCount(totalFilteredProducts, productsOnPage) {
  if (totalFilteredProducts === 0) {
    resultsContainer.textContent = '';
    return;
  }
  const start = (currentPage - 1) * productsPerPage + 1;
  const end = start + productsOnPage.length - 1;
  resultsContainer.textContent = `Showing ${start}–${end} of ${totalFilteredProducts} results`;
}

/**
 * NEW: Parses a size filter value (like "S-L" or "S, M, XL") into an array of individual sizes.
 * @param {string} sizeValue - The value from the filter.
 * @returns {string[]} An array of simple sizes, e.g., ['S', 'M', 'L'].
 */
function parseSizeFilter(sizeValue) {
  if (!sizeValue) return [];
  if (!sizeValue.includes(',') && !sizeValue.includes('-')) {
    return [sizeValue];
  }
  if (sizeValue.includes(',')) {
    return sizeValue.split(',').map(s => s.trim());
  }
  if (sizeValue.includes('-')) {
    if (sizeValue === 'S-L') {
      return ['S', 'M', 'L'];
    }
    // Add other ranges here if needed
  }
  return [sizeValue];
}

function updateProductList() {
  let productsToRender = [...allProducts];
  const searchQuery = activeFilters.searchQuery.trim().toLowerCase();

  if (searchQuery) {
    productsToRender = productsToRender.filter(p => p.name.toLowerCase().includes(searchQuery) || p.id.toLowerCase().includes(searchQuery));
  }
  if (activeFilters.category) {
    productsToRender = productsToRender.filter(p => p.category === activeFilters.category);
  }
  if (activeFilters.color) {
    productsToRender = productsToRender.filter(p => p.color === activeFilters.color);
  }

  if (activeFilters.size) {
    const targetSizes = parseSizeFilter(activeFilters.size);
    productsToRender = productsToRender.filter(p => targetSizes.includes(p.size));
  }

  if (activeFilters.salesStatus === 'true') {
    productsToRender = productsToRender.filter(p => p.salesStatus === true);
  }

  const sortBy = activeFilters.sortBy;
  if (sortBy === 'price-asc') productsToRender.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') productsToRender.sort((a, b) => b.price - a.price);
  else if (sortBy === 'popularity') productsToRender.sort((a, b) => b.popularity - a.popularity);
  else if (sortBy === 'rating') productsToRender.sort((a, b) => b.rating - a.rating);

  const totalFilteredProducts = productsToRender.length;
  const totalPages = Math.ceil(totalFilteredProducts / productsPerPage);
  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = productsToRender.slice(startIndex, startIndex + productsPerPage);

  renderBlock({
    products: paginatedProducts,
    containerSelector: '#catalog-list',
    limit: productsPerPage
  });
  renderPagination(totalPages);
  updateResultsCount(totalFilteredProducts, paginatedProducts);

  if (totalFilteredProducts === 0) {
    productListContainer.innerHTML = '<p>Product not found.</p>';
  }
}

function handleStateChange() {
  currentPage = 1;
  updateProductList();
}

/**
 * Sets up all event listeners for the filtering system.
 */
function setupFilterListeners() {
  // 1. Logic for custom dropdowns (opening/closing)
  filtersForm.addEventListener('click', (event) => {
    const dropdownButton = event.target.closest('.filter-label');
    if (!dropdownButton) return;

    const currentFilterItem = dropdownButton.closest('.filter-item');
    const wasOpen = currentFilterItem.classList.contains('is-open');

    const openItems = filtersForm.querySelectorAll('.filter-item.is-open');
    for (const openItem of openItems) {
      openItem.classList.remove('is-open');
      openItem.querySelector('.filter-label').setAttribute('aria-expanded', 'false');
    }

    if (!wasOpen) {
      currentFilterItem.classList.add('is-open');
      dropdownButton.setAttribute('aria-expanded', 'true');
    }
  });

  // Close dropdowns if user clicks outside the form
  document.addEventListener('click', (event) => {
    if (!filtersForm.contains(event.target)) {
      const openItems = filtersForm.querySelectorAll('.filter-item.is-open');
      for (const item of openItems) {
        item.classList.remove('is-open');
        item.querySelector('.filter-label').setAttribute('aria-expanded', 'false');
      };
    }
  });

  // 2. Logic for handling filter selection (when a radio button is changed)
  filtersForm.addEventListener('change', (event) => {
    const input = event.target;
    if (input.name === 'category' || input.name === 'color' || input.name === 'size') {
      const filterItem = input.closest('.filter-item');
      const filterName = filterItem.dataset.filter;
      const selectedText = filterItem.querySelector(`label[for="${input.id}"]`).textContent;
      const selectedDisplay = filterItem.querySelector('.filter-selected');

      activeFilters[filterName] = input.value;
      if (selectedDisplay) {
        selectedDisplay.textContent = selectedText;
      }
      filterItem.classList.remove('is-open');
      filterItem.querySelector('.filter-label').setAttribute('aria-expanded', 'false');

      handleStateChange();
    }
  });

  // --- Other listeners ---
  searchInput.addEventListener('input', () => {
    activeFilters.searchQuery = searchInput.value;
    handleStateChange();
  });

  const searchButton = document.querySelector('.search-widget button');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) return;
      const exactMatch = allProducts.find(p => p.id.toLowerCase() === query);
      if (exactMatch) {
        globalThis.location.href = `../pages/product-details-template.html?id=${exactMatch.id}`;
      }
    });
  }

  salesCheckbox.addEventListener('change', () => {
    activeFilters.salesStatus = salesCheckbox.checked ? 'true' : '';
    handleStateChange();
  });

  sortSelect.addEventListener('change', () => {
    activeFilters.sortBy = sortSelect.value;
    handleStateChange();
  });

  clearFiltersBtn.addEventListener('click', () => {
    filtersForm.reset();
    salesCheckbox.checked = false;
    sortSelect.value = 'default';

    for (const key of Object.keys(activeFilters)) {
      activeFilters[key] = '';
    }
    activeFilters.sortBy = 'default';

    const selectedLabels = filtersForm.querySelectorAll('.filter-selected');
    for (const label of selectedLabels) {
      const filterItem = label.closest('.filter-item');
      const firstOption = filterItem.querySelector('ul li:first-child label');

      if (firstOption) {
        label.textContent = firstOption.textContent;
      }
    }

    handleStateChange();
  });

  hideFiltersBtn.addEventListener('click', () => {
    filtersContainer.classList.toggle('compact');
    hideFiltersBtn.textContent = filtersContainer.classList.contains('compact') ? 'SHOW FILTERS' : 'HIDE FILTERS';
  });
}

// Main initialization function for the catalog page
export async function initCatalog() {
  allProducts = await loadProducts('../assets/data.json');
  updateProductList();
  renderTopSets();
  attachCartDelegation();
  setupFilterListeners();
}
