/* Bradford Independent — progressive enhancements only.
   The site is fully functional without JavaScript. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    var closeMenu = function () {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    };

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });

    // Close on Escape and on link click
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (
        menu.classList.contains("is-open") &&
        !e.target.closest(".site-nav")
      ) {
        closeMenu();
      }
    });
  }

  /* ---------- Header: condensed glass state once the page scrolls ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onHeaderScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onHeaderScroll();
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
  }

  /* ---------- Scroll reveals (skipped when reduced motion is preferred) ---------- */
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero background drift (subtle; disabled for reduced motion) ---------- */
  var hero = document.querySelector(".hero");
  if (hero && !prefersReduced) {
    var ticking = false;
    var drift = function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < 900) {
            hero.style.backgroundPosition =
              "center calc(50% - " + (y * 0.06).toFixed(1) + "px)";
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    drift();
    window.addEventListener("scroll", drift, { passive: true });
  }
  var revealEls = document.querySelectorAll(".reveal");

  if (!prefersReduced && "IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contact form: FormSubmit endpoint ----------
     The form POSTs to FormSubmit (formsubmit.co), which relays the
     submission to Harley's inbox. Spam protection: honeypot + timing guard. */
  var form = document.getElementById("contact-form");

  if (form) {
    var formOpenedAt = Date.now();

    form.addEventListener("submit", function (e) {
      /* Spam protection: honeypot field + minimum time-on-form.
         The honeypot is hidden from humans; bots tend to fill every field.
         Real people almost never submit a written enquiry in under a second.
         If either fails, block submission silently; otherwise allow the
         form to POST to the endpoint. */
      var honey = form.elements._honey ? form.elements._honey.value : "";
      if (honey) { e.preventDefault(); return; } /* likely a bot */
      if (Date.now() - formOpenedAt < 1000) { e.preventDefault(); return; } /* too fast */
    });

    /* Success state after the FormSubmit redirect back to ?sent=1 */
    if (/[?&]sent=1(=|$)/.test(window.location.search)) {
      var ok = document.getElementById("form-sent");
      if (ok) { ok.hidden = false; ok.scrollIntoView({ block: "center" }); }
      if (form) form.style.display = "none";
    }
  }

  /* ---------- Homepage pitch (silent trailer) ---------- */
  (function () {
    var pitch = document.querySelector(".pitch");
    if (!pitch) return;
    var scenes = Array.prototype.slice.call(pitch.querySelectorAll(".pitch-scene"));
    if (!scenes.length) return;
    var bar = pitch.querySelector(".pitch-bar");
    var replay = pitch.querySelector(".p-replay");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var durs = scenes.map(function (s) { return parseInt(s.getAttribute("data-dur"), 10) || 4000; });
    var total = durs.reduce(function (a, b) { return a + b; }, 0);
    var idx = -1, timer = null, started = false, ended = false, sceneStart = 0;

    function show(i) {
      scenes.forEach(function (s, j) {
        if (j === i) { s.classList.add("is-active"); s.classList.remove("is-leaving"); }
        else if (s.classList.contains("is-active")) { s.classList.remove("is-active"); s.classList.add("is-leaving"); }
      });
      idx = i;
      sceneStart = Date.now();
    }
    function setBar() {
      if (!bar) return;
      var pre = 0, k;
      for (k = 0; k < idx; k++) pre += durs[k];
      var f = Math.min(durs[idx], Date.now() - sceneStart);
      bar.style.width = Math.min(100, (pre + f) / total * 100) + "%";
    }
    function play(i) { clearTimeout(timer); show(i); timer = setTimeout(next, durs[i]); }
    function next() { if (idx + 1 < scenes.length) play(idx + 1); else finish(); }
    function finish() { ended = true; clearTimeout(timer); timer = null; if (bar) bar.style.width = "100%"; }

    if (bar) {
      setInterval(function () {
        if (started && !ended && timer && !document.hidden) setBar();
      }, 250);
    }
    if (replay) {
      replay.addEventListener("click", function () { ended = false; play(0); });
    }

    if (reduced) {
      /* no animation: hold the final scene statically with everything visible */
      scenes[scenes.length - 1].classList.add("is-active");
      if (bar) bar.style.width = "100%";
      return;
    }

    /* start only when the section is actually on screen */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !started) { started = true; io.disconnect(); play(0); }
        });
      }, { threshold: 0.35 });
      io.observe(pitch);
    } else {
      started = true;
      play(0);
    }

    /* don't advance scenes in a background tab */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (timer) { clearTimeout(timer); timer = null; }
      } else if (started && !ended && !timer) {
        play(idx < 0 ? 0 : idx);
      }
    });
  })();

  /* ---------- Cookie consent banner ---------- */
  (function () {
    var CONSENT_KEY = "bi-consent-v1";

    function readConsent() {
      try { return localStorage.getItem(CONSENT_KEY); }
      catch (e) { return null; }
    }
    function writeConsent(value) {
      try { localStorage.setItem(CONSENT_KEY, value); }
      catch (e) { /* storage unavailable — banner simply won't persist */ }
    }

    function buildBanner() {
      var banner = document.createElement("div");
      banner.className = "cookie-banner";
      banner.setAttribute("role", "dialog");
      banner.setAttribute("aria-label", "Cookie consent");
      banner.innerHTML =
        '<p>This site doesn\'t use tracking cookies. We only remember that you\'ve seen this notice. See our <a href="/privacy-policy/">Privacy Policy</a>.</p>' +
        '<div class="cookie-banner-actions">' +
        '<button class="btn btn--ghost-light btn--small" type="button" data-consent="reject">Reject</button>' +
        '<button class="btn btn--primary btn--small" type="button" data-consent="accept">Accept</button>' +
        '</div>';
      return banner;
    }

    function dismiss(banner) {
      banner.classList.add("is-hidden");
      window.setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 320);
    }

    window.biCookiePreferences = function () {
      try { localStorage.removeItem(CONSENT_KEY); } catch (e) { /* ignore */ }
      var existing = document.querySelector(".cookie-banner");
      if (existing) { return; }
      var banner = buildBanner();
      document.body.appendChild(banner);
      wireActions(banner);
      requestAnimationFrame(function () { banner.classList.remove("is-hidden"); });
    };

    function wireActions(banner) {
      banner.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-consent]");
        if (!btn) { return; }
        writeConsent(btn.getAttribute("data-consent"));
        dismiss(banner);
      });
    }

    if (!readConsent() && document.body) {
      var banner = buildBanner();
      banner.classList.add("is-hidden");
      document.body.appendChild(banner);
      wireActions(banner);
      /* reveal after a beat so it doesn't fight the initial paint */
      window.setTimeout(function () { banner.classList.remove("is-hidden"); }, 600);
    }
  })();
})();
