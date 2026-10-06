/*
 * เกมป๊อป (ซ่อนอยู่): จิ้มโลโก้รัวๆ 12 ทีถึงจะเปิด
 * แตะตัวนุ่มนิ่มกลางจอแล้วมันจะอ้าปาก "ป๊อป" แบบ popcat นับจำนวนครั้งเก็บไว้ในเบราว์เซอร์
 * ไฟล์นี้โหลดทีหลังเฉพาะตอนปลดล็อก (ดู openPop ใน common.js)
 */
(function () {
  "use strict";

  var t = Kao.t, M = window.Motion;
  var CLOSED = "( ˘ ᵕ ˘ )";
  var OPEN = ["( ˃ ᗜ ˂ )", "( ≧ ᗜ ≦ )", "( ᵔ ᗜ ᵔ )", "( • ᗜ • )"];
  var STAR = "( ★ ᗜ ★ )";
  var MAX_FLOATS = M && M.lite ? 4 : 14;

  var total = 0;
  try { total = parseInt(localStorage.getItem("kao.pops"), 10) || 0; } catch (e) {}
  var round = 0, dirty = false, opener = null, built = false;
  var el, buddy, face, totalEl, roundEl, floats = [];

  function save() {
    if (!dirty) return;
    dirty = false;
    try { localStorage.setItem("kao.pops", String(total)); } catch (e) {}
  }
  var saveTimer = 0;
  function saveSoon() {
    dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 600); // ไม่เขียน localStorage ทุกครั้งที่แตะ
  }

  function build() {
    el = document.createElement("div");
    el.className = "pop";
    el.hidden = true;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.innerHTML =
      '<button class="pop-close" type="button">×</button>' +
      '<div class="pop-count"><b class="pop-total"></b><span class="pop-total-label"></span></div>' +
      '<button class="pop-buddy" type="button"><span class="pop-cheek l"></span><span class="pop-cheek r"></span>' +
        '<span class="pop-face"></span></button>' +
      '<p class="pop-round" aria-live="polite"></p>' +
      '<p class="pop-hint"></p>';
    document.body.appendChild(el);
    buddy = el.querySelector(".pop-buddy");
    face = el.querySelector(".pop-face");
    totalEl = el.querySelector(".pop-total");
    roundEl = el.querySelector(".pop-round");
    face.textContent = CLOSED;

    // แตะตรงไหนก็นับ (นิ้วหลายนิ้วพร้อมกันก็นับทุกนิ้ว) ยกเว้นปุ่มปิด
    el.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".pop-close")) return;
      e.preventDefault();
      press(e.clientX, e.clientY);
    });
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("click", function (e) { if (e.target.closest(".pop-close")) close(); });
    // คีย์บอร์ด: Space / Enter กดค้าง = อ้าปาก ปล่อย = หุบ (กดค้างไม่นับซ้ำ)
    el.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { close(); return; }
      if ((e.key === " " || e.key === "Enter") && !e.target.closest(".pop-close")) {
        e.preventDefault();
        if (!e.repeat) press();
      }
    });
    el.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") release(); });
    window.addEventListener("popstate", function () { if (!el.hidden) close(true); });
    window.addEventListener("pagehide", save);
    built = true;
  }

  function labels() {
    el.setAttribute("aria-label", t("popBoop"));
    el.querySelector(".pop-close").setAttribute("aria-label", t("close"));
    buddy.setAttribute("aria-label", t("popBoop"));
    el.querySelector(".pop-total-label").textContent = t("popTotal");
    el.querySelector(".pop-hint").textContent = t("popHint");
    totalEl.textContent = total.toLocaleString();
    roundEl.textContent = t("popRound", round);
  }

  var held = 0;
  function press(x, y) {
    held++;
    total++;
    round++;
    saveSoon();
    var milestone = total % 100 === 0;
    face.textContent = milestone ? STAR : OPEN[(Math.random() * OPEN.length) | 0];
    totalEl.textContent = total.toLocaleString();
    roundEl.textContent = t("popRound", round);
    Kao.sound("boop");
    if (M) {
      M.to(buddy, { sx: 1.14, sy: 0.84, y: 10 }, { k: 1000, c: 32 });
      M.boing(totalEl, 2.5);
    }
    if (x == null) {
      var r = buddy.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height * 0.3;
    }
    floatPlus(x, y);
    if (milestone) {
      if (M) { M.burstAt(buddy, { count: 12 }); M.burst(x, y, { count: 8, glyphs: ["★", "✦", "♡"] }); }
      Kao.sound("favOn");
      Kao.toast(t("popMilestone", total));
    }
  }

  function release() {
    if (!held) return;
    held = 0;
    face.textContent = CLOSED;
    if (M) M.to(buddy, { sx: 1, sy: 1, y: 0 }, { k: 560, c: 11, vset: { sy: 3.2, sx: -2.6, y: 0 } });
  }

  // "+1" ลอยขึ้นจากจุดที่แตะ (WAAPI ทำงานบน compositor ไม่หน่วงเธรดหลัก)
  function floatPlus(x, y) {
    if (!Element.prototype.animate || (M && M.reduced)) return;
    if (floats.length >= MAX_FLOATS) floats.shift().remove();
    var f = document.createElement("span");
    f.className = "pop-plus";
    f.textContent = "+1";
    f.style.left = x + "px";
    f.style.top = y + "px";
    el.appendChild(f);
    floats.push(f);
    var dx = (Math.random() - 0.5) * 40;
    f.animate(
      [{ transform: "translate(-50%,-50%) scale(.6)", opacity: 0 },
       { transform: "translate(-50%,-120%) scale(1.1)", opacity: 1, offset: 0.2 },
       { transform: "translate(calc(-50% + " + dx + "px),-320%) scale(1)", opacity: 0 }],
      { duration: 700, easing: "cubic-bezier(.2,.7,.3,1)" }
    ).onfinish = function () {
      f.remove();
      var i = floats.indexOf(f);
      if (i >= 0) floats.splice(i, 1);
    };
  }

  function open(from) {
    if (!built) build();
    opener = from || document.activeElement;
    round = 0;
    labels();
    el.hidden = false;
    document.body.style.overflow = "hidden";
    // ปุ่มย้อนกลับบนมือถือ = ปิดเกม (ไม่ออกจากหน้า)
    try { history.pushState({ kaoPop: 1 }, ""); } catch (e) {}
    void el.offsetWidth; // ให้ transition จาก opacity 0 ทำงาน
    el.classList.add("open");
    if (M) {
      M.to(buddy, { s: 0.3, sx: 1, sy: 1, y: 40 }, { snap: true });
      M.to(buddy, { s: 1, y: 0 }, { k: 320, c: 14 });
    }
    buddy.focus({ preventScroll: true });
    Kao.sound("favOn");
  }

  function close(fromHistory) {
    if (!el || el.hidden) return;
    release();
    save();
    el.classList.remove("open");
    document.body.style.overflow = "";
    if (!fromHistory && history.state && history.state.kaoPop) history.back();
    setTimeout(function () {
      el.hidden = true;
      floats.forEach(function (f) { f.remove(); });
      floats = [];
    }, 220);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  Kao.onLang(function () { if (built) labels(); });
  window.KaoPop = { open: open, close: close };
})();
