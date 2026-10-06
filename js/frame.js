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
    },
    round: {
      key: "frRound",
      top: function (n) { return "╭" + rep("─", n) + "╮"; },
      bottom: function (n) { return "╰" + rep("─", n) + "╯"; },
      left: "│", right: "│"
    },
    double: {
      key: "frDouble",
      top: function (n) { return "╔" + rep("═", n) + "╗"; },
      bottom: function (n) { return "╚" + rep("═", n) + "╝"; },
      left: "║", right: "║"
    },
    thick: {
      key: "frThick",
      top: function (n) { return "┏" + rep("━", n) + "┓"; },
      bottom: function (n) { return "┗" + rep("━", n) + "┛"; },
      left: "┃", right: "┃"
    },
    dotted: {
      key: "frDotted",
      top: function (n) { return "┌" + rep("┄", n) + "┐"; },
      bottom: function (n) { return "└" + rep("┄", n) + "┘"; },
      left: "┆", right: "┆"
    },
    flower: {
      key: "frFlower",
      top: function (n) { return "✿" + rep("┈", n) + "✿"; },
      bottom: function (n) { return "❀" + rep("┈", n) + "❀"; },
      left: "┊", right: "┊"
    },
    sparkle: {
      key: "frSparkle",
      top: function (n) { return "⋆｡˚" + rep("┈", n) + "˚｡⋆"; },
      bottom: function (n) { return "⋆｡˚" + rep("┈", n) + "˚｡⋆"; },
      left: "⋆", right: "⋆"
    },
    wave: {
      key: "frWave",
      top: function (n) { return "╭" + rep("〜", n) + "╮"; },
      bottom: function (n) { return "╰" + rep("〜", n) + "╯"; },
      left: "┆", right: "┆"
    },
    music: {
      key: "frMusic",
      top: function (n) { return "♪" + rep("─", n) + "♫"; },
      bottom: function (n) { return "♫" + rep("─", n) + "♪"; },
      left: "♪", right: "♪"
    },
    moon: {
      key: "frMoon",
      top: function (n) { return "☾" + rep("⋆", n) + "☽"; },
      bottom: function (n) { return "☽" + rep("⋆", n) + "☾"; },
      left: "⋆", right: "⋆"
    },
    bow: {
      key: "frBow",
      top: function (n) { return "ᰔ" + rep("─", n) + "ᰔ"; },
      bottom: function (n) { return "ᰔ" + rep("─", n) + "ᰔ"; },
      left: "│", right: "│"
    },
    paw: {
      key: "frPaw",
      top: function (n) { return "ฅ" + rep("─", n) + "ฅ"; },
      bottom: function (n) { return "ฅ" + rep("─", n) + "ฅ"; },
      left: "│", right: "│"
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
    bearrabbit: { key: "anBearRabbit", lines: ["ʕ •ᴥ• ʔ　／(･ × ･)＼"] },
    catpaw: { key: "anCatPaw", lines: ["ฅ(^･ω･^ฅ)"] },
    catsil: { key: "anCatSil", lines: ["ᓚᘏᗢ"] },
    catbunny: { key: "anCatBunny", lines: ["ฅ^•ﻌ•^ฅ　／(･ × ･)＼"] },
    puppy: { key: "anPuppy", lines: ["૮ ˶ᵔ ᵕ ᵔ˶ ა"] },
    floppy: { key: "anFloppy", lines: ["U・ᴥ・U"] },
    bearhug: { key: "anBearHug", lines: ["ʕっ•ᴥ•ʔっ"] },
    bears: { key: "anBears", lines: ["ʕ •ᴥ•ʔ　ʕ•ᴥ• ʔ"] },
    bunnyears: { key: "anBunnyEars", lines: ["／(･ × ･)＼"] },
    chubby: { key: "anChubby", lines: ["(｡•ㅅ•｡)"] },
    mouse: { key: "anMouse", lines: ["ᘛ⁐̤ᕐᐷ"] },
    bird: { key: "anBird", lines: ["(・θ・)"] },
    penguin: { key: "anPenguin", lines: ["<(｀^´)>"] },
    owl: { key: "anOwl", lines: ["(◉Θ◉)"] },
    fish: { key: "anFish", lines: ["><(((°>"] },
    sheep: { key: "anSheep", lines: ["@(・●・)@"] }
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
  function domPx(s) {
    measurer.textContent = s;
    return measurer.getBoundingClientRect().width;
  }
  // วัดด้วยการจัดวางจริงของเบราว์เซอร์เสมอ (canvas เลือกฟอนต์สำรองต่างจากหน้าเว็บ
  // โดยเฉพาะตอนหน้าเป็นภาษาไทย ทำให้เส้นกรอบ ━ วัดผิดไปเกือบเท่าตัว)
  function px(s) {
    if (cache.has(s)) return cache.get(s);
    var w = domPx(s);
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
  // หาจำนวนเส้นที่ทำให้ขอบบน/ล่างกว้างใกล้ target ที่สุด
  // (ความกว้างของเส้นแต่ละความยาวถูกจำไว้ใน cache พิมพ์ข้อความต่อก็ไม่ต้องวัดใหม่)
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
      if (map[id].lines && !Kao.supports(map[id].lines.join(""))) return; // เครื่องนี้แสดงไม่ได้
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (state[field] === id ? " active" : "");
      b.dataset.id = id;
      b.textContent = Kao.t(map[id].key);
      el.appendChild(b);
    });
    // รายการยาว: โชว์ส่วนแรก + ปุ่มดูเพิ่ม
    Kao.collapse(el, field === "frame" ? 8 : 10);
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
  // พิมพ์เร็วๆ ก็คำนวณแค่ครั้งเดียวต่อเฟรม
  var queued = false;
  function queueUpdate() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; update(); });
  }
  input.addEventListener("input", queueUpdate);
  widthEl.addEventListener("input", queueUpdate);
  $("copyBtn").addEventListener("click", function () { Kao.copyAndToast(build(), ""); });
  $("clearBtn").addEventListener("click", function () { input.value = ""; update(); input.focus(); });
  window.addEventListener("resize", queueUpdate);

  Kao.onLang(function () {
    chipGroup($("frameChips"), FRAMES, "frame");
    chipGroup($("animalChips"), ANIMALS, "animal");
    cache.clear(); // ภาษาของหน้าเปลี่ยน = ฟอนต์สำรองอาจเปลี่ยน ความกว้างที่จำไว้ใช้ไม่ได้
    update();
  });
  Kao.jumpButton("preview");
  Kao.start();
  // ฟอนต์เว็บโหลดเสร็จแล้วความกว้างเปลี่ยน — ล้าง cache แล้ววาดใหม่
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { cache.clear(); update(); });
})();
