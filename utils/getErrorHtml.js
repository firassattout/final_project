export function getErrorHtml(message) {
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
        color: #999;
        background-color: #f5f5f5;
      }
      .error-container {
        text-align: center;
        padding: 20px;
        border-radius: 5px;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
    </style>
  </head>
  <body>
    <div class="error-container">
      <p>${message}</p>
    </div>
      <script nonce="my-nonce-123">

      window.parent.postMessage({
            type: 'adError',
            message: 'الإعلان غير متوفر'
          }, '*');

    </script>
  </body>

  </html>
  `;
}
