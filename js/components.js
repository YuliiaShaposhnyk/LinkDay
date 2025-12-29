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

if (window.location.hash) {
  const target = document.querySelector(window.location.hash);
  if (target) {
    setTimeout(() => {
      const header = document.querySelector(".navigation"); // твій хедер-клас
      const offset = header ? header.offsetHeight : 90;

      const y = target.getBoundingClientRect().top + window.pageYOffset - offset - 12;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 150);
  }
}
