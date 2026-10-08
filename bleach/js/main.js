/* ZANGETSU STUDIO — scroll choreography */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    window.__lenis = lenis;
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView();
  }));

  /* ---------- cursor ---------- */
  const cursor = $('.cursor');
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  if (!touch) {
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); });
    $$('a, .work-list li').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- reiatsu particles ---------- */
  const cvs = $('#reiatsu'), ctx = cvs.getContext('2d');
  let parts = [], descentVisible = false, burst = 0;
  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio, 2);
    cvs.width = cvs.clientWidth * dpr; cvs.height = cvs.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = Array.from({ length: innerWidth < 760 ? 70 : 160 }, () => spawn(true));
  }
  function spawn(anywhere) {
    return {
      x: Math.random() * cvs.clientWidth,
      y: anywhere ? Math.random() * cvs.clientHeight : cvs.clientHeight + 10,
      v: 0.3 + Math.random() * 1.4, len: 6 + Math.random() * 30, a: 0.15 + Math.random() * 0.6,
      w: Math.random() < 0.15 ? 2 : 1,
    };
  }
  sizeCanvas();
  gsap.ticker.add(() => {
    if (!descentVisible) return;
    const w = cvs.clientWidth, h = cvs.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const boost = 1 + burst * 6;
    for (const p of parts) {
      p.y -= p.v * boost;
      if (p.y + p.len < 0) Object.assign(p, spawn(false));
      ctx.strokeStyle = `rgba(242,239,232,${p.a})`;
      ctx.lineWidth = p.w;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.len * boost * 0.6); ctx.stroke();
    }
  });

  /* ---------- loader + intro ---------- */
  document.body.classList.add('is-loading');
  const count = { v: 0 };
  const loaderTl = gsap.timeline();
  loaderTl
    .to('.loader-kanji', { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.inOut' }, 0)
    .to(count, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => {
      $('#loaderCount').textContent = String(Math.round(count.v)).padStart(3, '0');
    } }, 0)
    .to('#loaderBar', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0);

  Promise.all([document.fonts.ready, new Promise(r => loaderTl.eventCallback('onComplete', r))]).then(() => {
    gsap.timeline({ onComplete: () => { document.body.classList.remove('is-loading'); lenis && lenis.start(); ScrollTrigger.refresh(); } })
      .to('.loader-kanji', { scale: 1.4, opacity: 0, duration: 0.5, ease: 'power2.in' })
      .to('.loader', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.1')
      .set('.loader', { display: 'none' })
      .from('.hero-title .line > span', { yPercent: 110, duration: 1.1, stagger: 0.08, ease: 'power4.out' }, '-=0.55')
      .from('.moon', { scale: 0.2, opacity: 0, duration: 1.4, ease: 'expo.out' }, '<')
      .fromTo('.hero-ink', { clipPath: 'inset(100% 0 0 0)', yPercent: 8 }, { clipPath: 'inset(0% 0 0 0)', yPercent: 0, duration: 1.6, ease: 'expo.out' }, '<0.1')
      .from('.hero-kanji, .hero-sub, .hero-cue, .nav', { opacity: 0, duration: 0.8, stagger: 0.08 }, '<0.4')
      .to('.hud', { opacity: 1, duration: 0.6 }, '<0.3');
  });

  /* ---------- scroll scenes ---------- */
  gsap.set('.wipe i', { xPercent: 120, skewX: -24 });
  const mm = gsap.matchMedia();
  mm.add('(min-width: 0px)', () => {

    // 01 HERO: Ulquiorra rises, title parts, moon swallows the screen, cut to black
    const heroTl = gsap.timeline({
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=220%', scrub: 1, pin: true },
    });
    heroTl
      .to('.hero-cue, .hero-sub', { opacity: 0, duration: 0.4 }, 0)
      .to('.hero-ink', { scale: 1.12, duration: 1.1, ease: 'none' }, 0)
      .to('.hero-l', { xPercent: -40, opacity: 0, duration: 1 }, 1.1)
      .to('.hero-r', { xPercent: 40, opacity: 0, duration: 1 }, 1.1)
      .to('.hero-kanji', { opacity: 0, x: 60, duration: 0.8 }, 1.1)
      .to('.hero-ink', { scale: 2.6, yPercent: -18, duration: 1.6, ease: 'power2.in' }, 1.1)
      .to('.moon', { scale: 7, duration: 1.6, ease: 'power3.in' }, 1.4)
      .to('.hero-flash', { opacity: 1, duration: 0.5 }, 2.6);

    // 02 DESCENT: blade falls, impact, shockwave, kanji
    ScrollTrigger.create({ trigger: '#descent', start: 'top bottom', end: 'bottom top', onToggle: s => (descentVisible = s.isActive) });
    const dTl = gsap.timeline({ scrollTrigger: { trigger: '#descent', start: 'top top', end: '+=200%', scrub: 1, pin: true } });
    dTl
      .fromTo('.blade', { yPercent: -150, rotate: -540 }, { yPercent: 0, rotate: 0, duration: 1.4, ease: 'power3.in' }, 0)
      .to({ v: 0 }, { v: 1, duration: 0.15, onUpdate() { burst = this.targets()[0].v; } }, 1.4)
      .fromTo('.descent-ink', { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 1.4)
      .fromTo('.shock', { scale: 0, opacity: 1 }, { scale: 2.6, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 1.4)
      .to('.descent-inner', { keyframes: { x: [0, -14, 12, -8, 6, 0] }, duration: 0.35 }, 1.4)
      .to({ v: 1 }, { v: 0, duration: 0.6, onUpdate() { burst = this.targets()[0].v; } }, 1.55)
      .fromTo('.descent-kanji span', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'power4.out' }, 1.6)
      .from('.descent-cap', { opacity: 0, y: 20, duration: 0.4 }, 1.9)
      .to('.descent-inner', { opacity: 0, duration: 0.5 }, 2.6);

    // 03 THE CUT: slash draws across, halves slide apart along the cut
    const fTl = gsap.timeline({ scrollTrigger: { trigger: '#frame', start: 'top top', end: '+=200%', scrub: 1, pin: true } });
    fTl
      .from('.frame-half .frame-title', { yPercent: 40, opacity: 0, duration: 0.6 }, 0)
      .from('.frame-half .frame-kanji', { scale: 1.3, opacity: 0, duration: 0.8 }, 0)
      .from('.frame-half .frame-ink', { xPercent: 12, opacity: 0, duration: 0.8 }, 0)
      .to('.slash-stroke', { scaleX: 1, duration: 0.35, ease: 'power4.in' }, 0.9)
      .to('.frame-half.a', { x: '-3vw', y: '-0.4vh', duration: 1, ease: 'power3.out' }, 1.3)
      .to('.frame-half.b', { x: '3vw', y: '0.4vh', duration: 1, ease: 'power3.out' }, 1.3)
      .to('.frame-half.a', { x: '-60vw', y: '-30vh', duration: 1, ease: 'power3.in' }, 2.4)
      .to('.frame-half.b', { x: '60vw', y: '30vh', duration: 1, ease: 'power3.in' }, 2.4);

    // 04 HIT: letters slam, speed lines, impact-frame invert, diagonal wipe to paper
    const hTl = gsap.timeline({ scrollTrigger: { trigger: '#hit', start: 'top top', end: '+=240%', scrub: 1, pin: true } });
    hTl
      .from('.hit-ours', { x: -80, opacity: 0, duration: 0.4 }, 0)
      .fromTo('.hit-big span', { scale: 3.2, opacity: 0, rotate: () => gsap.utils.random(-14, 14) },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.35, stagger: 0.16, ease: 'power4.in' }, 0.2)
      .to('.speedlines', { opacity: 1, rotate: 8, duration: 0.6 }, 0.85)
      .to('.hit-invert', { autoAlpha: 1, duration: 0.04 }, 0.95)
      .to('.hit-invert', { autoAlpha: 0, duration: 0.04 }, 1.02)
      .to('.hit-invert', { autoAlpha: 1, duration: 0.04 }, 1.08)
      .to('.hit-invert', { autoAlpha: 0, duration: 0.04 }, 1.14)
      .fromTo('.hit-ink', { xPercent: 30, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0)
      .to('.hit-ink', { scale: 1.08, duration: 1.4 }, 0.6)
      .from('.hit-cap', { opacity: 0, y: 20, duration: 0.3 }, 1.2)
      .to('.wipe .w1', { xPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 1.9)
      .to('.wipe .w2', { xPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 2.0)
      .to('.wipe .w3', { xPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 2.1);

    // nav turns dark over the paper sections
    ScrollTrigger.create({
      trigger: '#manifesto', start: 'top 60px', endTrigger: '#work', end: 'bottom 60px',
      toggleClass: { targets: '.nav, .hud', className: 'is-dark' },
    });

    // 05 MANIFESTO
    gsap.from('.manifesto-title .line > span', {
      yPercent: 110, duration: 1.1, stagger: 0.1, ease: 'power4.out',
      scrollTrigger: { trigger: '.manifesto-title', start: 'top 80%' },
    });
    gsap.from('.manifesto-cols > *', {
      y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.manifesto-cols', start: 'top 85%' },
    });
    $$('.stats b').forEach(b => {
      const o = { v: 0 };
      gsap.to(o, {
        v: +b.dataset.count, duration: 1.6, ease: 'power2.out',
        onUpdate: () => (b.textContent = Math.round(o.v)),
        scrollTrigger: { trigger: b, start: 'top 90%' },
      });
    });

    // 06 WORK rows
    gsap.from('.work-list li', {
      y: 60, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.work-list', start: 'top 85%' },
    });

    // 07 ROSTER: cards drop into a pile, fan out, then each captain steps forward
    const cards = $$('.card'), mid = (cards.length - 1) / 2;
    const spread = () => (innerWidth < 760 ? innerWidth * 0.075 : Math.min(innerWidth * 0.105, 190));
    const fanY = i => Math.abs(i - mid) ** 2 * (innerWidth < 760 ? 4 : 7);
    const pileRot = cards.map(() => gsap.utils.random(-9, 9));
    const rTl = gsap.timeline({
      scrollTrigger: { trigger: '#roster', start: 'top top', end: '+=320%', scrub: 1, pin: true, invalidateOnRefresh: true },
    });
    rTl
      .fromTo('.roster-head > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 }, 0)
      .fromTo(cards, { y: () => innerHeight, rotate: () => gsap.utils.random(-40, 40) },
        { y: 0, rotate: i => pileRot[i], stagger: 0.07, duration: 0.6, ease: 'power3.out' }, 0)
      .to(cards, { x: i => (i - mid) * spread(), y: fanY, rotate: i => (i - mid) * 6, duration: 1, ease: 'power2.inOut' }, 1.1);
    const lift = 2.2, step = 0.3;
    cards.forEach((c, i) => {
      rTl.to(c, { y: () => fanY(i) - 70, scale: 1.14, rotate: 0, zIndex: 20, duration: step * 0.5, ease: 'power2.out' }, lift + i * step)
        .to(c, { y: () => fanY(i), scale: 1, rotate: (i - mid) * 6, zIndex: 1, duration: step * 0.5, ease: 'power2.in' }, lift + i * step + step * 0.5);
    });
    // Aizen's card gets stamped as he steps forward
    rTl.to('.stamp', { opacity: 1, scale: 1, duration: step * 0.25, ease: 'power3.in' }, lift + 6 * step + step * 0.1);
    rTl.eventCallback('onUpdate', () => {
      const i = gsap.utils.clamp(0, cards.length - 1, Math.floor((rTl.time() - lift) / step));
      $('#rosterNum').textContent = String(i + 1).padStart(2, '0');
    });

    // 08 HOLLOW: a torn red edge drags the inverted Hollow across the page
    const jag = Array.from({ length: 21 }, () => gsap.utils.random(-5, 5));
    const edge = $('#hollowEdge'), edgeGlow = $('#hollowEdgeGlow'), hb = $('.hollow-b');
    const setEdge = p => {
      const X = p * 135 - 18;
      const pts = jag.map((j, k) => [X + j + (k * 5 - 50) * 0.18, k * 5]);
      hb.style.clipPath = `polygon(0 0, ${pts.map(([x, y]) => `${x}% ${y}%`).join(', ')}, 0 100%)`;
      const line = pts.map(([x, y]) => `${x},${y}`).join(' ');
      edge.setAttribute('points', line);
      edgeGlow.setAttribute('points', line);
    };
    setEdge(0);
    const hollowP = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: '#hollow', start: 'top top', end: '+=220%', scrub: 1, pin: true } })
      .fromTo('.hollow-a, .hollow-b', { scale: 1.18 }, { scale: 1, duration: 2.4, ease: 'none' }, 0)
      .from('.hollow-text', { xPercent: 30, opacity: 0, duration: 0.4 }, 0)
      .from('.hollow-kanji span', { yPercent: 80, opacity: 0, stagger: 0.12, duration: 0.4 }, 0.15)
      .to(hollowP, { v: 1, duration: 1.8, ease: 'power1.inOut', onUpdate: () => setEdge(hollowP.v) }, 0.4);

    // 09 VERSUS: halves slam together, flash, VS stamps in, shake
    gsap.set('.vs-half.l', { xPercent: -100 });
    gsap.set('.vs-half.r', { xPercent: 100 });
    gsap.timeline({ scrollTrigger: { trigger: '#versus', start: 'top top', end: '+=180%', scrub: 1, pin: true } })
      .to('.vs-half.l, .vs-half.r', { xPercent: 0, duration: 0.6, ease: 'power4.in' }, 0)
      .fromTo('.vs-flash', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.6)
      .to('.vs-flash', { opacity: 0, duration: 0.3 }, 0.66)
      .fromTo('.vs-word span', { scale: 4, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1, duration: 0.3, ease: 'power4.in' }, 0.7)
      .to('.vs-half, .vs-word', { keyframes: { x: [0, -18, 14, -10, 6, 0] }, duration: 0.3 }, 1.05)
      .from('.vs-name.l', { xPercent: -130, duration: 0.4, ease: 'power3.out' }, 1.1)
      .from('.vs-name.r', { xPercent: 130, duration: 0.4, ease: 'power3.out' }, 1.1)
      .to('.vs-half.l', { xPercent: -3, duration: 0.6 }, 1.4)
      .to('.vs-half.r', { xPercent: 3, duration: 0.6 }, 1.4);

    // 10 GETSUGA: the crescent tears across, swallows the frame, the name burns in
    gsap.timeline({ scrollTrigger: { trigger: '#getsuga', start: 'top top', end: '+=240%', scrub: 1, pin: true, invalidateOnRefresh: true } })
      .fromTo('.getsuga-art', { scale: 1.3, xPercent: 8 }, { scale: 1, xPercent: 0, duration: 1.2, ease: 'power2.out' }, 0)
      .fromTo('.crescent', { x: () => -innerWidth * 0.4, y: () => innerHeight * 0.9, rotate: -40, scale: 0.3, opacity: 0 },
        { x: () => innerWidth * 0.3, y: () => -innerHeight * 0.05, rotate: 10, scale: 1.3, opacity: 1, duration: 0.8, ease: 'power2.in' }, 0.6)
      .to('.getsuga-art', { keyframes: { x: [0, -12, 10, -6, 0] }, duration: 0.3 }, 1.35)
      .to('.crescent', { x: () => innerWidth * 0.5, y: () => -innerHeight * 0.4, scale: 7, duration: 0.5, ease: 'power3.in' }, 1.4)
      .to('.getsuga-black', { opacity: 1, duration: 0.15 }, 1.75)
      .fromTo('.getsuga-kanji span', { opacity: 0, yPercent: 60, scale: 1.6 },
        { opacity: 1, yPercent: 0, scale: 1, stagger: 0.12, duration: 0.4, ease: 'power3.out' }, 1.9)
      .fromTo('.getsuga-label, .getsuga-text p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.3 }, 2.3);


    // STORY HUD: tracks which chapter is on screen (created after the pins so spacers exist)
    const chapters = $$('[data-chapter]');
    const ticks = $('#hudTicks');
    ticks.innerHTML = chapters.map(() => '<i></i>').join('');
    const setCh = i => {
      $('#hudCh').textContent = chapters[i].dataset.chapter;
      $('#hudTitle').innerHTML = chapters[i].dataset.title;
      $$('i', ticks).forEach((t, k) => t.classList.toggle('on', k === i));
    };
    const box = el => (el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el);
    ScrollTrigger.create({
      trigger: box($('#roster')), start: 'top 60px', end: 'bottom 60px',
      toggleClass: { targets: '.nav, .hud', className: 'is-dark' },
    });
    chapters.forEach((sec, i) => ScrollTrigger.create({
      trigger: box(sec), start: 'top 50%', end: 'bottom 50%',
      onToggle: st => st.isActive && setCh(i),
    }));
    ScrollTrigger.create({
      trigger: box(chapters[0]), start: 'top top', endTrigger: box(chapters[chapters.length - 1]), end: 'bottom 50%',
      onToggle: st => gsap.to('.hud', { opacity: st.isActive && !document.body.classList.contains('is-loading') ? 1 : 0, duration: 0.4 }),
    });

    // 11 FRAMES horizontal run
    const track = $('#framesTrack');
    gsap.to(track, {
      x: () => -(track.scrollWidth - innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: '#frames', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth),
        scrub: 1, pin: true, invalidateOnRefresh: true,
      },
    });
    $$('.panel').forEach(p => gsap.fromTo(p.querySelector('.panel-art img'), { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '#frames', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), scrub: true },
    }));

    // 12 CONTACT
    gsap.from('.contact-word', {
      yPercent: 60, ease: 'none',
      scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  });

  /* ---------- marquees: drift, and surge with scroll velocity ----------
     Width is measured once (and on resize), never inside the frame loop: reading
     layout there forces a reflow every frame. Off-screen bands don't tick at all. */
  $$('.marquee-track').forEach(t => {
    t.innerHTML += t.innerHTML;
    const dir = +t.dataset.speed || 1;
    let x = 0, skew = 0, w = 0, on = false;
    const measure = () => (w = t.scrollWidth / 2);
    document.fonts.ready.then(measure);
    addEventListener('resize', measure);
    new IntersectionObserver(([e]) => (on = e.isIntersecting)).observe(t.parentElement);
    gsap.ticker.add(() => {
      if (!on || !w) return;
      const v = lenis ? lenis.velocity : 0;
      x = gsap.utils.wrap(-w, 0, x - (1 + Math.abs(v) * 0.35) * dir);
      skew += (gsap.utils.clamp(-12, 12, -v * 0.4) - skew) * 0.15;
      t.style.transform = `translate3d(${x}px,0,0) skewX(${skew}deg)`;
    });
  });

  /* ---------- decode every drawing up front, in idle time, so none decodes mid-scroll ---------- */
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
  addEventListener('load', () => idle(() => {
    $$('img').forEach(img => {
      img.loading = 'eager';
      img.decode?.().catch(() => {});
    });
  }));

  /* ---------- work hover preview ---------- */
  const preview = $('.work-preview'), wpInner = $('.wp-inner');
  if (!touch) {
    const px = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3' });
    const py = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3' });
    const pr = gsap.quickTo(preview, 'rotate', { duration: 0.6, ease: 'power3' });
    let lastX = 0;
    $('.work-list').addEventListener('pointermove', e => {
      px(e.clientX); py(e.clientY); pr(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6)); lastX = e.clientX;
    });
    $$('.work-list li').forEach(li => {
      li.addEventListener('pointerenter', () => {
        const media = scenes[li.dataset.preview];
        wpInner.innerHTML = `<img src="${media?.src || `assets/art/${li.dataset.preview}.webp`}" alt="">`;
        gsap.to(preview, { clipPath: 'inset(0% 0 0% 0)', duration: 0.5, ease: 'power3.out' });
      });
      li.addEventListener('pointerleave', () => gsap.to(preview, { clipPath: 'inset(50% 0 50% 0)', duration: 0.4, ease: 'power3.in' }));
    });
  }

  /* ---------- media slots (assets/scenes.json) ----------
     A scene can be a frame sequence (scrubbed on a canvas) or a video (scrubbed by currentTime).
     The scene's pinned section drives playback progress. */
  let scenes = {};
  fetch('assets/scenes.json').then(r => (r.ok ? r.json() : {})).catch(() => ({})).then(json => {
    scenes = json || {};
    $$('.scene-media').forEach(slot => {
      const def = scenes[slot.dataset.scene];
      if (!def) return;
      const section = slot.closest('section');
      section.classList.add('has-media');
      slot.classList.add('is-on');
      if (def.type === 'frames') mountFrames(slot, def, section);
      else if (def.type === 'video') mountVideo(slot, def, section);
      else if (def.type === 'image') mountImage(slot, def, section);
    });
    // gallery images
    (scenes.gallery || []).forEach((src, i) => {
      const art = $$('.panel .panel-art')[i];
      if (art && src) art.querySelector('img').src = src;
    });
    ScrollTrigger.refresh();
  });

  function progressOf(section) {
    return ScrollTrigger.getAll().find(t => t.trigger === section && t.pin);
  }
  function mountFrames(slot, def, section) {
    const c = document.createElement('canvas'), g = c.getContext('2d');
    slot.appendChild(c);
    const pad = def.pad || 4, imgs = [];
    for (let i = 1; i <= def.count; i++) {
      const im = new Image();
      im.src = `${def.path}${String(i).padStart(pad, '0')}.${def.ext || 'webp'}`;
      imgs.push(im);
    }
    let cur = -1;
    const draw = i => {
      const im = imgs[i];
      if (!im || !im.complete || !im.naturalWidth) return;
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      g.drawImage(im, 0, 0);
      cur = i;
    };
    imgs[0].onload = () => draw(0);
    gsap.ticker.add(() => {
      const st = progressOf(section);
      if (!st) return;
      const i = Math.min(def.count - 1, Math.floor(st.progress * (def.range || 1) * def.count));
      if (i !== cur) draw(i);
    });
  }
  function mountImage(slot, def, section) {
    slot.innerHTML = `<img src="${def.src}" alt="" style="width:100%;height:100%;object-fit:cover">`;
    gsap.fromTo(slot.firstChild, { scale: 1 }, {
      scale: def.zoom || 1.25, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => progressOf(section)?.end ?? 'bottom top', scrub: true },
    });
  }
  function mountVideo(slot, def, section) {
    const v = document.createElement('video');
    Object.assign(v, { src: def.src, muted: true, playsInline: true, preload: 'auto' });
    slot.appendChild(v);
    gsap.ticker.add(() => {
      const st = progressOf(section);
      if (!st || !v.duration) return;
      const t = Math.min(v.duration - 0.05, st.progress * (def.range || 1) * v.duration);
      if (Math.abs(v.currentTime - t) > 0.03) v.currentTime = t;
    });
  }

  /* ---------- resize ---------- */
  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(sizeCanvas, 200);
  });
})();
