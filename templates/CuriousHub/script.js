/**
 * Curious Laddoos — Hospitality Group Website
 * Premium Interactions & Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ============================================================
     PAGE LOADER
     ============================================================ */
  const pageLoader = document.getElementById('page-loader');
  
  // Simulate loading time for premium effect
  setTimeout(() => {
    pageLoader.classList.add('loaded');
    document.body.style.overflowY = 'auto'; // Re-enable scrolling
    
    // Trigger initial reveals after loader fades
    setTimeout(handleScrollReveal, 800);
  }, 2200);

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  
  // Only enable custom cursor on non-touch devices
  if (window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Immediate dot update
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Smooth ring follow using requestAnimationFrame
    const animateRing = () => {
      // Ease factor (lower = smoother/slower)
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // Hover effects on interactive elements
    const interactives = document.querySelectorAll('a, button, .service-card, .brand-card, .b2b-card, .journal-card, .industry-item, .partner-item, .leader-card, .edge-point');
    
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hovered');
        cursorRing.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hovered');
        cursorRing.classList.remove('hovered');
      });
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = 0;
      cursorRing.style.opacity = 0;
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = 1;
      cursorRing.style.opacity = 1; // opacity handled by CSS hover mostly, but reset base
    });
  } else {
    // Hide custom cursor elements on touch devices
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
    document.body.style.cursor = 'auto'; // Reset body cursor
    
    // Reset all elements that have cursor:none
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (window.getComputedStyle(el).cursor === 'none') {
        el.style.cursor = 'pointer'; // Make links/buttons pointer, others auto (simplified)
      }
    });
  }

  /* ============================================================
     THEME — Editorial Corporate (Theme 3 only)
     ============================================================ */
  // Theme 3 is the only theme — set permanently via data-theme="3" on <html>
  document.documentElement.setAttribute('data-theme', '3');
  localStorage.removeItem('cl-theme'); // Clear any old saved theme



  /* ============================================================
     STICKY NAVIGATION
     ============================================================ */
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* ============================================================
     MOBILE NAVIGATION
     ============================================================ */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    if (isOpen) {
      mobileNav.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflowY = 'auto';
    } else {
      mobileNav.classList.add('open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflowY = 'hidden';
    }
  });
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflowY = 'auto';
    });
  });

  /* ============================================================
     SCROLL REVEAL (Intersection Observer)
     ============================================================ */
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };
  
  const revealObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      } else {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Stop observing once revealed
      }
    });
  }, revealOptions);
  
  const handleScrollReveal = () => {
      revealElements.forEach(el => {
        revealObserver.observe(el);
      });
  };

  /* ============================================================
     HERO PARALLAX
     ============================================================ */
  const heroBgT1 = document.getElementById('heroBg-t1');
  const heroBgT2 = document.getElementById('heroBg-t2');
  const heroBgT3 = document.getElementById('heroBg-t3');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) return; // Only run when hero is visible
    
    const scrollPos = window.scrollY;
    if (heroBgT1) heroBgT1.style.transform = `translateY(${scrollPos * 0.4}px)`;
    if (heroBgT2) heroBgT2.style.transform = `translateY(${scrollPos * 0.4}px)`;
    if (heroBgT3) heroBgT3.style.transform = `translateY(${scrollPos * 0.4}px)`;
  });
  
  /* ============================================================
     VISUAL STORY PARALLAX
     ============================================================ */
  const visualStorySection = document.getElementById('visual-story');
  const visualStoryBg = document.getElementById('visualStoryBg');
  
  if (visualStorySection && visualStoryBg) {
    window.addEventListener('scroll', () => {
      const rect = visualStorySection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if section is in viewport
      if (rect.top <= viewportHeight && rect.bottom >= 0) {
        // Calculate scroll percentage within the section
        const scrollPercentage = 1 - (rect.bottom / (viewportHeight + rect.height));
        
        // Translate image (adjust 200px for strength of effect)
        const yPos = -100 + (scrollPercentage * 200);
        visualStoryBg.style.transform = `translateY(${yPos}px) scale(1.1)`; // Scale up slightly to prevent edges showing
      }
    });
  }

  /* ============================================================
     ANIMATED COUNTERS
     ============================================================ */
  const counters = document.querySelectorAll('.counter');
  let hasAnimatedCounters = false;
  
  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000; // ms
      const increment = target / (duration / 16); // 60fps
      
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.innerText = Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target;
        }
      };
      
      updateCounter();
    });
  };
  
  const metricsSection = document.getElementById('metrics');
  
  if (metricsSection) {
    const metricsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimatedCounters) {
        animateCounters();
        hasAnimatedCounters = true;
      }
    }, { threshold: 0.5 });
    
    metricsObserver.observe(metricsSection);
  }

});
