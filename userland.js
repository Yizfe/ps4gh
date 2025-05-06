// userland.js - Minimal GoldHEN loader

var p;

// Optional console printing
var print = function (string) {
  document.getElementById("console").innerHTML += string + "\n";
};

// Write GoldHEN binary into memory
function writeGoldHEN(p, code_addr) {
  fetch("goldhen.bin")
    .then(resp => resp.arrayBuffer())
    .then(buffer => {
      const payload = new Uint8Array(buffer);
      for (let i = 0; i < payload.length; i++) {
        p.write1(code_addr.add32(i), payload[i]);
      }
      print("[INFO] GoldHEN payload written to memory");
      p.fcall(code_addr);
      allset();
    })
    .catch(err => fail("Failed to load GoldHEN: " + err));
}

// Kernel exploit stage
window.stage2 = function () {
  try {
    p = window.prim;
    const isKernelPatched = p.syscall("sys_setuid", 0);

    if (isKernelPatched != '0') {
      // Not patched, load kernel.js
      const sc = document.createElement("script");
      sc.src = "kernel.js";
      document.body.appendChild(sc);
      return;
    }

    // Already patched, load GoldHEN
    const code_addr = new int64(0x26100000, 0x00000009);
    const buffer = p.syscall("sys_mmap", code_addr, 0x300000, 7, 0x41000, -1, 0);

    if (buffer.low === 0x26100000 && buffer.hi === 0x00000009) {
      writeGoldHEN(p, code_addr);
    } else {
      fail("sys_mmap failed");
    }
  } catch (e) {
    fail("Stage2 error: " + e);
  }
};

function allset() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("awaiting").style.display = "none";
  document.getElementById("allset").style.display = "block";
}

function fail(msg) {
  document.getElementById("loader").style.display = "none";
  document.getElementById("awaiting").style.display = "none";
  document.getElementById("fail").style.display = "block";
  if (msg) print("[ERROR] " + msg);
}
