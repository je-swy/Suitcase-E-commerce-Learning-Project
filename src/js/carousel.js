// Simple carousel functionality
export function initCarousel() {
  // Get carousel elements
  const list = document.getElementById('carousel-list');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  // Ensure elements exist
  if (!list || !prevBtn || !nextBtn) return;
  // Get the gap size from CSS
  const listStyle = getComputedStyle(list);
  const gap = Number.parseFloat((listStyle.getPropertyValue('gap'))) || 0;

  // Calculate the step size based on the width of a single slide plus the gap
  function getStep() {
    const slide = list.querySelector('.carousel-item');
    if (!slide) return 0;
    // Get the width of a single slide including margin
    const slideWidth = slide.getBoundingClientRect().width;
    return slideWidth + gap;
  }

  // Scroll the list left or right by one step
  prevBtn.addEventListener('click', () => {
    // Calculate the step size
    const step = getStep();
    // Scroll the list left by the step size
    list.scrollBy({ left: -step, behavior: 'smooth' });
  });

  // Scroll the list left or right by one step
  nextBtn.addEventListener('click', () => {
    const step = getStep();
    // Scroll the list right by the step size
    list.scrollBy({ left: step, behavior: 'smooth' });
  });
}
