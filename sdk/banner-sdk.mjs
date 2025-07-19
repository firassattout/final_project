document.addEventListener("DOMContentLoaded", () => {
  const currentScript = document.querySelector('script[src*="banner-sdk"]');
  if (!currentScript) {
    console.error("Banner SDK: script tag not found.");
    return;
  }
  const userId = currentScript.dataset.user;
  const position = currentScript.dataset.position || "top";

  if (!userId) {
    console.error("Banner SDK: Missing data-user attribute.");
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.src = `__URL__/show-ad/${userId}?type=banner&position=${position}`;
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

  document.body.appendChild(iframe);

  window.addEventListener("message", (event) => {
    if (!event?.data?.type) return;

    const iframe = document.querySelector("iframe[data-banner-sdk='true']");
    if (!iframe) return;

    if (event.data.type === "adError" || event.data.type === "bannerAdHidden") {
      iframe.remove();
    }
  });
});
