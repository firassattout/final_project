export function generatePublisherCode(type, platform, compressedData) {
  if (type === "banner") {
    if (platform === "web")
      return `
      <script 
        src="${process.env.URL}/banner-sdk" 
        data-compressed-data="${compressedData}"
        data-position="top" 
       defer>
      </script>`;
    else if (platform === "mobile")
      return `import React from 'react';
      import { View, StyleSheet, Dimensions } from 'react-native';
      import { WebView } from 'react-native-webview';

      const BannerSDK = ({ "${process.env.URL}/show-ad?compressedData=${compressedData}&position=top" }) => {
        return (
          <View style={styles.container}>
            <WebView
              source={{ uri: sdkUrl }}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              automaticallyAdjustContentInsets={false}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        );
      };

      const styles = StyleSheet.create({
        container: {
          position: 'absolute',
          bottom: 0,
          width: Dimensions.get('window').width,
          height: 80,
          zIndex: 9999,
        },
        webview: {
          flex: 1,
          backgroundColor: 'transparent',
        },
      });

      export default BannerSDK;`;
  } else if (type === "rewarded") {
    if (platform === "web")
      return ` 
      <button
        class="watch-ad-btn"
        onclick="showAutoAd()"
      >
        show ad
      </button>
    <script src="${process.env.URL}/rewarded-sdk"
      data-compressed-data="${compressedData}"
    defer
    ></script>
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
    else if (platform === "react")
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
          data-compressed-data="${compressedData}"
   
    ></div>
  );
}

export default RewardedAd;

    `;
    else if (platform === "vue3")
      return ` 
<template>
  <div
    class="auto-ad"
    data-compressed-data="${compressedData}"
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
    else if (platform === "mobile")
      return `
        <RewardedAd
      sdkUrl={"${process.env.URL}/show-ad?compressedData=${compressedData}"}
      onLoaded={() => console.log('Ad Loaded')}
      onCompleted={() => console.log('Ad Completed')}
      onClosed={() => console.log('Ad Closed')}
      onError={() => console.log('Ad Error')}
    />
     `;
  }
}
