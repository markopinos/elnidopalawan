/* ==========================================================================
   main.js  -  the ONLY script for the whole site.
   Loaded with <script defer src="js/main.js"> (works from a double-click and
   from Live Server; "defer" runs it after the HTML is parsed).
   Pattern used throughout: SELECT an element, LISTEN for an event, CHANGE
   the page.  Each feature is its own function and quietly does nothing when
   its elements are not on the current page.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /* 1. Lightbox ----------------------------------------------------------
     One click listener for the whole page (event delegation). Any element
     with data-lightbox opens the <dialog>. The browser handles Esc, focus
     trapping and returning focus to the trigger. */
  function initLightbox() {
    const dialog = $('#lightbox');
    if (!dialog) return;
    const dialogImg = $('img', dialog);
    const dialogCaption = $('figcaption', dialog);

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-lightbox]');
      if (!trigger) return;

      const source = trigger.matches('img') ? trigger : $('img', trigger);
      if (!source) return;

      const captionEl = trigger.closest('figure, .feature, .species-card')
        ?.querySelector('figcaption, h3, h4');

      dialogImg.src = source.currentSrc || source.src;
      dialogImg.alt = source.alt;
      dialogCaption.textContent = trigger.dataset.caption || captionEl?.textContent.trim() || source.alt;
      dialog.showModal();
    });

    // Clicking the dark area around the picture closes it
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    // Clear the image when closed so nothing stale flashes next time
    dialog.addEventListener('close', () => dialogImg.removeAttribute('src'));
  }

  /* 2. Thumbnail switcher (species and spots pages) ---------------------- */
  function initThumbnails() {
    document.addEventListener('click', (event) => {
      const thumb = event.target.closest('.thumb');
      if (!thumb) return;

      const media = thumb.closest('.feature-media');
      const mainImg = $('.main-photo img', media);
      const thumbImg = $('img', thumb);

      $('.thumb[aria-pressed="true"]', media)?.setAttribute('aria-pressed', 'false');
      thumb.setAttribute('aria-pressed', 'true');

      mainImg.src = thumb.dataset.full || thumbImg.src;
      mainImg.alt = thumbImg.alt;
    });
  }

  /* 3. Open a <details> card when a nav link or URL hash points at it ---- */
  function initDetailsFromHash() {
    const openFor = (hash) => {
      if (!hash || hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target instanceof HTMLDetailsElement) target.open = true;
    };

    // The click handler covers clicking the link for the section you are already on
    $$('.top-nav a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => openFor(link.getAttribute('href')));
    });
    addEventListener('hashchange', () => openFor(location.hash));
    openFor(location.hash);
  }

  /* 4. Slideshow ---------------------------------------------------------- */
  function initSlideshow(root) {
    const slides = $$('.slide', root);
    const dotsBox = $('.slide-dots', root);
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer;

    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      dotsBox.append(dot);
      return dot;
    });

    function show(i) {
      index = (i + slides.length) % slides.length;     // wraps -1 and length
      slides.forEach((slide, n) => slide.classList.toggle('active', n === index));
      dots.forEach((dot, n) => dot.setAttribute('aria-current', String(n === index)));
    }
    function stop() { clearInterval(timer); }
    function start() {
      stop();                                          // never stack two timers
      if (!reduceMotion) timer = setInterval(() => show(index + 1), 4000);
    }
    function go(i) {
      show(i);
      if (!root.matches(':hover, :focus-within')) start();
    }

    $('.prev-btn', root).addEventListener('click', () => go(index - 1));
    $('.next-btn', root).addEventListener('click', () => go(index + 1));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') go(index + 1);
      if (event.key === 'ArrowLeft')  go(index - 1);
    });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    show(0);
    start();
  }

  /* 5. Background video: pause control, reduced motion, Save-Data -------- */
  function initBackgroundVideo() {
    const video = $('.bg-video');
    const button = $('.motion-toggle');
    if (!video) { button?.remove(); return; }

    const sync = () => {
      if (button) button.textContent = video.paused ? 'Play video' : 'Pause video';
    };
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    button?.addEventListener('click', () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });

    const prefersLess = matchMedia('(prefers-reduced-motion: reduce)').matches
      || navigator.connection?.saveData;
    if (prefersLess) {
      video.removeAttribute('autoplay');
      video.pause();
    }
    sync();
  }

  /* 6. Navigation: solid sand bar after the hero + highlight the current section */
  function initNavState() {
    const nav = $('.top-nav');
    if (!nav) return;

    const update = () => nav.toggleAttribute('data-scrolled', scrollY > innerHeight - 120);
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();

    const links = $$('a[href^="#"]', nav);
    const byId = new Map(links.map((link) => [link.getAttribute('href').slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.removeAttribute('aria-current'));
        byId.get(entry.target.id)?.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });          // a thin band mid-screen
    byId.forEach((_, id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
  }

  /* Start everything ------------------------------------------------------ */
  initLightbox();
  initThumbnails();
  initDetailsFromHash();
  $$('.slideshow').forEach(initSlideshow);
  initBackgroundVideo();
  initNavState();
})();
