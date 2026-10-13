/* Переключатель цвета сайта. Палитра по умолчанию собрана в основных файлах,
   остальные лежат в assets/p/<имя>/. Выбор хранится в браузере (localStorage). */
(function () {
  var C = window.MX_PAL; if (!C) return;
  var KEY = 'mx-palette', cur = null;
  try { cur = localStorage.getItem(KEY); } catch (e) {}
  var ids = C.order.map(function (o) { return o.id; });
  if (!cur || ids.indexOf(cur) < 0) cur = C.def;
  C.cur = cur;
  var ALT = cur !== C.def, M = ALT ? C.maps[cur] : null;

  function swapUrl(u) {
    if (!ALT || !u) return u;
    return u.replace(/(\/assets\/)(theme\/|illus\/|img\/|modern\.css|design\.css)/g, function (m, a, b) { return a + 'p/' + cur + '/' + b; });
  }
  function recolor(t) {
    if (!M || !t) return t;
    t = t.replace(/#[0-9a-fA-F]{6}\b/g, function (h) { return M.hex[h.toLowerCase()] || h; });
    t = t.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g, function (m, r, g, b) { var v = M.rgb[r + ',' + g + ',' + b]; return v ? 'rgba(' + v : m; });
    t = t.replace(/%23([0-9a-fA-F]{6})/g, function (m, h) { var v = M.hex['#' + h.toLowerCase()]; return v ? '%23' + v.slice(1) : m; });
    return swapUrl(t);
  }

  // 1. стили палитры — сразу, до первой отрисовки (скрипт стоит в <head> после ссылок на стили)
  if (ALT) {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href');
      if (h && /\/assets\/(theme\/|modern\.css|design\.css)/.test(h)) links[i].setAttribute('href', swapUrl(h));
    }
    var hs = document.querySelectorAll('head style');
    for (var j = 0; j < hs.length; j++) hs[j].textContent = recolor(hs[j].textContent);
  }

  // 2. картинки, цвета в разметке, логотип — когда документ разобран
  function applyAll() {
    if (!ALT) return;
    document.querySelectorAll('img').forEach(function (im) {
      var s = im.getAttribute('src'); if (s && /\/assets\/(illus|img)\//.test(s)) im.setAttribute('src', swapUrl(s));
      var ss = im.getAttribute('srcset'); if (ss && /\/assets\//.test(ss)) im.setAttribute('srcset', swapUrl(ss));
    });
    document.querySelectorAll('[style]').forEach(function (e) { var s = e.getAttribute('style'), n = recolor(s); if (n !== s) e.setAttribute('style', n); });
    document.querySelectorAll('body style').forEach(function (st) { var n = recolor(st.textContent); if (n !== st.textContent) st.textContent = n; });
    document.querySelectorAll('svg [fill], svg [stroke], svg stop').forEach(function (e) {
      ['fill', 'stroke', 'stop-color'].forEach(function (a) { var v = e.getAttribute(a); if (v) { var n = recolor(v); if (n !== v) e.setAttribute(a, n); } });
    });
    document.querySelectorAll('link[rel="icon"]').forEach(function (l) { l.setAttribute('href', recolor(l.getAttribute('href'))); });
  }

  // 3. панель выбора цвета
  function ui() {
    var st = document.createElement('style');
    st.textContent =
      '.mx-pal{position:fixed;left:18px;bottom:18px;z-index:1500;display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;border-radius:999px;' +
      'background:rgba(255,255,255,.96);box-shadow:0 18px 40px -18px rgba(0,0,0,.45),0 0 0 1px rgba(0,0,0,.06);font:600 12px/1 Onest,Roboto,Arial,sans-serif;color:#333;' +
      'transition:transform .5s cubic-bezier(.22,1,.36,1)}' +
      '.mx-pal__t{letter-spacing:.06em;text-transform:uppercase;font-size:10px;color:#777;white-space:nowrap}' +
      '.mx-pal__b{all:unset;cursor:pointer;width:26px;height:26px;border-radius:50%;position:relative;box-shadow:inset 0 0 0 2px rgba(255,255,255,.7);transition:transform .35s cubic-bezier(.22,1,.36,1)}' +
      '.mx-pal__b:hover{transform:scale(1.15)}' +
      '.mx-pal__b.on{box-shadow:0 0 0 2px #fff,0 0 0 4px currentColor}' +
      '.mx-pal__b:focus-visible{outline:2px solid #333;outline-offset:3px}' +
      '.mx-pal__b span{position:absolute;bottom:calc(100% + 10px);left:50%;transform:translate(-50%,4px);background:#222;color:#fff;padding:6px 9px;border-radius:8px;font-size:11px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s,transform .3s}' +
      '.mx-pal__b:hover span,.mx-pal__b:focus-visible span{opacity:1;transform:translate(-50%,0)}' +
      '@media (max-width:640px){.mx-pal{left:10px;bottom:10px;gap:7px;padding:6px 8px 6px 10px}.mx-pal__t{display:none}.mx-pal__b{width:22px;height:22px}}';
    document.head.appendChild(st);
    var box = document.createElement('div');
    box.className = 'mx-pal'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Цвет сайта');
    box.innerHTML = '<span class="mx-pal__t">Цвет сайта</span>';
    C.order.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mx-pal__b' + (o.id === cur ? ' on' : '');
      b.style.background = o.swatch; b.style.color = o.swatch;
      b.setAttribute('aria-label', o.label); b.setAttribute('aria-pressed', o.id === cur);
      b.innerHTML = '<span>' + o.label + '</span>';
      b.addEventListener('click', function () {
        if (o.id === cur) return;
        try { localStorage.setItem(KEY, o.id); } catch (e) {}
        try { sessionStorage.setItem('curtain', o.label); } catch (e) {}
        var c = document.querySelector('.mx-curtain'), t = document.querySelector('.mx-curtain__t');
        if (c && window.gsap) {
          t.textContent = o.label; c.style.background = o.swatch;
          gsap.timeline().set(c, { visibility: 'visible', clipPath: 'inset(100% 0 0 0)' })
            .to(c, { clipPath: 'inset(0% 0 0 0)', duration: .6, ease: 'expo.inOut' })
            .add(function () { location.reload(); });
        } else location.reload();
      });
      box.appendChild(b);
    });
    document.body.appendChild(box);
  }

  function ready() { applyAll(); ui(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
