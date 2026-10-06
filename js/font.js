(function () {
  "use strict";

  var F = window.KaoFonts;
  var $ = function (id) { return document.getElementById(id); };
  var input = $("input"), list = $("allStyles"), groupNav = $("fontGroups");
  var group = Kao.load("kao.fontGroup", "all");
  var SAMPLE = "Hello cutie";

  // สร้างแถวของแต่ละสไตล์ครั้งเดียว แล้วอัปเดตแค่ข้อความตอนพิมพ์
  var rows = F.styles.map(function (s) {
    var row = document.createElement("button");
    row.type = "button";
    row.className = "font-row";
    var name = document.createElement("span");
    name.className = "font-name";
    name.textContent = s.name;
    var out = document.createElement("span");
    out.className = "font-out";
    var copy = document.createElement("span");
    copy.className = "font-copy";
    row.append(name, out, copy);
    list.appendChild(row);
    return { style: s, row: row, out: out, copy: copy };
  });

  function update() {
    var src = input.value.trim() ? input.value : SAMPLE;
    rows.forEach(function (r) { r.out.textContent = F.convert(r.style.id, src); });
  }

  // แท็บกรองกลุ่มสไตล์ (37 แบบในหน้าเดียวยาวเกินไป)
  function renderGroups() {
    groupNav.innerHTML = "";
    ["all"].concat(F.groups).forEach(function (g) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (g === group ? " active" : "");
      b.dataset.group = g;
      b.textContent = Kao.t("fontCat_" + g);
      groupNav.appendChild(b);
    });
  }
  function filter() {
    rows.forEach(function (r) { r.row.hidden = group !== "all" && r.style.group !== group; });
  }
  groupNav.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    group = b.dataset.group;
    Kao.save("kao.fontGroup", group);
    groupNav.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    filter();
    if (window.Motion) Motion.enter(list.querySelectorAll(".font-row:not([hidden])"), { max: 12, gap: 18 });
  });

  function labels() {
    rows.forEach(function (r) { r.copy.textContent = r.row.classList.contains("copied") ? Kao.t("copiedShort") : Kao.t("copy"); });
  }

  list.addEventListener("click", function (e) {
    var row = e.target.closest(".font-row");
    if (!row) return;
    var r = rows.find(function (x) { return x.row === row; });
    Kao.copyAndToast(r.out.textContent).then(function (ok) {
      if (!ok) return;
      rows.forEach(function (x) { x.row.classList.remove("copied"); });
      row.classList.add("copied");
      labels();
      clearTimeout(r.timer);
      r.timer = setTimeout(function () { row.classList.remove("copied"); labels(); }, 1400);
    });
  });
  input.addEventListener("input", update);

  update();
  filter();
  Kao.onLang(function () { renderGroups(); labels(); });
  Kao.start();
})();
