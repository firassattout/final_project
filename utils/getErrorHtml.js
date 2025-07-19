export function getErrorHtml(message, nonce) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>خطأ في الإعلان</title>
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      font-family: sans-serif; 
      color: #333;
      background-color: #f5f5f5;
    }
    .error-container {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    button {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      background-color: #e74c3c;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: #c0392b;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <p>${message}</p>
    <button id="closeAdBtn">إغلاق</button>
  </div>

     <script nonce="${nonce}">

    // إرسال رسالة الإغلاق عند الضغط على الزر
    document.getElementById("closeAdBtn").addEventListener("click", function () {
      window.parent.postMessage({
        type: 'rewardedAdClosed',
        message: 'تم إغلاق الإعلان'
      }, '*');
    });
  </script>
</body>
</html>

  `;
}
