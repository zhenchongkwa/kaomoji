(function () {
  "use strict";

  var BLANK = "⠀";   // อักษรเบรลล์ว่าง: SNS ไม่ตัดทิ้งเหมือนช่องว่างธรรมดา ใช้กันบรรทัดชิดซ้าย
  var FULL = "　";    // ช่องว่างเต็มตัว
  var HALF = " ";    // en space (ครึ่งตัว)

  // กรอบ: top/bottom รับ n = จำนวนตัวเส้นตรงกลาง (คำนวณจากการวัดความกว้างจริง)
  var FRAMES = {
    heart: {
      key: "frHeart",
      top: function (n) { return "┏━♡" + rep("━", n) + "♡━┓"; },
      bottom: function (n) { return "┗━♡" + rep("━", n) + "♡━┛"; },
      left: "♥", right: "♥"
    },
    star: {
      key: "frStar",
      top: function (n) { return "┏━☆" + rep("━", n) + "☆━┓"; },
      bottom: function (n) { return "┗━☆" + rep("━", n) + "☆━┛"; },
      left: "★", right: "★"
    },
    simple: {
      key: "frSimple",
      top: function (n) { return "┌" + rep("─", n) + "┐"; },
      bottom: function (n) { return "└" + rep("─", n) + "┘"; },
      left: "│", right: "│"
    },
    fluffy: {
      key: "frFluffy",
      top: function (n) { return "╭" + rep("⌒", n) + "╮"; },
      bottom: function (n) { return "╰" + rep("◡", n) + "╯"; },
      left: "（", right: "）"
    },
    ribbon: {
      key: "frRibbon",
      top: function (n) { return "୨୧" + rep("┈", n) + "୨୧"; },
      bottom: function (n) { return "୨୧" + rep("┈", n) + "୨୧"; },
      left: "┊", right: "┊"
    }
  };

  var ANIMALS = {
    none: { key: "anNone", lines: [] },
    cat: { key: "anCat", lines: ["ฅ^•ﻌ•^ฅ"] },
    cats: { key: "anCats", lines: ["ฅ^•ﻌ•^ฅ　ฅ^•ﻌ•^ฅ"] },
    dog: { key: "anDog", lines: ["૮ ・ﻌ・ა"] },
    dogcat: { key: "anDogCat", lines: ["૮ ・ﻌ・ა　ฅ^•ﻌ•^ฅ"] },
    bear: { key: "anBear", lines: ["ʕ •ᴥ• ʔ"] },
    rabbit: { key: "anRabbit", lines: ["(\\ (\\", "( „• ֊ •„)"] },
    hamster: { key: "anHamster", lines: ["∩　∩", "( ˙ᴥ˙ )"] },
    chick: { key: "anChick", lines: ["( •ө• )"] },
    pig: { key: "anPig", lines: ["( ´(00)ˋ )"] },
    bearrabbit: { key: "anBearRabbit", lines: ["ʕ •ᴥ• ʔ　／(･ × ･)＼"] }
  };

  function rep(s, n) { return n > 0 ? new Array(n + 1).join(s) : ""; }

  var $ = function (id) { return document.getElementById(id); };
  var input = $("input"), out = $("out"), widthEl = $("width");
  var state = { frame: "heart", animal: "none", align: "center" };

  // ---------- วัดความกว้างด้วยฟอนต์จริง (ฟอนต์เดียวกับกล่องตัวอย่าง) ----------
  var measurer = document.createElement("span");
  measurer.className = "post-measure";
  document.body.appendChild(measurer);
  var cache = new Map();
  function px(s) {
    if (cache.has(s)) return cache.get(s);
    measurer.textContent = s;
    var w = measurer.getBoundingClientRect().width;
    cache.set(s, w);
    return w;
  }

  // ช่องว่างที่กว้างใกล้เคียง target px ที่สุด (ประกอบจากช่องว่างเต็ม + ครึ่ง)
  function padPx(target) {
    if (target <= 0) return "";
    var f = px(FULL), h = px(HALF);
    var best = "", bestErr = target;
    for (var nf = 0; nf * f <= target + f; nf++) {
      for (var nh = 0; nh <= 2; nh++) {
        var err = Math.abs(target - (nf * f + nh * h));
        if (err < bestErr) { bestErr = err; best = rep(FULL, nf) + rep(HALF, nh); }
      }
    }
    return best;
  }

  // ตัดบรรทัดให้กว้างไม่เกิน max px (พยายามตัดที่ช่องว่างก่อน)
  function wrap(line, max) {
    var gs = KaoFonts.graphemes(line), out = [], cur = [];
    for (var i = 0; i < gs.length; i++) {
      cur.push(gs[i]);
      if (px(cur.join("")) > max && cur.length > 1) {
        var sp = cur.lastIndexOf(" ");
        if (sp > 0) {
          out.push(cur.slice(0, sp).join(""));
          cur = cur.slice(sp + 1);
        } else {
          var last = cur.pop();
          out.push(cur.join(""));
          cur = last === " " ? [] : [last];
        }
      }
    }
    out.push(cur.join(""));
    return out;
  }

  // หาจำนวนเส้นที่ทำให้ขอบบน/ล่างกว้างใกล้ target ที่สุด
  function fitEdge(fn, target) {
    var best = 0, bestErr = Infinity;
    for (var n = 0; n < 80; n++) {
      var err = Math.abs(px(BLANK + fn(n)) - target);
      if (err < bestErr) { bestErr = err; best = n; }
      else if (px(BLANK + fn(n)) > target) break;
    }
    return BLANK + fn(best);
  }

  function build() {
    var f = FRAMES[state.frame];
    var inner = Number(widthEl.value) * px(FULL);
    var text = input.value.replace(/\s+$/, "") || Kao.t("frameDefault");
    var rows = [];
    text.split("\n").forEach(function (l) { rows = rows.concat(wrap(l.trim(), inner)); });

    var head = BLANK + f.left + FULL, tail = FULL + f.right;
    var body = rows.map(function (r) {
      var rem = Math.max(0, inner - px(r));
      var left = state.align === "center" ? padPx(rem / 2) : "";
      var right = padPx(rem - px(left));
      return head + left + r + right + tail;
    });
    var rowW = px(head) + inner + px(tail);

    var lines = [];
    var animal = ANIMALS[state.animal].lines;
    if (animal.length) {
      var aw = Math.max.apply(null, animal.map(px));
      var off = padPx((rowW - px(BLANK) - aw) / 2);
      animal.forEach(function (a) { lines.push(BLANK + off + a); });
    }
    lines.push(fitEdge(f.top, rowW));
    lines = lines.concat(body);
    lines.push(fitEdge(f.bottom, rowW));
    return lines.join("\n");
  }

  // มีบรรทัดไหนกว้างเกินความกว้างข้อความในไทม์ไลน์มือถือ (~295px บนจอ 375px) ไหม
  var TIMELINE_W = 295;
  function fits(text) {
    var max = TIMELINE_W;
    return text.split("\n").every(function (l) { return px(l) <= max + 0.5; });
  }

  function update() {
    var text = build();
    out.textContent = text;
    var ok = fits(text);
    var fit = $("fit");
    fit.textContent = ok ? Kao.t("frameOk") : Kao.t("frameWarn");
    fit.classList.toggle("warn", !ok);
    $("widthVal").textContent = Kao.t("frameWidthVal", widthEl.value);
  }

  function chipGroup(el, map, field) {
    el.innerHTML = "";
    Object.keys(map).forEach(function (id) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (state[field] === id ? " active" : "");
      b.dataset.id = id;
      b.textContent = Kao.t(map[id].key);
      el.appendChild(b);
    });
    el.onclick = function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      state[field] = b.dataset.id;
      el.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
      update();
    };
  }

  $("alignChips").addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    state.align = b.dataset.align;
    this.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    update();
  });
  input.addEventListener("input", update);
  widthEl.addEventListener("input", update);
  $("copyBtn").addEventListener("click", function () { Kao.copyAndToast(build(), ""); });
  $("clearBtn").addEventListener("click", function () { input.value = ""; update(); input.focus(); });
  window.addEventListener("resize", update);

  Kao.onLang(function () {
    chipGroup($("frameChips"), FRAMES, "frame");
    chipGroup($("animalChips"), ANIMALS, "animal");
    update();
  });
  Kao.jumpButton("preview");
  Kao.start();
  // ฟอนต์เว็บโหลดเสร็จแล้วความกว้างเปลี่ยน — ล้าง cache แล้ววาดใหม่
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { cache.clear(); update(); });
})();
