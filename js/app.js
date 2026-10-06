(function () {
  "use strict";

  var DATA = window.KAOMOJI_DATA || [];
  var t = Kao.t;
  var M = window.Motion;
  var RECENT_MAX = 30;
  var CHUNK = 60; // วาดการ์ดทีละชุด (พอเต็มจอ) แทนการวาดทั้ง 1,500+ ใบพร้อมกัน

  // จัดหมวดเป็นกลุ่ม ให้ไล่หาง่ายกว่ารายการยาวๆ 62 หมวด
  var GROUPS = [
    { key: "grpSns", ids: ["sns-simple", "sns-cry", "sns-love", "sns-hands", "sns-sparkle", "sns-sleepy", "sns-pout", "sns-animal"] },
    { key: "grpTrend", ids: ["oshi", "study", "work", "thaifood", "songkran", "loykrathong", "celebrate", "weather", "money", "gaming"] },
    { key: "grpFeel", ids: ["happy", "joy", "love", "shy", "sad", "angry", "tableflip", "surprised", "confused", "worried", "bored", "smug", "sick"] },
    { key: "grpDo", ids: ["greet", "hug", "kiss", "sorry", "pray", "thumbs", "wink", "pointing", "dance", "music", "sleep", "writing", "run", "peek", "shrug", "fight"] },
    { key: "grpAnimals", ids: ["cat", "dog", "bear", "rabbit", "birds", "animals"] },
    { key: "grpOther", ids: ["magic", "food", "travel", "sports", "spooky", "faces", "evil", "friends", "misc"] }
  ];

  var state = {
    cat: "all",
    query: "",
    favs: Kao.load("kao.favs", []),
    recent: Kao.load("kao.recent", [])
  };
  var favSet = new Set(state.favs);

  // ---------- รายการทั้งหมด (ค้นหาอยู่ใน js/search.js) ----------
  // kaomoji เดียวกันอาจอยู่หลายหมวด: นับครั้งเดียว
  var byId = {};
  var seen = new Set();
  DATA.forEach(function (c) {
    byId[c.id] = c;
    c.items.forEach(function (k) { seen.add(k); });
  });
  var ALL = Array.from(seen);
  // หมวดที่ไม่ได้อยู่ในกลุ่มไหน (ถ้ามีเพิ่มทีหลัง) ไปรวมใน "อื่นๆ"
  var grouped = new Set([].concat.apply([], GROUPS.map(function (g) { return g.ids; })));
  DATA.forEach(function (c) { if (!grouped.has(c.id)) GROUPS[GROUPS.length - 1].ids.push(c.id); });

  var $ = function (id) { return document.getElementById(id); };
  var grid = $("grid"), chips = $("chips"), search = $("search"), mascot = $("mascot");
  var sidebar = $("sidebar"), backdrop = $("sheetBackdrop");

  function catLabel(id) {
    if (id === "all") return t("all");
    if (id === "fav") return "★ " + t("favorites");
    if (id === "recent") return "↺ " + t("recent");
    return byId[id] ? byId[id][Kao.lang] : "";
  }

  // ---------- หมวด (sidebar / แผ่นด้านล่างบนมือถือ) ----------
  function catButton(id, n, tone) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cat" + (id === state.cat ? " active" : "");
    b.dataset.cat = id;
    b.dataset.tone = tone;
    var dot = document.createElement("span");
    dot.className = "cat-dot";
    var name = document.createElement("span");
    name.className = "cat-name";
    name.textContent = catLabel(id);
    var s = document.createElement("small");
    s.textContent = n;
    b.append(dot, name, s);
    return b;
  }

  function renderChips() {
    chips.innerHTML = "";
    var frag = document.createDocumentFragment();
    var top = document.createElement("div");
    top.className = "cat-group";
    top.append(
      catButton("all", ALL.length, 0),
      catButton("fav", state.favs.length, 3),
      catButton("recent", state.recent.length, 1)
    );
    frag.appendChild(top);
    GROUPS.forEach(function (g, gi) {
      var wrap = document.createElement("div");
      wrap.className = "cat-group";
      var title = document.createElement("p");
      title.className = "cat-group-title";
      title.textContent = t(g.key);
      wrap.appendChild(title);
      g.ids.forEach(function (id) {
        if (byId[id]) wrap.appendChild(catButton(id, byId[id].items.length, gi % 6));
      });
      frag.appendChild(wrap);
    });
    chips.appendChild(frag);
  }

  // ปุ่มลัดบนมือถือ: [หมวด ▾] [หน้าโปรด] [ก๊อปล่าสุด]
  function renderQuick() {
    var row = $("quickRow");
    var special = state.cat === "all" || state.cat === "fav" || state.cat === "recent";
    row.innerHTML = "";
    var browse = document.createElement("button");
    browse.type = "button";
    browse.className = "quick quick-browse" + (!special ? " active" : "");
    browse.dataset.action = "browse";
    browse.innerHTML = "<span></span><span class=\"caret\">▾</span>";
    browse.firstChild.textContent = special ? t("browse") : catLabel(state.cat);
    row.appendChild(browse);
    ["all", "fav", "recent"].forEach(function (id) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "quick" + (state.cat === id ? " active" : "");
      b.dataset.cat = id;
      b.textContent = catLabel(id);
      row.appendChild(b);
    });
  }

  function renderSuggest() {
    var box = $("suggest");
    box.innerHTML = "";
    var label = document.createElement("span");
    label.className = "suggest-label";
    label.textContent = t("tryLabel");
    box.appendChild(label);
    t("suggestions").split(",").forEach(function (w) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sugg";
      b.textContent = w;
      box.appendChild(b);
    });
    var k = document.createElement("span");
    k.className = "kbd";
    k.textContent = t("kbdHint");
    box.appendChild(k);
  }

  // แถบ "ก๊อปซ้ำ" ด้านบน (เฉพาะหน้าทั้งหมด ตอนไม่ได้ค้นหา)
  function renderRecentStrip() {
    var strip = $("recentStrip");
    var show = state.cat === "all" && !state.query && state.recent.length > 0;
    strip.hidden = !show;
    if (!show) return;
    strip.innerHTML = "";
    var label = document.createElement("span");
    label.className = "strip-label";
    label.textContent = t("copyAgain");
    strip.appendChild(label);
    state.recent.slice(0, 10).forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "again";
      b.textContent = k;
      strip.appendChild(b);
    });
  }

  // ---------- grid ----------
  function searching() { return state.query.trim() !== ""; }

  // ผลค้นหาล่าสุด (บอกว่าแสดงผลใกล้เคียง / แก้คำที่พิมพ์ผิดให้หรือเปล่า)
  var lastSearch = null;
  function currentItems() {
    lastSearch = null;
    // ค้นหาทุกหมวดเสมอ ไม่ต้องสงสัยว่าทำไมหาไม่เจอเพราะอยู่ผิดหมวด
    if (searching()) {
      lastSearch = window.KaoSearch ? KaoSearch.run(state.query) : { items: [], partial: false, fixed: [] };
      return lastSearch.items;
    }
    if (state.cat === "all") return ALL;
    if (state.cat === "fav") return state.favs;
    if (state.cat === "recent") return state.recent;
    return byId[state.cat] ? byId[state.cat].items : [];
  }

  function makeCard(k) {
    var card = document.createElement("div");
    card.className = "card" + ([...k].length > 16 ? " wide" : "");
    card.dataset.k = k;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.textContent = k;
    var on = favSet.has(k);
    var star = document.createElement("button");
    star.type = "button";
    star.className = "fav" + (on ? " on" : "");
    star.textContent = on ? "★" : "☆";
    star.title = on ? t("removeFav") : t("addFav");
    star.setAttribute("aria-label", star.title);
    card.appendChild(star);
    return card;
  }

  // วาดเพิ่มอีกหนึ่งชุดเมื่อเลื่อนใกล้ท้ายรายการ
  var pending = [], shown = 0;
  var sentinel = document.createElement("div");
  sentinel.className = "grid-sentinel";
  var io = window.IntersectionObserver ? new IntersectionObserver(function (en) {
    if (en[0].isIntersecting) appendChunk();
  }, { rootMargin: "900px 0px" }) : null;

  function appendChunk() {
    if (shown >= pending.length) return;
    var frag = document.createDocumentFragment();
    var end = Math.min(pending.length, shown + (io ? CHUNK : pending.length));
    for (var i = shown; i < end; i++) frag.appendChild(makeCard(pending[i]));
    shown = end;
    grid.appendChild(frag);
    if (shown < pending.length) {
      grid.after(sentinel);
      // ถ้า sentinel ยังอยู่ในระยะ observer จะยิงอีกรอบหลัง observe ใหม่
      io.unobserve(sentinel);
      io.observe(sentinel);
    } else sentinel.remove();
  }

  function renderGrid(animate) {
    var items = currentItems();
    pending = items;
    shown = 0;
    grid.innerHTML = "";
    appendChunk();
    if (animate && M) M.enter(grid.children);

    $("sectionTitle").textContent = searching()
      ? t("resultsFor").replace("{q}", state.query.trim())
      : catLabel(state.cat);
    chips.classList.toggle("searching", searching());
    countTo(items.length);
    var empty = $("empty");
    empty.hidden = items.length > 0;
    empty.querySelector("span").textContent = searching() ? t("empty")
      : state.cat === "fav" ? t("emptyFav")
      : state.cat === "recent" ? t("emptyRecent") : t("empty");
    if (!empty.hidden && M) M.boing(empty.querySelector("b"), 5);
    renderSearchNote();
    var clr = $("clearRecent");
    clr.hidden = !(state.cat === "recent" && state.recent.length && !searching());
    clr.textContent = t("clearRecent");
    renderRecentStrip();
    renderQuick();
    setMascot(searching() ? (items.length ? "found" : "none") : "idle");
  }

  function renderSearchNote() {
    var note = $("searchNote");
    var parts = [];
    if (lastSearch && lastSearch.items.length) {
      if (lastSearch.fixed.length) {
        parts.push(t("searchFixed").replace("{q}", lastSearch.fixed.map(function (f) { return f[1]; }).join(" ")));
      }
      if (lastSearch.partial) parts.push(t("searchPartial"));
    }
    note.hidden = !parts.length;
    note.textContent = parts.join(" · ");
  }

  // ตัวเลขผลลัพธ์นับขึ้น/ลงแบบนุ่มๆ
  var countEl = $("count"), countVal = null, countRaf = 0;
  function countTo(n) {
    cancelAnimationFrame(countRaf);
    if (countVal === null || (M && M.reduced)) { countVal = n; countEl.textContent = t("results", n); return; }
    var from = countVal, start = performance.now(), dur = 420;
    (function step(now) {
      var p = Math.min(1, (now - start) / dur);
      p = 1 - Math.pow(1 - p, 3);
      countVal = Math.round(from + (n - from) * p);
      countEl.textContent = t("results", countVal);
      if (p < 1) countRaf = requestAnimationFrame(step);
    })(start);
  }

  // ---------- มาสคอตในช่องค้นหา ทำหน้าตาตามสถานการณ์ ----------
  var FACES = { idle: "( ˘ᵕ˘ )", typing: "( •̀ᴗ•́ )", found: "( ˶ˆᗜˆ˵ )", none: "( ˘•̥-•̥˘ )", copied: "( ˶ᵔ ᵕ ᵔ˶ )♡" };
  function setMascot(mood) {
    if (!mascot || mascot.textContent === FACES[mood]) return;
    mascot.textContent = FACES[mood];
    if (M) M.boing(mascot, 3);
  }

  // ---------- actions ----------
  var copyTimer;
  function remember(k) {
    state.recent = [k].concat(state.recent.filter(function (x) { return x !== k; })).slice(0, RECENT_MAX);
    Kao.save("kao.recent", state.recent);
    // ไม่ re-render ทั้ง grid เพื่อไม่ให้การ์ดกระโดด; อัปเดตแค่ตัวเลขบนหมวด
    updateChipCount("recent", state.recent.length);
  }

  function onCopy(card) {
    var k = card.dataset.k;
    Kao.copyAndToast(k).then(function (ok) {
      if (!ok) return;
      card.dataset.done = t("copiedShort");
      card.classList.add("copied");
      clearTimeout(card._t);
      card._t = setTimeout(function () { card.classList.remove("copied"); }, 900);
      if (M) M.boing(card, 3);
      setMascot("copied");
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () { setMascot(searching() ? "found" : "idle"); }, 1600);
      remember(k);
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
    var on = favSet.has(k);
    Kao.sound(on ? "favOn" : "favOff");
    if (state.cat === "fav" && !searching()) { renderGrid(false); }
    else {
      btn.classList.toggle("on", on);
      btn.textContent = on ? "★" : "☆";
      btn.title = on ? t("removeFav") : t("addFav");
      btn.setAttribute("aria-label", btn.title);
      if (M) {
        M.to(btn, { s: 1, r: 0 }, { k: 600, c: 12, v: on ? { s: 14, r: 400 } : { s: -6 } });
        if (on) M.burstAt(btn, { count: 5, glyphs: ["★", "✦", "⋆"] });
      }
    }
    updateChipCount("fav", state.favs.length);
  }

  function updateChipCount(id, n) {
    var chip = chips.querySelector('[data-cat="' + id + '"] small');
    if (chip) { chip.textContent = n; if (M) M.boing(chip, 5); }
  }

  function selectCat(id) {
    var changed = state.cat !== id || searching();
    state.cat = id;
    // เลือกหมวด = เลิกค้นหา
    if (searching()) { search.value = ""; state.query = ""; syncSearchUi(); }
    chips.querySelectorAll(".cat").forEach(function (c) { c.classList.toggle("active", c.dataset.cat === id); });
    if (!changed) return;
    renderGrid(true);
    // ให้เห็นหัวรายการหลังเปลี่ยนหมวด (เลื่อนเฉพาะถ้าเลื่อนผ่านไปแล้ว)
    var list = document.querySelector(".lib-list");
    var top = list.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) - 16;
    if (top < 0) window.scrollBy({ top: top, behavior: M && !M.reduced ? "smooth" : "auto" });
  }

  // ---------- แผ่นเลือกหมวด (มือถือ) ----------
  var mobile = window.matchMedia("(max-width: 860px)");
  function openSheet() {
    sidebar.classList.add("open");
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    var active = chips.querySelector(".cat.active");
    if (active) setTimeout(function () { active.focus({ preventScroll: true }); active.scrollIntoView({ block: "center" }); }, 60);
  }
  function closeSheet() {
    if (!sidebar.classList.contains("open")) return;
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }
  $("sheetClose").addEventListener("click", closeSheet);
  backdrop.addEventListener("click", closeSheet);
  mobile.addEventListener && mobile.addEventListener("change", closeSheet);

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
    selectCat(b.dataset.cat);
    if (mobile.matches) setTimeout(closeSheet, 160);
  });

  $("quickRow").addEventListener("click", function (e) {
    var b = e.target.closest(".quick");
    if (!b) return;
    if (b.dataset.action === "browse") { openSheet(); return; }
    selectCat(b.dataset.cat);
  });

  $("recentStrip").addEventListener("click", function (e) {
    var b = e.target.closest(".again");
    if (!b) return;
    var k = b.textContent;
    Kao.copyAndToast(k).then(function (ok) { if (ok && M) M.boing(b, 3); });
  });

  $("suggest").addEventListener("click", function (e) {
    var b = e.target.closest(".sugg");
    if (!b) return;
    search.value = b.textContent;
    runSearch();
  });

  var searchWrap = $("searchWrap"), searchClear = $("searchClear");
  function syncSearchUi() {
    var has = search.value !== "";
    searchWrap.classList.toggle("has-text", has);
    searchClear.hidden = !has;
  }
  function runSearch() {
    syncSearchUi();
    state.query = search.value;
    renderGrid(true);
  }
  var searchTimer;
  search.addEventListener("input", function () {
    clearTimeout(searchTimer);
    syncSearchUi();
    setMascot("typing");
    searchTimer = setTimeout(runSearch, 120);
  });
  searchClear.addEventListener("click", function () {
    search.value = "";
    runSearch();
    search.focus();
  });
  document.addEventListener("keydown", function (e) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); search.focus(); }
    if (e.key === "Escape") {
      if (sidebar.classList.contains("open")) closeSheet();
      else if (document.activeElement === search && search.value) { search.value = ""; runSearch(); }
    }
  });

  $("clearRecent").addEventListener("click", function () {
    state.recent = [];
    Kao.save("kao.recent", state.recent);
    updateChipCount("recent", 0);
    renderGrid(false);
  });

  // ลิงก์ตรงเข้าผลค้นหา/หมวด เช่น index.html?q=แมว หรือ index.html?cat=cat
  // (ใช้กับ Google "ค้นหาในเว็บ" และลิงก์จากหน้าหมวดหมู่)
  try {
    var params = new URLSearchParams(location.search);
    var pc = params.get("cat"), pq = params.get("q");
    if (pc && (byId[pc] || pc === "fav" || pc === "recent")) state.cat = pc;
    if (pq) { search.value = pq; state.query = pq; syncSearchUi(); }
  } catch (e) {}

  var firstRender = true;
  Kao.onLang(function () {
    $("tagline").textContent = t("tagline", ALL.length);
    renderChips();
    renderSuggest();
    renderGrid(firstRender);
    firstRender = false;
  });
  Kao.start();
})();
