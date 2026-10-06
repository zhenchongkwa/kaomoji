/*
 * ส่วนกลางที่ทุกหน้าใช้ร่วมกัน: header + เมนู, footer, ภาษา, ธีม, คัดลอก, toast
 * หน้าเว็บต้องมี <body data-page="..."> และ <header id="siteHeader"> / <footer id="siteFooter">
 */
(function () {
  "use strict";

  var I18N = window.I18N;

  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  var lang = load("kao.lang", (navigator.language || "th").indexOf("th") === 0 ? "th" : "en");
  if (!I18N[lang]) lang = "th";
  var listeners = [];

  function t(key, n) {
    var s = I18N[lang][key];
    if (s == null) s = key;
    return n == null ? s : s.replace("{n}", Number(n).toLocaleString());
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---------- ไอคอนวาดเอง (SVG เส้นมน น้ำหนักเดียวกันทั้งชุด แทนอีโมจิ) ----------
  // .f = ส่วนที่ระบายทึบ, .soft = ระบายจางๆ (แก้ม)
  var ICONS = {
    // หน้าก้อนกลม ˘ᵕ˘
    library: '<path d="M12 3.6c4.8 0 8.4 3.1 8.4 7.9 0 4.7-3.5 8.9-8.4 8.9s-8.4-4.2-8.4-8.9c0-4.8 3.6-7.9 8.4-7.9z"/>' +
      '<path d="M7.7 10.7q1.2 1.5 2.4 0M13.9 10.7q1.2 1.5 2.4 0M11 14q1 1.1 2 0"/>' +
      '<ellipse class="soft" cx="7.4" cy="13.6" rx="1.4" ry=".9"/><ellipse class="soft" cx="16.6" cy="13.6" rx="1.4" ry=".9"/>',
    // ตัว Aa
    font: '<path d="M3.2 18.5 7.6 5.8l4.4 12.7M4.8 14.2h5.6"/><circle cx="16.7" cy="15.3" r="3.1"/><path d="M19.8 12v6.5"/>',
    // เค้กวันเกิด
    cake: '<path d="M4.2 20.4h15.6M5.6 20.4v-6.2a2.1 2.1 0 0 1 2.1-2.1h8.6a2.1 2.1 0 0 1 2.1 2.1v6.2"/>' +
      '<path d="M5.6 15.4q1.6 1.5 3.2 0t3.2 0 3.2 0 3.2 0M12 12.1V8.8"/>' +
      '<path class="f" d="M12 3.9c1 1.1 1 2.4 0 3.2-1-.8-1-2.1 0-3.2z"/>',
    // กรอบ + หัวใจ
    frame: '<rect x="3.4" y="4.4" width="17.2" height="15.2" rx="3.4"/>' +
      '<path d="M12 15.6s-3.3-1.9-3.3-4.2a1.75 1.75 0 0 1 3.3-.85 1.75 1.75 0 0 1 3.3.85c0 2.3-3.3 4.2-3.3 4.2z"/>',
    // ประกายวิบวับ
    sparkle: '<path d="M10 3.2c.6 3.7 2.5 5.6 6.2 6.2-3.7.6-5.6 2.5-6.2 6.2-.6-3.7-2.5-5.6-6.2-6.2 3.7-.6 5.6-2.5 6.2-6.2z"/>' +
      '<path d="M18 14.4c.3 1.7 1 2.4 2.6 2.6-1.6.3-2.3 1-2.6 2.6-.3-1.6-1-2.3-2.6-2.6 1.6-.2 2.3-.9 2.6-2.6z"/>',
    // หัวใจ + เกล็ดน้ำตาลโรย
    sprinkle: '<path d="M10.2 20.2s-6.4-3.7-6.4-8a3.3 3.3 0 0 1 6.4-1.5 3.3 3.3 0 0 1 6.4 1.5c0 4.3-6.4 8-6.4 8z"/>' +
      '<path d="M17.6 3.8l.9 1.7M21 7.6l-1.8.5M14.6 4.6l.3 1.6"/>',
    soundOn: '<path d="M4.6 9.4h2.9l4.4-3.9v13l-4.4-3.9H4.6a1.1 1.1 0 0 1-1.1-1.1V10.5a1.1 1.1 0 0 1 1.1-1.1z"/>' +
      '<path d="M15.4 9.2a4 4 0 0 1 0 5.6M17.9 6.7a7.6 7.6 0 0 1 0 10.6"/>',
    soundOff: '<path d="M4.6 9.4h2.9l4.4-3.9v13l-4.4-3.9H4.6a1.1 1.1 0 0 1-1.1-1.1V10.5a1.1 1.1 0 0 1 1.1-1.1z"/>' +
      '<path d="M15.8 9.6l4.8 4.8M20.6 9.6l-4.8 4.8"/>',
    sun: '<circle cx="12" cy="12" r="3.9"/>' +
      '<path d="M12 3v1.9M12 19.1V21M3 12h1.9M19.1 12H21M5.6 5.6l1.35 1.35M17.05 17.05l1.35 1.35M5.6 18.4l1.35-1.35M17.05 6.95l1.35-1.35"/>',
    moon: '<path d="M19.4 14.6A7.9 7.9 0 0 1 9.4 4.6a7.9 7.9 0 1 0 10 10z"/><path class="f" d="M16.5 4.2l.45 1.1 1.1.45-1.1.45-.45 1.1-.45-1.1-1.1-.45 1.1-.45z"/>'
  };
  function icon(name) {
    return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }

  // ---------- header / footer ----------
  var PAGES = [
    { id: "library", href: "index.html", icon: "library", key: "navLibrary", tab: "tabLibrary" },
    { id: "font", href: "font.html", icon: "font", key: "navFont", tab: "tabFont" },
    { id: "aa", href: "aa.html", icon: "cake", key: "navAA", tab: "tabAA" },
    { id: "frame", href: "frame.html", icon: "frame", key: "navFrame", tab: "tabFrame" },
    { id: "kira", href: "kirakira.html", icon: "sparkle", key: "navKira", tab: "tabKira" },
    { id: "emoji", href: "emoji.html", icon: "sprinkle", key: "navEmoji", tab: "tabEmoji" }
  ];
  var page = document.body.dataset.page;

  // สีพื้นหลังของแต่ละธีม (ต้องตรงกับ --bg ใน css/style.css) ใช้กับวงกลมตอนเปลี่ยนธีมบนเครื่องสเปกต่ำ
  var THEME_BG = { light: "#f6f7f9", dark: "#16171b" };
  var switching = false;

  function renderHeader() {
    var el = document.getElementById("siteHeader");
    if (!el) return;
    el.className = "header";
    el.innerHTML =
      '<div class="header-inner">' +
        // โลโก้เป็นปุ่มจิ้มเล่น (ไม่ใช่ลิงก์) ส่วนชื่อเว็บข้างๆ ยังกดกลับหน้าแรกได้
        '<div class="brand">' +
          '<button class="logo" id="logoBtn" type="button" data-i18n-title="popBoop" data-i18n-aria="popBoop">˘ᵕ˘</button>' +
          '<a class="brand-link" href="index.html"><span class="brand-name" data-i18n="siteName"></span>' +
          '<span class="tagline" data-i18n="siteSub"></span></a>' +
        '</div>' +
        '<nav class="tool-nav" aria-label="tools">' +
          PAGES.map(function (p) {
            var on = p.id === page;
            return '<a href="' + p.href + '" class="tool-link' + (on ? " active" : "") + '"' +
              (on ? ' aria-current="page"' : "") + ' data-i18n-title="' + p.key + '">' +
              (on ? '<span class="nav-pill" aria-hidden="true"></span>' : "") +
              '<span class="tool-icon">' + icon(p.icon) + "</span>" +
              '<span class="tool-label" data-i18n="' + p.key + '"></span></a>';
          }).join("") +
        "</nav>" +
        '<div class="actions">' +
          '<button class="icon-btn" id="soundBtn" type="button"></button>' +
          '<button class="icon-btn" id="langBtn" type="button"></button>' +
          '<button class="icon-btn" id="themeBtn" type="button" data-i18n-title="theme" data-i18n-aria="theme">' +
            '<span class="sun">' + icon("sun") + '</span><span class="moon">' + icon("moon") + '</span></button>' +
        "</div>" +
      "</div>";

    // แถบแท็บด้านล่างสำหรับมือถือ (CSS ซ่อนไว้บนจอใหญ่)
    var tabbar = document.createElement("nav");
    tabbar.className = "tabbar";
    tabbar.setAttribute("aria-label", "tools");
    tabbar.innerHTML = PAGES.map(function (p) {
      return '<a href="' + p.href + '" class="tab' + (p.id === page ? " active" : "") + '"' +
        (p.id === page ? ' aria-current="page"' : "") + '>' +
        (p.id === page ? '<span class="tab-pill" aria-hidden="true"></span>' : "") +
        '<span class="tab-icon">' + icon(p.icon) + "</span>" +
        '<span data-i18n="' + p.tab + '"></span></a>';
    }).join("");
    document.body.appendChild(tabbar);

    document.getElementById("langBtn").addEventListener("click", function () {
      sound("toggle");
      setLang(lang === "th" ? "en" : "th");
    });
    document.getElementById("themeBtn").addEventListener("click", function () {
      if (switching) return; // กดรัวระหว่างกำลังเปลี่ยน ไม่ต้องเริ่มใหม่
      // ค่าเริ่มต้นเป็นโหมดสว่างเสมอ
      var root = document.documentElement;
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      sound("toggle");
      var M = window.Motion;

      // เปลี่ยนสีทั้งหน้าทีเดียวโดยปิด transition ชั่วคราว
      // (ไม่งั้นการ์ด/ปุ่มหลายร้อยชิ้นจะค่อยๆ เปลี่ยนสีพร้อมกัน = กระตุก)
      function apply() {
        root.classList.add("no-anim");
        root.dataset.theme = next;
        try { localStorage.setItem("kao.theme", next); } catch (e) {}
      }
      function afterPaint(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }

      if ((M && M.reduced) || !Element.prototype.animate) {
        apply();
        afterPaint(function () { root.classList.remove("no-anim"); });
        return;
      }
      switching = true;

      // วงกลมสีพื้นหลังใหม่ขยายจากปุ่มจนเต็มจอ -> เปลี่ยนธีมตอนจอถูกปิดอยู่ -> จางวงกลมออก
      // ทุกขั้นที่ขยับบนจอใช้แค่ transform/opacity (GPU ทำเอง ไม่รอเธรดหลัก) ส่วนงานหนัก
      // (คำนวณสีใหม่ทั้งหน้า) เกิดตอนจอถูกปิดมิด เลยไม่เห็นอาการกระตุก
      var r = this.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var wipe = document.createElement("div");
      wipe.className = "theme-wipe";
      wipe.style.left = x + "px";
      wipe.style.top = y + "px";
      wipe.style.background = THEME_BG[next];
      document.body.appendChild(wipe);
      var grow = wipe.animate(
        [{ transform: "translate(-50%,-50%) scale(0)" }, { transform: "translate(-50%,-50%) scale(" + (rad / 50 + 0.2) + ")" }],
        { duration: 420, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" }
      );
      grow.onfinish = function () {
        apply();
        // รอให้ธีมใหม่วาดเสร็จจริงก่อน ค่อยเริ่มจาง (จางจากจอที่ปิดมิดเสมอ ไม่กระโดด)
        afterPaint(function () {
          root.classList.remove("no-anim");
          wipe.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "ease-out", fill: "forwards" })
            .onfinish = function () { wipe.remove(); switching = false; };
        });
      };
    });
    document.getElementById("soundBtn").addEventListener("click", function () {
      if (!window.KaoSound) return;
      KaoSound.setMuted(!KaoSound.muted);
      sound("toggle");
      updateSoundBtn();
    });
  }

  // ---------- เสียง ----------
  function sound(name) { if (window.KaoSound) KaoSound.play(name); }

  function updateSoundBtn() {
    var b = document.getElementById("soundBtn");
    if (!b) return;
    var muted = window.KaoSound ? KaoSound.muted : true;
    b.innerHTML = icon(muted ? "soundOff" : "soundOn");
    b.title = t(muted ? "soundOn" : "soundOff");
    b.setAttribute("aria-label", b.title);
    b.setAttribute("aria-pressed", String(!muted));
  }

  // ป๊อปเบาๆ ให้ปุ่มทั่วไป (ปุ่มที่คัดลอก / ดาว / สัญลักษณ์ / หัวเว็บ มีเสียงของตัวเองแล้ว)
  var POP = ".chip, .cat, .btn, .tab, .tool-link, .footer-links a, .brand-link, .link-btn, .jump-btn";
  var OWN_SOUND = "#copyBtn, .card, .pill, .aa-card, .fav, .sym, .icon-btn";
  document.addEventListener("click", function (e) {
    var el = e.target.closest(POP);
    if (!el || e.target.closest(OWN_SOUND)) return;
    // ลิงก์เปลี่ยนหน้าไม่หน่วงรอเสียงแล้ว (เล่นเสียงตอนกดลงแทน ด้านล่าง) — เปลี่ยนหน้าทันที
    if (el.tagName === "A") return;
    sound("pop");
  });
  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(POP);
    if (el && el.tagName === "A" && e.button === 0) sound("pop");
  }, { passive: true });

  // โหลดหน้าถัดไปล่วงหน้าตอนเอาเมาส์ไปชี้/แตะลิงก์ เปลี่ยนหน้าแทบจะทันที (Chromium)
  // เครื่องสเปกต่ำแค่ดึงไฟล์ HTML มารอ (prefetch) ไม่เรนเดอร์ทั้งหน้าไว้เบื้องหลัง (prerender กิน RAM)
  if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
    var rules = document.createElement("script");
    var rule = {};
    rule[document.documentElement.classList.contains("lite") ? "prefetch" : "prerender"] =
      [{ source: "document", where: { selector_matches: ".tool-link, .tab, .footer-links a, .brand-link" }, eagerness: "moderate" }];
    rules.type = "speculationrules";
    rules.textContent = JSON.stringify(rule);
    document.head.appendChild(rules);
  }

  function renderFooter() {
    var el = document.getElementById("siteFooter");
    if (!el) return;
    el.className = "footer";
    el.innerHTML =
      '<div class="footer-inner">' +
        '<nav class="footer-links">' +
          PAGES.map(function (p) {
            return '<a href="' + p.href + '" data-i18n="' + p.key + '"></a>';
          }).join("") +
          '<a href="kaomoji/" data-i18n="allCats"></a>' +
        "</nav>" +
        '<p data-i18n="footer"></p>' +
      "</div>";
  }

  // ---------- i18n ----------
  function applyI18n(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    root.querySelectorAll("[data-i18n-title]").forEach(function (el) { el.title = t(el.dataset.i18nTitle); });
    root.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  }

  function setLang(next) {
    lang = next;
    save("kao.lang", lang);
    refreshLang();
  }

  function refreshLang() {
    document.documentElement.lang = lang;
    var lb = document.getElementById("langBtn");
    if (lb) { lb.textContent = lang === "th" ? "EN" : "TH"; lb.title = t("lang"); }
    applyI18n();
    updateSoundBtn();
    // ไม่เปลี่ยน <title> ตามภาษา: ชื่อหน้าใน HTML เขียนไว้สองภาษาเพื่อ Google/AI อยู่แล้ว
    listeners.forEach(function (fn) { fn(lang); });
  }

  // ---------- copy + toast ----------
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  var toastEl, toastTimer;
  var M = window.Motion;
  function toast(html) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = html;
    var wasShown = toastEl.classList.contains("show");
    toastEl.classList.add("show");
    if (M) {
      // เด้งขึ้นมาครั้งแรก, ถ้าโชว์อยู่แล้วก็แค่ดึ๋งซ้ำ
      if (wasShown) M.boing(toastEl, 2.5);
      else { M.to(toastEl, { y: 28, s: 0.8, r: 0 }, { snap: true }); M.to(toastEl, { y: 0, s: 1, r: -1.5 }, { k: 520, c: 17 }); }
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      if (M) M.to(toastEl, { y: 16, s: 0.92, r: 0 }, { k: 300, c: 26 });
    }, 1500);
  }

  // คัดลอก + แจ้งเตือน; preview = ข้อความสั้นที่จะโชว์ใน toast (ไม่ใส่ก็ได้)
  function copyAndToast(text, preview) {
    return copyText(text).then(function (ok) {
      if (!ok) { toast(t("copyFail")); return false; }
      sound("copy");
      if (M) M.burstAt(document.activeElement);
      var p = preview == null ? text : preview;
      p = p.split("\n")[0];
      if ([...p].length > 24) p = [...p].slice(0, 24).join("") + "…";
      toast(t("copied") + (p ? " <b>" + escapeHtml(p) + "</b>" : " ᴖ ̫ᴖ"));
      return true;
    });
  }

  // ปุ่ม "ไปที่ผลลัพธ์" ลอยอยู่ด้านล่าง (สำหรับหน้าเครื่องมือที่ผลลัพธ์อยู่ไกล)
  function jumpButton(targetId) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "jump-btn";
    b.dataset.i18n = "toResult";
    b.textContent = t("toResult");
    b.addEventListener("click", function () {
      var target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.body.appendChild(b);
    // ซ่อนเมื่อผลลัพธ์อยู่บนจอแล้ว หรือเลื่อนผ่านไปแล้ว
    // (IntersectionObserver แทน scroll listener: ไม่ต้องวัดเลย์เอาต์ทุกครั้งที่เลื่อน)
    var target = document.getElementById(targetId);
    if (!target || !window.IntersectionObserver) return;
    new IntersectionObserver(function (en) {
      var r = en[0].boundingClientRect;
      b.classList.toggle("hide", en[0].isIntersecting || r.top < 0);
    }, { rootMargin: "0px 0px -40px 0px" }).observe(target);
  }

  // ---------- เช็กว่าเครื่องนี้แสดงตัวอักษร/อีโมจิได้ไหม ----------
  // วาดลง canvas เล็กๆ แล้วเทียบกับ "กล่องสี่เหลี่ยม" ที่ได้ตอนไม่มีฟอนต์ (เช่นอีโมจิใหม่บน Windows 10)
  // ใช้ซ่อนสัญลักษณ์/อีโมจิที่เครื่องนี้แสดงไม่ได้ แทนที่จะโชว์เป็นกล่องเปล่า
  var glyphCache = new Map(), gctx = null, tofu = null, emojiW = 0;
  var gseg = window.Intl && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  function draw(g) {
    gctx.clearRect(0, 0, 32, 32);
    gctx.fillText(g, 4, 24);
    return gctx.getImageData(0, 0, 32, 32).data;
  }
  function same(a, b) {
    for (var i = 3; i < a.length; i += 4) if (a[i] !== b[i]) return false;
    return true;
  }
  function blank(a) {
    for (var i = 3; i < a.length; i += 4) if (a[i]) return false;
    return true;
  }
  function glyphOk(g) {
    if (glyphCache.has(g)) return glyphCache.get(g);
    var ok = true;
    if (!/^\s+$/.test(g)) {
      var px = draw(g);
      if (same(px, tofu) || blank(px)) ok = false;
      // อีโมจิประกอบ (ZWJ / สีผิว): เครื่องเก่าจะวาดแยกเป็นหลายตัว กว้างผิดปกติ
      var cps = Array.from(g.replace(/[︎️]/g, ""));
      if (ok && cps.length > 1 && /\p{Extended_Pictographic}/u.test(g)) {
        if (gctx.measureText(g).width > emojiW * 1.5) ok = false;
        // อีโมจิหลักต้องแสดงได้ด้วย (🫶🏻 บนเครื่องเก่า = กล่องเปล่า + สีผิว)
        else if (/\p{Extended_Pictographic}/u.test(cps[0]) && !glyphOk(cps[0])) ok = false;
      }
    }
    glyphCache.set(g, ok);
    return ok;
  }
  function supports(text) {
    try {
      if (!gctx) {
        var cv = document.createElement("canvas");
        cv.width = cv.height = 32;
        gctx = cv.getContext("2d", { willReadFrequently: true });
        var kao = getComputedStyle(document.documentElement).getPropertyValue("--kao") || "sans-serif";
        gctx.font = "20px " + kao;
        gctx.textBaseline = "alphabetic";
        tofu = draw("\u{10FFFD}");
        emojiW = gctx.measureText("😀").width;
      }
      var parts = gseg ? Array.from(gseg.segment(text), function (s) { return s.segment; }) : Array.from(text);
      return parts.every(glyphOk);
    } catch (e) { return true; } // วัดไม่ได้ก็ถือว่าแสดงได้ (ไม่ซ่อนอะไร)
  }
  // เรียก fn หลังฟอนต์เว็บโหลดเสร็จ (ตัวอักษรบางตัวมีแค่ในฟอนต์เว็บ)
  function whenFonts(fn) {
    var run = function () { glyphCache.clear(); gctx = null; fn(); };
    if (document.fonts && document.fonts.ready) {
      var done = function () { document.fonts.ready.then(run); };
      if (document.readyState === "complete") done(); else addEventListener("load", done);
    } else run();
  }

  // ---------- ย่อรายการยาวๆ: โชว์ limit ตัวแรก + ปุ่ม "ดูเพิ่ม (+N)" ----------
  // ตัวที่เลือกอยู่ (.active) โชว์เสมอแม้จะอยู่ในส่วนที่ย่อ; เรียกซ้ำได้หลังวาดรายการใหม่
  function collapse(box, limit, selector) {
    if (!box) return;
    selector = selector || ".chip";
    var items = Array.prototype.filter.call(box.querySelectorAll(selector), function (el) { return !el.hidden; });
    var btn = box.querySelector(":scope > .more-btn");
    if (items.length <= limit + 2) {
      if (btn) btn.remove();
      box.classList.remove("collapsed");
      items.forEach(function (el) { el.classList.remove("is-extra"); });
      return;
    }
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "more-btn";
      btn.addEventListener("click", function () {
        box.dataset.open = box.dataset.open === "1" ? "" : "1";
        sound("pop");
        collapse(box, limit, selector);
      });
    }
    box.appendChild(btn); // ปุ่มอยู่ท้ายสุดเสมอ
    var open = box.dataset.open === "1";
    box.classList.toggle("collapsed", !open);
    items.forEach(function (el, i) { el.classList.toggle("is-extra", i >= limit && !el.classList.contains("active")); });
    btn.textContent = open ? t("showLess") : t("showMore", items.length - limit);
    btn.setAttribute("aria-expanded", String(open));
  }

  window.Kao = {
    collapse: collapse,
    supports: supports,
    whenFonts: whenFonts,
    t: t,
    get lang() { return lang; },
    load: load,
    save: save,
    escapeHtml: escapeHtml,
    copy: copyText,
    copyAndToast: copyAndToast,
    toast: toast,
    applyI18n: applyI18n,
    onLang: function (fn) { listeners.push(fn); },
    jumpButton: jumpButton,
    icon: icon,
    sound: sound,
    // เรียกหลังหน้าเว็บลงทะเบียน onLang เรียบร้อย
    start: function () {
      refreshLang();
      if (M) document.querySelectorAll(".chips, .cat-list").forEach(function (c) {
        M.track(c, c.classList.contains("cat-list") ? ".cat.active" : ".chip.active");
      });
    }
  };

  renderHeader();
  renderFooter();
  document.querySelectorAll("[data-icon]").forEach(function (el) { el.innerHTML = icon(el.dataset.icon); });

  // หัวเว็บมีเงาเมื่อเลื่อนลงมาแล้ว (ใช้ IntersectionObserver แทน scroll listener)
  var sentinel = document.createElement("div");
  sentinel.className = "top-sentinel";
  document.body.prepend(sentinel);
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (en) {
      document.getElementById("siteHeader").classList.toggle("scrolled", !en[0].isIntersecting);
    }).observe(sentinel);
  }

  // ---------- โลโก้: จิ้มแล้วบีบนุ่มๆ แบบตุ๊กตา, จิ้มรัวๆ 12 ทีเปิดเกมป๊อป ----------
  var logo = document.getElementById("logoBtn");
  if (logo) {
    var FACE = "˘ᵕ˘", HAPPY = "ᵔᗜᵔ", BLINK = "-ᴗ-";
    var BOOP = ["˃ᴗ˂", "ᵔᗜᵔ", ">ᴗ<", "•ᗜ•", "≧ᴗ≦"];
    var UNLOCK = 12, taps = 0, tapTimer = 0;
    // เวอร์ชันไฟล์ (เช่น v=17) ใช้ตอนโหลด pop.js ทีหลัง ให้ cache ตรงกัน
    var ver = (document.currentScript && document.currentScript.src.split("?")[1]) || "";

    logo.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse" || taps) return;
      logo.textContent = HAPPY;
      if (M) M.to(logo, { r: 0 }, { k: 500, c: 9, v: { r: 260 } });
    });
    logo.addEventListener("pointerleave", function () { if (!taps) logo.textContent = FACE; });

    // กดลง = แป้งเหลว (แบนลง กว้างออก)
    var squashed = false;
    function squash() {
      squashed = true;
      if (M) M.to(logo, { sx: 1.2, sy: 0.78, y: 3 }, { k: 900, c: 30 });
    }
    // ปล่อย = เด้งดึ๋ง ยิ่งจิ้มเยอะยิ่งเด้งแรง
    // เรียกทุกทางที่การกดจบ (ปล่อยนิ้ว / ลากออก / เบราว์เซอร์ยกเลิก / สลับแอป) ไม่งั้นโลโก้ค้างแบนอยู่
    function unsquash(power) {
      squashed = false;
      if (M) M.to(logo, { sx: 1, sy: 1, y: 0, s: 1 }, { k: 520, c: 10, vset: { sy: power, sx: -power * 0.85, y: 0 } });
    }
    function bounceNow() { return Math.min(4 + taps * 0.3, 7); }
    logo.addEventListener("pointerdown", function (e) { if (e.button === 0) squash(); });
    logo.addEventListener("pointerup", function () { if (squashed) unsquash(bounceNow()); });
    ["pointercancel", "pointerleave", "lostpointercapture"].forEach(function (type) {
      logo.addEventListener(type, function () { if (squashed) unsquash(2.5); });
    });
    window.addEventListener("blur", function () { if (squashed) unsquash(2.5); });

    logo.addEventListener("click", function (e) {
      taps++;
      sound("boop");
      logo.textContent = BOOP[taps % BOOP.length];
      // ยิ่งจิ้มยิ่งแก้มแดง (บอกใบ้ว่ามีอะไรรออยู่)
      logo.style.setProperty("--heat", Math.min(1, taps / UNLOCK).toFixed(2));
      // กดด้วยคีย์บอร์ด (ไม่มี pointerdown) ก็ยังเด้ง
      if (e.detail === 0 || squashed) unsquash(bounceNow());
      clearTimeout(tapTimer);
      if (taps >= UNLOCK) {
        taps = 0;
        if (M) M.burstAt(logo, { count: 8 });
        setTimeout(openPop, 120);
      }
      tapTimer = setTimeout(function () {
        taps = 0;
        logo.textContent = FACE;
        logo.style.removeProperty("--heat");
      }, taps >= UNLOCK || !taps ? 600 : 1400);
    });

    (function blink() {
      setTimeout(function () {
        if (logo.textContent === FACE && !document.hidden) {
          logo.textContent = BLINK;
          setTimeout(function () { if (logo.textContent === BLINK) logo.textContent = FACE; }, 160);
        }
        blink();
      }, 3200 + Math.random() * 3800);
    })();

    // โหลดโค้ดเกมเฉพาะตอนปลดล็อก (คนส่วนใหญ่ไม่ต้องโหลดเลย)
    var loading = false;
    function openPop() {
      if (window.KaoPop) { KaoPop.open(logo); return; }
      if (loading) return;
      loading = true;
      var sc = document.createElement("script");
      sc.src = "js/pop.js" + (ver ? "?" + ver : "");
      sc.onload = function () { loading = false; KaoPop.open(logo); };
      sc.onerror = function () { loading = false; };
      document.body.appendChild(sc);
    }
  }
})();
