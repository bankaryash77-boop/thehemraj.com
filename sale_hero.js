/**
 * sale_hero.js — Sale Offers Hero Carousel + Offers Grid
 * Google Sheets CSV Integration
 *
 * SETUP INSTRUCTIONS:
 * ─────────────────────────────────────────────────────────────
 * 1. Open Google Sheets and import/paste the contents of
 *    sale_offers_template.csv (or create a new sheet with the
 *    same column headers).
 *
 * REQUIRED COLUMNS (row 1 = headers, case-insensitive):
 *   title        — Main offer headline  (required)
 *   subtitle     — Supporting text      (optional)
 *   badge        — Pill label e.g. "20% Off" (optional)
 *   image_url    — Full image URL       (required)
 *   link         — Page/anchor URL      (optional, default: products.html)
 *   discount_pct — Numeric % e.g. 20   (optional)
 *   active       — true/false to show/hide row (optional, default: true)
 *
 * 2. File → Share → Publish to web
 * 3. Select your sheet tab, choose "Comma-separated values (.csv)"
 * 4. Click "Publish" — copy the URL
 * 5. Paste it into SHEET_CSV_URL below.
 *
 * The carousel AND the offers grid below the hero are both
 * powered by the same data source automatically.
 * ─────────────────────────────────────────────────────────────
 */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────
       ↓↓↓  PASTE YOUR GOOGLE SHEETS CSV URL HERE  ↓↓↓
    ────────────────────────────────────────────────────── */
    var SHEET_CSV_URL = '';
    /* ────────────────────────────────────────────────────── */

    var AUTO_DELAY = 7000; // ms between auto-advance

    /* ── Fallback demo data shown when no sheet URL is set ── */
    var DEMO_OFFERS = [
        {
            title: 'Flat 5% Off on  Bags',
            subtitle: 'Orders above 1000 Qty— Limited period offer',
            badge: 'Get 30 Bags FREE!',
            image_url: 'img/b2.png',
            link: 'products.html',
            discount_pct: '5',
            active: 'true'
        },
        {
            title: ' 2% Off on RELIENCE Green ',
            subtitle: 'RELIENCE Green Colour of Month',
            badge: '@2% Off',
            image_url: 'img/b1.png',
            link: 'products.html',
            discount_pct: '',
            active: 'true'
        },
        {
            title: 'Free Custom Design',
            subtitle: 'On all Non-Woven Bags orders above ₹3000',
            badge: 'Free DESIGN',
            image_url: 'img/nw.png',
            link: 'products.html',
            discount_pct: '',
            active: 'true'
        },  
        {
            title: 'Retail Discount @5%',
            subtitle: 'Prumium Bags for Retailers— Limited period offer',
            badge: '@5% Off',
            image_url: 'img/ju.png',
            link: 'products.html',
            discount_pct: '20',
            active: 'true'
        }
    ];

    var FALLBACK_IMG = 'https://images.unsplash.com/photo-1644015040594-8924d3ecc0dd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920';
    var FALLBACK_THUMB = 'https://images.unsplash.com/photo-1644015040594-8924d3ecc0dd?crop=entropy&cs=srgb&fm=jpg&q=85&w=200';

    /* ════════════════════════════════════════════════════════
       UTILITIES
    ════════════════════════════════════════════════════════ */
    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function parseCSV(text) {
        var lines = text.trim().split('\n');
        if (lines.length < 2) return [];
        var headers = lines[0].split(',').map(function (h) {
            return h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_');
        });
        return lines.slice(1).map(function (line) {
            var cols = [], cur = '', inQ = false;
            for (var i = 0; i < line.length; i++) {
                var c = line[i];
                if (c === '"') { inQ = !inQ; }
                else if (c === ',' && !inQ) { cols.push(cur); cur = ''; }
                else { cur += c; }
            }
            cols.push(cur);
            var obj = {};
            headers.forEach(function (h, i) {
                obj[h] = (cols[i] || '').trim().replace(/^"|"$/g, '');
            });
            return obj;
        }).filter(function (r) {
            return String(r.active || 'true').toLowerCase() !== 'false';
        });
    }

    /* ════════════════════════════════════════════════════════
       HERO CAROUSEL STATE
    ════════════════════════════════════════════════════════ */
    var offers = [];
    var current = 0;
    var autoTimer = null;

    var elTrack    = document.getElementById('saleTrack');
    var elThumbs   = document.getElementById('saleThumbs');
    var elDots     = document.getElementById('saleDots');
    var elCounter  = document.getElementById('saleCounter');
    var elProgress = document.getElementById('saleProgress');
    var elPrev     = document.getElementById('salePrev');
    var elNext     = document.getElementById('saleNext');
    var elTicker   = document.getElementById('saleTickerTrack');

    /* ── WhatsApp link builder ── */
    var WHATSAPP_NUMBER = '919730567069'; // Update with your number
    function buildWhatsAppLink(offer) {
        var keyword = offer.title || offer.badge || 'Special Offer';
        var msg = 'Hi, I saw your offer: "' + keyword + '" on your website and would like a quote. Please share details.';
        return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    }

    /* ── Build slide HTML ── */
    function buildSlide(offer, idx) {
        var pct = parseInt(offer.discount_pct, 10) || 0;
        var eyebrow = pct
            ? 'Save ' + pct + '% &mdash; Limited Time'
            : 'Exclusive Offer &mdash; Limited Stock';
        var badgeHtml = offer.badge
            ? '<div class="sale-badge-pill"><i class="fas fa-tag"></i> ' + esc(offer.badge) + '</div>'
            : '<div class="sale-badge-pill hidden"></div>';

        var slide = document.createElement('div');
        slide.className = 'sale-slide' + (idx === 0 ? ' is-active' : '');
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-label', 'Offer ' + (idx + 1) + ' of ' + offers.length);
        slide.innerHTML = [
            '<div class="sale-slide-bg" style="background-image:url(\'' + esc(offer.image_url || FALLBACK_IMG) + '\')"></div>',
            '<div class="sale-slide-overlay"></div>',
            '<div class="sale-content">',
                '<div class="sale-eyebrow"><span class="dot"></span>' + eyebrow + '</div>',
                badgeHtml,
                '<h2 class="sale-headline">' + esc(offer.title) + '</h2>',
                '<p class="sale-subtitle">' + esc(offer.subtitle || '') + '</p>',
                '<div class="sale-actions">',
                    '<a href="' + esc(offer.link || 'products.html') + '" class="sale-btn-primary">',
                        'Grab This Deal <i class="fas fa-arrow-right"></i>',
                    '</a>',
                    '<a href="' + buildWhatsAppLink(offer) + '" class="sale-btn-secondary sale-btn-whatsapp" target="_blank" rel="noopener">',
                        '<i class="fab fa-whatsapp"></i> Get a Quote',
                    '</a>',
                '</div>',
            '</div>'
        ].join('');
        return slide;
    }

    /* ── Build thumbnail ── */
    function buildThumb(offer, idx) {
        var thumb = document.createElement('div');
        thumb.className = 'sale-thumb' + (idx === 0 ? ' is-active' : '');
        thumb.setAttribute('role', 'button');
        thumb.setAttribute('tabindex', '0');
        thumb.setAttribute('aria-label', 'Go to offer ' + (idx + 1));
        var img = document.createElement('img');
        img.src = offer.image_url || FALLBACK_THUMB;
        img.alt = offer.title || '';
        img.loading = 'lazy';
        img.onerror = function () { this.src = FALLBACK_THUMB; };
        thumb.appendChild(img);
        thumb.addEventListener('click', function () { goTo(idx); });
        thumb.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(idx); }
        });
        return thumb;
    }

    /* ── Build dot ── */
    function buildDot(idx) {
        var dot = document.createElement('button');
        dot.className = 'sale-dot' + (idx === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to offer ' + (idx + 1));
        dot.addEventListener('click', function () { goTo(idx); });
        return dot;
    }

    /* ── Initialise carousel DOM ── */
    function initCarousel(data) {
        offers = data;
        if (!elTrack) return;

        elTrack.innerHTML  = '';
        elThumbs.innerHTML = '';
        elDots.innerHTML   = '';

        data.forEach(function (offer, idx) {
            elTrack.appendChild(buildSlide(offer, idx));
            if (data.length > 1) {
                if (elThumbs) elThumbs.appendChild(buildThumb(offer, idx));
                if (elDots)   elDots.appendChild(buildDot(idx));
            }
        });

        updateCounter();
        populateTicker(data);
        restartProgress();
        startAuto();
    }

    /* ── Update visible state ── */
    function updateUI(newIdx) {
        var slideEls = elTrack  ? elTrack.querySelectorAll('.sale-slide')  : [];
        var thumbEls = elThumbs ? elThumbs.querySelectorAll('.sale-thumb') : [];
        var dotEls   = elDots   ? elDots.querySelectorAll('.sale-dot')     : [];

        slideEls.forEach(function (el, i) {
            el.classList.remove('is-active');
            if (i === newIdx) el.classList.add('is-active');
        });
        thumbEls.forEach(function (el, i) { el.classList.toggle('is-active', i === newIdx); });
        dotEls.forEach(function   (el, i) { el.classList.toggle('is-active', i === newIdx); });

        current = newIdx;
        updateCounter();
    }

    function updateCounter() {
        if (!elCounter || offers.length === 0) return;
        elCounter.innerHTML =
            '<span class="cur">' + pad2(current + 1) + '</span> / ' + pad2(offers.length);
    }
    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    /* ── Navigation ── */
    function goTo(idx) {
        if (idx === current || offers.length === 0) return;
        stopAuto();
        updateUI(idx);
        restartProgress();
        startAuto();
    }

    function goNext() { updateUI((current + 1) % offers.length); }
    function goPrev() { updateUI((current - 1 + offers.length) % offers.length); }

    function startAuto() {
        if (offers.length <= 1) return;
        stopAuto();
        autoTimer = setTimeout(function () {
            goNext();
            startAuto();
        }, AUTO_DELAY);
    }
    function stopAuto() { clearTimeout(autoTimer); }

    /* ── Progress bar ── */
    function restartProgress() {
        if (!elProgress) return;
        elProgress.classList.remove('running');
        elProgress.style.width = '0%';
        /* Force reflow */
        void elProgress.offsetWidth;
        elProgress.classList.add('running');
    }

    /* ── Arrow buttons ── */
    if (elPrev) {
        elPrev.addEventListener('click', function () {
            stopAuto(); goPrev(); restartProgress(); startAuto();
        });
    }
    if (elNext) {
        elNext.addEventListener('click', function () {
            stopAuto(); goNext(); restartProgress(); startAuto();
        });
    }

    /* ── Keyboard navigation ── */
    document.addEventListener('keydown', function (e) {
        if (!elTrack) return;
        if (e.key === 'ArrowLeft')  { stopAuto(); goPrev(); restartProgress(); startAuto(); }
        if (e.key === 'ArrowRight') { stopAuto(); goNext(); restartProgress(); startAuto(); }
    });

    /* ── Touch / swipe ── */
    (function () {
        var hero = document.querySelector('.sale-hero');
        if (!hero) return;
        var startX = 0;
        hero.addEventListener('touchstart', function (e) {
            startX = e.touches[0].clientX;
        }, { passive: true });
        hero.addEventListener('touchend', function (e) {
            var diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                stopAuto();
                if (diff > 0) goNext(); else goPrev();
                restartProgress();
                startAuto();
            }
        }, { passive: true });
    })();

    /* ── Pause on tab hidden ── */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stopAuto(); }
        else { restartProgress(); startAuto(); }
    });

    /* ════════════════════════════════════════════════════════
       TICKER
    ════════════════════════════════════════════════════════ */
    function populateTicker(data) {
        if (!elTicker) return;
        var msgs = data.map(function (o) {
            return o.badge ? o.badge + ': ' + o.title : o.title;
        });
        /* Duplicate for seamless infinite loop */
        var doubled = msgs.concat(msgs);
        elTicker.innerHTML = doubled.map(function (m) {
            return '<span>' + esc(m) + '</span>';
        }).join('');
    }

    /* ════════════════════════════════════════════════════════
       OFFERS GRID (section below the hero)
    ════════════════════════════════════════════════════════ */
    function buildOfferCard(offer) {
        var badge = offer.badge
            ? '<span class="offer-badge">' + esc(offer.badge) + '</span>'
            : '';
        return [
            '<div class="offer-card">',
                '<a href="' + esc(offer.link || 'products.html') + '" class="offer-card-link">',
                    '<div class="offer-img-wrap">',
                        '<img src="' + esc(offer.image_url) + '" alt="' + esc(offer.title) + '" loading="lazy"',
                        ' onerror="this.src=\'' + FALLBACK_THUMB + '\'">',
                        badge,
                    '</div>',
                    '<div class="offer-body">',
                        '<h3 class="offer-title">' + esc(offer.title) + '</h3>',
                        '<p class="offer-sub">' + esc(offer.subtitle || '') + '</p>',
                        '<span class="offer-cta">Grab Deal <i class="fas fa-arrow-right"></i></span>',
                    '</div>',
                '</a>',
                '<a href="' + buildWhatsAppLink(offer) + '" class="offer-whatsapp-btn" target="_blank" rel="noopener" title="Get a Quote on WhatsApp">',
                    '<i class="fab fa-whatsapp"></i> Get Quote',
                '</a>',
            '</div>'
        ].join('');
    }

    function renderOffersGrid(data) {
        var grid    = document.getElementById('offersGrid');
        var loading = document.getElementById('offersLoading');
        var error   = document.getElementById('offersError');
        if (!grid) return;

        if (loading) loading.style.display = 'none';
        if (error)   error.style.display   = 'none';

        if (!data || data.length === 0) {
            if (error) error.style.display = 'flex';
            return;
        }
        grid.innerHTML     = data.map(buildOfferCard).join('');
        grid.style.display = 'grid';
    }

    /* ════════════════════════════════════════════════════════
       BOOT — fetch sheet or use demo data
    ════════════════════════════════════════════════════════ */
    function boot() {
        if (!SHEET_CSV_URL) {
            initCarousel(DEMO_OFFERS);
            renderOffersGrid(DEMO_OFFERS);
            return;
        }
        fetch(SHEET_CSV_URL)
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(function (text) {
                var data = parseCSV(text);
                var final = data.length ? data : DEMO_OFFERS;
                initCarousel(final);
                renderOffersGrid(final);
            })
            .catch(function (err) {
                console.warn('[sale_hero] Sheet fetch failed — using demo data.', err);
                initCarousel(DEMO_OFFERS);
                renderOffersGrid(DEMO_OFFERS);
            });
    }

    boot();

})();
