(function() {
  'use strict';

  // ============================================================
  // 0. REDUCED MOTION PREFERENCE CHECK
  // ============================================================
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
  }

  // ============================================================
  // 1. AOS (Animate On Scroll) – if available
  // ============================================================
  if (typeof AOS !== 'undefined' && !reduceMotion) {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 50,
      disable: reduceMotion
    });
  }

  // ============================================================
  // 2. CACHE DOM ELEMENTS
  // ============================================================
  const toggle = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('nav-close');
  const nav = document.getElementById('main-nav');
  const overlay = document.getElementById('nav-overlay');
  const backToTopBtn = document.querySelector('.back-to-top');

  // ============================================================
  // 3. MOBILE MENU
  // ============================================================
  function openMenu() {
    if (!nav || !overlay || !toggle) return;
    nav.classList.add('open');
    overlay.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!nav || !overlay || !toggle) return;
    nav.classList.remove('open');
    overlay.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (nav.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        if (toggle) toggle.focus();
      }
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768 && nav.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ============================================================
  // 4. BEFORE / AFTER SLIDER – uses clip-path
  // ============================================================
  const panels = document.querySelectorAll('.reveal-panel');

  panels.forEach(function(panel) {
    const before = panel.querySelector('.reveal-before');
    const handle = panel.querySelector('.reveal-handle');
    if (!before || !handle) return;

    let dragging = false;
    let currentValue = 50;

    function clamp(v, min, max) {
      return Math.min(Math.max(v, min), max);
    }

    function setReveal(pct) {
      pct = clamp(pct, 0, 100);
      const rightInset = 100 - pct;
      before.style.clipPath = 'inset(0 ' + rightInset + '% 0 0)';
      handle.style.left = pct + '%';
      currentValue = pct;
      panel.setAttribute('aria-valuenow', Math.round(pct));
    }

    function getPercent(e) {
      const rect = panel.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      return (x / rect.width) * 100;
    }

    function onPointerDown(e) {
      dragging = true;
      panel.setPointerCapture(e.pointerId);
      setReveal(getPercent(e));
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      setReveal(getPercent(e));
      e.preventDefault();
    }

    function onPointerUp(e) {
      if (dragging) {
        dragging = false;
        panel.releasePointerCapture(e.pointerId);
      }
    }

    panel.addEventListener('pointerdown', onPointerDown);
    panel.addEventListener('pointermove', onPointerMove);
    panel.addEventListener('pointerup', onPointerUp);
    panel.addEventListener('pointerleave', onPointerUp);

    panel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.key === 'ArrowLeft' ? -2 : 2;
        setReveal(currentValue + step);
      }
    });

    panel.setAttribute('tabindex', '0');
    panel.setAttribute('role', 'slider');
    panel.setAttribute('aria-valuemin', '0');
    panel.setAttribute('aria-valuemax', '100');
    panel.setAttribute('aria-valuenow', '50');

    setReveal(50);
  });

  // ============================================================
  // 5. SMOOTH SCROLL FOR ANCHOR LINKS (with menu close)
  // ============================================================
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
        if (nav && nav.classList.contains('open')) {
          closeMenu();
        }
      }
    });
  });

  // ============================================================
  // 6. MAINTENANCE PLANS – FADE-IN ANIMATION
  // ============================================================
  (function animatePlanCards() {
    const card = document.querySelector('#plans');
    if (!card) return;

    const cards = card.querySelectorAll('.plan-card');
    if (cards.length === 0) return;

    if (reduceMotion) {
      cards.forEach(function(c) {
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
      return;
    }

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, index) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 120);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -20px 0px'
    });

    cards.forEach(function(c) {
      c.style.opacity = '0';
      c.style.transform = 'translateY(30px)';
      c.style.transition = 'opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
      observer.observe(c);
    });
  })();

  // ============================================================
  // 7. BACK TO TOP BUTTON – with debounce
  // ============================================================
  if (backToTopBtn) {
    // Initial state: hidden
    backToTopBtn.style.opacity = '0';
    backToTopBtn.style.pointerEvents = 'none';
    backToTopBtn.style.transition = 'opacity 0.3s ease';

    let debounceTimeout = null;
    const threshold = 300; // show after 300px scroll

    function handleScroll() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll > threshold) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.pointerEvents = 'auto';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.pointerEvents = 'none';
      }
    }

    // Debounced scroll handler
    function debouncedScroll() {
      if (debounceTimeout) {
        cancelAnimationFrame(debounceTimeout);
      }
      debounceTimeout = requestAnimationFrame(handleScroll);
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true });

    // Cleanup on page unload (optional but good practice)
    window.addEventListener('beforeunload', function() {
      window.removeEventListener('scroll', debouncedScroll);
    });
  }

  // ============================================================
  // 8. (Optional) Log only in development
  // ============================================================
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Modern Pressure Wash – script loaded successfully');
  }
})();