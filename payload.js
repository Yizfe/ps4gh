function send_payload(filename) {
  var req = new XMLHttpRequest();
  req.open("GET", filename, true);
  req.responseType = "arraybuffer";

  req.onload = function () {
    var payload = new Uint8Array(req.response);
    var socket = new WebSocket("ws://" + location.hostname + ":9020/");
    socket.binaryType = "arraybuffer";

    socket.onopen = function () {
      socket.send(payload);
      socket.close();
      alert("✅ GoldHEN payload sent!");
    };

    socket.onerror = function () {
      alert("❌ WebSocket failed. Make sure PS4 is Awaiting Payload.");
    };
  };

  req.onerror = function () {
    alert("❌ Could not fetch " + filename);
  };

  req.send();
}
