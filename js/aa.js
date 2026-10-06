(function () {
  "use strict";

  // ลาย AA: {t} คือที่ใส่ข้อความ; cat คือหมวด (ชื่อหมวดอยู่ใน i18n เป็น aaCat_<cat>)
  var TEMPLATES = [
    { cat: "star", aa: "⋆｡ﾟ☁︎｡⋆｡ ゜☾ ゜｡⋆\n　✩ {t} ✩\n⋆｡ﾟ☁︎｡⋆｡ ゜☾ ゜｡⋆" },
    { cat: "star", aa: "☆.。.:*・゜゜・*:.。.☆\n　 {t}\n☆.。.:*・゜゜・*:.。.☆" },
    { cat: "star", aa: "　 　 　 ✦\n　 ✧ 　 　 　 ⋆\n✦ 　{t}\n　 ⋆ 　 　 　 ✧\n　 　 　 ✦" },
    { cat: "star", aa: "⁺˚⋆｡°✩₊ {t} ₊✩°｡⋆˚⁺" },
    { cat: "star", aa: "━━━━━━✧ ゜･: *━━━━━━\n　　{t}\n━━━━━━* :･ﾟ ✧━━━━━━" },
    { cat: "heart", aa: "♡⃛ ━━━━━━━━━ ♡⃛\n　{t}\n♡⃛ ━━━━━━━━━ ♡⃛" },
    { cat: "heart", aa: "　 ♡ 　 　 ♡\n♡ 　 {t}\n　 ♡ 　 　 ♡" },
    { cat: "heart", aa: "˗ˏˋ ♡ ˎˊ˗\n{t}\n˗ˏˋ ♡ ˎˊ˗" },
    { cat: "heart", aa: "꒰ঌ ♡ ໒꒱ {t} ꒰ঌ ♡ ໒꒱" },
    { cat: "heart", aa: "💗 ⊹ ₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊ ⊹ 💗\n　　{t}" },
    { cat: "ribbon", aa: "୨୧ ┈┈┈┈┈┈┈┈ ୨୧\n　{t}\n୨୧ ┈┈┈┈┈┈┈┈ ୨୧" },
    { cat: "ribbon", aa: "🎀 ⊹ ˚ . ⋆ {t} ⋆ . ˚ ⊹ 🎀" },
    { cat: "ribbon", aa: "︶︶︶︶︶︶ 🎀 ︶︶︶︶︶︶\n　{t}\n︵︵︵︵︵︵ 🎀 ︵︵︵︵︵︵" },
    { cat: "wing", aa: "ʚ♡ɞ ⋆ {t} ⋆ ʚ♡ɞ" },
    { cat: "wing", aa: "ଘ(੭ˊᵕˋ)੭* ੈ✩‧₊˚ {t}" },
    { cat: "wing", aa: "🪽 ˚₊‧꒰ა {t} ໒꒱ ‧₊˚ 🪽" },
    { cat: "speech", aa: "╭───────────╮\n　{t}\n╰───────ｖ───╯\n　　　　( ˶ˆᗜˆ˵ )" },
    { cat: "speech", aa: "＿人人人人人人＿\n＞　{t}　＜\n￣Y^Y^Y^Y^Y^Y￣" },
    { cat: "speech", aa: "( ˙꒳˙ )੭ ⌒ 💭 {t}" },
    { cat: "bunny", aa: "(\\ (\\\n( „• ֊ •„) ♡ {t}\n━O━O━━━━━━━" },
    { cat: "bunny", aa: "／(･ × ･)＼ ⸝⸝ {t} ⸝⸝ ／(･ × ･)＼" },
    { cat: "music", aa: "♪ ♫ ♬ {t} ♬ ♫ ♪" },
    { cat: "music", aa: "♬♩♪♩ ( ◜ ◡ ◝ ) ♩♪♩♬\n　　{t}" },
    { cat: "cat", aa: "　∧,,,∧\n（ • ·̫ • ）\n/ づ♡ {t}" },
    { cat: "cat", aa: "ฅ^•ﻌ•^ฅ ┈┈ {t} ┈┈ ฅ^•ﻌ•^ฅ" },
    { cat: "bear", aa: "ʕ ·ᴥ·ʔ\n／ づ🍯 {t}" },
    { cat: "bear", aa: "ʕっ•ᴥ•ʔっ ♡ {t} ♡ ⊂ʕ•ᴥ•⊂ʔ" },
    { cat: "dog", aa: "૮ ・ﻌ・ა ⊹ {t} ⊹ ૮ ・ﻌ・ა" },
    { cat: "dog", aa: "　૮ ˶ᵔ ᵕ ᵔ˶ ა\n　 / づ🦴 {t}" },
    { cat: "chick", aa: "( •ө• )ﾉ゛ {t}" },
    { cat: "chick", aa: "　 ⌒⌒\n　(•ө•)♡\n　 ／ ＞ {t}" },
    { cat: "bday", aa: "🎂 HAPPY BIRTHDAY 🎂\n✧˖° {t} °˖✧\n🎉🎁🎈🎉🎁🎈" },
    { cat: "bday", aa: "🕯️ 🕯️ 🕯️\n┏━♡━━━━♡━┓\n　{t}\n┗━♡━━━━♡━┛" },
    { cat: "bday", aa: "⋆ ˚｡⋆୨୧˚ HBD ˚୨୧⋆｡˚ ⋆\n　🎂 {t} 🎂" },
    { cat: "flower", aa: "✿ ❀ ✿ ❀ ✿ ❀ ✿\n　{t}\n✿ ❀ ✿ ❀ ✿ ❀ ✿" },
    { cat: "flower", aa: "🌷 ˚₊‧ ⋆ {t} ⋆ ‧₊˚ 🌷" },

    // ---------- ชุดเพิ่มเติม ----------
    { cat: "star", aa: "✦ ˚ ༘ ⋆｡˚ {t} ˚｡⋆ ༘ ˚ ✦" },
    { cat: "star", aa: "　⋆ ˚｡⋆୨୧˚\n{t}\n　˚୨୧⋆｡˚ ⋆" },
    { cat: "star", aa: "☆彡 {t} ミ☆" },
    { cat: "star", aa: "⋆⁺₊⋆ ☾ ⋆⁺₊⋆\n　{t}\n⋆⁺₊⋆ ☀︎ ⋆⁺₊⋆" },
    { cat: "star", aa: "─── ⋆⋅☆⋅⋆ ───\n　{t}\n─── ⋆⋅☆⋅⋆ ───" },
    { cat: "heart", aa: "♡ ˗ˏˋ {t} ˎˊ˗ ♡" },
    { cat: "heart", aa: "┈┈┈┈ ♡ ┈┈┈┈\n　{t}\n┈┈┈┈ ♡ ┈┈┈┈" },
    { cat: "heart", aa: "❤︎ ⸝⸝ {t} ⸝⸝ ❤︎" },
    { cat: "heart", aa: "♥︎♡♥︎♡♥︎♡♥︎♡\n　{t}\n♡♥︎♡♥︎♡♥︎♡♥︎" },
    { cat: "heart", aa: "( ˶ˆ꒳ˆ˵ ) ♡ {t}" },
    { cat: "heart", aa: "💌 ‧₊˚ ┊ {t}" },
    { cat: "ribbon", aa: "ᡣ𐭩 {t} ᡣ𐭩" },
    { cat: "ribbon", aa: "⊹ ࣪ ˖ 🎀 {t} 🎀 ˖ ࣪ ⊹" },
    { cat: "ribbon", aa: "︶꒦꒷ {t} ꒷꒦︶" },
    { cat: "ribbon", aa: "₊˚⊹ ᰔ {t} ᰔ ⊹˚₊" },
    { cat: "wing", aa: "꒰ ১ {t} ໒ ꒱" },
    { cat: "wing", aa: "ʚ ⋆ ɞ\n{t}\nʚ ⋆ ɞ" },
    { cat: "wing", aa: "𓆩♡𓆪 {t} 𓆩♡𓆪" },
    { cat: "speech", aa: "　 ∧＿∧\n　( ・ω・)\n＿(__つ/￣￣￣/\n　　＼/　{t}　/" },
    { cat: "speech", aa: "┏━━━━━━━━┓\n　{t}\n┗━━━━━━━━┛\n　　 ∧,,∧\n　　(・ω・)" },
    { cat: "speech", aa: "( ˶ᵔ ᵕ ᵔ˶ ) 💬 {t}" },
    { cat: "speech", aa: "📢 ┈ {t} ┈ 📢" },
    { cat: "bunny", aa: "　∩ ∩\n（„• ֊ •„)♡\n┏━∪∪━━━━┓\n　{t}\n┗━━━━━━━┛" },
    { cat: "bunny", aa: "૮ ˶ᵔ ᵕ ᵔ˶ ა {t}" },
    { cat: "bunny", aa: "🐰 ⋆ ˚｡⋆ {t} ⋆｡˚ ⋆ 🥕" },
    { cat: "music", aa: "🎧 ♪ ⋆ {t} ⋆ ♪" },
    { cat: "music", aa: "♪(๑ᴖ◡ᴖ๑)♪ {t}" },
    { cat: "music", aa: "𝄞 ⋆ {t} ⋆ 𝄞" },
    { cat: "cat", aa: "　 ／l、\n（ﾟ､ ｡ ７\n　 l、 ~ヽ\n　 じしf_, )ノ {t}" },
    { cat: "cat", aa: "ฅ(^•ﻌ•^ฅ) {t}" },
    { cat: "cat", aa: "₍^. .^₎⟆ ┈ {t}" },
    { cat: "cat", aa: "　 /ᐠ｡ꞈ｡ᐟ\\\n　 {t}" },
    { cat: "bear", aa: "ʕ•ᴥ•ʔ ♡ ʕ•ᴥ•ʔ\n　{t}" },
    { cat: "bear", aa: "ʕ ˵• ₒ •˵ ʔ 🍯 {t}" },
    { cat: "dog", aa: "▼・ᴥ・▼ {t}" },
    { cat: "dog", aa: "૮₍ ˃ ⤙ ˂ ₎ა ♡ {t}" },
    { cat: "chick", aa: "🐣 ⋆ {t} ⋆ 🐥" },
    { cat: "chick", aa: "( ･ө･)ﾉ ♪ {t}" },
    { cat: "bday", aa: "　 🕯️\n　▕▔▔▏\n▕▔▔▔▔▏\n　{t}" },
    { cat: "bday", aa: "🎉 HAPPY BIRTHDAY 🎉\n　{t}\n🎂 ⋆ ˚｡⋆ 🎁" },
    { cat: "bday", aa: "ʜᴀᴘᴘʏ ʙɪʀᴛʜᴅᴀʏ\n　♡ {t} ♡" },
    { cat: "bday", aa: "꒰ 🎂 ꒱ {t} ꒰ 🎈 ꒱" },
    { cat: "bday", aa: "　＼　🎉　／\n　{t}\n　／　🎊　＼" },
    { cat: "flower", aa: "❀ ⊹ ˚ . {t} . ˚ ⊹ ❀" },
    { cat: "flower", aa: "🌸 ⸝⸝ {t} ⸝⸝ 🌸" },
    { cat: "flower", aa: "✾ ✿ ❀ {t} ❀ ✿ ✾" },
    { cat: "night", aa: "☾ ⋆*･ﾟ:⋆*･ﾟ {t}" },
    { cat: "night", aa: "　 ⋆ ˚｡⋆\n☾ {t}\n　 ⋆｡˚ ⋆" },
    { cat: "night", aa: "( ˘ω˘ )ｽﾔｧ… {t}" },
    { cat: "night", aa: "🌙 ˚₊‧ ꒰ {t} ꒱ ‧₊˚ 💤" },
    { cat: "thanks", aa: "( ˶ˆᗜˆ˵ )🙏 {t}" },
    { cat: "thanks", aa: "✧ ᴛʜᴀɴᴋ ʏᴏᴜ ✧\n　{t}" },
    { cat: "thanks", aa: "( ⸝⸝ᴗ﹏ᴗ⸝⸝ ) ᶻ ♡ {t}" },
    { cat: "thanks", aa: "₊˚ʚ ᗢ₊˚✧ ﾟ. {t}" },
    { cat: "congrats", aa: "🎊 ✧ ˚ · . {t} . · ˚ ✧ 🎊" },
    { cat: "congrats", aa: "ヽ(＾Д＾)ﾉ {t} ヽ(＾Д＾)ﾉ" },
    { cat: "congrats", aa: "＼(^o^)／ {t} ＼(^o^)／" },
    { cat: "congrats", aa: "👑 ⋆ ˚ {t} ˚ ⋆ 👑" },
    { cat: "fandom", aa: "💿 ˚₊‧ {t} ‧₊˚ 💿" },
    { cat: "fandom", aa: "📸 ┊ {t} ┊ 🎤" },
    { cat: "fandom", aa: "⋆ ˚｡ ✦ ᴏꜱʜɪ ✦ ｡˚ ⋆\n　{t}" },
    { cat: "fandom", aa: "( ⸝⸝ ⁼̴́ ◡ ⁼̴̀ ⸝⸝ )♡ {t}" },
    { cat: "sweets", aa: "🍰 ˚₊‧ {t} ‧₊˚ 🍓" },
    { cat: "sweets", aa: "🧁 ⋆ {t} ⋆ 🍮" },
    { cat: "sweets", aa: "🍡 ⸝⸝ {t} ⸝⸝ 🍬" },
    { cat: "sweets", aa: "☕︎ ⋆｡˚ {t} ˚｡⋆ 🍪" }
  ];
  TEMPLATES = TEMPLATES.filter(function (x) { return Kao.supports(x.aa.split("{t}").join("")); });
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
    Kao.collapse(fontChips, 9);
  }

  function renderCatChips() {
    catChips.innerHTML = "";
    CATS.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (c === cat ? " active" : "");
      b.dataset.cat = c;
      b.textContent = Kao.t(c === "all" ? "all" : "aaCat_" + c);
      catChips.appendChild(b);
    });
    Kao.collapse(catChips, 10);
  }

  // สร้างการ์ดใหม่เฉพาะตอนเปลี่ยนหมวด ตอนพิมพ์แค่อัปเดตข้อความในการ์ดเดิม
  var cards = [];
  function renderList() {
    list.innerHTML = "";
    cards = TEMPLATES.filter(function (tpl) { return cat === "all" || tpl.cat === cat; }).map(function (tpl) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "aa-card";
      list.appendChild(card);
      return { tpl: tpl, el: card };
    });
    fill();
  }
  function fill() {
    var text = input.value.trim() || Kao.t("aaPlaceholder");
    if (font !== "none") text = F.convert(font, text);
    cards.forEach(function (c) { c.el.textContent = c.tpl.aa.split("{t}").join(text); });
  }

  fontChips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    font = b.dataset.id;
    fontChips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    fill();
  });
  catChips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    cat = b.dataset.cat;
    catChips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    renderList();
  });
  input.addEventListener("input", fill);
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
