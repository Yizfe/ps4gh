function send_payload(file) {
  alert("📡 Connecting to payload server...");

  var ws = new WebSocket("ws://192.168.50.120:9020/send");
  ws.binaryType = 'arraybuffer';

  ws.onopen = function () {
    alert("✅ Connected! Fetching payload: " + file);

    fetch(file)
      .then(response => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.arrayBuffer();
      })
      .then(payload => {
        alert("📤 Sending payload...");
        ws.send(payload);
        alert("✅ Payload sent successfully.");
        ws.close();
      })
      .catch(err => {
        alert("❌ Failed to fetch/send payload:\n" + err);
      });
  };

  ws.onerror = function () {
    alert("❌ WebSocket error. Is your payload sender running on port 9020?\nMake sure your PS4 and PC are on the same network.");
  };

  ws.onclose = function () {
    alert("🔌 WebSocket connection closed.");
  };
}
