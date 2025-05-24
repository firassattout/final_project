export function generatePublisherCode(userId, type, platform) {
  if (type === "banner") {
    return `<div
  class="auto-ad"
  data-user="${userId}"
  data-type="banner"
  data-position="top"
></div>
<script src="${process.env.URL}/banner-sdk" defer></script>
`;
  } else if (type === "rewarded") {
    if (platform === "web")
      return ` 
    <div
      class="auto-ad"
      data-user="${userId}"
      data-type="rewarded"
    ></div>
    <script src="${process.env.URL}/rewarded-sdk" defer></script>
    <script>
      window.addEventListener("message", (event) => {
        if (event.data.type === "rewardedAdCompleted") {
          // حدث بعد انتهاء الاعلان
        } else if (event.data.type === "rewardedAdClosed") {
          // حدث اذا لم يكمل المشاهدة
        }
      });
    </script>
    `;
    if (platform === "react")
      return ` 
import { useEffect } from "react";

function RewardedAd() {
  useEffect(() => {
    // إضافة السكربت مرة واحدة عند تحميل الكومبوننت
    const script = document.createElement("script");
    script.src = "${process.env.URL}/rewarded-sdk";
    script.defer = true;
    document.body.appendChild(script);

    // مستمع الأحداث
    function handleMessage(event) {
      if (event.data.type === "rewardedAdCompleted") {
        console.log("تمت مشاهدة الإعلان بالكامل، منح المكافأة.");
      } else if (event.data.type === "rewardedAdClosed") {
        console.log("تم إغلاق الإعلان قبل الانتهاء، لم تُمنح المكافأة.");
      }
    }

    window.addEventListener("message", handleMessage);

    // تنظيف بعد إلغاء التثبيت
    return () => {
      window.removeEventListener("message", handleMessage);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="auto-ad"
      data-user=${userId}
      data-type="rewarded"
    ></div>
  );
}

export default RewardedAd;

    `;
    if (platform === "vue3")
      return ` 
<template>
  <div
    class="auto-ad"
    :data-user="userId"
    data-type="rewarded"
  ></div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

const userId = "${userId}";

function handleMessage(event) {
  if (event.data.type === "rewardedAdCompleted") {
    console.log("تمت مشاهدة الإعلان بالكامل، منح المكافأة.");
  } else if (event.data.type === "rewardedAdClosed") {
    console.log("تم إغلاق الإعلان قبل الانتهاء، لم تُمنح المكافأة.");
  }
}

onMounted(() => {
  const script = document.createElement("script");
  script.src = "${process.env.URL}/vue-rewarded-sdk";
  script.defer = true;
  document.body.appendChild(script);

  window.addEventListener("message", handleMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
  // يمكنك حذف السكربت إذا تريد
});
</script>


    `;
  }
  return "";
}
