var p;

var print = function (msg) {
  if (typeof msg === 'undefined') msg = '❌ Unknown error';
  const el = document.getElementById("console");
  if (el) el.innerHTML += msg + "<br>";
  console.log(msg);
};

window.stage2 = function () {
  try {
    window.stage2_();
  } catch (e) {
    print("Stage2 error: " + (e.message || e));
    fail();
  }
};

window.stage2_ = async function () {
  p = window.prim;

  // Try mmap memory for payload
  const code_addr = new int64(0x26100000, 0x00000009);
  const buffer = p.syscall("sys_mmap", code_addr, 0x300000, 7, 0x41000, -1, 0);

  if (!(buffer.low === 0x26100000 && buffer.hi === 0x00000009)) {
    print("❌ sys_mmap failed. Returned: " + buffer.toString());
    return fail();
  }

  // Show UI state
  document.getElementById("loader").style.display = "none";
  document.getElementById("awaiting").style.display = "block";

  try {
    const payload = await fetch("goldhen.bin").then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.arrayBuffer();
    });

    const bytes = new Uint8Array(payload);
    for (let i = 0; i < bytes.length; i++) {
      p.write1(code_addr.add32(i), bytes[i]);
    }

    p.fcall(code_addr);
    print("✅ GoldHEN payload injected successfully.");
    return allset();
  } catch (e) {
    print("❌ Payload injection failed: " + (e.message || e));
    return fail();
  }
};

function allset() {
  document.getElementById("awaiting").style.display = "none";
  document.getElementById("allset").style.display = "block";
}

function fail() {
  document.getElementById("awaiting").style.display = "none";
  document.getElementById("fail").style.display = "block";
}
