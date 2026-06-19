(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    $all('[data-filter-scope]').forEach(function (scope) {
      var input = $('[data-filter-input]', scope);
      var year = $('[data-filter-year]', scope);
      var type = $('[data-filter-type]', scope);
      var section = scope.nextElementSibling || document;
      var grid = $('[data-filter-grid]', section) || $('[data-filter-grid]');
      var empty = $('[data-empty-state]', section) || $('[data-empty-state]');
      if (!grid) {
        return;
      }
      var cards = $all('[data-card]', grid);

      function run() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
          var okType = !selectedType || card.getAttribute('data-type') === selectedType;
          var visible = okKeyword && okYear && okType;
          card.style.display = visible ? '' : 'none';
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', shown === 0);
        }
      }

      [input, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener('input', run);
          el.addEventListener('change', run);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }
      run();
    });
  }

  function initPlayer() {
    var player = $('[data-player]');
    if (!player) {
      return;
    }
    var video = $('video', player);
    var button = $('[data-player-button]', player);
    var src = player.getAttribute('data-src');
    var attached = false;

    function attach() {
      if (attached || !video || !src) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
      attach();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
}());
