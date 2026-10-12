(() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = matchMedia('(hover: none)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const loader = $('#loader'), curtain = $('.curtain');
const ss = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
             set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
if (!window.gsap) { loader && loader.remove(); html.classList.remove('arrive'); return; }
gsap.registerPlugin(ScrollTrigger);

/* ---------- плавный скролл ---------- */
let lenis = null;
if (!RM && window.Lenis) {
  lenis = new Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollTo = t => lenis ? lenis.scrollTo(t, { duration: 1.6, easing: x => 1 - Math.pow(1 - x, 4) }) : $(t)?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });

/* ---------- переходы между страницами: шторка ---------- */
function leave(href, label) {
  if (RM || !curtain) { location.href = href; return; }
  ss.set('curtain', label || '');
  $('.curtain-t', curtain).textContent = label || '';
  gsap.timeline()
    .set(curtain, { visibility: 'visible', clipPath: 'inset(100% 0 0 0)' })
    .to(curtain, { clipPath: 'inset(0% 0 0 0)', duration: .75, ease: 'expo.inOut' })
    .from($('.curtain-t', curtain), { yPercent: 120, duration: .5, ease: 'expo.out' }, '-=.25')
    .add(() => { location.href = href; }, '+=.05');
}
addEventListener('pageshow', e => { if (e.persisted && curtain) gsap.set(curtain, { visibility: 'hidden' }); });
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  const raw = a.getAttribute('href');
  if (raw.startsWith('#')) {
    if (raw.length < 2) { e.preventDefault(); return; }
    const m = raw.slice(1);
    if (MODALS[m]) { e.preventDefault(); openModal(m); return; }
    if ($(raw)) { e.preventDefault(); closeMenu(); scrollTo(raw); }
    return;
  }
  if (a.target === '_blank' || a.hasAttribute('download')) return;
  let u; try { u = new URL(a.href, location.href); } catch (_) { return; }
  if (u.origin !== location.origin || /\.(pdf|jpe?g|png|docx?)$/i.test(u.pathname)) return;
  if (u.pathname === location.pathname && u.hash) return;
  e.preventDefault(); closeMenu();
  leave(u.href, a.dataset.label || a.textContent.trim().split('\n')[0].slice(0, 60));
});

/* ---------- разбивка текста на буквы ---------- */
function split(el) {
  if (el._split) return el._split;
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/([  \n]+)/).forEach(part => {
        if (!part) return;
        if (/^[  \n]+$/.test(part)) { frag.appendChild(document.createTextNode(part.replace(/\n/g, ' '))); return; }
        const w = document.createElement('span'); w.className = 'w';
        for (const ch of part) { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; w.appendChild(c); }
        frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
  });
  walk(el);
  return el._split = $$('.c', el);
}

/* ---------- курсор и магнитные кнопки ---------- */
if (!TOUCH && $('.cur')) {
  const cur = $('.cur'), dot = $('.cur-dot'), lab = $('.cur span');
  const xr = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' }), yr = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
  const xd = gsap.quickTo(dot, 'x', { duration: .08 }), yd = gsap.quickTo(dot, 'y', { duration: .08 });
  addEventListener('pointermove', e => { xr(e.clientX); yr(e.clientY); xd(e.clientX); yd(e.clientY); });
  document.addEventListener('pointerover', e => { const el = e.target.closest('[data-cursor]'); if (el) { lab.textContent = el.dataset.cursor; cur.classList.add('big'); } });
  document.addEventListener('pointerout', e => { const el = e.target.closest('[data-cursor]'); if (el && !el.contains(e.relatedTarget)) cur.classList.remove('big'); });
  $$('[data-magnetic]').forEach(el => {
    const xt = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yt = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); xt((e.clientX - r.left - r.width / 2) * .3); yt((e.clientY - r.top - r.height / 2) * .4); });
    el.addEventListener('pointerleave', () => { xt(0); yt(0); });
  });
}

/* ---------- меню ---------- */
const menu = $('#menu'), burger = $('.burger');
let menuTl = null;
if (menu) menuTl = gsap.timeline({ paused: true })
  .set(menu, { visibility: 'visible' })
  .to(menu, { clipPath: 'circle(150% at 100% 0%)', duration: .9, ease: 'expo.inOut' })
  .from($$('.m-main a span', menu), { yPercent: 110, duration: .7, stagger: .04, ease: 'expo.out' }, '-=.35')
  .from($$('.side > div', menu), { autoAlpha: 0, y: 20, stagger: .08, duration: .5 }, '<.1');
function closeMenu() { if (!document.body.classList.contains('menu-open')) return; document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); menuTl.timeScale(1.6).reverse(); lenis && lenis.start(); }
burger && burger.addEventListener('click', () => {
  if (document.body.classList.contains('menu-open')) return closeMenu();
  document.body.classList.add('menu-open'); burger.setAttribute('aria-expanded', 'true'); menuTl.timeScale(1).play(); lenis && lenis.stop();
});

/* выпадающее меню услуг в шапке */
$$('.dd').forEach(dd => {
  const b = $('button', dd);
  const set = v => { dd.classList.toggle('open', v); b.setAttribute('aria-expanded', v); };
  b.addEventListener('click', () => set(!dd.classList.contains('open')));
  dd.addEventListener('pointerleave', () => set(false));
  document.addEventListener('click', e => { if (!dd.contains(e.target)) set(false); });
});

/* ---------- модальные формы ---------- */
const MODALS = {};
$$('.modal').forEach(m => MODALS[m.id] = m);
let lastFocus = null;
function openModal(id) {
  const m = MODALS[id]; if (!m) return;
  lastFocus = document.activeElement; m.hidden = false; lenis && lenis.stop();
  gsap.fromTo($('.modal-box', m), { yPercent: 30, opacity: 0, rotateX: -10 }, { yPercent: 0, opacity: 1, rotateX: 0, duration: .7, ease: 'expo.out' });
  gsap.fromTo(m, { backgroundColor: 'rgba(10,14,42,0)' }, { backgroundColor: 'rgba(10,14,42,.72)', duration: .4 });
  setTimeout(() => $('input', m)?.focus(), 60);
}
function closeModal(m) {
  gsap.to($('.modal-box', m), { yPercent: 20, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { m.hidden = true; const f = $('.form', m); f && f.classList.remove('sent'); lenis && lenis.start(); lastFocus && lastFocus.focus(); } });
}
$$('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('.modal-x')) closeModal(m); });
});
$$('[data-modal]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openModal(b.dataset.modal); }));
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const m = $$('.modal').find(x => !x.hidden); if (m) return closeModal(m);
  closeMenu();
});

/* ---------- полоса прогресса ---------- */
$('.progress') && gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

/* ---------- фон-«калька»: текст записки превращается в код рядом с курсором ----------
   Статичный слой букв рисуется один раз в отдельный canvas; каждый кадр — копия слоя
   и только «горячие» клетки в окне вокруг курсора и полосы сканера. */
function glyphField(cv) {
  const host = cv.parentElement, ctx = cv.getContext('2d');
  const BASE = (cv.dataset.base || 'ПОЯСНИТЕЛЬНАЯ ЗАПИСКА ПРОЕКТНАЯ ДОКУМЕНТАЦИЯ РЕЗУЛЬТАТЫ ИНЖЕНЕРНЫХ ИЗЫСКАНИЙ СМЕТНАЯ ДОКУМЕНТАЦИЯ ЗАКЛЮЧЕНИЕ ЭКСПЕРТИЗЫ ЕГРЗ ').toUpperCase() + ' ';
  const CODE = cv.dataset.code || '<Expertise><Object/><Conclusion result="positive"/><EGRZ/><Section n="1"/><Estimate/><Survey/></Expertise>';
  const dark = cv.classList.contains('on-dark');
  const cold = dark ? 'rgba(232,234,229,.06)' : 'rgba(12,16,51,.075)', hotRGB = dark ? '141,152,255' : '36,51,255';
  const layer = document.createElement('canvas'), lctx = layer.getContext('2d');
  let W, H, cols, rows, cell, cw, heat, live = new Set(), dpr, mx = -999, my = -999, sweep = -0.3, visible = true, last = 0;
  const font = () => `500 ${cell * .78}px "JetBrains Mono", monospace`;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, TOUCH ? 1.5 : 2);
    W = host.clientWidth; H = host.clientHeight;
    for (const [c, x] of [[cv, ctx], [layer, lctx]]) { c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    cell = W < 600 ? 13 : 15; cw = cell * .62;
    cols = Math.ceil(W / cw); rows = Math.ceil(H / cell);
    heat = new Float32Array(cols * rows); live = new Set();
    lctx.font = font(); lctx.textBaseline = 'top'; lctx.fillStyle = cold;
    for (let r = 0; r < rows; r++) { let s = ''; for (let c = 0; c < cols; c++) s += BASE[(r * cols + c) % BASE.length]; for (let c = 0; c < cols; c++) lctx.fillText(s[c], c * cw, r * cell); }
    ctx.font = font(); ctx.textBaseline = 'top';
    ctx.clearRect(0, 0, W, H); ctx.drawImage(layer, 0, 0, W, H);
  }
  size(); let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); });
  host.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  host.addEventListener('pointerleave', () => { mx = my = -999; });
  new IntersectionObserver(([en]) => visible = en.isIntersecting).observe(host);
  const heatBox = (x0, y0, x1, y1, fn) => {
    const c0 = Math.max(0, Math.floor(x0 / cw)), c1 = Math.min(cols - 1, Math.ceil(x1 / cw)), r0 = Math.max(0, Math.floor(y0 / cell)), r1 = Math.min(rows - 1, Math.ceil(y1 / cell));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { const i = r * cols + c, h = fn(c * cw, r * cell); if (h > heat[i]) { heat[i] = h; live.add(i); } }
  };
  function frame(t) {
    requestAnimationFrame(frame);
    if (!visible || t - last < (TOUCH ? 50 : 33)) return; last = t;
    sweep += TOUCH ? 0.0063 : 0.0042; if (sweep > 1.4) sweep = -0.4;
    const sx = sweep * W, R = 150, R2 = R * R;
    if (mx > -999) heatBox(mx - R, my - R, mx + R, my + R, (x, y) => { const d2 = (x - mx) ** 2 + (y - my) ** 2; return d2 < R2 ? 1 - d2 / R2 : 0; });
    if (sx > -70 && sx < W + 70) heatBox(sx - 70, 0, sx + 70, H, x => { const ds = Math.abs(x - sx); return ds < 70 ? (1 - ds / 70) * .55 : 0; });
    ctx.clearRect(0, 0, W, H); ctx.drawImage(layer, 0, 0, W, H);
    const bg = dark ? '#0A0E2A' : '#E8EAE5';
    for (const i of live) {
      const h = heat[i] *= .93;
      if (h < .08) { heat[i] = 0; live.delete(i); continue; }
      const x = (i % cols) * cw, y = ((i / cols) | 0) * cell;
      ctx.fillStyle = bg; ctx.fillRect(x, y, cw, cell);
      ctx.fillStyle = `rgba(${hotRGB},${(.12 + h * .8).toFixed(2)})`;
      ctx.fillText(CODE[i % CODE.length], x, y);
    }
  }
  if (RM) return;
  requestAnimationFrame(frame);
}

/* ---------- буквы заголовка худеют под курсором: координаты букв кэшируются ---------- */
function heroWeight(chars) {
  if (TOUCH || RM || !chars.length) return;
  let mx = -999, my = -999, raf = 0, pos = [], stale = true;
  const cache = () => { pos = chars.map(c => { const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2 + scrollY]; }); stale = false; };
  addEventListener('resize', () => stale = true);
  setTimeout(() => stale = true, 4000);
  const upd = () => { raf = 0; if (stale) cache();
    const y0 = scrollY;
    for (let i = 0; i < chars.length; i++) {
      const d = Math.hypot(pos[i][0] - mx, pos[i][1] - y0 - my), k = Math.max(0, 1 - d / 280), w = Math.round(800 - k * 650);
      if (chars[i]._w !== w) { chars[i]._w = w; chars[i].style.fontVariationSettings = `"wght" ${w}`; }
    }
  };
  addEventListener('pointermove', e => { if (scrollY > innerHeight) return; mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(upd); });
}

/* ---------- лист: PDF → XML (страница перевода ПЗ) ---------- */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hl = s => esc(s)
  .replace(/ ([a-z]+)=("[^"]*")/g, ' <span class="at">$1</span>=<span class="st">$2</span>')
  .replace(/(&lt;\/?)([A-Za-z]+)/g, '<span class="tg">$1$2</span>')
  .replace(/(\/?&gt;)/g, '<span class="tg">$1</span>');
const POOL = '<>/="АБВЖКМПРСТ01{}#';
function scramble(el, to, done) {
  const from = el.textContent, len = Math.max(from.length, to.length), dur = 26;
  let f = 0; cancelAnimationFrame(el._raf);
  const step = () => {
    f++; let out = '';
    for (let i = 0; i < len; i++) {
      const p = i / len * dur * .6;
      if (f > p + dur * .4) out += to[i] || '';
      else if (f > p) out += to[i] === ' ' ? ' ' : POOL[(Math.random() * POOL.length) | 0];
      else out += from[i] || '';
    }
    el.textContent = out;
    if (f < dur) el._raf = requestAnimationFrame(step); else done && done();
  };
  step();
}
function sheet(sec) {
  const LINES = JSON.parse($('script[type="application/json"]', sec).textContent);
  const box = $('.lines', sec), sheetEl = $('.sheet', sec), scan = $('.scan', sec), seal = $('.seal', sec);
  const rn = $('.r-n', sec), re = $('.r-e', sec), rs = $('.r-s', sec);
  const els = LINES.map(([a]) => { const d = document.createElement('div'); d.className = 'ln'; d.textContent = a; box.appendChild(d); return d; });
  let shown = 0, sealed = false;
  const setN = n => {
    if (n === shown) return;
    els.forEach((el, i) => {
      const want = i < n, on = el.classList.contains('on');
      if (want && !on) { el.classList.add('on'); scramble(el, LINES[i][1], () => { if (el.classList.contains('on')) el.innerHTML = hl(LINES[i][1]); }); }
      if (!want && on) { el.classList.remove('on'); scramble(el, LINES[i][0]); }
    });
    shown = n; rn.textContent = String(n).padStart(2, '0');
    rs.textContent = n === 0 ? 'исходник PDF' : n < LINES.length ? 'размечаем поля…' : 'готов к подаче';
  };
  const setSeal = on => {
    if (on === sealed) return; sealed = on;
    if (on) {
      re.textContent = '0'; re.classList.add('ok');
      gsap.fromTo(seal, { scale: 2.6, opacity: 0, rotate: -22 }, { scale: 1, opacity: 1, rotate: -9, duration: .32, ease: 'power4.in',
        onComplete: () => gsap.fromTo(sheetEl, { x: -6, y: 4 }, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1.2,.25)' }) });
    } else { re.textContent = '—'; re.classList.remove('ok'); gsap.to(seal, { opacity: 0, scale: 1.3, duration: .25 }); }
  };
  if (RM) { setN(LINES.length); seal.style.opacity = 1; scan.style.display = 'none'; re.textContent = '0'; return; }
  const onUpdate = self => {
    const p = self.progress;
    gsap.set(scan, { top: (Math.min(p / .88, 1) * 100) + '%', opacity: p > .9 || p < .01 ? 0 : 1 });
    setN(Math.min(LINES.length, Math.floor(p / .88 * (LINES.length + .001))));
    setSeal(p > .92);
  };
  ScrollTrigger.matchMedia({
    '(min-width: 901px) and (min-height: 640px)': () => {
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=220%', pin: true, scrub: true, onUpdate });
      gsap.fromTo(sheetEl, { rotateX: 18, rotateZ: -4, y: 60 }, { rotateX: 0, rotateZ: 0, y: 0, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top 90%', end: 'top top', scrub: true } });
    },
    '(max-width: 900px), (max-height: 639px)': () => ScrollTrigger.create({ trigger: sheetEl, start: 'top 70%', end: 'bottom 30%', scrub: true, onUpdate })
  });
}

/* ---------- счётчики ---------- */
function counters() {
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, dec = +(el.dataset.dec || 0), o = { v: 0 };
    const fmt = v => dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toLocaleString('ru-RU').replace(/ /g, ' ');
    if (RM) return;
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => {
      el.textContent = fmt(0);
      gsap.to(o, { v: to, duration: 2.2, ease: 'expo.out', onUpdate: () => el.textContent = fmt(o.v) });
    } });
  });
}

/* ---------- FAQ ---------- */
$$('.q').forEach(q => {
  const b = $('button', q), a = $('.a', q);
  b.addEventListener('click', () => {
    const open = !q.classList.contains('open');
    $$('.q.open', q.parentNode).forEach(o => { if (o !== q) { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); gsap.to($('.a', o), { height: 0, duration: .5, ease: 'expo.inOut' }); } });
    q.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    gsap.to(a, { height: open ? 'auto' : 0, duration: RM ? 0 : .6, ease: 'expo.inOut', onComplete: () => ScrollTrigger.refresh() });
  });
});

/* ---------- формы (прототип: никуда не отправляются) ---------- */
$$('.form').forEach(form => {
  const drop = $('.drop', form), file = $('input[type=file]', form);
  if (drop) {
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => { if (e.dataTransfer.files[0]) $('.drop-t', drop).textContent = e.dataTransfer.files[0].name; });
    file.addEventListener('change', () => { if (file.files[0]) $('.drop-t', drop).textContent = file.files[0].name; });
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ph = $('input[type=tel]', form);
    if (ph && ph.value.replace(/\D/g, '').length < 10) { ph.focus(); gsap.fromTo(ph.parentNode, { x: -10 }, { x: 0, duration: .6, ease: 'elastic.out(1.2,.2)' }); ph.classList.add('bad'); return; }
    ph && ph.classList.remove('bad');
    form.classList.add('sent');
    const seal = $('.done .seal', form);
    seal && gsap.fromTo(seal, { scale: 2.6, opacity: 0, rotate: -24 }, { scale: 1, opacity: 1, rotate: -9, duration: .32, ease: 'power4.in',
      onComplete: () => gsap.fromTo(form, { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1.2,.25)' }) });
  });
});

/* ---------- фильтр в каталоге/блоге ---------- */
$$('[data-filter]').forEach(bar => {
  const items = $$(bar.dataset.filter);
  $$('button', bar).forEach(b => b.addEventListener('click', () => {
    $$('button', bar).forEach(x => x.classList.toggle('on', x === b));
    const k = b.dataset.k;
    items.forEach(it => { const show = !k || it.dataset.k === k; gsap.to(it, { autoAlpha: show ? 1 : .15, scale: show ? 1 : .96, duration: .4 }); });
  }));
});

/* ---------- копирование ---------- */
$$('[data-copy]').forEach(b => b.addEventListener('click', () => {
  const t = b.dataset.copy, done = () => { const o = b.textContent; b.textContent = 'Скопировано'; setTimeout(() => b.textContent = o, 1400); };
  navigator.clipboard ? navigator.clipboard.writeText(t).then(done, () => {}) : done();
}));

/* ---------- всё, что зависит от шрифтов ---------- */
function build() {
  const heroT = $('.hero-title');
  const heroChars = heroT ? split(heroT) : [];
  heroWeight(heroChars);
  $$('canvas.glyphs').forEach(glyphField);
  $$('[data-sheet]').forEach(sheet);
  counters();

  if (RM) { fitHeads(); addEventListener('resize', fitHeads); loader && loader.remove(); curtain && gsap.set(curtain, { visibility: 'hidden' }); html.classList.remove('arrive'); return; }

  $$('.split').forEach(h => {
    const cs = split(h);
    gsap.from(cs, { yPercent: 115, rotate: 6, duration: 1, stagger: Math.min(.018, .6 / cs.length), ease: 'expo.out',
      scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: 'play none none reverse' } });
  });

  $$('[data-slab]').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 82%', onEnter: () => s.classList.add('open'), onLeaveBack: () => s.classList.remove('open') }));

  $$('[data-reveal]').forEach(g => {
    const kids = g.dataset.reveal === 'self' ? [g] : [...g.children];
    gsap.from(kids, { y: 60, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: g, start: 'top 86%' } });
  });

  if ($('.hero-in')) {
    gsap.to('.hero-in', { yPercent: -12, scale: .94, opacity: .2, ease: 'none', transformOrigin: '50% 0%',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    $('.frame') && gsap.to('.frame', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true } });
  }

  /* бегущие ленты */
  $$('.band .run').forEach((run, i) => {
    run.parentNode.appendChild(run.cloneNode(true));
    const runs = $$('.run', run.parentNode), dir = i % 2 ? 1 : -1;
    let x = 0, boost = 0;
    gsap.ticker.add(() => {
      const v = lenis ? lenis.velocity : 0; boost += (Math.abs(v) * .35 - boost) * .1;
      x += dir * (0.6 + boost); const ww = run.offsetWidth;
      if (x <= -ww) x += ww; if (x > 0) x -= ww;
      runs.forEach(r => r.style.transform = `translate3d(${x}px,0,0)`);
    });
  });

  /* горизонтальная лента шагов */
  $$('.flow').forEach(sec => {
    const track = $('.flow-track', sec), bar = $('.flow-bar i', sec);
    ScrollTrigger.matchMedia({ '(min-width: 761px) and (min-height: 520px)': () => {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth + (parseFloat(getComputedStyle(track.parentNode).paddingLeft) || 0) * 2);
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true,
          onUpdate: s => bar && gsap.set(bar, { scaleX: s.progress }) } });
      $$('.step', sec).forEach(st => gsap.from($('.num', st), { yPercent: 40, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: st, containerAnimation: tw, start: 'left 95%', end: 'left 55%', scrub: true } }));
    } });
  });

  /* таймлайны */
  $$('.tl').forEach(tl => {
    gsap.to($('.rail i', tl), { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: true } });
    $$('.st', tl).forEach(st => {
      ScrollTrigger.create({ trigger: st, start: 'top 60%', onEnter: () => st.classList.add('lit'), onLeaveBack: () => st.classList.remove('lit') });
      gsap.from(st, { y: 40, opacity: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: st, start: 'top 85%' } });
    });
  });

  /* карточки с наклоном */
  $$('.bento').forEach(b => gsap.from($$('.cell', b), { y: 80, opacity: 0, rotateX: -12, duration: 1, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 84%' } }));
  if (!TOUCH) $$('[data-tilt]').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%');
      gsap.to(c, { rotateY: (px - .5) * 8, rotateX: (.5 - py) * 8, transformPerspective: 900, duration: .5, ease: 'power3' }); });
    c.addEventListener('pointerleave', () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1,.5)' }));
  });

  /* галочки */
  $$('.chk li').forEach((li, i) => {
    const p = $('path', li); if (!p) return; gsap.set(p, { strokeDashoffset: 24 });
    gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' } })
      .from(li, { x: -30, opacity: 0, duration: .7, ease: 'expo.out', delay: (i % 6) * .04 })
      .to(p, { strokeDashoffset: 0, duration: .45, ease: 'power2.out' }, '-=.35');
  });

  /* картинки-плашки: шторка */
  $$('[data-wipe]').forEach(el => gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } }));

  /* огромные буквы в подвале */
  $$('.wordmark').forEach(w => gsap.from($$('span', w), { yPercent: 100, ease: 'none', stagger: .06,
    scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom bottom', scrub: true } }));

  fitHeads();
  let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitHeads(); ScrollTrigger.refresh(); }, 200); });
  intro(heroChars);
}

/* ---------- заголовки: если самое длинное слово не помещается, кегль уменьшается ---------- */
function fitHeads() {
  $$('h1, h2, h3, .k, .since, .rw, .big, .dnums b, .plan-top b, .v, legend').forEach(el => {
    el.style.fontSize = '';
    const cw = el.clientWidth; if (!cw) return;
    let need = el.scrollWidth;
    $$('.w', el).forEach(w => { need = Math.max(need, w.getBoundingClientRect().width); });
    if (need > cw + 1) { const fs = parseFloat(getComputedStyle(el).fontSize); el.style.fontSize = Math.max(14, fs * cw / need * .97) + 'px'; }
  });
}

/* ---------- вступление: прелоадер при первом заходе, шторка при переходе ---------- */
function intro(heroChars) {
  const heroBits = $$('.hero-meta, .hero-lead, .hero-cta, .stampbox, .hero-foot, .crumbs, .phero-side');
  const reveal = tl => {
    if (heroChars.length) tl.to(heroChars, { yPercent: 0, duration: 1.2, stagger: Math.min(.025, .8 / heroChars.length), ease: 'expo.out' }, '-=.45');
    if ($('.frame')) tl.to('.frame', { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'expo.inOut' }, '<');
    if (heroBits.length) tl.to(heroBits, { opacity: 1, y: 0, duration: 1, stagger: .07, ease: 'expo.out' }, '-=1');
  };
  if (heroChars.length) gsap.set(heroChars, { yPercent: 115 });
  if (heroBits.length) gsap.set(heroBits, { opacity: 0, y: 30 });
  if ($('.frame')) gsap.set('.frame', { clipPath: 'inset(0 100% 0 0)' });

  const firstVisit = loader && !ss.get('seen');
  ss.set('seen', '1');
  const fromLink = ss.get('curtain') !== null; ss.set('curtain', '');
  try { sessionStorage.removeItem('curtain'); } catch (e) {}

  if (firstVisit) {
    if (curtain) gsap.set(curtain, { visibility: 'hidden' });
    html.classList.remove('arrive');
    lenis && lenis.stop();
    const num = $('.num', loader), tag = $('.tag', loader), o = { v: 0 };
    const tags = ['<Expertise>', '<Object>', '<Section n="1"/>', '<Survey/>', '<Estimate/>', '<Conclusion/>', '</Expertise>'];
    const tl = gsap.timeline()
      .to(o, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate() { num.textContent = String(Math.round(o.v)).padStart(3, '0'); tag.textContent = tags[Math.min(tags.length - 1, (o.v / 100 * tags.length) | 0)]; } })
      .to($('.bar i', loader), { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      .to($('.mid', loader), { opacity: 0, y: -40, duration: .4, ease: 'power2.in' })
      .to($('.pan.t', loader), { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=.05')
      .to($('.pan.b', loader), { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<');
    reveal(tl);
    tl.add(() => { loader.remove(); lenis && lenis.start(); ScrollTrigger.refresh(); });
    return;
  }
  loader && loader.remove();
  const tl = gsap.timeline();
  if (curtain && (fromLink || html.classList.contains('arrive'))) {
    gsap.set(curtain, { visibility: 'visible', clipPath: 'inset(0% 0 0 0)' });
    html.classList.remove('arrive');
    tl.to(curtain, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut', delay: .05 })
      .set(curtain, { visibility: 'hidden' });
  } else { html.classList.remove('arrive'); curtain && gsap.set(curtain, { visibility: 'hidden' }); }
  reveal(tl);
  tl.add(() => ScrollTrigger.refresh());
}

/* ---------- шапка: стекло после прокрутки, прячется при прокрутке вниз ---------- */
const navEl = $('.nav');
if (navEl) {
  let lastY = 0;
  const onScroll = y => {
    navEl.classList.toggle('scrolled', y > 40);
    navEl.classList.toggle('hide', y > 400 && y > lastY + 4 && !document.body.classList.contains('menu-open') && !$('.dd.open'));
    if (y < lastY - 4) navEl.classList.remove('hide');
    lastY = y;
  };
  lenis ? lenis.on('scroll', e => onScroll(e.scroll)) : addEventListener('scroll', () => onScroll(scrollY), { passive: true });
}

/* ---------- слайды в герое ---------- */
const slides = $$('.slides .slide'), dots = $$('.dots button');
if (slides.length > 1) {
  let si = 0, timer = 0, paused = false;
  const show = k => {
    if (k === si) return;
    const cur = slides[si]; si = (k + slides.length) % slides.length; const nx = slides[si];
    cur.classList.remove('on'); cur.classList.add('out');
    nx.classList.remove('out'); void nx.offsetWidth; nx.classList.add('on');
    setTimeout(() => cur.classList.remove('out'), 900);
    dots.forEach((d, i) => { d.classList.remove('on'); if (i === si) { void d.offsetWidth; d.classList.add('on'); } });
  };
  const run = () => { clearInterval(timer); if (!RM && !paused) timer = setInterval(() => show(si + 1), 5000); };
  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); run(); }));
  const box = $('.slider');
  box && box.addEventListener('pointerenter', () => { paused = true; clearInterval(timer); });
  box && box.addEventListener('pointerleave', () => { paused = false; run(); });
  run();
}

/* ---------- «Подробнее» раскрывает текст ---------- */
$$('.more-b').forEach(b => {
  const t = document.getElementById(b.getAttribute('aria-controls')); if (!t) return;
  b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open);
    $('.arr', b).textContent = open ? '↑' : '↓';
    b.firstChild.textContent = open ? 'Свернуть ' : 'Подробнее ';
    gsap.to(t, { height: open ? 'auto' : 0, duration: RM ? 0 : .7, ease: 'expo.inOut', onComplete: () => ScrollTrigger.refresh() });
  });
});

/* ---------- ползунок площади ---------- */
$$('input[type=range][data-out]').forEach(r => { const o = document.getElementById(r.dataset.out); const f = () => o.textContent = (+r.value).toLocaleString('ru-RU').replace(/ /g, ' '); r.addEventListener('input', f); f(); });

/* ---------- реестр сертификатов: поиск по ИНН ---------- */
$$('form[data-registry]').forEach(f => {
  const inp = $('input', f), out = $('.reg-out', f);
  f.addEventListener('submit', e => {
    e.preventDefault();
    const v = inp.value.replace(/\D/g, '');
    if (v.length < 10) { inp.classList.add('bad'); inp.focus(); gsap.fromTo(inp.parentNode, { x: -10 }, { x: 0, duration: .6, ease: 'elastic.out(1.2,.2)' }); return; }
    inp.classList.remove('bad'); $('.r2', out).textContent = v; out.hidden = false;
    gsap.from($('.reg-card', out), { y: 30, opacity: 0, duration: .7, ease: 'expo.out' });
  });
});

/* ---------- всплывающее окно акции на главной ---------- */
const offer = $('.offer');
if (offer && !ss.get('offer')) {
  setTimeout(() => { if (ss.get('offer')) return; offer.hidden = false; gsap.from(offer, { y: 60, opacity: 0, rotate: 3, duration: .9, ease: 'expo.out' }); }, 9000);
  const close = () => { ss.set('offer', '1'); gsap.to(offer, { y: 40, opacity: 0, duration: .4, onComplete: () => offer.hidden = true }); };
  $('.modal-x', offer).addEventListener('click', close);
  $$('a', offer).forEach(a => a.addEventListener('click', () => { ss.set('offer', '1'); offer.hidden = true; }));
}

/* ---------- калькулятор стоимости ---------- */
$$('[data-quiz]').forEach(q => {
  const steps = $$('.qstep', q), prev = $('.qprev', q), next = $('.qnext', q), n = $('.qn', q), bar = $('.qbar i', q);
  let i = 0;
  const go = k => {
    const from = steps[i]; i = Math.max(0, Math.min(steps.length - 1, k)); const to = steps[i];
    if (from !== to) {
      gsap.to(from, { x: -40, opacity: 0, duration: .25, onComplete: () => { from.classList.remove('on'); gsap.set(from, { x: 0, opacity: 1 });
        to.classList.add('on'); gsap.from(to, { x: 40, opacity: 0, duration: .5, ease: 'expo.out' }); } });
    }
    n.textContent = i + 1; bar.style.transform = `scaleX(${(i + 1) / steps.length})`;
    prev.disabled = i === 0; q.classList.toggle('last', i === steps.length - 1);
  };
  next.addEventListener('click', () => go(i + 1));
  prev.addEventListener('click', () => go(i - 1));
});

/* ---------- вкладки городов ---------- */
$$('.tabs').forEach(t => {
  const btns = $$('button', t), cards = $$('.city', t.parentNode);
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    cards.forEach(c => c.classList.toggle('on', c.dataset.city === b.dataset.city));
    window.__mapPick && window.__mapPick(+b.dataset.city);
  }));
});

/* ---------- карта офисов: точки городов на сетке-«синьке» ---------- */
$$('.map[data-map]').forEach(box => {
  const pts = JSON.parse(box.dataset.map), cv = $('canvas', box), ctx = cv.getContext('2d');
  let W, H, pick = 0, t0 = performance.now();
  const lon = [28, 100], lat = [42, 62];
  const xy = (la, lo) => [((lo - lon[0]) / (lon[1] - lon[0])) * W * .86 + W * .07, (1 - (la - lat[0]) / (lat[1] - lat[0])) * H * .8 + H * .1];
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = box.clientWidth; H = box.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);
  window.__mapPick = k => { pick = k; t0 = performance.now(); };
  let mapVis = false; new IntersectionObserver(([en]) => { mapVis = en.isIntersecting; if (mapVis) requestAnimationFrame(draw); }).observe(box);
  const draw = now => {
    if (!mapVis) return;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(232,234,229,.07)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const P = pts.map(p => xy(p[1], p[2])), [mx, my] = P[0];
    pts.forEach((p, i) => {
      const [x, y] = P[i];
      if (i) { ctx.strokeStyle = i === pick ? 'rgba(141,152,255,.9)' : 'rgba(141,152,255,.25)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(mx, my);
        ctx.quadraticCurveTo((mx + x) / 2, Math.min(my, y) - 60, x, y); ctx.stroke(); ctx.setLineDash([]); }
    });
    pts.forEach((p, i) => {
      const [x, y] = P[i], on = i === pick, k = ((now - t0) / 1400) % 1;
      if (on) { ctx.strokeStyle = `rgba(232,64,28,${1 - k})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 8 + k * 30, 0, 7); ctx.stroke(); }
      ctx.fillStyle = on ? '#E8401C' : '#8D98FF'; ctx.beginPath(); ctx.arc(x, y, on ? 7 : 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = on ? '#E8EAE5' : 'rgba(232,234,229,.6)'; ctx.font = `${on ? 600 : 400} ${on ? 15 : 12}px Onest, sans-serif`;
      const left = i && p[2] < pts[0][2] + 1; ctx.textAlign = left ? 'right' : 'left'; ctx.fillText(p[0], left ? x - 12 : x + 12, y - 10); ctx.textAlign = 'left';
    });
    requestAnimationFrame(draw);
  };
});

/* ---------- кейсы: здание, нарисованное линиями чертежа ---------- */
$$('canvas[data-building]').forEach(cv => {
  const host = cv.parentElement, ctx = cv.getContext('2d'), seed = +cv.dataset.building;
  let rnd = (() => { let s = 9301 + seed * 49297; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const plan = { floors: 4 + ((rnd() * 14) | 0), cols: 5 + ((rnd() * 6) | 0), wings: 1 + ((rnd() * 2) | 0) };
  let p = 0, W, H;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = host.clientWidth; H = host.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); draw(); };
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(232,234,229,.06)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const fh = Math.min(26, (H * .62) / plan.floors), bw = Math.min(W * .62, plan.cols * 34), x0 = W * .52 - bw / 2, base = H * .86, dx = bw * .28, dy = -dx * .45;
    const lines = [];
    for (let f = 0; f <= plan.floors; f++) { const y = base - f * fh; lines.push([x0, y, x0 + bw, y], [x0 + bw, y, x0 + bw + dx, y + dy]); }
    for (let c = 0; c <= plan.cols; c++) { const x = x0 + c * bw / plan.cols; lines.push([x, base, x, base - plan.floors * fh]); }
    lines.push([x0 + bw + dx, base + dy, x0 + bw + dx, base + dy - plan.floors * fh], [x0, base - plan.floors * fh, x0 + dx, base - plan.floors * fh + dy], [x0 + dx, base - plan.floors * fh + dy, x0 + bw + dx, base - plan.floors * fh + dy]);
    const n = Math.floor(lines.length * p);
    ctx.strokeStyle = 'rgba(141,152,255,.75)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < n; i++) { const l = lines[i]; ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke(); }
    ctx.fillStyle = 'rgba(141,152,255,.18)';
    for (let f = 0; f < plan.floors && p > .7; f++) for (let c = 0; c < plan.cols; c++) if ((f * 7 + c * 3 + seed) % 5 === 0) ctx.fillRect(x0 + c * bw / plan.cols + 3, base - (f + 1) * fh + 3, bw / plan.cols - 6, fh - 6);
    ctx.fillStyle = 'rgba(232,234,229,.4)'; ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(`${plan.floors} эт. · ось 1–${plan.cols + 1}`, x0, base + 18);
  }
  size(); addEventListener('resize', size);
  if (RM) { p = 1; draw(); return; }
  ScrollTrigger.create({ trigger: host, start: 'top 85%', once: true, onEnter: () => gsap.to({ v: 0 }, { v: 1, duration: 2.2, ease: 'power2.inOut', onUpdate() { p = this.targets()[0].v; draw(); } }) });
});

/* ---------- оглавление статьи ---------- */
const tocLinks = $$('.toc a');
if (tocLinks.length) {
  const map = tocLinks.map(a => [a, $(a.getAttribute('href'))]).filter(x => x[1]);
  map.forEach(([a, h]) => ScrollTrigger.create({ trigger: h, start: 'top 40%', end: 'bottom top', onToggle: s => { if (s.isActive) tocLinks.forEach(x => x.classList.toggle('on', x === a)); } }));
}

/* ---------- плашка cookie ---------- */
const cookie = $('.cookie');
if (cookie) {
  let ok = false; try { ok = localStorage.getItem('cookie-ok') === '1'; } catch (e) {}
  if (!ok) setTimeout(() => { cookie.hidden = false; gsap.from(cookie, { y: 40, opacity: 0, duration: .7, ease: 'expo.out' }); }, 2500);
  $('button', cookie).addEventListener('click', () => { try { localStorage.setItem('cookie-ok', '1'); } catch (e) {} gsap.to(cookie, { y: 40, opacity: 0, duration: .4, onComplete: () => cookie.hidden = true }); });
}

(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(build);
})();
