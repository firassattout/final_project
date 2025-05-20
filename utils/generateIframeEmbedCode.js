export function generateIframeEmbedCode(userId, width, height, adType) {
  if (adType === "banner") {
    return `<iframe src="${process.env.URL}/show-ad/${userId}" width="${width}" height="${height}" style="border:none;overflow:hidden;position:fixed;top:0;left:50%;transform:translateX(-50%);" scrolling="no"></iframe>`;
  } else if (adType === "rewarded") {
    return `      <iframe
    src="${process.env.URL}/show-ad/${userId}"
      width="100%"
      height="100%"
      style="
        border: none;
        overflow: hidden;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
      "
        allow="autoplay; fullscreen"
    ></iframe>
    <script>
      window.addEventListener("message", (event) => {
        if (event.data.type === "adError") {
          document.querySelector("iframe").remove();
        } else if (event.data.type === "rewardedAdCompleted") {
          // إغلاق الإعلان بعد الإكمال
          document.querySelector("iframe").remove();
          alert("تم منح المكافأة بنجاح!");
        } else if (event.data.type === "rewardedAdClosed") {
          // إغلاق الإعلان إذا خرج المستخدم
          document.querySelector("iframe").remove();
          if (!event.data.rewardGranted) {
            alert("لم تكمل المشاهدة، لن تحصل على المكافأة");
          }
        }
      });
    </script>
    `;
  }
  return "";
}
