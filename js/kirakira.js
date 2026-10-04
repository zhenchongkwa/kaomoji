(function () {
  "use strict";

  var SYMBOLS = [
    "⸝", "⸜", "⋆", "˚", "₊", "‧", "⁺", "✩", "★", "☆", "⭑", "⭒",
    "✦", "✧", "⟡", "⊹", "꙳", "ꕀ", "ᯓ", "◝", "◜", ".·", ".ᐟ", "˖",
    "꒰", "꒱", "꒰ა", "໒꒱", "୨୧", "ʚ", "ɞ", "𐙚", "♡", "♥︎", "❀", "✿",
    "☾", "☁︎", "𓂃", "𓈒", "𓏸", "ᰔ", "⑅", "︶", "⌒", "˗ˏˋ", "ˎˊ˗", "=͟͟͞͞",
    "⋱", "⋰", "+", "⌯", "ꔛ", "ᜊ"
  ];

  var PRESETS = [
    "⋆｡˚☁︎˚｡⋆", "ᯓ★", "✧˖°", "⸝⸝꙳", "₊˚⊹♡", "꒰ა ♡ ໒꒱", "˗ˏˋ ★ ˎˊ˗", "⋆˙⟡",
    "⭑.ᐟ", "🎀 ˚₊‧", "🍓⋆｡˚", "🌙⋆｡°✩", "💌 ⸝⸝", "🫧 ˚₊·", "🍒◝✩", "₊˚ʚ 🧸 ɞ˚₊",
    "✧･ﾟ: *✧･ﾟ:*", "⋆⭒˚.⋆", "🩵⸝⸝⋆", "🌷 ‧₊˚", "🍰 ⊹ ࣪ ˖", "⟡ ⋆ 🦢", "ᰔᩚ ⋆",
    "𓂃 ✍︎", "🪽 ✧", "✩°｡⋆⸜ 🎧", "꒰ 🍮 ꒱", "୨୧ ┈ 🌸", "◝✩ 🎐", "⋆｡°✩ 🫶🏻"
  ];

  var $ = function (id) { return document.getElementById(id); };
  var input = $("input");

  var symWrap = $("symbols");
  SYMBOLS.forEach(function (s) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sym";
    b.textContent = s;
    symWrap.appendChild(b);
  });
  symWrap.addEventListener("click", function (e) {
    var b = e.target.closest(".sym");
    if (!b) return;
    // แทรกตรงเคอร์เซอร์ (ไม่ focus ช่องพิมพ์ เพื่อไม่ให้คีย์บอร์ดมือถือเด้งทุกครั้ง)
    var start = input.selectionStart, end = input.selectionEnd;
    input.setRangeText(b.textContent, start, end, "end");
    Kao.sound("sparkle");
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

  Kao.start();
})();
