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

document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="/#"], a[href^="#"]');
  if (!a) return;

  const href = a.getAttribute("href");
  const hash = href.includes("#") ? "#" + href.split("#")[1] : null;
  if (!hash) return;

  // якщо ми вже на головній — не перезавантажуємо
  const isHome = location.pathname === "/" || location.pathname.endsWith("index.html");
  const isSamePageHash = href.startsWith("#") || (href.startsWith("/#") && isHome);

  if (!isSamePageHash) return;

  e.preventDefault();
  history.replaceState(null, "", hash);

  const target = document.querySelector(hash);
  if (!target) return;

  const header = document.querySelector(".navigation");
  const offset = header ? header.offsetHeight : 90;

  const y = target.getBoundingClientRect().top + window.pageYOffset - offset - 12;
  window.scrollTo({ top: y, behavior: "smooth" });
});

