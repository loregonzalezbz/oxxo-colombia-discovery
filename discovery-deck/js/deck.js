/* ─── Deck · OXXO Colombia Discovery ────────────────── */
(() => {
  'use strict';

  const slides   = Array.from(document.querySelectorAll('.slide'));
  const total    = slides.length;
  let   current  = 0;
  let   animating = false;

  const dotsEl    = document.getElementById('navDots');
  const counterEl = document.getElementById('navCounter');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  const progressEl = document.getElementById('progress');

  /* Build dot indicators */
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'nav-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  function updateUI() {
    document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    counterEl.textContent = `${current + 1} / ${total}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    if (progressEl) progressEl.style.width = `${((current + 1) / total) * 100}%`;
  }

  function goTo(idx) {
    if (animating || idx === current || idx < 0 || idx >= total) return;
    animating = true;

    const from = slides[current];
    const to   = slides[idx];
    const dir  = idx > current ? 1 : -1;

    from.classList.remove('active');
    from.classList.add('leaving');
    from.style.transform = `translateX(${dir * -48}px)`;

    to.style.transform   = `translateX(${dir * 48}px)`;
    to.style.opacity     = '0';
    to.classList.add('active');

    /* Force reflow so the starting transform is applied */
    void to.offsetHeight;

    to.style.transform = 'translateX(0)';
    to.style.opacity   = '1';

    const cleanup = () => {
      from.classList.remove('leaving');
      from.style.transform = '';
      to.style.transform   = '';
      to.style.opacity     = '';
      animating = false;
    };
    to.addEventListener('transitionend', cleanup, { once: true });

    current = idx;
    updateUI();
  }

  /* Public navigation */
  window.navigate = (dir) => goTo(current + dir);

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* Keyboard */
  document.addEventListener('keydown', (e) => {
    if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
    const map = {
      ArrowRight: 1, ArrowDown: 1, ' ': 1,
      ArrowLeft: -1, ArrowUp: -1,
    };
    if (map[e.key] !== undefined) { e.preventDefault(); goTo(current + map[e.key]); }
    if (e.key === 'Home') goTo(0);
    if (e.key === 'End')  goTo(total - 1);
    if (e.key === 'f' || e.key === 'F') toggleFullscreen();
  });

  /* Touch / swipe */
  let touchX = 0;
  document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend',   (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* Responsive scaling */
  const W = 1280, H = 720;
  function scale() {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H) * 0.94;
    document.getElementById('deck').style.transform = `scale(${s})`;
  }
  window.addEventListener('resize', scale);
  scale();

  /* Fullscreen helper */
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  /* Init */
  updateUI();
})();
