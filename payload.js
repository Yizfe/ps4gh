function send_payload(fileName) {
  const ip = "192.168.50.120"; // ✅ Replace with your actual PC IP if different
  const port = 9020;
  const url = `ws://${ip}:${port}/send`;
  const ws = new WebSocket(url);

  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    fetch(fileName)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then(payload => {
        ws.send(payload);
        ws.close();
      })
      .catch(err => {
        console.error("❌ Failed to send payload:", err);
        fail(); // Call fail UI if something breaks
      });
  };

  ws.onerror = (e) => {
    console.error("❌ WebSocket error:", e);
    fail(); // Trigger UI fail state
  };
}
