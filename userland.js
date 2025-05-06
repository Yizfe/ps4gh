var sc;
var p;
var print = x => document.getElementById("console").innerText += x + "\n";

// Utility for getting syscall addresses
var get_jmptgt = function (addr) {
  var z = p.read4(addr) & 0xFFFF;
  var y = p.read4(addr.add32(2));
  if (z !== 0x25ff) return 0;
  return addr.add32(y + 6);
};

// Clean kernel check + postExpl trigger
setTimeout(() => {
  var test = p.syscall("sys_setuid", 0);

  if (test !== '0') {
    sc = document.createElement("script");
    sc.src = "kernel.js";
    document.body.appendChild(sc);
  } else {
    window.postExpl(); // ✅ Call the payload stage
  }
}, 100);
