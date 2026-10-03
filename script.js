/* ==========================================================================
   O.SHOP — GENERAL SCRIPTS
   --------------------------------------------------------------------------
   1.  UI injection (loader, mobile menu, scroll bar, back-to-top)
   2.  Scroll behaviour (sticky header, progress, parallax)
   3.  Scroll reveals (IntersectionObserver + stagger)
   4.  Product rendering (homepage featured grid + shop grid)
   5.  Product interactions (size chips, add to cart, wishlist)
   6.  Shop filtering + search (client side)
   7.  Contact form (front-end validation)
   ========================================================================== */
(function () {
  "use strict";

  const { PRODUCTS, CATEGORIES } = window.OSHOP;
  const { money, find, esc, icon } = window.OSHOPUtil;
  const Cart = window.OSHOPCart;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ======================================================================
     1. UI INJECTION
     ====================================================================== */
  const CROWN = `<svg viewBox="0 0 64 44" fill="currentColor" aria-hidden="true"><path d="M4 40h56v4H4zM4 38 1 8l15 10L32 2l16 16L63 8l-3 30z"/><circle cx="1" cy="6" r="3"/><circle cx="63" cy="6" r="3"/></svg>`;

  function injectUI() {
    const page = document.body.dataset.page || "home";

    /* --- page loader --- */
    if (!document.querySelector(".loader")) {
      const loader = document.createElement("div");
      loader.className = "loader";
      loader.innerHTML = `
        <div class="loader__crown">${CROWN}</div>
        <div class="loader__bar"></div>`;
      document.body.appendChild(loader);
      setTimeout(() => loader.classList.add("is-done"), 780);
    }

    /* --- scroll progress bar --- */
    if (!document.querySelector(".scroll-progress")) {
      const bar = document.createElement("div");
      bar.className = "scroll-progress";
      bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
    }

    /* --- mobile slide-in menu --- */
    if (!document.querySelector(".mobile-nav")) {
      const links = [
        { href: "index.html", label: "Home", page: "home" },
        { href: "shop.html", label: "Shop", page: "shop" },
        { href: "about.html", label: "About", page: "about" },
        { href: "contact.html", label: "Contact", page: "contact" },
      ];

      const nav = document.createElement("nav");
      nav.className = "mobile-nav";
      nav.id = "mobileNav";
      nav.setAttribute("aria-label", "Mobile menu");
      nav.innerHTML = `
        <div class="mobile-nav__scrim"></div>
        <div class="mobile-nav__panel">
          <div class="mobile-nav__head">
            <span class="mobile-nav__label">Menu</span>
            <button class="cart__close" type="button" data-menu-close aria-label="Close menu">${icon.close}</button>
          </div>
          <div class="mobile-nav__links">
            ${links.map((l, i) => `
              <a href="${l.href}"${l.page === page ? ' class="is-active" aria-current="page"' : ""}>
                ${l.label}<i>0${i + 1}</i>
              </a>`).join("")}
          </div>
          <div class="mobile-nav__foot">
            <p class="mobile-nav__slogan">Wear Better — Look Better</p>
            <a class="btn btn--gold btn--sm" href="shop.html">Shop the collection</a>
            <a class="btn btn--dark btn--sm" href="https://wa.me/212663370829" target="_blank" rel="noopener">WhatsApp us</a>
          </div>
        </div>`;
      document.body.appendChild(nav);
    }

    /* --- back to top --- */
    if (!document.querySelector(".to-top")) {
      const btn = document.createElement("button");
      btn.className = "to-top";
      btn.type = "button";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
      btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
      document.body.appendChild(btn);
    }

    /* --- footer year --- */
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

    /* --- any broken placeholder image gets the branded fallback --- */
    document.addEventListener(
      "error",
      (e) => {
        const t = e.target;
        if (t && t.tagName === "IMG" && !t.dataset.fallbackDone) {
          t.dataset.fallbackDone = "1";
          window.OSHOP.fallbackImage(t);
        }
      },
      true
    );
  }

  /* ======================================================================
     2. MOBILE MENU
     ====================================================================== */
  function initMenu() {
    const nav = $("#mobileNav");
    const burger = $("#burger");
    if (!nav || !burger) return;

    function openMenu() {
      nav.classList.add("is-open");
      burger.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      $("#scrim")?.classList.add("is-on");
      document.body.classList.add("is-locked");
    }
    function closeMenu() {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      if (!$("#cart")?.classList.contains("is-open")) {
        $("#scrim")?.classList.remove("is-on");
        document.body.classList.remove("is-locked");
      }
    }

    burger.addEventListener("click", () => {
      nav.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    nav.querySelector("[data-menu-close]").addEventListener("click", closeMenu);
    nav.querySelector(".mobile-nav__scrim").addEventListener("click", closeMenu);
    $$(".mobile-nav__links a").forEach((a) => a.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
        Cart.close();
      }
    });

    window.OSHOPCloseMenu = closeMenu;
  }

  /* ======================================================================
     3. SCROLL BEHAVIOUR
     ====================================================================== */
  function initScroll() {
    const header = $("#siteHeader");
    const progress = $(".scroll-progress");
    const toTop = $(".to-top");
    const heroArt = $(".hero__art");
    let lastY = 0;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const h = document.documentElement;

      header?.classList.toggle("is-stuck", y > 8);
      // Hide the header when scrolling down past the hero, reveal on scroll up
      if (header) {
        const hide = y > 320 && y > lastY + 4;
        const show = y < lastY - 4 || y < 200;
        header.classList.toggle("is-hidden", hide && !show);
      }
      toTop?.classList.toggle("is-on", y > 620);

      if (progress) {
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? y / max : 0;
        progress.style.transform = `scaleX(${pct})`;
        progress.classList.toggle("is-on", pct > 0.01);
      }

      // Subtle hero parallax on larger screens only
      if (heroArt && window.matchMedia("(min-width: 1000px)").matches) {
        heroArt.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
      }

      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ======================================================================
     4. SCROLL REVEALS
     ====================================================================== */
  function initReveals() {
    const els = $$(".reveal");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);        // reveal once, then stop watching
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => {
      // Auto-stagger children of a [data-stagger] container
      const parent = el.parentElement;
      if (parent?.dataset.stagger) {
        el.style.setProperty("--d", `${Array.from(parent.children).indexOf(el) * 90}ms`);
      }
      io.observe(el);
    });
  }

  /* ======================================================================
     5. HERO TYPE
     ====================================================================== */
  function splitHeroTitle() {
    $$("[data-split]").forEach((el) => {
      const text = el.dataset.split || el.textContent.trim();
      el.textContent = "";
      [...text].forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "ch" + (ch === "." ? " ch--gold" : "");
        span.textContent = ch === " " ? "\u00A0" : ch;
        span.style.animationDelay = `${0.15 + i * 0.075}s`;
        el.appendChild(span);
      });
    });
  }

  /* ======================================================================
     6. PRODUCT CARD TEMPLATE
     ====================================================================== */
  function cardHTML(p, i) {
    const tagHTML =
      p.tag === "new"
        ? `<span class="tag tag--new">New drop</span>`
        : p.tag === "premium"
        ? `<span class="tag tag--premium">Premium</span>`
        : "";

    const sizeHTML = p.sizes.length
      ? `<p class="sizes-label">Size</p>
         <div class="sizes" data-sizes>
           ${p.sizes.map((s) => `<button class="size-chip" type="button" data-size="${esc(s)}">${esc(s)}</button>`).join("")}
         </div>`
      : "";

    const priceHTML = p.oldPrice
      ? `<span class="card__price">${money(p.price)}<del>${money(p.oldPrice)}</del></span>`
      : `<span class="card__price">${money(p.price)}</span>`;

    return `
      <article class="card reveal" data-card="${esc(p.id)}" data-cat="${esc(p.cat)}" style="--d:${(i % 4) * 70}ms">
        <div class="card__media">
          <img class="card__img" src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="OSHOP.fallbackImage(this)">
          <div class="card__tags">${tagHTML}</div>
          <button class="card__fav" type="button" aria-label="Save ${esc(p.name)}" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4l1.4 1.4L12 22l7.4-7.6 1.4-1.4a5.2 5.2 0 0 0 0-7.4Z"/></svg>
          </button>
        </div>
        <div class="card__body">
          <span class="card__cat">${esc(window.OSHOPUtil.catLabel(p.cat))}</span>
          <h3 class="card__name">${esc(p.name)}</h3>
          ${priceHTML}
          ${sizeHTML}
          <button class="card__add" type="button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to cart">
            ${icon.cart}<span>Add to cart</span>
          </button>
        </div>
      </article>`;
  }

  /* ======================================================================
     7. PRODUCT GRIDS
     ====================================================================== */
  function renderGrids() {
    /* --- homepage featured --- */
    const featured = $("[data-grid-featured]");
    if (featured) {
      const limit = parseInt(featured.dataset.limit || "8", 10);
      const list = PRODUCTS.filter((p) => p.tag === "new" || p.tag === "premium").slice(0, limit);
      // Guarantee variety: top up with anything else if there aren't enough flagged items
      const rest = PRODUCTS.filter((p) => !list.includes(p));
      const chosen = [...list, ...rest].slice(0, limit);
      featured.innerHTML = chosen.map(cardHTML).join("");
    }

    /* --- homepage "new arrivals" strip (pure JS, latest first) --- */
    const arrivals = $("[data-grid-arrivals]");
    if (arrivals) {
      const limit = parseInt(arrivals.dataset.limit || "4", 10);
      arrivals.innerHTML = PRODUCTS.slice(-limit).reverse().map(cardHTML).join("");
    }

    /* --- shop grid (all products) --- */
    const shopGrid = $("[data-grid-shop]");
    if (shopGrid) {
      shopGrid.innerHTML = PRODUCTS.map(cardHTML).join("");
    }

    initCardInteractions();
  }

  /* ======================================================================
     8. CARD INTERACTIONS (size chips / add to cart / wishlist)
     ====================================================================== */
  function initCardInteractions() {
    /* size chips — only one active per card */
    document.addEventListener("click", (e) => {
      const chip = e.target.closest(".size-chip");
      if (!chip) return;
      const wrap = chip.closest("[data-sizes]");
      $$(".size-chip", wrap).forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
    });

    /* wishlist heart */
    document.addEventListener("click", (e) => {
      const fav = e.target.closest(".card__fav");
      if (!fav) return;
      const on = fav.classList.toggle("is-on");
      fav.setAttribute("aria-pressed", String(on));
      const p = find(fav.closest(".card").dataset.card);
      Cart.Toast.show(on ? "Saved" : "Removed", p ? p.name : "", on ? "ok" : "info");
    });

    /* add to cart */
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;

      const card = btn.closest(".card");
      const id = btn.dataset.add;
      const p = find(id);
      if (!p) return;

      let size = null;
      if (p.sizes.length) {
        const chosen = card.querySelector(".size-chip.is-on");
        if (!chosen) {
          // Nudge the user to pick a size first
          card.classList.remove("is-shake");
          void card.offsetWidth;
          card.classList.add("is-shake");
          card.querySelector("[data-sizes]")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          Cart.Toast.show("Pick a size first", `Choose ${p.sizes.join(" / ")} for ${p.name}.`, "info");
          return;
        }
        size = chosen.dataset.size;
      }

      const added = Cart.add(id, size);
      if (!added) return;

      /* micro-interactions: button state, cart icon bounce, badge pop, toast */
      btn.innerHTML = `${icon.check}<span>Added</span>`;
      setTimeout(() => (btn.innerHTML = `${icon.cart}<span>Add to cart</span>`), 1400);

      $$("[data-cart-open]").forEach((b) => {
        b.classList.remove("is-bouncing");
        void b.offsetWidth;
        b.classList.add("is-bouncing");
      });
      Cart.bump();
      Cart.Toast.show("Added to cart", `${p.name}${size ? ` · Size ${size}` : ""} · ${money(p.price)}`, "ok");
    });
  }

  /* ======================================================================
     9. SHOP PAGE — filters + search
     ====================================================================== */
  function initShop() {
    const grid = $("[data-grid-shop]");
    if (!grid) return;

    const chips = $$("[data-filter]");
    const input = $("#searchInput");
    const clearBtn = $("#searchClear");
    const counter = $("[data-result-count]");
    const empty = $("[data-empty]");
    const sortSel = $("#sortSelect");

    const state = { cat: "all", q: "", sort: "featured" };

    function apply(reset) {
      let list = PRODUCTS.filter((p) => {
        const okCat = state.cat === "all" || p.cat === state.cat;
        const q = state.q.trim().toLowerCase();
        const okQ =
          !q ||
          p.name.toLowerCase().includes(q) ||
          window.OSHOPUtil.catLabel(p.cat).toLowerCase().includes(q) ||
          p.cat.includes(q);
        return okCat && okQ;
      });

      /* sort */
      if (state.sort === "low") list = [...list].sort((a, b) => a.price - b.price);
      else if (state.sort === "high") list = [...list].sort((a, b) => b.price - a.price);
      else if (state.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

      grid.classList.add("is-swapping");
      grid.innerHTML = list.map(cardHTML).join("");

      // stagger the freshly rendered cards
      $$(".card", grid).forEach((c, i) => (c.style.setProperty("--d", `${i * 55}ms`)));

      if (counter) {
        counter.textContent =
          list.length === PRODUCTS.length
            ? `${list.length} pieces`
            : `${list.length} piece${list.length === 1 ? "" : "s"} found`;
      }
      empty?.toggleAttribute("hidden", list.length !== 0);

      if (reset) {
        $$(".reveal", grid).forEach((c) => c.classList.add("is-in"));
      } else {
        initReveals();
      }
      window.OSHOPRevealRefresh?.();
    }

    /* chips */
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("is-on"));
        chip.classList.add("is-on");
        state.cat = chip.dataset.filter;
        apply(true);
      });
    });

    /* search (debounced so it feels instant but doesn't thrash the DOM) */
    let t;
    input?.addEventListener("input", () => {
      clearBtn?.classList.toggle("is-on", !!input.value);
      clearTimeout(t);
      t = setTimeout(() => {
        state.q = input.value;
        apply(true);
      }, 180);
    });

    clearBtn?.addEventListener("click", () => {
      input.value = "";
      state.q = "";
      clearBtn.classList.remove("is-on");
      input.focus();
      apply(true);
    });

    sortSel?.addEventListener("change", () => {
      state.sort = sortSel.value;
      apply(true);
    });

    /* "Show everything" in the empty state */
    $("#resetFilters")?.addEventListener("click", () => {
      chips.forEach((c) => c.classList.toggle("is-on", c.dataset.filter === "all"));
      state.cat = "all";
      state.q = "";
      if (input) input.value = "";
      clearBtn?.classList.remove("is-on");
      apply(true);
    });

    /* deep link: shop.html?cat=jackets */
    const catFromUrl = new URLSearchParams(location.search).get("cat");
    if (catFromUrl && CATEGORIES.some((c) => c.key === catFromUrl)) {
      const chip = chips.find((c) => c.dataset.filter === catFromUrl);
      chip?.click();
    } else {
      apply(true);
    }
  }

  /* ======================================================================
     10. CATEGORY CARD COUNTS
     ====================================================================== */
  function fillCategoryCounts() {
    $$("[data-cat-count]").forEach((el) => {
      const n = PRODUCTS.filter((p) => p.cat === el.dataset.catCount).length;
      el.textContent = `${n} piece${n === 1 ? "" : "s"}`;
    });
    $$("[data-chip-count]").forEach((el) => {
      const k = el.dataset.chipCount;
      el.textContent = k === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === k).length;
    });
    /* catalogue size, shown in the stats band */
    $$("[data-live-count]").forEach((el) => (el.textContent = PRODUCTS.length));
  }

  /* ======================================================================
     11. TICKER — duplicate the track for a seamless loop
     ====================================================================== */
  function initTickers() {
    $$(".ticker__track").forEach((track) => {
      const group = track.querySelector(".ticker__group");
      if (!group || group.dataset.cloned) return;
      const clone = group.cloneNode(true);
      clone.dataset.cloned = "1";
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  /* ======================================================================
     12. CONTACT FORM (front-end only, no backend)
     ====================================================================== */
  function initForm() {
    const form = $("#contactForm");
    if (!form) return;

    const showError = (field, on) => field.classList.toggle("is-bad", on);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;

      $$("[required]", form).forEach((input) => {
        const field = input.closest(".field");
        const valid = input.type === "email"
          ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())
          : input.value.trim().length > 1;
        showError(field, !valid);
        if (!valid && ok) input.focus();
        if (!valid) ok = false;
      });

      if (!ok) {
        Cart.Toast.show("Check the form", "Some fields still need your attention.", "info");
        return;
      }

      const name = form.elements.name.value.trim().split(" ")[0];
      Cart.Toast.show("Message sent!", `Thanks ${name} — we reply fast.`, "ok");
      form.reset();
    });

    $$("input, textarea", form).forEach((i) =>
      i.addEventListener("input", () => showError(i.closest(".field"), false))
    );
  }

  /* ======================================================================
     13. OPENING HOURS — highlight today
     ====================================================================== */
  function initHours() {
    const rows = $$("[data-day]");
    if (!rows.length) return;
    // 0 = Sunday … 6 = Saturday
    const today = new Date().getDay();
    rows.forEach((r) => {
      const d = parseInt(r.dataset.day, 10);
      if (d === today) r.classList.add("is-today");
    });
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  function boot() {
    injectUI();
    initMenu();
    initTickers();
    fillCategoryCounts();
    renderGrids();
    initShop();
    initForm();
    initHours();
    splitHeroTitle();
    initScroll();
    initReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Small page-transition polish: fade the page in on every navigation.
  window.addEventListener("pageshow", () => document.body.classList.add("is-loaded"));
})();