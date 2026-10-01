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

  /* ---------- Contact form: compose a mailto draft ----------
     No backend required; opens the visitor's own email client with
     the message pre-filled. Works without JS via a plain mailto link. */
  var form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var org = form.elements.organisation.value.trim();
      var message = form.elements.message.value.trim();

      var subject = "Enquiry from bradfordindependent.com" +
        (name ? " — " + name : "");

      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        (org ? "Organisation: " + org + "\n" : "") +
        "\n" +
        message + "\n";

      window.location.href =
        "mailto:harley@bradfordindependent.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      var sent = document.getElementById("form-sent");
      if (sent) sent.hidden = false;
    });
  }
})();
