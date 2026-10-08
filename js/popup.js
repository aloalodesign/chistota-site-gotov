/* ===== Popup: заявка, формы, ссылки ===== */
(function () {
  "use strict";

  /* ПОДКЛЮЧЕНИЕ ОТПРАВКИ: вставьте сюда URL формы (Formspree, sheets.google и т.п.)
     Пример: var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
     Пока пусто — форма работает в демо-режиме (показывает успех, ничего не шлёт). */
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/eprintseva.khristina@mail.ru";

  var PHONE = "+79099035586";

  var SERVICES = [
    "Генеральная уборка квартиры",
    "Уборка после ремонта",
    "Хоумстейджинг",
    "Клининг автодомов и яхт",
    "Переезд под ключ",
    "Поддерживающая уборка",
    "Уборка детской комнаты",
    "Организация порядка и хранения",
    "Зооклининг",
    "Инклюзивная уборка",
    "Другое"
  ];

  var PAGE_SERVICE = {
    "generalnaya.html": 0,
    "posle-remonta.html": 1,
    "homestaging.html": 2,
    "avtodoma-i-yahty.html": 3,
    "pereezd-pod-klyuch.html": 4,
    "podderzhivayushchaya.html": 5,
    "uborka-detskoy.html": 6,
    "organizaciya-hraneniya.html": 7,
    "zooklining.html": 8,
    "inklyuzivnaya.html": 9
  };

  var page = (location.pathname.split("/").pop() || "index.html").split("?")[0];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- build popup DOM ---------- */
  var overlay = document.createElement("div");
  overlay.className = "pp-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  var opts = '<option value="">— выберите услугу —</option>';
  for (var i = 0; i < SERVICES.length; i++) {
    opts += '<option value="' + esc(SERVICES[i]) + '">' + esc(SERVICES[i]) + "</option>";
  }

  overlay.innerHTML =
    '<div class="pp-card">' +
      '<button class="pp-close" aria-label="Закрыть">&times;</button>' +
      '<div class="pp-view pp-view-form">' +
        '<h2 class="pp-title">Оставить заявку</h2>' +
        '<p class="pp-sub">Перезвоним в течение 15 минут и рассчитаем стоимость по вашему объекту.</p>' +
        '<form class="pp-form" novalidate>' +
          '<div class="pp-row2">' +
            '<div><label class="lbl" for="pp-name">Ваше имя</label>' +
              '<input class="inp" id="pp-name" type="text" name="name" placeholder="Имя" autocomplete="name"></div>' +
            '<div><label class="lbl" for="pp-phone">Телефон</label>' +
              '<input class="inp" id="pp-phone" type="tel" name="phone" placeholder="+7 (___) ___-__-__" autocomplete="tel">' +
              '<div class="pp-err-msg">Укажите имя и телефон</div></div>' +
          '</div>' +
          '<div class="pp-row"><label class="lbl" for="pp-service">Услуга</label>' +
            '<select id="pp-service" name="service">' + opts + "</select></div>" +
          '<div class="pp-row"><label class="lbl" for="pp-comment">Комментарий</label>' +
            '<textarea id="pp-comment" name="comment" placeholder="Площадь, этаж, особые пожелания..."></textarea></div>' +
          '<label class="pp-consent">' +
            '<input type="checkbox" id="pp-ok">' +
            "<span>Я согласен на обработку персональных данных и принимаю " +
            '<a href="soglasie.html" target="_blank" rel="noopener">Согласие на обработку персональных данных</a>, ' +
            'ознакомился с <a href="politika.html" target="_blank" rel="noopener">Политикой обработки персональных данных</a>.</span>' +
          "</label>" +
          '<button type="submit" class="pp-submit">Отправить заявку</button>' +
          '<p class="pp-note">Или позвоните: <a href="tel:' + PHONE + '">' + "+7 909 903 55 86" + "</a></p>" +
        "</form>" +
      "</div>" +
      '<div class="pp-view pp-view-ok" style="display:none">' +
        '<div class="pp-success">' +
          '<div class="ok-ic">&#10003;</div>' +
          "<h3>Заявка принята!</h3>" +
          "<p>Перезвоним в течение 15 минут в рабочее время.</p>" +
          '<button class="pp-submit pp-ok-close" type="button">Хорошо</button>' +
        "</div>" +
      "</div>" +
    "</div>";
  document.body.appendChild(overlay);

  var viewForm = overlay.querySelector(".pp-view-form");
  var viewOk = overlay.querySelector(".pp-view-ok");
  var form = overlay.querySelector(".pp-form");
  var select = overlay.querySelector("#pp-service");
  var consent = overlay.querySelector(".pp-consent");
  var consentBox = overlay.querySelector("#pp-ok");

  var reviewMode = false;

  function openPopup(serviceHint, isReview) {
    reviewMode = !!isReview;
    viewForm.style.display = "";
    viewOk.style.display = "none";
    form.reset();
    clearErrors();
    var preset = "";
    if (typeof serviceHint === "number" && SERVICES[serviceHint]) preset = SERVICES[serviceHint];
    else if (PAGE_SERVICE[page] !== undefined) preset = SERVICES[PAGE_SERVICE[page]];
    select.value = preset;
    var title = overlay.querySelector(".pp-title");
    if (title) title.textContent = isReview ? "Оставить отзыв" : "Оставить заявку";
    var sub = overlay.querySelector(".pp-sub");
    if (sub) sub.textContent = isReview
      ? "Расскажите, как прошла уборка — мы опубликуем отзыв на сайте и в наших соцсетях."
      : "Перезвоним в течение 15 минут и рассчитаем стоимость по вашему объекту.";
    var submitBtn = overlay.querySelector(".pp-form .pp-submit");
    if (submitBtn) submitBtn.textContent = isReview ? "Отправить отзыв" : "Отправить заявку";
    var commentLbl = overlay.querySelector(".pp-row:last-of-type .lbl");
    var commentInp = overlay.querySelector("#pp-comment");
    if (commentInp) commentInp.placeholder = isReview
      ? "Ваш отзыв о качестве уборки, общении с клинером, результате..."
      : "Площадь, этаж, особые пожелания...";
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(function () { overlay.querySelector("#pp-name").focus(); }, 60);
  }
  function closePopup() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  overlay.querySelector(".pp-close").addEventListener("click", closePopup);
  overlay.querySelector(".pp-ok-close").addEventListener("click", closePopup);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closePopup(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closePopup();
  });

  function clearErrors() {
    form.querySelectorAll(".err").forEach(function (el) { el.classList.remove("err"); });
    form.querySelectorAll(".pp-err-msg").forEach(function (el) { el.classList.remove("show"); });
    consent.classList.remove("bad");
  }

  function validate(nameEl, phoneEl) {
    var ok = true;
    if (!nameEl.value.replace(/\s/g, "")) { nameEl.classList.add("err"); ok = false; }
    var digits = (phoneEl.value.match(/\d/g) || []).length;
    if (digits < 6) { phoneEl.classList.add("err"); ok = false; }
    if (!ok) {
      var msg = phoneEl.parentNode.querySelector(".pp-err-msg");
      if (msg) msg.classList.add("show");
      (!nameEl.value ? nameEl : phoneEl).focus();
    }
    return ok;
  }

  function send(data, done) {
    if (!FORM_ENDPOINT) { setTimeout(done, 450); return; } /* демо-режим */
    var fd = new FormData();
    for (var k in data) if (data.hasOwnProperty(k)) fd.append(k, data[k]);
    fetch(FORM_ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
      .catch(function () { alert("Не удалось отправить заявку. Позвоните нам: +7 909 903 55 86"); });
  }

  /* popup submit */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var nameEl = overlay.querySelector("#pp-name");
    var phoneEl = overlay.querySelector("#pp-phone");
    if (!validate(nameEl, phoneEl)) return;
    if (!consentBox.checked) { consent.classList.add("bad"); consentBox.focus(); return; }
    var commentText = overlay.querySelector("#pp-comment").value;
    send({
      name: nameEl.value,
      phone: phoneEl.value,
      service: select.value,
      comment: commentText,
      page: page
    }, function () {
      viewForm.style.display = "none";
      var okView = overlay.querySelector(".pp-view-ok");
      /* отзыв: добавляем карточку в карусель и даём отправить текст в WhatsApp */
      if (reviewMode) {
        addReviewCard(nameEl.value, select.value, commentText);
        var okTitle = okView.querySelector("h3");
        if (okTitle) okTitle.textContent = "Спасибо за отзыв!";
        var okText = okView.querySelector("p");
        if (okText) okText.textContent = "Отзыв опубликован на странице. Чтобы он точно дошёл до нас, отправьте его в WhatsApp — опубликуем в соцсетях.";
        var oldShare = okView.querySelector(".pp-share");
        if (oldShare) oldShare.remove();
        var share = document.createElement("a");
        share.className = "pp-submit pp-share";
        share.target = "_blank";
        share.rel = "noopener";
        var waText = "Отзыв о услуге «" + select.value + "» (" + (nameEl.value || "клиент") + "): " + commentText;
        share.href = "https://wa.me/79099035586?text=" + encodeURIComponent(waText);
        share.textContent = "Отправить отзыв в WhatsApp";
        share.style.display = "flex";
        share.style.width = "auto";
        share.style.margin = "0 auto 12px";
        okView.querySelector(".pp-ok-close").before(share);
      } else {
        var okT = okView.querySelector("h3");
        if (okT) okT.textContent = "Заявка принята!";
        var oldShare2 = okView.querySelector(".pp-share");
        if (oldShare2) oldShare2.remove();
      }
      viewOk.style.display = "";
    });
  });

  /* отзыв добавляется живьём в карусель отзывов текущей страницы */
  function addReviewCard(name, service, text) {
    var tracks = document.querySelectorAll(".rev-track");
    var letter = (name || "К").trim().charAt(0).toUpperCase();
    var now = new Date();
    var months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    var dateStr = now.getDate() + " " + months[now.getMonth()];
    tracks.forEach(function (track) {
      var card = document.createElement("article");
      card.className = "rev-card rev-card-new";
      card.innerHTML =
        '<div class="rev-top">' +
          '<div class="rev-ava">' + esc(letter) + '</div>' +
          '<div class="rev-name"><b>' + esc(name || "Гость") + '</b><span>' + dateStr + ' · Клиент</span></div>' +
          '<span class="rev-stars">★★★★★</span>' +
        '</div>' +
        '<span class="rev-badge">' + esc(service || "Уборка") + '</span>' +
        '<p class="rev-text">' + esc(text || "Спасибо за работу!") + '</p>';
      track.appendChild(card);
    });
    try { localStorage.setItem("chistota_review_" + now.getTime(), JSON.stringify({ name: name, service: service, text: text, date: dateStr })); } catch (e) {}
  }

  /* ---------- intercept CTA anchors: popup, no scroll ---------- */
  function ctaAnchor(el) {
    if (!el) return false;
    if (el.classList && el.classList.contains("rev-ghost")) return true;
    if (el.tagName !== "A") return false;
    var href = el.getAttribute("href") || "";
    if (el.classList.contains("header-cta")) return true;
    if (href === "#order" || href.indexOf("#order") !== -1) return true;
    if ((el.classList.contains("btn-pink") || el.classList.contains("btn-ghost")) && (href === "" || href === "#")) return true;
    return false;
  }

  document.addEventListener("click", function (e) {
    var el = e.target;
    while (el && el !== document.body) {
      if (ctaAnchor(el)) {
        e.preventDefault();
        var href = el.getAttribute ? (el.getAttribute("href") || "") : "";
        var hint;
        var m = href.match(/^([a-z0-9-]+\.html)#/);
        if (m && PAGE_SERVICE[m[1]] !== undefined) hint = PAGE_SERVICE[m[1]];
        /* отзыв -> попап с адаптированным заголовком */
        var isReview = (el.classList && (el.classList.contains("rev-ghost") || (el.textContent || "").toLowerCase().indexOf("оставить отзыв") !== -1));
        openPopup(hint, isReview);
        return;
      }
      el = el.parentNode;
    }
  });

  /* ---------- inline forms: validate + success ---------- */
  function okBlock(msg) {
    var d = document.createElement("div");
    d.className = "form-ok";
    d.innerHTML = '<span class="ok-ic">&#10003;</span><b>Заявка отправлена!</b><span>' +
      (msg || "Перезвоним в течение 15 минут в рабочее время.") + "</span>";
    return d;
  }

  function findField(scope, re) {
    var inputs = scope.querySelectorAll("input[type='text'], input[type='tel']");
    for (var i = 0; i < inputs.length; i++) {
      var ph = (inputs[i].getAttribute("placeholder") || "").toLowerCase();
      if (re.test(ph)) return inputs[i];
    }
    return null;
  }

  function inlineSubmit(root) {
    var nameEl = findField(root, /имя|ваше/i) || root.querySelector("input[type='text']");
    var phoneEl = findField(root, /телефон|тел/i);
    if (!phoneEl) {
      var ins = root.querySelectorAll("input[type='text'], input[type='tel']");
      phoneEl = ins.length > 1 ? ins[ins.length - 1] : ins[0];
    }
    root.querySelectorAll(".err").forEach(function (el) { el.classList.remove("err"); });
    var ok = true;
    if (nameEl && !nameEl.value.replace(/\s/g, "")) { nameEl.classList.add("err"); ok = false; }
    if (phoneEl) {
      var digits = (phoneEl.value.match(/\d/g) || []).length;
      if (digits < 6) { phoneEl.classList.add("err"); ok = false; }
    }
    if (!ok) { (nameEl && !nameEl.value ? nameEl : phoneEl || nameEl).focus(); return; }

    var container =
      root.closest(".order5-form") ||
      root.closest(".order-col.right") ||
      root.closest(".hs-order-form, .cta-form, .p8-order-form, form") ||
      root;
    var data = {
      name: nameEl ? nameEl.value : "",
      phone: phoneEl ? phoneEl.value : "",
      page: page
    };
    var textareas = container.querySelectorAll("textarea");
    if (textareas.length) data.comment = textareas[textareas.length - 1].value;
    var servSel = container.querySelector("select") || container.querySelector(".select span");
    if (servSel) data.service = servSel.tagName === "SELECT" ? servSel.value : servSel.textContent;

    var submitBtn = container.querySelector(".order-send, .hs-send");
    if (submitBtn) submitBtn.disabled = true;

    send(data, function () {
      var ok1 = okBlock();
      if (container === root && root.tagName !== "FORM") { root.appendChild(ok1); }
      else { container.innerHTML = ""; container.appendChild(ok1); }
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".order-send, .hs-send") : null;
    if (!btn) return;
    if (btn.tagName === "BUTTON" && btn.getAttribute("type") === "submit") {
      var f = btn.closest("form");
      if (f) return; /* form submit handler поймает */
    }
    e.preventDefault();
    var root = btn.closest("form");
    if (!root) {
      /* подняться до блока, где лежат поля имени и телефона */
      root = btn.parentNode;
      while (root && root !== document.body) {
        var ins = root.querySelectorAll("input[type='text'], input[type='tel']");
        if (ins.length >= 2) break;
        root = root.parentNode;
      }
      if (!root || root === document.body) root = btn.parentNode;
    }
    inlineSubmit(root);
  });

  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (f.tagName !== "FORM") return;
    e.preventDefault();
    inlineSubmit(f);
  });

  /* ---------- upgrade order-note: real links to policy docs ---------- */
  var consentHTML =
    'Отправляя форму, вы даёте <a href="soglasie.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a> ' +
    'и соглашаетесь с <a href="politika.html" target="_blank" rel="noopener">Политикой обработки персональных данных</a>.';
  document.querySelectorAll(".order-note, .hs-order-note, .p8-order-note").forEach(function (n) {
    n.innerHTML = consentHTML;
  });

  /* ---------- real social / write links ---------- */
  document.querySelectorAll("a.soc, a.wa-btn").forEach(function (a) {
    var t = (a.textContent || "").toLowerCase();
    var href = a.getAttribute("href") || "";
    if (href !== "#") return;
    if (t.indexOf("whatsapp") !== -1 || t.indexOf("написать") !== -1 || a.classList.contains("wa-btn")) {
      a.href = "https://wa.me/7" + PHONE.slice(2);
    } else if (t.indexOf("telegram") !== -1) {
      a.href = "https://t.me/chistota_v_detalyah";
    } else if (t.indexOf("vk") !== -1) {
      a.href = "https://vk.com/";
    } else if (t.indexOf("avito") !== -1) {
      a.href = "https://www.avito.ru/";
    } else if (t.indexOf("max") !== -1) {
      a.href = "https://max.ru/";
    }
    if (a.href && a.href.indexOf("http") === 0) {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });
})();
