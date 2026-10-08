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

  /* ---------- the archive: random manga panels, reshuffled every visit ----------
     One shuffled bag feeds the loader, the marquees, two extra gallery panels and the
     sticker zones, so nothing repeats until the pool runs out. */
  const POOL = Array.from({ length: 28 }, (_, i) => `assets/art/scatter/s${String(i + 1).padStart(2, '0')}.webp`);
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(v => v[1]);
  let bag = shuffle(POOL);
  const drawPanel = () => (bag.length ? bag : (bag = shuffle(POOL))).pop();
  const tag = src => 'ARCHIVE · ' + src.match(/s(\d+)/)[1];
  const rnd = gsap.utils.random;

  $('.loader-panel').src = drawPanel();

  $$('.marquee-track').forEach(t => {
    $$('span', t).forEach((sp, i) => {
      if (i % 2) sp.insertAdjacentHTML('afterend', `<img class="marquee-thumb" src="${drawPanel()}" alt="" style="--r:${rnd(-6, 6)}deg">`);
    });
  });

  for (let i = 0; i < 2; i++) {
    const src = drawPanel();
    $('#framesTrack').insertAdjacentHTML('beforeend',
      `<figure class="panel"><div class="panel-art"><img src="${src}" alt=""></div><figcaption><span>${tag(src)}</span>FROM THE DESK</figcaption></figure>`);
  }

  const mobile = innerWidth < 760;
  $$('.scatter-zone').forEach(zone => {
    const n = Math.min(+zone.dataset.scatter || 2, mobile ? 4 : 99);
    const cols = zone.classList.contains('contact-zone') ? 2 : mobile ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const src = drawPanel(), col = i % cols, row = Math.floor(i / cols);
      const fig = document.createElement('figure');
      fig.className = 'sticker';
      fig.innerHTML = `<img src="${src}" alt=""><figcaption>${tag(src)}</figcaption>`;
      const left = (col / cols) * 100 + rnd(2, 100 / cols - 26);
      const top = cols === 2 && !mobile ? rnd(0, 30) + row * 40 : 16 + row * 42 + rnd(-4, 6) + (i === 0 ? 24 : 0);
      fig.style.cssText = `left:${left}%;top:${top}%;--w:${Math.round(rnd(190, 290))}px;rotate:${rnd(-13, 13)}deg;--tape:${rnd(-9, 9)}deg`;
      zone.appendChild(fig);
      gsap.fromTo(fig, { yPercent: rnd(15, 55) }, {
        yPercent: -rnd(15, 55), ease: 'none',
        scrollTrigger: { trigger: zone.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
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

    // 10 MUGETSU: a manga page slams together, ink floods it, no moon, then the blade goes back
    // the ink flood is drawn on a half-resolution canvas: one cheap fill per frame,
    // scaled up by the GPU (a clip-path here repainted the full screen every frame)
    const flood = $('.mg-flood'), fctx = flood.getContext('2d'), FS = 0.5;
    const ph = [0, 0, 0, 0].map(() => gsap.utils.random(0, Math.PI * 2));
    const floodJag = Array.from({ length: 120 }, (_, k) => {
      const a = (k / 120) * Math.PI * 2;
      return 0.55 * Math.sin(3 * a + ph[0]) + 0.3 * Math.sin(5 * a + ph[1]) + 0.2 * Math.sin(11 * a + ph[2])
        + 0.12 * Math.sin(23 * a + ph[3]) + gsap.utils.random(-0.08, 0.08);
    });
    const sizeFlood = () => { flood.width = Math.ceil(innerWidth * FS); flood.height = Math.ceil(innerHeight * FS); };
    sizeFlood();
    addEventListener('resize', sizeFlood);
    let floodLast = -1;
    const setFlood = p => {
      if (Math.abs(p - floodLast) < 0.001) return;
      floodLast = p;
      const w = flood.width, h = flood.height;
      fctx.clearRect(0, 0, w, h);
      if (p <= 0) return;
      const cx = w * 0.5, cy = h * 0.6, R = p * Math.hypot(w, h) * 0.8;
      fctx.beginPath();
      floodJag.forEach((j, k) => {
        const a = (k / floodJag.length) * Math.PI * 2, r = R * (1 + j * 0.14 + Math.sin(p * 6 + k * 0.4) * 0.02);
        k ? fctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : fctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      });
      fctx.closePath();
      fctx.fillStyle = '#050505';
      fctx.fill();
    };
    setFlood(0);

    // Rukia dissolves block by block, bottom first, like the panel in chapter 423
    const rCanvas = $('.fw-rukia'), rCtx = rCanvas.getContext('2d'), rImg = new Image();
    let blocks = [], erased = 0;
    const B = 3;
    rImg.onload = () => {
      rCanvas.width = rImg.naturalWidth; rCanvas.height = rImg.naturalHeight;
      rCtx.drawImage(rImg, 0, 0);
      for (let y = 0; y < rCanvas.height; y += B) for (let x = 0; x < rCanvas.width; x += B)
        blocks.push([x, y, (1 - y / rCanvas.height) * 0.6 + Math.random() * 0.4]);
      blocks.sort((p, q) => p[2] - q[2]);
    };
    rImg.src = 'assets/art/ch7/farewell-rukia.webp';
    const setDissolve = p => {
      if (!blocks.length) return;
      const target = Math.floor(p * blocks.length);
      if (target < erased) { rCtx.globalCompositeOperation = 'source-over'; rCtx.drawImage(rImg, 0, 0); erased = 0; }
      for (; erased < target; erased++) rCtx.clearRect(blocks[erased][0], blocks[erased][1], B, B);
    };

    const floodP = { v: 0 }, dissP = { v: 0 };
    // the farewell is on paper: the nav and HUD go dark for it
    const navDark = on => $$('.nav, .hud').forEach(el => el.classList.toggle('is-dark', on));
    const mTl = gsap.timeline({ scrollTrigger: {
      trigger: '#mugetsu', start: 'top top', end: '+=460%', scrub: 1, pin: true,
      onUpdate: st => navDark(st.progress > 0.7 && st.progress < 1),
      onLeave: () => navDark(false), onLeaveBack: () => navDark(false),
    } });
    mTl.fromTo('.mg-page', { scale: 0.86, rotate: -3, opacity: 0 }, { scale: 1, rotate: -1, opacity: 1, duration: 0.4, ease: 'power3.out' }, 0);
    [['.a1', -1, 0.3], ['.a2', 1, 0.55], ['.a3', -1, 0.8], ['.a4', 1, 1.05], ['.a5', 1, 1.35]].forEach(([sel, dir, t]) =>
      mTl.fromTo(sel, { xPercent: dir * 35, scale: 1.18, opacity: 0 }, { xPercent: 0, scale: 1, opacity: 1, duration: 0.28, ease: 'power4.in' }, t));
    mTl
      .fromTo('.b1', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2 }, 0.5)
      .to('.mg-page', { keyframes: { x: [0, -16, 13, -8, 5, 0] }, duration: 0.3 }, 1.33)
      .fromTo('.b2', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2 }, 1.25)
      .fromTo('.b3', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2 }, 1.55)
      .to('.mg-page', { scale: 2.7, rotate: 0, duration: 0.7, ease: 'power2.in' }, 1.85)
      .to(floodP, { v: 1, duration: 0.6, ease: 'power2.in', onUpdate: () => setFlood(floodP.v) }, 2.1)
      .set('.mg-page', { autoAlpha: 0 }, 2.72)
      .fromTo('.mg-kanji', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 2.72)
      .fromTo('.mg-kanji i', { scaleY: 1 }, { scaleY: 0, stagger: 0.25, duration: 0.4, ease: 'power2.inOut' }, 2.8)
      .fromTo('.mg-nomoon', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 3.35)
      .to('.mg-nomoon', { opacity: 0, duration: 0.2 }, 3.6)
      .fromTo('.mg-pillar', { opacity: 0, scale: 1.12 }, { opacity: 0.85, scale: 1, duration: 0.8, ease: 'power2.out' }, 3.65)
      .to('.mg-kanji', { opacity: 0, duration: 0.3 }, 4.3)
      .to('.mg-farewell', { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'power3.inOut' }, 4.5)
      .fromTo('.fw-title .line > span', { yPercent: 110 }, { yPercent: 0, stagger: 0.12, duration: 0.5, ease: 'power4.out' }, 4.85)
      .fromTo('.fw-narr', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 }, 5.15)
      .to(dissP, { v: 1, duration: 1.1, ease: 'none', onUpdate: () => setDissolve(dissP.v) }, 5.25)
      .fromTo('.fw-rukia', { opacity: 1 }, { opacity: 0, duration: 0.25 }, 6.1)
      .fromTo('.fw-end', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 6.2)
      .to({}, { duration: 0.3 }, 6.4);

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
    [box($('#roster')), $('#archive')].forEach(trigger => ScrollTrigger.create({
      trigger, start: 'top 60px', end: 'bottom 60px',
      toggleClass: { targets: '.nav, .hud', className: 'is-dark' },
    }));
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
