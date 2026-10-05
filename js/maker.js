(function () {
  "use strict";

  // ชิ้นส่วนแบบคู่ [ซ้าย, ขวา] หรือเดี่ยว — ตัวเลือกแรกของ arms/cheeks/deco คือ "ไม่มี"
  var PARTS = [
    { id: "arms", key: "mkArms", pair: true, none: true, tone: 3, items: [
      ["", ""], ["ヽ", "ノ"], ["٩", "۶"], ["＼", "／"], ["┐", "┌"], ["ᕦ", "ᕤ"], ["ʅ", "ʃ"],
      ["⊂", "⊃"], ["ლ", "ლ"], ["ψ", "ψ"], ["o", "o"], ["୧", "୨"], ["ε", "з"], ["☆", "☆"], ["ฅ", "ฅ"]
    ] },
    { id: "face", key: "mkFace", pair: true, tone: 0, items: [
      ["(", ")"], ["（", "）"], ["ʕ", "ʔ"], ["꒰", "꒱"], ["૮", "ა"], ["[", "]"], ["｛", "｝"],
      ["₍", "₎"], ["ᐠ", "ᐟ"], ["⸜", "⸝"], ["|", "|"]
    ] },
    { id: "cheeks", key: "mkCheeks", pair: true, none: true, tone: 2, items: [
      ["", ""], ["˶", "˶"], ["⸝⸝", "⸝⸝"], ["*", "*"], ["〃", "〃"], ["๑", "๑"], ["灬", "灬"], [",,", ",,"]
    ] },
    { id: "eyes", key: "mkEyes", pair: true, tone: 4, items: [
      ["^", "^"], ["◕", "◕"], ["•", "•"], ["˘", "˘"], ["≧", "≦"], ["＾", "＾"], ["⊙", "⊙"], ["ಠ", "ಠ"],
      ["´", "`"], ["T", "T"], ["◉", "◉"], ["✧", "✧"], ["♡", "♡"], ["☆", "☆"], ["ꈍ", "ꈍ"], ["ᵔ", "ᵔ"],
      ["╥", "╥"], ["・", "・"], [">", "<"], ["ò", "ó"], ["°", "°"], ["¬", "¬"], ["˃", "˂"], ["⌒", "⌒"],
      ["ᐢ", "ᐢ"], ["ʘ", "ʘ"], ["$", "$"], ["x", "x"]
    ] },
    { id: "mouth", key: "mkMouth", pair: false, tone: 1, items: [
      "▽", "ω", "‿", "ᴗ", "꒳", "﹏", "ε", "Д", "◡", "∀", "ᴥ", "_", "3", "⌓", "ᗜ", "⩊",
      "益", "□", "‸", "△", "ڡ", "ㅅ", "ﻌ", "o", ".", "～"
    ] },
    { id: "deco", key: "mkDeco", pair: false, none: true, tone: 5, items: [
      "", "✧", "♡", "☆", "♪", "✿", "💦", "💢", "⋆˙⟡", "ﾉ✧", "zzZ", "♡♡", "!!", "?", "🎀", "✨"
    ] }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var faceEl = $("face"), wrap = $("parts");
  var sel = Kao.load("kao.maker", null) || { arms: 1, face: 0, cheeks: 1, eyes: 0, mouth: 0, deco: 1 };

  function part(id) { return PARTS.find(function (p) { return p.id === id; }); }
  function pick(id) {
    var p = part(id), i = Math.min(sel[id] || 0, p.items.length - 1);
    return p.items[i];
  }

  function build() {
    var arms = pick("arms"), face = pick("face"), ch = pick("cheeks"), eyes = pick("eyes");
    return arms[0] + face[0] + ch[0] + eyes[0] + pick("mouth") + eyes[1] + ch[1] + face[1] + arms[1] + pick("deco");
  }

  function update(pop) {
    faceEl.textContent = build();
    Kao.save("kao.maker", sel);
    if (pop) {
      faceEl.classList.remove("bump");
      void faceEl.offsetWidth; // เริ่มแอนิเมชันใหม่
      faceEl.classList.add("bump");
    }
  }

  // ตัวอย่างบนปุ่ม: แสดงชิ้นส่วนนั้นในหน้าพื้นฐาน เพื่อให้เห็นว่าจะออกมาแบบไหน
  function preview(p, item) {
    if (p.none && (item === "" || (Array.isArray(item) && item[0] === ""))) return Kao.t("mkNone");
    if (p.id === "eyes") return item[0] + "‿" + item[1];
    if (p.id === "mouth") return "•" + item + "•";
    if (p.pair) return item[0] + " " + item[1];
    return item;
  }

  function render() {
    wrap.innerHTML = "";
    PARTS.forEach(function (p) {
      var sec = document.createElement("section");
      sec.className = "panel";
      sec.dataset.tone = p.tone;
      var h = document.createElement("h2");
      h.className = "section-title";
      h.textContent = Kao.t(p.key);
      var chips = document.createElement("div");
      chips.className = "chips maker-chips";
      chips.dataset.part = p.id;
      p.items.forEach(function (item, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (sel[p.id] === i ? " active" : "");
        b.dataset.i = i;
        b.textContent = preview(p, item);
        chips.appendChild(b);
      });
      sec.append(h, chips);
      wrap.appendChild(sec);
    });
  }

  wrap.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    var id = b.parentNode.dataset.part;
    sel[id] = Number(b.dataset.i);
    b.parentNode.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    update(true);
  });

  function randomize() {
    PARTS.forEach(function (p) {
      // ชิ้นส่วนที่ "ไม่มี" ได้ มีโอกาสว่าง ~35% เพื่อไม่ให้รกเกินไป
      if (p.none && Math.random() < .35) sel[p.id] = 0;
      else sel[p.id] = (p.none ? 1 : 0) + Math.floor(Math.random() * (p.items.length - (p.none ? 1 : 0)));
    });
    render();
    update(true);
  }

  function copy() { Kao.copyAndToast(build()); }
  faceEl.addEventListener("click", copy);
  $("copyBtn").addEventListener("click", copy);
  $("randomBtn").addEventListener("click", function () { Kao.sound("sparkle"); randomize(); });
  $("saveBtn").addEventListener("click", function () {
    var k = build();
    var favs = Kao.load("kao.favs", []);
    if (favs.indexOf(k) < 0) { favs.unshift(k); Kao.save("kao.favs", favs); }
    Kao.sound("favOn");
    Kao.toast(Kao.t("mkSaved") + " <b>" + Kao.escapeHtml(k) + "</b>");
  });

  Kao.onLang(function () { render(); update(false); });
  Kao.start();
})();
