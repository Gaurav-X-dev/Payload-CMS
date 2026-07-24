/**
 * =========================================================
 * ZURU ZURU — Menu Page JavaScript
 * Category filtering, search, smooth transitions
 * =========================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  const filterBtns = document.querySelectorAll('.menu-filter-btn');
  const searchInput = document.getElementById('menuSearch');
  const dishCards = document.querySelectorAll('.dish-card[data-category]');
  const menuGrid = document.querySelector('.menu-grid');
  const noResults = document.getElementById('noResults');

  let activeCategory = 'all';
  let searchTerm = '';


  /* ── Filter Logic ── */
  function filterCards() {
    let visibleCount = 0;

    dishCards.forEach((card, index) => {
      const category = card.getAttribute('data-category');
      const name = card.querySelector('.card-name')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = searchTerm === '' ||
        name.includes(searchTerm) ||
        desc.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.classList.remove('card-hidden');
        card.classList.add('card-visible');
        card.style.transitionDelay = `${visibleCount * 0.04}s`;
        visibleCount++;
      } else {
        card.classList.add('card-hidden');
        card.classList.remove('card-visible');
        card.style.transitionDelay = '0s';
      }
    });

    // Show/hide no results message
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'flex' : 'none';
    }

    // Update result count
    const countEl = document.getElementById('resultCount');
    if (countEl) {
      countEl.textContent = `${visibleCount} item${visibleCount !== 1 ? 's' : ''}`;
    }
  }


  /* ── Tab Click Handlers ── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      activeCategory = this.getAttribute('data-filter');
      filterCards();
    });
  });


  /* ── Search Input Handler ── */
  if (searchInput) {
    let debounceTimer;

    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchTerm = this.value.toLowerCase().trim();
        filterCards();
      }, 200);
    });

    // Clear search on Escape
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.value = '';
        searchTerm = '';
        filterCards();
        this.blur();
      }
    });
  }


  /* ── Clear Search Button ── */
  const clearBtn = document.getElementById('clearSearch');
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchTerm = '';
      filterCards();
      searchInput.focus();
    });
  }


  /* ── Initialize ── */
  // Set all cards visible on load
  dishCards.forEach(card => {
    card.classList.add('card-visible');
  });

});
