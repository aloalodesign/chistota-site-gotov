/* Чистота в деталях — interactivity */
(function () {
  "use strict";

  /* ---- FAQ accordion (click + keyboard) ---- */
  function bindFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var tog = item.querySelector(".faq-tog");
      if (q && !q.hasAttribute("tabindex")) {
        q.setAttribute("tabindex", "0");
        q.setAttribute("role", "button");
        q.setAttribute("aria-expanded", item.classList.contains("open") ? "true" : "false");
      }
      function toggle() {
        var open = item.classList.contains("open");
        document.querySelectorAll(".faq-item").forEach(function (i) {
          i.classList.remove("open");
          var t = i.querySelector(".faq-tog"); if (t) t.textContent = "+";
          var qq = i.querySelector(".faq-q"); if (qq) qq.setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add("open");
          if (tog) tog.textContent = "−";
          if (q) q.setAttribute("aria-expanded", "true");
        }
      }
      if (!item.dataset.faqBound) {
        item.dataset.faqBound = "1";
        item.addEventListener("click", toggle);
        if (q) {
          q.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); toggle(); }
          });
        }
      }
    });
  }
  bindFaq();

  /* ---- generic carousel (refs + reviews) ---- */
  function carousel(trackSel, prevSel, nextSel, dotsSel) {
    var track = document.querySelector(trackSel);
    if (!track) return;
    var prev = document.querySelector(prevSel);
    var next = document.querySelector(nextSel);
    var wrap = track.parentElement;
    var index = 0;

    function step() {
      var first = track.children[0];
      if (!first) return 400;
      var gap = parseFloat(getComputedStyle(track).gap) || 24;
      return first.getBoundingClientRect().width + gap;
    }
    function visible() {
      return Math.max(1, Math.floor(wrap.clientWidth / step()));
    }
    function maxIndex() {
      return Math.max(0, track.children.length - visible());
    }
    function apply() {
      index = Math.min(index, maxIndex());
      track.style.transform = "translateX(" + -index * step() + "px)";
      if (dotsSel) {
        var dots = document.querySelectorAll(dotsSel + " .dot");
        dots.forEach(function (d, i) {
          d.classList.toggle("on", i === Math.min(index, dots.length - 1));
        });
      }
    }
    if (prev) prev.addEventListener("click", function () { index = Math.max(0, index - 1); apply(); });
    if (next) next.addEventListener("click", function () { index = Math.min(maxIndex(), index + 1); apply(); });
    if (dotsSel) {
      document.querySelectorAll(dotsSel + " .dot").forEach(function (d, i) {
        d.setAttribute("role", "button");
        d.setAttribute("tabindex", "0");
        d.addEventListener("click", function () { index = Math.min(i, maxIndex()); apply(); });
        d.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault(); index = Math.min(i, maxIndex()); apply();
          }
        });
      });
    }
    window.addEventListener("resize", apply);
    apply();
  }
  /* ---- обеспечить стрелки и точки у отзывов на всех страницах ---- */
  document.querySelectorAll(".reviews, .z10-reviews").forEach(function (rev) {
    var wrap = rev.querySelector("[data-rev-track]");
    if (!wrap) return;
    var head = rev.querySelector(".rev-head");
    if (!rev.querySelector(".arrows")) {
      var arr = document.createElement("div");
      arr.className = "arrows";
      arr.innerHTML =
        '<button class="arrow-btn" data-rev-prev aria-label="Предыдущий отзыв">←</button>' +
        '<button class="arrow-btn" data-rev-next aria-label="Следующий отзыв">→</button>';
      if (head) head.appendChild(arr);
      else wrap.before(arr);
    }
    if (!rev.querySelector(".dots")) {
      var dots = document.createElement("div");
      dots.className = "dots";
      dots.style.alignSelf = "center";
      var count = wrap.children.length;
      for (var i = 0; i < count; i++) {
        var d = document.createElement("span");
        d.className = "dot" + (i === 0 ? " on" : "");
        dots.appendChild(d);
      }
      wrap.after(dots);
    }
  });

  carousel("[data-refs-track]", "[data-refs-prev]", "[data-refs-next]", ".refs .dots");
  carousel("[data-rev-track]", "[data-rev-prev]", "[data-rev-next]", ".reviews .dots");
  carousel("[data-rev-track]", "[data-rev-prev]", "[data-rev-next]", ".z10-reviews .dots");

  /* ---- order form calculator ---- */
  var range = document.querySelector("[data-area-range]");
  var areaOut = document.querySelector("[data-area]");
  var estOut = document.querySelector("[data-estimate]");
  var estSub = document.querySelector("[data-estimate-sub]");
  var servSel = document.querySelector(".select-real");
  function rub(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  /* прейскурант: [цена за м², база] */
  var RATES = {
    "Генеральная уборка": [95, 1300],
    "Поддерживающая уборка": [55, 800],
    "Уборка детской": [80, 1100],
    "Организация порядка": [110, 2500],
    "Инклюзивная уборка": [120, 2000],
    "Зооклининг": [105, 1500],
    "После ремонта": [130, 3000],
    "Хоумстейджинг": [120, 2800],
    "Клининг автодомов и яхт": [140, 3500],
    "Переезд под ключ": [0, 7000],
    "Другое": [90, 1200]
  };
  function calc() {
    if (!range) return;
    var a = parseInt(range.value, 10);
    var rate = RATES[servSel && servSel.value] || RATES["Генеральная уборка"];
    var price = Math.round((a * rate[0] + rate[1]) / 100) * 100;
    areaOut.textContent = a + " м²";
    estOut.textContent = "от " + rub(price) + " ₽";
    estSub.textContent = (servSel ? servSel.value : "Генеральная уборка") + ", " + a + " м²";
    var pct = ((a - range.min) / (range.max - range.min)) * 100;
    range.style.background =
      "linear-gradient(90deg,#E5537E 0%,#E5537E " + pct + "%,#ffffff " + pct + "%,#ffffff 100%)";
  }
  if (range) { range.addEventListener("input", calc); }
  if (servSel) { servSel.addEventListener("change", calc); }
  calc();

  /* ---- mobile burger (added in mobile pass) ---- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      document.querySelector(".nav") &&
        document.querySelector(".nav").classList.toggle("open");
    });
  }
})();
