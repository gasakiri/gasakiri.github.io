(function () {
  "use strict";

  var root = document.documentElement;

  /* ------------------------------------------------------------
     1) Tema dia/noite
     - O tema inicial já foi aplicado por um script no <head>.
     - Aqui só cuidamos do botão, da persistência e do <meta theme-color>.
     ------------------------------------------------------------ */
  var themeBtn = document.getElementById("themeToggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var THEME_COLORS = { light: "#254d3b", dark: "#0d1813" };

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLORS[theme]);
    if (themeBtn) {
      var isDark = theme === "dark";
      themeBtn.setAttribute("aria-pressed", String(isDark));
      themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
    if (persist) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* storage bloqueado */ }
    }
  }

  applyTheme(root.getAttribute("data-theme") || "light", false);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }

  // Se a pessoa nunca escolheu manualmente, acompanha o tema do sistema.
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  var onSystemChange = function (e) {
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) {}
    if (!saved) applyTheme(e.matches ? "dark" : "light", false);
  };
  if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
  else if (mq.addListener) mq.addListener(onSystemChange);

  /* ------------------------------------------------------------
     2) Menu mobile
     ------------------------------------------------------------ */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function setMenu(open) {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("is-open", open);
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 832) setMenu(false);
    });
  }

  /* ------------------------------------------------------------
     3) Filtro de projetos por linguagem
     ------------------------------------------------------------ */
  var grid = document.getElementById("projectGrid");
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".card")) : [];
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  var state = { lang: "all" };

  function render() {
    cards.forEach(function (card) {
      // O cartão "More on GitHub" aparece sempre.
      if (card.getAttribute("data-always") === "true") { card.hidden = false; return; }
      var langOk = state.lang === "all" || card.getAttribute("data-lang") === state.lang;
      card.hidden = !langOk;
    });

    chips.forEach(function (chip) {
      var active = chip.getAttribute("data-lang") === state.lang;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      state.lang = chip.getAttribute("data-lang");
      render();
    });
  });

  /* ------------------------------------------------------------
     4) Copiar npub
     ------------------------------------------------------------ */
  var copyBtn = document.getElementById("copyNpub");
  var npubEl = document.getElementById("npub");

  if (copyBtn && npubEl) {
    var originalLabel = copyBtn.textContent;
    copyBtn.addEventListener("click", function () {
      var text = npubEl.textContent.trim();
      var done = function (ok) {
        copyBtn.textContent = ok ? "Copied!" : "Press Ctrl+C to copy";
        setTimeout(function () { copyBtn.textContent = originalLabel; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        // Fallback: seleciona o texto para o usuário copiar manualmente.
        var range = document.createRange();
        range.selectNodeContents(npubEl);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        done(false);
      }
    });
  }

  /* ------------------------------------------------------------
     5) Ano no rodapé
     ------------------------------------------------------------ */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
