(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var searchForms = document.querySelectorAll('[data-filter-form]');
    searchForms.forEach(function (form) {
        var scopeSelector = form.getAttribute('data-filter-form');
        var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
        var noResults = scope ? scope.querySelector('.no-results') : null;
        var inputs = Array.prototype.slice.call(form.querySelectorAll('input, select'));
        var run = function () {
            var keyword = (form.querySelector('[name="keyword"]') || {}).value || '';
            var year = (form.querySelector('[name="year"]') || {}).value || '';
            var region = (form.querySelector('[name="region"]') || {}).value || '';
            var type = (form.querySelector('[name="type"]') || {}).value || '';
            keyword = keyword.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.textContent].join(' ').toLowerCase();
                var ok = true;
                if (keyword && haystack.indexOf(keyword) === -1) ok = false;
                if (year && card.dataset.year !== year) ok = false;
                if (region && card.dataset.region !== region) ok = false;
                if (type && card.dataset.type !== type) ok = false;
                card.style.display = ok ? '' : 'none';
                if (ok) shown += 1;
            });
            if (noResults) {
                noResults.style.display = shown ? 'none' : 'block';
            }
        };
        inputs.forEach(function (input) {
            input.addEventListener('input', run);
            input.addEventListener('change', run);
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            run();
        });
    });
})();

function initMoviePlayer(videoId, coverId, sourceUrl) {
    var wrap = document.getElementById(videoId + '-wrap');
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!wrap || !video || !cover || !sourceUrl) return;
    var started = false;
    var start = function () {
        if (started) {
            video.play();
            return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.addEventListener('loadedmetadata', function () {
                video.play();
            }, { once: true });
            video.load();
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });
        } else {
            video.src = sourceUrl;
            video.play();
        }
        wrap.classList.add('is-playing');
    };
    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            video.play();
        }
    });
}
