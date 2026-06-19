(function () {
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    function setupNavigation() {
        const toggle = $('[data-nav-toggle]');
        const nav = $('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        const slides = $$('[data-hero-slide]');
        const dots = $$('[data-hero-dot]');
        const prev = $('[data-hero-prev]');
        const next = $('[data-hero-next]');
        if (!slides.length) {
            return;
        }

        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        const container = $('[data-card-container]');
        const cards = $$('[data-movie-card]');
        if (!container || !cards.length) {
            return;
        }

        const searchInput = $('[data-search-input]');
        const regionSelect = $('[data-filter-region]');
        const yearSelect = $('[data-filter-year]');
        const sortSelect = $('[data-sort-select]');
        const count = $('[data-filter-count]');

        const urlParams = new URLSearchParams(window.location.search);
        const queryFromUrl = urlParams.get('q');
        if (queryFromUrl && searchInput) {
            searchInput.value = queryFromUrl;
        }

        function matchesYear(card, value) {
            if (!value || value === 'all') {
                return true;
            }
            const year = Number(card.dataset.year || 0);
            if (value === 'before2020') {
                return year > 0 && year < 2020;
            }
            return String(year) === value;
        }

        function apply() {
            const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
            const region = regionSelect ? regionSelect.value : 'all';
            const year = yearSelect ? yearSelect.value : 'all';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.year
                ].join(' ').toLowerCase();
                const queryOk = !query || haystack.includes(query);
                const regionOk = region === 'all' || card.dataset.region === region;
                const yearOk = matchesYear(card, year);
                const show = queryOk && regionOk && yearOk;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部';
            }
        }

        function sortCards() {
            const mode = sortSelect ? sortSelect.value : 'year-desc';
            const sorted = cards.slice().sort(function (a, b) {
                if (mode === 'score-desc') {
                    return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                }
                if (mode === 'hot-desc') {
                    return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
                }
                if (mode === 'title-asc') {
                    return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });
            sorted.forEach(function (card) {
                container.appendChild(card);
            });
            apply();
        }

        [searchInput, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', sortCards);
        }

        sortCards();
        apply();
    }

    function setupPlayer() {
        const video = $('#movie-player');
        const button = $('[data-player-start]');
        const status = $('[data-player-status]');
        if (!video || !button) {
            return;
        }

        const source = video.dataset.videoSrc;

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function startPlayback() {
            if (!source) {
                setStatus('当前页面没有可用的视频源。');
                return;
            }

            button.classList.add('hidden');
            setStatus('正在初始化视频播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        setStatus('播放器已加载，请点击视频控件继续播放。');
                    });
                    setStatus('播放器已就绪。');
                });
                hls.on(window.Hls.Events.ERROR, function (_event, data) {
                    if (data && data.fatal) {
                        setStatus('视频加载遇到问题，请稍后重试或更换浏览器。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {
                        setStatus('播放器已加载，请点击视频控件继续播放。');
                    });
                }, { once: true });
                setStatus('播放器已就绪。');
            } else {
                setStatus('当前浏览器不支持 HLS 播放。');
            }
        }

        button.addEventListener('click', startPlayback);
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
