export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async function () {
      const registerSW = await navigator.serviceWorker.register("/service-worker.js");

      registerSW.onupdatefound = (e) => {
        registerSW.installing?.addEventListener("statechange", function (event) {
          const sw = event.target as ServiceWorker;

          if (sw.state === "installed") {
            if (registerSW.active) {
              console.log("Please close all tabs to get updates.");
            } else {
              console.log("Content is cached for the first time!");
            }

            window.location.reload();
          }
        });
      };
    });
  }
}
