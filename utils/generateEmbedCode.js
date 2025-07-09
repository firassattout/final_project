export function generateEmbedCode(ad, url, userId, type, nonce) {
  if (ad.mediaType === "image")
    switch (type) {
      case "banner":
        return generateBannerEmbedCode(ad, url, userId, nonce);
      case "rewarded":
        return generateRewardedEmbedCode(ad, url, userId, nonce);

      default:
        throw new Error("نوع الإعلان غير مدعوم");
    }
  else {
    switch (type) {
      case "rewarded":
        return generateRewardedEmbedCode(ad, url, userId, nonce);

      default:
        throw new Error("نوع الإعلان غير مدعوم");
    }
  }
}

function generateBannerEmbedCode(ad, url, userId, nonce) {
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

    <script nonce="${nonce}">
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

function generateRewardedEmbedCode(ad, mediaUrl, userId, nonce, duration = 10) {
  if (ad.adId.platform === "web")
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>إعلان مكافأة - ${ad.adId.title}</title>
<style>
      /* الأنماط الأصلية مع إضافة تنسيق جديد لأزرار الإجراءات */
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
      .report-dialog {
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
      .dialog-content {
        background: #404040;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        max-width: 80%;
      }
      .dialog-textarea {
        width: 100%;
        min-height: 100px;
        margin: 10px 0;
        padding: 10px;
        border-radius: 5px;
        border: none;
        resize: vertical;
      }
      .dialog-message {
        margin: 10px 0;
        color: #fff;
        font-size: 16px;
      }
      .dialog-message.success {
        color: #4caf50;
      }
      .dialog-message.error {
        color: #f44336;
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
      /* تحسين تنسيق أزرار الإجراءات */
      .action-buttons {
        display: flex;
        gap: 15px;
        align-items: center;
        justify-content: center;
      }
      .continue-btn2,
      .report-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .continue-btn2 {
        background: #4caf50;
        color: white;
      }
      .continue-btn2:hover {
        background: #45a049;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }
      .close-btn:hover {
        background:rgb(255, 42, 0);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      
      }
      .continue-btn2:active {
        transform: translateY(0);
        box-shadow: none;
      }
      .report-btn {
        background: #ff9800;
        color: white;
      }
      .report-btn:hover {
        background: #e68a00;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }
      .report-btn:active {
        transform: translateY(0);
        box-shadow: none;
      }
      @media only screen and (max-width: 800px) {
        .ad-image-container {
          width: 100%;
          height: 80vh;
        }
        .action-buttons {
          flex-direction: column;
          gap: 10px;
        }
        .continue-btn2,
        .report-btn {
          width: 100%;
          max-width: 200px;
          padding: 8px 15px;
          font-size: 14px;
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
         <div class="action-buttons">
          <a
            href="http://${ad.adId.url}"
            target="_blank"
            class="continue-btn2"
            id="go"
            rel="noopener noreferrer"
          >
            زيارة الموقع
          </a>
          <button class="report-btn" id="reportBtn">إبلاغ</button>
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
      <div class="dialog-content">
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

    <div class="report-dialog" id="reportDialog">
      <div class="dialog-content">
        <h3>الإبلاغ عن الإعلان</h3>
        <textarea
          class="dialog-textarea"
          id="reportMessage"
          placeholder="اكتب سبب الإبلاغ هنا..."
        ></textarea>
        <p class="dialog-message" id="reportResult" style="display: none;"></p>
        <div class="dialog-buttons">
          <button class="dialog-btn submit-report-btn" id="submitReportBtn">
            إرسال
          </button>
          <button class="dialog-btn close-btn2" id="cancelReportBtn">
            إلغاء
          </button>
        </div>
      </div>
    </div>

    <script nonce="${nonce}">
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
          ? `timerInterval = setInterval(updateTimer, 1000);`
          : `const video = document.getElementById('ad-video');
      video.addEventListener('play', () => {
        timerInterval = setInterval(updateTimer, 1000);
      });`
      }

      document.getElementById("closeBtn").addEventListener("click", () => {
        clearInterval(timerInterval);
        if (adCompleted) {
          // إغلاق مباشر إذا اكتمل الإعلان
          notifyCompletion();
          window.parent.postMessage(
            {
              type: "rewardedAdClosed",
              adId: "${ad._id}",
              rewardGranted: false,
            },
            "*"
          );
        } else {
          // عرض نافذة التأكيد إذا لم يكتمل الإعلان
          document.getElementById("confirmationDialog").style.display = "flex";
        }
      });

      document.getElementById("continueBtn").addEventListener("click", () => {
        document.getElementById("confirmationDialog").style.display = "none";
        timeLeft = Math.max(1, timeLeft);
        timerInterval = setInterval(updateTimer, 1000);
      });

      document.getElementById("confirmCloseBtn").addEventListener("click", () => {
        clearInterval(timerInterval);
        window.parent.postMessage(
          {
            type: "rewardedAdClosed",
            adId: "${ad._id}",
            rewardGranted: false,
          },
          "*"
        );
      });

      document.getElementById("go").addEventListener("click", async () => {
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

      // التعامل مع زر الإبلاغ
      document.getElementById("reportBtn").addEventListener("click", () => {
        document.getElementById("reportDialog").style.display = "flex";
        document.getElementById("reportResult").style.display = "none"; // إخفاء رسالة النتيجة عند فتح النافذة
      });

      document.getElementById("cancelReportBtn").addEventListener("click", () => {
        document.getElementById("reportDialog").style.display = "none";
        document.getElementById("reportMessage").value = "";
        document.getElementById("reportResult").style.display = "none";
      });

      document.getElementById("submitReportBtn").addEventListener("click", async () => {
        const reportMessage = document.getElementById("reportMessage").value.trim();
        const reportResult = document.getElementById("reportResult");

        if (!reportMessage) {
          reportResult.textContent = "يرجى كتابة سبب الإبلاغ";
          reportResult.className = "dialog-message error";
          reportResult.style.display = "block";
          return;
        }

        try {
          const response = await fetch("${process.env.URL}/report-ad", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adId: "${ad.adId._id}",
              userId: "${userId}",
              message: reportMessage,
              reportedAt: new Date().toISOString(),
            }),
          });

          if (response.ok) {
            reportResult.textContent = "تم إرسال البلاغ بنجاح";
            reportResult.className = "dialog-message success";
            reportResult.style.display = "block";
            setTimeout(() => {
              document.getElementById("reportDialog").style.display = "none";
              document.getElementById("reportMessage").value = "";
              reportResult.style.display = "none";
            }, 3000); // إخفاء النافذة بعد 3 ثوانٍ
          } else {
            reportResult.textContent = "فشل إرسال البلاغ، حاول مرة أخرى";
            reportResult.className = "dialog-message error";
            reportResult.style.display = "block";
          }
        } catch (error) {
          console.error("Report error:", error);
          reportResult.textContent = "حدث خطأ أثناء إرسال البلاغ";
          reportResult.className = "dialog-message error";
          reportResult.style.display = "block";
        }
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
