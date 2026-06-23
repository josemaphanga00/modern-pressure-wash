(function() {
  'use strict';

  // ============================================================
  // 0. INITIALIZE AOS (Animate On Scroll)
  // ============================================================
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,        // animate only once
      mirror: false,
      offset: 50,
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  } else {
    console.warn('AOS library not loaded – scroll animations disabled.');
  }

  // ============================================================
  // 1. MOBILE MENU
  // ============================================================

  const toggle = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('nav-close');
  const nav = document.getElementById('main-nav');
  const overlay = document.getElementById('nav-overlay');

  function openMenu() {
    nav.classList.add('open');
    overlay.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('open');
    overlay.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function() {
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

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768 && nav.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ============================================================
  // 2. BEFORE/AFTER SLIDER (touch-friendly)
  // ============================================================

  const panels = document.querySelectorAll('.reveal-panel');

  panels.forEach(function(panel) {
    const before = panel.querySelector('.reveal-before');
    const handle = panel.querySelector('.reveal-handle');
    let dragging = false;
    let currentValue = 50;

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function setReveal(pct) {
      pct = clamp(pct, 4, 96);
      before.style.width = pct + '%';
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

    // ---- Pointer events (mouse + touch) ----
    function onPointerDown(e) {
      dragging = true;
      setReveal(getPercent(e));
      panel.setPointerCapture(e.pointerId);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      setReveal(getPercent(e));
      e.preventDefault();
    }

    function onPointerUp(e) {
      dragging = false;
    }

    panel.addEventListener('pointerdown', onPointerDown);
    panel.addEventListener('pointermove', onPointerMove);
    panel.addEventListener('pointerup', onPointerUp);
    panel.addEventListener('pointerleave', onPointerUp);

    // ---- Keyboard support ----
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.key === 'ArrowLeft' ? -2 : 2;
        const newVal = clamp(currentValue + step, 4, 96);
        setReveal(newVal);
      }
    }

    panel.addEventListener('keydown', onKeyDown);

    // ---- Initialise ----
    setReveal(50);
  });

  // ============================================================
  // 3. REDUCED MOTION
  // ============================================================

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
  }

  // ============================================================
  // 4. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================================

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, null, this.getAttribute('href'));

        // Close mobile menu if open
        if (nav && nav.classList.contains('open')) {
          closeMenu();
        }
      }
    });
  });

})();