function showAutoAd() {
  const currentScript = document.querySelector('script[src*="rewarded-sdk"]');
  if (!currentScript) {
    console.error("rewarded SDK: script tag not found.");
    return;
  }

  const compressedData = currentScript.dataset.compressedData;

  if (document.querySelector("iframe[data-auto-ad='true']")) return;

  const iframe = document.createElement("iframe");
  iframe.src = `__URL__/show-ad?compressedData=${encodeURIComponent(
    compressedData
  )}`;
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.zIndex = "9999";
  iframe.setAttribute("data-auto-ad", "true");
  iframe.allow = "autoplay; fullscreen";

  const container = document.body;
  container.appendChild(iframe);
}

// مستمع لإزالة الإعلان عند انتهاءه أو حدوث خطأ
window.addEventListener("message", (event) => {
  if (!event?.data?.type) return;
  const iframe = document.querySelector("iframe[data-auto-ad='true']");
  if (!iframe) return;

  if (event.data.type === "adError" || event.data.type === "rewardedAdClosed") {
    iframe.remove();
  }

  if (event.data.type === "rewardedAdCompleted") {
    iframe.remove();
  }
});
