(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = qsa('[data-hero-slide]');
        var thumbs = qsa('[data-hero-thumb]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        qsa('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        });

        qsa('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var next = Number(thumb.getAttribute('data-hero-thumb')) || 0;
                show(next);
                start();
            });
        });

        start();
    }

    function setupFilters() {
        var input = qs('[data-filter-input]');
        var list = qs('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var items = qsa('[data-title]', list);
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            items.forEach(function (item) {
                var text = [
                    item.getAttribute('data-title'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-genre'),
                    item.getAttribute('data-region'),
                    item.textContent
                ].join(' ').toLowerCase();
                item.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    function setupImageFallback() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.style.display = 'none';
                var shell = img.closest('.poster-shell, .hero-bg, .category-card');
                if (shell) {
                    shell.classList.add('no-image');
                }
            });
        });
    }

    function setupPlayers() {
        qsa('video[data-play-src]').forEach(function (video) {
            var source = video.getAttribute('data-play-src');
            var card = video.closest('.player-card');
            var button = card ? qs('[data-play-button]', card) : null;
            var ready = false;

            function prepare() {
                if (ready || !source) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                ready = true;
            }

            function play() {
                prepare();
                var result = video.play();
                if (result && result.catch) {
                    result.catch(function () {});
                }
            }

            video.addEventListener('play', function () {
                if (card) {
                    card.classList.add('playing');
                }
            });

            video.addEventListener('pause', function () {
                if (card) {
                    card.classList.remove('playing');
                }
            });

            video.addEventListener('click', prepare);

            if (button) {
                button.addEventListener('click', play);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupImageFallback();
        setupPlayers();
    });
})();
