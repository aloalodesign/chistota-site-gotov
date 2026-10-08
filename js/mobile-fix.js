/* Mobile autofit: stacks overflowing rows/grids at <=860px */
(function () {
  "use strict";
  if (!window.matchMedia("(max-width: 860px)").matches) return;

  function clipped(el) {
    var n = el.parentElement;
    while (n && n !== document.body) {
      var cs = getComputedStyle(n);
      if (cs.overflowX === "hidden" || cs.overflow === "hidden" || cs.overflowX === "clip") return true;
      n = n.parentElement;
    }
    return false;
  }

  function fixPass() {
    if (!window.matchMedia("(max-width: 860px)").matches) return;
    window.__mfix = (window.__mfix || 0) + 1;
    var vw = document.documentElement.clientWidth;
    var all = document.querySelectorAll("main *, footer *");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var b = el.getBoundingClientRect();
      if (b.right <= vw + 2 || b.width <= 20) continue;
      if (el.closest(".refs-track-wrap, .rev-track-wrap")) continue;
      if (clipped(el)) continue;
      var top = el, n = el.parentElement;
      while (n && n !== document.body) {
        if (n.getBoundingClientRect().right > vw + 2) top = n;
        n = n.parentElement;
      }
      var target = top;
      if (target === el) {
        var p = el.parentElement;
        if (p && p !== document.body) {
          var pcs = getComputedStyle(p);
          if (pcs.display.indexOf("flex") !== -1 || pcs.display.indexOf("grid") !== -1) target = p;
        }
      }
      var cs = getComputedStyle(target);
      var pos = cs.position;
      if (pos === "absolute" || pos === "fixed") {
        target.style.left = "8px";
        target.style.right = "8px";
        target.style.width = "auto";
        target.style.maxWidth = "100%";
        continue;
      }
      if (cs.display.indexOf("flex") !== -1 && cs.flexDirection === "row") {
        target.style.flexWrap = "wrap";
        target.style.width = "100%";
        target.style.minWidth = "0";
        for (var j = 0; j < target.children.length; j++) {
          var c = target.children[j];
          if (getComputedStyle(c).position === "absolute") continue;
          c.style.minWidth = "0";
          c.style.flex = "1 1 100%";
          c.style.maxWidth = "100%";
        }
      } else if (cs.display.indexOf("grid") !== -1) {
        target.style.width = "100%";
        target.style.minWidth = "0";
        var tb = target.getBoundingClientRect();
        if (tb.right > vw + 2 && /px/.test(cs.gridTemplateColumns)) {
          target.style.gridTemplateColumns = "1fr";
        }
      } else {
        target.style.width = "100%";
        target.style.maxWidth = "100%";
        target.style.minWidth = "0";
      }
    }
  }

  function run() {
    fixPass();
    for (var k = 1; k <= 8; k++) setTimeout(fixPass, 120 * k);
    setTimeout(fixPass, 1400);
  }
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run);
  window.addEventListener("resize", function () { setTimeout(fixPass, 100); });
})();
