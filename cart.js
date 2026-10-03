/* ==========================================================================
   O.SHOP — CART
   --------------------------------------------------------------------------
   • State lives in localStorage ("oshop_cart_v1") so the basket survives
     page navigations and reloads.
   • A line item is { id, qty, size } — the same product in two sizes counts
     as two separate lines.
   • The cart UI (bottom sheet on phones / right drawer on desktop) is
     injected here so it never has to be duplicated across HTML pages.
   • Checkout = build a formatted message and hand it to WhatsApp.
   ========================================================================== */
(function () {
  "use strict";

  const { PRODUCTS, CATEGORIES } = window.OSHOP;
  const { money, find, esc, icon } = window.OSHOPUtil;

  /* ---------------- Config ---------------- */
  const KEY = "oshop_cart_v1";
  const WHATSAPP_NUMBER = "212663370829";   // 06 63 37 08 29, international format
  const FREE_SHIPPING_FROM = 0;            // nationwide delivery is free
  const MAX_QTY = 20;

  /* ---------------- State ---------------- */
  /** @type {{id:string, qty:number, size:string|null}[]} */
  let items = load();
  let lastFocused = null;

  /* ==========================================================================
     STORAGE
     ========================================================================== */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Drop anything that no longer exists in the product data, and repair
      // any bad values so a corrupted entry can't break the whole cart.
      return parsed
        .filter((l) => l && typeof l.id === "string" && find(l.id))
        .map((l) => {
          const p = find(l.id);
          let size = l.size || null;
          if (p.sizes.length) {
            if (!p.sizes.includes(size)) size = p.sizes[0];
          } else {
            size = null;
          }
          const qty = Math.min(MAX_QTY, Math.max(1, parseInt(l.qty, 10) || 1));
          return { id: l.id, qty, size };
        });
    } catch (err) {
      console.warn("[O.Shop] cart could not be read:", err);
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("[O.Shop] cart could not be saved:", err);
    }
  }

  /* ==========================================================================
     DERIVED VALUES
     ========================================================================== */
  const count = () => items.reduce((n, l) => n + l.qty, 0);

  const subtotal = () =>
    items.reduce((sum, l) => {
      const p = find(l.id);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);

  /** Find an existing line for the same product + size pair */
  const lineIndex = (id, size) =>
    items.findIndex((l) => l.id === id && l.size === size);

  /* ==========================================================================
     MUTATIONS
     ========================================================================== */
  function add(id, size) {
    const p = find(id);
    if (!p) return false;

    // Products with a size range must have one chosen
    if (p.sizes.length) {
      if (!size) return false;
      if (!p.sizes.includes(size)) return false;
    } else {
      size = null;
    }

    const i = lineIndex(id, size);
    if (i > -1) {
      items[i].qty = Math.min(MAX_QTY, items[i].qty + 1);
    } else {
      items.push({ id, qty: 1, size });
    }

    save();
    render();
    return true;
  }

  function setQty(id, size, qty) {
    const i = lineIndex(id, size);
    if (i === -1) return;
    const next = Math.min(MAX_QTY, Math.max(0, qty));
    if (next === 0) {
      remove(id, size, { silent: true });
    } else {
      items[i].qty = next;
      save();
      render({ skipLine: i });
    }
  }

  function setSize(id, oldSize, newSize) {
    const i = lineIndex(id, oldSize);
    if (i === -1) return;
    const target = lineIndex(id, newSize);

    if (target > -1 && target !== i) {
      // Merge into the existing line for that size instead of duplicating
      items[target].qty = Math.min(MAX_QTY, items[target].qty + items[i].qty);
      items.splice(i, 1);
    } else {
      items[i].size = newSize;
    }
    save();
    render();
  }

  function remove(id, size, opts) {
    const i = lineIndex(id, size);
    if (i === -1) return;
    items.splice(i, 1);
    save();
    syncBadges();                       // update the header badge instantly

    if (opts && opts.silent) {
      render({ skipLine: i });
      return;
    }

    // Animate the row out, then re-render without it
    const el = document.querySelector(`.ci[data-line="${lineKey(id, size)}"]`);
    if (el) {
      el.classList.add("is-out");
      setTimeout(() => render(), 220);
    } else {
      render();
    }
  }

  function clearAll() {
    items = [];
    save();
    render();
    Toast.show("Cart cleared", "Everything was removed.", "info");
  }

  const lineKey = (id, size) => `${id}__${size == null ? "-" : size}`;

  /* ==========================================================================
     WHATSAPP ORDER
     ========================================================================== */
  function orderMessage() {
    const lines = items.map((l) => {
      const p = find(l.id);
      const sizePart = l.size ? ` — Size ${l.size}` : "";
      return `- ${p.name}${sizePart} (x${l.qty}) — ${money(p.price * l.qty)}`;
    });

    return [
      "Hello O.Shop, I would like to order:",
      ...lines,
      "",
      `Total: ${money(subtotal())}`,
      "Delivery: all over Morocco",
      "Payment on delivery / cash on delivery",
    ].join("\n");
  }

  function orderViaWhatsApp() {
    if (!items.length) {
      Toast.show("Cart is empty", "Add a piece before ordering.", "info");
      return;
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage())}`;
    Toast.show("Opening WhatsApp…", "Send the message to confirm your order.", "wa");
    window.open(url, "_blank", "noopener");
  }

  /* ==========================================================================
     UI INJECTION — built once, reused on every page
     ========================================================================== */
  function injectUI() {
    if (document.querySelector(".cart")) return;

    /* Scrim (shared by the cart and the mobile menu) */
    const scrim = document.createElement("div");
    scrim.className = "scrim";
    scrim.id = "scrim";
    document.body.appendChild(scrim);

    /* Cart panel */
    const cart = document.createElement("aside");
    cart.className = "cart";
    cart.id = "cart";
    cart.setAttribute("aria-hidden", "true");
    cart.setAttribute("aria-label", "Shopping cart");
    cart.innerHTML = `
      <div class="cart__handle" id="cartHandle" aria-hidden="true"></div>

      <header class="cart__head">
        <div>
          <h2>Your cart</h2>
          <span class="count" data-cart-label>0 items</span>
        </div>
        <button class="cart__close" type="button" data-cart-close aria-label="Close cart">
          ${icon.close}
        </button>
      </header>

      <div class="cart__items" data-cart-items></div>

      <footer class="cart__foot" data-cart-foot hidden>
        <div class="ship-bar" data-ship-bar>
          <div class="ship-bar__track"><div class="ship-bar__fill" data-ship-fill></div></div>
          <p class="ship-bar__txt" data-ship-txt></p>
        </div>

        <div class="sum-row">
          <span>Subtotal</span>
          <b data-cart-subtotal>0 DH</b>
        </div>
        <div class="sum-row">
          <span>Delivery — all Morocco</span>
          <span class="free">Free</span>
        </div>
        <div class="sum-row sum-row--total">
          <span>Total</span>
          <strong data-cart-total>0 DH</strong>
        </div>

        <button class="btn btn--wa" type="button" data-order-whatsapp>
          ${icon.whatsapp}
          <span>Order via WhatsApp</span>
        </button>

        <p class="cart__note">Pay cash on delivery · Nationwide delivery</p>
        <button class="cart__clear" type="button" data-cart-clear>Empty cart</button>
      </footer>
    `;
    document.body.appendChild(cart);

    /* Toasts */
    const toasts = document.createElement("div");
    toasts.className = "toasts";
    toasts.id = "toasts";
    toasts.setAttribute("role", "status");
    toasts.setAttribute("aria-live", "polite");
    document.body.appendChild(toasts);

    /* Wire the injected controls */
    cart.querySelector("[data-cart-close]").addEventListener("click", close);
    cart.querySelector("[data-cart-clear]").addEventListener("click", clearAll);
    cart.querySelector("[data-order-whatsapp]").addEventListener("click", orderViaWhatsApp);

    cart.addEventListener("click", (e) => {
      /* "Shop the collection" link inside the empty state */
      if (e.target.closest("[data-cart-close]")) {
        close();
        return;
      }

      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const row = btn.closest(".ci");
      if (!row) return;
      const { id, size } = row.dataset;
      const act = btn.dataset.act;
      const realSize = size === "-" ? null : size;

      if (act === "inc") setQty(id, realSize, currentQty(id, realSize) + 1);
      if (act === "dec") setQty(id, realSize, currentQty(id, realSize) - 1);
      if (act === "rm") remove(id, realSize);
    });

    cart.addEventListener("change", (e) => {
      const sel = e.target.closest("select[data-size-for]");
      if (!sel) return;
      const id = sel.dataset.sizeFor;
      const oldSize = sel.dataset.currentSize === "-" ? null : sel.dataset.currentSize;
      setSize(id, oldSize, sel.value);
    });

    /* Swipe-down to close on phones */
    let startY = 0;
    let dragging = false;
    const handle = cart.querySelector("#cartHandle");
    handle.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
      dragging = true;
    }, { passive: true });
    handle.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) cart.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    handle.addEventListener("touchend", (e) => {
      dragging = false;
      const dy = (e.changedTouches[0].clientY - startY);
      cart.style.transform = "";
      if (dy > 90) close();
    });

    /* Header cart buttons + badges (0..n) */
    document.querySelectorAll("[data-cart-open]").forEach((btn) => {
      if (!btn.querySelector(".cart-badge")) {
        const badge = document.createElement("span");
        badge.className = "cart-badge";
        badge.hidden = true;
        btn.appendChild(badge);
      }
      btn.addEventListener("click", open);
    });

    scrim.addEventListener("click", () => {
      if (cart.classList.contains("is-open")) close();
      else if (window.OSHOPCloseMenu) window.OSHOPCloseMenu();
    });
  }

  function currentQty(id, size) {
    const i = lineIndex(id, size);
    return i === -1 ? 0 : items[i].qty;
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */
  function render(opts) {
    const skipLine = opts && typeof opts.skipLine === "number" ? opts.skipLine : -1;
    syncBadges();

    const cart = document.getElementById("cart");
    if (!cart) return;
    const list = cart.querySelector("[data-cart-items]");
    const foot = cart.querySelector("[data-cart-foot]");

    /* --- empty state --- */
    if (!items.length) {
      list.innerHTML = `
        <div class="cart__empty">
          ${icon.crown.replace('<svg', '<svg class="crown"')}
          <h3>Your cart is empty</h3>
          <p>Nothing here yet. Go pick a piece and it will show up instantly.</p>
          <a class="btn btn--ghost btn--sm" href="shop.html" data-cart-close>Shop the collection</a>
        </div>`;
      foot.hidden = true;
      return;
    }

    /* --- line items --- */
    list.innerHTML = items
      .map((l, idx) => {
        const p = find(l.id);
        const sizeAttr = l.size == null ? "-" : l.size;
        const sizePicker = p.sizes.length
          ? `<select class="ci__size" data-size-for="${esc(l.id)}" data-current-size="${esc(sizeAttr)}" aria-label="Size for ${esc(p.name)}">
               ${p.sizes.map((s) => `<option value="${esc(s)}"${s === l.size ? " selected" : ""}>${esc(s)}</option>`).join("")}
             </select>`
          : "";

        return `
        <article class="ci" data-line="${esc(lineKey(l.id, l.size))}" data-id="${esc(l.id)}" data-size="${esc(sizeAttr)}"
                 style="animation-delay:${idx * 60}ms">
          <img class="ci__img" src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" onerror="OSHOP.fallbackImage(this)">
          <div class="ci__info">
            <div class="ci__top">
              <h3 class="ci__name">${esc(p.name)}</h3>
              <button class="ci__rm" type="button" data-act="rm" aria-label="Remove ${esc(p.name)}">${icon.trash}</button>
            </div>
            <div class="ci__row">
              <div class="qty">
                <button type="button" data-act="dec" aria-label="Decrease quantity">&minus;</button>
                <output aria-label="Quantity">${l.qty}</output>
                <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
              </div>
              ${sizePicker}
              <b class="ci__price">${money(p.price * l.qty)}</b>
            </div>
          </div>
        </article>`;
      })
      .join("");

    // Re-trigger the entrance animation for every row except the one the
    // user just touched (avoids a distracting flicker on qty + / -).
    if (skipLine > -1) {
      Array.from(list.children).forEach((el, idx) => {
        if (idx === skipLine) {
          el.style.animation = "none";
        } else {
          el.style.animation = "";
        }
      });
    }

    /* --- summary --- */
    const sub = subtotal();
    foot.hidden = false;
    cart.querySelector("[data-cart-subtotal]").textContent = money(sub);
    cart.querySelector("[data-cart-total]").textContent = money(sub);

    const pct = Math.min(100, Math.round((sub / (FREE_SHIPPING_FROM || 1)) * 100)) || 100;
    cart.querySelector("[data-ship-fill]").style.width = pct + "%";
    cart.querySelector("[data-ship-txt]").innerHTML =
      sub >= FREE_SHIPPING_FROM
        ? `Free delivery unlocked <b>${money(sub)}</b>`
        : `Add <b>${money(FREE_SHIPPING_FROM - sub)}</b> more for free delivery`;
  }

  /* Header badges + cart item counter — cheap enough to call on its own so the
     number reacts the instant something changes, before the panel re-renders. */
  function syncBadges() {
    const n = count();
    document.querySelectorAll(".cart-badge").forEach((b) => {
      b.textContent = n > 99 ? "99+" : n;
      b.hidden = n === 0;
      if (n > 0) popBadge(b);
    });
    document.querySelectorAll("[data-cart-label]").forEach((el) => {
      el.textContent = `${n} item${n === 1 ? "" : "s"}`;
    });
  }

  function popBadge(badge) {
    if (badge._popTimer) return;
    badge.classList.add("is-pop");
    badge._popTimer = setTimeout(() => {
      badge.classList.remove("is-pop");
      badge._popTimer = null;
    }, 460);
  }

  /* ==========================================================================
     OPEN / CLOSE
     ========================================================================== */
  function open() {
    const cart = document.getElementById("cart");
    if (!cart) return;
    lastFocused = document.activeElement;
    cart.classList.add("is-open");
    cart.classList.remove("is-bump");
    cart.setAttribute("aria-hidden", "false");
    document.getElementById("scrim").classList.add("is-on");
    document.body.classList.add("is-locked");
    if (window.OSHOPCloseMenu) window.OSHOPCloseMenu();
    setTimeout(() => cart.querySelector("[data-cart-close]").focus(), 320);
  }

  function close() {
    const cart = document.getElementById("cart");
    if (!cart) return;
    cart.classList.remove("is-open");
    cart.setAttribute("aria-hidden", "true");
    document.getElementById("scrim").classList.remove("is-on");
    if (!document.querySelector(".mobile-nav.is-open")) {
      document.body.classList.remove("is-locked");
    }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function bump() {
    const cart = document.getElementById("cart");
    if (cart) {
      cart.classList.remove("is-bump");
      void cart.offsetWidth;      // restart the animation
      cart.classList.add("is-bump");
    }
  }

  /* ==========================================================================
     TOASTS
     ========================================================================== */
  const Toast = {
    show(title, sub, kind) {
      const host = document.getElementById("toasts");
      if (!host) return;
      const el = document.createElement("div");
      el.className = "toast" + (kind === "wa" ? " toast--wa" : "");
      el.innerHTML = `
        <span class="toast__ico">${kind === "info" ? "!" : icon.check}</span>
        <span><strong>${esc(title)}</strong>${sub ? `<small>${esc(sub)}</small>` : ""}</span>`;
      host.appendChild(el);
      setTimeout(() => {
        el.classList.add("is-out");
        setTimeout(() => el.remove(), 340);
      }, 2600);
    },
  };

  /* ==========================================================================
     CROSS-TAB SYNC (two open tabs stay in sync)
     ========================================================================== */
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    items = load();
    render();
  });

  /* ==========================================================================
     BOOT — inject the cart UI as soon as the DOM is parsed, then paint the
     saved basket so the badge is correct on first paint.
     ========================================================================== */
  function boot() {
    injectUI();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* ==========================================================================
     PUBLIC API — used by script.js
     ========================================================================== */
  window.OSHOPCart = { add, remove, setQty, setSize, clearAll, open, close, render, count, subtotal, Toast, bump, orderMessage };
})();