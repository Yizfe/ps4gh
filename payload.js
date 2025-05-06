function send_payload(file) {
  var ws = new WebSocket("ws://192.168.50.120:9020/send"); // <== replace with your PC IP
  ws.binaryType = 'arraybuffer';

  ws.onopen = function () {
    fetch(file)
      .then(r => r.arrayBuffer())
      .then(payload => ws.send(payload))
      .then(() => ws.close())
      .catch(err => alert("❌ Payload load failed: " + err));
  };

  ws.onerror = function () {
    alert("❌ WebSocket error. Is your payload sender running on port 9020?\nMake sure your PS4 and PC are on the same network.");
  };
}
