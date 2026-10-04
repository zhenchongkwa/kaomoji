/*
 * Intro เปิดเว็บ: "kao ▢ moji"
 * พื้นดำ ตัวขาว — คำว่า kaomoji แยกตรงกลางเป็นช่อง แล้วการ์ดคาโอโมจิสีพาสเทลสลับเร็ว-ช้าข้างใน
 * ตัวนับ 100→000 ด้านล่าง จากนั้นช่องปิด คำกลับมาติดกัน แล้วม่านดำหดขึ้นเผยหน้าเว็บ
 * โหลดใน <head> เพื่อซ่อนหน้าเว็บตั้งแต่แรก, เล่นครั้งเดียวต่อ session, คลิก/กดปุ่มเพื่อข้าม,
 * ไม่เล่นถ้าผู้ใช้ตั้ง reduced motion
 */
(function () {
  "use strict";

  var KEY = "kao.introSeen";
  try {
    if (sessionStorage.getItem(KEY)) return;
  } catch (e) { return; }
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var root = document.documentElement;
  root.classList.add("intro-on");

  var TILES = [
    ["(＾▽＾)", "#ffd0dc"], ["ʕ•ᴥ•ʔ", "#ffe8a8"], ["(⊙_⊙)", "#c4ecd9"], ["ฅ^•ﻌ•^ฅ", "#ddd2ff"],
    ["(╯°□°)╯", "#cbe7ff"], ["˘ᵕ˘", "#ffd8c4"], ["(っ˘ڡ˘ς)", "#c4ecd9"], ["♡", "#ffd0dc"],
    ["(✿◠‿◠)", "#ddd2ff"], ["ᐛ", "#ffe8a8"], ["(ง •̀_•́)ง", "#cbe7ff"], ["(◕‿◕)", "#ffd8c4"]
  ];

  // ไทม์ไลน์ (ms)
  var T_OPEN = 700;           // ตัวอักษรขึ้นเสร็จ → เปิดช่อง
  var T_CYCLE = 1500;         // เริ่มสลับการ์ด + นับถอยหลัง
  var CYCLE_MS = 2000;        // ช่วงสลับ (ช้า→เร็ว→ช้า)
  var T_CLOSE = T_CYCLE + CYCLE_MS + 150;
  var T_LIFT = T_CLOSE + 650; // ม่านหดขึ้น
  var LIFT_MS = 1000;

  function build() {
    var el = document.createElement("div");
    el.className = "intro";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="intro-inner">' +
        '<div class="intro-row" aria-label="kaomoji">' +
          '<span class="intro-mask"><span class="intro-w">kao</span></span>' +
          '<span class="intro-win">' +
            TILES.map(function (t) {
              return '<span class="intro-tile" style="background:' + t[1] + '">' + t[0] + "</span>";
            }).join("") +
          "</span>" +
          '<span class="intro-mask"><span class="intro-w">moji</span></span>' +
        "</div>" +
        '<p class="intro-by">by zhenchong</p>' +
        '<div class="intro-count" id="introCount">100</div>' +
      "</div>";
    document.body.insertBefore(el, document.body.firstChild);
    return el;
  }

  function run() {
    var el = build();
    var tiles = el.querySelectorAll(".intro-tile");
    var count = document.getElementById("introCount");
    var timers = [], done = false, cur = 0, cycleStart = 0;

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function show(i, first) {
      tiles[cur].classList.remove("on", "first");
      cur = i;
      tiles[cur].classList.add("on");
      if (first) tiles[cur].classList.add("first");
    }

    // ช่วงห่างระหว่างการ์ด: ช้า (260ms) ตอนต้น/ท้าย เร็ว (60ms) ตรงกลาง — เส้นโค้ง sine
    function gap(p) { return 60 + 200 * (1 - Math.sin(p * Math.PI)); }

    function cycle() {
      if (done) return;
      var p = (performance.now() - cycleStart) / CYCLE_MS;
      if (p >= 1) return;
      show((cur + 1) % tiles.length);
      later(cycle, gap(p));
    }

    function countDown() {
      var t0 = performance.now();
      var iv = setInterval(function () {
        var p = Math.min(1, (performance.now() - t0) / CYCLE_MS);
        var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
        count.textContent = String(Math.round(100 - e * 100)).padStart(3, "0");
        if (p >= 1 || done) clearInterval(iv);
      }, 30);
    }

    function lift() {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      el.classList.add("intro-lift");
      root.classList.remove("intro-on");
      setTimeout(function () { el.remove(); }, LIFT_MS + 150);
    }

    // ลำดับเหตุการณ์ (timer ล้วน ไม่พึ่ง rAF จึงไม่ค้างถ้าหน้าต่างถูกย่อ)
    later(function () { el.classList.add("s-rise"); }, 30);
    later(function () { el.classList.add("s-open"); show(0, true); }, T_OPEN);
    later(function () { cycleStart = performance.now(); countDown(); cycle(); }, T_CYCLE);
    later(function () { el.classList.add("s-close"); }, T_CLOSE);
    later(lift, T_LIFT);

    // ข้ามได้ด้วยคลิก / แตะ / กดปุ่ม
    el.addEventListener("pointerdown", lift);
    document.addEventListener("keydown", lift, { once: true });
    // กันค้าง
    setTimeout(lift, T_LIFT + 3000);
  }

  if (document.body) run();
  else document.addEventListener("DOMContentLoaded", run);
})();
