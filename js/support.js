/*
 * เลี้ยงขนม (PromptPay / TrueMoney) + โฆษณา (Google AdSense) พร้อมปุ่มซ่อนโฆษณา
 * ตั้งค่าทั้งหมดอยู่ใน js/config.js
 *
 * โฆษณา: หน้าละ 1 ที่ (ใต้ผลลัพธ์ / sidebar หน้าคลังบนจอใหญ่ / เหนือ footer) ไม่แทรกระหว่างการ์ดคาโอโมจิ
 * กด "ซ่อนโฆษณา" = จำไว้ในเครื่อง แล้วไม่โหลดสคริปต์โฆษณาเลย (ไม่ใช่แค่ซ่อน ซึ่งผิดกฎ AdSense)
 */
(function () {
  "use strict";

  var C = window.KAO_CONFIG || {};
  var D = C.donate || {}, A = C.ads || {};
  var t = Kao.t;
  var NO_ADS = "kao.noAds";
  var local = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  // ---------- เลี้ยงขนม ----------
  var donateOpts = [];   // ช่องทางที่มีรูป QR จริง
  var donateReady = false, donateCbs = [];
  function whenDonate(fn) { if (donateReady) fn(); else donateCbs.push(fn); }

  // เช็กว่ามีไฟล์รูป QR ไหม (HEAD request เบาๆ ตอนเบราว์เซอร์ว่าง ไม่โหลดรูปทุกหน้า)
  function checkDonate() {
    var list = [["promptpay", D.promptpay], ["truemoney", D.truemoney]].filter(function (x) { return x[1]; });
    var done = function () {
      donateReady = true;
      donateCbs.splice(0).forEach(function (fn) { fn(); });
    };
    if (location.protocol === "file:" || !window.fetch) { donateOpts = list; done(); return; }
    Promise.all(list.map(function (x) {
      return fetch(x[1], { method: "HEAD" }).then(function (r) { return r.ok ? x : null; }, function () { return null; });
    })).then(function (res) { donateOpts = res.filter(Boolean); done(); });
  }
  function canDonate() { return donateOpts.length > 0 || !!D.angpaoContact; }

  var dialog = null;
  function openDonate() {
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "donate";
      document.body.appendChild(dialog);
      dialog.addEventListener("click", function (e) {
        // กดพื้นหลังนอกกล่อง = ปิด
        if (e.target === dialog || e.target.closest(".donate-close")) dialog.close();
      });
    }
    dialog.innerHTML =
      '<div class="donate-box">' +
        '<button class="donate-close" type="button" aria-label="' + t("close") + '">×</button>' +
        '<h2 class="section-title">' + t("donateTitle") + "</h2>" +
        '<p class="donate-text">' + Kao.escapeHtml(t("donateText")) + "</p>" +
        '<div class="donate-qrs">' +
          donateOpts.map(function (x) {
            return '<figure class="donate-qr"><img src="' + x[1] + '" alt="' + t(x[0] === "promptpay" ? "donatePromptpay" : "donateTruemoney") +
              ' QR" loading="lazy" width="220" height="220"><figcaption>' +
              t(x[0] === "promptpay" ? "donatePromptpay" : "donateTruemoney") + "</figcaption></figure>";
          }).join("") +
        "</div>" +
        (donateOpts.length ? '<p class="note center">' + t("donateScan") + "</p>" : "") +
        (D.angpaoContact ? '<p class="donate-angpao">' + t("donateAngpao") + ' <a href="' + Kao.escapeHtml(D.angpaoContact) +
          '" target="_blank" rel="noopener">' + Kao.escapeHtml(D.angpaoContact.replace(/^https?:\/\//, "")) + "</a></p>" : "") +
      "</div>";
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
    Kao.sound("favOn");
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".donate-open")) { e.preventDefault(); openDonate(); }
  });

  // ---------- โฆษณา ----------
  var adsOn = !!A.client;
  var preview = !A.client && local; // ทดสอบบนเครื่อง: โชว์กล่องตัวอย่างตำแหน่งโฆษณา
  function optedOut() { try { return localStorage.getItem(NO_ADS) === "1"; } catch (e) { return false; } }

  function slot(name) {
    var el = document.createElement("aside");
    el.className = "ad-slot";
    el.dataset.ad = name;
    el.setAttribute("aria-label", t("adLabel"));
    el.innerHTML =
      '<div class="ad-bar"><span class="ad-label">' + t("adLabel") + '</span>' +
        '<button class="ad-hide" type="button">' + t("adHide") + "</button></div>" +
      '<div class="ad-box">' +
        (adsOn
          ? '<ins class="adsbygoogle" style="display:block" data-ad-client="' + A.client + '"' +
            (A.slots && A.slots[name] ? ' data-ad-slot="' + A.slots[name] + '"' : "") +
            ' data-ad-format="auto" data-full-width-responsive="true"></ins>'
          : '<div class="ad-preview">' + t("adPreview") + "</div>") +
      "</div>" +
      '<p class="ad-note">' + t("adNote") +
        ' <button class="link-btn donate-open ad-donate" type="button" hidden>' + t("adDonate") + "</button></p>";
    return el;
  }

  function placeAds() {
    var slots = [];
    // 1) ใต้ผลลัพธ์ของหน้า (หน้าหมวด: ใต้ตารางคาโอโมจิ / หน้าเครื่องมือ: ต่อจากแผงสุดท้าย)
    var anchor = document.querySelector(".cat-page #grid") || document.querySelector("main .tool-split");
    if (!anchor) {
      var panels = document.querySelectorAll("main.tool > .panel");
      anchor = panels[panels.length - 1];
    }
    if (anchor) { var s1 = slot("content"); anchor.after(s1); slots.push(s1); }
    // 2) หน้าคลัง (จอใหญ่): ท้าย sidebar แทน (ไม่ดันการ์ดคาโอโมจิลงไป)
    var side = document.querySelector(".sidebar");
    if (side && matchMedia("(min-width: 861px)").matches) { var s2 = slot("side"); side.appendChild(s2); slots.push(s2); }
    // 3) เหนือ footer: เฉพาะหน้าที่ยังไม่มีโฆษณาเลย (หนึ่งหน้า หนึ่งโฆษณา)
    var footer = document.getElementById("siteFooter");
    if (footer && !slots.length) { var s3 = slot("footer"); footer.before(s3); slots.push(s3); }
    whenDonate(function () {
      if (canDonate()) slots.forEach(function (s) { s.querySelector(".ad-donate").hidden = false; });
    });
    return slots;
  }

  function loadAdSense(slots) {
    var s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(A.client);
    document.head.appendChild(s);
    slots.forEach(function () { (window.adsbygoogle = window.adsbygoogle || []).push({}); });
  }

  function hideAds() {
    try { localStorage.setItem(NO_ADS, "1"); } catch (e) {}
    document.querySelectorAll(".ad-slot").forEach(function (el) { el.remove(); });
    Kao.toast(t("adsHidden") + " ᵔᴗᵔ");
    updateFooter();
  }
  document.addEventListener("click", function (e) { if (e.target.closest(".ad-hide")) hideAds(); });

  // ปุ่มในส่วนท้าย: เลี้ยงขนม / ซ่อน-แสดงโฆษณา / นโยบายความเป็นส่วนตัว
  var footBar = null;
  function updateFooter() {
    var footer = document.getElementById("siteFooter");
    if (!footer) return;
    if (!footBar) {
      footBar = document.createElement("div");
      footBar.className = "footer-support";
      (footer.querySelector(".footer-inner") || footer).appendChild(footBar);
    }
    var parts = [];
    if (canDonate()) parts.push('<button class="link-btn donate-open" type="button">' + t("donate") + "</button>");
    if (adsOn || preview) parts.push('<button class="link-btn ads-toggle" type="button">' + t(optedOut() ? "adsShow" : "adHide") + "</button>");
    parts.push('<a href="privacy.html">' + t("privacy") + "</a>");
    footBar.innerHTML = parts.join('<span aria-hidden="true">·</span>');
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".ads-toggle")) return;
    if (optedOut()) {
      try { localStorage.removeItem(NO_ADS); } catch (err) {}
      location.reload(); // เปิดโฆษณากลับ: โหลดหน้าใหม่ให้วางโฆษณาตามปกติ
    } else hideAds();
  });

  // ---------- เริ่มทำงานหลังหน้าโหลดเสร็จ (ไม่แย่งเวลาตอนเปิดหน้า) ----------
  function start() {
    checkDonate();
    whenDonate(updateFooter);
    Kao.onLang(updateFooter);
    if ((adsOn || preview) && !optedOut()) {
      var slots = placeAds();
      if (adsOn && slots.length) {
        // รอให้เบราว์เซอร์ว่างก่อนค่อยโหลดสคริปต์โฆษณา (เครื่องสเปกต่ำรอนานขึ้น)
        var idle = window.requestIdleCallback || function (fn) { setTimeout(fn, 1200); };
        idle(function () { loadAdSense(slots); }, { timeout: window.Motion && Motion.lite ? 6000 : 3000 });
      }
    }
  }
  if (document.readyState === "complete") start();
  else addEventListener("load", start);
})();
