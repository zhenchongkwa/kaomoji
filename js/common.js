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

  // ---------- header / footer ----------
  var PAGES = [
    { id: "library", href: "index.html", icon: "˘ᵕ˘", key: "navLibrary", tab: "tabLibrary" },
    { id: "maker", href: "maker.html", icon: "(•‿•)", key: "navMaker", tab: "tabMaker" },
    { id: "font", href: "font.html", icon: "ꜰᴏɴᴛ", key: "navFont", tab: "tabFont" },
    { id: "aa", href: "aa.html", icon: "🎂", key: "navAA", tab: "tabAA" },
    { id: "frame", href: "frame.html", icon: "┏♡┓", key: "navFrame", tab: "tabFrame" },
    { id: "kira", href: "kirakira.html", icon: "⟡₊·", key: "navKira", tab: "tabKira" },
    { id: "emoji", href: "emoji.html", icon: "🩷", key: "navEmoji", tab: "tabEmoji" }
  ];
  var page = document.body.dataset.page;
  // หน้าที่อยู่ในโฟลเดอร์ย่อย (เช่น k/cat.html) ตั้ง data-base="../" เพื่อให้ลิงก์ถูก
  var BASE = document.body.dataset.base || "";

  function renderHeader() {
    var el = document.getElementById("siteHeader");
    if (!el) return;
    el.className = "header";
    el.innerHTML =
      '<div class="header-inner">' +
        '<a class="brand" href="' + BASE + 'index.html">' +
          '<span><span class="brand-name" data-i18n="siteName"></span>' +
          '<span class="tagline" data-i18n="siteSub"></span></span>' +
        '</a>' +
        '<nav class="tool-nav" aria-label="tools">' +
          PAGES.map(function (p) {
            return '<a href="' + BASE + p.href + '" class="tool-link' + (p.id === page ? " active" : "") +
              '" data-i18n-title="' + p.key + '"><span class="tool-icon">' + p.icon + "</span>" +
              '<span class="tool-label" data-i18n="' + p.key + '"></span></a>';
          }).join("") +
        "</nav>" +
        '<div class="actions">' +
          '<button class="icon-btn" id="soundBtn" type="button"></button>' +
          '<button class="icon-btn" id="langBtn" type="button"></button>' +
          '<button class="icon-btn" id="themeBtn" type="button" data-i18n-title="theme" data-i18n-aria="theme">' +
            '<span class="sun">☀</span><span class="moon">☾</span></button>' +
        "</div>" +
      "</div>";

    // แถบแท็บด้านล่างสำหรับมือถือ (CSS ซ่อนไว้บนจอใหญ่)
    var tabbar = document.createElement("nav");
    tabbar.className = "tabbar";
    tabbar.setAttribute("aria-label", "tools");
    tabbar.innerHTML = PAGES.map(function (p) {
      return '<a href="' + BASE + p.href + '" class="tab' + (p.id === page ? " active" : "") + '"' +
        (p.id === page ? ' aria-current="page"' : "") + '>' +
        '<span class="tab-icon">' + p.icon + "</span>" +
        '<span data-i18n="' + p.tab + '"></span></a>';
    }).join("");
    document.body.appendChild(tabbar);

    document.getElementById("langBtn").addEventListener("click", function () {
      sound("toggle");
      setLang(lang === "th" ? "en" : "th");
    });
    document.getElementById("themeBtn").addEventListener("click", function () {
      // ค่าเริ่มต้นเป็นโหมดสว่างเสมอ
      var root = document.documentElement;
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("kao.theme", next); } catch (e) {}
      sound("toggle");
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
    b.textContent = muted ? "🔇" : "🔊";
    b.title = t(muted ? "soundOn" : "soundOff");
    b.setAttribute("aria-label", b.title);
    b.setAttribute("aria-pressed", String(!muted));
  }

  // ป๊อปเบาๆ ให้ปุ่มทั่วไป (ปุ่มที่คัดลอก / ดาว / สัญลักษณ์ / หัวเว็บ มีเสียงของตัวเองแล้ว)
  var POP = ".chip, .cat, .btn, .tab, .tool-link, .footer-links a, .brand, .link-btn, .jump-btn";
  var OWN_SOUND = "#copyBtn, #randomBtn, #saveBtn, .card, .pill, .aa-card, .fav, .sym, .icon-btn, .maker-face";
  document.addEventListener("click", function (e) {
    var el = e.target.closest(POP);
    if (!el || e.target.closest(OWN_SOUND)) return;
    sound("pop");
    // ลิงก์ไปหน้าอื่น: หน่วงนิดนึงให้ได้ยินเสียงก่อนเปลี่ยนหน้า
    if (el.tagName === "A" && el.href && !e.defaultPrevented && !e.ctrlKey && !e.metaKey &&
        !e.shiftKey && el.target !== "_blank" && window.KaoSound && !KaoSound.muted) {
      e.preventDefault();
      setTimeout(function () { location.href = el.href; }, 90);
    }
  });

  function renderFooter() {
    var el = document.getElementById("siteFooter");
    if (!el) return;
    el.className = "footer";
    el.innerHTML =
      '<div class="footer-inner">' +
        '<nav class="footer-links">' +
          PAGES.map(function (p) {
            return '<a href="' + BASE + p.href + '" data-i18n="' + p.key + '"></a>';
          }).join("") +
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

  // initial = โหลดหน้าครั้งแรก: คง <title> เดิมจาก HTML ไว้ (มีคีย์เวิร์ดสำหรับ SEO)
  function refreshLang(initial) {
    document.documentElement.lang = lang;
    var lb = document.getElementById("langBtn");
    if (lb) { lb.textContent = lang === "th" ? "EN" : "TH"; lb.title = t("lang"); }
    applyI18n();
    updateSoundBtn();
    var titleKey = document.body.dataset.titleKey;
    if (!initial) document.title = (titleKey ? t(titleKey) + " — " : "") + t("siteName");
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
  function toast(html) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = html;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1400);
  }

  // คัดลอก + แจ้งเตือน; preview = ข้อความสั้นที่จะโชว์ใน toast (ไม่ใส่ก็ได้)
  function copyAndToast(text, preview) {
    return copyText(text).then(function (ok) {
      if (!ok) { toast(t("copyFail")); return false; }
      sound("copy");
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
    function check() {
      var target = document.getElementById(targetId);
      if (target) b.classList.toggle("hide", target.getBoundingClientRect().top < window.innerHeight - 40);
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    setTimeout(check, 0);
  }

  window.Kao = {
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
    sound: sound,
    // เรียกหลังหน้าเว็บลงทะเบียน onLang เรียบร้อย
    start: function () { refreshLang(true); }
  };

  renderHeader();
  renderFooter();
})();
