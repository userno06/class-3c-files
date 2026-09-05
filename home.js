
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
    const audio = $("#classSong");
    let playing = false;
    play?.addEventListener("click", async () => {
      if (!audio) return;
      const text = $(".play-text", play);
      try {
        if (audio.paused) {
          await audio.play();
          playing = true;
          play.classList.add("playing", "is-playing");
          if (text) text.textContent = "PLAYING";
          intro?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          audio.pause();
          playing = false;
          play.classList.remove("playing", "is-playing");
          if (text) text.textContent = "PLAY INTRO";
        }
      } catch (err) {
        console.warn("Audio could not start:", err);
        if (text) text.textContent = "ADD SONG";
      }
    });
    audio?.addEventListener("ended", () => {
      playing = false;
      play?.classList.remove("playing", "is-playing");
      const text = $(".play-text", play);
      if (text) text.textContent = "PLAY INTRO";
    });

    const heroWords = $$(".hero-title h1");
    heroWords.forEach(word => {
      if (word.dataset.lettersReady) return;
      const text = word.textContent;
      word.textContent = "";
      [...text].forEach((char, index) => {
        const span = document.createElement("span");
        span.className = char === " " ? "hero-letter hero-space" : "hero-letter";
        span.textContent = char === " " ? "\u00a0" : char;
        span.style.setProperty("--letter-index", index);
        word.appendChild(span);
      });
      word.dataset.lettersReady = "true";
    });

    if (matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches) {
      $$(".hero-letter").forEach(letter => {
        if (letter.classList.contains("hero-space")) return;
        letter.addEventListener("mouseenter", () => {
          letter.classList.add("is-key-active");
          letter.parentElement?.classList.add("has-key-active");
        });
        letter.addEventListener("mouseleave", () => {
          letter.classList.remove("is-key-active");
          letter.parentElement?.classList.remove("has-key-active");
        });
      });
    }

    const finePointerForPhoto = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches;
    if (finePointerForPhoto && heroWords.length) {
      const photo = document.createElement("div");
      photo.className = "class-hover-photo";
      photo.innerHTML = `
        <div class="class-hover-photo-frame">
          <img src="IMAGES/class.jpg" alt="BSIT Class C group photo">
          <span class="class-hover-photo-label">BSIT CLASS C</span>
          <span class="class-hover-photo-index">26</span>
          <span class="class-hover-photo-meta"><span>CLASS ARCHIVE</span><span>2026</span></span>
        </div>`;
      body.appendChild(photo);
      const img = $("img", photo);
      let px = innerWidth / 2, py = innerHeight / 2, tx = px, ty = py, visible = false;
      let targetOffsetX = 145, targetOffsetY = -20, targetRotation = -4, targetScale = 1;
      let photoOffsetX = 145, photoOffsetY = -20, photoRotation = -4, photoScale = 1;

      const poses = [
        [-150, -95, -8, .96], [-90, -62, -5, .98], [-25, -35, -2, 1],
        [45, -72, 3, 1.02], [105, -38, 6, 1.01], [155, -92, 9, .97],
        [-125, 55, -10, .98], [-55, 78, -5, 1.02], [20, 62, 1, 1.04],
        [85, 72, 6, 1.02], [145, 48, 10, .96], [175, 88, 7, .94]
      ];
      let poseCounter = 0;
      const setLetterPose = letter => {
        const rect = letter.getBoundingClientRect();
        const centerX = innerWidth / 2;
        const centerY = innerHeight / 2;
        const dx = rect.left + rect.width / 2 - centerX;
        const dy = rect.top + rect.height / 2 - centerY;
        const wordIndex = heroWords.indexOf(letter.parentElement);
        const letterIndex = Number(letter.style.getPropertyValue("--letter-index")) || poseCounter++;
        const base = poses[(letterIndex + Math.max(wordIndex, 0) * 3) % poses.length];

        targetOffsetX = base[0] + (dx > 0 ? -18 : 18);
        targetOffsetY = base[1] + (dy > 0 ? -12 : 12);
        targetRotation = base[2] + Math.max(-2, Math.min(2, dx / 260));
        targetScale = base[3];
      };

      heroWords.forEach(word => {
        word.addEventListener("mouseenter", () => {
          visible = true;
          photo.classList.add("is-active");
        });
        word.addEventListener("mouseleave", () => {
          visible = false;
          photo.classList.remove("is-active");
          targetOffsetX = 145; targetOffsetY = -20; targetRotation = -6; targetScale = .82;
        });
      });

      $$(".hero-letter").forEach(letter => {
        if (letter.classList.contains("hero-space")) return;
        letter.addEventListener("mouseenter", () => setLetterPose(letter));
      });

      addEventListener("mousemove", e => {
        tx = Math.min(innerWidth - 30, Math.max(30, e.clientX));
        ty = Math.min(innerHeight - 30, Math.max(30, e.clientY));
      }, { passive: true });
      const follow = () => {
        const edge = Math.min(innerWidth, innerHeight) < 800;
        const clampX = edge ? 105 : 165;
        const clampY = edge ? 70 : 110;
        const ox = Math.max(-clampX, Math.min(clampX, targetOffsetX));
        const oy = Math.max(-clampY, Math.min(clampY, targetOffsetY));
        photoOffsetX += (ox - photoOffsetX) * .12;
        photoOffsetY += (oy - photoOffsetY) * .12;
        photoRotation += (targetRotation - photoRotation) * .12;
        photoScale += (targetScale - photoScale) * .12;
        px += ((tx + photoOffsetX) - px) * .16;
        py += ((ty + photoOffsetY) - py) * .16;
        photo.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) rotate(${photoRotation}deg) scale(${visible ? photoScale : .82})`;
        requestAnimationFrame(follow);
      };
      follow();
      img?.addEventListener("error", () => {
        photo.classList.add("is-missing");
        img.alt = "Add your class photo at IMAGES/class.jpg";
      }, { once: true });
    }

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
