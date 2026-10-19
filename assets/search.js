/* Поиск по сайту: лупа в шапке. Индекс всех страниц (услуги, новости, статьи, о компании) — assets/search.json,
   собирается при сборке. Ищет по заголовку и тексту, понимает начало слова и разные окончания. */
(function () {
  var me = document.currentScript && document.currentScript.src || '';
  var BASE = me.replace(/\/assets\/search\.js.*$/, '').replace(location.origin, '');
  var IDX = null, loading = null, panel, input, list, timer;
  var KIND = { news: 'Новости', blog: 'Статья', service: 'Услуга', page: 'Страница' };

  function load() {
    if (IDX) return Promise.resolve(IDX);
    if (!loading) loading = fetch(BASE + '/assets/search.json').then(function (r) { return r.json(); }).then(function (d) {
      IDX = d.map(function (p) { p.t_ = norm(p.t); p.x_ = norm(p.x); return p; }); return IDX;
    });
    return loading;
  }
  function norm(s) { return (s || '').toLowerCase().replace(/ё/g, 'е'); }
  function stem(w) { return w.length > 5 ? w.slice(0, w.length - 2) : w.length > 3 ? w.slice(0, w.length - 1) : w; }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function find(q) {
    var words = norm(q).split(/[^a-zа-я0-9]+/).filter(function (w) { return w.length > 1; }).map(stem);
    if (!words.length) return [];
    var res = [];
    IDX.forEach(function (p) {
      var score = 0, all = true;
      words.forEach(function (w) {
        var inT = p.t_.indexOf(w) >= 0, inX = p.x_.indexOf(w) >= 0;
        if (!inT && !inX) all = false;
        score += (inT ? 10 : 0) + (inX ? 2 : 0);
      });
      if (all) res.push([score + (p.k === 'service' ? 3 : 0), p]);
    });
    res.sort(function (a, b) { return b[0] - a[0]; });
    return res.slice(0, 30).map(function (r) { return r[1]; });
  }
  function snippet(p, q) {
    var w = stem(norm(q).split(/[^a-zа-я0-9]+/).filter(function (x) { return x.length > 1; })[0] || '');
    var i = w ? p.x_.indexOf(w) : -1;
    var s = i < 0 ? p.x.slice(0, 160) : (i > 60 ? '…' : '') + p.x.slice(Math.max(0, i - 60), i + 120) + '…';
    s = esc(s);
    if (w) s = s.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[а-яёa-z0-9]*)', 'gi'), '<mark>$1</mark>');
    return s;
  }
  function render(q) {
    if (q.trim().length < 2) { list.innerHTML = '<p class="mx-search__hint">Например: <button type="button">пожарные риски</button> <button type="button">смета</button> <button type="button">xml</button> <button type="button">новости</button></p>'; return; }
    load().then(function () {
      var r = /^новост/i.test(q.trim()) ? IDX.filter(function (p) { return p.k === 'news'; }) : find(q);
      list.innerHTML = r.length ? r.map(function (p) {
        return '<a class="mx-search__item" href="' + p.u + '"><span class="mx-search__k mx-search__k--' + p.k + '">' + (KIND[p.k] || '') + (p.d ? ' · ' + esc(p.d) : '') + '</span>' +
          '<b>' + esc(p.t) + '</b><span class="mx-search__x">' + snippet(p, q) + '</span></a>';
      }).join('') : '<p class="mx-search__hint">Ничего не нашлось. Попробуйте другое слово или <a href="' + BASE + '/contacts/">спросите нас</a>.</p>';
    });
  }
  function build() {
    panel = document.createElement('div');
    panel.className = 'mx-search'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Поиск по сайту');
    panel.innerHTML = '<div class="mx-search__box"><form class="mx-search__f"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<input type="text" name="q" placeholder="Поиск по сайту: услуги, новости, статьи" autocomplete="off"><button type="button" class="mx-search__x-btn" aria-label="Закрыть">×</button></form>' +
      '<div class="mx-search__list"></div></div>';
    document.body.appendChild(panel);
    input = panel.querySelector('input'); list = panel.querySelector('.mx-search__list');
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { render(input.value); }, 120); });
    panel.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); var a = list.querySelector('a'); if (a) location.href = a.href; }, true);
    panel.querySelector('.mx-search__x-btn').addEventListener('click', close);
    panel.addEventListener('click', function (e) {
      if (e.target === panel) close();
      var b = e.target.closest('.mx-search__hint button'); if (b) { input.value = b.textContent; render(input.value); input.focus(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('on')) close(); });
  }
  function open(q) {
    if (!panel) build();
    load();
    panel.classList.add('on'); document.documentElement.classList.add('mx-search-open');
    input.value = q || ''; render(input.value);
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() { panel.classList.remove('on'); document.documentElement.classList.remove('mx-search-open'); }
  window.mxSearch = open;

  // лупа в шапке открывает поиск сразу (без промежуточного поля темы)
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.page-header__search-submit, .page-header__search .page-header__search-field, .search_mobile');
    if (!b || (panel && panel.contains(b))) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var f = b.closest('form'), v = f && f.querySelector('[name=s]');
    open(v ? v.value : '');
  }, true);
})();

// «Услуги» на телефоне: заголовок раздела открывает/закрывает список, первый раздел открыт
(function () {
  var mq = window.matchMedia('(max-width:760px)');
  function first() { var c = document.querySelector('.mx-cols__col'); if (c) c.classList.add('mx-open'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', first); else first();
  document.addEventListener('click', function (e) {
    var h = e.target.closest && e.target.closest('.mx-cols__h');
    if (!h || !mq.matches) return;
    e.preventDefault();
    h.parentNode.classList.toggle('mx-open');
  });
})();
