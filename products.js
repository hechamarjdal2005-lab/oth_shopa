/* ==========================================================================
   O.SHOP — PRODUCT DATA
   --------------------------------------------------------------------------
   Single source of truth for the catalogue. Update this array to add, edit or
   remove a product — the shop grid, category counts, search and cart all read
   from it automatically.

   Field reference
   -------------
   id       : string  unique key (also used in CSS class names / data attrs)
   name     : string  product title
   price    : number  price in MAD (dirham)
   oldPrice : number? optional "was" price -> renders a <del>
   cat      : string  one of the CATEGORIES keys below
   tag      : string? "new" | "premium" -> renders the badge
   sizes    : array   size chips; empty array = one size (no picker)
   img      : string  placeholder image URL  <- REPLACE WITH YOUR OWN PHOTOS
   ratio    : string  optional aspect-ratio override for the card image
   ========================================================================== */

/* Category keys used by the filter chips and the homepage category cards */
const CATEGORIES = [
  { key: "hoodies",     label: "Hoodies & Sweatpants", short: "Hoodies" },
  { key: "jackets",     label: "Jackets",              short: "Jackets" },
  { key: "sneakers",    label: "Sneakers",             short: "Sneakers" },
  { key: "accessories", label: "Caps & Accessories",   short: "Caps" },
];

const PRODUCTS = [
  /* ---------------- HOODIES & SWEATPANTS ---------------- */
  {
    id: "crown-reaper-hoodie",
    name: "Crown Reaper Oversized Hoodie",
    price: 599,
    cat: "hoodies",
    tag: "premium",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "oshop-block-hoodie",
    name: "O.Shop Block Logo Hoodie",
    price: 449,
    cat: "hoodies",
    tag: "new",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "after-hours-zip",
    name: "After Hours Zip Hoodie",
    price: 649,
    cat: "hoodies",
    tag: "premium",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "fatal-dust-hoodie",
    name: "Fatal Dust Printed Hoodie",
    price: 520,
    cat: "hoodies",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "sunday-sweatpants",
    name: "Sunday Fleece Sweatpants",
    price: 399,
    cat: "hoodies",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "cargo-tech-sweatpants",
    name: "Cargo Tech Sweatpants",
    price: 469,
    oldPrice: 549,
    cat: "hoodies",
    tag: "new",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=70",
  },

  /* ---------------- JACKETS ---------------- */
  {
    id: "midnight-varsity",
    name: "Midnight Varsity Jacket",
    price: 899,
    cat: "jackets",
    tag: "premium",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "berlin-bomber",
    name: "Berlin Bomber Jacket",
    price: 1090,
    cat: "jackets",
    tag: "premium",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "storm-shell-parka",
    name: "Storm Shell Parka",
    price: 1290,
    cat: "jackets",
    tag: "premium",
    sizes: ["M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "nocturne-denim",
    name: "Nocturne Denim Trucker",
    price: 749,
    cat: "jackets",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "noir-utility-jacket",
    name: "Noir Utility Overshirt",
    price: 619,
    cat: "jackets",
    tag: "new",
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=70",
  },

  /* ---------------- SNEAKERS ---------------- */
  {
    id: "oshop-runner-01",
    name: "O.Shop Runner 01",
    price: 1190,
    cat: "sneakers",
    tag: "new",
    sizes: ["40", "41", "42", "43", "44"],
    img: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "court-legacy-white",
    name: "Court Legacy White Low",
    price: 890,
    cat: "sneakers",
    sizes: ["40", "41", "42", "43", "44"],
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "onyx-high-top",
    name: "Onyx High-Top",
    price: 1090,
    cat: "sneakers",
    tag: "premium",
    sizes: ["40", "41", "42", "43", "44"],
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "trail-destroyer",
    name: "Trail Destroyer Sneaker",
    price: 1350,
    cat: "sneakers",
    tag: "premium",
    sizes: ["40", "41", "42", "43", "44"],
    img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=70",
  },

  /* ---------------- CAPS & ACCESSORIES ---------------- */
  {
    id: "gold-crown-cap",
    name: "Gold Crown Snapback",
    price: 249,
    cat: "accessories",
    sizes: [],
    img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "oshop-6-panel",
    name: "O.Shop 6-Panel Cap",
    price: 199,
    cat: "accessories",
    tag: "new",
    sizes: [],
    img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "crossbody-sling",
    name: "O.Shop Crossbody Sling Bag",
    price: 349,
    cat: "accessories",
    sizes: [],
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "heavy-socks",
    name: "Heavyweight Socks — 2 Pack",
    price: 149,
    cat: "accessories",
    sizes: [],
    img: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=70",
  },
];

/* Expose to the other scripts (cart.js / script.js run after this file) */
window.OSHOP = { PRODUCTS, CATEGORIES };

/* ==========================================================================
   HELPERS — small shared utilities used by cart.js and script.js
   ========================================================================== */
window.OSHOPUtil = {
  /** Format a number as Moroccan dirhams: 599 -> "599 DH" */
  money(n) {
    return `${Number(n).toLocaleString("en-US")} DH`;
  },

  /** Look up a product by id (returns undefined if the id was removed from the data) */
  find(id) {
    return window.OSHOP.PRODUCTS.find((p) => p.id === id);
  },

  /** Category label for a product */
  catLabel(catKey) {
    const c = window.OSHOP.CATEGORIES.find((c) => c.key === catKey);
    return c ? c.label : "";
  },

  /** Escape a string for safe injection into innerHTML */
  esc(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[m]);
  },

  /** Shared inline SVG icons (single source so markup stays consistent) */
  icon: {
    cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.4.3-.6 0-.2 0-.4 0-.6-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3c.2.2 2.3 3.5 5.5 4.9.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 21.5a9.4 9.4 0 0 1-4.8-1.3l-3.4.9.9-3.3a9.4 9.4 0 1 1 7.3 3.7m0-20.1a10.9 10.9 0 0 0-9.4 16.5L1.2 22.8l5-1.3A10.9 10.9 0 1 0 12 1.4"/></svg>`,
    crown: `<svg viewBox="0 0 64 44" fill="currentColor" aria-hidden="true"><path d="M4 40h56v4H4zM4 38 1 8l15 10L32 2l16 16L63 8l-3 30z"/><circle cx="1" cy="6" r="3"/><circle cx="63" cy="6" r="3"/></svg>`,
  },
};

/* ==========================================================================
   IMAGE FALLBACK
   If a placeholder URL fails to load (or you delete one while developing),
   swap in a branded SVG tile instead of a broken image icon.
   ========================================================================== */
window.OSHOP.fallbackImage = function (imgEl) {
  const name = imgEl.getAttribute("alt") || "O.Shop";
  const initials = name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "O";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 533">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#1b1b22"/><stop offset="1" stop-color="#0a0a0e"/></linearGradient></defs>` +
    `<rect width="400" height="533" fill="url(#g)"/>` +
    `<path d="M40 190h320M40 250h320" stroke="#d4af37" stroke-opacity=".25" stroke-width="2"/>` +
    `<g transform="translate(140 210) scale(2)" fill="#d4af37" opacity=".9">` +
    `<path d="M4 38 1 8l15 10L32 2l16 16L63 8l-3 30z"/></g>` +
    `<text x="200" y="330" font-family="Anton,Arial Black,sans-serif" font-size="64" fill="#d4af37" text-anchor="middle" opacity=".9">${initials}</text>` +
    `<text x="200" y="380" font-family="Inter,Arial,sans-serif" font-size="20" letter-spacing="6" fill="#8b8b96" text-anchor="middle">O.SHOP</text>` +
    `</svg>`;
  imgEl.src = "data:image/svg+xml," + encodeURIComponent(svg);
};