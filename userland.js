var p;

var print = function (string) {
  document.getElementById("console").innerHTML += string + "\n";
};

window.stage2 = function () {
  try {
    window.stage2_();
  } catch (e) {
    print("Stage2 error: " + e);
    fail();
  }
};

window.stage2_ = function () {
  p = window.prim;

  // Patch detection
  var test = p.syscall("sys_setuid", 0);

  if (test !== '0') {
    // Kernel not patched yet, run kernel.js
    var sc = document.createElement("script");
    sc.src = "kernel.js";
    document.body.appendChild(sc);
    return;
  }

  // Kernel patched: prepare GoldHEN payload injection
  const code_addr = new int64(0x26100000, 0x00000009);
  const buffer = p.syscall("sys_mmap", code_addr, 0x300000, 7, 0x41000, -1, 0);

  if (buffer.low === 0x26100000 && buffer.hi === 0x00000009) {
    fetch("goldhen.bin")
      .then(resp => resp.arrayBuffer())
      .then(buffer => {
        const payload = new Uint8Array(buffer);
        for (let i = 0; i < payload.length; i++) {
          p.write1(code_addr.add32(i), payload[i]);
        }

        p.fcall(code_addr);
        allset();
      })
      .catch(err => {
        print("❌ Payload load failed: " + err);
        fail();
      });
  } else {
    print("❌ sys_mmap failed");
    fail();
  }
};

function allset() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("allset").style.display = "block";
}

function fail() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("fail").style.display = "block";
}
