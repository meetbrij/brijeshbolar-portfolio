/* ============================================================
   CAROUSEL.JS — Vanilla JS carousel with lightbox. No dependencies.
   Usage: call initCarousel(config) after DOM ready.
   ============================================================ */

function initCarousel(config) {
  const {
    viewportId,     // id of .carousel-viewport element
    slides,         // array of { src, alt, caption }
    stageLabelClass // class of stage label buttons (optional)
  } = config;

  const viewport = document.getElementById(viewportId);
  if (!viewport) return;

  let current = 0;
  const total = slides.length;

  /* ── Build DOM ──────────────────────────────────────────── */
  const track = document.createElement('div');
  track.className = 'carousel-track';
  track.style.width = `${total * 100}%`;

  slides.forEach((slide, i) => {
    const fig = document.createElement('figure');
    fig.className = 'carousel-slide';
    fig.style.width = `${100 / total}%`;

    const img = document.createElement('img');
    img.src = slide.src;
    img.alt = slide.alt || `Slide ${i + 1}`;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';

    const cap = document.createElement('figcaption');
    cap.textContent = slide.caption || '';

    fig.appendChild(img);
    fig.appendChild(cap);
    track.appendChild(fig);

    // Lightbox click on image
    img.addEventListener('click', () => openLightbox(i));
    img.style.cursor = 'zoom-in';
  });

  viewport.appendChild(track);

  /* ── Controls ───────────────────────────────────────────── */
  const controlsEl = viewport.parentElement.querySelector('.carousel-controls');
  let prevBtn, nextBtn, counterEl;

  if (controlsEl) {
    prevBtn   = controlsEl.querySelector('.carousel-btn.prev');
    nextBtn   = controlsEl.querySelector('.carousel-btn.next');
    counterEl = controlsEl.querySelector('.carousel-counter');
  }

  /* ── Thumbnails ─────────────────────────────────────────── */
  const thumbsEl = viewport.parentElement.querySelector('.carousel-thumbnails');
  const thumbImgs = [];

  if (thumbsEl) {
    slides.forEach((slide, i) => {
      const thumb = document.createElement('img');
      thumb.className = 'carousel-thumb';
      thumb.src = slide.src;
      thumb.alt = `Thumbnail ${i + 1}`;
      thumb.loading = 'lazy';
      thumb.addEventListener('click', () => goToSlide(i));
      thumbsEl.appendChild(thumb);
      thumbImgs.push(thumb);
    });
  }

  /* ── Stage labels ───────────────────────────────────────── */
  let stageLabels = [];
  if (stageLabelClass) {
    stageLabels = Array.from(document.querySelectorAll('.' + stageLabelClass));
    stageLabels.forEach((label, i) => {
      label.addEventListener('click', () => goToSlide(i));
    });
  }

  /* ── Core navigate function ─────────────────────────────── */
  function goToSlide(index) {
    current = Math.max(0, Math.min(index, total - 1));
    const pct = (current / total) * 100;
    track.style.transform = `translateX(-${pct}%)`;
    updateUI();
  }

  function updateUI() {
    // Counter
    if (counterEl) {
      counterEl.innerHTML = `<span class="current">${current + 1}</span> / ${total}`;
    }

    // Buttons
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;

    // Thumbnails
    thumbImgs.forEach((t, i) => t.classList.toggle('active', i === current));
    if (thumbsEl && thumbImgs[current]) {
      thumbImgs[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    // Stage labels
    stageLabels.forEach((l, i) => l.classList.toggle('active', i === current));
  }

  /* ── Button listeners ───────────────────────────────────── */
  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(current + 1));

  /* ── Keyboard ───────────────────────────────────────────── */
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') goToSlide(current + 1);
    if (e.key === 'ArrowLeft')  goToSlide(current - 1);
  });

  /* ── Touch swipe ────────────────────────────────────────── */
  let touchStartX = 0;
  viewport.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      goToSlide(current + (delta > 0 ? 1 : -1));
    }
  }, { passive: true });

  /* ── Lightbox ───────────────────────────────────────────── */
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-overlay';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image viewer');

  const lbImg = document.createElement('img');
  lbImg.alt = '';

  const lbClose = document.createElement('button');
  lbClose.className = 'lightbox-close';
  lbClose.setAttribute('aria-label', 'Close image viewer');
  lbClose.textContent = '✕';

  lightbox.appendChild(lbImg);
  lightbox.appendChild(lbClose);
  document.body.appendChild(lightbox);

  function openLightbox(index) {
    lbImg.src = slides[index].src;
    lbImg.alt = slides[index].alt || `Slide ${index + 1}`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') { goToSlide(current + 1); lbImg.src = slides[current].src; }
    if (e.key === 'ArrowLeft')  { goToSlide(current - 1); lbImg.src = slides[current].src; }
  });

  /* ── Init ───────────────────────────────────────────────── */
  goToSlide(0);
}
