/* Выбор логотипа (для показа клиенту): в шапке лежат все три варианта, виден выбранный.
   Выбор хранится в браузере. Скрипт стоит в <head>, чтобы нужный логотип был виден сразу. */
(function () {
  var KEY = 'mx-logo', LOGOS = [['bastion', 'Бастион'], ['monogram', 'Монограмма'], ['seal', 'Печать']];
  var cur = null;
  try { cur = localStorage.getItem(KEY); } catch (e) {}
  if (!LOGOS.some(function (l) { return l[0] === cur; })) cur = LOGOS[0][0];
  document.documentElement.setAttribute('data-logo', cur);

  function ui() {
    var box = document.createElement('div');
    box.className = 'mx-pal'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Логотип');
    box.innerHTML = '<span class="mx-pal__t">Логотип</span>';
    LOGOS.forEach(function (l) {
      var src = document.querySelector('.page-header__logo .mx-logo-v[data-v="' + l[0] + '"] svg');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mx-pal__b mx-pal__logo' + (l[0] === cur ? ' on' : '');
      b.setAttribute('aria-label', l[1]); b.setAttribute('aria-pressed', l[0] === cur);
      if (src) {   // в кнопке только знак, без надписи
        var mark = src.querySelector('g');
        b.innerHTML = '<svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true">' + (mark ? mark.outerHTML : '') + '</svg>';
      }
      b.insertAdjacentHTML('beforeend', '<span>' + l[1] + '</span>');
      b.addEventListener('click', function () {
        if (l[0] === cur) return;
        cur = l[0];
        try { localStorage.setItem(KEY, cur); } catch (e) {}
        document.documentElement.setAttribute('data-logo', cur);
        box.querySelectorAll('.mx-pal__b').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        var lg = document.querySelector('.page-header__logo');
        if (lg && lg.animate) lg.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
      box.appendChild(b);
    });
    document.body.appendChild(box);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
