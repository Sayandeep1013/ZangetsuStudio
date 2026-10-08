/* ZANGETSU STUDIO — universe hub */
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // cursor
  const cursor = document.querySelector('.cursor');
  if (!matchMedia('(hover: none)').matches) {
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); });
    $$('a').forEach(a => {
      a.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      a.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });
  }

  const wipe = document.querySelector('.wipe-out');
  gsap.set(wipe, { yPercent: 100, visibility: 'hidden' });

  // intro
  if (!reduced) {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.intro-title .line > span', { yPercent: 110, duration: 1.1, stagger: 0.1 })
      .from('.intro .eyebrow, .intro-sub', { opacity: 0, y: 16, duration: 0.8, stagger: 0.1 }, '-=0.7')
      .from('.uni', { clipPath: 'inset(100% 0 0 0)', duration: 1.1, stagger: 0.08, ease: 'expo.out' }, '-=0.6')
      .from('.uni-body, .uni-kanji, .uni-n', { opacity: 0, y: 20, duration: 0.6, stagger: 0.03 }, '-=0.6');
  }

  // leaving: a wipe in the universe's colour, then navigate
  $$('.uni').forEach(u => u.addEventListener('click', e => {
    if (reduced || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    wipe.style.setProperty('--accent', getComputedStyle(u).getPropertyValue('--accent'));
    gsap.to(wipe, { yPercent: 0, visibility: 'visible', duration: 0.55, ease: 'power4.inOut', onComplete: () => (location.href = u.href) });
  }));
  // coming back via the back button: reset the wipe
  addEventListener('pageshow', () => gsap.set(wipe, { yPercent: 100, visibility: 'hidden' }));
})();
