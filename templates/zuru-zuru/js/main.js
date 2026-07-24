/**
 * =========================================================
 * ZURU ZURU — Main JavaScript
 * Global functionality: Preloader, Header, Scroll Reveal,
 * Mobile Menu, Back to Top, Scroll Progress, Counters, Ripple
 * =========================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Preloader ── */
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('loaded');
        document.body.classList.remove('no-scroll');
        setTimeout(() => preloader.remove(), 800);
      }, 800);
    });
    /* Fallback: remove after 3s max */
    setTimeout(() => {
      if (preloader && !preloader.classList.contains('loaded')) {
        preloader.classList.add('loaded');
        document.body.classList.remove('no-scroll');
      }
    }, 3000);
  }


  /* ── Sticky Header ── */
  const header = document.querySelector('.header');
  const announcement = document.querySelector('.announcement-bar');

  function handleScroll() {
    if (!header) return;
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);

    /* Hide announcement bar on scroll */
    if (announcement) {
      if (window.scrollY > 200) {
        announcement.style.transform = 'translateY(-100%)';
        announcement.style.position = 'fixed';
        announcement.style.top = '0';
        announcement.style.left = '0';
        announcement.style.width = '100%';
        announcement.style.zIndex = '1100';
      } else {
        announcement.style.transform = 'translateY(0)';
      }
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Init


  /* ── Mobile Menu ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    /* Close on link click */
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }


  /* ── Scroll Reveal (Intersection Observer) ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .text-reveal');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  }


  /* ── Back to Top ── */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ── Scroll Progress Bar ── */
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }


  /* ── Counter Animation ── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease out quad */
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(easedProgress * target);
      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(updateCounter);
  }


  /* ── Button Ripple Effect ── */
  document.querySelectorAll('.btn, .ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });


  /* ── Accordion ── */
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function() {
      const item = this.parentElement;
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('active');

      /* Close all */
      document.querySelectorAll('.accordion-item.active').forEach(openItem => {
        openItem.classList.remove('active');
        openItem.querySelector('.accordion-body').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });


  /* ── Tabs ── */
  document.querySelectorAll('.tabs-nav').forEach(nav => {
    nav.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tabGroup = this.closest('[data-tabs]') || this.closest('section');
        const target = this.getAttribute('data-tab');

        /* Update buttons */
        nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        /* Update content */
        if (tabGroup) {
          tabGroup.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
          });
          const targetContent = tabGroup.querySelector(`[data-tab-content="${target}"]`);
          if (targetContent) targetContent.classList.add('active');
        }
      });
    });
  });


  /* ── Smooth Scroll for Anchor Links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ── Parallax Effect (lightweight) ── */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length > 0) {
    window.addEventListener('scroll', () => {
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
        const rect = el.getBoundingClientRect();
        const yPos = -(rect.top * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    }, { passive: true });
  }


  /* ── Lightbox ── */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('[data-lightbox]').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-lightbox') || item.querySelector('img')?.src;
        if (src && lightboxImg) {
          lightboxImg.src = src;
          lightbox.classList.add('active');
          document.body.classList.add('no-scroll');
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
  }

});
