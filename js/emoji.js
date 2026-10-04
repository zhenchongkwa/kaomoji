(function () {
  "use strict";

  // หมวดอีโมจิ: key = ชื่อใน i18n (ถ้ามี) ไม่งั้นใช้ label ตรงๆ
  var CATS = [
    { id: "star", key: "emStar", pool: "⭐️ 🌟 ✨ 💫 🌠 ☄️ 🌙 🪐 ⭐ 🌌" },
    { id: "cute", key: "emCute", pool: "🎀 🩷 🧸 🍓 🌷 🫧 🍰 🐰 🌸 💐 🍒 🦢 🐾 🍼 🧁" },
    { id: "otaku", key: "emOtaku", pool: "🎤 🎫 📸 💿 🪭 🎶 🫶🏻 💌 📣 🪄 🎟️ 🍥 💝 🌈 👑" },
    { id: "heart", key: "emHeart", pool: "💗 💖 💕 💞 💓 💘 💝 🩷 🤍 ❤️‍🔥 ♡ 💟" },
    { id: "red", label: "❤️", pool: "❤️ 🍓 🍒 🌹 🎈 🍎 💋 ♥️ 🥀 🧧" },
    { id: "orange", label: "🧡", pool: "🧡 🍊 🎃 🦊 🔶 🍑 🏵️ 🥕 🦁 🍁" },
    { id: "yellow", label: "💛", pool: "💛 🌟 ⭐️ 🍋 🐥 🌻 🌼 🍯 🧀 🌙" },
    { id: "green", label: "💚", pool: "💚 🍀 🌿 🥝 🐸 🍈 🌱 🍃 🦖 🥑" },
    { id: "sky", label: "🩵", pool: "🩵 🫧 🧊 🐬 💠 🌊 🐳 ☁️ 🩱 🧩" },
    { id: "blue", label: "💙", pool: "💙 🦋 🫐 🌀 🐋 🔷 🌌 🧿 👖 🌐" },
    { id: "purple", label: "💜", pool: "💜 🍇 🔮 ☂️ 🪻 💟 🦄 🌂 🍆 🪀" },
    { id: "brown", label: "🤎", pool: "🤎 🧸 🍫 ☕️ 🍪 🐻 🥐 🍂 🐿️ 🧇" },
    { id: "black", label: "🖤", pool: "🖤 🕷️ 🦇 🕸️ 🌑 🐈‍⬛ ⛓️ 🎱 🎩 ♠️" },
    { id: "pink", label: "🩷", pool: "🩷 🌸 🎀 🍑 🦩 💗 🌷 🍬 🐷 🧠" },
    { id: "white", label: "🤍", pool: "🤍 🕊️ ☁️ 🦢 🥛 🫧 ❄️ 🐑 🍚 🦷" }
  ];
  CATS.forEach(function (c) { c.items = c.pool.split(" "); });
  var ALL = { id: "all", key: "emAll", items: [] };
  CATS.forEach(function (c) { c.items.forEach(function (e) { if (ALL.items.indexOf(e) < 0) ALL.items.push(e); }); });
  CATS.unshift(ALL);

  var $ = function (id) { return document.getElementById(id); };
  var input = $("input"), output = $("output"), alts = $("alts"), chips = $("catChips");
  var current = "all";

  function pick(items, n) {
    var copy = items.slice(), out = [];
    while (out.length < n && copy.length) {
      out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out.join("");
  }
  function combo() {
    var c = CATS.find(function (x) { return x.id === current; });
    return pick(c.items, 2 + Math.floor(Math.random() * 2)); // 2–3 ตัว
  }
  function decorate(text) {
    text = text.replace(/\s+$/, "");
    return (text ? text + " " : "") + combo();
  }

  function generate() {
    var text = input.value;
    output.value = decorate(text);
    alts.innerHTML = "";
    for (var i = 0; i < 8; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pill";
      b.textContent = decorate(text);
      alts.appendChild(b);
    }
  }

  function renderChips() {
    chips.innerHTML = "";
    CATS.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (c.id === current ? " active" : "");
      b.dataset.id = c.id;
      b.textContent = c.key ? Kao.t(c.key) : c.label;
      chips.appendChild(b);
    });
  }

  chips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    current = b.dataset.id;
    chips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    generate();
  });
  $("goBtn").addEventListener("click", generate);
  $("clearBtn").addEventListener("click", function () { input.value = ""; output.value = ""; alts.innerHTML = ""; input.focus(); });
  $("copyBtn").addEventListener("click", function () { if (output.value) Kao.copyAndToast(output.value); });
  alts.addEventListener("click", function (e) {
    var b = e.target.closest(".pill");
    if (b) Kao.copyAndToast(b.textContent);
  });

  Kao.onLang(renderChips);
  Kao.start();
  generate();
})();
