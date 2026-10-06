/*
 * หน้าหมวดหมู่แบบไฟล์ HTML นิ่ง (สร้างด้วย node tools/build-seo.js)
 * คาโอโมจิอยู่ใน HTML อยู่แล้ว (ให้ Google/AI อ่านได้โดยไม่ต้องรัน JS) สคริปต์นี้แค่ทำให้กดคัดลอกได้
 */
(function () {
  "use strict";

  var M = window.Motion;
  var grid = document.getElementById("grid");
  var RECENT_MAX = 30;

  function copy(card) {
    var k = card.dataset.k || card.textContent;
    Kao.copyAndToast(k).then(function (ok) {
      if (!ok) return;
      card.dataset.done = Kao.t("copiedShort");
      card.classList.add("copied");
      clearTimeout(card._t);
      card._t = setTimeout(function () { card.classList.remove("copied"); }, 900);
      if (M) M.boing(card, 3);
      // เก็บไว้ใน "ล่าสุด" ของหน้าคลังด้วย
      var recent = Kao.load("kao.recent", []);
      Kao.save("kao.recent", [k].concat(recent.filter(function (x) { return x !== k; })).slice(0, RECENT_MAX));
    });
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (card) copy(card);
    });
  }

  Kao.start();
})();
