(function () {
  "use strict";

  var F = window.KaoFonts;
  var $ = function (id) { return document.getElementById(id); };
  var input = $("input"), output = $("output"), chips = $("styleChips"), all = $("allStyles");
  var current = Kao.load("kao.fontStyle", "script");
  if (!F.styles.some(function (s) { return s.id === current; })) current = "script";

  function renderChips() {
    chips.innerHTML = "";
    F.styles.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (s.id === current ? " active" : "");
      b.dataset.id = s.id;
      b.title = s.name;
      b.textContent = F.sample(s.id);
      chips.appendChild(b);
    });
  }

  function update() {
    var text = input.value;
    output.value = F.convert(current, text);
    var src = text.trim() ? text : "Hello cutie";
    all.innerHTML = "";
    F.styles.forEach(function (s) {
      var p = document.createElement("button");
      p.type = "button";
      p.className = "pill";
      p.textContent = F.convert(s.id, src);
      p.title = s.name;
      all.appendChild(p);
    });
  }

  chips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    current = b.dataset.id;
    Kao.save("kao.fontStyle", current);
    chips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
    update();
  });
  input.addEventListener("input", update);
  $("convertBtn").addEventListener("click", update);
  $("clearBtn").addEventListener("click", function () { input.value = ""; update(); input.focus(); });
  $("copyBtn").addEventListener("click", function () {
    if (output.value) Kao.copyAndToast(output.value);
  });
  all.addEventListener("click", function (e) {
    var p = e.target.closest(".pill");
    if (p) Kao.copyAndToast(p.textContent);
  });

  renderChips();
  update();
  Kao.start();
})();
