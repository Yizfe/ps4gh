var p;
var print = function (x) {
  document.getElementById("console").innerText += x + "\n";
};
var print = function (string) {
  document.getElementById("console").innerHTML += string + "\n";
};

window.stage2 = function () {
  try {
    window.stage2_();
  } catch (e) {
    print("Stage2 error: " + e);
  }
};

window.stage2_ = function () {
  p = window.prim;

  const code_addr = new int64(0x26100000, 0x00000009);
  const buffer = p.syscall("sys_mmap", code_addr, 0x300000, 7, 0x41000, -1, 0);

  if (buffer.low !== 0x26100000 || buffer.hi !== 0x00000009) {
    alert("❌ sys_mmap failed.");
    return;
  }

  fetch("goldhen.bin")
    .then(resp => resp.arrayBuffer())
    .then(buffer => {
      const payload = new Uint8Array(buffer);
      for (let i = 0; i < payload.length; i++) {
        p.write1(code_addr.add32(i), payload[i]);
      }
      p.fcall(code_addr); // Launch GoldHEN
    })
    .catch(err => alert("❌ Failed to load GoldHEN payload: " + err));
};
