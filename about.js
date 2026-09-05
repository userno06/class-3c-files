
(() => {
  "use strict";

  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  ready(() => {
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => [...root.querySelectorAll(s)];
    const body = document.body;
    const menuButton = $("#menuButton");
    const closeButton = $("#closeButton");
    const menuOverlay = $("#menuOverlay");

    const openMenu = () => {
      if (!menuButton || !menuOverlay) return;
      menuOverlay.classList.add("active");
      menuButton.classList.add("active");
      body.classList.add("menu-open");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Close menu");
    };
    const closeMenu = () => {
      if (!menuButton || !menuOverlay) return;
      menuOverlay.classList.remove("active");
      menuButton.classList.remove("active");
      body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
    };

    menuButton?.addEventListener("click", () => {
      menuOverlay?.classList.contains("active") ? closeMenu() : openMenu();
    });
    closeButton?.addEventListener("click", closeMenu);
    $$(".fullscreen-nav a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

    const current = (location.pathname.split("/").pop() || "C-Files.html").toLowerCase();
    $$(".nav-links a").forEach(link => {
      const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
      link.classList.toggle("current", href === current);
    });

    const reveal = $$(".class-intro, .directory, .about-story, .about-values, .about-end, .contact-item, .contact-intro");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible", "show");
      }), { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      reveal.forEach(el => observer.observe(el));
    } else reveal.forEach(el => el.classList.add("is-visible", "show"));

    const heroTitle = $(".hero-title");
    let raf = 0;
    const onScroll = () => {
      if (!heroTitle || raf) return;
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY || 0, window.innerHeight) * 0.035;
        heroTitle.style.transform = `translate3d(0, ${y}px, 0)`;
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });


    const play = $("#playButton");
    const intro = $(".class-intro");
    let playing = false;
    play?.addEventListener("click", () => {
      if (playing || !intro) return;
      playing = true;
      play.classList.add("playing");
      const text = $(".play-text", play);
      if (text) text.textContent = "PLAYING INTRO";
      intro.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        playing = false;
        play.classList.remove("playing");
        if (text) text.textContent = "PLAY INTRO";
      }, 1800);
    });

    const hoverLabel = $("#contactHoverLabel");
    if (hoverLabel) {
      $$(".contact-item").forEach(item => {
        item.addEventListener("mouseenter", () => {
          hoverLabel.textContent = item.dataset.hover || "OPEN";
          hoverLabel.classList.add("active");
        });
        item.addEventListener("mouseleave", () => hoverLabel.classList.remove("active"));
        item.addEventListener("mousemove", e => {
          hoverLabel.style.left = `${e.clientX + 18}px`;
          hoverLabel.style.top = `${e.clientY + 18}px`;
        }, { passive: true });
      });
    }


    const finePointer = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches;
    if (finePointer && !$(".site-cursor")) {
      const cursor = document.createElement("div");
      cursor.className = "site-cursor";
      cursor.innerHTML = '<span class="cursor-label"></span>';
      body.appendChild(cursor);
      const label = $(".cursor-label", cursor);
      let mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my, hover = false;
      const targets = "a, button, [role='button'], .student, .student-name, [data-cursor], [data-hover]";
      const getLabel = el => el.dataset.cursor || el.dataset.hover ||
        (el.matches(".play-button") ? "PLAY" : el.matches(".student, .student-name, .class-link, .directory-footer a") ? "VIEW" : el.matches("button") ? "CLICK" : "OPEN");
      addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; cursor.classList.add("is-visible"); }, { passive: true });
      addEventListener("blur", () => cursor.classList.remove("is-visible"));
      document.addEventListener("mouseover", e => {
        const el = e.target.closest?.(targets);
        if (!el) return;
        hover = true; cursor.classList.add("is-hovering", "has-label");
        if (label) label.textContent = getLabel(el);
      });
      document.addEventListener("mouseout", e => {
        const el = e.target.closest?.(targets);
        if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
        hover = false; cursor.classList.remove("is-hovering", "has-label");
        if (label) label.textContent = "";
      });
      const tick = () => {
        const ease = hover ? 0.30 : 0.20;
        x += (mx - x) * ease; y += (my - y) * ease;
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(tick);
      };
      tick();
    }

    body.classList.add("page-loaded");
  });
})();

