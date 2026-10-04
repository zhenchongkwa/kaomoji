(function () {
  "use strict";

  // ลาย AA — {t} คือที่ใส่ข้อความ; cat คือหมวด (ไอคอน)
  var TEMPLATES = [
    { cat: "⭐", aa: "⋆｡ﾟ☁︎｡⋆｡ ゜☾ ゜｡⋆\n　✩ {t} ✩\n⋆｡ﾟ☁︎｡⋆｡ ゜☾ ゜｡⋆" },
    { cat: "⭐", aa: "☆.。.:*・゜゜・*:.。.☆\n　 {t}\n☆.。.:*・゜゜・*:.。.☆" },
    { cat: "⭐", aa: "　 　 　 ✦\n　 ✧ 　 　 　 ⋆\n✦ 　{t}\n　 ⋆ 　 　 　 ✧\n　 　 　 ✦" },
    { cat: "⭐", aa: "⁺˚⋆｡°✩₊ {t} ₊✩°｡⋆˚⁺" },
    { cat: "⭐", aa: "━━━━━━✧ ゜･: *━━━━━━\n　　{t}\n━━━━━━* :･ﾟ ✧━━━━━━" },
    { cat: "🩷", aa: "♡⃛ ━━━━━━━━━ ♡⃛\n　{t}\n♡⃛ ━━━━━━━━━ ♡⃛" },
    { cat: "🩷", aa: "　 ♡ 　 　 ♡\n♡ 　 {t}\n　 ♡ 　 　 ♡" },
    { cat: "🩷", aa: "˗ˏˋ ♡ ˎˊ˗\n{t}\n˗ˏˋ ♡ ˎˊ˗" },
    { cat: "🩷", aa: "꒰ঌ ♡ ໒꒱ {t} ꒰ঌ ♡ ໒꒱" },
    { cat: "🩷", aa: "💗 ⊹ ₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊ ⊹ 💗\n　　{t}" },
    { cat: "🎀", aa: "୨୧ ┈┈┈┈┈┈┈┈ ୨୧\n　{t}\n୨୧ ┈┈┈┈┈┈┈┈ ୨୧" },
    { cat: "🎀", aa: "🎀 ⊹ ˚ . ⋆ {t} ⋆ . ˚ ⊹ 🎀" },
    { cat: "🎀", aa: "︶︶︶︶︶︶ 🎀 ︶︶︶︶︶︶\n　{t}\n︵︵︵︵︵︵ 🎀 ︵︵︵︵︵︵" },
    { cat: "🪽", aa: "ʚ♡ɞ ⋆ {t} ⋆ ʚ♡ɞ" },
    { cat: "🪽", aa: "ଘ(੭ˊᵕˋ)੭* ੈ✩‧₊˚ {t}" },
    { cat: "🪽", aa: "🪽 ˚₊‧꒰ა {t} ໒꒱ ‧₊˚ 🪽" },
    { cat: "💬", aa: "╭───────────╮\n　{t}\n╰───────ｖ───╯\n　　　　( ˶ˆᗜˆ˵ )" },
    { cat: "💬", aa: "＿人人人人人人＿\n＞　{t}　＜\n￣Y^Y^Y^Y^Y^Y￣" },
    { cat: "💬", aa: "( ˙꒳˙ )੭ ⌒ 💭 {t}" },
    { cat: "🐰", aa: "(\\ (\\\n( „• ֊ •„) ♡ {t}\n━O━O━━━━━━━" },
    { cat: "🐰", aa: "／(･ × ･)＼ ⸝⸝ {t} ⸝⸝ ／(･ × ･)＼" },
    { cat: "🎵", aa: "♪ ♫ ♬ {t} ♬ ♫ ♪" },
    { cat: "🎵", aa: "♬♩♪♩ ( ◜ ◡ ◝ ) ♩♪♩♬\n　　{t}" },
    { cat: "😸", aa: "　∧,,,∧\n（ • ·̫ • ）\n/ づ♡ {t}" },
    { cat: "😸", aa: "ฅ^•ﻌ•^ฅ ┈┈ {t} ┈┈ ฅ^•ﻌ•^ฅ" },
    { cat: "🐻", aa: "ʕ ·ᴥ·ʔ\n／ づ🍯 {t}" },
    { cat: "🐻", aa: "ʕっ•ᴥ•ʔっ ♡ {t} ♡ ⊂ʕ•ᴥ•⊂ʔ" },
    { cat: "🐶", aa: "૮ ・ﻌ・ა ⊹ {t} ⊹ ૮ ・ﻌ・ა" },
    { cat: "🐶", aa: "　૮ ˶ᵔ ᵕ ᵔ˶ ა\n　 / づ🦴 {t}" },
    { cat: "🐣", aa: "( •ө• )ﾉ゛ {t}" },
    { cat: "🐣", aa: "　 ⌒⌒\n　(•ө•)♡\n　 ／ ＞ {t}" },
    { cat: "🎂", aa: "🎂 HAPPY BIRTHDAY 🎂\n✧˖° {t} °˖✧\n🎉🎁🎈🎉🎁🎈" },
    { cat: "🎂", aa: "🕯️ 🕯️ 🕯️\n┏━♡━━━━♡━┓\n　{t}\n┗━♡━━━━♡━┛" },
    { cat: "🎂", aa: "⋆ ˚｡⋆୨୧˚ HBD ˚୨୧⋆｡˚ ⋆\n　🎂 {t} 🎂" },
    { cat: "🌸", aa: "✿ ❀ ✿ ❀ ✿ ❀ ✿\n　{t}\n✿ ❀ ✿ ❀ ✿ ❀ ✿" },
    { cat: "🌸", aa: "🌷 ˚₊‧ ⋆ {t} ⋆ ‧₊˚ 🌷" }
  ];
  var CATS = ["all"].concat(TEMPLATES.map(function (x) { return x.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));

  var F = window.KaoFonts;
  var $ = function (id) { return document.getElementById(id); };
  var input = $("input"), list = $("list"), fontChips = $("fontChips"), catChips = $("catChips");
  var font = "none", cat = "all";

  function renderFontChips() {
    fontChips.innerHTML = "";
    [{ id: "none" }].concat(F.styles).forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (s.id === font ? " active" : "");
      b.dataset.id = s.id;
      b.textContent = s.id === "none" ? Kao.t("noFont") : F.sample(s.id);
      fontChips.appendChild(b);
    });
  }

  function renderCatChips() {
    catChips.innerHTML = "";
    CATS.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (c === cat ? " active" : "");
      b.dataset.cat = c;
      b.textContent = c === "all" ? Kao.t("all") : c;
      catChips.appendChild(b);
    });
  }

  function renderList() {
    var text = input.value.trim() || Kao.t("aaPlaceholder");
    if (font !== "none") text = F.convert(font, text);
    list.innerHTML = "";
    TEMPLATES.forEach(function (tpl) {
      if (cat !== "all" && tpl.cat !== cat) return;
      var card = document.createElement("button");
      card.type = "button";
      card.className = "aa-card";
      card.textContent = tpl.aa.split("{t}").join(text);
      list.appendChild(card);
    });
  }

  fontChips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    font = b.dataset.id;
    fontChips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    renderList();
  });
  catChips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    cat = b.dataset.cat;
    catChips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    renderList();
  });
  input.addEventListener("input", renderList);
  list.addEventListener("click", function (e) {
    var card = e.target.closest(".aa-card");
    if (!card) return;
    Kao.copyAndToast(card.textContent, "").then(function (ok) {
      if (!ok) return;
      card.classList.add("flash");
      setTimeout(function () { card.classList.remove("flash"); }, 300);
    });
  });

  Kao.onLang(function () { renderFontChips(); renderCatChips(); renderList(); });
  Kao.jumpButton("results");
  Kao.start();
})();
