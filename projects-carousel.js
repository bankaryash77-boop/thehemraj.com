/**
 * projects-carousel.js — "Our Work" project carousel
 * Self-contained, vanilla JS (no framework/dependencies).
 * Works with any number of .projects-carousel instances on a page.
 *
 * Structure it expects (see projects-carousel.css for styling):
 *   .projects-section > .projects-container
 *     > .projects-carousel[data-projects-carousel]
 *         > .projects-arrow.projects-arrow-prev
 *         > .projects-viewport > .projects-track > .projects-card (x N)
 *         > .projects-arrow.projects-arrow-next
 *     > .projects-dots[data-projects-dots]
 */
(function () {
    'use strict';

    function initCarousel(root) {
        var container = root.closest('.projects-container');
        var viewport = root.querySelector('.projects-viewport');
        var track = root.querySelector('.projects-track');
        var cards = Array.prototype.slice.call(track.children);
        var prevBtn = root.querySelector('.projects-arrow-prev');
        var nextBtn = root.querySelector('.projects-arrow-next');
        var dotsWrap = container ? container.querySelector('[data-projects-dots]') : null;

        if (!container || !viewport || !track || cards.length === 0) return;

        var total = cards.length;
        var index = 0;           // first fully-visible card's index
        var cardsPerView = 3;
        var gap = 24;
        var bleed = 72;
        var cardWidth = 320;
        var dots = [];

        function readCssNumber(varName, fallback) {
            var raw = getComputedStyle(root.closest('.projects-section')).getPropertyValue(varName);
            var n = parseFloat(raw);
            return isNaN(n) ? fallback : n;
        }

        function measure() {
            cardsPerView = Math.round(readCssNumber('--projects-cards-per-view', 3));
            gap = readCssNumber('--projects-gap', 24);
            bleed = readCssNumber('--projects-bleed', 72);

            var innerWidth = container.clientWidth; // blue panel's own width
            cardWidth = (innerWidth - gap * (cardsPerView - 1)) / cardsPerView;
            if (cardWidth < 160) cardWidth = 160; // sane floor

            var section = root.closest('.projects-section');
            section.style.setProperty('--projects-card-w', cardWidth + 'px');
        }

        function maxIndex() {
            return Math.max(0, total - cardsPerView);
        }

        function clampIndex(i) {
            return Math.min(Math.max(i, 0), maxIndex());
        }

        function goTo(i, animate) {
            index = clampIndex(i);
            var offset = bleed - index * (cardWidth + gap);
            if (animate === false) {
                track.classList.add('projects-no-transition');
            } else {
                track.classList.remove('projects-no-transition');
            }
            track.style.transform = 'translateX(' + offset + 'px)';
            // force reflow so the no-transition class actually applies before re-enabling
            if (animate === false) {
                // eslint-disable-next-line no-unused-expressions
                track.offsetHeight;
                track.classList.remove('projects-no-transition');
            }
            updateControls();
        }

        function buildDots() {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = '';
            dots = [];
            var pages = Math.max(1, Math.ceil(total / cardsPerView));
            for (var p = 0; p < pages; p++) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'projects-dot';
                dot.setAttribute('aria-label', 'Go to slide ' + (p + 1));
                (function (pageIndex) {
                    dot.addEventListener('click', function () {
                        goTo(clampIndex(pageIndex * cardsPerView), true);
                    });
                })(p);
                dotsWrap.appendChild(dot);
                dots.push(dot);
            }
        }

        function updateControls() {
            if (prevBtn) prevBtn.disabled = index <= 0;
            if (nextBtn) nextBtn.disabled = index >= maxIndex();

            if (dots.length) {
                var pages = dots.length;
                var activePage = Math.min(pages - 1, Math.round(index / cardsPerView));
                dots.forEach(function (d, i) {
                    d.classList.toggle('projects-dot-active', i === activePage);
                });
            }
        }

        function rebuild() {
            var prevCardsPerView = cardsPerView;
            var prevDotCount = dots.length;
            measure();
            var newPages = Math.max(1, Math.ceil(total / cardsPerView));
            if (cardsPerView !== prevCardsPerView || dots.length !== newPages || prevDotCount === 0) {
                buildDots();
            }
            goTo(index, false);
        }

        // ── Arrow navigation ──
        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                goTo(index - 1, true);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                goTo(index + 1, true);
            });
        }

        // ── Keyboard navigation when carousel has focus ──
        root.setAttribute('tabindex', '0');
        root.setAttribute('role', 'region');
        root.setAttribute('aria-roledescription', 'carousel');
        root.setAttribute('aria-label', 'Our work projects');
        root.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { goTo(index + 1, true); e.preventDefault(); }
            if (e.key === 'ArrowLeft') { goTo(index - 1, true); e.preventDefault(); }
        });

        // ── Drag / swipe (mouse + touch via Pointer Events) ──
        var isDragging = false;
        var dragStartX = 0;
        var dragDeltaX = 0;
        var dragStartOffset = 0;

        function currentOffset() {
            return bleed - index * (cardWidth + gap);
        }

        function onPointerDown(e) {
            if (e.button !== undefined && e.button !== 0) return; // left click only
            isDragging = true;
            dragStartX = e.clientX;
            dragDeltaX = 0;
            dragStartOffset = currentOffset();
            track.classList.add('projects-no-transition');
            viewport.classList.add('projects-dragging');
            if (viewport.setPointerCapture && e.pointerId !== undefined) {
                try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
            }
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            dragDeltaX = e.clientX - dragStartX;
            track.style.transform = 'translateX(' + (dragStartOffset + dragDeltaX) + 'px)';
        }

        function onPointerUp() {
            if (!isDragging) return;
            isDragging = false;
            viewport.classList.remove('projects-dragging');
            track.classList.remove('projects-no-transition');

            var threshold = Math.max(40, cardWidth * 0.18);
            if (dragDeltaX <= -threshold) {
                goTo(index + 1, true);
            } else if (dragDeltaX >= threshold) {
                goTo(index - 1, true);
            } else {
                goTo(index, true); // snap back
            }
            dragDeltaX = 0;
        }

        viewport.addEventListener('pointerdown', onPointerDown);
        viewport.addEventListener('pointermove', onPointerMove);
        viewport.addEventListener('pointerup', onPointerUp);
        viewport.addEventListener('pointercancel', onPointerUp);
        viewport.addEventListener('pointerleave', function () {
            if (isDragging) onPointerUp();
        });

        // Prevent native image drag ghost from interfering
        var cardImages = track.querySelectorAll('img');
        for (var imgI = 0; imgI < cardImages.length; imgI++) {
            cardImages[imgI].addEventListener('dragstart', function (e) { e.preventDefault(); });
        }

        // ── Responsive re-measure ──
        var resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(rebuild, 150);
        });

        // ── Init ──
        measure();
        buildDots();
        goTo(0, false);
    }

    function init() {
        var roots = document.querySelectorAll('[data-projects-carousel]');
        for (var i = 0; i < roots.length; i++) {
            initCarousel(roots[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
