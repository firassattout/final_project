document.addEventListener("DOMContentLoaded", () => {
  const adContainers = document.querySelectorAll(".auto-ad");

  adContainers.forEach((container) => {
    const userId = container.dataset.user;
    const type = container.dataset.type || "banner";
    const position = container.dataset.position || "top";

    const iframe = document.createElement("iframe");
    iframe.src = `__URL__/show-ad/${userId}?type=${type}&position=${position}`;
    iframe.width = "100%";
    iframe.height = "80px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.position = "fixed";
    iframe.style.left = "0";
    iframe.style.zIndex = "9999";
    iframe.style.overflow = "hidden";
    iframe.allow = "autoplay; fullscreen";

    if (position === "bottom") {
      iframe.style.bottom = "0";
    } else {
      iframe.style.top = "0";
    }

    container.appendChild(iframe);
  });

  window.addEventListener("message", (event) => {
    if (!event?.data?.type) return;
    const iframe = document.querySelector("iframe");
    if (event.data.type === "adError") {
      iframe?.remove();
    }
    if (event.data.type === "bannerAdHidden") {
      iframe?.remove();
    }
  });
});
