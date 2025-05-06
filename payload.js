function send_payload(fileName) {
  const ip = location.hostname; // ✅ Replace with your PC IP if different
  const port = 9020;
  const url = `ws://${ip}:${port}/send`;
  const ws = new WebSocket(url);

  ws.binaryType = "arraybuffer";

  ws.onopen = function () {
    console.log(`[INFO] WebSocket connected: ${url}`);
    
    fetch(fileName)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then(payload => {
        ws.send(payload);
        console.log(`[INFO] Sent payload: ${fileName}`);
        ws.close();
      })
      .catch(err => {
        alert(`❌ Failed to send payload '${fileName}': ${err.message}`);
      });
  };

  ws.onerror = function (err) {
    alert("❌ WebSocket error.\nMake sure your payload sender is running on port 9020.\nCheck that your PC and PS4 are on the same network.");
    console.error("[ERROR] WebSocket:", err);
  };
}
