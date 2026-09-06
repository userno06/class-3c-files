(() => {
    "use strict";

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const clamp = (v, lo = 0, hi = Infinity) => Math.max(lo, Math.min(hi, v));

    const body = document.body;
    const viewport = $('#studentViewport');
    const list = $('#studentList');
    if (!viewport || !list) return;

    const menuButton = $('#menuButton');
    const closeButton = $('#closeButton');
    const overlay = $('#menuOverlay');
    const photoPanel = $('#photoPanel');
    const infoContent = $('#infoContent');
    const infoNumber = $('#infoNumber');
    const infoName = $('#infoName');
    const infoDescription = $('#infoDescription');
    const infoRole = $('#infoRole');
    const counter = $('#currentNumber');
    const total = $('#totalNumber');
    const hint = $('#scrollHint');
    const playButton = $('#playButton');
    const audioEl = $('#classSong');
    const prevBtn = $('#prevBtn');
    const nextBtn = $('#nextBtn');

    const closeMenu = () => {
        overlay?.classList.remove('active');
        menuButton?.classList.remove('active');
        body.classList.remove('menu-open');
        menuButton?.setAttribute('aria-expanded', 'false');
        menuButton?.setAttribute('aria-label', 'Open menu');
    };
    const openMenu = () => {
        overlay?.classList.add('active');
        menuButton?.classList.add('active');
        body.classList.add('menu-open');
        menuButton?.setAttribute('aria-expanded', 'true');
        menuButton?.setAttribute('aria-label', 'Close menu');
    };
    menuButton?.addEventListener('click', () =>
        overlay?.classList.contains('active') ? closeMenu() : openMenu()
    );
    closeButton?.addEventListener('click', closeMenu);
    $$('.fullscreen-nav a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    const current = (location.pathname.split('/').pop() || 'class.html').toLowerCase();
    $$('.nav-links a').forEach(a =>
        a.classList.toggle('current', (a.getAttribute('href') || '').split('/').pop().toLowerCase() === current)
    );

    const students = [{
        alias: 'KOI',
        image: 'IMAGES/koiii.jpg',
        role: 'ESCORT',
        description: 'NAME: JHON MICHAEL TRIO\n“May GitHub, walang ka-hug.”'
    }, {
        alias: 'TIMO',
        image: 'IMAGES/GERALD.jpg',
        role: 'COUNCILOR',
        description: 'NAME: GERALD GIL TORRATO\n"na para bang awrighttt, auwkayy"'
    }, {
        alias: 'MITCH',
        image: 'IMAGES/MITCH.jpg',
        role: 'STUDENT',
        description: 'NAME: JHON MITCH MOLEÑO\n"Why do we need to pass the exam if we can pass away"'
    }, {
        alias: 'LIAN',
        image: 'IMAGES/LIAN.jpg',
        role: 'CSC VICE GOVERNOR',
        description: 'NAME: JELIAN CADIZ\n"Wag mong gagawain sa iba ang ginawa natin kagabi"'
    }, {
        alias: 'JM',
        image: 'IMAGES/JM.jpg',
        role: 'COUNCILOR',
        description: 'NAME: JOHN MARK ALCANTARA\n"No one can use you if you are useless"'
    }, {
        alias: 'JOMEL',
        image: 'IMAGES/JOMEL.jpeg',
        role: 'STUDENT',
        description: 'NAME: JOMEL OLIVERIO\n"Basta pasado, kahit hindi ko alam kung paano"'
    }, {
        alias: 'KATKAT',
        image: 'IMAGES/KAT.jpeg',
        role: 'STUDENT',
        description: 'NAME: Katryn Drxl Octaviano\n"Naga-pamati ko sa klase... sa akon damgo"'
    }, {
        alias: 'KEVS',
        image: 'IMAGES/KEVIN.jpg',
        role: 'COUNCILOR',
        description: 'NAME: KEVIN TABIFRANCA\n"Walang kanin buseng?"'
    }, {
        alias: 'CA',
        image: 'IMAGES/CA.jpg',
        role: 'MAYOR',
        description: 'NAME: CHRISTINE ANGELIQUE NEMIADA\n"THE BIGGEST BEEF STAKE"'
    },{
        alias: 'NECAY',
        image: 'IMAGES/JENECA.jpg',
        role: 'VICE-MAYOR',
        description: 'NAME: JENECA TORRETEJO\n"Masaganang petchay, masaganang buhay"'
    },{
        alias: 'CHA',
        image: 'IMAGES/CHA.jpg',
        role: 'COUNCILOR',
        description: 'NAME: CHARMAINE JOY BALADHAY\n"Nag-aaral lang ako kasi required"'
    },{
        alias: 'MYLZE',
        image: 'IMAGES/MYLZE.jpg',
        role: 'COUNCILOR',
        description: 'NAME: MYLZWYNE BATIANCILA\n"Kung puso mo ay palaging bigo at sawi, baka naman mukha at wallet lang ang iyong pinipili."'
    },];

    total.textContent = String(students.length).padStart(2, '0');

    const copies = 3;
    for (let c = 0; c < copies; c++) {
        students.forEach((s, i) => {
            const el = document.createElement('article');
            el.className = 'student';
            el.dataset.index = i;
            el.dataset.copy = c;
            el.tabIndex = 0;
            el.innerHTML = `
                <span class="student-number">${String(i+1).padStart(2,'0')}</span>
                <span class="student-name">${s.alias}</span>
                <span class="student-role">${s.role}</span>
              `;
            el.addEventListener('click', () => go(i, el, true));
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault();
                    go(i, el, true); }
            });
            list.appendChild(el);
        });
    }

    const els = $$('.student', list);
    const n = students.length;
    let currentDom = n;
    let currentLogical = -1;
    let smooth = 0;
    let target = 0;
    let animating = false;
    let autoScrolling = false;
    let rafId = null;
    let updateTimer = null;
    let photoTimer = null;
    let autoCycleInterval = null;

    let positions = [];
    let viewportH = 0;
    let setHeight = 0;

    const measure = () => {
        if (n === 0) return;
        const first = els[0];
        const mid = els[n];
        if (!first || !mid) return;
        setHeight = mid.offsetTop - first.offsetTop;
        viewportH = viewport.clientHeight;
        positions = els.map(el => ({ top: el.offsetTop, height: el.offsetHeight }));
    };

    const centerTarget = (el) => {
        if (!el) return 0;
        return clamp(el.offsetTop - (viewport.clientHeight - el.offsetHeight) / 2, 0, viewport.scrollHeight - viewport
            .clientHeight);
    };

    const smoothstep = p => p * p * (3 - 2 * p);

    function isPortrait() {
        return window.innerWidth <= 650 && window.innerHeight > window.innerWidth;
    }

    function photoCard(logical, dir) {
        if (!photoPanel) return;
        const s = students[logical];
        if (!s) return;

        photoPanel.querySelectorAll('.photo-card').forEach(c => c.remove());
        if (photoTimer) clearTimeout(photoTimer);

        const card = document.createElement('div');
        const enterClass = dir > 0 ? 'photo-enter-up' : 'photo-enter-down';
        card.className = `photo-card ${enterClass}`;
        card.innerHTML = `
              <div class="photo-card-chrome" aria-hidden="true">
                <span class="photo-meta">BSIT / CLASS C</span>
                <span class="photo-status"><i></i> ARCHIVE</span>
              </div>
              <div class="photo-image-wrap">
                <img src="${s.image}" alt="Portrait of ${s.alias}" loading="lazy">
                <span class="photo-scanline" aria-hidden="true"></span>
              </div>
              <span class="photo-index">${String(logical+1).padStart(2,'0')}</span>
              <span class="photo-label">${s.alias}</span>
              <span class="photo-caption">STUDENT / 2026</span>
              <span class="photo-corner photo-corner-tl" aria-hidden="true"></span>
              <span class="photo-corner photo-corner-tr" aria-hidden="true"></span>
              <span class="photo-corner photo-corner-bl" aria-hidden="true"></span>
              <span class="photo-corner photo-corner-br" aria-hidden="true"></span>
            `;

        photoPanel.appendChild(card);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => card.classList.add('visible'));
        });

        photoTimer = setTimeout(() => {
            photoPanel.querySelectorAll('.photo-card:not(:last-child)').forEach(c => c.remove());
        }, 200);

        const img = $('img', card);
        img?.addEventListener('error', () => {
            img.style.display = 'none';
            card.insertAdjacentHTML('beforeend',
                `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;letter-spacing:1px;opacity:.35">${s.alias}</span>`
                );
        }, { once: true });
    }

    function updateInfo(logical, domIndex) {
        if (logical === currentLogical && els[domIndex]?.classList.contains('active')) return;

        const old = currentLogical;
        const dir = old < 0 ? 1 : (logical > old ? 1 : -1);
        currentLogical = logical;
        currentDom = domIndex;

        els.forEach((el, i) => el.classList.toggle('active', i === domIndex));

        const s = students[logical];
        counter.textContent = String(logical + 1).padStart(2, '0');

        infoContent?.classList.remove('visible');
        if (updateTimer) clearTimeout(updateTimer);

        updateTimer = setTimeout(() => {
            if (logical !== currentLogical || domIndex !== currentDom) return;
            if (infoNumber) infoNumber.textContent = `${String(logical+1).padStart(2,'0')} / CLASS C`;
            if (infoName) infoName.textContent = s.alias;
            if (infoDescription) infoDescription.textContent = s.description;
            if (infoRole) infoRole.textContent = s.role;
            photoCard(logical, dir);
            requestAnimationFrame(() => infoContent?.classList.add('visible'));
        }, 120);
    }

    const FADE_RANGE = 0.92;
    const MIN_SCALE = 0.58;
    const MAX_SCALE = 1;
    const MIN_OPACITY = 0.08;
    const MAX_OPACITY = 1;
    const MAX_BLUR = 7;
    const MAX_PARALLAX = 0.06;

    function detectAndAnimate() {
        if (isPortrait()) return;

        const half = viewportH / 2;
        const maxDist = Math.max(1, half * FADE_RANGE);

        let bestIdx = 0;
        let bestDist = Infinity;

        const len = els.length;
        for (let i = 0; i < len; i++) {
            const pos = positions[i];
            if (!pos) continue;
            const center = pos.top + pos.height / 2 - smooth;
            const d = Math.abs(center - half);
            if (d < bestDist) { bestDist = d;
                bestIdx = i; }
        }

        for (let i = 0; i < len; i++) {
            const pos = positions[i];
            if (!pos) continue;
            const center = pos.top + pos.height / 2 - smooth;
            const d = Math.abs(center - half);
            const lin = Math.min(d / maxDist, 1);
            const p = 1 - smoothstep(lin);

            const el = els[i];
            const scale = MIN_SCALE + p * (MAX_SCALE - MIN_SCALE);
            const opacity = MIN_OPACITY + p * (MAX_OPACITY - MIN_OPACITY);
            const blur = MAX_BLUR * (1 - p);
            const y = (center - half) * -MAX_PARALLAX;

            el.style.setProperty('--name-scale', scale.toFixed(3));
            el.style.setProperty('--name-opacity', opacity.toFixed(3));
            el.style.setProperty('--name-blur', `${blur.toFixed(2)}px`);
            el.style.setProperty('--name-y', `${y.toFixed(2)}px`);
        }

        const logical = Number(els[bestIdx].dataset.index);
        currentDom = bestIdx;
        if (currentLogical !== logical) {
            updateInfo(logical, bestIdx);
        } else {
            els.forEach((el, i) => el.classList.toggle('active', i === bestIdx));
        }

        hint?.classList.toggle('hidden', smooth > 30);
    }

    function recenter() {
        if (!setHeight || !Number.isFinite(setHeight) || setHeight < 1) return;
        const minSafe = setHeight * 0.55;
        const maxSafe = setHeight * 2.45;
        let changed = false;
        while (smooth < minSafe) { smooth += setHeight;
            target += setHeight;
            changed = true; }
        while (smooth > maxSafe) { smooth -= setHeight;
            target -= setHeight;
            changed = true; }
        if (changed) viewport.scrollTop = smooth;
    }

    function frame() {
        rafId = null;
        let keepGoing = false;

        if (animating) {
            const diff = target - smooth;
            if (Math.abs(diff) < 0.3) {
                smooth = target;
                animating = false;
            } else {
                smooth += diff * 0.12;
                keepGoing = true;
            }
            viewport.scrollTop = smooth;
        } else if (autoScrolling) {
            smooth += 0.4;
            viewport.scrollTop = smooth;
            keepGoing = true;
        } else {
            smooth = viewport.scrollTop;
        }

        recenter();
        detectAndAnimate();

        if (keepGoing) rafId = requestAnimationFrame(frame);
    }

    function ensureLoop() {
        if (rafId === null) rafId = requestAnimationFrame(frame);
    }

    function stopAutoScroll() {
        autoScrolling = false;
    }

    function startAutoCycle() {
        stopAutoCycle();
        if (!isPortrait()) return;
        autoCycleInterval = setInterval(() => {
            const next = (currentLogical + 1) % n;
            go(next, null, false);
        }, 4000);
    }

    function stopAutoCycle() {
        if (autoCycleInterval) {
            clearInterval(autoCycleInterval);
            autoCycleInterval = null;
        }
    }

    function interruptAutoPlay() {
        stopAutoScroll();
        stopAutoCycle();
    }

    function go(logical, el = null, fromUser = true) {
        if (fromUser) {
            interruptAutoPlay();
        }
        const idx = ((logical % n) + n) % n;
        let chosen = el;

        if (!chosen) {
            const start = currentDom >= 0 ? currentDom : n;
            let desired = start + 0;
            if (fromUser && el === null) {
                let best = null,
                    bd = Infinity;
                els.forEach((e, j) => {
                    if (Number(e.dataset.index) !== idx) return;
                    const d = Math.abs(j - start);
                    if (d < bd) { bd = d;
                        best = e; }
                });
                chosen = best;
            } else {
                const candidates = els.filter(e => Number(e.dataset.index) === idx);
                if (candidates.length) chosen = candidates[0];
            }
        }

        if (!chosen) return;
        const domIdx = els.indexOf(chosen);
        currentDom = domIdx;
        if (!isPortrait()) {
            target = centerTarget(chosen);
            animating = true;
            ensureLoop();
        } else {
            updateInfo(idx, domIdx);
            els.forEach((el, i) => el.classList.toggle('active', i === domIdx));
        }
        chosen.focus({ preventScroll: true });
    }

    function goIndex(idx, fromUser = true) {
        go(idx, null, fromUser);
    }

    viewport.addEventListener('scroll', () => {
        if (!animating && !autoScrolling) {
            target = viewport.scrollTop;
            smooth = target;
            ensureLoop();
        }
    }, { passive: true });

    document.addEventListener('wheel', interruptAutoPlay, { passive: true });
    document.addEventListener('mousedown', interruptAutoPlay, { passive: true });
    document.addEventListener('touchstart', interruptAutoPlay, { passive: true });
    document.addEventListener('keydown', interruptAutoPlay, { passive: true });

    document.addEventListener('keydown', e => {
        if (body.classList.contains('menu-open')) return;
        if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(e.key)) return;
        e.preventDefault();
        interruptAutoPlay();
        const direction = (e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : -1;
        const page = e.key === 'PageDown' || e.key === 'PageUp';
        if (isPortrait()) {
            goIndex(currentLogical + direction, true);
        } else {
            const step = page ? Math.max(1, Math.floor(viewport.clientHeight / Math.max(1, (els[n]?.offsetHeight ||
                70)))) : 1;
            let dom = currentDom >= 0 ? currentDom : n;
            let desired = dom + direction * step;
            if (desired < 0) desired += n * copies;
            if (desired >= els.length) desired -= n * copies;
            desired = clamp(desired, 0, els.length - 1);
            const chosen = els[desired];
            if (chosen) {
                currentDom = els.indexOf(chosen);
                target = centerTarget(chosen);
                animating = true;
                ensureLoop();
                chosen.focus({ preventScroll: true });
            }
        }
    }, { passive: false });

    let touchStartX = 0,
        touchStartY = 0;
    const photoPanelEl = photoPanel;
    photoPanelEl.addEventListener('touchstart', e => {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
    }, { passive: true });

    photoPanelEl.addEventListener('touchmove', e => {
        e.preventDefault();
    }, { passive: false });

    photoPanelEl.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            interruptAutoPlay();
            if (dx > 0) {
                goIndex(currentLogical - 1, true);
            } else {
                goIndex(currentLogical + 1, true);
            }
        }
    }, { passive: true });

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            interruptAutoPlay();
            goIndex(currentLogical - 1, true);
        });
        nextBtn.addEventListener('click', () => {
            interruptAutoPlay();
            goIndex(currentLogical + 1, true);
        });
    }

    const onResize = () => {
        measure();
        if (!isPortrait()) {
            target = clamp(target);
            ensureLoop();
        } else {
            if (currentLogical >= 0) {
            }
        }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => {
        setTimeout(onResize, 300);
    });

    measure();
    const initScroll = () => {
        const first = els[n];
        if (first) {
            if (!isPortrait()) {
                target = centerTarget(first);
                smooth = target;
                viewport.scrollTop = target;
                currentDom = n;
                detectAndAnimate();
            } else {
                go(0, first, true);
            }
        }
    };

    window.addEventListener('load', initScroll);
    if (document.readyState === 'complete') {
        setTimeout(initScroll, 80);
    } else {
        setTimeout(initScroll, 150);
    }

    const fine = matchMedia('(hover:hover) and (pointer:fine) and (min-width:901px)').matches;
    if (fine) {
        const cursor = document.createElement('div');
        cursor.className = 'site-cursor';
        cursor.innerHTML = '<span class="cursor-label"></span>';
        body.appendChild(cursor);
        const label = $('.cursor-label', cursor);
        let mx = window.innerWidth / 2,
            my = window.innerHeight / 2,
            x = mx,
            y = my,
            hover = false;

        window.addEventListener('mousemove', e => { mx = e.clientX;
            my = e.clientY;
            cursor.classList.add('is-visible'); }, { passive: true });

        document.addEventListener('mouseover', e => {
            const el = e.target.closest?.('a, button, .student, .student-name, [data-hover]');
            if (!el) return;
            hover = true;
            cursor.classList.add('is-hovering', 'has-label');
            if (label) {
                label.textContent = el.dataset.hover ||
                    ((el.classList.contains('student') || el.classList.contains('student-name')) ?
                        'VIEW' :
                        el.matches('button') ? 'CLICK' : 'OPEN');
            }
        });
        document.addEventListener('mouseout', e => {
            const el = e.target.closest?.('a, button, .student, .student-name, [data-hover]');
            if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
            hover = false;
            cursor.classList.remove('is-hovering', 'has-label');
            if (label) label.textContent = '';
        });

        const tick = () => {
            const k = hover ? 0.3 : 0.2;
            x += (mx - x) * k;
            y += (my - y) * k;
            cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(tick);
        };
        tick();
    }

    if (playButton && audioEl) {
        const playText = $('.play-text', playButton);
        const playIcon = $('.play-icon', playButton);

        playButton.addEventListener('click', async () => {
            try {
                if (audioEl.paused) {
                    await audioEl.play();
                    playButton.classList.add('playing', 'is-playing');
                    if (playText) playText.textContent = 'PLAYING';
                    if (playIcon) playIcon.textContent = '❚❚';
                    if (isPortrait()) {
                        startAutoCycle();
                    } else {
                        autoScrolling = true;
                        ensureLoop();
                    }
                } else {
                    audioEl.pause();
                    playButton.classList.remove('playing', 'is-playing');
                    if (playText) playText.textContent = 'PLAY SONG';
                    if (playIcon) playIcon.textContent = '▶';
                    stopAutoScroll();
                    stopAutoCycle();
                }
            } catch (err) {
                console.warn('Music play error:', err);
                if (playText) playText.textContent = 'SONG ERROR';
            }
        });

        audioEl.addEventListener('ended', () => {
            playButton.classList.remove('playing', 'is-playing');
            if (playText) playText.textContent = 'PLAY SONG';
            if (playIcon) playIcon.textContent = '▶';
            stopAutoScroll();
            stopAutoCycle();
        });

        audioEl.addEventListener('error', () => {
            console.warn('Audio error:', audioEl.currentSrc);
            if (playText) playText.textContent = 'AUDIO ERROR';
        });
    }

    body.classList.add('page-loaded');
})();
