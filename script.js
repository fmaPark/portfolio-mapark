(function () {
  var root = document.documentElement;
  var fab = document.getElementById('theme-toggle');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var KEY = 'mapark-portfolio-theme';
  try { var saved = localStorage.getItem(KEY); if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved); } catch (e) {}
  function current() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return mq && mq.matches ? 'dark' : 'light';
  }
  function sync() {
    var mode = current();
    fab.setAttribute('data-mode', mode);
    var label = mode === 'dark' ? '화이트 모드로 전환' : '다크 모드로 전환';
    fab.setAttribute('aria-label', label);
    fab.setAttribute('title', label);
  }
  fab.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    sync();
  });
  if (mq) {
    var onChange = function () { sync(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  if (window.MutationObserver) new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  sync();
})();

(function () {
  /* floating toc: fold / unfold, remember choice, mark current section */
  var toc = document.getElementById('toc'), fold = document.getElementById('toc-fold');
  var TKEY = 'mapark-portfolio-toc';
  function setFold(c) {
    toc.setAttribute('data-collapsed', c ? 'true' : 'false');
    fold.setAttribute('aria-expanded', c ? 'false' : 'true');
    var l = c ? '목차 펼치기' : '목차 접기';
    fold.setAttribute('aria-label', l); fold.setAttribute('title', l);
  }
  var pref = null;
  try { pref = localStorage.getItem(TKEY); } catch (e) {}
  setFold(pref ? pref === 'collapsed' : window.innerWidth < 1320);
  fold.addEventListener('click', function () {
    var c = toc.getAttribute('data-collapsed') !== 'true';
    setFold(c);
    try { localStorage.setItem(TKEY, c ? 'collapsed' : 'open'); } catch (e) {}
  });
  var links = Array.prototype.slice.call(toc.querySelectorAll('.toc-list a'));
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false'); });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    links.forEach(function (a) { var t = document.querySelector(a.getAttribute('href')); if (t) io.observe(t); });
  }

  var dialogs = { hgm: document.getElementById('dlg-hgm'), ansim: document.getElementById('dlg-ansim') };
  function open(key) {
    var d = dialogs[key];
    if (!d || d.open) return;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    d.scrollTop = 0;
  }
  document.querySelectorAll('[data-open]').forEach(function (btn) {
    btn.addEventListener('click', function () { open(btn.getAttribute('data-open')); });
  });
  Object.keys(dialogs).forEach(function (k) {
    var d = dialogs[k];
    d.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  });
  var hash = (location.hash || '').replace('#', '');
  if (dialogs[hash]) open(hash);

  /* 상세 창: 서비스 화면 / 아키텍처 탭 */
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* 상세 창: 썸네일을 누르면 큰 이미지 교체 */
  document.querySelectorAll('.gallery').forEach(function (g) {
    var big = g.querySelector('.viewer img');
    var btns = Array.prototype.slice.call(g.querySelectorAll('.thumbs button'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var thumb = b.querySelector('img');
        big.src = b.getAttribute('data-src');
        big.alt = b.getAttribute('data-alt');
        if (thumb) { big.setAttribute('width', thumb.getAttribute('width')); big.setAttribute('height', thumb.getAttribute('height')); }
        btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      });
    });
  });

  var copyBtn = document.getElementById('copy-email');
  var email = document.getElementById('email');
  copyBtn.addEventListener('click', function () {
    var text = email.textContent.trim();
    function selectText() {
      var r = document.createRange(); r.selectNodeContents(email);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      copyBtn.textContent = '선택됨 · 직접 복사';
    }
    try {
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = '복사됨';
        setTimeout(function () { copyBtn.textContent = '복사'; }, 1600);
      }, selectText);
    } catch (e) { selectText(); }
  });
})();
