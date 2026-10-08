/* ============================================================
   Чистота в деталях — плавные анимации (scroll reveal + hero)
   Правила безопасности:
   - без prefers-reduced-motion и без IntersectionObserver
     класс .has-anim не добавляется → весь контент виден сразу;
   - после полной загрузки — подстраховочная проверка «все,
     что должно быть на экране, показано»;
   - beforeprint — показать всё.
   ============================================================ */
(function () {
  var D = document, root = D.documentElement;

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  function showAll() {
    var all = D.querySelectorAll(".rv");
    for (var i = 0; i < all.length; i++) all[i].classList.add("in");
  }

  if (reduce || !hasIO) return;

  root.classList.add("has-anim");

  /* ---- сбор кандидатов: заголовки секций + карточки/шаги/элементы сеток ---- */
  var SUFFIX = /(?:^|[-\s])(?:card|step|item|block|panel|cell|box|ghost)$/;
  var EXTRA = ["sec-head", "kicker", "serv-mini", "serv-img", "serv-wide",
               "rev-ghost", "hs-os", "about-left", "about-photo"];

  function hasRvAncestor(el) {
    var p = el.parentElement;
    while (p && p !== D.body) {
      if (p.classList && p.classList.contains("rv")) return true;
      p = p.parentElement;
    }
    return false;
  }

  function addRv(el, delayMs) {
    if (!el || el.classList.contains("rv")) return;
    if (el.querySelector && el.querySelector(".rv")) return; /* не вкладывать rv */
    el.classList.add("rv");
    var n = 0;
    if (el.parentElement) {
      el.parentElement.__rvN = (el.parentElement.__rvN || 0) + 1;
      n = el.parentElement.__rvN;
    }
    var d = typeof delayMs === "number" ? delayMs : Math.min(n - 1, 6) * 70;
    if (d > 0) el.style.setProperty("--rvd", d + "ms");
  }

  /* ---- 1. hero: ступенчатый въезд текстовой колонки и фото ---- */
  var h1 = D.querySelector("main h1");
  if (h1 && h1.closest) {
    var col = h1.closest('[class*="-left"]');
    if (!col) col = h1.parentElement;
    if (col && col.children.length >= 2) {
      for (var k = 0; k < col.children.length; k++) addRv(col.children[k]);
    } else {
      addRv(h1);
    }
  }
  var photo = D.querySelector(
    ".hero-photo,.sv-photo,.p8-photo,.s03-hero-photo," +
    ".hs-hero-photo,.z10-hero-photo,.hero5-photo,.p11-photo"
  );
  if (photo && photo.parentElement) {
    var pr = photo.parentElement;
    for (var m = 0; m < pr.children.length; m++) addRv(pr.children[m]);
    photo.classList.add("rv-photo");
  }

  /* ---- 2. остальной контент страницы ---- */
  var els = D.querySelectorAll("main [class]");
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.classList.contains("rv") || hasRvAncestor(el)) continue;
    var tokens = el.className.split(/\s+/), match = false, t;
    for (t = 0; t < tokens.length; t++) {
      if (SUFFIX.test(tokens[t])) { match = true; break; }
    }
    if (!match) {
      for (t = 0; t < EXTRA.length; t++) {
        if (el.classList.contains(EXTRA[t])) { match = true; break; }
      }
    }
    if (match) addRv(el);
  }

  /* ---- 3. наблюдение ---- */
  var io = new IntersectionObserver(function (entries) {
    for (var i2 = 0; i2 < entries.length; i2++) {
      if (entries[i2].isIntersecting) {
        entries[i2].target.classList.add("in");
        io.unobserve(entries[i2].target);
      }
    }
  }, { rootMargin: "0px 0px -7% 0px", threshold: 0 });

  var watched = D.querySelectorAll(".rv");
  for (var w = 0; w < watched.length; w++) io.observe(watched[w]);

  /* ---- 4. подстраховка: всё, что попадает в экран, должно быть показано ---- */
  function sweep() {
    var pend = D.querySelectorAll(".rv:not(.in)");
    var vh = window.innerHeight || 0;
    for (var s = 0; s < pend.length; s++) {
      if (pend[s].getBoundingClientRect().top < vh * 0.97) {
        pend[s].classList.add("in");
      }
    }
  }
  window.addEventListener("load", function () { setTimeout(sweep, 800); });
  window.addEventListener("beforeprint", showAll);

  /* ---- 5. тень у шапки при скролле ---- */
  var hdr = D.querySelector(".header");
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle("scrolled", (window.pageYOffset || 0) > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
