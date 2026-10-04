(function () {
  "use strict";

  var DATA = window.KAOMOJI_DATA || [];
  var t = Kao.t;
  var RECENT_MAX = 30;

  var state = {
    cat: "all",
    query: "",
    favs: Kao.load("kao.favs", []),
    recent: Kao.load("kao.recent", [])
  };
  var favSet = new Set(state.favs);

  // ---------- index สำหรับค้นหา ----------
  // kaomoji เดียวกันอาจอยู่หลายหมวด: รวมคำค้นของทุกหมวดเข้าด้วยกัน
  var index = new Map();
  DATA.forEach(function (c) {
    var words = [c.th, c.en].concat(c.tags).join(" ").toLowerCase();
    c.items.forEach(function (k) {
      var entry = index.get(k);
      if (entry) entry.text += " " + words;
      else index.set(k, { k: k, text: k.toLowerCase() + " " + words });
    });
  });
  var ALL = Array.from(index.keys());

  var $ = function (id) { return document.getElementById(id); };
  var grid = $("grid"), chips = $("chips"), search = $("search");

  // ---------- chips ----------
  function renderChips() {
    var fixed = [
      { id: "all", label: t("all"), n: ALL.length },
      { id: "fav", label: "⭐ " + t("favorites"), n: state.favs.length },
      { id: "recent", label: "🕘 " + t("recent"), n: state.recent.length }
    ];
    var cats = DATA.map(function (c) {
      return { id: c.id, label: c[Kao.lang], n: c.items.length };
    });
    chips.innerHTML = "";
    var frag = document.createDocumentFragment();
    function add(c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cat" + (c.id === state.cat ? " active" : "");
      b.dataset.cat = c.id;
      b.dataset.tone = i % 6;
      var dot = document.createElement("span");
      dot.className = "cat-dot";
      var name = document.createElement("span");
      name.className = "cat-name";
      name.textContent = c.label;
      var s = document.createElement("small");
      s.textContent = c.n;
      b.append(dot, name, s);
      frag.appendChild(b);
    }
    fixed.forEach(add);
    var sep = document.createElement("div");
    sep.className = "cat-sep";
    frag.appendChild(sep);
    cats.forEach(add);
    chips.appendChild(frag);
  }

  // ---------- grid ----------
  function currentItems() {
    var items;
    if (state.cat === "all") items = ALL;
    else if (state.cat === "fav") items = state.favs;
    else if (state.cat === "recent") items = state.recent;
    else {
      var c = DATA.find(function (x) { return x.id === state.cat; });
      items = c ? c.items : [];
    }
    var q = state.query.trim().toLowerCase();
    if (!q) return items;
    var terms = q.split(/\s+/);
    return items.filter(function (k) {
      var text = index.has(k) ? index.get(k).text : k.toLowerCase();
      return terms.every(function (term) { return text.indexOf(term) !== -1; });
    });
  }

  function sectionTitle() {
    if (state.cat === "all") return t("all");
    if (state.cat === "fav") return "⭐ " + t("favorites");
    if (state.cat === "recent") return "🕘 " + t("recent");
    var c = DATA.find(function (x) { return x.id === state.cat; });
    return c ? c[Kao.lang] : "";
  }

  function renderGrid() {
    var items = currentItems();
    grid.innerHTML = "";
    var frag = document.createDocumentFragment();
    items.forEach(function (k) {
      var card = document.createElement("div");
      card.className = "card" + ([...k].length > 16 ? " wide" : "");
      card.dataset.k = k;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.textContent = k;
      var star = document.createElement("button");
      star.type = "button";
      star.className = "fav" + (favSet.has(k) ? " on" : "");
      star.textContent = favSet.has(k) ? "★" : "☆";
      star.title = favSet.has(k) ? t("removeFav") : t("addFav");
      star.setAttribute("aria-label", star.title);
      card.appendChild(star);
      frag.appendChild(card);
    });
    grid.appendChild(frag);

    $("sectionTitle").textContent = sectionTitle();
    $("count").textContent = t("results", items.length);
    var empty = $("empty");
    empty.hidden = items.length > 0;
    empty.textContent = state.query ? t("empty")
      : state.cat === "fav" ? t("emptyFav")
      : state.cat === "recent" ? t("emptyRecent") : t("empty");
    var clr = $("clearRecent");
    clr.hidden = !(state.cat === "recent" && state.recent.length);
    clr.textContent = t("clearRecent");
  }

  // ---------- actions ----------
  function onCopy(card) {
    var k = card.dataset.k;
    Kao.copyAndToast(k).then(function (ok) {
      if (!ok) return;
      card.classList.add("flash");
      setTimeout(function () { card.classList.remove("flash"); }, 300);
      state.recent = [k].concat(state.recent.filter(function (x) { return x !== k; })).slice(0, RECENT_MAX);
      Kao.save("kao.recent", state.recent);
      // ไม่ re-render ทั้ง grid ในหน้า "ล่าสุด" เพื่อไม่ให้การ์ดกระโดด; อัปเดตแค่ตัวเลขบน chip
      updateChipCount("recent", state.recent.length);
    });
  }

  function toggleFav(k, btn) {
    if (favSet.has(k)) {
      favSet.delete(k);
      state.favs = state.favs.filter(function (x) { return x !== k; });
    } else {
      favSet.add(k);
      state.favs.unshift(k);
    }
    Kao.save("kao.favs", state.favs);
    Kao.sound(favSet.has(k) ? "favOn" : "favOff");
    if (state.cat === "fav") { renderGrid(); }
    else {
      var on = favSet.has(k);
      btn.classList.toggle("on", on);
      btn.textContent = on ? "★" : "☆";
      btn.title = on ? t("removeFav") : t("addFav");
      btn.setAttribute("aria-label", btn.title);
    }
    updateChipCount("fav", state.favs.length);
  }

  function updateChipCount(id, n) {
    var chip = chips.querySelector('[data-cat="' + id + '"] small');
    if (chip) chip.textContent = n;
  }

  // ---------- events ----------
  grid.addEventListener("click", function (e) {
    var star = e.target.closest(".fav");
    var card = e.target.closest(".card");
    if (!card) return;
    if (star) { e.stopPropagation(); toggleFav(card.dataset.k, star); return; }
    onCopy(card);
  });
  grid.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card")) {
      e.preventDefault();
      onCopy(e.target);
    }
  });

  chips.addEventListener("click", function (e) {
    var b = e.target.closest(".cat");
    if (!b) return;
    state.cat = b.dataset.cat;
    chips.querySelectorAll(".cat").forEach(function (c) { c.classList.toggle("active", c === b); });
    renderGrid();
    // ให้เห็นหัวรายการหลังเปลี่ยนหมวด (เลื่อนเฉพาะถ้าเลื่อนผ่านไปแล้ว)
    var list = document.querySelector(".lib-list");
    var top = list.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) - 16;
    if (top < 0) window.scrollBy({ top: top });
  });

  var searchTimer;
  search.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.query = search.value;
      renderGrid();
    }, 150);
  });
  document.addEventListener("keydown", function (e) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); search.focus(); }
    if (e.key === "Escape" && document.activeElement === search && search.value) {
      search.value = ""; state.query = ""; renderGrid();
    }
  });

  $("clearRecent").addEventListener("click", function () {
    state.recent = [];
    Kao.save("kao.recent", state.recent);
    updateChipCount("recent", 0);
    renderGrid();
  });

  Kao.onLang(function () {
    $("tagline").textContent = t("tagline", ALL.length);
    renderChips();
    renderGrid();
  });
  Kao.start();
})();
