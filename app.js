document.addEventListener('DOMContentLoaded', function () {

    // ========== CAROUSEL (index page only) ==========
    var nextBtn = document.querySelector('.next');
    var prevBtn = document.querySelector('.prev');
    var carousel = document.querySelector('.carousel');
    var carouselList = document.querySelector('.carousel .list');
    var runningTime = document.querySelector('.carousel .timeRunning');

    if (nextBtn && prevBtn && carousel && carouselList && runningTime) {
        var timeRunning = 3000;
        var timeAutoNext = 7000;
        var runTimeOut;
        var runNextAuto = setTimeout(function () { nextBtn.click(); }, timeAutoNext);

        function resetTimeAnimation() {
            runningTime.style.animation = 'none';
            runningTime.offsetHeight; // trigger reflow
            runningTime.style.animation = 'runningTime 7s linear 1 forwards';
        }

        function showSlider(type) {
            var sliderItems = carouselList.querySelectorAll('.item');
            if (type === 'next') {
                carouselList.appendChild(sliderItems[0]);
                carousel.classList.add('next');
            } else {
                carouselList.prepend(sliderItems[sliderItems.length - 1]);
                carousel.classList.add('prev');
            }
            clearTimeout(runTimeOut);
            runTimeOut = setTimeout(function () {
                carousel.classList.remove('next');
                carousel.classList.remove('prev');
            }, timeRunning);
            clearTimeout(runNextAuto);
            runNextAuto = setTimeout(function () { nextBtn.click(); }, timeAutoNext);
            resetTimeAnimation();
        }

        nextBtn.onclick = function () { showSlider('next'); };
        prevBtn.onclick = function () { showSlider('prev'); };
        resetTimeAnimation();
    }

    // ========== MOBILE DRAWER ==========
    var menuToggleBtn = document.querySelector('.menu-toggle');
    var mobileDrawer = document.querySelector('.mobile-drawer');
    var drawerCloseEls = document.querySelectorAll('[data-drawer-close]');
    var drawerLinks = document.querySelectorAll('[data-drawer-link]');

    function setDrawerOpen(isOpen) {
        document.body.classList.toggle('drawer-open', isOpen);
        if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
        if (mobileDrawer) mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
    }

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', function () {
            setDrawerOpen(!document.body.classList.contains('drawer-open'));
        });
    }
    drawerCloseEls.forEach(function (el) { el.addEventListener('click', function () { setDrawerOpen(false); }); });
    drawerLinks.forEach(function (a) { a.addEventListener('click', function () { setDrawerOpen(false); }); });

    // ========== PRODUCT DATA ==========
    var wholesaleDescription = "Bulk non\u2011woven bags supplied at wholesale rates. Ideal for supermarkets, garment stores and large promotional events.";
    var retailDescription = "Premium non\u2011woven bags sold in smaller quantities, perfect for gifting, boutiques and daily shopping.";

    var commonSpecs = [
        "Material: 100% non\u2011woven polypropylene",
        "GSM range: 60\u2013120 (customisable)",
        "Sizes: customizable",
        "Printing: Custom logo & full\u2011colour design"
    ];

    var commonFeatures = [
        'Available Colours: \
    <span class="color" style="background:red;"></span> \
    <span class="color" style="background:blue;"></span> \
    <span class="color" style="background:green;"></span> \
    <span class="color" style="background:yellow;"></span>\
     <span >& More</span>',

        "Eco\u2011friendly & reusable",
        "High weight\u2011carrying capacity",
        "Soft, comfortable handles"
    ];

    var products = {
        1: { title: "D-CUT Bags (Wholesale)", price: "Customize Your Bags", description: wholesaleDescription, images: ["img/p11.jpg", "img/p12.jpg", "img/p13.jpg", "img/p14.jpg"], specs: commonSpecs, features: commonFeatures },
        2: { title: "Box Bags (Wholesale)", price: "Customize Your Bags", description: wholesaleDescription, images: ["img/p21.jpg", "img/p22.jpg", ], specs: commonSpecs, features: commonFeatures },
        3: { title: "Loop Handle Bags (Wholesale)", price: "Customize Your Bags", description: wholesaleDescription, images: ["img/p31.jpg", "img/p32.jpg", "img/p33.jpg"], specs: commonSpecs, features: commonFeatures },
        4: { title: "W-CUT Bags (Wholesale)", price: "Customize Your Bags", description: wholesaleDescription, images: ["img/p41.jpg", "img/p42.jpg", "img/p43.jpg", "img/p44.jpg"], specs: commonSpecs, features: commonFeatures },
        5: { title: "Fabric (Wholesale)", price: "Customize Your Bags", description: wholesaleDescription, images: ["img/fab1.jpg", "img/fab2.jpg", "img/fab3.jpg", "img/fab4.jpg"], specs: commonSpecs, features: commonFeatures },
        6: { title: "Cutting Material (Wholesale)", price: "Customize Your Bags", description: wholesaleDescription, images: ["img/cut.jpg"], features: commonFeatures },
        16: { title: "Shopping Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/p51.jpg", "img/p52.jpg", "img/p53.jpg"], specs: commonSpecs, features: commonFeatures },
        17: { title: "Brand Promotion Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/p32.jpg", "img/brand2.jpg", "img/brand3.jpg"], specs: commonSpecs, features: commonFeatures },
        18: { title: "Corporate Gifting Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/p21.jpg"], specs: commonSpecs, features: commonFeatures },
        19: { title: "Exhibition Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/ex1.jpg"], specs: commonSpecs, features: commonFeatures },
        20: { title: "Food Packaging Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/food.jpg", "img/food2.jpg", "img/p41.jpg"], specs: commonSpecs, features: commonFeatures },
        21: { title: "Events Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/eve1.jpg", "img/eve2.jpg", "img/eve3.jpg"], specs: commonSpecs, features: commonFeatures },
        22: { title: "Retail Stores Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/re1.jpg", "img/re2.jpg", "img/re3.jpg", "img/re4.jpg"], specs: commonSpecs, features: commonFeatures },
        23: { title: "Sweet Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/sw1.jpg", "img/sw2.jpg", "img/sw3.jpg"], specs: commonSpecs, features: commonFeatures },
        24: { title: "Cake Industry Bags", price: "Customize Your Bags", description: retailDescription, images: ["img/ca1.jpg", "img/sw2.jpg", "img/sw1.jpg"], specs: commonSpecs, features: commonFeatures },
    };

    // ========== MODAL ==========
    var modal = document.getElementById('productModal');
    var closeBtn = document.querySelector('.close-btn');

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (document.body.classList.contains('drawer-open')) setDrawerOpen(false);
            if (modal && modal.style.display === 'block') closeModal();
        }
    });

    // ========== SHOW PRODUCT DETAILS ==========
    function showProductDetails(productId) {
        if (!modal) return;

        var product = products[productId];
        if (!product) {
            console.warn('Product not found for id:', productId);
            return;
        }

        var title = product.title || 'Product';
        var price = product.price || '';
        var description = (product.description && product.description.trim())
            ? product.description
            : 'Description not available yet. Contact us for more details.';

        var rawImages = product.images || [];
        var images = rawImages.length > 0 ? rawImages : ['img/placeholder.jpg'];
        var specs = product.specs || commonSpecs;
        var features = product.features || commonFeatures;

        var elTitle = document.getElementById('productTitle');
        var elPrice = document.getElementById('productPrice');
        var elDesc = document.getElementById('productDescription');
        var mainImg = document.getElementById('mainProductImage');

        if (elTitle) elTitle.textContent = title;
        if (elPrice) elPrice.textContent = price;
        if (elDesc) elDesc.textContent = description;
        if (mainImg) { mainImg.src = images[0]; mainImg.alt = title; }

        var thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(function (thumb, i) {
            if (images[i]) {
                thumb.src = images[i];
                thumb.alt = title + ' - View ' + (i + 1);
                thumb.style.display = 'block';
                thumb.classList.toggle('active', i === 0);
            } else {
                thumb.style.display = 'none';
            }
        });

        var thumbContainer = document.querySelector('.thumbnail-images');
        if (thumbContainer) {
            thumbContainer.onclick = function (e) {
                var clicked = e.target.closest('.thumbnail');
                if (!clicked || clicked.style.display === 'none') return;
                var idx = Array.from(thumbnails).indexOf(clicked);
                if (idx !== -1 && images[idx]) {
                    thumbnails.forEach(function (t) { t.classList.remove('active'); });
                    clicked.classList.add('active');
                    if (mainImg) mainImg.src = images[idx];
                }
            };
        }

        var specsList = document.getElementById('productSpecs');
        if (specsList) {
            specsList.innerHTML = '';
            specs.forEach(function (s) {
                var li = document.createElement('li');
                li.textContent = s;
                specsList.appendChild(li);
            });
        }

        var featuresList = document.getElementById('productFeatures');
        if (featuresList) {
            featuresList.innerHTML = '';
            features.forEach(function (f) {
                var li = document.createElement('li');
                li.innerHTML = f;
                featuresList.appendChild(li);
            });
        }

        modal.dataset.currentProductId = productId;

        // ── WhatsApp links with product keyword ──
        var waNumber = '919730567069';
        var waMsg = 'Hi, I am interested in *' + title + '* from your website. Could you please share the pricing and details?';
        var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waMsg);

        var modalWaBtn = document.getElementById('modalWhatsAppBtn');
        if (modalWaBtn) modalWaBtn.href = waUrl;

        var modalQuoteBtn = document.getElementById('modalQuoteWhatsApp');
        if (modalQuoteBtn) modalQuoteBtn.href = waUrl;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    window.showProductDetails = showProductDetails;

    // ========== ATTACH CLICK HANDLERS TO PRODUCT CARDS ==========
    function attachCardListeners() {
        document.querySelectorAll('.product-card').forEach(function (card) {
            if (card.dataset.listenerAttached) return;
            card.dataset.listenerAttached = 'true';

            card.addEventListener('click', function () {
                showProductDetails(this.getAttribute('data-product'));
            });

            var btn = card.querySelector('.view-details-btn');
            if (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    showProductDetails(card.getAttribute('data-product'));
                });
            }
        });
    }

    attachCardListeners();

    // ========== PRODUCT SEARCH ==========
    (function () {
        var searchInput = document.getElementById('product-search-input');
        var searchClear = document.getElementById('product-search-clear');
        var noResultsEl = document.getElementById('product-search-no-results');
        var searchQueryEl = document.getElementById('product-search-query');
        if (!searchInput || !noResultsEl) return;

        var sections = document.querySelectorAll('.products-section');
        var subsectionTitles = document.querySelectorAll('.products-subsection-title');
        var mainTitles = document.querySelectorAll('.products-section-title');

        function updateVisibility() {
            var term = (searchInput.value || '').trim().toLowerCase();
            if (searchClear) searchClear.classList.toggle('visible', term.length > 0);

            if (!term) {
                noResultsEl.classList.remove('visible');
                sections.forEach(function (s) { s.classList.remove('search-hidden'); });
                subsectionTitles.forEach(function (t) { t.classList.remove('search-hidden'); });
                mainTitles.forEach(function (t) { t.classList.remove('search-hidden'); });
                return;
            }

            var anyVisible = false;
            sections.forEach(function (section) {
                var sectionVisible = false;
                section.querySelectorAll('.product-card[data-search]').forEach(function (card) {
                    var searchAttr = (card.getAttribute('data-search') || '').toLowerCase();
                    var name = (card.querySelector('h3') && card.querySelector('h3').textContent) || '';
                    var match = searchAttr.includes(term) || name.toLowerCase().includes(term);
                    card.classList.toggle('search-hidden', !match);
                    if (match) { sectionVisible = true; anyVisible = true; }
                });
                section.classList.toggle('search-hidden', !sectionVisible);
            });

            subsectionTitles.forEach(function (h3) {
                var next = h3.nextElementSibling;
                h3.classList.toggle('search-hidden', !next || next.classList.contains('search-hidden'));
            });

            mainTitles.forEach(function (h2, i) {
                if (i === 0) {
                    var ws = document.querySelector('.products-section[data-section="wholesale"]');
                    h2.classList.toggle('search-hidden', ws && ws.classList.contains('search-hidden'));
                } else {
                    var rtSections = document.querySelectorAll('.products-section[data-section="retail"]');
                    var anyRetail = Array.from(rtSections).some(function (s) { return !s.classList.contains('search-hidden'); });
                    h2.classList.toggle('search-hidden', !anyRetail);
                }
            });

            if (searchQueryEl) searchQueryEl.textContent = searchInput.value.trim();
            noResultsEl.classList.toggle('visible', !anyVisible);
        }

        window._refreshProductSearch = updateVisibility;
        searchInput.addEventListener('input', updateVisibility);
        searchInput.addEventListener('keyup', updateVisibility);
        if (searchClear) {
            searchClear.addEventListener('click', function () {
                searchInput.value = '';
                searchInput.focus();
                updateVisibility();
            });
        }
    })();


    // NOTE: The "Special Offers" grid (#offersGrid) is loaded by
    // sale_hero.js, which also drives the sale ticker + hero carousel
    // from the same data source. Do not duplicate that logic here —
    // keep offers data/rendering changes in sale_hero.js only.

}); // end DOMContentLoaded
