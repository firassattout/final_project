(function () {
  const adContainers = document.querySelectorAll(".auto-ad");

  adContainers.forEach((container) => {
    const userId = container.dataset.user;
    const type = container.dataset.type || "banner";

    const iframe = document.createElement("iframe");
    iframe.src = `__URL__/show-ad/${userId}?type=${type}`;
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.zIndex = "9999";
    iframe.allow = "autoplay; fullscreen";

    container.appendChild(iframe);
  });
  window.addEventListener("message", (event) => {
    if (!event?.data?.type) return;
    const iframe = document.querySelector("iframe");
    if (event.data.type === "adError") {
      iframe?.remove();
    }
    if (event.data.type === "rewardedAdCompleted") {
    } else if (event.data.type === "rewardedAdClosed") {
      iframe?.remove();
    }
  });
})();
