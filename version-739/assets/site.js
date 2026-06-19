(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var category = document.querySelector('[data-filter-category]');
        var year = document.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
        var empty = document.querySelector('[data-empty-state]');
        if (!cards.length || (!input && !category && !year)) {
            return;
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var catValue = normalize(category ? category.value : '');
            var yearValue = normalize(year ? year.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okCategory = !catValue || normalize(card.getAttribute('data-category')) === catValue;
                var okYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var ok = okKeyword && okCategory && okYear;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    window.setupPlayer = function (src) {
        var video = document.querySelector('.js-video');
        var cover = document.querySelector('.player-cover');
        var button = document.querySelector('.player-button');
        var started = false;
        var hls = null;

        if (!video || !src) {
            return;
        }

        function begin() {
            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                video.setAttribute('controls', 'controls');
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', begin);
        }
        if (cover) {
            cover.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (!started) {
                begin();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupFilters();
    });
})();
