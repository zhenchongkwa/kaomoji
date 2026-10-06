/*
 * Motion: สปริงฟิสิกส์เล็กๆ (ไม่ใช้ไลบรารี) สำหรับกด / ชี้ / แถบไฮไลต์เลื่อน / ป๊อปอนุภาค
 * ทุกอย่างใช้ rAF loop เดียว และหยุดเองเมื่อทุกสปริงนิ่งแล้ว
 *
 *   Motion.to(el, { y: -3, s: 1.02, r: 0 }, { k: 400, c: 22 })   สปริงไปยังค่าเป้าหมาย
 *   Motion.boing(el)                                              เด้งดึ๋งหนึ่งที
 *   Motion.burst(x, y)                                            ป๊อปหัวใจ/ดาวกระจาย
 *   Motion.track(container, ".active")                            แถบไฮไลต์ที่เลื่อนตามตัวที่เลือก
 */
(function () {
  "use strict";

  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  // โหมดเบา: เครื่องสเปกต่ำ (ตั้งจากสคริปต์ใน <head>) หรือวัดแล้วเฟรมตก (ดู probe ด้านล่าง)
  function lite() { return root.classList.contains("lite"); }
  var IDENT = { x: 0, y: 0, s: 1, r: 0, sx: 1, sy: 1 }; // sx/sy = บีบแนวนอน/แนวตั้ง (เด้งแบบตุ๊กตานุ่มๆ)
  var store = new WeakMap();
  var active = new Set();
  var raf = 0, last = 0;

  function applyTransform(el, v) {
    if (v.x === 0 && v.y === 0 && v.s === 1 && v.r === 0 && v.sx === 1 && v.sy === 1) { el.style.transform = ""; return; }
    el.style.transform = "translate(" + v.x.toFixed(2) + "px," + v.y.toFixed(2) + "px) rotate(" +
      v.r.toFixed(2) + "deg) scale(" + (v.s * v.sx).toFixed(4) + "," + (v.s * v.sy).toFixed(4) + ")";
  }

  function state(el, apply, init) {
    var s = store.get(el);
    if (!s) {
      s = { el: el, apply: apply || applyTransform, cur: Object.assign({}, init || IDENT), vel: {}, tgt: Object.assign({}, init || IDENT), k: 400, c: 22 };
      store.set(el, s);
    }
    return s;
  }

  // k = ความแข็งสปริง, c = แรงหน่วง (ยิ่งน้อยยิ่งเด้ง), v = ความเร็วตั้งต้นที่บวกเพิ่ม
  function to(el, target, opts, apply, init) {
    var s = state(el, apply, init);
    opts = opts || {};
    s.k = opts.k || 400;
    s.c = opts.c || 22;
    for (var p in target) {
      if (!(p in s.cur)) s.cur[p] = target[p];
      s.tgt[p] = target[p];
      if (!(p in s.vel)) s.vel[p] = 0;
    }
    if (opts.v) for (var q in opts.v) s.vel[q] = (s.vel[q] || 0) + opts.v[q];
    // vset = ตั้งความเร็วใหม่แทนการบวกเพิ่ม (กดรัวๆ แล้วเด้งไม่สะสมจนยืดเกิน)
    if (opts.vset) for (var w in opts.vset) s.vel[w] = opts.vset[w];
    if (reduced || opts.snap) {
      for (var r in s.tgt) { s.cur[r] = s.tgt[r]; s.vel[r] = 0; }
      s.apply(s.el, s.cur);
      active.delete(s);
      return;
    }
    active.add(s);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function tick(now) {
    var dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    var steps = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / steps;
    active.forEach(function (s) {
      if (!s.el.isConnected) { active.delete(s); return; }
      var moving = false;
      for (var p in s.tgt) {
        var x = s.cur[p], v = s.vel[p] || 0, tg = s.tgt[p];
        for (var i = 0; i < steps; i++) {
          v += (-s.k * (x - tg) - s.c * v) * h;
          x += v * h;
        }
        var settle = p === "s" || p === "sx" || p === "sy" ? 0.0005 : 0.05;
        if (Math.abs(v) < settle * 4 && Math.abs(x - tg) < settle) { x = tg; v = 0; }
        else moving = true;
        s.cur[p] = x;
        s.vel[p] = v;
      }
      s.apply(s.el, s.cur);
      if (!moving) active.delete(s);
    });
    raf = active.size ? requestAnimationFrame(tick) : 0;
  }

  function boing(el, power) {
    to(el, { s: 1 }, { k: 520, c: 11, v: { s: -(power || 4) } });
  }

  // ---------- กด + ชี้ (ทำงานกับทุกหน้าผ่าน event delegation) ----------
  var PRESS = ".card, .btn, .chip, .cat, .pill, .sym, .icon-btn, .aa-card, .tab, .fav, .jump-btn, .tool-link, " +
    ".font-row, .sugg, .quick, .again, .search-clear, .sheet-close";
  var LIFT = ".card, .pill, .aa-card, .sym";
  var pressed = null, hovered = null;
  var lastPoint = { x: 0, y: 0, t: 0 };

  function restOf(el) {
    return el === hovered ? { s: 1, y: -3, r: el.dataset.tilt ? +el.dataset.tilt : 0 } : { s: 1, y: 0, r: 0 };
  }

  document.addEventListener("pointerdown", function (e) {
    lastPoint = { x: e.clientX, y: e.clientY, t: Date.now() };
    if (e.button !== 0) return;
    var el = e.target.closest(PRESS);
    if (!el) return;
    pressed = el;
    to(el, { s: el.matches(".card, .aa-card, .pill") ? 0.94 : 0.9 }, { k: 900, c: 34 });
  }, { passive: true });

  function release() {
    if (!pressed) return;
    var el = pressed;
    pressed = null;
    to(el, restOf(el), { k: 520, c: 13 });
  }
  document.addEventListener("pointerup", release, { passive: true });
  document.addEventListener("pointercancel", release, { passive: true });
  window.addEventListener("blur", release);

  document.addEventListener("pointerover", function (e) {
    if (e.pointerType !== "mouse" || lite()) return;
    var el = e.target.closest(LIFT);
    if (el === hovered) return;
    var prev = hovered;
    hovered = el;
    if (prev && prev !== pressed) to(prev, { s: 1, y: 0, r: 0 }, { k: 380, c: 20 });
    if (el && el !== pressed) {
      // เอียงนิดๆ แบบสติกเกอร์ ทิศสุ่มแต่คงที่ต่อการ์ด
      if (!el.dataset.tilt) el.dataset.tilt = ((Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.9)).toFixed(2);
      to(el, { y: -3, s: 1, r: +el.dataset.tilt }, { k: 420, c: 16 });
    }
  }, { passive: true });

  // ---------- อนุภาคป๊อป (หัวใจ/ดาว) ----------
  var GLYPHS = ["♡", "✦", "⋆", "✧", "♡", "˚"];
  var layer = null, parts = [], praf = 0, plast = 0;

  function burst(x, y, opts) {
    if (reduced) return;
    opts = opts || {};
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "burst-layer";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
    }
    var n = opts.count || 7;
    if (lite()) n = Math.ceil(n / 2);
    var glyphs = opts.glyphs || GLYPHS;
    for (var i = 0; i < n; i++) {
      var sp = document.createElement("span");
      sp.className = "burst p" + (i % 3);
      sp.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      layer.appendChild(sp);
      var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      var speed = 170 + Math.random() * 170;
      parts.push({ el: sp, x: x, y: y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        r: (Math.random() - 0.5) * 60, vr: (Math.random() - 0.5) * 540, life: 0, max: 0.65 + Math.random() * 0.25,
        size: 0.8 + Math.random() * 0.6 });
    }
    if (!praf) { plast = performance.now(); praf = requestAnimationFrame(ptick); }
  }

  function ptick(now) {
    var dt = Math.min((now - plast) / 1000, 1 / 30);
    plast = now;
    parts = parts.filter(function (p) {
      p.life += dt;
      if (p.life >= p.max) { p.el.remove(); return false; }
      p.vy += 900 * dt;
      p.vx *= 1 - 1.5 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      var k = p.life / p.max;
      var sc = p.size * (k < 0.15 ? k / 0.15 : 1 - Math.max(0, k - 0.6) / 0.4 * 0.6);
      p.el.style.transform = "translate(" + p.x + "px," + p.y + "px) rotate(" + p.r + "deg) scale(" + sc + ")";
      p.el.style.opacity = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1;
      return true;
    });
    praf = parts.length ? requestAnimationFrame(ptick) : 0;
  }

  // ป๊อปที่ตำแหน่งที่เพิ่งกด (ถ้ากดเมื่อกี้) ไม่งั้นกลางองค์ประกอบที่ระบุ
  function burstAt(el, opts) {
    if (Date.now() - lastPoint.t < 800) return burst(lastPoint.x, lastPoint.y, opts);
    if (!el || !el.getBoundingClientRect) return;
    var r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  }

  // ---------- แถบไฮไลต์ที่เลื่อนแบบสปริงตามตัวที่ active ----------
  function applyBox(el, v) {
    el.style.transform = "translate(" + v.x.toFixed(2) + "px," + v.y.toFixed(2) + "px)";
    el.style.width = v.w.toFixed(2) + "px";
    el.style.height = v.h.toFixed(2) + "px";
  }

  function track(container, selector) {
    if (!container || container.dataset.tracked) return;
    container.dataset.tracked = "1";
    container.classList.add("has-slider");
    var slider = null, current = null, queued = false;
    var born = performance.now(); // ช่วงแรกที่ฟอนต์/เลย์เอาต์ยังขยับ ให้วางตรงๆ ไม่ต้องเด้ง

    function update() {
      queued = false;
      var el = container.querySelector(selector);
      var fresh = false;
      if (!slider || !slider.isConnected) {
        slider = document.createElement("span");
        slider.className = "slider";
        slider.setAttribute("aria-hidden", "true");
        container.prepend(slider);
        fresh = true;
      }
      if (!el || !el.offsetParent) { slider.style.opacity = "0"; current = null; return; }
      var box = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
      var changed = current !== null && current !== el.dataset.cat + "|" + el.dataset.id + "|" + el.textContent;
      slider.style.opacity = "1";
      to(slider, box, { k: 380, c: 26, snap: fresh || current === null || performance.now() - born < 900 }, applyBox, box);
      if (changed && container.scrollWidth > container.clientWidth + 4) {
        container.scrollTo({ left: box.x - (container.clientWidth - box.w) / 2, behavior: reduced ? "auto" : "smooth" });
      }
      current = el.dataset.cat + "|" + el.dataset.id + "|" + el.textContent;
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }

    new MutationObserver(queue).observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    if (window.ResizeObserver) new ResizeObserver(queue).observe(container);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
    queue();
  }

  // ---------- สปริงสำหรับ WAAPI (โผล่เข้ามาแบบเด้งๆ) ----------
  var SPRING = "linear(0, 0.045, 0.152, 0.286, 0.445, 0.592, 0.738, 0.856, 0.959, 1.031, 1.086, 1.116, 1.131, 1.132, 1.123, 1.107, 1.087, 1.068, 1.047, 1.029, 1.014, 1.002, 0.993, 0.987, 0.984, 0.982, 0.983, 0.984, 0.986, 0.989, 0.992, 0.995, 0.997, 0.999, 1)";
  var springEase = window.CSS && CSS.supports && CSS.supports("transition-timing-function", SPRING)
    ? SPRING : "cubic-bezier(.34,1.56,.64,1)";

  // การ์ดชุดใหม่ค่อยๆ โผล่ทีละใบ (เฉพาะใบแรกๆ ที่เห็นบนจอ)
  function enter(els, opts) {
    if (reduced || lite() || !Element.prototype.animate) return;
    opts = opts || {};
    var max = opts.max || 28, gap = opts.gap || 14;
    for (var i = 0; i < els.length && i < max; i++) {
      els[i].animate(
        [{ opacity: 0, transform: "translateY(10px) scale(.94)" }, { opacity: 1, transform: "none" }],
        { duration: 620, delay: i * gap, easing: springEase, fill: "backwards" }
      );
    }
  }

  // วัดความลื่นช่วงแรกหลังโหลด: ถ้าเฟรมกระตุกบ่อย สลับเป็นโหมดเบาทันที (จำไว้จนปิดแท็บ)
  function probe() {
    if (lite() || document.hidden) return;
    var n = 0, slow = 0, prev = 0;
    requestAnimationFrame(function frame(now) {
      if (prev && n > 3 && now - prev > 42) slow++;
      prev = now;
      if (document.hidden) return;
      if (++n < 100) { requestAnimationFrame(frame); return; }
      if (slow >= 12) {
        root.classList.add("lite");
        try { sessionStorage.setItem("kao.lite", "1"); } catch (e) {}
      }
    });
  }
  if (document.readyState === "complete") setTimeout(probe, 300);
  else addEventListener("load", function () { setTimeout(probe, 300); });

  window.Motion = {
    reduced: reduced,
    get lite() { return lite(); },
    to: to,
    boing: boing,
    burst: burst,
    burstAt: burstAt,
    track: track,
    enter: enter,
    ease: springEase
  };
})();
