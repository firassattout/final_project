export function generateEmbedCode(ad, url, userId, type) {
  if (ad.mediaType === "image")
    switch (type) {
      case "banner":
        return generateBannerEmbedCode(ad, url, userId);
      case "rewarded":
        return generateRewardedEmbedCode(ad, url, userId);

      default:
        throw new Error("نوع الإعلان غير مدعوم");
    }
  else {
    switch (type) {
      case "rewarded":
        return generateRewardedEmbedCode(ad, url, userId);

      default:
        throw new Error("نوع الإعلان غير مدعوم");
    }
  }
}

function generateBannerEmbedCode(ad, url, userId) {
  if (ad.adId.platform === "web")
    return `

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>إعلان بانر - ${ad.adId.title}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        margin: 0;
        width: 100%;
        display:flex;
        justify-content:center;
        align-items:center;
      }

      .ad-container {
        width: 750px;
        height: 80px;
        overflow:hidden
      }
      .ad-title {
        font-size: 14px;
        text-align: center;
        margin-bottom: 5px;
      }

  

      .ad-image {
        object-fit: contain;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }

      .ad-video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        cursor: pointer;
      }

      @media only screen and (max-width: 800px) {
        .ad-container {
          height: 100px;
        }

        .ad-image-container {
          height: 70px;
        }

        .ad-title {
          font-size: 12px;
        }
      }
    </style>
  </head>
  <body>
    <div class="ad-container" data-ad-id="${ad._id}">
   
      
       
      
              <a href="http://${ad.adId.url}" target="_blank" rel="noopener noreferrer" id="ad-link">
                  <img src="${url}" class="ad-image" alt="${ad.adId.title}" />
                </a>
        
          
   
 
    </div>

    <script nonce="my-nonce-123">
      const impressionDuration = 20;
      let impressionTracked = false;

      // Track impression after 10 seconds
      setTimeout(() => {
        if (!impressionTracked) {
          fetch("${process.env.URL}/track-views", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              adId: "${ad.adId._id}",
              userId: "${userId}",
            }),
          }).then((response) => {
            if (response.ok) {
              impressionTracked = true;
              window.parent.postMessage(
                {
                  type: "bannerAdImpression",
                  adId: "${ad.adId._id}",
                },
                "*"
              );
            }
          });
        }
      }, impressionDuration * 1000);

      // Track click on image or video
      document.getElementById("ad-link").addEventListener("click", async () => {
        try {
          const response = await fetch("${process.env.URL}/track-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adId: "${ad.adId._id}",
              clickedAt: new Date().toISOString(),
              userId: "${userId}",
            }),
          });
        } catch (error) {
          console.error("Tracking error:", error);
        }
      });

      // Send message when banner is loaded
      window.parent.postMessage(
        {
          type: "bannerAdLoaded",
          adId: "${ad._id}",
        },
        "*"
      );
    </script>
  </body>
</html>

  
  `;
}

function generateRewardedEmbedCode(ad, mediaUrl, userId, duration = 10) {
  if (ad.adId.platform === "web")
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>إعلان مكافأة - ${ad.adId.title}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ad-container {
        width: fit-content;
        height: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        overflow: hidden;
        font-family: sans-serif;
        position: relative;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 30px;
      }

      .progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: rgba(255, 255, 255, 0.3);
      }
      .progress {
        height: 100%;
        width: 10%;
        background: #4caf50;
        transition: width 1s linear;
      }
      .timer {
        position: absolute;
        top: 15px;
        right: 15px;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 16px;
      }
      .close-btn {
        position: absolute;
        top: 15px;
        left: 15px;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .confirmation-dialog {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
      }
      .dialog-image {
        background: #404040;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        max-width: 80%;
      }
      .dialog-buttons {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      .dialog-btn {
        padding: 8px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .continue-btn {
        background: #4caf50;
        color: white;
      }
      .continue-btn2 {
        background: #4caf50;
        color: white;
        padding: 8px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .close-btn2 {
        background: #f44336;
        color: white;
      }
      .ad-content {
        background-color: #404040;
        color: white;
        width: 100%;
        height: 100px;
        position: absolute;
        z-index: 1;
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        padding-left: 100px;
        padding-right: 100px;
      }
      .ad-image-container {
        color: white;
        position: relative;
        width: 70vw;
        height: 90vh;
      }
      .ad-image {
        object-fit: contain;
        width: 100%;
        height: 100%;
        padding-top: 100px;
      }
      .ad-text {
        text-align: right;
      }
      @media only screen and (max-width: 800px) {
        .ad-image-container {
          width: 100%;
          height: 80vh;
        }
      }
    </style>
  </head>
  <body>
    <div class="ad-container" data-ad-id="${ad._id}">
      <div class="ad-content">
        <div class="ad-text">
          <h1>${ad.adId.title}</h1>
          <h1>${ad.adId.description}</h1>
        </div>
        <div>
          <a
            href="http://${ad.adId.url}"
            target="_blank"
            class="continue-btn2"
            id="go"
            rel="noopener noreferrer"
          >
            زيارة الموقع</a
          >
        </div>

        <button class="close-btn" id="closeBtn">✕</button>
        <div class="timer" id="timer">${duration}s</div>
        <div class="progress-bar">
          <div class="progress" id="progress"></div>
        </div>
      </div>

      <div class="ad-image-container">
        ${
          ad.mediaType === "image"
            ? `<img
          src="${mediaUrl}"
          class="ad-image"
          alt="${ad.adId.title}"
        />`
            : `<video
          width="100%"
          height="100%"
          autoplay
          loop
          muted
          playsinline
          id="ad-video"
        >
          <source
            src="${process.env.URL}/stream-video?url=${ad.url}"
            type="video/mp4"
          /></video
        >`
        }
      </div>
    </div>

    <div class="confirmation-dialog" id="confirmationDialog">
      <div class="dialog-image">
        <h3>هل تريد إنهاء المكافأة الآن؟</h3>
        <p>إذا خرجت الآن، لن تحصل على المكافأة</p>
        <div class="dialog-buttons">
          <button class="dialog-btn continue-btn" id="continueBtn">
            استئناف المشاهدة
          </button>
          <button class="dialog-btn close-btn2" id="confirmCloseBtn">
            إنهاء المكافأة
          </button>
        </div>
      </div>
    </div>
    <script nonce="my-nonce-123">
       const adDuration = ${duration};

      let timeLeft = adDuration;
      let timerInterval;
      let adCompleted = false;

      // تحديث العداد وشريط التقدم
      function updateTimer() {
        timeLeft--;
        document.getElementById("timer").textContent = timeLeft + "s";
        const progressPercent = ((adDuration - timeLeft) / adDuration) * 100;
        document.getElementById("progress").style.width =
          progressPercent + 10 + "%";

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          adCompleted = true;
          notifyCompletion();
        }
      }

      function notifyCompletion() {
        fetch("${process.env.URL}/track-views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
           adId: "${ad.adId._id}",
            userId: "${userId}",
          }),
        }).then((response) => {
          if (response.ok) {
            window.parent.postMessage(
              {
                type: "rewardedAdCompleted",
                  adId: "${ad.adId._id}",
                rewardGranted: adCompleted,
              },
              "*"
            );
          }
        });
      }

       ${
         ad.mediaType === "image"
           ? `  timerInterval = setInterval(updateTimer, 1000);`
           : `const video = document.getElementById('ad-video');
      video.addEventListener('play', () => {
        timerInterval = setInterval(updateTimer, 1000);
      });`
       }

      // التعامل مع زر الإغلاق
      document.getElementById("closeBtn").addEventListener("click", () => {
        clearInterval(timerInterval);
        document.getElementById("confirmationDialog").style.display = "flex";
      });

      document.getElementById("continueBtn").addEventListener("click", () => {
        document.getElementById("confirmationDialog").style.display = "none";
        timeLeft = Math.max(1, timeLeft);
        timerInterval = setInterval(updateTimer, 1000);
      });

      document.getElementById("go").addEventListener("click", async () => {
        try {
          const response = await fetch("${process.env.URL}/track-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adId: "${ad.adId._id}",
              clickedAt: new Date().toISOString(),
              userId:"${userId}",
            }),
          });
        } catch (error) {
          console.error("Tracking error:", error);
        }
      });

      document
        .getElementById("confirmCloseBtn")
        .addEventListener("click", () => {
          clearInterval(timerInterval);
          notifyCompletion();
          window.parent.postMessage(
            {
              type: "rewardedAdClosed",
              adId: "${ad._id}",
              rewardGranted: false,
            },
            "*"
          );
        });

      // إرسال رسالة عند تحميل الصفحة
      window.parent.postMessage(
        {
          type: "rewardedAdLoaded",
          adId: "${ad._id}",
        },
        "*"
      );
    </script>
  </body>
</html>

  `;
}
