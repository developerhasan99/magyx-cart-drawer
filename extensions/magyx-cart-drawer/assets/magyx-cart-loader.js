(function () {
  "use strict";

  const runtimeId = "magyx-cart-drawer-runtime";

  function loadRuntime() {
    if (document.getElementById(runtimeId)) return;

    const host = document.querySelector("magyx-cart-drawer[data-script-src], magyx-cart-trigger[data-script-src]");
    const src = host?.dataset?.scriptSrc;
    if (!src) return;

    const script = document.createElement("script");
    script.id = runtimeId;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadRuntime, { once: true });
  } else {
    loadRuntime();
  }
})();
