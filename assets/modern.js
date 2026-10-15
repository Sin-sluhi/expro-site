/* Современный слой: плавная прокрутка, шторка между страницами, появление блоков, шапка, формы-прототипы. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const me = document.currentScript && document.currentScript.src || '';
  const BASE = me.replace(/\/assets\/modern\.js.*$/, '').replace(location.origin, '');
  const ss = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const curtain = $('.mx-curtain'), ct = $('.mx-curtain__t');

  /* ---------- формы: прототип, данные никуда не уходят ---------- */
  document.addEventListener('submit', e => {
    const f = e.target;
    e.preventDefault(); e.stopImmediatePropagation();
    if (f.closest('.mx-search')) { const a = $('.mx-search__list a'); if (a) location.href = a.href; return; }   // Enter в окне поиска — первый результат
    if (f.matches('.page-header__search, .search_mobile, [role=search]') || f.querySelector('[name=s]')) {
      const q = (f.querySelector('[name=s]') || {}).value || '';
      if (window.mxSearch) { window.mxSearch(q); return; }
      ss.set('curtain', 'Поиск'); location.href = BASE + '/sitemap/' + (q ? '#' + encodeURIComponent(q) : ''); return;
    }
    const tel = f.querySelector('input[type=tel]');
    if (tel && tel.value.replace(/\D/g, '').length < 10) {
      tel.focus(); window.gsap && gsap.fromTo(tel, { x: -10 }, { x: 0, duration: .6, ease: 'elastic.out(1.2,.25)' }); return;
    }
    const out = f.querySelector('.wpcf7-response-output') || f.appendChild(Object.assign(document.createElement('div'), { className: 'wpcf7-response-output' }));
    out.textContent = 'Спасибо! Заявка принята, менеджер свяжется с вами. (Прототип: данные никуда не отправляются.)';
    f.classList.add('mx-sent');
  }, true);
  window.jQuery && (jQuery.post = () => jQuery.Deferred().resolve('{}'));

  if (!window.gsap) { html.classList.remove('arrive'); return; }
  gsap.registerPlugin(ScrollTrigger);
  html.classList.add('mx-ready');

  /* ---------- плавная прокрутка ---------- */
  let lenis = null;
  if (!RM && window.Lenis && !matchMedia('(hover: none)').matches) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', e => {        // якоря внутри страницы — плавно
      const a = e.target.closest('a[href^="#"]'); if (!a || a.classList.contains('popup')) return;
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.getElementById(id.slice(1)); if (t && !t.closest('[style*="display:none"], .popup-block, .mfp-hide, .fancybox-content')) { e.preventDefault(); lenis.scrollTo(t, { offset: -160 }); }
    });
    // всплывающие окна fancybox не должны прокручивать фон
    const obs = new MutationObserver(() => { document.body.classList.contains('fancybox-active') || $('.fancybox-overlay') ? lenis.stop() : lenis.start(); });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true });
  }

  /* ---------- шапка ---------- */
  const header = $('.page-header');
  if (header) {
    let last = 0;
    const onY = y => {
      header.classList.toggle('mx-scrolled', y > 30);
      if (y > 500 && y > last + 6 && !$('.sub-menu-wrap .sub-menu[style*="block"]')) header.classList.add('mx-hide');
      else if (y < last - 6 || y < 200) header.classList.remove('mx-hide');
      last = y;
    };
    lenis ? lenis.on('scroll', e => onY(e.scroll)) : addEventListener('scroll', () => onY(scrollY), { passive: true });
  }

  /* ---------- полоса прогресса ---------- */
  gsap.to('.mx-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* ---------- шторка между страницами ---------- */
  const isInternal = a => {
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.classList.contains('popup') || a.closest('.fancybox-content, .popup-block')) return false;
    const raw = a.getAttribute('href') || ''; if (!raw || raw.startsWith('#') || raw.startsWith('tel:') || raw.startsWith('mailto:') || raw.startsWith('javascript')) return false;
    let u; try { u = new URL(a.href, location.href); } catch (e) { return false; }
    if (u.origin !== location.origin || /\.(pdf|jpe?g|png|webp|docx?)$/i.test(u.pathname)) return false;
    return !(u.pathname === location.pathname && u.hash);
  };
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const a = e.target.closest('a[href]'); if (!isInternal(a)) return;
    e.preventDefault();
    const label = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70) || document.title;
    if (RM || !curtain) { location.href = a.href; return; }
    ss.set('curtain', label); ct.textContent = label;
    gsap.timeline()
      .set(curtain, { visibility: 'visible', clipPath: 'inset(100% 0 0 0)' })
      .to(curtain, { clipPath: 'inset(0% 0 0 0)', duration: .7, ease: 'expo.inOut' })
      .from(ct, { yPercent: 60, opacity: 0, duration: .45, ease: 'expo.out' }, '-=.25')
      .add(() => { location.href = a.href; }, '+=.05');
  });
  addEventListener('pageshow', e => { if (e.persisted && curtain) gsap.set(curtain, { visibility: 'hidden' }); });

  /* ---------- появление блоков ---------- */
  const groups = [
    '.first_screen_left', '.first_screen_right', '.widget',
    '.fig-block', '.panel', '.figicon', '.figimage', '.news__item', '.articles__item', '.footer__block',
    '.form-banner', '.slide-gratitude', '.grid > *', '.content > p', '.content > ul', '.content > h2', '.content > h3',
    '.section__head', '.banner__title', '.page-title', 'h1'
  ];
  const seen = new Set(), items = [];
  groups.forEach(s => $$(s).forEach(el => { if (!seen.has(el) && !el.closest('.page-header, .popup-block, .fancybox-content, [style*="display: none"], [style*="display:none"], .slick-slide:not(.slick-active)')) { seen.add(el); items.push(el); } }));
  // появление — CSS-переходами по пересечению с экраном (не зависит от кадров скрипта; без JS всё видно)
  const arrive = html.classList.contains('arrive') && !RM;
  if (!RM && 'IntersectionObserver' in window) {
    const fold = innerHeight * .95;
    const io = new IntersectionObserver(es => {
      let k = 0;
      es.forEach(en => { if (!en.isIntersecting) return; const el = en.target; el.style.transitionDelay = (Math.min(k++, 6) * 70) + 'ms'; el.classList.add('mx-in'); io.unobserve(el); });
    }, { rootMargin: '0px 0px -8% 0px' });
    let k0 = 0;
    items.forEach(el => {
      if (el.getBoundingClientRect().top < fold) { el.style.animationDelay = ((arrive ? 450 : 60) + Math.min(k0++, 8) * 70) + 'ms'; el.classList.add('mx-up'); }   // первый экран: CSS-анимация, стартует сразу
      else { el.classList.add('mx-rv'); io.observe(el); }
    });
    setTimeout(() => items.forEach(el => el.classList.add('mx-in')), 6000);   // страховка: через 6 с видно всё
  }
  $$('.section__head').forEach(h => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { h.classList.add('mx-in'); o.disconnect(); } }); o.observe(h); });

  // светлые кнопки (белый фон) — текст фирменным цветом
  $$('.button, a[class*="button"]').forEach(b => { const cs = getComputedStyle(b); if (cs.backgroundImage !== 'none') return; if (/255, 255, 255|rgba\(0, 0, 0, 0\)/.test(cs.backgroundColor)) b.classList.add('mx-btn-light'); });

  /* ---------- картинки проявляются, когда загрузились ---------- */
  $$('main img').forEach(img => { if (!img.complete) { img.classList.add('mx-wait'); img.addEventListener('load', () => img.classList.remove('mx-wait'), { once: true }); img.addEventListener('error', () => img.classList.remove('mx-wait'), { once: true }); } });

  /* ---------- шторка уходит после перехода ---------- */
  ss.set('curtain', '');
  if (arrive && curtain) {
    gsap.set(curtain, { visibility: 'visible', clipPath: 'inset(0 0 0 0)' });
    html.classList.remove('arrive');
    gsap.timeline().to(curtain, { clipPath: 'inset(0 0 100% 0)', duration: .85, ease: 'expo.inOut', delay: .05 }).set(curtain, { visibility: 'hidden' });
  } else html.classList.remove('arrive');

  addEventListener('load', () => ScrollTrigger.refresh());
})();
