/**
 * =========================================================
 * GHEE ROAST V2 ?" Premium Restaurant JavaScript
 * =========================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. Sticky Header Implementation
     ========================================================= */
  const header = document.getElementById('main-header');
  const scrollThreshold = 50;

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* =========================================================
     2. Mobile Menu Toggle
     ========================================================= */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  // Implementation omitted for brevity, but would toggle a full screen nav overlay

  /* =========================================================
     3. Scroll Reveal Animations (Intersection Observer)
     ========================================================= */
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optional: unobserve after reveal
        // observer.unobserve(entry.target);
      }
    });
  };
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };
  
  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
  
  revealElements.forEach(el => revealObserver.observe(el));

  /* Trigger immediate reveal for hero section */
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach(el => {
      el.classList.add('active');
    });
  }, 100);

  /* =========================================================
     4. Number Counter Animation (Section 15: Statistics)
     ========================================================= */
  const counters = document.querySelectorAll('.counter');
  
  const counterCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        
        let current = 0;
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            // Format with commas for large numbers like 2,500,000
            counter.innerText = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.innerText = target.toLocaleString() + '+';
          }
        };
        updateCounter();
        observer.unobserve(counter); // Only run once
      }
    });
  };

  const counterObserver = new IntersectionObserver(counterCallback, { threshold: 0.5 });
  counters.forEach(counter => counterObserver.observe(counter));

});
