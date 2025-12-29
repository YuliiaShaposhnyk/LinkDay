(async function () {
  const blocks = document.querySelectorAll("[data-include]");

  for (const block of blocks) {
    const url = block.dataset.include;
    const res = await fetch(url, { cache: "no-store" });
    block.innerHTML = await res.text();
  }

  // 🔥 RE-INIT WEBFLOW
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
