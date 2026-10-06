(function () {
  "use strict";

  // หมวดอีโมจิ: key = ชื่อใน i18n, sw = สีของจุด (หมวดตามสี ชื่ออยู่ใน i18n เป็น emColor_<id>)
  var CATS = [
    { id: "star", key: "emStar", pool: "⭐️ 🌟 ✨ 💫 🌠 ☄️ 🌙 🪐 ⭐ 🌌 🌛 🌜 🌝 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🔭 🛸 🚀 🎇 🎆 🌃 🏮" },
    { id: "cute", key: "emCute", pool: "🎀 🩷 🧸 🍓 🌷 🫧 🍰 🐰 🌸 💐 🍒 🦢 🐾 🍼 🧁 🍡 🐣 🦄 🪞 🫶 🩰 🪷 🍬 🧺 🫖 🌼 🐇 🐥" },
    { id: "otaku", key: "emOtaku", pool: "🎤 🎫 📸 💿 🪭 🎶 🫶🏻 💌 📣 🪄 🎟️ 🍥 💝 🌈 👑 📀 🎧 🎮 🕹️ 📱 🖼️ 🧷 🏷️ 💡 🎙️ 📺 🎬 🛍️" },
    { id: "heart", key: "emHeart", pool: "💗 💖 💕 💞 💓 💘 💝 🩷 🤍 ❤️‍🔥 ♡ 💟 ❤️ 🧡 💛 💚 🩵 💙 💜 🤎 🖤 🩶 ❣️ 💌 ❤️‍🩹 🫀 😍 🥰" },
    { id: "food", key: "emFood", pool: "🍜 🍣 🍙 🍱 🍛 🍝 🍕 🍔 🍟 🌭 🥪 🌮 🥟 🍤 🥘 🍲 🥗 🍳 🥞 🧇 🥐 🍞 🥨 🍗 🍖 🧋 ☕️ 🍵 🥤" },
    { id: "sweets", key: "emSweets", pool: "🍰 🧁 🍮 🍩 🍪 🍫 🍬 🍭 🍦 🍨 🍧 🎂 🥧 🍡 🍯 🥛 🍓 🍑 🍒 🍇 🫐 🍉 🍋 🥭 🍍 🥝 🍈" },
    { id: "nature", key: "emNature", pool: "🌸 🌷 🌹 🌺 🌻 🌼 💐 🪷 🪻 🌱 🌿 🍀 🍃 🍂 🍁 🌾 🌵 🌴 🌳 🍄 🪴 🌲 🪨 🪵 🐚 🌰 🫛" },
    { id: "weather", key: "emWeather", pool: "☀️ 🌤️ ⛅ 🌥️ ☁️ 🌦️ 🌧️ ⛈️ 🌩️ 🌨️ ❄️ ☃️ ⛄ 🌬️ 💨 🌪️ 🌫️ 🌈 ☔ ☂️ 💧 💦 🌊 🔥 ⚡ 🌙 ⭐️" },
    { id: "sea", key: "emSea", pool: "🌊 🐚 🐠 🐟 🐡 🐬 🐳 🐋 🦈 🐙 🦑 🦀 🦞 🦐 🪸 🪼 🏖️ 🏝️ ⛱️ 🩱 🩴 🕶️ 🧜‍♀️ ⚓ ⛵ 🛟 🫧" },
    { id: "animals", key: "emAnimals", pool: "🐱 🐶 🐰 🐻 🐼 🐨 🐹 🐭 🦊 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦆 🦉 🦋 🐝 🐞 🐢 🦔 🦦 🦥" },
    { id: "party", key: "emParty", pool: "🎉 🎊 🥳 🎈 🎁 🎂 🍾 🥂 🍻 🎆 🎇 🪅 🪩 🎵 🎶 💃 🕺 🎤 🎀 🏆 🥇 👑 🌟 ✨ 🙌 👏 🫶" },
    { id: "night", key: "emNight", pool: "🌙 🌛 💤 😴 🛌 🛏️ 🌌 ✨ ⭐️ 🌠 🦉 🕯️ 🫖 🍵 📖 🧸 🌃 🌉 🏙️ 🌑 🪐 🔮 🎐 🌜 🌝 🧦 🥛" },
    { id: "school", key: "emSchool", pool: "📚 📖 📝 ✏️ 🖊️ 🖍️ 📒 📓 📔 📕 📗 📘 📙 📎 📌 📏 📐 ✂️ 🎒 🏫 💻 🖥️ ⌨️ 📊 🗂️ 🧮 🎓 ☕️" },
    { id: "travel", key: "emTravel", pool: "✈️ 🧳 🗺️ 🧭 📍 🏝️ 🏖️ ⛰️ 🏔️ 🗻 🏕️ 🗼 🗽 🏯 ⛩️ 🎡 🎢 🚆 🚄 🚌 🚗 🚲 🛵 ⛴️ 🚢 📸 🎫 🌅" },
    { id: "red", sw: "#ef5b5b", pool: "❤️ 🍓 🍒 🌹 🎈 🍎 💋 ♥️ 🥀 🧧 🌶️ 🍅 🦀 🐞 🚗 🍉 🥫 🏮 🎒 📕 ⛑️ 🩸 🍁 🪭 🛑 ⭕ 🔴 🟥" },
    { id: "orange", sw: "#f59a48", pool: "🧡 🍊 🎃 🦊 🔶 🍑 🏵️ 🥕 🦁 🍁 🥭 🐯 🦒 🏀 🧶 🍤 🥧 🦐 🔥 🌅 🍂 🐠 📙 🧡 🟠 🟧 🍹" },
    { id: "yellow", sw: "#f5cd45", pool: "💛 🌟 ⭐️ 🍋 🐥 🌻 🌼 🍯 🧀 🌙 🍌 🐤 🌽 🧈 🐝 ✨ 🌕 🎗️ 📒 🚕 🛎️ 👑 🔆 💡 🟡 🟨 🍍" },
    { id: "green", sw: "#68c47a", pool: "💚 🍀 🌿 🥝 🐸 🍈 🌱 🍃 🦖 🥑 🍏 🥒 🥦 🫑 🐢 🐍 🦎 🌲 🌳 🌵 🍵 📗 🧩 ♻️ 🟢 🟩 🫛" },
    { id: "sky", sw: "#7fcdf0", pool: "🩵 🫧 🧊 🐬 💠 🌊 🐳 ☁️ 🩱 🧩 🦋 💎 🐟 🌀 🧢 🩵 🐋 🏊 🌐 🪣 🫙 ❄️ 🦕 🪁 🛁 🧼 🔹" },
    { id: "blue", sw: "#4f86e8", pool: "💙 🦋 🫐 🌀 🐋 🔷 🌌 🧿 👖 🌐 🫐 📘 🧢 🎽 🐟 🦕 🌊 🫙 💎 🚙 🧊 🪣 🌃 🔵 🟦 🫐 🪻" },
    { id: "purple", sw: "#a47ce6", pool: "💜 🍇 🔮 ☂️ 🪻 💟 🦄 🌂 🍆 🪀 🫐 👾 😈 🟣 🟪 🎆 🌌 🪩 🧞 🦑 🛍️ 💐 🔏 ☮️ ♒ 🎼 🍠" },
    { id: "brown", sw: "#a3775a", pool: "🤎 🧸 🍫 ☕️ 🍪 🐻 🥐 🍂 🐿️ 🧇 🥥 🐶 🦫 🥔 🍞 🥜 🌰 🪵 🍩 🐴 🦉 🎻 🪘 🟤 🟫 🧋 🥯" },
    { id: "black", sw: "#2a2b32", pool: "🖤 🕷️ 🦇 🕸️ 🌑 🐈‍⬛ ⛓️ 🎱 🎩 ♠️ 🐦‍⬛ 🎮 📷 🎥 🕶️ 🖋️ ♣️ 🏴 ⚫ ⬛ 🎹 🔌 🕳️ 🦍 🐜 🍙 🎞️" },
    { id: "pink", sw: "#f59cc2", pool: "🩷 🌸 🎀 🍑 🦩 💗 🌷 🍬 🐷 🧠 💖 💕 🌺 🍭 🐽 👛 🩰 🎟️ 💓 🦄 🌸 🍥 🧁 🫦 🩷 💅 🌷" },
    { id: "white", sw: "#ffffff", pool: "🤍 🕊️ ☁️ 🦢 🥛 🫧 ❄️ 🐑 🍚 🦷 🐇 🍙 🧻 ⚪ ⬜ 🏳️ 🌨️ ⛄ 🐻‍❄️ 🍦 🥥 🕯️ 🦴 🧂 🍥 💭 🥚" }
  ];
  // ตัดตัวซ้ำในหมวดเดียวกันออก (สุ่มแล้วจะได้ไม่ซ้ำกันเอง)
  CATS.forEach(function (c) { c.items = c.pool.split(" ").filter(function (x, i, arr) { return x && arr.indexOf(x) === i; }); });
  var ALL = { id: "all", key: "emAll", items: [] };
  CATS.forEach(function (c) { c.items.forEach(function (e) { if (ALL.items.indexOf(e) < 0) ALL.items.push(e); }); });
  CATS.unshift(ALL);

  var $ = function (id) { return document.getElementById(id); };
  var input = $("input"), output = $("output"), alts = $("alts"), chips = $("catChips"), colorChips = $("colorChips");
  var current = "all";

  function pick(items, n) {
    var copy = items.slice(), out = [];
    while (out.length < n && copy.length) {
      var e = copy.splice(Math.floor(Math.random() * copy.length), 1)[0];
      // อีโมจิใหม่ที่เครื่องนี้ไม่มี (เช่นบน Windows 10) จะเป็นกล่องเปล่า ข้ามไป
      if (Kao.supports(e)) out.push(e);
    }
    return out.join("");
  }
  function combo() {
    var c = CATS.find(function (x) { return x.id === current; });
    return pick(c.items, 2 + Math.floor(Math.random() * 2)); // 2–3 ตัว
  }
  function withText(text, c) {
    text = text.replace(/s+$/, "");
    return (text ? text + " " : "") + c;
  }

  // สุ่มชุดอีโมจิใหม่ (หลัก 1 + ทางเลือก 8) แล้วค่อยเอาข้อความมาต่อหน้า
  var mainCombo = "", altCombos = [];
  function shuffle() {
    mainCombo = combo();
    altCombos = [];
    for (var i = 0; i < 8; i++) altCombos.push(combo());
    alts.innerHTML = "";
    altCombos.forEach(function () {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pill";
      alts.appendChild(b);
    });
    render();
    if (window.Motion) { Motion.enter(alts.children, { gap: 35 }); Motion.boing(output, 1.5); }
  }

  // พิมพ์แล้วผลลัพธ์อัปเดตทันที โดยไม่สุ่มอีโมจิใหม่ทุกตัวอักษร
  function render() {
    var text = input.value;
    output.value = withText(text, mainCombo);
    Array.prototype.forEach.call(alts.children, function (b, i) { b.textContent = withText(text, altCombos[i]); });
  }

  // ธีม (คำ) กับสี (จุดสี) แยกเป็นสองแถว เลือกได้ทีละอันรวมกันทั้งสองแถว
  function renderChips() {
    chips.innerHTML = "";
    colorChips.innerHTML = "";
    CATS.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (c.id === current ? " active" : "");
      b.dataset.id = c.id;
      if (c.sw) {
        // หมวดตามสี: จุดสีวาดเอง แทนอีโมจิหัวใจสีต่างๆ
        var name = Kao.t("emColor_" + c.id);
        b.classList.add("swatch-chip");
        b.title = name;
        b.setAttribute("aria-label", name);
        b.innerHTML = "<span class=\"swatch\"></span>";
        b.firstChild.style.background = c.sw;
      } else b.textContent = Kao.t(c.key);
      (c.sw ? colorChips : chips).appendChild(b);
    });
    Kao.collapse(chips, 10);
  }

  function onChip(e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    current = b.dataset.id;
    document.querySelectorAll("#catChips .chip, #colorChips .chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    shuffle();
  }
  chips.addEventListener("click", onChip);
  colorChips.addEventListener("click", onChip);
  $("goBtn").addEventListener("click", shuffle);
  input.addEventListener("input", render);
  $("copyBtn").addEventListener("click", function () { if (output.value) Kao.copyAndToast(output.value); });
  alts.addEventListener("click", function (e) {
    var b = e.target.closest(".pill");
    if (b) Kao.copyAndToast(b.textContent);
  });

  Kao.onLang(renderChips);
  Kao.start();
  shuffle();
})();
