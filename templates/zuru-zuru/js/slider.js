/**
 * =========================================================
 * ZURU ZURU — Slider / Testimonial Carousel
 * Vanilla JS slider for testimonials, featured items, etc.
 * =========================================================
 */

class ZuruSlider {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;

    this.slides = this.container.querySelectorAll('.slide');
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoplay = options.autoplay !== false;
    this.interval = options.interval || 5000;
    this.timer = null;

    this.init();
  }

  init() {
    if (this.totalSlides <= 1) return;

    /* Create navigation dots */
    this.dotsContainer = document.createElement('div');
    this.dotsContainer.classList.add('slider-dots');
    this.dotsContainer.style.cssText = 'display:flex;justify-content:center;gap:8px;margin-top:2rem;';

    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.classList.add('slider-dot');
      dot.style.cssText = `
        width: 10px; height: 10px; border-radius: 50%; border: 1px solid #8B1A1A;
        background: ${i === 0 ? '#8B1A1A' : 'transparent'}; cursor: pointer;
        transition: background 0.3s ease;
      `;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
    }

    this.container.appendChild(this.dotsContainer);
    this.dots = this.dotsContainer.querySelectorAll('.slider-dot');

    /* Create prev/next arrows */
    const arrowStyles = `
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.9); border: none; width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; cursor: pointer; z-index: 5;
      transition: background 0.3s ease; color: #111;
    `;

    this.prevBtn = document.createElement('button');
    this.prevBtn.innerHTML = '&#8592;';
    this.prevBtn.style.cssText = arrowStyles + 'left: 0;';
    this.prevBtn.setAttribute('aria-label', 'Previous slide');
    this.prevBtn.addEventListener('click', () => this.prev());

    this.nextBtn = document.createElement('button');
    this.nextBtn.innerHTML = '&#8594;';
    this.nextBtn.style.cssText = arrowStyles + 'right: 0;';
    this.nextBtn.setAttribute('aria-label', 'Next slide');
    this.nextBtn.addEventListener('click', () => this.next());

    this.container.style.position = 'relative';
    this.container.appendChild(this.prevBtn);
    this.container.appendChild(this.nextBtn);

    /* Show first slide */
    this.showSlide(0);

    /* Autoplay */
    if (this.autoplay) {
      this.startAutoplay();
      this.container.addEventListener('mouseenter', () => this.stopAutoplay());
      this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }

    /* Touch support */
    let startX = 0;
    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
      }
    }, { passive: true });
  }

  showSlide(index) {
    this.slides.forEach((slide, i) => {
      slide.style.opacity = i === index ? '1' : '0';
      slide.style.visibility = i === index ? 'visible' : 'hidden';
      slide.style.position = i === index ? 'relative' : 'absolute';
      slide.style.transition = 'opacity 0.6s ease, visibility 0.6s ease';
      slide.style.top = '0';
      slide.style.left = '0';
      slide.style.width = '100%';
    });

    if (this.dots) {
      this.dots.forEach((dot, i) => {
        dot.style.background = i === index ? '#8B1A1A' : 'transparent';
      });
    }

    this.currentIndex = index;
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.totalSlides;
    this.showSlide(nextIndex);
  }

  prev() {
    const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.showSlide(prevIndex);
  }

  goTo(index) {
    this.showSlide(index);
  }

  startAutoplay() {
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), this.interval);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}


/* Auto-init sliders on page load */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-slider]').forEach(container => {
    new ZuruSlider(container, {
      autoplay: container.getAttribute('data-autoplay') !== 'false',
      interval: parseInt(container.getAttribute('data-interval')) || 5000
    });
  });
});
