// In this file is implementing the logic for adding products to the cart,
// and setting up event delegation for "Add to Cart" buttons.
// It interacts with cart storage functions and product data loading.

import { getCartItems, setCartItems } from './cart-ui.js';
import { loadProducts } from './products-data.js';

// Generate a unique key for a cart item based on product ID and its options (size, color)
function getCartItemKey(product) {
  const size = product.size || 'default';
  const color = product.color || 'default';
  return `${product.id}-${size}-${color}`;
}

// this function add a product to the cart
// and if the product already exists in the cart, it increases its quantity
// and it dispatches a 'cart-updated' event to notify other parts of the app
export function addToCart(product, quantity = 1) {
  const items = getCartItems();
  const itemKey = getCartItemKey(product);

  const existingIndex = items.findIndex(item => item.cartKey === itemKey);

  if (existingIndex > -1) {
    items[existingIndex].qty += quantity;
  } else {
    const cartItem = { ...product, qty: quantity, cartKey: itemKey };
    items.push(cartItem);
  }

  setCartItems(items);
  globalThis.dispatchEvent(new CustomEvent('cart-updated'));
}

// this function sets up event delegation for "Add to Cart" buttons
// it listens for click events on the document body
// when an "Add to Cart" button is clicked, it retrieves the product ID from the button's data attributes
// if the product data is not already loaded, it loads it from a JSON file
// then it finds the product by ID and calls addToCart to add it to the cart
export function attachCartDelegation() {
  document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action="add-to-cart"]');
    if (!btn) return;

    if (btn.id === 'add-to-cart-btn') {
      return;
    }

    const id = btn.dataset.id;
    if (!id) return;

    if (!globalThis.PRODUCTS || globalThis.PRODUCTS.length === 0) {
      await loadProducts('../assets/data.json');
    }

    const product = globalThis.PRODUCT_INDEX?.get(id) || globalThis.PRODUCTS?.find(p => String(p.id) === String(id));
    if (!product) {
      console.warn(`Product with id "${id}" not found.`);
      return;
    }

    addToCart(product, 1);
  });
}
