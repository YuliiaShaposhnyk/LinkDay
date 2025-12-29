(async function () {
  const blocks = document.querySelectorAll("[data-include]");
  const cache = new Map();

  for (const block of blocks) {
    const url = block.dataset.include;

    if (!cache.has(url)) {
      const res = await fetch(url, { cache: "no-store" });
      cache.set(url, await res.text());
    }

    block.innerHTML = cache.get(url);
  }

  // Re-init Webflow (після ВСІХ підвантажень)
  if (window.Webflow) {
    Webflow.destroy();
    Webflow.ready();

    const ix2 = Webflow.require("ix2");
    ix2 && ix2.init();

    const navbar = Webflow.require("navbar");
    navbar && navbar.ready();

    const dropdown = Webflow.require("dropdown");
    dropdown && dropdown.ready();
  }
})();



(async function () {
  // 1) Load components
  const blocks = document.querySelectorAll("[data-include]");
  const cache = new Map();

  for (const block of blocks) {
    const url = block.getAttribute("data-include");
    if (!url) continue;

    if (!cache.has(url)) {
      const res = await fetch(url, { cache: "no-store" });
      cache.set(url, await res.text());
    }

    block.innerHTML = cache.get(url);
  }

  // 2) Re-init Webflow AFTER injection (navbar, dropdowns, ix2)
  if (window.Webflow) {
    try {
      window.Webflow.destroy();
      window.Webflow.ready();

      const ix2 = window.Webflow.require("ix2");
      if (ix2 && ix2.init) ix2.init();

      const navbar = window.Webflow.require("navbar");
      if (navbar && navbar.ready) navbar.ready();

      const dropdown = window.Webflow.require("dropdown");
      if (dropdown && dropdown.ready) dropdown.ready();
    } catch (e) {
      console.warn("Webflow re-init failed:", e);
    }
  }

  // 3) Reliable hash scroll: wait until the target exists (up to 5s)
  const hash = window.location.hash;
  if (!hash) return;

  const selector = hash; // e.g. "#faq"
  const start = Date.now();
  let target = null;

  while (Date.now() - start < 5000) {
    target = document.querySelector(selector);
    if (target) break;
    await new Promise((r) => setTimeout(r, 50));
  }

  if (!target) return;

  // 4) Scroll with header offset
  const header = document.querySelector(".navigation");
  const offset = header ? header.offsetHeight : 90;

  const y =
    target.getBoundingClientRect().top +
    window.pageYOffset -
    offset -
    12;

  window.scrollTo({ top: y, behavior: "smooth" });
})();
