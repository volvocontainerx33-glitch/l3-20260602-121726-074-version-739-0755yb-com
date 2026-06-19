(() => {
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = Math.max(0, slides.findIndex((item) => item.classList.contains("is-active")));
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle("is-active", current === index);
        dot.setAttribute("aria-current", current === index ? "true" : "false");
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, current) => {
      dot.addEventListener("click", () => {
        show(current);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        start();
      });
    }

    show(index);
    start();
  }

  const filterForm = document.querySelector("[data-filter-form]");
  const filterGrid = document.querySelector("[data-filter-grid]");
  if (filterForm && filterGrid) {
    const cards = Array.from(filterGrid.querySelectorAll(".movie-card"));
    const q = filterForm.querySelector("[name='q']");
    const category = filterForm.querySelector("[name='category']");
    const year = filterForm.querySelector("[name='year']");
    const empty = document.querySelector("[data-empty-state]");
    const params = new URLSearchParams(window.location.search);
    if (q && params.get("q")) {
      q.value = params.get("q");
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();

    const apply = () => {
      const query = normalize(q && q.value);
      const cat = normalize(category && category.value);
      const yr = normalize(year && year.value);
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.keywords
        ].join(" "));
        const okQuery = !query || haystack.includes(query);
        const okCat = !cat || normalize(card.dataset.category) === cat;
        const okYear = !yr || normalize(card.dataset.year) === yr;
        const ok = okQuery && okCat && okYear;
        card.style.display = ok ? "" : "none";
        if (ok) visible += 1;
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    };

    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      apply();
    });

    filterForm.addEventListener("input", apply);
    filterForm.addEventListener("change", apply);
    apply();
  }
})();
