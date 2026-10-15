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

  /* ---------- Diagram lightbox ("View larger diagram") ---------- */
  (function () {
    var triggers = Array.prototype.slice.call(document.querySelectorAll(".case-visual-zoom"));
    if (!triggers.length) return;

    var overlay = null, img = null, caption = null, closeBtn = null, lastFocus = null;

    function build() {
      overlay = document.createElement("div");
      overlay.className = "lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Close diagram view">&times;</button>' +
        '<figure class="lightbox-figure">' +
        '<img class="lightbox-img" src="" alt="">' +
        '<figcaption class="lightbox-caption"></figcaption>' +
        '</figure>';
      document.body.appendChild(overlay);
      img = overlay.querySelector(".lightbox-img");
      caption = overlay.querySelector(".lightbox-caption");
      closeBtn = overlay.querySelector(".lightbox-close");
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay || e.target.closest(".lightbox-close")) close();
      });
      document.addEventListener("keydown", function (e) {
        if (!overlay.classList.contains("is-open")) return;
        if (e.key === "Escape") { e.preventDefault(); close(); }
        if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }
      });
    }

    function open(trigger) {
      if (!overlay) build();
      var fig = trigger.closest(".case-visual");
      var sourceImg = fig ? fig.querySelector(".case-visual-panel img") : null;
      var cap = fig ? fig.querySelector(".case-visual-caption") : null;
      lastFocus = trigger;
      img.src = trigger.getAttribute("data-full") || (sourceImg ? sourceImg.currentSrc || sourceImg.src : "");
      img.alt = sourceImg ? sourceImg.alt : "";
      caption.textContent = cap ? cap.textContent : "";
      overlay.setAttribute("aria-label", trigger.getAttribute("data-label") || "Enlarged diagram");
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
      lastFocus = null;
    }

    triggers.forEach(function (t) {
      t.addEventListener("click", function () { open(t); });
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
