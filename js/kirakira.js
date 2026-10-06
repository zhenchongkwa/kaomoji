(function () {
  "use strict";

  // สัญลักษณ์แบ่งกลุ่ม (ชื่อกลุ่มอยู่ใน i18n เป็น sym_<id>) คั่นด้วยช่องว่าง
  var GROUPS = [
    { id: "stars", list: "⋆ ✦ ✧ ⟡ ★ ☆ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ✰ ⭑ ⭒ ✶ ✷ ✸ ✹ ✺ ✻ ✼ ❋ ⁂ ⁎ ⁑ ✱ ✲ ✳ ꙳ ⊹ ˚ ° ₊ ⁺ ⋆｡ ｡ﾟ ･ﾟ ✧･ﾟ ☾ ☽ ☼ ☀︎ ☁︎ ⛅︎ ᯓ ⋆˙⟡" },
    { id: "hearts", list: "♡ ♥︎ ❤︎ ❣ ❥ ღ ♡⃛ ⸜♡⸝ ꒰♡꒱ ₊♡ ♡₊˚ ʚ ɞ ʚ♡ɞ 𐙚 ᰔ ⑅ ❦ ❧ ღ˘ ♡ゞ ⋆♡⋆ ୨♡୧ ˖♡˖ ♡︎ ε♡з" },
    { id: "flowers", list: "✿ ❀ ❁ ✾ ❃ ✽ ⚘ ꕤ ꕥ 𓇼 𓆸 ✤ ❊ ⁕ ✥ ❉ ❈ ✣ ✢ 𖧧 𓍯 𑁍 ⚜︎ ☘︎ 𓋼 𓍊" },
    { id: "brackets", list: "꒰ ꒱ ꒰ა ໒꒱ ୨୧ ˗ˏˋ ˎˊ˗ 「 」 『 』 【 】 《 》 ⟬ ⟭ ⦅ ⦆ ⸜ ⸝ ◜ ◝ ◟ ◞ ⌜ ⌟ ✧˖° °˖✧ ⊰ ⊱ ⋘ ⋙ ⫷ ⫸ ꧁ ꧂ ༺ ༻" },
    { id: "lines", list: "︶ ︵ ⌒ ‿ ⁀ ┈ ┄ ─ ━ ═ ⋯ ･･･ ‧₊˚ ⋆⋅ ꒷ ꒦ ︶꒷ ꒦︶ ⏝ ⏜ ⋰ ⋱ ≈ 〰 ～ ⌇ ┊ ┆ ⁝ ⫶" },
    { id: "cute", list: ".ᐟ ᐟ ⸝⸝ ᵕ̈ ˶ ⑅ 𓂃 𓈒 𓏸 ᜊ ꔛ ⌯ =͟͟͞͞ ↻ ⇆ ✎ ✐ ✉︎ ☏ ♪ ♫ ♬ ☕︎ ☂︎ ⌘ ⚐ ⚑ ♕ ♛ ✈︎ ⌕ ⚲ ☺︎ ☻ ⍤ ᵔᴥᵔ ꕀ ⊂⊃ ꒳ ⍣" }
  ];

  var PRESETS = [
    "⋆｡˚☁︎˚｡⋆", "ᯓ★", "✧˖°", "⸝⸝꙳", "₊˚⊹♡", "꒰ა ♡ ໒꒱", "˗ˏˋ ★ ˎˊ˗", "⋆˙⟡",
    "⭑.ᐟ", "🎀 ˚₊‧", "🍓⋆｡˚", "🌙⋆｡°✩", "💌 ⸝⸝", "🫧 ˚₊·", "🍒◝✩", "₊˚ʚ 🧸 ɞ˚₊",
    "✧･ﾟ: *✧･ﾟ:*", "⋆⭒˚.⋆", "🩵⸝⸝⋆", "🌷 ‧₊˚", "🍰 ⊹ ࣪ ˖", "⟡ ⋆ 🦢", "ᰔᩚ ⋆",
    "𓂃 ✍︎", "🪽 ✧", "✩°｡⋆⸜ 🎧", "꒰ 🍮 ꒱", "୨୧ ┈ 🌸", "◝✩ 🎐", "⋆｡°✩ 🫶🏻",
    "♡ ˗ˏˋ ˎˊ˗ ♡", "‧₊˚ ☁️⋅♡𓂃 ࣪ ִֶָ☾.", "⊹ ࣪ ˖ ୨୧ ˖ ࣪ ⊹", "✮⋆˙", "⋆.˚✮🎧✮˚.⋆", "ᡣ𐭩 ⊹",
    "꒰ঌ ⋆ ໒꒱", "˚ʚ♡ɞ˚", "⸜(｡˃ ᵕ ˂ )⸝♡", "‧₊˚✧ 🌸 ✧˚₊‧", "⋆⁺₊⋆ ☾⋆⁺₊⋆", "𓍯𓂃",
    "✿ ⋆ ˚｡⋆୨୧˚", "☁️ ⋆｡°✩", "₊ ⊹ 🐚 ⊹ ₊", "📼 ⋆⋅☆⋅⋆", "🌊 ˚₊‧", "🍵 ⊹ ˖",
    "🍑 ⸝⸝ ♡", "🫐 ⋆｡˚", "🍋 ✧˖°", "🌻 ‧₊˚", "🪐 ⋆⁺₊", "🌈 ⋆｡°", "🦋 ⊹ ˚",
    "🐾 ⸝⸝", "🐰 ୨୧", "🧁 ˚₊‧", "🕯️ ⋆˙⟡", "🎐 ⸝⸝꙳", "💿 ✧･ﾟ", "📷 ˚₊‧",
    "꒰ 🌙 ꒱", "꒰ 🍓 ꒱", "꒰ 🫧 ꒱", "⟡ ⋆ 🍒", "✦ ❤︎ ✦", "⋆ ♡ ⋆", "☆彡", "ミ☆",
    "₍ᐢ. ̫.ᐢ₎ ♡", "ʚ ⋆ ɞ", "⋆ ˚｡⋆୨୧˚ ˚୨୧⋆｡˚ ⋆", "˚₊‧꒰ა ☆ ໒꒱ ‧₊˚", "✦ ✧ ✦",
    "◟̽◞̽", "⋆˚꩜｡", "ılıll", "▶︎ ılıılıılı 0:10", "⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹"
  ];

  var $ = function (id) { return document.getElementById(id); };
  var input = $("input");

  // กลุ่มสัญลักษณ์เป็นแท็บ แสดงทีละกลุ่ม (รวมกันกว่า 200 ตัว เลื่อนหายาก)
  var symWrap = $("symbols");
  var tabs = document.createElement("nav");
  tabs.className = "chips sym-tabs";
  symWrap.before(tabs);
  var group = Kao.load("kao.symGroup", GROUPS[0].id);
  if (!GROUPS.some(function (g) { return g.id === group; })) group = GROUPS[0].id;
  var grids = {};
  GROUPS.forEach(function (g) {
    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "chip" + (g.id === group ? " active" : "");
    tab.dataset.group = g.id;
    tabs.appendChild(tab);
    var grid = document.createElement("div");
    grid.className = "sym-grid";
    grid.hidden = g.id !== group;
    grids[g.id] = grid;
    g.list.split(" ").forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sym";
      b.textContent = s;
      if ([...s].length > 2) b.classList.add("wide"); // สัญลักษณ์ยาวกินสองช่อง ไม่โดนตัด
      grid.appendChild(b);
    });
    symWrap.appendChild(grid);
  });
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    group = b.dataset.group;
    Kao.save("kao.symGroup", group);
    tabs.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    Object.keys(grids).forEach(function (id) { grids[id].hidden = id !== group; });
    if (window.Motion) Motion.enter(grids[group].children, { max: 24, gap: 10 });
  });
  symWrap.addEventListener("click", function (e) {
    var b = e.target.closest(".sym");
    if (!b) return;
    // แทรกตรงเคอร์เซอร์ (ไม่ focus ช่องพิมพ์ เพื่อไม่ให้คีย์บอร์ดมือถือเด้งทุกครั้ง)
    var start = input.selectionStart, end = input.selectionEnd;
    input.setRangeText(b.textContent, start, end, "end");
    Kao.sound("sparkle");
    if (window.Motion) Motion.burstAt(b, { count: 3, glyphs: [b.textContent] });
  });

  var presetWrap = $("presets");
  PRESETS.forEach(function (p) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pill";
    b.textContent = p;
    presetWrap.appendChild(b);
  });
  presetWrap.addEventListener("click", function (e) {
    var b = e.target.closest(".pill");
    if (b) Kao.copyAndToast(b.textContent);
  });

  $("copyBtn").addEventListener("click", function () {
    if (input.value) Kao.copyAndToast(input.value);
  });
  $("clearBtn").addEventListener("click", function () { input.value = ""; });

  // ซ่อนสัญลักษณ์/ชุดสำเร็จรูปที่เครื่องนี้แสดงไม่ได้ (เช็กทีละ 30 ตัวตอนเบราว์เซอร์ว่าง)
  Kao.whenFonts(function () {
    var queue = Array.prototype.slice.call(document.querySelectorAll(".sym, #presets .pill"));
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 16); };
    (function step() {
      queue.splice(0, 30).forEach(function (b) { if (!Kao.supports(b.textContent)) b.hidden = true; });
      if (queue.length) idle(step);
      else Kao.collapse(presetWrap, 24, ".pill"); // นับใหม่หลังซ่อนตัวที่แสดงไม่ได้
    })();
  });

  Kao.onLang(function () {
    tabs.querySelectorAll(".chip").forEach(function (b) { b.textContent = Kao.t("sym_" + b.dataset.group); });
    Kao.collapse(presetWrap, 24, ".pill");
  });
  Kao.start();
})();
