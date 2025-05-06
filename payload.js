function send_payload(fileName) {
  const ip = location.hostname;
  const port = 9020;
  const ws = new WebSocket(`ws://${ip}:${port}/send`);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    console.log("[INFO] WebSocket connection open");
    fetch(fileName)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then(payload => {
        ws.send(payload);
        console.log("[INFO] Payload sent successfully");
        ws.close();
      })
      .catch(err => {
        fail("Payload send error: " + err.message);
      });
  };

  ws.onerror = () => {
    fail("WebSocket error. Make sure port 9020 is open and sender is running.");
  };
}
